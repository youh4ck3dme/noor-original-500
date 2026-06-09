'use client';

import { clsx } from 'clsx';
import React from 'react';
import { StarIcon } from 'lucide-react';

export interface RatingStarsProps {
  rating: number;
  max?: number;
  reviewCount?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}
const sizes = {
  sm: 'w-3.5 h-3.5',
  md: 'w-4 h-4',
  lg: 'w-5 h-5'
};
export const RatingStars = ({
  rating,
  max = 5,
  reviewCount,
  size = 'md',
  className
}: RatingStarsProps) => {
  const rounded = Math.round(rating * 2) / 2;
  return (
    <div
      className={clsx('inline-flex items-center gap-1.5', className)}
      aria-label={`Hodnotenie ${rating} z ${max}`}>
      
      <div className="flex items-center" role="img">
        {Array.from({
          length: max
        }).map((_, i) => {
          const filled = i + 1 <= rounded;
          const half = !filled && i + 0.5 === rounded;
          return (
            <span key={i} className="relative">
              <StarIcon className={clsx(sizes[size], 'text-gm-border')} />
              {(filled || half) &&
              <StarIcon
                className={clsx(
                  sizes[size],
                  'absolute inset-0 text-gm-primary fill-gm-primary'
                )}
                style={
                half ?
                {
                  clipPath: 'inset(0 50% 0 0)'
                } :
                undefined
                } />

              }
            </span>);

        })}
      </div>
      {typeof reviewCount === 'number' &&
      <span className="text-sm text-gm-text-muted">({reviewCount})</span>
      }
    </div>);

};