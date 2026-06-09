import { describe, expect, it } from 'vitest';
import { toStorefrontProductCard } from './shopify-mappers';
import type { ShopifyProductNode } from './shopify';

const sampleProduct: ShopifyProductNode = {
  id: 'gid://shopify/Product/1',
  title: 'Energy Renol',
  handle: 'energy-renol',
  availableForSale: true,
  priceRange: { minVariantPrice: { amount: '21.8', currencyCode: 'EUR' } },
  variants: {
    edges: [
      {
        node: {
          id: 'gid://shopify/ProductVariant/1',
          title: 'Default',
          availableForSale: true,
          price: { amount: '21.8', currencyCode: 'EUR' },
          selectedOptions: [],
        },
      },
    ],
  },
  images: {
    edges: [
      {
        node: {
          url: 'https://cdn.shopify.com/s/files/1/1.jpg',
          altText: 'Renol',
          width: 400,
          height: 500,
        },
      },
    ],
  },
};

describe('toStorefrontProductCard', () => {
  it('maps Shopify product to storefront card', () => {
    const card = toStorefrontProductCard(sampleProduct);

    expect(card.title).toBe('Energy Renol');
    expect(card.handle).toBe('energy-renol');
    expect(card.featuredImage?.url).toContain('cdn.shopify.com');
    expect(card.priceRange.minVariantPrice.amount).toBe('21.8');
    expect(card.variantId).toBe('gid://shopify/ProductVariant/1');
  });
});
