import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, X, BookOpen, Bookmark, StickyNote, Clock, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { getBookBySlug, getReadingProgress, saveReadingProgress } from '../data/mockData';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Rating } from '../components/ui/Rating';
import './ReaderPage.css';

export const ReaderPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const book = slug ? getBookBySlug(slug) : undefined;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'bookmarks' | 'notes' | 'progress'>('bookmarks');

  if (!book) {
    return (
      <div className="reader-page">
        <div className="reader-center">
          <p>Book not found.</p>
        </div>
      </div>
    );
  }

  const progress = getReadingProgress(book.id) || {
    bookId: book.id,
    currentChapterId: book.chapters[0]?.id || null,
    completedChapters: [],
    percentage: 0,
    lastOpened: new Date().toISOString(),
  };

  const currentChapter = book.chapters.find((c) => c.id === progress.currentChapterId) || book.chapters[0];
  const currentIndex = book.chapters.findIndex((c) => c.id === currentChapter?.id);
  const prevChapter = currentIndex > 0 ? book.chapters[currentIndex - 1] : null;
  const nextChapter = currentIndex < book.chapters.length - 1 ? book.chapters[currentIndex + 1] : null;

  const handleChapterSelect = (chapterId: string) => {
    const newCompleted = [...progress.completedChapters];
    if (currentChapter && !newCompleted.includes(currentChapter.id)) {
      newCompleted.push(currentChapter.id);
    }
    const percentage = Math.round((newCompleted.length / book.chapters.length) * 100);

    saveReadingProgress({
      bookId: book.id,
      currentChapterId: chapterId,
      completedChapters: newCompleted,
      percentage,
      lastOpened: new Date().toISOString(),
    });

    setSidebarOpen(false);
    window.location.reload();
  };

  const remainingTime = book.chapters
    .filter((c) => !progress.completedChapters.includes(c.id))
    .reduce((acc, c) => acc + parseInt(c.estimatedTime), 0);

  return (
    <div className="reader-page">
      {/* Left Sidebar */}
      <aside className={`reader-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="reader-sidebar-header">
          <button className="reader-sidebar-close" onClick={() => setSidebarOpen(false)} aria-label="Close sidebar">
            <X size={20} />
          </button>
          <a href={`/books/${book.slug}`} className="reader-sidebar-back">
            <ChevronLeft size={16} />
            Back to book
          </a>
        </div>
        <div className="reader-sidebar-book">
          <span className="reader-sidebar-cover">{book.cover}</span>
          <h3 className="reader-sidebar-title">{book.title}</h3>
          <ProgressBar progress={progress.percentage} showLabel />
        </div>
        <div className="reader-sidebar-search">
          <Search size={16} />
          <input type="text" placeholder="Search chapters..." aria-label="Search chapters" />
        </div>
        <nav className="reader-sidebar-chapters">
          {book.chapters.map((chapter) => {
            const isCompleted = progress.completedChapters.includes(chapter.id);
            const isCurrent = chapter.id === progress.currentChapterId;
            return (
              <button
                key={chapter.id}
                className={`reader-chapter-item ${isCurrent ? 'current' : ''} ${isCompleted ? 'completed' : ''}`}
                onClick={() => handleChapterSelect(chapter.id)}
              >
                <span className="reader-chapter-number">{chapter.order}</span>
                <div className="reader-chapter-info">
                  <span className="reader-chapter-title">{chapter.title}</span>
                  <span className="reader-chapter-time">{chapter.estimatedTime}</span>
                </div>
                {isCompleted && <span className="reader-chapter-check">&#10003;</span>}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Center Content */}
      <main className="reader-content">
        <div className="reader-content-topbar">
          <button className="reader-menu-btn" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
            <Menu size={20} />
          </button>
          <span className="reader-content-chapter">
            Chapter {currentChapter?.order}: {currentChapter?.title}
          </span>
          <button className="reader-panel-btn" onClick={() => setRightPanelOpen(!rightPanelOpen)} aria-label="Toggle panel">
            <BookOpen size={20} />
          </button>
        </div>

        <div className="reader-content-body">
          <motion.div
            className="reader-article"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h1 className="reader-article-title">
              Chapter {currentChapter?.order}: {currentChapter?.title}
            </h1>
            <p className="reader-article-description">{currentChapter?.description}</p>

            <div className="reader-article-placeholder">
              <div className="reader-placeholder-block" />
              <div className="reader-placeholder-line" style={{ width: '100%' }} />
              <div className="reader-placeholder-line" style={{ width: '85%' }} />
              <div className="reader-placeholder-line" style={{ width: '92%' }} />
              <div className="reader-placeholder-code">
                <span>{'// Code example placeholder'}</span>
                <span>{'function example() {'}</span>
                <span>{'  // Implementation goes here'}</span>
                <span>{'}'}</span>
              </div>
              <div className="reader-placeholder-line" style={{ width: '78%' }} />
              <div className="reader-placeholder-line" style={{ width: '95%' }} />
              <div className="reader-placeholder-line" style={{ width: '88%' }} />
            </div>

            <div className="reader-article-nav">
              {prevChapter && (
                <button
                  className="reader-nav-btn reader-nav-prev"
                  onClick={() => handleChapterSelect(prevChapter.id)}
                >
                  <ChevronLeft size={18} />
                  <div className="reader-nav-info">
                    <span className="reader-nav-label">Previous</span>
                    <span className="reader-nav-title">{prevChapter.title}</span>
                  </div>
                </button>
              )}
              {nextChapter && (
                <button
                  className="reader-nav-btn reader-nav-next"
                  onClick={() => handleChapterSelect(nextChapter.id)}
                >
                  <div className="reader-nav-info">
                    <span className="reader-nav-label">Next</span>
                    <span className="reader-nav-title">{nextChapter.title}</span>
                  </div>
                  <ChevronRight size={18} />
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </main>

      {/* Right Panel */}
      <aside className={`reader-right-panel ${rightPanelOpen ? 'open' : ''}`}>
        <div className="reader-right-header">
          <button className="reader-panel-close" onClick={() => setRightPanelOpen(false)} aria-label="Close panel">
            <X size={20} />
          </button>
        </div>
        <div className="reader-right-tabs">
          <button
            className={`reader-right-tab ${activeTab === 'bookmarks' ? 'active' : ''}`}
            onClick={() => setActiveTab('bookmarks')}
          >
            <Bookmark size={16} />
            Bookmarks
          </button>
          <button
            className={`reader-right-tab ${activeTab === 'notes' ? 'active' : ''}`}
            onClick={() => setActiveTab('notes')}
          >
            <StickyNote size={16} />
            Notes
          </button>
          <button
            className={`reader-right-tab ${activeTab === 'progress' ? 'active' : ''}`}
            onClick={() => setActiveTab('progress')}
          >
            <Clock size={16} />
            Progress
          </button>
        </div>
        <div className="reader-right-content">
          {activeTab === 'bookmarks' && (
            <div className="reader-right-placeholder">
              <Bookmark size={32} />
              <p>No bookmarks yet.</p>
            </div>
          )}
          {activeTab === 'notes' && (
            <div className="reader-right-placeholder">
              <StickyNote size={32} />
              <p>No notes yet.</p>
            </div>
          )}
          {activeTab === 'progress' && (
            <div className="reader-right-progress">
              <div className="reader-progress-stat">
                <span className="reader-progress-label">Completed</span>
                <span className="reader-progress-value">{progress.completedChapters.length}/{book.chapters.length}</span>
              </div>
              <ProgressBar progress={progress.percentage} showLabel />
              <div className="reader-progress-stat">
                <span className="reader-progress-label">Est. Remaining</span>
                <span className="reader-progress-value">{remainingTime} min</span>
              </div>
              <Rating value={book.rating} />
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Bottom Bar */}
      <div className="reader-mobile-bar">
        <button className="reader-mobile-btn" onClick={() => setSidebarOpen(true)}>
          <Menu size={18} />
          Menu
        </button>
        {nextChapter && (
          <button className="reader-mobile-btn primary" onClick={() => handleChapterSelect(nextChapter.id)}>
            Continue
            <ChevronRight size={18} />
          </button>
        )}
      </div>
    </div>
  );
};
