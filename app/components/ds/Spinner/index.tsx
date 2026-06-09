'use client';

import { clsx } from 'clsx';
import React from 'react';
export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
}
const sizes = {
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-9 h-9 border-[3px]'
};
export const Spinner = ({
  size = 'md',
  className,
  label = 'Načítava sa…'
}: SpinnerProps) => {
  return (
    <span
      role="status"
      aria-label={label}
      className={clsx(
        'inline-block rounded-full border-gm-border border-t-gm-primary animate-spin motion-reduce:animate-none',
        sizes[size],
        className
      )} />);


};