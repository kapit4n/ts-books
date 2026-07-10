import Dexie, { Table } from 'dexie';
import { ImportedBook, BookBookmark, BookProgress, ReadingPlan } from '../types/library';

class LibraryDB extends Dexie {
  books!: Table<ImportedBook>;
  bookmarks!: Table<BookBookmark>;
  progress!: Table<BookProgress>;
  plans!: Table<ReadingPlan>;

  constructor() {
    super('ts-books-library');
    this.version(1).stores({
      books: 'id, title, author, importedAt, lastOpened',
      bookmarks: 'id, bookId, page, createdAt',
      progress: 'bookId, lastVisit',
      plans: 'id, bookId, createdAt',
    });
  }
}

export const db = new LibraryDB();
