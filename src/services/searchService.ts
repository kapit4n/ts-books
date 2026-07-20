import { highlightService } from './highlightService';
import { noteService } from './noteService';
import { bookmarkService } from './bookmarkService';
import { Annotation, StudyFilter, Highlight, Note, StudyBookmark } from '../types/study';

function highlightToAnnotation(h: Highlight): Annotation {
  return {
    id: h.id,
    type: 'highlight',
    bookId: h.bookId,
    page: h.page,
    title: h.selectedText.slice(0, 80),
    content: h.selectedText,
    color: h.color,
    createdAt: h.createdAt,
    updatedAt: h.updatedAt,
    favorite: h.favorite,
    tags: h.tags,
  };
}

function noteToAnnotation(n: Note): Annotation {
  return {
    id: n.id,
    type: 'note',
    bookId: n.bookId,
    page: n.page,
    title: n.title,
    content: n.content,
    color: '#8b5cf6',
    createdAt: n.createdAt,
    updatedAt: n.updatedAt,
    favorite: n.favorite,
    tags: n.tags,
  };
}

function bookmarkToAnnotation(b: StudyBookmark): Annotation {
  return {
    id: b.id,
    type: 'bookmark',
    bookId: b.bookId,
    page: b.page,
    title: b.title,
    content: b.description,
    color: b.color,
    createdAt: b.createdAt,
    updatedAt: b.createdAt,
    favorite: b.favorite,
    tags: b.tags,
  };
}

export const searchService = {
  async searchAll(bookId: string, query: string): Promise<Annotation[]> {
    const [highlights, notes, bookmarks] = await Promise.all([
      highlightService.search(bookId, query),
      noteService.search(bookId, query),
      bookmarkService.search(bookId, query),
    ]);

    return [
      ...highlights.map(highlightToAnnotation),
      ...notes.map(noteToAnnotation),
      ...bookmarks.map(bookmarkToAnnotation),
    ];
  },

  async filterAnnotations(bookId: string, filter: StudyFilter): Promise<Annotation[]> {
    let highlights = await highlightService.getByBook(bookId);
    let notes = await noteService.getByBook(bookId);
    let bookmarks = await bookmarkService.getByBook(bookId);

    if (filter.type) {
      if (filter.type === 'highlight') { notes = []; bookmarks = []; }
      if (filter.type === 'note') { highlights = []; bookmarks = []; }
      if (filter.type === 'bookmark') { highlights = []; notes = []; }
    }

    if (filter.color) {
      highlights = highlights.filter((h) => h.color === filter.color);
    }

    if (filter.favorite) {
      highlights = highlights.filter((h) => h.favorite);
      notes = notes.filter((n) => n.favorite);
      bookmarks = bookmarks.filter((b) => b.favorite);
    }

    if (filter.tags && filter.tags.length > 0) {
      highlights = highlights.filter((h) => filter.tags!.some((t) => h.tags.includes(t)));
      notes = notes.filter((n) => filter.tags!.some((t) => n.tags.includes(t)));
      bookmarks = bookmarks.filter((b) => filter.tags!.some((t) => b.tags.includes(t)));
    }

    if (filter.pageMin) {
      highlights = highlights.filter((h) => h.page >= filter.pageMin!);
      notes = notes.filter((n) => n.page !== null && n.page >= filter.pageMin!);
      bookmarks = bookmarks.filter((b) => b.page >= filter.pageMin!);
    }

    if (filter.pageMax) {
      highlights = highlights.filter((h) => h.page <= filter.pageMax!);
      notes = notes.filter((n) => n.page !== null && n.page <= filter.pageMax!);
      bookmarks = bookmarks.filter((b) => b.page <= filter.pageMax!);
    }

    if (filter.dateFrom) {
      const from = new Date(filter.dateFrom).getTime();
      highlights = highlights.filter((h) => new Date(h.createdAt).getTime() >= from);
      notes = notes.filter((n) => new Date(n.createdAt).getTime() >= from);
      bookmarks = bookmarks.filter((b) => new Date(b.createdAt).getTime() >= from);
    }

    if (filter.dateTo) {
      const to = new Date(filter.dateTo).getTime();
      highlights = highlights.filter((h) => new Date(h.createdAt).getTime() <= to);
      notes = notes.filter((n) => new Date(n.createdAt).getTime() <= to);
      bookmarks = bookmarks.filter((b) => new Date(b.createdAt).getTime() <= to);
    }

    let results: Annotation[] = [
      ...highlights.map(highlightToAnnotation),
      ...notes.map(noteToAnnotation),
      ...bookmarks.map(bookmarkToAnnotation),
    ];

    const sortBy = filter.sortBy || 'createdAt';
    const dir = filter.sortDirection === 'asc' ? 1 : -1;
    results.sort((a, b) => {
      if (sortBy === 'page') return ((a.page || 0) - (b.page || 0)) * dir;
      return (new Date(a[sortBy]).getTime() - new Date(b[sortBy]).getTime()) * dir;
    });

    return results;
  },

  async searchAcrossBooks(query: string): Promise<Annotation[]> {
    const allHighlights = await highlightService.getAll();
    const allNotes = await noteService.getAll();
    const allBookmarks = await bookmarkService.getAll();

    const lower = query.toLowerCase();
    const matches = (s: string) => s.toLowerCase().includes(lower);

    return [
      ...allHighlights
        .filter((h) => matches(h.selectedText) || h.tags.some(matches))
        .map(highlightToAnnotation),
      ...allNotes
        .filter((n) => matches(n.title) || matches(n.content) || n.tags.some(matches))
        .map(noteToAnnotation),
      ...allBookmarks
        .filter((b) => matches(b.title) || matches(b.description) || b.tags.some(matches))
        .map(bookmarkToAnnotation),
    ];
  },
};
