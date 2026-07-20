import React from 'react';
import { motion } from 'framer-motion';
import {
  Highlighter, StickyNote, Bookmark, Star, Tag,
} from 'lucide-react';
import { useHighlightsStore } from '../../hooks/useHighlights';
import { useNotesStore } from '../../hooks/useNotes';
import { useStudyBookmarksStore } from '../../hooks/useStudyBookmarks';
import './StudySidebar.css';

type SidebarSection = 'highlights' | 'notes' | 'bookmarks' | 'favorites' | 'tags' | 'statistics';

interface StudySidebarProps {
  activeSection: SidebarSection;
  onSectionChange: (section: SidebarSection) => void;
  bookId: string;
}

export const StudySidebar: React.FC<StudySidebarProps> = ({
  activeSection,
  onSectionChange,
}) => {
  const { highlights } = useHighlightsStore();
  const { notes } = useNotesStore();
  const { bookmarks } = useStudyBookmarksStore();

  const favCount = highlights.filter((h) => h.favorite).length +
    notes.filter((n) => n.favorite).length +
    bookmarks.filter((b) => b.favorite).length;

  const allTags = new Set<string>();
  highlights.forEach((h) => h.tags.forEach((t) => allTags.add(t)));
  notes.forEach((n) => n.tags.forEach((t) => allTags.add(t)));
  bookmarks.forEach((b) => b.tags.forEach((t) => allTags.add(t)));

  const sections: Array<{
    id: SidebarSection;
    icon: React.ReactNode;
    label: string;
    count: number;
  }> = [
    { id: 'highlights', icon: <Highlighter size={18} />, label: 'Highlights', count: highlights.length },
    { id: 'notes', icon: <StickyNote size={18} />, label: 'Notes', count: notes.length },
    { id: 'bookmarks', icon: <Bookmark size={18} />, label: 'Bookmarks', count: bookmarks.length },
    { id: 'favorites', icon: <Star size={18} />, label: 'Favorites', count: favCount },
    { id: 'tags', icon: <Tag size={18} />, label: 'Tags', count: allTags.size },
  ];

  return (
    <nav className="study-sidebar" aria-label="Study workspace navigation">
      {sections.map((section) => (
        <motion.button
          key={section.id}
          className={`study-sidebar-item ${activeSection === section.id ? 'active' : ''}`}
          onClick={() => onSectionChange(section.id)}
          whileHover={{ x: 2 }}
          whileTap={{ scale: 0.98 }}
          aria-current={activeSection === section.id ? 'page' : undefined}
        >
          <span className="study-sidebar-icon">{section.icon}</span>
          <span className="study-sidebar-label">{section.label}</span>
          {section.count > 0 && (
            <span className="study-sidebar-count">{section.count}</span>
          )}
        </motion.button>
      ))}
    </nav>
  );
};
