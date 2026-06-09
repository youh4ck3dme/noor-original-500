'use client';

import { clsx } from 'clsx';
import React from 'react';

export type BadgeStatus = 'default' | 'new' | 'sale' | 'soldOut';
export interface BadgeProps {
  label: string;
  status?: BadgeStatus;
  className?: string;
}
const statusStyles: Record<BadgeStatus, string> = {
  default: 'bg-white/90 text-gm-text',
  new: 'bg-white/90 text-gm-text',
  sale: 'bg-gm-primary/95 text-white',
  soldOut: 'bg-gm-text/85 text-white'
};
export const Badge = ({ label, status = 'default', className }: BadgeProps) => {
  return (
    <span
      className={clsx(
        'backdrop-blur-sm px-3 py-1 text-xs font-medium tracking-wide rounded-full shadow-sm',
        statusStyles[status],
        className
      )}>
      
      {label}
    </span>);

};