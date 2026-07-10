import { create } from 'zustand';
import { db } from '../services/database';
import { ImportedBook, ImportJob } from '../types/library';

interface LibraryState {
  books: ImportedBook[];
  importJobs: ImportJob[];
  loading: boolean;
  loadBooks: () => Promise<void>;
  addBook: (book: ImportedBook) => Promise<void>;
  removeBook: (id: string) => Promise<void>;
  updateBook: (id: string, updates: Partial<ImportedBook>) => Promise<void>;
  addImportJob: (job: ImportJob) => void;
  updateImportJob: (id: string, updates: Partial<ImportJob>) => void;
  removeImportJob: (id: string) => void;
}

export const useLibraryStore = create<LibraryState>((set, get) => ({
  books: [],
  importJobs: [],
  loading: false,

  loadBooks: async () => {
    set({ loading: true });
    const books = await db.books.toArray();
    set({ books, loading: false });
  },

  addBook: async (book) => {
    await db.books.add(book);
    set({ books: [...get().books, book] });
  },

  removeBook: async (id) => {
    await db.books.delete(id);
    await db.bookmarks.where('bookId').equals(id).delete();
    await db.progress.delete(id);
    await db.plans.where('bookId').equals(id).delete();
    set({ books: get().books.filter((b) => b.id !== id) });
  },

  updateBook: async (id, updates) => {
    await db.books.update(id, updates);
    const books = get().books.map((b) => (b.id === id ? { ...b, ...updates } : b));
    set({ books });
  },

  addImportJob: (job) => {
    set({ importJobs: [...get().importJobs, job] });
  },

  updateImportJob: (id, updates) => {
    set({
      importJobs: get().importJobs.map((j) => (j.id === id ? { ...j, ...updates } : j)),
    });
  },

  removeImportJob: (id) => {
    set({ importJobs: get().importJobs.filter((j) => j.id !== id) });
  },
}));
