'use client';

import { clsx } from 'clsx';
import React from 'react';
export interface SkeletonProps {
  className?: string;
  /** Convenience shape presets. */
  variant?: 'rect' | 'text' | 'circle';
}
export const Skeleton = ({ className, variant = 'rect' }: SkeletonProps) => {
  const shape =
  variant === 'circle' ?
  'rounded-full' :
  variant === 'text' ?
  'rounded-gm-sm h-4' :
  'rounded-gm-md';
  return (
    <div
      aria-hidden="true"
      className={clsx(
        'bg-gm-bg-soft animate-pulse motion-reduce:animate-none',
        shape,
        className
      )} />);


};
export interface ProductCardSkeletonProps {
  className?: string;
}
export const ProductCardSkeleton = ({
  className
}: ProductCardSkeletonProps) => {
  return (
    <div className={clsx('flex flex-col', className)} aria-hidden="true">
      <Skeleton className="aspect-[3/4] w-full mb-4" />
      <Skeleton variant="text" className="w-3/4 mx-auto mb-2" />
      <Skeleton variant="text" className="w-1/3 mx-auto" />
    </div>);

};