import React from 'react';
import { Quest } from '../../types';
import Card from '../ui/Card';

interface ArchiveViewProps {
  quests: Quest[];
  onViewQuest: (quest: Quest) => void;
}

const ArchiveView: React.FC<ArchiveViewProps> = ({ quests, onViewQuest }) => {
    return (
        <Card>
            <h3 className="font-display text-lg text-accent mb-4">Completed Quests</h3>
             <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                {quests.length > 0 ? (
                    quests.map(quest => (
                        <div 
                            key={quest.id} 
                            className="p-3 bg-primary rounded-lg border border-border-color opacity-70 cursor-pointer hover:opacity-100 hover:border-accent/50 transition-all"
                            onDoubleClick={() => onViewQuest(quest)}
                        >
                            <div className="flex justify-between items-center">
                                <p className="font-bold text-white line-through">{quest.name}</p>
                                <span className="text-xs text-text-secondary">{new Date(quest.deadline).toLocaleDateString()}</span>
                            </div>
                            <p className="text-sm text-text-secondary mt-1">{quest.objectives.length} Objectives completed.</p>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-text-secondary py-4">No quests completed yet. Finish an active quest to see it here!</p>
                )}
            </div>
        </Card>
    );
};

export default ArchiveView;