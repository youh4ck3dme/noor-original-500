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

export interface StorefrontLabTest {
  title: string;
  labName: string;
  testDate: string;
  pdfUrl: string;
}

export interface StorefrontProductFaq {
  id: string;
  title: string;
  content: string;
}

export interface StorefrontProductDetail {
  composition: string | null;
  dosage: string | null;
  labTests: StorefrontLabTest[];
  faq: StorefrontProductFaq[];
  tags: string[];
}
