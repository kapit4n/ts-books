import { db } from './database';
import { Tag } from '../types/study';

export const tagService = {
  async getByBook(bookId: string): Promise<Tag[]> {
    return db.tags.where('bookId').equals(bookId).toArray();
  },

  async getGlobal(): Promise<Tag[]> {
    return db.tags.where('bookId').equals(null as any).toArray();
  },

  async getAll(): Promise<Tag[]> {
    return db.tags.toArray();
  },

  async add(tag: Tag): Promise<void> {
    await db.tags.add(tag);
  },

  async remove(id: string): Promise<void> {
    await db.tags.delete(id);
  },

  async removeByBook(bookId: string): Promise<void> {
    await db.tags.where('bookId').equals(bookId).delete();
  },

  async getUniqueTagsForBook(bookId: string): Promise<string[]> {
    const tags = await db.tags.where('bookId').equals(bookId).toArray();
    const globalTags = await db.tags.where('bookId').equals(null as any).toArray();
    const all = [...tags, ...globalTags];
    const uniqueNames = Array.from(new Set(all.map((t) => t.name)));
    return uniqueNames;
  },

  async getAllUniqueTagNames(): Promise<string[]> {
    const all = await db.tags.toArray();
    const uniqueNames = Array.from(new Set(all.map((t) => t.name)));
    return uniqueNames;
  },

  async search(query: string): Promise<Tag[]> {
    const lower = query.toLowerCase();
    const all = await db.tags.toArray();
    return all.filter((t) => t.name.toLowerCase().includes(lower));
  },
};
