import React, { useEffect, useState } from 'react';
import { BarChart3, Clock, Bookmark, TrendingUp } from 'lucide-react';
import { db } from '../../services/database';

interface AnalyticsCardProps {
  bookId: string;
}

interface Stats {
  totalPagesRead: number;
  totalTimeMinutes: number;
  bookmarksCount: number;
  sessionsCount: number;
  avgSessionMinutes: number;
}

export const AnalyticsCards: React.FC<AnalyticsCardProps> = ({ bookId }) => {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    const load = async () => {
      const progress = await db.progress.get(bookId);
      const bookmarks = await db.bookmarks.where('bookId').equals(bookId).count();
      const sessions = await db.bookmarks.where('bookId').equals(bookId).toArray();
      const totalMs = progress?.totalReadingTimeMs || 0;
      const totalPages = progress?.totalPagesRead || 0;
      setStats({
        totalPagesRead: totalPages,
        totalTimeMinutes: Math.round(totalMs / 60000),
        bookmarksCount: bookmarks,
        sessionsCount: sessions.length,
        avgSessionMinutes: sessions.length > 0 ? Math.round(totalMs / 60000 / sessions.length) : 0,
      });
    };
    load();
  }, [bookId]);

  if (!stats) return null;

  return (
    <div className="analytics-cards-grid">
      <div className="analytics-card">
        <div className="analytics-card-icon">
          <TrendingUp size={20} />
        </div>
        <div className="analytics-card-info">
          <span className="analytics-card-value">{stats.totalPagesRead}</span>
          <span className="analytics-card-label">Pages Read</span>
        </div>
      </div>

      <div className="analytics-card">
        <div className="analytics-card-icon">
          <Clock size={20} />
        </div>
        <div className="analytics-card-info">
          <span className="analytics-card-value">{stats.totalTimeMinutes} min</span>
          <span className="analytics-card-label">Reading Time</span>
        </div>
      </div>

      <div className="analytics-card">
        <div className="analytics-card-icon">
          <Bookmark size={20} />
        </div>
        <div className="analytics-card-info">
          <span className="analytics-card-value">{stats.bookmarksCount}</span>
          <span className="analytics-card-label">Bookmarks</span>
        </div>
      </div>

      <div className="analytics-card">
        <div className="analytics-card-icon">
          <BarChart3 size={20} />
        </div>
        <div className="analytics-card-info">
          <span className="analytics-card-value">{stats.avgSessionMinutes} min</span>
          <span className="analytics-card-label">Avg. Session</span>
        </div>
      </div>
    </div>
  );
};
