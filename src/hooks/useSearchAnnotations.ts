import { create } from 'zustand';
import { searchService } from '../services/searchService';
import { Annotation, StudyFilter } from '../types/study';

interface SearchState {
  query: string;
  results: Annotation[];
  filters: StudyFilter;
  loading: boolean;
  setQuery: (query: string) => void;
  setFilters: (filters: StudyFilter) => void;
  search: (bookId: string) => Promise<void>;
  applyFilters: (bookId: string) => Promise<void>;
  clearSearch: () => void;
}

export const useSearchAnnotationsStore = create<SearchState>((set, get) => ({
  query: '',
  results: [],
  filters: { sortBy: 'createdAt', sortDirection: 'desc' },
  loading: false,

  setQuery: (query) => set({ query }),

  setFilters: (filters) => set({ filters }),

  search: async (bookId) => {
    const { query } = get();
    if (!query.trim()) {
      const results = await searchService.filterAnnotations(bookId, get().filters);
      set({ results });
      return;
    }
    set({ loading: true });
    const results = await searchService.searchAll(bookId, query);
    set({ results, loading: false });
  },

  applyFilters: async (bookId) => {
    set({ loading: true });
    const { query, filters } = get();
    let results: Annotation[];
    if (query.trim()) {
      results = await searchService.searchAll(bookId, query);
      // Apply additional filters on top of search
      const f = filters;
      if (f.color) results = results.filter((r) => r.type !== 'highlight' || r.color === f.color);
      if (f.favorite) results = results.filter((r) => r.favorite);
      if (f.tags && f.tags.length > 0) {
        results = results.filter((r) => f.tags!.some((t) => r.tags.includes(t)));
      }
      if (f.pageMin) results = results.filter((r) => (r.page || 0) >= f.pageMin!);
      if (f.pageMax) results = results.filter((r) => (r.page || 0) <= f.pageMax!);
    } else {
      results = await searchService.filterAnnotations(bookId, filters);
    }
    set({ results, loading: false });
  },

  clearSearch: () => set({ query: '', results: [], filters: { sortBy: 'createdAt', sortDirection: 'desc' } }),
}));
