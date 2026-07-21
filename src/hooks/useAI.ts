import { create } from 'zustand';
import { callAI, getAISettings } from '../services/aiProvider';
import { buildSystemPrompt } from '../services/promptBuilder';
import { AIRequestOptions, AIMessage, AISettings } from '../types/ai';
import { generateId } from '../lib/utils';

interface AIState {
  isGenerating: boolean;
  streamingContent: string;
  error: string | null;
  abortController: AbortController | null;
  settings: AISettings;
  sendMessage: (
    messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
    options?: Partial<AIRequestOptions>
  ) => Promise<AIMessage>;
  sendMessageStream: (
    messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
    onUpdate: (content: string) => void,
    options?: Partial<AIRequestOptions>
  ) => Promise<AIMessage>;
  cancelGeneration: () => void;
  updateSettings: (updates: Partial<AISettings>) => void;
}

export const useAIStore = create<AIState>((set, get) => ({
  isGenerating: false,
  streamingContent: '',
  error: null,
  abortController: null,
  settings: getAISettings(),

  sendMessage: async (messages, options) => {
    set({ isGenerating: true, error: null });
    const controller = new AbortController();
    set({ abortController: controller });

    try {
      const fullMessages = [
        { role: 'system' as const, content: buildSystemPrompt() },
        ...messages,
      ];

      const result = await callAI({
        messages: fullMessages,
        stream: false,
        signal: controller.signal,
        ...options,
      });

      const msg: AIMessage = {
        id: generateId(),
        conversationId: '',
        role: 'assistant',
        content: result.content,
        timestamp: new Date().toISOString(),
        model: result.model,
        provider: result.provider,
        tokenUsage: result.tokenUsage,
      };

      set({ isGenerating: false, abortController: null });
      return msg;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to generate response';
      set({ isGenerating: false, abortController: null, error: message });
      throw err;
    }
  },

  sendMessageStream: async (messages, onUpdate, options) => {
    set({ isGenerating: true, streamingContent: '', error: null });
    const controller = new AbortController();
    set({ abortController: controller });

    let accumulated = '';

    try {
      const fullMessages = [
        { role: 'system' as const, content: buildSystemPrompt() },
        ...messages,
      ];

      const result = await callAI({
        messages: fullMessages,
        stream: true,
        signal: controller.signal,
        onChunk: (chunk) => {
          accumulated += chunk.content;
          set({ streamingContent: accumulated });
          onUpdate(accumulated);
        },
        ...options,
      });

      const msg: AIMessage = {
        id: generateId(),
        conversationId: '',
        role: 'assistant',
        content: result.content,
        timestamp: new Date().toISOString(),
        model: result.model,
        provider: result.provider,
        tokenUsage: result.tokenUsage,
      };

      set({ isGenerating: false, streamingContent: '', abortController: null });
      return msg;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to generate response';
      set({ isGenerating: false, streamingContent: '', abortController: null, error: message });
      throw err;
    }
  },

  cancelGeneration: () => {
    const { abortController } = get();
    if (abortController) {
      abortController.abort();
      set({ isGenerating: false, abortController: null, streamingContent: '' });
    }
  },

  updateSettings: (updates) => {
    const current = get().settings;
    const newSettings = { ...current, ...updates };
    localStorage.setItem('ts-books-ai-settings', JSON.stringify(newSettings));
    set({ settings: newSettings });
  },
}));
