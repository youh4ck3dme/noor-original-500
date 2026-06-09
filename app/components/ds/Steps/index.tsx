'use client';

import { clsx } from 'clsx';
import React from 'react';
import { CheckIcon } from 'lucide-react';
export interface StepItem {
  label: string;
  description?: string;
}
export interface StepsProps {
  steps: StepItem[];
  /** Zero-based index of the current step. */
  current: number;
  className?: string;
}
export const Steps = ({ steps, current, className }: StepsProps) => {
  return (
    <ol className={clsx('flex items-start', className)}>
      {steps.map((step, i) => {
        const done = i < current;
        const active = i === current;
        const last = i === steps.length - 1;
        return (
          <li key={i} className={clsx('flex items-start', !last && 'flex-1')}>
            <div className="flex flex-col items-center text-center">
              <span
                className={clsx(
                  'flex items-center justify-center w-9 h-9 rounded-full text-sm font-medium transition-colors',
                  done && 'bg-gm-primary text-white',
                  active &&
                  'bg-gm-primary/15 text-gm-primary ring-2 ring-gm-primary',
                  !done && !active && 'bg-gm-bg-soft text-gm-text-muted'
                )}
                aria-current={active ? 'step' : undefined}>
                
                {done ? <CheckIcon className="w-4 h-4" /> : i + 1}
              </span>
              <span
                className={clsx(
                  'mt-2 text-sm font-medium',
                  active || done ? 'text-gm-text' : 'text-gm-text-muted'
                )}>
                
                {step.label}
              </span>
              {step.description &&
              <span className="text-xs text-gm-text-muted mt-0.5 max-w-[10rem]">
                  {step.description}
                </span>
              }
            </div>
            {!last &&
            <span
              className={clsx(
                'flex-1 h-0.5 mt-4 mx-2 rounded-full transition-colors',
                done ? 'bg-gm-primary' : 'bg-gm-border'
              )} />

            }
          </li>);

      })}
    </ol>);

};