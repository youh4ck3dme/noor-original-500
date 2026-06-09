import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const {
  mockSendEachForMulticast,
  mockGet,
  mockGetAdminMessaging,
  mockGetAdminFirestore,
} = vi.hoisted(() => {
  const sendEachForMulticast = vi.fn(async () => ({
    successCount: 1,
    failureCount: 0,
  }));
  const get = vi.fn(async () => ({
    docs: [{ data: () => ({ token: 'stored-token' }) }],
  }));
  const collection = vi.fn(() => ({ get }));
  const getAdminFirestore = vi.fn(() => ({ collection }));
  const getAdminMessaging = vi.fn(() => ({ sendEachForMulticast }));

  return {
    mockSendEachForMulticast: sendEachForMulticast,
    mockGet: get,
    mockGetAdminMessaging: getAdminMessaging,
    mockGetAdminFirestore: getAdminFirestore,
  };
});

vi.mock('@/app/lib/firebase-admin', () => ({
  FCM_TOKENS_COLLECTION: 'fcm_tokens',
  getAdminFirestore: mockGetAdminFirestore,
  getAdminMessaging: mockGetAdminMessaging,
}));

const { POST } = await import('./route');

function makeRequest(body: unknown, secret = 'test-secret'): NextRequest {
  return new NextRequest('http://localhost:3001/api/push/send', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'content-type': 'application/json',
      'x-push-secret': secret,
    },
  });
}

describe('POST /api/push/send', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('PUSH_SEND_SECRET', 'test-secret');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns 401 for invalid secret', async () => {
    const response = await POST(
      makeRequest({ title: 'GrowMedica', body: 'Test' }, 'wrong-secret'),
    );

    expect(response.status).toBe(401);
    expect(mockGetAdminMessaging).not.toHaveBeenCalled();
  });

  it('returns 400 when title or body is missing', async () => {
    const response = await POST(makeRequest({ title: 'GrowMedica' }));

    expect(response.status).toBe(400);
    expect(mockGetAdminMessaging).not.toHaveBeenCalled();
  });

  it('sends notification to a specific token', async () => {
    const response = await POST(
      makeRequest({
        title: 'GrowMedica',
        body: 'Test push',
        url: '/',
        token: 'direct-token',
      }),
    );

    expect(response.status).toBe(200);
    expect(mockSendEachForMulticast).toHaveBeenCalledWith(
      expect.objectContaining({
        tokens: ['direct-token'],
        notification: { title: 'GrowMedica', body: 'Test push' },
      }),
    );

    const payload = await response.json();
    expect(payload.sent).toBe(1);
    expect(payload.failed).toBe(0);
  });

  it('sends notification to all stored tokens when token is omitted', async () => {
    const response = await POST(
      makeRequest({
        title: 'GrowMedica',
        body: 'Broadcast',
      }),
    );

    expect(response.status).toBe(200);
    expect(mockGet).toHaveBeenCalled();
    expect(mockSendEachForMulticast).toHaveBeenCalledWith(
      expect.objectContaining({
        tokens: ['stored-token'],
      }),
    );
  });
});
