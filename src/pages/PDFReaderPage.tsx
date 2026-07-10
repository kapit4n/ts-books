import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import {
  Menu, X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut,
  Bookmark, BarChart3, Settings, BookOpen, FolderOpen, Upload,
  Maximize, Minimize, Moon, Columns, Focus,
} from 'lucide-react';
import { useLibraryStore } from '../hooks/useLibrary';
import { useReaderStore } from '../hooks/useReader';
import { BookBookmark } from '../types/library';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Button } from '../components/ui/Button';
import './PDFReaderPage.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

const ZOOM_PRESETS = [25, 50, 75, 100, 125, 150, 200, 300];

export const PDFReaderPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { books } = useLibraryStore();
  const store = useReaderStore();
  const {
    currentPage, zoom, fitMode, readingMode, sidebarsOpen, rightTab,
    progress, bookmarks, plan, isFullscreen,
    setPage, setTotalPages, setZoom, setFitMode, setReadingMode,
    toggleLeftSidebar, toggleRightSidebar, setRightTab,
    setCurrentBook, saveProgress, addBookmark, removeBookmark,
    setIsFullscreen, toggleFocusMode,
  } = store;

  const book = books.find((b) => b.id === id);
  const [numPages, setNumPages] = useState(0);
  const [showBookmarkForm, setShowBookmarkForm] = useState(false);
  const [bookmarkTitle, setBookmarkTitle] = useState('');
  const [showZoomDropdown, setShowZoomDropdown] = useState(false);
  const [pageInput, setPageInput] = useState(String(currentPage));
  const [toolbarHidden, setToolbarHidden] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const toolbarTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const zoomDropdownRef = useRef<HTMLDivElement>(null);
  const pageInputRef = useRef<HTMLInputElement>(null);

  const isFocusMode = readingMode === 'focus';
  const isStudyMode = readingMode === 'study';

  // Bootstrap
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

  // Sync page input
  useEffect(() => {
    setPageInput(String(currentPage));
  }, [currentPage]);

  // Close zoom dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (zoomDropdownRef.current && !zoomDropdownRef.current.contains(e.target as Node)) {
        setShowZoomDropdown(false);
      }
    };
    if (showZoomDropdown) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showZoomDropdown]);

  // Fullscreen listener
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, [setIsFullscreen]);

  // Focus mode toolbar auto-hide
  useEffect(() => {
    if (!isFocusMode) {
      setToolbarHidden(false);
      return;
    }
    const show = () => {
      setToolbarHidden(false);
      clearTimeout(toolbarTimerRef.current);
      toolbarTimerRef.current = setTimeout(() => setToolbarHidden(true), 3000);
    };
    show();
    const container = containerRef.current?.closest('.pdf-reader-center');
    container?.addEventListener('mousemove', show);
    return () => {
      container?.removeEventListener('mousemove', show);
      clearTimeout(toolbarTimerRef.current);
    };
  }, [isFocusMode]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          if (currentPage > 1) setPage(currentPage - 1);
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (numPages > 0 && currentPage < numPages) setPage(currentPage + 1);
          break;
        case 'Home':
          e.preventDefault();
          setPage(1);
          break;
        case 'End':
          e.preventDefault();
          if (numPages > 0) setPage(numPages);
          break;
        case '+':
        case '=':
          e.preventDefault();
          setZoom(zoom + 0.1);
          break;
        case '-':
          e.preventDefault();
          setZoom(zoom - 0.1);
          break;
        case '0':
          e.preventDefault();
          setZoom(1.0);
          break;
        case 'f':
        case 'F':
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            toggleFocusMode();
          }
          break;
        case 'b':
        case 'B':
          e.preventDefault();
          toggleLeftSidebar();
          break;
        case 'r':
        case 'R':
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            toggleRightSidebar();
          }
          break;
        case 'Escape':
          setShowBookmarkForm(false);
          setShowZoomDropdown(false);
          break;
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [currentPage, numPages, zoom, setPage, setZoom, toggleFocusMode, toggleLeftSidebar, toggleRightSidebar]);

  // Ctrl+Wheel zoom
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handler = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        setZoom(zoom + delta);
      }
    };
    container.addEventListener('wheel', handler, { passive: false });
    return () => container.removeEventListener('wheel', handler);
  }, [zoom, setZoom]);

  const handleAddBookmark = useCallback(() => {
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
  }, [id, currentPage, bookmarkTitle, addBookmark]);

  const toggleFullscreen = useCallback(async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  }, []);

  const toggleTheme = useCallback(() => {
    const root = document.documentElement;
    const current = root.getAttribute('data-theme');
    root.setAttribute('data-theme', current === 'dark' ? 'light' : 'dark');
  }, [readingMode, store]);

  const handlePageSubmit = useCallback(() => {
    const val = parseInt(pageInput, 10);
    if (!isNaN(val) && val >= 1 && val <= numPages) {
      setPage(val);
    } else {
      setPageInput(String(currentPage));
    }
  }, [pageInput, numPages, currentPage, setPage]);

  const todaySession = useMemo(() => {
    if (!plan) return null;
    const now = new Date();
    const dayStr = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    return plan.sessions.find((s) => !s.completed && (s.day === dayStr || dayStr === 'friday'));
  }, [plan]);

  if (!book) {
    return (
      <div className="pdf-reader-page">
        <div className="pdf-reader-center">
          <div className="pdf-loading">
            <p>Book not found.</p>
          </div>
        </div>
      </div>
    );
  }

  const onDocumentLoadSuccess = ({ numPages: n }: { numPages: number }) => {
    setNumPages(n);
  };

  return (
    <div className={`pdf-reader-page ${isFocusMode ? 'reader-focus' : ''} ${isStudyMode ? 'reader-study' : ''}`}>
      {/* Left Sidebar */}
      <aside className={`pdf-sidebar-left ${sidebarsOpen.left ? 'open' : ''}`}>
        <div className="pdf-sidebar-header">
          <button className="pdf-sidebar-close" onClick={toggleLeftSidebar} aria-label="Close sidebar">
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
              <button key={bm.id} className="pdf-bookmark-item" onClick={() => setPage(bm.page)}>
                <span className="pdf-bookmark-dot" style={{ backgroundColor: bm.color }} />
                <div>
                  <span className="pdf-bookmark-title">{bm.title}</span>
                  <span className="pdf-bookmark-page">Page {bm.page}</span>
                </div>
              </button>
            ))}
            {bookmarks.length === 0 && <p className="pdf-empty-text">No bookmarks yet.</p>}
          </div>
        </div>

        <div className="pdf-sidebar-section pdf-sidebar-shortcuts">
          <h4>Shortcuts</h4>
          <a href="/library" className="pdf-shortcut-item">
            <BookOpen size={16} /> Library
          </a>
          <a href="/library" className="pdf-shortcut-item">
            <FolderOpen size={16} /> Recent Books
          </a>
          <a href="/library/import" className="pdf-shortcut-item pdf-shortcut-import">
            <Upload size={16} /> Import PDF
          </a>
        </div>
      </aside>

      {/* Center Content */}
      <main className="pdf-reader-center">
        {/* Toolbar */}
        <div className={`pdf-toolbar ${isFocusMode && toolbarHidden ? 'pdf-toolbar--hidden' : ''}`}>
          {/* Group: Navigation */}
          <div className="pdf-toolbar-group">
            <button className="pdf-toolbar-btn" onClick={toggleLeftSidebar} aria-label="Menu">
              <Menu size={20} />
            </button>
          </div>

          <div className="pdf-toolbar-divider" />

          {/* Group: Page nav */}
          <div className="pdf-toolbar-group">
            <button disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)} aria-label="Previous page">
              <ChevronLeft size={18} />
            </button>
            <input
              ref={pageInputRef}
              className="pdf-page-input"
              type="text"
              value={pageInput}
              onChange={(e) => setPageInput(e.target.value)}
              onBlur={handlePageSubmit}
              onKeyDown={(e) => e.key === 'Enter' && handlePageSubmit()}
            />
            <span className="pdf-page-total">/ {numPages || '...'}</span>
            <button disabled={numPages > 0 && currentPage >= numPages} onClick={() => setPage(currentPage + 1)} aria-label="Next page">
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="pdf-toolbar-divider" />

          {/* Group: Zoom */}
          <div className="pdf-toolbar-group pdf-zoom-group">
            <button onClick={() => setZoom(zoom - 0.1)} aria-label="Zoom out">
              <ZoomOut size={18} />
            </button>
            <div className="pdf-zoom-dropdown-wrap" ref={zoomDropdownRef}>
              <button
                className="pdf-zoom-current"
                onClick={() => setShowZoomDropdown(!showZoomDropdown)}
                aria-label="Zoom level"
              >
                {Math.round(zoom * 100)}%
              </button>
              {showZoomDropdown && (
                <div className="pdf-zoom-dropdown">
                  <button
                    className={`pdf-zoom-option ${fitMode === 'width' ? 'active' : ''}`}
                    onClick={() => { setFitMode('width'); setShowZoomDropdown(false); }}
                  >
                    Fit Width
                  </button>
                  <button
                    className={`pdf-zoom-option ${fitMode === 'height' ? 'active' : ''}`}
                    onClick={() => { setFitMode('height'); setShowZoomDropdown(false); }}
                  >
                    Fit Height
                  </button>
                  <button
                    className={`pdf-zoom-option ${fitMode === 'actual' ? 'active' : ''}`}
                    onClick={() => { setFitMode('actual'); setShowZoomDropdown(false); }}
                  >
                    Actual Size
                  </button>
                  <div className="pdf-zoom-divider" />
                  {ZOOM_PRESETS.map((pct) => (
                    <button
                      key={pct}
                      className={`pdf-zoom-option ${Math.round(zoom * 100) === pct ? 'active' : ''}`}
                      onClick={() => { setZoom(pct / 100); setShowZoomDropdown(false); }}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button onClick={() => setZoom(zoom + 0.1)} aria-label="Zoom in">
              <ZoomIn size={18} />
            </button>
          </div>

          <div className="pdf-toolbar-divider" />

          {/* Group: View mode */}
          <div className="pdf-toolbar-group">
            <button
              className={`pdf-toolbar-btn ${readingMode === 'standard' ? 'active' : ''}`}
              onClick={() => setReadingMode('standard')}
              title="Standard mode (S)"
            >
              <Columns size={18} />
            </button>
            <button
              className={`pdf-toolbar-btn ${isFocusMode ? 'active' : ''}`}
              onClick={toggleFocusMode}
              title="Focus mode (F)"
            >
              <Focus size={18} />
            </button>
            <button
              className={`pdf-toolbar-btn ${isStudyMode ? 'active' : ''}`}
              onClick={() => setReadingMode('study')}
              title="Study mode"
            >
              <BookOpen size={18} />
            </button>
          </div>

          <div className="pdf-toolbar-divider" />

          {/* Group: Panels + Utilities */}
          <div className="pdf-toolbar-group">
            <button className="pdf-toolbar-btn" onClick={toggleLeftSidebar} title="Bookmarks (B)">
              <Bookmark size={18} />
            </button>
            <button className="pdf-toolbar-btn" onClick={toggleRightSidebar} title="Panel (R)">
              <BarChart3 size={18} />
            </button>
            <button onClick={() => setShowBookmarkForm(true)} aria-label="Bookmark page">
              <Bookmark size={18} />
            </button>
          </div>

          <div className="pdf-toolbar-spacer" />

          {/* Right utilities */}
          <div className="pdf-toolbar-group">
            <button onClick={toggleFullscreen} title="Fullscreen (F11)">
              {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
            </button>
            <button onClick={toggleTheme} title="Toggle theme">
              <Moon size={18} />
            </button>
          </div>
        </div>

        {/* Bookmark form */}
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

        {/* PDF Viewer */}
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
          <button className="pdf-sidebar-close" onClick={toggleRightSidebar} aria-label="Close panel">
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
              {bookmarks.length === 0 && <p className="pdf-empty-text">No bookmarks yet.</p>}
            </div>
          )}
          {rightTab === 'settings' && (
            <div className="pdf-settings-panel">
              <div className="pdf-setting">
                <label>Reading Mode</label>
                <div className="pdf-setting-btns">
                  <button className={readingMode === 'standard' ? 'active' : ''} onClick={() => setReadingMode('standard')}>Standard</button>
                  <button className={readingMode === 'focus' ? 'active' : ''} onClick={toggleFocusMode}>Focus</button>
                  <button className={readingMode === 'study' ? 'active' : ''} onClick={() => setReadingMode('study')}>Study</button>
                </div>
              </div>
              <div className="pdf-setting">
                <label>Fit Mode</label>
                <div className="pdf-setting-btns">
                  <button className={fitMode === 'width' ? 'active' : ''} onClick={() => setFitMode('width')}>Fit Width</button>
                  <button className={fitMode === 'height' ? 'active' : ''} onClick={() => setFitMode('height')}>Fit Height</button>
                  <button className={fitMode === 'actual' ? 'active' : ''} onClick={() => setFitMode('actual')}>Actual</button>
                </div>
              </div>
              <div className="pdf-setting">
                <label>Zoom</label>
                <span>{Math.round(zoom * 100)}%</span>
              </div>
              <div className="pdf-shortcuts-section">
                <h4>Keyboard Shortcuts</h4>
                <div className="pdf-shortcut-row"><kbd>←</kbd><span>Previous page</span></div>
                <div className="pdf-shortcut-row"><kbd>→</kbd><span>Next page</span></div>
                <div className="pdf-shortcut-row"><kbd>Home</kbd><span>First page</span></div>
                <div className="pdf-shortcut-row"><kbd>End</kbd><span>Last page</span></div>
                <div className="pdf-shortcut-row"><kbd>+</kbd><span>Zoom in</span></div>
                <div className="pdf-shortcut-row"><kbd>-</kbd><span>Zoom out</span></div>
                <div className="pdf-shortcut-row"><kbd>0</kbd><span>Reset zoom</span></div>
                <div className="pdf-shortcut-row"><kbd>F</kbd><span>Focus mode</span></div>
                <div className="pdf-shortcut-row"><kbd>B</kbd><span>Left sidebar</span></div>
                <div className="pdf-shortcut-row"><kbd>R</kbd><span>Right panel</span></div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
};
