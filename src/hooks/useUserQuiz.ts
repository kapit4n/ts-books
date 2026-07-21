import { create } from 'zustand';
import { userQuizService } from '../services/userQuizService';
import { Quiz, QuizAttempt } from '../types/learning';
import { generateId } from '../lib/utils';

interface UserQuizState {
  quizzes: Quiz[];
  activeQuiz: Quiz | null;
  attempts: QuizAttempt[];
  currentQuestionIndex: number;
  answers: Record<string, string>;
  quizStartTime: number | null;
  stats: { total: number; totalAttempts: number; passed: number; bestScore: number };
  loading: boolean;
  loadQuizzes: (bookId: string) => Promise<void>;
  createQuiz: (quiz: Quiz) => Promise<void>;
  startQuiz: (quizId: string) => Promise<void>;
  answerQuestion: (questionId: string, answer: string) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  finishQuiz: () => Promise<QuizAttempt | null>;
  removeQuiz: (id: string) => Promise<void>;
  removeByBook: (bookId: string) => Promise<void>;
  loadAttempts: (quizId: string) => Promise<void>;
  refreshStats: (bookId: string) => Promise<void>;
}

export const useUserQuizStore = create<UserQuizState>((set, get) => ({
  quizzes: [],
  activeQuiz: null,
  attempts: [],
  currentQuestionIndex: 0,
  answers: {},
  quizStartTime: null,
  stats: { total: 0, totalAttempts: 0, passed: 0, bestScore: 0 },
  loading: false,

  loadQuizzes: async (bookId) => {
    set({ loading: true });
    const quizzes = await userQuizService.getByBook(bookId);
    set({ quizzes, loading: false });
  },

  createQuiz: async (quiz) => {
    await userQuizService.create(quiz);
    set({ quizzes: [quiz, ...get().quizzes] });
  },

  startQuiz: async (quizId) => {
    const quiz = get().quizzes.find(q => q.id === quizId);
    if (quiz) {
      set({ activeQuiz: quiz, currentQuestionIndex: 0, answers: {}, quizStartTime: Date.now() });
    }
  },

  answerQuestion: (questionId, answer) => {
    set({ answers: { ...get().answers, [questionId]: answer } });
  },

  nextQuestion: () => {
    const { currentQuestionIndex, activeQuiz } = get();
    if (activeQuiz && currentQuestionIndex < activeQuiz.questions.length - 1) {
      set({ currentQuestionIndex: currentQuestionIndex + 1 });
    }
  },

  prevQuestion: () => {
    const { currentQuestionIndex } = get();
    if (currentQuestionIndex > 0) {
      set({ currentQuestionIndex: currentQuestionIndex - 1 });
    }
  },

  finishQuiz: async () => {
    const { activeQuiz, answers, quizStartTime } = get();
    if (!activeQuiz || !quizStartTime) return null;
    let score = 0;
    for (const q of activeQuiz.questions) {
      const userAnswer = answers[q.id] || '';
      if (q.type === 'matching') {
        if (userAnswer === q.correctAnswer) score++;
      } else if (userAnswer.toLowerCase().trim() === q.correctAnswer.toLowerCase().trim()) {
        score++;
      }
    }
    const now = new Date().toISOString();
    const attempt: QuizAttempt = {
      id: generateId(),
      quizId: activeQuiz.id,
      bookId: activeQuiz.bookId,
      answers,
      score,
      totalQuestions: activeQuiz.questions.length,
      passed: (score / activeQuiz.questions.length) * 100 >= activeQuiz.passingScore,
      startedAt: new Date(quizStartTime).toISOString(),
      completedAt: now,
      durationMs: Date.now() - quizStartTime,
    };
    await userQuizService.recordAttempt(attempt);
    set({
      activeQuiz: null,
      currentQuestionIndex: 0,
      answers: {},
      quizStartTime: null,
      attempts: [...get().attempts, attempt],
    });
    return attempt;
  },

  removeQuiz: async (id) => {
    await userQuizService.remove(id);
    set({ quizzes: get().quizzes.filter(q => q.id !== id) });
  },

  removeByBook: async (bookId) => {
    await userQuizService.removeByBook(bookId);
    set({ quizzes: [], stats: { total: 0, totalAttempts: 0, passed: 0, bestScore: 0 } });
  },

  loadAttempts: async (quizId) => {
    const attempts = await userQuizService.getAttempts(quizId);
    set({ attempts });
  },

  refreshStats: async (bookId) => {
    const stats = await userQuizService.getStats(bookId);
    set({ stats });
  },
}));
