import { create } from 'zustand';
import { learningService } from '../services/learningService';
import { useUserFlashcardsStore } from './useUserFlashcards';
import { useUserQuizStore } from './useUserQuiz';
import { useExercisesStore } from './useExercises';
import { useAchievementsStore } from './useAchievements';
import { useChapterProgressStore } from './useChapterProgress';
import { useLearningProgressStore } from './useLearningProgress';
import { useStudyCalendarStore } from './useStudyCalendar';

type LearningTab = 'overview' | 'flashcards' | 'quizzes' | 'exercises' | 'achievements' | 'statistics';

interface LearningCenterState {
  activeTab: LearningTab;
  bookId: string | null;
  overview: any;
  loading: boolean;
  setActiveTab: (tab: LearningTab) => void;
  setBookId: (bookId: string) => void;
  loadOverview: (bookId: string) => Promise<void>;
  refreshAll: (bookId: string) => Promise<void>;
}

export const useLearningCenterStore = create<LearningCenterState>((set) => ({
  activeTab: 'overview',
  bookId: null,
  overview: null,
  loading: false,

  setActiveTab: (tab) => set({ activeTab: tab }),

  setBookId: (bookId) => set({ bookId }),

  loadOverview: async (bookId) => {
    set({ loading: true, bookId });
    const overview = await learningService.getBookOverview(bookId);
    set({ overview, loading: false });
  },

  refreshAll: async (bookId) => {
    set({ loading: true });
    const [
      overview,
    ] = await Promise.all([
      learningService.getBookOverview(bookId),
      useUserFlashcardsStore.getState().loadCards(bookId),
      useUserFlashcardsStore.getState().refreshStats(bookId),
      useUserQuizStore.getState().loadQuizzes(bookId),
      useUserQuizStore.getState().refreshStats(bookId),
      useExercisesStore.getState().loadExercises(bookId),
      useExercisesStore.getState().refreshStats(bookId),
      useAchievementsStore.getState().loadAchievements(),
      useChapterProgressStore.getState().loadChapters(bookId),
      useLearningProgressStore.getState().refreshStats(bookId),
      useStudyCalendarStore.getState().refreshStreak(),
      useStudyCalendarStore.getState().refreshWeekTime(),
    ]);
    set({ overview, loading: false });
  },
}));
