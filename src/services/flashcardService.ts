import { db } from '../services/database';
import { Flashcard } from '../types/learning';

export const flashcardService = {
  async getByBook(bookId: string): Promise<Flashcard[]> {
    return db.flashcards.where('bookId').equals(bookId).toArray();
  },

  async getDueCards(bookId: string): Promise<Flashcard[]> {
    const now = new Date().toISOString();
    return db.flashcards
      .where('bookId')
      .equals(bookId)
      .filter((c) => !c.nextReview || c.nextReview <= now)
      .toArray();
  },

  async get(id: string): Promise<Flashcard | undefined> {
    return db.flashcards.get(id);
  },

  async create(card: Flashcard): Promise<void> {
    await db.flashcards.add(card);
  },

  async createBatch(cards: Flashcard[]): Promise<void> {
    await db.flashcards.bulkAdd(cards);
  },

  async update(id: string, updates: Partial<Flashcard>): Promise<void> {
    await db.flashcards.update(id, updates);
  },

  async remove(id: string): Promise<void> {
    await db.flashcards.delete(id);
  },

  async removeByBook(bookId: string): Promise<void> {
    await db.flashcards.where('bookId').equals(bookId).delete();
  },

  async count(bookId: string): Promise<number> {
    return db.flashcards.where('bookId').equals(bookId).count();
  },

  async recordReview(id: string, correct: boolean): Promise<void> {
    const card = await db.flashcards.get(id);
    if (!card) return;

    const now = new Date();
    let { interval, easeFactor, streak } = card;

    if (correct) {
      if (streak === 0) interval = 1;
      else if (streak === 1) interval = 6;
      else interval = Math.round(interval * easeFactor);
      streak += 1;
      easeFactor = Math.max(1.3, easeFactor + 0.1);
    } else {
      streak = 0;
      interval = 1;
      easeFactor = Math.max(1.3, easeFactor - 0.2);
    }

    const nextReview = new Date(now.getTime() + interval * 24 * 60 * 60 * 1000).toISOString();

    await db.flashcards.update(id, {
      streak,
      easeFactor,
      interval,
      lastReviewed: now.toISOString(),
      nextReview,
      correctCount: card.correctCount + (correct ? 1 : 0),
      incorrectCount: card.incorrectCount + (correct ? 0 : 1),
    });
  },

  async getStats(bookId: string): Promise<{
    total: number;
    due: number;
    mastered: number;
    learning: number;
  }> {
    const cards = await db.flashcards.where('bookId').equals(bookId).toArray();
    const now = new Date().toISOString();
    const due = cards.filter((c) => !c.nextReview || c.nextReview <= now).length;
    const mastered = cards.filter((c) => c.streak >= 4 && c.easeFactor >= 2.0).length;
    return { total: cards.length, due, mastered, learning: cards.length - mastered - due };
  },
};
