'use client';

import { clsx } from 'clsx';
import Link from 'next/link';
import React from 'react';
import { LeafIcon } from 'lucide-react';

export interface LogoProps {
  className?: string;
  showIcon?: boolean;
}

export const Logo = ({ className, showIcon = true }: LogoProps) => {
  return (
    <Link
      href="/"
      aria-label="GrowMedica — domov"
      className={clsx(
        'inline-flex items-center gap-2 gm-focus-ring rounded-gm-sm',
        className,
      )}
    >
      {showIcon && (
        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gm-primary/15 text-gm-primary">
          <LeafIcon className="w-4 h-4" />
        </span>
      )}
      <span className="font-heading text-xl tracking-tight text-gm-text">
        GrowMedica
      </span>
    </Link>
  );
};
