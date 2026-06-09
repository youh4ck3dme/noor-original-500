import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');
const serviceAccountPath = resolve(rootDir, '.firebase-service-account.json');

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
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvLocal();

if (!existsSync(serviceAccountPath)) {
  console.error('Missing .firebase-service-account.json');
  process.exit(1);
}

const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));

if (getApps().length === 0) {
  initializeApp({
    credential: cert(serviceAccount),
    projectId: serviceAccount.project_id,
  });
}

const db = getFirestore();
const collectionName = 'fcm_tokens';

const snapshot = await db.collection(collectionName).limit(10).get();

console.log(`Project: ${serviceAccount.project_id}`);
console.log(`Collection: ${collectionName}`);
console.log(`Documents: ${snapshot.size}`);

for (const doc of snapshot.docs) {
  const data = doc.data();
  console.log(`- ${doc.id.slice(0, 12)}... topics=${JSON.stringify(data.topics)} updated=${data.updatedAt?.toDate?.()?.toISOString?.() ?? 'n/a'}`);
}

if (snapshot.empty) {
  console.log('Collection is empty — it will be created on first subscribe.');
}
