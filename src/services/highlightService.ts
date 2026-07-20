import { db } from './database';
import { Highlight } from '../types/study';

export const highlightService = {
  async getByBook(bookId: string): Promise<Highlight[]> {
    return db.highlights.where('bookId').equals(bookId).toArray();
  },

  async getByPage(bookId: string, page: number): Promise<Highlight[]> {
    return db.highlights
      .where('bookId')
      .equals(bookId)
      .filter((h) => h.page === page)
      .toArray();
  },

  async getByColor(bookId: string, color: string): Promise<Highlight[]> {
    return db.highlights
      .where('bookId')
      .equals(bookId)
      .filter((h) => h.color === color)
      .toArray();
  },

  async getFavorites(bookId: string): Promise<Highlight[]> {
    return db.highlights
      .where('bookId')
      .equals(bookId)
      .filter((h) => h.favorite)
      .toArray();
  },

  async getHighlightsWithNotes(bookId: string): Promise<Highlight[]> {
    return db.highlights
      .where('bookId')
      .equals(bookId)
      .filter((h) => h.linkedNoteId !== null)
      .toArray();
  },

  async add(highlight: Highlight): Promise<void> {
    await db.highlights.add(highlight);
  },

  async update(id: string, updates: Partial<Highlight>): Promise<void> {
    await db.highlights.update(id, { ...updates, updatedAt: new Date().toISOString() });
  },

  async remove(id: string): Promise<void> {
    await db.highlights.delete(id);
  },

  async removeByBook(bookId: string): Promise<void> {
    await db.highlights.where('bookId').equals(bookId).delete();
  },

  async count(bookId: string): Promise<number> {
    return db.highlights.where('bookId').equals(bookId).count();
  },

  async search(bookId: string, query: string): Promise<Highlight[]> {
    const lower = query.toLowerCase();
    const all = await db.highlights.where('bookId').equals(bookId).toArray();
    return all.filter(
      (h) =>
        h.selectedText.toLowerCase().includes(lower) ||
        h.tags.some((t) => t.toLowerCase().includes(lower))
    );
  },

  async getAllFavorites(): Promise<Highlight[]> {
    return db.highlights.where('favorite').equals(1).toArray();
  },

  async getAll(): Promise<Highlight[]> {
    return db.highlights.toArray();
  },
};
