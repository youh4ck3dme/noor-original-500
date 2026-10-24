import { getAuth } from 'firebase-admin/auth';
import { getAdminApp } from './firebase-admin';

export async function verifyIdToken(idToken: string) {
  return getAuth(getAdminApp()).verifyIdToken(idToken);
}

export function getBearerToken(request: Request): string | null {
  const header = request.headers.get('authorization');
  if (!header?.startsWith('Bearer ')) {
    return null;
  }
  const token = header.slice(7).trim();
  return token.length > 0 ? token : null;
}
