import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/app/lib/api-auth';
import { scoreProductsForGoals } from '@/app/lib/recommendations';
import { getProducts } from '@/app/lib/shopify';
import { toStorefrontProductCard } from '@/app/lib/shopify-mappers';
import { getAdminFirestore } from '@/app/lib/firebase-admin';
import { FITNESS_GOAL_OPTIONS, USERS_COLLECTION } from '@/app/lib/user-profile';

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if ('error' in auth) {
    return auth.error;
  }

  try {
    const snapshot = await getAdminFirestore()
      .collection(USERS_COLLECTION)
      .doc(auth.decoded.uid)
      .get();

    const fitnessGoals = snapshot.data()?.fitnessGoals ?? [];
    const products = await getProducts(50);
    const scored = scoreProductsForGoals(products, fitnessGoals, 3);

    return NextResponse.json({
      fitnessGoals,
      availableGoals: FITNESS_GOAL_OPTIONS,
      recommendations: scored.map((item) => ({
        score: item.score,
        matchedTags: item.matchedTags,
        product: toStorefrontProductCard(item.product),
      })),
    });
  } catch (error) {
    console.error('[Recommendations GET] Error:', error);
    return NextResponse.json(
      {
        error: {
          code: 'recommendations_failed',
          message: 'Failed to generate recommendations.',
        },
      },
      { status: 500 },
    );
  }
}
