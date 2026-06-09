import type { FitnessGoal } from './user-profile';
import type { ShopifyProductNode } from './shopify';

export const GOAL_TAG_MAP: Record<FitnessGoal, string[]> = {
  'naberanie-svalov': ['svaly', 'protein', 'kreatin', 'bcaa', 'aminokyseliny'],
  regeneracia: ['regeneracia', 'kolagen', 'magnesium', 'zinc', 'vitamin-c'],
  spanok: ['spanok', 'magnesium', 'ashwagandha', 'melatonin', 'relax'],
  'lepsie-travenie': ['travenie', 'probiotika', 'vlaknina', 'digest', 'enzymy'],
  imunita: ['imunita', 'vitamin-c', 'vitamin-d', 'zinok', 'echinacea'],
  energia: ['energia', 'b-komplex', 'kofein', 'guarana', 'koenzym'],
};

export type ScoredProduct = {
  product: ShopifyProductNode;
  score: number;
  matchedTags: string[];
};

function normalizeTag(tag: string) {
  return tag.trim().toLowerCase();
}

export function scoreProductsForGoals(
  products: ShopifyProductNode[],
  fitnessGoals: FitnessGoal[],
  limit = 3,
): ScoredProduct[] {
  if (fitnessGoals.length === 0) {
    return products.slice(0, limit).map((product) => ({
      product,
      score: 0,
      matchedTags: [],
    }));
  }

  const targetTags = new Set(
    fitnessGoals.flatMap((goal) => GOAL_TAG_MAP[goal].map(normalizeTag)),
  );

  const scored = products
    .map((product) => {
      const productTags = (product.tags ?? []).map(normalizeTag);
      const matchedTags = productTags.filter((tag) =>
        Array.from(targetTags).some(
          (target) => tag.includes(target) || target.includes(tag),
        ),
      );

      return {
        product,
        score: matchedTags.length,
        matchedTags,
      };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  if (scored.length > 0) {
    return scored.slice(0, limit);
  }

  return products.slice(0, limit).map((product) => ({
    product,
    score: 0,
    matchedTags: [],
  }));
}
