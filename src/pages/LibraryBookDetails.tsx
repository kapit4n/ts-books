import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Clock, BookOpen, Calendar, Bookmark, Share2, Trash2, GraduationCap } from 'lucide-react';
import { useLibraryStore } from '../hooks/useLibrary';
import { db } from '../services/database';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Button } from '../components/ui/Button';
import { BookProgress, BookBookmark, ReadingPlan } from '../types/library';
import { format } from 'date-fns';
import './LibraryBookDetails.css';

export const LibraryBookDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { books, removeBook } = useLibraryStore();
  const book = books.find((b) => b.id === id);
  const [progress, setProgress] = useState<BookProgress | null>(null);
  const [bookmarks, setBookmarks] = useState<BookBookmark[]>([]);
  const [plan, setPlan] = useState<ReadingPlan | null>(null);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      const p = await db.progress.get(id);
      setProgress(p || null);
      const bm = await db.bookmarks.where('bookId').equals(id).toArray();
      setBookmarks(bm);
      const pl = await db.plans.where('bookId').equals(id).first();
      setPlan(pl || null);
    };
    load();
  }, [id]);

  if (!book) {
    return (
      <div className="library-details-page">
        <div className="library-details-container">
          <p>Book not found.</p>
        </div>
      </div>
    );
  }

  const handleRemove = async () => {
    await removeBook(book.id);
    navigate('/library');
  };

  return (
    <div className="library-details-page">
      <div className="library-details-container">
        <Breadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'Library', href: '/library' },
            { label: book.title },
          ]}
        />

        <motion.div
          className="library-details-header"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="library-details-cover">
            {book.thumbnail ? (
              <img src={book.thumbnail} alt={book.title} />
            ) : (
              <div className="library-details-placeholder"><BookOpen size={48} /></div>
            )}
          </div>
          <div className="library-details-info">
            <h1 className="library-details-title">{book.title}</h1>
            <p className="library-details-author">by {book.author}</p>
            <div className="library-details-meta">
              <span><BookOpen size={16} /> {book.pageCount} pages</span>
              <span><Clock size={16} /> {book.readingTimeEstimate}</span>
              <span><Calendar size={16} /> Imported {format(new Date(book.importedAt), 'MMM d, yyyy')}</span>
            </div>
            {progress && (
              <div className="library-details-progress">
                <ProgressBar progress={progress.percentage} showLabel />
                <span className="library-details-page-info">Page {progress.currentPage} of {book.pageCount}</span>
              </div>
            )}
            <div className="library-details-actions">
              <Button size="lg" onClick={() => navigate(`/library/${book.id}/read`)}>
                <Play size={18} />
                {progress && progress.percentage > 0 ? 'Continue Reading' : 'Start Reading'}
              </Button>
              <Button variant="secondary" size="lg" onClick={() => navigate(`/library/${book.id}/study`)}>
                <GraduationCap size={18} />
                Study Workspace
              </Button>
              <Button variant="secondary" size="lg">
                <Bookmark size={18} />
                Bookmark
              </Button>
              <Button variant="ghost" size="lg">
                <Share2 size={18} />
                Share
              </Button>
              <Button variant="ghost" size="lg" onClick={handleRemove}>
                <Trash2 size={18} />
                Remove
              </Button>
            </div>
          </div>
        </motion.div>

        {plan && (
          <motion.div
            className="library-details-plan"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <h3>Reading Plan</h3>
            <div className="plan-summary">
              <span>{plan.dailyPages} pages/day</span>
              <span>{plan.estimatedDays} days estimated</span>
              <span>{plan.minutesPerDay} min/session</span>
            </div>
            <div className="plan-sessions">
              {plan.sessions.slice(0, 7).map((session) => (
                <div key={session.id} className={`plan-session ${session.completed ? 'completed' : ''}`}>
                  <span className="plan-session-day">{session.day}</span>
                  {session.isReview ? (
                    <span className="plan-session-pages">Review</span>
                  ) : (
                    <span className="plan-session-pages">Pages {session.startPage}–{session.endPage}</span>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {bookmarks.length > 0 && (
          <div className="library-details-bookmarks">
            <h3>Bookmarks ({bookmarks.length})</h3>
            <div className="bookmarks-list">
              {bookmarks.map((bm) => (
                <div key={bm.id} className="bookmark-item">
                  <span className="bookmark-page">p. {bm.page}</span>
                  <span className="bookmark-title">{bm.title}</span>
                  <span className="bookmark-date">{format(new Date(bm.createdAt), 'MMM d')}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
