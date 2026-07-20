import Dexie, { Table } from 'dexie';
import {
  ImportedBook, BookBookmark, BookProgress, ReadingPlan,
} from '../types/library';
import {
  Highlight, Note, StickyNote, StudyBookmark, Tag, StudySession, ActivityEntry,
} from '../types/study';

class LibraryDB extends Dexie {
  books!: Table<ImportedBook>;
  bookmarks!: Table<BookBookmark>;
  progress!: Table<BookProgress>;
  plans!: Table<ReadingPlan>;
  highlights!: Table<Highlight>;
  notes!: Table<Note>;
  stickyNotes!: Table<StickyNote>;
  studyBookmarks!: Table<StudyBookmark>;
  tags!: Table<Tag>;
  studySessions!: Table<StudySession>;
  activities!: Table<ActivityEntry>;

  constructor() {
    super('ts-books-library');
    this.version(2).stores({
      books: 'id, title, author, importedAt, lastOpened',
      bookmarks: 'id, bookId, page, createdAt',
      progress: 'bookId, lastVisit',
      plans: 'id, bookId, createdAt',
      highlights: 'id, bookId, page, color, createdAt, favorite, *tags',
      notes: 'id, bookId, page, createdAt, favorite, *tags',
      stickyNotes: 'id, bookId, page',
      studyBookmarks: 'id, bookId, page, createdAt, favorite, *tags',
      tags: 'id, name, bookId',
      studySessions: 'id, bookId, startedAt',
      activities: 'id, bookId, timestamp',
    });
  }
}

export const db = new LibraryDB();
