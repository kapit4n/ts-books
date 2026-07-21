import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, CheckCircle, Clock, Play } from 'lucide-react';
import { ChapterProgress, ChapterStatus } from '../../types/learning';

interface ChapterProgressCardProps {
  chapter: ChapterProgress;
  onMark: (id: string, status: ChapterStatus) => void;
}

const statusConfig: Record<ChapterStatus, { icon: React.ReactNode; label: string; color: string }> = {
  'not-started': { icon: <BookOpen size={14} />, label: 'Not Started', color: '#94a3b8' },
  'reading': { icon: <Play size={14} />, label: 'Reading', color: '#3b82f6' },
  'practicing': { icon: <Clock size={14} />, label: 'Practicing', color: '#f59e0b' },
  'completed': { icon: <CheckCircle size={14} />, label: 'Completed', color: '#22c55e' },
};

export const ChapterProgressCard: React.FC<ChapterProgressCardProps> = ({ chapter, onMark }) => {
  const config = statusConfig[chapter.status];

  return (
    <motion.div
      className="chapter-progress-card"
      whileHover={{ scale: 1.01 }}
      layout
    >
      <div className="chapter-card-left">
        <div className="chapter-status-dot" style={{ backgroundColor: config.color }} />
        <div className="chapter-card-info">
          <span className="chapter-card-title">{chapter.chapterTitle}</span>
          <span className="chapter-card-page">Page {chapter.pageNumber}</span>
        </div>
      </div>
      <div className="chapter-card-right">
        <span className="chapter-status-badge" style={{ color: config.color }}>
          {config.icon} {config.label}
        </span>
        <div className="chapter-card-actions">
          {chapter.status !== 'completed' && (
            <button
              className="learn-btn ghost sm"
              onClick={() => onMark(chapter.id, 'completed')}
            >
              <CheckCircle size={12} /> Complete
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};
