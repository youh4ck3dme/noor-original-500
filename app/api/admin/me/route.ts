import { NextResponse } from 'next/server';
import { requireAdmin } from '@/app/lib/api-auth';

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (auth.error) {
    return auth.error;
  }

  return NextResponse.json({
    email: auth.decoded.email,
    uid: auth.decoded.uid,
  });
}
