import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import {
  Menu, X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut,
  Bookmark, BarChart3, Settings, BookOpen, Upload,
  Maximize, Minimize, Moon, Columns, Focus, FileText,
  Highlighter, StickyNote as StickyNoteIcon, List, Activity,
  GraduationCap, Sparkles,
} from 'lucide-react';
import { useLibraryStore } from '../hooks/useLibrary';
import { ImportedBook } from '../types/library';
import { useReaderStore, computeFitScale } from '../hooks/useReader';
import { useHighlightsStore } from '../hooks/useHighlights';
import { useNotesStore } from '../hooks/useNotes';
import { useStudyBookmarksStore } from '../hooks/useStudyBookmarks';
import { useStudyWorkspaceStore } from '../hooks/useStudyWorkspace';
import { BookBookmark, ReadingMode } from '../types/library';
import { Highlight, HighlightColor, Note } from '../types/study';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Button } from '../components/ui/Button';
import { HighlightToolbar } from '../components/reader/HighlightToolbar';
import { HighlightOverlay } from '../components/reader/HighlightOverlay';
import { StickyNote as StickyNoteComponent } from '../components/reader/StickyNote';
import { AIPanel } from '../components/ai/AIPanel';
import { PromptToolbar } from '../components/ai/PromptToolbar';
import { AIPromptTemplate } from '../types/ai';
import { buildPrompt } from '../services/promptBuilder';
import './PDFReaderPage.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

const ZOOM_PRESETS = [25, 50, 75, 100, 125, 150, 200, 300];

type LeftTab = 'outline' | 'bookmarks' | 'highlights' | 'notes' | 'today' | 'activity';

