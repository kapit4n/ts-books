import React from 'react';
import { motion } from 'framer-motion';
import { Code, Zap } from 'lucide-react';
import { GithubIcon } from '../ui/GithubIcon';
import { SectionTitle } from '../ui/SectionTitle';
import './WhyTsBooks.css';

const features = [
  {
    icon: <Code size={32} />,
    title: 'Interactive Examples',
    description: 'Learn by building real examples.',
  },
  {
    icon: <Zap size={32} />,
    title: 'Modern TypeScript',
    description: 'Up-to-date language features.',
  },
  {
    icon: <GithubIcon size={32} />,
    title: 'Completely Open Source',
    description: 'Community driven learning.',
  },
];

export const WhyTsBooks: React.FC = () => {
  return (
    <section className="why-ts-books">
      <div className="why-ts-books-container">
        <SectionTitle
          title="Why ts-books?"
          subtitle="Everything you need to master TypeScript"
          alignment="center"
        />
        <motion.div
          className="why-ts-books-grid"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="why-ts-books-card"
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
            >
              <div className="why-ts-books-icon">
                {feature.icon}
              </div>
              <h3 className="why-ts-books-title">{feature.title}</h3>
              <p className="why-ts-books-description">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
