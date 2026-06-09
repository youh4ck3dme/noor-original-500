import { unstable_noStore as noStore } from 'next/cache';

function requireShopifyAdminEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `Shopify Admin environment variable ${name} is not set. See docs/SETUP.md → Shopify Custom App.`,
    );
  }
  return value;
}

function getAdminApiUrl(): string {
  const explicit = process.env.SHOPIFY_ADMIN_API_URL;
  if (explicit) {
    return explicit;
  }

  const storeDomain = requireShopifyAdminEnv(
    'SHOPIFY_STORE_DOMAIN',
    process.env.SHOPIFY_STORE_DOMAIN,
  );
  const apiVersion = process.env.SHOPIFY_API_VERSION ?? '2025-01';
  return `https://${storeDomain}/admin/api/${apiVersion}/graphql.json`;
}

export async function shopifyAdminFetch<T>(
  query: string,
  variables: Record<string, unknown> = {},
): Promise<T> {
  noStore();

  const token = requireShopifyAdminEnv(
    'SHOPIFY_ADMIN_ACCESS_TOKEN',
    process.env.SHOPIFY_ADMIN_ACCESS_TOKEN,
  );

  const response = await fetch(getAdminApiUrl(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': token,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Shopify Admin API request failed: ${response.statusText}\n${errorBody}`);
  }

  const json = await response.json();
  if (json.errors) {
    console.error('Shopify Admin GraphQL Errors:', json.errors);
    throw new Error('An error occurred while fetching data from Shopify Admin API.');
  }

  return json.data as T;
}

export function isShopifyAdminConfigured(): boolean {
  return Boolean(
    process.env.SHOPIFY_ADMIN_ACCESS_TOKEN &&
      (process.env.SHOPIFY_ADMIN_API_URL || process.env.SHOPIFY_STORE_DOMAIN),
  );
}
