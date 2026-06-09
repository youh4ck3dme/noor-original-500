'use client';

import { clsx } from 'clsx';
import React, { forwardRef, useId } from 'react';
import { ChevronDownIcon } from 'lucide-react';
export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}
export interface SelectProps extends
  React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
  containerClassName?: string;
}
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
  {
    label,
    hint,
    error,
    options,
    placeholder,
    className,
    containerClassName,
    id,
    ...props
  },
  ref) =>
  {
    const autoId = useId();
    const fieldId = id || autoId;
    const describedBy = error ?
    `${fieldId}-error` :
    hint ?
    `${fieldId}-hint` :
    undefined;
    return (
      <div className={clsx('w-full', containerClassName)}>
        {label &&
        <label
          htmlFor={fieldId}
          className="block text-sm font-medium text-gm-text mb-1.5">
          
            {label}
          </label>
        }
        <div className="relative">
          <select
            ref={ref}
            id={fieldId}
            aria-invalid={!!error}
            aria-describedby={describedBy}
            className={clsx(
              'w-full appearance-none bg-gm-surface text-gm-text rounded-gm-md border transition-colors',
              'pl-4 pr-10 py-2.5 text-sm gm-focus-ring cursor-pointer',
              error ?
              'border-gm-primary focus-visible:ring-gm-primary' :
              'border-gm-border hover:border-gm-primary/60',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              className
            )}
            {...props}>
            
            {placeholder &&
            <option value="" disabled>
                {placeholder}
              </option>
            }
            {options.map((opt) =>
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            )}
          </select>
          <ChevronDownIcon className="w-4 h-4 text-gm-text-muted absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
        {error ?
        <p id={`${fieldId}-error`} className="mt-1.5 text-xs text-gm-primary">
            {error}
          </p> :
        hint ?
        <p
          id={`${fieldId}-hint`}
          className="mt-1.5 text-xs text-gm-text-muted">
          
            {hint}
          </p> :
        null}
      </div>);

  }
);
Select.displayName = 'Select';