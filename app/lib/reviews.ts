import { FieldValue } from 'firebase-admin/firestore';
import { getAdminFirestore } from './firebase-admin';

export const REVIEWS_COLLECTION = 'reviews';

export type ProductReview = {
  id: string;
  productHandle: string;
  uid: string;
  authorName: string;
  rating: number;
  title?: string;
  body: string;
  verified: boolean;
  createdAt: string | null;
};

export type ProductReviewSummary = {
  reviews: ProductReview[];
  averageRating: number;
  reviewCount: number;
};

function serializeReview(id: string, data: FirebaseFirestore.DocumentData): ProductReview {
  return {
    id,
    productHandle: data.productHandle ?? '',
    uid: data.uid ?? '',
    authorName: data.authorName ?? 'Zákazník',
    rating: data.rating ?? 0,
    title: data.title ?? undefined,
    body: data.body ?? '',
    verified: Boolean(data.verified),
    createdAt: data.createdAt?.toDate?.()?.toISOString?.() ?? null,
  };
}

export async function getProductReviewSummary(
  productHandle: string,
  limit = 20,
): Promise<ProductReviewSummary> {
  try {
    const snapshot = await getAdminFirestore()
      .collection(REVIEWS_COLLECTION)
      .where('productHandle', '==', productHandle)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();

    const reviews = snapshot.docs.map((doc) => serializeReview(doc.id, doc.data()));
    const reviewCount = reviews.length;
    const averageRating =
      reviewCount > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount
        : 0;

    return { reviews, averageRating, reviewCount };
  } catch {
    return { reviews: [], averageRating: 0, reviewCount: 0 };
  }
}

export async function upsertProductReview(input: {
  productHandle: string;
  uid: string;
  authorName: string;
  rating: number;
  title?: string;
  body: string;
  verified?: boolean;
}) {
  const existing = await getAdminFirestore()
    .collection(REVIEWS_COLLECTION)
    .where('productHandle', '==', input.productHandle)
    .where('uid', '==', input.uid)
    .limit(1)
    .get();

  const payload = {
    productHandle: input.productHandle,
    uid: input.uid,
    authorName: input.authorName,
    rating: input.rating,
    title: input.title ?? null,
    body: input.body,
    verified: input.verified ?? false,
    updatedAt: FieldValue.serverTimestamp(),
  };

  if (existing.empty) {
    const docRef = await getAdminFirestore().collection(REVIEWS_COLLECTION).add({
      ...payload,
      createdAt: FieldValue.serverTimestamp(),
    });
    const snapshot = await docRef.get();
    return serializeReview(docRef.id, snapshot.data()!);
  }

  const docRef = existing.docs[0]!.ref;
  await docRef.set(payload, { merge: true });
  const snapshot = await docRef.get();
  return serializeReview(docRef.id, snapshot.data()!);
}
