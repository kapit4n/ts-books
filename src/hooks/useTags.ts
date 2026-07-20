import { create } from 'zustand';
import { tagService } from '../services/tagService';
import { Tag } from '../types/study';

interface TagsState {
  tags: Tag[];
  uniqueTagNames: string[];
  loading: boolean;
  loadTags: (bookId?: string) => Promise<void>;
  addTag: (tag: Tag) => Promise<void>;
  removeTag: (id: string) => Promise<void>;
  loadUniqueTags: (bookId?: string) => Promise<void>;
  searchTags: (query: string) => Promise<Tag[]>;
}

export const useTagsStore = create<TagsState>((set, get) => ({
  tags: [],
  uniqueTagNames: [],
  loading: false,

  loadTags: async (bookId) => {
    set({ loading: true });
    const tags = bookId ? await tagService.getByBook(bookId) : await tagService.getAll();
    set({ tags, loading: false });
  },

  addTag: async (tag) => {
    await tagService.add(tag);
    set({ tags: [...get().tags, tag] });
  },

  removeTag: async (id) => {
    await tagService.remove(id);
    set({ tags: get().tags.filter((t) => t.id !== id) });
  },

  loadUniqueTags: async (bookId) => {
    const names = bookId
      ? await tagService.getUniqueTagsForBook(bookId)
      : await tagService.getAllUniqueTagNames();
    set({ uniqueTagNames: names });
  },

  searchTags: async (query) => {
    return tagService.search(query);
  },
}));
