import React from 'react';
import { Star } from 'lucide-react';

export const RatingStars = ({ rating = 0, totalReviews = null, size = 'sm', interactive = false, onRatingChange = null }) => {
  const sizeMap = {
    sm: 'w-3.5 h-3.5',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const stars = [1, 2, 3, 4, 5];

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center">
        {stars.map((star) => {
          const isFilled = star <= Math.round(rating);
          return (
            <button
              key={star}
              type={interactive ? 'button' : undefined}
              disabled={!interactive}
              onClick={() => interactive && onRatingChange && onRatingChange(star)}
              className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'} focus:outline-none`}
            >
              <Star
                className={`${sizeMap[size] || sizeMap.sm} ${
                  isFilled ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-100'
                }`}
              />
            </button>
          );
        })}
      </div>
      {rating > 0 && <span className="text-xs font-bold text-slate-700">{Number(rating).toFixed(1)}</span>}
      {totalReviews !== null && (
        <span className="text-xs text-slate-400">({totalReviews})</span>
      )}
    </div>
  );
};
