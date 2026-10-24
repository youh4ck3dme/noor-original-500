import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/app/lib/api-auth';
import { getAdminFirestore } from '@/app/lib/firebase-admin';
import { getProductReviewSummary, upsertProductReview } from '@/app/lib/reviews';
import { USERS_COLLECTION } from '@/app/lib/user-profile';

const MAX_BODY_LENGTH = 2000;
const MAX_TITLE_LENGTH = 120;

export async function GET(request: NextRequest) {
  const handle = request.nextUrl.searchParams.get('handle')?.trim();
  if (!handle) {
    return NextResponse.json(
      { error: { code: 'invalid_handle', message: 'Product handle is required.' } },
      { status: 400 },
    );
  }

  try {
    const summary = await getProductReviewSummary(handle);
    return NextResponse.json(summary);
  } catch (error) {
    console.error('[Reviews GET] Error:', error);
    return NextResponse.json(
      { error: { code: 'reviews_read_failed', message: 'Failed to read reviews.' } },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if ('error' in auth) {
    return auth.error;
  }

  const payload = (await request.json().catch(() => null)) as {
    productHandle?: unknown;
    rating?: unknown;
    title?: unknown;
    body?: unknown;
  } | null;

  if (
    !payload ||
    typeof payload.productHandle !== 'string' ||
    typeof payload.rating !== 'number' ||
    typeof payload.body !== 'string'
  ) {
    return NextResponse.json(
      { error: { code: 'invalid_body', message: 'Invalid review payload.' } },
      { status: 400 },
    );
  }

  const productHandle = payload.productHandle.trim();
  const rating = Math.round(payload.rating);
  const body = payload.body.trim();
  const title =
    typeof payload.title === 'string' ? payload.title.trim().slice(0, MAX_TITLE_LENGTH) : undefined;

  if (!productHandle || rating < 1 || rating > 5 || body.length === 0 || body.length > MAX_BODY_LENGTH) {
    return NextResponse.json(
      { error: { code: 'invalid_review', message: 'Review data is invalid.' } },
      { status: 400 },
    );
  }

  try {
    const userSnapshot = await getAdminFirestore()
      .collection(USERS_COLLECTION)
      .doc(auth.decoded.uid)
      .get();

    const userData = userSnapshot.data();
    const authorName =
      userData?.displayName?.trim() ||
      auth.decoded.name?.trim() ||
      auth.decoded.email?.split('@')[0] ||
      'Zákazník';

    const review = await upsertProductReview({
      productHandle,
      uid: auth.decoded.uid,
      authorName,
      rating,
      title,
      body,
      verified: Boolean(userData?.shopifyCustomerId),
    });

    const summary = await getProductReviewSummary(productHandle);
    return NextResponse.json({ review, ...summary });
  } catch (error) {
    console.error('[Reviews POST] Error:', error);
    return NextResponse.json(
      { error: { code: 'review_create_failed', message: 'Failed to save review.' } },
      { status: 500 },
    );
  }
}
