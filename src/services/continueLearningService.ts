import { db } from './database';
import { ContinueLearningState } from '../types/learning';

export const continueLearningService = {
  async get(bookId: string): Promise<ContinueLearningState | undefined> {
    return db.continueLearning.get(bookId);
  },
  async update(bookId: string, updates: Partial<Omit<ContinueLearningState, 'bookId'>>): Promise<void> {
    const existing = await db.continueLearning.get(bookId);
    if (existing) {
      await db.continueLearning.update(bookId, { ...updates, updatedAt: new Date().toISOString() });
    } else {
      const state: ContinueLearningState = {
        bookId,
        lastActivity: updates.lastActivity || 'reading',
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      await db.continueLearning.add(state);
    }
  },
  async remove(bookId: string): Promise<void> {
    await db.continueLearning.delete(bookId);
  },
  async getAll(): Promise<ContinueLearningState[]> {
    return db.continueLearning.toArray();
  },
};
