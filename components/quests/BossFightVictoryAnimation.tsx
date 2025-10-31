import React from 'react';
import { Reward } from '../../types';
import { useGame } from '../../contexts/GameContext';
import Button from '../ui/Button';

interface BossFightVictoryAnimationProps {
  reward: Reward;
}

const BossFightVictoryAnimation: React.FC<BossFightVictoryAnimationProps> = ({ reward }) => {
  const { endBossFight } = useGame();

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[95] p-4 animate-fade-in">
      <div className="bg-secondary border-2 border-accent rounded-lg shadow-glow-accent text-center p-8 max-w-md w-full">
        <h2 className="font-display text-6xl text-accent mb-4" style={{ animation: 'thump 1s ease-in-out' }}>VICTORY!</h2>
        <p className="text-text-secondary mb-6">You have defeated a major challenge and earned a great reward!</p>
        <div className="space-y-4 mb-8">
          <div className="bg-primary p-4 rounded-lg border border-xp">
            <p className="font-display text-3xl text-xp">+{reward.xp} XP</p>
            <p className="text-sm text-text-secondary">Experience Gained (2x Bonus)</p>
          </div>
          <div className="bg-primary p-4 rounded-lg border border-coins">
            <p className="font-display text-3xl text-coins">+{reward.coins} 🪙</p>
            <p className="text-sm text-text-secondary">Coins Earned (3x Bonus)</p>
          </div>
        </div>
        <Button onClick={endBossFight} className="w-full">
          Claim Rewards
        </Button>
      </div>
      <style>{`
        @keyframes thump {
          0% { transform: scale(1); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default BossFightVictoryAnimation;