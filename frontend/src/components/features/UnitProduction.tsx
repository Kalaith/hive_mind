import React from 'react';
import { useGameStore } from '../../stores/gameStore';

interface UnitType {
  id: string;
  name: string;
  description: string;
  icon: string;
  baseCost: { biomass: number; energy: number; knowledge?: number; territory?: number };
  production: { biomass?: number; energy?: number; knowledge?: number; territory?: number };
  unlockRequirement: string;
}

const UNIT_TYPES: UnitType[] = [
  {
    id: 'workers',
    name: 'Workers',
    description: 'Gather biomass and energy for the hive',
    icon: '🐜',
    baseCost: { biomass: 10, energy: 5 },
    production: { biomass: 2, energy: 1 },
    unlockRequirement: 'start',
  },
  {
    id: 'scouts',
    name: 'Scouts',
    description: 'Explore territory and gather knowledge',
    icon: '🕷️',
    baseCost: { biomass: 15, energy: 10 },
    production: { territory: 1, knowledge: 0.5 },
    unlockRequirement: 'workers >= 5',
  },
  {
    id: 'soldiers',
    name: 'Soldiers',
    description: 'Defend and expand hive territory',
    icon: '🦂',
    baseCost: { biomass: 25, energy: 15, knowledge: 5 },
    production: { territory: 0.5 },
    unlockRequirement: 'scouts >= 3',
  },
  {
    id: 'specialists',
    name: 'Specialists',
    description: 'Advanced units that generate knowledge',
    icon: '🦗',
    baseCost: { biomass: 40, energy: 20, knowledge: 10 },
    production: { knowledge: 2, energy: -1 },
    unlockRequirement: 'soldiers >= 2',
  },
];

const UnitProduction: React.FC = () => {
  const { units, resources, canAfford, spendResources, addUnit } = useGameStore();

  const getUnitCost = (unitType: UnitType) => {
    const currentCount = units[unitType.id as keyof typeof units] || 0;
    const costMultiplier = Math.pow(1.15, currentCount); // 15% cost increase per unit
    
    return {
      biomass: Math.floor(unitType.baseCost.biomass * costMultiplier),
      energy: Math.floor(unitType.baseCost.energy * costMultiplier),
      knowledge: unitType.baseCost.knowledge ? Math.floor(unitType.baseCost.knowledge * costMultiplier) : 0,
      territory: unitType.baseCost.territory ? Math.floor(unitType.baseCost.territory * costMultiplier) : 0,
    };
  };

  const isUnitUnlocked = (unitType: UnitType): boolean => {
    if (unitType.unlockRequirement === 'start') return true;
    
    // Simple requirement parsing - can be enhanced later
    if (unitType.unlockRequirement.includes('workers >= 5')) {
      return units.workers >= 5;
    }
    if (unitType.unlockRequirement.includes('scouts >= 3')) {
      return units.scouts >= 3;
    }
    if (unitType.unlockRequirement.includes('soldiers >= 2')) {
      return units.soldiers >= 2;
    }
    
    return false;
  };

  const handlePurchaseUnit = (unitType: UnitType) => {
    const cost = getUnitCost(unitType);
    
    if (canAfford(cost)) {
      spendResources(cost);
      addUnit(unitType.id as keyof typeof units, 1);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return Math.floor(num).toString();
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <h2 className="text-xl font-bold mb-4">Unit Production</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {UNIT_TYPES.map((unitType) => {
          const isUnlocked = isUnitUnlocked(unitType);
          const currentCount = units[unitType.id as keyof typeof units] || 0;
          const cost = getUnitCost(unitType);
          const canAffordUnit = canAfford(cost);

          if (!isUnlocked) return null;

          return (
            <div
              key={unitType.id}
              className={`bg-gray-700 p-4 rounded-lg border-2 transition-all ${
                canAffordUnit ? 'border-green-500 hover:border-green-400' : 'border-gray-600'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{unitType.icon}</span>
                  <div>
                    <h3 className="text-lg font-bold">{unitType.name}</h3>
                    <span className="text-sm text-gray-300">Count: {currentCount}</span>
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-gray-300 mb-3">{unitType.description}</p>
              
              <div className="mb-3">
                <div className="text-sm text-gray-400 mb-1">Production per unit:</div>
                <div className="flex gap-2 text-xs">
                  {Object.entries(unitType.production).map(([resource, amount]) => (
                    <span key={resource} className={`px-2 py-1 rounded ${amount! > 0 ? 'bg-green-600' : 'bg-red-600'}`}>
                      {resource}: {amount! > 0 ? '+' : ''}{amount}/s
                    </span>
                  ))}
                </div>
              </div>

              <div className="mb-3">
                <div className="text-sm text-gray-400 mb-1">Cost:</div>
                <div className="flex gap-2 text-xs">
                  {Object.entries(cost).map(([resource, amount]) => {
                    if (amount === 0) return null;
                    const hasEnough = resources[resource as keyof typeof resources] >= amount;
                    return (
                      <span key={resource} className={`px-2 py-1 rounded ${hasEnough ? 'bg-blue-600' : 'bg-red-600'}`}>
                        {resource}: {formatNumber(amount)}
                      </span>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={() => handlePurchaseUnit(unitType)}
                disabled={!canAffordUnit}
                className={`w-full py-2 rounded-lg font-medium transition-colors ${
                  canAffordUnit
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                {canAffordUnit ? 'Create Unit' : 'Insufficient Resources'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UnitProduction;
