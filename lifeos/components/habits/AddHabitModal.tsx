import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { useGame } from '../../contexts/GameContext';
import { Habit, HabitType } from '../../types';

interface AddHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  habitToEdit?: Habit | null;
}

const AddHabitModal: React.FC<AddHabitModalProps> = ({ isOpen, onClose, habitToEdit }) => {
    const { addHabit, updateHabit, skills, habits } = useGame();
    const [name, setName] = useState('');
    const [type, setType] = useState<HabitType>(HabitType.GOOD);
    const [skillId, setSkillId] = useState(skills[0]?.id || '');
    const [xpValue, setXpValue] = useState(10);
    const [hpLoss, setHpLoss] = useState(10);
    const [stackWithHabitId, setStackWithHabitId] = useState<string | null>(null);

    const goodHabits = habits.filter(h => h.type === HabitType.GOOD && h.id !== habitToEdit?.id);

    useEffect(() => {
        if (habitToEdit) {
            setName(habitToEdit.name);
            setType(habitToEdit.type);
            setSkillId(habitToEdit.skillId);
            setXpValue(habitToEdit.xpValue);
            setHpLoss(habitToEdit.hpLoss || 10);
            setStackWithHabitId(habitToEdit.stackWithHabitId || null);
        } else {
            // Reset form for creation
            setName('');
            setType(HabitType.GOOD);
            setSkillId(skills[0]?.id || '');
            setXpValue(10);
            setHpLoss(10);
            setStackWithHabitId(null);
        }
    }, [habitToEdit, isOpen, skills]);
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!name.trim() || !skillId) return;

        const habitData = { name, type, skillId, xpValue, hpLoss, stackWithHabitId: stackWithHabitId || undefined };

        if (habitToEdit) {
            updateHabit(habitToEdit.id, habitData);
        } else {
            addHabit(habitData);
        }
        
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={habitToEdit ? "Edit Habit" : "Add New Habit"}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-bold text-text-secondary mb-1">Habit Name</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-primary border border-border-color rounded p-2" required placeholder="e.g., Meditate for 10 minutes" data-tour-id="habit-name-input"/>
                </div>
                
                <div>
                    <label className="block text-sm font-bold text-text-secondary mb-1">Habit Type</label>
                    <div className="flex gap-4">
                        <label className="flex items-center">
                            <input type="radio" name="habitType" value={HabitType.GOOD} checked={type === HabitType.GOOD} onChange={() => setType(HabitType.GOOD)} className="w-4 h-4 text-accent bg-primary border-border-color focus:ring-accent" />
                            <span className="ml-2 text-text-main">Good</span>
                        </label>
                        <label className="flex items-center">
                            <input type="radio" name="habitType" value={HabitType.AFFLICTION} checked={type === HabitType.AFFLICTION} onChange={() => setType(HabitType.AFFLICTION)} className="w-4 h-4 text-accent bg-primary border-border-color focus:ring-accent" />
                            <span className="ml-2 text-text-main">Affliction</span>
                        </label>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-text-secondary mb-1">Related Skill</label>
                        <select value={skillId} onChange={e => setSkillId(e.target.value)} className="w-full bg-primary border border-border-color rounded p-2">
                           {skills.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                    {type === HabitType.GOOD ? (
                         <div>
                            <label className="block text-sm font-bold text-text-secondary mb-1">XP Value</label>
                            <input type="number" value={xpValue} onChange={e => setXpValue(parseInt(e.target.value, 10))} className="w-full bg-primary border border-border-color rounded p-2" min="5" step="5" />
                        </div>
                    ) : (
                        <div>
                            <label className="block text-sm font-bold text-text-secondary mb-1">HP Loss</label>
                            <input type="number" value={hpLoss} onChange={e => setHpLoss(parseInt(e.target.value, 10))} className="w-full bg-primary border border-border-color rounded p-2" min="5" step="5" />
                        </div>
                    )}
                </div>

                {type === HabitType.GOOD && (
                    <div>
                        <label className="block text-sm font-bold text-text-secondary mb-1">Stack After Habit (Optional)</label>
                        <select value={stackWithHabitId || ''} onChange={e => setStackWithHabitId(e.target.value || null)} className="w-full bg-primary border border-border-color rounded p-2">
                           <option value="">None</option>
                           {goodHabits.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                        </select>
                        <p className="text-xs text-text-secondary mt-1">Anchor this new habit to an existing one to build a routine.</p>
                    </div>
                )}
               
                <div className="pt-4 flex justify-end">
                    <Button type="submit">{habitToEdit ? "Save Changes" : "Create Habit"}</Button>
                </div>
            </form>
        </Modal>
    );
};

export default AddHabitModal;