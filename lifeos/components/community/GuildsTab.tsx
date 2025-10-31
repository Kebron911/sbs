import React, { useState, useMemo } from 'react';
import { useGame } from '../../contexts/GameContext';
import { Guild } from '../../types';
import Card from '../ui/Card';
import Button from '../ui/Button';
import MyGuildView from './MyGuildView';
import CreateGuildModal from './CreateGuildModal';

const GuildCard: React.FC<{ guild: Guild }> = ({ guild }) => {
    const { joinGuild } = useGame();
    return (
        <Card className="bg-primary">
            <div className="flex items-center mb-4">
                <span className="text-5xl mr-4">{guild.icon}</span>
                <div>
                    <h3 className="font-bold text-xl text-white">{guild.name}</h3>
                    <p className="text-sm text-text-secondary">Rank #{guild.rank}</p>
                </div>
            </div>
            <p className="text-sm text-text-secondary mb-4 h-10">{guild.description}</p>
            <div className="flex justify-between text-sm mb-4">
                <span>👥 {guild.memberCount} Members</span>
                <span className="text-xp">🏆 {guild.totalXp.toLocaleString()} XP</span>
            </div>
            <Button variant="secondary" className="w-full" onClick={() => joinGuild(guild.id)}>Join Guild</Button>
        </Card>
    );
};

const GuildsTab: React.FC = () => {
    const { guilds, character } = useGame();
    const [searchTerm, setSearchTerm] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const filteredGuilds = useMemo(() => {
        if (!searchTerm) return guilds;
        return guilds.filter(g => g.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [guilds, searchTerm]);

    const currentGuild = guilds.find(g => g.id === character.guildId);

    if (currentGuild) {
        return <MyGuildView guild={currentGuild} />;
    }

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                <input
                    type="text"
                    placeholder="Search for a guild..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="bg-primary border border-border-color rounded-full px-4 py-2 text-sm w-full md:w-64"
                />
                <Button onClick={() => setIsCreateModalOpen(true)}>Create Your Own Guild</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto pr-2">
                {filteredGuilds.map(guild => (
                    <GuildCard key={guild.id} guild={guild} />
                ))}
            </div>
            {isCreateModalOpen && (
                <CreateGuildModal 
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                />
            )}
        </div>
    );
};

export default GuildsTab;