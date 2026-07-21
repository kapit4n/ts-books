import { db } from '../services/database';
import { Quiz } from '../types/learning';

export const quizService = {
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
    await db.quizzes.update(id, updates);
  },

  async remove(id: string): Promise<void> {
    await db.quizzes.delete(id);
  },

  async removeByBook(bookId: string): Promise<void> {
    await db.quizzes.where('bookId').equals(bookId).delete();
  },

  async count(bookId: string): Promise<number> {
    return db.quizzes.where('bookId').equals(bookId).count();
  },

  async getStats(bookId: string): Promise<{
    total: number;
    completed: number;
    averageScore: number;
  }> {
    const quizzes = await db.quizzes.where('bookId').equals(bookId).toArray();
    const attempts = await db.quizAttempts.where('bookId').equals(bookId).toArray();
    const completed = attempts.filter((a) => a.passed);
    const avg = attempts.length > 0
      ? attempts.reduce((sum, a) => sum + Math.round((a.score / a.totalQuestions) * 100), 0) / attempts.length
      : 0;
    return { total: quizzes.length, completed: completed.length, averageScore: Math.round(avg) };
  },
};
