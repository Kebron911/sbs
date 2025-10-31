import React, { useEffect } from 'react';
import { useGame } from '../../contexts/GameContext';

interface BattleAnimationProps {
  hpLoss: number;
}

const BattleAnimation: React.FC<BattleAnimationProps> = ({ hpLoss }) => {
  const { hideBattleAnimation } = useGame();

  useEffect(() => {
    const timer = setTimeout(() => {
      hideBattleAnimation();
    }, 1500); // Animation duration

    return () => clearTimeout(timer);
  }, [hideBattleAnimation]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
      <div className="absolute inset-0 bg-red-500/50 animate-ping opacity-0"></div>
      <div className="animate-fade-in">
        <p className="font-display text-6xl text-hp drop-shadow-lg" style={{textShadow: '2px 2px #000'}}>
          -{hpLoss} HP
        </p>
      </div>
    </div>
  );
};

export default BattleAnimation;
