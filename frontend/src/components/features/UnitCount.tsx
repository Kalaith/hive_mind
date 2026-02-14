import React from 'react';

interface UnitCountProps {
  id: string;
  icon: string;
  label: string;
  value: number;
  isVisible: boolean;
}

const UnitCount: React.FC<UnitCountProps> = ({ id, icon, label, value, isVisible }) => {
  return (
    <div
      className={`bg-gray-700 p-2 rounded-lg flex flex-col items-center text-center ${isVisible ? '' : 'hidden'}`}
      id={id}
    >
      <span className="text-3xl">{icon}</span>
      <span className="text-sm font-semibold">{label}</span>
      <span className="text-lg font-bold">{value}</span>
    </div>
  );
};

export default UnitCount;
