import { NextResponse } from 'next/server';
import { getShopifyCustomerSession } from '@/app/lib/shopify-customer-session';

export async function GET() {
  const session = await getShopifyCustomerSession();

  if (!session) {
    return NextResponse.json({ connected: false });
  }

  return NextResponse.json({
    connected: true,
    customerId: session.customerId,
    expiresAt: session.expiresAt,
  });
}
