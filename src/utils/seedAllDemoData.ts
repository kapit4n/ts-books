import { db } from '../services/database';
import type { ImportedBook, BookProgress, ReadingPlan, BookBookmark } from '../types/library';
import type { Highlight, Note, StickyNote, StudyBookmark, Tag, StudySession, ActivityEntry } from '../types/study';
import type { Flashcard, FlashcardDeck, Quiz, QuizAttempt, Exercise, ExerciseResult, UserAchievement, ChapterProgress, LearningStats, StudyCalendarEntry, ContinueLearningState } from '../types/learning';

const now = new Date().toISOString();
const ago = (days: number) => new Date(Date.now() - days * 86400000).toISOString();
const daysAgo = (d: number) => new Date(Date.now() - d * 86400000).toISOString().split('T')[0];

function minimalPdf(): ArrayBuffer {
  const s = '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R>>endobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n190\n%%EOF';
  const buf = new ArrayBuffer(s.length);
  new Uint8Array(buf).set(new TextEncoder().encode(s));
  return buf;
}

function outline(chapters: string[]): { title: string; pageNumber: number }[] {
  return chapters.map((t, i) => ({ title: t, pageNumber: i * 20 + 1 }));
}

// ──────────────────────────────────────────────────────────
// BOOK DEFINITIONS
// ──────────────────────────────────────────────────────────

const BOOK_PYTHON = 'book-python-crash-course';
const BOOK_TYPESCRIPT = 'book-typescript-handbook';
const BOOK_CLEANCODE = 'book-clean-code';

const books: ImportedBook[] = [
  {
    id: BOOK_PYTHON,
    title: 'Python Crash Course',
    author: 'Eric Matthes',
    fileName: 'python-crash-course.pdf',
    pageCount: 544,
    pdfData: minimalPdf(),
    thumbnail: null,
    metadata: { publisher: 'No Starch Press', year: 2023, language: 'English', isbn: '978-1593279288' },
    outline: outline(['Ch 1: Getting Started', 'Ch 2: Variables & Types', 'Ch 3: Control Flow', 'Ch 4: Functions', 'Ch 5: Lists', 'Ch 6: Dictionaries', 'Ch 7: File I/O', 'Ch 8: OOP', 'Ch 9: Testing', 'Ch 10: Django Project', 'Ch 11: Data Visualization', 'Ch 12: Games with Pygame']),
    category: 'Programming',
    tags: ['python', 'beginner', 'web', 'data'],
    importedAt: ago(30),
    lastOpened: ago(0),
    readingTimeEstimate: '~36 hours',
  },
  {
    id: BOOK_TYPESCRIPT,
    title: 'TypeScript Handbook',
    author: 'Microsoft',
    fileName: 'typescript-handbook.pdf',
    pageCount: 420,
    pdfData: minimalPdf(),
    thumbnail: null,
    metadata: { publisher: 'Microsoft Press', year: 2024, language: 'English' },
    outline: outline(['Ch 1: Intro to TS', 'Ch 2: Type System', 'Ch 3: Interfaces', 'Ch 4: Generics', 'Ch 5: Utility Types', 'Ch 6: Advanced Types', 'Ch 7: Decorators', 'Ch 8: Modules', 'Ch 9: Namespaces', 'Ch 10: TS Config', 'Ch 11: Migration Guide', 'Ch 12: Best Practices']),
    category: 'Programming',
    tags: ['typescript', 'javascript', 'types', 'web'],
    importedAt: ago(20),
    lastOpened: ago(0),
    readingTimeEstimate: '~28 hours',
  },
  {
    id: BOOK_CLEANCODE,
    title: 'Clean Code',
    author: 'Robert C. Martin',
    fileName: 'clean-code.pdf',
    pageCount: 464,
    pdfData: minimalPdf(),
    thumbnail: null,
    metadata: { publisher: 'Prentice Hall', year: 2008, language: 'English', isbn: '978-0132350884' },
    outline: outline(['Ch 1: Clean Code', 'Ch 2: Meaningful Names', 'Ch 3: Functions', 'Ch 4: Comments', 'Ch 5: Formatting', 'Ch 6: Objects & Data', 'Ch 7: Error Handling', 'Ch 8: Boundaries', 'Ch 9: Unit Tests', 'Ch 10: Classes', 'Ch 11: Systems', 'Ch 12: Emergence']),
    category: 'Software Engineering',
    tags: ['clean-code', 'best-practices', 'refactoring', 'patterns'],
    importedAt: ago(15),
    lastOpened: ago(1),
    readingTimeEstimate: '~30 hours',
  },
];

// ──────────────────────────────────────────────────────────
// BOOK PROGRESS
// ──────────────────────────────────────────────────────────

const progress: BookProgress[] = [
  { bookId: BOOK_PYTHON, currentPage: 340, percentage: 62, totalPagesRead: 340, totalReadingTimeMs: 48000000, sessionsCompleted: 18, lastVisit: ago(0), completedSessionIds: [] },
  { bookId: BOOK_TYPESCRIPT, currentPage: 200, percentage: 48, totalPagesRead: 200, totalReadingTimeMs: 32000000, sessionsCompleted: 12, lastVisit: ago(0), completedSessionIds: [] },
  { bookId: BOOK_CLEANCODE, currentPage: 80, percentage: 17, totalPagesRead: 80, totalReadingTimeMs: 12000000, sessionsCompleted: 5, lastVisit: ago(1), completedSessionIds: [] },
];

// ──────────────────────────────────────────────────────────
// READING PLANS
// ──────────────────────────────────────────────────────────

const plans: ReadingPlan[] = [
  {
    id: 'plan-python',
    bookId: BOOK_PYTHON,
    goal: 'study-deeply',
    minutesPerDay: 45,
    targetDate: daysAgo(-14),
    preferredDays: ['Monday', 'Wednesday', 'Friday', 'Saturday'],
    dailyPages: 12,
    estimatedDays: 45,
    sessions: [],
    createdAt: ago(28),
  },
  {
    id: 'plan-ts',
    bookId: BOOK_TYPESCRIPT,
    goal: 'finish-quickly',
    minutesPerDay: 60,
    targetDate: daysAgo(-7),
    preferredDays: ['Tuesday', 'Thursday', 'Saturday', 'Sunday'],
    dailyPages: 20,
    estimatedDays: 21,
    sessions: [],
    createdAt: ago(18),
  },
];

// ──────────────────────────────────────────────────────────
// BOOKMARKS (library-level)
// ──────────────────────────────────────────────────────────

const bookmarks: BookBookmark[] = [
  { id: 'bk-1', bookId: BOOK_PYTHON, page: 45, title: 'First function', color: '#3b82f6', createdAt: ago(25) },
  { id: 'bk-2', bookId: BOOK_PYTHON, page: 120, title: 'Dictionary methods', color: '#10b981', createdAt: ago(20) },
  { id: 'bk-3', bookId: BOOK_PYTHON, page: 250, title: 'Django setup', color: '#f59e0b', createdAt: ago(12) },
  { id: 'bk-4', bookId: BOOK_TYPESCRIPT, page: 30, title: 'Type narrowing', color: '#3b82f6', createdAt: ago(15) },
  { id: 'bk-5', bookId: BOOK_TYPESCRIPT, page: 180, title: 'Generic constraints', color: '#8b5cf6', createdAt: ago(8) },
  { id: 'bk-6', bookId: BOOK_CLEANCODE, page: 22, title: 'Meaningful names', color: '#10b981', createdAt: ago(10) },
];

