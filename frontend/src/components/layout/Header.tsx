import React from "react";
import { useGameStore } from "../../stores/gameStore";
import { useUIStore } from "../../stores/uiStore";

const Header: React.FC = () => {
  const { resources, evolution } = useGameStore();
  const { openSaveMenu, openSettings } = useUIStore();

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return Math.floor(num).toString();
  };

  const resourceConfig = [
    { key: "biomass" as const, name: "Biomass", icon: "🟢" },
    { key: "energy" as const, name: "Energy", icon: "⚡" },
    { key: "knowledge" as const, name: "Knowledge", icon: "🧠" },
    { key: "territory" as const, name: "Territory", icon: "🗺️" },
  ];

  return (
    <header className="bg-gray-800 text-white p-4 shadow-md">
      <div className="flex flex-wrap items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">🐛 Hive Mind</h1>
          <div className="flex items-center gap-2 bg-purple-700 p-2 rounded-lg">
            <span className="text-lg">🧬</span>
            <span className="text-sm font-medium">Evolution</span>
            <span className="text-lg font-bold">
              {formatNumber(evolution.points)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex flex-wrap items-center gap-2 mr-4">
            {resourceConfig.map((resource) => (
              <div
                className="flex items-center gap-1 bg-gray-700 p-2 rounded-lg shadow-sm"
                key={resource.key}
              >
                <span className="text-lg">{resource.icon}</span>
                <span className="text-sm font-medium hidden sm:inline">
                  {resource.name}
                </span>
                <span className="text-lg font-bold">
                  {formatNumber(resources[resource.key])}
                </span>
              </div>
            ))}
          </div>
          <button
            onClick={openSaveMenu}
            className="bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            💾 Save
          </button>
          <button
            onClick={openSettings}
            className="bg-gray-600 hover:bg-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            ⚙️ Settings
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
