import { create } from 'zustand';
import { exerciseService } from '../services/exerciseService';
import { Exercise, ExerciseResult } from '../types/learning';


interface ExercisesState {
  exercises: Exercise[];
  activeExercise: Exercise | null;
  results: ExerciseResult[];
  stats: { total: number; completed: number; inProgress: number };
  loading: boolean;
  loadExercises: (bookId: string) => Promise<void>;
  createExercise: (exercise: Exercise) => Promise<void>;
  selectExercise: (id: string) => Promise<void>;
  updateExercise: (id: string, updates: Partial<Exercise>) => Promise<void>;
  removeExercise: (id: string) => Promise<void>;
  removeByBook: (bookId: string) => Promise<void>;
  recordResult: (result: ExerciseResult) => Promise<void>;
  loadResults: (exerciseId: string) => Promise<void>;
  refreshStats: (bookId: string) => Promise<void>;
}

export const useExercisesStore = create<ExercisesState>((set, get) => ({
  exercises: [],
  activeExercise: null,
  results: [],
  stats: { total: 0, completed: 0, inProgress: 0 },
  loading: false,

  loadExercises: async (bookId) => {
    set({ loading: true });
    const exercises = await exerciseService.getByBook(bookId);
    set({ exercises, loading: false });
  },

  createExercise: async (exercise) => {
    await exerciseService.create(exercise);
    set({ exercises: [exercise, ...get().exercises] });
  },

  selectExercise: async (id) => {
    const exercise = await exerciseService.get(id);
    set({ activeExercise: exercise || null });
    if (exercise) {
      await exerciseService.update(id, { status: exercise.status === 'not-started' ? 'in-progress' : exercise.status });
      const results = await exerciseService.getResults(id);
      set({ results });
    }
  },

  updateExercise: async (id, updates) => {
    await exerciseService.update(id, updates);
    set({
      exercises: get().exercises.map(e => e.id === id ? { ...e, ...updates } : e),
      activeExercise: get().activeExercise?.id === id ? { ...get().activeExercise!, ...updates } : get().activeExercise,
    });
  },

  removeExercise: async (id) => {
    await exerciseService.remove(id);
    set({
      exercises: get().exercises.filter(e => e.id !== id),
      activeExercise: get().activeExercise?.id === id ? null : get().activeExercise,
    });
  },

  removeByBook: async (bookId) => {
    await exerciseService.removeByBook(bookId);
    set({ exercises: [], stats: { total: 0, completed: 0, inProgress: 0 } });
  },

  recordResult: async (result) => {
    await exerciseService.recordResult(result);
    set({ results: [...get().results, result] });
  },

  loadResults: async (exerciseId) => {
    const results = await exerciseService.getResults(exerciseId);
    set({ results });
  },

  refreshStats: async (bookId) => {
    const stats = await exerciseService.getStats(bookId);
    set({ stats });
  },
}));
