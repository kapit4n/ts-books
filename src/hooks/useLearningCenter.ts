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

interface BookOverview {
  stats: any;
  chapters: any[];
  chapterPercentage: number;
  flashcards: any;
  quizzes: any;
  exercises: any;
}

interface LearningCenterState {
  activeTab: LearningTab;
  bookId: string | null;
  overview: BookOverview | null;
  loading: boolean;
  error: string | null;
  setActiveTab: (tab: LearningTab) => void;
  setBookId: (bookId: string) => void;
  loadOverview: (bookId: string) => Promise<void>;
  refreshAll: (bookId: string) => Promise<void>;
  clearError: () => void;
}

const DEFAULT_OVERVIEW: BookOverview = {
  stats: null,
  chapters: [],
  chapterPercentage: 0,
  flashcards: { total: 0, due: 0, mastered: 0, learning: 0, streak: 0 },
  quizzes: { total: 0, totalAttempts: 0, passed: 0, bestScore: 0 },
  exercises: { total: 0, completed: 0, inProgress: 0 },
};

export const useLearningCenterStore = create<LearningCenterState>((set) => ({
  activeTab: 'overview',
  bookId: null,
  overview: null,
  loading: false,
  error: null,

  setActiveTab: (tab) => set({ activeTab: tab }),

  setBookId: (bookId) => set({ bookId }),

  clearError: () => set({ error: null }),

  loadOverview: async (bookId) => {
    set({ loading: true, error: null });
    try {
      const overview = await learningService.getBookOverview(bookId);
      set({ overview, loading: false });
    } catch (err) {
      console.error('[LearningCenter] Failed to load overview:', err);
      set({ overview: DEFAULT_OVERVIEW, loading: false, error: 'Failed to load overview. Using default values.' });
    }
  },

  refreshAll: async (bookId) => {
    set({ loading: true, error: null });
    try {
      const overview = await learningService.getBookOverview(bookId);
      set({ overview, loading: false });
    } catch (err) {
      console.error('[LearningCenter] Failed to refresh:', err);
      set({ overview: DEFAULT_OVERVIEW, loading: false, error: 'Failed to load learning data. Using defaults.' });
    }

    // Fire remaining stores in parallel — failures in these don't block the page
    Promise.allSettled([
      useUserFlashcardsStore.getState().loadCards(bookId).catch(() => {}),
      useUserFlashcardsStore.getState().refreshStats(bookId).catch(() => {}),
      useUserQuizStore.getState().loadQuizzes(bookId).catch(() => {}),
      useUserQuizStore.getState().refreshStats(bookId).catch(() => {}),
      useExercisesStore.getState().loadExercises(bookId).catch(() => {}),
      useExercisesStore.getState().refreshStats(bookId).catch(() => {}),
      useAchievementsStore.getState().loadAchievements().catch(() => {}),
      useChapterProgressStore.getState().loadChapters(bookId).catch(() => {}),
      useLearningProgressStore.getState().refreshStats(bookId).catch(() => {}),
      useStudyCalendarStore.getState().refreshStreak().catch(() => {}),
      useStudyCalendarStore.getState().refreshWeekTime().catch(() => {}),
    ]).catch(() => {});
  },
}));
