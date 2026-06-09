'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/app/components/providers/AuthProvider';

type GateState = 'loading' | 'allowed' | 'forbidden';

export function AdminAuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, idToken, refreshToken } = useAuth();
  const [state, setState] = useState<GateState>('loading');

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!user) {
      const next = encodeURIComponent(pathname || '/admin');
      router.replace(`/ucet/prihlasenie?next=${next}`);
      return;
    }

    let active = true;

    (async () => {
      try {
        const token = idToken ?? (await refreshToken());
        if (!token) {
          if (!active) return;
          const next = encodeURIComponent(pathname || '/admin');
          router.replace(`/ucet/prihlasenie?next=${next}`);
          return;
        }

        const response = await fetch('/api/admin/me', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!active) return;

        if (response.status === 403) {
          setState('forbidden');
          return;
        }

        if (!response.ok) {
          const next = encodeURIComponent(pathname || '/admin');
          router.replace(`/ucet/prihlasenie?next=${next}`);
          return;
        }

        setState('allowed');
      } catch {
        if (active) {
          setState('forbidden');
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [loading, user, idToken, refreshToken, router, pathname]);

  if (loading || state === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center text-gm-text-muted">
        Overujeme prístup do administrácie...
      </div>
    );
  }

  if (state === 'forbidden') {
    return (
      <div className="flex h-screen items-center justify-center p-8">
        <div className="max-w-md text-center space-y-4">
          <h1 className="text-2xl font-heading text-gm-text">Prístup zamietnutý</h1>
          <p className="text-gm-text-muted">
            Váš účet nemá oprávnenie pre admin panel. Kontaktujte správcu obchodu.
          </p>
          <Link href="/" className="text-gm-primary hover:underline">
            Späť do obchodu
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
