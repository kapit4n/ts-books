import React from 'react';
import { motion } from 'framer-motion';
import { Highlighter, StickyNote, Bookmark, Star, ExternalLink, Edit3, Trash2 } from 'lucide-react';
import { Annotation, HighlightColor } from '../../types/study';
import { HIGHLIGHT_COLORS } from '../../types/study';
import './CardStyles.css';

interface HighlightCardProps {
  annotation: Annotation;
  isSelected: boolean;
  onSelect: (a: Annotation) => void;
  onJumpToPage: (page: number) => void;
  onToggleFavorite: (id: string) => void;
  onDelete: (id: string) => void;
}

const typeIcon = (type: string) => {
  switch (type) {
    case 'highlight': return <Highlighter size={14} />;
    case 'note': return <StickyNote size={14} />;
    case 'bookmark': return <Bookmark size={14} />;
    default: return null;
  }
};

const typeLabel = (type: string) => {
  switch (type) {
    case 'highlight': return 'Highlight';
    case 'note': return 'Note';
    case 'bookmark': return 'Bookmark';
    default: return '';
  }
};

const getColorValue = (color: string): string => {
  const found = HIGHLIGHT_COLORS.find((c) => c.color === color);
  return found ? found.value : color;
};

export const HighlightCard: React.FC<HighlightCardProps> = ({
  annotation,
  isSelected,
  onSelect,
  onJumpToPage,
  onToggleFavorite,
  onDelete,
}) => {
  return (
    <motion.div
      className={`annotation-card ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelect(annotation)}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      layout
      role="button"
      tabIndex={0}
      aria-label={`${typeLabel(annotation.type)}: ${annotation.title}`}
      onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter') onSelect(annotation); }}
    >
      <div className="annotation-card-header">
        <span className="annotation-card-type" style={{ color: annotation.color }}>
          {typeIcon(annotation.type)}
          <span>{typeLabel(annotation.type)}</span>
        </span>
        {annotation.page && (
          <span className="annotation-card-page">p. {annotation.page}</span>
        )}
      </div>

      <div className="annotation-card-body">
        <div className="annotation-card-color-bar" style={{ backgroundColor: getColorValue(annotation.color) }} />
        <div className="annotation-card-content">
          <h4 className="annotation-card-title">{annotation.title}</h4>
          {annotation.content && annotation.content !== annotation.title && (
            <p className="annotation-card-text">{annotation.content.slice(0, 120)}{annotation.content.length > 120 ? '...' : ''}</p>
          )}
        </div>
      </div>

      <div className="annotation-card-footer">
        <div className="annotation-card-tags">
          {annotation.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="annotation-tag">{tag}</span>
          ))}
          {annotation.tags.length > 3 && (
            <span className="annotation-tag annotation-tag-more">+{annotation.tags.length - 3}</span>
          )}
        </div>
        <div className="annotation-card-actions">
          {annotation.page && (
            <button
              className="annotation-action-btn"
              onClick={(e) => { e.stopPropagation(); onJumpToPage(annotation.page!); }}
              title="Open in Reader"
              aria-label="Open in Reader"
            >
              <ExternalLink size={14} />
            </button>
          )}
          <button
            className={`annotation-action-btn ${annotation.favorite ? 'favorited' : ''}`}
            onClick={(e) => { e.stopPropagation(); onToggleFavorite(annotation.id); }}
            title={annotation.favorite ? 'Remove from favorites' : 'Add to favorites'}
            aria-label={annotation.favorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Star size={14} fill={annotation.favorite ? 'currentColor' : 'none'} />
          </button>
          <button
            className="annotation-action-btn annotation-delete"
            onClick={(e) => { e.stopPropagation(); onDelete(annotation.id); }}
            title="Delete"
            aria-label="Delete"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
