import React from 'react';
import { motion } from 'framer-motion';
import { Chapter } from '../../data/mockData';
import { ChapterCard } from './ChapterCard';
import './ChapterList.css';

interface ChapterListProps {
  chapters: Chapter[];
  currentChapterId: string | null;
  onChapterClick?: (chapter: Chapter) => void;
}

export const ChapterList: React.FC<ChapterListProps> = ({
  chapters,
  currentChapterId,
  onChapterClick,
}) => {
  return (
    <motion.div
      className="chapter-list"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <h3 className="chapter-list-title">Table of Contents</h3>
      <div className="chapter-list-items">
        {chapters.map((chapter) => (
          <ChapterCard
            key={chapter.id}
            chapter={chapter}
            isCurrent={chapter.id === currentChapterId}
            onClick={() => onChapterClick?.(chapter)}
          />
        ))}
      </div>
    </motion.div>
  );
};
