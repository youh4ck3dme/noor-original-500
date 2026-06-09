'use client';

import React from 'react';
import { ToastProvider } from '@/app/components/ds/Toast';
import { CartProvider } from './CartProvider';

export function StorefrontProviders({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <CartProvider>{children}</CartProvider>
    </ToastProvider>
  );
}
