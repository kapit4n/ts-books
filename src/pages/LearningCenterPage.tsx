import React, { useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, BookOpen } from 'lucide-react';
import { useLibraryStore } from '../hooks/useLibrary';
import { useLearningCenterStore } from '../hooks/useLearningCenter';
import { useUserFlashcardsStore } from '../hooks/useUserFlashcards';
import { useUserQuizStore } from '../hooks/useUserQuiz';
import { useExercisesStore } from '../hooks/useExercises';
import { useAchievementsStore } from '../hooks/useAchievements';
import { useLearningProgressStore } from '../hooks/useLearningProgress';
import { LearningCenterSidebar } from '../components/learning/LearningCenterSidebar';
import { LearningOverview } from '../components/learning/LearningOverview';
import { FlashcardBuilder } from '../components/learning/FlashcardBuilder';
import { FlashcardReview } from '../components/learning/FlashcardReview';
import { FlashcardCard } from '../components/learning/FlashcardCard';
import { QuizBuilder } from '../components/learning/QuizBuilder';
import { QuizPlayer } from '../components/learning/QuizPlayer';
import { QuizResult } from '../components/learning/QuizResult';
import { QuizCard } from '../components/learning/QuizCard';
import { ExerciseCard } from '../components/learning/ExerciseCard';
import { ExerciseEditor } from '../components/learning/ExerciseEditor';
import { AchievementGrid } from '../components/learning/AchievementGrid';
import { LearningStatsCards } from '../components/learning/LearningStatsCards';
import { StudyCalendar } from '../components/learning/StudyCalendar';
import { LearningTimeline } from '../components/learning/LearningTimeline';
import { Quiz, QuizAttempt, Exercise } from '../types/learning';
import './LearningCenterPage.css';

type LearningTab = 'overview' | 'flashcards' | 'quizzes' | 'exercises' | 'achievements' | 'statistics';

