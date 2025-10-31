import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useGame } from '../../contexts/GameContext';
import { AIMessage, QuestTemplate } from '../../types';
import Button from '../ui/Button';

const AICompanionOverlay: React.FC = () => {
    const { isAiChatOpen, aiConversation, sendAiMessage, startQuestFromTemplate, showToast, toggleAiChat } = useGame();
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const [input, setInput] = useState('');
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [aiConversation]);

    const handleSend = (e: React.FormEvent, message?: string) => {
        e.preventDefault();
        const messageToSend = message || input;
        if (messageToSend.trim() === '') return;
        sendAiMessage(messageToSend, pathname);
        setInput('');
    };
    
    const handleCreateQuest = (plan: AIMessage['interactive']['data']) => {
        const template = {
            id: 'ai-gen',
            name: plan.name,
            description: plan.description,
            purpose: plan.purpose,
            skillId: 'work', // Default or ask AI to suggest
            threatLevel: 'Major' as const,
            category: 'AI Generated',
            objectives: plan.objectives.map(o => ({ name: o })),
        };
        startQuestFromTemplate(template as any); // Type assertion to fit existing structure
        showToast({ message: 'Quest plan loaded! Review and save.', type: 'success'});
        toggleAiChat();
        navigate('/quests');
    };

    const getSuggestedPrompts = () => {
        if (pathname.includes('/quests')) {
            return ["Help me create a quest to learn a new skill.", "Break down 'Plan a vacation' into objectives.", "Suggest a high-leverage quest for my 'Side Project' goal."];
        }
        if (pathname.includes('/goals')) {
            return ["Help me define a SMART goal.", "Are my quests aligned with my goals?", "What's a good first quest for my 'Improve Health' goal?"];
        }
        return ["What should I focus on today?", "Give me a motivational quote.", "Summarize my progress this week."];
    };
    
    if (!isAiChatOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            {/* Desktop: Side Panel */}
            <div
                className="hidden md:flex flex-col bg-secondary border-l border-border-color w-full max-w-md h-full shadow-2xl"
                style={{ animation: 'slideIn 0.3s ease-out' }}
            >
                <ChatContent handleSend={handleSend} input={input} setInput={setInput} getSuggestedPrompts={getSuggestedPrompts} handleCreateQuest={handleCreateQuest} chatEndRef={chatEndRef} />
            </div>

            {/* Mobile: Bottom Sheet */}
            <div className="md:hidden fixed inset-0 bg-black/60" onClick={toggleAiChat}>
                <div
                    className="absolute bottom-0 left-0 right-0 bg-secondary border-t border-border-color rounded-t-2xl p-4 flex flex-col h-[75vh]"
                    style={{ animation: 'slideUp 0.3s ease-out' }}
                    onClick={e => e.stopPropagation()}
                >
                    <div className="text-center mb-2 pb-2 border-b border-border-color">
                        <span className="w-10 h-1.5 bg-border-color rounded-full inline-block"></span>
                        <h3 className="font-display text-accent text-lg">AI Companion</h3>
                    </div>
                    <ChatContent handleSend={handleSend} input={input} setInput={setInput} getSuggestedPrompts={getSuggestedPrompts} handleCreateQuest={handleCreateQuest} chatEndRef={chatEndRef} />
                </div>
            </div>
            <style>{`
                @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
                @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
            `}</style>
        </div>
    );
};

const ChatContent: React.FC<any> = ({ handleSend, input, setInput, getSuggestedPrompts, handleCreateQuest, chatEndRef }) => {
    const { aiConversation } = useGame();
    return (
        <>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {aiConversation.map(msg => (
                    <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs lg:max-w-sm px-4 py-3 rounded-2xl ${msg.sender === 'user' ? 'bg-accent text-white rounded-br-none' : 'bg-primary text-text-main rounded-bl-none'}`}>
                            {msg.isLoading ? (
                                <div className="flex items-center space-x-2">
                                    <span className="w-2 h-2 bg-text-secondary rounded-full animate-bounce" style={{animationDelay: '0s'}}></span>
                                    <span className="w-2 h-2 bg-text-secondary rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
                                    <span className="w-2 h-2 bg-text-secondary rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></span>
                                </div>
                            ) : (
                                <p className="whitespace-pre-wrap">{msg.text}</p>
                            )}
                            {msg.interactive?.type === 'create_quest_plan' && (
                                <Button onClick={() => handleCreateQuest(msg.interactive.data)} className="w-full mt-3 text-sm py-2">
                                    Add as Quest
                                </Button>
                            )}
                        </div>
                    </div>
                ))}
                <div ref={chatEndRef} />
            </div>
            
            {aiConversation.length <= 1 && (
                <div className="px-4 pb-2">
                    <p className="text-sm font-bold text-text-secondary mb-2">Suggested Prompts:</p>
                    <div className="flex flex-wrap gap-2">
                        {getSuggestedPrompts().map((prompt: string) => (
                            <button key={prompt} onClick={(e) => handleSend(e, prompt)} className="text-xs bg-primary px-3 py-1 rounded-full hover:bg-accent hover:text-white transition-colors">
                                {prompt}
                            </button>
                        ))}
                    </div>
                </div>
            )}
            
            <form onSubmit={handleSend} className="p-4 border-t border-border-color flex items-center gap-2">
                <input
                    type="text" value={input} onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask Spark anything..."
                    className="flex-1 bg-primary border border-border-color rounded-full py-2 px-4 text-text-main focus:outline-none focus:ring-2 focus:ring-accent"
                />
                <button type="submit" className="w-10 h-10 bg-accent text-white rounded-full flex-shrink-0 flex items-center justify-center hover:bg-accent/80 transition-colors" aria-label="Send message">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                      <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.949a.75.75 0 00.95.826L11.25 9.25v1.5L4.643 12.01a.75.75 0 00-.95.826l-1.414 4.949a.75.75 0 00.95.826L16.25 12l-13.145-9.711z" />
                    </svg>
                </button>
            </form>
        </>
    );
};


export default AICompanionOverlay;