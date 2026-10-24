import { NextResponse } from 'next/server';
import {
  buildAuthorizationUrl,
  generateCodeChallenge,
  generateCodeVerifier,
  generateOAuthState,
  isShopifyCustomerAuthConfigured,
} from '@/app/lib/shopify-customer-auth';
import { setOAuthPending } from '@/app/lib/shopify-customer-session';

function getSafeNextPath(next: string | null): string {
  if (!next || !next.startsWith('/') || next.startsWith('//')) {
    return '/ucet';
  }
  return next;
}

export async function GET(request: Request) {
  if (!isShopifyCustomerAuthConfigured()) {
    return NextResponse.json(
      { error: 'Shopify Customer Account API is not configured.' },
      { status: 503 },
    );
  }

  const { searchParams } = new URL(request.url);
  const nextPath = getSafeNextPath(searchParams.get('next'));
  const verifier = generateCodeVerifier();
  const challenge = generateCodeChallenge(verifier);
  const state = generateOAuthState();

  await setOAuthPending({ state, verifier, nextPath });

  const authorizeUrl = buildAuthorizationUrl({
    state,
    codeChallenge: challenge,
    locale: searchParams.get('locale') ?? 'sk',
  });

  return NextResponse.redirect(authorizeUrl);
}
