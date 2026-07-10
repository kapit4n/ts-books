import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { SearchBar } from '../SearchBar';
import './Hero.css';

const floatingCards = [
  { text: 'TypeScript', delay: 0 },
  { text: 'Generics', delay: 0.1 },
  { text: 'Interfaces', delay: 0.2 },
  { text: 'Utility Types', delay: 0.3 },
  { text: 'React', delay: 0.4 },
  { text: 'Node', delay: 0.5 },
];

export const Hero: React.FC = () => {
  return (
    <section className="hero">
      <div className="hero-container">
        <div className="hero-content">
          <motion.div
            className="hero-text"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="hero-title">
              Learn TypeScript by Reading and Building
            </h1>
            <p className="hero-subtitle">
              Master TypeScript through interactive books and hands-on projects.
              From fundamentals to advanced patterns, level up your skills.
            </p>
            <div className="hero-buttons">
              <Button size="lg" onClick={() => window.location.href = '/books'}>Start Learning</Button>
              <Button variant="secondary" size="lg" onClick={() => window.location.href = '/books'}>Browse Books</Button>
            </div>
          </motion.div>

          <motion.div
            className="hero-illustration"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="floating-cards">
              {floatingCards.map((card, index) => (
                <motion.div
                  key={card.text}
                  className="floating-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: card.delay }}
                  whileHover={{ scale: 1.05, y: -5 }}
                >
                  <span className="floating-card-text">{card.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div
          className="hero-search"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <SearchBar />
        </motion.div>
      </div>
    </section>
  );
};
