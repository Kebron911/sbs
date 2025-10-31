import React from 'react';
import { useGame } from '../../contexts/GameContext';
import { Gear } from '../../types';

const GearTab: React.FC = () => {
    const { gear, character, equipItem } = useGame();

    const GearSlot: React.FC<{ title: 'Head' | 'Torso' | 'Legs' }> = ({ title }) => {
        const slotKey = title.toLowerCase() as keyof typeof character.equipment;
        
        // Only show items that are in the player's inventory
        const ownedItemsInSlot = gear.filter(g => g.slot === slotKey && character.inventory.includes(g.id));
        
        const equippedItemId = character.equipment[slotKey];

        return (
            <div>
                <h3 className="font-bold text-lg text-text-secondary mb-3">{title}</h3>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                    {ownedItemsInSlot.map(item => (
                        <div key={item.id}
                             onClick={() => equipItem(item)}
                             className={`p-3 rounded-lg cursor-pointer border-2 flex flex-col items-center justify-center aspect-square transition-all
                                        ${equippedItemId === item.id ? 'border-accent bg-accent/20' : 'border-border-color bg-primary hover:border-accent/50'}`}>
                            <div className="text-4xl">{item.icon}</div>
                            <p className="text-xs text-center mt-2 font-bold">{item.name}</p>
                            <p className="text-[10px] text-center text-text-secondary">{item.description}</p>
                        </div>
                    ))}
                     <div onClick={() => equippedItemId && equipItem(gear.find(g => g.id === equippedItemId)!)}
                          className={`p-3 rounded-lg cursor-pointer border-2 flex flex-col items-center justify-center aspect-square transition-all border-dashed border-border-color text-text-secondary hover:border-accent/50 hover:text-white
                                     ${!equippedItemId ? 'bg-primary' : ''}`}>
                            <div className="text-4xl">🚫</div>
                            <p className="text-xs text-center mt-2 font-bold">Unequip</p>
                        </div>
                </div>
                 {ownedItemsInSlot.length === 0 && (
                    <div className="p-4 text-center text-sm text-text-secondary bg-primary rounded-lg">
                        No {title} gear owned. Visit the Marketplace to buy some!
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-8">
            <GearSlot title="Head" />
            <GearSlot title="Torso" />
            <GearSlot title="Legs" />
        </div>
    );
};

export default GearTab;