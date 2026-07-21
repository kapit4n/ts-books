import React from 'react';
import { motion } from 'framer-motion';
import { Check, X, Trophy, Clock, RotateCcw } from 'lucide-react';
import { QuizAttempt, Quiz } from '../../types/learning';

interface QuizResultProps {
  attempt: QuizAttempt;
  quiz: Quiz;
  onRetry: () => void;
  onBack: () => void;
}

export const QuizResult: React.FC<QuizResultProps> = ({ attempt, quiz, onRetry, onBack }) => {
  const percentage = Math.round((attempt.score / attempt.totalQuestions) * 100);
  const passed = attempt.passed;
  const formatDuration = (ms: number) => `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;

  return (
    <div className="quiz-result">
      <motion.div className="quiz-result-card" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
        <div className={`quiz-result-icon ${passed ? 'passed' : 'failed'}`}>
          {passed ? <Trophy size={48} /> : <X size={48} />}
        </div>
        <h2>{passed ? 'Quiz Passed!' : 'Not Quite'}</h2>
        <div className="quiz-result-score">{percentage}%</div>
        <p>{attempt.score}/{attempt.totalQuestions} correct</p>
        <div className="quiz-result-meta">
          <span><Clock size={14} /> {formatDuration(attempt.durationMs)}</span>
          <span>Passing: {quiz.passingScore}%</span>
        </div>

        <div className="quiz-result-questions">
          {quiz.questions.map((q, i) => {
            const userAnswer = attempt.answers[q.id] || '';
            const isCorrect = userAnswer.toLowerCase().trim() === q.correctAnswer.toLowerCase().trim();
            return (
              <div key={q.id} className={`quiz-result-q ${isCorrect ? 'correct' : 'wrong'}`}>
                <span className="quiz-result-q-icon">{isCorrect ? <Check size={14} /> : <X size={14} />}</span>
                <div>
                  <span className="quiz-result-q-text">{q.question}</span>
                  {!isCorrect && <span className="quiz-result-q-answer">Your answer: {userAnswer || '(none)'} | Correct: {q.correctAnswer}</span>}
                </div>
              </div>
            );
          })}
        </div>

        <div className="quiz-result-actions">
          <button className="learn-btn primary" onClick={onRetry}><RotateCcw size={14} /> Retry</button>
          <button className="learn-btn ghost" onClick={onBack}>Back to Quizzes</button>
        </div>
      </motion.div>
    </div>
  );
};
