import { FieldValue } from 'firebase-admin/firestore';
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/app/lib/api-auth';
import { getAdminFirestore } from '@/app/lib/firebase-admin';
import {
  FITNESS_GOAL_OPTIONS,
  type FitnessGoal,
  USERS_COLLECTION,
} from '@/app/lib/user-profile';

const VALID_GOALS = new Set<FitnessGoal>(FITNESS_GOAL_OPTIONS.map((option) => option.value));

function serializeProfile(uid: string, data: FirebaseFirestore.DocumentData) {
  return {
    uid,
    email: data.email ?? '',
    displayName: data.displayName ?? '',
    fitnessGoals: data.fitnessGoals ?? [],
    allergies: data.allergies ?? [],
    shopifyCustomerId: data.shopifyCustomerId ?? null,
    createdAt: data.createdAt?.toDate?.()?.toISOString?.() ?? null,
    updatedAt: data.updatedAt?.toDate?.()?.toISOString?.() ?? null,
  };
}

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

    if (!snapshot.exists) {
      return NextResponse.json(
        { error: { code: 'not_found', message: 'Profile not found.' } },
        { status: 404 },
      );
    }

    return NextResponse.json({
      profile: serializeProfile(auth.decoded.uid, snapshot.data()!),
    });
  } catch (error) {
    console.error('[Profile GET] Error:', error);
    return NextResponse.json(
      { error: { code: 'profile_read_failed', message: 'Failed to read profile.' } },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAuth(request);
  if ('error' in auth) {
    return auth.error;
  }

  const payload = (await request.json().catch(() => null)) as {
    displayName?: unknown;
    fitnessGoals?: unknown;
    allergies?: unknown;
  } | null;

  if (!payload) {
    return NextResponse.json(
      { error: { code: 'invalid_body', message: 'Invalid request body.' } },
      { status: 400 },
    );
  }

  const updates: Record<string, unknown> = {
    updatedAt: FieldValue.serverTimestamp(),
  };

  if (payload.displayName !== undefined) {
    if (typeof payload.displayName !== 'string' || payload.displayName.trim().length === 0) {
      return NextResponse.json(
        { error: { code: 'invalid_display_name', message: 'Display name is invalid.' } },
        { status: 400 },
      );
    }
    updates.displayName = payload.displayName.trim().slice(0, 80);
  }

  if (payload.fitnessGoals !== undefined) {
    if (!Array.isArray(payload.fitnessGoals)) {
      return NextResponse.json(
        { error: { code: 'invalid_fitness_goals', message: 'Fitness goals must be an array.' } },
        { status: 400 },
      );
    }

    const goals = payload.fitnessGoals.filter(
      (goal): goal is FitnessGoal =>
        typeof goal === 'string' && VALID_GOALS.has(goal as FitnessGoal),
    );

    updates.fitnessGoals = goals;
  }

  if (payload.allergies !== undefined) {
    if (!Array.isArray(payload.allergies)) {
      return NextResponse.json(
        { error: { code: 'invalid_allergies', message: 'Allergies must be an array.' } },
        { status: 400 },
      );
    }

    updates.allergies = payload.allergies
      .filter((item): item is string => typeof item === 'string')
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 20);
  }

  try {
    const docRef = getAdminFirestore().collection(USERS_COLLECTION).doc(auth.decoded.uid);
    await docRef.set(updates, { merge: true });
    const snapshot = await docRef.get();

    return NextResponse.json({
      profile: serializeProfile(auth.decoded.uid, snapshot.data()!),
    });
  } catch (error) {
    console.error('[Profile PATCH] Error:', error);
    return NextResponse.json(
      { error: { code: 'profile_update_failed', message: 'Failed to update profile.' } },
      { status: 500 },
    );
  }
}
