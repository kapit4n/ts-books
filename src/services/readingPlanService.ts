import { ReadingGoal, ReadingPlan, ReadingSession } from '../types/library';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

const GOAL_MULTIPLIERS: Record<ReadingGoal, number> = {
  'finish-quickly': 2.0,
  'study-deeply': 0.6,
  'casual': 1.0,
  'exam-prep': 1.5,
};

export function calculatePagesPerDay(
  totalPages: number,
  goal: ReadingGoal,
  minutesPerDay: number,
  targetDate: string | null
): { dailyPages: number; estimatedDays: number } {
  const multiplier = GOAL_MULTIPLIERS[goal];
  const basePagesPerMinute = 0.7;
  const effectivePagesPerMinute = basePagesPerMinute * multiplier;
  const minutesFactor = minutesPerDay / 30;
  let dailyPages = Math.max(1, Math.round(effectivePagesPerMinute * minutesPerDay * minutesFactor));

  if (targetDate) {
    const target = new Date(targetDate);
    const today = new Date();
    const daysUntilTarget = Math.max(1, Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
    const pagesFromTarget = Math.ceil(totalPages / daysUntilTarget);
    dailyPages = Math.max(1, Math.min(dailyPages, pagesFromTarget));
  }

  const estimatedDays = Math.ceil(totalPages / dailyPages);
  return { dailyPages, estimatedDays };
}

export function generateReadingPlan(
  bookId: string,
  totalPages: number,
  goal: ReadingGoal,
  minutesPerDay: number,
  targetDate: string | null,
  preferredDays: string[]
): ReadingPlan {
  const { dailyPages, estimatedDays } = calculatePagesPerDay(totalPages, goal, minutesPerDay, targetDate);

  const sessions: ReadingSession[] = [];
  let currentPage = 1;
  let dayOffset = 0;
  const allDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  while (currentPage <= totalPages) {
    const dayOfWeek = allDays[(dayOffset % 7)];
    const isPreferred = preferredDays.length === 0 || preferredDays.includes(dayOfWeek);

    if (isPreferred) {
      const endPage = Math.min(currentPage + dailyPages - 1, totalPages);
      const isReview = sessions.length > 0 && sessions.length % 3 === 0;

      sessions.push({
        id: generateId(),
        bookId,
        day: dayOfWeek,
        startPage: currentPage,
        endPage: isReview ? currentPage - 1 : endPage,
        isReview,
        completed: false,
      });

      if (!isReview) {
        currentPage = endPage + 1;
      }
    }

    dayOffset++;
    if (dayOffset > 100) break; // Safety
  }

  return {
    id: generateId(),
    bookId,
    goal,
    minutesPerDay,
    targetDate,
    preferredDays,
    dailyPages,
    estimatedDays,
    sessions,
    createdAt: new Date().toISOString(),
  };
}
