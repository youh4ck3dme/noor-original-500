import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const envPath = path.join(rootDir, '.env.local');
const serviceAccountPath = path.join(rootDir, '.firebase-service-account.json');

const FIREBASE_PUBLIC = {
  NEXT_PUBLIC_FIREBASE_API_KEY: 'AIzaSyBXTKQPEkw5rc15tP00ZYd282yo8ZSRKSs',
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: 'noorgrowmfinnal-58800798-76fac.firebaseapp.com',
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: 'noorgrowmfinnal-58800798-76fac',
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: 'noorgrowmfinnal-58800798-76fac.firebasestorage.app',
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: '47336351588',
  NEXT_PUBLIC_FIREBASE_APP_ID: '1:47336351588:web:9c9db74db275122f9d7c71',
  NEXT_PUBLIC_FIREBASE_VAPID_KEY:
    'BFjMH3zTYjTRYnmuvVVsO1QZMgZLAWs6vferMhPM4hNFkoWdxVvLonTNiLQdG2bYAeVWVD2WI-FZdh9ZSwmlzCI',
};

const DEFAULTS = {
  NEXT_PUBLIC_SITE_URL: 'http://localhost:3001',
  NEXT_PUBLIC_DEFAULT_THEME: 'noor',
  NEXT_PUBLIC_HIDE_THEME_SWITCHER: '1',
  GEMINI_MODEL: 'gemini-2.0-flash',
  MISTRAL_BASE_URL: 'https://api.mistral.ai/v1',
  MISTRAL_USE_WORKFLOW: '0',
  MISTRAL_WORKFLOW_IDENTIFIER: 'noor-pharmacist-chat',
  MISTRAL_WORKFLOW_TIMEOUT_SECONDS: '30',
  FIREBASE_SERVICE_ACCOUNT_PATH: '.firebase-service-account.json',
};

function parseEnv(content) {
  const lines = content.split('\n');
  const values = new Map();
  const output = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) {
      output.push(line);
      continue;
    }

    const separatorIndex = trimmed.indexOf('=');
    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1);
    values.set(key, value);
    output.push(line);
  }

  return { values, output };
}

function quoteEnvValue(value) {
  if (/[\s#"'\\]/.test(value)) {
    return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
  }
  return value;
}

function upsert(values, key, value) {
  if (!values.has(key) || values.get(key) === '' || values.get(key) === '""') {
    values.set(key, quoteEnvValue(value));
  }
}

function buildShopifyEndpoint(values) {
  if (values.get('SHOPIFY_API_ENDPOINT_URL')) {
    return;
  }

  const rawDomain = values.get('SHOPIFY_STORE_DOMAIN')?.replace(/^"|"$/g, '') ?? '';
  const rawVersion = values.get('SHOPIFY_API_VERSION')?.replace(/^"|"$/g, '') ?? '2025-01';
  if (!rawDomain) {
    return;
  }

  values.set(
    'SHOPIFY_API_ENDPOINT_URL',
    quoteEnvValue(`https://${rawDomain}/api/${rawVersion}/graphql.json`),
  );
}

function configureServiceAccount(values) {
  const configuredPath = values.get('FIREBASE_SERVICE_ACCOUNT_PATH')?.replace(/^"|"$/g, '');
  const resolvedPath = configuredPath
    ? path.resolve(rootDir, configuredPath)
    : serviceAccountPath;

  values.delete('FIREBASE_SERVICE_ACCOUNT_JSON');

  if (fs.existsSync(resolvedPath)) {
    values.set('FIREBASE_SERVICE_ACCOUNT_PATH', quoteEnvValue('.firebase-service-account.json'));
    return true;
  }

  return false;
}

if (!fs.existsSync(envPath)) {
  fs.writeFileSync(envPath, '# Created by scripts/setup-push-env.mjs\n', 'utf8');
}

const current = fs.readFileSync(envPath, 'utf8');
const { values } = parseEnv(current);

for (const [key, value] of Object.entries(FIREBASE_PUBLIC)) {
  upsert(values, key, value);
}

for (const [key, value] of Object.entries(DEFAULTS)) {
  upsert(values, key, value);
}

if (!values.get('PUSH_SEND_SECRET')) {
  upsert(values, 'PUSH_SEND_SECRET', crypto.randomBytes(24).toString('hex'));
}

buildShopifyEndpoint(values);
const hasServiceAccount = configureServiceAccount(values);

const preservedComments = current
  .split('\n')
  .filter((line) => line.trim().startsWith('#'))
  .join('\n');

const body = [...values.entries()]
  .map(([key, value]) => `${key}=${value}`)
  .sort((a, b) => a.localeCompare(b))
  .join('\n');

const nextContent = `${preservedComments ? `${preservedComments}\n\n` : ''}${body}\n`;
fs.writeFileSync(envPath, nextContent, 'utf8');

console.log('Updated .env.local with Firebase push settings.');

if (!hasServiceAccount) {
  console.log('');
  console.log('Missing Firebase service account file.');
  console.log('1. Firebase Console → Project settings → Service accounts → Generate new private key');
  console.log(`2. Save as ${serviceAccountPath}`);
  console.log('3. Re-run: npm run setup:push-env');
} else {
  console.log('Service account file detected (.firebase-service-account.json).');
}

if (values.get('PUSH_SEND_SECRET')) {
  console.log(`PUSH_SEND_SECRET is set (${values.get('PUSH_SEND_SECRET').replace(/^"|"$/g, '').slice(0, 8)}...)`);
}
