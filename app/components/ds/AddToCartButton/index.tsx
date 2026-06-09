'use client';

import { clsx } from 'clsx';
import React, { useState } from 'react';

export interface AddToCartLabels {
  addToCart?: string;
  adding?: string;
  soldOut?: string;
}
export interface AddToCartButtonProps {
  productId: string;
  availableForSale: boolean;
  variant?: 'default' | 'quick-add';
  quantity?: number;
  onAddToCart?: (payload: {
    productId: string;
    quantity: number;
  }) => Promise<void> | void;
  labels?: AddToCartLabels;
}
export const AddToCartButton = ({
  productId,
  availableForSale,
  variant = 'default',
  quantity = 1,
  onAddToCart,
  labels
}: AddToCartButtonProps) => {
  const [isPending, setIsPending] = useState(false);
  const defaultLabels = {
    addToCart: labels?.addToCart || 'Do košíka',
    adding: labels?.adding || 'Pridávam...',
    soldOut: labels?.soldOut || 'Vypredané'
  };
  const handleAdd = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent link navigation if inside a card
    if (!availableForSale || !onAddToCart || isPending) return;
    try {
      setIsPending(true);
      await onAddToCart({
        productId,
        quantity
      });
    } finally {
      setIsPending(false);
    }
  };
  const isDisabled = !availableForSale || isPending || !onAddToCart;
  const buttonText = !availableForSale ?
  defaultLabels.soldOut :
  isPending ?
  defaultLabels.adding :
  defaultLabels.addToCart;
  if (variant === 'quick-add') {
    return (
      <button
        type="button"
        onClick={handleAdd}
        disabled={isDisabled}
        aria-label={buttonText}
        className={clsx(
          'bg-white/95 backdrop-blur-md text-gm-text font-medium text-sm px-6 py-3 rounded-full shadow-lg transition-colors w-full flex items-center justify-center gm-focus-ring',
          isDisabled ?
          'opacity-70 cursor-not-allowed' :
          'hover:bg-gm-primary hover:text-white'
        )}>
        
        {buttonText}
      </button>);

  }
  return (
    <button
      type="button"
      onClick={handleAdd}
      disabled={isDisabled}
      aria-label={buttonText}
      className="gm-liquid-button flex-1 text-lg w-full">
      
      {buttonText}
    </button>);

};