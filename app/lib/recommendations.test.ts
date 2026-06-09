import { describe, expect, it } from 'vitest';
import { scoreProductsForGoals } from './recommendations';
import type { ShopifyProductNode } from './shopify';

const products: ShopifyProductNode[] = [
  {
    id: '1',
    title: 'Probiotikum',
    handle: 'probiotikum',
    tags: ['probiotika', 'travenie'],
    priceRange: { minVariantPrice: { amount: '20', currencyCode: 'EUR' } },
    images: { edges: [] },
  },
  {
    id: '2',
    title: 'Kolagén',
    handle: 'kolagen',
    tags: ['kolagen', 'regeneracia'],
    priceRange: { minVariantPrice: { amount: '30', currencyCode: 'EUR' } },
    images: { edges: [] },
  },
  {
    id: '3',
    title: 'Multivitamín',
    handle: 'multi',
    tags: ['vitaminy'],
    priceRange: { minVariantPrice: { amount: '15', currencyCode: 'EUR' } },
    images: { edges: [] },
  },
];

function singleProduct(tags: string[]): ShopifyProductNode {
  return {
    id: 'single',
    title: 'Test produkt',
    handle: 'test-produkt',
    tags,
    priceRange: { minVariantPrice: { amount: '10', currencyCode: 'EUR' } },
    images: { edges: [] },
  };
}

describe('scoreProductsForGoals', () => {
  it('prioritizes products matching fitness goals', () => {
    const scored = scoreProductsForGoals(products, ['lepsie-travenie'], 2);

    expect(scored[0]?.product.handle).toBe('probiotikum');
    expect(scored[0]?.matchedTags).toContain('probiotika');
  });

  it('matches regeneracia goal with kolagen and regeneracia tags', () => {
    const scored = scoreProductsForGoals(
      [singleProduct(['kolagen', 'regeneracia'])],
      ['regeneracia'],
      1,
    );

    expect(scored[0]?.score).toBeGreaterThan(0);
    expect(scored[0]?.matchedTags).toEqual(
      expect.arrayContaining(['kolagen', 'regeneracia']),
    );
  });

  it('matches naberanie-svalov goal with protein and svaly tags', () => {
    const scored = scoreProductsForGoals(
      [singleProduct(['protein', 'svaly'])],
      ['naberanie-svalov'],
      1,
    );

    expect(scored[0]?.score).toBeGreaterThan(0);
    expect(scored[0]?.matchedTags).toEqual(expect.arrayContaining(['protein', 'svaly']));
  });

  it('returns zero score when goals and tags do not match', () => {
    const scored = scoreProductsForGoals(
      [singleProduct(['regeneracia'])],
      ['naberanie-svalov'],
      1,
    );

    expect(scored[0]?.score).toBe(0);
    expect(scored[0]?.matchedTags).toEqual([]);
  });

  it('falls back to first products when no goals are set', () => {
    const scored = scoreProductsForGoals(products, [], 2);

    expect(scored).toHaveLength(2);
    expect(scored[0]?.score).toBe(0);
  });
});
