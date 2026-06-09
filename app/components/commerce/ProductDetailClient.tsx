'use client';

import React, { useMemo, useState } from 'react';
import { AddToCartButton } from '@/app/components/ds/AddToCartButton';
import { Accordion } from '@/app/components/ds/Accordion';
import { PriceTag } from '@/app/components/ds/PriceTag';
import { QuantityStepper } from '@/app/components/ds/QuantityStepper';
import { RatingStars } from '@/app/components/ds/RatingStars';
import { Tabs } from '@/app/components/ds/Tabs';
import { VariantSelector } from '@/app/components/ds/VariantSelector';
import { useCart } from '@/app/components/providers/CartProvider';
import type { ShopifyProductVariant } from '@/app/lib/shopify';
import type {
  StorefrontLabTest,
  StorefrontProductFaq,
} from '@/app/lib/theme/storefront-types';

interface ProductDetailClientProps {
  productId: string;
  title: string;
  availableForSale: boolean;
  descriptionHtml?: string;
  variants: ShopifyProductVariant[];
  price: { amount: string; currencyCode: string };
  compareAtPrice?: { amount: string; currencyCode: string };
  composition?: string | null;
  dosage?: string | null;
  labTests?: StorefrontLabTest[];
  faq?: StorefrontProductFaq[];
  averageRating?: number;
  reviewCount?: number;
}

function EmptyTabMessage({ message }: { message: string }) {
  return <p className="text-gm-text-muted">{message}</p>;
}

export function ProductDetailClient({
  productId,
  title,
  availableForSale,
  descriptionHtml,
  variants,
  price,
  compareAtPrice,
  composition,
  dosage,
  labTests = [],
  faq = [],
  averageRating = 0,
  reviewCount = 0,
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

  const tabItems = [
    descriptionHtml
      ? {
          id: 'description',
          label: 'Popis',
          content: (
            <div
              className="prose max-w-none text-gm-text-muted font-light leading-relaxed"
              dangerouslySetInnerHTML={{ __html: descriptionHtml }}
            />
          ),
        }
      : null,
    {
      id: 'composition',
      label: 'Zloženie',
      content: composition ? (
        <div className="prose max-w-none text-gm-text-muted whitespace-pre-wrap">
          {composition}
        </div>
      ) : (
        <EmptyTabMessage message="Zloženie zatiaľ nie je vyplnené v Shopify metaobjekte." />
      ),
    },
    {
      id: 'dosage',
      label: 'Dávkovanie',
      content: dosage ? (
        <div className="prose max-w-none text-gm-text-muted whitespace-pre-wrap">
          {dosage}
        </div>
      ) : (
        <EmptyTabMessage message="Dávkovanie zatiaľ nie je vyplnené v Shopify metaobjekte." />
      ),
    },
    {
      id: 'lab-tests',
      label: 'Laboratórne testy',
      content:
        labTests.length > 0 ? (
          <ul className="space-y-4">
            {labTests.map((test) => (
              <li
                key={`${test.title}-${test.pdfUrl}`}
                className="rounded-gm-md border border-gm-border bg-white/70 p-4"
              >
                <p className="font-medium text-gm-text">{test.title}</p>
                {test.labName && (
                  <p className="text-sm text-gm-text-muted">Laboratórium: {test.labName}</p>
                )}
                {test.testDate && (
                  <p className="text-sm text-gm-text-muted">Dátum: {test.testDate}</p>
                )}
                {test.pdfUrl && (
                  <a
                    href={test.pdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-gm-primary hover:underline mt-2 inline-block"
                  >
                    Stiahnuť PDF
                  </a>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <EmptyTabMessage message="Laboratórne testy zatiaľ nie sú k dispozícii." />
        ),
    },
  ].filter(Boolean) as Array<{ id: string; label: string; content: React.ReactNode }>;

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
        {reviewCount > 0 ? (
          <RatingStars rating={averageRating} reviewCount={reviewCount} />
        ) : (
          <RatingStars rating={0} reviewCount={0} />
        )}
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

      {tabItems.length > 0 && (
        <Tabs items={tabItems} defaultValue={tabItems[0]?.id} className="mb-8" />
      )}

      {faq.length > 0 && (
        <div className="mt-4">
          <h3 className="text-xl font-heading text-gm-text mb-4">Často kladené otázky</h3>
          <Accordion
            items={faq.map((item) => ({
              id: item.id,
              title: item.title,
              content: item.content,
            }))}
          />
        </div>
      )}
    </div>
  );
}
