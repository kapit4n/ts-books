import React, { useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { useSearchAnnotationsStore } from '../../hooks/useSearchAnnotations';
import { StudyFilter, HIGHLIGHT_COLORS } from '../../types/study';
import './StudyMain.css';

interface StudySearchProps {
  onSearch: () => void;
}

export const StudySearch: React.FC<StudySearchProps> = ({ onSearch }) => {
  const { query, setQuery, clearSearch } = useSearchAnnotationsStore();

  const handleQueryChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    onSearch();
  }, [setQuery, onSearch]);

  const handleClear = useCallback(() => {
    clearSearch();
    onSearch();
  }, [clearSearch, onSearch]);

  return (
    <div className="study-search">
      <div className="study-search-input-wrap">
        <Search size={16} className="study-search-icon" />
        <input
          className="study-search-input"
          type="text"
          value={query}
          onChange={handleQueryChange}
          placeholder="Search highlights, notes, bookmarks..."
          aria-label="Search annotations"
        />
        {query && (
          <button className="study-search-clear" onClick={handleClear} aria-label="Clear search">
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  );
};

interface StudyFiltersProps {
  onApply: () => void;
}

export const StudyFiltersBar: React.FC<StudyFiltersProps> = ({ onApply }) => {
  const { filters, setFilters } = useSearchAnnotationsStore();

  const updateFilter = useCallback((key: keyof StudyFilter, value: any) => {
    setFilters({ ...filters, [key]: value });
    onApply();
  }, [filters, setFilters, onApply]);

  return (
    <div className="study-filters">
      <div className="study-filter-group">
        <label className="study-filter-label">Type</label>
        <select
          className="study-filter-select"
          value={filters.type || ''}
          onChange={(e) => updateFilter('type', e.target.value || undefined)}
          aria-label="Filter by type"
        >
          <option value="">All</option>
          <option value="highlight">Highlights</option>
          <option value="note">Notes</option>
          <option value="bookmark">Bookmarks</option>
        </select>
      </div>

      <div className="study-filter-group">
        <label className="study-filter-label">Color</label>
        <select
          className="study-filter-select"
          value={filters.color || ''}
          onChange={(e) => updateFilter('color', e.target.value || undefined)}
          aria-label="Filter by color"
        >
          <option value="">All</option>
          {HIGHLIGHT_COLORS.map((c) => (
            <option key={c.color} value={c.color}>{c.label}</option>
          ))}
        </select>
      </div>

      <div className="study-filter-group">
        <label className="study-filter-label">
          <input
            type="checkbox"
            checked={filters.favorite || false}
            onChange={(e) => updateFilter('favorite', e.target.checked || undefined)}
            aria-label="Filter by favorites"
          />
          Favorites
        </label>
      </div>

      <div className="study-filter-group">
        <label className="study-filter-label">Sort</label>
        <select
          className="study-filter-select"
          value={filters.sortBy || 'createdAt'}
          onChange={(e) => updateFilter('sortBy', e.target.value)}
          aria-label="Sort by"
        >
          <option value="createdAt">Date Created</option>
          <option value="updatedAt">Recently Updated</option>
          <option value="page">Page Number</option>
        </select>
      </div>
    </div>
  );
};
