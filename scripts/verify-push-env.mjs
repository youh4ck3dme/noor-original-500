import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const envPath = path.join(rootDir, '.env.local');
const serviceAccountPath = path.join(rootDir, '.firebase-service-account.json');
const swPath = path.join(rootDir, 'public', 'firebase-messaging-sw.js');

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

const required = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
  'NEXT_PUBLIC_FIREBASE_VAPID_KEY',
  'PUSH_SEND_SECRET',
  'SHOPIFY_API_ENDPOINT_URL',
];

if (!fs.existsSync(envPath)) {
  console.error('Missing .env.local — run: vercel env pull .env.local && npm run setup:push-env');
  process.exit(1);
}

const values = parseEnv(fs.readFileSync(envPath, 'utf8'));
const missing = required.filter((key) => !values.get(key)?.replace(/^"|"$/g, ''));

console.log('Push env check');
for (const key of required) {
  console.log(`${missing.includes(key) ? '✗' : '✓'} ${key}`);
}

const hasServiceAccount = fs.existsSync(serviceAccountPath);

console.log(`${hasServiceAccount ? '✓' : '✗'} Firebase service account`);
console.log(`${fs.existsSync(swPath) ? '✓' : '✗'} public/firebase-messaging-sw.js`);

if (missing.length > 0 || !hasServiceAccount || !fs.existsSync(swPath)) {
  console.log('');
  if (!hasServiceAccount) {
    console.log('Download service account JSON:');
    console.log('https://console.firebase.google.com/project/noorgrowmfinnal-58800798-76fac/settings/serviceaccounts/adminsdk');
    console.log('Save as .firebase-service-account.json, then: npm run setup:push-env');
  }
  if (!fs.existsSync(swPath)) {
    console.log('Run: npm run generate:firebase-sw');
  }
  process.exit(1);
}

console.log('\nPush env looks ready. Start dev server and allow notifications in the browser.');
