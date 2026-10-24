import { shopifyAdminFetch } from './shopify-admin';

export type ShopifyOrderSummary = {
  id: string;
  name: string;
  processedAt: string | null;
  financialStatus: string;
  fulfillmentStatus: string;
  totalAmount: string;
  currencyCode: string;
  lineItems: Array<{ title: string; quantity: number }>;
};

const customerByEmailQuery = `
  query customersByEmail($query: String!) {
    customers(first: 1, query: $query) {
      edges {
        node {
          id
          email
        }
      }
    }
  }
`;

const customerOrdersQuery = `
  query customerOrders($customerId: ID!) {
    customer(id: $customerId) {
      orders(first: 20, sortKey: PROCESSED_AT, reverse: true) {
        edges {
          node {
            id
            name
            processedAt
            displayFinancialStatus
            displayFulfillmentStatus
            totalPriceSet {
              shopMoney {
                amount
                currencyCode
              }
            }
            lineItems(first: 5) {
              edges {
                node {
                  title
                  quantity
                }
              }
            }
          }
        }
      }
    }
  }
`;

export async function findShopifyCustomerByEmail(email: string): Promise<string | null> {
  const response = await shopifyAdminFetch<{
    customers: { edges: Array<{ node: { id: string; email: string } }> };
  }>(customerByEmailQuery, { query: `email:${email}` });

  return response.customers.edges[0]?.node?.id ?? null;
}

export async function getCustomerOrders(customerId: string): Promise<ShopifyOrderSummary[]> {
  const response = await shopifyAdminFetch<{
    customer: {
      orders: {
        edges: Array<{
          node: {
            id: string;
            name: string;
            processedAt: string | null;
            displayFinancialStatus: string;
            displayFulfillmentStatus: string;
            totalPriceSet: { shopMoney: { amount: string; currencyCode: string } };
            lineItems: { edges: Array<{ node: { title: string; quantity: number } }> };
          };
        }>;
      };
    } | null;
  }>(customerOrdersQuery, { customerId });

  return (
    response.customer?.orders.edges.map((edge) => ({
      id: edge.node.id,
      name: edge.node.name,
      processedAt: edge.node.processedAt,
      financialStatus: edge.node.displayFinancialStatus,
      fulfillmentStatus: edge.node.displayFulfillmentStatus,
      totalAmount: edge.node.totalPriceSet.shopMoney.amount,
      currencyCode: edge.node.totalPriceSet.shopMoney.currencyCode,
      lineItems: edge.node.lineItems.edges.map((item) => item.node),
    })) ?? []
  );
}
