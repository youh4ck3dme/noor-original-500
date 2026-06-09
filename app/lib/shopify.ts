import { unstable_noStore as noStore } from 'next/cache';

function requireShopifyEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `Shopify environment variable ${name} is not set. Please check your .env file.`,
    );
  }
  return value;
}

const SHOPIFY_STOREFRONT_ACCESS_TOKEN = requireShopifyEnv(
  'SHOPIFY_STOREFRONT_ACCESS_TOKEN',
  process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN,
);
const SHOPIFY_API_ENDPOINT_URL = requireShopifyEnv(
  'SHOPIFY_API_ENDPOINT_URL',
  process.env.SHOPIFY_API_ENDPOINT_URL,
);

export async function shopifyFetch<T>(
  query: string,
  variables: Record<string, unknown> = {},
  tags: string[] = []
): Promise<T> {
  noStore(); // Opt-out of caching for all fetches by default

  try {
    const response = await fetch(SHOPIFY_API_ENDPOINT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_ACCESS_TOKEN,
      },
      body: JSON.stringify({ query, variables }),
      next: { tags }, // Add cache tags for revalidation
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Shopify API request failed: ${response.statusText}\n${errorBody}`);
    }

    const json = await response.json();
    if (json.errors) {
      console.error('Shopify GraphQL Errors:', json.errors);
      throw new Error('An error occurred while fetching data from Shopify.');
    }

    return json.data;
  } catch (error) {
    console.error('Fetch to Shopify failed:', error);
    throw error;
  }
}

// API Functions for data fetching

type ShopifyCollectionNode = {
  id: string;
  title: string;
  handle: string;
};

type ShopifyMoney = {
  amount: string;
  currencyCode: string;
};

type ShopifyImageNode = {
  url: string;
  altText: string | null;
  width?: number;
  height?: number;
};

export type ShopifyProductVariant = {
  id: string;
  title: string;
  availableForSale: boolean;
  price: ShopifyMoney;
  selectedOptions: Array<{ name: string; value: string }>;
};

type ShopifyMetafieldNode = {
  key: string;
  value: string;
  type: string;
  reference?: {
    type?: string;
    fields?: Array<{ key: string; value: string }>;
  } | null;
  references?: {
    edges: Array<{
      node: {
        type?: string;
        fields?: Array<{ key: string; value: string }>;
      };
    }>;
  } | null;
};

export type ShopifyProductNode = {
  id: string;
  title: string;
  handle: string;
  tags?: string[];
  availableForSale?: boolean;
  descriptionHtml?: string;
  priceRange: {
    minVariantPrice: ShopifyMoney;
    maxVariantPrice?: ShopifyMoney;
  };
  compareAtPriceRange?: {
    minVariantPrice: ShopifyMoney;
  };
  variants?: {
    edges: Array<{ node: ShopifyProductVariant }>;
  };
  images: {
    edges: Array<{ node: ShopifyImageNode }>;
  };
  metafields?: ShopifyMetafieldNode[];
};

export type ShopifyCollectionDetail = ShopifyCollectionNode & {
  description?: string;
  products: {
    edges: Array<{ node: ShopifyProductNode }>;
  };
};

type ProductsResponse = {
  products: {
    edges: Array<{ node: ShopifyProductNode }>;
  };
};

type CollectionsResponse = {
  collections: {
    edges: Array<{ node: ShopifyCollectionNode }>;
  };
};

type CollectionByHandleResponse = {
  collection: ShopifyCollectionDetail | null;
};

type SearchProductsResponse = {
  products: {
    edges: Array<{ node: ShopifyProductNode }>;
  };
};

type ProductByHandleResponse = {
  product: ShopifyProductNode | null;
};

const collectionsQuery = `
  query getCollections($first: Int!) {
    collections(first: $first) {
      edges {
        node {
          id
          title
          handle
        }
      }
    }
  }
`;

const productsQuery = `
  query getProducts($first: Int!) {
    products(first: $first) {
      edges {
        node {
          id
          title
          handle
          tags
          availableForSale
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          images(first: 2) {
            edges {
              node {
                url
                altText
                width
                height
              }
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
        }
      }
    }
  }
`;

export async function getProducts(first = 12) {
  const response = await shopifyFetch<ProductsResponse>(
    productsQuery,
    { first },
    ['products'],
  );
  return response.products.edges.map((edge) => edge.node);
}

export async function getCollections() {
  const response = await shopifyFetch<CollectionsResponse>(
    collectionsQuery,
    { first: 10 },
    ['collections']
  );
  return response.collections.edges.map((edge) => edge.node);
}

const collectionByHandleQuery = `
  query getCollectionByHandle($handle: String!, $first: Int!) {
    collection(handle: $handle) {
      id
      title
      handle
      description
      products(first: $first) {
        edges {
          node {
            id
            title
            handle
            availableForSale
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            images(first: 2) {
              edges {
                node {
                  url
                  altText
                  width
                  height
                }
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
          }
        }
      }
    }
  }
`;

export async function getCollectionByHandle(collectionHandle: string, first = 24) {
  const response = await shopifyFetch<CollectionByHandleResponse>(
    collectionByHandleQuery,
    { handle: collectionHandle, first },
    ['collections', `collection:${collectionHandle}`],
  );
  return response.collection;
}

export async function getProductsInCollection(collectionHandle: string, first = 24) {
  const collection = await getCollectionByHandle(collectionHandle, first);
  return collection?.products.edges.map((edge) => edge.node) ?? [];
}

const productByHandleQuery = `
  query getProductByHandle($handle: String!) {
    product(handle: $handle) {
      id
      title
      handle
      tags
      availableForSale
      descriptionHtml
      metafields(
        identifiers: [
          { namespace: "custom", key: "composition" }
          { namespace: "custom", key: "dosage" }
          { namespace: "custom", key: "lab_tests" }
          { namespace: "custom", key: "product_faq" }
        ]
      ) {
        key
        value
        type
        reference {
          ... on Metaobject {
            type
            fields {
              key
              value
            }
          }
        }
        references(first: 10) {
          edges {
            node {
              ... on Metaobject {
                type
                fields {
                  key
                  value
                }
              }
            }
          }
        }
      }
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
        maxVariantPrice {
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
      variants(first: 20) {
        edges {
          node {
            id
            title
            availableForSale
            price {
              amount
              currencyCode
            }
            selectedOptions {
              name
              value
            }
          }
        }
      }
      images(first: 10) {
        edges {
          node {
            url
            altText
          }
        }
      }
    }
  }
`;

const searchProductsQuery = `
  query searchProducts($query: String!, $first: Int!) {
    products(first: $first, query: $query) {
      edges {
        node {
          id
          title
          handle
          availableForSale
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
        }
      }
    }
  }
`;

export async function searchProducts(query: string, first = 8) {
  const response = await shopifyFetch<SearchProductsResponse>(
    searchProductsQuery,
    { query, first },
    ['products', 'search'],
  );
  return response.products.edges.map((edge) => edge.node);
}

export async function getProductByHandle(handle: string) {
  const response = await shopifyFetch<ProductByHandleResponse>(
    productByHandleQuery,
    { handle },
    ['products', `product:${handle}`]
  );
  return response.product;
}
