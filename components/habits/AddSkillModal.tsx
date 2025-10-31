import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { useGame } from '../../contexts/GameContext';

interface AddSkillModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddSkillModal: React.FC<AddSkillModalProps> = ({ isOpen, onClose }) => {
    const { addSkill } = useGame();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [icon, setIcon] = useState('✨');
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!name.trim() || !icon.trim()) return;

        addSkill({ name, description, icon });
        onClose();
        // Reset form
        setName('');
        setDescription('');
        setIcon('✨');
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add New Skill">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-bold text-text-secondary mb-1">Skill Name</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-primary border border-border-color rounded p-2" required placeholder="e.g., Programming" />
                </div>
                 <div>
                    <label className="block text-sm font-bold text-text-secondary mb-1">Icon (Emoji)</label>
                    <input type="text" value={icon} onChange={e => setIcon(e.target.value)} className="w-full bg-primary border border-border-color rounded p-2" required maxLength={2} />
                </div>
                <div>
                    <label className="block text-sm font-bold text-text-secondary mb-1">Description</label>
                    <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-primary border border-border-color rounded p-2 h-20" placeholder="e.g., The art of crafting digital solutions."></textarea>
                </div>
                <div className="pt-4 flex justify-end">
                    <Button type="submit">Create Skill</Button>
                </div>
            </form>
        </Modal>
    );
};

export default AddSkillModal;
