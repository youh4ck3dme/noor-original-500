'use client';

import { clsx } from 'clsx';
import React, { useId } from 'react';
export interface RadioOption {
  value: string;
  label: React.ReactNode;
  description?: React.ReactNode;
  disabled?: boolean;
}
export interface RadioGroupProps {
  label?: string;
  name?: string;
  options: RadioOption[];
  value?: string;
  onChange: (value: string) => void;
  className?: string;
}
export const RadioGroup = ({
  label,
  name,
  options,
  value,
  onChange,
  className
}: RadioGroupProps) => {
  const autoName = useId();
  const groupName = name || autoName;
  return (
    <div className={className} role="radiogroup" aria-label={label}>
      {label &&
      <span className="block text-sm font-medium text-gm-text mb-2">
          {label}
        </span>
      }
      <div className="space-y-2.5">
        {options.map((opt) => {
          const selected = opt.value === value;
          return (
            <label
              key={opt.value}
              className={clsx(
                'flex items-start gap-3 rounded-gm-md border p-3 transition-colors cursor-pointer',
                selected ?
                'border-gm-primary bg-gm-primary/5' :
                'border-gm-border hover:border-gm-primary/60',
                opt.disabled && 'opacity-50 cursor-not-allowed'
              )}>
              
              <span className="relative inline-flex items-center justify-center mt-0.5">
                <input
                  type="radio"
                  name={groupName}
                  value={opt.value}
                  checked={selected}
                  disabled={opt.disabled}
                  onChange={() => onChange(opt.value)}
                  className="peer appearance-none w-5 h-5 rounded-full border border-gm-border bg-gm-surface checked:border-gm-primary transition-colors gm-focus-ring cursor-pointer disabled:cursor-not-allowed" />
                
                <span className="absolute w-2.5 h-2.5 rounded-full bg-gm-primary opacity-0 peer-checked:opacity-100 pointer-events-none" />
              </span>
              <span className="select-none">
                <span className="block text-sm text-gm-text">{opt.label}</span>
                {opt.description &&
                <span className="block text-xs text-gm-text-muted mt-0.5">
                    {opt.description}
                  </span>
                }
              </span>
            </label>);

        })}
      </div>
    </div>);

};