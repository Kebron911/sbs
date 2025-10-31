import React from 'react';
import { useGame } from '../contexts/GameContext';
import Card from '../components/ui/Card';
import { Item } from '../types';

const RARITY_COLORS: { [key: string]: string } = {
    Common: 'border-gray-400 text-gray-400',
    Uncommon: 'border-green-400 text-green-400',
    Rare: 'border-blue-400 text-blue-400',
    Epic: 'border-purple-500 text-purple-500',
    Legendary: 'border-orange-500 text-orange-500',
};

const ItemCard: React.FC<{ item: Item }> = ({ item }) => {
    const { character, purchaseItem } = useGame();
    const rarityStyle = RARITY_COLORS[item.rarity] || 'border-gray-400';

    const canAfford = character.coins >= item.price;
    const isOwned = item.type !== 'Boost' && character.inventory.includes(item.id);

    return (
        <Card className={`text-center flex flex-col justify-between border-2 ${rarityStyle}`}>
            <div>
                <div className="text-6xl mb-4 flex items-center justify-center h-20">{item.icon}</div>
                <h4 className="font-bold text-lg text-white">{item.name}</h4>
                <p className="text-xs text-text-secondary h-10">{item.description}</p>
                <p className={`font-display text-sm mt-2 ${rarityStyle}`}>{item.rarity}</p>
            </div>
            <button 
                onClick={() => purchaseItem(item.id)}
                disabled={!canAfford || isOwned}
                className="mt-4 w-full bg-accent hover:bg-accent/80 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed disabled:shadow-none"
            >
                {isOwned ? 'Owned' : `Buy for ${item.price} 🪙`}
            </button>
        </Card>
    )
}

const MarketplaceScreen: React.FC = () => {
    const { items, gear, character } = useGame();
    const allItems = [...items, ...gear];

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="font-display text-3xl md:text-4xl text-white">Marketplace</h1>
                <div className="bg-primary px-4 py-2 rounded-lg font-bold text-lg text-coins border-2 border-coins/50">
                    {character.coins} 🪙
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {allItems.map(item => <ItemCard key={item.id} item={item} />)}
            </div>
            
            <Card title="Black Market">
                <p className="text-text-secondary">Feeling lucky? Risk your coins for a chance at legendary loot... or lose it all.</p>
                <button className="mt-4 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                    Take a Risk
                </button>
            </Card>
        </div>
    );
};

export default MarketplaceScreen;