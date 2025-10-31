
import React, { useState } from 'react';
import LeaderboardTab from '../components/community/LeaderboardTab';
import GuildsTab from '../components/community/GuildsTab';
import FriendsTab from '../components/community/FriendsTab';
import Card from '../components/ui/Card';

type Tab = 'leaderboard' | 'guilds' | 'friends';

const CommunityScreen: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>('leaderboard');

    const TabButton: React.FC<{ tabName: Tab, label: string }> = ({ tabName, label }) => (
        <button
            onClick={() => setActiveTab(tabName)}
            className={`px-4 py-2 font-display text-sm rounded-t-lg transition-colors duration-200 focus:outline-none ${
                activeTab === tabName
                ? 'bg-secondary text-accent border-b-2 border-accent'
                : 'bg-transparent text-text-secondary hover:text-white'
            }`}
        >
            {label}
        </button>
    );

    return (
        <div className="space-y-8">
            <h1 className="font-display text-3xl md:text-4xl text-white">Community Hub</h1>

            <div>
                <div className="border-b border-border-color mb-[-1px]">
                    <TabButton tabName="leaderboard" label="Leaderboard" />
                    <TabButton tabName="guilds" label="Guilds" />
                    <TabButton tabName="friends" label="Friends" />
                </div>
                <Card className="rounded-t-none">
                    {activeTab === 'leaderboard' && <LeaderboardTab />}
                    {activeTab === 'guilds' && <GuildsTab />}
                    {activeTab === 'friends' && <FriendsTab />}
                </Card>
            </div>
        </div>
    );
};

export default CommunityScreen;
