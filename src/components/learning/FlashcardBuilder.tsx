import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Flashcard, FlashcardDifficulty } from '../../types/learning';

interface FlashcardBuilderProps {
  bookId: string;
  onSave: (
    card: Omit<
      Flashcard,
      | 'id'
      | 'createdAt'
      | 'updatedAt'
      | 'streak'
      | 'easeFactor'
      | 'interval'
      | 'correctCount'
      | 'incorrectCount'
      | 'status'
    >
  ) => void;
  onCancel?: () => void;
  initialCard?: Partial<Flashcard>;
  deckId?: string;
}

export const FlashcardBuilder: React.FC<FlashcardBuilderProps> = ({
  bookId,
  onSave,
  onCancel,
  initialCard,
  deckId,
}) => {
  const [question, setQuestion] = useState(initialCard?.question || '');
  const [answer, setAnswer] = useState(initialCard?.answer || '');
  const [difficulty, setDifficulty] = useState<FlashcardDifficulty>(
    initialCard?.difficulty || 'medium'
  );
  const [category, setCategory] = useState(initialCard?.category || '');
  const [tags, setTags] = useState(initialCard?.tags?.join(', ') || '');

  const handleSubmit = () => {
    if (!question.trim() || !answer.trim()) return;
    onSave({
      bookId,
      deckId,
      question: question.trim(),
      answer: answer.trim(),
      difficulty,
      category: category.trim() || 'General',
      tags: tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      chapterTitle: initialCard?.chapterTitle,
      pageNumber: initialCard?.pageNumber,
    });
    if (!initialCard) {
      setQuestion('');
      setAnswer('');
      setCategory('');
      setTags('');
    }
  };

  return (
    <div className="flashcard-builder">
      <div className="flashcard-builder-field">
        <label>Question *</label>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Enter the question..."
          rows={3}
        />
      </div>
      <div className="flashcard-builder-field">
        <label>Answer *</label>
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Enter the answer..."
          rows={3}
        />
      </div>
      <div className="flashcard-builder-row">
        <div className="flashcard-builder-field">
          <label>Difficulty</label>
          <div className="flashcard-difficulty-btns">
            {(['easy', 'medium', 'hard'] as FlashcardDifficulty[]).map((d) => (
              <button
                key={d}
                className={`diff-btn ${difficulty === d ? 'active' : ''}`}
                onClick={() => setDifficulty(d)}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
        <div className="flashcard-builder-field">
          <label>Category</label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g. Chapter 1"
          />
        </div>
      </div>
      <div className="flashcard-builder-field">
        <label>Tags (comma-separated)</label>
        <input
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="e.g. important, review"
        />
      </div>
      <div className="flashcard-builder-actions">
        <button
          className="learn-btn primary"
          onClick={handleSubmit}
          disabled={!question.trim() || !answer.trim()}
        >
          <Plus size={14} /> {initialCard?.id ? 'Update' : 'Add'} Card
        </button>
        {onCancel && (
          <button className="learn-btn ghost" onClick={onCancel}>
            <X size={14} /> Cancel
          </button>
        )}
      </div>
    </div>
  );
};
