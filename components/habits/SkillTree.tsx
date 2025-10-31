import React from 'react';
import { Skill } from '../../types';
import Card from '../ui/Card';
import ProgressBar from '../ui/ProgressBar';

interface SkillTreeProps {
  skills: Skill[];
  onSkillClick: (skill: Skill) => void;
}

const SkillTree: React.FC<SkillTreeProps> = ({ skills, onSkillClick }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {skills.map(skill => (
        <Card 
          key={skill.id} 
          className="bg-primary hover:bg-primary/70 cursor-pointer transition-colors"
          onClick={() => onSkillClick(skill)}
        >
          <div className="flex items-center mb-4">
            <span className="text-4xl mr-4">{skill.icon}</span>
            <div>
              <h4 className="font-bold text-lg text-white">{skill.name}</h4>
              <p className="text-sm text-text-secondary">Level {skill.level}</p>
            </div>
          </div>
          <ProgressBar value={skill.xp} maxValue={skill.xpToNextLevel} color="bg-mana" label="Progress" />
        </Card>
      ))}
    </div>
  );
};

export default SkillTree;
