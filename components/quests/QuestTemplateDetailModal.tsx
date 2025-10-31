import React from 'react';
import { useNavigate } from 'react-router-dom';
import { QuestTemplate } from '../../types';
import { useGame } from '../../contexts/GameContext';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

interface QuestTemplateDetailModalProps {
  template: QuestTemplate;
  onClose: () => void;
}

const QuestTemplateDetailModal: React.FC<QuestTemplateDetailModalProps> = ({ template, onClose }) => {
    const { getSkill, startQuestFromTemplate } = useGame();
    const navigate = useNavigate();
    const skill = getSkill(template.skillId);

    const handleUseTemplate = () => {
        startQuestFromTemplate(template);
        onClose();
        navigate('/quests');
    };

    return (
        <Modal isOpen={true} onClose={onClose} title="Quest Template Details">
            <div className="space-y-4">
                <div>
                    <h2 className="font-bold text-xl text-white flex items-center">
                        <span className="text-2xl mr-2">{skill?.icon}</span>
                        {template.name}
                    </h2>
                    <p className="text-sm text-text-secondary mt-1">{template.description}</p>
                    <div className="flex gap-4 text-xs mt-2">
                        <span className="bg-primary px-2 py-1 rounded">Category: {template.category}</span>
                        <span className="bg-primary px-2 py-1 rounded">Threat Level: {template.threatLevel}</span>
                    </div>
                </div>

                <div>
                    <h3 className="font-bold text-accent mb-2">Objectives ({template.objectives.length})</h3>
                    <div className="space-y-2 p-3 bg-primary rounded-lg max-h-48 overflow-y-auto">
                        {template.objectives.map((objective, index) => (
                            <div key={index} className="flex items-center p-2 bg-background rounded">
                                <span className="text-accent mr-2">&#9679;</span>
                                <p className="text-text-main">{objective.name}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="pt-4">
                    <Button onClick={handleUseTemplate} className="w-full">
                        Use This Template
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default QuestTemplateDetailModal;