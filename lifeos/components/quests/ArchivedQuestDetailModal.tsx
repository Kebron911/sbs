import React from 'react';
import Modal from '../ui/Modal';
import { Quest } from '../../types';
import { useGame } from '../../contexts/GameContext';

interface ArchivedQuestDetailModalProps {
  quest: Quest;
  onClose: () => void;
}

const ArchivedQuestDetailModal: React.FC<ArchivedQuestDetailModalProps> = ({ quest, onClose }) => {
  const { getSkill } = useGame();
  const skill = getSkill(quest.skillId);

  return (
    <Modal isOpen={true} onClose={onClose} title="Archived Quest Details">
      <div className="space-y-4">
        <div className="p-4 bg-primary rounded-lg">
            <div className="flex justify-between items-start">
                <div>
                    <h4 className="font-bold text-xl text-white flex items-center">
                       <span className="text-2xl mr-2">{skill?.icon}</span> {quest.name}
                    </h4>
                    <p className="text-sm text-text-secondary mt-1">{quest.description}</p>
                </div>
                <div className="text-right flex-shrink-0 ml-4">
                    <span className="text-xs bg-secondary px-2 py-1 rounded">{new Date(quest.deadline).toLocaleDateString()}</span>
                    <span className={`block text-xs mt-1 px-2 py-1 rounded ${quest.threatLevel === 'Minor' ? 'bg-green-500/20 text-green-400' : quest.threatLevel === 'Major' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>{quest.threatLevel}</span>
                </div>
            </div>
        </div>
        
        <div className="p-3 bg-secondary rounded-lg border-l-4 border-accent">
            <h5 className="font-bold text-accent mb-1 text-sm">Purpose</h5>
            <p className="text-sm italic text-text-main">"{quest.purpose}"</p>
        </div>

        <div>
            <h5 className="font-bold text-accent mb-2">Completed Objectives</h5>
            <div className="space-y-2 p-3 bg-primary rounded-lg max-h-48 overflow-y-auto">
                {quest.objectives.map(objective => (
                    <div key={objective.id} className="flex items-center p-2 bg-background rounded">
                        <input 
                            type="checkbox" 
                            checked={true}
                            readOnly
                            className="w-5 h-5 rounded bg-primary border-border-color text-accent focus:ring-accent"
                        />
                        <label className="ml-3 flex-1 line-through text-text-secondary">
                            {objective.name}
                        </label>
                        <span className="text-xs font-bold text-xp">+{objective.xp} XP</span>
                    </div>
                ))}
            </div>
        </div>

      </div>
    </Modal>
  );
};

export default ArchivedQuestDetailModal;