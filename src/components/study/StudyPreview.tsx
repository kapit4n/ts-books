import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Edit3, ExternalLink, Star, Trash2 } from 'lucide-react';
import { Annotation, HIGHLIGHT_COLORS } from '../../types/study';
import { useHighlightsStore } from '../../hooks/useHighlights';
import { useNotesStore } from '../../hooks/useNotes';
import { useStudyBookmarksStore } from '../../hooks/useStudyBookmarks';
import './StudyPreview.css';

interface StudyPreviewProps {
  annotation: Annotation | null;
  onJumpToPage: (page: number) => void;
  onClose: () => void;
  bookId: string;
}

export const StudyPreview: React.FC<StudyPreviewProps> = ({
  annotation,
  onJumpToPage,
  onClose,
  bookId,
}) => {
  const { updateHighlight, toggleFavorite: toggleHighlightFav, removeHighlight, setHighlightTags } = useHighlightsStore();
  const { updateNote, toggleFavorite: toggleNoteFav, removeNote } = useNotesStore();
  const { updateBookmark, toggleFavorite: toggleBookmarkFav, removeBookmark, setBookmarkTags } = useStudyBookmarksStore();

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [tagInput, setTagInput] = useState('');

  const startEdit = useCallback(() => {
    if (!annotation) return;
    setEditTitle(annotation.title);
    setEditContent(annotation.content);
    setIsEditing(true);
  }, [annotation]);

  const saveEdit = useCallback(async () => {
    if (!annotation) return;
    if (annotation.type === 'highlight') {
      await updateHighlight(annotation.id, { selectedText: editContent });
    } else if (annotation.type === 'note') {
      await updateNote(annotation.id, { title: editTitle, content: editContent });
    } else if (annotation.type === 'bookmark') {
      await updateBookmark(annotation.id, { title: editTitle, description: editContent });
    }
    setIsEditing(false);
  }, [annotation, editTitle, editContent, updateHighlight, updateNote, updateBookmark]);

  const handleToggleFavorite = useCallback(async () => {
    if (!annotation) return;
    if (annotation.type === 'highlight') await toggleHighlightFav(annotation.id);
    else if (annotation.type === 'note') await toggleNoteFav(annotation.id);
    else if (annotation.type === 'bookmark') await toggleBookmarkFav(annotation.id);
  }, [annotation, toggleHighlightFav, toggleNoteFav, toggleBookmarkFav]);

  const handleDelete = useCallback(async () => {
    if (!annotation) return;
    if (!window.confirm('Delete this annotation?')) return;
    if (annotation.type === 'highlight') await removeHighlight(annotation.id);
    else if (annotation.type === 'note') await removeNote(annotation.id);
    else if (annotation.type === 'bookmark') await removeBookmark(annotation.id);
    onClose();
  }, [annotation, removeHighlight, removeNote, removeBookmark, onClose]);

  const handleAddTag = useCallback(async (e: React.KeyboardEvent) => {
    if (e.key !== 'Enter' || !tagInput.trim() || !annotation) return;
    const newTag = tagInput.trim().toLowerCase();
    const newTags = [...annotation.tags, newTag];
    if (annotation.type === 'highlight') await setHighlightTags(annotation.id, newTags);
    else if (annotation.type === 'note') await updateNote(annotation.id, { tags: newTags });
    else if (annotation.type === 'bookmark') await setBookmarkTags(annotation.id, newTags);
    setTagInput('');
  }, [tagInput, annotation, setHighlightTags, updateNote, setBookmarkTags]);

  const handleRemoveTag = useCallback(async (tag: string) => {
    if (!annotation) return;
    const newTags = annotation.tags.filter((t) => t !== tag);
    if (annotation.type === 'highlight') await setHighlightTags(annotation.id, newTags);
    else if (annotation.type === 'note') await updateNote(annotation.id, { tags: newTags });
    else if (annotation.type === 'bookmark') await setBookmarkTags(annotation.id, newTags);
  }, [annotation, setHighlightTags, updateNote, setBookmarkTags]);

  if (!annotation) {
    return (
      <div className="study-preview-empty">
        <p>Select an annotation to preview</p>
      </div>
    );
  }

  const colorValue = HIGHLIGHT_COLORS.find((c) => c.color === annotation.color)?.value || annotation.color;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={annotation.id}
        className="study-preview"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{ duration: 0.2 }}
      >
        <div className="study-preview-header">
          <div className="study-preview-type" style={{ color: colorValue }}>
            <span className="study-preview-type-dot" style={{ backgroundColor: colorValue }} />
            {annotation.type.charAt(0).toUpperCase() + annotation.type.slice(1)}
          </div>
          <div className="study-preview-header-actions">
            <button onClick={startEdit} className="preview-action-btn" title="Edit" aria-label="Edit">
              <Edit3 size={16} />
            </button>
            <button onClick={handleToggleFavorite} className={`preview-action-btn ${annotation.favorite ? 'favorited' : ''}`} title="Favorite" aria-label="Toggle favorite">
              <Star size={16} fill={annotation.favorite ? 'currentColor' : 'none'} />
            </button>
            {annotation.page && (
              <button onClick={() => onJumpToPage(annotation.page!)} className="preview-action-btn" title="Open in Reader" aria-label="Open in Reader">
                <ExternalLink size={16} />
              </button>
            )}
            <button onClick={handleDelete} className="preview-action-btn preview-delete" title="Delete" aria-label="Delete">
              <Trash2 size={16} />
            </button>
            <button onClick={onClose} className="preview-action-btn" title="Close" aria-label="Close preview">
              <X size={16} />
            </button>
          </div>
        </div>

        {isEditing ? (
          <div className="study-preview-edit">
            <input
              className="preview-edit-title"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Title"
              aria-label="Title"
            />
            <textarea
              className="preview-edit-content"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              placeholder="Content..."
              aria-label="Content"
            />
            <div className="preview-edit-actions">
              <button className="btn btn-primary btn-sm" onClick={saveEdit}>Save</button>
              <button className="btn btn-ghost btn-sm" onClick={() => setIsEditing(false)}>Cancel</button>
            </div>
          </div>
        ) : (
          <div className="study-preview-content">
            <h3 className="preview-title">{annotation.title}</h3>
            {annotation.content && annotation.content !== annotation.title && (
              <p className="preview-text">{annotation.content}</p>
            )}
          </div>
        )}

        <div className="study-preview-meta">
          {annotation.page && <span className="preview-meta-item">Page {annotation.page}</span>}
          <span className="preview-meta-item">Created {new Date(annotation.createdAt).toLocaleDateString()}</span>
        </div>

        <div className="study-preview-tags">
          <div className="preview-tags-list">
            {annotation.tags.map((tag) => (
              <span key={tag} className="preview-tag">
                {tag}
                <button onClick={() => handleRemoveTag(tag)} aria-label={`Remove tag ${tag}`}>&times;</button>
              </span>
            ))}
          </div>
          <input
            className="preview-tag-input"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleAddTag}
            placeholder="Add tag..."
            aria-label="Add tag"
          />
        </div>

        {annotation.page && (
          <button
            className="study-preview-jump"
            onClick={() => onJumpToPage(annotation.page!)}
          >
            <ExternalLink size={16} />
            Open in Reader (Page {annotation.page})
          </button>
        )}
      </motion.div>
    </AnimatePresence>
  );
};
