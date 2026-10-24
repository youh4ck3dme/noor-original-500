import { describe, expect, it } from 'vitest';
import { buildOptimizationResult } from './product-optimization';
import type { ShopifyProductNode } from './shopify';

const baseProduct: ShopifyProductNode = {
  id: 'gid://shopify/Product/1',
  title: 'Energy Renol',
  handle: 'energy-renol',
  priceRange: {
    minVariantPrice: { amount: '29.90', currencyCode: 'EUR' },
  },
  images: { edges: [] },
  metafields: [],
};

describe('buildOptimizationResult', () => {
  it('suggests missing PDP metafields and builds apply payload', () => {
    const result = buildOptimizationResult(baseProduct);

    expect(result.productHandle).toBe('energy-renol');
    expect(result.missingMetafields).toContain('composition');
    expect(result.missingMetafields).toContain('dosage');
    expect(result.applyPayload.metafields.length).toBeGreaterThan(0);
    expect(result.applyPayload.seo.title).toContain('GrowMedica');
  });

  it('skips metafields that already exist', () => {
    const product: ShopifyProductNode = {
      ...baseProduct,
      metafields: [
        { key: 'composition', value: 'Vitamín C, zinok', type: 'multi_line_text_field' },
        { key: 'dosage', value: '1 kapsula denne', type: 'multi_line_text_field' },
        {
          key: 'product_faq',
          value: JSON.stringify([{ question: 'Q', answer: 'A' }]),
          type: 'json',
        },
      ],
    };

    const result = buildOptimizationResult(product);
    expect(result.missingMetafields).toHaveLength(0);
    expect(result.applyPayload.metafields).toHaveLength(0);
  });
});
