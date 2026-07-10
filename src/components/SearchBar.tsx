import React, { useState } from 'react';
import { Search } from 'lucide-react';
import './SearchBar.css';

export const SearchBar: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className={`search-bar ${isFocused ? 'search-bar-focused' : ''}`}>
      <Search className="search-icon" size={20} />
      <input
        type="text"
        className="search-input"
        placeholder="Search books, chapters or topics..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        aria-label="Search books, chapters or topics"
      />
      <div className="search-shortcut">
        <kbd>Ctrl</kbd>
        <kbd>K</kbd>
      </div>
    </div>
  );
};
