import { notFound } from 'next/navigation';
import { CollectionPageClient } from '@/app/components/commerce/CollectionPageClient';
import { Breadcrumb } from '@/app/components/ds/Breadcrumb';
import { SectionHeading } from '@/app/components/ds/SectionHeading';
import { StorePageShell } from '@/app/components/layout/StorePageShell';
import { toStorefrontProductCard } from '@/app/lib/shopify-mappers';
import { getCollectionByHandle } from '@/app/lib/shopify';

type CollectionPageProps = {
  params: Promise<{ handle: string }>;
};

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { handle } = await params;
  const collection = await getCollectionByHandle(handle);

  if (!collection) {
    notFound();
  }

  const productCards = collection.products.edges.map((edge) =>
    toStorefrontProductCard(edge.node),
  );

  return (
    <StorePageShell>
      <Breadcrumb
        className="mb-8"
        items={[
          { label: 'Domov', href: '/' },
          { label: 'Kolekcie', href: '/collections/frontpage' },
          { label: collection.title },
        ]}
      />
      <SectionHeading
        title={collection.title}
        subtitle={collection.description || `Objavte produkty v kategórii ${collection.title}.`}
      />
      <CollectionPageClient products={productCards} />
    </StorePageShell>
  );
}
