import React from 'react';
import { motion } from 'framer-motion';
import { Clock, BookOpen, Bookmark } from 'lucide-react';
import { Book } from '../../data/mockData';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { SectionTitle } from '../ui/SectionTitle';
import './FeaturedBook.css';

interface FeaturedBookProps {
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

export const FeaturedBook: React.FC<FeaturedBookProps> = ({ book }) => {
  return (
    <section className="featured-book">
      <div className="featured-book-container">
        <SectionTitle
          title="Featured Book"
          subtitle="Start your TypeScript journey with this comprehensive guide"
        />
        <motion.div
          className="featured-book-card"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="featured-book-cover">
            <span className="featured-book-cover-emoji">{book.cover}</span>
          </div>
          <div className="featured-book-content">
            <div className="featured-book-header">
              <h3 className="featured-book-title">{book.title}</h3>
              <button className="featured-book-bookmark" aria-label="Bookmark">
                <Bookmark size={20} />
              </button>
            </div>
            <p className="featured-book-description">{book.description}</p>
            <div className="featured-book-meta">
              <Badge variant={getDifficultyVariant(book.difficulty)}>
                {book.difficulty}
              </Badge>
              <div className="featured-book-stat">
                <Clock size={16} />
                <span>{book.readingTime}</span>
              </div>
              <div className="featured-book-stat">
                <BookOpen size={16} />
                <span>{book.chapters.length} chapters</span>
              </div>
            </div>
            <Button>Continue</Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
