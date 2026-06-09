'use client';

import React from 'react';
import { CartDrawer } from '@/app/components/ds/CartDrawer';
import { useCart } from '@/app/components/providers/CartProvider';

export function CartDrawerWrapper() {
  const {
    items,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeItem,
    checkoutUrl,
  } = useCart();

  return (
    <CartDrawer
      open={isCartOpen}
      onClose={closeCart}
      items={items}
      onQuantityChange={updateQuantity}
      onRemove={removeItem}
      onCheckout={() => {
        if (checkoutUrl) window.location.href = checkoutUrl;
      }}
    />
  );
}
