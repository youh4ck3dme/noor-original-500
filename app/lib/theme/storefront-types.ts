export interface StorefrontImage {
  url: string;
  altText: string;
  width: number;
  height: number;
}

export interface StorefrontMoney {
  amount: string;
  currencyCode: string;
}

export interface StorefrontProductCard {
  id: string;
  variantId: string;
  handle: string;
  title: string;
  featuredImage: StorefrontImage | null;
  hoverImage?: StorefrontImage | null;
  priceRange: {
    minVariantPrice: StorefrontMoney;
  };
  availableForSale: boolean;
  badge?: string;
}

export interface StorefrontNavItem {
  title: string;
  href: string;
  items?: StorefrontNavItem[];
  image?: StorefrontImage | null;
}
