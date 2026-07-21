import { create } from 'zustand';
import { learningStatsService } from '../services/learningStatsService';
import { LearningStats, GlobalLearningStats } from '../types/learning';

interface LearningProgressState {
  stats: LearningStats | null;
  globalStats: GlobalLearningStats | null;
  loading: boolean;
  loadStats: (bookId: string) => Promise<void>;
  loadGlobalStats: () => Promise<void>;
  refreshStats: (bookId: string) => Promise<void>;
}

export const useLearningProgressStore = create<LearningProgressState>((set) => ({
  stats: null,
  globalStats: null,
  loading: false,

  loadStats: async (bookId) => {
    set({ loading: true });
    try {
      const stats = await learningStatsService.getOrCreate(bookId);
      set({ stats, loading: false });
    } catch (err) {
      console.error('[LearningProgress] Failed to load stats:', err);
      set({ loading: false });
    }
  },

  loadGlobalStats: async () => {
    set({ loading: true });
    try {
      const globalStats = await learningStatsService.getGlobalStats();
      set({ globalStats, loading: false });
    } catch (err) {
      console.error('[LearningProgress] Failed to load global stats:', err);
      set({ loading: false });
    }
  },

  refreshStats: async (bookId) => {
    set({ loading: true });
    try {
      const stats = await learningStatsService.refreshStats(bookId);
      set({ stats, loading: false });
    } catch (err) {
      console.error('[LearningProgress] Failed to refresh stats:', err);
      set({ loading: false });
    }
  },
}));
