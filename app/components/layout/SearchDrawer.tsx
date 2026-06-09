'use client';
import React from 'react';
import { X, Search } from 'lucide-react';
interface SearchDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchDrawer = ({ isOpen, onClose }: SearchDrawerProps) => {
  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className="fixed top-0 left-0 z-[70] w-full translate-y-0 transform bg-gm-surface shadow-md transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
        role="dialog"
        aria-modal="true"
        aria-label="Vyhľadávanie"
      >
        <div className="gm-container py-8">
          <div className="flex items-center justify-between mb-8">
            <div className="relative flex-1 max-w-3xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gm-text-muted" />
              <input
                type="text"
                placeholder="Hľadať produkty, kategórie..."
                className="w-full bg-gm-bg-soft border-none rounded-full py-4 pl-14 pr-6 text-lg text-gm-text focus:outline-none focus:ring-2 focus:ring-gm-primary/50 transition-shadow"
                autoFocus={isOpen}
              />
            </div>
            <button
              onClick={onClose}
              className="ml-6 p-2 text-gm-text-muted hover:text-gm-text transition-colors rounded-full hover:bg-gm-bg-soft"
              aria-label="Zavrieť vyhľadávanie"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="max-w-3xl mx-auto">
            <h3 className="text-sm font-medium text-gm-text-muted mb-4 uppercase tracking-wider">Populárne vyhľadávania</h3>
            <div className="flex flex-wrap gap-2">
              {[
                'Vitamín C',
                'Kolagén',
                'Kyselina hyalurónová',
                'Denný krém',
                'SPF',
              ].map((term) => (
                <button
                  key={term}
                  className="px-4 py-2 bg-gm-bg-soft rounded-full text-sm text-gm-text hover:bg-gm-primary hover:text-white transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
