'use client';

import { clsx } from 'clsx';
import React from 'react';

export interface PriceTagProps {
  amount: number;
  compareAt?: number;
  currency?: string;
  locale?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}
const sizes = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-2xl'
};
function format(value: number, currency: string, locale: string) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency
  }).format(value);
}
export const PriceTag = ({
  amount,
  compareAt,
  currency = 'EUR',
  locale = 'sk-SK',
  size = 'md',
  className
}: PriceTagProps) => {
  const onSale = typeof compareAt === 'number' && compareAt > amount;
  const savings = onSale ?
  Math.round((compareAt! - amount) / compareAt! * 100) :
  0;
  return (
    <div className={clsx('flex items-baseline gap-2', className)}>
      <span
        className={clsx(
          'font-medium',
          sizes[size],
          onSale ? 'text-gm-primary' : 'text-gm-text'
        )}>
        
        {format(amount, currency, locale)}
      </span>
      {onSale &&
      <>
          <span
          className={clsx(
            'text-gm-text-muted line-through',
            size === 'lg' ? 'text-base' : 'text-sm'
          )}>
          
            {format(compareAt!, currency, locale)}
          </span>
          <span className="text-xs font-medium text-gm-primary">
            −{savings}%
          </span>
        </>
      }
    </div>);

};