// ──────────────────────────────────────────────────────────
// HIGHLIGHTS
// ──────────────────────────────────────────────────────────

const highlights: Highlight[] = [
  { id: 'hl-1', bookId: BOOK_PYTHON, page: 30, selectedText: 'Python is an interpreted, high-level programming language with dynamic typing and garbage collection.', color: 'yellow', createdAt: ago(25), updatedAt: ago(25), favorite: true, tags: ['definition', 'python'], linkedNoteId: 'note-1', positionRects: [{ left: 40, top: 200, width: 500, height: 40 }] },
  { id: 'hl-2', bookId: BOOK_PYTHON, page: 55, selectedText: 'A function is a block of organized, reusable code that is used to perform a single, related action.', color: 'blue', createdAt: ago(22), updatedAt: ago(22), favorite: false, tags: ['functions'], linkedNoteId: null, positionRects: [{ left: 40, top: 180, width: 480, height: 35 }] },
  { id: 'hl-3', bookId: BOOK_PYTHON, page: 100, selectedText: 'Dictionaries are optimized to retrieve values when the key is known.', color: 'green', createdAt: ago(18), updatedAt: ago(18), favorite: true, tags: ['dict', 'performance'], linkedNoteId: 'note-2', positionRects: [{ left: 40, top: 300, width: 420, height: 30 }] },
  { id: 'hl-4', bookId: BOOK_PYTHON, page: 180, selectedText: 'The __init__() method is a special method that Python runs automatically whenever you create a new instance.', color: 'orange', createdAt: ago(14), updatedAt: ago(14), favorite: false, tags: ['oop', 'classes'], linkedNoteId: null, positionRects: [{ left: 40, top: 150, width: 520, height: 45 }] },
  { id: 'hl-5', bookId: BOOK_PYTHON, page: 280, selectedText: 'Django is a high-level Python web framework that encourages rapid development.', color: 'pink', createdAt: ago(10), updatedAt: ago(10), favorite: false, tags: ['django', 'web'], linkedNoteId: null, positionRects: [{ left: 40, top: 220, width: 460, height: 35 }] },
  { id: 'hl-6', bookId: BOOK_TYPESCRIPT, page: 25, selectedText: 'TypeScript adds optional static types to JavaScript, enabling better tooling and error detection.', color: 'yellow', createdAt: ago(16), updatedAt: ago(16), favorite: true, tags: ['types', 'definition'], linkedNoteId: 'note-3', positionRects: [{ left: 40, top: 190, width: 500, height: 35 }] },
  { id: 'hl-7', bookId: BOOK_TYPESCRIPT, page: 90, selectedText: 'Generics provide a way to create reusable components that work with any data type.', color: 'blue', createdAt: ago(12), updatedAt: ago(12), favorite: false, tags: ['generics'], linkedNoteId: null, positionRects: [{ left: 40, top: 250, width: 480, height: 40 }] },
  { id: 'hl-8', bookId: BOOK_TYPESCRIPT, page: 150, selectedText: 'Utility types like Partial, Required, Pick, and Omit transform existing types.', color: 'green', createdAt: ago(8), updatedAt: ago(8), favorite: true, tags: ['utility-types'], linkedNoteId: 'note-4', positionRects: [{ left: 40, top: 170, width: 440, height: 30 }] },
  { id: 'hl-9', bookId: BOOK_CLEANCODE, page: 10, selectedText: 'Clean code is code that is easy to understand and easy to change.', color: 'yellow', createdAt: ago(10), updatedAt: ago(10), favorite: true, tags: ['definition', 'clean-code'], linkedNoteId: 'note-5', positionRects: [{ left: 40, top: 200, width: 400, height: 30 }] },
  { id: 'hl-10', bookId: BOOK_CLEANCODE, page: 40, selectedText: 'Function names should tell what the function does, without using verbs.', color: 'orange', createdAt: ago(8), updatedAt: ago(8), favorite: false, tags: ['naming', 'functions'], linkedNoteId: null, positionRects: [{ left: 40, top: 180, width: 460, height: 35 }] },
];

// ──────────────────────────────────────────────────────────
// NOTES
// ──────────────────────────────────────────────────────────

const notes: Note[] = [
  { id: 'note-1', bookId: BOOK_PYTHON, page: 30, title: 'Python Definition', content: 'Python emphasizes code readability with its use of significant indentation. It supports multiple programming paradigms including procedural, object-oriented, and functional programming.', createdAt: ago(25), updatedAt: ago(20), favorite: true, tags: ['definition', 'python'], linkedHighlightId: 'hl-1' },
  { id: 'note-2', bookId: BOOK_PYTHON, page: 100, title: 'Dict Performance Notes', content: 'Dictionary lookups are O(1) on average. Use dict.get(key, default) for safe access. Dictionary comprehension: {k: v for k, v in items if condition}', createdAt: ago(18), updatedAt: ago(15), favorite: false, tags: ['dict', 'performance'], linkedHighlightId: 'hl-3' },
  { id: 'note-3', bookId: BOOK_TYPESCRIPT, page: 25, title: 'TS Type System Overview', content: 'TypeScript has two main categories of types: primitives (string, number, boolean, null, undefined, symbol, bigint, void, never, unknown, any) and object types (arrays, tuples, objects, enums, classes, interfaces, type aliases).', createdAt: ago(16), updatedAt: ago(10), favorite: true, tags: ['types', 'overview'], linkedHighlightId: 'hl-6' },
  { id: 'note-4', bookId: BOOK_TYPESCRIPT, page: 150, title: 'Utility Types Cheat Sheet', content: 'Partial<T> - all props optional\nRequired<T> - all props required\nPick<T, K> - subset of props\nOmit<T, K> - exclude props\nRecord<K, V> - object type\nReadonly<T> - immutable\nReturnType<T> - function return type', createdAt: ago(8), updatedAt: ago(5), favorite: true, tags: ['utility-types', 'cheat-sheet'], linkedHighlightId: 'hl-8' },
  { id: 'note-5', bookId: BOOK_CLEANCODE, page: 10, title: 'Clean Code Principles', content: 'Key principles: 1) Intention-revealing names, 2) Small functions that do one thing, 3) DRY, 4) Functions should have limited arguments, 5) Prefer pure functions, 6) Error handling without control flow.', createdAt: ago(10), updatedAt: ago(7), favorite: true, tags: ['principles', 'clean-code'], linkedHighlightId: 'hl-9' },
  { id: 'note-6', bookId: BOOK_PYTHON, page: 140, title: 'List Comprehension Patterns', content: 'Basic: [x for x in items]\nConditional: [x for x in items if x > 0]\nTransform: [x*2 for x in items]\nNested: [y for x in matrix for y in x]\nDict: {k: v for k, v in pairs}', createdAt: ago(16), updatedAt: ago(12), favorite: false, tags: ['lists', 'comprehension'], linkedHighlightId: null },
  { id: 'note-7', bookId: BOOK_TYPESCRIPT, page: 220, title: 'Decorators in TS', content: 'Class decorators: function log(target) {}\nMethod decorators: function log(target, key, descriptor) {}\nParameter decorators: function log(target, key, index) {}\nNote: --experimentalDecorators needed in tsconfig', createdAt: ago(6), updatedAt: ago(3), favorite: false, tags: ['decorators', 'advanced'], linkedHighlightId: null },
];

