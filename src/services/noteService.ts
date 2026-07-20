import { db } from './database';
import { Note, StickyNote } from '../types/study';

export const noteService = {
  async getByBook(bookId: string): Promise<Note[]> {
    return db.notes.where('bookId').equals(bookId).toArray();
  },

  async getByPage(bookId: string, page: number): Promise<Note[]> {
    return db.notes
      .where('bookId')
      .equals(bookId)
      .filter((n) => n.page === page)
      .toArray();
  },

  async getFavorites(bookId: string): Promise<Note[]> {
    return db.notes
      .where('bookId')
      .equals(bookId)
      .filter((n) => n.favorite)
      .toArray();
  },

  async add(note: Note): Promise<void> {
    await db.notes.add(note);
  },

  async update(id: string, updates: Partial<Note>): Promise<void> {
    await db.notes.update(id, { ...updates, updatedAt: new Date().toISOString() });
  },

  async remove(id: string): Promise<void> {
    await db.notes.delete(id);
  },

  async removeByBook(bookId: string): Promise<void> {
    await db.notes.where('bookId').equals(bookId).delete();
  },

  async count(bookId: string): Promise<number> {
    return db.notes.where('bookId').equals(bookId).count();
  },

  async search(bookId: string, query: string): Promise<Note[]> {
    const lower = query.toLowerCase();
    const all = await db.notes.where('bookId').equals(bookId).toArray();
    return all.filter(
      (n) =>
        n.title.toLowerCase().includes(lower) ||
        n.content.toLowerCase().includes(lower) ||
        n.tags.some((t) => t.toLowerCase().includes(lower))
    );
  },

  async getAll(): Promise<Note[]> {
    return db.notes.toArray();
  },

  // Sticky Notes
  async getStickyNotesByBook(bookId: string): Promise<StickyNote[]> {
    return db.stickyNotes.where('bookId').equals(bookId).toArray();
  },

  async getStickyNotesByPage(bookId: string, page: number): Promise<StickyNote[]> {
    return db.stickyNotes
      .where('bookId')
      .equals(bookId)
      .filter((s) => s.page === page)
      .toArray();
  },

  async addStickyNote(sticky: StickyNote): Promise<void> {
    await db.stickyNotes.add(sticky);
  },

  async updateStickyNote(id: string, updates: Partial<StickyNote>): Promise<void> {
    await db.stickyNotes.update(id, { ...updates, updatedAt: new Date().toISOString() });
  },

  async removeStickyNote(id: string): Promise<void> {
    await db.stickyNotes.delete(id);
  },

  async removeStickyNotesByBook(bookId: string): Promise<void> {
    await db.stickyNotes.where('bookId').equals(bookId).delete();
  },
};
