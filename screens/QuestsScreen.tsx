import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../contexts/GameContext';
import Card from '../components/ui/Card';
import { Quest, QuestStatus, Objective, VoidThought } from '../types';
import Button from '../components/ui/Button';
import AddQuestModal from '../components/quests/AddQuestModal';
import TheVoidView from '../components/quests/TheVoidView';
import ArchiveView from '../components/quests/ArchiveView';
import ArchivedQuestDetailModal from '../components/quests/ArchivedQuestDetailModal';
import { RefreshIcon, SwordIcon } from './lib/icons';

const ObjectiveItem: React.FC<{ objective: Objective, questId: string }> = ({ objective, questId }) => {
    const { toggleObjective, getLoadingState } = useGame();
    const isLoading = getLoadingState(`objective-${objective.id}`);

    return (
        <div className="flex items-center p-2 bg-background rounded">
            <input 
                type="checkbox" 
                checked={objective.completed}
                onChange={() => toggleObjective(questId, objective.id)}
                disabled={isLoading}
                className="w-5 h-5 rounded bg-primary border-border-color text-accent focus:ring-accent disabled:opacity-50"
            />
            <label className={`ml-3 flex-1 ${objective.completed ? 'line-through text-text-secondary' : 'text-text-main'}`}>
                {objective.name}
            </label>
            <span className="text-xs font-bold text-xp">+{objective.xp} XP</span>
        </div>
    );
};

