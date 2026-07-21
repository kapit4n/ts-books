import React from 'react';
import { LayoutDashboard, Layers, HelpCircle, Code, Award, BarChart3 } from 'lucide-react';

type LearningTab = 'overview' | 'flashcards' | 'quizzes' | 'exercises' | 'achievements' | 'statistics';

interface LearningCenterSidebarProps {
  activeTab: LearningTab;
  onTabChange: (tab: LearningTab) => void;
  stats?: {
    flashcards: number;
    quizzes: number;
    exercises: number;
    achievements: number;
  };
}

const tabs: Array<{ id: LearningTab; label: string; icon: React.ReactNode }> = [
  { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={18} /> },
  { id: 'flashcards', label: 'Flashcards', icon: <Layers size={18} /> },
  { id: 'quizzes', label: 'Quizzes', icon: <HelpCircle size={18} /> },
  { id: 'exercises', label: 'Exercises', icon: <Code size={18} /> },
  { id: 'achievements', label: 'Achievements', icon: <Award size={18} /> },
  { id: 'statistics', label: 'Statistics', icon: <BarChart3 size={18} /> },
];

export const LearningCenterSidebar: React.FC<LearningCenterSidebarProps> = ({
  activeTab,
  onTabChange,
  stats,
}) => {
  return (
    <nav className="learning-sidebar">
      <div className="learning-sidebar-title">Learning Center</div>
      <div className="learning-sidebar-tabs">
        {tabs.map((tab) => {
          const count = tab.id === 'flashcards' ? stats?.flashcards
            : tab.id === 'quizzes' ? stats?.quizzes
            : tab.id === 'exercises' ? stats?.exercises
            : tab.id === 'achievements' ? stats?.achievements
            : undefined;

          return (
            <button
              key={tab.id}
              className={`learning-sidebar-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => onTabChange(tab.id)}
            >
              <span className="learning-sidebar-tab-icon">{tab.icon}</span>
              <span className="learning-sidebar-tab-label">{tab.label}</span>
              {count !== undefined && count > 0 && (
                <span className="learning-sidebar-tab-count">{count}</span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