// ──────────────────────────────────────────────────────────
// STICKY NOTES
// ──────────────────────────────────────────────────────────

const stickyNotes: StickyNote[] = [
  { id: 'sn-1', bookId: BOOK_PYTHON, page: 30, content: 'Remember: Python uses dynamic typing — no need to declare variable types!', color: '#fef3c7', position: { x: 500, y: 200 }, collapsed: false, createdAt: ago(24), updatedAt: ago(20) },
  { id: 'sn-2', bookId: BOOK_PYTHON, page: 180, content: 'Always use self as first param in class methods.', color: '#dbeafe', position: { x: 520, y: 300 }, collapsed: false, createdAt: ago(14), updatedAt: ago(10) },
  { id: 'sn-3', bookId: BOOK_TYPESCRIPT, page: 90, content: 'Generic constraint with extends: T extends SomeType', color: '#dcfce7', position: { x: 480, y: 250 }, collapsed: false, createdAt: ago(12), updatedAt: ago(8) },
];

// ──────────────────────────────────────────────────────────
// STUDY BOOKMARKS
// ──────────────────────────────────────────────────────────

const studyBookmarks: StudyBookmark[] = [
  { id: 'sb-1', bookId: BOOK_PYTHON, page: 15, title: 'Python setup and installation', description: 'How to install Python and set up a development environment.', color: '#3b82f6', createdAt: ago(28), favorite: false, tags: ['setup', 'beginner'] },
  { id: 'sb-2', bookId: BOOK_PYTHON, page: 120, title: 'Dictionary comprehension patterns', description: 'Common patterns for dictionary comprehensions in Python.', color: '#10b981', createdAt: ago(18), favorite: true, tags: ['dict', 'comprehension'] },
  { id: 'sb-3', bookId: BOOK_TYPESCRIPT, page: 45, title: 'Interface vs Type Alias', description: 'When to use interface vs type alias in TypeScript.', color: '#8b5cf6', createdAt: ago(14), favorite: true, tags: ['interfaces', 'types'] },
  { id: 'sb-4', bookId: BOOK_CLEANCODE, page: 55, title: 'Function length guidelines', description: 'Rules of thumb for keeping functions short and focused.', color: '#f59e0b', createdAt: ago(8), favorite: false, tags: ['functions', 'guidelines'] },
];

// ──────────────────────────────────────────────────────────
// TAGS
// ──────────────────────────────────────────────────────────

const tags: Tag[] = [
  { id: 'tag-1', name: 'python', color: '#3b82f6', bookId: null, createdAt: ago(30) },
  { id: 'tag-2', name: 'typescript', color: '#8b5cf6', bookId: null, createdAt: ago(20) },
  { id: 'tag-3', name: 'clean-code', color: '#10b981', bookId: null, createdAt: ago(15) },
  { id: 'tag-4', name: 'important', color: '#ef4444', bookId: null, createdAt: ago(25) },
  { id: 'tag-5', name: 'review-later', color: '#f59e0b', bookId: null, createdAt: ago(18) },
  { id: 'tag-6', name: 'oop', color: '#6366f1', bookId: null, createdAt: ago(12) },
  { id: 'tag-7', name: 'functions', color: '#ec4899', bookId: null, createdAt: ago(10) },
  { id: 'tag-8', name: 'best-practices', color: '#14b8a6', bookId: null, createdAt: ago(8) },
];

// ──────────────────────────────────────────────────────────
// STUDY SESSIONS
// ──────────────────────────────────────────────────────────

const studySessions: StudySession[] = (() => {
  const sessions: StudySession[] = [];
  let id = 1;
  for (let d = 28; d >= 0; d--) {
    const bookId = d % 3 === 0 ? BOOK_PYTHON : d % 3 === 1 ? BOOK_TYPESCRIPT : BOOK_CLEANCODE;
    const startPage = Math.floor(Math.random() * 300) + 1;
    const duration = 900000 + Math.floor(Math.random() * 2700000);
    const start = new Date(Date.now() - d * 86400000 + 3600000 * (8 + Math.floor(Math.random() * 12)));
    sessions.push({
      id: `ss-${id++}`,
      bookId,
      startPage,
      endPage: startPage + Math.floor(duration / 120000),
      startedAt: start.toISOString(),
      endedAt: new Date(start.getTime() + duration).toISOString(),
      durationMs: duration,
    });
  }
  return sessions;
})();

// ──────────────────────────────────────────────────────────
// ACTIVITY ENTRIES
// ──────────────────────────────────────────────────────────

const activities: ActivityEntry[] = (() => {
  const act: ActivityEntry[] = [];
  let id = 1;
  const types: Array<{ type: ActivityEntry['type']; desc: string }> = [
    { type: 'reading', desc: 'Read for 30 minutes' },
    { type: 'highlight', desc: 'Highlighted a passage' },
    { type: 'note', desc: 'Created a study note' },
    { type: 'bookmark', desc: 'Bookmarked a page' },
    { type: 'favorite', desc: 'Added to favorites' },
  ];
  for (let d = 14; d >= 0; d--) {
    const count = 1 + Math.floor(Math.random() * 3);
    for (let j = 0; j < count; j++) {
      const t = types[Math.floor(Math.random() * types.length)];
      const bookId = [BOOK_PYTHON, BOOK_TYPESCRIPT, BOOK_CLEANCODE][Math.floor(Math.random() * 3)];
      act.push({
        id: `act-${id++}`,
        bookId,
        type: t.type,
        description: t.desc,
        page: Math.floor(Math.random() * 400) + 1,
        timestamp: new Date(Date.now() - d * 86400000 + j * 3600000 * 4).toISOString(),
      });
    }
  }
  return act;
})();

// ──────────────────────────────────────────────────────────
// FLASHCARDS — all 3 books
// ──────────────────────────────────────────────────────────

