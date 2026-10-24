import { NextResponse } from 'next/server';
import {
  exchangeAuthorizationCode,
  fetchCustomerProfile,
  isShopifyCustomerAuthConfigured,
} from '@/app/lib/shopify-customer-auth';
import {
  consumeOAuthPending,
  setShopifyCustomerSession,
} from '@/app/lib/shopify-customer-session';

export async function GET(request: Request) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3001';
  const loginUrl = new URL('/ucet/prihlasenie', siteUrl);

  if (!isShopifyCustomerAuthConfigured()) {
    loginUrl.searchParams.set('error', 'shopify_not_configured');
    return NextResponse.redirect(loginUrl);
  }

  const { searchParams } = new URL(request.url);
  const error = searchParams.get('error');
  if (error) {
    loginUrl.searchParams.set('error', error);
    return NextResponse.redirect(loginUrl);
  }

  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const pending = await consumeOAuthPending();

  if (!code || !state || !pending || pending.state !== state) {
    loginUrl.searchParams.set('error', 'invalid_oauth_state');
    return NextResponse.redirect(loginUrl);
  }

  try {
    const tokens = await exchangeAuthorizationCode(code, pending.verifier);
    const profile = await fetchCustomerProfile(tokens.access_token);

    await setShopifyCustomerSession({
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token ?? null,
      customerId: profile?.id ?? null,
      expiresIn: tokens.expires_in ?? null,
    });

    const redirectUrl = new URL(pending.nextPath, siteUrl);
    redirectUrl.searchParams.set('shopify', 'connected');
    return NextResponse.redirect(redirectUrl);
  } catch (callbackError) {
    console.error('[Shopify OAuth callback]', callbackError);
    loginUrl.searchParams.set('error', 'shopify_oauth_failed');
    return NextResponse.redirect(loginUrl);
  }
}
