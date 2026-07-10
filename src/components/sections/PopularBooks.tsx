import React from 'react';
import { motion } from 'framer-motion';
import { SectionTitle } from '../ui/SectionTitle';
import { BookCard } from './BookCard';
import { popularBooks } from '../../data/mockData';
import './PopularBooks.css';

export const PopularBooks: React.FC = () => {
  return (
    <section className="popular-books" id="books">
      <div className="popular-books-container">
        <SectionTitle
          title="Popular Books"
          subtitle="Most read books by the community"
        />
        <motion.div
          className="popular-books-grid"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {popularBooks.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </motion.div>
      </div>
    </section>
  );
};
