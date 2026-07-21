import { create } from 'zustand';
import { db } from '../services/database';
import { BookBookmark, BookProgress, ReadingPlan, ReadingMode, FitMode, ReaderPreferences } from '../types/library';
import { SelectionContext, HighlightColor } from '../types/study';

const PREFS_KEY = 'ts-books-reader-prefs';

const DEFAULT_PREFS: ReaderPreferences = {
  zoom: 1.0,
  fitMode: 'width',
  theme: 'light',
  readingMode: 'standard',
  columnSide: 'left',
  leftSidebarOpen: true,
  rightSidebarOpen: false,
  lastPage: 1,
};

export function computeFitScale(fitMode: FitMode, containerW: number, containerH: number, pageW: number, pageH: number): number {
  switch (fitMode) {
    case 'width':
      return containerW / pageW;
    case 'height':
      return containerH / pageH;
    case 'actual':
      return 1.0;
  }
}

interface ReaderState {
  currentBookId: string | null;
  currentPage: number;
  totalPages: number;
  zoom: number;
  fitMode: FitMode;
  readingMode: ReadingMode;
  columnSide: 'left' | 'right';
  sidebarsOpen: { left: boolean; right: boolean };
  rightTab: 'bookmarks' | 'notes' | 'progress' | 'settings' | 'ai';
  progress: BookProgress | null;
  bookmarks: BookBookmark[];
  plan: ReadingPlan | null;
  isFullscreen: boolean;
  showSearch: boolean;
  showBookmarkForm: boolean;
  containerWidth: number;
  containerHeight: number;
  selectionContext: SelectionContext | null;
  showHighlightToolbar: boolean;
  activeHighlightColor: HighlightColor;

  setCurrentBook: (bookId: string) => Promise<void>;
  setPage: (page: number) => void;
  setTotalPages: (total: number) => void;
  setZoom: (zoom: number) => void;
  setFitMode: (mode: FitMode) => void;
  setReadingMode: (mode: ReadingMode) => void;
  toggleLeftSidebar: () => void;
  toggleRightSidebar: () => void;
  setLeftSidebar: (open: boolean) => void;
  setRightSidebar: (open: boolean) => void;
  toggleFocusMode: () => void;
  enterFocusMode: () => void;
  exitFocusMode: () => void;
  toggleColumnSide: () => void;
  nextColumn: () => void;
  prevColumn: () => void;
  setContainerSize: (w: number, h: number) => void;
  setRightTab: (tab: ReaderState['rightTab']) => void;
  setIsFullscreen: (v: boolean) => void;
  setShowSearch: (v: boolean) => void;
  setShowBookmarkForm: (v: boolean) => void;
  setSelectionContext: (ctx: SelectionContext | null) => void;
  setShowHighlightToolbar: (v: boolean) => void;
  setActiveHighlightColor: (c: HighlightColor) => void;
  loadProgress: (bookId: string) => Promise<void>;
  saveProgress: (bookId: string, page: number, totalPages: number) => Promise<void>;
  loadBookmarks: (bookId: string) => Promise<void>;
  addBookmark: (bookmark: BookBookmark) => Promise<void>;
  removeBookmark: (id: string) => Promise<void>;
  loadPlan: (bookId: string) => Promise<void>;
  savePreferences: () => void;
  loadPreferences: () => void;
}

function loadPrefsFromStorage(): ReaderPreferences {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (raw) return { ...DEFAULT_PREFS, ...JSON.parse(raw) };
  } catch {}
  return DEFAULT_PREFS;
}

function savePrefsToStorage(prefs: Partial<ReaderPreferences>) {
  try {
    const existing = loadPrefsFromStorage();
    localStorage.setItem(PREFS_KEY, JSON.stringify({ ...existing, ...prefs }));
  } catch {}
}

