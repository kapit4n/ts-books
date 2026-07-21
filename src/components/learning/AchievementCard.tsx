import React from 'react';
import { motion } from 'framer-motion';
import { AchievementDefinition, UserAchievement } from '../../types/learning';

interface AchievementCardProps {
  definition: AchievementDefinition;
  userAchievement?: UserAchievement;
}

export const AchievementCard: React.FC<AchievementCardProps> = ({ definition, userAchievement }) => {
  const unlocked = !!userAchievement;

  return (
    <motion.div
      className={`achievement-card ${unlocked ? 'unlocked' : 'locked'}`}
      whileHover={{ scale: 1.03 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="achievement-icon-wrap">
        <span className="achievement-icon">{definition.icon}</span>
        {!unlocked && <div className="achievement-lock-overlay" />}
      </div>
      <div className="achievement-info">
        <h4 className="achievement-name">{definition.name}</h4>
        <p className="achievement-desc">{definition.description}</p>
        {unlocked && userAchievement && (
          <span className="achievement-date">Unlocked {new Date(userAchievement.unlockedAt).toLocaleDateString()}</span>
        )}
      </div>
    </motion.div>
  );
};
