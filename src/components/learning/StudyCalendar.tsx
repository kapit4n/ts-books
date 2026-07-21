import React, { useEffect, useState } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/style.css';
import { useStudyCalendarStore } from '../../hooks/useStudyCalendar';
import { format, startOfMonth } from 'date-fns';

export const StudyCalendar: React.FC = () => {
  const { monthEntries, streak, loadMonthEntries, refreshStreak, selectedDate, setSelectedDate } = useStudyCalendarStore();
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));

  useEffect(() => {
    refreshStreak();
  }, [refreshStreak]);

  useEffect(() => {
    loadMonthEntries(currentMonth.getFullYear(), currentMonth.getMonth());
  }, [currentMonth, loadMonthEntries]);

  const activeDates = new Set(monthEntries.map(e => e.date));

  const selectedDayEntries = monthEntries.filter(e => e.date === selectedDate);

  return (
    <div className="study-calendar">
      <div className="study-calendar-header">
        <h3>Study Calendar</h3>
        <div className="streak-info">
          <span className="streak-current">🔥 {streak.current} day streak</span>
          <span className="streak-longest">Best: {streak.longest}</span>
        </div>
      </div>
      <div className="calendar-wrap">
        <DayPicker
          mode="single"
          selected={selectedDate ? new Date(selectedDate + 'T00:00:00') : undefined}
          onSelect={(day) => day && setSelectedDate(format(day, 'yyyy-MM-dd'))}
          onMonthChange={(month) => setCurrentMonth(month)}
          modifiers={{ active: (day) => activeDates.has(format(day, 'yyyy-MM-dd')) }}
          modifiersStyles={{
            active: { backgroundColor: 'var(--color-primary)', color: 'white', borderRadius: '50%' },
          }}
        />
      </div>
      {selectedDayEntries.length > 0 && (
        <div className="calendar-day-detail">
          <h4>{selectedDate}</h4>
          {selectedDayEntries.map(e => (
            <div key={e.id} className="calendar-day-entry">
              <span className={`calendar-entry-type type-${e.type}`}>{e.type}</span>
              <span>{e.description}</span>
              <span>{Math.round(e.durationMs / 60000)} min</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
