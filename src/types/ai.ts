export type AIProviderId = 'openai' | 'anthropic' | 'gemini' | 'openrouter' | 'ollama' | 'local';

export interface AIProviderConfig {
  id: AIProviderId;
  name: string;
  apiKey: string;
  baseUrl: string;
  models: AIModel[];
  enabled: boolean;
}

export interface AIModel {
  id: string;
  name: string;
  provider: AIProviderId;
  contextWindow: number;
  maxOutput: number;
  supportsStreaming: boolean;
  supportsTools: boolean;
  costPerInputToken?: number;
  costPerOutputToken?: number;
}

export interface AISettings {
  provider: AIProviderId;
  model: string;
  temperature: number;
  maxTokens: number;
  streaming: boolean;
  systemPrompt: string;
  explanationLevel: 'beginner' | 'intermediate' | 'expert';
}

export type MessageRole = 'user' | 'assistant' | 'system';

export interface AIMessage {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  model?: string;
  provider?: AIProviderId;
  tokenUsage?: { input: number; output: number };
  isStreaming?: boolean;
  metadata?: Record<string, unknown>;
}

export interface AIConversation {
  id: string;
  bookId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  pinned: boolean;
  tags: string[];
}

export interface AIPromptTemplate {
  id: string;
  name: string;
  category: 'explain' | 'summarize' | 'quiz' | 'flashcard' | 'code' | 'review' | 'exercise';
  template: string;
  description: string;
  icon: string;
  requiresSelection?: boolean;
}

export interface Flashcard {
  id: string;
  bookId: string;
  conversationId?: string;
  question: string;
  answer: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  createdAt: string;
  lastReviewed?: string;
  nextReview?: string;
  repetitions: number;
  easeFactor: number;
  interval: number;
  correctCount: number;
  incorrectCount: number;
}

export interface QuizQuestion {
  id: string;
  bookId: string;
  conversationId?: string;
  type: 'multiple-choice' | 'true-false' | 'code-completion' | 'short-answer';
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  createdAt: string;
  answered?: boolean;
  userAnswer?: string;
  isCorrect?: boolean;
}

export interface Quiz {
  id: string;
  bookId: string;
  conversationId?: string;
  title: string;
  questions: QuizQuestion[];
  score?: number;
  totalQuestions: number;
  createdAt: string;
  completedAt?: string;
}

export interface AIStreamChunk {
  content: string;
  done: boolean;
  usage?: { input: number; output: number };
}

export interface AIRequestOptions {
  messages: Array<{ role: MessageRole; content: string }>;
  model?: string;
  provider?: AIProviderId;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  onChunk?: (chunk: AIStreamChunk) => void;
  signal?: AbortSignal;
}

export interface AIResponse {
  content: string;
  model: string;
  provider: AIProviderId;
  tokenUsage: { input: number; output: number };
}

export const DEFAULT_AI_SETTINGS: AISettings = {
  provider: 'openai',
  model: 'gpt-4o-mini',
  temperature: 0.7,
  maxTokens: 2048,
  streaming: true,
  systemPrompt: '',
  explanationLevel: 'intermediate',
};

export const PROVIDER_MODELS: Record<AIProviderId, AIModel[]> = {
  openai: [
    { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai', contextWindow: 128000, maxOutput: 16384, supportsStreaming: true, supportsTools: true },
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openai', contextWindow: 128000, maxOutput: 16384, supportsStreaming: true, supportsTools: true },
    { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'openai', contextWindow: 128000, maxOutput: 4096, supportsStreaming: true, supportsTools: true },
  ],
  anthropic: [
    { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4', provider: 'anthropic', contextWindow: 200000, maxOutput: 8192, supportsStreaming: true, supportsTools: true },
    { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku', provider: 'anthropic', contextWindow: 200000, maxOutput: 8192, supportsStreaming: true, supportsTools: true },
  ],
  gemini: [
    { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', provider: 'gemini', contextWindow: 1000000, maxOutput: 8192, supportsStreaming: true, supportsTools: true },
    { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'gemini', contextWindow: 2000000, maxOutput: 8192, supportsStreaming: true, supportsTools: true },
  ],
  openrouter: [
    { id: 'auto', name: 'Auto (Best)', provider: 'openrouter', contextWindow: 128000, maxOutput: 4096, supportsStreaming: true, supportsTools: false },
  ],
  ollama: [
    { id: 'llama3.1', name: 'Llama 3.1', provider: 'ollama', contextWindow: 128000, maxOutput: 4096, supportsStreaming: true, supportsTools: false },
    { id: 'codellama', name: 'Code Llama', provider: 'ollama', contextWindow: 16000, maxOutput: 4096, supportsStreaming: true, supportsTools: false },
    { id: 'mistral', name: 'Mistral', provider: 'ollama', contextWindow: 32000, maxOutput: 4096, supportsStreaming: true, supportsTools: false },
  ],
  local: [],
};

export const PROMPT_TEMPLATES: AIPromptTemplate[] = [
  {
    id: 'explain-concept',
    name: 'Explain Concept',
    category: 'explain',
    template: 'Explain the concept of "{selection}" in the context of this book. Provide a clear definition, practical examples, and related concepts.',
    description: 'Get a clear explanation of a technical concept',
    icon: 'lightbulb',
    requiresSelection: true,
  },
  {
    id: 'explain-code',
    name: 'Explain Code',
    category: 'code',
    template: 'Explain the following code step by line:\n\n```\n{selection}\n```\n\nWhat does each part do? What are the inputs and outputs?',
    description: 'Get a line-by-line explanation of code',
    icon: 'code',
    requiresSelection: true,
  },
  {
    id: 'summarize',
    name: 'Summarize',
    category: 'summarize',
    template: 'Summarize the following content:\n\n{selection}\n\nProvide a concise summary covering the main points.',
    description: 'Get a summary of content',
    icon: 'file-text',
  },
  {
    id: 'generate-quiz',
    name: 'Generate Quiz',
    category: 'quiz',
    template: 'Based on the following content, generate a quiz with 5 questions. Include multiple choice, true/false, and short answer questions:\n\n{selection}',
    description: 'Generate quiz questions from content',
    icon: 'help-circle',
  },
  {
    id: 'generate-flashcards',
    name: 'Generate Flashcards',
    category: 'flashcard',
    template: 'Create flashcards for the following content. Each card should have a clear question and answer:\n\n{selection}\n\nFormat as:\nQ: [question]\nA: [answer]\nDifficulty: [easy/medium/hard]',
    description: 'Create study flashcards from content',
    icon: 'layers',
  },
  {
    id: 'review-notes',
    name: 'Review Notes',
    category: 'review',
    template: 'Review these notes and suggest improvements, connections, and things I might have missed:\n\n{selection}',
    description: 'Get feedback on your notes',
    icon: 'check-circle',
  },
  {
    id: 'generate-exercises',
    name: 'Generate Exercises',
    category: 'exercise',
    template: 'Generate 3 coding exercises based on this content:\n\n{selection}\n\nInclude the problem description, expected input/output, and a hint.',
    description: 'Practice with coding exercises',
    icon: 'terminal',
  },
];
