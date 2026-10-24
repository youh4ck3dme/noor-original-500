import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PATCH } from './route';

const mockGet = vi.fn();
const mockSet = vi.fn();

vi.mock('@/app/lib/firebase-admin-auth', () => ({
  verifyIdToken: vi.fn(async () => ({
    uid: 'user-1',
    email: 'test@example.com',
    name: 'Test User',
  })),
  getBearerToken: vi.fn(() => 'valid-token'),
}));

vi.mock('@/app/lib/firebase-admin', () => ({
  getAdminFirestore: vi.fn(() => ({
    collection: vi.fn(() => ({
      doc: vi.fn(() => ({
        set: mockSet,
        get: mockGet,
      })),
    })),
  })),
}));

describe('PATCH /api/profile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGet.mockResolvedValue({
      data: () => ({
        uid: 'user-1',
        email: 'test@example.com',
        displayName: 'Test User',
        fitnessGoals: ['spanok', 'regeneracia'],
        allergies: ['laktoza'],
        shopifyCustomerId: null,
      }),
    });
  });

  it('rejects invalid fitness goals payload', async () => {
    const request = new Request('http://localhost/api/profile', {
      method: 'PATCH',
      headers: {
        Authorization: 'Bearer valid-token',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fitnessGoals: 'spanok' }),
    });

    const response = await PATCH(request);
    expect(response.status).toBe(400);
  });

  it('updates valid profile fields', async () => {
    const request = new Request('http://localhost/api/profile', {
      method: 'PATCH',
      headers: {
        Authorization: 'Bearer valid-token',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fitnessGoals: ['spanok', 'regeneracia'],
        allergies: ['laktoza'],
      }),
    });

    const response = await PATCH(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(mockSet).toHaveBeenCalled();
    expect(data.profile.fitnessGoals).toEqual(['spanok', 'regeneracia']);
  });
});
