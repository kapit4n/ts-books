import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Play } from 'lucide-react';
import { Book, ReadingProgress, getReadingProgress, saveReadingProgress } from '../../data/mockData';
import { ProgressBar } from '../ui/ProgressBar';
import { Button } from '../ui/Button';
import './ProgressCard.css';

interface ProgressCardProps {
  book: Book;
  onContinue?: () => void;
}

export const ProgressCard: React.FC<ProgressCardProps> = ({ book, onContinue }) => {
  const [progress, setProgress] = useState<ReadingProgress | null>(null);

  useEffect(() => {
    const stored = getReadingProgress(book.id);
    if (stored) {
      setProgress(stored);
    } else {
      const completedIds = book.chapters.filter((c) => c.completed).map((c) => c.id);
      const percentage = Math.round((completedIds.length / book.chapters.length) * 100);
      const nextChapter = book.chapters.find((c) => !c.completed);
      const p: ReadingProgress = {
        bookId: book.id,
        currentChapterId: nextChapter?.id || null,
        completedChapters: completedIds,
        percentage,
        lastOpened: new Date().toISOString(),
      };
      saveReadingProgress(p);
      setProgress(p);
    }
  }, [book]);

  if (!progress || progress.percentage === 0) return null;

  const currentChapter = book.chapters.find((c) => c.id === progress.currentChapterId);
  const remainingCount = book.chapters.length - progress.completedChapters.length;

  return (
    <motion.div
      className="progress-card"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
    >
      <div className="progress-card-header">
        <h3 className="progress-card-title">Your Progress</h3>
        <span className="progress-card-percentage">{progress.percentage}% complete</span>
      </div>
      <ProgressBar progress={progress.percentage} showLabel />
      <div className="progress-card-details">
        <span className="progress-card-chapter">
          {currentChapter ? `Continue from Chapter ${currentChapter.order}: ${currentChapter.title}` : 'All chapters completed!'}
        </span>
        <div className="progress-card-remaining">
          <Clock size={14} />
          <span>{remainingCount} chapters remaining</span>
        </div>
      </div>
      {currentChapter && (
        <Button onClick={onContinue}>
          <Play size={16} />
          Continue Reading
        </Button>
      )}
    </motion.div>
  );
};
