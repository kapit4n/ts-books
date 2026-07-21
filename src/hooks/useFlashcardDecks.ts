import { create } from 'zustand';
import { flashcardDeckService } from '../services/flashcardDeckService';
import { FlashcardDeck } from '../types/learning';
import { generateId } from '../lib/utils';

interface FlashcardDecksState {
  decks: FlashcardDeck[];
  activeDeck: FlashcardDeck | null;
  loading: boolean;
  loadDecks: (bookId: string) => Promise<void>;
  createDeck: (bookId: string, name: string, description?: string, color?: string) => Promise<FlashcardDeck>;
  selectDeck: (id: string) => Promise<void>;
  updateDeck: (id: string, updates: Partial<FlashcardDeck>) => Promise<void>;
  removeDeck: (id: string) => Promise<void>;
  addCardToDeck: (deckId: string, flashcardId: string) => Promise<void>;
  removeCardFromDeck: (deckId: string, flashcardId: string) => Promise<void>;
}

export const useFlashcardDecksStore = create<FlashcardDecksState>((set, get) => ({
  decks: [],
  activeDeck: null,
  loading: false,

  loadDecks: async (bookId) => {
    set({ loading: true });
    const decks = await flashcardDeckService.getByBook(bookId);
    set({ decks, loading: false });
  },

  createDeck: async (bookId, name, description = '', color = '#3b82f6') => {
    const now = new Date().toISOString();
    const deck: FlashcardDeck = {
      id: generateId(),
      bookId,
      name,
      description,
      color,
      flashcardIds: [],
      createdAt: now,
      updatedAt: now,
    };
    await flashcardDeckService.create(deck);
    set({ decks: [...get().decks, deck] });
    return deck;
  },

  selectDeck: async (id) => {
    const deck = await flashcardDeckService.get(id);
    set({ activeDeck: deck || null });
  },

  updateDeck: async (id, updates) => {
    await flashcardDeckService.update(id, updates);
    set({
      decks: get().decks.map(d => d.id === id ? { ...d, ...updates } : d),
      activeDeck: get().activeDeck?.id === id ? { ...get().activeDeck!, ...updates } : get().activeDeck,
    });
  },

  removeDeck: async (id) => {
    await flashcardDeckService.remove(id);
    set({
      decks: get().decks.filter(d => d.id !== id),
      activeDeck: get().activeDeck?.id === id ? null : get().activeDeck,
    });
  },

  addCardToDeck: async (deckId, flashcardId) => {
    await flashcardDeckService.addCardToDeck(deckId, flashcardId);
    const deck = await flashcardDeckService.get(deckId);
    if (deck) {
      set({ decks: get().decks.map(d => d.id === deckId ? deck : d) });
    }
  },

  removeCardFromDeck: async (deckId, flashcardId) => {
    await flashcardDeckService.removeCardFromDeck(deckId, flashcardId);
    const deck = await flashcardDeckService.get(deckId);
    if (deck) {
      set({ decks: get().decks.map(d => d.id === deckId ? deck : d) });
    }
  },
}));
