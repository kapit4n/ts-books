export interface ImportedBook {
  id: string;
  title: string;
  author: string;
  fileName: string;
  pageCount: number;
  pdfData: ArrayBuffer;
  thumbnail: string | null;
  metadata: Record<string, unknown>;
  outline: BookOutline[];
  category: string;
  tags: string[];
  importedAt: string;
  lastOpened: string | null;
  readingTimeEstimate: string;
}

export interface BookOutline {
  title: string;
  pageNumber: number;
  children?: Array<{ title: string; pageNumber: number; children?: unknown[] }>;
}

export type ReadingGoal = 'finish-quickly' | 'study-deeply' | 'casual' | 'exam-prep';

export interface ReadingPlan {
  id: string;
  bookId: string;
  goal: ReadingGoal;
  minutesPerDay: number;
  targetDate: string | null;
  preferredDays: string[];
  dailyPages: number;
  estimatedDays: number;
  sessions: ReadingSession[];
  createdAt: string;
}

export interface ReadingSession {
  id: string;
  bookId: string;
  day: string;
  startPage: number;
  endPage: number;
  isReview: boolean;
  completed: boolean;
}

export interface BookBookmark {
  id: string;
  bookId: string;
  page: number;
  title: string;
  color: string;
  createdAt: string;
}

export interface BookProgress {
  bookId: string;
  currentPage: number;
  percentage: number;
  totalPagesRead: number;
  totalReadingTimeMs: number;
  sessionsCompleted: number;
  lastVisit: string;
  completedSessionIds: string[];
}

export interface ReadingAnalytics {
  booksImported: number;
  totalPagesRead: number;
  currentStreak: number;
  readingHours: number;
  completionRate: number;
  avgSessionMinutes: number;
}

export type ReadingMode = 'standard' | 'book' | 'column' | 'focus';

export type FitMode = 'width' | 'height' | 'actual';

export type ReaderTheme = 'light' | 'dark' | 'sepia';

export interface ReaderPreferences {
  zoom: number;
  fitMode: FitMode;
  theme: ReaderTheme;
  readingMode: ReadingMode;
  columnSide: 'left' | 'right';
  leftSidebarOpen: boolean;
  rightSidebarOpen: boolean;
  lastPage: number;
}

export interface ImportJob {
  id: string;
  fileName: string;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  error?: string;
  bookId?: string;
}
