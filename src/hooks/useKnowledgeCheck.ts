import { create } from 'zustand';
import { knowledgeCheckService } from '../services/knowledgeCheckService';
import { QuizQuestion } from '../types/learning';

interface KnowledgeCheckState {
  questions: QuizQuestion[];
  answers: Record<string, string>;
  showResults: boolean;
  loading: boolean;
  loadQuestions: (bookId: string, chapterTitle: string) => Promise<void>;
  answerQuestion: (questionId: string, answer: string) => void;
  submitCheck: () => { correct: number; total: number };
  reset: () => void;
}

export const useKnowledgeCheckStore = create<KnowledgeCheckState>((set, get) => ({
  questions: [],
  answers: {},
  showResults: false,
  loading: false,

  loadQuestions: async (bookId, chapterTitle) => {
    set({ loading: true, answers: {}, showResults: false });
    const questions = await knowledgeCheckService.getByChapter(bookId, chapterTitle);
    set({ questions, loading: false });
  },

  answerQuestion: (questionId, answer) => {
    set({ answers: { ...get().answers, [questionId]: answer } });
  },

  submitCheck: () => {
    const { questions, answers } = get();
    let correct = 0;
    for (const q of questions) {
      if ((answers[q.id] || '').toLowerCase().trim() === q.correctAnswer.toLowerCase().trim()) {
        correct++;
      }
    }
    set({ showResults: true });
    return { correct, total: questions.length };
  },

  reset: () => set({ questions: [], answers: {}, showResults: false }),
}));
