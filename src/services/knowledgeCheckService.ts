import { QuizQuestion } from '../types/learning';
import { generateId } from '../lib/utils';
import { db } from './database';

export const knowledgeCheckService = {
  async getByChapter(bookId: string, chapterTitle: string): Promise<QuizQuestion[]> {
    const quizzes = await db.quizzes.where('bookId').equals(bookId).toArray();
    return quizzes.flatMap(q => q.questions).filter(q => q.category === chapterTitle);
  },
  async createForChapter(bookId: string, chapterTitle: string, questions: Omit<QuizQuestion, 'id' | 'createdAt' | 'bookId' | 'category'>[]): Promise<QuizQuestion[]> {
    const now = new Date().toISOString();
    const created: QuizQuestion[] = questions.map(q => ({
      ...q,
      id: generateId() + Math.random().toString(36).slice(2, 5),
      bookId,
      category: chapterTitle,
      createdAt: now,
    }));
    return created;
  },
};
