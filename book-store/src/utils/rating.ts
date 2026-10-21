// src/utils/rating.ts
import { Review } from '../types';

export function averageRating(reviews: Review[]): number {
  if (!reviews || reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, curr) => acc + (curr.rating || 0), 0);
  const avg = sum / reviews.length;
  return Math.round(avg * 10) / 10;
}
