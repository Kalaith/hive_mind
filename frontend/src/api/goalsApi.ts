import { mockGoals } from '../mockData/goals';

export const fetchGoals = async () => {
  return Promise.resolve(mockGoals);
};
