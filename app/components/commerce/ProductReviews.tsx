'use client';

import React, { useState } from 'react';
import { Button } from '@/app/components/ds/Button';
import { GlassPanel } from '@/app/components/ds/GlassPanel';
import { Input } from '@/app/components/ds/Input';
import { RatingStars } from '@/app/components/ds/RatingStars';
import { ReviewCard } from '@/app/components/ds/ReviewCard';
import { Textarea } from '@/app/components/ds/Textarea';
import { useToast } from '@/app/components/ds/Toast';
import { useAuth } from '@/app/components/providers/AuthProvider';
import type { ProductReview } from '@/app/lib/reviews';

type ProductReviewsProps = {
  productHandle: string;
  initialReviews: ProductReview[];
  averageRating: number;
  reviewCount: number;
};

function InteractiveRating({
  value,
  onChange,
}: {
  value: number;
  onChange: (rating: number) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: 5 }, (_, index) => {
        const rating = index + 1;
        return (
          <button
            key={rating}
            type="button"
            onClick={() => onChange(rating)}
            className="text-gm-primary hover:scale-105 transition-transform"
            aria-label={`Hodnotiť ${rating} z 5`}
          >
            <span className={rating <= value ? 'opacity-100' : 'opacity-30'}>★</span>
          </button>
        );
      })}
    </div>
  );
}

export function ProductReviews({
  productHandle,
  initialReviews,
  averageRating,
  reviewCount,
}: ProductReviewsProps) {
  const { user, idToken, refreshToken } = useAuth();
  const { toast } = useToast();
  const [reviews, setReviews] = useState(initialReviews);
  const [avgRating, setAvgRating] = useState(averageRating);
  const [count, setCount] = useState(reviewCount);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submitReview = async (event: React.FormEvent) => {
    event.preventDefault();

    const token = idToken ?? (await refreshToken());
    if (!token) {
      toast({ title: 'Pre recenziu sa musíte prihlásiť.', variant: 'error' });
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productHandle,
          rating,
          title,
          body,
        }),
      });

      if (!response.ok) {
        throw new Error('Recenziu sa nepodarilo uložiť.');
      }

      const data = await response.json();
      const nextReviews = data.reviews ?? [];
      if (data.review && !nextReviews.some((item: ProductReview) => item.id === data.review.id)) {
        setReviews([data.review, ...nextReviews]);
        setCount((current) => current + 1);
      } else {
        setReviews(nextReviews);
        setCount(data.reviewCount ?? nextReviews.length);
      }
      setAvgRating(data.averageRating ?? rating);
      setTitle('');
      setBody('');
      toast({ title: 'Ďakujeme za recenziu.', variant: 'success' });
    } catch {
      toast({ title: 'Recenziu sa nepodarilo uložiť.', variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mt-20">
      <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-heading text-gm-text mb-2">Recenzie zákazníkov</h2>
          <p className="text-gm-text-muted">
            Recenzie sú uložené vo Firebase CRM, nie v Shopify.
          </p>
        </div>
        {count > 0 && <RatingStars rating={avgRating} reviewCount={count} />}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <GlassPanel intensity="light" className="p-6 lg:col-span-1 h-fit">
          {user ? (
            <form onSubmit={submitReview} className="space-y-4">
              <h3 className="text-lg font-heading text-gm-text">Pridať recenziu</h3>
              <InteractiveRating value={rating} onChange={setRating} />
              <Input
                label="Nadpis (voliteľné)"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
              <Textarea
                label="Vaša recenzia"
                value={body}
                onChange={(event) => setBody(event.target.value)}
                required
              />
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Odosielame...' : 'Odoslať recenziu'}
              </Button>
            </form>
          ) : (
            <p className="text-gm-text-muted">
              Pre pridanie recenzie sa{' '}
              <a href="/ucet/prihlasenie" className="text-gm-primary hover:underline">
                prihláste do účtu
              </a>
              .
            </p>
          )}
        </GlassPanel>

        <div className="lg:col-span-2 space-y-4">
          {reviews.length === 0 ? (
            <GlassPanel intensity="light" className="p-6 text-gm-text-muted">
              Tento produkt zatiaľ nemá žiadne recenzie. Buďte prvý.
            </GlassPanel>
          ) : (
            reviews.map((review) => (
              <ReviewCard
                key={review.id}
                rating={review.rating}
                title={review.title}
                body={review.body}
                author={review.authorName}
                date={
                  review.createdAt
                    ? new Date(review.createdAt).toLocaleDateString('sk-SK')
                    : undefined
                }
                verified={review.verified}
              />
            ))
          )}
        </div>
      </div>
    </section>
  );
}
