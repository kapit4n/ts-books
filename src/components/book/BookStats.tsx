import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Clock, Code, BarChart3 } from 'lucide-react';
import { Book } from '../../data/mockData';
import './BookStats.css';

interface BookStatsProps {
  book: Book;
}

export const BookStats: React.FC<BookStatsProps> = ({ book }) => {
  const stats = [
    {
      icon: <BookOpen size={24} />,
      label: 'Lessons',
      value: book.chapters.length.toString(),
      description: 'Comprehensive chapters',
    },
    {
      icon: <Clock size={24} />,
      label: 'Hours',
      value: book.readingTime.replace(' hours', ''),
      description: 'Estimated reading time',
    },
    {
      icon: <Code size={24} />,
      label: 'Examples',
      value: (book.chapters.length * 3).toString(),
      description: 'Code examples included',
    },
    {
      icon: <BarChart3 size={24} />,
      label: 'Difficulty',
      value: book.difficulty,
      description: 'Skill level required',
    },
  ];

  return (
    <div className="book-stats">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          className="book-stat-card"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 * index }}
          whileHover={{ y: -3, boxShadow: 'var(--shadow-lg)' }}
        >
          <div className="book-stat-icon">{stat.icon}</div>
          <div className="book-stat-info">
            <span className="book-stat-value">{stat.value}</span>
            <span className="book-stat-label">{stat.label}</span>
          </div>
          <span className="book-stat-description">{stat.description}</span>
        </motion.div>
      ))}
    </div>
  );
};
