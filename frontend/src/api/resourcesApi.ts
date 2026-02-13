import type { Resource } from "../types/Resource";
import { mockResources } from "../mockData/resources";

export const fetchResources = async (): Promise<Resource[]> => {
  return Promise.resolve(mockResources);
};
