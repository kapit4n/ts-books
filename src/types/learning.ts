export type FlashcardDifficulty = 'easy' | 'medium' | 'hard';
export type FlashcardStatus = 'new' | 'learning' | 'reviewing' | 'mastered';
export type FlashcardReviewRating = 'again' | 'hard' | 'good' | 'easy';

export interface Flashcard {
  id: string;
  bookId: string;
  deckId?: string;
  chapterTitle?: string;
  pageNumber?: number;
  question: string;
  answer: string;
  difficulty: FlashcardDifficulty;
  status: FlashcardStatus;
  category: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  lastReviewed?: string;
  nextReview?: string;
  streak: number;
  easeFactor: number;
  interval: number;
  correctCount: number;
  incorrectCount: number;
}

export interface FlashcardDeck {
  id: string;
  bookId: string;
  name: string;
  description: string;
  color: string;
  flashcardIds: string[];
  createdAt: string;
  updatedAt: string;
}

export type QuizQuestionType = 'multiple-choice' | 'true-false' | 'short-answer' | 'fill-in-blank' | 'matching';

export interface QuizQuestion {
  id: string;
  bookId: string;
  type: QuizQuestionType;
  question: string;
  options?: string[];
  correctAnswer: string;
  matchPairs?: Array<{ left: string; right: string }>;
  explanation: string;
  difficulty: FlashcardDifficulty;
  category: string;
  createdAt: string;
}

export interface Quiz {
  id: string;
  bookId: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
  difficulty: FlashcardDifficulty;
  passingScore: number;
  timeLimitMinutes?: number;
  createdAt: string;
  updatedAt: string;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  bookId: string;
  answers: Record<string, string>;
  score: number;
  totalQuestions: number;
  passed: boolean;
  startedAt: string;
  completedAt: string;
  durationMs: number;
}

export type ExerciseDifficulty = 'beginner' | 'intermediate' | 'advanced';
export type ExerciseStatus = 'not-started' | 'in-progress' | 'completed';
export type ExerciseLanguage = 'typescript' | 'javascript' | 'python';

