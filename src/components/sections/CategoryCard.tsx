import React from 'react';
import { motion } from 'framer-motion';
import { Code, Layers, FileCode, Puzzle, Wrench, Layout, Binary, TestTube } from 'lucide-react';
import { Category } from '../../data/mockData';
import './CategoryCard.css';

const iconMap: Record<string, React.ReactNode> = {
  Code: <Code size={24} />,
  Layers: <Layers size={24} />,
  FileCode: <FileCode size={24} />,
  Puzzle: <Puzzle size={24} />,
  Wrench: <Wrench size={24} />,
  Layout: <Layout size={24} />,
  Binary: <Binary size={24} />,
  TestTube: <TestTube size={24} />,
};

interface CategoryCardProps {
  category: Category;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  return (
    <motion.div
      className="category-card"
      whileHover={{ y: -4, boxShadow: 'var(--shadow-lg)' }}
      transition={{ duration: 0.2 }}
    >
      <div className="category-card-icon">
        {iconMap[category.icon] || <Code size={24} />}
      </div>
      <h3 className="category-card-title">{category.title}</h3>
      <p className="category-card-description">{category.description}</p>
      <span className="category-card-count">{category.bookCount} books</span>
    </motion.div>
  );
};
