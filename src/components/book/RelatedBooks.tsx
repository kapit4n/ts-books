import React from 'react';
import { motion } from 'framer-motion';
import { Book } from '../../data/mockData';
import { SectionTitle } from '../ui/SectionTitle';
import { Badge } from '../ui/Badge';
import { Rating } from '../ui/Rating';
import { Clock, BookOpen } from 'lucide-react';
import './RelatedBooks.css';

interface RelatedBooksProps {
  books: Book[];
}

const getDifficultyVariant = (d: string): 'success' | 'warning' | 'danger' => {
  if (d === 'Beginner') return 'success';
  if (d === 'Intermediate') return 'warning';
  return 'danger';
};

export const RelatedBooks: React.FC<RelatedBooksProps> = ({ books }) => {
  if (books.length === 0) return null;

  return (
    <div className="related-books">
      <SectionTitle title="Related Books" subtitle="More books you might enjoy" />
      <div className="related-books-grid">
        {books.map((book, index) => (
          <motion.a
            key={book.id}
            href={`/books/${book.slug}`}
            className="related-book-card"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 * index }}
            whileHover={{ y: -4, boxShadow: 'var(--shadow-lg)' }}
          >
            <div className="related-book-cover">
              <span>{book.cover}</span>
            </div>
            <div className="related-book-info">
              <Badge variant={getDifficultyVariant(book.difficulty)}>
                {book.difficulty}
              </Badge>
              <h4 className="related-book-title">{book.title}</h4>
              <div className="related-book-meta">
                <div className="related-book-stat">
                  <Clock size={14} />
                  <span>{book.readingTime}</span>
                </div>
                <div className="related-book-stat">
                  <BookOpen size={14} />
                  <span>{book.chapters.length} chapters</span>
                </div>
              </div>
              <Rating value={book.rating} size="sm" />
            </div>
          </motion.a>
        ))}
      </div>
    </div>
  );
};
