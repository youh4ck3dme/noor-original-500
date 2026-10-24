'use client';

import React from 'react';
import { ToastProvider } from '@/app/components/ds/Toast';
import { AuthProvider } from './AuthProvider';
import { CartProvider } from './CartProvider';

export function StorefrontProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ToastProvider>
        <CartProvider>{children}</CartProvider>
      </ToastProvider>
    </AuthProvider>
  );
}
