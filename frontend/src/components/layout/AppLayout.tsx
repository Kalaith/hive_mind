import React from 'react';
import Header from './Header';
import HiveVisualization from '../features/HiveVisualization';
import EvolutionPanel from '../features/EvolutionPanel';
import UnitProduction from '../features/UnitProduction';
import GoalsPanel from '../features/GoalsPanel';

const AppLayout: React.FC = () => {
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
              {/* Settings controls content */}
            </div>
          </div>
        </div>
      </main>
      <div
        className="fixed bottom-0 left-0 right-0 bg-gray-800 p-2 flex justify-between text-sm"
        id="game-status"
      >
        <div className="flex gap-4">
          <div className="status-item">
            <span className="font-bold">Total Units:</span>
            <span className="ml-2" id="total-units">
              0
            </span>
          </div>
          <div className="status-item">
            <span className="font-bold">Offline for:</span>
            <span className="ml-2" id="offline-time">
              0s
            </span>
          </div>
        </div>
      </div>
      <div className="fixed bottom-10 right-4" id="notifications">
        {/* Notifications content */}
      </div>
    </div>
  );
};

export default AppLayout;
