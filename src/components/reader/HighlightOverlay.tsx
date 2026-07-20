import React, { useCallback } from 'react';
import { motion } from 'framer-motion';
import { Highlight } from '../../types/study';
import { HIGHLIGHT_COLORS } from '../../types/study';
import './HighlightOverlay.css';

interface HighlightOverlayProps {
  highlights: Highlight[];
  pageWidth: number;
  pageHeight: number;
  zoom: number;
  onHighlightClick?: (highlight: Highlight) => void;
}

export const HighlightOverlay: React.FC<HighlightOverlayProps> = ({
  highlights,
  pageWidth,
  pageHeight,
  zoom,
  onHighlightClick,
}) => {
  const getColorValue = useCallback((color: string) => {
    const found = HIGHLIGHT_COLORS.find((c) => c.color === color);
    return found ? found.value : '#facc15';
  }, []);

  if (highlights.length === 0) return null;

  return (
    <div className="highlight-overlay-container" aria-label="Highlights">
      {highlights.map((highlight) => (
        <motion.div
          key={highlight.id}
          className="highlight-overlay-group"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          {highlight.positionRects.map((rect, idx) => (
            <div
              key={idx}
              className="highlight-overlay"
              style={{
                left: `${rect.left}%`,
                top: `${rect.top}%`,
                width: `${rect.width}%`,
                height: `${rect.height}%`,
                backgroundColor: getColorValue(highlight.color),
              }}
              onClick={() => onHighlightClick?.(highlight)}
              title={highlight.selectedText.slice(0, 100)}
              role="button"
              tabIndex={0}
              aria-label={`Highlight: ${highlight.selectedText.slice(0, 50)}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onHighlightClick?.(highlight);
              }}
            />
          ))}
        </motion.div>
      ))}
    </div>
  );
};
