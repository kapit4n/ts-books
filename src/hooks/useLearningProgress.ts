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
    const stats = await learningStatsService.getOrCreate(bookId);
    set({ stats, loading: false });
  },

  loadGlobalStats: async () => {
    set({ loading: true });
    const globalStats = await learningStatsService.getGlobalStats();
    set({ globalStats, loading: false });
  },

  refreshStats: async (bookId) => {
    set({ loading: true });
    const stats = await learningStatsService.refreshStats(bookId);
    set({ stats, loading: false });
  },
}));
