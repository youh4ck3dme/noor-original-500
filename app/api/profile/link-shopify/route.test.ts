import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockFindCustomer = vi.fn();
const mockGet = vi.fn();
const mockUpdate = vi.fn();

vi.mock('@/app/lib/shopify-customers', () => ({
  findShopifyCustomerByEmail: mockFindCustomer,
}));

vi.mock('@/app/lib/shopify-admin', () => ({
  isShopifyAdminConfigured: vi.fn(() => true),
}));

vi.mock('@/app/lib/shopify-customer-session', () => ({
  getShopifyCustomerSession: vi.fn(async () => null),
}));

vi.mock('@/app/lib/firebase-admin-auth', () => ({
  getBearerToken: vi.fn(() => 'token'),
  verifyIdToken: vi.fn(async () => ({ uid: 'user-1', email: 'buyer@example.com' })),
}));

vi.mock('@/app/lib/firebase-admin', () => ({
  getAdminFirestore: vi.fn(() => ({
    collection: vi.fn(() => ({
      doc: vi.fn(() => ({
        get: mockGet,
        update: mockUpdate,
      })),
    })),
  })),
}));

const { POST } = await import('./route');

describe('POST /api/profile/link-shopify', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGet.mockResolvedValue({ exists: true, data: () => ({ email: 'buyer@example.com' }) });
    mockFindCustomer.mockResolvedValue('gid://shopify/Customer/1');
  });

  it('links Shopify customer by email', async () => {
    const response = await POST(
      new Request('http://localhost/api/profile/link-shopify', {
        method: 'POST',
        headers: { Authorization: 'Bearer token' },
      }),
    );

    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.linked).toBe(true);
    expect(data.shopifyCustomerId).toBe('gid://shopify/Customer/1');
    expect(mockUpdate).toHaveBeenCalled();
  });
});
