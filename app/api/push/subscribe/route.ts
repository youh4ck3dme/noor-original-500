import { FieldValue } from 'firebase-admin/firestore';
import { NextRequest, NextResponse } from 'next/server';
import {
  FCM_TOKENS_COLLECTION,
  getAdminFirestore,
  hashFcmToken,
} from '@/app/lib/firebase-admin';

const MAX_TOKEN_LENGTH = 4096;
const MAX_TOPICS = 20;

function isValidToken(token: unknown): token is string {
  return typeof token === 'string' && token.trim().length > 0 && token.length <= MAX_TOKEN_LENGTH;
}

function normalizeTopics(topics: unknown): string[] {
  if (!Array.isArray(topics)) {
    return ['promo'];
  }

  return topics
    .filter((topic): topic is string => typeof topic === 'string' && topic.trim().length > 0)
    .map((topic) => topic.trim())
    .slice(0, MAX_TOPICS);
}

export async function POST(request: NextRequest) {
  const payload = (await request.json().catch(() => null)) as {
    token?: unknown;
    topics?: unknown;
  } | null;

  if (!payload || !isValidToken(payload.token)) {
    return NextResponse.json(
      { error: { code: 'invalid_token', message: 'Invalid FCM token.' } },
      { status: 400 },
    );
  }

  try {
    const token = payload.token.trim();
    const topics = normalizeTopics(payload.topics);
    const userAgent = request.headers.get('user-agent') ?? 'unknown';
    const tokenHash = hashFcmToken(token);
    const docRef = getAdminFirestore().collection(FCM_TOKENS_COLLECTION).doc(tokenHash);

    await docRef.set(
      {
        token,
        topics,
        userAgent,
        updatedAt: FieldValue.serverTimestamp(),
        createdAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[Push subscribe] Error:', error);
    return NextResponse.json(
      { error: { code: 'subscribe_failed', message: 'Failed to save push token.' } },
      { status: 500 },
    );
  }
}
