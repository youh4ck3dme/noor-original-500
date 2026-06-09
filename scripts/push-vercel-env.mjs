#!/usr/bin/env node
/**
 * Push .env.local → Vercel project noor-original-500 (production + preview + development)
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const envPath = path.join(rootDir, '.env.local');
const PRODUCTION_URL = 'https://grow.nexify-studio.tech';

const SKIP = new Set(['VERCEL_OIDC_TOKEN', 'E2E_TEST_EMAIL', 'E2E_TEST_PASSWORD', 'FIREBASE_SERVICE_ACCOUNT_JSON']);

function parseEnv(content) {
  const values = new Map();
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;
    const i = trimmed.indexOf('=');
    values.set(trimmed.slice(0, i).trim(), trimmed.slice(i + 1).replace(/^"|"$/g, '').trim());
  }
  return values;
}

if (!fs.existsSync(envPath)) {
  console.error('Missing .env.local');
  process.exit(1);
}

const values = parseEnv(fs.readFileSync(envPath, 'utf8'));
values.set('NEXT_PUBLIC_SITE_URL', PRODUCTION_URL);
values.set(
  'SHOPIFY_CUSTOMER_ACCOUNT_REDIRECT_URI',
  `${PRODUCTION_URL}/api/auth/shopify/callback`,
);

// Normalize Shopify endpoint — trailing slash causes intermittent UND_ERR_SOCKET on Vercel.
const endpoint = values.get('SHOPIFY_API_ENDPOINT_URL');
if (endpoint) {
  values.set('SHOPIFY_API_ENDPOINT_URL', endpoint.replace(/\/+$/, ''));
}

const envs = ['production', 'preview', 'development'];
let ok = 0;
let fail = 0;

for (const env of envs) {
  for (const [key, value] of values.entries()) {
    if (!value || SKIP.has(key)) continue;
    try {
      execSync(`printf '%s' ${JSON.stringify(value)} | vercel env add ${key} ${env} --force`, {
        stdio: ['pipe', 'pipe', 'pipe'],
        encoding: 'utf8',
        cwd: rootDir,
      });
      ok += 1;
    } catch (e) {
      fail += 1;
    }
  }
}

console.log(`Vercel env: ${ok} OK, ${fail} failed`);
console.log('Project: h4ck3d/noor-original-500');
console.log(`NEXT_PUBLIC_SITE_URL=${PRODUCTION_URL}`);
