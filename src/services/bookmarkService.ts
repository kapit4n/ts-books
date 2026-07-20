import { db } from './database';
import { StudyBookmark } from '../types/study';

export const bookmarkService = {
  async getByBook(bookId: string): Promise<StudyBookmark[]> {
    return db.studyBookmarks.where('bookId').equals(bookId).toArray();
  },

  async getByPage(bookId: string, page: number): Promise<StudyBookmark[]> {
    return db.studyBookmarks
      .where('bookId')
      .equals(bookId)
      .filter((b) => b.page === page)
      .toArray();
  },

  async getFavorites(bookId: string): Promise<StudyBookmark[]> {
    return db.studyBookmarks
      .where('bookId')
      .equals(bookId)
      .filter((b) => b.favorite)
      .toArray();
  },

  async add(bookmark: StudyBookmark): Promise<void> {
    await db.studyBookmarks.add(bookmark);
  },

  async update(id: string, updates: Partial<StudyBookmark>): Promise<void> {
    await db.studyBookmarks.update(id, updates);
  },

  async remove(id: string): Promise<void> {
    await db.studyBookmarks.delete(id);
  },

  async removeByBook(bookId: string): Promise<void> {
    await db.studyBookmarks.where('bookId').equals(bookId).delete();
  },

  async count(bookId: string): Promise<number> {
    return db.studyBookmarks.where('bookId').equals(bookId).count();
  },

  async search(bookId: string, query: string): Promise<StudyBookmark[]> {
    const lower = query.toLowerCase();
    const all = await db.studyBookmarks.where('bookId').equals(bookId).toArray();
    return all.filter(
      (b) =>
        b.title.toLowerCase().includes(lower) ||
        b.description.toLowerCase().includes(lower) ||
        b.tags.some((t) => t.toLowerCase().includes(lower))
    );
  },

  async getAll(): Promise<StudyBookmark[]> {
    return db.studyBookmarks.toArray();
  },
};
