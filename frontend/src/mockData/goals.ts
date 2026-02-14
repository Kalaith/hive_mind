export const mockGoals = [
  {
    id: 'first_worker',
    description: 'Produce your first worker',
    requirements: { workers: 1 },
    rewards: { biomass: 20 },
  },
  {
    id: 'five_workers',
    description: 'Build a workforce of 5 workers',
    requirements: { workers: 5 },
    rewards: { energy: 50 },
  },
  {
    id: 'unlock_scout',
    description: 'Gather enough knowledge to unlock scouts',
    requirements: { knowledge: 10 },
    rewards: { biomass: 100 },
  },
  {
    id: 'first_territory',
    description: 'Claim your first territory',
    requirements: { territory: 1 },
    rewards: { knowledge: 25 },
  },
  {
    id: 'small_hive',
    description: 'Grow your hive to 15 total units',
    requirements: { total_units: 15 },
    rewards: { evolution_points: 1 },
  },
  {
    id: 'knowledge_seeker',
    description: 'Accumulate 100 knowledge',
    requirements: { knowledge: 100 },
    rewards: { biomass: 500 },
  },
  {
    id: 'territorial_expansion',
    description: 'Control 10 territories',
    requirements: { territory: 10 },
    rewards: { evolution_points: 2 },
  },
  {
    id: 'ready_to_cocoon',
    description: 'Reach 50 total units to enable cocooning',
    requirements: { total_units: 50 },
    rewards: { evolution_points: 5 },
  },
];
