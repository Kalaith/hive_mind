export interface Unit {
  id: string;
  name: string;
  description: string;
  baseCost: {
    biomass: number;
    energy: number;
    knowledge?: number;
    territory?: number;
  };
  production: {
    biomass?: number;
    energy?: number;
    knowledge?: number;
    territory?: number;
  };
  productionRate: string;
  productionTime: number;
  unlockRequirement: string;
  cost: number;
  icon: string;
  isVisible: boolean;
}
