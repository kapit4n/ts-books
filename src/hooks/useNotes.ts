import { create } from 'zustand';
import { noteService } from '../services/noteService';
import { studyWorkspaceService } from '../services/studyWorkspaceService';
import { Note, StickyNote } from '../types/study';

interface NotesState {
  notes: Note[];
  stickyNotes: StickyNote[];
  loading: boolean;
  loadNotes: (bookId: string) => Promise<void>;
  addNote: (note: Note) => Promise<void>;
  updateNote: (id: string, updates: Partial<Note>) => Promise<void>;
  removeNote: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  setNoteTags: (id: string, tags: string[]) => Promise<void>;
  getByPage: (page: number) => Note[];
  loadStickyNotes: (bookId: string) => Promise<void>;
  addStickyNote: (sticky: StickyNote) => Promise<void>;
  updateStickyNote: (id: string, updates: Partial<StickyNote>) => Promise<void>;
  removeStickyNote: (id: string) => Promise<void>;
  getStickyByPage: (page: number) => StickyNote[];
}

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: [],
  stickyNotes: [],
  loading: false,

  loadNotes: async (bookId) => {
    set({ loading: true });
    const notes = await noteService.getByBook(bookId);
    set({ notes, loading: false });
  },

  addNote: async (note) => {
    await noteService.add(note);
    set({ notes: [...get().notes, note] });
    if (note.bookId) {
      await studyWorkspaceService.createActivity(
        note.bookId,
        'note',
        note.page ? `Added note "${note.title}" on page ${note.page}` : `Added note "${note.title}"`,
        note.page
      );
    }
  },

  updateNote: async (id, updates) => {
    await noteService.update(id, updates);
    set({
      notes: get().notes.map((n) =>
        n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n
      ),
    });
  },

  removeNote: async (id) => {
    await noteService.remove(id);
    set({ notes: get().notes.filter((n) => n.id !== id) });
  },

  toggleFavorite: async (id) => {
    const n = get().notes.find((x) => x.id === id);
    if (!n) return;
    const newFav = !n.favorite;
    await noteService.update(id, { favorite: newFav });
    set({
      notes: get().notes.map((x) => (x.id === id ? { ...x, favorite: newFav } : x)),
    });
  },

  setNoteTags: async (id, tags) => {
    await noteService.update(id, { tags });
    set({
      notes: get().notes.map((n) => (n.id === id ? { ...n, tags } : n)),
    });
  },

  getByPage: (page) => {
    return get().notes.filter((n) => n.page === page);
  },

  loadStickyNotes: async (bookId) => {
    const stickyNotes = await noteService.getStickyNotesByBook(bookId);
    set({ stickyNotes });
  },

  addStickyNote: async (sticky) => {
    await noteService.addStickyNote(sticky);
    set({ stickyNotes: [...get().stickyNotes, sticky] });
  },

  updateStickyNote: async (id, updates) => {
    await noteService.updateStickyNote(id, updates);
    set({
      stickyNotes: get().stickyNotes.map((s) =>
        s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s
      ),
    });
  },

  removeStickyNote: async (id) => {
    await noteService.removeStickyNote(id);
    set({ stickyNotes: get().stickyNotes.filter((s) => s.id !== id) });
  },

  getStickyByPage: (page) => {
    return get().stickyNotes.filter((s) => s.page === page);
  },
}));
