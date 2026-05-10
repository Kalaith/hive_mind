import { useCallback, useEffect, useRef } from 'react';
import { useGameStore } from '../stores/gameStore';
import { useUIStore } from '../stores/uiStore';

interface GameLoopConfig {
  tickInterval: number;
  enabled: boolean;
}

export const useGameLoop = (config: GameLoopConfig = { tickInterval: 1000, enabled: true }) => {
  const intervalRef = useRef<number | null>(null);
  const lastTickRef = useRef<number>(Date.now());
  const isTickingRef = useRef(false);

  const isGameRunning = useGameStore(s => s.isGameRunning);
  const startLoop = useGameStore(s => s.startGame);
  const pauseLoop = useGameStore(s => s.pauseGame);
  const tickGame = useGameStore(s => s.tickGame);
  const gameSpeed = useUIStore(s => s.gameSpeed);

  const gameTick = useCallback(() => {
    if (isTickingRef.current) return;

    const now = Date.now();
    const deltaMs = now - lastTickRef.current;
    lastTickRef.current = now;
    isTickingRef.current = true;

    void tickGame(deltaMs, useUIStore.getState().gameSpeed).finally(() => {
      isTickingRef.current = false;
    });
  }, [tickGame]);

  useEffect(() => {
    if (config.enabled && isGameRunning) {
      lastTickRef.current = Date.now();
      intervalRef.current = window.setInterval(gameTick, config.tickInterval);
    } else if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [config.enabled, config.tickInterval, gameTick, isGameRunning]);

  return {
    isRunning: isGameRunning && config.enabled,
    currentSpeed: gameSpeed,
    startLoop,
    pauseLoop,
  };
};
