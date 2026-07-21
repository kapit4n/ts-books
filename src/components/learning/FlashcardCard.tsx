import React from 'react';
import { motion } from 'framer-motion';
import { Trash2, Edit3 } from 'lucide-react';
import { Flashcard } from '../../types/learning';

interface FlashcardCardProps {
  card: Flashcard;
  onEdit?: (card: Flashcard) => void;
  onDelete?: (id: string) => void;
  compact?: boolean;
}

const difficultyColor = (d: string) => {
  switch (d) {
    case 'easy':
      return '#22c55e';
    case 'medium':
      return '#f59e0b';
    case 'hard':
      return '#ef4444';
    default:
      return '#94a3b8';
  }
};

const statusLabel = (s: string) => {
  switch (s) {
    case 'new':
      return 'New';
    case 'learning':
      return 'Learning';
    case 'reviewing':
      return 'Reviewing';
    case 'mastered':
      return 'Mastered';
    default:
      return s;
  }
};

export const FlashcardCard: React.FC<FlashcardCardProps> = ({
  card,
  onEdit,
  onDelete,
  compact,
}) => {
  return (
    <motion.div
      className={`flashcard-card-item ${compact ? 'compact' : ''}`}
      whileHover={{ scale: 1.01 }}
      layout
    >
      <div className="flashcard-card-header">
        <span
          className="flashcard-difficulty"
          style={{ color: difficultyColor(card.difficulty) }}
        >
          {card.difficulty}
        </span>
        <span className={`flashcard-status status-${card.status}`}>
          {statusLabel(card.status)}
        </span>
        <div className="flashcard-card-actions">
          {onEdit && (
            <button
              onClick={() => onEdit(card)}
              className="flashcard-action-btn"
            >
              <Edit3 size={14} />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(card.id)}
              className="flashcard-action-btn delete"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>
      <div className="flashcard-card-question">{card.question}</div>
      {!compact && (
        <div className="flashcard-card-answer">{card.answer}</div>
      )}
      <div className="flashcard-card-meta">
        {card.category && (
          <span className="flashcard-category">{card.category}</span>
        )}
        {card.tags.slice(0, 3).map((t) => (
          <span key={t} className="flashcard-tag">
            {t}
          </span>
        ))}
        {card.streak > 0 && (
          <span className="flashcard-streak">🔥 {card.streak}</span>
        )}
      </div>
    </motion.div>
  );
};
