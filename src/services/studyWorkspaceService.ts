import { db } from './database';
import { highlightService } from './highlightService';
import { noteService } from './noteService';
import { bookmarkService } from './bookmarkService';
import {
  StudyStatistics, ActivityEntry, StudySession, Annotation,
} from '../types/study';

export const studyWorkspaceService = {
  async getStatistics(bookId: string): Promise<StudyStatistics> {
    const [highlights, notes, bookmarks, sessions, progress] = await Promise.all([
      highlightService.getByBook(bookId),
      noteService.getByBook(bookId),
      bookmarkService.getByBook(bookId),
      db.studySessions.where('bookId').equals(bookId).toArray(),
      db.progress.get(bookId),
    ]);

    return {
      totalHighlights: highlights.length,
      totalNotes: notes.length,
      totalBookmarks: bookmarks.length,
      totalStudySessions: sessions.length,
      totalPagesRead: progress?.totalPagesRead || 0,
      currentProgress: progress?.percentage || 0,
      totalStudyTimeMs: sessions.reduce((sum, s) => sum + s.durationMs, 0),
    };
  },

  async getActivities(bookId: string, limit = 50): Promise<ActivityEntry[]> {
    const all = await db.activities
      .where('bookId')
      .equals(bookId)
      .reverse()
      .sortBy('timestamp');
    return all.slice(0, limit);
  },

  async addActivity(entry: ActivityEntry): Promise<void> {
    await db.activities.add(entry);
  },

  async getFavorites(bookId: string): Promise<Annotation[]> {
    const [highlights, notes, bookmarks] = await Promise.all([
      highlightService.getFavorites(bookId),
      noteService.getFavorites(bookId),
      bookmarkService.getFavorites(bookId),
    ]);

    return [
      ...highlights.map((h) => ({
        id: h.id, type: 'highlight' as const, bookId: h.bookId, page: h.page,
        title: h.selectedText.slice(0, 80), content: h.selectedText,
        color: h.color, createdAt: h.createdAt, updatedAt: h.updatedAt,
        favorite: true, tags: h.tags,
      })),
      ...notes.map((n) => ({
        id: n.id, type: 'note' as const, bookId: n.bookId, page: n.page,
        title: n.title, content: n.content,
        color: '#8b5cf6', createdAt: n.createdAt, updatedAt: n.updatedAt,
        favorite: true, tags: n.tags,
      })),
      ...bookmarks.map((b) => ({
        id: b.id, type: 'bookmark' as const, bookId: b.bookId, page: b.page,
        title: b.title, content: b.description,
        color: b.color, createdAt: b.createdAt, updatedAt: b.createdAt,
        favorite: true, tags: b.tags,
      })),
    ];
  },

  async startSession(bookId: string, startPage: number): Promise<StudySession> {
    const session: StudySession = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 9),
      bookId,
      startPage,
      endPage: startPage,
      startedAt: new Date().toISOString(),
      endedAt: null,
      durationMs: 0,
    };
    await db.studySessions.add(session);
    return session;
  },

  async endSession(sessionId: string, endPage: number): Promise<void> {
    const session = await db.studySessions.get(sessionId);
    if (!session) return;
    await db.studySessions.update(sessionId, {
      endPage,
      endedAt: new Date().toISOString(),
      durationMs: Date.now() - new Date(session.startedAt).getTime(),
    });
  },

  async createActivity(
    bookId: string,
    type: ActivityEntry['type'],
    description: string,
    page: number | null
  ): Promise<void> {
    const entry: ActivityEntry = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 9),
      bookId,
      type,
      description,
      page,
      timestamp: new Date().toISOString(),
    };
    await db.activities.add(entry);
  },
};
