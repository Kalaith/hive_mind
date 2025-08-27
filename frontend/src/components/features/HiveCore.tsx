import React from 'react';

const HiveCore: React.FC = () => {
  return (
    <div
      className="relative w-24 h-24 sm:w-32 sm:h-32 mx-auto bg-gray-700 rounded-full flex items-center justify-center shadow-lg"
      id="hive-core"
    >
      <div className="absolute w-full h-full bg-blue-400 rounded-full animate-ping opacity-75"></div>
      <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-blue-500 rounded-full flex items-center justify-center">
        <span className="text-3xl sm:text-4xl">🕷️</span>
      </div>
    </div>
  );
};

export default HiveCore;
