import React from 'react';
import { useGame } from '../../contexts/GameContext';
import { Quest, Objective } from '../../types';
import Button from '../ui/Button';

const ObjectiveItem: React.FC<{ objective: Objective, questId: string }> = ({ objective, questId }) => {
    const { toggleObjective, getLoadingState } = useGame();
    const isLoading = getLoadingState(`objective-${objective.id}`);

    return (
        <div className="flex items-center p-3 bg-background/50 rounded-lg border border-border-color">
            <input 
                type="checkbox" 
                checked={objective.completed}
                onChange={() => toggleObjective(questId, objective.id)}
                disabled={isLoading}
                className="w-6 h-6 rounded bg-primary border-border-color text-accent focus:ring-accent disabled:opacity-50"
            />
            <label className={`ml-4 flex-1 text-lg ${objective.completed ? 'line-through text-text-secondary' : 'text-text-main'}`}>
                {objective.name}
            </label>
            <span className="text-sm font-bold text-xp">+{objective.xp * 2} XP</span>
        </div>
    );
};

const BossFightView: React.FC<{ quests: Quest[] }> = ({ quests }) => {
    const { activeBossFight, endBossFight } = useGame();
    const quest = quests.find(q => q.id === activeBossFight);

    if (!quest) return null;

    const completedObjectives = quest.objectives.filter(t => t.completed).length;
    const totalObjectives = quest.objectives.length;
    const progress = totalObjectives > 0 ? (completedObjectives / totalObjectives) * 100 : 0;

    return (
        <div className="fixed inset-0 bg-background/95 z-[90] flex flex-col items-center justify-center p-4 animate-fade-in" style={{ backdropFilter: 'blur(10px)' }}>
            <div className="w-full max-w-2xl text-center">
                <p className="font-display text-accent text-2xl">BOSS FIGHT</p>
                <h1 className="font-display text-4xl md:text-5xl text-white my-4">{quest.name}</h1>
                <p className="text-text-secondary mb-8">{quest.description}</p>
                
                <div className="w-full bg-primary rounded-full h-4 border-2 border-hp mb-8">
                    <div className="bg-hp h-full rounded-full transition-all duration-500" style={{ width: `${100 - progress}%` }}></div>
                </div>

                <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2 text-left">
                    {quest.objectives.map(objective => (
                        <ObjectiveItem key={objective.id} objective={objective} questId={quest.id} />
                    ))}
                </div>

                <div className="mt-8">
                    <Button variant="secondary" onClick={endBossFight}>
                        Abandon Fight
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default BossFightView;