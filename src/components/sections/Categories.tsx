import React from 'react';
import { motion } from 'framer-motion';
import { SectionTitle } from '../ui/SectionTitle';
import { CategoryCard } from './CategoryCard';
import { categories } from '../../data/mockData';
import './Categories.css';

export const Categories: React.FC = () => {
  return (
    <section className="categories" id="categories">
      <div className="categories-container">
        <SectionTitle
          title="Explore Categories"
          subtitle="Browse books by topic and find what you want to learn"
        />
        <motion.div
          className="categories-grid"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </motion.div>
      </div>
    </section>
  );
};
