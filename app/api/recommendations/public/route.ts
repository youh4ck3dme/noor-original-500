import { NextResponse } from 'next/server';
import { getProducts } from '@/app/lib/shopify';
import { toStorefrontProductCard } from '@/app/lib/shopify-mappers';

export async function GET() {
  try {
    const products = await getProducts(3);
    return NextResponse.json({
      recommendations: products.map((product) => ({
        score: 0,
        matchedTags: [],
        product: toStorefrontProductCard(product),
      })),
    });
  } catch (error) {
    console.error('[Public recommendations] Error:', error);
    return NextResponse.json(
      {
        error: {
          code: 'recommendations_failed',
          message: 'Failed to load public recommendations.',
        },
      },
      { status: 500 },
    );
  }
}
