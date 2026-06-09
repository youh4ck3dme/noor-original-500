import React from 'react';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export const SiteFooter = () => {
  return (
    <footer className="bg-gm-text text-white pt-20 pb-10">
      <div className="gm-container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand & Newsletter */}
          <div className="lg:col-span-2">
            <h2 className="text-3xl font-heading tracking-wider mb-6">
              <Link href="/">GROWMEDICA</Link>
            </h2>
            <p className="text-white/70 max-w-sm mb-8 font-light leading-relaxed">
              Prémiové doplnky výživy vytvorené z čistých, prírodných ingrediencií pre vaše prirodzené zdravie a vitalitu.
            </p>
            <div className="max-w-md">
              <h3 className="text-sm font-medium mb-4 uppercase tracking-wider">Odoberať novinky</h3>
              <div className="flex border-b border-white/30 pb-2">
                <input
                  type="email"
                  placeholder="Váš e-mail"
                  className="bg-transparent border-none outline-none flex-1 text-white placeholder:text-white/50"
                />
                <button className="text-white hover:text-gm-primary transition-colors" aria-label="Odoberať">
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Links 1 */}
          <div>
            <h3 className="text-sm font-medium mb-6 uppercase tracking-wider">Obchod</h3>
            <ul className="space-y-4">
              <li>
                <Link href="/collections/frontpage" className="text-white/70 hover:text-white transition-colors font-light">
                  Všetky produkty
                </Link>
              </li>
              <li>
                <Link href="/collections/best-sellers" className="text-white/70 hover:text-white transition-colors font-light">
                  Najpredávanejšie
                </Link>
              </li>
              <li>
                <Link href="/collections/vitamins" className="text-white/70 hover:text-white transition-colors font-light">
                  Vitamíny
                </Link>
              </li>
              <li>
                <Link href="/collections/minerals" className="text-white/70 hover:text-white transition-colors font-light">
                  Minerály
                </Link>
              </li>
            </ul>
          </div>

          {/* Links 2 */}
          <div>
            <h3 className="text-sm font-medium mb-6 uppercase tracking-wider">Podpora</h3>
            <ul className="space-y-4">
              <li>
                <Link href="/contact" className="text-white/70 hover:text-white transition-colors font-light">
                  Kontakt
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-white/70 hover:text-white transition-colors font-light">
                  Časté otázky
                </Link>
              </li>
              <li>
                <Link href="/shipping-returns" className="text-white/70 hover:text-white transition-colors font-light">
                  Doprava a vrátenie
                </Link>
              </li>
              <li>
                <Link href="/order-tracking" className="text-white/70 hover:text-white transition-colors font-light">
                  Sledovanie objednávky
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/20 pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-white/50 font-light">
          <p>&copy; {new Date().getFullYear()} GrowMedica. Všetky práva vyhradené.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/privacy-policy" className="hover:text-white transition-colors">Ochrana osobných údajov</Link>
            <Link href="/terms-of-service" className="hover:text-white transition-colors">Obchodné podmienky</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
