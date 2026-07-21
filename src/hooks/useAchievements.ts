import { create } from 'zustand';
import { achievementService } from '../services/achievementService';
import { learningService } from '../services/learningService';
import { AchievementDefinition, UserAchievement, AchievementId } from '../types/learning';

interface AchievementsState {
  definitions: AchievementDefinition[];
  unlocked: UserAchievement[];
  stats: { total: number; unlocked: number; percentage: number };
  loading: boolean;
  loadAchievements: () => Promise<void>;
  checkAndUnlock: () => Promise<string[]>;
  isUnlocked: (id: AchievementId) => boolean;
  getDefinition: (id: AchievementId) => AchievementDefinition | undefined;
}

export const useAchievementsStore = create<AchievementsState>((set, get) => ({
  definitions: [],
  unlocked: [],
  stats: { total: 0, unlocked: 0, percentage: 0 },
  loading: false,

  loadAchievements: async () => {
    set({ loading: true });
    try {
      const [definitions, unlocked, stats] = await Promise.all([
        achievementService.getDefinitions(),
        achievementService.getUnlocked(),
        achievementService.getStats(),
      ]);
      set({ definitions, unlocked, stats, loading: false });
    } catch (err) {
      console.error('[Achievements] Failed to load:', err);
      set({ loading: false });
    }
  },

  checkAndUnlock: async () => {
    const newlyUnlocked = await learningService.checkAndUnlockAchievements();
    if (newlyUnlocked.length > 0) {
      const unlocked = await achievementService.getUnlocked();
      const stats = await achievementService.getStats();
      set({ unlocked, stats });
    }
    return newlyUnlocked;
  },

  isUnlocked: (id) => {
    return get().unlocked.some(u => u.achievementId === id);
  },

  getDefinition: (id) => {
    return get().definitions.find(d => d.id === id);
  },
}));
