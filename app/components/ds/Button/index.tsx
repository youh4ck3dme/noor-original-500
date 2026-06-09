'use client';

import { clsx } from 'clsx';
import React from 'react';

export interface ButtonProps extends
  React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  fullWidth?: boolean;
}
export const Button = ({
  children,
  variant = 'primary',
  fullWidth,
  className,
  type = 'button',
  ...props
}: ButtonProps) => {
  const variants = {
    primary: 'gm-liquid-button',
    secondary:
    'bg-gm-surface text-gm-text hover:bg-gm-bg-soft px-8 py-3.5 rounded-gm-md font-medium transition-all duration-300 gm-focus-ring disabled:opacity-50 disabled:cursor-not-allowed',
    outline:
    'border border-gm-border text-gm-text hover:border-gm-primary hover:text-gm-primary px-8 py-3.5 rounded-gm-md font-medium transition-all duration-300 gm-focus-ring disabled:opacity-50 disabled:cursor-not-allowed',
    ghost:
    'text-gm-text hover:text-gm-primary hover:bg-gm-bg-soft/50 px-8 py-3.5 rounded-gm-md font-medium transition-all duration-300 gm-focus-ring disabled:opacity-50 disabled:cursor-not-allowed'
  };
  return (
    <button
      type={type}
      className={clsx(variants[variant], fullWidth && 'w-full', className)}
      {...props}>
      
      {children}
    </button>);

};