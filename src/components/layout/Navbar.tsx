import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Search, Moon, Sun, Menu, X, Upload } from 'lucide-react';
import { GithubIcon } from '../ui/GithubIcon';
import './Navbar.css';

interface NavbarProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ isDarkMode, onToggleDarkMode }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`navbar ${isScrolled ? 'navbar-scrolled' : ''}`}>
      <div className="navbar-container">
        <div className="navbar-left">
          <a href="/" className="navbar-logo">
            <BookOpen className="navbar-logo-icon" />
            <span className="navbar-logo-text">ts-books</span>
          </a>
        </div>

        <div className="navbar-center">
          <a href="/books" className="navbar-link">Books</a>
          <a href="/library" className="navbar-link">Library</a>
          <a href="/#categories" className="navbar-link">Categories</a>
          <a href="/books" className="navbar-link">Explore</a>
          <a href="/features" className="navbar-link">Features</a>
        </div>

        <div className="navbar-right">
          <a href="/library/import" className="navbar-import-btn">
            <Upload size={16} />
            <span>Import PDF</span>
          </a>
          <button className="navbar-icon-btn" aria-label="Search">
            <Search size={20} />
          </button>
          <button
            className="navbar-icon-btn"
            onClick={onToggleDarkMode}
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="navbar-icon-btn"
            aria-label="GitHub"
          >
            <GithubIcon size={20} />
          </a>
          <button
            className="navbar-mobile-menu-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="navbar-mobile-menu"
          >
            <a href="/books" className="navbar-mobile-link">Books</a>
            <a href="/library" className="navbar-mobile-link">Library</a>
            <a href="/#categories" className="navbar-mobile-link">Categories</a>
            <a href="/books" className="navbar-mobile-link">Explore</a>
            <a href="/features" className="navbar-mobile-link">Features</a>
            <a href="/library/import" className="navbar-mobile-link navbar-mobile-import">
              <Upload size={16} />
              Import PDF
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
