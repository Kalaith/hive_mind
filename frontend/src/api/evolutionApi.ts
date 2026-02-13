import { mockEvolution } from "../mockData/evolution";
import type { Evolution } from "../types/Evolution";

export const fetchEvolution = async (): Promise<Evolution[]> => {
  return Promise.resolve(mockEvolution);
};
