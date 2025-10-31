import React from 'react';
import { useGame } from '../contexts/GameContext';
import Card from '../components/ui/Card';
import ProgressBar from '../components/ui/ProgressBar';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import DynamicAvatar from '../components/character/DynamicAvatar';
import { HabitType } from '../types';

const xpData = [
  { name: 'Day 1', xp: 40 },
  { name: 'Day 2', xp: 30 },
  { name: 'Day 3', xp: 50 },
  { name: 'Day 4', xp: 45 },
  { name: 'Day 5', xp: 60 },
  { name: 'Day 6', xp: 75 },
  { name: 'Day 7', xp: 90 },
];

const DashboardScreen: React.FC = () => {
  const { character, events, habits, quests } = useGame();

  const goodHabitsCount = habits.filter(h => h.type === HabitType.GOOD).length;
  const afflictionsCount = habits.filter(h => h.type === HabitType.AFFLICTION).length;
  const activeQuestsCount = quests.filter(q => q.status === 'IN_PROGRESS').length;
  const skillsCount = useGame().skills.length;

  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl md:text-4xl text-white">Welcome back, {character.name}!</h1>

      {/* Grid for stats and character */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Character Card */}
        <Card className="lg:col-span-1 flex flex-col items-center justify-center space-y-4">
          <div className="w-32 h-32 rounded-full border-4 border-accent shadow-glow-accent bg-primary overflow-hidden">
            <DynamicAvatar appearance={character.appearance} equipment={character.equipment} />
          </div>
          <div className="text-center">
            <h2 className="font-display text-2xl text-white">{character.name}</h2>
            <p className="text-text-secondary">Level {character.level} {character.class}</p>
          </div>
          <div className="w-full space-y-3">
             <ProgressBar value={character.hp} maxValue={character.maxHp} color="bg-hp" label="HP" />
             <ProgressBar value={character.xp} maxValue={character.xpToNextLevel} color="bg-xp" label="XP" />
          </div>
        </Card>

        {/* Stats Grid */}
        <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-4">
            <Card className="text-center bg-primary">
                <p className="text-4xl font-bold text-coins">{character.coins}</p>
                <p className="text-text-secondary mt-2">Coins</p>
            </Card>
            <Card className="text-center bg-primary">
                <p className="text-4xl font-bold text-accent">{character.streak}🔥</p>
                <p className="text-text-secondary mt-2">Daily Streak</p>
            </Card>
            <Card className="text-center bg-primary">
                <p className="text-4xl font-bold text-mana">{activeQuestsCount}</p>
                <p className="text-text-secondary mt-2">Quests Active</p>
            </Card>
             <Card className="text-center bg-primary">
                <p className="text-4xl font-bold text-hp">{afflictionsCount}</p>
                <p className="text-text-secondary mt-2">Afflictions</p>
            </Card>
            <Card className="text-center bg-primary">
                <p className="text-4xl font-bold text-xp">{goodHabitsCount}</p>
                <p className="text-text-secondary mt-2">Good Habits</p>
            </Card>
             <Card className="text-center bg-primary">
                <p className="text-4xl font-bold text-white">{skillsCount}</p>
                <p className="text-text-secondary mt-2">Skills</p>
            </Card>
        </div>
      </div>
      
      {/* Analytics and Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="XP Analytics (Last 7 Days)">
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={xpData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(224, 224, 224, 0.2)" />
                <XAxis dataKey="name" stroke="#a7a9be" />
                <YAxis stroke="#a7a9be" />
                <Tooltip contentStyle={{ backgroundColor: '#16213E', border: '1px solid rgba(224, 224, 224, 0.2)' }} />
                <Legend />
                <Line type="monotone" dataKey="xp" stroke="#4caf50" strokeWidth={2} activeDot={{ r: 8 }} dot={{ fill: '#4caf50' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
        
        <Card title="Recent Logs">
            <div className="space-y-3 max-h-80 overflow-y-auto">
                {events.map(event => (
                    <div key={event.id} className="flex items-center p-2 bg-primary rounded-md">
                        <span className={`w-2 h-2 rounded-full mr-3 ${event.type === 'xp_gain' ? 'bg-xp' : event.type === 'hp_loss' ? 'bg-hp' : 'bg-coins'}`}></span>
                        <p className="text-sm text-text-secondary flex-1">{event.message}</p>
                        <p className="text-xs text-gray-500">{new Date(event.timestamp).toLocaleTimeString()}</p>
                    </div>
                ))}
            </div>
        </Card>
      </div>

    </div>
  );
};

export default DashboardScreen;