import React from 'react';
import { motion } from 'framer-motion';
import { Play, Trash2, HelpCircle } from 'lucide-react';
import { Quiz } from '../../types/learning';

interface QuizCardProps {
  quiz: Quiz;
  onStart: () => void;
  onDelete: (id: string) => void;
}

const diffColor = (d: string) => {
  switch (d) { case 'easy': return '#22c55e'; case 'medium': return '#f59e0b'; case 'hard': return '#ef4444'; default: return '#94a3b8'; }
};

export const QuizCard: React.FC<QuizCardProps> = ({ quiz, onStart, onDelete }) => {
  return (
    <motion.div className="quiz-card-item" whileHover={{ scale: 1.01 }}>
      <div className="quiz-card-left">
        <div className="quiz-card-icon">
          <HelpCircle size={18} />
        </div>
        <div className="quiz-card-info">
          <span className="quiz-card-title">{quiz.title}</span>
          <span className="quiz-card-meta">
            {quiz.questions.length} questions
            {quiz.timeLimitMinutes && <> · {quiz.timeLimitMinutes} min</>}
          </span>
          <span className="quiz-card-difficulty" style={{ color: diffColor(quiz.difficulty) }}>
            {quiz.difficulty}
          </span>
        </div>
      </div>
      <div className="quiz-card-actions">
        <button className="learn-btn primary sm" onClick={onStart}>
          <Play size={14} /> Start
        </button>
        <button className="learn-btn ghost sm" onClick={() => onDelete(quiz.id)}>
          <Trash2 size={14} />
        </button>
      </div>
    </motion.div>
  );
};
