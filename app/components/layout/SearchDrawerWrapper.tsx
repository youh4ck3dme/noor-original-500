'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SearchDrawer, SearchSuggestion } from '@/app/components/ds/SearchDrawer';

export function SearchDrawerWrapper({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [loading, setLoading] = useState(false);

  const handleClose = useCallback(() => {
    setQuery('');
    setSuggestions([]);
    setLoading(false);
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!open) return;

    const trimmed = query.trim();
    if (trimmed.length < 2) return;

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`);
        const data = await response.json();
        setSuggestions(data.results ?? []);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, open]);

  return (
    <SearchDrawer
      open={open}
      onClose={handleClose}
      query={query}
      onQueryChange={setQuery}
      suggestions={suggestions}
      loading={loading}
      onSelect={(suggestion) => {
        if (suggestion.href) {
          router.push(suggestion.href);
          handleClose();
        }
      }}
    />
  );
}
