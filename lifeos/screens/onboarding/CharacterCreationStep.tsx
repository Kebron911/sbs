import React, { useState } from 'react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

interface Props {
  onNext: (data: { name: string; }) => void;
}

const CharacterCreationStep: React.FC<Props> = ({ onNext }) => {
    const [name, setName] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            onNext({ name });
        }
    }

    return (
        <Card title="Create Your Character" className="animate-fade-in">
            <form onSubmit={handleSubmit} className="space-y-6">
                <p className="text-center text-text-secondary">
                    First, choose a name for your legend. You'll be able to fully customize your avatar's appearance after this setup.
                </p>
                <div>
                    <label htmlFor="charName" className="block text-sm font-bold text-text-secondary mb-2">Character Name</label>
                    <input
                        id="charName"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g., Valerius"
                        className="w-full bg-primary border border-border-color rounded-lg p-3 text-text-main focus:outline-none focus:ring-2 focus:ring-accent"
                        required
                    />
                </div>
                
                <Button type="submit" disabled={!name.trim()} className="w-full">
                    Forge Character
                </Button>
            </form>
        </Card>
    );
};

export default CharacterCreationStep;