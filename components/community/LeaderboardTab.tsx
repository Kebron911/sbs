import React, { useState, useMemo } from 'react';
import { useGame } from '../../contexts/GameContext';
import { LeaderboardEntry, Character } from '../../types';
import DynamicAvatar from '../character/DynamicAvatar';
import PlayerProfileModal from './PlayerProfileModal';

const LeaderboardTab: React.FC = () => {
    const { leaderboard, character, friends } = useGame();
    const [filter, setFilter] = useState<'all-time' | 'weekly' | 'friends'>('all-time');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPlayer, setSelectedPlayer] = useState<Character | null>(null);

    const filteredLeaderboard = useMemo(() => {
        let data = [...leaderboard];
        if (filter === 'friends') {
            const friendIds = new Set(friends.map(f => f.id));
            friendIds.add(character.id);
            data = data.filter(entry => friendIds.has(entry.characterId));
        }
        
        if (searchTerm) {
            data = data.filter(entry => entry.characterName.toLowerCase().includes(searchTerm.toLowerCase()));
        }
        return data;
    }, [leaderboard, filter, searchTerm, friends, character.id]);
    
    const { users } = useGame(); // For profile modal
    const handleRowClick = (entry: LeaderboardEntry) => {
        const userProfile = users.find(u => u.id === entry.characterId);
        if (userProfile) {
            setSelectedPlayer(userProfile);
        }
    };


    const LeaderboardRow: React.FC<{ entry: LeaderboardEntry, isCurrentUser: boolean }> = ({ entry, isCurrentUser }) => (
        <div 
            className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${isCurrentUser ? 'bg-accent/20 border border-accent' : 'bg-primary hover:bg-primary/70'}`}
            onClick={() => handleRowClick(entry)}
        >
            <span className="font-display text-xl w-10 text-center">{entry.rank}</span>
            <div className="w-10 h-10 rounded-full mx-4 bg-background overflow-hidden flex-shrink-0">
                {isCurrentUser ? (
                    <DynamicAvatar appearance={character.appearance} equipment={character.equipment} />
                ) : (
                    <img src={entry.avatarUrl} alt={entry.characterName} className="w-full h-full object-cover" />
                )}
            </div>
            <div className="flex-1">
                <p className="font-bold text-white">{entry.characterName} {isCurrentUser && <span className="text-xs bg-accent text-white px-2 py-0.5 rounded-full ml-2">You</span>}</p>
                <p className="text-sm text-text-secondary">Level {entry.level}</p>
            </div>
            <p className="font-bold text-xp">{entry.xp.toLocaleString()} XP</p>
        </div>
    );

    const FilterButton: React.FC<{ type: typeof filter, label: string }> = ({ type, label }) => (
        <button
            onClick={() => setFilter(type)}
            className={`px-3 py-1 rounded-full text-sm font-bold ${filter === type ? 'bg-accent text-white' : 'bg-primary text-text-secondary'}`}
        >
            {label}
        </button>
    );

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                <div className="flex items-center gap-2">
                    <FilterButton type="all-time" label="All-Time" />
                    <FilterButton type="weekly" label="Weekly" />
                    <FilterButton type="friends" label="Friends" />
                </div>
                <input
                    type="text"
                    placeholder="Search player..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="bg-primary border border-border-color rounded-full px-4 py-1.5 text-sm w-full md:w-48"
                />
            </div>
            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
                {filteredLeaderboard.map(entry => (
                    <LeaderboardRow 
                        key={entry.rank} 
                        entry={entry} 
                        isCurrentUser={entry.characterId === character.id} 
                    />
                ))}
            </div>
            {selectedPlayer && (
                <PlayerProfileModal 
                    player={selectedPlayer}
                    onClose={() => setSelectedPlayer(null)}
                />
            )}
        </div>
    );
};

export default LeaderboardTab;