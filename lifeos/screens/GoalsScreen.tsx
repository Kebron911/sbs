import React, { useState } from 'react';
import { useGame } from '../contexts/GameContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import GoalCard from '../components/goals/GoalCard';
import AddGoalModal from '../components/goals/AddGoalModal';

const GoalsScreen: React.FC = () => {
    const { goals } = useGame();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <h1 className="font-display text-3xl md:text-4xl text-white">Your Goals</h1>
                <Button onClick={() => setIsAddModalOpen(true)}>Set a New Goal</Button>
            </div>

            <div className="space-y-6">
                {goals.length > 0 ? (
                    goals.map(goal => <GoalCard key={goal.id} goal={goal} />)
                ) : (
                    <Card className="text-center py-12">
                        <p className="text-2xl mb-2">🎯</p>
                        <h3 className="font-bold text-xl text-white">No Goals Set</h3>
                        <p className="text-text-secondary mt-2">Set a high-level goal to give your quests a greater purpose.</p>
                    </Card>
                )}
            </div>

            <AddGoalModal 
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
            />
        </div>
    );
};

export default GoalsScreen;