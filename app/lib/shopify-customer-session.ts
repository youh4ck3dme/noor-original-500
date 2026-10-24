import { cookies } from 'next/headers';

export const SHOPIFY_SESSION_COOKIES = {
  accessToken: 'shopify_ca_access_token',
  refreshToken: 'shopify_ca_refresh_token',
  customerId: 'shopify_ca_customer_id',
  expiresAt: 'shopify_ca_expires_at',
  oauthState: 'shopify_oauth_state',
  oauthVerifier: 'shopify_oauth_verifier',
  oauthNext: 'shopify_oauth_next',
} as const;

const SESSION_MAX_AGE = 60 * 60 * 24 * 30;

function cookieOptions(maxAge = SESSION_MAX_AGE) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge,
  };
}

export type ShopifyCustomerSession = {
  accessToken: string;
  refreshToken: string | null;
  customerId: string | null;
  expiresAt: number | null;
};

export async function getShopifyCustomerSession(): Promise<ShopifyCustomerSession | null> {
  const store = await cookies();
  const accessToken = store.get(SHOPIFY_SESSION_COOKIES.accessToken)?.value;
  if (!accessToken) {
    return null;
  }

  const expiresRaw = store.get(SHOPIFY_SESSION_COOKIES.expiresAt)?.value;
  return {
    accessToken,
    refreshToken: store.get(SHOPIFY_SESSION_COOKIES.refreshToken)?.value ?? null,
    customerId: store.get(SHOPIFY_SESSION_COOKIES.customerId)?.value ?? null,
    expiresAt: expiresRaw ? Number(expiresRaw) : null,
  };
}

export async function setShopifyCustomerSession(input: {
  accessToken: string;
  refreshToken?: string | null;
  customerId?: string | null;
  expiresIn?: number | null;
}) {
  const store = await cookies();
  const options = cookieOptions();

  store.set(SHOPIFY_SESSION_COOKIES.accessToken, input.accessToken, options);

  if (input.refreshToken) {
    store.set(SHOPIFY_SESSION_COOKIES.refreshToken, input.refreshToken, options);
  }

  if (input.customerId) {
    store.set(SHOPIFY_SESSION_COOKIES.customerId, input.customerId, options);
  }

  if (input.expiresIn) {
    const expiresAt = Date.now() + input.expiresIn * 1000;
    store.set(SHOPIFY_SESSION_COOKIES.expiresAt, String(expiresAt), options);
  }
}

export async function clearShopifyCustomerSession() {
  const store = await cookies();
  for (const name of Object.values(SHOPIFY_SESSION_COOKIES)) {
    store.delete(name);
  }
}

export async function setOAuthPending(input: {
  state: string;
  verifier: string;
  nextPath: string;
}) {
  const store = await cookies();
  const shortLived = cookieOptions(600);
  store.set(SHOPIFY_SESSION_COOKIES.oauthState, input.state, shortLived);
  store.set(SHOPIFY_SESSION_COOKIES.oauthVerifier, input.verifier, shortLived);
  store.set(SHOPIFY_SESSION_COOKIES.oauthNext, input.nextPath, shortLived);
}

export async function consumeOAuthPending(): Promise<{
  state: string;
  verifier: string;
  nextPath: string;
} | null> {
  const store = await cookies();
  const state = store.get(SHOPIFY_SESSION_COOKIES.oauthState)?.value;
  const verifier = store.get(SHOPIFY_SESSION_COOKIES.oauthVerifier)?.value;
  const nextPath = store.get(SHOPIFY_SESSION_COOKIES.oauthNext)?.value ?? '/ucet';

  store.delete(SHOPIFY_SESSION_COOKIES.oauthState);
  store.delete(SHOPIFY_SESSION_COOKIES.oauthVerifier);
  store.delete(SHOPIFY_SESSION_COOKIES.oauthNext);

  if (!state || !verifier) {
    return null;
  }

  return { state, verifier, nextPath };
}
