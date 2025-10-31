import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { useGame } from '../../contexts/GameContext';
import { VoidThought, QuestTemplate, RecurrenceRule } from '../../types';

interface AddQuestModalProps {
  isOpen: boolean;
  onClose: () => void;
  voidThoughtToConvert?: VoidThought | null;
  questTemplateToConvert?: QuestTemplate | null;
}

const AddQuestModal: React.FC<AddQuestModalProps> = ({ isOpen, onClose, voidThoughtToConvert, questTemplateToConvert }) => {
    const { addQuest, skills, goals } = useGame();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [purpose, setPurpose] = useState('');
    const [skillId, setSkillId] = useState(skills[0]?.id || '');
    const [goalId, setGoalId] = useState('');
    const [threatLevel, setThreatLevel] = useState<'Minor' | 'Major' | 'Epic'>('Major');
    const [deadline, setDeadline] = useState(new Date().toISOString().split('T')[0]);
    const [objectives, setObjectives] = useState<string[]>(['']);
    const [isHighLeverage, setIsHighLeverage] = useState(false);
    const [recurrenceFreq, setRecurrenceFreq] = useState<'none' | 'weekly' | 'monthly' | 'quarterly'>('none');
    const [recurrenceDay, setRecurrenceDay] = useState<number>(new Date().getDay());

    useEffect(() => {
        if (isOpen) {
            // Always reset purpose to force user input
            setPurpose('');
            setGoalId('');

            // Priority to template conversion
            if (questTemplateToConvert) {
                setName(questTemplateToConvert.name);
                setDescription(questTemplateToConvert.description);
                setSkillId(questTemplateToConvert.skillId);
                setThreatLevel(questTemplateToConvert.threatLevel);
                setObjectives(questTemplateToConvert.objectives.map(t => t.name));
                // Reset other fields to default for a new quest from template
                setDeadline(new Date().toISOString().split('T')[0]);
                setIsHighLeverage(false);
                setRecurrenceFreq('none');
                setRecurrenceDay(new Date().getDay());
            } else if (voidThoughtToConvert) {
                 // If converting from the void, pre-fill the first objective
                setObjectives([voidThoughtToConvert.text]);
                setName('');
                setDescription('');
                setSkillId(skills[0]?.id || '');
                setThreatLevel('Major');
                setDeadline(new Date().toISOString().split('T')[0]);
                setIsHighLeverage(false);
                setRecurrenceFreq('none');
                setRecurrenceDay(new Date().getDay());
            } else {
                // Reset form fields for brand new quest
                setName('');
                setDescription('');
                setSkillId(skills[0]?.id || '');
                setThreatLevel('Major');
                setDeadline(new Date().toISOString().split('T')[0]);
                setIsHighLeverage(false);
                setObjectives(['']);
                setRecurrenceFreq('none');
                setRecurrenceDay(new Date().getDay());
            }
        }
    }, [isOpen, voidThoughtToConvert, questTemplateToConvert, skills]);


    const handleAddObjective = () => setObjectives([...objectives, '']);
    const handleObjectiveChange = (index: number, value: string) => {
        const newObjectives = [...objectives];
        newObjectives[index] = value;
        setObjectives(newObjectives);
    };
    const handleRemoveObjective = (index: number) => {
        if (objectives.length > 1) {
            setObjectives(objectives.filter((_, i) => i !== index));
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!name.trim() || !skillId || !purpose.trim()) return;
        
        let recurrenceRule: RecurrenceRule | undefined = undefined;
        if (recurrenceFreq !== 'none') {
            recurrenceRule = { frequency: recurrenceFreq };
            if (recurrenceFreq === 'weekly') {
                recurrenceRule.dayOfWeek = recurrenceDay;
            }
        }

        const questData = {
            name,
            description,
            purpose,
            skillId,
            threatLevel,
            deadline,
            goalId: goalId || undefined,
            isHighLeverage,
            objectives: objectives.filter(t => t.trim() !== '').map(t => ({ name: t })),
            recurrence: recurrenceRule,
            completions: [],
        };
        // The type assertion is needed because the addQuest function expects a more specific type
        addQuest(questData as any, voidThoughtToConvert?.id);
        onClose();
    };

    const ToggleSwitch: React.FC<{ checked: boolean, onChange: (checked: boolean) => void, label: string, description: string }> = ({ checked, onChange, label, description }) => (
        <div className="flex items-center justify-between bg-primary p-3 rounded-lg">
            <div>
                <label className="font-bold text-text-main">{label}</label>
                <p className="text-xs text-text-secondary">{description}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only peer" />
                <div className="w-11 h-6 bg-secondary rounded-full peer peer-focus:ring-4 peer-focus:ring-accent/50 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
            </label>
        </div>
   );


    return (
        <Modal isOpen={isOpen} onClose={onClose} title={questTemplateToConvert ? "Create Quest from Template" : "Forge New Quest"}>
            <form onSubmit={handleSubmit} className="flex flex-col max-h-[80vh]">
                <div className="flex-1 overflow-y-auto pr-4 space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-text-secondary mb-1">Quest Name</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-primary border border-border-color rounded p-2" required />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-text-secondary mb-1">Description</label>
                        <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-primary border border-border-color rounded p-2 h-20"></textarea>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-text-secondary mb-1">Purpose (The 'Why')</label>
                        <textarea 
                            value={purpose} 
                            onChange={e => setPurpose(e.target.value)} 
                            className="w-full bg-primary border border-border-color rounded p-2 h-20" 
                            required 
                            placeholder="Why is completing this quest important to you?"
                        ></textarea>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-text-secondary mb-1">Related Skill</label>
                            <select value={skillId} onChange={e => setSkillId(e.target.value)} className="w-full bg-primary border border-border-color rounded p-2">
                            {skills.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-text-secondary mb-1">Threat Level</label>
                            <select value={threatLevel} onChange={e => setThreatLevel(e.target.value as any)} className="w-full bg-primary border border-border-color rounded p-2">
                            <option>Minor</option>
                            <option>Major</option>
                            <option>Epic</option>
                            </select>
                        </div>
                    </div>
                     <div>
                        <label className="block text-sm font-bold text-text-secondary mb-1">Link to Goal (Optional)</label>
                        <select value={goalId} onChange={e => setGoalId(e.target.value)} className="w-full bg-primary border border-border-color rounded p-2">
                           <option value="">No Goal</option>
                           {goals.map(g => <option key={g.id} value={g.id}>{g.icon} {g.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-text-secondary mb-1">Deadline</label>
                        <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} className="w-full bg-primary border border-border-color rounded p-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-text-secondary mb-1">Recurrence</label>
                        <div className="grid grid-cols-2 gap-4">
                            <select value={recurrenceFreq} onChange={e => setRecurrenceFreq(e.target.value as any)} className="w-full bg-primary border border-border-color rounded p-2">
                                <option value="none">One-time</option>
                                <option value="weekly">Weekly</option>
                                <option value="monthly">Monthly</option>
                                <option value="quarterly">Quarterly</option>
                            </select>
                            {recurrenceFreq === 'weekly' && (
                                <select value={recurrenceDay} onChange={e => setRecurrenceDay(parseInt(e.target.value, 10))} className="w-full bg-primary border border-border-color rounded p-2">
                                    <option value="0">Sunday</option>
                                    <option value="1">Monday</option>
                                    <option value="2">Tuesday</option>
                                    <option value="3">Wednesday</option>
                                    <option value="4">Thursday</option>
                                    <option value="5">Friday</option>
                                    <option value="6">Saturday</option>
                                </select>
                            )}
                        </div>
                        <p className="text-xs text-text-secondary mt-1">Set a schedule for this quest to repeat automatically.</p>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-text-secondary mb-1">Objectives</label>
                        <div className="space-y-2">
                            {objectives.map((objective, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <input type="text" value={objective} onChange={e => handleObjectiveChange(index, e.target.value)} className="w-full bg-primary border border-border-color rounded p-2" placeholder={`Objective ${index + 1}`} />
                                    <button type="button" onClick={() => handleRemoveObjective(index)} className="text-red-500 hover:text-red-400 disabled:opacity-50" disabled={objectives.length <= 1}>&times;</button>
                                </div>
                            ))}
                        </div>
                        <button type="button" onClick={handleAddObjective} className="text-sm text-accent mt-2">+ Add Objective</button>
                    </div>
                    
                    <ToggleSwitch 
                        label="Boss Fight"
                        description="Mark this as a high-impact quest with greater challenge and rewards."
                        checked={isHighLeverage}
                        onChange={setIsHighLeverage}
                    />
                </div>

                <div className="pt-4 flex justify-end">
                    <Button type="submit">Create Quest</Button>
                </div>
            </form>
        </Modal>
    );
};

export default AddQuestModal;