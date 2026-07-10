import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '../ui/Badge';
import { Rating } from '../ui/Rating';
import { Tag } from '../ui/Tag';
import { Book } from '../../data/mockData';
import './BookHeader.css';

interface BookHeaderProps {
  book: Book;
}

const getDifficultyVariant = (d: string): 'success' | 'warning' | 'danger' => {
  if (d === 'Beginner') return 'success';
  if (d === 'Intermediate') return 'warning';
  return 'danger';
};

export const BookHeader: React.FC<BookHeaderProps> = ({ book }) => {
  return (
    <motion.div
      className="book-header"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="book-header-cover">
        <span className="book-header-emoji">{book.cover}</span>
      </div>
      <div className="book-header-info">
        <div className="book-header-tags">
          <Badge variant={getDifficultyVariant(book.difficulty)}>{book.difficulty}</Badge>
          <span className="book-header-category">{book.category}</span>
        </div>
        <h1 className="book-header-title">{book.title}</h1>
        <p className="book-header-description">{book.description}</p>
        <div className="book-header-meta">
          <div className="book-header-meta-item">
            <span className="book-header-meta-label">Author</span>
            <span className="book-header-meta-value">{book.author}</span>
          </div>
          <div className="book-header-meta-item">
            <span className="book-header-meta-label">Version</span>
            <span className="book-header-meta-value">{book.version}</span>
          </div>
          <div className="book-header-meta-item">
            <span className="book-header-meta-label">Language</span>
            <span className="book-header-meta-value">{book.language}</span>
          </div>
          <div className="book-header-meta-item">
            <span className="book-header-meta-label">Last Updated</span>
            <span className="book-header-meta-value">{book.updatedAt}</span>
          </div>
        </div>
        <div className="book-header-bottom">
          <Rating value={book.rating} />
          <span className="book-header-reading-time">{book.readingTime} reading</span>
        </div>
        <div className="book-header-tags-list">
          {book.tags.map((tag) => (
            <Tag key={tag} name={tag} />
          ))}
        </div>
      </div>
    </motion.div>
  );
};
