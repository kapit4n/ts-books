import { create } from 'zustand';
import { db } from '../services/database';
import { BookBookmark, BookProgress, ReadingPlan } from '../types/library';

interface ReaderState {
  currentBookId: string | null;
  currentPage: number;
  totalPages: number;
  zoom: number;
  fitMode: 'width' | 'page';
  sidebarsOpen: { left: boolean; right: boolean };
  rightTab: 'bookmarks' | 'notes' | 'progress' | 'settings';
  progress: BookProgress | null;
  bookmarks: BookBookmark[];
  plan: ReadingPlan | null;
  setCurrentBook: (bookId: string) => Promise<void>;
  setPage: (page: number) => void;
  setTotalPages: (total: number) => void;
  setZoom: (zoom: number) => void;
  setFitMode: (mode: 'width' | 'page') => void;
  toggleSidebar: (side: 'left' | 'right') => void;
  setRightTab: (tab: ReaderState['rightTab']) => void;
  loadProgress: (bookId: string) => Promise<void>;
  saveProgress: (bookId: string, page: number, totalPages: number) => Promise<void>;
  loadBookmarks: (bookId: string) => Promise<void>;
  addBookmark: (bookmark: BookBookmark) => Promise<void>;
  removeBookmark: (id: string) => Promise<void>;
  loadPlan: (bookId: string) => Promise<void>;
}

export const useReaderStore = create<ReaderState>((set, get) => ({
  currentBookId: null,
  currentPage: 1,
  totalPages: 0,
  zoom: 1.0,
  fitMode: 'width',
  sidebarsOpen: { left: true, right: false },
  rightTab: 'progress',
  progress: null,
  bookmarks: [],
  plan: null,

  setCurrentBook: async (bookId) => {
    set({ currentBookId: bookId });
    await get().loadProgress(bookId);
    await get().loadBookmarks(bookId);
    await get().loadPlan(bookId);
  },

  setPage: (page) => set({ currentPage: page }),
  setTotalPages: (total) => set({ totalPages: total }),
  setZoom: (zoom) => set({ zoom: Math.max(0.5, Math.min(3, zoom)) }),
  setFitMode: (mode) => set({ fitMode: mode }),
  toggleSidebar: (side) =>
    set((state) => ({
      sidebarsOpen: {
        ...state.sidebarsOpen,
        [side]: !state.sidebarsOpen[side],
      },
    })),
  setRightTab: (tab) => set({ rightTab: tab }),

  loadProgress: async (bookId) => {
    const progress = await db.progress.get(bookId);
    set({ progress: progress || null, currentPage: progress?.currentPage || 1 });
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
}));
