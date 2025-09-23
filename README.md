# Hive Mind

A collective intelligence simulation game where players manage a distributed network of interconnected entities, featuring emergent behavior and swarm intelligence mechanics.

## Game Features

- **Collective Intelligence**: Manage a network of interconnected entities
- **Emergent Behavior**: Watch complex patterns emerge from simple rules
- **Swarm Mechanics**: Coordinate collective actions and decision-making
- **Network Visualization**: Interactive visual representation of the hive network
- **Resource Management**: Allocate resources across the collective

## Technology Stack

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS 4
- **State Management**: Zustand 5
- **Charts**: Chart.js for network analytics
- **Animations**: Framer Motion
- **Routing**: React Router DOM
- **Utilities**: React Use hooks library

## Development

```bash
# Navigate to frontend directory
cd frontend

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm run test

# Type checking
npm run type-check

# Run full CI pipeline
npm run ci
```

## Deployment

```powershell
# Deploy to preview environment
.\publish.ps1

# Deploy to production
.\publish.ps1 -Production
```

## Game Mechanics

- **Node Management**: Individual entity control within the collective
- **Information Flow**: Manage communication between network nodes
- **Collective Decision Making**: Democratic or hierarchical decision processes
- **Adaptation**: Network learns and evolves based on environmental pressures
- **Scalability**: Handle networks from small groups to massive collectives

## Project Structure

```
hive_mind/
├── frontend/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Game pages and screens
│   │   ├── stores/        # Zustand state management
│   │   ├── types/         # TypeScript definitions
│   │   └── utils/         # Utility functions
│   └── dist/              # Build output
└── README.md              # This file
```

Explore the fascinating world of collective intelligence and emergent behavior in this unique simulation experience.

Part of the WebHatchery game collection.