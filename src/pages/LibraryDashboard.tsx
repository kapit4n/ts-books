import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, BookOpen, Clock, TrendingUp, CheckCircle2 } from 'lucide-react';
import { LibraryCard } from '../components/library/LibraryCard';
import { useLibraryStore } from '../hooks/useLibrary';
import { db } from '../services/database';
import { BookProgress } from '../types/library';
import './LibraryDashboard.css';

export const LibraryDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { books, loadBooks, removeBook } = useLibraryStore();
  const [progressMap, setProgressMap] = useState<Record<string, BookProgress>>({});

  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  useEffect(() => {
    const loadProgress = async () => {
      const map: Record<string, BookProgress> = {};
      for (const book of books) {
        const progress = await db.progress.get(book.id);
        if (progress) map[book.id] = progress;
      }
      setProgressMap(map);
    };
    if (books.length > 0) loadProgress();
  }, [books]);

  const totalBooks = books.length;
  const booksInProgress = books.filter((b) => progressMap[b.id]?.percentage > 0).length;
  const booksCompleted = books.filter((b) => progressMap[b.id]?.percentage === 100).length;
  const totalPages = books.reduce((sum, b) => sum + b.pageCount, 0);

  return (
    <div className="library-page">
      <div className="library-container">
        <motion.div
          className="library-header"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <h1 className="library-title">My Library</h1>
            <p className="library-subtitle">Your personal collection of books</p>
          </div>
          <button className="library-import-btn" onClick={() => navigate('/library/import')}>
            <Plus size={18} />
            Import Book
          </button>
        </motion.div>

        <motion.div
          className="library-stats"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="library-stat">
            <BookOpen size={20} />
            <span className="library-stat-value">{totalBooks}</span>
            <span className="library-stat-label">Books</span>
          </div>
          <div className="library-stat">
            <TrendingUp size={20} />
            <span className="library-stat-value">{booksInProgress}</span>
            <span className="library-stat-label">In Progress</span>
          </div>
          <div className="library-stat">
            <CheckCircle2 size={20} />
            <span className="library-stat-value">{booksCompleted}</span>
            <span className="library-stat-label">Completed</span>
          </div>
          <div className="library-stat">
            <Clock size={20} />
            <span className="library-stat-value">{totalPages.toLocaleString()}</span>
            <span className="library-stat-label">Total Pages</span>
          </div>
        </motion.div>

        {books.length === 0 ? (
          <motion.div
            className="library-empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <BookOpen size={64} />
            <h2>No books yet</h2>
            <p>Import your first PDF to begin your learning journey.</p>
            <button className="library-import-btn" onClick={() => navigate('/library/import')}>
              <Plus size={18} />
              Import Your First Book
            </button>
          </motion.div>
        ) : (
          <div className="library-grid">
            {books.map((book, index) => (
              <motion.div
                key={book.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.05 * index }}
              >
                <LibraryCard
                  book={book}
                  progress={progressMap[book.id]}
                  onOpen={() => navigate(`/library/${book.id}`)}
                  onRemove={() => removeBook(book.id)}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
