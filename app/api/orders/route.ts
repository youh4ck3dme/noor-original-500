import { NextResponse } from 'next/server';
import { requireAuth } from '@/app/lib/api-auth';
import { getAdminFirestore } from '@/app/lib/firebase-admin';
import { fetchCustomerAccountOrders } from '@/app/lib/shopify-customer-auth';
import { getCustomerOrders } from '@/app/lib/shopify-customers';
import { isShopifyAdminConfigured } from '@/app/lib/shopify-admin';
import { getShopifyCustomerSession } from '@/app/lib/shopify-customer-session';
import { USERS_COLLECTION } from '@/app/lib/user-profile';

export async function GET(request: Request) {
  const auth = await requireAuth(request);
  if (auth.error) {
    return auth.error;
  }

  try {
    const shopifySession = await getShopifyCustomerSession();
    if (shopifySession?.accessToken) {
      const orders = await fetchCustomerAccountOrders(shopifySession.accessToken);
      return NextResponse.json({
        linked: true,
        source: 'customer_account_oauth',
        shopifyCustomerId: shopifySession.customerId,
        orders,
      });
    }

    const snapshot = await getAdminFirestore()
      .collection(USERS_COLLECTION)
      .doc(auth.decoded.uid)
      .get();

    if (!snapshot.exists) {
      return NextResponse.json({ linked: false, orders: [] });
    }

    const shopifyCustomerId = snapshot.data()?.shopifyCustomerId as string | null | undefined;

    if (!shopifyCustomerId) {
      return NextResponse.json({ linked: false, orders: [] });
    }

    if (!isShopifyAdminConfigured()) {
      return NextResponse.json(
        { error: { code: 'shopify_admin_missing', message: 'Shopify Admin API is not configured.' } },
        { status: 503 },
      );
    }

    const orders = await getCustomerOrders(shopifyCustomerId);

    return NextResponse.json({
      linked: true,
      source: 'admin_api',
      shopifyCustomerId,
      orders,
    });
  } catch (error) {
    console.error('[Orders] Error:', error);
    return NextResponse.json(
      { error: { code: 'orders_failed', message: 'Failed to fetch orders.' } },
      { status: 500 },
    );
  }
}
