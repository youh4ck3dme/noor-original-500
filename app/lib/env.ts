export function getRevalidationSecret(): string {
  const secret = process.env.SHOPIFY_REVALIDATION_SECRET;
  if (!secret) {
    throw new Error('SHOPIFY_REVALIDATION_SECRET environment variable is not set.');
  }
  return secret;
}
