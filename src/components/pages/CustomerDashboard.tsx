import React, { useState } from 'react';
import {
  User,
  Package,
  MapPin,
  Settings,
  LogOut,
  ChevronRight } from
'lucide-react';
import { LiquidButton } from '../ui/LiquidButton';
import { clsx } from 'clsx';
export const CustomerDashboard = () => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'orders' | 'addresses' | 'settings'>(
    'overview');
  const orders = [
  {
    id: '#GM-10492',
    date: '12. Mája 2026',
    status: 'Doručené',
    total: '112,90 €',
    items: 'Lipozomálny Vitamín C, Prémiový Kolagén...'
  },
  {
    id: '#GM-10384',
    date: '03. Apríla 2026',
    status: 'Doručené',
    total: '47,95 €',
    items: 'Horčík Bisglycinát'
  },
  {
    id: '#GM-10211',
    date: '15. Februára 2026',
    status: 'Doručené',
    total: '86,90 €',
    items: 'Omega-3 Premium, Zinok'
  }];

  return (
    <div className="pt-32 pb-24 min-h-[80vh]">
      <div className="gm-container">
        <div className="mb-12">
          <h1 className="text-3xl md:text-4xl font-heading text-gm-text mb-2">
            Môj účet
          </h1>
          <p className="text-gm-text-muted">
            Vitajte späť, radi vás opäť vidíme.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-12">
          {/* Sidebar Navigation */}
          <aside className="w-full md:w-64 flex-shrink-0">
            <nav className="flex flex-col space-y-2">
              <button
                onClick={() => setActiveTab('overview')}
                className={clsx(
                  'flex items-center px-4 py-3 rounded-gm-md transition-colors text-left',
                  activeTab === 'overview' ?
                  'bg-gm-bg-soft text-gm-primary font-medium' :
                  'text-gm-text hover:bg-gm-bg-soft/50'
                )}>
                
                <User className="w-5 h-5 mr-3" /> Prehľad
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={clsx(
                  'flex items-center px-4 py-3 rounded-gm-md transition-colors text-left',
                  activeTab === 'orders' ?
                  'bg-gm-bg-soft text-gm-primary font-medium' :
                  'text-gm-text hover:bg-gm-bg-soft/50'
                )}>
                
                <Package className="w-5 h-5 mr-3" /> Moje objednávky
              </button>
              <button
                onClick={() => setActiveTab('addresses')}
                className={clsx(
                  'flex items-center px-4 py-3 rounded-gm-md transition-colors text-left',
                  activeTab === 'addresses' ?
                  'bg-gm-bg-soft text-gm-primary font-medium' :
                  'text-gm-text hover:bg-gm-bg-soft/50'
                )}>
                
                <MapPin className="w-5 h-5 mr-3" /> Adresy
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={clsx(
                  'flex items-center px-4 py-3 rounded-gm-md transition-colors text-left',
                  activeTab === 'settings' ?
                  'bg-gm-bg-soft text-gm-primary font-medium' :
                  'text-gm-text hover:bg-gm-bg-soft/50'
                )}>
                
                <Settings className="w-5 h-5 mr-3" /> Nastavenia
              </button>
              <button className="flex items-center px-4 py-3 rounded-gm-md transition-colors text-left text-red-500 hover:bg-red-50 mt-4">
                <LogOut className="w-5 h-5 mr-3" /> Odhlásiť sa
              </button>
            </nav>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1">
            {activeTab === 'overview' &&
            <div className="space-y-8 animate-fade-in">
                <div className="bg-gm-bg-soft p-8 rounded-gm-lg">
                  <h2 className="text-2xl font-heading text-gm-text mb-4">
                    Dobrý deň, Ján Novák
                  </h2>
                  <p className="text-gm-text-muted mb-6">
                    Z vášho panelu môžete zobraziť vaše nedávne objednávky,
                    spravovať dodacie a fakturačné adresy a upravovať vaše heslo
                    a detaily účtu.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white p-6 rounded-gm-md border border-gm-border shadow-sm">
                      <p className="text-sm text-gm-text-muted mb-1">
                        Celkové objednávky
                      </p>
                      <p className="text-3xl font-heading text-gm-text">12</p>
                    </div>
                    <div className="bg-white p-6 rounded-gm-md border border-gm-border shadow-sm">
                      <p className="text-sm text-gm-text-muted mb-1">
                        Vernostné body
                      </p>
                      <p className="text-3xl font-heading text-gm-primary">
                        450
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-heading text-gm-text">
                      Nedávna objednávka
                    </h3>
                    <button
                    onClick={() => setActiveTab('orders')}
                    className="text-sm text-gm-primary hover:text-gm-primary-hover font-medium">
                    
                      Zobraziť všetky
                    </button>
                  </div>
                  <div className="border border-gm-border rounded-gm-md p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-gm-soft transition-shadow">
                    <div>
                      <p className="font-medium text-gm-text">{orders[0].id}</p>
                      <p className="text-sm text-gm-text-muted mt-1">
                        {orders[0].date} • {orders[0].items}
                      </p>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-6">
                      <div className="text-right">
                        <p className="font-medium text-gm-text">
                          {orders[0].total}
                        </p>
                        <p className="text-sm text-green-600">
                          {orders[0].status}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gm-text-muted" />
                    </div>
                  </div>
                </div>
              </div>
            }

            {activeTab === 'orders' &&
            <div className="animate-fade-in">
                <h2 className="text-2xl font-heading text-gm-text mb-6">
                  História objednávok
                </h2>
                <div className="space-y-4">
                  {orders.map((order, idx) =>
                <div
                  key={idx}
                  className="border border-gm-border rounded-gm-md p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-gm-soft transition-shadow cursor-pointer">
                  
                      <div>
                        <p className="font-medium text-gm-text">{order.id}</p>
                        <p className="text-sm text-gm-text-muted mt-1">
                          {order.date}
                        </p>
                        <p className="text-sm text-gm-text-muted mt-2">
                          {order.items}
                        </p>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-6">
                        <div className="text-right">
                          <p className="font-medium text-gm-text">
                            {order.total}
                          </p>
                          <span className="inline-block mt-1 px-2.5 py-1 bg-green-50 text-green-700 text-xs rounded-full">
                            {order.status}
                          </span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gm-text-muted" />
                      </div>
                    </div>
                )}
                </div>
              </div>
            }

            {activeTab === 'addresses' &&
            <div className="animate-fade-in">
                <h2 className="text-2xl font-heading text-gm-text mb-6">
                  Moje adresy
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border border-gm-border rounded-gm-md p-6 relative">
                    <span className="absolute top-6 right-6 text-xs font-medium bg-gm-bg-soft px-2 py-1 rounded text-gm-text">
                      Predvolená
                    </span>
                    <h3 className="font-medium text-gm-text mb-4">
                      Fakturačná adresa
                    </h3>
                    <div className="text-sm text-gm-text-muted space-y-1 mb-6">
                      <p className="font-medium text-gm-text">Ján Novák</p>
                      <p>Slnečná 45</p>
                      <p>821 04 Bratislava</p>
                      <p>Slovensko</p>
                      <p className="pt-2">+421 900 123 456</p>
                    </div>
                    <button className="text-sm text-gm-primary hover:text-gm-primary-hover font-medium">
                      Upraviť adresu
                    </button>
                  </div>

                  <div className="border border-gm-border rounded-gm-md p-6 flex flex-col items-center justify-center text-center min-h-[200px] border-dashed hover:bg-gm-bg-soft/50 transition-colors cursor-pointer">
                    <MapPin className="w-8 h-8 text-gm-text-muted mb-3" />
                    <p className="font-medium text-gm-text">
                      Pridať novú adresu
                    </p>
                  </div>
                </div>
              </div>
            }

            {activeTab === 'settings' &&
            <div className="animate-fade-in max-w-2xl">
                <h2 className="text-2xl font-heading text-gm-text mb-6">
                  Nastavenia účtu
                </h2>
                <form
                className="space-y-6"
                onSubmit={(e) => e.preventDefault()}>
                
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gm-text">
                        Meno
                      </label>
                      <input
                      type="text"
                      defaultValue="Ján"
                      className="w-full border border-gm-border rounded-gm-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gm-primary/50 bg-white" />
                    
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gm-text">
                        Priezvisko
                      </label>
                      <input
                      type="text"
                      defaultValue="Novák"
                      className="w-full border border-gm-border rounded-gm-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gm-primary/50 bg-white" />
                    
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gm-text">
                      E-mailová adresa
                    </label>
                    <input
                    type="email"
                    defaultValue="jan.novak@example.com"
                    className="w-full border border-gm-border rounded-gm-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gm-primary/50 bg-white" />
                  
                  </div>

                  <div className="pt-6 border-t border-gm-border">
                    <h3 className="text-lg font-medium text-gm-text mb-4">
                      Zmena hesla
                    </h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gm-text">
                          Aktuálne heslo
                        </label>
                        <input
                        type="password"
                        placeholder="••••••••"
                        className="w-full border border-gm-border rounded-gm-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gm-primary/50 bg-white" />
                      
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gm-text">
                          Nové heslo
                        </label>
                        <input
                        type="password"
                        placeholder="Minimálne 8 znakov"
                        className="w-full border border-gm-border rounded-gm-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gm-primary/50 bg-white" />
                      
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <LiquidButton type="submit">Uložiť zmeny</LiquidButton>
                  </div>
                </form>
              </div>
            }
          </main>
        </div>
      </div>
    </div>);

};