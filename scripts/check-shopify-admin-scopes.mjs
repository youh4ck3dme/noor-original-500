import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '..', '.env.local');

function parseEnv(content) {
  const values = new Map();
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;
    const separatorIndex = trimmed.indexOf('=');
    values.set(trimmed.slice(0, separatorIndex).trim(), trimmed.slice(separatorIndex + 1));
  }
  return values;
}

function getAdminApiUrl(values) {
  const explicit = values.get('SHOPIFY_ADMIN_API_URL')?.replace(/^"|"$/g, '');
  if (explicit) return explicit;
  const domain = values.get('SHOPIFY_STORE_DOMAIN')?.replace(/^"|"$/g, '');
  const version = values.get('SHOPIFY_API_VERSION')?.replace(/^"|"$/g, '') || '2025-01';
  return domain ? `https://${domain}/admin/api/${version}/graphql.json` : null;
}

if (!fs.existsSync(envPath)) {
  console.error('Missing .env.local');
  process.exit(1);
}

const values = parseEnv(fs.readFileSync(envPath, 'utf8'));
const token = values.get('SHOPIFY_ADMIN_ACCESS_TOKEN')?.replace(/^"|"$/g, '');
const adminUrl = getAdminApiUrl(values);

if (!token || !adminUrl) {
  console.error('Missing SHOPIFY_ADMIN_ACCESS_TOKEN or admin API URL');
  process.exit(1);
}

const products = await fetch(adminUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Shopify-Access-Token': token,
  },
  body: JSON.stringify({
    query: `query { products(first: 1) { edges { node { id } } } }`,
  }),
}).then((r) => r.json());

const productId = products.data?.products?.edges?.[0]?.node?.id;
if (!productId) {
  console.error('No products found for scope test');
  process.exit(1);
}

const writeTest = await fetch(adminUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Shopify-Access-Token': token,
  },
  body: JSON.stringify({
    query: `
      mutation productUpdate($input: ProductInput!) {
        productUpdate(input: $input) {
          product { id }
          userErrors { message }
        }
      }
    `,
    variables: {
      input: {
        id: productId,
        seo: { title: 'Scope check — no change persisted' },
      },
    },
  }),
}).then((r) => r.json());

const denied = writeTest.errors?.some((e) => e.extensions?.code === 'ACCESS_DENIED');
const userErrors = writeTest.data?.productUpdate?.userErrors ?? [];

if (denied) {
  console.error('write_products: MISSING — add scope in Shopify Custom App and reinstall');
  process.exit(1);
}

console.log('write_products: OK');
if (userErrors.length) {
  console.log('userErrors:', userErrors);
}