const flashcards: Flashcard[] = [
  // Python flashcards
  { id: 'fc-py-1', bookId: BOOK_PYTHON, deckId: 'deck-py-basics', question: 'What is the output of print(type(42))?', answer: "<class 'int'>", difficulty: 'easy', status: 'mastered', category: 'Types', tags: ['types'], createdAt: ago(25), updatedAt: ago(2), lastReviewed: ago(1), nextReview: daysAgo(0), streak: 8, easeFactor: 2.7, interval: 12, correctCount: 8, incorrectCount: 0 },
  { id: 'fc-py-2', bookId: BOOK_PYTHON, deckId: 'deck-py-basics', question: 'How do you create a list in Python?', answer: 'Using square brackets: my_list = [1, 2, 3]', difficulty: 'easy', status: 'mastered', category: 'Lists', tags: ['lists'], createdAt: ago(25), updatedAt: ago(3), lastReviewed: ago(2), nextReview: daysAgo(0), streak: 6, easeFactor: 2.6, interval: 10, correctCount: 6, incorrectCount: 0 },
  { id: 'fc-py-3', bookId: BOOK_PYTHON, deckId: 'deck-py-basics', question: 'Difference between list and tuple?', answer: 'Lists are mutable, tuples are immutable.', difficulty: 'medium', status: 'mastered', category: 'Data Structures', tags: ['lists', 'tuples'], createdAt: ago(22), updatedAt: ago(4), lastReviewed: ago(3), nextReview: daysAgo(0), streak: 5, easeFactor: 2.5, interval: 8, correctCount: 5, incorrectCount: 0 },
  { id: 'fc-py-4', bookId: BOOK_PYTHON, deckId: 'deck-py-oop', question: 'What does "self" refer to in a class?', answer: 'The instance of the class itself.', difficulty: 'medium', status: 'learning', category: 'OOP', tags: ['oop', 'classes'], createdAt: ago(18), updatedAt: ago(5), lastReviewed: ago(3), nextReview: daysAgo(0), streak: 2, easeFactor: 2.2, interval: 3, correctCount: 2, incorrectCount: 1 },
  { id: 'fc-py-5', bookId: BOOK_PYTHON, deckId: 'deck-py-oop', question: 'How do you handle exceptions?', answer: 'try/except blocks: try: code() except Error as e: handle(e)', difficulty: 'medium', status: 'reviewing', category: 'Error Handling', tags: ['exceptions'], createdAt: ago(16), updatedAt: ago(2), lastReviewed: ago(1), nextReview: daysAgo(0), streak: 3, easeFactor: 2.3, interval: 4, correctCount: 3, incorrectCount: 0 },
  { id: 'fc-py-6', bookId: BOOK_PYTHON, deckId: 'deck-py-basics', question: 'What is list comprehension?', answer: 'squares = [x**2 for x in range(10)]', difficulty: 'medium', status: 'learning', category: 'Lists', tags: ['comprehension'], createdAt: ago(14), updatedAt: ago(4), lastReviewed: ago(3), nextReview: daysAgo(0), streak: 1, easeFactor: 2.0, interval: 2, correctCount: 1, incorrectCount: 2 },
  { id: 'fc-py-7', bookId: BOOK_PYTHON, deckId: 'deck-py-adv', question: 'What is a decorator?', answer: 'A function that extends another function behavior.', difficulty: 'hard', status: 'new', category: 'Advanced', tags: ['decorators'], createdAt: ago(10), updatedAt: ago(10), streak: 0, easeFactor: 2.5, interval: 0, correctCount: 0, incorrectCount: 0 },
  { id: 'fc-py-8', bookId: BOOK_PYTHON, deckId: 'deck-py-adv', question: 'What are *args and **kwargs?', answer: '*args: variable positional args. **kwargs: variable keyword args.', difficulty: 'hard', status: 'new', category: 'Functions', tags: ['args', 'kwargs'], createdAt: ago(8), updatedAt: ago(8), streak: 0, easeFactor: 2.5, interval: 0, correctCount: 0, incorrectCount: 0 },

  // TypeScript flashcards
  { id: 'fc-ts-1', bookId: BOOK_TYPESCRIPT, deckId: 'deck-ts-basics', question: 'What is the difference between interface and type?', answer: 'Interfaces support declaration merging; types support unions and intersections.', difficulty: 'medium', status: 'mastered', category: 'Types', tags: ['interfaces', 'types'], createdAt: ago(18), updatedAt: ago(3), lastReviewed: ago(2), nextReview: daysAgo(0), streak: 5, easeFactor: 2.5, interval: 8, correctCount: 5, incorrectCount: 0 },
  { id: 'fc-ts-2', bookId: BOOK_TYPESCRIPT, deckId: 'deck-ts-basics', question: 'What does "any" do in TypeScript?', answer: 'Disables type checking — use sparingly.', difficulty: 'easy', status: 'mastered', category: 'Types', tags: ['any', 'basics'], createdAt: ago(18), updatedAt: ago(5), lastReviewed: ago(4), nextReview: daysAgo(0), streak: 4, easeFactor: 2.4, interval: 6, correctCount: 4, incorrectCount: 0 },
  { id: 'fc-ts-3', bookId: BOOK_TYPESCRIPT, deckId: 'deck-ts-adv', question: 'How do conditional types work?', answer: 'T extends U ? X : Y — selects type based on condition.', difficulty: 'hard', status: 'learning', category: 'Advanced Types', tags: ['conditional', 'advanced'], createdAt: ago(14), updatedAt: ago(4), lastReviewed: ago(3), nextReview: daysAgo(0), streak: 1, easeFactor: 2.0, interval: 2, correctCount: 1, incorrectCount: 1 },
  { id: 'fc-ts-4', bookId: BOOK_TYPESCRIPT, deckId: 'deck-ts-basics', question: 'What is a generic?', answer: 'A reusable component that works with any type: function id<T>(x: T): T', difficulty: 'medium', status: 'reviewing', category: 'Generics', tags: ['generics'], createdAt: ago(12), updatedAt: ago(2), lastReviewed: ago(1), nextReview: daysAgo(0), streak: 3, easeFactor: 2.2, interval: 4, correctCount: 3, incorrectCount: 0 },

  // Clean Code flashcards
  { id: 'fc-cc-1', bookId: BOOK_CLEANCODE, deckId: 'deck-cc', question: 'Rule for function length?', answer: 'Functions should do one thing and be 5-15 lines max.', difficulty: 'easy', status: 'mastered', category: 'Functions', tags: ['functions', 'length'], createdAt: ago(12), updatedAt: ago(5), lastReviewed: ago(4), nextReview: daysAgo(0), streak: 4, easeFactor: 2.4, interval: 6, correctCount: 4, incorrectCount: 0 },
  { id: 'fc-cc-2', bookId: BOOK_CLEANCODE, deckId: 'deck-cc', question: 'What makes a good variable name?', answer: 'Intention-revealing, pronounceable, searchable.', difficulty: 'easy', status: 'learning', category: 'Naming', tags: ['naming'], createdAt: ago(10), updatedAt: ago(4), lastReviewed: ago(3), nextReview: daysAgo(0), streak: 2, easeFactor: 2.1, interval: 3, correctCount: 2, incorrectCount: 1 },
  { id: 'fc-cc-3', bookId: BOOK_CLEANCODE, deckId: 'deck-cc', question: 'What is the DRY principle?', answer: "Don't Repeat Yourself — every piece of knowledge should have a single representation.", difficulty: 'easy', status: 'reviewing', category: 'Principles', tags: ['dry', 'principles'], createdAt: ago(8), updatedAt: ago(2), lastReviewed: ago(1), nextReview: daysAgo(0), streak: 3, easeFactor: 2.3, interval: 4, correctCount: 3, incorrectCount: 0 },
];

