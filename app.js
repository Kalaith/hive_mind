// Hive Mind - Idle Colony Game
class HiveMindGame {
    constructor() {
        this.gameState = {
            resources: {
                biomass: 50,
                energy: 25,
                knowledge: 0,
                territory: 0
            },
            units: {
                workers: 0,
                scouts: 0,
                soldiers: 0,
                specialists: 0
            },
            evolution: {
                points: 0,
                bonuses: {
                    enhancedMetabolism: false,
                    rapidGrowth: false,
                    knowledgeSynthesis: false,
                    territorialDominance: false,
                    hiveUnity: false
                }
            },
            goals: [],
            settings: {
                gameSpeed: 1,
                lastSaved: Date.now(),
                totalPlaytime: 0
            },
            production: {
                workers: [],
                scouts: [],
                soldiers: [],
                specialists: []
            }
        };

        this.gameData = {
            units: {
                worker: {
                    name: "Worker",
                    description: "Gathers biomass and energy for the hive",
                    baseCost: {biomass: 10, energy: 5},
                    production: {biomass: 2, energy: 1},
                    productionTime: 3000,
                    unlockRequirement: "start"
                },
                scout: {
                    name: "Scout", 
                    description: "Explores territory and generates knowledge",
                    baseCost: {biomass: 25, energy: 15, knowledge: 5},
                    production: {knowledge: 3, territory: 0.5},
                    productionTime: 5000,
                    unlockRequirement: "knowledge_10"
                },
                soldier: {
                    name: "Soldier",
                    description: "Conquers territory and defends the hive", 
                    baseCost: {biomass: 50, energy: 30, knowledge: 10},
                    production: {territory: 2},
                    productionTime: 8000,
                    unlockRequirement: "territory_5"
                },
                specialist: {
                    name: "Specialist",
                    description: "Advanced unit with unique capabilities",
                    baseCost: {biomass: 100, energy: 75, knowledge: 25, territory: 5},
                    production: {biomass: 5, energy: 3, knowledge: 2, territory: 1},
                    productionTime: 12000,
                    unlockRequirement: "evolution_1"
                }
            },
            goals: [
                {id: "first_worker", description: "Produce your first worker", requirements: {workers: 1}, rewards: {biomass: 20}},
                {id: "five_workers", description: "Build a workforce of 5 workers", requirements: {workers: 5}, rewards: {energy: 50}},
                {id: "unlock_scout", description: "Gather enough knowledge to unlock scouts", requirements: {knowledge: 10}, rewards: {biomass: 100}},
                {id: "first_territory", description: "Claim your first territory", requirements: {territory: 1}, rewards: {knowledge: 25}},
                {id: "small_hive", description: "Grow your hive to 15 total units", requirements: {total_units: 15}, rewards: {evolution_points: 1}},
                {id: "knowledge_seeker", description: "Accumulate 100 knowledge", requirements: {knowledge: 100}, rewards: {biomass: 500}},
                {id: "territorial_expansion", description: "Control 10 territories", requirements: {territory: 10}, rewards: {evolution_points: 2}},
                {id: "ready_to_cocoon", description: "Reach 50 total units to enable cocooning", requirements: {total_units: 50}, rewards: {evolution_points: 5}}
            ],
            evolutionBonuses: [
                {level: 1, name: "Enhanced Metabolism", description: "Workers produce 25% more resources", cost: 3},
                {level: 2, name: "Rapid Growth", description: "All units produce 50% faster", cost: 5},
                {level: 3, name: "Knowledge Synthesis", description: "Scouts generate 100% more knowledge", cost: 8},
                {level: 4, name: "Territorial Dominance", description: "Soldiers conquer territory 200% faster", cost: 12},
                {level: 5, name: "Hive Unity", description: "All units cost 25% less to produce", cost: 20}
            ]
        };

        this.lastTick = Date.now();
        this.gameLoop = null;
        this.init();
    }

    init() {
        this.loadGame();
        this.setupEventListeners();
        this.initializeGoals();
        this.updateUI();
        this.startGameLoop();
        this.handleOfflineProgress();
    }

