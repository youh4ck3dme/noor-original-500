import { ProductGrid } from './components/commerce/ProductGrid';
import { SectionHeading } from './components/ds/SectionHeading';
import { StorePageShell } from './components/layout/StorePageShell';
import { toStorefrontProductCard } from './lib/shopify-mappers';
import { getProducts } from './lib/shopify';

export default async function Home() {
  const products = await getProducts(12);
  const productCards = products.map(toStorefrontProductCard);

  return (
    <StorePageShell className="pt-36 pb-24">
      <SectionHeading
        title="GrowMedica produkty"
        subtitle={
          productCards.length > 0
            ? `Zobrazených ${productCards.length} produktov zo Shopify`
            : 'Momentálne nie sú dostupné žiadne produkty.'
        }
      />
      {productCards.length > 0 ? (
        <ProductGrid products={productCards} />
      ) : (
        <p className="text-center text-gm-text-muted">
          Skontroluj Shopify pripojenie a kolekciu v administrácii.
        </p>
      )}
    </StorePageShell>
  );
}
