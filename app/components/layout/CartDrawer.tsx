'use client';
import React from 'react';
import Image from 'next/image';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { LiquidButton } from '../ui/LiquidButton';
interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartDrawer = ({ isOpen, onClose }: CartDrawerProps) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className="fixed top-0 right-0 z-[70] flex h-full w-full max-w-md translate-x-0 transform flex-col bg-gm-bg shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
        role="dialog"
        aria-modal="true"
        aria-label="Nákupný košík"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gm-border">
          <h2 className="font-heading text-2xl text-gm-text flex items-center">
            <ShoppingBag className="mr-3 w-5 h-5" /> Váš košík (1)
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gm-text-muted hover:text-gm-text transition-colors rounded-full hover:bg-gm-bg-soft"
            aria-label="Zavrieť košík"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex gap-4 border-b border-gm-border pb-6">
            <div className="w-24 h-32 bg-gm-bg-soft rounded-gm-sm overflow-hidden flex-shrink-0">
              <Image
                src="https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=400&auto=format&fit=crop"
                alt="HydraSilk Cleanser"
                width={96}
                height={128}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col justify-between flex-1">
              <div>
                <h3 className="font-medium text-gm-text text-sm">
                  HydraSilk Skin Reviving Cleanser
                </h3>
                <p className="text-gm-text-muted text-xs mt-1">150ml</p>
              </div>
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center border border-gm-border rounded-full px-2 py-1">
                  <button className="p-1 text-gm-text-muted hover:text-gm-text" aria-label="Znížiť množstvo">
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-sm font-medium w-8 text-center">1</span>
                  <button className="p-1 text-gm-text-muted hover:text-gm-text" aria-label="Zvýšiť množstvo">
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
                <span className="font-medium text-gm-text">€47.95</span>
              </div>
            </div>
          </div>

          {/* Upsell */}
          <div className="mt-8">
            <h4 className="text-sm font-medium text-gm-text mb-4">Mohlo by sa vám páčiť</h4>
            <div className="bg-gm-bg-soft p-4 rounded-gm-md flex items-center gap-4">
              <Image
                src="https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?q=80&w=200&auto=format&fit=crop"
                alt="Moisturizer"
                width={64}
                height={64}
                className="w-16 h-16 object-cover rounded-gm-sm"
              />
              <div className="flex-1">
                <h5 className="text-sm font-medium text-gm-text">Micro-Sculpting Moisturizer</h5>
                <p className="text-xs text-gm-text-muted mt-0.5">€64.95</p>
              </div>
              <button className="text-xs font-medium bg-white px-3 py-1.5 rounded-full shadow-sm hover:bg-gm-primary hover:text-white transition-colors">
                Pridať do košíka
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-gm-surface border-t border-gm-border">
          <div className="flex justify-between items-center mb-4 text-gm-text">
            <span className="font-medium">Medzisúčet</span>
            <span className="font-heading text-xl">€47.95</span>
          </div>
          <p className="text-xs text-gm-text-muted mb-6 text-center">
            Cena dopravy a prípadné zľavy budú vypočítané v pokladni.
          </p>
          <LiquidButton fullWidth>Prejsť do pokladne</LiquidButton>
        </div>
      </div>
    </>
  );
};
