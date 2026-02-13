import React, { useEffect } from "react";
import Header from "./Header";
import HiveVisualization from "../features/HiveVisualization";
import EvolutionPanel from "../features/EvolutionPanel";
import UnitProduction from "../features/UnitProduction";
import GoalsPanel from "../features/GoalsPanel";
import NotificationSystem from "../ui/NotificationSystem";
import { useGameStore } from "../../stores/gameStore";
import { useGameLoop } from "../../hooks/useGameLoop";

const AppLayout: React.FC = () => {
  const { units, startGame, isGameRunning } = useGameStore();
  const { isRunning } = useGameLoop();

  // Auto-start game loop on load
  useEffect(() => {
    if (!isGameRunning) {
      startGame();
    }
  }, [isGameRunning, startGame]);

  // Calculate total units
  const totalUnits = Object.values(units).reduce(
    (sum, count) => sum + count,
    0,
  );

  return (
    <div className="bg-gray-900 text-white min-h-screen font-sans">
      <Header />
      <main className="flex flex-col md:flex-row gap-4 p-4">
        <div className="flex flex-col gap-4 w-full md:w-1/4">
          <HiveVisualization />
          <EvolutionPanel />
        </div>
        <div className="w-full md:w-1/2">
          <UnitProduction />
        </div>
        <div className="flex flex-col gap-4 w-full md:w-1/4">
          <GoalsPanel />
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-xl font-bold mb-2">Settings</h3>
            <div className="settings-controls">
              <div className="mb-2">
                <span className="text-sm">Game Status: </span>
                <span
                  className={`text-sm font-bold ${isRunning ? "text-green-400" : "text-red-400"}`}
                >
                  {isRunning ? "Running" : "Paused"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
      <div className="fixed bottom-0 left-0 right-0 bg-gray-800 p-2 flex justify-between text-sm">
        <div className="flex gap-4">
          <div className="status-item">
            <span className="font-bold">Total Units:</span>
            <span className="ml-2">{totalUnits}</span>
          </div>
          <div className="status-item">
            <span className="font-bold">Game Loop:</span>
            <span
              className={`ml-2 ${isRunning ? "text-green-400" : "text-red-400"}`}
            >
              {isRunning ? "Active" : "Inactive"}
            </span>
          </div>
        </div>
      </div>
      <NotificationSystem />
    </div>
  );
};

export default AppLayout;
