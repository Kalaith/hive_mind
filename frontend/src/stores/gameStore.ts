import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Resources {
  biomass: number;
  energy: number;
  knowledge: number;
  territory: number;
}

export interface UnitCounts {
  workers: number;
  scouts: number;
  soldiers: number;
  specialists: number;
}

export interface EvolutionBonuses {
  enhancedMetabolism: boolean;
  rapidGrowth: boolean;
  knowledgeSynthesis: boolean;
  territorialDominance: boolean;
  hiveUnity: boolean;
}

export interface Evolution {
  points: number;
  bonuses: EvolutionBonuses;
}

export interface GameSettings {
  gameSpeed: number;
  lastSaved: number;
  totalPlaytime: number;
}

export interface Production {
  workers: number[];
  scouts: number[];
  soldiers: number[];
  specialists: number[];
}

export interface GameState {
  resources: Resources;
  units: UnitCounts;
  evolution: Evolution;
  settings: GameSettings;
  production: Production;
  isGameRunning: boolean;
}

interface GameStore extends GameState {
  // Resource actions
  addResource: (resource: keyof Resources, amount: number) => void;
  spendResources: (costs: Partial<Resources>) => boolean;
  canAfford: (costs: Partial<Resources>) => boolean;
  
  // Unit actions
  addUnit: (unitType: keyof UnitCounts, amount: number) => void;
  
  // Evolution actions
  addEvolutionPoints: (points: number) => void;
  unlockBonus: (bonus: keyof EvolutionBonuses) => void;

  // Settings actions
  addPlaytime: (deltaMs: number) => void;
  
  // Game control
  startGame: () => void;
  pauseGame: () => void;
  resetGame: () => void;
  
  // Save system
  saveGame: () => void;
  loadGame: (saveData: Partial<GameState>) => void;
}

const initialState: GameState = {
  resources: {
    biomass: 50,
    energy: 25,
    knowledge: 0,
    territory: 0,
  },
  units: {
    workers: 0,
    scouts: 0,
    soldiers: 0,
    specialists: 0,
  },
  evolution: {
    points: 0,
    bonuses: {
      enhancedMetabolism: false,
      rapidGrowth: false,
      knowledgeSynthesis: false,
      territorialDominance: false,
      hiveUnity: false,
    },
  },
  settings: {
    gameSpeed: 1,
    lastSaved: Date.now(),
    totalPlaytime: 0,
  },
  production: {
    workers: [],
    scouts: [],
    soldiers: [],
    specialists: [],
  },
  isGameRunning: false,
};

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      // Resource actions
      addResource: (resource, amount) =>
        set((state) => ({
          resources: {
            ...state.resources,
            [resource]: Math.max(0, state.resources[resource] + amount),
          },
        })),
      
      spendResources: (costs) => {
        const state = get();
        if (!state.canAfford(costs)) return false;
        
        set((state) => ({
          resources: Object.entries(costs).reduce(
            (resources, [resource, cost]) => ({
              ...resources,
              [resource]: resources[resource as keyof Resources] - (cost || 0),
            }),
            state.resources
          ),
        }));
        return true;
      },
      
      canAfford: (costs) => {
        const { resources } = get();
        return Object.entries(costs).every(
          ([resource, cost]) =>
            resources[resource as keyof Resources] >= (cost || 0)
        );
      },
      
      // Unit actions
      addUnit: (unitType, amount) =>
        set((state) => ({
          units: {
            ...state.units,
            [unitType]: Math.max(0, state.units[unitType] + amount),
          },
        })),
      
      // Evolution actions
      addEvolutionPoints: (points) =>
        set((state) => ({
          evolution: {
            ...state.evolution,
            points: state.evolution.points + points,
          },
        })),
      
      unlockBonus: (bonus) =>
        set((state) => ({
          evolution: {
            ...state.evolution,
            bonuses: {
              ...state.evolution.bonuses,
              [bonus]: true,
            },
          },
        })),

      addPlaytime: (deltaMs) =>
        set((state) => ({
          settings: {
            ...state.settings,
            totalPlaytime: state.settings.totalPlaytime + deltaMs,
          },
        })),
      
      // Game control
      startGame: () => set({ isGameRunning: true }),
      pauseGame: () => set({ isGameRunning: false }),
      resetGame: () => set({ ...initialState, isGameRunning: false }),
      
      // Save system
      saveGame: () =>
        set((state) => ({
          settings: {
            ...state.settings,
            lastSaved: Date.now(),
          },
        })),
      
      loadGame: (saveData) =>
        set((state) => ({
          ...state,
          ...saveData,
          settings: {
            ...state.settings,
            ...saveData.settings,
          },
        })),
    }),
    {
      name: 'hive-mind-game-state',
      partialize: (state) => ({
        resources: state.resources,
        units: state.units,
        evolution: state.evolution,
        settings: state.settings,
        production: state.production,
      }),
    }
  )
);
