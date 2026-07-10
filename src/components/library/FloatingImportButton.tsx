import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Upload } from 'lucide-react';
import './FloatingImportButton.css';

export const FloatingImportButton: React.FC = () => {
  const navigate = useNavigate();

  return (
    <motion.button
      className="fab-import"
      onClick={() => navigate('/library/import')}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.3 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      aria-label="Import PDF"
    >
      <Upload size={24} />
    </motion.button>
  );
};