const flashcardDecks: FlashcardDeck[] = [
  { id: 'deck-py-basics', bookId: BOOK_PYTHON, name: 'Python Basics', description: 'Core Python fundamentals', color: '#3b82f6', flashcardIds: ['fc-py-1', 'fc-py-2', 'fc-py-3', 'fc-py-6'], createdAt: ago(25), updatedAt: ago(2) },
  { id: 'deck-py-oop', bookId: BOOK_PYTHON, name: 'OOP & Errors', description: 'Object-oriented programming and error handling', color: '#8b5cf6', flashcardIds: ['fc-py-4', 'fc-py-5'], createdAt: ago(18), updatedAt: ago(5) },
  { id: 'deck-py-adv', bookId: BOOK_PYTHON, name: 'Advanced Python', description: 'Decorators, generators, and more', color: '#ef4444', flashcardIds: ['fc-py-7', 'fc-py-8'], createdAt: ago(10), updatedAt: ago(10) },
  { id: 'deck-ts-basics', bookId: BOOK_TYPESCRIPT, name: 'TypeScript Basics', description: 'Types, interfaces, and generics', color: '#3b82f6', flashcardIds: ['fc-ts-1', 'fc-ts-2', 'fc-ts-4'], createdAt: ago(18), updatedAt: ago(3) },
  { id: 'deck-ts-adv', bookId: BOOK_TYPESCRIPT, name: 'Advanced TS', description: 'Conditional types, mapped types', color: '#f59e0b', flashcardIds: ['fc-ts-3'], createdAt: ago(14), updatedAt: ago(4) },
  { id: 'deck-cc', bookId: BOOK_CLEANCODE, name: 'Clean Code Principles', description: 'Naming, functions, formatting', color: '#10b981', flashcardIds: ['fc-cc-1', 'fc-cc-2', 'fc-cc-3'], createdAt: ago(12), updatedAt: ago(5) },
];

// ──────────────────────────────────────────────────────────
// QUIZZES
// ──────────────────────────────────────────────────────────

const quizzes: Quiz[] = [
  {
    id: 'quiz-py-1', bookId: BOOK_PYTHON, title: 'Python Basics', description: 'Test your Python fundamentals', difficulty: 'easy', passingScore: 70, createdAt: ago(24), updatedAt: ago(10),
    questions: [
      { id: 'qp1-1', bookId: BOOK_PYTHON, type: 'multiple-choice', question: 'Which keyword defines a function?', options: ['function', 'def', 'func', 'define'], correctAnswer: 'def', explanation: 'Python uses "def".', difficulty: 'easy', category: 'Functions', createdAt: ago(24) },
      { id: 'qp1-2', bookId: BOOK_PYTHON, type: 'true-false', question: 'Python is statically typed.', correctAnswer: 'false', explanation: 'Python is dynamically typed.', difficulty: 'easy', category: 'Basics', createdAt: ago(24) },
      { id: 'qp1-3', bookId: BOOK_PYTHON, type: 'multiple-choice', question: 'Correct file extension?', options: ['.py', '.python', '.pt', '.pyt'], correctAnswer: '.py', difficulty: 'easy', category: 'Basics', createdAt: ago(24), explanation: '.py is standard.' },
      { id: 'qp1-4', bookId: BOOK_PYTHON, type: 'short-answer', question: 'Function for list length?', correctAnswer: 'len()', explanation: 'len() returns length.', difficulty: 'easy', category: 'Functions', createdAt: ago(24) },
      { id: 'qp1-5', bookId: BOOK_PYTHON, type: 'true-false', question: 'Indentation is optional in Python.', correctAnswer: 'false', explanation: 'Indentation is mandatory.', difficulty: 'easy', category: 'Basics', createdAt: ago(24) },
    ],
  },
  {
    id: 'quiz-py-2', bookId: BOOK_PYTHON, title: 'OOP & Data Structures', description: 'Intermediate Python concepts', difficulty: 'medium', passingScore: 60, createdAt: ago(16), updatedAt: ago(5),
    questions: [
      { id: 'qp2-1', bookId: BOOK_PYTHON, type: 'multiple-choice', question: 'Which is immutable?', options: ['list', 'dict', 'tuple', 'set'], correctAnswer: 'tuple', difficulty: 'medium', category: 'Data Structures', createdAt: ago(16), explanation: 'Tuples are immutable sequences.' },
      { id: 'qp2-2', bookId: BOOK_PYTHON, type: 'true-false', question: 'Dictionary keys must be unique.', correctAnswer: 'true', difficulty: 'medium', category: 'Dictionaries', createdAt: ago(16), explanation: 'Keys are unique.' },
      { id: 'qp2-3', bookId: BOOK_PYTHON, type: 'short-answer', question: 'Method to add to list end?', correctAnswer: 'append()', difficulty: 'medium', category: 'Lists', createdAt: ago(16), explanation: 'list.append() adds to end.' },
    ],
  },
  {
    id: 'quiz-ts-1', bookId: BOOK_TYPESCRIPT, title: 'TypeScript Essentials', description: 'Core TypeScript knowledge', difficulty: 'medium', passingScore: 60, createdAt: ago(15), updatedAt: ago(3),
    questions: [
      { id: 'qt1-1', bookId: BOOK_TYPESCRIPT, type: 'multiple-choice', question: 'Keyword for type definitions?', options: ['type', 'typedef', 'ttype', 'typename'], correctAnswer: 'type', difficulty: 'medium', category: 'Types', createdAt: ago(15), explanation: 'Use the "type" keyword.' },
      { id: 'qt1-2', bookId: BOOK_TYPESCRIPT, type: 'multiple-choice', question: 'How to make a prop optional?', options: ['? prop: string', 'prop?: string', 'prop: string?', 'optional prop: string'], correctAnswer: 'prop?: string', difficulty: 'medium', category: 'Types', createdAt: ago(15), explanation: 'Use ? after the property name.' },
      { id: 'qt1-3', bookId: BOOK_TYPESCRIPT, type: 'true-false', question: 'TypeScript has runtime type checking.', correctAnswer: 'false', difficulty: 'medium', category: 'Types', createdAt: ago(15), explanation: 'Types are erased at compile time.' },
    ],
  },
  {
    id: 'quiz-cc-1', bookId: BOOK_CLEANCODE, title: 'Clean Code Principles', description: 'Test your clean code knowledge', difficulty: 'easy', passingScore: 70, createdAt: ago(10), updatedAt: ago(5),
    questions: [
      { id: 'qc1-1', bookId: BOOK_CLEANCODE, type: 'multiple-choice', question: 'Ideal function length?', options: ['1-3 lines', '5-15 lines', '50-100 lines', 'No limit'], correctAnswer: '5-15 lines', difficulty: 'easy', category: 'Functions', createdAt: ago(10), explanation: 'Functions should be short and focused.' },
      { id: 'qc1-2', bookId: BOOK_CLEANCODE, type: 'true-false', question: 'Comments are always necessary.', correctAnswer: 'false', difficulty: 'easy', category: 'Comments', createdAt: ago(10), explanation: 'Good code should be self-documenting.' },
      { id: 'qc1-3', bookId: BOOK_CLEANCODE, type: 'short-answer', question: 'DRY stands for?', correctAnswer: "Don't Repeat Yourself", difficulty: 'easy', category: 'Principles', createdAt: ago(10), explanation: 'Every piece of knowledge should have a single representation.' },
    ],
  },
];

