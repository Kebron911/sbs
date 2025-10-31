import React from 'react';
import { useGame } from '../contexts/GameContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { PrestigeUpgrade } from '../types';

const PrestigeScreen: React.FC = () => {
    const { character, prestige, prestigeUpgrades, purchasePrestigeUpgrade } = useGame();
    const PRESTIGE_LEVEL_REQ = 20;

    const canPrestige = character.level >= PRESTIGE_LEVEL_REQ;
    const pointsOnPrestige = Math.floor(character.level / 10);

    const handlePrestige = () => {
        if (window.confirm(`Are you sure you want to prestige? Your Level, XP, Coins, and Skill levels will be reset. You will gain ${pointsOnPrestige} Prestige Point(s).`)) {
            prestige();
        }
    };

    const UpgradeCard: React.FC<{ upgrade: PrestigeUpgrade }> = ({ upgrade }) => {
        const isPurchased = character.purchasedPrestigeUpgrades.includes(upgrade.id);
        const canAfford = character.prestigePoints >= upgrade.cost;
        return (
            <div className={`p-4 bg-primary rounded-lg border ${isPurchased ? 'border-accent' : 'border-border-color'}`}>
                <h4 className="font-bold text-white">{upgrade.name}</h4>
                <p className="text-sm text-text-secondary my-2">{upgrade.description}</p>
                <div className="flex justify-between items-center mt-3">
                    <span className="font-display text-lg text-coins">{upgrade.cost} PP</span>
                    <Button 
                        variant="secondary" 
                        className="px-3 py-1 text-sm"
                        onClick={() => purchasePrestigeUpgrade(upgrade)}
                        disabled={isPurchased || !canAfford}
                    >
                        {isPurchased ? 'Purchased' : 'Purchase'}
                    </Button>
                </div>
            </div>
        )
    };

    return (
        <div className="space-y-8">
            <h1 className="font-display text-3xl md:text-4xl text-white">Prestige & Upgrades</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card title="Prestige Status" className="lg:col-span-1">
                    <div className="text-center space-y-4">
                        <div>
                            <p className="text-text-secondary">Current Prestige Level</p>
                            <p className="font-display text-5xl text-accent">{character.prestigeLevel}</p>
                        </div>
                        <div>
                            <p className="text-text-secondary">Prestige Points</p>
                            <p className="font-display text-5xl text-coins">{character.prestigePoints}</p>
                        </div>
                        <div className="pt-4">
                            <Button onClick={handlePrestige} disabled={!canPrestige} className="w-full">
                                {canPrestige ? `Prestige Now (+${pointsOnPrestige} PP)` : `Reach Level ${PRESTIGE_LEVEL_REQ}`}
                            </Button>
                            <p className="text-xs text-text-secondary mt-2">
                                Resets Level, XP, Coins, and Skill levels. Habits, Quests, Items and Goals are kept.
                            </p>
                        </div>
                    </div>
                </Card>

                <Card title="Permanent Upgrades" className="lg:col-span-2">
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                        {prestigeUpgrades.map(upgrade => (
                            <UpgradeCard key={upgrade.id} upgrade={upgrade} />
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default PrestigeScreen;