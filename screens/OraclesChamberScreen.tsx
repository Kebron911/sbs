import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import HistoryCalendar from '../components/habits/HistoryCalendar';
import DayDetailModal from '../components/habits/DayDetailModal';
import { useGame } from '../contexts/GameContext';
import AnalyticsTab from '../components/review/AnalyticsTab';
import ReflectionsTab from '../components/review/ReflectionsTab';

type Tab = 'timeline' | 'analytics' | 'reflections';

const OraclesChamberScreen: React.FC = () => {
    const { reviewCalendarDate } = useGame();
    const [activeTab, setActiveTab] = useState<Tab>('timeline');
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [initialCalendarDate, setInitialCalendarDate] = useState<string | null>(reviewCalendarDate);

    // This effect ensures that if we navigate here with a date, we only use it once.
    useEffect(() => {
        if (reviewCalendarDate) {
            setInitialCalendarDate(reviewCalendarDate);
        }
    }, [reviewCalendarDate]);

    const TabButton: React.FC<{ tab: Tab, label: string, disabled?: boolean }> = ({ tab, label, disabled }) => (
        <button
            onClick={() => setActiveTab(tab)}
            disabled={disabled}
            className={`px-4 py-2 font-display text-sm rounded-t-lg transition-colors duration-200 focus:outline-none ${
                activeTab === tab ? 'bg-secondary text-accent border-b-2 border-accent' : 'bg-transparent text-text-secondary hover:text-white'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
            {label}
        </button>
    );

    const renderTimeline = () => (
         <Card>
            <h3 className="font-display text-lg text-accent mb-4">Your Productivity Timeline</h3>
            <p className="text-sm text-text-secondary mb-4">Click on a day to review your completed habits, unlocked badges, and journal entries.</p>
            <HistoryCalendar 
                onDayClick={(date) => setSelectedDate(date)} 
                initialDate={initialCalendarDate}
            />
        </Card>
    );

    return (
        <div className="space-y-8">
            <h1 className="font-display text-3xl md:text-4xl text-white">Oracle's Chamber</h1>
            
            <div>
                <div className="border-b border-border-color">
                    <TabButton tab="timeline" label="Timeline" />
                    <TabButton tab="analytics" label="Analytics & Insights" />
                    <TabButton tab="reflections" label="Reflection Rituals" />
                </div>
                <div className="py-6">
                    {activeTab === 'timeline' && renderTimeline()}
                    {activeTab === 'analytics' && <AnalyticsTab />}
                    {activeTab === 'reflections' && <ReflectionsTab />}
                </div>
            </div>

            {selectedDate && <DayDetailModal date={selectedDate} onClose={() => setSelectedDate(null)} />}
        </div>
    );
};

export default OraclesChamberScreen;