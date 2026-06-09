import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { mockSet, mockDoc, mockCollection, mockGetAdminFirestore } = vi.hoisted(() => {
  const set = vi.fn(async () => undefined);
  const doc = vi.fn(() => ({ set }));
  const collection = vi.fn(() => ({ doc }));
  const getAdminFirestore = vi.fn(() => ({ collection }));

  return {
    mockSet: set,
    mockDoc: doc,
    mockCollection: collection,
    mockGetAdminFirestore: getAdminFirestore,
  };
});

vi.mock('@/app/lib/firebase-admin', () => ({
  FCM_TOKENS_COLLECTION: 'fcm_tokens',
  getAdminFirestore: mockGetAdminFirestore,
  hashFcmToken: (token: string) => `hash-${token}`,
}));

const { POST } = await import('./route');

function makeRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost:3001/api/push/subscribe', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'content-type': 'application/json',
      'user-agent': 'vitest',
    },
  });
}

describe('POST /api/push/subscribe', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns 400 for invalid token', async () => {
    const response = await POST(makeRequest({ token: '' }));

    expect(response.status).toBe(400);
    expect(mockGetAdminFirestore).not.toHaveBeenCalled();
  });

  it('upserts token into Firestore', async () => {
    const response = await POST(
      makeRequest({ token: 'fcm-token-123', topics: ['promo', 'orders'] }),
    );

    expect(response.status).toBe(200);
    expect(mockCollection).toHaveBeenCalledWith('fcm_tokens');
    expect(mockDoc).toHaveBeenCalledWith('hash-fcm-token-123');
    expect(mockSet).toHaveBeenCalledWith(
      expect.objectContaining({
        token: 'fcm-token-123',
        topics: ['promo', 'orders'],
        userAgent: 'vitest',
      }),
      { merge: true },
    );

    const payload = await response.json();
    expect(payload.ok).toBe(true);
  });
});
