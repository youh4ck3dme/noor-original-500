import { notFound } from 'next/navigation';
import { Breadcrumb } from '@/app/components/ds/Breadcrumb';
import { ProductGallery } from '@/app/components/ds/ProductGallery';
import { ProductDetailClient } from '@/app/components/commerce/ProductDetailClient';
import { StorePageShell } from '@/app/components/layout/StorePageShell';
import { getProductByHandle } from '@/app/lib/shopify';

type ProductPageProps = {
  params: Promise<{ handle: string }>;
};

export default async function ProductPage({ params }: ProductPageProps) {
  const { handle } = await params;
  const product = await getProductByHandle(handle);

  if (!product) {
    notFound();
  }

  const images = product.images.edges.map((edge) => ({
    url: edge.node.url,
    altText: edge.node.altText ?? product.title,
  }));

  const variants =
    product.variants?.edges.map((edge) => edge.node) ?? [];

  return (
    <StorePageShell>
      <Breadcrumb
        className="mb-8"
        items={[
          { label: 'Domov', href: '/' },
          { label: 'Produkty', href: '/collections/frontpage' },
          { label: product.title },
        ]}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24">
        <ProductGallery images={images} />
        <ProductDetailClient
          productId={product.id}
          title={product.title}
          availableForSale={product.availableForSale ?? false}
          descriptionHtml={product.descriptionHtml}
          variants={variants}
          price={product.priceRange.minVariantPrice}
          compareAtPrice={product.compareAtPriceRange?.minVariantPrice}
        />
      </div>
    </StorePageShell>
  );
}
