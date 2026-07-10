import React from 'react';
import { motion } from 'framer-motion';
import './ProgressBar.css';

interface ProgressBarProps {
  progress: number;
  showLabel?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress, showLabel = false }) => {
  const getColor = () => {
    if (progress < 30) return 'progress-low';
    if (progress < 70) return 'progress-medium';
    return 'progress-high';
  };

  return (
    <div className="progress-container">
      <div className="progress-bar">
        <motion.div
          className={`progress-fill ${getColor()}`}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
      {showLabel && <span className="progress-label">{progress}%</span>}
    </div>
  );
};
