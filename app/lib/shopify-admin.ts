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

  const MAX_RETRIES = 3;
  let lastError: unknown;

  for (let i = 0; i <= MAX_RETRIES; i++) {
    try {
      const response = await fetch(getAdminApiUrl(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': token,
          'User-Agent': 'noor-original-app/1.0',
        },
        body: JSON.stringify({ query, variables }),
        // @ts-expect-error - keepalive is not in RequestInit but supported in some Node versions
        keepalive: false,
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
    } catch (error: unknown) {
      lastError = error;
      const errorMsg = error instanceof Error ? error.message : String(error);
      const isSocketError = (error && typeof error === 'object' && 'code' in error && error.code === 'UND_ERR_SOCKET') || 
                           errorMsg.includes('socket') || 
                           errorMsg.includes('fetch failed') ||
                           errorMsg.includes('other side closed');
      
      if (isSocketError && i < MAX_RETRIES) {
        console.warn(`Shopify Admin fetch socket error, retrying (${i + 1}/${MAX_RETRIES})... ${errorMsg}`);
        await new Promise(resolve => setTimeout(resolve, 200 * (i + 1)));
        continue;
      }
      
      console.error('Shopify Admin fetch failed:', error);
      throw error;
    }
  }
  
  throw lastError;
}

export function isShopifyAdminConfigured(): boolean {
  return Boolean(
    process.env.SHOPIFY_ADMIN_ACCESS_TOKEN &&
      (process.env.SHOPIFY_ADMIN_API_URL || process.env.SHOPIFY_STORE_DOMAIN),
  );
}
