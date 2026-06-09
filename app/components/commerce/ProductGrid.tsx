import React from 'react';
import { StorefrontProductCard } from '@/lib/theme/storefront-types';
import { ProductCard } from './ProductCard';
import { AddToCartLabels } from './AddToCartButton';
interface ProductGridProps {
  products: StorefrontProductCard[];
  onAddToCart?: (payload: {
    productId: string;
    quantity: number;
  }) => Promise<void> | void;
  labels?: AddToCartLabels;
}
export const ProductGrid = ({
  products,
  onAddToCart,
  labels
}: ProductGridProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
      {products.map((product) =>
      <ProductCard
        key={product.id}
        product={product}
        onAddToCart={onAddToCart}
        labels={labels} />

      )}
    </div>);

};