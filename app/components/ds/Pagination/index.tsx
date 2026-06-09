'use client';

import { clsx } from 'clsx';
import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
export interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
  className?: string;
}
function range(start: number, end: number) {
  return Array.from(
    {
      length: end - start + 1
    },
    (_, i) => start + i
  );
}
type PageToken = number | 'dots-l' | 'dots-r';
function getPages(page: number, total: number, siblings: number): PageToken[] {
  const totalNumbers = siblings * 2 + 5;
  if (total <= totalNumbers) return range(1, total);
  const left = Math.max(page - siblings, 1);
  const right = Math.min(page + siblings, total);
  const showLeftDots = left > 2;
  const showRightDots = right < total - 1;
  if (!showLeftDots && showRightDots) {
    return [...range(1, 3 + siblings * 2), 'dots-r', total];
  }
  if (showLeftDots && !showRightDots) {
    return [1, 'dots-l', ...range(total - (2 + siblings * 2), total)];
  }
  return [1, 'dots-l', ...range(left, right), 'dots-r', total];
}
export const Pagination = ({
  page,
  totalPages,
  onPageChange,
  siblingCount = 1,
  className
}: PaginationProps) => {
  if (totalPages <= 1) return null;
  const pages = getPages(page, totalPages, siblingCount);
  const arrowBtn =
  'flex items-center justify-center w-9 h-9 rounded-gm-md text-gm-text transition-colors hover:bg-gm-bg-soft disabled:opacity-40 disabled:cursor-not-allowed gm-focus-ring';
  return (
    <nav
      className={clsx('flex items-center gap-1.5', className)}
      aria-label="Stránkovanie">
      
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        aria-label="Predchádzajúca strana"
        className={arrowBtn}>
        
        <ChevronLeftIcon className="w-4 h-4" />
      </button>

      {pages.map((p, i) =>
      typeof p === 'number' ?
      <button
        key={p}
        type="button"
        onClick={() => onPageChange(p)}
        aria-current={p === page ? 'page' : undefined}
        className={clsx(
          'min-w-9 h-9 px-2 rounded-gm-md text-sm transition-colors gm-focus-ring',
          p === page ?
          'bg-gm-primary text-white' :
          'text-gm-text hover:bg-gm-bg-soft'
        )}>
        
            {p}
          </button> :

      <span
        key={`${p}-${i}`}
        className="w-9 h-9 flex items-center justify-center text-gm-text-muted">
        
            …
          </span>

      )}

      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Nasledujúca strana"
        className={arrowBtn}>
        
        <ChevronRightIcon className="w-4 h-4" />
      </button>
    </nav>);

};