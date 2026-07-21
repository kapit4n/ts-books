import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Brain } from 'lucide-react';
import { useKnowledgeCheckStore } from '../../hooks/useKnowledgeCheck';

interface KnowledgeCheckProps {
  bookId: string;
  chapterTitle: string;
  onClose: () => void;
}

export const KnowledgeCheck: React.FC<KnowledgeCheckProps> = ({
  bookId,
  chapterTitle,
  onClose,
}) => {
  const {
    questions,
    answers,
    showResults,
    loading,
    loadQuestions,
    answerQuestion,
    submitCheck,
    reset,
  } = useKnowledgeCheckStore();

  useEffect(() => {
    loadQuestions(bookId, chapterTitle);
  }, [bookId, chapterTitle, loadQuestions]);

  if (loading) {
    return <p className="learn-loading">Loading knowledge check...</p>;
  }

  if (questions.length === 0) {
    return (
      <div className="knowledge-check-empty">
        <Brain size={32} />
        <p>No questions available for this chapter yet.</p>
        <button className="learn-btn primary" onClick={onClose}>Back</button>
      </div>
    );
  }

  if (showResults) {
    const result = submitCheck();
    return (
      <motion.div
        className="knowledge-check-results"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="kcheck-result-icon">
          {result.correct === result.total ? (
            <Check size={48} className="kcheck-perfect" />
          ) : (
            <Brain size={48} />
          )}
        </div>
        <h3>Knowledge Check Complete</h3>
        <div className="kcheck-score">
          {result.correct} / {result.total}
        </div>
        <p>
          {result.correct === result.total
            ? 'Perfect score!'
            : `${Math.round((result.correct / result.total) * 100)}% correct`}
        </p>
        <div className="kcheck-result-actions">
          <button className="learn-btn primary" onClick={() => { reset(); loadQuestions(bookId, chapterTitle); }}>
            Try Again
          </button>
          <button className="learn-btn ghost" onClick={onClose}>Back</button>
        </div>
      </motion.div>
    );
  }

  const allAnswered = questions.every(q => answers[q.id]);

  return (
    <div className="knowledge-check">
      <div className="kcheck-header">
        <h3><Brain size={18} /> Knowledge Check</h3>
        <span className="kcheck-chapter">{chapterTitle}</span>
      </div>

      <div className="kcheck-questions">
        {questions.map((q, i) => (
          <AnimatePresence key={q.id}>
            <motion.div
              className="kcheck-question"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <span className="kcheck-q-number">Q{i + 1}</span>
              <p className="kcheck-q-text">{q.question}</p>

              {q.type === 'multiple-choice' && q.options && (
                <div className="kcheck-options">
                  {q.options.map((opt, oi) => (
                    <button
                      key={oi}
                      className={`kcheck-option ${answers[q.id] === opt ? 'selected' : ''}`}
                      onClick={() => answerQuestion(q.id, opt)}
                    >
                      <span className="kcheck-opt-letter">{String.fromCharCode(65 + oi)}</span>
                      {opt}
                    </button>
                  ))}
                </div>
              )}

              {q.type === 'true-false' && (
                <div className="kcheck-options">
                  {['True', 'False'].map(opt => (
                    <button
                      key={opt}
                      className={`kcheck-option ${answers[q.id] === opt ? 'selected' : ''}`}
                      onClick={() => answerQuestion(q.id, opt)}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}

              {(q.type === 'short-answer' || q.type === 'fill-in-blank') && (
                <input
                  type="text"
                  className="kcheck-input"
                  value={answers[q.id] || ''}
                  onChange={e => answerQuestion(q.id, e.target.value)}
                  placeholder="Type your answer..."
                />
              )}
            </motion.div>
          </AnimatePresence>
        ))}
      </div>

      <div className="kcheck-actions">
        <button
          className="learn-btn primary"
          onClick={() => { submitCheck(); }}
          disabled={!allAnswered}
        >
          Submit
        </button>
        <button className="learn-btn ghost" onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
};
