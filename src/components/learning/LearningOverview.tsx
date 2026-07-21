import React, { useEffect } from 'react';
import { useLearningCenterStore } from '../../hooks/useLearningCenter';
import { useStudyCalendarStore } from '../../hooks/useStudyCalendar';
import { useChapterProgressStore } from '../../hooks/useChapterProgress';
import { LearningTimeline } from './LearningTimeline';
import { StudyCalendar } from './StudyCalendar';
import { ChapterProgressCard } from './ChapterProgressCard';
import { ContinueLearning } from './ContinueLearning';
import { LearningStatsCards } from './LearningStatsCards';

interface LearningOverviewProps {
  bookId: string;
  onNavigate: (bookId: string, activity: string) => void;
  onTabChange: (tab: string) => void;
}

export const LearningOverview: React.FC<LearningOverviewProps> = ({
  bookId,
  onNavigate,
  onTabChange,
}) => {
  const { overview, loading, loadOverview } = useLearningCenterStore();
  const { refreshStreak } = useStudyCalendarStore();
  const { markChapter } = useChapterProgressStore();

  useEffect(() => {
    loadOverview(bookId);
    refreshStreak();
  }, [bookId, loadOverview, refreshStreak]);

  if (loading || !overview) {
    return <p className="learn-loading">Loading overview...</p>;
  }

  return (
    <div className="learning-overview">
      <div className="learning-overview-top">
        {overview.stats && <LearningStatsCards stats={overview.stats} />}
      </div>

      <ContinueLearning
        onNavigate={(bid, activity) => onNavigate(bid, activity)}
      />

      {overview.chapters && overview.chapters.length > 0 && (
        <div className="learning-overview-section">
          <h3>Chapter Progress ({Math.round(overview.chapterPercentage)}% complete)</h3>
          <div className="learning-chapters-list">
            {overview.chapters.map((ch: any) => (
              <ChapterProgressCard
                key={ch.id}
                chapter={ch}
                onMark={(id, status) => {
                  markChapter(id, status);
                }}
              />
            ))}
          </div>
        </div>
      )}

      <div className="learning-overview-bottom">
        <LearningTimeline bookId={bookId} limit={10} />
        <StudyCalendar />
      </div>
    </div>
  );
};
