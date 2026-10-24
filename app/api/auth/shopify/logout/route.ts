import { NextResponse } from 'next/server';
import {
  buildLogoutUrl,
  isShopifyCustomerAuthConfigured,
} from '@/app/lib/shopify-customer-auth';
import { clearShopifyCustomerSession } from '@/app/lib/shopify-customer-session';

export async function GET(request: Request) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3001';
  const { searchParams } = new URL(request.url);
  const returnTo = searchParams.get('return_to') ?? siteUrl;

  await clearShopifyCustomerSession();

  if (!isShopifyCustomerAuthConfigured()) {
    return NextResponse.redirect(returnTo);
  }

  return NextResponse.redirect(buildLogoutUrl({ returnTo }));
}
