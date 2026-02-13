import React, { useState } from "react";
import type { Unit } from "../../types/Unit";

interface UnitCardProps {
  unit: Unit;
}

const UnitCard: React.FC<UnitCardProps> = ({ unit }) => {
  const [progress, setProgress] = useState(0);

  const handleProduce = () => {
    if (progress === 0) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev + 10;
          if (newProgress >= 100) {
            clearInterval(interval);
            return 100;
          }
          return newProgress;
        });
      }, 1000);
    }
  };

  return (
    <div
      className="bg-gray-700 p-4 rounded-lg shadow-md border border-gray-600 flex flex-col"
      id={unit.id}
      key={unit.id}
    >
      <h3 className="text-lg font-semibold">{unit.name}</h3>
      <p className="text-sm text-gray-400 mt-1 flex-grow">{unit.description}</p>
      <div className="text-sm mt-2">
        <span>Cost: {unit.cost} Biomass</span>
      </div>
      <div className="text-sm">
        <span>Production Rate: {unit.productionRate}</span>
      </div>
      <button
        className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors mt-4"
        id={`produce-${unit.id}`}
        onClick={handleProduce}
      >
        Produce {unit.name}
      </button>
      <div className="mt-2">
        <span className="text-sm">Progress: {progress}%</span>
        <div className="h-2 bg-gray-600 rounded mt-1">
          <div
            className="h-2 bg-blue-500 rounded"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default UnitCard;
