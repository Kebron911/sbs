import React, { useEffect } from 'react';
import { useGame } from '../../contexts/GameContext';
import { Badge } from '../../types';

interface BadgeNotificationProps {
  badge: Badge;
}

const BadgeNotification: React.FC<BadgeNotificationProps> = ({ badge }) => {
  const { hideBadgeNotification } = useGame();

  useEffect(() => {
    const timer = setTimeout(() => {
      hideBadgeNotification();
    }, 4000); // Notification duration

    return () => clearTimeout(timer);
  }, [hideBadgeNotification]);

  return (
    <div 
        className="fixed bottom-5 right-5 md:bottom-10 md:right-10 z-[100] p-4 bg-secondary border-2 border-accent rounded-lg shadow-glow-accent w-full max-w-sm animate-fade-in"
        onClick={hideBadgeNotification}
        style={{ cursor: 'pointer' }}
    >
      <div className="flex items-center">
        <div className="text-5xl mr-4">{badge.icon}</div>
        <div>
            <h3 className="font-display text-lg text-accent">Badge Unlocked!</h3>
            <p className="font-bold text-white">{badge.name}</p>
            <div className="flex items-center text-xs mt-2">
                {badge.reward.xp > 0 && <span className="text-xp mr-3">+{badge.reward.xp} XP</span>}
                {badge.reward.coins > 0 && <span className="text-coins">+{badge.reward.coins} 🪙</span>}
            </div>
        </div>
      </div>
    </div>
  );
};

export default BadgeNotification;
