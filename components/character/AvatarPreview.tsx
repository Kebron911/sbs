import React from 'react';
import { useGame } from '../../contexts/GameContext';
import Card from '../ui/Card';
import DynamicAvatar from './DynamicAvatar';

const CLASS_COLORS: { [key: string]: string } = {
  Warrior: 'bg-red-900/30',
  Architect: 'bg-blue-900/30',
  Scholar: 'bg-purple-900/30',
  Merchant: 'bg-yellow-900/30',
  Healer: 'bg-green-900/30',
  Inventor: 'bg-indigo-900/30',
};

const AvatarPreview: React.FC = () => {
  const { character } = useGame();
  const bgClass = CLASS_COLORS[character.class] || 'bg-primary';

  return (
    <Card className="sticky top-8">
        <h2 className="font-display text-2xl text-accent text-center mb-4">{character.name}</h2>
        <div className={`aspect-square rounded-lg flex items-center justify-center p-4 ${bgClass} overflow-hidden`}>
            <DynamicAvatar appearance={character.appearance} equipment={character.equipment} />
        </div>
        <div className="text-center mt-4">
            <p className="font-bold text-white text-lg">Level {character.level} {character.class}</p>
            <p className="text-sm text-text-secondary">"{character.class} of the Systems"</p>
        </div>
    </Card>
  );
};

export default AvatarPreview;