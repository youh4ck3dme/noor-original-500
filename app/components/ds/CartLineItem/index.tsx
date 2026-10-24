'use client';

import { clsx } from 'clsx';
import Image from 'next/image';
import React from 'react';
import { Trash2Icon } from 'lucide-react';

import { QuantityStepper } from '../QuantityStepper';
import { PriceTag } from '../PriceTag';
export interface CartLineItemData {
  id: string;
  title: string;
  variant?: string;
  image?: string;
  price: number;
  quantity: number;
  currency?: string;
}
export interface CartLineItemProps {
  item: CartLineItemData;
  onQuantityChange: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
  className?: string;
}
export const CartLineItem = ({
  item,
  onQuantityChange,
  onRemove,
  className
}: CartLineItemProps) => {
  return (
    <div className={clsx('flex gap-4 py-4', className)}>
      <div className="w-20 h-24 flex-shrink-0 rounded-gm-md overflow-hidden bg-gm-bg-soft">
        {item.image ?
        <Image
          src={item.image}
          alt={item.title}
          width={80}
          height={96}
          className="w-full h-full object-cover" /> :


        <div className="w-full h-full flex items-center justify-center text-gm-text-muted text-xs">
            Bez obrázka
          </div>
        }
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-heading text-base text-gm-text truncate">
            {item.title}
          </h3>
          <button
            type="button"
            onClick={() => onRemove(item.id)}
            aria-label={`Odstrániť ${item.title}`}
            className="p-1 text-gm-text-muted hover:text-gm-primary transition-colors gm-focus-ring rounded-gm-sm">
            
            <Trash2Icon className="w-4 h-4" />
          </button>
        </div>
        {item.variant &&
        <p className="text-sm text-gm-text-muted mt-0.5">{item.variant}</p>
        }
        <div className="flex items-center justify-between mt-3">
          <QuantityStepper
            value={item.quantity}
            onChange={(q) => onQuantityChange(item.id, q)} />
          
          <PriceTag
            amount={item.price * item.quantity}
            currency={item.currency} />
          
        </div>
      </div>
    </div>);

};