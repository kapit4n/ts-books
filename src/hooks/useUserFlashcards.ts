import { create } from 'zustand';
import { userFlashcardService } from '../services/userFlashcardService';
import { Flashcard, FlashcardReviewRating } from '../types/learning';
import { generateId } from '../lib/utils';

interface UserFlashcardsState {
  cards: Flashcard[];
  dueCards: Flashcard[];
  stats: { total: number; due: number; mastered: number; learning: number; streak: number };
  loading: boolean;
  activeStudyIndex: number;
  showAnswer: boolean;
  loadCards: (bookId: string) => Promise<void>;
  loadDueCards: (bookId: string) => Promise<void>;
  addCard: (card: Omit<Flashcard, 'id' | 'createdAt' | 'updatedAt' | 'streak' | 'easeFactor' | 'interval' | 'correctCount' | 'incorrectCount' | 'status'>) => Promise<void>;
  addBatch: (cards: Omit<Flashcard, 'id' | 'createdAt' | 'updatedAt' | 'streak' | 'easeFactor' | 'interval' | 'correctCount' | 'incorrectCount' | 'status'>[]) => Promise<void>;
  updateCard: (id: string, updates: Partial<Flashcard>) => Promise<void>;
  removeCard: (id: string) => Promise<void>;
  removeByBook: (bookId: string) => Promise<void>;
  recordReview: (id: string, rating: FlashcardReviewRating) => Promise<void>;
  nextStudyCard: () => void;
  setShowAnswer: (show: boolean) => void;
  refreshStats: (bookId: string) => Promise<void>;
}

export const useUserFlashcardsStore = create<UserFlashcardsState>((set, get) => ({
  cards: [],
  dueCards: [],
  stats: { total: 0, due: 0, mastered: 0, learning: 0, streak: 0 },
  loading: false,
  activeStudyIndex: 0,
  showAnswer: false,

  loadCards: async (bookId) => {
    set({ loading: true });
    const cards = await userFlashcardService.getByBook(bookId);
    set({ cards, loading: false });
  },

  loadDueCards: async (bookId) => {
    set({ loading: true });
    const dueCards = await userFlashcardService.getDueCards(bookId);
    set({ dueCards, loading: false, activeStudyIndex: 0, showAnswer: false });
  },

  addCard: async (cardData) => {
    const now = new Date().toISOString();
    const card: Flashcard = {
      ...cardData,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
      streak: 0,
      easeFactor: 2.5,
      interval: 0,
      correctCount: 0,
      incorrectCount: 0,
      status: 'new',
    };
    await userFlashcardService.add(card);
    set({ cards: [...get().cards, card] });
  },

  addBatch: async (cardsData) => {
    const now = new Date().toISOString();
    const cards: Flashcard[] = cardsData.map((c, i) => ({
      ...c,
      id: generateId() + i.toString(36),
      createdAt: now,
      updatedAt: now,
      streak: 0,
      easeFactor: 2.5,
      interval: 0,
      correctCount: 0,
      incorrectCount: 0,
      status: 'new' as const,
    }));
    await userFlashcardService.addBatch(cards);
    set({ cards: [...get().cards, ...cards] });
  },

  updateCard: async (id, updates) => {
    await userFlashcardService.update(id, updates);
    set({ cards: get().cards.map(c => c.id === id ? { ...c, ...updates } : c) });
  },

  removeCard: async (id) => {
    await userFlashcardService.remove(id);
    set({ cards: get().cards.filter(c => c.id !== id) });
  },

  removeByBook: async (bookId) => {
    await userFlashcardService.removeByBook(bookId);
    set({ cards: [], dueCards: [], stats: { total: 0, due: 0, mastered: 0, learning: 0, streak: 0 } });
  },

  recordReview: async (id, rating) => {
    await userFlashcardService.recordReview(id, rating);
    const { bookId } = get().cards.find(c => c.id === id) || {};
    if (bookId) {
      const stats = await userFlashcardService.getStats(bookId);
      set({ stats });
    }
  },

  nextStudyCard: () => {
    const { activeStudyIndex, dueCards } = get();
    if (activeStudyIndex < dueCards.length - 1) {
      set({ activeStudyIndex: activeStudyIndex + 1, showAnswer: false });
    }
  },

  setShowAnswer: (show) => set({ showAnswer: show }),

  refreshStats: async (bookId) => {
    const stats = await userFlashcardService.getStats(bookId);
    set({ stats });
  },
}));
