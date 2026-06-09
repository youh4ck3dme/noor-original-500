#!/usr/bin/env node
import { execSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const PRODUCTION_URL = 'https://grow.nexify-studio.tech';

function run(cmd, label) {
  console.log(`\n>>> ${label}\n$ ${cmd}\n`);
  execSync(cmd, { cwd: rootDir, stdio: 'inherit', encoding: 'utf8' });
}

function tryRun(cmd) {
  const result = spawnSync(cmd, { shell: true, cwd: rootDir, encoding: 'utf8' });
  return { ok: result.status === 0, code: result.status, out: result.stdout, err: result.stderr };
}

console.log('=== Production deploy: grow.nexify-studio.tech ===\n');

const preflight = tryRun('node scripts/preflight-firebase.mjs');
if (!preflight.ok) {
  console.warn('\nWARN: preflight failed (exit', preflight.code, ')');
  if (preflight.out) console.warn(preflight.out);
  if (preflight.err) console.warn(preflight.err);
  console.warn('Continuing deploy — fix Blaze/IAM/backend if firebase deploy fails.\n');
} else if (preflight.out.includes('WARN')) {
  console.warn('\nWARN: preflight reported warnings — continuing deploy.\n');
}

const sync = tryRun('node scripts/sync-firebase-apphosting-env.mjs');
if (!sync.ok) {
  console.warn('\nWARN: secret sync incomplete (exit', sync.code, ')');
  const pastePath = path.join(rootDir, '.firebase-env-paste.txt');
  if (fs.existsSync(pastePath)) {
    console.warn('Paste env from .firebase-env-paste.txt into Firebase Console → Environment, then continue.');
  }
  console.warn('Continuing deploy — Console env overrides apphosting.yaml when set.\n');
}

run('npm run build', 'Local build check');

const deploy = tryRun('NODE_NO_WARNINGS=1 firebase deploy --only apphosting:noor-original-500');
let deployFailed = false;
if (!deploy.ok) {
  deployFailed = true;
  console.error('\nFAIL: Firebase App Hosting deploy (exit', deploy.code, ')');
  if (deploy.out) console.error(deploy.out);
  if (deploy.err) console.error(deploy.err);
  console.error('\nIf Blaze is not enabled, ask project owner — see docs/FIREBASE_APPHOSTING.md');
  console.warn('Continuing verify steps — site may not be live yet.\n');
}

run('npm run verify:shopify-customer-auth', 'Verify Shopify Customer Auth config');

const siteCheck = tryRun(`curl -sI "${PRODUCTION_URL}" | head -5`);
console.log('\n--- Site check ---');
console.log(siteCheck.ok ? siteCheck.out : siteCheck.err || 'no response');

const oauthCheck = tryRun(
  `curl -sI "${PRODUCTION_URL}/api/auth/shopify/login?next=/ucet" | head -8`,
);
console.log('\n--- OAuth login redirect ---');
console.log(oauthCheck.ok ? oauthCheck.out : oauthCheck.err || 'no response');

console.log('\n=== Deploy pipeline finished ===');
if (deployFailed) {
  console.error('Blocker: Firebase deploy failed — Blaze upgrade + backend required before production is live.');
  process.exit(deploy.code || 1);
}
console.log(`Test: ${PRODUCTION_URL}/api/auth/shopify/login?next=/ucet`);
