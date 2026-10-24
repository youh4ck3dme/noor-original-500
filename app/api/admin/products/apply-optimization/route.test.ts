import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockShopifyAdminFetch } = vi.hoisted(() => ({
  mockShopifyAdminFetch: vi.fn(),
}));

vi.mock('@/app/lib/shopify-admin', () => ({
  shopifyAdminFetch: mockShopifyAdminFetch,
}));

vi.mock('@/app/lib/api-auth', () => ({
  requireAdmin: vi.fn(async () => ({ decoded: { uid: 'admin-1', email: 'admin@example.com' } })),
}));

const { POST } = await import('./route');

const samplePayload = {
  productId: 'gid://shopify/Product/1',
  productHandle: 'energy-renol',
  applyPayload: {
    seo: {
      title: 'Premium Energy Renol | GrowMedica',
      description: 'Objavte Energy Renol od GrowMedica.',
    },
    metafields: [
      {
        namespace: 'custom',
        key: 'composition',
        type: 'multi_line_text_field',
        value: '100% prírodné zložky',
      },
    ],
  },
};

describe('POST /api/admin/products/apply-optimization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns success when Shopify accepts the update', async () => {
    mockShopifyAdminFetch.mockResolvedValue({
      productUpdate: {
        product: { id: 'gid://shopify/Product/1', handle: 'energy-renol' },
        userErrors: [],
      },
    });

    const response = await POST(
      new Request('http://localhost/api/admin/products/apply-optimization', {
        method: 'POST',
        body: JSON.stringify(samplePayload),
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.product.handle).toBe('energy-renol');
  });

  it('returns 422 when Shopify reports userErrors', async () => {
    mockShopifyAdminFetch.mockResolvedValue({
      productUpdate: {
        product: null,
        userErrors: [{ field: ['metafields'], message: 'Invalid metafield' }],
      },
    });

    const response = await POST(
      new Request('http://localhost/api/admin/products/apply-optimization', {
        method: 'POST',
        body: JSON.stringify(samplePayload),
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const data = await response.json();
    expect(response.status).toBe(422);
    expect(data.userErrors).toHaveLength(1);
  });

  it('returns 400 when payload is incomplete', async () => {
    const response = await POST(
      new Request('http://localhost/api/admin/products/apply-optimization', {
        method: 'POST',
        body: JSON.stringify({ productId: 'gid://shopify/Product/1' }),
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    expect(response.status).toBe(400);
  });
});
