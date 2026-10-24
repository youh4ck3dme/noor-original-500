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

const dryRun = process.argv.includes('--dry-run');
const adminToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
const domain = process.env.SHOPIFY_STORE_DOMAIN;
const version = process.env.SHOPIFY_API_VERSION || '2025-01';
const adminUrl =
  process.env.SHOPIFY_ADMIN_API_URL || (domain ? `https://${domain}/admin/api/${version}/graphql.json` : null);

if (!adminToken || !adminUrl) {
  console.error('Missing SHOPIFY_ADMIN_ACCESS_TOKEN and admin API URL');
  process.exit(1);
}

const storefrontEndpoint = process.env.SHOPIFY_API_ENDPOINT_URL;
const storefrontToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

const listProductsQuery = `
  query listProducts($first: Int!) {
    products(first: $first) {
      edges {
        node {
          id
          title
          handle
          metafields(
            identifiers: [
              { namespace: "custom", key: "composition" }
              { namespace: "custom", key: "dosage" }
              { namespace: "custom", key: "product_faq" }
            ]
          ) {
            key
            value
          }
        }
      }
    }
  }
`;

const productUpdateMutation = `
  mutation productUpdate($input: ProductInput!) {
    productUpdate(input: $input) {
      product { id handle }
      userErrors { field message }
    }
  }
`;

function defaultValues(title) {
  return {
    composition: `${title} — 100% prírodné zložky. Presné zloženie je uvedené na obale.`,
    dosage: 'Odporúčané dávkovanie: 1 porcia denne. Neprekračujte odporúčanú dennú dávku.',
    product_faq: JSON.stringify([
      { question: 'Ako užívať tento produkt?', answer: 'Užívajte podľa odporúčania na obale.' },
      { question: 'Je produkt vhodný pre vegánov?', answer: 'Skontrolujte zloženie na obale produktu.' },
    ]),
  };
}

const listResponse = await fetch(storefrontEndpoint, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Shopify-Storefront-Access-Token': storefrontToken,
  },
  body: JSON.stringify({ query: listProductsQuery, variables: { first: 20 } }),
});

const listJson = await listResponse.json();
const products = listJson.data?.products?.edges?.map((e) => e.node) ?? [];

let seeded = 0;

for (const product of products) {
  const present = new Set(
    (product.metafields ?? []).filter(Boolean).filter((f) => f.value?.trim()).map((f) => f.key),
  );
  const defaults = defaultValues(product.title);
  const metafields = Object.entries(defaults)
    .filter(([key]) => !present.has(key))
    .map(([key, value]) => ({
      namespace: 'custom',
      key,
      type: key === 'product_faq' ? 'json' : 'multi_line_text_field',
      value,
    }));

  if (metafields.length === 0) {
    console.log(`skip ${product.handle} — all metafields present`);
    continue;
  }

  console.log(`${dryRun ? '[dry-run] ' : ''}seed ${product.handle}: ${metafields.map((m) => m.key).join(', ')}`);

  if (dryRun) {
    seeded += 1;
    continue;
  }

  const updateResponse = await fetch(adminUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': adminToken,
    },
    body: JSON.stringify({
      query: productUpdateMutation,
      variables: {
        input: {
          id: product.id,
          metafields,
        },
      },
    }),
  });

  const updateJson = await updateResponse.json();
  const errors = updateJson.data?.productUpdate?.userErrors ?? updateJson.errors;
  if (errors?.length) {
    console.error(`  failed:`, errors);
  } else {
    seeded += 1;
  }
}

console.log(`\nDone. ${seeded} product(s) ${dryRun ? 'would be ' : ''}updated.`);
