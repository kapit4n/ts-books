import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, ChevronRight, Check, X, Loader2 } from 'lucide-react';
import { useQuizStore } from '../../hooks/useQuiz';
import { useAIStore } from '../../hooks/useAI';
import { parseQuizFromResponse } from '../../services/promptBuilder';
import './QuizGenerator.css';

interface QuizGeneratorProps {
  bookId: string;
  selectionText?: string;
}

export const QuizGenerator: React.FC<QuizGeneratorProps> = ({ bookId, selectionText }) => {
  const [mode, setMode] = useState<'generate' | 'take' | 'results'>('generate');
  const [inputText, setInputText] = useState(selectionText || '');
  const [questionCount, setQuestionCount] = useState(5);
  const { sendMessageStream, isGenerating } = useAIStore();
  const {
    quizzes, activeQuiz, currentQuestionIndex, answers, stats,
    loadQuizzes, createQuiz, startQuiz, answerQuestion,
    nextQuestion, finishQuiz, refreshStats,
  } = useQuizStore();

  useEffect(() => {
    loadQuizzes(bookId);
    refreshStats(bookId);
  }, [bookId, loadQuizzes, refreshStats]);

  useEffect(() => {
    if (selectionText) setInputText(selectionText);
  }, [selectionText]);

  const handleGenerate = useCallback(async () => {
    if (!inputText.trim()) return;

    const prompt = `Generate a ${questionCount}-question quiz based on this content. Include a mix of multiple-choice, true/false, and short-answer questions.

For each question, use this exact format:

1. [Question type: MC/TF/SA]
Question: [question text]
A) [option] (for MC)
B) [option]
C) [option]
D) [option]
Answer: [correct answer]
Explanation: [brief explanation]

Content:
${inputText}`;

    const msg = await sendMessageStream(
      [{ role: 'user', content: prompt }],
      () => {}
    );

    const parsed = parseQuizFromResponse(msg.content);
    if (parsed.length > 0) {
      const questionsWithMeta = parsed.map((q) => ({
        ...q,
        bookId,
        difficulty: 'medium' as const,
        category: 'ai-generated',
      }));
      await createQuiz(bookId, `Quiz - ${new Date().toLocaleDateString()}`, questionsWithMeta);
      await refreshStats(bookId);
    }
  }, [inputText, questionCount, bookId, sendMessageStream, createQuiz, refreshStats]);

  const handleStartQuiz = useCallback(async (quizId: string) => {
    await startQuiz(quizId);
    setMode('take');
  }, [startQuiz]);

  const currentQuestion = activeQuiz?.questions[currentQuestionIndex];

  return (
    <div className="quiz-gen">
      <div className="quiz-header">
        <div className="quiz-header-info">
          <HelpCircle size={16} />
          <span>Quizzes</span>
        </div>
        <div className="quiz-stats">
          <span className="quiz-stat">{stats.total} total</span>
          <span className="quiz-stat quiz-stat-completed">{stats.completed} done</span>
          {stats.averageScore > 0 && (
            <span className="quiz-stat quiz-stat-score">{stats.averageScore}% avg</span>
          )}
        </div>
      </div>

      <div className="quiz-mode-tabs">
        <button className={`quiz-tab ${mode === 'generate' ? 'active' : ''}`} onClick={() => setMode('generate')}>Generate</button>
        <button className={`quiz-tab ${mode === 'take' ? 'active' : ''}`} onClick={() => { if (activeQuiz) setMode('take'); }}>Take Quiz</button>
      </div>

      {mode === 'generate' && (
        <div className="quiz-generate">
          <textarea
            className="quiz-input"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste content to generate a quiz from..."
            rows={4}
          />
          <div className="quiz-gen-controls">
            <label className="quiz-count-label">
              Questions:
              <select value={questionCount} onChange={(e) => setQuestionCount(Number(e.target.value))}>
                {[3, 5, 7, 10].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </label>
            <button
              className="quiz-gen-btn"
              onClick={handleGenerate}
              disabled={!inputText.trim() || isGenerating}
            >
              {isGenerating ? <Loader2 size={14} className="spin" /> : <HelpCircle size={14} />}
              {isGenerating ? 'Generating...' : 'Generate Quiz'}
            </button>
          </div>

          {quizzes.length > 0 && (
            <div className="quiz-existing">
              <h4>Previous Quizzes</h4>
              <div className="quiz-list">
                {quizzes.slice(0, 5).map((quiz) => (
                  <button key={quiz.id} className="quiz-item" onClick={() => handleStartQuiz(quiz.id)}>
                    <div className="quiz-item-info">
                      <span className="quiz-item-title">{quiz.title}</span>
                      <span className="quiz-item-meta">{quiz.questions.length} questions</span>
                    </div>
                    <ChevronRight size={14} />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {mode === 'take' && activeQuiz && currentQuestion && (
        <div className="quiz-take">
          <div className="quiz-progress-bar">
            <div className="quiz-progress-fill" style={{ width: `${((currentQuestionIndex + 1) / activeQuiz.questions.length) * 100}%` }} />
          </div>
          <span className="quiz-progress-text">Question {currentQuestionIndex + 1} of {activeQuiz.questions.length}</span>

          <div className="quiz-question">
            <span className="quiz-question-type">{currentQuestion.type}</span>
            <p className="quiz-question-text">{currentQuestion.question}</p>
          </div>

          {currentQuestion.options && (
            <div className="quiz-options">
              {currentQuestion.options.map((opt, i) => {
                const isAnswered = !!answers[currentQuestion.id];
                return (
                <button
                  key={i}
                  className={`quiz-option ${answers[currentQuestion.id] === opt ? 'selected' : ''} ${isAnswered ? (opt === currentQuestion.correctAnswer ? 'correct' : answers[currentQuestion.id] === opt ? 'wrong' : '') : ''}`}
                  onClick={() => !isAnswered && answerQuestion(currentQuestion.id, opt)}
                  disabled={isAnswered}
                >
                  <span className="quiz-option-letter">{String.fromCharCode(65 + i)}</span>
                  <span>{opt}</span>
                  {isAnswered && opt === currentQuestion.correctAnswer && <Check size={14} className="quiz-option-icon" />}
                  {isAnswered && answers[currentQuestion.id] === opt && opt !== currentQuestion.correctAnswer && <X size={14} className="quiz-option-icon" />}
                </button>
                );
              })}
            </div>
          )}

          {currentQuestion.type === 'short-answer' && !answers[currentQuestion.id] && (
            <div className="quiz-short-answer">
              <input
                type="text"
                className="quiz-answer-input"
                placeholder="Type your answer..."
                value={answers[currentQuestion.id] || ''}
                onChange={(e) => answerQuestion(currentQuestion.id, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (currentQuestionIndex < activeQuiz.questions.length - 1) nextQuestion();
                    else finishQuiz();
                  }
                }}
              />
            </div>
          )}

          {answers[currentQuestion.id] && currentQuestion.explanation && (
            <motion.div className="quiz-explanation" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <strong>Explanation:</strong> {currentQuestion.explanation}
            </motion.div>
          )}

          {answers[currentQuestion.id] && (
            <button className="quiz-next-btn" onClick={() => {
              if (currentQuestionIndex < activeQuiz.questions.length - 1) nextQuestion();
              else { finishQuiz(); setMode('results'); }
            }}>
              {currentQuestionIndex < activeQuiz.questions.length - 1 ? 'Next Question' : 'See Results'}
              <ChevronRight size={14} />
            </button>
          )}
        </div>
      )}

      {mode === 'results' && !activeQuiz && (
        <div className="quiz-results">
          <Check size={32} />
          <p>Quiz completed!</p>
          <button className="quiz-gen-btn" onClick={() => setMode('generate')}>Generate another quiz</button>
        </div>
      )}
    </div>
  );
};
