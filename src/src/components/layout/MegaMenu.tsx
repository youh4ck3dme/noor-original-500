import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { StorefrontNavItem } from '@/lib/theme/storefront-types';
interface MegaMenuProps {
  isOpen: boolean;
  onClose: () => void;
  items: StorefrontNavItem[];
}
export const MegaMenu = ({ isOpen, onClose, items }: MegaMenuProps) => {
  if (!isOpen) return null;
  return (
    <div
      className="absolute top-full left-0 w-full bg-gm-surface shadow-gm-soft border-t border-gm-border overflow-hidden transition-all duration-300 ease-in-out origin-top"
      onMouseLeave={onClose}>
      
      <div className="gm-container py-12">
        <div className="grid grid-cols-4 gap-8">
          {items.map((category, idx) =>
          <div key={idx} className="group">
              {category.image &&
            <div className="relative aspect-[4/3] rounded-gm-md overflow-hidden mb-4">
                  <Image
                src={category.image.url}
                alt={category.image.altText || category.title}
                fill
                className="object-cover gm-card-hover"
                sizes="(max-width: 768px) 100vw, 25vw" />
              
                </div>
            }
              <h4 className="font-serif text-lg mb-2 text-gm-text">
                {category.title}
              </h4>
              {category.items && category.items.length > 0 &&
            <ul className="space-y-1">
                  {category.items.map((link, lIdx) =>
              <li key={lIdx}>
                      <Link
                  href={link.href}
                  className="text-sm text-gm-text-muted hover:text-gm-text transition-colors gm-focus-ring"
                  onClick={onClose}>
                  
                        {link.title}
                      </Link>
                    </li>
              )}
                </ul>
            }
            </div>
          )}
        </div>
      </div>
    </div>);

};