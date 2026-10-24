#!/usr/bin/env node
import { execSync } from 'node:child_process';

const PROJECT_ID = 'noorgrowmfinnal-58800798-76fac';
const BACKEND_ID = 'noor-original-500';
const BILLING_URL = `https://console.firebase.google.com/project/${PROJECT_ID}/usage/details`;
const IAM_URL = `https://console.developers.google.com/iam-admin/iam?project=${PROJECT_ID}`;
const APPHOSTING_URL = `https://console.firebase.google.com/project/${PROJECT_ID}/apphosting`;

const spawnEnv = { ...process.env, NODE_NO_WARNINGS: '1' };

function run(cmd, options = {}) {
  return execSync(cmd, {
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
    env: spawnEnv,
    ...options,
  });
}

function tryRun(cmd) {
  try {
    return { ok: true, out: run(cmd) };
  } catch (error) {
    return { ok: false, err: (error.stderr || error.stdout || error.message || '').trim() };
  }
}

function printBlazeAndIamHints(err = '') {
  console.error('\nLikely causes:');
  if (/403|permission|serviceusage|Service Usage/i.test(err)) {
    console.error('  - Missing IAM (Editor + Service Usage Consumer) or APIs not enabled');
    console.error('  - App Hosting requires Blaze (pay-as-you-go) billing — not a fixed monthly fee');
  } else {
    console.error('  - App Hosting requires Blaze plan with billing account linked');
    console.error('  - Backend may not exist yet in Firebase Console');
  }
  console.error('\nFix:');
  console.error(`  Blaze upgrade: ${BILLING_URL}`);
  console.error(`  IAM: ${IAM_URL}`);
  console.error(`  App Hosting: ${APPHOSTING_URL}`);
  console.error(
    `  gcloud services enable firebaseapphosting.googleapis.com secretmanager.googleapis.com --project=${PROJECT_ID}`,
  );
}

let warnings = 0;

console.log('Firebase preflight');
console.log('  project:', PROJECT_ID);
console.log('  backend:', BACKEND_ID);

const login = tryRun('firebase login:list');
if (!login.ok) {
  console.error('FAIL firebase login:list');
  console.error(login.err);
  process.exit(1);
}
console.log('\n--- firebase login:list ---');
console.log(login.out.trim());

const projects = tryRun('firebase projects:list');
if (!projects.ok) {
  console.error('FAIL firebase projects:list — run: firebase login --reauth');
  console.error(projects.err);
  process.exit(1);
}

if (!projects.out.includes(PROJECT_ID)) {
  const account = login.out.match(/Logged in as (.+)/)?.[1] || 'unknown';
  console.error(`FAIL project ${PROJECT_ID} not visible for ${account}`);
  console.error('Run: firebase login --reauth');
  console.error('Use the Google account with Owner/Editor on this Firebase project.');
  process.exit(1);
}
console.log(`OK project ${PROJECT_ID} visible`);

const backends = tryRun(`firebase apphosting:backends:list --project ${PROJECT_ID}`);
if (!backends.ok) {
  warnings += 1;
  console.warn('\nWARN apphosting:backends:list failed');
  if (backends.err) console.warn(backends.err);
  printBlazeAndIamHints(backends.err);
} else if (!backends.out.includes(BACKEND_ID)) {
  warnings += 1;
  console.warn(`WARN backend "${BACKEND_ID}" not found — create in Console:`);
  console.warn(`  ${APPHOSTING_URL}`);
} else {
  console.log(`OK backend ${BACKEND_ID} exists`);
}

if (warnings > 0) {
  console.warn(`\nPreflight completed with ${warnings} warning(s) — deploy may still fail until Blaze/backend are ready`);
  process.exit(0);
}

console.log('\nPreflight OK');
