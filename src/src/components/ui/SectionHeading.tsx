import React from 'react';
import { clsx } from 'clsx';
interface SectionHeadingProps {
  title: ReactNode;
  subtitle?: ReactNode;
  alignment?: 'left' | 'center';
  className?: string;
}
export const SectionHeading = ({
  title,
  subtitle,
  alignment = 'center',
  className
}: SectionHeadingProps) => {
  return (
    <div
      className={clsx(
        'mb-12',
        alignment === 'center' && 'text-center mx-auto',
        className
      )}>
      
      <h2 className="text-3xl md:text-4xl font-serif text-gm-text mb-4 leading-tight">
        {title}
      </h2>
      {subtitle &&
      <p className="text-gm-text-muted text-lg font-light max-w-2xl mx-auto">
          {subtitle}
        </p>
      }
    </div>);

};