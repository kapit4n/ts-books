import React, { useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Highlighter, StickyNote, Copy, Star } from 'lucide-react';
import { useReaderStore } from '../../hooks/useReader';
import { HIGHLIGHT_COLORS, HighlightColor } from '../../types/study';
import './HighlightToolbar.css';

interface HighlightToolbarProps {
  onHighlight: (color: HighlightColor) => void;
  onAddNote: () => void;
  onCopy: () => void;
  onFavorite: () => void;
}

export const HighlightToolbar: React.FC<HighlightToolbarProps> = ({
  onHighlight,
  onAddNote,
  onCopy,
  onFavorite,
}) => {
  const { selectionContext, showHighlightToolbar, activeHighlightColor, setShowHighlightToolbar, setSelectionContext, setActiveHighlightColor } = useReaderStore();
  const toolbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) {
        setShowHighlightToolbar(false);
        setSelectionContext(null);
        window.getSelection()?.removeAllRanges();
      }
    };
    if (showHighlightToolbar) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showHighlightToolbar, setShowHighlightToolbar, setSelectionContext]);

  const handleHighlight = useCallback((color: HighlightColor) => {
    setActiveHighlightColor(color);
    onHighlight(color);
  }, [onHighlight, setActiveHighlightColor]);

  if (!showHighlightToolbar || !selectionContext) return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={toolbarRef}
        className="highlight-toolbar"
        style={{
          left: `${selectionContext.position.x}px`,
          top: `${selectionContext.position.y}px`,
        }}
        initial={{ opacity: 0, scale: 0.9, y: 4 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 4 }}
        transition={{ duration: 0.15 }}
        role="toolbar"
        aria-label="Text selection actions"
      >
        <div className="highlight-toolbar-colors">
          {HIGHLIGHT_COLORS.map(({ color, label, value }) => (
            <button
              key={color}
              className={`highlight-color-btn ${activeHighlightColor === color ? 'active' : ''}`}
              style={{ backgroundColor: value }}
              onClick={() => handleHighlight(color)}
              aria-label={`Highlight in ${label}`}
              title={label}
            />
          ))}
        </div>

        <div className="highlight-toolbar-divider" />

        <button
          className="highlight-action-btn"
          onClick={onAddNote}
          aria-label="Add note"
          title="Add Note"
        >
          <StickyNote size={16} />
        </button>

        <button
          className="highlight-action-btn"
          onClick={onCopy}
          aria-label="Copy text"
          title="Copy"
        >
          <Copy size={16} />
        </button>

        <button
          className="highlight-action-btn"
          onClick={onFavorite}
          aria-label="Favorite"
          title="Favorite"
        >
          <Star size={16} />
        </button>
      </motion.div>
    </AnimatePresence>
  );
};