const quizAttempts: QuizAttempt[] = [
  { id: 'qa-1', quizId: 'quiz-py-1', bookId: BOOK_PYTHON, answers: { 'qp1-1': 'def', 'qp1-2': 'false', 'qp1-3': '.py', 'qp1-4': 'len()', 'qp1-5': 'false' }, score: 100, totalQuestions: 5, passed: true, startedAt: ago(20), completedAt: ago(20), durationMs: 90000 },
  { id: 'qa-2', quizId: 'quiz-py-1', bookId: BOOK_PYTHON, answers: { 'qp1-1': 'def', 'qp1-2': 'false', 'qp1-3': '.py', 'qp1-4': 'len()', 'qp1-5': 'false' }, score: 100, totalQuestions: 5, passed: true, startedAt: ago(12), completedAt: ago(12), durationMs: 75000 },
  { id: 'qa-3', quizId: 'quiz-py-2', bookId: BOOK_PYTHON, answers: { 'qp2-1': 'tuple', 'qp2-2': 'true', 'qp2-3': 'append()' }, score: 100, totalQuestions: 3, passed: true, startedAt: ago(10), completedAt: ago(10), durationMs: 120000 },
  { id: 'qa-4', quizId: 'quiz-ts-1', bookId: BOOK_TYPESCRIPT, answers: { 'qt1-1': 'type', 'qt1-2': 'prop?: string', 'qt1-3': 'false' }, score: 100, totalQuestions: 3, passed: true, startedAt: ago(8), completedAt: ago(8), durationMs: 95000 },
  { id: 'qa-5', quizId: 'quiz-cc-1', bookId: BOOK_CLEANCODE, answers: { 'qc1-1': '5-15 lines', 'qc1-2': 'false', 'qc1-3': "Don't Repeat Yourself" }, score: 100, totalQuestions: 3, passed: true, startedAt: ago(5), completedAt: ago(5), durationMs: 60000 },
];

// ──────────────────────────────────────────────────────────
// EXERCISES
// ──────────────────────────────────────────────────────────

const exercises: Exercise[] = [
  { id: 'ex-py-1', bookId: BOOK_PYTHON, chapterTitle: 'Ch 4: Functions', title: 'Hello World Function', description: 'Create a greeting function.', instructions: 'Write greet(name) returning "Hello, {name}!"', difficulty: 'beginner', language: 'python', starterCode: 'def greet(name):\n    pass', expectedOutput: 'Hello, Alice!', hints: ['Use f-string'], solution: 'def greet(name):\n    return f"Hello, {name}!"', status: 'completed', category: 'Functions', createdAt: ago(22), updatedAt: ago(18) },
  { id: 'ex-py-2', bookId: BOOK_PYTHON, chapterTitle: 'Ch 5: Lists', title: 'List Comprehension', description: 'Square numbers with comprehension.', instructions: 'Create squares of 1-10 using list comprehension.', difficulty: 'beginner', language: 'python', starterCode: 'squares = []\nprint(squares)', expectedOutput: '[1, 4, 9, 16, 25, 36, 49, 64, 81, 100]', hints: ['[x**2 for x in range(1, 11)]'], solution: 'squares = [x**2 for x in range(1, 11)]', status: 'completed', category: 'Lists', createdAt: ago(20), updatedAt: ago(16) },
  { id: 'ex-py-3', bookId: BOOK_PYTHON, chapterTitle: 'Ch 6: Dictionaries', title: 'Word Counter', description: 'Count word frequencies.', instructions: 'Write word_count(text) returning a frequency dict.', difficulty: 'intermediate', language: 'python', starterCode: 'def word_count(text):\n    pass', expectedOutput: "{'hello': 2, 'world': 1}", hints: ['Split text', 'Use dict.get()'], solution: "def word_count(text):\n    counts = {}\n    for w in text.split():\n        counts[w] = counts.get(w, 0) + 1\n    return counts", status: 'completed', category: 'Dictionaries', createdAt: ago(18), updatedAt: ago(14) },
  { id: 'ex-py-4', bookId: BOOK_PYTHON, chapterTitle: 'Ch 8: OOP', title: 'Bank Account', description: 'Implement a BankAccount class.', instructions: 'Create class with deposit(), withdraw(), get_balance().', difficulty: 'intermediate', language: 'python', starterCode: 'class BankAccount:\n    def __init__(self, balance=0):\n        self.balance = balance', expectedOutput: 'Balance: 500', hints: ['Track self.balance', 'Check funds on withdraw'], solution: "class BankAccount:\n    def __init__(self, balance=0):\n        self.balance = balance\n    def deposit(self, amount):\n        self.balance += amount\n    def withdraw(self, amount):\n        if amount <= self.balance:\n            self.balance -= amount\n    def get_balance(self):\n        return self.balance", status: 'in-progress', category: 'OOP', createdAt: ago(14), updatedAt: ago(8) },
  { id: 'ex-py-5', bookId: BOOK_PYTHON, chapterTitle: 'Ch 9: Testing', title: 'Safe Divide', description: 'Handle division errors.', instructions: 'Write safe_divide(a, b) handling ZeroDivisionError.', difficulty: 'intermediate', language: 'python', starterCode: 'def safe_divide(a, b):\n    pass', expectedOutput: 'Result: 2.5', hints: ['Use try/except'], solution: 'def safe_divide(a, b):\n    try:\n        return a / b\n    except ZeroDivisionError:\n        return "Cannot divide by zero"', status: 'not-started', category: 'Error Handling', createdAt: ago(10), updatedAt: ago(10) },
  { id: 'ex-ts-1', bookId: BOOK_TYPESCRIPT, chapterTitle: 'Ch 4: Generics', title: 'Generic Identity', description: 'Write a generic identity function.', instructions: 'Create function id<T>(x: T): T', difficulty: 'beginner', language: 'typescript', starterCode: 'function id(x) {\n    return x;\n}', expectedOutput: '42', hints: ['Add type parameter'], solution: 'function id<T>(x: T): T {\n    return x;\n}', status: 'completed', category: 'Generics', createdAt: ago(14), updatedAt: ago(10) },
  { id: 'ex-ts-2', bookId: BOOK_TYPESCRIPT, chapterTitle: 'Ch 5: Utility Types', title: 'Partial Builder', description: 'Use Partial to make optional props.', instructions: 'Create type UserUpdate = Partial<User>', difficulty: 'intermediate', language: 'typescript', starterCode: 'interface User {\n    name: string;\n    email: string;\n    age: number;\n}\n\n// Create UserUpdate type', expectedOutput: '{ name?: string; email?: string; age?: number }', hints: ['Use Partial<User>'], solution: 'type UserUpdate = Partial<User>;', status: 'in-progress', category: 'Utility Types', createdAt: ago(10), updatedAt: ago(6) },
  { id: 'ex-cc-1', bookId: BOOK_CLEANCODE, chapterTitle: 'Ch 3: Functions', title: 'Refactor Long Function', description: 'Break a long function into smaller ones.', instructions: 'Refactor the given function to follow clean code principles.', difficulty: 'intermediate', language: 'python', starterCode: 'def process(data):\n    # 50 lines of code\n    pass', expectedOutput: 'Refactored into 3+ small functions', hints: ['Extract validation', 'Extract transformation', 'Extract output'], solution: 'def process(data):\n    validated = validate(data)\n    transformed = transform(validated)\n    return format_output(transformed)', status: 'not-started', category: 'Refactoring', createdAt: ago(8), updatedAt: ago(8) },
];

