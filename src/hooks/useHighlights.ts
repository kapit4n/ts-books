import { create } from 'zustand';
import { highlightService } from '../services/highlightService';
import { studyWorkspaceService } from '../services/studyWorkspaceService';
import { Highlight, HighlightColor } from '../types/study';

interface HighlightsState {
  highlights: Highlight[];
  loading: boolean;
  loadHighlights: (bookId: string) => Promise<void>;
  addHighlight: (highlight: Highlight) => Promise<void>;
  updateHighlight: (id: string, updates: Partial<Highlight>) => Promise<void>;
  removeHighlight: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  setHighlightColor: (id: string, color: HighlightColor) => Promise<void>;
  setHighlightTags: (id: string, tags: string[]) => Promise<void>;
  getByPage: (page: number) => Highlight[];
}

export const useHighlightsStore = create<HighlightsState>((set, get) => ({
  highlights: [],
  loading: false,

  loadHighlights: async (bookId) => {
    set({ loading: true });
    const highlights = await highlightService.getByBook(bookId);
    set({ highlights, loading: false });
  },

  addHighlight: async (highlight) => {
    await highlightService.add(highlight);
    set({ highlights: [...get().highlights, highlight] });
    if (highlight.bookId) {
      await studyWorkspaceService.createActivity(
        highlight.bookId,
        'highlight',
        `Highlighted text on page ${highlight.page}`,
        highlight.page
      );
    }
  },

  updateHighlight: async (id, updates) => {
    await highlightService.update(id, updates);
    set({
      highlights: get().highlights.map((h) =>
        h.id === id ? { ...h, ...updates, updatedAt: new Date().toISOString() } : h
      ),
    });
  },

  removeHighlight: async (id) => {
    await highlightService.remove(id);
    set({ highlights: get().highlights.filter((h) => h.id !== id) });
  },

  toggleFavorite: async (id) => {
    const h = get().highlights.find((x) => x.id === id);
    if (!h) return;
    const newFav = !h.favorite;
    await highlightService.update(id, { favorite: newFav });
    set({
      highlights: get().highlights.map((x) =>
        x.id === id ? { ...x, favorite: newFav } : x
      ),
    });
    if (h.bookId) {
      await studyWorkspaceService.createActivity(
        h.bookId,
        'favorite',
        newFav ? 'Favorited a highlight' : 'Unfavorited a highlight',
        h.page
      );
    }
  },

  setHighlightColor: async (id, color) => {
    await highlightService.update(id, { color });
    set({
      highlights: get().highlights.map((h) =>
        h.id === id ? { ...h, color } : h
      ),
    });
  },

  setHighlightTags: async (id, tags) => {
    await highlightService.update(id, { tags });
    set({
      highlights: get().highlights.map((h) =>
        h.id === id ? { ...h, tags } : h
      ),
    });
  },

  getByPage: (page) => {
    return get().highlights.filter((h) => h.page === page);
  },
}));
