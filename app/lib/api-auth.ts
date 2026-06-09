import { NextResponse } from 'next/server';
import { getBearerToken, verifyIdToken } from './firebase-admin-auth';

export function getAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export async function requireAuth(request: Request) {
  const token = getBearerToken(request);
  if (!token) {
    return {
      error: NextResponse.json(
        { error: { code: 'unauthorized', message: 'Missing auth token.' } },
        { status: 401 },
      ),
    };
  }

  try {
    const decoded = await verifyIdToken(token);
    return { decoded };
  } catch {
    return {
      error: NextResponse.json(
        { error: { code: 'unauthorized', message: 'Invalid auth token.' } },
        { status: 401 },
      ),
    };
  }
}

export async function requireAdmin(request: Request) {
  const auth = await requireAuth(request);
  if (auth.error) {
    return auth;
  }

  const allowed = getAdminEmails();
  const email = auth.decoded.email?.toLowerCase() ?? '';

  if (allowed.length === 0 || !allowed.includes(email)) {
    return {
      error: NextResponse.json(
        { error: { code: 'forbidden', message: 'Admin access required.' } },
        { status: 403 },
      ),
    };
  }

  return auth;
}
