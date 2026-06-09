'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AdminAuthGate } from '@/app/components/admin/AdminAuthGate';
import { Logo } from '@/app/components/ds';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  BarChart3,
  Sparkles,
  Settings,
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { icon: LayoutDashboard, label: 'Domov', href: '/admin' },
    { icon: ShoppingCart, label: 'Objednávky', href: '/admin/objednavky' },
    { icon: Package, label: 'Produkty', href: '/admin/produkty' },
    { icon: Users, label: 'Zákazníci', href: '/admin/zakaznici' },
    { icon: BarChart3, label: 'Analytika', href: '/admin/analytika' },
    { icon: Sparkles, label: 'Agentic AI', href: '/admin/ai' },
  ];

  return (
    <AdminAuthGate>
    <div className="flex h-screen bg-[#FDFBF7]">
      <aside className="w-72 hidden md:flex flex-col border-r border-gm-border bg-white/40 backdrop-blur-2xl">
        <div className="p-8">
          <Logo className="scale-110" />
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-gm-lg transition-all duration-300 ${
                  isActive
                    ? 'bg-gm-primary/10 text-gm-text border border-gm-primary/20 shadow-sm'
                    : 'text-gm-text-muted hover:bg-gm-bg-soft hover:text-gm-text'
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-gm-primary' : 'text-gm-text-muted'}`} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 border-b border-gm-border bg-white/20 backdrop-blur-md flex items-center px-8 gap-6">
          <div className="flex-1 relative group">
            <div className="absolute inset-0 bg-gm-primary/5 blur-xl group-focus-within:bg-gm-primary/10 transition-all rounded-full" />
            <input
              type="text"
              placeholder="Mistral, vytvor kampaň na vypredaný Zeen Collagen..."
              className="relative w-full bg-white/60 border border-gm-border rounded-full py-3 px-6 pl-12 focus:outline-none focus:ring-2 focus:ring-gm-primary/30 transition-all font-light text-sm italic"
            />
            <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gm-primary animate-pulse" />
          </div>
          <Settings className="w-5 h-5 text-gm-text-muted cursor-pointer hover:text-gm-primary transition-colors" />
        </header>

        <div className="flex-1 overflow-y-auto bg-gm-bg-soft/30 p-8">{children}</div>
      </main>
    </div>
    </AdminAuthGate>
  );
}
