'use client';

import React from 'react';
import { ProductCard } from '@/app/components/ds/ProductCard';
import { useCart } from '@/app/components/providers/CartProvider';
import type { StorefrontProductCard } from '@/app/lib/theme/storefront-types';

interface ProductGridProps {
  products: StorefrontProductCard[];
}

export const ProductGrid = ({ products }: ProductGridProps) => {
  const { addToCart } = useCart();

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={addToCart}
        />
      ))}
    </div>
  );
};
