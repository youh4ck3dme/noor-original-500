import { FieldValue } from 'firebase-admin/firestore';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/app/lib/api-auth';
import { getAdminFirestore } from '@/app/lib/firebase-admin';
import { findShopifyCustomerByEmail } from '@/app/lib/shopify-customers';
import { isShopifyAdminConfigured } from '@/app/lib/shopify-admin';
import { fetchCustomerProfile } from '@/app/lib/shopify-customer-auth';
import { getShopifyCustomerSession } from '@/app/lib/shopify-customer-session';
import { USERS_COLLECTION } from '@/app/lib/user-profile';

export async function POST(request: Request) {
  const auth = await requireAuth(request);
  if (auth.error) {
    return auth.error;
  }

  const email = auth.decoded.email;
  if (!email) {
    return NextResponse.json(
      { error: { code: 'invalid_user', message: 'User email is required.' } },
      { status: 400 },
    );
  }

  try {
    const docRef = getAdminFirestore().collection(USERS_COLLECTION).doc(auth.decoded.uid);
    const snapshot = await docRef.get();

    if (!snapshot.exists) {
      return NextResponse.json(
        { error: { code: 'profile_missing', message: 'User profile not found.' } },
        { status: 404 },
      );
    }

    let shopifyCustomerId: string | null = null;
    let source: 'customer_account_oauth' | 'admin_email_lookup' | null = null;

    const shopifySession = await getShopifyCustomerSession();
    if (shopifySession?.accessToken) {
      const profile = shopifySession.customerId
        ? { id: shopifySession.customerId, email }
        : await fetchCustomerProfile(shopifySession.accessToken);
      shopifyCustomerId = profile?.id ?? null;
      if (shopifyCustomerId) {
        source = 'customer_account_oauth';
      }
    }

    if (!shopifyCustomerId && isShopifyAdminConfigured()) {
      shopifyCustomerId = await findShopifyCustomerByEmail(email);
      if (shopifyCustomerId) {
        source = 'admin_email_lookup';
      }
    }

    await docRef.update({
      shopifyCustomerId,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      linked: Boolean(shopifyCustomerId),
      shopifyCustomerId,
      source,
    });
  } catch (error) {
    console.error('[Link Shopify] Error:', error);
    return NextResponse.json(
      { error: { code: 'link_failed', message: 'Failed to link Shopify customer.' } },
      { status: 500 },
    );
  }
}