export const PDFReaderPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { books, ensureBookLoaded } = useLibraryStore();
  const store = useReaderStore();
  const {
    currentPage, zoom, fitMode, readingMode, columnSide, sidebarsOpen, rightTab,
    progress, bookmarks, plan, isFullscreen,
    selectionContext, activeHighlightColor,
    setPage, setTotalPages, setZoom, setFitMode, setReadingMode,
    toggleLeftSidebar, toggleRightSidebar, setRightTab,
    setCurrentBook, saveProgress, addBookmark, removeBookmark,
    setIsFullscreen, toggleFocusMode, toggleColumnSide, nextColumn, prevColumn,
    setContainerSize, containerWidth, containerHeight,
    setSelectionContext, setShowHighlightToolbar,
  } = store;

  const {
    highlights, loadHighlights, addHighlight, removeHighlight,
  } = useHighlightsStore();

  const {
    notes, stickyNotes, loadNotes, addNote,
    loadStickyNotes, addStickyNote, updateStickyNote, removeStickyNote,
  } = useNotesStore();

  const {
    loadBookmarks: loadStudyBookmarks,
  } = useStudyBookmarksStore();

  const { activities, loadActivities } = useStudyWorkspaceStore();

  const [resolvedBook, setResolvedBook] = React.useState<ImportedBook | null>(null);
  const [bookLoading, setBookLoading] = useState(true);
  const book = books.find((b) => b.id === id) ?? resolvedBook;

  React.useEffect(() => {
    if (!id) { setBookLoading(false); return; }
    if (books.find((b) => b.id === id)) { setBookLoading(false); return; }
    ensureBookLoaded(id).then((b) => {
      setResolvedBook(b ?? null);
      setBookLoading(false);
    });
  }, [id, books, ensureBookLoaded]);
  const [numPages, setNumPages] = useState(0);
  const [showBookmarkForm, setShowBookmarkForm] = useState(false);
  const [bookmarkTitle, setBookmarkTitle] = useState('');
  const [showZoomDropdown, setShowZoomDropdown] = useState(false);
  const [pageInput, setPageInput] = useState(String(currentPage));
  const [toolbarHidden, setToolbarHidden] = useState(false);
  const [leftTab, setLeftTab] = useState<LeftTab>('outline');
  const [showPromptToolbar, setShowPromptToolbar] = useState(false);
  const [promptToolbarPos, setPromptToolbarPos] = useState({ x: 0, y: 0 });
  const [selectedTextForAI, setSelectedTextForAI] = useState<string | undefined>();
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerWrapperRef = useRef<HTMLDivElement>(null);
  const toolbarTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const zoomDropdownRef = useRef<HTMLDivElement>(null);
  const pageInputRef = useRef<HTMLInputElement>(null);
  const leftCanvasRef = useRef<HTMLCanvasElement>(null);
  const rightCanvasRef = useRef<HTMLCanvasElement>(null);
  const [pageWidth, setPageWidth] = useState(0);
  const [pageHeight, setPageHeight] = useState(0);

  const isFocusMode = readingMode === 'focus';
  const isBookMode = readingMode === 'book';
  const isColumnMode = readingMode === 'column';
  const isSidebarDisabled = isFocusMode || isBookMode || isColumnMode;
  const currentReadingMode: ReadingMode = readingMode;

  // Handle page param from URL (jump to page from Study Workspace)
  useEffect(() => {
    const pageParam = searchParams.get('page');
    if (pageParam) {
      const p = parseInt(pageParam, 10);
      if (!isNaN(p) && p >= 1) setPage(p);
    }
  }, [searchParams, setPage]);

  // Responsive mode availability
  const [viewportWidth, setViewportWidth] = useState(window.innerWidth);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1024px)');
    const mqMobile = window.matchMedia('(max-width: 768px)');
    const check = () => setViewportWidth(window.innerWidth);
    mq.addEventListener('change', check);
    mqMobile.addEventListener('change', check);
    window.addEventListener('resize', check);
    return () => {
      mq.removeEventListener('change', check);
      mqMobile.removeEventListener('change', check);
      window.removeEventListener('resize', check);
    };
  }, []);

  const canUseBookMode = viewportWidth > 1024;
  const canUseColumnMode = viewportWidth > 768;

  useEffect(() => {
    if (isBookMode && !canUseBookMode) setReadingMode('standard');
    else if (isColumnMode && !canUseColumnMode) setReadingMode('standard');
  }, [viewportWidth, isBookMode, isColumnMode, canUseBookMode, canUseColumnMode, setReadingMode]);

  // Bootstrap
  useEffect(() => {
    if (id) setCurrentBook(id);
  }, [id, setCurrentBook]);

  useEffect(() => {
    if (numPages > 0) setTotalPages(numPages);
  }, [numPages, setTotalPages]);

  // Load annotations when book changes
  useEffect(() => {
    if (id) {
      loadHighlights(id);
      loadNotes(id);
      loadStickyNotes(id);
      loadStudyBookmarks(id);
      loadActivities(id);
    }
  }, [id, loadHighlights, loadNotes, loadStickyNotes, loadStudyBookmarks, loadActivities]);

  useEffect(() => {
    if (id && numPages > 0) {
      const timer = setTimeout(() => saveProgress(id, currentPage, numPages), 1000);
      return () => clearTimeout(timer);
    }
  }, [currentPage, numPages, id, saveProgress]);

  useEffect(() => {
    setPageInput(String(currentPage));
  }, [currentPage]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (zoomDropdownRef.current && !zoomDropdownRef.current.contains(e.target as Node)) {
        setShowZoomDropdown(false);
      }
    };
    if (showZoomDropdown) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showZoomDropdown]);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, [setIsFullscreen]);

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

  useEffect(() => {
    const el = viewerWrapperRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setContainerSize(rect.width, rect.height);
    const onResize = () => {
      const r = el.getBoundingClientRect();
      setContainerSize(r.width, r.height);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [setContainerSize]);

  const applyFitScale = useCallback(() => {
    if (pageWidth > 0 && pageHeight > 0 && containerWidth > 0 && containerHeight > 0 && fitMode !== 'actual') {
      const newZoom = computeFitScale(fitMode, containerWidth, containerHeight, pageWidth, pageHeight);
      setZoom(newZoom);
    }
  }, [fitMode, containerWidth, containerHeight, pageWidth, pageHeight, setZoom]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    applyFitScale();
  }, [fitMode, pageWidth, pageHeight]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      switch (e.key) {
        case 'ArrowRight': {
          e.preventDefault();
          if (isColumnMode) nextColumn();
          else if (isBookMode) {
            if (currentPage + 2 <= numPages) setPage(currentPage + 2);
            else if (currentPage + 1 <= numPages) setPage(currentPage + 1);
          } else { if (currentPage < numPages) setPage(currentPage + 1); }
          break;
        }
        case 'ArrowLeft': {
          e.preventDefault();
          if (isColumnMode) prevColumn();
          else if (isBookMode) setPage(Math.max(1, currentPage - 2));
          else { if (currentPage > 1) setPage(currentPage - 1); }
          break;
        }
        case 'ArrowDown': { if (isColumnMode) { e.preventDefault(); nextColumn(); } break; }
        case 'ArrowUp': { if (isColumnMode) { e.preventDefault(); prevColumn(); } break; }
        case 'Home': e.preventDefault(); setPage(1); break;
        case 'End': e.preventDefault(); if (numPages > 0) setPage(numPages); break;
        case '+': case '=': e.preventDefault(); setZoom(zoom + 0.1); break;
        case '-': e.preventDefault(); setZoom(zoom - 0.1); break;
        case '0': e.preventDefault(); setZoom(1.0); break;
        case '1': e.preventDefault(); setReadingMode('standard'); break;
        case '2': e.preventDefault(); if (canUseBookMode) setReadingMode('book'); break;
        case '3': e.preventDefault(); if (canUseColumnMode) setReadingMode('column'); break;
        case '4': e.preventDefault(); setReadingMode('focus'); break;
        case 'f': case 'F':
          if (!e.ctrlKey && !e.metaKey) { e.preventDefault(); toggleFocusMode(); }
          break;
        case 'b': case 'B':
          if (!isSidebarDisabled) { e.preventDefault(); toggleLeftSidebar(); }
          break;
        case 'r': case 'R':
          if (!e.ctrlKey && !e.metaKey && !isSidebarDisabled) { e.preventDefault(); toggleRightSidebar(); }
          break;
        case 'Escape':
          if (isFocusMode) toggleFocusMode();
          else { setShowBookmarkForm(false); setShowZoomDropdown(false); setShowHighlightToolbar(false); setShowPromptToolbar(false); setSelectionContext(null); setSelectedTextForAI(undefined); }
          break;
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [currentPage, numPages, zoom, readingMode, isColumnMode, isBookMode, isFocusMode, isSidebarDisabled,
      canUseBookMode, canUseColumnMode, setPage, setZoom, setReadingMode, toggleFocusMode, toggleLeftSidebar, toggleRightSidebar, nextColumn, prevColumn, setShowHighlightToolbar, setSelectionContext]);

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

  const intrinsicPageSet = useRef(false);
  const onPageLoadSuccess = useCallback(({ width, height, originalWidth, originalHeight }: any) => {
    if (intrinsicPageSet.current) return;
    intrinsicPageSet.current = true;
    setPageWidth(originalWidth || width);
    setPageHeight(originalHeight || height);
  }, []);

  // Reset intrinsicPageSet when page changes
  useEffect(() => {
    intrinsicPageSet.current = false;
  }, [currentPage]);

  // ===== Text Selection & Highlight System =====
  const handleMouseUp = useCallback(() => {
    if (isColumnMode) return; // No text layer in column mode
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !selection.toString().trim()) {
      return;
    }

    const text = selection.toString().trim();
    if (text.length < 2) return;

    const range = selection.getRangeAt(0);
    const rects = Array.from(range.getClientRects());
    if (rects.length === 0) return;

    const viewerEl = viewerWrapperRef.current;
    if (!viewerEl) return;
    const viewerRect = viewerEl.getBoundingClientRect();

    // Find the page element for percentage calculation
    const pageEl = range.startContainer.parentElement?.closest('.react-pdf__Page');
    if (!pageEl) return;
    const pageRect = pageEl.getBoundingClientRect();

    const positionRects = rects.map((r) => ({
      left: ((r.left - pageRect.left) / pageRect.width) * 100,
      top: ((r.top - pageRect.top) / pageRect.height) * 100,
      width: (r.width / pageRect.width) * 100,
      height: (r.height / pageRect.height) * 100,
    }));

    const lastRect = rects[rects.length - 1];
    const toolbarX = Math.min(lastRect.right - viewerRect.left + viewerEl.scrollLeft, viewerEl.scrollWidth - 260);
    const toolbarY = lastRect.top - viewerRect.top + viewerEl.scrollTop - 8;

    setSelectionContext({
      selectedText: text,
      page: currentPage,
      position: { x: Math.max(0, toolbarX), y: Math.max(0, toolbarY) },
      rects: positionRects,
    });
    setShowHighlightToolbar(true);

    // Show prompt toolbar for AI
    const promptX = Math.max(0, toolbarX);
    const promptY = Math.max(0, toolbarY + 44);
    setPromptToolbarPos({ x: promptX, y: promptY });
    setShowPromptToolbar(true);
  }, [currentPage, isColumnMode, setSelectionContext, setShowHighlightToolbar]);

  useEffect(() => {
    const el = viewerWrapperRef.current;
    if (!el) return;
    el.addEventListener('mouseup', handleMouseUp);
    return () => el.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseUp]);

  const handleCreateHighlight = useCallback(async (color: HighlightColor) => {
    if (!id || !selectionContext) return;
    const highlight: Highlight = {
      id: generateId(),
      bookId: id,
      page: selectionContext.page,
      selectedText: selectionContext.selectedText,
      color,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      favorite: false,
      tags: [],
      linkedNoteId: null,
      positionRects: selectionContext.rects,
    };
    await addHighlight(highlight);
    setShowHighlightToolbar(false);
    setShowPromptToolbar(false);
    setSelectionContext(null);
    window.getSelection()?.removeAllRanges();
  }, [id, selectionContext, addHighlight, setShowHighlightToolbar, setSelectionContext]);

  const handleCreateNoteFromHighlight = useCallback(async () => {
    if (!id || !selectionContext) return;
    const noteId = generateId();
    const highlightId = generateId();
    const now = new Date().toISOString();

    const highlight: Highlight = {
      id: highlightId,
      bookId: id,
      page: selectionContext.page,
      selectedText: selectionContext.selectedText,
      color: activeHighlightColor,
      createdAt: now,
      updatedAt: now,
      favorite: false,
      tags: [],
      linkedNoteId: noteId,
      positionRects: selectionContext.rects,
    };

    const note: Note = {
      id: noteId,
      bookId: id,
      page: selectionContext.page,
      title: selectionContext.selectedText.slice(0, 60),
      content: '',
      createdAt: now,
      updatedAt: now,
      favorite: false,
      tags: [],
      linkedHighlightId: highlightId,
    };

    await addHighlight(highlight);
    await addNote(note);
    setShowHighlightToolbar(false);
    setShowPromptToolbar(false);
    setSelectionContext(null);
    window.getSelection()?.removeAllRanges();
    // Switch to notes tab in left sidebar
    setLeftTab('notes');
    if (!sidebarsOpen.left) toggleLeftSidebar();
  }, [id, selectionContext, activeHighlightColor, addHighlight, addNote, setShowHighlightToolbar, setSelectionContext, sidebarsOpen.left, toggleLeftSidebar]);

  const handleCopySelection = useCallback(() => {
    if (selectionContext) {
      navigator.clipboard.writeText(selectionContext.selectedText);
    }
    setShowHighlightToolbar(false);
    setShowPromptToolbar(false);
    setSelectionContext(null);
    window.getSelection()?.removeAllRanges();
  }, [selectionContext, setShowHighlightToolbar, setSelectionContext]);

  const handleFavoriteSelection = useCallback(async () => {
    if (!id || !selectionContext) return;
    const highlight: Highlight = {
      id: generateId(),
      bookId: id,
      page: selectionContext.page,
      selectedText: selectionContext.selectedText,
      color: activeHighlightColor,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      favorite: true,
      tags: [],
      linkedNoteId: null,
      positionRects: selectionContext.rects,
    };
    await addHighlight(highlight);
    setShowHighlightToolbar(false);
    setShowPromptToolbar(false);
    setSelectionContext(null);
    window.getSelection()?.removeAllRanges();
  }, [id, selectionContext, activeHighlightColor, addHighlight, setShowHighlightToolbar, setSelectionContext]);

  const handleAddStickyNote = useCallback(() => {
    if (!id) return;
    const sticky = {
      id: generateId(),
      bookId: id,
      page: currentPage,
      content: '',
      color: '#fef3c7',
      position: { x: 100 + Math.random() * 100, y: 100 + Math.random() * 100 },
      collapsed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    addStickyNote(sticky);
  }, [id, currentPage, addStickyNote]);

  const handleApplyPromptTemplate = useCallback((template: AIPromptTemplate, text: string) => {
    const prompt = buildPrompt(template, text);
    setSelectedTextForAI(prompt);
    setShowPromptToolbar(false);
    setSelectionContext(null);
    window.getSelection()?.removeAllRanges();
    // Open AI tab in right sidebar
    setRightTab('ai');
    if (!sidebarsOpen.right) toggleRightSidebar();
  }, [setRightTab, sidebarsOpen.right, toggleRightSidebar, setSelectionContext]);

  // Current page highlights for overlay
  const currentPageHighlights = useMemo(() => {
    return highlights.filter((h) => h.page === currentPage);
  }, [highlights, currentPage]);

  const currentPageStickyNotes = useMemo(() => {
    return stickyNotes.filter((s) => s.page === currentPage);
  }, [stickyNotes, currentPage]);

  // ===== Bookmark handlers =====
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
    if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
    else await document.exitFullscreen();
  }, []);

  const toggleTheme = useCallback(() => {
    const root = document.documentElement;
    const current = root.getAttribute('data-theme');
    root.setAttribute('data-theme', current === 'dark' ? 'light' : 'dark');
  }, []);

  const handlePageSubmit = useCallback(() => {
    const val = parseInt(pageInput, 10);
    if (!isNaN(val) && val >= 1 && val <= numPages) setPage(val);
    else setPageInput(String(currentPage));
  }, [pageInput, numPages, currentPage, setPage]);

  const todaySession = useMemo(() => {
    if (!plan) return null;
    const now = new Date();
    const dayStr = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    return plan.sessions.find((s) => !s.completed && (s.day === dayStr || dayStr === 'friday'));
  }, [plan]);

  const isPrevDisabled = currentPage <= 1;
  const isNextDisabled = currentPage >= numPages;
  const isPrevBookDisabled = currentPage <= 1;
  const isNextBookDisabled = currentPage + 2 > numPages;
  const isPrevColumnDisabled = currentPage <= 1 && columnSide === 'left';
  const isNextColumnDisabled = currentPage >= numPages && columnSide === 'right';

  const handlePrev = useCallback(() => {
    if (isBookMode) setPage(Math.max(1, currentPage - 2));
    else if (isColumnMode) prevColumn();
    else { if (currentPage > 1) setPage(currentPage - 1); }
  }, [isBookMode, isColumnMode, currentPage, setPage, prevColumn]);

  const handleNext = useCallback(() => {
    if (isBookMode) {
      if (currentPage + 2 <= numPages) setPage(currentPage + 2);
      else if (currentPage + 1 <= numPages) setPage(currentPage + 1);
    } else if (isColumnMode) nextColumn();
    else { if (currentPage < numPages) setPage(currentPage + 1); }
  }, [isBookMode, isColumnMode, currentPage, numPages, setPage, nextColumn]);

  const isPrevBtnDisabled = isBookMode ? isPrevBookDisabled : isColumnMode ? isPrevColumnDisabled : isPrevDisabled;
  const isNextBtnDisabled = isBookMode ? isNextBookDisabled : isColumnMode ? isNextColumnDisabled : isNextDisabled;

  const modeButton = (mode: ReadingMode, icon: React.ReactNode, label: string, shortcut: string, available = true) => (
    <button
      className={`pdf-toolbar-btn ${readingMode === mode ? 'active' : ''} ${!available ? 'disabled' : ''}`}
      onClick={() => available && setReadingMode(mode)}
      title={`${label} (${shortcut})`}
      disabled={!available}
    >
      {icon}
    </button>
  );

  const leftTabButton = (tab: LeftTab, icon: React.ReactNode, label: string, count?: number) => (
    <button
      className={`pdf-left-tab ${leftTab === tab ? 'active' : ''}`}
      onClick={() => setLeftTab(tab)}
      aria-label={label}
    >
      {icon}
      <span>{label}</span>
      {count !== undefined && count > 0 && <span className="pdf-tab-badge">{count}</span>}
    </button>
  );

  if (bookLoading) {
    return (
      <div className="pdf-reader-page">
        <div className="pdf-reader-center">
          <div className="pdf-loading"><p>Loading...</p></div>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="pdf-reader-page">
        <div className="pdf-reader-center">
          <div className="pdf-loading"><p>Book not found.</p></div>
        </div>
      </div>
    );
  }

  const onDocumentLoadSuccess = ({ numPages: n }: { numPages: number }) => {
    setNumPages(n);
  };

  // Format time ago
  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  return (
    <div className={`pdf-reader-page ${isFocusMode ? 'reader-focus' : ''} ${isBookMode ? 'reader-book' : ''} ${isColumnMode ? 'reader-column' : ''}`}>
      {/* Left Sidebar */}
      {!isSidebarDisabled && (
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

          {/* Tab Navigation */}
          <div className="pdf-left-tabs">
            {leftTabButton('outline', <List size={14} />, 'Outline')}
            {leftTabButton('bookmarks', <Bookmark size={14} />, 'Bookmarks', bookmarks.length)}
            {leftTabButton('highlights', <Highlighter size={14} />, 'Highlights', highlights.length)}
            {leftTabButton('notes', <StickyNoteIcon size={14} />, 'Notes', notes.length)}
            {leftTabButton('today', <BookOpen size={14} />, "Today's Goal")}
            {leftTabButton('activity', <Activity size={14} />, 'Activity')}
          </div>

          {/* Tab Content */}
          <div className="pdf-left-tab-content">
            {leftTab === 'outline' && book.outline.length > 0 && (
              <div className="pdf-outline-list">
                {book.outline.map((item, i) => (
                  <button key={i} className="pdf-outline-item">{item.title}</button>
                ))}
              </div>
            )}
            {leftTab === 'outline' && book.outline.length === 0 && (
              <p className="pdf-empty-text">No outline available.</p>
            )}

            {leftTab === 'bookmarks' && (
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
            )}

            {leftTab === 'highlights' && (
              <div className="pdf-highlights-list">
                {highlights.map((h) => (
                  <button key={h.id} className="pdf-highlight-item" onClick={() => setPage(h.page)}>
                    <span className="pdf-highlight-color" style={{ backgroundColor: `var(--highlight-${h.color})` }} />
                    <div>
                      <span className="pdf-highlight-text">{h.selectedText.slice(0, 60)}{h.selectedText.length > 60 ? '...' : ''}</span>
                      <span className="pdf-highlight-meta">Page {h.page} {h.favorite && '★'}</span>
                    </div>
                    <button
                      className="pdf-highlight-remove"
                      onClick={(e) => { e.stopPropagation(); removeHighlight(h.id); }}
                      aria-label="Remove highlight"
                    >
                      <X size={12} />
                    </button>
                  </button>
                ))}
                {highlights.length === 0 && <p className="pdf-empty-text">No highlights yet. Select text to highlight.</p>}
              </div>
            )}

            {leftTab === 'notes' && (
              <div className="pdf-notes-list">
                {notes.map((n) => (
                  <button key={n.id} className="pdf-note-item" onClick={() => n.page && setPage(n.page)}>
                    <div className="pdf-note-item-title">{n.title || 'Untitled Note'}</div>
                    <div className="pdf-note-item-content">{n.content.slice(0, 80)}{n.content.length > 80 ? '...' : ''}</div>
                    <span className="pdf-note-item-meta">
                      {n.page ? `Page ${n.page}` : 'Standalone'} {n.favorite && '★'}
                    </span>
                  </button>
                ))}
                {notes.length === 0 && <p className="pdf-empty-text">No notes yet.</p>}
              </div>
            )}

            {leftTab === 'today' && (
              <>
                {plan && todaySession ? (
                  <div className="pdf-today-goal">
                    {todaySession.isReview ? (
                      <span>Review previous pages</span>
                    ) : (
                      <span>Pages {todaySession.startPage}–{todaySession.endPage}</span>
                    )}
                  </div>
                ) : (
                  <p className="pdf-empty-text">No reading plan set.</p>
                )}
              </>
            )}

            {leftTab === 'activity' && (
              <div className="pdf-activity-list">
                {activities.slice(0, 20).map((a) => (
                  <div key={a.id} className="pdf-activity-item">
                    <div className="pdf-activity-dot" />
                    <div>
                      <span className="pdf-activity-desc">{a.description}</span>
                      <span className="pdf-activity-time">{timeAgo(a.timestamp)}</span>
                    </div>
                  </div>
                ))}
                {activities.length === 0 && <p className="pdf-empty-text">No activity yet.</p>}
              </div>
            )}
          </div>

          <div className="pdf-sidebar-section pdf-sidebar-shortcuts">
            <a href="/library" className="pdf-shortcut-item">
              <BookOpen size={16} /> Library
            </a>
            <a href={`/library/${book.id}/study`} className="pdf-shortcut-item pdf-shortcut-study">
              <GraduationCap size={16} /> Study Workspace
            </a>
            <a href="/library/import" className="pdf-shortcut-item pdf-shortcut-import">
              <Upload size={16} /> Import PDF
            </a>
          </div>
        </aside>
      )}

      {/* Center Content */}
      <main className="pdf-reader-center">
        {/* Toolbar */}
        <div className={`pdf-toolbar ${isFocusMode && toolbarHidden ? 'pdf-toolbar--hidden' : ''}`}>
          <div className="pdf-toolbar-group">
            <button className="pdf-toolbar-btn" onClick={isSidebarDisabled ? toggleFocusMode : toggleLeftSidebar} aria-label="Menu">
              <Menu size={20} />
            </button>
          </div>
          <div className="pdf-toolbar-divider" />
          <div className="pdf-toolbar-group">
            <button disabled={isPrevBtnDisabled} onClick={handlePrev} aria-label="Previous page">
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
            <button disabled={isNextBtnDisabled} onClick={handleNext} aria-label="Next page">
              <ChevronRight size={18} />
            </button>
          </div>
          {isColumnMode && (
            <>
              <div className="pdf-toolbar-divider" />
              <div className="pdf-toolbar-group">
                <button className={`pdf-column-pill ${columnSide === 'left' ? 'active' : ''}`} onClick={() => { if (columnSide !== 'left') toggleColumnSide(); }}>Left</button>
                <button className={`pdf-column-pill ${columnSide === 'right' ? 'active' : ''}`} onClick={() => { if (columnSide !== 'right') toggleColumnSide(); }}>Right</button>
              </div>
            </>
          )}
          <div className="pdf-toolbar-divider" />
          <div className="pdf-toolbar-group pdf-zoom-group">
            <button onClick={() => setZoom(zoom - 0.1)} aria-label="Zoom out"><ZoomOut size={18} /></button>
            <div className="pdf-zoom-dropdown-wrap" ref={zoomDropdownRef}>
              <button className="pdf-zoom-current" onClick={() => setShowZoomDropdown(!showZoomDropdown)} aria-label="Zoom level">
                {Math.round(zoom * 100)}%
              </button>
              {showZoomDropdown && (
                <div className="pdf-zoom-dropdown">
                  <button className={`pdf-zoom-option ${fitMode === 'width' ? 'active' : ''}`} onClick={() => { setFitMode('width'); setShowZoomDropdown(false); }}>Fit Width</button>
                  <button className={`pdf-zoom-option ${fitMode === 'height' ? 'active' : ''}`} onClick={() => { setFitMode('height'); setShowZoomDropdown(false); }}>Fit Height</button>
                  <button className={`pdf-zoom-option ${fitMode === 'actual' ? 'active' : ''}`} onClick={() => { setFitMode('actual'); setShowZoomDropdown(false); }}>Actual Size</button>
                  <div className="pdf-zoom-divider" />
                  {ZOOM_PRESETS.map((pct) => (
                    <button key={pct} className={`pdf-zoom-option ${Math.round(zoom * 100) === pct ? 'active' : ''}`} onClick={() => { setZoom(pct / 100); setShowZoomDropdown(false); }}>{pct}%</button>
                  ))}
                </div>
              )}
            </div>
            <button onClick={() => setZoom(zoom + 0.1)} aria-label="Zoom in"><ZoomIn size={18} /></button>
          </div>
          <div className="pdf-toolbar-divider" />
          <div className="pdf-toolbar-group">
            {modeButton('standard', <FileText size={18} />, 'Standard', '1')}
            {modeButton('book', <BookOpen size={18} />, 'Book', '2', canUseBookMode)}
            {modeButton('column', <Columns size={18} />, 'Column', '3', canUseColumnMode)}
            {modeButton('focus', <Focus size={18} />, 'Focus', '4')}
          </div>
          <div className="pdf-toolbar-divider" />
          <div className="pdf-toolbar-group">
            <button className="pdf-toolbar-btn" onClick={toggleLeftSidebar} title="Sidebar (B)"><Bookmark size={18} /></button>
            <button className="pdf-toolbar-btn" onClick={toggleRightSidebar} title="Panel (R)"><BarChart3 size={18} /></button>
            <button onClick={() => setShowBookmarkForm(true)} aria-label="Bookmark page"><Bookmark size={18} /></button>
          </div>
          <div className="pdf-toolbar-spacer" />
          <div className="pdf-toolbar-group">
            <button onClick={handleAddStickyNote} title="Add Sticky Note" aria-label="Add sticky note"><StickyNoteIcon size={18} /></button>
            <button onClick={() => navigate(`/library/${book.id}/study`)} title="Study Workspace" aria-label="Study Workspace"><GraduationCap size={18} /></button>
            <button onClick={toggleFullscreen} title="Fullscreen (F11)">{isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}</button>
            <button onClick={toggleTheme} title="Toggle theme"><Moon size={18} /></button>
          </div>
        </div>

        {showBookmarkForm && (
          <div className="pdf-bookmark-form">
            <input type="text" placeholder={`Bookmark for page ${currentPage}`} value={bookmarkTitle} onChange={(e) => setBookmarkTitle(e.target.value)} autoFocus onKeyDown={(e) => e.key === 'Enter' && handleAddBookmark()} />
            <Button size="sm" onClick={handleAddBookmark}>Save</Button>
            <Button size="sm" variant="ghost" onClick={() => setShowBookmarkForm(false)}>Cancel</Button>
          </div>
        )}

        {/* PDF Viewer */}
        <div className="pdf-viewer-wrapper" ref={(el) => { (viewerWrapperRef as React.MutableRefObject<HTMLDivElement | null>).current = el; (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = el; }}>
          <Document
            file={book.pdfData}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={<div className="pdf-loading"><div className="pdf-loading-spinner" /><span>Loading PDF...</span></div>}
            error={<div className="pdf-error"><p>Failed to load PDF.</p></div>}
          >
            {isBookMode ? (
              <div className="pdf-book-viewer">
                <div className="pdf-book-page">
                  <Page pageNumber={currentPage} scale={zoom} renderTextLayer={true} renderAnnotationLayer={true} onLoadSuccess={onPageLoadSuccess} />
                  {!isColumnMode && (
                    <HighlightOverlay highlights={currentPageHighlights} pageWidth={pageWidth} pageHeight={pageHeight} zoom={zoom} />
                  )}
                </div>
                {currentPage + 1 <= numPages && (
                  <div className="pdf-book-page">
                    <Page pageNumber={currentPage + 1} scale={zoom} renderTextLayer={true} renderAnnotationLayer={true} />
                    <HighlightOverlay highlights={highlights.filter((h) => h.page === currentPage + 1)} pageWidth={pageWidth} pageHeight={pageHeight} zoom={zoom} />
                  </div>
                )}
              </div>
            ) : isColumnMode ? (
              <div className="pdf-column-viewer">
                <Page
                  pageNumber={currentPage}
                  scale={zoom}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  onLoadSuccess={onPageLoadSuccess}
                  canvasRef={(canvas: HTMLCanvasElement | null) => {
                    if (!canvas || !leftCanvasRef.current || !rightCanvasRef.current) return;
                    const srcCtx = canvas.getContext('2d');
                    if (!srcCtx) return;
                    const halfW = Math.floor(canvas.width / 2);
                    const lc = leftCanvasRef.current;
                    lc.width = halfW; lc.height = canvas.height;
                    lc.getContext('2d')!.drawImage(canvas, 0, 0, halfW, canvas.height, 0, 0, halfW, canvas.height);
                    const rc = rightCanvasRef.current;
                    rc.width = canvas.width - halfW; rc.height = canvas.height;
                    rc.getContext('2d')!.drawImage(canvas, halfW, 0, canvas.width - halfW, canvas.height, 0, 0, canvas.width - halfW, canvas.height);
                  }}
                />
                <div className="pdf-column-half pdf-column-left"><canvas ref={leftCanvasRef} /></div>
                <div className="pdf-column-half pdf-column-right"><canvas ref={rightCanvasRef} /></div>
              </div>
            ) : (
              <div className="pdf-standard-page-wrapper">
                <Page pageNumber={currentPage} scale={zoom} renderTextLayer={true} renderAnnotationLayer={true} onLoadSuccess={onPageLoadSuccess} />
                <HighlightOverlay highlights={currentPageHighlights} pageWidth={pageWidth} pageHeight={pageHeight} zoom={zoom} />
              </div>
            )}
          </Document>

          {/* Sticky Notes */}
          {currentPageStickyNotes.map((sticky) => (
            <StickyNoteComponent
              key={sticky.id}
              sticky={sticky}
              onUpdate={updateStickyNote}
              onRemove={removeStickyNote}
            />
          ))}

          {/* Highlight Toolbar (floating on text selection) */}
          <HighlightToolbar
            onHighlight={handleCreateHighlight}
            onAddNote={handleCreateNoteFromHighlight}
            onCopy={handleCopySelection}
            onFavorite={handleFavoriteSelection}
          />

          {/* Prompt Toolbar for AI actions */}
          {showPromptToolbar && selectionContext && (
            <div style={{ position: 'absolute', left: promptToolbarPos.x, top: promptToolbarPos.y, zIndex: 150 }}>
              <PromptToolbar
                selectedText={selectionContext.selectedText}
                onApplyTemplate={handleApplyPromptTemplate}
                onClose={() => { setShowPromptToolbar(false); }}
              />
            </div>
          )}
        </div>
      </main>

      {/* Right Panel */}
      {!isSidebarDisabled && (
        <aside className={`pdf-sidebar-right ${sidebarsOpen.right ? 'open' : ''}`}>
          <div className="pdf-sidebar-header">
            <button className="pdf-sidebar-close" onClick={toggleRightSidebar} aria-label="Close panel"><X size={20} /></button>
          </div>
          <div className="pdf-right-tabs">
            <button className={`pdf-right-tab ${rightTab === 'progress' ? 'active' : ''}`} onClick={() => setRightTab('progress')}><BarChart3 size={16} /> Progress</button>
            <button className={`pdf-right-tab ${rightTab === 'bookmarks' ? 'active' : ''}`} onClick={() => setRightTab('bookmarks')}><Bookmark size={16} /> Bookmarks</button>
            <button className={`pdf-right-tab ${rightTab === 'ai' ? 'active' : ''}`} onClick={() => setRightTab('ai')}><Sparkles size={16} /> AI</button>
            <button className={`pdf-right-tab ${rightTab === 'settings' ? 'active' : ''}`} onClick={() => setRightTab('settings')}><Settings size={16} /> Settings</button>
          </div>
          <div className="pdf-right-content">
            {rightTab === 'progress' && progress && (
              <div className="pdf-progress-panel">
                <div className="pdf-stat-row"><span>Current Page</span><strong>{progress.currentPage}</strong></div>
                <div className="pdf-stat-row"><span>Pages Read</span><strong>{progress.totalPagesRead}</strong></div>
                <div className="pdf-stat-row"><span>Reading Time</span><strong>{Math.round(progress.totalReadingTimeMs / 60000)} min</strong></div>
                <div className="pdf-stat-row"><span>Highlights</span><strong>{highlights.length}</strong></div>
                <div className="pdf-stat-row"><span>Notes</span><strong>{notes.length}</strong></div>
                <div className="pdf-stat-row"><span>Bookmarks</span><strong>{bookmarks.length}</strong></div>
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
                    <button onClick={() => removeBookmark(bm.id)} className="pdf-bookmark-remove"><X size={14} /></button>
                  </div>
                ))}
                {bookmarks.length === 0 && <p className="pdf-empty-text">No bookmarks yet.</p>}
              </div>
            )}
            {rightTab === 'ai' && id && (
              <div className="pdf-ai-panel" style={{ height: '100%' }}>
                <AIPanel
                  bookId={id}
                  selectionText={selectedTextForAI}
                  onClearSelection={() => setSelectedTextForAI(undefined)}
                />
              </div>
            )}
            {rightTab === 'settings' && (
              <div className="pdf-settings-panel">
                <div className="pdf-setting">
                  <label>Reading Mode</label>
                  <div className="pdf-setting-btns">
                    <button className={currentReadingMode === 'standard' ? 'active' : ''} onClick={() => setReadingMode('standard')}>Standard</button>
                    <button className={currentReadingMode === 'book' ? 'active' : ''} onClick={() => canUseBookMode && setReadingMode('book')} disabled={!canUseBookMode}>Book</button>
                    <button className={currentReadingMode === 'column' ? 'active' : ''} onClick={() => canUseColumnMode && setReadingMode('column')} disabled={!canUseColumnMode}>Column</button>
                    <button className={currentReadingMode === 'focus' ? 'active' : ''} onClick={toggleFocusMode}>Focus</button>
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
                <div className="pdf-setting"><label>Zoom</label><span>{Math.round(zoom * 100)}%</span></div>
                <div className="pdf-shortcuts-section">
                  <h4>Keyboard Shortcuts</h4>
                  <div className="pdf-shortcut-row"><kbd>1</kbd><span>Standard mode</span></div>
                  <div className="pdf-shortcut-row"><kbd>2</kbd><span>Book mode</span></div>
                  <div className="pdf-shortcut-row"><kbd>3</kbd><span>Column mode</span></div>
                  <div className="pdf-shortcut-row"><kbd>4</kbd><span>Focus mode</span></div>
                  <div className="pdf-shortcut-row"><kbd>←</kbd><span>Previous page</span></div>
                  <div className="pdf-shortcut-row"><kbd>→</kbd><span>Next page</span></div>
                  <div className="pdf-shortcut-row"><kbd>Home</kbd><span>First page</span></div>
                  <div className="pdf-shortcut-row"><kbd>End</kbd><span>Last page</span></div>
                  <div className="pdf-shortcut-row"><kbd>+</kbd><span>Zoom in</span></div>
                  <div className="pdf-shortcut-row"><kbd>-</kbd><span>Zoom out</span></div>
                  <div className="pdf-shortcut-row"><kbd>F</kbd><span>Focus mode</span></div>
                  <div className="pdf-shortcut-row"><kbd>B</kbd><span>Left sidebar</span></div>
                  <div className="pdf-shortcut-row"><kbd>R</kbd><span>Right panel</span></div>
                  <div className="pdf-shortcut-row"><kbd>Esc</kbd><span>Exit focus / Close</span></div>
                </div>
              </div>
            )}
          </div>
        </aside>
      )}
    </div>
  );
};
