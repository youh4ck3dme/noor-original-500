import { createHash, randomBytes } from 'crypto';

export const SHOPIFY_CUSTOMER_SCOPES = 'openid email customer-account-api:full';

export type ShopifyCustomerAuthConfig = {
  shopId: string;
  clientId: string;
  clientSecret: string;
  authorizeUrl: string;
  tokenUrl: string;
  logoutUrl: string;
  redirectUri: string;
  graphqlUrl: string;
};

export type ShopifyTokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  id_token?: string;
  token_type?: string;
};

export type ShopifyCustomerProfile = {
  id: string;
  email: string | null;
};

function requireEnv(name: string, value: string | undefined): string {
  if (!value?.trim()) {
    throw new Error(
      `Missing ${name}. Configure Shopify Customer Account API in docs/SETUP.md.`,
    );
  }
  return value.trim();
}

export function getShopifyCustomerAuthConfig(): ShopifyCustomerAuthConfig {
  const shopId = requireEnv(
    'SHOPIFY_CUSTOMER_ACCOUNT_SHOP_ID',
    process.env.SHOPIFY_CUSTOMER_ACCOUNT_SHOP_ID,
  );
  const apiVersion = process.env.SHOPIFY_API_VERSION ?? '2025-01';

  const authorizeUrl =
    process.env.SHOPIFY_CUSTOMER_ACCOUNT_AUTHORIZE_URL?.trim() ||
    `https://shopify.com/authentication/${shopId}/oauth/authorize`;
  const tokenUrl =
    process.env.SHOPIFY_CUSTOMER_ACCOUNT_TOKEN_URL?.trim() ||
    `https://shopify.com/authentication/${shopId}/oauth/token`;
  const logoutUrl =
    process.env.SHOPIFY_CUSTOMER_ACCOUNT_LOGOUT_URL?.trim() ||
    `https://shopify.com/authentication/${shopId}/logout`;
  const graphqlUrl =
    process.env.SHOPIFY_CUSTOMER_ACCOUNT_GRAPHQL_URL?.trim() ||
    `https://shopify.com/${shopId}/account/customer/api/${apiVersion}/graphql`;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3001';
  const redirectUri =
    process.env.SHOPIFY_CUSTOMER_ACCOUNT_REDIRECT_URI?.trim() ||
    `${siteUrl.replace(/\/$/, '')}/api/auth/shopify/callback`;

  return {
    shopId,
    clientId: requireEnv(
      'SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID',
      process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID,
    ),
    clientSecret: requireEnv(
      'SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_SECRET',
      process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_SECRET,
    ),
    authorizeUrl,
    tokenUrl,
    logoutUrl,
    redirectUri,
    graphqlUrl,
  };
}

export function isShopifyCustomerAuthConfigured(): boolean {
  return Boolean(
    process.env.SHOPIFY_CUSTOMER_ACCOUNT_SHOP_ID &&
      process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID &&
      process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_SECRET,
  );
}

export function generateCodeVerifier(): string {
  return randomBytes(32).toString('base64url');
}

export function generateCodeChallenge(verifier: string): string {
  return createHash('sha256').update(verifier).digest('base64url');
}

export function generateOAuthState(): string {
  return randomBytes(16).toString('hex');
}

export function buildAuthorizationUrl(input: {
  state: string;
  codeChallenge: string;
  locale?: string;
}): string {
  const config = getShopifyCustomerAuthConfig();
  const params = new URLSearchParams({
    client_id: config.clientId,
    response_type: 'code',
    redirect_uri: config.redirectUri,
    scope: SHOPIFY_CUSTOMER_SCOPES,
    state: input.state,
    code_challenge: input.codeChallenge,
    code_challenge_method: 'S256',
  });

  if (input.locale) {
    params.set('locale', input.locale);
  }

  return `${config.authorizeUrl}?${params.toString()}`;
}

export async function exchangeAuthorizationCode(
  code: string,
  codeVerifier: string,
): Promise<ShopifyTokenResponse> {
  const config = getShopifyCustomerAuthConfig();
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    code,
    code_verifier: codeVerifier,
  });

  const credentials = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString(
    'base64',
  );

  const response = await fetch(config.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${credentials}`,
    },
    body,
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Shopify token exchange failed: ${response.status} ${detail}`);
  }

  return (await response.json()) as ShopifyTokenResponse;
}

export async function customerAccountFetch<T>(
  accessToken: string,
  query: string,
  variables: Record<string, unknown> = {},
): Promise<T> {
  const config = getShopifyCustomerAuthConfig();
  const response = await fetch(config.graphqlUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: accessToken,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Customer Account API failed: ${response.status} ${detail}`);
  }

  const json = await response.json();
  if (json.errors?.length) {
    throw new Error(json.errors.map((e: { message: string }) => e.message).join(', '));
  }

  return json.data as T;
}

const customerProfileQuery = `
  query CustomerProfile {
    customer {
      id
      emailAddress {
        emailAddress
      }
    }
  }
`;

export async function fetchCustomerProfile(
  accessToken: string,
): Promise<ShopifyCustomerProfile | null> {
  const data = await customerAccountFetch<{
    customer: {
      id: string;
      emailAddress: { emailAddress: string } | null;
    } | null;
  }>(accessToken, customerProfileQuery);

  if (!data.customer?.id) {
    return null;
  }

  return {
    id: data.customer.id,
    email: data.customer.emailAddress?.emailAddress ?? null,
  };
}

const customerOrdersQuery = `
  query CustomerOrders($first: Int!) {
    customer {
      orders(first: $first, sortKey: PROCESSED_AT, reverse: true) {
        nodes {
          id
          name
          processedAt
          financialStatus
          fulfillmentStatus
          totalPrice {
            amount
            currencyCode
          }
          lineItems(first: 5) {
            nodes {
              title
              quantity
            }
          }
        }
      }
    }
  }
`;

export type CustomerAccountOrder = {
  id: string;
  name: string;
  processedAt: string | null;
  financialStatus: string;
  fulfillmentStatus: string;
  totalAmount: string;
  currencyCode: string;
  lineItems: Array<{ title: string; quantity: number }>;
};

export async function fetchCustomerAccountOrders(
  accessToken: string,
  first = 20,
): Promise<CustomerAccountOrder[]> {
  const data = await customerAccountFetch<{
    customer: {
      orders: {
        nodes: Array<{
          id: string;
          name: string;
          processedAt: string | null;
          financialStatus: string;
          fulfillmentStatus: string;
          totalPrice: { amount: string; currencyCode: string };
          lineItems: { nodes: Array<{ title: string; quantity: number }> };
        }>;
      };
    } | null;
  }>(accessToken, customerOrdersQuery, { first });

  return (
    data.customer?.orders.nodes.map((order) => ({
      id: order.id,
      name: order.name,
      processedAt: order.processedAt,
      financialStatus: order.financialStatus,
      fulfillmentStatus: order.fulfillmentStatus,
      totalAmount: order.totalPrice.amount,
      currencyCode: order.totalPrice.currencyCode,
      lineItems: order.lineItems.nodes,
    })) ?? []
  );
}

export function buildLogoutUrl(input?: { returnTo?: string }): string {
  const config = getShopifyCustomerAuthConfig();
  if (!input?.returnTo) {
    return config.logoutUrl;
  }

  const params = new URLSearchParams({
    post_logout_redirect_uri: input.returnTo,
  });
  return `${config.logoutUrl}?${params.toString()}`;
}
