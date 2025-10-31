import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import { useGame } from '../contexts/GameContext';
import Button from '../components/ui/Button';
// FIX: Changed JournalEntry to ChronicleEntry as it is the correct type from types.ts
import { ChronicleEntry } from '../types';

// FIX: Changed entry type from JournalEntry to ChronicleEntry
const ChronicleHistoryCard: React.FC<{ entry: ChronicleEntry }> = ({ entry }) => {
    const navigate = useNavigate();
    const { setReviewDate } = useGame();

    const handleViewOnTimeline = () => {
        setReviewDate(entry.timestamp);
        navigate('/oracles-chamber');
    };

    return (
        <div 
            className="p-4 bg-primary rounded-lg border border-border-color cursor-pointer hover:border-accent/50 transition-colors"
            onClick={handleViewOnTimeline}
            title="Click to view this day on the timeline"
        >
            <div className="flex justify-between items-center mb-2">
                <p className="text-sm font-bold text-white">{new Date(entry.timestamp).toLocaleString()}</p>
                <p className="text-sm font-bold text-mana">+{entry.wisdomAwarded} Wisdom</p>
            </div>
            <p className="text-sm text-text-secondary mb-3"><em>AI Summary: "{entry.summary}"</em></p>
            <p className="text-text-main whitespace-pre-wrap text-sm">{entry.content}</p>
        </div>
    );
};


const JournalScreen: React.FC = () => {
    // FIX: Renamed analyzeJournalEntry and journalEntries to analyzeChronicleEntry and chronicleEntries to match GameContext
    const { analyzeChronicleEntry, chronicleEntries } = useGame();
    const [entry, setEntry] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!entry.trim() || isLoading) return;
        
        setIsLoading(true);
        await analyzeChronicleEntry(entry);
        setEntry('');
        setIsLoading(false);
    };

    return (
        <div className="space-y-8">
            <h1 className="font-display text-3xl md:text-4xl text-white">Reflection Journal</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Entry Form */}
                <Card>
                    <h2 className="font-display text-xl text-accent mb-2">New Entry</h2>
                    <p className="text-sm text-text-secondary mb-4">
                        Write about your day, your progress, or your thoughts. Your AI companion will analyze your reflection and award Wisdom for your insights.
                    </p>
                    <form onSubmit={handleSubmit} className="flex flex-col h-[50vh]">
                        <textarea
                            value={entry}
                            onChange={(e) => setEntry(e.target.value)}
                            placeholder="Today I learned..."
                            className="flex-1 bg-primary border border-border-color rounded-lg p-3 text-text-main w-full resize-none focus:outline-none focus:ring-2 focus:ring-accent"
                            disabled={isLoading}
                        />
                        <Button type="submit" className="mt-4" disabled={isLoading || !entry.trim()}>
                            {isLoading ? 'Analyzing...' : `Submit for Wisdom`}
                        </Button>
                    </form>
                </Card>

                {/* History */}
                <Card>
                    <h2 className="font-display text-xl text-accent mb-4">Journal History</h2>
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                        {chronicleEntries.length > 0 ? (
                           chronicleEntries.map(e => <ChronicleHistoryCard key={e.id} entry={e} />)
                        ) : (
                            <p className="text-center text-text-secondary py-8">Your journal is empty. Write your first entry to begin your reflection journey.</p>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default JournalScreen;
