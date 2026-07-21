import React, { useState } from 'react';
import { MessageSquare, Layers, HelpCircle, Settings } from 'lucide-react';
import { AIChat } from './AIChat';
import { FlashcardGenerator } from './FlashcardGenerator';
import { QuizGenerator } from './QuizGenerator';
import { AISettingsPanel } from './AISettings';
import './AIPanel.css';

type AITab = 'chat' | 'flashcards' | 'quiz' | 'settings';

interface AIPanelProps {
  bookId: string;
  selectionText?: string;
  onClearSelection?: () => void;
}

export const AIPanel: React.FC<AIPanelProps> = ({ bookId, selectionText, onClearSelection }) => {
  const [tab, setTab] = useState<AITab>('chat');

  return (
    <div className="ai-panel">
      <div className="ai-panel-tabs">
        <button className={`ai-panel-tab ${tab === 'chat' ? 'active' : ''}`} onClick={() => setTab('chat')} title="Chat">
          <MessageSquare size={14} />
          <span>Chat</span>
        </button>
        <button className={`ai-panel-tab ${tab === 'flashcards' ? 'active' : ''}`} onClick={() => setTab('flashcards')} title="Flashcards">
          <Layers size={14} />
          <span>Cards</span>
        </button>
        <button className={`ai-panel-tab ${tab === 'quiz' ? 'active' : ''}`} onClick={() => setTab('quiz')} title="Quiz">
          <HelpCircle size={14} />
          <span>Quiz</span>
        </button>
        <button className={`ai-panel-tab ${tab === 'settings' ? 'active' : ''}`} onClick={() => setTab('settings')} title="Settings">
          <Settings size={14} />
        </button>
      </div>
      <div className="ai-panel-content">
        {tab === 'chat' && (
          <AIChat bookId={bookId} selectionText={selectionText} onClearSelection={onClearSelection} />
        )}
        {tab === 'flashcards' && (
          <FlashcardGenerator bookId={bookId} selectionText={selectionText} />
        )}
        {tab === 'quiz' && (
          <QuizGenerator bookId={bookId} selectionText={selectionText} />
        )}
        {tab === 'settings' && (
          <AISettingsPanel />
        )}
      </div>
    </div>
  );
};
