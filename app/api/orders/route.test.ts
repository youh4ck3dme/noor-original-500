import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockGetCustomerOrders = vi.fn();
const mockGet = vi.fn();

vi.mock('@/app/lib/shopify-customers', () => ({
  getCustomerOrders: mockGetCustomerOrders,
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
      doc: vi.fn(() => ({ get: mockGet })),
    })),
  })),
}));

const { GET } = await import('./route');

describe('GET /api/orders', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns empty orders when not linked', async () => {
    mockGet.mockResolvedValue({
      exists: true,
      data: () => ({ shopifyCustomerId: null }),
    });

    const response = await GET(
      new Request('http://localhost/api/orders', {
        headers: { Authorization: 'Bearer token' },
      }),
    );

    const data = await response.json();
    expect(data.linked).toBe(false);
    expect(data.orders).toEqual([]);
  });

  it('returns orders when shopifyCustomerId is set', async () => {
    mockGet.mockResolvedValue({
      exists: true,
      data: () => ({ shopifyCustomerId: 'gid://shopify/Customer/1' }),
    });
    mockGetCustomerOrders.mockResolvedValue([
      {
        id: 'gid://shopify/Order/1',
        name: '#1001',
        processedAt: '2025-01-01',
        financialStatus: 'PAID',
        fulfillmentStatus: 'FULFILLED',
        totalAmount: '29.90',
        currencyCode: 'EUR',
        lineItems: [{ title: 'Energy Renol', quantity: 1 }],
      },
    ]);

    const response = await GET(
      new Request('http://localhost/api/orders', {
        headers: { Authorization: 'Bearer token' },
      }),
    );

    const data = await response.json();
    expect(data.linked).toBe(true);
    expect(data.orders).toHaveLength(1);
    expect(data.orders[0].name).toBe('#1001');
  });
});
