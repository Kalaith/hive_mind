# Hive Mind - Incremental Game

Welcome to Hive Mind, a web-based incremental game where you take on the role of a burgeoning insectoid hive. Your goal is to expand your swarm, evolve new traits, and dominate your environment.

This project was built with React, TypeScript, and Tailwind CSS, and utilizes Vite for a fast and modern development experience.

## ✨ Features

- **Incremental Gameplay:** Start small and grow your hive exponentially.
- **Resource Management:** Gather resources to produce new units and unlock powerful upgrades.
- **Evolution System:** Evolve unique traits and abilities to enhance your hive's power.
- **Goal-Oriented Progression:** Complete goals to earn rewards and advance to new stages.
- **Responsive Design:** Play on any device, thanks to a mobile-first design built with Tailwind CSS.

## 🚀 Getting Started

Follow these instructions to get a local copy of the project up and running.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) or a compatible package manager

### Installation

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   ```

2. **Navigate to the project directory:**

   ```bash
   cd hive-mind/frontend
   ```

3. **Install the dependencies:**

   ```bash
   npm install
   ```

### Running the Development Server

To start the Vite development server, run the following command:

```bash
npm run dev
```

This will start the application on `http://localhost:5173` by default. You can now open your browser and see the game in action.

## 🛠️ Project Structure

Here's a breakdown of the most important files and directories:

```
/src
├── api/           # Functions for fetching game data
├── components/    # Reusable React components
│   ├── features/  # Core game feature components
│   └── layout/    # Layout components (header, etc.)
├── mockData/      # Mock data for development
├── types/         # TypeScript type definitions
├── App.tsx        # Main application component
├── main.tsx       # Entry point of the application
└── index.css      # Global styles and Tailwind CSS imports
```

- **`/src/api`**: Contains functions for fetching data from mock APIs. In a real-world application, this is where you would make network requests to a backend server.
- **`/src/components`**: This directory is organized into `features` and `layout`. `features` contains the core game components, while `layout` provides the main structure of the application.
- **`/src/mockData`**: To simulate a backend, this project uses mock data for units, evolutions, goals, and resources.
- **`/src/types`**: All TypeScript types are defined here to ensure type safety across the application.

## 💻 Technologies Used

- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vite](https://vitejs.dev/)
- [Framer Motion](https://www.framer.com/motion/) for animations
- [Zustand](https://zustand-demo.pmnd.rs/) for state management (optional, but recommended for larger applications)

## 🎮 Gameplay

The objective of Hive Mind is to grow your hive from a single unit to a massive swarm. You'll start by producing basic units, which will then gather resources for you. These resources can be used to unlock new units, evolve powerful upgrades, and complete goals that will accelerate your progress.

Keep an eye on your resource production, as this is the key to expanding your hive and unlocking new possibilities.

## 🤝 Contributing

Contributions are welcome! If you have any ideas for new features, improvements, or bug fixes, please feel free to open an issue or submit a pull request.

When contributing, please follow the existing code style and conventions. Make sure to run the linter before committing your changes:

```bash
npm run lint
```

---

Happy Hiving! 🐛
