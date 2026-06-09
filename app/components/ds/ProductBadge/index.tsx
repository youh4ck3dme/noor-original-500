'use client';

import { clsx } from 'clsx';
import React from 'react';
import { Badge, BadgeStatus } from '../Badge';

export type ProductBadgeKind = 'new' | 'sale' | 'soldOut';
export interface ProductBadgeProps {
  kind: ProductBadgeKind;
  label?: string;
  position?: 'top-left' | 'top-right';
  className?: string;
}
const defaultLabels: Record<ProductBadgeKind, string> = {
  new: 'Novinka',
  sale: 'Zľava',
  soldOut: 'Vypredané'
};
const positions = {
  'top-left': 'top-3 left-3',
  'top-right': 'top-3 right-3'
};
export const ProductBadge = ({
  kind,
  label,
  position = 'top-left',
  className
}: ProductBadgeProps) => {
  return (
    <Badge
      label={label || defaultLabels[kind]}
      status={kind as BadgeStatus}
      className={clsx('absolute z-10', positions[position], className)} />);


};