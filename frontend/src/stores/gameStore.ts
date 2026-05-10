import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { webhatcheryGameApi, type WebHatcheryGameState } from '../api/webhatcheryGameApi';
import { useWebHatcherySessionStore } from './webhatcherySessionStore';

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
  isLoading: boolean;
  error: string | null;
  initializeBackend: () => Promise<void>;
  createUnit: (unitType: keyof UnitCounts) => Promise<boolean>;
  canAfford: (costs: Partial<Resources>) => boolean;
  unlockBonus: (bonus: keyof EvolutionBonuses) => Promise<boolean>;
  tickGame: (deltaMs: number, speedMultiplier: number) => Promise<void>;
  startGame: () => Promise<void>;
  pauseGame: () => Promise<void>;
  resetGame: () => Promise<void>;
  saveGame: () => Promise<void>;
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

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const applyBackendGame = (set: (state: Partial<GameStore>) => void, game: WebHatcheryGameState): void => {
  const state = game.save.state;
  if (!isRecord(state)) {
    set({ isLoading: false, error: 'Backend returned an invalid game state.' });
    return;
  }

  set({
    resources: isRecord(state.resources) ? (state.resources as unknown as Resources) : initialState.resources,
    units: isRecord(state.units) ? (state.units as unknown as UnitCounts) : initialState.units,
    evolution: isRecord(state.evolution) ? (state.evolution as unknown as Evolution) : initialState.evolution,
    settings: isRecord(state.settings) ? (state.settings as unknown as GameSettings) : initialState.settings,
    production: isRecord(state.production) ? (state.production as unknown as Production) : initialState.production,
    isGameRunning: state.isGameRunning === true,
    isLoading: false,
    error: null,
  });
};

const loadBackendGame = async (): Promise<WebHatcheryGameState> => {
  const session = useWebHatcherySessionStore.getState();
  try {
    return await session.loadGame();
  } catch {
    return await session.continueAsGuest();
  }
};

const runIntent = async (
  set: (state: Partial<GameStore>) => void,
  intent: string,
  payload: Record<string, unknown> = {},
): Promise<WebHatcheryGameState> => {
  set({ isLoading: true, error: null });
  const game = await webhatcheryGameApi.applyIntent(intent, payload);
  applyBackendGame(set, game);
  return game;
};

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      isLoading: false,
      error: null,

      initializeBackend: async () => {
        set({ isLoading: true, error: null });
        try {
          applyBackendGame(set, await loadBackendGame());
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unable to initialize game.';
          set({ isLoading: false, error: message });
        }
      },

      createUnit: async unitType => {
        try {
          await runIntent(set, 'create_unit', { unitType });
          return true;
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unable to create unit.';
          set({ isLoading: false, error: message });
          return false;
        }
      },

      canAfford: costs => {
        const { resources } = get();
        return Object.entries(costs).every(
          ([resource, cost]) => resources[resource as keyof Resources] >= (cost || 0)
        );
      },

      unlockBonus: async bonus => {
        try {
          await runIntent(set, 'unlock_bonus', { bonus });
          return true;
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unable to unlock evolution.';
          set({ isLoading: false, error: message });
          return false;
        }
      },

      tickGame: async (deltaMs, speedMultiplier) => {
        try {
          const game = await webhatcheryGameApi.applyIntent('tick', { deltaMs, speedMultiplier });
          applyBackendGame(set, game);
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unable to update hive.';
          set({ isLoading: false, error: message });
        }
      },

      startGame: async () => {
        try {
          await runIntent(set, 'start_game');
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unable to start game.';
          set({ isLoading: false, error: message });
        }
      },

      pauseGame: async () => {
        try {
          await runIntent(set, 'pause_game');
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unable to pause game.';
          set({ isLoading: false, error: message });
        }
      },

      resetGame: async () => {
        try {
          await runIntent(set, 'reset_game');
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unable to reset game.';
          set({ isLoading: false, error: message });
        }
      },

      saveGame: async () => {
        try {
          await runIntent(set, 'save_game');
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unable to save game.';
          set({ isLoading: false, error: message });
        }
      },

      loadGame: saveData =>
        set(state => ({
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
      partialize: state => ({
        resources: state.resources,
        units: state.units,
        evolution: state.evolution,
        settings: state.settings,
        production: state.production,
      }),
    }
  )
);
