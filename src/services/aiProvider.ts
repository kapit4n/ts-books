import {
  AIProviderId, AIRequestOptions, AIResponse, AIStreamChunk,
  AIProviderConfig, AISettings, PROVIDER_MODELS, DEFAULT_AI_SETTINGS,
} from '../types/ai';

const PROVIDER_URLS: Record<AIProviderId, string> = {
  openai: 'https://api.openai.com/v1/chat/completions',
  anthropic: 'https://api.anthropic.com/v1/messages',
  gemini: 'https://generativelanguage.googleapis.com/v1beta/models',
  openrouter: 'https://openrouter.ai/api/v1/chat/completions',
  ollama: 'http://localhost:11434/api/chat',
  local: 'http://localhost:11434/api/chat',
};

export function getConfig(provider: AIProviderId): AIProviderConfig {
  const stored = localStorage.getItem(`ts-books-ai-provider-${provider}`);
  if (stored) {
    try { return JSON.parse(stored); } catch {}
  }
  return {
    id: provider,
    name: provider.charAt(0).toUpperCase() + provider.slice(1),
    apiKey: '',
    baseUrl: PROVIDER_URLS[provider],
    models: PROVIDER_MODELS[provider] || [],
    enabled: provider === 'ollama' || provider === 'local',
  };
}

function getSettings(): AISettings {
  const stored = localStorage.getItem('ts-books-ai-settings');
  if (stored) {
    try { return { ...DEFAULT_AI_SETTINGS, ...JSON.parse(stored) } as AISettings; } catch {}
  }
  return DEFAULT_AI_SETTINGS;
}

export function saveProviderConfig(config: AIProviderConfig) {
  localStorage.setItem(`ts-books-ai-provider-${config.id}`, JSON.stringify(config));
}

export function saveAISettings(settings: typeof DEFAULT_AI_SETTINGS) {
  localStorage.setItem('ts-books-ai-settings', JSON.stringify(settings));
}

export function getAISettings() {
  return getSettings();
}

async function callOpenAI(options: AIRequestOptions, config: AIProviderConfig): Promise<AIResponse> {
  const response = await fetch(config.baseUrl || PROVIDER_URLS.openai, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: options.model || getSettings().model,
      messages: options.messages,
      temperature: options.temperature ?? getSettings().temperature,
      max_tokens: options.maxTokens ?? getSettings().maxTokens,
      stream: !!options.stream,
    }),
    signal: options.signal,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `OpenAI API error: ${response.status}`);
  }

  if (options.stream) {
    return streamOpenAI(response, options.onChunk!);
  }

  const data = await response.json();
  return {
    content: data.choices[0].message.content,
    model: data.model,
    provider: 'openai',
    tokenUsage: { input: data.usage?.prompt_tokens || 0, output: data.usage?.completion_tokens || 0 },
  };
}

async function streamOpenAI(response: Response, onChunk: (chunk: AIStreamChunk) => void): Promise<AIResponse> {
  const reader = response.body?.getReader();
  if (!reader) throw new Error('No response body');
  const decoder = new TextDecoder();
  let fullContent = '';
  let inputTokens = 0;
  let outputTokens = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const text = decoder.decode(value, { stream: true });
    const lines = text.split('\n').filter((l) => l.startsWith('data: '));

    for (const line of lines) {
      const data = line.slice(6);
      if (data === '[DONE]') {
        onChunk({ content: '', done: true });
        continue;
      }
      try {
        const parsed = JSON.parse(data);
        const content = parsed.choices?.[0]?.delta?.content || '';
        if (content) {
          fullContent += content;
          onChunk({ content, done: false });
        }
        if (parsed.usage) {
          inputTokens = parsed.usage.prompt_tokens || 0;
          outputTokens = parsed.usage.completion_tokens || 0;
        }
      } catch {}
    }
  }

  return {
    content: fullContent,
    model: getSettings().model,
    provider: 'openai',
    tokenUsage: { input: inputTokens, output: outputTokens },
  };
}

async function callAnthropic(options: AIRequestOptions, config: AIProviderConfig): Promise<AIResponse> {
  const systemMsg = options.messages.find((m) => m.role === 'system');
  const otherMessages = options.messages.filter((m) => m.role !== 'system');

  const response = await fetch(config.baseUrl || PROVIDER_URLS.anthropic, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': config.apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: options.model || getSettings().model,
      max_tokens: options.maxTokens ?? getSettings().maxTokens,
      system: systemMsg?.content || '',
      messages: otherMessages,
      stream: !!options.stream,
    }),
    signal: options.signal,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `Anthropic API error: ${response.status}`);
  }

  if (options.stream) {
    return streamAnthropic(response, options.onChunk!);
  }

  const data = await response.json();
  return {
    content: data.content[0]?.text || '',
    model: data.model,
    provider: 'anthropic',
    tokenUsage: { input: data.usage?.input_tokens || 0, output: data.usage?.output_tokens || 0 },
  };
}

async function streamAnthropic(response: Response, onChunk: (chunk: AIStreamChunk) => void): Promise<AIResponse> {
  const reader = response.body?.getReader();
  if (!reader) throw new Error('No response body');
  const decoder = new TextDecoder();
  let fullContent = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const text = decoder.decode(value, { stream: true });
    const lines = text.split('\n').filter((l) => l.startsWith('data: '));

    for (const line of lines) {
      try {
        const parsed = JSON.parse(line.slice(6));
        if (parsed.type === 'content_block_delta') {
          const content = parsed.delta?.text || '';
          fullContent += content;
          onChunk({ content, done: false });
        } else if (parsed.type === 'message_stop') {
          onChunk({ content: '', done: true });
        }
      } catch {}
    }
  }

  return {
    content: fullContent,
    model: getSettings().model,
    provider: 'anthropic',
    tokenUsage: { input: 0, output: 0 },
  };
}

