import { create } from 'zustand';
import { bookmarkService } from '../services/bookmarkService';
import { studyWorkspaceService } from '../services/studyWorkspaceService';
import { StudyBookmark } from '../types/study';

interface StudyBookmarksState {
  bookmarks: StudyBookmark[];
  loading: boolean;
  loadBookmarks: (bookId: string) => Promise<void>;
  addBookmark: (bookmark: StudyBookmark) => Promise<void>;
  updateBookmark: (id: string, updates: Partial<StudyBookmark>) => Promise<void>;
  removeBookmark: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  setBookmarkTags: (id: string, tags: string[]) => Promise<void>;
  getByPage: (page: number) => StudyBookmark[];
}

export const useStudyBookmarksStore = create<StudyBookmarksState>((set, get) => ({
  bookmarks: [],
  loading: false,

  loadBookmarks: async (bookId) => {
    set({ loading: true });
    const bookmarks = await bookmarkService.getByBook(bookId);
    set({ bookmarks, loading: false });
  },

  addBookmark: async (bookmark) => {
    await bookmarkService.add(bookmark);
    set({ bookmarks: [...get().bookmarks, bookmark] });
    if (bookmark.bookId) {
      await studyWorkspaceService.createActivity(
        bookmark.bookId,
        'bookmark',
        `Bookmarked page ${bookmark.page}: "${bookmark.title}"`,
        bookmark.page
      );
    }
  },

  updateBookmark: async (id, updates) => {
    await bookmarkService.update(id, updates);
    set({
      bookmarks: get().bookmarks.map((b) =>
        b.id === id ? { ...b, ...updates } : b
      ),
    });
  },

  removeBookmark: async (id) => {
    await bookmarkService.remove(id);
    set({ bookmarks: get().bookmarks.filter((b) => b.id !== id) });
  },

  toggleFavorite: async (id) => {
    const b = get().bookmarks.find((x) => x.id === id);
    if (!b) return;
    const newFav = !b.favorite;
    await bookmarkService.update(id, { favorite: newFav });
    set({
      bookmarks: get().bookmarks.map((x) =>
        x.id === id ? { ...x, favorite: newFav } : x
      ),
    });
  },

  setBookmarkTags: async (id, tags) => {
    await bookmarkService.update(id, { tags });
    set({
      bookmarks: get().bookmarks.map((b) =>
        b.id === id ? { ...b, tags } : b
      ),
    });
  },

  getByPage: (page) => {
    return get().bookmarks.filter((b) => b.page === page);
  },
}));
