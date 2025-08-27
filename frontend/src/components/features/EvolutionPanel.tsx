import React, { useEffect, useState } from 'react';
import { fetchEvolution } from '../../api/evolutionApi';
import type { Evolution } from '../../types/Evolution';

const EvolutionPanel: React.FC = () => {
  const [evolutions, setEvolutions] = useState<string[]>([]);

  useEffect(() => {
    const loadEvolutions = async () => {
      const evolutionData: Evolution[] = await fetchEvolution();
      setEvolutions(evolutionData.map((evolution) => evolution.name));
    };

    loadEvolutions();
  }, []);

  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <h3 className="text-xl font-bold mb-2">Evolution</h3>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">🧬</span>
        <span className="font-semibold">
          Points: <span className="text-blue-400">0</span>
        </span>
      </div>
      <div className="flex flex-wrap gap-2" id="evolutions">
        {evolutions.map((evolution, index) => (
          <div
            key={index}
            className="bg-gray-700 p-2 rounded-lg shadow-md border border-gray-600"
          >
            {evolution}
          </div>
        ))}
      </div>
      <button
        className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors mt-4 disabled:bg-gray-600 disabled:cursor-not-allowed"
        id="cocoon-btn"
        disabled
      >
        Enter Cocoon (Requires 50 units)
      </button>
    </div>
  );
};

export default EvolutionPanel;
