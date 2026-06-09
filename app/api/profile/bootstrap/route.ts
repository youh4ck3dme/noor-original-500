import { FieldValue } from 'firebase-admin/firestore';
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/app/lib/api-auth';
import { getAdminFirestore } from '@/app/lib/firebase-admin';
import { createDefaultProfile, USERS_COLLECTION } from '@/app/lib/user-profile';

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if ('error' in auth) {
    return auth.error;
  }

  const { uid, email, name } = auth.decoded;
  if (!email) {
    return NextResponse.json(
      { error: { code: 'invalid_user', message: 'User email is required.' } },
      { status: 400 },
    );
  }

  try {
    const docRef = getAdminFirestore().collection(USERS_COLLECTION).doc(uid);
    const snapshot = await docRef.get();

    if (snapshot.exists) {
      const data = snapshot.data()!;
      return NextResponse.json({
        profile: {
          uid,
          email: data.email ?? email,
          displayName: data.displayName ?? name ?? email.split('@')[0],
          fitnessGoals: data.fitnessGoals ?? [],
          allergies: data.allergies ?? [],
          shopifyCustomerId: data.shopifyCustomerId ?? null,
          createdAt: data.createdAt?.toDate?.()?.toISOString?.() ?? null,
          updatedAt: data.updatedAt?.toDate?.()?.toISOString?.() ?? null,
        },
        created: false,
      });
    }

    const profile = createDefaultProfile({
      uid,
      email,
      displayName: name,
    });

    await docRef.set({
      ...profile,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ profile, created: true });
  } catch (error) {
    console.error('[Profile bootstrap] Error:', error);
    return NextResponse.json(
      { error: { code: 'bootstrap_failed', message: 'Failed to bootstrap user profile.' } },
      { status: 500 },
    );
  }
}
