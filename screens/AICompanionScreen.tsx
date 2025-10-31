import React, { useState } from 'react';
import Card from '../components/ui/Card';
import { useGame } from '../contexts/GameContext';
import Button from '../components/ui/Button';

interface Message {
  text: string;
  sender: 'user' | 'ai';
}

const ChatView: React.FC = () => {
  const { character } = useGame();
  const [messages, setMessages] = useState<Message[]>([
    { sender: 'ai', text: `Greetings, ${character.name}! I'm here to help you on your journey. What shall we conquer today?` },
    { sender: 'ai', text: `You're only ${character.xpToNextLevel - character.xp} XP away from Level ${character.level + 1}! Let's get a new mission.` }
  ]);
  const [input, setInput] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() === '') return;
    const userMessage: Message = { sender: 'user', text: input };
    const aiResponse: Message = { sender: 'ai', text: "That's a great idea! I'll generate a new quest for you based on that. Check your Quests tab." };
    setMessages([...messages, userMessage, aiResponse]);
    setInput('');
  };

  return (
    <Card className="h-[70vh] flex flex-col p-0">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-xl ${msg.sender === 'user' ? 'bg-accent text-white' : 'bg-primary text-text-main'}`}>
              {msg.text}
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={handleSend} className="p-4 border-t border-border-color flex">
        <input
          type="text" value={input} onChange={(e) => setInput(e.target.value)}
          placeholder="Ask for a new mission or advice..."
          className="flex-1 bg-primary border border-border-color rounded-l-lg p-2 text-text-main focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <button type="submit" className="bg-accent text-white font-bold px-4 rounded-r-lg hover:bg-accent/80 transition-colors">Send</button>
      </form>
    </Card>
  );
};

const JournalView: React.FC = () => {
    // FIX: Renamed analyzeJournalEntry to analyzeChronicleEntry to match GameContext.
    const { analyzeChronicleEntry, character } = useGame();
    const [entry, setEntry] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!entry.trim() || isLoading) return;
        
        setIsLoading(true);
        await analyzeChronicleEntry(entry);
        setEntry('');
        setIsLoading(false);
    };

    return (
        <Card className="h-[70vh] flex flex-col">
            <h2 className="font-display text-xl text-accent mb-2">Reflection Journal</h2>
            <p className="text-sm text-text-secondary mb-4">
                Write about your day, your progress, or your thoughts. Your AI companion will analyze your reflection and may award you with Wisdom XP for your insights.
            </p>
            <form onSubmit={handleSubmit} className="flex flex-col flex-1">
                <textarea
                    value={entry}
                    onChange={(e) => setEntry(e.target.value)}
                    placeholder="Today I learned..."
                    className="flex-1 bg-primary border border-border-color rounded-lg p-3 text-text-main w-full resize-none focus:outline-none focus:ring-2 focus:ring-accent"
                    disabled={isLoading}
                />
                <Button type="submit" className="mt-4" disabled={isLoading || !entry.trim()}>
                    {isLoading ? 'Analyzing...' : `Submit for +${character.attributes.wisdom.value} Wisdom`}
                </Button>
            </form>
        </Card>
    );
};


const AICompanionScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'chat' | 'journal'>('chat');

  const TabButton: React.FC<{ tab: typeof activeTab, label: string }> = ({ tab, label }) => (
    <button
        onClick={() => setActiveTab(tab)}
        className={`px-4 py-2 font-display text-sm rounded-t-lg transition-colors duration-200 focus:outline-none ${
            activeTab === tab ? 'bg-secondary text-accent border-b-2 border-accent' : 'bg-transparent text-text-secondary hover:text-white'
        }`}
    >
        {label}
    </button>
  );
  
  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl md:text-4xl text-white">AI Companion</h1>
      <div>
          <div className="border-b border-border-color">
              <TabButton tab="chat" label="Chat" />
              <TabButton tab="journal" label="Journal" />
          </div>
          <div className="py-6">
              {activeTab === 'chat' && <ChatView />}
              {activeTab === 'journal' && <JournalView />}
          </div>
      </div>
    </div>
  );
};

export default AICompanionScreen;
