'use client';

import { clsx } from 'clsx';
import React, { forwardRef, useId } from 'react';
export interface TextareaProps extends
  React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
  containerClassName?: string;
}
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
  {
    label,
    hint,
    error,
    className,
    containerClassName,
    id,
    rows = 4,
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
        <textarea
          ref={ref}
          id={fieldId}
          rows={rows}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          className={clsx(
            'w-full bg-gm-surface text-gm-text placeholder:text-gm-text-muted/70 rounded-gm-md border transition-colors',
            'px-4 py-2.5 text-sm gm-focus-ring resize-y',
            error ?
            'border-gm-primary focus-visible:ring-gm-primary' :
            'border-gm-border hover:border-gm-primary/60',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            className
          )}
          {...props} />
        
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
Textarea.displayName = 'Textarea';