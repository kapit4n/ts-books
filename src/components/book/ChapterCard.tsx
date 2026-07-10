import React from 'react';
import { motion } from 'framer-motion';
import { Clock, ChevronRight, CheckCircle2, Circle } from 'lucide-react';
import { Chapter } from '../../data/mockData';
import { Badge } from '../ui/Badge';
import './ChapterCard.css';

interface ChapterCardProps {
  chapter: Chapter;
  isCurrent: boolean;
  onClick?: () => void;
}

const getDifficultyVariant = (d: string): 'success' | 'warning' | 'danger' => {
  if (d === 'Beginner') return 'success';
  if (d === 'Intermediate') return 'warning';
  return 'danger';
};

export const ChapterCard: React.FC<ChapterCardProps> = ({ chapter, isCurrent, onClick }) => {
  return (
    <motion.div
      className={`chapter-card ${chapter.completed ? 'chapter-completed' : ''} ${isCurrent ? 'chapter-current' : ''}`}
      whileHover={{ x: 4 }}
      transition={{ duration: 0.15 }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e: React.KeyboardEvent) => e.key === 'Enter' && onClick?.()}
      aria-label={`${chapter.completed ? 'Completed: ' : ''}Chapter ${chapter.order}: ${chapter.title}`}
    >
      <div className="chapter-card-status">
        {chapter.completed ? (
          <CheckCircle2 size={20} className="chapter-icon-completed" />
        ) : isCurrent ? (
          <div className="chapter-icon-current" />
        ) : (
          <Circle size={20} className="chapter-icon-pending" />
        )}
      </div>
      <div className="chapter-card-content">
        <div className="chapter-card-header">
          <span className="chapter-card-number">Chapter {chapter.order}</span>
          <Badge variant={getDifficultyVariant(chapter.difficulty)}>
            {chapter.difficulty}
          </Badge>
        </div>
        <h4 className="chapter-card-title">{chapter.title}</h4>
        <p className="chapter-card-description">{chapter.description}</p>
        <div className="chapter-card-footer">
          <div className="chapter-card-time">
            <Clock size={14} />
            <span>{chapter.estimatedTime}</span>
          </div>
          {chapter.completed && (
            <span className="chapter-card-completed-label">Completed</span>
          )}
        </div>
      </div>
      <ChevronRight size={18} className="chapter-card-arrow" />
    </motion.div>
  );
};
