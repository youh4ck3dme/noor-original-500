'use client';

import { clsx } from 'clsx';
import React from 'react';

export interface OrderSummaryProps {
  subtotal: number;
  shipping?: number;
  tax?: number;
  discount?: number;
  currency?: string;
  locale?: string;
  className?: string;
}
function format(value: number, currency: string, locale: string) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency
  }).format(value);
}

function SummaryRow({
  label,
  value,
  muted,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className={muted ? 'text-gm-text-muted' : 'text-gm-text'}>{label}</span>
      <span className={muted ? 'text-gm-text-muted' : 'text-gm-text'}>{value}</span>
    </div>
  );
}

export const OrderSummary = ({
  subtotal,
  shipping = 0,
  tax = 0,
  discount = 0,
  currency = 'EUR',
  locale = 'sk-SK',
  className
}: OrderSummaryProps) => {
  const total = subtotal + shipping + tax - discount;
  const fmt = (v: number) => format(v, currency, locale);

  return (
    <div className={clsx('space-y-3', className)}>
      <SummaryRow label="Medzisúčet" value={fmt(subtotal)} muted />
      {discount > 0 && <SummaryRow label="Zľava" value={`−${fmt(discount)}`} muted />}
      <SummaryRow
        label="Doprava"
        value={shipping === 0 ? 'Zdarma' : fmt(shipping)}
        muted />
      
      {tax > 0 && <SummaryRow label="DPH" value={fmt(tax)} muted />}
      <div className="border-t border-gm-border pt-3 flex items-center justify-between">
        <span className="font-heading text-lg text-gm-text">Spolu</span>
        <span className="font-medium text-lg text-gm-text">{fmt(total)}</span>
      </div>
    </div>);

};