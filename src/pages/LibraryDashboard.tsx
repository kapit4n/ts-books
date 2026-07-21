import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Upload, BookOpen, Clock, TrendingUp, CheckCircle2,
  Search, SlidersHorizontal, ArrowUpDown, LayoutGrid,
  FolderPlus, FlaskConical,
} from 'lucide-react';
import { LibraryCard } from '../components/library/LibraryCard';
import { useLibraryStore } from '../hooks/useLibrary';
import { db } from '../services/database';
import { BookProgress } from '../types/library';
import { seedPythonBook } from '../utils/seedPythonBook';
import './LibraryDashboard.css';

const PYTHON_BOOK_ID = 'python-crash-course-seed';

export const LibraryDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { books, loadBooks, removeBook } = useLibraryStore();
  const [progressMap, setProgressMap] = useState<Record<string, BookProgress>>({});
  const [seeding, setSeeding] = useState(false);
  const [hasPythonBook, setHasPythonBook] = useState(false);

  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  useEffect(() => {
    db.books.get(PYTHON_BOOK_ID).then((b) => setHasPythonBook(!!b));
  }, [books]);

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await seedPythonBook();
      await loadBooks();
    } catch (err) {
      console.error('Seed failed:', err);
    }
    setSeeding(false);
  };

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
        {/* Header Toolbar */}
        <motion.div
          className="library-toolbar"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="library-toolbar-left">
            <h1 className="library-title">My Library</h1>
            <p className="library-subtitle">Your personal digital bookshelf.</p>
          </div>
          <div className="library-toolbar-right">
            <div className="library-toolbar-search">
              <Search size={16} />
              <input type="text" placeholder="Search books..." aria-label="Search books" />
            </div>
            <button className="library-toolbar-btn" aria-label="Filter">
              <SlidersHorizontal size={16} />
            </button>
            <button className="library-toolbar-btn" aria-label="Sort">
              <ArrowUpDown size={16} />
            </button>
            <button
              className="library-import-btn"
              onClick={() => navigate('/library/import')}
              aria-label="Import PDF"
            >
              <Upload size={16} />
              Import PDF
            </button>
            {!hasPythonBook && (
              <button
                className="library-import-btn"
                onClick={handleSeed}
                disabled={seeding}
                aria-label="Seed demo data"
                style={{ background: '#10b981', borderColor: '#10b981' }}
              >
                <FlaskConical size={16} />
                {seeding ? 'Seeding...' : 'Load Demo Book'}
              </button>
            )}
            {hasPythonBook && (
              <button
                className="library-action-btn"
                onClick={() => navigate(`/library/${PYTHON_BOOK_ID}/learn`)}
                style={{ background: '#10b98110', borderColor: '#10b981', color: '#10b981' }}
              >
                <BookOpen size={16} />
                Learning Center
              </button>
            )}
          </div>
        </motion.div>

        {/* Stats */}
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
          /* Empty State */
          <motion.div
            className="library-empty"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="library-empty-icon">
              <BookOpen size={48} />
            </div>
            <h2 className="library-empty-title">Your Library is Empty</h2>
            <p className="library-empty-desc">
              Import your first PDF and create your own personalized reading experience.
            </p>
            <button
              className="library-empty-import-btn"
              onClick={() => navigate('/library/import')}
            >
              <Upload size={18} />
              Import PDF
            </button>
            <button
              className="library-empty-import-btn"
              onClick={handleSeed}
              disabled={seeding}
              style={{ background: '#10b981', color: '#fff', marginTop: '0.5rem' }}
            >
              <FlaskConical size={18} />
              {seeding ? 'Seeding...' : 'Load Demo Python Book'}
            </button>
            <a href="/books" className="library-empty-browse">
              Browse Built-in Books
            </a>
          </motion.div>
        ) : (
          <>
            {/* Grid Action Bar */}
            <motion.div
              className="library-action-bar"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
            >
              <div className="library-action-bar-left">
                <button
                  className="library-action-btn library-action-primary"
                  onClick={() => navigate('/library/import')}
                >
                  <Upload size={16} />
                  Import PDF
                </button>
                <button className="library-action-btn" disabled>
                  <FolderPlus size={16} />
                  Create Collection
                </button>
              </div>
              <div className="library-action-bar-right">
                <button className="library-action-btn library-action-active" aria-label="Grid view">
                  <LayoutGrid size={16} />
                </button>
                <button className="library-action-btn" aria-label="Sort">
                  <ArrowUpDown size={16} />
                  Sort
                </button>
              </div>
            </motion.div>

            {/* Book Grid */}
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
          </>
        )}
      </div>
    </div>
  );
};
