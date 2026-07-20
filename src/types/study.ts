export type HighlightColor = 'yellow' | 'blue' | 'green' | 'pink' | 'orange';

export const HIGHLIGHT_COLORS: { color: HighlightColor; label: string; value: string }[] = [
  { color: 'yellow', label: 'Yellow', value: '#facc15' },
  { color: 'blue', label: 'Blue', value: '#3b82f6' },
  { color: 'green', label: 'Green', value: '#22c55e' },
  { color: 'pink', label: 'Pink', value: '#ec4899' },
  { color: 'orange', label: 'Orange', value: '#f97316' },
];

export interface Highlight {
  id: string;
  bookId: string;
  page: number;
  selectedText: string;
  color: HighlightColor;
  createdAt: string;
  updatedAt: string;
  favorite: boolean;
  tags: string[];
  linkedNoteId: string | null;
  positionRects: Array<{
    left: number;
    top: number;
    width: number;
    height: number;
  }>;
}

export interface Note {
  id: string;
  bookId: string;
  page: number | null;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  favorite: boolean;
  tags: string[];
  linkedHighlightId: string | null;
}

export interface StickyNote {
  id: string;
  bookId: string;
  page: number;
  content: string;
  color: string;
  position: { x: number; y: number };
  collapsed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StudyBookmark {
  id: string;
  bookId: string;
  page: number;
  title: string;
  description: string;
  color: string;
  createdAt: string;
  favorite: boolean;
  tags: string[];
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  bookId: string | null;
  createdAt: string;
}

export interface StudySession {
  id: string;
  bookId: string;
  startPage: number;
  endPage: number;
  startedAt: string;
  endedAt: string | null;
  durationMs: number;
}

export interface StudyStatistics {
  totalHighlights: number;
  totalNotes: number;
  totalBookmarks: number;
  totalStudySessions: number;
  totalPagesRead: number;
  currentProgress: number;
  totalStudyTimeMs: number;
}

export interface ActivityEntry {
  id: string;
  bookId: string;
  type: 'highlight' | 'note' | 'bookmark' | 'reading' | 'favorite';
  description: string;
  page: number | null;
  timestamp: string;
}

export interface SelectionContext {
  selectedText: string;
  page: number;
  position: { x: number; y: number };
  rects: Array<{ left: number; top: number; width: number; height: number }>;
}

export type AnnotationType = 'highlight' | 'note' | 'bookmark';

export interface Annotation {
  id: string;
  type: AnnotationType;
  bookId: string;
  page: number | null;
  title: string;
  content: string;
  color: string;
  createdAt: string;
  updatedAt: string;
  favorite: boolean;
  tags: string[];
}

export interface StudyFilter {
  bookId?: string;
  page?: number;
  pageMin?: number;
  pageMax?: number;
  color?: HighlightColor;
  favorite?: boolean;
  tags?: string[];
  type?: AnnotationType;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'page';
  sortDirection?: 'asc' | 'desc';
}
