import { create } from 'zustand';
import { chapterProgressService } from '../services/chapterProgressService';
import { ChapterProgress, ChapterStatus } from '../types/learning';

interface ChapterProgressState {
  chapters: ChapterProgress[];
  completionPercentage: number;
  loading: boolean;
  loadChapters: (bookId: string) => Promise<void>;
  markChapter: (id: string, status: ChapterStatus) => Promise<void>;
  getOrCreateChapter: (bookId: string, title: string, pageNumber: number) => Promise<ChapterProgress>;
  getNextChapter: (bookId: string) => Promise<ChapterProgress | null>;
  refreshPercentage: (bookId: string) => Promise<void>;
  removeByBook: (bookId: string) => Promise<void>;
}

export const useChapterProgressStore = create<ChapterProgressState>((set, get) => ({
  chapters: [],
  completionPercentage: 0,
  loading: false,

  loadChapters: async (bookId) => {
    set({ loading: true });
    const chapters = await chapterProgressService.getByBook(bookId);
    const completionPercentage = await chapterProgressService.getCompletionPercentage(bookId);
    set({ chapters, completionPercentage, loading: false });
  },

  markChapter: async (id, status) => {
    await chapterProgressService.updateStatus(id, status);
    set({
      chapters: get().chapters.map(c => c.id === id ? { ...c, status, updatedAt: new Date().toISOString(), ...(status === 'completed' ? { completedAt: new Date().toISOString() } : {}) } : c),
    });
  },

  getOrCreateChapter: async (bookId, title, pageNumber) => {
    const chapter = await chapterProgressService.getOrCreate(bookId, title, pageNumber);
    const chapters = await chapterProgressService.getByBook(bookId);
    set({ chapters });
    return chapter;
  },

  getNextChapter: async (bookId) => {
    return chapterProgressService.getNextChapter(bookId);
  },

  refreshPercentage: async (bookId) => {
    const completionPercentage = await chapterProgressService.getCompletionPercentage(bookId);
    set({ completionPercentage });
  },

  removeByBook: async (bookId) => {
    await chapterProgressService.removeByBook(bookId);
    set({ chapters: [], completionPercentage: 0 });
  },
}));
