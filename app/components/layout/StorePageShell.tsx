import React from 'react';
import { SiteFooter } from './SiteFooter';
import { SiteHeader } from './SiteHeader';
import { getCollections } from '@/app/lib/shopify';

export async function StorePageShell({
  children,
  className = 'pt-32 pb-24',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const collections = await getCollections();

  return (
    <main className="min-h-screen bg-gm-bg">
      <SiteHeader collections={collections} />
      <div className={className}>
        <div className="gm-container">{children}</div>
      </div>
      <SiteFooter />
    </main>
  );
}
