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
const storeDomain = process.env.SHOPIFY_STORE_DOMAIN;
const METAFIELD_KEYS = ['composition', 'dosage', 'lab_tests', 'product_faq'];
const SAMPLE_HANDLES = (process.env.VERIFY_METAFIELD_HANDLES || 'energy-renol,energy-vironal,energy-regalen')
  .split(',')
  .map((h) => h.trim())
  .filter(Boolean);

if (!endpoint || !token) {
  console.error('Missing SHOPIFY_API_ENDPOINT_URL or SHOPIFY_STOREFRONT_ACCESS_TOKEN');
  process.exit(1);
}

const productQuery = `
  query getProductMetafields($handle: String!) {
    product(handle: $handle) {
      title
      handle
      metafields(
        identifiers: [
          { namespace: "custom", key: "composition" }
          { namespace: "custom", key: "dosage" }
          { namespace: "custom", key: "lab_tests" }
          { namespace: "custom", key: "product_faq" }
        ]
      ) {
        key
        value
      }
    }
  }
`;

console.log('PDP metafields check');
if (storeDomain) {
  console.log(`Shopify Admin custom data: https://${storeDomain}/admin/settings/custom_data/product/metafields`);
}
console.log('');

let allOk = true;

for (const handle of SAMPLE_HANDLES) {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': token,
    },
    body: JSON.stringify({ query: productQuery, variables: { handle } }),
  });

  const json = await response.json();
  const product = json.data?.product;

  if (!product) {
    console.log(`❌ ${handle} — product not found`);
    allOk = false;
    continue;
  }

  const present = new Set(
    (product.metafields ?? []).filter(Boolean).filter((f) => f.value?.trim()).map((f) => f.key),
  );

  const status = METAFIELD_KEYS.map((key) => (present.has(key) ? '✅' : '❌')).join(' ');
  console.log(`${product.title} (${handle})`);
  console.log(`  composition dosage lab_tests product_faq`);
  console.log(`  ${status}`);

  if (present.size < METAFIELD_KEYS.length) {
    allOk = false;
  }
}

console.log('');
if (allOk) {
  console.log('All sampled products have PDP metafields.');
} else {
  console.log('Some metafields missing — run: npm run seed:product-metafields -- --dry-run');
  process.exit(1);
}
