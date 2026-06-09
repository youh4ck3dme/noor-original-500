import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockShopifyFetch } = vi.hoisted(() => ({
  mockShopifyFetch: vi.fn(),
}));

vi.mock('@/app/lib/shopify', () => ({
  shopifyFetch: mockShopifyFetch,
}));

vi.mock('@/app/lib/api-auth', () => ({
  requireAdmin: vi.fn(async () => ({ decoded: { uid: 'admin-1', email: 'admin@example.com' } })),
}));

const { GET } = await import('./route');

const sampleNode = {
  id: 'gid://shopify/Product/1',
  title: 'Energy Renol',
  handle: 'energy-renol',
  availableForSale: true,
  descriptionHtml: '<p>Test</p>',
  priceRange: {
    minVariantPrice: { amount: '29.90', currencyCode: 'EUR' },
  },
  variants: {
    edges: [{ node: { id: 'gid://shopify/ProductVariant/1', availableForSale: true } }],
  },
  images: {
    edges: [{ node: { url: 'https://example.com/img.jpg', altText: 'Energy Renol' } }],
  },
  metafields: [{ key: 'status', value: 'Návrh' }],
};

describe('GET /api/admin/products', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns a JSON array of mapped admin products', async () => {
    mockShopifyFetch.mockResolvedValue({
      products: {
        edges: [{ node: sampleNode }],
      },
    });

    const response = await GET(new Request('http://localhost/api/admin/products'));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(payload)).toBe(true);
    expect(payload).toHaveLength(1);
    expect(payload[0]).toMatchObject({
      id: 'gid://shopify/Product/1',
      title: 'Energy Renol',
      handle: 'energy-renol',
      status: 'Návrh',
      variantId: 'gid://shopify/ProductVariant/1',
    });
  });

  it('derives status from availability when status metafield is missing', async () => {
    mockShopifyFetch.mockResolvedValue({
      products: {
        edges: [
          {
            node: {
              ...sampleNode,
              availableForSale: false,
              metafields: null,
            },
          },
        ],
      },
    });

    const response = await GET(new Request('http://localhost/api/admin/products'));
    const payload = await response.json();

    expect(payload[0].status).toBe('Archivované');
  });

  it('returns 500 error object when Shopify fetch fails', async () => {
    mockShopifyFetch.mockRejectedValue(new Error('Shopify down'));

    const response = await GET(new Request('http://localhost/api/admin/products'));
    const payload = await response.json();

    expect(response.status).toBe(500);
    expect(payload).toEqual({ error: 'Failed to fetch products' });
    expect(Array.isArray(payload)).toBe(false);
  });
});
