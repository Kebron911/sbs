import React, { useState } from 'react';
import { useGame } from '../../contexts/GameContext';

import WelcomeStep from './WelcomeStep';
import LoginStep from './LoginStep';
import CharacterCreationStep from './CharacterCreationStep';
import ClassQuizStep from './ClassQuizStep';
import TutorialQuestStep from './TutorialQuestStep';
import PermissionsStep from './PermissionsStep';

type CharacterData = {
    name: string;
}

const OnboardingFlow: React.FC = () => {
    const { completeOnboarding } = useGame();
    const [step, setStep] = useState(1);
    const [characterData, setCharacterData] = useState<CharacterData>({
        name: '',
    });

    const totalSteps = 6;

    const handleNext = () => setStep(prev => Math.min(prev + 1, totalSteps));

    const handleCharacterCreate = (data: Partial<CharacterData>) => {
        setCharacterData(prev => ({ ...prev, ...data }));
        handleNext();
    }
    
    const handleFinish = () => {
        completeOnboarding({ name: characterData.name });
    }

    const renderStep = () => {
        switch (step) {
            case 1:
                return <WelcomeStep onNext={handleNext} />;
            case 2:
                return <LoginStep onNext={handleNext} />;
            case 3:
                return <CharacterCreationStep onNext={handleCharacterCreate} />;
            case 4:
                return <ClassQuizStep onNext={handleNext} />;
            case 5:
                return <TutorialQuestStep onNext={handleNext} />;
            case 6:
                return <PermissionsStep onFinish={handleFinish} />;
            default:
                return <WelcomeStep onNext={handleNext} />;
        }
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="w-full max-w-2xl">
                <div className="mb-6 h-2 w-full bg-primary rounded-full border border-border-color">
                    <div className="h-full bg-accent rounded-full transition-all duration-500" style={{width: `${(step / totalSteps) * 100}%`}}></div>
                </div>
                {renderStep()}
            </div>
        </div>
    );
};

export default OnboardingFlow;