export const useReaderStore = create<ReaderState>((set, get) => ({
  currentBookId: null,
  currentPage: 1,
  totalPages: 0,
  zoom: DEFAULT_PREFS.zoom,
  fitMode: DEFAULT_PREFS.fitMode,
  readingMode: DEFAULT_PREFS.readingMode,
  columnSide: DEFAULT_PREFS.columnSide,
  sidebarsOpen: { left: DEFAULT_PREFS.leftSidebarOpen, right: DEFAULT_PREFS.rightSidebarOpen },
  rightTab: 'progress',
  progress: null,
  bookmarks: [],
  plan: null,
  isFullscreen: false,
  showSearch: false,
  showBookmarkForm: false,
  containerWidth: 0,
  containerHeight: 0,
  selectionContext: null,
  showHighlightToolbar: false,
  activeHighlightColor: 'yellow',

  setCurrentBook: async (bookId) => {
    const prefs = loadPrefsFromStorage();
    set({
      currentBookId: bookId,
      zoom: prefs.zoom,
      fitMode: prefs.fitMode,
      readingMode: prefs.readingMode,
      columnSide: prefs.columnSide,
      sidebarsOpen: { left: prefs.leftSidebarOpen, right: prefs.rightSidebarOpen },
    });
    await get().loadProgress(bookId);
    await get().loadBookmarks(bookId);
    await get().loadPlan(bookId);
  },

  setPage: (page) => {
    set({ currentPage: page });
    savePrefsToStorage({ lastPage: page });
  },

  setTotalPages: (total) => set({ totalPages: total }),

  setZoom: (zoom) => {
    const clamped = Math.max(0.25, Math.min(5, zoom));
    set({ zoom: clamped });
    savePrefsToStorage({ zoom: clamped });
  },

  setFitMode: (mode) => {
    set({ fitMode: mode });
    savePrefsToStorage({ fitMode: mode });
  },

  setReadingMode: (mode) => {
    if (mode === 'focus' || mode === 'book' || mode === 'column') {
      set({ readingMode: mode, sidebarsOpen: { left: false, right: false } });
      savePrefsToStorage({ readingMode: mode, leftSidebarOpen: false, rightSidebarOpen: false });
    } else {
      const prefs = loadPrefsFromStorage();
      set({
        readingMode: mode,
        sidebarsOpen: { left: prefs.leftSidebarOpen, right: prefs.rightSidebarOpen },
      });
      savePrefsToStorage({ readingMode: mode });
    }
  },

  toggleLeftSidebar: () => {
    const { readingMode } = get();
    if (readingMode === 'focus' || readingMode === 'book' || readingMode === 'column') return;
    const next = !get().sidebarsOpen.left;
    set((s) => ({ sidebarsOpen: { ...s.sidebarsOpen, left: next } }));
    savePrefsToStorage({ leftSidebarOpen: next });
  },

  toggleRightSidebar: () => {
    const { readingMode } = get();
    if (readingMode === 'focus' || readingMode === 'book' || readingMode === 'column') return;
    const next = !get().sidebarsOpen.right;
    set((s) => ({ sidebarsOpen: { ...s.sidebarsOpen, right: next } }));
    savePrefsToStorage({ rightSidebarOpen: next });
  },

  setLeftSidebar: (open) => {
    set((s) => ({ sidebarsOpen: { ...s.sidebarsOpen, left: open } }));
    savePrefsToStorage({ leftSidebarOpen: open });
  },

  setRightSidebar: (open) => {
    set((s) => ({ sidebarsOpen: { ...s.sidebarsOpen, right: open } }));
    savePrefsToStorage({ rightSidebarOpen: open });
  },

  enterFocusMode: () => {
    set({ readingMode: 'focus', sidebarsOpen: { left: false, right: false } });
    savePrefsToStorage({ readingMode: 'focus', leftSidebarOpen: false, rightSidebarOpen: false });
  },

  exitFocusMode: () => {
    const prefs = loadPrefsFromStorage();
    set({
      readingMode: 'standard',
      sidebarsOpen: { left: prefs.leftSidebarOpen, right: prefs.rightSidebarOpen },
    });
    savePrefsToStorage({ readingMode: 'standard' });
  },

  toggleFocusMode: () => {
    if (get().readingMode === 'focus') {
      get().exitFocusMode();
    } else {
      get().enterFocusMode();
    }
  },

  toggleColumnSide: () => {
    const next = get().columnSide === 'left' ? 'right' : 'left';
    set({ columnSide: next });
    savePrefsToStorage({ columnSide: next });
  },

  nextColumn: () => {
    const { columnSide, currentPage, totalPages } = get();
    if (columnSide === 'left') {
      set({ columnSide: 'right' });
      savePrefsToStorage({ columnSide: 'right' });
    } else {
      if (currentPage < totalPages) {
        set({ currentPage: currentPage + 1, columnSide: 'left' });
        savePrefsToStorage({ lastPage: currentPage + 1, columnSide: 'left' });
      }
    }
  },

  prevColumn: () => {
    const { columnSide, currentPage } = get();
    if (columnSide === 'right') {
      set({ columnSide: 'left' });
      savePrefsToStorage({ columnSide: 'left' });
    } else {
      if (currentPage > 1) {
        set({ currentPage: currentPage - 1, columnSide: 'right' });
        savePrefsToStorage({ lastPage: currentPage - 1, columnSide: 'right' });
      }
    }
  },

  setContainerSize: (w, h) => set({ containerWidth: w, containerHeight: h }),

  setRightTab: (tab) => set({ rightTab: tab }),

  setIsFullscreen: (v) => set({ isFullscreen: v }),

  setShowSearch: (v) => set({ showSearch: v }),

  setShowBookmarkForm: (v) => set({ showBookmarkForm: v }),

  setSelectionContext: (ctx) => set({ selectionContext: ctx }),

  setShowHighlightToolbar: (v) => set({ showHighlightToolbar: v }),

  setActiveHighlightColor: (c) => set({ activeHighlightColor: c }),

  loadProgress: async (bookId) => {
    const progress = await db.progress.get(bookId);
    const prefs = loadPrefsFromStorage();
    set({
      progress: progress || null,
      currentPage: progress?.currentPage || prefs.lastPage || 1,
    });
  },

  saveProgress: async (bookId, page, totalPages) => {
    const percentage = Math.round((page / totalPages) * 100);
    const existing = await db.progress.get(bookId);
    const progress: BookProgress = {
      bookId,
      currentPage: page,
      percentage,
      totalPagesRead: Math.max(existing?.totalPagesRead || 0, page),
      totalReadingTimeMs: (existing?.totalReadingTimeMs || 0) + 60000,
      sessionsCompleted: existing?.sessionsCompleted || 0,
      lastVisit: new Date().toISOString(),
      completedSessionIds: existing?.completedSessionIds || [],
    };
    await db.progress.put(progress);
    set({ progress, currentPage: page });
  },

  loadBookmarks: async (bookId) => {
    const bookmarks = await db.bookmarks.where('bookId').equals(bookId).toArray();
    set({ bookmarks });
  },

  addBookmark: async (bookmark) => {
    await db.bookmarks.add(bookmark);
    set({ bookmarks: [...get().bookmarks, bookmark] });
  },

  removeBookmark: async (id) => {
    await db.bookmarks.delete(id);
    set({ bookmarks: get().bookmarks.filter((b) => b.id !== id) });
  },

  loadPlan: async (bookId) => {
    const plan = await db.plans.where('bookId').equals(bookId).first();
    set({ plan: plan || null });
  },

  savePreferences: () => {
    const s = get();
    savePrefsToStorage({
      zoom: s.zoom,
      fitMode: s.fitMode,
      readingMode: s.readingMode,
      columnSide: s.columnSide,
      leftSidebarOpen: s.sidebarsOpen.left,
      rightSidebarOpen: s.sidebarsOpen.right,
      lastPage: s.currentPage,
    });
  },

  loadPreferences: () => {
    const prefs = loadPrefsFromStorage();
    set({
      zoom: prefs.zoom,
      fitMode: prefs.fitMode,
      readingMode: prefs.readingMode,
      columnSide: prefs.columnSide,
      sidebarsOpen: { left: prefs.leftSidebarOpen, right: prefs.rightSidebarOpen },
    });
  },
}));
