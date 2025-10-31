import React from 'react';
import { useGame } from '../../contexts/GameContext';
import ProgressBar from '../ui/ProgressBar';
import { VitalityIcon, FocusIcon, DisciplineIcon, CreativityIcon, WisdomIcon, CharismaIcon } from '../../screens/lib/icons';

const attributeDetails = {
    vitality: { icon: <VitalityIcon />, description: 'Physical & mental health and resilience.', color: 'bg-hp' },
    focus: { icon: <FocusIcon />, description: 'Cognitive energy & sustained attention.', color: 'bg-mana' },
    discipline: { icon: <DisciplineIcon />, description: 'Consistency & follow-through on goals.', color: 'bg-yellow-500' },
    creativity: { icon: <CreativityIcon />, description: 'Innovation & generation of new ideas.', color: 'bg-purple-500' },
    wisdom: { icon: <WisdomIcon />, description: 'Knowledge, reflection, and learning.', color: 'bg-green-500' },
    charisma: { icon: <CharismaIcon />, description: 'Communication & social influence.', color: 'bg-pink-500' },
};


const StatsTab: React.FC = () => {
    const { character } = useGame();

    type AttributeName = keyof typeof character.attributes;

    const AttributeRow: React.FC<{ name: AttributeName }> = ({ name }) => {
        const attribute = character.attributes[name];
        const details = attributeDetails[name];

        return (
            <div className="bg-primary p-4 rounded-lg">
                <div className="flex items-center mb-3">
                    <span className="text-accent w-8 h-8 mr-3">{details.icon}</span>
                    <div>
                        <h4 className="font-bold text-lg capitalize text-white">{name}</h4>
                        <p className="text-xs text-text-secondary">{details.description}</p>
                    </div>
                </div>
                <ProgressBar 
                    value={attribute.value}
                    maxValue={attribute.maxValue}
                    color={details.color}
                    label={`${attribute.value} / ${attribute.maxValue}`}
                />
            </div>
        );
    };


    return (
        <div className="space-y-4">
            <div className="text-center bg-primary p-4 rounded-lg">
                <p className="text-text-secondary">Class</p>
                <p className="font-display text-2xl text-accent">{character.class}</p>
                <p className="text-xs text-text-secondary mt-1">
                    {
                        {
                            'Warrior': 'Bonuses to Health habits and endurance.',
                            'Architect': 'XP bonus for building new systems.',
                            'Scholar': 'Extra XP from reflection and learning.',
                            'Merchant': 'Boosts to coin earnings.',
                            'Healer': 'Shared XP bonuses with friends.',
                            'Inventor': 'Faster unlocks for automation perks.'
                        }[character.class]
                    }
                </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(Object.keys(character.attributes) as AttributeName[]).map(attrName => (
                    <AttributeRow key={attrName} name={attrName} />
                ))}
            </div>

        </div>
    );
};

export default StatsTab;