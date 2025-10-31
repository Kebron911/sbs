import React from 'react';
import Modal from '../ui/Modal';
import { useGame } from '../../contexts/GameContext';

interface DayDetailModalProps {
  date: string;
  onClose: () => void;
}

const DayDetailModal: React.FC<DayDetailModalProps> = ({ date, onClose }) => {
  const { habitLogs, habits, character, badges, getSkill, chronicleEntries, weeklyReviews } = useGame();

  const formattedDate = new Date(date + 'T00:00:00').toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const completedHabitsOnDay = habitLogs
    .filter(log => log.date === date)
    .map(log => habits.find(h => h.id === log.habitId))
    .filter(Boolean);

  const unlockedBadgesOnDay = character.unlockedBadges
    .filter(ub => ub.unlockedAt.startsWith(date))
    .map(ub => badges.find(b => b.id === ub.badgeId))
    .filter(Boolean);

  const chronicleEntryForDay = chronicleEntries.find(entry => entry.timestamp.startsWith(date));
  const weeklyReviewForDay = weeklyReviews.find(review => review.date === date);

  return (
    <Modal isOpen={true} onClose={onClose} title={`Activity for ${formattedDate}`}>
      <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
        {/* Weekly Review Section */}
        {weeklyReviewForDay && (
            <div>
                <h4 className="font-bold text-accent mb-2">Weekly Review</h4>
                <div className="p-3 bg-primary rounded-lg space-y-3 text-sm">
                    <div>
                        <p className="font-semibold text-text-secondary">Wins:</p>
                        <p className="text-text-main whitespace-pre-wrap">{weeklyReviewForDay.wins}</p>
                    </div>
                     <div>
                        <p className="font-semibold text-text-secondary">Lessons:</p>
                        <p className="text-text-main whitespace-pre-wrap">{weeklyReviewForDay.lessons}</p>
                    </div>
                     <div>
                        <p className="font-semibold text-text-secondary">Goals for Next Week:</p>
                        <p className="text-text-main whitespace-pre-wrap">{weeklyReviewForDay.goals}</p>
                    </div>
                </div>
            </div>
        )}
        
        {/* Chronicle Section */}
        {chronicleEntryForDay && (
             <div>
                <h4 className="font-bold text-accent mb-2">Chronicle Entry</h4>
                 <div className="p-3 bg-primary rounded-lg">
                    <p className="text-sm text-text-secondary mb-2 italic">"{chronicleEntryForDay.summary}"</p>
                    <p className="text-sm text-text-main whitespace-pre-wrap">{chronicleEntryForDay.content}</p>
                    <p className="text-right text-xs font-bold text-mana mt-2">+{chronicleEntryForDay.wisdomAwarded} Wisdom</p>
                 </div>
             </div>
        )}

        {/* Habits Section */}
        {completedHabitsOnDay.length > 0 && (
          <div>
            <h4 className="font-bold text-accent mb-2">Habits Completed</h4>
            <div className="space-y-2">
              {completedHabitsOnDay.map(habit => (
                <div key={habit!.id} className="flex items-center p-3 bg-primary rounded-lg">
                  <span className="text-2xl mr-3">{getSkill(habit!.skillId)?.icon}</span>
                  <div className="flex-1">
                    <p className="font-bold text-white">{habit!.name}</p>
                    <p className="text-xs text-text-secondary">Related Skill: {getSkill(habit!.skillId)?.name}</p>
                  </div>
                  <span className="text-sm font-bold text-xp">+{habit!.xpValue} XP</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Badges Section */}
        {unlockedBadgesOnDay.length > 0 && (
          <div>
            <h4 className="font-bold text-accent mb-2">Badges Unlocked</h4>
            <div className="space-y-2">
              {unlockedBadgesOnDay.map(badge => (
                <div key={badge!.id} className="flex items-center p-3 bg-primary rounded-lg">
                  <span className="text-3xl mr-3">{badge!.icon}</span>
                  <div className="flex-1">
                    <p className="font-bold text-white">{badge!.name}</p>
                    <p className="text-xs text-text-secondary">{badge!.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {completedHabitsOnDay.length === 0 && unlockedBadgesOnDay.length === 0 && !chronicleEntryForDay && !weeklyReviewForDay && (
            <p className="text-center text-text-secondary py-8">No recorded activity for this day.</p>
        )}
      </div>
    </Modal>
  );
};

export default DayDetailModal;