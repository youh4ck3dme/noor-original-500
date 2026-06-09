'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { CartLineItemData } from '@/app/components/ds/CartLineItem';
import { useToast } from '@/app/components/ds/Toast';

const CART_ID_KEY = 'gm-cart-id';

type CartContextValue = {
  items: CartLineItemData[];
  totalQuantity: number;
  checkoutUrl: string | null;
  isLoading: boolean;
  addToCart: (payload: { productId: string; quantity: number }) => Promise<void>;
  updateQuantity: (lineId: string, quantity: number) => Promise<void>;
  removeItem: (lineId: string) => Promise<void>;
  openCart: () => void;
  closeCart: () => void;
  isCartOpen: boolean;
};

const CartContext = createContext<CartContextValue | null>(null);

async function cartRequest(body: Record<string, unknown>) {
  const response = await fetch('/api/cart', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error('Cart request failed');
  return response.json();
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();
  const [cartId, setCartId] = useState<string | null>(null);
  const [items, setItems] = useState<CartLineItemData[]>([]);
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const syncCart = useCallback((cart: {
    id: string;
    checkoutUrl: string;
    totalQuantity: number;
    lines: Array<{
      id: string;
      title: string;
      variant?: string;
      image?: string;
      price: number;
      quantity: number;
      currency: string;
    }>;
  }) => {
    setCartId(cart.id);
    localStorage.setItem(CART_ID_KEY, cart.id);
    setCheckoutUrl(cart.checkoutUrl);
    setTotalQuantity(cart.totalQuantity);
    setItems(
      cart.lines.map((line) => ({
        id: line.id,
        title: line.title,
        variant: line.variant,
        image: line.image,
        price: line.price,
        quantity: line.quantity,
        currency: line.currency,
      })),
    );
  }, []);

  useEffect(() => {
    async function init() {
      try {
        const storedId = localStorage.getItem(CART_ID_KEY);
        if (storedId) {
          const response = await fetch(`/api/cart?cartId=${encodeURIComponent(storedId)}`);
          if (response.ok) {
            syncCart(await response.json());
            return;
          }
        }
        syncCart(await cartRequest({ action: 'create' }));
      } catch {
        // Cart init failed silently — user can retry on add
      } finally {
        setIsLoading(false);
      }
    }
    init();
  }, [syncCart]);

  const addToCart = useCallback(
    async ({ productId, quantity }: { productId: string; quantity: number }) => {
      if (!cartId) return;
      setIsLoading(true);
      try {
        const cart = await cartRequest({
          action: 'add',
          cartId,
          merchandiseId: productId,
          quantity,
        });
        syncCart(cart);
        toast({ title: 'Pridané do košíka', variant: 'success' });
        setIsCartOpen(true);
      } catch {
        toast({ title: 'Nepodarilo sa pridať do košíka', variant: 'error' });
      } finally {
        setIsLoading(false);
      }
    },
    [cartId, syncCart, toast],
  );

  const updateQuantity = useCallback(
    async (lineId: string, quantity: number) => {
      if (!cartId) return;
      setIsLoading(true);
      try {
        const cart = await cartRequest({ action: 'update', cartId, lineId, quantity });
        syncCart(cart);
      } finally {
        setIsLoading(false);
      }
    },
    [cartId, syncCart],
  );

  const removeItem = useCallback(
    async (lineId: string) => {
      if (!cartId) return;
      setIsLoading(true);
      try {
        const cart = await cartRequest({ action: 'remove', cartId, lineId });
        syncCart(cart);
      } finally {
        setIsLoading(false);
      }
    },
    [cartId, syncCart],
  );

  const value = useMemo(
    () => ({
      items,
      totalQuantity,
      checkoutUrl,
      isLoading,
      addToCart,
      updateQuantity,
      removeItem,
      openCart: () => setIsCartOpen(true),
      closeCart: () => setIsCartOpen(false),
      isCartOpen,
    }),
    [
      items,
      totalQuantity,
      checkoutUrl,
      isLoading,
      addToCart,
      updateQuantity,
      removeItem,
      isCartOpen,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
