import { unstable_noStore as noStore } from 'next/cache';

function requireShopifyEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Shopify environment variable ${name} is not set.`);
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

export type CartLine = {
  id: string;
  quantity: number;
  merchandiseId: string;
  title: string;
  variant?: string;
  image?: string;
  price: number;
  currency: string;
};

export type ShopifyCart = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  lines: CartLine[];
};

type CartNode = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  lines: {
    edges: Array<{
      node: {
        id: string;
        quantity: number;
        merchandise: {
          id: string;
          title: string;
          price: { amount: string; currencyCode: string };
          product: { title: string };
          image?: { url: string } | null;
        };
      };
    }>;
  };
};

const cartFields = `
  id
  checkoutUrl
  totalQuantity
  lines(first: 50) {
    edges {
      node {
        id
        quantity
        merchandise {
          ... on ProductVariant {
            id
            title
            price { amount currencyCode }
            image { url }
            product { title }
          }
        }
      }
    }
  }
`;

function mapCart(cart: CartNode): ShopifyCart {
  return {
    id: cart.id,
    checkoutUrl: cart.checkoutUrl,
    totalQuantity: cart.totalQuantity,
    lines: cart.lines.edges.map(({ node }) => ({
      id: node.id,
      quantity: node.quantity,
      merchandiseId: node.merchandise.id,
      title: node.merchandise.product.title,
      variant: node.merchandise.title !== 'Default Title' ? node.merchandise.title : undefined,
      image: node.merchandise.image?.url,
      price: parseFloat(node.merchandise.price.amount),
      currency: node.merchandise.price.currencyCode,
    })),
  };
}

async function cartFetch<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  noStore();
  const response = await fetch(SHOPIFY_API_ENDPOINT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Connection: 'close',
      'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_ACCESS_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });

  const json = await response.json();
  if (!response.ok || json.errors) {
    throw new Error(json.errors?.[0]?.message ?? 'Cart request failed');
  }
  return json.data;
}

export async function createCart() {
  const data = await cartFetch<{ cartCreate: { cart: CartNode } }>(`
    mutation { cartCreate { cart { ${cartFields} } } }
  `);
  return mapCart(data.cartCreate.cart);
}

export async function getCart(cartId: string) {
  const data = await cartFetch<{ cart: CartNode | null }>(`
    query($id: ID!) { cart(id: $id) { ${cartFields} } }
  `, { id: cartId });
  return data.cart ? mapCart(data.cart) : null;
}

export async function addToCart(cartId: string, merchandiseId: string, quantity: number) {
  const data = await cartFetch<{ cartLinesAdd: { cart: CartNode } }>(`
    mutation($cartId: ID!, $lines: [CartLineInput!]!) {
      cartLinesAdd(cartId: $cartId, lines: $lines) { cart { ${cartFields} } }
    }
  `, { cartId, lines: [{ merchandiseId, quantity }] });
  return mapCart(data.cartLinesAdd.cart);
}

export async function updateCartLine(cartId: string, lineId: string, quantity: number) {
  const data = await cartFetch<{ cartLinesUpdate: { cart: CartNode } }>(`
    mutation($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
      cartLinesUpdate(cartId: $cartId, lines: $lines) { cart { ${cartFields} } }
    }
  `, { cartId, lines: [{ id: lineId, quantity }] });
  return mapCart(data.cartLinesUpdate.cart);
}

export async function removeCartLine(cartId: string, lineId: string) {
  const data = await cartFetch<{ cartLinesRemove: { cart: CartNode } }>(`
    mutation($cartId: ID!, $lineIds: [ID!]!) {
      cartLinesRemove(cartId: $cartId, lineIds: $lineIds) { cart { ${cartFields} } }
    }
  `, { cartId, lineIds: [lineId] });
  return mapCart(data.cartLinesRemove.cart);
}
