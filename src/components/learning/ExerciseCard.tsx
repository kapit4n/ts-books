import React from 'react';
import { motion } from 'framer-motion';
import { Check, ArrowRight } from 'lucide-react';
import { Exercise } from '../../types/learning';

interface ExerciseCardProps {
  exercise: Exercise;
  onSelect: (exercise: Exercise) => void;
}

const diffColor = (d: string) => {
  switch (d) { case 'beginner': return '#22c55e'; case 'intermediate': return '#f59e0b'; case 'advanced': return '#ef4444'; default: return '#94a3b8'; }
};

const langIcon = (l: string) => {
  switch (l) { case 'typescript': return 'TS'; case 'javascript': return 'JS'; case 'python': return 'PY'; default: return '??'; }
};

export const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise, onSelect }) => {
  return (
    <motion.div className="exercise-card" whileHover={{ scale: 1.01 }} onClick={() => onSelect(exercise)}>
      <div className="exercise-card-left">
        <div className="exercise-lang-badge" style={{ backgroundColor: diffColor(exercise.difficulty) }}>{langIcon(exercise.language)}</div>
        <div className="exercise-card-info">
          <h4 className="exercise-card-title">{exercise.title}</h4>
          <p className="exercise-card-desc">{exercise.description.slice(0, 100)}{exercise.description.length > 100 ? '...' : ''}</p>
          <div className="exercise-card-meta">
            <span className="exercise-difficulty" style={{ color: diffColor(exercise.difficulty) }}>{exercise.difficulty}</span>
            {exercise.chapterTitle && <span className="exercise-chapter">{exercise.chapterTitle}</span>}
          </div>
        </div>
      </div>
      <div className="exercise-card-right">
        <span className={`exercise-status-badge status-${exercise.status}`}>
          {exercise.status === 'completed' ? <Check size={12} /> : <ArrowRight size={12} />}
          {exercise.status}
        </span>
      </div>
    </motion.div>
  );
};
