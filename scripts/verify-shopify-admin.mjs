import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const envPath = path.join(rootDir, '.env.local');

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
  if (!domain) return null;
  return `https://${domain}/admin/api/${version}/graphql.json`;
}

if (!fs.existsSync(envPath)) {
  console.error('Missing .env.local');
  process.exit(1);
}

const values = parseEnv(fs.readFileSync(envPath, 'utf8'));
const token = values.get('SHOPIFY_ADMIN_ACCESS_TOKEN')?.replace(/^"|"$/g, '');
const adminUrl = getAdminApiUrl(values);

if (!token) {
  console.error('Missing SHOPIFY_ADMIN_ACCESS_TOKEN');
  console.error('Create a Custom App in Shopify Admin → Settings → Apps → Develop apps');
  console.error('Scopes: read_products, write_products, read_customers, read_orders');
  process.exit(1);
}

if (!adminUrl) {
  console.error('Missing SHOPIFY_ADMIN_API_URL or SHOPIFY_STORE_DOMAIN');
  process.exit(1);
}

const response = await fetch(adminUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Shopify-Access-Token': token,
  },
  body: JSON.stringify({
    query: `query { shop { name myshopifyDomain } }`,
  }),
});

if (!response.ok) {
  console.error('Shopify Admin API HTTP error:', response.status, await response.text());
  process.exit(1);
}

const json = await response.json();
if (json.errors?.length) {
  console.error('Shopify Admin GraphQL errors:', json.errors);
  process.exit(1);
}

console.log('Shopify Admin API OK:', json.data.shop.name, `(${json.data.shop.myshopifyDomain})`);
