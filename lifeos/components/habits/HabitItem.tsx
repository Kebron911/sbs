import React from 'react';
import { Habit, HabitType } from '../../types';
import { useGame } from '../../contexts/GameContext';

interface HabitItemProps {
    habit: Habit;
    onEdit: (habit: Habit) => void;
}

const HabitItem: React.FC<HabitItemProps> = ({ habit, onEdit }) => {
    const { getSkill, checkInHabit, fightAffliction, habitLogs, habits, getLoadingState } = useGame();
    const skill = getSkill(habit.skillId);
    const isGood = habit.type === HabitType.GOOD;
    const isLoading = getLoadingState(`habit-${habit.id}`);

    const todayStr = new Date().toISOString().split('T')[0];
    const isCompletedToday = habitLogs.some(log => log.habitId === habit.id && log.date === todayStr);

    const stackedAfterHabit = habit.stackWithHabitId ? habits.find(h => h.id === habit.stackWithHabitId) : null;

    const handleAction = () => {
        if (isLoading) return;
        if (isGood) {
            checkInHabit(habit.id);
        } else {
            fightAffliction(habit.id);
        }
    };

    return (
        <div className="flex items-center justify-between p-3 bg-primary rounded-lg border border-border-color">
            <div className="flex items-center">
                <span className="text-2xl mr-4">{skill?.icon}</span>
                <div>
                    <p className="font-bold text-white">{habit.name}</p>
                    <div className="flex items-center text-xs text-text-secondary">
                        {isGood ? (
                            <>
                                <span>Streak: {habit.streak} 🔥 | +{habit.xpValue} XP</span>
                                {stackedAfterHabit && <span className="ml-2 pl-2 border-l border-border-color">Stacked After: "{stackedAfterHabit.name}"</span>}
                            </>
                        ) : (
                            <span>Lose {habit.hpLoss} HP</span>
                        )}
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-2">
                 <button onClick={() => onEdit(habit)} className="p-1 text-text-secondary hover:text-white disabled:opacity-50" disabled={isLoading}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732z" />
                    </svg>
                </button>
                <button
                    onClick={handleAction}
                    disabled={(isGood && isCompletedToday) || isLoading}
                    className={`px-4 py-2 rounded-lg font-bold transition-all duration-200 text-sm flex items-center justify-center ${isGood ? 'w-28' : 'w-32'}
                    ${isGood ? 'bg-xp/80 hover:bg-xp text-white' : 'bg-hp/80 hover:bg-hp text-white'} 
                    disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-600`}
                >
                    {isLoading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : isGood ? (isCompletedToday ? 'Completed' : 'Check-in') : 'Lost the Fight'}
                </button>
            </div>
        </div>
    );
};

export default HabitItem;