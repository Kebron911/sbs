import React, { useState } from 'react';
import { useGame } from '../../contexts/GameContext';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { VoidThought } from '../../types';

interface TheVoidViewProps {
    onConvertToQuest: (thought: VoidThought) => void;
}

const TheVoidView: React.FC<TheVoidViewProps> = ({ onConvertToQuest }) => {
    const { theVoid, addThoughtToTheVoid } = useGame();
    const [newThought, setNewThought] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newThought.trim()) {
            addThoughtToTheVoid(newThought);
            setNewThought('');
        }
    };

    return (
        <Card>
            <h3 className="font-display text-lg text-accent mb-4">The Void</h3>
            <p className="text-text-secondary mb-4 text-sm">Capture raw ideas from the æther. Give them form later by converting them into Quests.</p>
            <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
                <input
                    type="text"
                    value={newThought}
                    onChange={e => setNewThought(e.target.value)}
                    placeholder="e.g., 'Call the dentist' or 'New app idea...'"
                    className="flex-1 bg-primary border border-border-color rounded-lg p-2 text-text-main focus:outline-none focus:ring-2 focus:ring-accent"
                />
                <Button type="submit" className="px-4 py-2">Capture</Button>
            </form>
            <div className="space-y-2 max-h-96 overflow-y-auto">
                {theVoid.map(thought => (
                    <div key={thought.id} className="flex justify-between items-center p-3 bg-primary rounded-lg">
                        <p className="text-text-main">{thought.text}</p>
                        <button onClick={() => onConvertToQuest(thought)} className="text-xs text-accent hover:underline">Convert to Quest</button>
                    </div>
                ))}
                {theVoid.length === 0 && (
                    <p className="text-center text-text-secondary py-4">The Void is empty. Capture a new thought!</p>
                )}
            </div>
        </Card>
    );
};

export default TheVoidView;