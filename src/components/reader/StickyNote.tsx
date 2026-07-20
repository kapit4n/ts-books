import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { X, GripVertical, Edit3 } from 'lucide-react';
import { StickyNote as StickyNoteType } from '../../types/study';
import './StickyNote.css';

interface StickyNoteProps {
  sticky: StickyNoteType;
  onUpdate: (id: string, updates: Partial<StickyNoteType>) => void;
  onRemove: (id: string) => void;
}

const STICKY_COLORS = [
  { name: 'Yellow', value: '#fef3c7' },
  { name: 'Blue', value: '#dbeafe' },
  { name: 'Green', value: '#dcfce7' },
  { name: 'Pink', value: '#fce7f3' },
  { name: 'Orange', value: '#ffedd5' },
  { name: 'Purple', value: '#ede9fe' },
];

export const StickyNote: React.FC<StickyNoteProps> = ({ sticky, onUpdate, onRemove }) => {
  const [isEditing, setIsEditing] = useState(!sticky.content);
  const [content, setContent] = useState(sticky.content);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number; posX: number; posY: number } | null>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (isEditing) return;
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      posX: sticky.position.x,
      posY: sticky.position.y,
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragStartRef.current) return;
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      onUpdate(sticky.id, {
        position: {
          x: dragStartRef.current.posX + dx,
          y: dragStartRef.current.posY + dy,
        },
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      dragStartRef.current = null;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [isEditing, sticky.id, sticky.position, onUpdate]);

  const handleSave = useCallback(() => {
    onUpdate(sticky.id, { content });
    setIsEditing(false);
  }, [sticky.id, content, onUpdate]);

  if (sticky.collapsed) {
    return (
      <motion.div
        className="sticky-note-collapsed"
        style={{
          left: `${sticky.position.x}px`,
          top: `${sticky.position.y}px`,
          backgroundColor: sticky.color,
        }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        onClick={() => onUpdate(sticky.id, { collapsed: false })}
        role="button"
        tabIndex={0}
        aria-label="Expand sticky note"
      >
        <Edit3 size={14} />
      </motion.div>
    );
  }

  return (
    <motion.div
      className="sticky-note"
      style={{
        left: `${sticky.position.x}px`,
        top: `${sticky.position.y}px`,
        backgroundColor: sticky.color,
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      drag={false}
    >
      <div className="sticky-note-header" onMouseDown={handleMouseDown}>
        <GripVertical size={14} className="sticky-note-grip" />
        <div className="sticky-note-actions">
          <button
            className="sticky-note-btn"
            onClick={() => setIsEditing(!isEditing)}
            aria-label="Edit note"
          >
            <Edit3 size={12} />
          </button>
          <button
            className="sticky-note-btn"
            onClick={() => onUpdate(sticky.id, { collapsed: true })}
            aria-label="Collapse note"
          >
            &minus;
          </button>
          <button
            className="sticky-note-btn sticky-note-close"
            onClick={() => onRemove(sticky.id)}
            aria-label="Delete note"
          >
            <X size={12} />
          </button>
        </div>
      </div>

      <div className="sticky-note-body">
        {isEditing ? (
          <textarea
            className="sticky-note-textarea"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onBlur={handleSave}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSave();
              }
            }}
            autoFocus
            placeholder="Write a note..."
            aria-label="Note content"
          />
        ) : (
          <p className="sticky-note-content" onClick={() => setIsEditing(true)}>
            {content || 'Click to add a note...'}
          </p>
        )}
      </div>

      <div className="sticky-note-colors">
        {STICKY_COLORS.map((c) => (
          <button
            key={c.value}
            className={`sticky-color-dot ${sticky.color === c.value ? 'active' : ''}`}
            style={{ backgroundColor: c.value }}
            onClick={() => onUpdate(sticky.id, { color: c.value })}
            aria-label={`Color: ${c.name}`}
          />
        ))}
      </div>
    </motion.div>
  );
};
