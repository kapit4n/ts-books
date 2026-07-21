import Dexie, { Table } from 'dexie';
import {
  ImportedBook, BookBookmark, BookProgress, ReadingPlan,
} from '../types/library';
import {
  Highlight, Note, StickyNote, StudyBookmark, Tag, StudySession, ActivityEntry,
} from '../types/study';
import {
  AIConversation, AIMessage,
} from '../types/ai';
import {
  Flashcard, FlashcardDeck, Quiz, QuizAttempt,
  Exercise, ExerciseResult, UserAchievement, ChapterProgress,
  StudyCalendarEntry, LearningStats, ContinueLearningState,
} from '../types/learning';

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
  aiConversations!: Table<AIConversation>;
  aiMessages!: Table<AIMessage>;
  flashcards!: Table<Flashcard>;
  flashcardDecks!: Table<FlashcardDeck>;
  quizzes!: Table<Quiz>;
  quizAttempts!: Table<QuizAttempt>;
  exercises!: Table<Exercise>;
  exerciseResults!: Table<ExerciseResult>;
  userAchievements!: Table<UserAchievement>;
  chapterProgress!: Table<ChapterProgress>;
  learningStats!: Table<LearningStats>;
  studyCalendarEntries!: Table<StudyCalendarEntry>;
  continueLearning!: Table<ContinueLearningState>;

  constructor() {
    super('ts-books-library');
    this.version(4).stores({
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
      aiConversations: 'id, bookId, createdAt, pinned, *tags',
      aiMessages: 'id, conversationId, timestamp',
      flashcards: 'id, bookId, deckId, category, difficulty, status, nextReview, *tags',
      flashcardDecks: 'id, bookId',
      quizzes: 'id, bookId, createdAt',
      quizAttempts: 'id, quizId, bookId, completedAt',
      exercises: 'id, bookId, difficulty, status, language, category',
      exerciseResults: 'id, exerciseId, bookId',
      userAchievements: 'id, achievementId',
      chapterProgress: 'id, bookId, status',
      learningStats: 'id, bookId',
      studyCalendarEntries: 'id, bookId, date, type',
      continueLearning: 'id, bookId',
    });
  }
}

export const db = new LibraryDB();
