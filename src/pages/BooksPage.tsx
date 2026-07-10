import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { books, categories } from '../data/mockData';
import { SectionTitle } from '../components/ui/SectionTitle';
import { Badge } from '../components/ui/Badge';
import { Rating } from '../components/ui/Rating';
import { Button } from '../components/ui/Button';
import { Clock, BookOpen, Bookmark } from 'lucide-react';
import './BooksPage.css';

type DifficultyFilter = 'All' | 'Beginner' | 'Intermediate' | 'Advanced';
type SortOption = 'updatedAt' | 'rating' | 'readingTime' | 'difficulty';

const difficultyOrder: Record<string, number> = { Beginner: 1, Intermediate: 2, Advanced: 3 };

const getDifficultyVariant = (d: string): 'success' | 'warning' | 'danger' => {
  if (d === 'Beginner') return 'success';
  if (d === 'Intermediate') return 'warning';
  return 'danger';
};

export const BooksPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sortBy, setSortBy] = useState<SortOption>('updatedAt');
  const [showSortMenu, setShowSortMenu] = useState(false);

  const filteredBooks = useMemo(() => {
    let result = [...books];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.description.toLowerCase().includes(q) ||
          b.tags.some((t) => t.includes(q))
      );
    }

    if (difficultyFilter !== 'All') {
      result = result.filter((b) => b.difficulty === difficultyFilter);
    }

    if (categoryFilter !== 'All') {
      result = result.filter((b) => b.category === categoryFilter);
    }

    result.sort((a, b) => {
      if (sortBy === 'updatedAt') return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'readingTime') return parseInt(a.readingTime) - parseInt(b.readingTime);
      if (sortBy === 'difficulty') return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
      return 0;
    });

    return result;
  }, [searchQuery, difficultyFilter, categoryFilter, sortBy]);

  const sortLabels: Record<SortOption, string> = {
    updatedAt: 'Recently Updated',
    rating: 'Most Popular',
    readingTime: 'Reading Time',
    difficulty: 'Difficulty',
  };

  return (
    <div className="books-page">
      <div className="books-page-container">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <SectionTitle
            title="Browse Books"
            subtitle="Explore our collection of TypeScript books and start learning"
          />
        </motion.div>

        <motion.div
          className="books-toolbar"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="books-search">
            <Search size={18} className="books-search-icon" />
            <input
              type="text"
              className="books-search-input"
              placeholder="Search books..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search books"
            />
          </div>

          <div className="books-toolbar-actions">
            <div className="books-sort-wrapper">
              <button
                className="books-sort-btn"
                onClick={() => setShowSortMenu(!showSortMenu)}
                aria-label="Sort books"
              >
                <SlidersHorizontal size={16} />
                <span>{sortLabels[sortBy]}</span>
                <ChevronDown size={14} />
              </button>
              {showSortMenu && (
                <div className="books-sort-menu">
                  {(Object.keys(sortLabels) as SortOption[]).map((key) => (
                    <button
                      key={key}
                      className={`books-sort-option ${sortBy === key ? 'active' : ''}`}
                      onClick={() => {
                        setSortBy(key);
                        setShowSortMenu(false);
                      }}
                    >
                      {sortLabels[key]}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        <motion.div
          className="books-filters"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          <div className="books-filter-group">
            <span className="books-filter-label">Difficulty</span>
            <div className="books-filter-chips">
              {(['All', 'Beginner', 'Intermediate', 'Advanced'] as DifficultyFilter[]).map((d) => (
                <button
                  key={d}
                  className={`books-filter-chip ${difficultyFilter === d ? 'active' : ''}`}
                  onClick={() => setDifficultyFilter(d)}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="books-filter-group">
            <span className="books-filter-label">Category</span>
            <div className="books-filter-chips">
              <button
                className={`books-filter-chip ${categoryFilter === 'All' ? 'active' : ''}`}
                onClick={() => setCategoryFilter('All')}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  className={`books-filter-chip ${categoryFilter === cat.title ? 'active' : ''}`}
                  onClick={() => setCategoryFilter(cat.title)}
                >
                  {cat.title}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        <div className="books-count">
          <span>{filteredBooks.length} book{filteredBooks.length !== 1 ? 's' : ''} found</span>
        </div>

        <div className="books-grid">
          {filteredBooks.map((book, index) => (
            <motion.div
              key={book.id}
              className="book-list-card"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 * index }}
              whileHover={{ y: -4, boxShadow: 'var(--shadow-xl)' }}
            >
              <div className="book-list-cover">
                <span className="book-list-emoji">{book.cover}</span>
                <button className="book-list-bookmark" aria-label="Bookmark">
                  <Bookmark size={16} />
                </button>
              </div>
              <div className="book-list-content">
                <div className="book-list-tags">
                  <Badge variant={getDifficultyVariant(book.difficulty)}>
                    {book.difficulty}
                  </Badge>
                  <span className="book-list-category">{book.category}</span>
                </div>
                <h3 className="book-list-title">{book.title}</h3>
                <p className="book-list-description">{book.description}</p>
                <div className="book-list-meta">
                  <div className="book-list-stat">
                    <Clock size={14} />
                    <span>{book.readingTime}</span>
                  </div>
                  <div className="book-list-stat">
                    <BookOpen size={14} />
                    <span>{book.chapters.length} chapters</span>
                  </div>
                  <Rating value={book.rating} size="sm" />
                </div>
                <div className="book-list-actions">
                  <Button size="sm" onClick={() => window.location.href = `/books/${book.slug}`}>
                    {book.progress ? 'Continue Reading' : 'Start Reading'}
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredBooks.length === 0 && (
          <div className="books-empty">
            <p>No books found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};
