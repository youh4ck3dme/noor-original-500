'use client';

import { clsx } from 'clsx';
import React, { forwardRef, useId } from 'react';
export interface InputProps extends
  React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  containerClassName?: string;
}
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
  {
    label,
    hint,
    error,
    leadingIcon,
    trailingIcon,
    className,
    containerClassName,
    id,
    ...props
  },
  ref) =>
  {
    const autoId = useId();
    const inputId = id || autoId;
    const describedBy = error ?
    `${inputId}-error` :
    hint ?
    `${inputId}-hint` :
    undefined;
    return (
      <div className={clsx('w-full', containerClassName)}>
        {label &&
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gm-text mb-1.5">
          
            {label}
          </label>
        }
        <div className="relative">
          {leadingIcon &&
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gm-text-muted pointer-events-none">
              {leadingIcon}
            </span>
          }
          <input
            ref={ref}
            id={inputId}
            aria-invalid={!!error}
            aria-describedby={describedBy}
            className={clsx(
              'w-full bg-gm-surface text-gm-text placeholder:text-gm-text-muted/70 rounded-gm-md border transition-colors',
              'px-4 py-2.5 text-sm gm-focus-ring',
              leadingIcon && 'pl-10',
              trailingIcon && 'pr-10',
              error ?
              'border-gm-primary focus-visible:ring-gm-primary' :
              'border-gm-border hover:border-gm-primary/60',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              className
            )}
            {...props} />
          
          {trailingIcon &&
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gm-text-muted">
              {trailingIcon}
            </span>
          }
        </div>
        {error ?
        <p id={`${inputId}-error`} className="mt-1.5 text-xs text-gm-primary">
            {error}
          </p> :
        hint ?
        <p
          id={`${inputId}-hint`}
          className="mt-1.5 text-xs text-gm-text-muted">
          
            {hint}
          </p> :
        null}
      </div>);

  }
);
Input.displayName = 'Input';