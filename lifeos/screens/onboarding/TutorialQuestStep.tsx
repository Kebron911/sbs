import React from 'react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

interface Props {
  onNext: () => void;
}

const TutorialQuestStep: React.FC<Props> = ({ onNext }) => {
  return (
    <Card title="Your First Quest" className="animate-fade-in">
        <p className="text-text-secondary mb-6">
            Every hero's journey begins with a single step. This is yours. Completing quests and habits is how you'll grow stronger in this world.
        </p>
        <div className="p-4 bg-primary rounded-lg border border-border-color mb-6">
            <h4 className="font-bold text-xl text-white">Quest: The Journey Begins</h4>
            <p className="text-sm text-text-secondary mt-1">Set up your LifeOS by completing your first habit and task.</p>
            <div className="mt-4 space-y-2 text-sm">
                <p className="flex items-center"><span className="font-bold text-xp mr-2">+50 XP:</span> Experience points to level up your character.</p>
                <p className="flex items-center"><span className="font-bold text-coins mr-2">+25 🪙:</span> Coins to spend in the Marketplace.</p>
                <p className="flex items-center"><span className="font-bold text-hp mr-2">-5 ❤️:</span> Failing quests or bad habits costs Health.</p>
            </div>
        </div>
        <Button onClick={onNext} className="w-full">I Understand, Let's Go!</Button>
    </Card>
  );
};

export default TutorialQuestStep;
