import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Clock, Trash2, MoreVertical } from 'lucide-react';
import { ImportedBook, BookProgress } from '../../types/library';
import { ProgressBar } from '../ui/ProgressBar';
import './LibraryCard.css';

interface LibraryCardProps {
  book: ImportedBook;
  progress?: BookProgress | null;
  onOpen: () => void;
  onRemove: () => void;
}

export const LibraryCard: React.FC<LibraryCardProps> = ({ book, progress, onOpen, onRemove }) => {
  const [menuOpen, setMenuOpen] = React.useState(false);

  return (
    <motion.div
      className="library-card"
      whileHover={{ y: -4, boxShadow: 'var(--shadow-xl)' }}
      transition={{ duration: 0.2 }}
    >
      <div className="library-card-cover" onClick={onOpen}>
        {book.thumbnail ? (
          <img src={book.thumbnail} alt={book.title} className="library-card-thumb" />
        ) : (
          <div className="library-card-placeholder">
            <BookOpen size={32} />
          </div>
        )}
      </div>
      <div className="library-card-content">
        <h3 className="library-card-title">{book.title}</h3>
        <p className="library-card-author">{book.author}</p>
        <div className="library-card-meta">
          <span className="library-card-pages">
            <BookOpen size={14} />
            {book.pageCount} pages
          </span>
          <span className="library-card-time">
            <Clock size={14} />
            {book.readingTimeEstimate}
          </span>
        </div>
        {progress && progress.percentage > 0 && (
          <div className="library-card-progress">
            <ProgressBar progress={progress.percentage} showLabel />
          </div>
        )}
        <div className="library-card-actions">
          <button className="library-card-continue" onClick={onOpen}>
            {progress && progress.percentage > 0 ? 'Continue Reading' : 'Start Reading'}
          </button>
          <div className="library-card-menu-wrapper">
            <button
              className="library-card-menu-btn"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="More actions"
            >
              <MoreVertical size={18} />
            </button>
            {menuOpen && (
              <div className="library-card-menu">
                <button onClick={() => { onRemove(); setMenuOpen(false); }}>
                  <Trash2 size={14} />
                  Remove
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
