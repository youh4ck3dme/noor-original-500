import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { clsx } from 'clsx';
import { Search, ShoppingBag, Menu, User } from 'lucide-react';
import { MegaMenu } from './MegaMenu';
import { StorefrontNavItem } from '@/lib/theme/storefront-types';
export interface SiteHeaderLabels {
  menu?: string;
  search?: string;
  account?: string;
  cart?: string;
}
interface SiteHeaderClientProps {
  navItems: StorefrontNavItem[];
  cartCount: number;
  showAccountLink?: boolean;
  onSearchOpen?: () => void;
  onCartOpen?: () => void;
  onMenuOpen?: () => void;
  labels?: SiteHeaderLabels;
}
export const SiteHeaderClient = ({
  navItems,
  cartCount,
  showAccountLink = true,
  onSearchOpen,
  onCartOpen,
  onMenuOpen,
  labels
}: SiteHeaderClientProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const defaultLabels = {
    menu: labels?.menu || 'Menu',
    search: labels?.search || 'Vyhľadávanie',
    account: labels?.account || 'Účet',
    cart: labels?.cart || 'Košík'
  };
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, {
      passive: true
    });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  return (
    <header
      className={clsx(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
        isScrolled || activeMenu ?
        'bg-white/90 backdrop-blur-md border-b border-gm-border py-4 shadow-sm translate-y-0' :
        'bg-transparent border-transparent py-6 translate-y-9'
      )}>
      
      <div className="gm-container flex items-center justify-between">
        <div className="md:hidden flex items-center">
          <button
            type="button"
            onClick={onMenuOpen}
            className="p-2 -ml-2 text-gm-text hover:text-gm-primary transition-colors gm-focus-ring"
            aria-label={defaultLabels.menu}>
            
            <Menu className="w-6 h-6" />
          </button>
        </div>

        <nav className="hidden md:flex items-center space-x-8 flex-1">
          {navItems.map((item) =>
          <div
            key={item.title}
            className="h-full py-2 cursor-pointer text-sm font-medium text-gm-text hover:text-gm-primary transition-colors"
            onMouseEnter={() => setActiveMenu(item.title)}>
            
              {item.items && item.items.length > 0 ?
            <span
              className="gm-focus-ring"
              tabIndex={0}
              onFocus={() => setActiveMenu(item.title)}>
              
                  {item.title}
                </span> :

            <Link href={item.href} className="gm-focus-ring">
                  {item.title}
                </Link>
            }
            </div>
          )}
        </nav>

        <div className="flex-1 md:flex-none text-center">
          <Link
            href="/"
            className="text-2xl md:text-3xl font-serif tracking-wider font-semibold text-gm-text gm-focus-ring">
            
            GROWMEDICA
          </Link>
        </div>

        <div className="flex items-center justify-end space-x-4 md:space-x-6 flex-1">
          <button
            type="button"
            onClick={onSearchOpen}
            className="text-gm-text hover:text-gm-primary transition-colors hidden md:block gm-focus-ring"
            aria-label={defaultLabels.search}>
            
            <Search className="w-5 h-5" />
          </button>

          {showAccountLink &&
          <Link
            href="/account"
            className="text-gm-text hover:text-gm-primary transition-colors hidden md:block gm-focus-ring"
            aria-label={defaultLabels.account}>
            
              <User className="w-5 h-5" />
            </Link>
          }

          <button
            type="button"
            onClick={onCartOpen}
            className="text-gm-text hover:text-gm-primary transition-colors relative gm-focus-ring"
            aria-label={defaultLabels.cart}>
            
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 &&
            <span className="absolute -top-1.5 -right-1.5 bg-gm-primary text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            }
          </button>
        </div>
      </div>

      {navItems.map(
        (item) =>
        item.items &&
        item.items.length > 0 &&
        <MegaMenu
          key={item.title}
          isOpen={activeMenu === item.title}
          onClose={() => setActiveMenu(null)}
          items={item.items} />


      )}
    </header>);

};