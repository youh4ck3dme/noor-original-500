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

export async function getFcmToken(): Promise<string | null> {
  if (!VAPID_KEY) {
    throw new Error('NEXT_PUBLIC_FIREBASE_VAPID_KEY is not set.');
  }

  const messaging = await getMessagingInstance();
  if (!messaging) {
    return null;
  }

  const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');

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
