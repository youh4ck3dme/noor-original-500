import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockVerifyIdToken, mockGetBearerToken } = vi.hoisted(() => ({
  mockVerifyIdToken: vi.fn(),
  mockGetBearerToken: vi.fn(),
}));

vi.mock('./firebase-admin-auth', () => ({
  verifyIdToken: mockVerifyIdToken,
  getBearerToken: mockGetBearerToken,
}));

const { getAdminEmails, requireAdmin, requireAuth } = await import('./api-auth');

describe('api-auth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.ADMIN_EMAILS = 'admin@example.com,other@example.com';
  });

  it('getAdminEmails parses comma-separated list', () => {
    expect(getAdminEmails()).toEqual(['admin@example.com', 'other@example.com']);
  });

  it('requireAuth returns 401 without token', async () => {
    mockGetBearerToken.mockReturnValue(null);
    const result = await requireAuth(new Request('http://localhost'));
    expect(result.error?.status).toBe(401);
  });

  it('requireAdmin returns 403 for non-allowlisted email', async () => {
    mockGetBearerToken.mockReturnValue('token');
    mockVerifyIdToken.mockResolvedValue({ uid: '1', email: 'user@example.com' });

    const result = await requireAdmin(new Request('http://localhost'));
    expect(result.error?.status).toBe(403);
  });

  it('requireAdmin allows allowlisted email', async () => {
    mockGetBearerToken.mockReturnValue('token');
    mockVerifyIdToken.mockResolvedValue({ uid: '1', email: 'admin@example.com' });

    const result = await requireAdmin(new Request('http://localhost'));
    expect(result.error).toBeUndefined();
    expect(result.decoded?.email).toBe('admin@example.com');
  });
});
