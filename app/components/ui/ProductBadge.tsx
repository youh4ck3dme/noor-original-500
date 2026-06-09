import React from 'react';
import { clsx } from 'clsx';

interface ProductBadgeProps {
  label: string;
  className?: string;
}

export const ProductBadge = ({ label, className }: ProductBadgeProps) => {
  return (
    <span
      className={clsx(
        'bg-white/90 backdrop-blur-sm px-3 py-1 text-xs font-medium tracking-wide rounded-full text-gm-text shadow-sm',
        className,
      )}
    >
      {label}
    </span>
  );
};
