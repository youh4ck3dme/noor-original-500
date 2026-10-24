'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/app/components/ds/Button';
import { GlassPanel } from '@/app/components/ds/GlassPanel';
import { Input } from '@/app/components/ds/Input';
import { Tabs } from '@/app/components/ds/Tabs';
import { useAuth } from '@/app/components/providers/AuthProvider';

function getSafeNextPath(next: string | null): string {
  if (!next || !next.startsWith('/') || next.startsWith('//')) {
    return '/ucet';
  }
  return next;
}

export function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = getSafeNextPath(searchParams.get('next'));
  const { signIn, signUp, signInGoogle } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      if (mode === 'login') {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
      router.push(nextPath);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Prihlásenie zlyhalo. Skúste to znova.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    setSubmitting(true);

    try {
      await signInGoogle();
      router.push(nextPath);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Google prihlásenie zlyhalo.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const form = (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Input
        label="E-mail"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        required
      />
      <Input
        label="Heslo"
        type="password"
        autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        required
        minLength={6}
        hint="Minimálne 6 znakov"
      />
      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      <Button type="submit" fullWidth disabled={submitting}>
        {submitting
          ? 'Pracujeme...'
          : mode === 'login'
            ? 'Prihlásiť sa'
            : 'Vytvoriť účet'}
      </Button>
      <div className="relative py-2">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gm-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white/70 px-3 text-gm-text-muted">alebo</span>
        </div>
      </div>
      <Button
        type="button"
        variant="outline"
        fullWidth
        disabled={submitting}
        onClick={handleGoogle}
      >
        Pokračovať cez Google
      </Button>
      <Button
        type="button"
        variant="outline"
        fullWidth
        disabled={submitting}
        onClick={() => {
          const params = new URLSearchParams({ next: nextPath });
          window.location.href = `/api/auth/shopify/login?${params.toString()}`;
        }}
      >
        Prihlásiť cez Shopify účet
      </Button>
    </form>
  );

  return (
    <GlassPanel intensity="light" className="p-8 md:p-10 max-w-lg mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-heading text-gm-text mb-2">Môj účet</h1>
        <p className="text-gm-text-muted">
          Prihláste sa a uložte si fitness ciele pre personalizované odporúčania.
        </p>
      </div>
      <Tabs
        value={mode}
        onChange={(id) => setMode(id as 'login' | 'register')}
        items={[
          { id: 'login', label: 'Prihlásenie', content: form },
          { id: 'register', label: 'Registrácia', content: form },
        ]}
      />
    </GlassPanel>
  );
}
