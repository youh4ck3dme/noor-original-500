'use client';

import { clsx } from 'clsx';
import React, { forwardRef, useId } from 'react';
import { CheckIcon } from 'lucide-react';
export interface CheckboxProps extends
  Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
  description?: React.ReactNode;
  containerClassName?: string;
}
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
  { label, description, className, containerClassName, id, ...props },
  ref) =>
  {
    const autoId = useId();
    const fieldId = id || autoId;
    return (
      <div className={clsx('flex items-start gap-3', containerClassName)}>
        <span className="relative inline-flex items-center justify-center mt-0.5">
          <input
            ref={ref}
            id={fieldId}
            type="checkbox"
            className={clsx(
              'peer appearance-none w-5 h-5 rounded-gm-sm border border-gm-border bg-gm-surface transition-colors cursor-pointer',
              'checked:bg-gm-primary checked:border-gm-primary gm-focus-ring',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              className
            )}
            {...props} />
          
          <CheckIcon className="w-3.5 h-3.5 text-white absolute pointer-events-none opacity-0 peer-checked:opacity-100" />
        </span>
        {(label || description) &&
        <label htmlFor={fieldId} className="cursor-pointer select-none">
            {label &&
          <span className="block text-sm text-gm-text">{label}</span>
          }
            {description &&
          <span className="block text-xs text-gm-text-muted mt-0.5">
                {description}
              </span>
          }
          </label>
        }
      </div>);

  }
);
Checkbox.displayName = 'Checkbox';