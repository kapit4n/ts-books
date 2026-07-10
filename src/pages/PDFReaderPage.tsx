import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import {
  Menu, X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut,
  Bookmark, BarChart3, Settings,
} from 'lucide-react';
import { useLibraryStore } from '../hooks/useLibrary';
import { useReaderStore } from '../hooks/useReader';
import { BookBookmark } from '../types/library';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Button } from '../components/ui/Button';
import './PDFReaderPage.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

export const PDFReaderPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { books } = useLibraryStore();
  const {
    currentPage, zoom, sidebarsOpen, rightTab, progress, bookmarks, plan,
    setPage, setTotalPages, setZoom, toggleSidebar, setRightTab,
    setCurrentBook, saveProgress, addBookmark, removeBookmark,
  } = useReaderStore();

  const book = books.find((b) => b.id === id);
  const [numPages, setNumPages] = useState(0);
  const [showBookmarkForm, setShowBookmarkForm] = useState(false);
  const [bookmarkTitle, setBookmarkTitle] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) setCurrentBook(id);
  }, [id, setCurrentBook]);

  useEffect(() => {
    if (numPages > 0) setTotalPages(numPages);
  }, [numPages, setTotalPages]);

  useEffect(() => {
    if (id && numPages > 0) {
      const timer = setTimeout(() => saveProgress(id, currentPage, numPages), 1000);
      return () => clearTimeout(timer);
    }
  }, [currentPage, numPages, id, saveProgress]);

  if (!book) {
    return (
      <div className="pdf-reader-page">
        <div className="pdf-reader-center">
          <p>Book not found.</p>
        </div>
      </div>
    );
  }

  const onDocumentLoadSuccess = ({ numPages: n }: { numPages: number }) => {
    setNumPages(n);
  };

  const handleAddBookmark = () => {
    if (!id) return;
    const bm: BookBookmark = {
      id: generateId(),
      bookId: id,
      page: currentPage,
      title: bookmarkTitle || `Page ${currentPage}`,
      color: '#3b82f6',
      createdAt: new Date().toISOString(),
    };
    addBookmark(bm);
    setBookmarkTitle('');
    setShowBookmarkForm(false);
  };

  const todaySession = plan?.sessions.find((s) => !s.completed);

  return (
    <div className="pdf-reader-page">
      {/* Left Sidebar */}
      <aside className={`pdf-sidebar-left ${sidebarsOpen.left ? 'open' : ''}`}>
        <div className="pdf-sidebar-header">
          <button className="pdf-sidebar-close" onClick={() => toggleSidebar('left')} aria-label="Close sidebar">
            <X size={20} />
          </button>
          <a href={`/library/${book.id}`} className="pdf-sidebar-back">
            <ChevronLeft size={16} /> Back
          </a>
        </div>
        <div className="pdf-sidebar-book">
          <h3 className="pdf-sidebar-title">{book.title}</h3>
          <p className="pdf-sidebar-author">{book.author}</p>
          {progress && <ProgressBar progress={progress.percentage} showLabel />}
        </div>

        {plan && todaySession && (
          <div className="pdf-sidebar-section">
            <h4>Today's Goal</h4>
            <div className="pdf-today-goal">
              {todaySession.isReview ? (
                <span>Review previous pages</span>
              ) : (
                <span>Pages {todaySession.startPage}–{todaySession.endPage}</span>
              )}
            </div>
          </div>
        )}

        {book.outline.length > 0 && (
          <div className="pdf-sidebar-section">
            <h4>Outline</h4>
            <div className="pdf-outline-list">
              {book.outline.map((item, i) => (
                <button key={i} className="pdf-outline-item">
                  {item.title}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="pdf-sidebar-section">
          <h4>Bookmarks ({bookmarks.length})</h4>
          <div className="pdf-bookmark-list">
            {bookmarks.map((bm) => (
              <button
                key={bm.id}
                className="pdf-bookmark-item"
                onClick={() => setPage(bm.page)}
              >
                <span className="pdf-bookmark-dot" style={{ backgroundColor: bm.color }} />
                <div>
                  <span className="pdf-bookmark-title">{bm.title}</span>
                  <span className="pdf-bookmark-page">Page {bm.page}</span>
                </div>
              </button>
            ))}
            {bookmarks.length === 0 && (
              <p className="pdf-empty-text">No bookmarks yet.</p>
            )}
          </div>
        </div>
      </aside>

      {/* Center Content */}
      <main className="pdf-reader-center">
        <div className="pdf-toolbar">
          <button className="pdf-toolbar-btn" onClick={() => toggleSidebar('left')} aria-label="Menu">
            <Menu size={20} />
          </button>

          <div className="pdf-page-nav">
            <button
              disabled={currentPage <= 1}
              onClick={() => setPage(currentPage - 1)}
              aria-label="Previous page"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="pdf-page-info">
              Page {currentPage} of {numPages || '...'}
            </span>
            <button
              disabled={numPages > 0 && currentPage >= numPages}
              onClick={() => setPage(currentPage + 1)}
              aria-label="Next page"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="pdf-zoom-controls">
            <button onClick={() => setZoom(zoom - 0.2)} aria-label="Zoom out">
              <ZoomOut size={18} />
            </button>
            <span>{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom(zoom + 0.2)} aria-label="Zoom in">
              <ZoomIn size={18} />
            </button>
          </div>

          <div className="pdf-toolbar-right">
            <button onClick={() => setShowBookmarkForm(true)} aria-label="Bookmark page">
              <Bookmark size={18} />
            </button>
            <button onClick={() => toggleSidebar('right')} aria-label="Toggle panel">
              <BarChart3 size={18} />
            </button>
          </div>
        </div>

        {showBookmarkForm && (
          <div className="pdf-bookmark-form">
            <input
              type="text"
              placeholder={`Bookmark for page ${currentPage}`}
              value={bookmarkTitle}
              onChange={(e) => setBookmarkTitle(e.target.value)}
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleAddBookmark()}
            />
            <Button size="sm" onClick={handleAddBookmark}>Save</Button>
            <Button size="sm" variant="ghost" onClick={() => setShowBookmarkForm(false)}>Cancel</Button>
          </div>
        )}

        <div className="pdf-viewer-wrapper" ref={containerRef}>
          <Document
            file={book.pdfData}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={
              <div className="pdf-loading">
                <div className="pdf-loading-spinner" />
                <span>Loading PDF...</span>
              </div>
            }
            error={
              <div className="pdf-error">
                <p>Failed to load PDF.</p>
              </div>
            }
          >
            <Page
              pageNumber={currentPage}
              scale={zoom}
              renderTextLayer={true}
              renderAnnotationLayer={true}
            />
          </Document>
        </div>
      </main>

      {/* Right Panel */}
      <aside className={`pdf-sidebar-right ${sidebarsOpen.right ? 'open' : ''}`}>
        <div className="pdf-sidebar-header">
          <button className="pdf-sidebar-close" onClick={() => toggleSidebar('right')} aria-label="Close panel">
            <X size={20} />
          </button>
        </div>
        <div className="pdf-right-tabs">
          <button className={`pdf-right-tab ${rightTab === 'progress' ? 'active' : ''}`} onClick={() => setRightTab('progress')}>
            <BarChart3 size={16} /> Progress
          </button>
          <button className={`pdf-right-tab ${rightTab === 'bookmarks' ? 'active' : ''}`} onClick={() => setRightTab('bookmarks')}>
            <Bookmark size={16} /> Bookmarks
          </button>
          <button className={`pdf-right-tab ${rightTab === 'settings' ? 'active' : ''}`} onClick={() => setRightTab('settings')}>
            <Settings size={16} /> Settings
          </button>
        </div>
        <div className="pdf-right-content">
          {rightTab === 'progress' && progress && (
            <div className="pdf-progress-panel">
              <div className="pdf-stat-row">
                <span>Current Page</span>
                <strong>{progress.currentPage}</strong>
              </div>
              <div className="pdf-stat-row">
                <span>Pages Read</span>
                <strong>{progress.totalPagesRead}</strong>
              </div>
              <div className="pdf-stat-row">
                <span>Reading Time</span>
                <strong>{Math.round(progress.totalReadingTimeMs / 60000)} min</strong>
              </div>
              <ProgressBar progress={progress.percentage} showLabel />
            </div>
          )}
          {rightTab === 'bookmarks' && (
            <div className="pdf-bookmarks-panel">
              {bookmarks.map((bm) => (
                <div key={bm.id} className="pdf-right-bookmark">
                  <span className="pdf-bookmark-dot" style={{ backgroundColor: bm.color }} />
                  <div>
                    <span className="pdf-bookmark-title">{bm.title}</span>
                    <span className="pdf-bookmark-page">Page {bm.page}</span>
                  </div>
                  <button onClick={() => removeBookmark(bm.id)} className="pdf-bookmark-remove">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
          {rightTab === 'settings' && (
            <div className="pdf-settings-panel">
              <div className="pdf-setting">
                <label>Fit Mode</label>
                <div className="pdf-setting-btns">
                  <button className={zoom > 0 ? 'active' : ''} onClick={() => {}}>Fit Width</button>
                  <button onClick={() => {}}>Fit Page</button>
                </div>
              </div>
              <div className="pdf-setting">
                <label>Zoom</label>
                <span>{Math.round(zoom * 100)}%</span>
              </div>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
};
