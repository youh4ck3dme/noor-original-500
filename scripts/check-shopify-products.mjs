import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');

function loadEnvLocal() {
  const envPath = resolve(rootDir, '.env.local');
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;
    const idx = trimmed.indexOf('=');
    const key = trimmed.slice(0, idx).trim();
    let value = trimmed.slice(idx + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

loadEnvLocal();

const endpoint = process.env.SHOPIFY_API_ENDPOINT_URL;
const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

if (!endpoint || !token) {
  console.error('Missing Shopify env vars');
  process.exit(1);
}

const query = `
  query getProducts($first: Int!) {
    products(first: $first) {
      edges {
        node {
          id
          title
          handle
          availableForSale
          priceRange { minVariantPrice { amount currencyCode } }
          images(first: 1) { edges { node { url altText } } }
        }
      }
    }
    collections(first: 5) {
      edges { node { id title handle } }
    }
  }
`;

const response = await fetch(endpoint, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Shopify-Storefront-Access-Token': token,
  },
  body: JSON.stringify({ query, variables: { first: 8 } }),
});

const json = await response.json();

if (!response.ok || json.errors) {
  console.error('Shopify error:', response.status, JSON.stringify(json.errors ?? json, null, 2));
  process.exit(1);
}

const products = json.data?.products?.edges ?? [];
const collections = json.data?.collections?.edges ?? [];

console.log(`Shopify OK — products: ${products.length}, collections: ${collections.length}`);
for (const { node } of products) {
  const img = node.images?.edges?.[0]?.node?.url ?? 'no-image';
  console.log(`- ${node.title} (${node.handle}) ${node.priceRange.minVariantPrice.amount} ${node.priceRange.minVariantPrice.currencyCode}`);
  console.log(`  image: ${img.slice(0, 60)}...`);
}
for (const { node } of collections) {
  console.log(`collection: ${node.title} (${node.handle})`);
}
