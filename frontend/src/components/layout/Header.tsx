import React, { useEffect, useState } from 'react';
import { fetchResources } from '../../api/resourcesApi';
import type { Resource } from '../../types/Resource';

const Header: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([]);

  useEffect(() => {
    const loadResources = async () => {
      const fetchedResources = await fetchResources();
      setResources(fetchedResources);
    };

    loadResources();
  }, []);

  return (
    <header className="bg-gray-800 text-white p-4 shadow-md">
      <div className="flex flex-wrap items-center justify-between">
        <h1 className="text-2xl font-bold">🐛 Hive Mind</h1>
        <div className="flex flex-wrap items-center gap-4 mt-4 sm:mt-0">
          {resources.map((resource) => (
            <div
              className="flex items-center gap-2 bg-gray-700 p-2 rounded-lg shadow-sm"
              key={resource.id}
            >
              <span className="text-xl">{resource.icon}</span>
              <span className="text-sm font-medium">{resource.name}</span>
              <span className="text-lg font-bold" id={`${resource.id}-value`}>
                {resource.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </header>
  );
};

export default Header;
