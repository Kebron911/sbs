import React, { useState, useMemo } from 'react';
import { useGame } from '../contexts/GameContext';
import { QuestTemplate } from '../types';
import Card from '../components/ui/Card';
import QuestTemplateDetailModal from '../components/quests/QuestTemplateDetailModal';

const QuestTemplateLibraryScreen: React.FC = () => {
    const { questTemplates, getSkill } = useGame();
    const [selectedTemplate, setSelectedTemplate] = useState<QuestTemplate | null>(null);
    const [filter, setFilter] = useState<string>('all');

    const templatesByCategory = useMemo(() => {
        const categories: { [key: string]: QuestTemplate[] } = {};
        questTemplates.forEach(template => {
            if (!categories[template.category]) {
                categories[template.category] = [];
            }
            categories[template.category].push(template);
        });
        return categories;
    }, [questTemplates]);

    const filteredTemplates = useMemo(() => {
        if (filter === 'all') return templatesByCategory;
        return { [filter]: templatesByCategory[filter] };
    }, [filter, templatesByCategory]);
    
    const categories = ['all', ...Object.keys(templatesByCategory)];

    return (
        <div className="space-y-8">
            <h1 className="font-display text-3xl md:text-4xl text-white">Quest Template Library</h1>
            <p className="text-text-secondary">Browse community-made templates to kickstart your next big project.</p>
            
            <div className="flex space-x-2 overflow-x-auto pb-2">
                {categories.map(cat => (
                    <button 
                        key={cat}
                        onClick={() => setFilter(cat)}
                        className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${filter === cat ? 'bg-accent text-white' : 'bg-secondary text-text-main hover:bg-primary'}`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            <div className="space-y-6">
                {Object.entries(filteredTemplates).map(([category, templates]) => (
                    <div key={category}>
                        <h2 className="font-display text-2xl text-accent mb-4">{category}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {templates.map(template => (
                                <Card 
                                    key={template.id}
                                    className="bg-primary hover:border-accent cursor-pointer transition-all flex flex-col justify-between"
                                    onClick={() => setSelectedTemplate(template)}
                                >
                                    <div>
                                        <h3 className="font-bold text-lg text-white flex items-center">
                                            <span className="text-2xl mr-2">{getSkill(template.skillId)?.icon}</span>
                                            {template.name}
                                        </h3>
                                        <p className="text-xs text-text-secondary mt-1">
                                            {template.threatLevel} | {template.objectives.length} objectives
                                        </p>
                                        <p className="text-sm text-text-secondary mt-2 h-16 overflow-hidden">{template.description}</p>
                                    </div>
                                    <button className="text-right text-sm text-accent font-bold mt-4">View Template &rarr;</button>
                                </Card>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {selectedTemplate && (
                <QuestTemplateDetailModal 
                    template={selectedTemplate}
                    onClose={() => setSelectedTemplate(null)}
                />
            )}
        </div>
    );
};

export default QuestTemplateLibraryScreen;