const exerciseResults: ExerciseResult[] = [
  { id: 'er-1', exerciseId: 'ex-py-1', bookId: BOOK_PYTHON, userCode: 'def greet(name):\n    return f"Hello, {name}!"', output: 'Hello, Alice!', passed: true, attemptedAt: ago(18) },
  { id: 'er-2', exerciseId: 'ex-py-2', bookId: BOOK_PYTHON, userCode: 'squares = [x**2 for x in range(1, 11)]\nprint(squares)', output: '[1, 4, 9, 16, 25, 36, 49, 64, 81, 100]', passed: true, attemptedAt: ago(16) },
  { id: 'er-3', exerciseId: 'ex-py-3', bookId: BOOK_PYTHON, userCode: "def word_count(text):\n    counts = {}\n    for w in text.split():\n        counts[w] = counts.get(w, 0) + 1\n    return counts", output: "{'hello': 2, 'world': 1}", passed: true, attemptedAt: ago(14) },
  { id: 'er-4', exerciseId: 'ex-ts-1', bookId: BOOK_TYPESCRIPT, userCode: 'function id<T>(x: T): T {\n    return x;\n}', output: '42', passed: true, attemptedAt: ago(10) },
];

// ──────────────────────────────────────────────────────────
// ACHIEVEMENTS
// ──────────────────────────────────────────────────────────

const userAchievements: UserAchievement[] = [
  { id: 'ua-1', achievementId: 'flashcards-10', unlockedAt: ago(15), progress: 15 },
  { id: 'ua-2', achievementId: 'flashcards-50', unlockedAt: ago(5), progress: 52 },
  { id: 'ua-3', achievementId: 'quiz-first', unlockedAt: ago(20), progress: 5 },
  { id: 'ua-4', achievementId: 'quiz-10', unlockedAt: ago(3), progress: 10 },
  { id: 'ua-5', achievementId: 'exercise-first', unlockedAt: ago(18), progress: 4 },
  { id: 'ua-6', achievementId: 'streak-7', unlockedAt: ago(10), progress: 7 },
  { id: 'ua-7', achievementId: 'streak-30', unlockedAt: ago(1), progress: 28 },
  { id: 'ua-8', achievementId: 'pages-100', unlockedAt: ago(12), progress: 620 },
  { id: 'ua-9', achievementId: 'pages-500', unlockedAt: ago(3), progress: 620 },
  { id: 'ua-10', achievementId: 'notes-25', unlockedAt: ago(2), progress: 27 },
  { id: 'ua-11', achievementId: 'highlights-50', unlockedAt: ago(1), progress: 52 },
];

// ──────────────────────────────────────────────────────────
// CHAPTER PROGRESS
// ──────────────────────────────────────────────────────────

const chapterProgressItems: ChapterProgress[] = [
  // Python chapters
  { id: 'cp-py-1', bookId: BOOK_PYTHON, chapterTitle: 'Ch 1: Getting Started', pageNumber: 1, status: 'completed', completedAt: ago(28), updatedAt: ago(28) },
  { id: 'cp-py-2', bookId: BOOK_PYTHON, chapterTitle: 'Ch 2: Variables & Types', pageNumber: 21, status: 'completed', completedAt: ago(26), updatedAt: ago(26) },
  { id: 'cp-py-3', bookId: BOOK_PYTHON, chapterTitle: 'Ch 3: Control Flow', pageNumber: 41, status: 'completed', completedAt: ago(24), updatedAt: ago(24) },
  { id: 'cp-py-4', bookId: BOOK_PYTHON, chapterTitle: 'Ch 4: Functions', pageNumber: 61, status: 'completed', completedAt: ago(22), updatedAt: ago(22) },
  { id: 'cp-py-5', bookId: BOOK_PYTHON, chapterTitle: 'Ch 5: Lists', pageNumber: 81, status: 'completed', completedAt: ago(20), updatedAt: ago(20) },
  { id: 'cp-py-6', bookId: BOOK_PYTHON, chapterTitle: 'Ch 6: Dictionaries', pageNumber: 101, status: 'completed', completedAt: ago(18), updatedAt: ago(18) },
  { id: 'cp-py-7', bookId: BOOK_PYTHON, chapterTitle: 'Ch 7: File I/O', pageNumber: 121, status: 'completed', completedAt: ago(14), updatedAt: ago(14) },
  { id: 'cp-py-8', bookId: BOOK_PYTHON, chapterTitle: 'Ch 8: OOP', pageNumber: 141, status: 'practicing', updatedAt: ago(5) },
  { id: 'cp-py-9', bookId: BOOK_PYTHON, chapterTitle: 'Ch 9: Testing', pageNumber: 161, status: 'reading', updatedAt: ago(2) },
  { id: 'cp-py-10', bookId: BOOK_PYTHON, chapterTitle: 'Ch 10: Django Project', pageNumber: 181, status: 'not-started', updatedAt: ago(1) },
  { id: 'cp-py-11', bookId: BOOK_PYTHON, chapterTitle: 'Ch 11: Data Viz', pageNumber: 201, status: 'not-started', updatedAt: ago(1) },
  { id: 'cp-py-12', bookId: BOOK_PYTHON, chapterTitle: 'Ch 12: Pygame', pageNumber: 221, status: 'not-started', updatedAt: ago(1) },
  // TypeScript chapters
  { id: 'cp-ts-1', bookId: BOOK_TYPESCRIPT, chapterTitle: 'Ch 1: Intro to TS', pageNumber: 1, status: 'completed', completedAt: ago(18), updatedAt: ago(18) },
  { id: 'cp-ts-2', bookId: BOOK_TYPESCRIPT, chapterTitle: 'Ch 2: Type System', pageNumber: 21, status: 'completed', completedAt: ago(16), updatedAt: ago(16) },
  { id: 'cp-ts-3', bookId: BOOK_TYPESCRIPT, chapterTitle: 'Ch 3: Interfaces', pageNumber: 41, status: 'completed', completedAt: ago(14), updatedAt: ago(14) },
  { id: 'cp-ts-4', bookId: BOOK_TYPESCRIPT, chapterTitle: 'Ch 4: Generics', pageNumber: 61, status: 'completed', completedAt: ago(12), updatedAt: ago(12) },
  { id: 'cp-ts-5', bookId: BOOK_TYPESCRIPT, chapterTitle: 'Ch 5: Utility Types', pageNumber: 81, status: 'reading', updatedAt: ago(3) },
  { id: 'cp-ts-6', bookId: BOOK_TYPESCRIPT, chapterTitle: 'Ch 6: Advanced Types', pageNumber: 101, status: 'not-started', updatedAt: ago(1) },
  // Clean Code chapters
  { id: 'cp-cc-1', bookId: BOOK_CLEANCODE, chapterTitle: 'Ch 1: Clean Code', pageNumber: 1, status: 'completed', completedAt: ago(12), updatedAt: ago(12) },
  { id: 'cp-cc-2', bookId: BOOK_CLEANCODE, chapterTitle: 'Ch 2: Meaningful Names', pageNumber: 21, status: 'completed', completedAt: ago(10), updatedAt: ago(10) },
  { id: 'cp-cc-3', bookId: BOOK_CLEANCODE, chapterTitle: 'Ch 3: Functions', pageNumber: 41, status: 'reading', updatedAt: ago(5) },
];

