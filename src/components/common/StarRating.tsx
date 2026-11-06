import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  sizeClassName?: string;
  emptyClassName?: string;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  sizeClassName = 'w-4 h-4',
  emptyClassName = 'text-neutral-200',
}) => (
  <div className="flex text-amber-400">
    {[...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`${sizeClassName} ${
          i < Math.floor(rating) ? 'fill-amber-400 text-amber-400' : emptyClassName
        }`}
      />
    ))}
  </div>
);
