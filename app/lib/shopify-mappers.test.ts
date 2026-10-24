import { describe, expect, it } from 'vitest';
import { toProductDetail, toStorefrontProductCard } from './shopify-mappers';
import type { ShopifyProductNode } from './shopify';

const sampleProduct: ShopifyProductNode = {
  id: 'gid://shopify/Product/1',
  title: 'Energy Renol',
  handle: 'energy-renol',
  availableForSale: true,
  tags: ['energia', 'vitaminy'],
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
  metafields: [
    {
      key: 'composition',
      value: 'Vitamín C, zinok',
      type: 'multi_line_text_field',
    },
    {
      key: 'product_faq',
      value: JSON.stringify([
        { question: 'Ako užívať?', answer: '1 kapsula denne.' },
      ]),
      type: 'json',
    },
  ],
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

describe('toProductDetail', () => {
  it('maps metafields into product detail sections', () => {
    const detail = toProductDetail(sampleProduct);

    expect(detail.composition).toBe('Vitamín C, zinok');
    expect(detail.tags).toEqual(['energia', 'vitaminy']);
    expect(detail.faq).toHaveLength(1);
    expect(detail.faq[0]?.title).toBe('Ako užívať?');
  });

  it('maps lab_tests metaobject references', () => {
    const product: ShopifyProductNode = {
      ...sampleProduct,
      metafields: [
        {
          key: 'lab_tests',
          value: '',
          type: 'list.metaobject_reference',
          references: {
            edges: [
              {
                node: {
                  type: 'lab_test',
                  fields: [
                    { key: 'title', value: 'Test čistoty' },
                    { key: 'lab_name', value: 'Eurofins' },
                    { key: 'test_date', value: '2025-01-15' },
                    { key: 'pdf_url', value: 'https://example.com/report.pdf' },
                  ],
                },
              },
            ],
          },
        },
      ],
    };

    const detail = toProductDetail(product);

    expect(detail.labTests).toHaveLength(1);
    expect(detail.labTests[0]?.title).toBe('Test čistoty');
    expect(detail.labTests[0]?.labName).toBe('Eurofins');
    expect(detail.labTests[0]?.pdfUrl).toBe('https://example.com/report.pdf');
  });

  it('parses product_faq and skips invalid FAQ rows', () => {
    const product: ShopifyProductNode = {
      ...sampleProduct,
      metafields: [
        {
          key: 'product_faq',
          value: JSON.stringify([
            { question: 'Je to vegan?', answer: 'Áno.' },
            { question: '', answer: 'Bez otázky' },
            { question: 'Bez odpovede', answer: '' },
          ]),
          type: 'json',
        },
      ],
    };

    const detail = toProductDetail(product);

    expect(detail.faq).toHaveLength(1);
    expect(detail.faq[0]?.title).toBe('Je to vegan?');
    expect(detail.faq[0]?.content).toBe('Áno.');
  });

  it('returns empty detail sections when metafields are missing', () => {
    const product: ShopifyProductNode = {
      ...sampleProduct,
      tags: undefined,
      metafields: undefined,
    };

    const detail = toProductDetail(product);

    expect(detail.composition).toBeNull();
    expect(detail.dosage).toBeNull();
    expect(detail.labTests).toEqual([]);
    expect(detail.faq).toEqual([]);
    expect(detail.tags).toEqual([]);
  });

  it('handles invalid FAQ JSON gracefully', () => {
    const product: ShopifyProductNode = {
      ...sampleProduct,
      metafields: [
        {
          key: 'product_faq',
          value: 'not-json',
          type: 'json',
        },
      ],
    };

    expect(toProductDetail(product).faq).toEqual([]);
  });
});
