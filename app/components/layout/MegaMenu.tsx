'use client';
import React from 'react';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link'; // Import Link for navigation

// Define the shape of a single collection
interface ShopifyCollection {
  id: string;
  title: string;
  handle: string;
}

interface MegaMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onMouseEnter?: () => void;
  collections: ShopifyCollection[];
}

export const MegaMenu = ({ isOpen, onClose, onMouseEnter, collections }: MegaMenuProps) => {
  if (!isOpen) return null;

  return (
    <div
      className="absolute top-full left-0 right-0 w-full bg-gm-surface shadow-gm-soft border-t border-gm-border overflow-hidden transition-all duration-300 ease-in-out origin-top"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onClose}
    >
      <div className="gm-container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <h3 className="text-xl font-heading mb-6 text-gm-text">Nakupovať podľa</h3>
            <ul className="space-y-4">
              <li>
                <Link href="/collections/frontpage" onClick={onClose} className="text-gm-text-muted hover:text-gm-primary transition-colors">
                  Všetky produkty
                </Link>
              </li>
              {collections.map((collection) => (
                <li key={collection.id}>
                  <Link href={`/collections/${collection.handle}`} onClick={onClose} className="text-gm-text-muted hover:text-gm-primary transition-colors">
                    {collection.title}
                  </Link>
                </li>
              ))}
            </ul>
            <Link href="/collections/frontpage" onClick={onClose} className="inline-flex items-center mt-8 text-gm-primary font-medium hover:text-gm-primary-hover transition-colors">
              Zobraziť všetko <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>

          <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="group cursor-pointer">
              <div className="relative aspect-[4/3] rounded-gm-md overflow-hidden mb-4">
                <Image
                  src="https://images.unsplash.com/photo-1617897903246-719242758050?q=80&w=800&auto=format&fit=crop"
                  alt="Imunita a Zdravie"
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-300" />
              </div>
              <h4 className="font-heading text-lg mb-2">Imunita a Zdravie</h4>
            </div>
            <div className="group cursor-pointer">
              <div className="relative aspect-[4/3] rounded-gm-md overflow-hidden mb-4">
                <Image
                  src="https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=800&auto=format&fit=crop"
                  alt="Krása a Vitalita"
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-300" />
              </div>
              <h4 className="font-heading text-lg mb-2">Krása a Vitalita</h4>
            </div>
            <div className="group cursor-pointer">
              <div className="relative aspect-[4/3] rounded-gm-md overflow-hidden mb-4">
                <Image
                  src="https://images.unsplash.com/photo-1550831107-1553da8c8464?q=80&w=800&auto=format&fit=crop"
                  alt="Energia a Spánok"
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-300" />
              </div>
              <h4 className="font-heading text-lg mb-2">Energia a Spánok</h4>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
