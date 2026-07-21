import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, Copy, Check } from 'lucide-react';
import { useAIStore } from '../../hooks/useAI';
import { useConversationStore } from '../../hooks/useConversation';
import { AIMessage } from '../../types/ai';
import { generateId } from '../../lib/utils';
import './AIChat.css';

interface AIChatProps {
  bookId: string;
  selectionText?: string;
  onClearSelection?: () => void;
}

export const AIChat: React.FC<AIChatProps> = ({ bookId, selectionText, onClearSelection }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { sendMessageStream, isGenerating, streamingContent, cancelGeneration, error } = useAIStore();
  const {
    activeConversationId, messages,
    createConversation, addMessage, loadConversations,
  } = useConversationStore();

  useEffect(() => {
    loadConversations(bookId);
  }, [bookId, loadConversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  useEffect(() => {
    if (selectionText) {
      setInput(selectionText);
      inputRef.current?.focus();
    }
  }, [selectionText]);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || isGenerating) return;

    let convoId = activeConversationId;
    if (!convoId) {
      const convo = await createConversation(bookId, text.slice(0, 50));
      convoId = convo.id;
    }

    const userMsg: AIMessage = {
      id: generateId(),
      conversationId: convoId,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    await addMessage(userMsg);
    setInput('');
    onClearSelection?.();

    try {
      const allMessages = [...messages, userMsg].map((m) => ({
        role: m.role as 'user' | 'assistant' | 'system',
        content: m.content,
      }));

      const assistantMsg = await sendMessageStream(allMessages, () => {});
      assistantMsg.conversationId = convoId;
      await addMessage(assistantMsg);
    } catch {}
  }, [input, isGenerating, activeConversationId, bookId, messages, createConversation, addMessage, sendMessageStream, onClearSelection]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="ai-chat">
      <div className="ai-chat-messages">
        {messages.length === 0 && !streamingContent && (
          <div className="ai-chat-empty">
            <div className="ai-chat-empty-icon">AI</div>
            <p>Ask anything about this book</p>
            <div className="ai-chat-suggestions">
              {['Explain a concept', 'Summarize this page', 'Generate flashcards'].map((s) => (
                <button key={s} className="ai-suggestion-btn" onClick={() => setInput(s)}>{s}</button>
              ))}
            </div>
          </div>
        )}

        <AnimatePresence>
          {messages.map((msg) => (
            <AIMessageBubble key={msg.id} message={msg} />
          ))}
        </AnimatePresence>

        {streamingContent && (
          <motion.div
            className="ai-message ai-message-assistant"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="ai-message-content">
              <div className="ai-message-text">{streamingContent}<span className="ai-cursor" /></div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {error && (
        <div className="ai-chat-error">
          <span>{error}</span>
          <button onClick={() => {}}><X size={14} /></button>
        </div>
      )}

      <div className="ai-chat-input-wrap">
        <textarea
          ref={inputRef}
          className="ai-chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about this book..."
          rows={1}
          disabled={isGenerating}
        />
        {isGenerating ? (
          <button className="ai-send-btn ai-stop-btn" onClick={cancelGeneration} title="Stop generating">
            <X size={16} />
          </button>
        ) : (
          <button
            className="ai-send-btn"
            onClick={handleSend}
            disabled={!input.trim()}
            title="Send message"
          >
            <Send size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

const AIMessageBubble: React.FC<{ message: AIMessage }> = ({ message }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      className={`ai-message ai-message-${message.role}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
    >
      <div className="ai-message-content">
        <div className="ai-message-text">{message.content}</div>
        {message.role === 'assistant' && (
          <button className="ai-copy-btn" onClick={handleCopy} title="Copy response">
            {copied ? <Check size={12} /> : <Copy size={12} />}
          </button>
        )}
      </div>
    </motion.div>
  );
};
