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

function clean(value) {
  return value?.replace(/^"|"$/g, '').trim();
}

const required = [
  'SHOPIFY_CUSTOMER_ACCOUNT_SHOP_ID',
  'SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID',
  'SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_SECRET',
];

if (!fs.existsSync(envPath)) {
  console.error('Missing .env.local');
  process.exit(1);
}

const values = parseEnv(fs.readFileSync(envPath, 'utf8'));
const missing = required.filter((key) => !clean(values.get(key)));

if (missing.length) {
  console.error('Missing Customer Account API env vars:', missing.join(', '));
  console.error('Shopify Admin → Sales channels → Headless → Customer Account API → Application setup');
  process.exit(1);
}

const shopId = clean(values.get('SHOPIFY_CUSTOMER_ACCOUNT_SHOP_ID'));
const authorizeUrl =
  clean(values.get('SHOPIFY_CUSTOMER_ACCOUNT_AUTHORIZE_URL')) ||
  `https://shopify.com/authentication/${shopId}/oauth/authorize`;
const tokenUrl =
  clean(values.get('SHOPIFY_CUSTOMER_ACCOUNT_TOKEN_URL')) ||
  `https://shopify.com/authentication/${shopId}/oauth/token`;
const logoutUrl =
  clean(values.get('SHOPIFY_CUSTOMER_ACCOUNT_LOGOUT_URL')) ||
  `https://shopify.com/authentication/${shopId}/logout`;
const redirectUri =
  clean(values.get('SHOPIFY_CUSTOMER_ACCOUNT_REDIRECT_URI')) ||
  'http://localhost:3001/api/auth/shopify/callback';
const graphqlUrl =
  clean(values.get('SHOPIFY_CUSTOMER_ACCOUNT_GRAPHQL_URL')) ||
  `https://shopify.com/${shopId}/account/customer/api/2026-04/graphql`;

const storeDomain = clean(values.get('SHOPIFY_STORE_DOMAIN'));
const discoveryUrl = storeDomain
  ? `https://${storeDomain}/.well-known/openid-configuration`
  : null;

console.log('Shopify Customer Account API configuration:');
console.log('  shop_id:', shopId);
console.log('  authorize:', authorizeUrl);
console.log('  token:', tokenUrl);
console.log('  logout:', logoutUrl);
console.log('  redirect_uri:', redirectUri);
console.log('  graphql:', graphqlUrl);

if (discoveryUrl) {
  try {
    const response = await fetch(discoveryUrl);
    if (response.ok) {
      const config = await response.json();
      const checks = [
        ['authorization_endpoint', authorizeUrl],
        ['token_endpoint', tokenUrl],
        ['end_session_endpoint', logoutUrl],
      ];

      for (const [key, expected] of checks) {
        const actual = config[key];
        if (actual && actual !== expected) {
          console.warn(`  WARN: discovery ${key} differs: ${actual}`);
        } else if (actual) {
          console.log(`  OK: ${key} matches discovery`);
        }
      }
    }
  } catch (error) {
    console.warn('  WARN: could not fetch OpenID discovery:', error.message);
  }
}

console.log('\nRegister this callback URL in Shopify Headless app settings:');
console.log(`  ${redirectUri}`);
console.log('\nCustomer Account API env looks ready. Complete OAuth in browser via /api/auth/shopify/login');
