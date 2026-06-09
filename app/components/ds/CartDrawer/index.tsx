'use client';

import React from 'react';
import { ShoppingBagIcon } from 'lucide-react';
import { Drawer } from '../Drawer';
import { CartLineItem, CartLineItemData } from '../CartLineItem';
import { OrderSummary } from '../OrderSummary';
import { Button } from '../Button';
export interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
  items: CartLineItemData[];
  onQuantityChange: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
  onCheckout?: () => void;
  shipping?: number;
  currency?: string;
}
export const CartDrawer = ({
  open,
  onClose,
  items,
  onQuantityChange,
  onRemove,
  onCheckout,
  shipping = 0,
  currency = 'EUR'
}: CartDrawerProps) => {
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const isEmpty = items.length === 0;
  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Váš košík"
      footer={
      !isEmpty ?
      <div className="space-y-4">
            <OrderSummary
          subtotal={subtotal}
          shipping={shipping}
          currency={currency} />
        
            <Button fullWidth onClick={onCheckout}>
              Pokračovať k pokladni
            </Button>
          </div> :
      undefined
      }>
      
      {isEmpty ?
      <div className="h-full flex flex-col items-center justify-center text-center py-16">
          <ShoppingBagIcon className="w-10 h-10 text-gm-text-muted/50 mb-4" />
          <p className="font-heading text-lg text-gm-text">Košík je prázdny</p>
          <p className="text-sm text-gm-text-muted mt-1">
            Pridajte produkty a vráťte sa sem.
          </p>
        </div> :

      <ul className="divide-y divide-gm-border">
          {items.map((item) =>
        <li key={item.id}>
              <CartLineItem
            item={item}
            onQuantityChange={onQuantityChange}
            onRemove={onRemove} />
          
            </li>
        )}
        </ul>
      }
    </Drawer>);

};