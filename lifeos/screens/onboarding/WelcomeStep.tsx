import React from 'react';
import Button from '../../components/ui/Button';

interface Props {
  onNext: () => void;
}

const WelcomeStep: React.FC<Props> = ({ onNext }) => {
  return (
    <div className="text-center p-8 bg-secondary rounded-lg border border-border-color animate-fade-in">
      <h1 className="font-display text-3xl md:text-4xl text-accent mb-4">Welcome to LifeOS</h1>
      <p className="text-text-secondary text-lg mb-8 leading-relaxed">
        You awaken in the Land of Growth, a realm where your daily actions shape your destiny. Your habits are your spells, your tasks are your quests. It's time to forge your legend.
      </p>
      <Button onClick={onNext} className="w-full md:w-auto">
        Begin Your Journey
      </Button>
    </div>
  );
};

export default WelcomeStep;
