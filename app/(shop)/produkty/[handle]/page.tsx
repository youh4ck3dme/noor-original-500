import { notFound } from 'next/navigation';
import { Breadcrumb } from '@/app/components/ds/Breadcrumb';
import { ProductGallery } from '@/app/components/ds/ProductGallery';
import { ProductDetailClient } from '@/app/components/commerce/ProductDetailClient';
import { ProductReviews } from '@/app/components/commerce/ProductReviews';
import { StorePageShell } from '@/app/components/layout/StorePageShell';
import { getProductReviewSummary } from '@/app/lib/reviews';
import { getProductByHandle } from '@/app/lib/shopify';
import { toProductDetail } from '@/app/lib/shopify-mappers';

type ProductPageProps = {
  params: Promise<{ handle: string }>;
};

export default async function ProductPage({ params }: ProductPageProps) {
  const { handle } = await params;
  const [product, reviewSummary] = await Promise.all([
    getProductByHandle(handle),
    getProductReviewSummary(handle),
  ]);

  if (!product) {
    notFound();
  }

  const detail = toProductDetail(product);
  const images = product.images.edges.map((edge) => ({
    url: edge.node.url,
    altText: edge.node.altText ?? product.title,
  }));

  const variants = product.variants?.edges.map((edge) => edge.node) ?? [];

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
          composition={detail.composition}
          dosage={detail.dosage}
          labTests={detail.labTests}
          faq={detail.faq}
          averageRating={reviewSummary.averageRating}
          reviewCount={reviewSummary.reviewCount}
        />
      </div>
      <ProductReviews
        productHandle={handle}
        initialReviews={reviewSummary.reviews}
        averageRating={reviewSummary.averageRating}
        reviewCount={reviewSummary.reviewCount}
      />
    </StorePageShell>
  );
}
