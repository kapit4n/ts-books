import React from 'react';
import { Star } from 'lucide-react';
import './ReviewPlaceholder.css';

export const ReviewPlaceholder: React.FC = () => {
  return (
    <div className="review-placeholder">
      <div className="review-placeholder-stars">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star key={i} size={24} className="review-star-empty" />
        ))}
      </div>
      <p className="review-placeholder-text">No reviews yet.</p>
      <p className="review-placeholder-subtext">Be the first to review this book.</p>
    </div>
  );
};
