'use client';

import { getMessaging, getToken, isSupported, onMessage, type Messaging } from 'firebase/messaging';
import { getFirebaseApp } from './firebase';

const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

export type ForegroundPushPayload = {
  title: string;
  body: string;
  url?: string;
};

export function isPushSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'Notification' in window &&
    'serviceWorker' in navigator
  );
}

export async function isFirebaseMessagingSupported(): Promise<boolean> {
  if (!isPushSupported()) {
    return false;
  }

  try {
    return await isSupported();
  } catch {
    return false;
  }
}

async function getMessagingInstance(): Promise<Messaging | null> {
  const supported = await isFirebaseMessagingSupported();
  if (!supported) {
    return null;
  }

  return getMessaging(getFirebaseApp());
}

export async function requestPushPermission(): Promise<NotificationPermission> {
  if (!isPushSupported()) {
    return 'denied';
  }

  return Notification.requestPermission();
}

const SW_PATH = '/firebase-messaging-sw.js';

async function waitForActiveServiceWorker(
  registration: ServiceWorkerRegistration,
): Promise<ServiceWorkerRegistration> {
  if (registration.active) {
    return registration;
  }

  const worker = registration.installing ?? registration.waiting;
  if (worker) {
    await new Promise<void>((resolve, reject) => {
      const timeout = window.setTimeout(() => {
        reject(new Error('Service worker sa neaktivoval včas. Obnovte stránku a skúste znova.'));
      }, 10_000);

      worker.addEventListener('statechange', () => {
        if (worker.state === 'activated') {
          window.clearTimeout(timeout);
          resolve();
        }
        if (worker.state === 'redundant') {
          window.clearTimeout(timeout);
          reject(new Error('Service worker sa nepodarilo aktivovať.'));
        }
      });
    });

    return registration;
  }

  await navigator.serviceWorker.ready;
  return registration;
}

/** Register SW early so subscribe does not race on first click. */
export async function ensurePushServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!(await isFirebaseMessagingSupported())) {
    return null;
  }

  const existing = await navigator.serviceWorker.getRegistration('/');
  const registration = existing ?? (await navigator.serviceWorker.register(SW_PATH));
  return waitForActiveServiceWorker(registration);
}

export async function getFcmToken(): Promise<string | null> {
  if (!VAPID_KEY) {
    throw new Error('NEXT_PUBLIC_FIREBASE_VAPID_KEY is not set.');
  }

  const messaging = await getMessagingInstance();
  if (!messaging) {
    return null;
  }

  const registration = await ensurePushServiceWorker();
  if (!registration?.active) {
    throw new Error('Service worker nie je aktívny. Obnovte stránku a skúste znova.');
  }

  return getToken(messaging, {
    vapidKey: VAPID_KEY,
    serviceWorkerRegistration: registration,
  });
}

export async function registerPushToken(
  token: string,
  topics: string[] = ['promo'],
): Promise<void> {
  const response = await fetch('/api/push/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, topics }),
  });

  if (!response.ok) {
    throw new Error('Failed to register push token.');
  }
}

export function onForegroundMessage(
  callback: (payload: ForegroundPushPayload) => void,
): () => void {
  let unsubscribe = () => {};

  void (async () => {
    const messaging = await getMessagingInstance();
    if (!messaging) {
      return;
    }

    unsubscribe = onMessage(messaging, (payload) => {
      callback({
        title: payload.notification?.title ?? payload.data?.title ?? 'GrowMedica',
        body: payload.notification?.body ?? payload.data?.body ?? '',
        url: payload.fcmOptions?.link ?? payload.data?.url,
      });
    });
  })();

  return () => unsubscribe();
}
