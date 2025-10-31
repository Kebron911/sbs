import React, { useState } from 'react';
import { useGame } from '../contexts/GameContext';
import Card from '../components/ui/Card';
import { Habit, HabitType, Skill } from '../types';
import Button from '../components/ui/Button';
import AddHabitModal from '../components/habits/AddHabitModal';
import AddSkillModal from '../components/habits/AddSkillModal';
import HabitItem from '../components/habits/HabitItem';
import SkillTree from '../components/habits/SkillTree';
import SkillDetailModal from '../components/habits/SkillDetailModal';
import HabitTemplateModal from '../components/habits/HabitTemplateModal';

const HabitsScreen: React.FC = () => {
    const { habits, skills, tutorialStep, advanceTutorial } = useGame();
    const [isAddHabitModalOpen, setIsAddHabitModalOpen] = useState(false);
    const [habitToEdit, setHabitToEdit] = useState<Habit | null>(null);
    const [isAddSkillModalOpen, setIsAddSkillModalOpen] = useState(false);
    const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
    const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);

    const goodHabits = habits.filter(h => h.type === HabitType.GOOD);
    const afflictions = habits.filter(h => h.type === HabitType.AFFLICTION);

    const openEditHabitModal = (habit: Habit) => {
        setHabitToEdit(habit);
        setIsAddHabitModalOpen(true);
    };

    const openAddHabitModal = () => {
        setHabitToEdit(null);
        setIsAddHabitModalOpen(true);
        if (tutorialStep === 2) {
            advanceTutorial();
        }
    };

    const closeAddHabitModal = () => {
        setHabitToEdit(null);
        setIsAddHabitModalOpen(false);
    };
    
    return (
        <div className="space-y-8">
            <h1 className="font-display text-3xl md:text-4xl text-white">Habits & Skills</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <Button variant="secondary" onClick={() => setIsTemplateModalOpen(true)}>Browse Templates</Button>
                        <Button onClick={openAddHabitModal} data-tour-id="add-habit-button">Add New Habit</Button>
                    </div>
                    <Card title="Good Habits">
                        <div className="space-y-3">
                            {goodHabits.map(habit => <HabitItem key={habit.id} habit={habit} onEdit={openEditHabitModal} />)}
                            {goodHabits.length === 0 && <p className="text-center text-text-secondary py-4">No good habits yet. Add one to get started!</p>}
                        </div>
                    </Card>
                    <Card title="Afflictions">
                         <div className="space-y-3">
                            {afflictions.map(habit => <HabitItem key={habit.id} habit={habit} onEdit={openEditHabitModal} />)}
                            {afflictions.length === 0 && <p className="text-center text-text-secondary py-4">No afflictions to fight. Your path is clear!</p>}
                        </div>
                    </Card>
                </div>
                <div className="space-y-6">
                    <Card>
                         <div className="flex justify-between items-center mb-4">
                            <h3 className="font-display text-lg text-accent">Skill Tree</h3>
                            <Button onClick={() => setIsAddSkillModalOpen(true)}>Add New Skill</Button>
                        </div>
                        <SkillTree skills={skills} onSkillClick={setSelectedSkill} />
                    </Card>
                </div>
            </div>

            <AddHabitModal isOpen={isAddHabitModalOpen} onClose={closeAddHabitModal} habitToEdit={habitToEdit} />
            <AddSkillModal isOpen={isAddSkillModalOpen} onClose={() => setIsAddSkillModalOpen(false)} />
            {selectedSkill && <SkillDetailModal skill={selectedSkill} onClose={() => setSelectedSkill(null)} />}
            <HabitTemplateModal isOpen={isTemplateModalOpen} onClose={() => setIsTemplateModalOpen(false)} />
        </div>
    );
};

export default HabitsScreen;