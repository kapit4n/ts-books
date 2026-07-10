import React from 'react';
import { motion } from 'framer-motion';
import { Book } from '../../data/mockData';
import { ProgressBar } from '../ui/ProgressBar';
import { Button } from '../ui/Button';
import { SectionTitle } from '../ui/SectionTitle';
import './ContinueReading.css';

interface ContinueReadingProps {
  book: Book;
}

export const ContinueReading: React.FC<ContinueReadingProps> = ({ book }) => {
  const progress = book.progress || 0;
  const totalChapters = book.chapters.length;
  const currentChapter = Math.ceil((progress / 100) * totalChapters);
  const remainingChapters = totalChapters - currentChapter;

  return (
    <section className="continue-reading">
      <div className="continue-reading-container">
        <SectionTitle
          title="Continue Reading"
          subtitle="Pick up where you left off"
        />
        <motion.div
          className="continue-reading-card"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="continue-reading-info">
            <h3 className="continue-reading-title">{book.title}</h3>
            <div className="continue-reading-meta">
              <span className="continue-reading-chapter">
                Chapter {currentChapter} of {totalChapters}
              </span>
              <span className="continue-reading-remaining">
                {remainingChapters} chapters remaining
              </span>
            </div>
            <ProgressBar progress={progress} showLabel />
          </div>
          <Button onClick={() => window.location.href = `/books/${book.slug}`}>Continue</Button>
        </motion.div>
      </div>
    </section>
  );
};
