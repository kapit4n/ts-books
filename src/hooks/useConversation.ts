import { create } from 'zustand';
import { conversationService } from '../services/conversationService';
import { AIConversation, AIMessage } from '../types/ai';
import { generateId } from '../lib/utils';

interface ConversationState {
  conversations: AIConversation[];
  activeConversationId: string | null;
  messages: AIMessage[];
  loading: boolean;
  loadConversations: (bookId: string) => Promise<void>;
  createConversation: (bookId: string, title?: string) => Promise<AIConversation>;
  selectConversation: (id: string) => Promise<void>;
  removeConversation: (id: string) => Promise<void>;
  addMessage: (message: AIMessage) => Promise<void>;
  updateMessage: (id: string, updates: Partial<AIMessage>) => Promise<void>;
  clearMessages: () => void;
}

export const useConversationStore = create<ConversationState>((set, get) => ({
  conversations: [],
  activeConversationId: null,
  messages: [],
  loading: false,

  loadConversations: async (bookId) => {
    set({ loading: true });
    const conversations = await conversationService.getByBook(bookId);
    set({ conversations, loading: false });
  },

  createConversation: async (bookId, title) => {
    const now = new Date().toISOString();
    const conversation: AIConversation = {
      id: generateId(),
      bookId,
      title: title || `Chat ${new Date().toLocaleDateString()}`,
      createdAt: now,
      updatedAt: now,
      messageCount: 0,
      pinned: false,
      tags: [],
    };
    await conversationService.create(conversation);
    set({
      conversations: [conversation, ...get().conversations],
      activeConversationId: conversation.id,
      messages: [],
    });
    return conversation;
  },

  selectConversation: async (id) => {
    set({ activeConversationId: id, loading: true });
    const messages = await conversationService.getMessages(id);
    set({ messages, loading: false });
  },

  removeConversation: async (id) => {
    await conversationService.remove(id);
    const state = get();
    set({
      conversations: state.conversations.filter((c) => c.id !== id),
      activeConversationId: state.activeConversationId === id ? null : state.activeConversationId,
      messages: state.activeConversationId === id ? [] : state.messages,
    });
  },

  addMessage: async (message) => {
    await conversationService.addMessage(message);
    set({ messages: [...get().messages, message] });
  },

  updateMessage: async (id, updates) => {
    await conversationService.updateMessage(id, updates);
    set({
      messages: get().messages.map((m) => (m.id === id ? { ...m, ...updates } : m)),
    });
  },

  clearMessages: () => set({ messages: [] }),
}));
