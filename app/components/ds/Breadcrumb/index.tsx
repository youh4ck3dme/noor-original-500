'use client';

import { clsx } from 'clsx';
import Link from 'next/link';
import React from 'react';
import { ChevronRightIcon } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumb = ({ items, className }: BreadcrumbProps) => {
  return (
    <nav aria-label="Navigačná cesta" className={className}>
      <ol className="flex flex-wrap items-center gap-1.5 text-sm">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={item.label + i} className="flex items-center gap-1.5">
              {item.href && !last ? (
                <Link
                  href={item.href}
                  className="text-gm-text-muted hover:text-gm-primary transition-colors gm-focus-ring rounded-gm-sm"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={clsx(last ? 'text-gm-text' : 'text-gm-text-muted')}
                  aria-current={last ? 'page' : undefined}
                >
                  {item.label}
                </span>
              )}
              {!last && (
                <ChevronRightIcon className="w-3.5 h-3.5 text-gm-text-muted/60" />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
