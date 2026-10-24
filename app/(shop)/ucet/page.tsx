import { ProfilePageClient } from '@/app/components/account/ProfilePageClient';
import { StorePageShell } from '@/app/components/layout/StorePageShell';

export default function AccountPage() {
  return (
    <StorePageShell className="pt-32 pb-24">
      <ProfilePageClient />
    </StorePageShell>
  );
}