async function callGemini(options: AIRequestOptions, config: AIProviderConfig): Promise<AIResponse> {
  const model = options.model || getSettings().model;
  const url = `${config.baseUrl || PROVIDER_URLS.gemini}/${model}:generateContent?key=${config.apiKey}`;

  const contents = options.messages
    .filter((m) => m.role !== 'system')
    .map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

  const systemInstruction = options.messages.find((m) => m.role === 'system');

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents,
      ...(systemInstruction ? { systemInstruction: { parts: [{ text: systemInstruction.content }] } } : {}),
      generationConfig: {
        temperature: options.temperature ?? getSettings().temperature,
        maxOutputTokens: options.maxTokens ?? getSettings().maxTokens,
      },
    }),
    signal: options.signal,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  return {
    content,
    model,
    provider: 'gemini',
    tokenUsage: { input: data.usageMetadata?.promptTokenCount || 0, output: data.usageMetadata?.candidatesTokenCount || 0 },
  };
}

async function callOpenRouter(options: AIRequestOptions, config: AIProviderConfig): Promise<AIResponse> {
  const response = await fetch(config.baseUrl || PROVIDER_URLS.openrouter, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
      'HTTP-Referer': window.location.origin,
    },
    body: JSON.stringify({
      model: options.model || 'auto',
      messages: options.messages,
      temperature: options.temperature ?? getSettings().temperature,
      max_tokens: options.maxTokens ?? getSettings().maxTokens,
    }),
    signal: options.signal,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `OpenRouter API error: ${response.status}`);
  }

  const data = await response.json();
  return {
    content: data.choices[0].message.content,
    model: data.model,
    provider: 'openrouter',
    tokenUsage: { input: data.usage?.prompt_tokens || 0, output: data.usage?.completion_tokens || 0 },
  };
}

async function callOllama(options: AIRequestOptions, config: AIProviderConfig): Promise<AIResponse> {
  const url = config.baseUrl || PROVIDER_URLS.ollama;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: options.model || 'llama3.1',
      messages: options.messages,
      stream: !!options.stream,
      options: {
        temperature: options.temperature ?? getSettings().temperature,
        num_predict: options.maxTokens ?? getSettings().maxTokens,
      },
    }),
    signal: options.signal,
  });

  if (!response.ok) {
    throw new Error(`Ollama API error: ${response.status}`);
  }

  if (options.stream) {
    return streamOllama(response, options.onChunk!);
  }

  const data = await response.json();
  return {
    content: data.message?.content || '',
    model: data.model || 'ollama',
    provider: 'ollama',
    tokenUsage: { input: data.prompt_eval_count || 0, output: data.eval_count || 0 },
  };
}

async function streamOllama(response: Response, onChunk: (chunk: AIStreamChunk) => void): Promise<AIResponse> {
  const reader = response.body?.getReader();
  if (!reader) throw new Error('No response body');
  const decoder = new TextDecoder();
  let fullContent = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const text = decoder.decode(value, { stream: true });
    const lines = text.split('\n').filter((l) => l.trim());

    for (const line of lines) {
      try {
        const parsed = JSON.parse(line);
        const content = parsed.message?.content || '';
        if (content) {
          fullContent += content;
          onChunk({ content, done: false });
        }
        if (parsed.done) {
          onChunk({ content: '', done: true, usage: { input: parsed.prompt_eval_count || 0, output: parsed.eval_count || 0 } });
        }
      } catch {}
    }
  }

  return {
    content: fullContent,
    model: 'ollama',
    provider: 'ollama',
    tokenUsage: { input: 0, output: 0 },
  };
}

const PROVIDER_CALLERS: Record<AIProviderId, (options: AIRequestOptions, config: AIProviderConfig) => Promise<AIResponse>> = {
  openai: callOpenAI,
  anthropic: callAnthropic,
  gemini: callGemini,
  openrouter: callOpenRouter,
  ollama: callOllama,
  local: callOllama,
};

export async function callAI(options: AIRequestOptions): Promise<AIResponse> {
  const settings = getSettings();
  const provider: AIProviderId = options.provider || settings.provider;
  const config = getConfig(provider);

  if (!config.apiKey && provider !== 'ollama' && provider !== 'local') {
    throw new Error(`No API key configured for ${provider}. Go to AI Settings to configure.`);
  }

  const caller = PROVIDER_CALLERS[provider];
  if (!caller) throw new Error(`Provider ${provider} not supported`);

  return caller(options, config);
}

export async function* streamAI(options: AIRequestOptions): AsyncGenerator<AIStreamChunk> {
  const settings = getSettings();
  const provider: AIProviderId = options.provider || settings.provider;
  const config = getConfig(provider);

  if (!config.apiKey && provider !== 'ollama' && provider !== 'local') {
    throw new Error(`No API key configured for ${provider}. Go to AI Settings to configure.`);
  }

  const result = await callAI({ ...options, stream: true, onChunk: () => {} });

  yield { content: result.content, done: true, usage: result.tokenUsage };
}

export function testConnection(provider: AIProviderId): Promise<boolean> {
  return callAI({
    messages: [{ role: 'user', content: 'Say "connected"' }],
    provider,
    maxTokens: 10,
    stream: false,
  }).then(() => true).catch(() => false);
}
