import { db } from './database';
import { ChapterProgress, ChapterStatus } from '../types/learning';
import { generateId } from '../lib/utils';

export const chapterProgressService = {
  async getByBook(bookId: string): Promise<ChapterProgress[]> {
    return db.chapterProgress.where('bookId').equals(bookId).toArray();
  },
  async get(id: string): Promise<ChapterProgress | undefined> {
    return db.chapterProgress.get(id);
  },
  async getOrCreate(bookId: string, chapterTitle: string, pageNumber: number): Promise<ChapterProgress> {
    const existing = await db.chapterProgress
      .where('bookId').equals(bookId)
      .filter(c => c.chapterTitle === chapterTitle).first();
    if (existing) return existing;
    const entry: ChapterProgress = {
      id: generateId(),
      bookId,
      chapterTitle,
      pageNumber,
      status: 'not-started',
      updatedAt: new Date().toISOString(),
    };
    await db.chapterProgress.add(entry);
    return entry;
  },
  async updateStatus(id: string, status: ChapterStatus): Promise<void> {
    const updates: Partial<ChapterProgress> = {
      status,
      updatedAt: new Date().toISOString(),
    };
    if (status === 'completed') updates.completedAt = new Date().toISOString();
    await db.chapterProgress.update(id, updates);
  },
  async removeByBook(bookId: string): Promise<void> {
    await db.chapterProgress.where('bookId').equals(bookId).delete();
  },
  async getCompletionPercentage(bookId: string): Promise<number> {
    const chapters = await db.chapterProgress.where('bookId').equals(bookId).toArray();
    if (chapters.length === 0) return 0;
    const completed = chapters.filter(c => c.status === 'completed').length;
    return Math.round((completed / chapters.length) * 100);
  },
  async getNextChapter(bookId: string): Promise<ChapterProgress | null> {
    const chapters = await db.chapterProgress.where('bookId').equals(bookId).toArray();
    return chapters.find(c => c.status !== 'completed') || null;
  },
  async areAllCompleted(bookId: string): Promise<boolean> {
    const chapters = await db.chapterProgress.where('bookId').equals(bookId).toArray();
    if (chapters.length === 0) return false;
    return chapters.every(c => c.status === 'completed');
  },
};
