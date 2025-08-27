export interface Goal {
  id: string;
  description: string;
  requirements: Record<string, number | undefined>;
  rewards: Record<string, number | undefined>;
}
