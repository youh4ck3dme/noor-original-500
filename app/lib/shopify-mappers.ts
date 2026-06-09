import type { StorefrontImage, StorefrontProductCard } from './theme/storefront-types';
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
