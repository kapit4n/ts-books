import React from 'react';
import { motion } from 'framer-motion';
import { Layers, HelpCircle, Code, Flame, TrendingUp, BookOpen } from 'lucide-react';
import { LearningStats } from '../../types/learning';

interface LearningStatsCardsProps {
  stats: LearningStats;
}

export const LearningStatsCards: React.FC<LearningStatsCardsProps> = ({ stats }) => {
  const cards = [
    {
      icon: <Layers size={18} />,
      label: 'Flashcards',
      value: stats.masteredFlashcards,
      sub: `of ${stats.totalFlashcards}`,
      color: '#8b5cf6',
      progress: stats.totalFlashcards > 0 ? (stats.masteredFlashcards / stats.totalFlashcards) * 100 : 0,
    },
    {
      icon: <HelpCircle size={18} />,
      label: 'Quizzes Passed',
      value: stats.quizzesPassed,
      sub: `of ${stats.totalQuizzes}`,
      color: '#22c55e',
      progress: stats.totalQuizzes > 0 ? (stats.quizzesPassed / stats.totalQuizzes) * 100 : 0,
    },
    {
      icon: <Code size={18} />,
      label: 'Exercises',
      value: stats.exercisesCompleted,
      sub: `of ${stats.totalExercises}`,
      color: '#f59e0b',
      progress: stats.totalExercises > 0 ? (stats.exercisesCompleted / stats.totalExercises) * 100 : 0,
    },
    {
      icon: <Flame size={18} />,
      label: 'Streak',
      value: `${stats.currentStreak}`,
      sub: `Best: ${stats.longestStreak}`,
      color: '#ef4444',
      progress: Math.min((stats.currentStreak / 30) * 100, 100),
    },
    {
      icon: <BookOpen size={18} />,
      label: 'Chapters',
      value: stats.learningScore,
      sub: 'learning score',
      color: '#3b82f6',
      progress: Math.min(stats.learningScore, 100),
    },
    {
      icon: <TrendingUp size={18} />,
      label: 'Score',
      value: stats.learningScore,
      sub: 'points',
      color: '#10b981',
      progress: Math.min(stats.learningScore, 100),
    },
  ];

  return (
    <div className="learning-stats-cards">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          className="learning-stat-card"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
        >
          <div className="learning-stat-icon" style={{ backgroundColor: `${card.color}20`, color: card.color }}>
            {card.icon}
          </div>
          <div className="learning-stat-content">
            <div className="learning-stat-value">
              {card.value}<span className="learning-stat-sub">{card.sub}</span>
            </div>
            <div className="learning-stat-label">{card.label}</div>
          </div>
          <div className="learning-stat-progress">
            <div className="learning-stat-progress-bar">
              <motion.div
                className="learning-stat-progress-fill"
                style={{ backgroundColor: card.color }}
                initial={{ width: 0 }}
                animate={{ width: `${card.progress}%` }}
                transition={{ duration: 0.6, delay: i * 0.05 }}
              />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
