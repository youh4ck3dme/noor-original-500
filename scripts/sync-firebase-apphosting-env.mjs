#!/usr/bin/env node
/**
 * Sync .env.local → Firebase App Hosting secrets + console paste block.
 * Usage: npm run sync:firebase-env
 */
import { execSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const envPath = path.join(rootDir, '.env.local');
const projectId = 'noorgrowmfinnal-58800798-76fac';
const backendId = 'noor-original-500';
const PRODUCTION_URL = 'https://grow.nexify-studio.tech';

/** True secrets — synced to Cloud Secret Manager */
const SECRET_MAP = {
  SHOPIFY_STOREFRONT_ACCESS_TOKEN: 'shopify-storefront-access-token',
  SHOPIFY_REVALIDATION_SECRET: 'shopify-revalidation-secret',
  SHOPIFY_ADMIN_ACCESS_TOKEN: 'shopify-admin-access-token',
  SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_SECRET: 'shopify-customer-account-client-secret',
  GEMINI_API_KEY: 'gemini-api-key',
  MISTRAL_API_KEY: 'mistral-api-key',
  MISTRAL_API_KEY_BACKUP: 'mistral-api-key-backup',
  PUSH_SEND_SECRET: 'push-send-secret',
};

/** All env vars for Console paste (includes plain + secrets) */
const PASTE_KEYS = [
  'SHOPIFY_STORE_DOMAIN',
  'SHOPIFY_API_ENDPOINT_URL',
  'SHOPIFY_STOREFRONT_ACCESS_TOKEN',
  'SHOPIFY_REVALIDATION_SECRET',
  'SHOPIFY_ADMIN_ACCESS_TOKEN',
  'SHOPIFY_ADMIN_API_URL',
  'ADMIN_EMAILS',
  'SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_SECRET',
  'GEMINI_API_KEY',
  'MISTRAL_API_KEY',
  'MISTRAL_API_KEY_BACKUP',
  'PUSH_SEND_SECRET',
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
  'NEXT_PUBLIC_FIREBASE_VAPID_KEY',
  'NEXT_PUBLIC_SITE_URL',
  'SHOPIFY_CUSTOMER_ACCOUNT_REDIRECT_URI',
];

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

const spawnEnv = { ...process.env, NODE_NO_WARNINGS: '1' };

function setSecret(secretName, value) {
  const result = spawnSync(
    'firebase',
    ['apphosting:secrets:set', secretName, '--project', projectId, '--force'],
    { input: value, encoding: 'utf8', env: spawnEnv },
  );
  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout || `exit ${result.status}`);
  }
}

function grantAccess(secretName) {
  const result = spawnSync(
    'firebase',
    [
      'apphosting:secrets:grantaccess',
      secretName,
      '--backend',
      backendId,
      '--project',
      projectId,
    ],
    { encoding: 'utf8', env: spawnEnv },
  );
  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout || `grantaccess exit ${result.status}`);
  }
}

if (!fs.existsSync(envPath)) {
  console.error('Missing .env.local');
  process.exit(1);
}

const values = parseEnv(fs.readFileSync(envPath, 'utf8'));
const hostingBase = process.env.FIREBASE_APP_HOSTING_URL?.trim() || PRODUCTION_URL;

values.set('NEXT_PUBLIC_SITE_URL', hostingBase);
values.set(
  'SHOPIFY_CUSTOMER_ACCOUNT_REDIRECT_URI',
  `${hostingBase.replace(/\/$/, '')}/api/auth/shopify/callback`,
);

if (!values.get('GEMINI_API_KEY')) {
  console.warn('WARN: GEMINI_API_KEY missing in .env.local — AI chat will not work on production');
}

const pastePath = path.join(rootDir, '.firebase-env-paste.txt');
const pasteLines = [];
for (const envKey of PASTE_KEYS) {
  const value = values.get(envKey);
  if (!value) {
    console.warn(`SKIP missing: ${envKey}`);
    continue;
  }
  pasteLines.push(`${envKey}=${value}`);
}
fs.writeFileSync(pastePath, `${pasteLines.join('\n')}\n`, 'utf8');

console.log('Firebase project:', projectId);
console.log('Backend:', backendId);
console.log('App Hosting URL:', hostingBase);
console.log('Shopify callback:', values.get('SHOPIFY_CUSTOMER_ACCOUNT_REDIRECT_URI'));
console.log(`Paste file: ${pastePath}`);
console.log(`Console: https://console.firebase.google.com/project/${projectId}/apphosting`);

console.log('\n--- Syncing secrets via Firebase CLI ---\n');

let ok = 0;
let fail = 0;
const failedSecrets = [];

for (const [envKey, secretName] of Object.entries(SECRET_MAP)) {
  const value = values.get(envKey);
  if (!value) {
    console.warn(`SKIP secret ${secretName} (${envKey} missing)`);
    continue;
  }
  try {
    setSecret(secretName, value);
    console.log(`OK set ${secretName}`);
    try {
      grantAccess(secretName);
      console.log(`OK grant ${secretName} → ${backendId}`);
    } catch (grantError) {
      console.warn(`WARN grant ${secretName}:`, grantError.message?.trim());
    }
    ok += 1;
  } catch (error) {
    const msg = String(error.message || error).trim();
    console.error(`FAIL ${secretName}:\n${msg}`);
    failedSecrets.push(secretName);
    fail += 1;
  }
}

console.log(`\nSecrets: ${ok} OK, ${fail} failed`);

if (fail > 0) {
  console.log('\nFallback: paste .firebase-env-paste.txt into Firebase Console → Environment → Rollout');
  console.log(`https://console.firebase.google.com/project/${projectId}/apphosting`);
  process.exit(2);
}

console.log('\nNext: npm run deploy:production');
