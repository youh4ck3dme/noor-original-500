import { createHash } from 'crypto';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { applicationDefault, cert, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { getMessaging, type Messaging } from 'firebase-admin/messaging';

let adminApp: App | null = null;

function loadServiceAccountRaw(): string {
  const inline = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();
  if (inline) {
    return inline;
  }

  const configuredPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH?.trim();
  const filePath = resolve(process.cwd(), configuredPath || '.firebase-service-account.json');

  try {
    const fileContents = readFileSync(filePath, 'utf8').trim();
    if (fileContents) {
      return fileContents;
    }
  } catch {
    // Fall through to application default credentials.
  }

  throw new Error(
    'Firebase service account is missing. Set FIREBASE_SERVICE_ACCOUNT_JSON, save JSON to .firebase-service-account.json, or use gcloud application-default login.',
  );
}

function parseServiceAccountJson(): Record<string, string> {
  const raw = loadServiceAccountRaw();

  try {
    return JSON.parse(raw) as Record<string, string>;
  } catch {
    throw new Error('Firebase service account JSON is invalid.');
  }
}

function hasInlineOrFileServiceAccount(): boolean {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim()) {
    return true;
  }

  const configuredPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH?.trim();
  const filePath = resolve(process.cwd(), configuredPath || '.firebase-service-account.json');

  try {
    return readFileSync(filePath, 'utf8').trim().length > 0;
  } catch {
    return false;
  }
}

function getAdminCredential() {
  if (hasInlineOrFileServiceAccount()) {
    return cert(parseServiceAccountJson());
  }

  return applicationDefault();
}

export function getAdminApp(): App {
  if (adminApp) {
    return adminApp;
  }

  if (getApps().length > 0) {
    adminApp = getApps()[0]!;
    return adminApp;
  }

  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim();

  adminApp = initializeApp({
    credential: getAdminCredential(),
    ...(projectId ? { projectId } : {}),
  });

  return adminApp;
}

export function getAdminFirestore(): Firestore {
  return getFirestore(getAdminApp());
}

export function getAdminMessaging(): Messaging {
  return getMessaging(getAdminApp());
}

export function hashFcmToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export const FCM_TOKENS_COLLECTION = 'fcm_tokens';
