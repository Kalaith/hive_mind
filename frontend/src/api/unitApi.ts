import { mockUnits } from '../mockData/units';
import type { Unit } from '../types/Unit';

export const fetchUnits = async (): Promise<Unit[]> => {
  return Promise.resolve(mockUnits);
};

export const fetchUnitById = async (id: string): Promise<Unit | undefined> => {
  const unit = mockUnits.find((unit) => unit.id === id);
  return Promise.resolve(unit);
};
