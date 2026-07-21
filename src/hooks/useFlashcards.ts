import { create } from 'zustand';
import { flashcardService } from '../services/flashcardService';
import { Flashcard } from '../types/learning';
import { generateId } from '../lib/utils';

interface FlashcardState {
  cards: Flashcard[];
  dueCards: Flashcard[];
  stats: { total: number; due: number; mastered: number; learning: number };
  loading: boolean;
  activeStudyCardIndex: number;
  showAnswer: boolean;
  loadCards: (bookId: string) => Promise<void>;
  loadDueCards: (bookId: string) => Promise<void>;
  addCard: (card: Omit<Flashcard, 'id' | 'createdAt' | 'updatedAt' | 'streak' | 'easeFactor' | 'interval' | 'correctCount' | 'incorrectCount' | 'status'>) => Promise<void>;
  addBatch: (cards: Omit<Flashcard, 'id' | 'createdAt' | 'updatedAt' | 'streak' | 'easeFactor' | 'interval' | 'correctCount' | 'incorrectCount' | 'status'>[]) => Promise<void>;
  removeCard: (id: string) => Promise<void>;
  removeByBook: (bookId: string) => Promise<void>;
  recordReview: (id: string, correct: boolean) => Promise<void>;
  nextStudyCard: () => void;
  setShowAnswer: (show: boolean) => void;
  refreshStats: (bookId: string) => Promise<void>;
}

export const useFlashcardStore = create<FlashcardState>((set, get) => ({
  cards: [],
  dueCards: [],
  stats: { total: 0, due: 0, mastered: 0, learning: 0 },
  loading: false,
  activeStudyCardIndex: 0,
  showAnswer: false,

  loadCards: async (bookId) => {
    set({ loading: true });
    const cards = await flashcardService.getByBook(bookId);
    set({ cards, loading: false });
  },

  loadDueCards: async (bookId) => {
    set({ loading: true });
    const dueCards = await flashcardService.getDueCards(bookId);
    set({ dueCards, loading: false, activeStudyCardIndex: 0, showAnswer: false });
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
    await flashcardService.create(card);
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
    await flashcardService.createBatch(cards);
    set({ cards: [...get().cards, ...cards] });
  },

  removeCard: async (id) => {
    await flashcardService.remove(id);
    set({ cards: get().cards.filter((c) => c.id !== id) });
  },

  removeByBook: async (bookId) => {
    await flashcardService.removeByBook(bookId);
    set({ cards: [], dueCards: [], stats: { total: 0, due: 0, mastered: 0, learning: 0 } });
  },

  recordReview: async (id, correct) => {
    await flashcardService.recordReview(id, correct);
    const card = get().cards.find((c) => c.id === id);
    if (card) {
      const updatedCard = { ...card };
      if (correct) {
        updatedCard.correctCount += 1;
        updatedCard.streak += 1;
      } else {
        updatedCard.incorrectCount += 1;
        updatedCard.streak = 0;
      }
      set({
        cards: get().cards.map((c) => (c.id === id ? updatedCard : c)),
      });
    }
  },

  nextStudyCard: () => {
    const { activeStudyCardIndex, dueCards } = get();
    if (activeStudyCardIndex < dueCards.length - 1) {
      set({ activeStudyCardIndex: activeStudyCardIndex + 1, showAnswer: false });
    }
  },

  setShowAnswer: (show) => set({ showAnswer: show }),

  refreshStats: async (bookId) => {
    const stats = await flashcardService.getStats(bookId);
    set({ stats });
  },
}));
