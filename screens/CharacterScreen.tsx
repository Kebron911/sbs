import React, { useState } from 'react';
import { useGame } from '../contexts/GameContext';
import Card from '../components/ui/Card';
import AvatarPreview from '../components/character/AvatarPreview';
import AppearanceTab from '../components/character/AppearanceTab';
import GearTab from '../components/character/GearTab';
import StatsTab from '../components/character/StatsTab';
import BadgesTab from '../components/character/BadgesTab';
import BadgeDetailModal from '../components/character/BadgeDetailModal';
import { Badge } from '../types';

type Tab = 'stats' | 'badges' | 'appearance' | 'gear';

const CharacterScreen: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>('stats');
    const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

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
            <h1 className="font-display text-3xl md:text-4xl text-white">Character Sheet</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <AvatarPreview />
                </div>

                <div className="lg:col-span-2">
                    <div className="border-b border-border-color mb-[-1px]">
                        <TabButton tabName="stats" label="Stats" />
                        <TabButton tabName="badges" label="Badges" />
                        <TabButton tabName="appearance" label="Appearance" />
                        <TabButton tabName="gear" label="Gear" />
                    </div>
                    <Card className="rounded-t-none min-h-[60vh]">
                        {activeTab === 'stats' && <StatsTab />}
                        {activeTab === 'badges' && <BadgesTab onBadgeDoubleClick={setSelectedBadge} />}
                        {activeTab === 'appearance' && <AppearanceTab />}
                        {activeTab === 'gear' && <GearTab />}
                    </Card>
                </div>
            </div>

            {selectedBadge && (
                <BadgeDetailModal
                    badge={selectedBadge}
                    onClose={() => setSelectedBadge(null)}
                />
            )}
        </div>
    );
};

export default CharacterScreen;