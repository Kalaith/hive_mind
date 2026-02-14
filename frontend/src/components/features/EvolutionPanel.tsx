import React from 'react';
import { useGameStore } from '../../stores/gameStore';
import { useUIStore } from '../../stores/uiStore';

import type { EvolutionBonuses } from '../../stores/gameStore';

interface EvolutionBonus {
  id: keyof EvolutionBonuses;
  name: string;
  description: string;
  cost: number;
  icon: string;
  requirements: string;
}

const evolutionBonuses: EvolutionBonus[] = [
  {
    id: 'enhancedMetabolism',
    name: 'Enhanced Metabolism',
    description: '+25% resource production from all units',
    cost: 100,
    icon: '⚡',
    requirements: 'Basic evolution',
  },
  {
    id: 'rapidGrowth',
    name: 'Rapid Growth',
    description: '-20% unit production time',
    cost: 150,
    icon: '🚀',
    requirements: 'Enhanced Metabolism',
  },
  {
    id: 'knowledgeSynthesis',
    name: 'Knowledge Synthesis',
    description: '+50% knowledge generation',
    cost: 200,
    icon: '🧠',
    requirements: 'Workers >= 10',
  },
  {
    id: 'territorialDominance',
    name: 'Territorial Dominance',
    description: '+30% territory expansion rate',
    cost: 250,
    icon: '🗺️',
    requirements: 'Scouts >= 5',
  },
  {
    id: 'hiveUnity',
    name: 'Hive Unity',
    description: 'All bonuses receive +10% effectiveness',
    cost: 500,
    icon: '👑',
    requirements: 'All other evolutions unlocked',
  },
];

const EvolutionPanel: React.FC = () => {
  const { evolution, units, spendResources, canAfford, unlockBonus } = useGameStore();
  const { addNotification } = useUIStore();

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return Math.floor(num).toString();
  };

  const isEvolutionUnlocked = (bonus: EvolutionBonus): boolean => {
    if (bonus.requirements === 'Basic evolution') return true;
    if (bonus.requirements === 'Enhanced Metabolism') {
      return evolution.bonuses.enhancedMetabolism;
    }
    if (bonus.requirements === 'Workers >= 10') {
      return units.workers >= 10;
    }
    if (bonus.requirements === 'Scouts >= 5') {
      return units.scouts >= 5;
    }
    if (bonus.requirements === 'All other evolutions unlocked') {
      return (
        evolution.bonuses.enhancedMetabolism &&
        evolution.bonuses.rapidGrowth &&
        evolution.bonuses.knowledgeSynthesis &&
        evolution.bonuses.territorialDominance
      );
    }
    return false;
  };

  const handlePurchaseEvolution = (bonus: EvolutionBonus) => {
    const cost = { knowledge: bonus.cost };

    if (canAfford(cost)) {
      spendResources(cost);
      unlockBonus(bonus.id);
      addNotification({
        type: 'success',
        title: 'Evolution Unlocked!',
        message: `${bonus.name}: ${bonus.description}`,
        duration: 6000,
      });
    }
  };

  // Calculate total units for cocoon requirement
  const totalUnits = Object.values(units).reduce((sum, count) => sum + count, 0);
  const canEnterCocoon = totalUnits >= 50;

  const handleEnterCocoon = () => {
    if (canEnterCocoon) {
      // Future: Implement prestige/cocoon system
      addNotification({
        type: 'info',
        title: 'Cocoon System',
        message: 'Cocoon evolution system coming soon in Phase 2!',
        duration: 5000,
      });
    }
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <h3 className="text-xl font-bold mb-2">Evolution</h3>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">🧬</span>
        <span className="font-semibold">
          Points: <span className="text-purple-400">{formatNumber(evolution.points)}</span>
        </span>
      </div>

      <div className="space-y-3 mb-4">
        {evolutionBonuses.map(bonus => {
          const isUnlocked = isEvolutionUnlocked(bonus);
          const isPurchased = evolution.bonuses[bonus.id];
          const canAffordBonus = canAfford({ knowledge: bonus.cost });

          if (!isUnlocked) return null;

          return (
            <div
              key={bonus.id}
              className={`bg-gray-700 p-3 rounded-lg border-2 transition-all ${
                isPurchased
                  ? 'border-green-500 bg-green-900/30'
                  : canAffordBonus
                    ? 'border-purple-500 hover:border-purple-400'
                    : 'border-gray-600'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{bonus.icon}</span>
                  <div>
                    <h4 className="text-sm font-bold text-purple-300">{bonus.name}</h4>
                    <p className="text-xs text-gray-400">{bonus.requirements}</p>
                  </div>
                </div>
                {isPurchased && <span className="text-green-400 text-sm">✓ Active</span>}
              </div>

              <p className="text-xs text-gray-300 mb-2">{bonus.description}</p>

              <div className="flex items-center justify-between">
                <span className="text-xs text-purple-400">Cost: {bonus.cost} Knowledge</span>
                {!isPurchased && (
                  <button
                    onClick={() => handlePurchaseEvolution(bonus)}
                    disabled={!canAffordBonus}
                    className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                      canAffordBonus
                        ? 'bg-purple-600 hover:bg-purple-700 text-white'
                        : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {canAffordBonus ? 'Evolve' : 'Need Knowledge'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t border-gray-600 pt-4">
        <button
          onClick={handleEnterCocoon}
          disabled={!canEnterCocoon}
          className={`w-full py-2 px-4 rounded font-medium transition-colors ${
            canEnterCocoon
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
          }`}
        >
          🛡️ Enter Cocoon ({totalUnits}/50 units)
        </button>
        <p className="text-xs text-gray-400 mt-1 text-center">
          Cocoon allows major evolution branches
        </p>
      </div>
    </div>
  );
};

export default EvolutionPanel;
