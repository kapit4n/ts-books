import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, RotateCcw, ArrowRight, Clock } from 'lucide-react';
import { useUserFlashcardsStore } from '../../hooks/useUserFlashcards';

interface FlashcardReviewProps {
  bookId: string;
  onComplete: () => void;
}

export const FlashcardReview: React.FC<FlashcardReviewProps> = ({
  bookId,
  onComplete,
}) => {
  const {
    dueCards,
    stats,
    showAnswer,
    activeStudyIndex,
    loadDueCards,
    recordReview,
    nextStudyCard,
    setShowAnswer,
    refreshStats,
  } = useUserFlashcardsStore();

  useEffect(() => {
    loadDueCards(bookId);
    refreshStats(bookId);
  }, [bookId, loadDueCards, refreshStats]);

  const currentCard = dueCards[activeStudyIndex];
  const isComplete =
    activeStudyIndex >= dueCards.length && dueCards.length > 0;

  if (isComplete) {
    return (
      <div className="flashcard-review-complete">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <Check size={48} className="review-complete-icon" />
          <h3>Session Complete!</h3>
          <p>You reviewed {dueCards.length} cards</p>
          <button className="learn-btn primary" onClick={onComplete}>
            Back to Flashcards
          </button>
        </motion.div>
      </div>
    );
  }

  if (dueCards.length === 0) {
    return (
      <div className="flashcard-review-empty">
        <Clock size={32} />
        <p>No cards due for review</p>
        <button className="learn-btn primary" onClick={onComplete}>
          Back to Flashcards
        </button>
      </div>
    );
  }

  return (
    <div className="flashcard-review">
      <div className="flashcard-review-header">
        <div className="review-stats-bar">
          <span>
            {activeStudyIndex + 1} / {dueCards.length}
          </span>
          <span className="review-streak">🔥 Streak: {stats.streak}</span>
        </div>
        <div className="review-progress-bar">
          <motion.div
            className="review-progress-fill"
            animate={{
              width: `${(activeStudyIndex / dueCards.length) * 100}%`,
            }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentCard.id}
          className={`review-card ${showAnswer ? 'flipped' : ''}`}
          onClick={() => setShowAnswer(!showAnswer)}
          initial={{ rotateY: -90, opacity: 0 }}
          animate={{ rotateY: 0, opacity: 1 }}
          exit={{ rotateY: 90, opacity: 0 }}
          transition={{ duration: 0.3 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="review-card-inner">
            <div className="review-card-front">
              <span className="review-card-label">Question</span>
              <p>{currentCard.question}</p>
              <span className="review-card-hint">Tap to reveal answer</span>
            </div>
            <div className="review-card-back">
              <span className="review-card-label">Answer</span>
              <p>{currentCard.answer}</p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {showAnswer && (
        <motion.div
          className="review-rating-btns"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <button
            className="rating-btn again"
            onClick={() => {
              recordReview(currentCard.id, 'again');
              nextStudyCard();
            }}
          >
            <X size={16} /> Again
          </button>
          <button
            className="rating-btn hard"
            onClick={() => {
              recordReview(currentCard.id, 'hard');
              nextStudyCard();
            }}
          >
            <RotateCcw size={16} /> Hard
          </button>
          <button
            className="rating-btn good"
            onClick={() => {
              recordReview(currentCard.id, 'good');
              nextStudyCard();
            }}
          >
            <Check size={16} /> Good
          </button>
          <button
            className="rating-btn easy"
            onClick={() => {
              recordReview(currentCard.id, 'easy');
              nextStudyCard();
            }}
          >
            <ArrowRight size={16} /> Easy
          </button>
        </motion.div>
      )}
    </div>
  );
};
