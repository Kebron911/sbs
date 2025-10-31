import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { useGame } from '../../contexts/GameContext';

interface CreateGuildModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateGuildModal: React.FC<CreateGuildModalProps> = ({ isOpen, onClose }) => {
    const { createGuild } = useGame();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [icon, setIcon] = useState('🏆');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !icon.trim()) return;
        createGuild({ name, description, icon });
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Create a New Guild">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-bold text-text-secondary mb-1">Guild Name</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-primary border border-border-color rounded p-2" required />
                </div>
                <div>
                    <label className="block text-sm font-bold text-text-secondary mb-1">Icon (Emoji)</label>
                    <input type="text" value={icon} onChange={e => setIcon(e.target.value)} className="w-full bg-primary border border-border-color rounded p-2 text-center" required maxLength={2} />
                </div>
                <div>
                    <label className="block text-sm font-bold text-text-secondary mb-1">Description</label>
                    <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-primary border border-border-color rounded p-2 h-24" />
                </div>
                <div className="pt-4 flex justify-end">
                    <Button type="submit">Forge Guild</Button>
                </div>
            </form>
        </Modal>
    );
};

export default CreateGuildModal;