import React, { useState, useEffect } from 'react';
import { fetchUnits } from '../../api/unitApi';
import type { Unit } from '../../types/Unit';
import UnitCard from './UnitCard';

const UnitProduction: React.FC = () => {
  const [units, setUnits] = useState<Unit[]>([]);

  useEffect(() => {
    const loadUnits = async () => {
      const fetchedUnits = await fetchUnits();
      setUnits(fetchedUnits);
    };

    loadUnits();
  }, []);

  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <h2 className="text-xl font-bold mb-4">Unit Production</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {units.map((unit) => (
          <UnitCard key={unit.id} unit={unit} />
        ))}
      </div>
    </div>
  );
};

export default UnitProduction;
