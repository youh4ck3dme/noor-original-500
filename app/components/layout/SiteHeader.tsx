'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { clsx } from 'clsx';
import { Search, ShoppingBag, Menu, User } from 'lucide-react';
import { MegaMenu } from './MegaMenu';
import { SearchDrawerWrapper } from './SearchDrawerWrapper';
import { AnnouncementBar } from './AnnouncementBar';
import { useCart } from '@/app/components/providers/CartProvider';

interface ShopifyCollection {
  id: string;
  title: string;
  handle: string;
}

interface SiteHeaderProps {
  collections: ShopifyCollection[];
}

export const SiteHeader = ({ collections }: SiteHeaderProps) => {
  const { totalQuantity, openCart } = useCart();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <AnnouncementBar />
      <header
        className={clsx(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
          isScrolled || isMegaMenuOpen
            ? 'bg-white/90 backdrop-blur-md border-b border-gm-border py-4 shadow-sm translate-y-0'
            : 'bg-transparent border-transparent py-6 translate-y-9',
          isMegaMenuOpen && 'translate-y-0',
        )}
      >
        <div className="gm-container flex items-center justify-between">
          <div className="md:hidden flex items-center">
            <button className="p-2 -ml-2 text-gm-text hover:text-gm-primary transition-colors">
              <Menu className="w-6 h-6" />
            </button>
          </div>

          <nav className="hidden md:flex items-center space-x-8 flex-1">
            <div
              className="h-full py-2 cursor-pointer text-sm font-medium text-gm-text hover:text-gm-primary transition-colors"
              onMouseEnter={() => setIsMegaMenuOpen(true)}
            >
              Obchod
            </div>
            <Link href="/about" className="text-sm font-medium text-gm-text hover:text-gm-primary transition-colors">
              O nás
            </Link>
            <Link href="/magazine" className="text-sm font-medium text-gm-text hover:text-gm-primary transition-colors">
              Magazín
            </Link>
          </nav>

          <div className="flex-1 md:flex-none text-center">
            <Link href="/" className="text-2xl md:text-3xl font-heading tracking-wider font-semibold text-gm-text">
              GROWMEDICA
            </Link>
          </div>

          <div className="flex items-center justify-end space-x-4 md:space-x-6 flex-1">
            <button
              className="text-gm-text hover:text-gm-primary transition-colors hidden md:block"
              onClick={() => setIsSearchOpen(true)}
              aria-label="Otvoriť vyhľadávanie"
            >
              <Search className="w-5 h-5" />
            </button>
            <Link
              href="/ucet"
              className="text-gm-text hover:text-gm-primary transition-colors hidden md:block"
              aria-label="Môj účet"
            >
              <User className="w-5 h-5" />
            </Link>
            <button
              className="text-gm-text hover:text-gm-primary transition-colors relative"
              onClick={openCart}
              aria-label="Otvoriť košík"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalQuantity > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-gm-primary text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {totalQuantity}
                </span>
              )}
            </button>
          </div>
        </div>

        <MegaMenu
          isOpen={isMegaMenuOpen}
          onClose={() => setIsMegaMenuOpen(false)}
          onMouseEnter={() => setIsMegaMenuOpen(true)}
          collections={collections}
        />
      </header>

      <SearchDrawerWrapper open={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};
