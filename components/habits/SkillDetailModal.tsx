import React from 'react';
import Modal from '../ui/Modal';
import { Skill } from '../../types';
import ProgressBar from '../ui/ProgressBar';

interface SkillDetailModalProps {
  skill: Skill;
  onClose: () => void;
}

const SkillDetailModal: React.FC<SkillDetailModalProps> = ({ skill, onClose }) => {
  return (
    <Modal isOpen={true} onClose={onClose} title={`${skill.icon} ${skill.name}`}>
      <div className="space-y-4">
        <p className="text-text-secondary">{skill.description}</p>
        
        <div>
            <p className="font-bold text-white mb-2">Level {skill.level}</p>
            <ProgressBar value={skill.xp} maxValue={skill.xpToNextLevel} color="bg-mana" label="XP" />
        </div>

        <div>
            <h4 className="font-bold text-accent mb-2">Passive Perks</h4>
            {skill.perks.length > 0 ? (
                <ul className="list-disc list-inside space-y-1 text-sm text-text-main">
                    {skill.perks.map((perk, index) => <li key={index}>{perk}</li>)}
                </ul>
            ) : (
                <p className="text-sm text-text-secondary">No perks unlocked for this skill yet.</p>
            )}
        </div>
      </div>
    </Modal>
  );
};

export default SkillDetailModal;
