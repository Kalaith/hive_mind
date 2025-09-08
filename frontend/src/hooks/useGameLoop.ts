import { useEffect, useRef } from 'react';
import { useGameStore } from '../stores/gameStore';
import { useUIStore } from '../stores/uiStore';

interface GameLoopConfig {
  tickInterval: number; // milliseconds between ticks
  enabled: boolean;
}

interface UnitProduction {
  biomass?: number;
  energy?: number;
  knowledge?: number;
  territory?: number;
}

const UNIT_PRODUCTION_RATES: Record<string, UnitProduction> = {
  workers: { biomass: 2, energy: 1 },
  scouts: { territory: 1, knowledge: 0.5 },
  soldiers: { territory: 0.5 },
  specialists: { knowledge: 2, energy: -1 },
};

export const useGameLoop = (config: GameLoopConfig = { tickInterval: 1000, enabled: true }) => {
  const intervalRef = useRef<number | null>(null);
  const lastTickRef = useRef<number>(Date.now());
  
  const gameStore = useGameStore();
  const { gameSpeed } = useUIStore();
  
  const gameTick = () => {
    const now = Date.now();
    const deltaTime = now - lastTickRef.current;
    lastTickRef.current = now;
    
    // Calculate resource production from units
    const { units, evolution } = gameStore;
    const speedMultiplier = gameSpeed;
    const timeMultiplier = deltaTime / 1000; // Convert to seconds
    
    // Calculate production bonuses from evolution
    const productionBonus = evolution.bonuses.enhancedMetabolism ? 1.25 : 1;
    const knowledgeBonus = evolution.bonuses.knowledgeSynthesis ? 1.5 : 1;
    const territoryBonus = evolution.bonuses.territorialDominance ? 1.3 : 1;
    
    // Calculate total production for each resource
    let totalBiomass = 0;
    let totalEnergy = 0;
    let totalKnowledge = 0;
    let totalTerritory = 0;
    
    Object.entries(units).forEach(([unitType, count]) => {
      const production = UNIT_PRODUCTION_RATES[unitType];
      if (!production || count === 0) return;
      
      if (production.biomass) {
        totalBiomass += production.biomass * count * productionBonus;
      }
      if (production.energy) {
        totalEnergy += production.energy * count * productionBonus;
      }
      if (production.knowledge) {
        totalKnowledge += production.knowledge * count * knowledgeBonus;
      }
      if (production.territory) {
        totalTerritory += production.territory * count * territoryBonus;
      }
    });
    
    // Apply production over time with speed multiplier
    if (totalBiomass !== 0) {
      gameStore.addResource('biomass', totalBiomass * timeMultiplier * speedMultiplier);
    }
    if (totalEnergy !== 0) {
      gameStore.addResource('energy', totalEnergy * timeMultiplier * speedMultiplier);
    }
    if (totalKnowledge !== 0) {
      gameStore.addResource('knowledge', totalKnowledge * timeMultiplier * speedMultiplier);
    }
    if (totalTerritory !== 0) {
      gameStore.addResource('territory', totalTerritory * timeMultiplier * speedMultiplier);
    }
    
    // Generate evolution points based on total hive activity
    const totalUnits = Object.values(units).reduce((sum, count) => sum + count, 0);
    if (totalUnits > 0) {
      const evolutionRate = Math.log(totalUnits + 1) * 0.1; // Logarithmic scaling
      gameStore.addEvolutionPoints(evolutionRate * timeMultiplier * speedMultiplier);
    }
    
    // Update total playtime
    gameStore.settings.totalPlaytime += deltaTime;
  };
  
  useEffect(() => {
    if (config.enabled && gameStore.isGameRunning) {
      intervalRef.current = setInterval(gameTick, config.tickInterval);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [config.enabled, config.tickInterval, gameStore.isGameRunning, gameSpeed]);
  
  // Handle offline progress calculation
  useEffect(() => {
    const handleOfflineProgress = () => {
      const now = Date.now();
      const lastSaved = gameStore.settings.lastSaved;
      const offlineTime = now - lastSaved;
      
      // Only calculate offline progress if offline for more than 5 minutes
      const MIN_OFFLINE_TIME = 5 * 60 * 1000; // 5 minutes
      const MAX_OFFLINE_TIME = 24 * 60 * 60 * 1000; // 24 hours max
      
      if (offlineTime > MIN_OFFLINE_TIME) {
        const clampedOfflineTime = Math.min(offlineTime, MAX_OFFLINE_TIME);
        const offlineHours = clampedOfflineTime / (1000 * 60 * 60);
        
        // Calculate offline production (reduced rate)
        const offlineMultiplier = 0.5; // 50% of normal production when offline
        const { units } = gameStore;
        
        let offlineBiomass = 0;
        let offlineEnergy = 0;
        let offlineKnowledge = 0;
        let offlineTerritory = 0;
        
        Object.entries(units).forEach(([unitType, count]) => {
          const production = UNIT_PRODUCTION_RATES[unitType];
          if (!production || count === 0) return;
          
          const hourlyProduction = count * 3600; // per hour
          
          if (production.biomass) {
            offlineBiomass += production.biomass * hourlyProduction * offlineHours * offlineMultiplier;
          }
          if (production.energy) {
            offlineEnergy += production.energy * hourlyProduction * offlineHours * offlineMultiplier;
          }
          if (production.knowledge) {
            offlineKnowledge += production.knowledge * hourlyProduction * offlineHours * offlineMultiplier;
          }
          if (production.territory) {
            offlineTerritory += production.territory * hourlyProduction * offlineHours * offlineMultiplier;
          }
        });
        
        // Apply offline gains
        if (offlineBiomass > 0) gameStore.addResource('biomass', offlineBiomass);
        if (offlineEnergy > 0) gameStore.addResource('energy', offlineEnergy);
        if (offlineKnowledge > 0) gameStore.addResource('knowledge', offlineKnowledge);
        if (offlineTerritory > 0) gameStore.addResource('territory', offlineTerritory);
        
        // Show offline progress notification
        const uiStore = useUIStore.getState();
        uiStore.addNotification({
          type: 'success',
          title: 'Welcome Back!',
          message: `You were away for ${Math.round(offlineHours)}h and gained resources!`,
          duration: 8000,
        });
      }
      
      // Update last saved time
      gameStore.saveGame();
    };
    
    // Check for offline progress on mount
    handleOfflineProgress();
  }, []);
  
  return {
    isRunning: gameStore.isGameRunning && config.enabled,
    currentSpeed: gameSpeed,
    startLoop: gameStore.startGame,
    pauseLoop: gameStore.pauseGame,
  };
};