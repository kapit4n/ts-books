import React from 'react';
import { motion } from 'framer-motion';
import { Highlighter, StickyNote, Bookmark, Clock, BookOpen, BarChart3 } from 'lucide-react';
import { StudyStatistics } from '../../types/study';
import './StatisticsCards.css';

interface StatisticsCardsProps {
  statistics: StudyStatistics | null;
}

export const StatisticsCards: React.FC<StatisticsCardsProps> = ({ statistics }) => {
  if (!statistics) return null;

  const formatTime = (ms: number) => {
    const hours = Math.floor(ms / 3600000);
    const mins = Math.floor((ms % 3600000) / 60000);
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  const cards = [
    {
      icon: <Highlighter size={20} />,
      label: 'Highlights',
      value: statistics.totalHighlights,
      color: '#facc15',
    },
    {
      icon: <StickyNote size={20} />,
      label: 'Notes',
      value: statistics.totalNotes,
      color: '#8b5cf6',
    },
    {
      icon: <Bookmark size={20} />,
      label: 'Bookmarks',
      value: statistics.totalBookmarks,
      color: '#3b82f6',
    },
    {
      icon: <BookOpen size={20} />,
      label: 'Pages Read',
      value: statistics.totalPagesRead,
      color: '#22c55e',
    },
    {
      icon: <Clock size={20} />,
      label: 'Study Time',
      value: formatTime(statistics.totalStudyTimeMs),
      color: '#f97316',
    },
    {
      icon: <BarChart3 size={20} />,
      label: 'Progress',
      value: `${statistics.currentProgress}%`,
      color: '#ec4899',
    },
  ];

  return (
    <div className="stats-grid">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          className="stat-card"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
        >
          <div className="stat-card-icon" style={{ color: card.color }}>
            {card.icon}
          </div>
          <div className="stat-card-info">
            <span className="stat-card-value">{card.value}</span>
            <span className="stat-card-label">{card.label}</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
