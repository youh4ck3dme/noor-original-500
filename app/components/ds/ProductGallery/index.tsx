'use client';

import { clsx } from 'clsx';
import Image from 'next/image';
import React, { useState } from 'react';

export interface GalleryImage {
  url: string;
  altText?: string;
}

export interface ProductGalleryProps {
  images: GalleryImage[];
  className?: string;
}

export const ProductGallery = ({ images, className }: ProductGalleryProps) => {
  const [active, setActive] = useState(0);
  if (images.length === 0) return null;

  const current = images[active];

  return (
    <div className={clsx('flex flex-col gap-4', className)}>
      <div className="relative aspect-square rounded-gm-lg overflow-hidden bg-gm-bg-soft">
        <Image
          src={current.url}
          alt={current.altText || 'Produkt'}
          fill
          className="object-cover object-center animate-fade-in"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
      </div>
      {images.length > 1 && (
        <div className="flex gap-3" role="tablist" aria-label="Náhľady produktu">
          {images.map((img, i) => (
            <button
              key={img.url}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={`Obrázok ${i + 1}`}
              onClick={() => setActive(i)}
              className={clsx(
                'relative w-20 h-20 rounded-gm-md overflow-hidden bg-gm-bg-soft transition-all gm-focus-ring',
                i === active
                  ? 'ring-2 ring-gm-primary ring-offset-2'
                  : 'ring-1 ring-gm-border opacity-70 hover:opacity-100',
              )}
            >
              <Image
                src={img.url}
                alt={img.altText || `Náhľad ${i + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
