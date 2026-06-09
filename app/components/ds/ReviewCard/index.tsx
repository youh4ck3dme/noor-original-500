'use client';

import { clsx } from 'clsx';
import React from 'react';
import { RatingStars } from '../RatingStars';

export interface ReviewCardProps {
  rating: number;
  title?: string;
  body: string;
  author: string;
  date?: string;
  verified?: boolean;
  className?: string;
}
export const ReviewCard = ({
  rating,
  title,
  body,
  author,
  date,
  verified,
  className
}: ReviewCardProps) => {
  return (
    <article
      className={clsx(
        'bg-gm-surface border border-gm-border rounded-gm-lg p-6',
        className
      )}>
      
      <RatingStars rating={rating} size="sm" />
      {title &&
      <h3 className="font-heading text-lg text-gm-text mt-3 mb-1">{title}</h3>
      }
      <p className="text-gm-text-muted font-light leading-relaxed mt-2">
        {body}
      </p>
      <footer className="flex items-center gap-2 mt-4 text-sm">
        <span className="font-medium text-gm-text">{author}</span>
        {verified &&
        <span className="text-xs text-gm-primary">· Overený nákup</span>
        }
        {date && <span className="text-gm-text-muted ml-auto">{date}</span>}
      </footer>
    </article>);

};