import { db } from './database';
import { Exercise, ExerciseResult } from '../types/learning';

export const exerciseService = {
  async getByBook(bookId: string): Promise<Exercise[]> {
    return db.exercises.where('bookId').equals(bookId).toArray();
  },
  async get(id: string): Promise<Exercise | undefined> {
    return db.exercises.get(id);
  },
  async create(exercise: Exercise): Promise<void> {
    await db.exercises.add(exercise);
  },
  async update(id: string, updates: Partial<Exercise>): Promise<void> {
    await db.exercises.update(id, { ...updates, updatedAt: new Date().toISOString() });
  },
  async remove(id: string): Promise<void> {
    await db.exerciseResults.where('exerciseId').equals(id).delete();
    await db.exercises.delete(id);
  },
  async removeByBook(bookId: string): Promise<void> {
    const exercises = await db.exercises.where('bookId').equals(bookId).toArray();
    for (const e of exercises) {
      await db.exerciseResults.where('exerciseId').equals(e.id).delete();
    }
    await db.exercises.where('bookId').equals(bookId).delete();
  },
  async count(bookId: string): Promise<number> {
    return db.exercises.where('bookId').equals(bookId).count();
  },
  async getResults(exerciseId: string): Promise<ExerciseResult[]> {
    return db.exerciseResults.where('exerciseId').equals(exerciseId).toArray();
  },
  async recordResult(result: ExerciseResult): Promise<void> {
    await db.exerciseResults.add(result);
    if (result.passed) {
      await db.exercises.update(result.exerciseId, {
        status: 'completed',
        updatedAt: new Date().toISOString(),
      });
    }
  },
  async getStats(bookId: string): Promise<{ total: number; completed: number; inProgress: number }> {
    const exercises = await db.exercises.where('bookId').equals(bookId).toArray();
    return {
      total: exercises.length,
      completed: exercises.filter(e => e.status === 'completed').length,
      inProgress: exercises.filter(e => e.status === 'in-progress').length,
    };
  },
  async getByStatus(bookId: string, status: Exercise['status']): Promise<Exercise[]> {
    return db.exercises.where('bookId').equals(bookId)
      .filter(e => e.status === status).toArray();
  },
  async getByDifficulty(bookId: string, difficulty: Exercise['difficulty']): Promise<Exercise[]> {
    return db.exercises.where('bookId').equals(bookId)
      .filter(e => e.difficulty === difficulty).toArray();
  },
};