export interface Exercise {
  id: string;
  bookId: string;
  chapterTitle?: string;
  title: string;
  description: string;
  instructions: string;
  difficulty: ExerciseDifficulty;
  language: ExerciseLanguage;
  starterCode: string;
  expectedOutput: string;
  hints: string[];
  solution: string;
  status: ExerciseStatus;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExerciseResult {
  id: string;
  exerciseId: string;
  bookId: string;
  userCode: string;
  output: string;
  passed: boolean;
  attemptedAt: string;
}

export type AchievementCategory = 'reading' | 'flashcards' | 'quizzes' | 'exercises' | 'streaks' | 'milestones';

export type AchievementId =
  | 'first-book' | 'flashcards-10' | 'flashcards-50' | 'flashcards-100'
  | 'streak-7' | 'streak-30' | 'streak-100'
  | 'pages-100' | 'pages-500' | 'pages-1000'
  | 'quiz-first' | 'quiz-10' | 'quiz-perfect'
  | 'exercise-first' | 'exercise-10'
  | 'highlights-50'
  | 'study-champion'
  | 'notes-25';

export interface AchievementDefinition {
  id: AchievementId;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  criteria: {
    type: string;
    threshold: number;
  };
  secret?: boolean;
}

export interface UserAchievement {
  id: string;
  achievementId: AchievementId;
  unlockedAt: string;
  progress: number;
}

export type ChapterStatus = 'not-started' | 'reading' | 'practicing' | 'completed';

export interface ChapterProgress {
  id: string;
  bookId: string;
  chapterTitle: string;
  pageNumber: number;
  status: ChapterStatus;
  completedAt?: string;
  updatedAt: string;
}

export type CalendarEntryType = 'reading' | 'flashcards' | 'quiz' | 'exercise';

export interface StudyCalendarEntry {
  id: string;
  bookId?: string;
  date: string;
  type: CalendarEntryType;
  durationMs: number;
  description: string;
  createdAt: string;
}

export interface LearningStats {
  id: string;
  bookId: string;
  totalFlashcards: number;
  masteredFlashcards: number;
  totalQuizzes: number;
  quizzesPassed: number;
  totalExercises: number;
  exercisesCompleted: number;
  studyTimeMs: number;
  currentStreak: number;
  longestStreak: number;
  lastStudyDate: string;
  learningScore: number;
  updatedAt: string;
}

export interface GlobalLearningStats {
  totalBooksStudied: number;
  totalFlashcards: number;
  masteredFlashcards: number;
  totalQuizzes: number;
  quizzesPassed: number;
  totalExercises: number;
  exercisesCompleted: number;
  totalStudyTimeMs: number;
  currentStreak: number;
  longestStreak: number;
  totalHighlights: number;
  totalNotes: number;
  achievementsUnlocked: number;
  learningScore: number;
}

export interface ContinueLearningState {
  id: string;
  bookId: string;
  lastActivity: CalendarEntryType;
  lastFlashcardId?: string;
  lastQuizId?: string;
  lastExerciseId?: string;
  lastChapterTitle?: string;
  updatedAt: string;
}

export const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  { id: 'first-book', name: 'Bookworm', description: 'Complete reading 1 book', icon: '📖', category: 'reading', criteria: { type: 'books_completed', threshold: 1 } },
  { id: 'flashcards-10', name: 'Card Creator', description: 'Create 10 flashcards', icon: '🃏', category: 'flashcards', criteria: { type: 'flashcards_created', threshold: 10 } },
  { id: 'flashcards-50', name: 'Card Master', description: 'Create 50 flashcards', icon: '🎴', category: 'flashcards', criteria: { type: 'flashcards_created', threshold: 50 } },
  { id: 'flashcards-100', name: 'Card Champion', description: 'Create 100 flashcards', icon: '🏆', category: 'flashcards', criteria: { type: 'flashcards_created', threshold: 100 } },
  { id: 'streak-7', name: 'Week Warrior', description: '7-day study streak', icon: '🔥', category: 'streaks', criteria: { type: 'reading_streak', threshold: 7 } },
  { id: 'streak-30', name: 'Monthly Champion', description: '30-day study streak', icon: '💪', category: 'streaks', criteria: { type: 'reading_streak', threshold: 30 } },
  { id: 'streak-100', name: 'Unstoppable', description: '100-day study streak', icon: '⚡', category: 'streaks', criteria: { type: 'reading_streak', threshold: 100 } },
  { id: 'pages-100', name: 'Page Turner', description: 'Read 100 pages', icon: '📚', category: 'reading', criteria: { type: 'pages_read', threshold: 100 } },
  { id: 'pages-500', name: 'Halfway There', description: 'Read 500 pages', icon: '📖', category: 'reading', criteria: { type: 'pages_read', threshold: 500 } },
  { id: 'pages-1000', name: 'Thousand Reader', description: 'Read 1000 pages', icon: '🏅', category: 'reading', criteria: { type: 'pages_read', threshold: 1000 } },
  { id: 'quiz-first', name: 'Quiz Rookie', description: 'Pass your first quiz', icon: '✅', category: 'quizzes', criteria: { type: 'quizzes_passed', threshold: 1 } },
  { id: 'quiz-10', name: 'Quiz Master', description: 'Pass 10 quizzes', icon: '🎓', category: 'quizzes', criteria: { type: 'quizzes_passed', threshold: 10 } },
  { id: 'quiz-perfect', name: 'Perfect Score', description: 'Get 100% on any quiz', icon: '💯', category: 'quizzes', criteria: { type: 'quiz_perfect', threshold: 1 } },
  { id: 'exercise-first', name: 'Code Starter', description: 'Complete your first exercise', icon: '💻', category: 'exercises', criteria: { type: 'exercises_completed', threshold: 1 } },
  { id: 'exercise-10', name: 'Code Warrior', description: 'Complete 10 exercises', icon: '🖥️', category: 'exercises', criteria: { type: 'exercises_completed', threshold: 10 } },
  { id: 'highlights-50', name: 'Highlighter', description: 'Create 50 highlights', icon: '🖍️', category: 'milestones', criteria: { type: 'highlights_created', threshold: 50 } },
  { id: 'notes-25', name: 'Note Taker', description: 'Create 25 notes', icon: '📝', category: 'milestones', criteria: { type: 'notes_created', threshold: 25 } },
  { id: 'study-champion', name: 'Study Champion', description: 'Complete all chapters in a book', icon: '👑', category: 'milestones', criteria: { type: 'book_chapters_completed', threshold: 1 } },
];