// ──────────────────────────────────────────────────────────
// LEARNING STATS (per book)
// ──────────────────────────────────────────────────────────

const learningStatsItems: LearningStats[] = [
  { id: BOOK_PYTHON, bookId: BOOK_PYTHON, totalFlashcards: 8, masteredFlashcards: 3, totalQuizzes: 2, quizzesPassed: 2, totalExercises: 5, exercisesCompleted: 3, studyTimeMs: 48000000, currentStreak: 28, longestStreak: 28, lastStudyDate: daysAgo(0), learningScore: 78, updatedAt: now },
  { id: BOOK_TYPESCRIPT, bookId: BOOK_TYPESCRIPT, totalFlashcards: 4, masteredFlashcards: 2, totalQuizzes: 1, quizzesPassed: 1, totalExercises: 2, exercisesCompleted: 1, studyTimeMs: 32000000, currentStreak: 18, longestStreak: 18, lastStudyDate: daysAgo(0), learningScore: 65, updatedAt: now },
  { id: BOOK_CLEANCODE, bookId: BOOK_CLEANCODE, totalFlashcards: 3, masteredFlashcards: 1, totalQuizzes: 1, quizzesPassed: 1, totalExercises: 1, exercisesCompleted: 0, studyTimeMs: 12000000, currentStreak: 5, longestStreak: 5, lastStudyDate: daysAgo(1), learningScore: 42, updatedAt: now },
];

// ──────────────────────────────────────────────────────────
// STUDY CALENDAR
// ──────────────────────────────────────────────────────────

const studyCalendarEntries: StudyCalendarEntry[] = (() => {
  const entries: StudyCalendarEntry[] = [];
  let id = 1;
  for (let d = 27; d >= 0; d--) {
    const date = daysAgo(d);
    const bookId = [BOOK_PYTHON, BOOK_TYPESCRIPT, BOOK_CLEANCODE][d % 3];
    const types: Array<{ type: StudyCalendarEntry['type']; desc: string; dur: number }> = [
      { type: 'reading', desc: `Read ${bookId === BOOK_PYTHON ? 'Python Crash Course' : bookId === BOOK_TYPESCRIPT ? 'TypeScript Handbook' : 'Clean Code'}`, dur: 1800000 + Math.random() * 2400000 },
    ];
    if (d % 2 === 0) types.push({ type: 'flashcards', desc: 'Reviewed flashcards', dur: 600000 + Math.random() * 900000 });
    if (d % 3 === 0) types.push({ type: 'quiz', desc: 'Completed a quiz', dur: 300000 + Math.random() * 600000 });
    if (d % 4 === 0) types.push({ type: 'exercise', desc: 'Worked on an exercise', dur: 900000 + Math.random() * 1200000 });
    for (const t of types) {
      entries.push({
        id: `sc-${id++}`,
        bookId,
        date,
        type: t.type,
        durationMs: Math.round(t.dur),
        description: t.desc,
        createdAt: new Date(`${date}T12:00:00Z`).toISOString(),
      });
    }
  }
  return entries;
})();

// ──────────────────────────────────────────────────────────
// CONTINUE LEARNING
// ──────────────────────────────────────────────────────────

const continueLearningItems: ContinueLearningState[] = [
  { id: BOOK_PYTHON, bookId: BOOK_PYTHON, lastActivity: 'exercise' as const, lastExerciseId: 'ex-py-4', lastChapterTitle: 'Ch 8: OOP', updatedAt: now },
  { id: BOOK_TYPESCRIPT, bookId: BOOK_TYPESCRIPT, lastActivity: 'flashcards' as const, lastFlashcardId: 'fc-ts-3', lastChapterTitle: 'Ch 5: Utility Types', updatedAt: ago(1) },
];

// ──────────────────────────────────────────────────────────
// SEED FUNCTION
// ──────────────────────────────────────────────────────────

export async function seedAllDemoData() {
  // Check if already seeded
  const existingBooks = await db.books.count();
  if (existingBooks >= 3) {
    console.log('[Seed] Demo data already exists, skipping.');
    return;
  }

  console.log('[Seed] Seeding comprehensive demo data...');

  await db.transaction('rw', [
    db.books, db.progress, db.plans, db.bookmarks, db.highlights, db.notes,
    db.stickyNotes, db.studyBookmarks, db.tags, db.studySessions, db.activities,
    db.flashcards, db.flashcardDecks, db.quizzes, db.quizAttempts, db.exercises,
    db.exerciseResults, db.userAchievements, db.chapterProgress, db.learningStats,
    db.studyCalendarEntries, db.continueLearning,
  ], async () => {
    // Books
    await db.books.bulkAdd(books);

    // Progress
    await db.progress.bulkAdd(progress);

    // Reading plans
    await db.plans.bulkAdd(plans);

    // Library bookmarks
    await db.bookmarks.bulkAdd(bookmarks);

    // Highlights
    await db.highlights.bulkAdd(highlights);

    // Notes
    await db.notes.bulkAdd(notes);

    // Sticky notes
    await db.stickyNotes.bulkAdd(stickyNotes);

    // Study bookmarks
    await db.studyBookmarks.bulkAdd(studyBookmarks);

    // Tags
    await db.tags.bulkAdd(tags);

    // Study sessions
    await db.studySessions.bulkAdd(studySessions);

    // Activities
    await db.activities.bulkAdd(activities);

    // Flashcards
    await db.flashcards.bulkAdd(flashcards);
    await db.flashcardDecks.bulkAdd(flashcardDecks);

    // Quizzes
    await db.quizzes.bulkAdd(quizzes);
    await db.quizAttempts.bulkAdd(quizAttempts);

    // Exercises
    await db.exercises.bulkAdd(exercises);
    await db.exerciseResults.bulkAdd(exerciseResults);

    // Achievements
    await db.userAchievements.bulkAdd(userAchievements);

    // Chapter progress
    await db.chapterProgress.bulkAdd(chapterProgressItems);

    // Learning stats
    await db.learningStats.bulkAdd(learningStatsItems);

    // Study calendar
    await db.studyCalendarEntries.bulkAdd(studyCalendarEntries);

    // Continue learning
    await db.continueLearning.bulkAdd(continueLearningItems);
  });

  console.log('[Seed] All demo data seeded successfully!');
  console.log('[Seed] 3 books, highlights, notes, flashcards, quizzes, exercises, achievements, stats, calendar');
}

export { BOOK_PYTHON, BOOK_TYPESCRIPT, BOOK_CLEANCODE };
