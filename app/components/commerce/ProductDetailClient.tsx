'use client';

import React, { useMemo, useState } from 'react';
import { AddToCartButton } from '@/app/components/ds/AddToCartButton';
import { PriceTag } from '@/app/components/ds/PriceTag';
import { QuantityStepper } from '@/app/components/ds/QuantityStepper';
import { RatingStars } from '@/app/components/ds/RatingStars';
import { Tabs } from '@/app/components/ds/Tabs';
import { VariantSelector } from '@/app/components/ds/VariantSelector';
import { useCart } from '@/app/components/providers/CartProvider';
import type { ShopifyProductVariant } from '@/app/lib/shopify';

interface ProductDetailClientProps {
  productId: string;
  title: string;
  availableForSale: boolean;
  descriptionHtml?: string;
  variants: ShopifyProductVariant[];
  price: { amount: string; currencyCode: string };
  compareAtPrice?: { amount: string; currencyCode: string };
}

export function ProductDetailClient({
  productId,
  title,
  availableForSale,
  descriptionHtml,
  variants,
  price,
  compareAtPrice,
}: ProductDetailClientProps) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedVariantId, setSelectedVariantId] = useState(
    variants[0]?.id ?? productId,
  );

  const selectedVariant = useMemo(
    () => variants.find((v) => v.id === selectedVariantId) ?? variants[0],
    [variants, selectedVariantId],
  );

  const variantOptions = variants.map((variant) => ({
    id: variant.id,
    label: variant.selectedOptions.map((o) => o.value).join(' / ') || variant.title,
    available: variant.availableForSale,
  }));

  const displayPrice = selectedVariant?.price ?? price;
  const canPurchase = selectedVariant?.availableForSale ?? availableForSale;

  return (
    <div className="flex flex-col">
      <h1 className="text-3xl md:text-4xl font-heading text-gm-text mb-2">{title}</h1>

      <div className="flex items-center gap-4 mb-6">
        <PriceTag
          amount={parseFloat(displayPrice.amount)}
          currency={displayPrice.currencyCode}
          compareAt={
            compareAtPrice ? parseFloat(compareAtPrice.amount) : undefined
          }
        />
        <RatingStars rating={4.5} reviewCount={128} />
      </div>

      {variants.length > 1 && (
        <VariantSelector
          label="Variant"
          options={variantOptions}
          value={selectedVariantId}
          onChange={setSelectedVariantId}
          className="mb-6"
        />
      )}

      <div className="flex items-center gap-4 mb-8">
        <QuantityStepper value={quantity} onChange={setQuantity} />
        <AddToCartButton
          productId={selectedVariantId}
          availableForSale={canPurchase}
          quantity={quantity}
          onAddToCart={addToCart}
        />
      </div>

      {descriptionHtml && (
        <Tabs
          items={[
            {
              id: 'description',
              label: 'Popis',
              content: (
                <div
                  className="prose max-w-none text-gm-text-muted font-light leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: descriptionHtml }}
                />
              ),
            },
          ]}
          defaultValue="description"
        />
      )}
    </div>
  );
}
