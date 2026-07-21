import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Layers, Check, X, Loader2, Trash2 } from 'lucide-react';
import { useFlashcardStore } from '../../hooks/useFlashcards';
import { useAIStore } from '../../hooks/useAI';
import { parseFlashcardsFromResponse } from '../../services/promptBuilder';
import { Flashcard } from '../../types/learning';
import './FlashcardGenerator.css';

interface FlashcardGeneratorProps {
  bookId: string;
  selectionText?: string;
}

export const FlashcardGenerator: React.FC<FlashcardGeneratorProps> = ({ bookId, selectionText }) => {
  const [mode, setMode] = useState<'generate' | 'study'>('generate');
  const [inputText, setInputText] = useState(selectionText || '');
  const [cardCount, setCardCount] = useState(5);
  const { sendMessageStream, isGenerating } = useAIStore();
  const {
    cards, dueCards, stats, showAnswer,
    loadCards, loadDueCards, addBatch, recordReview,
    nextStudyCard, setShowAnswer, refreshStats, removeCard, activeStudyCardIndex,
  } = useFlashcardStore();

  useEffect(() => {
    loadCards(bookId);
    loadDueCards(bookId);
    refreshStats(bookId);
  }, [bookId, loadCards, loadDueCards, refreshStats]);

  useEffect(() => {
    if (selectionText) setInputText(selectionText);
  }, [selectionText]);

  const handleGenerate = useCallback(async () => {
    if (!inputText.trim()) return;

    const prompt = `Generate ${cardCount} flashcards based on this content. Format each as:
Q: [question]
A: [answer]
Difficulty: [easy|medium|hard]

Content:
${inputText}`;

    const msg = await sendMessageStream(
      [{ role: 'user', content: prompt }],
      () => {}
    );

    const parsed = parseFlashcardsFromResponse(msg.content);
    if (parsed.length > 0) {
      const newCards: Omit<Flashcard, 'id' | 'createdAt' | 'updatedAt' | 'streak' | 'easeFactor' | 'interval' | 'correctCount' | 'incorrectCount' | 'status'>[] = parsed.map((c) => ({
        bookId,
        question: c.question,
        answer: c.answer,
        difficulty: c.difficulty,
        category: 'ai-generated',
        tags: [],
      }));
      await addBatch(newCards);
      await refreshStats(bookId);
    }
  }, [inputText, cardCount, bookId, sendMessageStream, addBatch, refreshStats]);

  const currentCard = dueCards[activeStudyCardIndex];

  return (
    <div className="flashcard-gen">
      <div className="flashcard-header">
        <div className="flashcard-header-info">
          <Layers size={16} />
          <span>Flashcards</span>
        </div>
        <div className="flashcard-stats">
          <span className="flashcard-stat">{stats.total} total</span>
          <span className="flashcard-stat flashcard-stat-due">{stats.due} due</span>
          <span className="flashcard-stat flashcard-stat-mastered">{stats.mastered} mastered</span>
        </div>
      </div>

      <div className="flashcard-mode-tabs">
        <button
          className={`flashcard-tab ${mode === 'generate' ? 'active' : ''}`}
          onClick={() => setMode('generate')}
        >
          Generate
        </button>
        <button
          className={`flashcard-tab ${mode === 'study' ? 'active' : ''}`}
          onClick={() => { setMode('study'); loadDueCards(bookId); }}
        >
          Study ({stats.due})
        </button>
      </div>

      {mode === 'generate' ? (
        <div className="flashcard-generate">
          <textarea
            className="flashcard-input"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste text content to generate flashcards from..."
            rows={4}
          />
          <div className="flashcard-gen-controls">
            <label className="flashcard-count-label">
              Cards:
              <select value={cardCount} onChange={(e) => setCardCount(Number(e.target.value))}>
                {[3, 5, 7, 10].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </label>
            <button
              className="flashcard-gen-btn"
              onClick={handleGenerate}
              disabled={!inputText.trim() || isGenerating}
            >
              {isGenerating ? <Loader2 size={14} className="spin" /> : <Layers size={14} />}
              {isGenerating ? 'Generating...' : 'Generate'}
            </button>
          </div>

          {cards.length > 0 && (
            <div className="flashcard-existing">
              <h4>All Cards ({cards.length})</h4>
              <div className="flashcard-list">
                {cards.slice(0, 10).map((card) => (
                  <div key={card.id} className={`flashcard-mini flashcard-mini-${card.difficulty}`}>
                    <div className="flashcard-mini-q">{card.question.slice(0, 60)}{card.question.length > 60 ? '...' : ''}</div>
                    <button className="flashcard-mini-remove" onClick={() => removeCard(card.id)}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flashcard-study">
          {currentCard ? (
            <div className="flashcard-study-area">
              <div className="flashcard-progress-bar">
                <div className="flashcard-progress-fill" style={{ width: `${((activeStudyCardIndex + 1) / dueCards.length) * 100}%` }} />
              </div>
              <span className="flashcard-progress-text">{activeStudyCardIndex + 1} / {dueCards.length}</span>

              <motion.div
                className={`flashcard-card ${showAnswer ? 'flipped' : ''}`}
                onClick={() => setShowAnswer(!showAnswer)}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flashcard-card-inner">
                  <div className="flashcard-card-front">
                    <span className="flashcard-card-label">Question</span>
                    <p>{currentCard.question}</p>
                    <span className="flashcard-card-hint">Tap to reveal answer</span>
                  </div>
                  <div className="flashcard-card-back">
                    <span className="flashcard-card-label">Answer</span>
                    <p>{currentCard.answer}</p>
                  </div>
                </div>
              </motion.div>

              {showAnswer && (
                <motion.div
                  className="flashcard-review-btns"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <button className="flashcard-review-btn flashcard-review-wrong" onClick={() => { recordReview(currentCard.id, false); nextStudyCard(); }}>
                    <X size={16} /> Again
                  </button>
                  <button className="flashcard-review-btn flashcard-review-correct" onClick={() => { recordReview(currentCard.id, true); nextStudyCard(); }}>
                    <Check size={16} /> Got it
                  </button>
                </motion.div>
              )}
            </div>
          ) : (
            <div className="flashcard-empty">
              <Check size={32} />
              <p>No cards due for review!</p>
              <button className="flashcard-gen-btn" onClick={() => setMode('generate')}>Generate more cards</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
