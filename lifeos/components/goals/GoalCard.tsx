import React, { useMemo } from 'react';
import { Goal, QuestStatus } from '../../types';
import { useGame } from '../../contexts/GameContext';
import Card from '../ui/Card';
import ProgressBar from '../ui/ProgressBar';

interface GoalCardProps {
  goal: Goal;
}

const GoalCard: React.FC<GoalCardProps> = ({ goal }) => {
    const { quests, getSkill } = useGame();

    const linkedQuests = useMemo(() => {
        return quests.filter(p => p.goalId === goal.id);
    }, [quests, goal.id]);

    const completedQuests = useMemo(() => {
        return linkedQuests.filter(p => p.status === QuestStatus.ARCHIVED);
    }, [linkedQuests]);

    const progress = useMemo(() => {
        if (linkedQuests.length === 0) return 0;
        return (completedQuests.length / linkedQuests.length) * 100;
    }, [completedQuests, linkedQuests]);

    return (
        <Card>
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-display text-2xl text-accent flex items-center">
                        <span className="text-4xl mr-3">{goal.icon}</span> {goal.name}
                    </h3>
                    <p className="text-text-secondary mt-2">{goal.description}</p>
                </div>
                <div className="text-right flex-shrink-0 ml-4">
                    <p className="text-sm font-bold text-white">Target Date</p>
                    <p className="text-xs text-text-secondary">{new Date(goal.targetDate).toLocaleDateString()}</p>
                </div>
            </div>

            <div className="my-4">
                <ProgressBar value={progress} maxValue={100} color="bg-accent" label="Progress" />
            </div>

            <div>
                <h4 className="font-bold text-text-main mb-2">Linked Quests ({completedQuests.length}/{linkedQuests.length})</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                    {linkedQuests.length > 0 ? (
                        linkedQuests.map(p => (
                            <div key={p.id} className={`flex items-center p-2 rounded ${p.status === QuestStatus.ARCHIVED ? 'bg-green-500/10' : 'bg-primary'}`}>
                                <span className={`mr-2 ${p.status === QuestStatus.ARCHIVED ? 'text-green-400' : 'text-text-secondary'}`}>
                                    {p.status === QuestStatus.ARCHIVED ? '✅' : '⏳'}
                                </span>
                                <span className={`mr-2`}>{getSkill(p.skillId)?.icon}</span>
                                <p className={`flex-1 text-sm ${p.status === QuestStatus.ARCHIVED ? 'line-through text-text-secondary' : 'text-text-main'}`}>
                                    {p.name}
                                </p>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-text-secondary text-center py-2">No quests linked to this goal yet.</p>
                    )}
                </div>
            </div>
        </Card>
    );
};

export default GoalCard;