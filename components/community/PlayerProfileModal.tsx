import React from 'react';
import Modal from '../ui/Modal';
import { Character } from '../../types';
import { useGame } from '../../contexts/GameContext';
import DynamicAvatar from '../character/DynamicAvatar';
import ProgressBar from '../ui/ProgressBar';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts';

interface PlayerProfileModalProps {
  player: Character;
  onClose: () => void;
}

const PlayerProfileModal: React.FC<PlayerProfileModalProps> = ({ player, onClose }) => {
    const { badges } = useGame();
    const unlockedPlayerBadges = player.unlockedBadges.slice(0, 5).map(ub => badges.find(b => b.id === ub.badgeId)).filter(Boolean);

    const attributeData = Object.entries(player.attributes).map(([key, value]) => ({
        subject: key.charAt(0).toUpperCase() + key.slice(1),
        A: value.value,
        fullMark: value.maxValue,
    }));

    return (
        <Modal isOpen={true} onClose={onClose} title={`${player.name}'s Profile`}>
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                <div className="flex-shrink-0 text-center">
                    <div className="w-32 h-32 rounded-full border-4 border-accent bg-primary overflow-hidden mx-auto">
                        <DynamicAvatar appearance={player.appearance} equipment={player.equipment} />
                    </div>
                    <h2 className="font-display text-2xl text-white mt-3">{player.name}</h2>
                    <p className="text-text-secondary">Level {player.level} {player.class}</p>
                    <div className="w-48 mx-auto mt-4 space-y-2">
                        <ProgressBar value={player.hp} maxValue={player.maxHp} color="bg-hp" label="HP" />
                        <ProgressBar value={player.xp} maxValue={player.xpToNextLevel} color="bg-xp" label="XP" />
                    </div>
                </div>
                <div className="flex-1 w-full">
                    <h3 className="font-bold text-accent mb-2">Attributes</h3>
                     <div style={{ width: '100%', height: 200 }}>
                        <ResponsiveContainer>
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={attributeData}>
                                <PolarGrid stroke="var(--color-border-color)" />
                                <PolarAngleAxis dataKey="subject" stroke="var(--color-text-secondary)" fontSize={12} />
                                <Radar dataKey="A" stroke="var(--color-accent)" fill="var(--color-accent)" fillOpacity={0.6} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                     <h3 className="font-bold text-accent mb-2 mt-4">Top Badges</h3>
                     <div className="flex flex-wrap gap-4">
                        {unlockedPlayerBadges.map(badge => (
                            <div key={badge!.id} className="text-center" title={badge!.name}>
                                <div className="text-4xl">{badge!.icon}</div>
                                <p className="text-xs w-16 truncate">{badge!.name}</p>
                            </div>
                        ))}
                        {unlockedPlayerBadges.length === 0 && <p className="text-sm text-text-secondary">No badges to display.</p>}
                     </div>
                </div>
            </div>
        </Modal>
    );
};

export default PlayerProfileModal;