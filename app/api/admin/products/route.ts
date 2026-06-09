import { NextResponse } from 'next/server';
import { requireAdmin } from '@/app/lib/api-auth';
import { shopifyFetch } from '@/app/lib/shopify';

type ProductStatus = 'Aktívne' | 'Návrh' | 'Archivované';

interface ProductImageNode {
  url: string;
  altText: string | null;
  width?: number;
  height?: number;
}

interface ProductVariant {
  id: string;
  availableForSale: boolean;
}

interface AdminProduct {
  id: string;
  title: string;
  handle: string;
  availableForSale?: boolean;
  descriptionHtml?: string;
  priceRange: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
  compareAtPriceRange?: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
  variants?: {
    edges: Array<{ node: ProductVariant }>;
  };
  images: {
    edges: Array<{ node: ProductImageNode }>;
  };
  metafields?: Array<{ key: string; value: string }>;
  status: ProductStatus;
  variantId: string;
}

type RawAdminProductNode = Omit<AdminProduct, 'status' | 'variantId'>;

const productsQuery = `
  query getAdminProducts($first: Int!) {
    products(first: $first) {
      edges {
        node {
          id
          title
          handle
          availableForSale
          descriptionHtml
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          compareAtPriceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          variants(first: 1) {
            edges {
              node {
                id
                availableForSale
              }
            }
          }
          images(first: 1) {
            edges {
              node {
                url
                altText
                width
                height
              }
            }
          }
          metafields(identifiers: [{ namespace: "custom", key: "status" }]) {
            key
            value
          }
        }
      }
    }
  }
`;

function getProductStatus(
  metafields: Array<{ key: string; value: string }> | null | undefined,
  availableForSale: boolean | undefined
): ProductStatus {
  const statusMetafield = metafields?.find((field) => field?.key === 'status');

  if (statusMetafield?.value === 'Návrh') return 'Návrh';
  if (statusMetafield?.value === 'Archivované') return 'Archivované';

  return availableForSale ? 'Aktívne' : 'Archivované';
}

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (auth.error) {
    return auth.error;
  }

  try {
    const first = 50;
    const response = await shopifyFetch<{ products: { edges: Array<{ node: RawAdminProductNode }> } }>(
      productsQuery,
      { first },
      ['admin-products']
    );

    const adminProducts: AdminProduct[] = response.products.edges.map((edge) => {
      const node = edge.node;
      const variantId = node.variants?.edges?.[0]?.node?.id || '';
      return {
        id: node.id,
        title: node.title,
        handle: node.handle,
        availableForSale: node.availableForSale,
        descriptionHtml: node.descriptionHtml,
        priceRange: node.priceRange,
        compareAtPriceRange: node.compareAtPriceRange,
        variants: node.variants,
        images: node.images,
        metafields: node.metafields,
        status: getProductStatus(node.metafields, node.availableForSale),
        variantId,
      };
    });

    return NextResponse.json(adminProducts);
  } catch (error) {
    console.error('Failed to fetch admin products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
