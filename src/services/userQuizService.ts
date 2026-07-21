import { db } from './database';
import { Quiz, QuizAttempt } from '../types/learning';

export const userQuizService = {
  async getByBook(bookId: string): Promise<Quiz[]> {
    return db.quizzes.where('bookId').equals(bookId).reverse().sortBy('createdAt');
  },
  async get(id: string): Promise<Quiz | undefined> {
    return db.quizzes.get(id);
  },
  async create(quiz: Quiz): Promise<void> {
    await db.quizzes.add(quiz);
  },
  async update(id: string, updates: Partial<Quiz>): Promise<void> {
    await db.quizzes.update(id, { ...updates, updatedAt: new Date().toISOString() });
  },
  async remove(id: string): Promise<void> {
    await db.quizAttempts.where('quizId').equals(id).delete();
    await db.quizzes.delete(id);
  },
  async removeByBook(bookId: string): Promise<void> {
    const quizzes = await db.quizzes.where('bookId').equals(bookId).toArray();
    for (const q of quizzes) {
      await db.quizAttempts.where('quizId').equals(q.id).delete();
    }
    await db.quizzes.where('bookId').equals(bookId).delete();
  },
  async count(bookId: string): Promise<number> {
    return db.quizzes.where('bookId').equals(bookId).count();
  },
  async getAttempts(quizId: string): Promise<QuizAttempt[]> {
    return db.quizAttempts.where('quizId').equals(quizId).sortBy('startedAt');
  },
  async getAttemptsByBook(bookId: string): Promise<QuizAttempt[]> {
    return db.quizAttempts.where('bookId').equals(bookId).toArray();
  },
  async recordAttempt(attempt: QuizAttempt): Promise<void> {
    await db.quizAttempts.add(attempt);
  },
  async getBestScore(quizId: string): Promise<number> {
    const attempts = await db.quizAttempts.where('quizId').equals(quizId).toArray();
    if (attempts.length === 0) return 0;
    return Math.max(...attempts.map(a => a.score));
  },
  async getStats(bookId: string): Promise<{ total: number; totalAttempts: number; passed: number; bestScore: number }> {
    const quizzes = await db.quizzes.where('bookId').equals(bookId).toArray();
    const attempts = await db.quizAttempts.where('bookId').equals(bookId).toArray();
    const passed = attempts.filter(a => a.passed).length;
    const bestScore = attempts.length > 0 ? Math.max(...attempts.map(a => a.score)) : 0;
    return { total: quizzes.length, totalAttempts: attempts.length, passed, bestScore };
  },
};
