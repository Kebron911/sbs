import React, { useState, useLayoutEffect } from 'react';
import { useGame } from '../../contexts/GameContext';

interface TourStep {
    tourId: string;
    title: string;
    content: string;
    placement?: 'top' | 'bottom' | 'left' | 'right';
}

const TOUR_STEPS: TourStep[] = [
    {
        tourId: 'habits-link',
        title: 'Step 1: Habits & Skills',
        content: "Click here to manage your routines and level up your skills. This is your training ground.",
        placement: 'right',
    },
    {
        tourId: 'add-habit-button',
        title: 'Step 2: Create a Habit',
        content: "Click here to create your first daily habit. This is the core of building a streak.",
        placement: 'bottom',
    },
    {
        tourId: 'habit-name-input',
        title: 'Step 3: Name Your Habit',
        content: "Give your habit a name, like 'Read for 15 minutes'. When you save it, the tour will end!",
        placement: 'bottom',
    },
];

const GuidedTour: React.FC = () => {
    const { tutorialStep, completeTutorial } = useGame();
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

    const currentStep = TOUR_STEPS[tutorialStep - 1];

    useLayoutEffect(() => {
        if (!currentStep) return;

        let element: HTMLElement | null = null;
        let originalZIndex = '';
        let originalPosition = '';

        const interval = setInterval(() => {
            const foundElement = document.querySelector<HTMLElement>(`[data-tour-id="${currentStep.tourId}"]`);
            if (foundElement) {
                clearInterval(interval);
                element = foundElement;
                setTargetRect(element.getBoundingClientRect());
                
                originalZIndex = element.style.zIndex;
                originalPosition = element.style.position;
                
                element.style.zIndex = '10001';
                element.style.position = 'relative';
            }
        }, 100);

        return () => {
            clearInterval(interval);
            if (element) {
                element.style.zIndex = originalZIndex;
                element.style.position = originalPosition;
            }
        };
    }, [currentStep?.tourId]);


    if (!currentStep || !targetRect) {
        return (
            // Render a full-screen overlay while searching for the element to prevent user interaction
             <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 10000 }} />
        );
    }
    
    const tooltipStyle: React.CSSProperties = {
        position: 'fixed',
        zIndex: 10002, // Higher than the lifted element
        pointerEvents: 'none',
    };

    switch (currentStep.placement) {
        case 'top':
            tooltipStyle.bottom = window.innerHeight - targetRect.top + 8;
            tooltipStyle.left = targetRect.left + targetRect.width / 2;
            tooltipStyle.transform = 'translateX(-50%)';
            break;
        case 'right':
            tooltipStyle.top = targetRect.top;
            tooltipStyle.left = targetRect.right + 8;
            break;
        case 'left':
            tooltipStyle.top = targetRect.top;
            tooltipStyle.right = window.innerWidth - targetRect.left + 8;
            break;
        case 'bottom':
        default:
            tooltipStyle.top = targetRect.bottom + 8;
            tooltipStyle.left = targetRect.left + targetRect.width / 2;
            tooltipStyle.transform = 'translateX(-50%)';
            break;
    }


    return (
        <>
            {/* The overlay is now a single div. The target element is lifted above it via z-index. */}
            <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 10000 }} />
            
            {/* Tooltip */}
            <div 
                style={tooltipStyle}
                className="bg-secondary p-4 rounded-lg border border-accent shadow-lg w-72 animate-fade-in"
            >
                <h3 className="font-display text-accent text-lg mb-2">{currentStep.title}</h3>
                <p className="text-sm text-text-secondary mb-4">{currentStep.content}</p>
                 <div className="flex justify-end mt-2 pt-2 border-t border-border-color" style={{ pointerEvents: 'auto' }}>
                    <button 
                        onClick={() => completeTutorial()}
                        className="text-xs text-text-secondary hover:text-white underline transition-colors"
                    >
                        Skip Tour
                    </button>
                </div>
            </div>
        </>
    );
};

export default GuidedTour;