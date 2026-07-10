import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, BookOpen, Coffee, GraduationCap, ChevronRight } from 'lucide-react';
import { ReadingGoal } from '../../types/library';
import { Button } from '../ui/Button';
import './ReadingStrategySetup.css';

interface ReadingStrategySetupProps {
  bookTitle: string;
  pageCount: number;
  onComplete: (goal: ReadingGoal, minutesPerDay: number, targetDate: string | null, preferredDays: string[]) => void;
  onCancel: () => void;
}

const goals = [
  { id: 'finish-quickly' as ReadingGoal, icon: <Zap size={24} />, title: 'Finish Quickly', description: 'Read faster, cover more ground' },
  { id: 'study-deeply' as ReadingGoal, icon: <BookOpen size={24} />, title: 'Study Deeply', description: 'Take notes, absorb every detail' },
  { id: 'casual' as ReadingGoal, icon: <Coffee size={24} />, title: 'Casual Reading', description: 'Relaxed, at your own pace' },
  { id: 'exam-prep' as ReadingGoal, icon: <GraduationCap size={24} />, title: 'Exam Preparation', description: 'Focused, with reviews' },
];

const timeOptions = [15, 30, 45, 60, 90];
const dayOptions = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const ReadingStrategySetup: React.FC<ReadingStrategySetupProps> = ({
  bookTitle,
  pageCount,
  onComplete,
  onCancel,
}) => {
  const [step, setStep] = useState(1);
  const [goal, setGoal] = useState<ReadingGoal>('casual');
  const [minutesPerDay, setMinutesPerDay] = useState(30);
  const [targetDate, setTargetDate] = useState('');
  const [preferredDays, setPreferredDays] = useState<string[]>(['Monday', 'Wednesday', 'Friday']);

  const toggleDay = (day: string) => {
    setPreferredDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleComplete = () => {
    onComplete(goal, minutesPerDay, targetDate || null, preferredDays);
  };

  return (
    <motion.div
      className="strategy-setup"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="strategy-setup-header">
        <h2 className="strategy-setup-title">Reading Strategy</h2>
        <p className="strategy-setup-subtitle">
          Set up your reading plan for <strong>{bookTitle}</strong> ({pageCount} pages)
        </p>
      </div>

      {step === 1 && (
        <div className="strategy-setup-step">
          <h3 className="strategy-step-label">What's your reading goal?</h3>
          <div className="strategy-goals">
            {goals.map((g) => (
              <motion.button
                key={g.id}
                className={`strategy-goal ${goal === g.id ? 'active' : ''}`}
                onClick={() => setGoal(g.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="strategy-goal-icon">{g.icon}</div>
                <div className="strategy-goal-info">
                  <span className="strategy-goal-title">{g.title}</span>
                  <span className="strategy-goal-desc">{g.description}</span>
                </div>
              </motion.button>
            ))}
          </div>
          <Button onClick={() => setStep(2)}>
            Next <ChevronRight size={16} />
          </Button>
        </div>
      )}

      {step === 2 && (
        <div className="strategy-setup-step">
          <h3 className="strategy-step-label">Minutes available per day</h3>
          <div className="strategy-times">
            {timeOptions.map((t) => (
              <button
                key={t}
                className={`strategy-time ${minutesPerDay === t ? 'active' : ''}`}
                onClick={() => setMinutesPerDay(t)}
              >
                {t} min
              </button>
            ))}
          </div>

          <h3 className="strategy-step-label">Target completion date (optional)</h3>
          <input
            type="date"
            className="strategy-date-input"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
          />

          <div className="strategy-nav">
            <Button variant="secondary" onClick={() => setStep(1)}>Back</Button>
            <Button onClick={() => setStep(3)}>
              Next <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="strategy-setup-step">
          <h3 className="strategy-step-label">Preferred reading days</h3>
          <div className="strategy-days">
            {dayOptions.map((day) => (
              <button
                key={day}
                className={`strategy-day ${preferredDays.includes(day) ? 'active' : ''}`}
                onClick={() => toggleDay(day)}
              >
                {day.slice(0, 3)}
              </button>
            ))}
          </div>

          <div className="strategy-nav">
            <Button variant="secondary" onClick={() => setStep(2)}>Back</Button>
            <Button onClick={handleComplete}>
              Generate Plan <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      )}

      <button className="strategy-cancel" onClick={onCancel}>
        Cancel
      </button>
    </motion.div>
  );
};
