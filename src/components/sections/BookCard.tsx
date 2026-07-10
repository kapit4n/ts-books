import React from 'react';
import { motion } from 'framer-motion';
import { Clock, BookOpen, Star, Bookmark } from 'lucide-react';
import { Book } from '../../data/mockData';
import { Badge } from '../ui/Badge';
import './BookCard.css';

interface BookCardProps {
  book: Book;
}

const getDifficultyVariant = (difficulty: string): 'success' | 'warning' | 'danger' => {
  switch (difficulty) {
    case 'Beginner':
      return 'success';
    case 'Intermediate':
      return 'warning';
    case 'Advanced':
      return 'danger';
    default:
      return 'success';
  }
};

export const BookCard: React.FC<BookCardProps> = ({ book }) => {
  return (
    <motion.div
      className="book-card"
      whileHover={{ y: -4, boxShadow: 'var(--shadow-xl)' }}
      transition={{ duration: 0.2 }}
    >
      <div className="book-card-cover">
        <span className="book-card-cover-emoji">{book.cover}</span>
        <button className="book-card-bookmark" aria-label="Bookmark">
          <Bookmark size={18} />
        </button>
      </div>
      <div className="book-card-content">
        <h3 className="book-card-title">{book.title}</h3>
        <div className="book-card-meta">
          <Badge variant={getDifficultyVariant(book.difficulty)}>
            {book.difficulty}
          </Badge>
          <div className="book-card-stat">
            <Clock size={14} />
            <span>{book.readingTime}</span>
          </div>
          <div className="book-card-stat">
            <BookOpen size={14} />
            <span>{book.chapters} chapters</span>
          </div>
        </div>
        <div className="book-card-rating">
          <Star size={14} className="book-card-star" />
          <span>{book.rating}</span>
        </div>
      </div>
    </motion.div>
  );
};
