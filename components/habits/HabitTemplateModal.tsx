import React from 'react';
import Modal from '../ui/Modal';
import { useGame } from '../../contexts/GameContext';
import { HabitTemplate } from '../../types';

interface HabitTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HabitTemplateModal: React.FC<HabitTemplateModalProps> = ({ isOpen, onClose }) => {
    const { habitTemplates, skills, addHabitFromTemplate } = useGame();

    const handleAdd = (template: HabitTemplate) => {
        addHabitFromTemplate(template);
        // Maybe give some feedback here
    };

    const templatesBySkill = skills.map(skill => ({
        ...skill,
        templates: habitTemplates.filter(t => t.skillId === skill.id)
    })).filter(group => group.templates.length > 0);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Browse Habit Templates">
            <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
                {templatesBySkill.map(skillGroup => (
                    <div key={skillGroup.id}>
                        <h4 className="font-bold text-lg text-accent mb-2 flex items-center">
                            <span className="text-2xl mr-2">{skillGroup.icon}</span> {skillGroup.name}
                        </h4>
                        <div className="space-y-2">
                            {skillGroup.templates.map(template => (
                                <div key={template.id} className="flex items-center justify-between p-3 bg-primary rounded-lg">
                                    <div>
                                        <p className="font-bold text-white">{template.name}</p>
                                        <p className="text-xs text-text-secondary">+{template.xpValue} XP</p>
                                    </div>
                                    <button 
                                        onClick={() => handleAdd(template)}
                                        className="text-sm bg-accent/80 hover:bg-accent text-white font-bold py-1 px-3 rounded-lg"
                                    >
                                        Add
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </Modal>
    );
};

export default HabitTemplateModal;