const QuestCard: React.FC<{ quest: Quest }> = ({ quest }) => {
    const { getSkill, fearSettingExercises, startBossFight, goals } = useGame();
    const skill = getSkill(quest.skillId);
    const goal = goals.find(g => g.id === quest.goalId);
    const completedObjectives = quest.objectives.filter(t => t.completed).length;
    const totalObjectives = quest.objectives.length;
    const progress = totalObjectives > 0 ? (completedObjectives / totalObjectives) * 100 : 0;
    const hasFearSetting = fearSettingExercises.some(fse => fse.questId === quest.id);

    return (
        <Card className={`relative overflow-hidden transition-all duration-300 ${quest.isHighLeverage ? 'border-2 border-accent shadow-glow-accent bg-accent/10' : ''}`}>
             <div className="absolute top-2 right-2 flex gap-2">
                 {quest.recurrence && (
                    <div 
                        className="bg-blue-500/30 text-blue-300 text-xs font-bold px-2 py-1 rounded-full flex items-center capitalize" 
                        title={`This quest repeats ${quest.recurrence.frequency}.`}
                    >
                        <span className="w-3 h-3 mr-1"><RefreshIcon /></span>
                        {quest.recurrence.frequency}
                    </div>
                )}
                {hasFearSetting && (
                    <div className="bg-blue-500/30 text-blue-300 text-xs font-bold px-2 py-1 rounded-full flex items-center" title="Fear-Setting exercise completed for this quest.">
                        🛡️ Fear Assessed
                    </div>
                )}
                {quest.isHighLeverage && (
                    <div className="bg-accent text-white text-xs font-bold px-2 py-1 rounded-full flex items-center">
                        <span className="w-4 h-4 mr-1"><SwordIcon /></span> Boss Fight
                    </div>
                )}
            </div>
            <div className="flex justify-between items-start">
                <div>
                    <h4 className="font-bold text-xl text-white flex items-center">
                       <span className="text-2xl mr-2">{skill?.icon}</span> {quest.name}
                    </h4>
                    {goal && (
                        <p className="text-xs font-bold text-accent mt-1">🎯 GOAL: {goal.name}</p>
                    )}
                    <p className="text-sm text-text-secondary mt-1">{quest.description}</p>
                </div>
                <div className="text-right">
                    <span className="text-xs bg-primary px-2 py-1 rounded">{new Date(quest.deadline).toLocaleDateString()}</span>
                    <span className={`text-xs ml-2 px-2 py-1 rounded ${quest.threatLevel === 'Minor' ? 'bg-green-500/20 text-green-400' : quest.threatLevel === 'Major' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>{quest.threatLevel}</span>
                </div>
            </div>

            <div className="mt-3 p-3 bg-primary rounded-lg border-l-4 border-accent">
                <p className="text-sm italic text-text-secondary">"{quest.purpose}"</p>
            </div>
            
            <div className="mt-4">
                <div className="w-full bg-primary rounded-full h-2.5">
                    <div className="bg-accent h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                </div>
                <p className="text-right text-xs mt-1 text-text-secondary">{completedObjectives} / {totalObjectives} Objectives</p>
            </div>
            
            {quest.isHighLeverage ? (
                <div className="text-center mt-4">
                    <Button onClick={() => startBossFight(quest.id)} className="w-full md:w-auto">
                        Start Boss Fight
                    </Button>
                </div>
            ) : (
                <div className="space-y-2 mt-4">
                    {quest.objectives.map(objective => <ObjectiveItem key={objective.id} objective={objective} questId={quest.id} />)}
                </div>
            )}
        </Card>
    );
};

const ActiveQuestsView: React.FC<{ quests: Quest[] }> = ({ quests }) => (
    <div className="space-y-6">
        {quests.length > 0 ? (
            quests.map(quest => <QuestCard key={quest.id} quest={quest} />)
        ) : (
            <Card className="text-center">
                <p className="text-text-secondary">No active quests. Time to start a new adventure!</p>
            </Card>
        )}
    </div>
);


const QuestsScreen: React.FC = () => {
    const { quests, templateForQuest, clearTemplateForQuest } = useGame();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'active' | 'void' | 'archive'>('active');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [voidThoughtToConvert, setVoidThoughtToConvert] = useState<VoidThought | null>(null);
    const [viewingArchivedQuest, setViewingArchivedQuest] = useState<Quest | null>(null);

    useEffect(() => {
        if (templateForQuest) {
            setIsAddModalOpen(true);
        }
    }, [templateForQuest]);


    const activeQuests = useMemo(() => quests.filter(p => p.status === QuestStatus.IN_PROGRESS), [quests]);
    const archivedQuests = useMemo(() => quests.filter(p => p.status === QuestStatus.ARCHIVED), [quests]);

    const handleConvertToQuest = (thought: VoidThought) => {
        setVoidThoughtToConvert(thought);
        setIsAddModalOpen(true);
    };

    const handleCloseAddModal = () => {
        setIsAddModalOpen(false);
        setVoidThoughtToConvert(null);
        if (templateForQuest) {
            clearTemplateForQuest();
        }
    };

    const totalRewards = useMemo(() => {
        return activeQuests.reduce((acc, quest) => {
            const questXp = quest.objectives.reduce((sum, objective) => sum + objective.xp, 0);
            acc.xp += questXp;
            acc.coins += Math.floor(questXp / 2);
            return acc;
        }, { xp: 0, coins: 0 });
    }, [activeQuests]);

    const TabButton: React.FC<{ tab: typeof activeTab, label: string }> = ({ tab, label }) => (
        <button
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-display text-sm rounded-t-lg transition-colors duration-200 focus:outline-none ${
                activeTab === tab ? 'bg-secondary text-accent border-b-2 border-accent' : 'bg-transparent text-text-secondary hover:text-white'
            }`}
        >
            {label}
        </button>
    );

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <h1 className="font-display text-3xl md:text-4xl text-white">Quests</h1>
                <div className="flex gap-4">
                    <Button variant="secondary" onClick={() => navigate('/quest-templates')}>Browse Templates</Button>
                    <Button onClick={() => setIsAddModalOpen(true)}>Add New Quest</Button>
                </div>
            </div>

            <Card title="Rewards Summary">
                <div className="flex justify-around text-center">
                    <div>
                        <p className="font-display text-2xl text-xp">{totalRewards.xp}</p>
                        <p className="text-sm text-text-secondary">Potential XP</p>
                    </div>
                    <div>
                        <p className="font-display text-2xl text-coins">{totalRewards.coins}</p>
                        <p className="text-sm text-text-secondary">Potential Coins</p>
                    </div>
                    <div>
                        <p className="font-display text-2xl text-white">{activeQuests.length}</p>
                        <p className="text-sm text-text-secondary">Active Quests</p>
                    </div>
                </div>
            </Card>
            
            <div>
                <div className="border-b border-border-color">
                    <TabButton tab="active" label="Active" />
                    <TabButton tab="void" label="The Void" />
                    <TabButton tab="archive" label="Archive" />
                </div>
                <div className="py-6">
                    {activeTab === 'active' && <ActiveQuestsView quests={activeQuests} />}
                    {activeTab === 'void' && <TheVoidView onConvertToQuest={handleConvertToQuest} />}
                    {activeTab === 'archive' && <ArchiveView quests={archivedQuests} onViewQuest={setViewingArchivedQuest} />}
                </div>
            </div>

            <AddQuestModal 
                isOpen={isAddModalOpen} 
                onClose={handleCloseAddModal} 
                voidThoughtToConvert={voidThoughtToConvert}
                questTemplateToConvert={templateForQuest}
            />

            {viewingArchivedQuest && (
                <ArchivedQuestDetailModal 
                    quest={viewingArchivedQuest}
                    onClose={() => setViewingArchivedQuest(null)}
                />
            )}
        </div>
    );
};

export default QuestsScreen;