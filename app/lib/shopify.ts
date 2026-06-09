import { unstable_noStore as noStore } from 'next/cache';

const SHOPIFY_STOREFRONT_ACCESS_TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
const SHOPIFY_API_ENDPOINT_URL = process.env.SHOPIFY_API_ENDPOINT_URL;

if (!SHOPIFY_STOREFRONT_ACCESS_TOKEN || !SHOPIFY_API_ENDPOINT_URL) {
  throw new Error(
    'Shopify environment variables are not set. Please check your .env file.'
  );
}

async function shopifyFetch<T>(
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

export async function getCollections() {
  const response = await shopifyFetch<{ collections: { edges: { node: any }[] } }>(
    collectionsQuery,
    { first: 10 },
    ['collections']
  );
  return response.collections.edges.map((edge) => edge.node);
}

const productsInCollectionQuery = `
  query getProductsInCollection($handle: String!, $first: Int!) {
    collection(handle: $handle) {
      products(first: $first) {
        edges {
          node {
            id
            title
            handle
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            images(first: 1) {
              edges {
                node {
                  url
                  altText
                }
              }
            }
          }
        }
      }
    }
  }
`;

export async function getProductsInCollection(collectionHandle: string) {
  const response = await shopifyFetch<any>(
    productsInCollectionQuery,
    { handle: collectionHandle, first: 20 },
    ['collections', `collection:${collectionHandle}`]
  );
  return response.collection.products.edges.map((edge: any) => edge.node);
}

const productByHandleQuery = `
  query getProductByHandle($handle: String!) {
    product(handle: $handle) {
      id
      title
      descriptionHtml
      priceRange {
        minVariantPrice {
          amount
          currencyCode
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

export async function getProductByHandle(handle: string) {
  const response = await shopifyFetch<any>(
    productByHandleQuery,
    { handle },
    ['products', `product:${handle}`]
  );
  return response.product;
}
