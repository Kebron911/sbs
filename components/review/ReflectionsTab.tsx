import React, { useState } from 'react';
import Card from '../ui/Card';
import { useGame } from '../../contexts/GameContext';
import Button from '../ui/Button';

const ReflectionsTab: React.FC = () => {
    const { quests, showToast, saveWeeklyReview, saveFearSettingExercise, weeklyReviews, fearSettingExercises } = useGame();
    
    // State for forms
    const [weeklyWins, setWeeklyWins] = useState('');
    const [weeklyLessons, setWeeklyLessons] = useState('');
    const [weeklyGoals, setWeeklyGoals] = useState('');
    const [selectedQuest, setSelectedQuest] = useState('');
    const [fearDefine, setFearDefine] = useState('');
    const [fearPrevent, setFearPrevent] = useState('');
    const [fearRepair, setFearRepair] = useState('');

    const highLeverageQuests = quests.filter(p => p.isHighLeverage);
    
    const handleSaveReview = () => {
        if (!weeklyWins.trim() || !weeklyLessons.trim() || !weeklyGoals.trim()) {
            showToast({ message: "Please fill out all fields for the weekly reflection.", type: 'error' });
            return;
        }
        saveWeeklyReview({ wins: weeklyWins, lessons: weeklyLessons, goals: weeklyGoals });
        showToast({ message: "Weekly reflection saved!", type: 'success' });
        setWeeklyWins('');
        setWeeklyLessons('');
        setWeeklyGoals('');
    };

    const handleSaveFearSetting = () => {
        if (!selectedQuest || !fearDefine.trim()) {
            showToast({ message: "Please select a quest and define the fear.", type: 'error' });
            return;
        }
        saveFearSettingExercise({ questId: selectedQuest, define: fearDefine, prevent: fearPrevent, repair: fearRepair });
        showToast({ message: "Fear-setting exercise saved!", type: 'success' });
        setSelectedQuest('');
        setFearDefine('');
        setFearPrevent('');
        setFearRepair('');
    };

    const TextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => (
        <textarea
            {...props}
            className="w-full bg-primary border border-border-color rounded-lg p-3 text-text-main resize-y focus:outline-none focus:ring-2 focus:ring-accent"
            rows={3}
        />
    );

    const HistoryCard: React.FC<{title: string; children: React.ReactNode; date: string}> = ({title, children, date}) => (
        <details className="bg-primary p-3 rounded-lg border border-border-color">
            <summary className="font-bold text-white cursor-pointer list-outside">
                {title} - <span className="text-sm text-text-secondary">{new Date(date).toLocaleDateString()}</span>
            </summary>
            <div className="mt-3 pt-3 border-t border-border-color text-sm text-text-secondary space-y-2">
                {children}
            </div>
        </details>
    );

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
                <Card title="Weekly Reflection Ritual">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-text-secondary mb-1">What were my wins this week?</label>
                            <TextArea value={weeklyWins} onChange={e => setWeeklyWins(e.target.value)} placeholder="e.g., Finished the UI mockups..." />
                        </div>
                         <div>
                            <label className="block text-sm font-bold text-text-secondary mb-1">What lessons did I learn?</label>
                            <TextArea value={weeklyLessons} onChange={e => setWeeklyLessons(e.target.value)} placeholder="e.g., I should block out focus time..." />
                        </div>
                         <div>
                            <label className="block text-sm font-bold text-text-secondary mb-1">What are my primary goals for next week?</label>
                            <TextArea value={weeklyGoals} onChange={e => setWeeklyGoals(e.target.value)} placeholder="e.g., Deploy the staging server..." />
                        </div>
                        <Button onClick={handleSaveReview} className="w-full">Save Reflection</Button>
                    </div>
                </Card>
                <Card title="Reflection History">
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                        {weeklyReviews.length > 0 ? (
                            weeklyReviews.map(review => (
                                <HistoryCard key={review.id} title="Weekly Reflection" date={review.date}>
                                    <p><strong>Wins:</strong> {review.wins}</p>
                                    <p><strong>Lessons:</strong> {review.lessons}</p>
                                    <p><strong>Goals:</strong> {review.goals}</p>
                                </HistoryCard>
                            ))
                        ) : <p className="text-center text-text-secondary">No reflections saved yet.</p>}
                    </div>
                </Card>
            </div>

            <div className="space-y-6">
                <Card title="Fear-Setting Exercise">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-text-secondary mb-1">Select a High-Leverage Quest</label>
                            <select
                                value={selectedQuest}
                                onChange={e => setSelectedQuest(e.target.value)}
                                className="w-full bg-primary border border-border-color rounded-lg p-3"
                            >
                                <option value="">Choose a quest...</option>
                                {highLeverageQuests.map(q => <option key={q.id} value={q.id}>{q.name}</option>)}
                            </select>
                        </div>
                        {selectedQuest && (
                            <>
                                <div>
                                    <label className="block text-sm font-bold text-text-secondary mb-1">Define: What's the worst that could happen?</label>
                                    <TextArea value={fearDefine} onChange={e => setFearDefine(e.target.value)} placeholder="e.g., The launch fails and users hate it..." />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-text-secondary mb-1">Prevent: How can I prevent this?</label>
                                    <TextArea value={fearPrevent} onChange={e => setFearPrevent(e.target.value)} placeholder="e.g., Get user feedback early, extensive testing..."/>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-text-secondary mb-1">Repair: How could I repair the damage?</label>
                                    <TextArea value={fearRepair} onChange={e => setFearRepair(e.target.value)} placeholder="e.g., Roll back the deployment, issue a post-mortem..."/>
                                </div>
                                 <Button onClick={handleSaveFearSetting} className="w-full">Complete Exercise</Button>
                            </>
                        )}
                    </div>
                </Card>
                 <Card title="Exercise History">
                     <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                        {fearSettingExercises.length > 0 ? (
                            fearSettingExercises.map(ex => {
                                const quest = quests.find(p => p.id === ex.questId);
                                return (
                                    <HistoryCard key={ex.id} title={`Fear-Setting: ${quest?.name || 'Unknown Quest'}`} date={ex.date}>
                                        <p><strong>Define:</strong> {ex.define}</p>
                                        <p><strong>Prevent:</strong> {ex.prevent}</p>
                                        <p><strong>Repair:</strong> {ex.repair}</p>
                                    </HistoryCard>
                                )
                            })
                        ) : <p className="text-center text-text-secondary">No exercises saved yet.</p>}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default ReflectionsTab;