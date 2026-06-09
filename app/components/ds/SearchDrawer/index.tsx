'use client';

import { clsx } from 'clsx';
import Link from 'next/link';
import React, { useEffect, useState, useRef } from 'react';
import { SearchIcon } from 'lucide-react';
import { Drawer } from '../Drawer';
import { Input } from '../Input';
export interface SearchSuggestion {
  id: string;
  label: string;
  href?: string;
}
export interface SearchDrawerProps {
  open: boolean;
  onClose: () => void;
  query: string;
  onQueryChange: (query: string) => void;
  suggestions?: SearchSuggestion[];
  loading?: boolean;
  onSelect?: (suggestion: SearchSuggestion) => void;
  placeholder?: string;
  emptyLabel?: string;
}
export const SearchDrawer = ({
  open,
  onClose,
  query,
  onQueryChange,
  suggestions = [],
  loading,
  onSelect,
  placeholder = 'Hľadať produkty…',
  emptyLabel = 'Nenašli sa žiadne výsledky.'
}: SearchDrawerProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [touched, setTouched] = useState(false);
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => inputRef.current?.focus(), 80);
    return () => clearTimeout(t);
  }, [open]);

  const handleClose = () => {
    setTouched(false);
    onClose();
  };
  const showEmpty =
  touched && !loading && query.trim() !== '' && suggestions.length === 0;
  return (
    <Drawer open={open} onClose={handleClose} side="right" title="Hľadať">
      <Input
        ref={inputRef}
        value={query}
        onChange={(e) => {
          setTouched(true);
          onQueryChange(e.target.value);
        }}
        placeholder={placeholder}
        leadingIcon={<SearchIcon className="w-4 h-4" />}
        aria-label="Hľadať produkty" />
      

      <div className="mt-5">
        {loading && <p className="text-sm text-gm-text-muted">Hľadám…</p>}

        {!loading && suggestions.length > 0 &&
        <ul className="space-y-1">
            {suggestions.map((s) =>
          <li key={s.id}>
                <Link
              href={s.href || '#'}
              onClick={(e) => {
                if (onSelect) {
                  e.preventDefault();
                  onSelect(s);
                }
              }}
              className={clsx(
                'flex items-center gap-2 px-3 py-2.5 rounded-gm-md text-sm text-gm-text',
                'hover:bg-gm-bg-soft hover:text-gm-primary transition-colors gm-focus-ring'
              )}>
              
                  <SearchIcon className="w-3.5 h-3.5 text-gm-text-muted" />
                  {s.label}
                </Link>
              </li>
          )}
          </ul>
        }

        {showEmpty &&
        <p className="text-sm text-gm-text-muted">{emptyLabel}</p>
        }
      </div>
    </Drawer>);

};