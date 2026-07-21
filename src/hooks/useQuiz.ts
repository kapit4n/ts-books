import { create } from 'zustand';
import { quizService } from '../services/quizService';
import { Quiz, QuizQuestion } from '../types/learning';
import { generateId } from '../lib/utils';

interface QuizState {
  quizzes: Quiz[];
  activeQuiz: Quiz | null;
  currentQuestionIndex: number;
  answers: Record<string, string>;
  loading: boolean;
  stats: { total: number; completed: number; averageScore: number };
  loadQuizzes: (bookId: string) => Promise<void>;
  createQuiz: (bookId: string, title: string, questions: Omit<QuizQuestion, 'id' | 'createdAt'>[]) => Promise<Quiz>;
  startQuiz: (quizId: string) => Promise<void>;
  answerQuestion: (questionId: string, answer: string) => Promise<void>;
  nextQuestion: () => void;
  finishQuiz: () => Promise<void>;
  removeQuiz: (id: string) => Promise<void>;
  removeByBook: (bookId: string) => Promise<void>;
  refreshStats: (bookId: string) => Promise<void>;
}

export const useQuizStore = create<QuizState>((set, get) => ({
  quizzes: [],
  activeQuiz: null,
  currentQuestionIndex: 0,
  answers: {},
  loading: false,
  stats: { total: 0, completed: 0, averageScore: 0 },

  loadQuizzes: async (bookId) => {
    set({ loading: true });
    const quizzes = await quizService.getByBook(bookId);
    set({ quizzes, loading: false });
  },

  createQuiz: async (bookId, title, questionsData) => {
    const now = new Date().toISOString();
    const questions: QuizQuestion[] = questionsData.map((q) => ({
      ...q,
      id: generateId() + Math.random().toString(36).slice(2, 5),
      bookId,
      createdAt: now,
    }));

    const quiz: Quiz = {
      id: generateId(),
      bookId,
      title,
      description: '',
      questions,
      difficulty: 'medium',
      passingScore: 70,
      createdAt: now,
      updatedAt: now,
    };

    await quizService.create(quiz);
    set({ quizzes: [quiz, ...get().quizzes] });
    return quiz;
  },

  startQuiz: async (quizId) => {
    const quiz = get().quizzes.find((q) => q.id === quizId);
    if (quiz) {
      set({ activeQuiz: quiz, currentQuestionIndex: 0, answers: {} });
    }
  },

  answerQuestion: async (questionId, answer) => {
    set({ answers: { ...get().answers, [questionId]: answer } });
  },

  nextQuestion: () => {
    const { currentQuestionIndex, activeQuiz } = get();
    if (activeQuiz && currentQuestionIndex < activeQuiz.questions.length - 1) {
      set({ currentQuestionIndex: currentQuestionIndex + 1 });
    }
  },

  finishQuiz: async () => {
    const { activeQuiz } = get();
    if (!activeQuiz) return;

    set({
      activeQuiz: null,
      currentQuestionIndex: 0,
      answers: {},
    });
  },

  removeQuiz: async (id) => {
    await quizService.remove(id);
    set({ quizzes: get().quizzes.filter((q) => q.id !== id) });
  },

  removeByBook: async (bookId) => {
    await quizService.removeByBook(bookId);
    set({ quizzes: [], stats: { total: 0, completed: 0, averageScore: 0 } });
  },

  refreshStats: async (bookId) => {
    const stats = await quizService.getStats(bookId);
    set({ stats });
  },
}));
