import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Highlighter, StickyNote, Bookmark, Star, BookOpen } from 'lucide-react';
import { ActivityEntry } from '../../types/study';
import './Timeline.css';

interface TimelineProps {
  activities: ActivityEntry[];
}

export const Timeline: React.FC<TimelineProps> = ({ activities }) => {
  const groupedActivities = useMemo(() => {
    const groups: Record<string, ActivityEntry[]> = {};
    const now = new Date();
    const today = now.toDateString();
    const yesterday = new Date(now.getTime() - 86400000).toDateString();

    activities.forEach((a) => {
      const date = new Date(a.timestamp).toDateString();
      let label: string;
      if (date === today) label = 'Today';
      else if (date === yesterday) label = 'Yesterday';
      else label = new Date(a.timestamp).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

      if (!groups[label]) groups[label] = [];
      groups[label].push(a);
    });

    return Object.entries(groups);
  }, [activities]);

  const typeIcon = (type: string) => {
    switch (type) {
      case 'highlight': return <Highlighter size={14} />;
      case 'note': return <StickyNote size={14} />;
      case 'bookmark': return <Bookmark size={14} />;
      case 'favorite': return <Star size={14} />;
      case 'reading': return <BookOpen size={14} />;
      default: return null;
    }
  };

  if (activities.length === 0) {
    return (
      <div className="timeline-empty">
        <p>No activity yet. Start reading and annotating!</p>
      </div>
    );
  }

  return (
    <div className="timeline">
      {groupedActivities.map(([label, items]) => (
        <div key={label} className="timeline-group">
          <h4 className="timeline-date">{label}</h4>
          <div className="timeline-items">
            {items.map((item, i) => (
              <motion.div
                key={item.id}
                className="timeline-item"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <div className="timeline-item-icon">
                  {typeIcon(item.type)}
                </div>
                <div className="timeline-item-content">
                  <span className="timeline-item-desc">{item.description}</span>
                  <span className="timeline-item-time">
                    {new Date(item.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
