import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Quiz, QuizQuestion, QuizQuestionType, FlashcardDifficulty } from '../../types/learning';
import { generateId } from '../../lib/utils';

interface QuizBuilderProps {
  bookId: string;
  onSave: (quiz: Quiz) => void;
  onCancel: () => void;
}

export const QuizBuilder: React.FC<QuizBuilderProps> = ({ bookId, onSave, onCancel }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState<FlashcardDifficulty>('medium');
  const [passingScore, setPassingScore] = useState(70);
  const [questions, setQuestions] = useState<Array<Omit<QuizQuestion, 'id' | 'createdAt' | 'bookId'> & { tempId: string }>>([]);

  const addQuestion = (type: QuizQuestionType) => {
    const tempId = generateId();
    const base = { tempId, type, question: '', options: type === 'multiple-choice' ? ['', '', '', ''] : type === 'true-false' ? ['True', 'False'] : undefined, correctAnswer: '', explanation: '', difficulty: 'medium' as const, category: '' };
    setQuestions([...questions, base]);
  };

  const updateQuestion = (tempId: string, updates: Partial<typeof questions[0]>) => {
    setQuestions(questions.map(q => q.tempId === tempId ? { ...q, ...updates } : q));
  };

  const removeQuestion = (tempId: string) => {
    setQuestions(questions.filter(q => q.tempId !== tempId));
  };

  const handleSave = () => {
    if (!title.trim() || questions.length === 0) return;
    const now = new Date().toISOString();
    const fullQuestions: QuizQuestion[] = questions.map(q => ({
      id: generateId() + Math.random().toString(36).slice(2, 5),
      bookId,
      type: q.type,
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      difficulty: q.difficulty,
      category: q.category,
      createdAt: now,
    }));
    const quiz: Quiz = {
      id: generateId(),
      bookId,
      title: title.trim(),
      description: description.trim(),
      questions: fullQuestions,
      difficulty,
      passingScore,
      createdAt: now,
      updatedAt: now,
    };
    onSave(quiz);
  };

  return (
    <div className="quiz-builder">
      <h3>Create Quiz</h3>
      <div className="quiz-builder-field">
        <label>Quiz Title *</label>
        <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Chapter 1 Review" />
      </div>
      <div className="quiz-builder-field">
        <label>Description</label>
        <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Optional description" />
      </div>
      <div className="quiz-builder-row">
        <div className="quiz-builder-field">
          <label>Passing Score (%)</label>
          <input type="number" value={passingScore} onChange={e => setPassingScore(Number(e.target.value))} min={0} max={100} />
        </div>
        <div className="quiz-builder-field">
          <label>Difficulty</label>
          <div className="flashcard-difficulty-btns">
            {(['easy', 'medium', 'hard'] as FlashcardDifficulty[]).map(d => (
              <button key={d} className={`diff-btn ${difficulty === d ? 'active' : ''}`} onClick={() => setDifficulty(d)}>{d}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="quiz-builder-questions">
        <h4>Questions ({questions.length})</h4>
        {questions.map((q, i) => (
          <div key={q.tempId} className="quiz-question-editor">
            <div className="quiz-q-header">
              <span className="quiz-q-number">Q{i + 1}</span>
              <span className="quiz-q-type">{q.type}</span>
              <button className="quiz-q-delete" onClick={() => removeQuestion(q.tempId)}><Trash2 size={14} /></button>
            </div>
            <input type="text" className="quiz-q-input" value={q.question} onChange={e => updateQuestion(q.tempId, { question: e.target.value })} placeholder="Question text..." />
            {q.type === 'multiple-choice' && q.options && (
              <div className="quiz-q-options">
                {q.options.map((opt, oi) => (
                  <div key={oi} className="quiz-q-option-row">
                    <span className="quiz-q-option-letter">{String.fromCharCode(65 + oi)}</span>
                    <input type="text" value={opt} onChange={e => {
                      const newOpts = [...q.options!];
                      newOpts[oi] = e.target.value;
                      updateQuestion(q.tempId, { options: newOpts });
                    }} placeholder={`Option ${String.fromCharCode(65 + oi)}`} />
                  </div>
                ))}
              </div>
            )}
            <div className="quiz-builder-field">
              <label>Correct Answer *</label>
              <input type="text" value={q.correctAnswer} onChange={e => updateQuestion(q.tempId, { correctAnswer: e.target.value })} placeholder="Correct answer" />
            </div>
            <div className="quiz-builder-field">
              <label>Explanation</label>
              <input type="text" value={q.explanation} onChange={e => updateQuestion(q.tempId, { explanation: e.target.value })} placeholder="Why this is the correct answer" />
            </div>
          </div>
        ))}

        <div className="quiz-add-question-btns">
          {(['multiple-choice', 'true-false', 'short-answer', 'fill-in-blank', 'matching'] as QuizQuestionType[]).map(type => (
            <button key={type} className="learn-btn ghost sm" onClick={() => addQuestion(type)}>+ {type}</button>
          ))}
        </div>
      </div>

      <div className="flashcard-builder-actions">
        <button className="learn-btn primary" onClick={handleSave} disabled={!title.trim() || questions.length === 0}>Create Quiz</button>
        <button className="learn-btn ghost" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
};
