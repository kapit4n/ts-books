import { create } from 'zustand';
import { studyWorkspaceService } from '../services/studyWorkspaceService';
import { StudyStatistics, ActivityEntry, Annotation } from '../types/study';

interface StudyWorkspaceState {
  statistics: StudyStatistics | null;
  activities: ActivityEntry[];
  favorites: Annotation[];
  loading: boolean;
  loadStatistics: (bookId: string) => Promise<void>;
  loadActivities: (bookId: string) => Promise<void>;
  loadFavorites: (bookId: string) => Promise<void>;
  refreshAll: (bookId: string) => Promise<void>;
}

export const useStudyWorkspaceStore = create<StudyWorkspaceState>((set) => ({
  statistics: null,
  activities: [],
  favorites: [],
  loading: false,

  loadStatistics: async (bookId) => {
    const statistics = await studyWorkspaceService.getStatistics(bookId);
    set({ statistics });
  },

  loadActivities: async (bookId) => {
    const activities = await studyWorkspaceService.getActivities(bookId);
    set({ activities });
  },

  loadFavorites: async (bookId) => {
    const favorites = await studyWorkspaceService.getFavorites(bookId);
    set({ favorites });
  },

  refreshAll: async (bookId) => {
    set({ loading: true });
    const [statistics, activities, favorites] = await Promise.all([
      studyWorkspaceService.getStatistics(bookId),
      studyWorkspaceService.getActivities(bookId),
      studyWorkspaceService.getFavorites(bookId),
    ]);
    set({ statistics, activities, favorites, loading: false });
  },
}));
