'use client';

import React, { useMemo, useState } from 'react';
import { EmptyState } from '@/app/components/ds/EmptyState';
import { FilterSidebar } from '@/app/components/ds/FilterSidebar';
import { Pagination } from '@/app/components/ds/Pagination';
import { ProductGrid } from './ProductGrid';
import type { StorefrontProductCard } from '@/app/lib/theme/storefront-types';

const PAGE_SIZE = 8;

interface CollectionPageClientProps {
  products: StorefrontProductCard[];
}

export function CollectionPageClient({ products }: CollectionPageClientProps) {
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Record<string, string[]>>({});

  const filterGroups = useMemo(
    () => [
      {
        id: 'availability',
        label: 'Dostupnosť',
        options: [
          { id: 'in-stock', label: 'Skladom' },
          { id: 'sold-out', label: 'Vypredané' },
        ],
      },
    ],
    [],
  );

  const filtered = useMemo(() => {
    const availability = selected.availability ?? [];
    if (availability.length === 0) return products;

    return products.filter((product) => {
      if (availability.includes('in-stock') && product.availableForSale) return true;
      if (availability.includes('sold-out') && !product.availableForSale) return true;
      return false;
    });
  }, [products, selected]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (products.length === 0) {
    return (
      <EmptyState
        title="Žiadne produkty"
        description="V tejto kolekcii zatiaľ nie sú žiadne produkty."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-10">
      <FilterSidebar
        groups={filterGroups}
        selected={selected}
        onChange={(groupId, optionId, checked) => {
          setPage(1);
          setSelected((prev) => {
            const current = prev[groupId] ?? [];
            const next = checked
              ? [...current, optionId]
              : current.filter((id) => id !== optionId);
            return { ...prev, [groupId]: next };
          });
        }}
        onClear={() => {
          setSelected({});
          setPage(1);
        }}
      />
      <div>
        <ProductGrid products={pageItems} />
        {totalPages > 1 && (
          <div className="mt-12 flex justify-center">
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>
    </div>
  );
}
