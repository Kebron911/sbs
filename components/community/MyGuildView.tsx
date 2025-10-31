import React from 'react';
import { Guild } from '../../types';
import { useGame } from '../../contexts/GameContext';
import Button from '../ui/Button';

interface MyGuildViewProps {
  guild: Guild;
}

const MyGuildView: React.FC<MyGuildViewProps> = ({ guild }) => {
    const { leaveGuild, leaderboard } = useGame();

    const handleLeave = () => {
        if (window.confirm(`Are you sure you want to leave ${guild.name}?`)) {
            leaveGuild();
        }
    };

    const guildMembers = leaderboard.slice(0, guild.memberCount); // Mock members

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-4">
                <div className="text-center">
                    <div className="text-7xl">{guild.icon}</div>
                    <h2 className="font-display text-3xl text-white mt-2">{guild.name}</h2>
                    <p className="text-text-secondary">Rank #{guild.rank}</p>
                </div>
                <p className="text-sm text-center text-text-secondary bg-primary p-3 rounded-lg">{guild.description}</p>
                <div className="flex justify-around bg-primary p-3 rounded-lg text-center">
                    <div>
                        <p className="font-bold text-xl text-white">👥 {guild.memberCount}</p>
                        <p className="text-xs text-text-secondary">Members</p>
                    </div>
                    <div>
                        <p className="font-bold text-xl text-xp">🏆 {guild.totalXp.toLocaleString()}</p>
                        <p className="text-xs text-text-secondary">Total XP</p>
                    </div>
                </div>
                <Button variant="secondary" className="w-full !bg-hp/20 !text-hp" onClick={handleLeave}>Leave Guild</Button>
            </div>
            <div className="lg:col-span-2">
                <div className="bg-primary rounded-lg h-[60vh] flex flex-col">
                    <h3 className="font-bold text-accent p-3 border-b border-border-color">Guild Chat</h3>
                    <div className="flex-1 p-3 space-y-3 overflow-y-auto">
                        {/* Mock Chat */}
                        <p className="text-sm"><strong className="text-accent">Zephyr:</strong> Welcome to the guild!</p>
                        <p className="text-sm"><strong className="text-accent">Aria:</strong> Let's crush some quests this week! 🔥</p>
                    </div>
                    <div className="p-3 border-t border-border-color">
                         <input type="text" placeholder="Message your guild..." className="w-full bg-secondary border border-border-color rounded-full py-2 px-4 text-sm" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyGuildView;