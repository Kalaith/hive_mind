import React, { useEffect, useState } from 'react';
import { fetchGoals } from '../../api/goalsApi';
import type { Goal } from '../../types/Goal';

const GoalsPanel: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>([]);

  useEffect(() => {
    const loadGoals = async () => {
      const goalsData = await fetchGoals();
      setGoals(goalsData);
    };

    loadGoals();
  }, []);

  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <h2 className="text-xl font-bold mb-4">Goals</h2>
      <div className="space-y-4">
        {goals.map((goal) => (
          <div
            key={goal.id}
            className="bg-gray-700 p-4 rounded-lg shadow-md border border-gray-600"
          >
            <h3 className="text-lg font-semibold mb-2">{goal.description}</h3>
            <div>
              <h4 className="font-bold text-sm text-gray-400">Requirements:</h4>
              <ul className="list-disc list-inside text-sm">
                {Object.entries(goal.requirements).map(([key, value]) => (
                  <li key={key}>
                    {key}: {value}
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-2">
              <h4 className="font-bold text-sm text-gray-400">Rewards:</h4>
              <ul className="list-disc list-inside text-sm">
                {Object.entries(goal.rewards).map(([key, value]) => (
                  <li key={key}>
                    {key}: {value}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GoalsPanel;
