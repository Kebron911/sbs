import React from 'react';
import { useGame } from '../../contexts/GameContext';
import { SparkleIcon } from '../../screens/lib/icons';

const AICompanionFAB: React.FC = () => {
  const { isAiChatOpen, toggleAiChat } = useGame();

  return (
    <button
      onClick={toggleAiChat}
      className={`fixed bottom-20 md:bottom-8 right-5 md:right-8 z-[60] w-14 h-14 rounded-full flex items-center justify-center
                  bg-accent text-white shadow-lg transition-all duration-300 ease-in-out
                  hover:scale-110 focus:outline-none focus:ring-4 focus:ring-accent/50
                  ${isAiChatOpen ? 'rotate-90 bg-secondary' : 'animate-pulse-slow'}`}
      aria-label={isAiChatOpen ? 'Close AI Companion' : 'Open AI Companion'}
    >
      {isAiChatOpen ? (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      ) : (
        <SparkleIcon />
      )}
      <style>{`
        @keyframes pulse-slow {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 0 0 0 var(--color-accent);
          }
          50% {
            transform: scale(1.05);
            box-shadow: 0 0 0 10px rgba(var(--color-accent-rgb), 0);
          }
        }
        .animate-pulse-slow {
            --color-accent-rgb: 233, 69, 96; /* E94560 */
            animation: pulse-slow 3s infinite;
        }
      `}</style>
    </button>
  );
};

export default AICompanionFAB;