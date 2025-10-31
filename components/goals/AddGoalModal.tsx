import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { useGame } from '../../contexts/GameContext';

interface AddGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddGoalModal: React.FC<AddGoalModalProps> = ({ isOpen, onClose }) => {
    const { addGoal } = useGame();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [icon, setIcon] = useState('🎯');
    const [targetDate, setTargetDate] = useState(new Date().toISOString().split('T')[0]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !icon.trim()) return;

        addGoal({ name, description, icon, targetDate });
        onClose();
        // Reset form
        setName('');
        setDescription('');
        setIcon('🎯');
        setTargetDate(new Date().toISOString().split('T')[0]);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Set a New Goal">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-bold text-text-secondary mb-1">Goal Name</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-primary border border-border-color rounded p-2" required placeholder="e.g., Launch My Side Project" />
                </div>
                <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-1">
                        <label className="block text-sm font-bold text-text-secondary mb-1">Icon (Emoji)</label>
                        <input type="text" value={icon} onChange={e => setIcon(e.target.value)} className="w-full bg-primary border border-border-color rounded p-2 text-center" required maxLength={2} />
                    </div>
                    <div className="col-span-2">
                         <label className="block text-sm font-bold text-text-secondary mb-1">Target Date</label>
                         <input type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)} className="w-full bg-primary border border-border-color rounded p-2" />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-bold text-text-secondary mb-1">Description</label>
                    <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-primary border border-border-color rounded p-2 h-24" placeholder="What does success for this goal look like?"></textarea>
                </div>
                <div className="pt-4 flex justify-end">
                    <Button type="submit">Create Goal</Button>
                </div>
            </form>
        </Modal>
    );
};

export default AddGoalModal;