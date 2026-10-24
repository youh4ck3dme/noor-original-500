import Link from 'next/link';
import { Button } from '@/app/components/ds';
import { Package, ShoppingCart, Users, BarChart3, TrendingUp, Clock } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Dashboard | GrowMedica Admin',
};

export default function AdminDashboardPage() {
  const stats = [
    { label: 'Produkty', value: '128', icon: Package, color: 'text-gm-primary', bgColor: 'bg-gm-primary/10' },
    { label: 'Objednávky', value: '42', icon: ShoppingCart, color: 'text-green-600', bgColor: 'bg-green-100' },
    { label: 'Zákazníci', value: '1,234', icon: Users, color: 'text-blue-600', bgColor: 'bg-blue-100' },
    { label: 'Tržby', value: '€12,345', icon: BarChart3, color: 'text-purple-600', bgColor: 'bg-purple-100' },
  ];

  const quickActions = [
    { label: 'Nový produkt', href: '/admin/products', icon: Package },
    { label: 'AI Optimalizácia', href: '/admin/products', icon: TrendingUp },
    { label: 'Rýchla objednávka', href: '/admin/orders', icon: Clock },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gm-text">Admin Dashboard</h1>
        <p className="text-gm-text-muted mt-1">Vítajte späť, GrowMedica Team!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-gm-lg border border-gm-border p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-gm-lg ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gm-text">{stat.value}</p>
                <p className="text-sm text-gm-text-muted">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-gm-lg border border-gm-border p-6">
          <h2 className="text-lg font-semibold text-gm-text mb-4">Rýchle akcie</h2>
          <div className="space-y-3">
            {quickActions.map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className="flex items-center gap-3 p-4 rounded-gm-md hover:bg-gm-bg-soft transition-colors border border-gm-border/50"
              >
                <action.icon className="w-5 h-5 text-gm-text-muted" />
                <span className="text-gm-text">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-gm-lg border border-gm-border p-6">
          <h2 className="text-lg font-semibold text-gm-text mb-4">Aktivity</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-gm-md bg-gm-bg-soft/50">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <div>
                <p className="text-sm font-medium text-gm-text">AI optimalizácia produktov</p>
                <p className="text-xs text-gm-text-muted">Pred 5 minútami</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-gm-md bg-gm-bg-soft/50">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <div>
                <p className="text-sm font-medium text-gm-text">Nový produkt pridaný</p>
                <p className="text-xs text-gm-text-muted">Pred 15 minútami</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-gm-md bg-gm-bg-soft/50">
              <div className="w-2 h-2 rounded-full bg-gm-primary" />
              <div>
                <p className="text-sm font-medium text-gm-text">Mistral AI sync úspešný</p>
                <p className="text-xs text-gm-text-muted">Pred 1 hodinou</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-gm-lg border border-gm-border p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gm-text">Produkty</h2>
          <Button variant="primary">Zobraziť všetky</Button>
        </div>
        <p className="text-gm-text-muted text-sm">Navštívte sekciu Produktov pre správu katalógu.</p>
      </div>
    </div>
  );
}
