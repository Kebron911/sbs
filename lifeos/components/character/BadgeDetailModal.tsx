import React from 'react';
import Modal from '../ui/Modal';
import { Badge } from '../../types';
import { useGame } from '../../contexts/GameContext';

interface BadgeDetailModalProps {
  badge: Badge;
  onClose: () => void;
}

const BadgeDetailModal: React.FC<BadgeDetailModalProps> = ({ badge, onClose }) => {
    const { items, gear } = useGame();
    const allItems = [...items, ...gear];

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

    const rewardItem = badge.reward.itemId ? allItems.find(i => i.id === badge.reward.itemId) : null;

    return (
        <Modal isOpen={true} onClose={onClose} title="Badge Details">
            <div className="text-center">
                <div className="text-7xl mb-4">{badge.icon}</div>
                <h2 className="font-display text-2xl text-accent">{badge.name}</h2>
                <p className="text-text-secondary mt-2">{badge.description}</p>

                <div className="my-6 text-left p-4 bg-primary rounded-lg">
                    <h4 className="font-bold text-white mb-2">Unlock Criteria:</h4>
                    <p className="text-text-main">{getCriteriaText(badge)}</p>
                </div>

                <div className="my-6 text-left p-4 bg-primary rounded-lg">
                    <h4 className="font-bold text-white mb-2">Rewards:</h4>
                    <div className="space-y-2">
                        {badge.reward.xp > 0 && <p className="text-xp font-bold">+{badge.reward.xp} XP</p>}
                        {badge.reward.coins > 0 && <p className="text-coins font-bold">+{badge.reward.coins} Coins 🪙</p>}
                        {rewardItem && (
                            <div className="flex items-center">
                                <span className="text-2xl mr-2">{rewardItem.icon}</span>
                                <div>
                                    <p className="text-white font-bold">Item: {rewardItem.name}</p>
                                    <p className="text-xs text-text-secondary">{rewardItem.description}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default BadgeDetailModal;