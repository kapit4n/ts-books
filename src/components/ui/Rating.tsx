import React from 'react';
import { Star } from 'lucide-react';
import './Rating.css';

interface RatingProps {
  value: number;
  showValue?: boolean;
  size?: 'sm' | 'md';
}

export const Rating: React.FC<RatingProps> = ({ value, showValue = true, size = 'md' }) => {
  return (
    <div className={`rating rating-${size}`}>
      <Star className="rating-star" size={size === 'sm' ? 14 : 16} />
      {showValue && <span className="rating-value">{value.toFixed(1)}</span>}
    </div>
  );
};
