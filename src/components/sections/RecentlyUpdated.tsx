import React from 'react';
import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';
import { Book } from '../../data/mockData';
import { Badge } from '../ui/Badge';
import { SectionTitle } from '../ui/SectionTitle';
import './RecentlyUpdated.css';

interface RecentlyUpdatedProps {
  books: Book[];
}

export const RecentlyUpdated: React.FC<RecentlyUpdatedProps> = ({ books }) => {
  return (
    <section className="recently-updated">
      <div className="recently-updated-container">
        <SectionTitle
          title="Recently Updated"
          subtitle="Latest additions and updates to our library"
        />
        <motion.div
          className="recently-updated-list"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {books.map((book) => (
            <div key={book.id} className="recently-updated-card">
              <div className="recently-updated-date">
                <Calendar size={16} />
                <span>{book.updatedAt}</span>
              </div>
              <div className="recently-updated-content">
                <h4 className="recently-updated-title">{book.title}</h4>
                <p className="recently-updated-description">{book.description}</p>
              </div>
              <Badge variant="primary">{book.category}</Badge>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
