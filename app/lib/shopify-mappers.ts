import type {
  StorefrontImage,
  StorefrontLabTest,
  StorefrontProductCard,
  StorefrontProductDetail,
  StorefrontProductFaq,
} from './theme/storefront-types';
import type { ShopifyProductNode } from './shopify';

function toStorefrontImage(
  image: ShopifyProductNode['images']['edges'][number]['node'] | undefined,
  fallbackAlt: string,
): StorefrontImage | null {
  if (!image?.url) {
    return null;
  }

  return {
    url: image.url,
    altText: image.altText || fallbackAlt,
    width: image.width ?? 800,
    height: image.height ?? 800,
  };
}

function getMetafield(product: ShopifyProductNode, key: string) {
  return product.metafields?.filter(Boolean).find((field) => field?.key === key) ?? null;
}

function readMetaobjectField(
  fields: Array<{ key: string; value: string }> | undefined,
  key: string,
) {
  return fields?.find((field) => field.key === key)?.value?.trim() ?? '';
}

function parseRichText(value: string | null | undefined): string | null {
  if (!value?.trim()) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as {
      children?: Array<{ children?: Array<{ value?: string }> }>;
    };

    const text = parsed.children
      ?.flatMap((child) => child.children?.map((node) => node.value ?? '') ?? [])
      .join('')
      .trim();

    return text || value;
  } catch {
    return value;
  }
}

function parseLabTests(product: ShopifyProductNode): StorefrontLabTest[] {
  const field = getMetafield(product, 'lab_tests');
  if (!field?.references?.edges?.length) {
    return [];
  }

  return field.references.edges
    .map((edge) => {
      const fields = edge.node.fields ?? [];
      const title = readMetaobjectField(fields, 'title');
      const pdfUrl = readMetaobjectField(fields, 'pdf_url');
      if (!title && !pdfUrl) {
        return null;
      }

      return {
        title: title || 'Laboratórny test',
        labName: readMetaobjectField(fields, 'lab_name'),
        testDate: readMetaobjectField(fields, 'test_date'),
        pdfUrl,
      };
    })
    .filter((item): item is StorefrontLabTest => item !== null);
}

function parseFaq(product: ShopifyProductNode): StorefrontProductFaq[] {
  const field = getMetafield(product, 'product_faq');
  if (!field?.value) {
    return [];
  }

  try {
    const parsed = JSON.parse(field.value) as Array<{ question?: string; answer?: string }>;
    return parsed
      .map((item, index) => ({
        id: `faq-${index}`,
        title: item.question?.trim() ?? '',
        content: item.answer?.trim() ?? '',
      }))
      .filter((item) => item.title && item.content);
  } catch {
    return [];
  }
}

export function toStorefrontProductCard(product: ShopifyProductNode): StorefrontProductCard {
  const images = product.images.edges.map((edge) => edge.node);

  const firstVariant = product.variants?.edges[0]?.node;

  return {
    id: product.id,
    variantId: firstVariant?.id ?? product.id,
    handle: product.handle,
    title: product.title,
    availableForSale: product.availableForSale ?? true,
    priceRange: product.priceRange,
    featuredImage: toStorefrontImage(images[0], product.title),
    hoverImage: toStorefrontImage(images[1], `${product.title} alternate view`),
  };
}

export function toProductDetail(product: ShopifyProductNode): StorefrontProductDetail {
  const compositionField = getMetafield(product, 'composition');
  const dosageField = getMetafield(product, 'dosage');

  return {
    composition: parseRichText(compositionField?.value),
    dosage: parseRichText(dosageField?.value),
    labTests: parseLabTests(product),
    faq: parseFaq(product),
    tags: product.tags ?? [],
  };
}
