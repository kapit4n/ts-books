import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Layers, HelpCircle, Code, Bookmark, Clock } from 'lucide-react';
import { StudyCalendarEntry, CalendarEntryType } from '../../types/learning';
import { useStudyCalendarStore } from '../../hooks/useStudyCalendar';

interface LearningTimelineProps {
  bookId?: string;
  limit?: number;
}

const typeIcon = (type: CalendarEntryType) => {
  switch (type) { case 'reading': return <BookOpen size={14} />; case 'flashcards': return <Layers size={14} />; case 'quiz': return <HelpCircle size={14} />; case 'exercise': return <Code size={14} />; default: return <Bookmark size={14} />; }
};

export const LearningTimeline: React.FC<LearningTimelineProps> = ({ bookId, limit = 20 }) => {
  const { entries, loadEntries } = useStudyCalendarStore();
  const [displayEntries, setDisplayEntries] = useState<StudyCalendarEntry[]>([]);

  useEffect(() => {
    if (bookId) loadEntries(bookId);
  }, [bookId, loadEntries]);

  useEffect(() => {
    let filtered = bookId ? entries.filter(e => e.bookId === bookId) : entries;
    setDisplayEntries(filtered.sort((a, b) => b.date.localeCompare(a.date)).slice(0, limit));
  }, [entries, bookId, limit]);

  return (
    <div className="learning-timeline">
      <h3><Clock size={18} /> Learning Timeline</h3>
      {displayEntries.length === 0 && <p className="learn-empty">No activity yet.</p>}
      <div className="timeline-list">
        {displayEntries.map((entry, i) => (
          <motion.div key={entry.id} className="timeline-item" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
            <div className="timeline-dot">{typeIcon(entry.type)}</div>
            <div className="timeline-content">
              <span className="timeline-desc">{entry.description}</span>
              <span className="timeline-meta">{entry.date} · {Math.round(entry.durationMs / 60000)} min</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
