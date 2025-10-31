import React from 'react';
import { useGame } from '../../contexts/GameContext';
import { QuestStatus } from '../../types';
import Button from './Button';

const DailyBriefingModal: React.FC = () => {
  const { character, quests, habits, dailyBriefing, claimDailyBonus } = useGame();

  if (!dailyBriefing) return null;

  const activeQuestsCount = quests.filter(p => p.status === QuestStatus.IN_PROGRESS).length;
  const maxStreak = habits.reduce((max, h) => Math.max(max, h.streak), 0);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-secondary border-2 border-accent rounded-lg shadow-glow-accent text-center p-8 max-w-md w-full">
        <h2 className="font-display text-3xl text-accent mb-4">Daily Briefing</h2>
        <p className="text-text-secondary mb-6">Welcome back, {character.name}. Here's your status for today.</p>
        
        <div className="space-y-4 mb-8 text-left">
            <div className="bg-primary p-4 rounded-lg">
                <p className="text-lg font-bold text-white">{activeQuestsCount} Active Quests</p>
                <p className="text-sm text-text-secondary">Ready for you to tackle.</p>
            </div>
            <div className="bg-primary p-4 rounded-lg">
                <p className="text-lg font-bold text-white">{maxStreak} Day Streak 🔥</p>
                <p className="text-sm text-text-secondary">Your highest current habit streak. Keep it up!</p>
            </div>
             <div className="bg-primary p-4 rounded-lg border border-coins">
                <p className="text-lg font-bold text-white">Daily Login Bonus</p>
                <p className="text-sm text-text-secondary">
                    +{dailyBriefing.bonus.xp} XP and +{dailyBriefing.bonus.coins} 🪙 for starting your day.
                </p>
            </div>
        </div>

        <Button onClick={claimDailyBonus} className="w-full">
          Start My Day!
        </Button>
      </div>
    </div>
  );
};

export default DailyBriefingModal;