import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ChevronLeft, BarChart3, Clock } from 'lucide-react';
import { useLibraryStore } from '../hooks/useLibrary';
import { ImportedBook } from '../types/library';
import { useHighlightsStore } from '../hooks/useHighlights';
import { useNotesStore } from '../hooks/useNotes';
import { useStudyBookmarksStore } from '../hooks/useStudyBookmarks';
import { useStudyWorkspaceStore } from '../hooks/useStudyWorkspace';
import { useSearchAnnotationsStore } from '../hooks/useSearchAnnotations';
import { Annotation } from '../types/study';
import { StudySidebar } from '../components/study/StudySidebar';
import { StudySearch, StudyFiltersBar } from '../components/study/StudySearch';
import { HighlightCard } from '../components/study/HighlightCard';
import { StudyPreview } from '../components/study/StudyPreview';
import { StatisticsCards } from '../components/study/StatisticsCards';
import { Timeline } from '../components/study/Timeline';
import './StudyWorkspacePage.css';

type SidebarSection = 'highlights' | 'notes' | 'bookmarks' | 'favorites' | 'tags' | 'statistics';

export const StudyWorkspacePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { books, ensureBookLoaded } = useLibraryStore();
  const [resolvedBook, setResolvedBook] = React.useState<ImportedBook | null>(null);
  const [bookLoading, setBookLoading] = useState(true);

  const book = books.find((b) => b.id === id) ?? resolvedBook;

  useEffect(() => {
    if (!id) { setBookLoading(false); return; }
    if (books.find((b) => b.id === id)) { setBookLoading(false); return; }
    ensureBookLoaded(id).then((b) => {
      setResolvedBook(b ?? null);
      setBookLoading(false);
    });
  }, [id, books, ensureBookLoaded]);

  const { highlights, loadHighlights, toggleFavorite: toggleHighlightFav, removeHighlight } = useHighlightsStore();
  const { notes, loadNotes, toggleFavorite: toggleNoteFav, removeNote } = useNotesStore();
  const { bookmarks, loadBookmarks, toggleFavorite: toggleBookmarkFav, removeBookmark } = useStudyBookmarksStore();
  const { statistics, activities, refreshAll } = useStudyWorkspaceStore();
  const { results, query, filters, search, applyFilters } = useSearchAnnotationsStore();

  const [activeSection, setActiveSection] = useState<SidebarSection>('highlights');
  const [selectedAnnotation, setSelectedAnnotation] = useState<Annotation | null>(null);

  // Load data
  useEffect(() => {
    if (id) {
      loadHighlights(id);
      loadNotes(id);
      loadBookmarks(id);
      refreshAll(id);
    }
  }, [id, loadHighlights, loadNotes, loadBookmarks, refreshAll]);

  // Build annotations list based on active section
  const sectionAnnotations: Annotation[] = useMemo(() => {
    if (query || filters.type || filters.color || filters.favorite || (filters.tags && filters.tags.length > 0)) {
      return results;
    }

    const highlightAnnotations: Annotation[] = highlights.map((h) => ({
      id: h.id, type: 'highlight' as const, bookId: h.bookId, page: h.page,
      title: h.selectedText.slice(0, 80), content: h.selectedText,
      color: h.color, createdAt: h.createdAt, updatedAt: h.updatedAt,
      favorite: h.favorite, tags: h.tags,
    }));

    const noteAnnotations: Annotation[] = notes.map((n) => ({
      id: n.id, type: 'note' as const, bookId: n.bookId, page: n.page,
      title: n.title, content: n.content,
      color: '#8b5cf6', createdAt: n.createdAt, updatedAt: n.updatedAt,
      favorite: n.favorite, tags: n.tags,
    }));

    const bookmarkAnnotations: Annotation[] = bookmarks.map((b) => ({
      id: b.id, type: 'bookmark' as const, bookId: b.bookId, page: b.page,
      title: b.title, content: b.description,
      color: b.color, createdAt: b.createdAt, updatedAt: b.createdAt,
      favorite: b.favorite, tags: b.tags,
    }));

    const allAnnotations = [...highlightAnnotations, ...noteAnnotations, ...bookmarkAnnotations];

    switch (activeSection) {
      case 'highlights': return highlightAnnotations;
      case 'notes': return noteAnnotations;
      case 'bookmarks': return bookmarkAnnotations;
      case 'favorites': return allAnnotations.filter((a) => a.favorite);
      case 'tags': return allAnnotations; // Tags section shows all, filtered by tag
      default: return allAnnotations;
    }
  }, [activeSection, highlights, notes, bookmarks, query, filters, results]);

  // Unique tags
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    highlights.forEach((h) => h.tags.forEach((t) => tagSet.add(t)));
    notes.forEach((n) => n.tags.forEach((t) => tagSet.add(t)));
    bookmarks.forEach((b) => b.tags.forEach((t) => tagSet.add(t)));
    return Array.from(tagSet).sort();
  }, [highlights, notes, bookmarks]);

  const handleSearch = useCallback(() => {
    if (!id) return;
    search(id);
  }, [id, search]);

  const handleApplyFilters = useCallback(() => {
    if (!id) return;
    applyFilters(id);
  }, [id, applyFilters]);

  const handleJumpToPage = useCallback((page: number) => {
    if (id) navigate(`/library/${id}/read?page=${page}`);
  }, [id, navigate]);

  const handleToggleFavorite = useCallback(async (annotationId: string) => {
    const h = highlights.find((x) => x.id === annotationId);
    if (h) { await toggleHighlightFav(annotationId); return; }
    const n = notes.find((x) => x.id === annotationId);
    if (n) { await toggleNoteFav(annotationId); return; }
    const b = bookmarks.find((x) => x.id === annotationId);
    if (b) { await toggleBookmarkFav(annotationId); }
  }, [highlights, notes, bookmarks, toggleHighlightFav, toggleNoteFav, toggleBookmarkFav]);

  const handleDelete = useCallback(async (annotationId: string) => {
    if (!window.confirm('Delete this annotation?')) return;
    const h = highlights.find((x) => x.id === annotationId);
    if (h) { await removeHighlight(annotationId); return; }
    const n = notes.find((x) => x.id === annotationId);
    if (n) { await removeNote(annotationId); return; }
    const b = bookmarks.find((x) => x.id === annotationId);
    if (b) { await removeBookmark(annotationId); }
    if (selectedAnnotation?.id === annotationId) setSelectedAnnotation(null);
  }, [highlights, notes, bookmarks, removeHighlight, removeNote, removeBookmark, selectedAnnotation]);

  if (bookLoading) {
    return (
      <div className="study-workspace-page">
        <div className="study-workspace-loading"><p>Loading...</p></div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="study-workspace-page">
        <div className="study-workspace-empty">
          <p>Book not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="study-workspace-page">
      {/* Header */}
      <header className="study-workspace-header">
        <button className="study-back-btn" onClick={() => navigate(`/library/${book.id}`)}>
          <ChevronLeft size={18} /> Back
        </button>
        <div className="study-header-info">
          <h1 className="study-header-title">{book.title}</h1>
          <span className="study-header-subtitle">Study Workspace</span>
        </div>
        <button
          className="study-read-btn"
          onClick={() => navigate(`/library/${book.id}/read`)}
        >
          Open Reader
        </button>
      </header>

      <div className="study-workspace-layout">
        {/* Left Sidebar */}
        <aside className="study-workspace-sidebar">
          <StudySidebar
            activeSection={activeSection}
            onSectionChange={setActiveSection}
            bookId={book.id}
          />
        </aside>

        {/* Main Area */}
        <main className="study-workspace-main">
          {activeSection === 'statistics' ? (
            <div className="study-workspace-section">
              <h2 className="study-section-title">
                <BarChart3 size={20} /> Statistics
              </h2>
              <StatisticsCards statistics={statistics} />
              <h2 className="study-section-title">
                <Clock size={20} /> Recent Activity
              </h2>
              <Timeline activities={activities} />
            </div>
          ) : activeSection === 'tags' ? (
            <div className="study-workspace-section">
              <h2 className="study-section-title">Tags</h2>
              <div className="study-tags-cloud">
                {allTags.length === 0 && <p className="pdf-empty-text">No tags yet.</p>}
                {allTags.map((tag) => {
                  const count = highlights.filter((h) => h.tags.includes(tag)).length +
                    notes.filter((n) => n.tags.includes(tag)).length +
                    bookmarks.filter((b) => b.tags.includes(tag)).length;
                  return (
                    <button
                      key={tag}
                      className="study-tag-pill"
                      onClick={() => {
                        const newFilters = { ...filters, tags: [tag] };
                        useSearchAnnotationsStore.getState().setFilters(newFilters);
                        if (id) applyFilters(id);
                      }}
                    >
                      {tag}
                      <span className="study-tag-count">{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <>
              <StudySearch onSearch={handleSearch} />
              <StudyFiltersBar onApply={handleApplyFilters} />
              <div className="study-results-header">
                <span className="study-results-count">
                  {sectionAnnotations.length} {activeSection}
                </span>
              </div>
              <div className="study-results">
                <AnimatePresence mode="popLayout">
                  {sectionAnnotations.map((annotation) => (
                    <HighlightCard
                      key={annotation.id}
                      annotation={annotation}
                      isSelected={selectedAnnotation?.id === annotation.id}
                      onSelect={setSelectedAnnotation}
                      onJumpToPage={handleJumpToPage}
                      onToggleFavorite={handleToggleFavorite}
                      onDelete={handleDelete}
                    />
                  ))}
                </AnimatePresence>
                {sectionAnnotations.length === 0 && (
                  <div className="study-results-empty">
                    <p>No {activeSection} found.</p>
                  </div>
                )}
              </div>
            </>
          )}
        </main>

        {/* Preview Panel */}
        <aside className="study-workspace-preview">
          <StudyPreview
            annotation={selectedAnnotation}
            onJumpToPage={handleJumpToPage}
            onClose={() => setSelectedAnnotation(null)}
            bookId={book.id}
          />
        </aside>
      </div>
    </div>
  );
};
