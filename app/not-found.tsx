import Link from 'next/link';
import { Button } from '@/app/components/ds/Button';
import { EmptyState } from '@/app/components/ds/EmptyState';
import { StorePageShell } from '@/app/components/layout/StorePageShell';

export default function NotFound() {
  return (
    <StorePageShell>
      <EmptyState
        title="Stránka nenájdená"
        description="Ospravedlňujeme sa, požadovaná stránka neexistuje."
        action={
          <Link href="/">
            <Button>Späť na domov</Button>
          </Link>
        }
      />
    </StorePageShell>
  );
}
