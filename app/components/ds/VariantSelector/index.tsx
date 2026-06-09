'use client';

import { clsx } from 'clsx';
import React from 'react';
import { CheckIcon } from 'lucide-react';

export interface VariantOption {
  id: string;
  label: string;
  /** Hex color — when provided renders a color swatch instead of a text chip. */
  color?: string;
  available?: boolean;
}
export interface VariantSelectorProps {
  label: string;
  options: VariantOption[];
  value?: string;
  onChange: (id: string) => void;
  className?: string;
}
export const VariantSelector = ({
  label,
  options,
  value,
  onChange,
  className
}: VariantSelectorProps) => {
  const isColor = options.some((o) => o.color);
  return (
    <div className={className}>
      <span className="block text-sm font-medium text-gm-text mb-2">
        {label}
      </span>
      <div
        className="flex flex-wrap gap-2"
        role="radiogroup"
        aria-label={label}>
        
        {options.map((opt) => {
          const selected = opt.id === value;
          const unavailable = opt.available === false;
          if (isColor) {
            return (
              <button
                key={opt.id}
                type="button"
                role="radio"
                aria-checked={selected}
                aria-label={opt.label}
                disabled={unavailable}
                onClick={() => onChange(opt.id)}
                className={clsx(
                  'relative w-9 h-9 rounded-full transition-all gm-focus-ring',
                  selected ?
                  'ring-2 ring-gm-primary ring-offset-2' :
                  'ring-1 ring-gm-border ring-offset-1',
                  unavailable && 'opacity-40 cursor-not-allowed'
                )}
                style={{
                  backgroundColor: opt.color
                }}>
                
                {selected &&
                <CheckIcon className="w-4 h-4 absolute inset-0 m-auto text-white drop-shadow" />
                }
              </button>);

          }
          return (
            <button
              key={opt.id}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={unavailable}
              onClick={() => onChange(opt.id)}
              className={clsx(
                'min-w-[3rem] px-3 py-2 text-sm rounded-gm-md border transition-colors gm-focus-ring',
                selected ?
                'border-gm-primary bg-gm-primary/10 text-gm-text' :
                'border-gm-border text-gm-text hover:border-gm-primary',
                unavailable &&
                'opacity-40 cursor-not-allowed line-through hover:border-gm-border'
              )}>
              
              {opt.label}
            </button>);

        })}
      </div>
    </div>);

};