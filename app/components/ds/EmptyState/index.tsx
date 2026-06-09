'use client';

import { clsx } from 'clsx';
import React from 'react';
export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}
export const EmptyState = ({
  icon,
  title,
  description,
  action,
  className
}: EmptyStateProps) => {
  return (
    <div
      className={clsx(
        'flex flex-col items-center justify-center text-center py-16 px-6',
        className
      )}>
      
      {icon &&
      <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gm-bg-soft text-gm-text-muted mb-4">
          {icon}
        </div>
      }
      <h3 className="font-heading text-xl text-gm-text">{title}</h3>
      {description &&
      <p className="text-sm text-gm-text-muted mt-1.5 max-w-sm">
          {description}
        </p>
      }
      {action && <div className="mt-6">{action}</div>}
    </div>);

};