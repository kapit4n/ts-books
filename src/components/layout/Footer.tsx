import React from 'react';
import { BookOpen } from 'lucide-react';
import { GithubIcon } from '../ui/GithubIcon';
import './Footer.css';

export const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-brand">
            <a href="/" className="footer-logo">
              <BookOpen size={24} />
              <span>ts-books</span>
            </a>
            <p className="footer-description">
              Learn TypeScript through interactive books and hands-on projects.
            </p>
          </div>
          <div className="footer-links">
            <div className="footer-links-group">
              <h4 className="footer-links-title">Navigation</h4>
              <a href="#books" className="footer-link">Books</a>
              <a href="#categories" className="footer-link">Categories</a>
              <a href="#explore" className="footer-link">Explore</a>
            </div>
            <div className="footer-links-group">
              <h4 className="footer-links-title">Legal</h4>
              <a href="#license" className="footer-link">License</a>
              <a href="#privacy" className="footer-link">Privacy</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p className="footer-copyright">
            © {new Date().getFullYear()} ts-books. All rights reserved.
          </p>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-github"
            aria-label="GitHub"
          >
            <GithubIcon size={20} />
          </a>
        </div>
      </div>
    </footer>
  );
};
