import React from 'react';
import { motion } from 'framer-motion';
import { Play, Bookmark, Share2 } from 'lucide-react';
import { Button } from '../ui/Button';
import './BookActions.css';

interface BookActionsProps {
  hasProgress: boolean;
  onBookmark?: () => void;
  onShare?: () => void;
  onStartReading?: () => void;
}

export const BookActions: React.FC<BookActionsProps> = ({
  hasProgress,
  onBookmark,
  onShare,
  onStartReading,
}) => {
  return (
    <motion.div
      className="book-actions"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <Button size="lg" onClick={onStartReading}>
        <Play size={18} />
        {hasProgress ? 'Continue Reading' : 'Start Reading'}
      </Button>
      <Button variant="secondary" size="lg" onClick={onBookmark}>
        <Bookmark size={18} />
        Bookmark
      </Button>
      <Button variant="ghost" size="lg" onClick={onShare}>
        <Share2 size={18} />
        Share
      </Button>
    </motion.div>
  );
};
