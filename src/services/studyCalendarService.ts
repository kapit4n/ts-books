import { db } from './database';
import { StudyCalendarEntry, CalendarEntryType } from '../types/learning';
import { generateId } from '../lib/utils';

export const studyCalendarService = {
  async getByBook(bookId: string): Promise<StudyCalendarEntry[]> {
    return db.studyCalendarEntries.where('bookId').equals(bookId).toArray();
  },
  async getByDate(date: string): Promise<StudyCalendarEntry[]> {
    return db.studyCalendarEntries.where('date').equals(date).toArray();
  },
  async getByDateRange(startDate: string, endDate: string): Promise<StudyCalendarEntry[]> {
    return db.studyCalendarEntries
      .where('date').between(startDate, endDate, true, true).toArray();
  },
  async logEntry(entry: StudyCalendarEntry): Promise<void> {
    await db.studyCalendarEntries.add(entry);
  },
  async logActivity(bookId: string | undefined, type: CalendarEntryType, durationMs: number, description: string): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    const existing = await db.studyCalendarEntries
      .where('date').equals(today)
      .filter(e => e.bookId === bookId && e.type === type).first();
    if (existing) {
      await db.studyCalendarEntries.update(existing.id, {
        durationMs: existing.durationMs + durationMs,
        description,
      });
    } else {
      const entry: StudyCalendarEntry = {
        id: generateId(),
        bookId,
        date: today,
        type,
        durationMs,
        description,
        createdAt: new Date().toISOString(),
      };
      await db.studyCalendarEntries.add(entry);
    }
  },
  async remove(id: string): Promise<void> {
    await db.studyCalendarEntries.delete(id);
  },
  async removeByBook(bookId: string): Promise<void> {
    await db.studyCalendarEntries.where('bookId').equals(bookId).delete();
  },
  async getStreak(): Promise<{ current: number; longest: number }> {
    const all = await db.studyCalendarEntries.toArray();
    const dates = Array.from(new Set(all.map(e => e.date))).sort().reverse();
    if (dates.length === 0) return { current: 0, longest: 0 };
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 1;
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    if (dates[0] === today || dates[0] === yesterday) {
      currentStreak = 1;
      for (let i = 1; i < dates.length; i++) {
        const prev = new Date(dates[i - 1]).getTime();
        const curr = new Date(dates[i]).getTime();
        if (prev - curr === 86400000) { currentStreak++; }
        else break;
      }
    }
    for (let i = 1; i < dates.length; i++) {
      const prev = new Date(dates[i - 1]).getTime();
      const curr = new Date(dates[i]).getTime();
      if (prev - curr === 86400000) { tempStreak++; }
      else { longestStreak = Math.max(longestStreak, tempStreak); tempStreak = 1; }
    }
    longestStreak = Math.max(longestStreak, tempStreak, currentStreak);
    return { current: currentStreak, longest: longestStreak };
  },
  async getTotalTimeThisWeek(): Promise<number> {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 86400000).toISOString().split('T')[0];
    const today = now.toISOString().split('T')[0];
    const entries = await db.studyCalendarEntries.where('date').between(weekAgo, today, true, true).toArray();
    return entries.reduce((sum, e) => sum + e.durationMs, 0);
  },
};
