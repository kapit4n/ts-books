import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Layers, HelpCircle, Code, BookOpen, ArrowRight } from 'lucide-react';
import { useContinueLearningStore } from '../../hooks/useContinueLearning';
import { useLibraryStore } from '../../hooks/useLibrary';
import { CalendarEntryType } from '../../types/learning';

interface ContinueLearningProps {
  onNavigate: (bookId: string, activity: CalendarEntryType) => void;
}

const activityConfig: Record<CalendarEntryType, { icon: React.ReactNode; label: string; color: string }> = {
  reading: { icon: <BookOpen size={16} />, label: 'Reading', color: '#3b82f6' },
  flashcards: { icon: <Layers size={16} />, label: 'Flashcards', color: '#8b5cf6' },
  quiz: { icon: <HelpCircle size={16} />, label: 'Quiz', color: '#22c55e' },
  exercise: { icon: <Code size={16} />, label: 'Exercise', color: '#f59e0b' },
};

export const ContinueLearning: React.FC<ContinueLearningProps> = ({ onNavigate }) => {
  const { states, loadStates } = useContinueLearningStore();
  const { books, loadBooks } = useLibraryStore();

  useEffect(() => {
    loadStates();
    loadBooks();
  }, [loadStates, loadBooks]);

  if (states.length === 0) return null;

  const recentStates = [...states]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 5);

  return (
    <div className="continue-learning">
      <h3>Continue Learning</h3>
      <div className="continue-learning-list">
        {recentStates.map((state) => {
          const book = books.find(b => b.id === state.bookId);
          const config = activityConfig[state.lastActivity];
          if (!book) return null;
          return (
            <motion.button
              key={state.bookId}
              className="continue-learning-item"
              whileHover={{ scale: 1.01 }}
              onClick={() => onNavigate(state.bookId, state.lastActivity)}
            >
              <div className="continue-learning-icon" style={{ backgroundColor: `${config.color}20`, color: config.color }}>
                {config.icon}
              </div>
              <div className="continue-learning-info">
                <span className="continue-learning-title">{book.title}</span>
                <span className="continue-learning-activity">
                  Resume {config.label.toLowerCase()}
                  {state.lastChapterTitle && ` · ${state.lastChapterTitle}`}
                </span>
              </div>
              <ArrowRight size={16} className="continue-learning-arrow" />
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
