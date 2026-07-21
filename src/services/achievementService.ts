import { db } from './database';
import { UserAchievement, AchievementDefinition, ACHIEVEMENT_DEFINITIONS, AchievementId } from '../types/learning';
import { generateId } from '../lib/utils';

export const achievementService = {
  async getDefinitions(): Promise<AchievementDefinition[]> {
    return ACHIEVEMENT_DEFINITIONS;
  },
  async getUnlocked(): Promise<UserAchievement[]> {
    return db.userAchievements.toArray();
  },
  async isUnlocked(achievementId: AchievementId): Promise<boolean> {
    const exists = await db.userAchievements.where('achievementId').equals(achievementId).first();
    return !!exists;
  },
  async unlock(achievementId: AchievementId): Promise<UserAchievement | null> {
    const already = await db.userAchievements.where('achievementId').equals(achievementId).first();
    if (already) return null;
    const entry: UserAchievement = {
      id: generateId(),
      achievementId,
      unlockedAt: new Date().toISOString(),
      progress: 1,
    };
    await db.userAchievements.add(entry);
    return entry;
  },
  async getStats(): Promise<{ total: number; unlocked: number; percentage: number }> {
    const unlocked = await db.userAchievements.count();
    const total = ACHIEVEMENT_DEFINITIONS.length;
    return { total, unlocked, percentage: total > 0 ? Math.round((unlocked / total) * 100) : 0 };
  },
  async removeByAchievement(achievementId: AchievementId): Promise<void> {
    await db.userAchievements.where('achievementId').equals(achievementId).delete();
  },
  async clearAll(): Promise<void> {
    await db.userAchievements.clear();
  },
};
