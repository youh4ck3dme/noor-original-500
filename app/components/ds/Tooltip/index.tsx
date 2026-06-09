'use client';

import { clsx } from 'clsx';
import React, { useState } from 'react';
export type TooltipSide = 'top' | 'bottom' | 'left' | 'right';
export interface TooltipProps {
  content: React.ReactNode;
  side?: TooltipSide;
  children: React.ReactNode;
  className?: string;
}
const positions: Record<TooltipSide, string> = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2'
};
export const Tooltip = ({
  content,
  side = 'top',
  children,
  className
}: TooltipProps) => {
  const [open, setOpen] = useState(false);
  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}>
      
      {children}
      {open &&
      <span
        role="tooltip"
        className={clsx(
          'absolute z-50 whitespace-nowrap px-2.5 py-1.5 rounded-gm-md text-xs text-white bg-gm-text shadow-gm-soft',
          'animate-fade-in pointer-events-none',
          positions[side],
          className
        )}>
        
          {content}
        </span>
      }
    </span>);

};