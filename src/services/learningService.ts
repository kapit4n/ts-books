import { learningStatsService } from './learningStatsService';
import { studyCalendarService } from './studyCalendarService';
import { userFlashcardService } from './userFlashcardService';
import { userQuizService } from './userQuizService';
import { exerciseService } from './exerciseService';
import { chapterProgressService } from './chapterProgressService';
import { achievementService } from './achievementService';
import { continueLearningService } from './continueLearningService';
import { db } from './database';

export const learningService = {
  async getBookOverview(bookId: string) {
    const [stats, chapters, flashcardStats, quizStats, exerciseStats] = await Promise.all([
      learningStatsService.refreshStats(bookId),
      chapterProgressService.getByBook(bookId),
      userFlashcardService.getStats(bookId),
      userQuizService.getStats(bookId),
      exerciseService.getStats(bookId),
    ]);
    const chapterPercentage = await chapterProgressService.getCompletionPercentage(bookId);
    return {
      stats,
      chapters,
      chapterPercentage,
      flashcards: flashcardStats,
      quizzes: quizStats,
      exercises: exerciseStats,
    };
  },
  async logStudyActivity(bookId: string, type: 'reading' | 'flashcards' | 'quiz' | 'exercise', durationMs: number, description: string) {
    await studyCalendarService.logActivity(bookId, type, durationMs, description);
    await continueLearningService.update(bookId, { lastActivity: type });
    const stats = await learningStatsService.get(bookId);
    if (stats) {
      const streaks = await studyCalendarService.getStreak();
      await learningStatsService.update(bookId, {
        currentStreak: streaks.current,
        longestStreak: streaks.longest,
        lastStudyDate: new Date().toISOString(),
      });
    }
  },
  async checkAndUnlockAchievements() {
    const unlocked = await achievementService.getUnlocked();
    const unlockedIds = new Set(unlocked.map(u => u.achievementId));
    const allStats = await learningStatsService.getGlobalStats();
    const highlights = await db.highlights.count();
    const notes = await db.notes.count();
    const checks = [
      { id: 'pages-100' as const, value: allStats.totalFlashcards + allStats.totalQuizzes * 10 + allStats.exercisesCompleted * 5 },
      { id: 'streak-7' as const, value: allStats.currentStreak },
      { id: 'streak-30' as const, value: allStats.currentStreak },
      { id: 'streak-100' as const, value: allStats.currentStreak },
      { id: 'flashcards-10' as const, value: allStats.totalFlashcards },
      { id: 'flashcards-50' as const, value: allStats.totalFlashcards },
      { id: 'flashcards-100' as const, value: allStats.totalFlashcards },
      { id: 'quiz-first' as const, value: allStats.quizzesPassed },
      { id: 'quiz-10' as const, value: allStats.quizzesPassed },
      { id: 'exercise-first' as const, value: allStats.exercisesCompleted },
      { id: 'exercise-10' as const, value: allStats.exercisesCompleted },
      { id: 'highlights-50' as const, value: highlights },
      { id: 'notes-25' as const, value: notes },
    ];
    const newlyUnlocked: string[] = [];
    for (const check of checks) {
      if (!unlockedIds.has(check.id)) {
        const def = (await achievementService.getDefinitions()).find(d => d.id === check.id);
        if (def && check.value >= def.criteria.threshold) {
          await achievementService.unlock(check.id);
          newlyUnlocked.push(check.id);
        }
      }
    }
    return newlyUnlocked;
  },
  async removeByBook(bookId: string) {
    await Promise.all([
      userFlashcardService.removeByBook(bookId),
      userQuizService.removeByBook(bookId),
      exerciseService.removeByBook(bookId),
      chapterProgressService.removeByBook(bookId),
      studyCalendarService.removeByBook(bookId),
      continueLearningService.remove(bookId),
      db.learningStats.delete(bookId),
    ]);
  },
};
