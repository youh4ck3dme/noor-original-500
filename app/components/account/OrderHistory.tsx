'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/app/components/ds/Button';
import { GlassPanel } from '@/app/components/ds/GlassPanel';
import { useToast } from '@/app/components/ds/Toast';
import { useAuth } from '@/app/components/providers/AuthProvider';
import type { ShopifyOrderSummary } from '@/app/lib/shopify-customers';

export function OrderHistory() {
  const searchParams = useSearchParams();
  const { idToken, refreshToken } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [linking, setLinking] = useState(false);
  const [linked, setLinked] = useState(false);
  const [orders, setOrders] = useState<ShopifyOrderSummary[]>([]);

  const loadOrders = useCallback(
    async (options?: { showLoading?: boolean }) => {
      const token = idToken ?? (await refreshToken());
      if (!token) {
        return;
      }

      if (options?.showLoading) {
        setLoading(true);
      }

      try {
        const response = await fetch('/api/orders', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error('Nepodarilo sa načítať objednávky.');
        }

        const data = await response.json();
        setLinked(Boolean(data.linked));
        setOrders(data.orders ?? []);
      } catch {
        toast({ title: 'Objednávky sa nepodarilo načítať.', variant: 'error' });
      } finally {
        setLoading(false);
      }
    },
    [idToken, refreshToken, toast],
  );

  useEffect(() => {
    let active = true;

    (async () => {
      const token = idToken ?? (await refreshToken());
      if (!token || !active) {
        return;
      }

      if (searchParams.get('shopify') === 'connected') {
        try {
          await fetch('/api/profile/link-shopify', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
          });
        } catch {
          // Orders fetch below will surface errors if linking failed.
        }
      }

      try {
        const response = await fetch('/api/orders', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error('Nepodarilo sa načítať objednávky.');
        }

        const data = await response.json();
        if (!active) {
          return;
        }

        setLinked(Boolean(data.linked));
        setOrders(data.orders ?? []);
        if (searchParams.get('shopify') === 'connected' && data.linked) {
          toast({ title: 'Shopify účet bol prepojený.', variant: 'success' });
        }
      } catch {
        if (active) {
          toast({ title: 'Objednávky sa nepodarilo načítať.', variant: 'error' });
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [idToken, refreshToken, searchParams, toast]);

  const linkAccount = async () => {
    const token = idToken ?? (await refreshToken());
    if (!token) {
      return;
    }

    setLinking(true);
    try {
      const response = await fetch('/api/profile/link-shopify', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error?.message ?? 'Prepojenie zlyhalo.');
      }

      if (!data.linked) {
        toast({
          title: 'Shopify zákazník s týmto e-mailom nebol nájdený.',
          variant: 'error',
        });
        return;
      }

      toast({ title: 'Účet bol prepojený so Shopify.', variant: 'success' });
      await loadOrders({ showLoading: true });
    } catch (error) {
      toast({
        title: error instanceof Error ? error.message : 'Prepojenie zlyhalo.',
        variant: 'error',
      });
    } finally {
      setLinking(false);
    }
  };

  if (loading) {
    return <p className="text-gm-text-muted">Načítavame objednávky...</p>;
  }

  if (!linked) {
    return (
      <GlassPanel intensity="light" className="p-8 text-center space-y-4">
        <h2 className="text-2xl font-heading text-gm-text">Moje objednávky</h2>
        <p className="text-gm-text-muted">
          Prihláste sa cez Shopify Customer Account API alebo prepojte existujúci Shopify zákazník
          podľa e-mailu.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              window.location.href = '/api/auth/shopify/login?next=/ucet';
            }}
          >
            Prihlásiť cez Shopify
          </Button>
          <Button type="button" onClick={linkAccount} disabled={linking}>
            {linking ? 'Prepájame...' : 'Prepojiť podľa e-mailu'}
          </Button>
        </div>
      </GlassPanel>
    );
  }

  if (orders.length === 0) {
    return (
      <GlassPanel intensity="light" className="p-8">
        <h2 className="text-2xl font-heading text-gm-text mb-2">Moje objednávky</h2>
        <p className="text-gm-text-muted">Zatiaľ nemáte žiadne objednávky v Shopify.</p>
      </GlassPanel>
    );
  }

  return (
    <GlassPanel intensity="light" className="p-8 space-y-4">
      <h2 className="text-2xl font-heading text-gm-text">Moje objednávky</h2>
      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="rounded-gm-md border border-gm-border bg-white/80 p-4 space-y-2"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-medium text-gm-text">{order.name}</p>
              <p className="text-sm text-gm-text-muted">
                {order.totalAmount} {order.currencyCode}
              </p>
            </div>
            <p className="text-xs text-gm-text-muted">
              {order.financialStatus} · {order.fulfillmentStatus}
              {order.processedAt ? ` · ${new Date(order.processedAt).toLocaleDateString('sk-SK')}` : ''}
            </p>
            <ul className="text-sm text-gm-text-muted list-disc pl-5">
              {order.lineItems.map((item, index) => (
                <li key={`${order.id}-${index}`}>
                  {item.title} × {item.quantity}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </GlassPanel>
  );
}
