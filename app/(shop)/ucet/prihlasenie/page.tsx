import { Suspense } from 'react';
import { AuthForm } from '@/app/components/auth/AuthForm';
import { StorePageShell } from '@/app/components/layout/StorePageShell';

export default function LoginPage() {
  return (
    <StorePageShell className="pt-32 pb-24">
      <Suspense fallback={<div className="text-center text-gm-text-muted">Načítavame...</div>}>
        <AuthForm />
      </Suspense>
    </StorePageShell>
  );
}
