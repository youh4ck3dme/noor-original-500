import { NextRequest, NextResponse } from 'next/server';
import {
  FCM_TOKENS_COLLECTION,
  getAdminFirestore,
  getAdminMessaging,
} from '@/app/lib/firebase-admin';

const MAX_BATCH_SIZE = 500;

type SendPushBody = {
  title?: unknown;
  body?: unknown;
  url?: unknown;
  token?: unknown;
};

function getPushSecret(request: NextRequest): string | null {
  return (
    request.headers.get('x-push-secret') ??
    request.nextUrl.searchParams.get('secret')
  );
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

async function loadTargetTokens(token?: string): Promise<string[]> {
  if (token) {
    return [token];
  }

  const snapshot = await getAdminFirestore().collection(FCM_TOKENS_COLLECTION).get();
  const tokens = snapshot.docs
    .map((doc) => doc.data().token)
    .filter((value): value is string => typeof value === 'string' && value.length > 0);

  return Array.from(new Set(tokens));
}

export async function POST(request: NextRequest) {
  const expectedSecret = process.env.PUSH_SEND_SECRET?.trim();
  if (!expectedSecret) {
    return NextResponse.json(
      { error: { code: 'server_misconfigured', message: 'PUSH_SEND_SECRET is not set.' } },
      { status: 500 },
    );
  }

  const providedSecret = getPushSecret(request);
  if (providedSecret !== expectedSecret) {
    return NextResponse.json(
      { error: { code: 'unauthorized', message: 'Invalid push secret.' } },
      { status: 401 },
    );
  }

  const payload = (await request.json().catch(() => null)) as SendPushBody | null;

  if (!payload || !isNonEmptyString(payload.title) || !isNonEmptyString(payload.body)) {
    return NextResponse.json(
      { error: { code: 'invalid_payload', message: 'title and body are required.' } },
      { status: 400 },
    );
  }

  const url = isNonEmptyString(payload.url) ? payload.url.trim() : '/';
  const singleToken = isNonEmptyString(payload.token) ? payload.token.trim() : undefined;

  try {
    const tokens = await loadTargetTokens(singleToken);

    if (tokens.length === 0) {
      return NextResponse.json(
        { error: { code: 'no_tokens', message: 'No registered push tokens found.' } },
        { status: 404 },
      );
    }

    const messaging = getAdminMessaging();
    let sent = 0;
    let failed = 0;

    for (let index = 0; index < tokens.length; index += MAX_BATCH_SIZE) {
      const batch = tokens.slice(index, index + MAX_BATCH_SIZE);
      const response = await messaging.sendEachForMulticast({
        tokens: batch,
        notification: {
          title: payload.title.trim(),
          body: payload.body.trim(),
        },
        webpush: {
          fcmOptions: {
            link: url,
          },
        },
      });

      sent += response.successCount;
      failed += response.failureCount;
    }

    return NextResponse.json({ sent, failed, total: tokens.length });
  } catch (error) {
    console.error('[Push send] Error:', error);
    return NextResponse.json(
      { error: { code: 'send_failed', message: 'Failed to send push notifications.' } },
      { status: 500 },
    );
  }
}
