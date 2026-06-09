'use client';

import { useEffect, useState } from 'react';
import { Bell, X } from 'lucide-react';
import {
  ensurePushServiceWorker,
  getFcmToken,
  isFirebaseMessagingSupported,
  onForegroundMessage,
  registerPushToken,
  requestPushPermission,
  type ForegroundPushPayload,
} from '@/app/lib/firebase-messaging';

const DISMISS_STORAGE_KEY = 'noor_push_dismissed';
const SUBSCRIBED_STORAGE_KEY = 'noor_push_subscribed';

type PromptState = 'hidden' | 'loading' | 'prompt' | 'subscribed' | 'denied' | 'unsupported' | 'error';

function showForegroundToast(payload: ForegroundPushPayload) {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return;
  }

  if (Notification.permission === 'granted') {
    const notification = new Notification(payload.title, {
      body: payload.body,
      icon: '/favicon.ico',
    });

    notification.onclick = () => {
      window.focus();
      if (payload.url) {
        window.location.href = payload.url;
      }
      notification.close();
    };
  }
}

export function PushNotificationPrompt() {
  const [state, setState] = useState<PromptState>('hidden');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      if (window.localStorage.getItem(SUBSCRIBED_STORAGE_KEY) === '1') {
        if (!cancelled) setState('subscribed');
        return;
      }

      if (window.localStorage.getItem(DISMISS_STORAGE_KEY) === '1') {
        if (!cancelled) setState('hidden');
        return;
      }

      const supported = await isFirebaseMessagingSupported();
      if (!supported) {
        if (!cancelled) setState('unsupported');
        return;
      }

      if (Notification.permission === 'denied') {
        if (!cancelled) setState('denied');
        return;
      }

      // Pre-register SW so PushManager.subscribe does not race on first click.
      void ensurePushServiceWorker().catch(() => {});

      if (!cancelled) setState('prompt');
    })();

    const unsubscribe = onForegroundMessage(showForegroundToast);

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  const handleDismiss = () => {
    window.localStorage.setItem(DISMISS_STORAGE_KEY, '1');
    setState('hidden');
  };

  const handleSubscribe = async () => {
    setState('loading');
    setErrorMessage(null);

    try {
      const permission = await requestPushPermission();
      if (permission !== 'granted') {
        setState('denied');
        return;
      }

      const token = await getFcmToken();
      if (!token) {
        throw new Error('FCM token sa nepodarilo získať.');
      }

      await registerPushToken(token);
      window.localStorage.setItem(SUBSCRIBED_STORAGE_KEY, '1');
      setState('subscribed');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Nepodarilo sa zapnúť notifikácie.');
      setState('error');
    }
  };

  if (state === 'hidden' || state === 'unsupported' || state === 'subscribed') {
    return null;
  }

  return (
    <div
      data-testid="push-prompt"
      className="fixed bottom-24 left-4 z-40 max-w-sm rounded-xl border border-neutral-200 bg-white p-4 shadow-lg"
    >
      <div className="flex items-start gap-3">
        <div className="rounded-full bg-emerald-50 p-2 text-emerald-700">
          <Bell className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-neutral-900">GrowMedica notifikácie</p>
          <p className="mt-1 text-sm text-neutral-600">
            Chcete dostávať novinky a akcie GrowMedica?
          </p>

          {state === 'denied' && (
            <p className="mt-2 text-xs text-amber-700">
              Notifikácie sú v prehliadači zakázané. Povoľte ich v nastaveniach stránky.
            </p>
          )}

          {state === 'error' && errorMessage && (
            <p className="mt-2 text-xs text-red-600">{errorMessage}</p>
          )}

          <div className="mt-3 flex gap-2">
            {state !== 'denied' && (
              <button
                type="button"
                data-testid="push-allow"
                onClick={() => void handleSubscribe()}
                disabled={state === 'loading'}
                className="rounded-lg bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-60"
              >
                {state === 'loading' ? 'Ukladám…' : 'Povoliť'}
              </button>
            )}
            <button
              type="button"
              data-testid="push-dismiss"
              onClick={handleDismiss}
              className="rounded-lg border border-neutral-200 px-3 py-1.5 text-sm text-neutral-700"
            >
              Neskôr
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          className="text-neutral-400 hover:text-neutral-600"
          aria-label="Zavrieť"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
