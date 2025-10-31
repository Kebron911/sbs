import React, { useState, useMemo, useEffect } from 'react';
import { useGame } from '../../contexts/GameContext';

interface HistoryCalendarProps {
  onDayClick: (date: string) => void;
  initialDate: string | null;
}

const HistoryCalendar: React.FC<HistoryCalendarProps> = ({ onDayClick, initialDate }) => {
  const { habitLogs, habits, character, badges, getSkill, chronicleEntries, weeklyReviews } = useGame();
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    if (initialDate) {
      setCurrentDate(new Date(initialDate));
    }
  }, [initialDate]);

  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

  const daysInMonth = useMemo(() => {
    const days = [];
    const startDay = firstDayOfMonth.getDay();
    const totalDays = lastDayOfMonth.getDate();
    
    for (let i = 0; i < startDay; i++) {
      days.push({ key: `blank-start-${i}`, day: null, date: null });
    }
    for (let day = 1; day <= totalDays; day++) {
      days.push({ key: day, day, date: new Date(currentDate.getFullYear(), currentDate.getMonth(), day) });
    }
     while (days.length % 7 !== 0) {
        days.push({ key: `blank-end-${days.length}`, day: null, date: null });
    }
    return days;
  }, [currentDate]);

  const changeMonth = (offset: number) => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
  };
  
  const getBadgeById = (id: string) => badges.find(b => b.id === id);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <button onClick={() => changeMonth(-1)} className="font-bold p-2 rounded-lg hover:bg-primary">&lt;</button>
        <h2 className="font-display text-xl text-white">
          {currentDate.toLocaleString('default', { month: 'long' })} {currentDate.getFullYear()}
        </h2>
        <button onClick={() => changeMonth(1)} className="font-bold p-2 rounded-lg hover:bg-primary">&gt;</button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center font-bold text-text-secondary text-sm">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day} className="py-2">{day}</div>)}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {daysInMonth.map(({ key, day, date }) => {
          if (!day || !date) {
            return <div key={key} className="h-24 md:h-28"></div>;
          }
          
          const dateString = date.toISOString().split('T')[0];
          const completedHabitsOnDay = habitLogs
            .filter(log => log.date === dateString)
            .map(log => habits.find(h => h.id === log.habitId))
            .filter(Boolean);
            
          const unlockedBadgesOnDay = character.unlockedBadges
            .filter(ub => ub.unlockedAt.startsWith(dateString))
            .map(ub => getBadgeById(ub.badgeId))
            .filter(Boolean);
          
          const hasChronicleEntry = chronicleEntries.some(j => j.timestamp.startsWith(dateString));
          const hasWeeklyReview = weeklyReviews.some(wr => wr.date === dateString);

          const today = new Date();
          const isToday = date.toISOString().split('T')[0] === today.toISOString().split('T')[0];
          
          const hasActivity = completedHabitsOnDay.length > 0 || unlockedBadgesOnDay.length > 0 || hasChronicleEntry || hasWeeklyReview;

          const allIcons = [
              ...completedHabitsOnDay.map(h => ({id: h!.id, icon: getSkill(h!.skillId)?.icon, name: h!.name })),
              ...unlockedBadgesOnDay.map(b => ({id: b!.id, icon: b!.icon, name: b!.name})),
              ...(hasChronicleEntry ? [{ id: 'chronicle', icon: '📝', name: 'Chronicle Entry' }] : []),
              ...(hasWeeklyReview ? [{ id: 'review', icon: '📋', name: 'Weekly Review' }] : [])
          ];

          return (
            <div
              key={key}
              onClick={() => hasActivity && onDayClick(dateString)}
              className={`h-24 md:h-28 bg-primary border border-border-color rounded-md p-1 relative group ${isToday ? 'border-accent' : ''} ${hasActivity ? 'cursor-pointer hover:bg-primary/70 transition-colors' : ''}`}
            >
              <span className={`text-xs ${isToday ? 'text-accent font-bold' : 'text-text-secondary'}`}>{day}</span>
              <div className="flex flex-wrap gap-1 mt-1">
                  {allIcons.slice(0, 4).map(item => (
                      <span key={item.id} className="text-sm" title={item.name}>{item.icon}</span>
                  ))}
              </div>
              {allIcons.length > 4 && <span className="text-[10px] text-text-secondary absolute bottom-1 right-1">...</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HistoryCalendar;