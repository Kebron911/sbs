import React from 'react';
// FIX: Import CartesianGrid to resolve the 'Cannot find name' error.
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import Card from '../ui/Card';
import { useGame } from '../../contexts/GameContext';
import { HabitType } from '../../types';

const AnalyticsTab: React.FC = () => {
    const { character, skills, habits, habitLogs } = useGame();

    const attributeData = Object.entries(character.attributes).map(([key, value]) => ({
        subject: key.charAt(0).toUpperCase() + key.slice(1),
        A: value.value,
        fullMark: value.maxValue,
    }));
    
    const skillData = skills.map(skill => ({
        name: skill.name,
        level: skill.level,
    }));

    const calculateConsistency = (habitId: string): number => {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        let completionCount = 0;
        for (let i = 0; i < 30; i++) {
            const date = new Date(thirtyDaysAgo);
            date.setDate(date.getDate() + i);
            const dateString = date.toISOString().split('T')[0];
            if (habitLogs.some(log => log.habitId === habitId && log.date === dateString)) {
                completionCount++;
            }
        }
        return Math.round((completionCount / 30) * 100);
    };

    const goodHabits = habits.filter(h => h.type === HabitType.GOOD);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card title="Character Attributes" className="lg:col-span-2">
                <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={attributeData}>
                            <PolarGrid stroke="var(--color-border-color)" />
                            <PolarAngleAxis dataKey="subject" stroke="var(--color-text-secondary)" />
                            <Radar name={character.name} dataKey="A" stroke="var(--color-accent)" fill="var(--color-accent)" fillOpacity={0.6} />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            <Card title="Skill Levels">
                <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                        <BarChart data={skillData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                             <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-color)" />
                             <XAxis type="number" stroke="var(--color-text-secondary)" />
                             <YAxis type="category" dataKey="name" stroke="var(--color-text-secondary)" width={80} />
                             <Tooltip contentStyle={{ backgroundColor: 'var(--color-secondary)', border: '1px solid var(--color-border-color)' }} />
                             <Bar dataKey="level" fill="var(--color-mana)" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            <Card title="Habit Consistency (Last 30 Days)">
                 <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                    {goodHabits.map(habit => {
                        const consistency = calculateConsistency(habit.id);
                        return (
                            <div key={habit.id}>
                                <div className="flex justify-between items-center text-sm mb-1">
                                    <span className="font-bold text-text-main">{habit.name}</span>
                                    <span className="text-text-secondary">{consistency}%</span>
                                </div>
                                <div className="w-full bg-primary rounded-full h-2.5">
                                    <div className="bg-accent h-2.5 rounded-full" style={{ width: `${consistency}%` }}></div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </Card>
        </div>
    );
};

export default AnalyticsTab;