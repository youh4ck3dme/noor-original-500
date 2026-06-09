import { beforeEach, describe, expect, it } from 'vitest';
import {
  buildAuthorizationUrl,
  generateCodeChallenge,
  generateCodeVerifier,
} from './shopify-customer-auth';

describe('shopify-customer-auth', () => {
  beforeEach(() => {
    process.env.SHOPIFY_CUSTOMER_ACCOUNT_SHOP_ID = '104292483406';
    process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID = 'test-client-id';
    process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_SECRET = 'test-client-secret';
    process.env.SHOPIFY_CUSTOMER_ACCOUNT_AUTHORIZE_URL =
      'https://shopify.com/authentication/104292483406/oauth/authorize';
    process.env.SHOPIFY_CUSTOMER_ACCOUNT_TOKEN_URL =
      'https://shopify.com/authentication/104292483406/oauth/token';
    process.env.SHOPIFY_CUSTOMER_ACCOUNT_REDIRECT_URI =
      'http://localhost:3001/api/auth/shopify/callback';
  });

  it('builds authorization URL with PKCE params', () => {
    const verifier = generateCodeVerifier();
    const challenge = generateCodeChallenge(verifier);
    const url = new URL(
      buildAuthorizationUrl({ state: 'state-123', codeChallenge: challenge }),
    );

    expect(url.origin + url.pathname).toBe(
      'https://shopify.com/authentication/104292483406/oauth/authorize',
    );
    expect(url.searchParams.get('client_id')).toBe('test-client-id');
    expect(url.searchParams.get('response_type')).toBe('code');
    expect(url.searchParams.get('code_challenge_method')).toBe('S256');
    expect(url.searchParams.get('scope')).toContain('customer-account-api:full');
  });
});
