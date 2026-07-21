import React from 'react';
import { BookOpen, Layers, HelpCircle, Code, Award, Flame, Clock, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { GlobalLearningStats } from '../../types/learning';

interface ProgressOverviewProps {
  stats: GlobalLearningStats;
}

export const ProgressOverview: React.FC<ProgressOverviewProps> = ({ stats }) => {
  const formatTime = (ms: number) => {
    const hours = Math.floor(ms / 3600000);
    const mins = Math.floor((ms % 3600000) / 60000);
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const cards = [
    { icon: <BookOpen size={20} />, label: 'Books Studied', value: stats.totalBooksStudied, color: '#3b82f6' },
    { icon: <Layers size={20} />, label: 'Flashcards', value: `${stats.masteredFlashcards}/${stats.totalFlashcards}`, color: '#8b5cf6' },
    { icon: <HelpCircle size={20} />, label: 'Quizzes Passed', value: `${stats.quizzesPassed}/${stats.totalQuizzes}`, color: '#22c55e' },
    { icon: <Code size={20} />, label: 'Exercises Done', value: `${stats.exercisesCompleted}/${stats.totalExercises}`, color: '#f59e0b' },
    { icon: <Flame size={20} />, label: 'Current Streak', value: `${stats.currentStreak} days`, color: '#ef4444' },
    { icon: <Clock size={20} />, label: 'Study Time', value: formatTime(stats.totalStudyTimeMs), color: '#06b6d4' },
    { icon: <Award size={20} />, label: 'Achievements', value: stats.achievementsUnlocked, color: '#ec4899' },
    { icon: <TrendingUp size={20} />, label: 'Learning Score', value: stats.learningScore, color: '#10b981' },
  ];

  return (
    <div className="progress-overview">
      <h3>Progress Overview</h3>
      <div className="progress-cards-grid">
        {cards.map((card, i) => (
          <motion.div key={card.label} className="progress-stat-card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <div className="progress-stat-icon" style={{ backgroundColor: `${card.color}20`, color: card.color }}>{card.icon}</div>
            <div className="progress-stat-value">{card.value}</div>
            <div className="progress-stat-label">{card.label}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
