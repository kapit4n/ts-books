import { db } from './database';
import { Flashcard } from '../types/learning';

export const userFlashcardService = {
  async getByBook(bookId: string): Promise<Flashcard[]> {
    return db.flashcards.where('bookId').equals(bookId).toArray();
  },
  async get(id: string): Promise<Flashcard | undefined> {
    return db.flashcards.get(id);
  },
  async getDueCards(bookId: string): Promise<Flashcard[]> {
    const now = new Date().toISOString();
    return db.flashcards
      .where('bookId').equals(bookId)
      .filter(c => !c.nextReview || c.nextReview <= now)
      .toArray();
  },
  async getByDeck(deckId: string): Promise<Flashcard[]> {
    return db.flashcards.where('deckId').equals(deckId).toArray();
  },
  async getByChapter(bookId: string, chapterTitle: string): Promise<Flashcard[]> {
    return db.flashcards.where('bookId').equals(bookId)
      .filter(c => c.chapterTitle === chapterTitle).toArray();
  },
  async getByCategory(bookId: string, category: string): Promise<Flashcard[]> {
    return db.flashcards.where('bookId').equals(bookId)
      .filter(c => c.category === category).toArray();
  },
  async add(card: Flashcard): Promise<void> {
    await db.flashcards.add(card);
  },
  async addBatch(cards: Flashcard[]): Promise<void> {
    await db.flashcards.bulkAdd(cards);
  },
  async update(id: string, updates: Partial<Flashcard>): Promise<void> {
    await db.flashcards.update(id, { ...updates, updatedAt: new Date().toISOString() });
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
  async countByStatus(bookId: string): Promise<{ new: number; learning: number; reviewing: number; mastered: number }> {
    const cards = await db.flashcards.where('bookId').equals(bookId).toArray();
    return {
      new: cards.filter(c => c.status === 'new').length,
      learning: cards.filter(c => c.status === 'learning').length,
      reviewing: cards.filter(c => c.status === 'reviewing').length,
      mastered: cards.filter(c => c.status === 'mastered').length,
    };
  },
  async recordReview(id: string, rating: 'again' | 'hard' | 'good' | 'easy'): Promise<void> {
    const card = await db.flashcards.get(id);
    if (!card) return;
    const now = new Date();
    let { easeFactor, interval, streak, correctCount, incorrectCount, status } = card;
    const isCorrect = rating !== 'again';
    if (isCorrect) {
      correctCount += 1;
      streak += 1;
      if (rating === 'easy') { easeFactor = Math.min(3.0, easeFactor + 0.15); interval = Math.round(interval * easeFactor * 1.3); }
      else if (rating === 'good') { easeFactor = Math.min(3.0, easeFactor + 0.1); interval = Math.round(interval * easeFactor); }
      else { /* hard */ interval = Math.max(1, Math.round(interval * 1.2)); }
      if (streak >= 3 && status === 'new') status = 'learning';
      if (streak >= 5 && status === 'learning') status = 'reviewing';
      if (streak >= 8 && easeFactor >= 2.3) status = 'mastered';
    } else {
      incorrectCount += 1;
      streak = 0;
      interval = 1;
      easeFactor = Math.max(1.3, easeFactor - 0.2);
      if (status === 'mastered') status = 'reviewing';
      else if (status === 'reviewing') status = 'learning';
    }
    const nextReview = new Date(now.getTime() + interval * 24 * 60 * 60 * 1000).toISOString();
    await db.flashcards.update(id, {
      easeFactor, interval, streak, correctCount, incorrectCount, status,
      lastReviewed: now.toISOString(), nextReview, updatedAt: now.toISOString(),
    });
  },
  async getStats(bookId: string): Promise<{ total: number; due: number; mastered: number; learning: number; streak: number }> {
    const cards = await db.flashcards.where('bookId').equals(bookId).toArray();
    const now = new Date().toISOString();
    const due = cards.filter(c => !c.nextReview || c.nextReview <= now).length;
    const mastered = cards.filter(c => c.status === 'mastered').length;
    const learning = cards.filter(c => c.status === 'learning' || c.status === 'reviewing').length;
    const maxStreak = cards.reduce((max, c) => Math.max(max, c.streak), 0);
    return { total: cards.length, due, mastered, learning, streak: maxStreak };
  },
  async getAll(): Promise<Flashcard[]> {
    return db.flashcards.toArray();
  },
};
