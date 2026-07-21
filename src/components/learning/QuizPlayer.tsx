import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Clock, Trophy } from 'lucide-react';
import { useUserQuizStore } from '../../hooks/useUserQuiz';
import { Quiz, QuizAttempt } from '../../types/learning';

interface QuizPlayerProps {
  quiz: Quiz;
  onComplete: (attempt: QuizAttempt) => void;
  onExit: () => void;
}

export const QuizPlayer: React.FC<QuizPlayerProps> = ({ quiz, onComplete, onExit }) => {
  const { currentQuestionIndex, answers, answerQuestion, nextQuestion, prevQuestion, finishQuiz } = useUserQuizStore();
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (submitted) return;
    const interval = setInterval(() => setTimeElapsed(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, [submitted]);

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isLast = currentQuestionIndex === quiz.questions.length - 1;
  const allAnswered = quiz.questions.every(q => answers[q.id]);

  const handleSubmit = useCallback(async () => {
    setSubmitted(true);
    const attempt = await finishQuiz();
    if (attempt) onComplete(attempt);
  }, [finishQuiz, onComplete]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="quiz-player">
      <div className="quiz-player-header">
        <button className="learn-btn ghost sm" onClick={onExit}>Exit</button>
        <div className="quiz-player-info">
          <span>Q{currentQuestionIndex + 1}/{quiz.questions.length}</span>
          <span className="quiz-player-timer"><Clock size={14} /> {formatTime(timeElapsed)}</span>
        </div>
        <div className="quiz-player-progress-bar">
          <motion.div animate={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }} className="quiz-player-progress-fill" />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={currentQuestion.id} className="quiz-player-question" initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -50, opacity: 0 }}>
          <span className="quiz-q-type-badge">{currentQuestion.type}</span>
          <p className="quiz-q-text">{currentQuestion.question}</p>

          {currentQuestion.type === 'multiple-choice' && currentQuestion.options && (
            <div className="quiz-player-options">
              {currentQuestion.options.map((opt, i) => (
                <button key={i} className={`quiz-player-option ${answers[currentQuestion.id] === opt ? 'selected' : ''}`} onClick={() => answerQuestion(currentQuestion.id, opt)}>
                  <span className="quiz-po-letter">{String.fromCharCode(65 + i)}</span> {opt}
                </button>
              ))}
            </div>
          )}

          {currentQuestion.type === 'true-false' && (
            <div className="quiz-player-options">
              {['True', 'False'].map(opt => (
                <button key={opt} className={`quiz-player-option ${answers[currentQuestion.id] === opt ? 'selected' : ''}`} onClick={() => answerQuestion(currentQuestion.id, opt)}>
                  {opt}
                </button>
              ))}
            </div>
          )}

          {(currentQuestion.type === 'short-answer' || currentQuestion.type === 'fill-in-blank') && (
            <div className="quiz-player-input-wrap">
              <input type="text" value={answers[currentQuestion.id] || ''} onChange={e => answerQuestion(currentQuestion.id, e.target.value)} placeholder="Type your answer..." />
            </div>
          )}

          {currentQuestion.type === 'matching' && currentQuestion.matchPairs && (
            <div className="quiz-player-matching">
              {currentQuestion.matchPairs.map((pair, i) => (
                <div key={i} className="quiz-match-row">
                  <span>{pair.left}</span>
                  <span>→</span>
                  <input type="text" value={answers[`${currentQuestion.id}_${i}`] || ''} onChange={e => answerQuestion(`${currentQuestion.id}_${i}`, e.target.value)} placeholder="Match" />
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="quiz-player-nav">
        <button className="learn-btn ghost" onClick={prevQuestion} disabled={currentQuestionIndex === 0}><ChevronLeft size={16} /> Previous</button>
        {isLast ? (
          <button className="learn-btn primary" onClick={handleSubmit} disabled={!allAnswered}><Trophy size={16} /> Submit Quiz</button>
        ) : (
          <button className="learn-btn primary" onClick={nextQuestion}>Next <ChevronRight size={16} /></button>
        )}
      </div>
    </div>
  );
};
