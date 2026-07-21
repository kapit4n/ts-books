import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Award } from 'lucide-react';
import { useAchievementsStore } from '../../hooks/useAchievements';
import { AchievementCard } from './AchievementCard';

export const AchievementGrid: React.FC = () => {
  const { definitions, unlocked, stats, loading, loadAchievements } = useAchievementsStore();

  useEffect(() => {
    loadAchievements();
  }, [loadAchievements]);

  if (loading) return <p className="learn-loading">Loading achievements...</p>;

  return (
    <div className="achievement-grid">
      <div className="achievement-grid-header">
        <h3><Award size={20} /> Achievements</h3>
        <span className="achievement-progress">{stats.unlocked}/{stats.total} ({stats.percentage}%)</span>
      </div>
      <div className="achievement-progress-bar">
        <motion.div className="achievement-progress-fill" animate={{ width: `${stats.percentage}%` }} />
      </div>
      <div className="achievement-grid-list">
        {definitions.map(def => (
          <AchievementCard key={def.id} definition={def} userAchievement={unlocked.find(u => u.achievementId === def.id)} />
        ))}
      </div>
    </div>
  );
};
