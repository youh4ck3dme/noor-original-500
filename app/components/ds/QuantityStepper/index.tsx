'use client';

import { clsx } from 'clsx';
import React from 'react';
import { MinusIcon, PlusIcon } from 'lucide-react';

export interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  className?: string;
}
export const QuantityStepper = ({
  value,
  onChange,
  min = 1,
  max = 99,
  disabled,
  className
}: QuantityStepperProps) => {
  const dec = () => onChange(Math.max(min, value - 1));
  const inc = () => onChange(Math.min(max, value + 1));
  const btn =
  'flex items-center justify-center w-9 h-9 text-gm-text transition-colors hover:text-gm-primary disabled:opacity-40 disabled:cursor-not-allowed gm-focus-ring';
  return (
    <div
      className={clsx(
        'inline-flex items-center border border-gm-border rounded-gm-md bg-gm-surface',
        disabled && 'opacity-60',
        className
      )}>
      
      <button
        type="button"
        onClick={dec}
        disabled={disabled || value <= min}
        aria-label="Znížiť množstvo"
        className={clsx(btn, 'rounded-l-gm-md')}>
        
        <MinusIcon className="w-4 h-4" />
      </button>
      <span
        className="w-10 text-center text-sm font-medium text-gm-text tabular-nums"
        aria-live="polite">
        
        {value}
      </span>
      <button
        type="button"
        onClick={inc}
        disabled={disabled || value >= max}
        aria-label="Zvýšiť množstvo"
        className={clsx(btn, 'rounded-r-gm-md')}>
        
        <PlusIcon className="w-4 h-4" />
      </button>
    </div>);

};