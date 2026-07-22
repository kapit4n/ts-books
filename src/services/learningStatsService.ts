import { db } from './database';
import { LearningStats, GlobalLearningStats } from '../types/learning';
export const learningStatsService = {
  async get(bookId: string): Promise<LearningStats | undefined> {
    return db.learningStats.get(bookId);
  },
  async getOrCreate(bookId: string): Promise<LearningStats> {
    const existing = await db.learningStats.get(bookId);
    if (existing) return existing;
    const id = bookId;
    const stats: LearningStats = {
      id,
      bookId,
      totalFlashcards: 0,
      masteredFlashcards: 0,
      totalQuizzes: 0,
      quizzesPassed: 0,
      totalExercises: 0,
      exercisesCompleted: 0,
      studyTimeMs: 0,
      currentStreak: 0,
      longestStreak: 0,
      lastStudyDate: '',
      learningScore: 0,
      updatedAt: new Date().toISOString(),
    };
    await db.learningStats.add(stats);
    return stats;
  },
  async update(bookId: string, updates: Partial<LearningStats>): Promise<void> {
    await db.learningStats.update(bookId, { ...updates, updatedAt: new Date().toISOString() });
  },
  async refreshStats(bookId: string): Promise<LearningStats> {
    await this.getOrCreate(bookId);
    const flashcards = await db.flashcards.where('bookId').equals(bookId).toArray();
    const quizzes = await db.quizAttempts.where('bookId').equals(bookId).toArray();
    const exercises = await db.exercises.where('bookId').equals(bookId).toArray();
    const sessions = await db.studySessions.where('bookId').equals(bookId).toArray();
    const totalTime = sessions.reduce((sum, s) => sum + (s.durationMs || 0), 0);
    const updated: Partial<LearningStats> = {
      totalFlashcards: flashcards.length,
      masteredFlashcards: flashcards.filter(c => c.status === 'mastered').length,
      totalQuizzes: quizzes.length,
      quizzesPassed: quizzes.filter(a => a.passed).length,
      totalExercises: exercises.length,
      exercisesCompleted: exercises.filter(e => e.status === 'completed').length,
      studyTimeMs: totalTime,
    };
    const mastered = updated.masteredFlashcards || 0;
    const quizPassed = updated.quizzesPassed || 0;
    const exCompleted = updated.exercisesCompleted || 0;
    updated.learningScore = Math.min(100, mastered * 2 + quizPassed * 10 + exCompleted * 5);
    await this.update(bookId, updated);
    return (await this.get(bookId))!;
  },
  async getGlobalStats(): Promise<GlobalLearningStats> {
    const allStats = await db.learningStats.toArray();
    const highlights = await db.highlights.count();
    const notes = await db.notes.count();
    const achievements = await db.userAchievements.count();
    const totalFlashcards = allStats.reduce((s, x) => s + x.totalFlashcards, 0);
    const masteredFlashcards = allStats.reduce((s, x) => s + x.masteredFlashcards, 0);
    const totalQuizzes = allStats.reduce((s, x) => s + x.totalQuizzes, 0);
    const quizzesPassed = allStats.reduce((s, x) => s + x.quizzesPassed, 0);
    const totalExercises = allStats.reduce((s, x) => s + x.totalExercises, 0);
    const exercisesCompleted = allStats.reduce((s, x) => s + x.exercisesCompleted, 0);
    const totalStudyTimeMs = allStats.reduce((s, x) => s + x.studyTimeMs, 0);
    const currentStreak = allStats.reduce((max, x) => Math.max(max, x.currentStreak), 0);
    const longestStreak = allStats.reduce((max, x) => Math.max(max, x.longestStreak), 0);
    const learningScore = allStats.reduce((s, x) => s + x.learningScore, 0);
    return {
      totalBooksStudied: allStats.length,
      totalFlashcards, masteredFlashcards, totalQuizzes, quizzesPassed,
      totalExercises, exercisesCompleted, totalStudyTimeMs,
      currentStreak, longestStreak, totalHighlights: highlights,
      totalNotes: notes, achievementsUnlocked: achievements, learningScore,
    };
  },
};
