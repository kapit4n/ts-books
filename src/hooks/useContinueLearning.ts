import { create } from 'zustand';
import { continueLearningService } from '../services/continueLearningService';
import { ContinueLearningState } from '../types/learning';

interface ContinueLearningState2 {
  states: ContinueLearningState[];
  getState: (bookId: string) => ContinueLearningState | undefined;
  loadStates: () => Promise<void>;
  updateState: (bookId: string, updates: Partial<Omit<ContinueLearningState, 'bookId'>>) => Promise<void>;
  removeState: (bookId: string) => Promise<void>;
}

export const useContinueLearningStore = create<ContinueLearningState2>((set, get) => ({
  states: [],

  getState: (bookId) => {
    return get().states.find(s => s.bookId === bookId);
  },

  loadStates: async () => {
    const states = await continueLearningService.getAll();
    set({ states });
  },

  updateState: async (bookId, updates) => {
    await continueLearningService.update(bookId, updates);
    const states = await continueLearningService.getAll();
    set({ states });
  },

  removeState: async (bookId) => {
    await continueLearningService.remove(bookId);
    set({ states: get().states.filter(s => s.bookId !== bookId) });
  },
}));
