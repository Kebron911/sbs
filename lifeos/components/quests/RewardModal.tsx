
import React from 'react';
import { Reward } from '../../types';
import { useGame } from '../../contexts/GameContext';
import Button from '../ui/Button';

interface RewardModalProps {
  reward: Reward;
}

const RewardModal: React.FC<RewardModalProps> = ({ reward }) => {
  const { hideRewardModal } = useGame();

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-secondary border-2 border-accent rounded-lg shadow-glow-accent text-center p-8 max-w-sm w-full">
        <h2 className="font-display text-3xl text-accent mb-4">Quest Complete!</h2>
        <p className="text-text-secondary mb-6">Your dedication has been rewarded. Well done!</p>
        <div className="space-y-4 mb-8">
          <div className="bg-primary p-4 rounded-lg">
            <p className="font-display text-2xl text-xp">+{reward.xp} XP</p>
            <p className="text-sm text-text-secondary">Experience Gained</p>
          </div>
          <div className="bg-primary p-4 rounded-lg">
            <p className="font-display text-2xl text-coins">+{reward.coins} 🪙</p>
            <p className="text-sm text-text-secondary">Coins Earned</p>
          </div>
        </div>
        <Button onClick={hideRewardModal} className="w-full">
          Continue
        </Button>
      </div>
    </div>
  );
};

export default RewardModal;