export const LearningCenterPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { books } = useLibraryStore();
  const book = books.find((b) => b.id === id);

  const { activeTab, setActiveTab, refreshAll, loading } = useLearningCenterStore();

  // Flashcard sub-state
  const [flashcardView, setFlashcardView] = React.useState<'list' | 'create' | 'review' | 'detail'>('list');

  const { cards, stats: flashcardStats, loadCards, addCard } = useUserFlashcardsStore();

  // Quiz sub-state
  const [quizView, setQuizView] = React.useState<'list' | 'create' | 'play' | 'result'>('list');
  const [activeQuiz, setActiveQuiz] = React.useState<Quiz | null>(null);
  const [lastAttempt, setLastAttempt] = React.useState<QuizAttempt | null>(null);
  const { quizzes, stats: quizStats, loadQuizzes, createQuiz } = useUserQuizStore();

  // Exercise sub-state
  const [exerciseView, setExerciseView] = React.useState<'list' | 'edit'>('list');
  const [selectedExercise, setSelectedExercise] = React.useState<Exercise | null>(null);
  const { exercises, stats: exerciseStats, loadExercises, recordResult } = useExercisesStore();

  // Achievements
  const { stats: achievementStats } = useAchievementsStore();

  // Learning progress
  const { stats: learningStats, loadStats, loadGlobalStats } = useLearningProgressStore();

  useEffect(() => {
    if (id) {
      refreshAll(id);
      loadStats(id);
      loadGlobalStats();
      loadCards(id);
      loadQuizzes(id);
      loadExercises(id);
    }
  }, [id, refreshAll, loadStats, loadGlobalStats, loadCards, loadQuizzes, loadExercises]);

  const handleBack = useCallback(() => {
    if (id) navigate(`/library/${id}`);
  }, [id, navigate]);

  const handleTabChange = useCallback((tab: LearningTab) => {
    setActiveTab(tab);
    setFlashcardView('list');
    setQuizView('list');
    setExerciseView('list');
  }, [setActiveTab]);

  if (!book) {
    return (
      <div className="learning-center-page">
        <div className="learning-center-empty">
          <p>Book not found.</p>
        </div>
      </div>
    );
  }

  const renderFlashcards = () => {
    if (flashcardView === 'create') {
      return (
        <div className="learning-section">
          <FlashcardBuilder
            bookId={book!.id}
            onSave={async (cardData) => {
              await addCard(cardData);
              setFlashcardView('list');
            }}
            onCancel={() => setFlashcardView('list')}
          />
        </div>
      );
    }
    if (flashcardView === 'review') {
      return (
        <div className="learning-section">
          <FlashcardReview bookId={book!.id} onComplete={() => setFlashcardView('list')} />
        </div>
      );
    }
    return (
      <div className="learning-section">
        <div className="learning-section-header">
          <h2>Flashcards</h2>
          <div className="learning-section-actions">
            <button className="learn-btn ghost" onClick={() => setFlashcardView('review')}>Review Due Cards ({flashcardStats.due})</button>
            <button className="learn-btn primary" onClick={() => setFlashcardView('create')}>+ New Card</button>
          </div>
        </div>
        <div className="flashcard-stats-row">
          <span>{flashcardStats.total} total</span>
          <span>{flashcardStats.due} due</span>
          <span>{flashcardStats.mastered} mastered</span>
        </div>
        <div className="learning-cards-list">
          {cards.map(card => (
            <FlashcardCard
              key={card.id}
              card={card}
              compact
              onEdit={() => { setFlashcardView('detail'); }}
              onDelete={(id) => {
                useUserFlashcardsStore.getState().removeCard(id);
              }}
            />
          ))}
          {cards.length === 0 && <p className="learn-empty">No flashcards yet. Create your first card!</p>}
        </div>
      </div>
    );
  };

  const renderQuizzes = () => {
    if (quizView === 'create') {
      return (
        <div className="learning-section">
          <QuizBuilder
            bookId={book!.id}
            onSave={async (quiz) => {
              await createQuiz(quiz);
              setQuizView('list');
            }}
            onCancel={() => setQuizView('list')}
          />
        </div>
      );
    }
    if (quizView === 'play' && activeQuiz) {
      return (
        <div className="learning-section">
          <QuizPlayer
            quiz={activeQuiz}
            onComplete={(attempt) => {
              setLastAttempt(attempt);
              setQuizView('result');
            }}
            onExit={() => setQuizView('list')}
          />
        </div>
      );
    }
    if (quizView === 'result' && lastAttempt && activeQuiz) {
      return (
        <div className="learning-section">
          <QuizResult
            attempt={lastAttempt}
            quiz={activeQuiz}
            onRetry={() => setQuizView('play')}
            onBack={() => setQuizView('list')}
          />
        </div>
      );
    }
    return (
      <div className="learning-section">
        <div className="learning-section-header">
          <h2>Quizzes</h2>
          <button className="learn-btn primary" onClick={() => setQuizView('create')}>+ New Quiz</button>
        </div>
        <div className="learning-cards-list">
          {quizzes.map(quiz => (
            <QuizCard
              key={quiz.id}
              quiz={quiz}
              onStart={() => {
                setActiveQuiz(quiz);
                useUserQuizStore.getState().startQuiz(quiz.id);
                setQuizView('play');
              }}
              onDelete={(id) => {
                useUserQuizStore.getState().removeQuiz(id);
              }}
            />
          ))}
          {quizzes.length === 0 && <p className="learn-empty">No quizzes yet. Create your first quiz!</p>}
        </div>
      </div>
    );
  };

  const renderExercises = () => {
    if (exerciseView === 'edit' && selectedExercise) {
      return (
        <div className="learning-section">
          <ExerciseEditor
            exercise={selectedExercise}
            onBack={() => setExerciseView('list')}
            onComplete={(exerciseId, userCode, output, passed) => {
              const result = {
                id: Date.now().toString(36),
                exerciseId,
                bookId: book!.id,
                userCode,
                output,
                passed,
                attemptedAt: new Date().toISOString(),
              };
              recordResult(result);
              loadExercises(book!.id);
            }}
          />
        </div>
      );
    }
    return (
      <div className="learning-section">
        <div className="learning-section-header">
          <h2>Exercises</h2>
        </div>
        <div className="learning-cards-list">
          {exercises.map(exercise => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              onSelect={(ex) => {
                setSelectedExercise(ex);
                setExerciseView('edit');
                useExercisesStore.getState().selectExercise(ex.id);
              }}
            />
          ))}
          {exercises.length === 0 && <p className="learn-empty">No exercises yet.</p>}
        </div>
      </div>
    );
  };

  const renderStatistics = () => (
    <div className="learning-section">
      <div className="learning-section-header">
        <h2>Statistics</h2>
      </div>
      {learningStats && <LearningStatsCards stats={learningStats} />}
      <div className="learning-stats-bottom">
        <StudyCalendar />
        <LearningTimeline bookId={book!.id} limit={20} />
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <LearningOverview
            bookId={book!.id}
            onNavigate={(bid, activity) => {
              if (activity === 'flashcards') { setActiveTab('flashcards'); setFlashcardView('list'); }
              else if (activity === 'quiz') { setActiveTab('quizzes'); setQuizView('list'); }
              else if (activity === 'exercise') { setActiveTab('exercises'); setExerciseView('list'); }
              else { navigate(`/library/${bid}/read`); }
            }}
            onTabChange={(tab) => handleTabChange(tab as LearningTab)}
          />
        );
      case 'flashcards':
        return renderFlashcards();
      case 'quizzes':
        return renderQuizzes();
      case 'exercises':
        return renderExercises();
      case 'achievements':
        return (
          <div className="learning-section">
            <AchievementGrid />
          </div>
        );
      case 'statistics':
        return renderStatistics();
      default:
        return null;
    }
  };

  return (
    <div className="learning-center-page">
      <header className="learning-center-header">
        <button className="study-back-btn" onClick={handleBack}>
          <ChevronLeft size={18} /> Back
        </button>
        <div className="learning-center-header-info">
          <h1 className="learning-center-title">{book.title}</h1>
          <span className="learning-center-subtitle">
            <BookOpen size={14} /> Learning Center
          </span>
        </div>
        <button
          className="study-read-btn"
          onClick={() => navigate(`/library/${book.id}/read`)}
        >
          Open Reader
        </button>
      </header>

      <div className="learning-center-layout">
        <aside className="learning-center-sidebar">
          <LearningCenterSidebar
            activeTab={activeTab}
            onTabChange={handleTabChange}
            stats={{
              flashcards: flashcardStats.total,
              quizzes: quizStats.total,
              exercises: exerciseStats.total,
              achievements: achievementStats.unlocked,
            }}
          />
        </aside>

        <main className="learning-center-main">
          {loading ? (
            <p className="learn-loading">Loading...</p>
          ) : (
            renderContent()
          )}
        </main>
      </div>
    </div>
  );
};
