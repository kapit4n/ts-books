import { create } from 'zustand';
import { studyCalendarService } from '../services/studyCalendarService';
import { StudyCalendarEntry, CalendarEntryType } from '../types/learning';

interface StudyCalendarState {
  entries: StudyCalendarEntry[];
  monthEntries: StudyCalendarEntry[];
  streak: { current: number; longest: number };
  weekTimeMs: number;
  loading: boolean;
  selectedDate: string;
  loadEntries: (bookId: string) => Promise<void>;
  loadMonthEntries: (year: number, month: number) => Promise<void>;
  logEntry: (entry: StudyCalendarEntry) => Promise<void>;
  logActivity: (bookId: string | undefined, type: CalendarEntryType, durationMs: number, description: string) => Promise<void>;
  getEntriesForDate: (date: string) => StudyCalendarEntry[];
  refreshStreak: () => Promise<void>;
  refreshWeekTime: () => Promise<void>;
  setSelectedDate: (date: string) => void;
}

export const useStudyCalendarStore = create<StudyCalendarState>((set, get) => ({
  entries: [],
  monthEntries: [],
  streak: { current: 0, longest: 0 },
  weekTimeMs: 0,
  loading: false,
  selectedDate: new Date().toISOString().split('T')[0],

  loadEntries: async (bookId) => {
    set({ loading: true });
    const entries = await studyCalendarService.getByBook(bookId);
    set({ entries, loading: false });
  },

  loadMonthEntries: async (year, month) => {
    const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month + 1, 0).getDate();
    const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
    const monthEntries = await studyCalendarService.getByDateRange(startDate, endDate);
    set({ monthEntries });
  },

  logEntry: async (entry) => {
    await studyCalendarService.logEntry(entry);
    set({ entries: [...get().entries, entry] });
  },

  logActivity: async (bookId, type, durationMs, description) => {
    await studyCalendarService.logActivity(bookId, type, durationMs, description);
    await get().refreshStreak();
    await get().refreshWeekTime();
  },

  getEntriesForDate: (date) => {
    return get().entries.filter(e => e.date === date);
  },

  refreshStreak: async () => {
    const streak = await studyCalendarService.getStreak();
    set({ streak });
  },

  refreshWeekTime: async () => {
    const weekTimeMs = await studyCalendarService.getTotalTimeThisWeek();
    set({ weekTimeMs });
  },

  setSelectedDate: (date) => set({ selectedDate: date }),
}));
