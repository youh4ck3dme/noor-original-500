'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { GlassPanel } from '@/app/components/ds/GlassPanel';
import { ProductCard } from '@/app/components/ds/ProductCard';
import { useAuth } from '@/app/components/providers/AuthProvider';
import type { StorefrontProductCard } from '@/app/lib/theme/storefront-types';

type RecommendationItem = {
  score: number;
  matchedTags: string[];
  product: StorefrontProductCard;
};

export function AIRecommendation() {
  const { user, idToken, refreshToken, loading } = useAuth();
  const [items, setItems] = useState<RecommendationItem[]>([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadRecommendations() {
      setFetching(true);
      setError(null);

      try {
        if (!user) {
          const response = await fetch('/api/recommendations/public');
          if (!response.ok) {
            throw new Error('Nepodarilo sa načítať odporúčania.');
          }
          const data = await response.json();
          if (!cancelled) {
            setItems(data.recommendations ?? []);
          }
          return;
        }

        const token = idToken ?? (await refreshToken());
        if (!token) {
          throw new Error('Chýba prihlasovací token.');
        }

        const response = await fetch('/api/recommendations', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error('Nepodarilo sa načítať personalizované odporúčania.');
        }

        const data = await response.json();
        if (!cancelled) {
          setItems(data.recommendations ?? []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Odporúčania nie sú dostupné.');
        }
      } finally {
        if (!cancelled) {
          setFetching(false);
        }
      }
    }

    if (!loading) {
      void loadRecommendations();
    }

    return () => {
      cancelled = true;
    };
  }, [user, idToken, refreshToken, loading]);

  return (
    <GlassPanel intensity="light" className="p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-heading text-gm-text mb-2">AI odporúčania</h2>
        <p className="text-gm-text-muted">
          {user
            ? 'Top 3 doplnky podľa vašich fitness cieľov a Shopify tagov.'
            : 'Prihláste sa a získajte personalizované odporúčania podľa vašich cieľov.'}
        </p>
      </div>

      {fetching && <p className="text-gm-text-muted">Načítavame odporúčania...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {!fetching && !error && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map((item, index) => (
            <motion.div
              key={item.product.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08, duration: 0.35 }}
            >
              <ProductCard product={item.product} />
            </motion.div>
          ))}
        </div>
      )}

      {!user && (
        <div className="mt-6">
          <Link
            href="/ucet/prihlasenie"
            className="text-gm-primary hover:text-gm-primary-hover font-medium"
          >
            Prihláste sa pre personalizované odporúčania →
          </Link>
        </div>
      )}
    </GlassPanel>
  );
}