    setupEventListeners() {
        // Unit production buttons
        document.getElementById('produce-worker').addEventListener('click', () => this.produceUnit('worker'));
        document.getElementById('produce-scout').addEventListener('click', () => this.produceUnit('scout'));
        document.getElementById('produce-soldier').addEventListener('click', () => this.produceUnit('soldier'));
        document.getElementById('produce-specialist').addEventListener('click', () => this.produceUnit('specialist'));

        // Cocoon button
        document.getElementById('cocoon-btn').addEventListener('click', () => this.enterCocoon());

        // Settings
        document.getElementById('game-speed').addEventListener('change', (e) => {
            this.gameState.settings.gameSpeed = parseFloat(e.target.value);
        });

        document.getElementById('save-game').addEventListener('click', () => this.saveGame());
        document.getElementById('load-game').addEventListener('click', () => this.loadGame());
        document.getElementById('reset-game').addEventListener('click', () => this.resetGame());

        // Handle page visibility for offline progress
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.gameState.settings.lastSaved = Date.now();
                this.saveGame();
            } else {
                this.handleOfflineProgress();
            }
        });
    }

    initializeGoals() {
        this.gameState.goals = this.gameData.goals.map(goal => ({
            ...goal,
            completed: false
        }));
    }

    produceUnit(unitType) {
        const unitData = this.gameData.units[unitType];
        if (!unitData) return;

        // Check if unit is unlocked
        if (!this.isUnitUnlocked(unitType)) return;

        // Check if we can afford the unit
        if (!this.canAfford(unitData.baseCost)) return;

        // Check if already producing
        if (this.gameState.production[unitType + 's'].length > 0) return;

        // Deduct resources
        this.deductResources(unitData.baseCost);

        // Start production
        const productionTime = unitData.productionTime / this.gameState.settings.gameSpeed;
        if (this.gameState.evolution.bonuses.rapidGrowth) {
            productionTime *= 0.5;
        }

        this.gameState.production[unitType + 's'].push({
            startTime: Date.now(),
            duration: productionTime
        });

        this.showNotification(`Started producing ${unitData.name}`, 'info');
        this.updateUI();
    }

    isUnitUnlocked(unitType) {
        const requirement = this.gameData.units[unitType].unlockRequirement;
        
        if (requirement === 'start') return true;
        
        if (requirement === 'knowledge_10') {
            return this.gameState.resources.knowledge >= 10;
        }
        
        if (requirement === 'territory_5') {
            return this.gameState.resources.territory >= 5;
        }
        
        if (requirement === 'evolution_1') {
            return this.gameState.evolution.points >= 1;
        }
        
        return false;
    }

    canAfford(cost) {
        for (const [resource, amount] of Object.entries(cost)) {
            if (this.gameState.resources[resource] < amount) {
                return false;
            }
        }
        return true;
    }

    deductResources(cost) {
        for (const [resource, amount] of Object.entries(cost)) {
            this.gameState.resources[resource] -= amount;
        }
    }

    getUnitCost(unitType) {
        const baseCost = this.gameData.units[unitType].baseCost;
        const unitCount = this.gameState.units[unitType + 's'];
        const multiplier = Math.pow(1.15, unitCount);
        
        const cost = {};
        for (const [resource, amount] of Object.entries(baseCost)) {
            cost[resource] = Math.ceil(amount * multiplier);
            if (this.gameState.evolution.bonuses.hiveUnity) {
                cost[resource] = Math.ceil(cost[resource] * 0.75);
            }
        }
        return cost;
    }

    startGameLoop() {
        this.gameLoop = setInterval(() => {
            this.tick();
        }, 100);
    }

    tick() {
        const now = Date.now();
        const deltaTime = (now - this.lastTick) * this.gameState.settings.gameSpeed;
        this.lastTick = now;

        // Update resource production
        this.updateResourceProduction(deltaTime);

        // Update unit production
        this.updateUnitProduction(now);

        // Check goals
        this.checkGoals();

        // Update UI
        this.updateUI();

        // Auto-save every 30 seconds
        if (now % 30000 < 100) {
            this.saveGame();
        }
    }

    updateResourceProduction(deltaTime) {
        const productionRates = {
            biomass: 0,
            energy: 0,
            knowledge: 0,
            territory: 0
        };

        // Calculate production from units
        for (const [unitType, count] of Object.entries(this.gameState.units)) {
            const unitData = this.gameData.units[unitType.slice(0, -1)];
            if (unitData && unitData.production) {
                for (const [resource, rate] of Object.entries(unitData.production)) {
                    let productionRate = rate * count;
                    
                    // Apply evolution bonuses
                    if (unitType === 'workers' && this.gameState.evolution.bonuses.enhancedMetabolism) {
                        productionRate *= 1.25;
                    }
                    if (unitType === 'scouts' && this.gameState.evolution.bonuses.knowledgeSynthesis) {
                        productionRate *= 2;
                    }
                    if (unitType === 'soldiers' && this.gameState.evolution.bonuses.territorialDominance) {
                        productionRate *= 3;
                    }
                    
                    productionRates[resource] += productionRate;
                }
            }
        }

        // Apply production over time
        for (const [resource, rate] of Object.entries(productionRates)) {
            const productionTime = this.gameData.units.worker.productionTime; // Use worker time as base
            this.gameState.resources[resource] += (rate * deltaTime) / productionTime;
        }

        // Ensure resources don't go negative
        for (const resource of Object.keys(this.gameState.resources)) {
            this.gameState.resources[resource] = Math.max(0, this.gameState.resources[resource]);
        }
    }

    updateUnitProduction(now) {
        for (const [unitType, productions] of Object.entries(this.gameState.production)) {
            for (let i = productions.length - 1; i >= 0; i--) {
                const production = productions[i];
                const elapsed = now - production.startTime;
                
                if (elapsed >= production.duration) {
                    // Production complete
                    const unitName = unitType.slice(0, -1);
                    this.gameState.units[unitType]++;
                    productions.splice(i, 1);
                    
                    this.showNotification(`${this.gameData.units[unitName].name} produced!`, 'success');
                }
            }
        }
    }

    checkGoals() {
        for (const goal of this.gameState.goals) {
            if (goal.completed) continue;

            let completed = true;
            for (const [requirement, target] of Object.entries(goal.requirements)) {
                let current = 0;
                
                if (requirement === 'total_units') {
                    current = Object.values(this.gameState.units).reduce((sum, count) => sum + count, 0);
                } else if (this.gameState.units[requirement] !== undefined) {
                    current = this.gameState.units[requirement];
                } else if (this.gameState.resources[requirement] !== undefined) {
                    current = this.gameState.resources[requirement];
                }
                
                if (current < target) {
                    completed = false;
                    break;
                }
            }

            if (completed) {
                goal.completed = true;
                this.applyGoalRewards(goal.rewards);
                this.showNotification(`Goal completed: ${goal.description}`, 'success');
            }
        }
    }

    applyGoalRewards(rewards) {
        for (const [reward, amount] of Object.entries(rewards)) {
            if (reward === 'evolution_points') {
                this.gameState.evolution.points += amount;
            } else if (this.gameState.resources[reward] !== undefined) {
                this.gameState.resources[reward] += amount;
            }
        }
    }

    enterCocoon() {
        const totalUnits = Object.values(this.gameState.units).reduce((sum, count) => sum + count, 0);
        if (totalUnits < 50) {
            this.showNotification('Need at least 50 units to enter cocoon', 'warning');
            return;
        }

        const evolutionPoints = Math.floor(totalUnits / 10) + 
                              Math.floor(this.gameState.resources.biomass / 1000) +
                              Math.floor(this.gameState.resources.energy / 500) +
                              Math.floor(this.gameState.resources.knowledge / 100) +
                              Math.floor(this.gameState.resources.territory / 50);

        // Reset progress
        this.gameState.resources = {biomass: 50, energy: 25, knowledge: 0, territory: 0};
        this.gameState.units = {workers: 0, scouts: 0, soldiers: 0, specialists: 0};
        this.gameState.production = {workers: [], scouts: [], soldiers: [], specialists: []};
        this.gameState.evolution.points += evolutionPoints;
        this.initializeGoals();

        this.showNotification(`Entered cocoon! Gained ${evolutionPoints} evolution points`, 'success');
        this.updateUI();
    }

    purchaseEvolutionBonus(bonusKey) {
        const bonus = this.gameData.evolutionBonuses.find(b => 
            b.name.toLowerCase().replace(/\s+/g, '') === bonusKey.toLowerCase()
        );
        
        if (!bonus || this.gameState.evolution.bonuses[bonusKey]) return;
        
        if (this.gameState.evolution.points >= bonus.cost) {
            this.gameState.evolution.points -= bonus.cost;
            this.gameState.evolution.bonuses[bonusKey] = true;
            this.showNotification(`Purchased ${bonus.name}!`, 'success');
            this.updateUI();
        }
    }

    updateUI() {
        // Update resources
        document.getElementById('biomass-value').textContent = Math.floor(this.gameState.resources.biomass);
        document.getElementById('energy-value').textContent = Math.floor(this.gameState.resources.energy);
        document.getElementById('knowledge-value').textContent = Math.floor(this.gameState.resources.knowledge);
        document.getElementById('territory-value').textContent = Math.floor(this.gameState.resources.territory);

        // Update unit counts
        document.getElementById('workers-count').querySelector('.unit-value').textContent = this.gameState.units.workers;
        document.getElementById('scouts-count').querySelector('.unit-value').textContent = this.gameState.units.scouts;
        document.getElementById('soldiers-count').querySelector('.unit-value').textContent = this.gameState.units.soldiers;
        document.getElementById('specialists-count').querySelector('.unit-value').textContent = this.gameState.units.specialists;

        // Update unit visibility
        this.updateUnitVisibility();

        // Update production buttons and costs
        this.updateProductionButtons();

        // Update production progress
        this.updateProductionProgress();

        // Update goals
        this.updateGoals();

        // Update evolution
        this.updateEvolution();

        // Update game status
        this.updateGameStatus();
    }

    updateUnitVisibility() {
        document.getElementById('scouts-count').style.display = this.isUnitUnlocked('scout') ? 'flex' : 'none';
        document.getElementById('soldiers-count').style.display = this.isUnitUnlocked('soldier') ? 'flex' : 'none';
        document.getElementById('specialists-count').style.display = this.isUnitUnlocked('specialist') ? 'flex' : 'none';

        document.getElementById('scout-card').style.display = this.isUnitUnlocked('scout') ? 'block' : 'none';
        document.getElementById('soldier-card').style.display = this.isUnitUnlocked('soldier') ? 'block' : 'none';
        document.getElementById('specialist-card').style.display = this.isUnitUnlocked('specialist') ? 'block' : 'none';
    }

    updateProductionButtons() {
        for (const unitType of ['worker', 'scout', 'soldier', 'specialist']) {
            const cost = this.getUnitCost(unitType);
            const button = document.getElementById(`produce-${unitType}`);
            const canAfford = this.canAfford(cost);
            const isProducing = this.gameState.production[unitType + 's'].length > 0;

            button.disabled = !canAfford || isProducing;
            
            if (isProducing) {
                button.textContent = 'Producing...';
            } else {
                button.textContent = `Produce ${this.gameData.units[unitType].name}`;
            }

            // Update cost display
            for (const [resource, amount] of Object.entries(cost)) {
                const costElement = document.getElementById(`${unitType}-${resource}-cost`);
                if (costElement) {
                    costElement.textContent = amount;
                }
            }
        }
    }

    updateProductionProgress() {
        const now = Date.now();
        
        for (const [unitType, productions] of Object.entries(this.gameState.production)) {
            const unitName = unitType.slice(0, -1);
            const progressElement = document.getElementById(`${unitName}-progress`);
            const fillElement = document.getElementById(`${unitName}-progress-fill`);
            const textElement = document.getElementById(`${unitName}-progress-text`);
            
            if (productions.length > 0) {
                const production = productions[0];
                const elapsed = now - production.startTime;
                const progress = Math.min(100, (elapsed / production.duration) * 100);
                
                progressElement.style.display = 'block';
                fillElement.style.width = `${progress}%`;
                textElement.textContent = `${Math.floor(progress)}%`;
            } else {
                progressElement.style.display = 'none';
            }
        }
    }

    updateGoals() {
        const goalsList = document.getElementById('goals-list');
        goalsList.innerHTML = '';

        for (const goal of this.gameState.goals.slice(0, 5)) {
            const goalElement = document.createElement('div');
            goalElement.className = `goal-item ${goal.completed ? 'completed' : ''}`;
            
            let progress = 0;
            let current = 0;
            let target = 0;
            
            for (const [requirement, targetValue] of Object.entries(goal.requirements)) {
                if (requirement === 'total_units') {
                    current = Object.values(this.gameState.units).reduce((sum, count) => sum + count, 0);
                } else if (this.gameState.units[requirement] !== undefined) {
                    current = this.gameState.units[requirement];
                } else if (this.gameState.resources[requirement] !== undefined) {
                    current = this.gameState.resources[requirement];
                }
                target = targetValue;
                progress = Math.min(100, (current / target) * 100);
                break;
            }

            const rewardText = Object.entries(goal.rewards)
                .map(([reward, amount]) => `${reward.replace('_', ' ')}: +${amount}`)
                .join(', ');

            goalElement.innerHTML = `
                <div class="goal-description">${goal.description}</div>
                <div class="goal-reward">Reward: ${rewardText}</div>
                <div class="goal-progress">
                    <div class="goal-progress-bar">
                        <div class="goal-progress-fill" style="width: ${progress}%"></div>
                    </div>
                    <div class="goal-progress-text">${Math.floor(current)}/${target}</div>
                </div>
            `;
            
            goalsList.appendChild(goalElement);
        }
    }

    updateEvolution() {
        document.getElementById('evolution-points').textContent = this.gameState.evolution.points;
        
        const bonusesContainer = document.getElementById('evolution-bonuses');
        bonusesContainer.innerHTML = '';
        
        for (const bonus of this.gameData.evolutionBonuses) {
            const bonusKey = bonus.name.toLowerCase().replace(/\s+/g, '');
            const isOwned = this.gameState.evolution.bonuses[bonusKey];
            
            const bonusElement = document.createElement('div');
            bonusElement.className = `evolution-bonus ${isOwned ? 'owned' : ''}`;
            bonusElement.innerHTML = `
                <div class="evolution-bonus-info">
                    <div class="evolution-bonus-name">${bonus.name}</div>
                    <div class="evolution-bonus-desc">${bonus.description}</div>
                </div>
                <div class="evolution-bonus-cost">${isOwned ? 'Owned' : bonus.cost}</div>
            `;
            
            if (!isOwned) {
                bonusElement.style.cursor = 'pointer';
                bonusElement.addEventListener('click', () => this.purchaseEvolutionBonus(bonusKey));
            }
            
            bonusesContainer.appendChild(bonusElement);
        }

        // Update cocoon button
        const totalUnits = Object.values(this.gameState.units).reduce((sum, count) => sum + count, 0);
        const cocoonBtn = document.getElementById('cocoon-btn');
        cocoonBtn.disabled = totalUnits < 50;
        cocoonBtn.textContent = totalUnits >= 50 ? 'Enter Cocoon' : `Enter Cocoon (${totalUnits}/50 units)`;
    }

    updateGameStatus() {
        const totalUnits = Object.values(this.gameState.units).reduce((sum, count) => sum + count, 0);
        document.getElementById('total-units').textContent = totalUnits;
        
        const offlineTime = Math.floor((Date.now() - this.gameState.settings.lastSaved) / 1000);
        document.getElementById('offline-time').textContent = this.formatTime(offlineTime);
    }

    formatTime(seconds) {
        if (seconds < 60) return `${seconds}s`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${hours}h ${minutes}m`;
    }

    handleOfflineProgress() {
        const offlineTime = Date.now() - this.gameState.settings.lastSaved;
        if (offlineTime > 5000) { // Only if offline for more than 5 seconds
            this.updateResourceProduction(offlineTime);
            this.showNotification(`Welcome back! You were offline for ${this.formatTime(Math.floor(offlineTime / 1000))}`, 'info');
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.getElementById('notifications').appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    saveGame() {
        try {
            localStorage.setItem('hiveMindGame', JSON.stringify(this.gameState));
            this.showNotification('Game saved!', 'success');
        } catch (error) {
            this.showNotification('Failed to save game', 'warning');
        }
    }

    loadGame() {
        try {
            const saved = localStorage.getItem('hiveMindGame');
            if (saved) {
                const loadedState = JSON.parse(saved);
                this.gameState = { ...this.gameState, ...loadedState };
                this.showNotification('Game loaded!', 'success');
                this.updateUI();
            }
        } catch (error) {
            this.showNotification('Failed to load game', 'warning');
        }
    }

    resetGame() {
        if (confirm('Are you sure you want to reset all progress?')) {
            localStorage.removeItem('hiveMindGame');
            location.reload();
        }
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new HiveMindGame();
});