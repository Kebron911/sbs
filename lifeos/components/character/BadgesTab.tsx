import React from 'react';
import { useGame } from '../../contexts/GameContext';
import { Badge } from '../../types';

interface BadgesTabProps {
    onBadgeDoubleClick: (badge: Badge) => void;
}

const BadgesTab: React.FC<BadgesTabProps> = ({ onBadgeDoubleClick }) => {
    const { badges, character } = useGame();
    const unlockedBadgeIds = new Set(character.unlockedBadges.map(b => b.badgeId));

    const getCriteriaText = (badge: Badge) => {
        switch (badge.criteria.type) {
            case 'level':
                return `Reach Level ${badge.criteria.value}.`;
            case 'questsCompleted':
                return `Complete ${badge.criteria.value} quests.`;
            case 'habitsCompleted':
                return `Complete ${badge.criteria.value} habit check-ins.`;
            case 'streak':
                 return `Achieve a ${badge.criteria.value}-day streak.`;
            default:
                return 'Unlock criteria unknown.';
        }
    };

    return (
        <div className="space-y-4">
            <h2 className="font-display text-xl text-accent">Your Achievements</h2>
             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[60vh] overflow-y-auto pr-2">
                {badges.map(badge => {
                    const isUnlocked = unlockedBadgeIds.has(badge.id);
                    return (
                        <div
                            key={badge.id}
                            onDoubleClick={() => onBadgeDoubleClick(badge)}
                            className={`p-4 rounded-lg border-2 flex flex-col items-center justify-center aspect-square text-center transition-all duration-300 cursor-pointer
                                        ${isUnlocked ? 'border-accent bg-accent/10' : 'border-border-color bg-primary filter grayscale'}`}
                            title={isUnlocked ? 'Double-click for details' : getCriteriaText(badge)}
                        >
                            <div className={`text-5xl transition-transform duration-300 ${isUnlocked ? 'transform scale-110' : ''}`}>{badge.icon}</div>
                            <p className="font-bold text-sm mt-2 text-white">{badge.name}</p>
                            <p className="text-xs text-text-secondary mt-1 h-10">{isUnlocked ? badge.description : 'Locked'}</p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default BadgesTab;