/**
 * Goal Bridge - Converts between flat legacy goals and hierarchical goal system
 * Handles goal synchronization, decomposition, and priority management
 */
/**
 * Goal bridge class
 */
export class GoalBridge {
    dataAdapter;
    options;
    // Goal mapping for synchronization
    legacyToNewMap = new Map();
    newToLegacyMap = new Map();
    constructor(dataAdapter, options = {}) {
        this.dataAdapter = dataAdapter;
        this.options = {
            preservePriorities: true,
            autoDecompose: true,
            estimateResources: true,
            createDependencies: false,
            ...options
        };
    }
    /**
     * Convert legacy goals to hierarchical goals
     */
    convertLegacyGoals(legacyGoals) {
        const hierarchicalGoals = [];
        legacyGoals.forEach((legacyGoal, index) => {
            const goal = this.convertSingleLegacyGoal(legacyGoal, index);
            hierarchicalGoals.push(goal);
            // Store mapping for synchronization
            this.legacyToNewMap.set(legacyGoal.name, goal.id);
            this.newToLegacyMap.set(goal.id, legacyGoal.name);
        });
        return hierarchicalGoals;
    }
    /**
     * Convert hierarchical goals back to legacy format
     */
    convertToLegacyGoals(hierarchicalGoals) {
        const legacyGoals = [];
        // Get operational goals (these map to legacy goals)
        const operationalGoals = hierarchicalGoals.filter(g => g.type === 'operational');
        operationalGoals.forEach(goal => {
            const legacyName = this.newToLegacyMap.get(goal.id);
            if (legacyName) {
                const quantity = this.extractQuantityFromGoal(goal);
                legacyGoals.push({
                    name: legacyName,
                    quantity
                });
            }
            else {
                // Create new legacy goal from hierarchical goal
                const legacyGoal = this.extractLegacyGoalFromHierarchical(goal);
                if (legacyGoal) {
                    legacyGoals.push(legacyGoal);
                }
            }
        });
        return legacyGoals;
    }
    /**
     * Synchronize goals between legacy and new systems
     */
    synchronizeGoals(legacyData, goalState) {
        try {
            // Convert legacy goals to new format
            const legacyGoals = legacyData.goals || [];
            const convertedGoals = this.convertLegacyGoals(legacyGoals);
            // Update goal state with converted goals
            goalState.operationalGoals = this.mergeGoals(goalState.operationalGoals, convertedGoals);
            // Handle current goal
            if (legacyData.curr_goal) {
                const currentGoal = this.convertSingleLegacyGoal(legacyData.curr_goal, -1);
                currentGoal.status = 'active';
                // Update existing active goals or add new one
                const existingIndex = goalState.operationalGoals.findIndex(g => g.status === 'active');
                if (existingIndex >= 0) {
                    goalState.operationalGoals[existingIndex] = currentGoal;
                }
                else {
                    goalState.operationalGoals.push(currentGoal);
                }
            }
            // Update active goals list
            goalState.activeGoals = goalState.operationalGoals.filter(g => g.status === 'active');
        }
        catch (error) {
            console.error('Goal synchronization failed:', error);
        }
    }
    /**
     * Decompose a complex goal into simpler operational goals
     */
    decomposeGoal(goal) {
        if (!this.options.autoDecompose) {
            return [goal];
        }
        const subGoals = [];
        // Decompose based on goal type and description
        if (goal.description.includes('build')) {
            subGoals.push(...this.decomposeBuildGoal(goal));
        }
        else if (goal.description.includes('craft')) {
            subGoals.push(...this.decomposeCraftGoal(goal));
        }
        else if (goal.description.includes('collect')) {
            subGoals.push(...this.decomposeCollectGoal(goal));
        }
        else {
            // Default: return original goal
            subGoals.push(goal);
        }
        return subGoals;
    }
    /**
     * Update legacy data from hierarchical goals
     */
    updateLegacyData(goalState, legacyData) {
        try {
            // Convert operational goals back to legacy format
            const operationalGoals = goalState.operationalGoals.filter(g => g.status !== 'completed');
            const legacyGoals = this.convertToLegacyGoals(operationalGoals);
            // Update legacy data
            legacyData.goals = legacyGoals;
            // Update current goal
            const activeGoals = operationalGoals.filter(g => g.status === 'active');
            if (activeGoals.length > 0) {
                const activeGoal = activeGoals[0];
                const legacyName = this.newToLegacyMap.get(activeGoal.id);
                if (legacyName) {
                    legacyData.curr_goal = {
                        name: legacyName,
                        quantity: this.extractQuantityFromGoal(activeGoal)
                    };
                }
            }
            else {
                legacyData.curr_goal = null;
            }
        }
        catch (error) {
            console.error('Failed to update legacy data:', error);
        }
    }
    /**
     * Get goal mapping information
     */
    getGoalMappings() {
        return {
            legacyToNew: Object.fromEntries(this.legacyToNewMap),
            newToLegacy: Object.fromEntries(this.newToLegacyMap)
        };
    }
    /**
     * Clear goal mappings
     */
    clearMappings() {
        this.legacyToNewMap.clear();
        this.newToLegacyMap.clear();
    }
    /**
     * Convert a single legacy goal to hierarchical format
     */
    convertSingleLegacyGoal(legacyGoal, index) {
        const goalId = index === -1 ? 'legacy_current_goal' : `legacy_goal_${index}`;
        const goal = {
            id: goalId,
            type: 'operational',
            description: `Obtain ${legacyGoal.quantity}x ${legacyGoal.name}`,
            priority: this.options.preservePriorities ? (100 - index) : 50,
            dependencies: [],
            resources: this.options.estimateResources ? this.estimateResources(legacyGoal) : {
                items: { [legacyGoal.name]: legacyGoal.quantity },
                tools: []
            },
            progress: {
                percentage: 0,
                completedSteps: [],
                blockers: []
            },
            status: 'pending',
            createdAt: Date.now()
        };
        // Add strategic context if it's a construction goal
        if (this.isConstructionGoal(legacyGoal.name)) {
            goal.type = 'tactical';
            goal.description = `Build ${legacyGoal.name}`;
        }
        return goal;
    }
    /**
     * Estimate resource requirements for a legacy goal
     */
    estimateResources(legacyGoal) {
        const resources = {
            items: { [legacyGoal.name]: legacyGoal.quantity },
            tools: this.inferRequiredTools(legacyGoal.name)
        };
        // Add location requirement for construction goals
        if (this.isConstructionGoal(legacyGoal.name)) {
            resources.location = { x: 0, y: 0, z: 0, radius: 50 };
        }
        return resources;
    }
    /**
     * Infer required tools for a goal
     */
    inferRequiredTools(itemName) {
        const toolMap = {
            'wood': ['axe'],
            'stone': ['pickaxe'],
            'iron': ['pickaxe'],
            'gold': ['pickaxe'],
            'diamond': ['pickaxe'],
            'coal': ['pickaxe'],
            'cobblestone': ['pickaxe'],
            'dirt': ['shovel'],
            'sand': ['shovel'],
            'gravel': ['shovel']
        };
        for (const [material, tools] of Object.entries(toolMap)) {
            if (itemName.includes(material)) {
                return tools;
            }
        }
        return [];
    }
    /**
     * Check if a goal is a construction goal
     */
    isConstructionGoal(goalName) {
        const constructionKeywords = ['house', 'shelter', 'building', 'structure', 'tower', 'wall'];
        return constructionKeywords.some(keyword => goalName.toLowerCase().includes(keyword));
    }
    /**
     * Merge goals, preserving existing ones and adding new ones
     */
    mergeGoals(existingGoals, newGoals) {
        const mergedGoals = [...existingGoals];
        newGoals.forEach(newGoal => {
            const existingIndex = mergedGoals.findIndex(g => g.id === newGoal.id);
            if (existingIndex >= 0) {
                // Update existing goal
                mergedGoals[existingIndex] = { ...mergedGoals[existingIndex], ...newGoal };
            }
            else {
                // Add new goal
                mergedGoals.push(newGoal);
            }
        });
        return mergedGoals;
    }
    /**
     * Extract quantity from hierarchical goal
     */
    extractQuantityFromGoal(goal) {
        if (goal.resources.items && Object.keys(goal.resources.items).length > 0) {
            return Object.values(goal.resources.items)[0];
        }
        return 1;
    }
    /**
     * Extract legacy goal from hierarchical goal
     */
    extractLegacyGoalFromHierarchical(goal) {
        // Try to extract item name and quantity from description
        const match = goal.description.match(/(\w+)\s*x?(\d+)?/);
        if (match) {
            const name = match[1];
            const quantity = match[2] ? parseInt(match[2]) : 1;
            return { name, quantity };
        }
        return null;
    }
    /**
     * Decompose build goals into sub-goals
     */
    decomposeBuildGoal(goal) {
        const subGoals = [];
        // Add resource collection goals
        if (goal.resources.items) {
            for (const [itemName, quantity] of Object.entries(goal.resources.items)) {
                const resourceGoal = {
                    id: `${goal.id}_collect_${itemName}`,
                    type: 'operational',
                    description: `Collect ${quantity}x ${itemName}`,
                    priority: goal.priority - 10,
                    dependencies: [],
                    resources: {
                        items: { [itemName]: quantity },
                        tools: this.inferRequiredTools(itemName)
                    },
                    progress: {
                        percentage: 0,
                        completedSteps: [],
                        blockers: []
                    },
                    status: 'pending',
                    createdAt: Date.now()
                };
                subGoals.push(resourceGoal);
            }
        }
        // Add the actual construction goal
        const constructionGoal = {
            ...goal,
            id: `${goal.id}_build`,
            description: `Build structure from ${goal.description}`,
            dependencies: subGoals.map(g => g.id),
            resources: {
                ...goal.resources,
                tools: [...(goal.resources.tools || []), 'crafting_table']
            }
        };
        subGoals.push(constructionGoal);
        return subGoals;
    }
    /**
     * Decompose craft goals into sub-goals
     */
    decomposeCraftGoal(goal) {
        const subGoals = [];
        // Add resource collection goals for crafting materials
        if (goal.resources.items) {
            for (const [itemName, quantity] of Object.entries(goal.resources.items)) {
                if (!this.isTool(itemName)) {
                    const resourceGoal = {
                        id: `${goal.id}_collect_${itemName}`,
                        type: 'operational',
                        description: `Collect ${quantity}x ${itemName}`,
                        priority: goal.priority - 10,
                        dependencies: [],
                        resources: {
                            items: { [itemName]: quantity },
                            tools: this.inferRequiredTools(itemName)
                        },
                        progress: {
                            percentage: 0,
                            completedSteps: [],
                            blockers: []
                        },
                        status: 'pending',
                        createdAt: Date.now()
                    };
                    subGoals.push(resourceGoal);
                }
            }
        }
        // Add the actual crafting goal
        const craftingGoal = {
            ...goal,
            id: `${goal.id}_craft`,
            dependencies: subGoals.map(g => g.id),
            resources: {
                ...goal.resources,
                tools: [...(goal.resources.tools || []), 'crafting_table']
            }
        };
        subGoals.push(craftingGoal);
        return subGoals;
    }
    /**
     * Decompose collect goals into sub-goals
     */
    decomposeCollectGoal(goal) {
        // For simple collection goals, no decomposition needed
        return [goal];
    }
    /**
     * Check if an item is a tool
     */
    isTool(itemName) {
        const toolKeywords = ['pickaxe', 'axe', 'shovel', 'hoe', 'sword'];
        return toolKeywords.some(keyword => itemName.includes(keyword));
    }
}
/**
 * Goal bridge factory
 */
export class GoalBridgeFactory {
    /**
     * Create goal bridge with default options
     */
    static create(dataAdapter) {
        return new GoalBridge(dataAdapter);
    }
    /**
     * Create goal bridge for development
     */
    static createForDevelopment(dataAdapter) {
        return new GoalBridge(dataAdapter, {
            preservePriorities: true,
            autoDecompose: true,
            estimateResources: true,
            createDependencies: true
        });
    }
    /**
     * Create goal bridge for production
     */
    static createForProduction(dataAdapter) {
        return new GoalBridge(dataAdapter, {
            preservePriorities: true,
            autoDecompose: false,
            estimateResources: false,
            createDependencies: false
        });
    }
}
/**
 * Goal utilities
 */
export class GoalUtils {
    /**
     * Check if a goal is achievable with current resources
     */
    static isAchievable(goal, availableResources) {
        // Check if required items are available
        if (goal.resources.items) {
            for (const [itemName, quantity] of Object.entries(goal.resources.items)) {
                if (!availableResources[itemName] || availableResources[itemName] < quantity) {
                    return false;
                }
            }
        }
        // Check if required tools are available
        if (goal.resources.tools) {
            for (const tool of goal.resources.tools) {
                if (!availableResources[tool]) {
                    return false;
                }
            }
        }
        return true;
    }
    /**
     * Calculate goal priority based on multiple factors
     */
    static calculatePriority(goal, context) {
        let priority = goal.priority;
        // Adjust based on resource availability
        if (this.isAchievable(goal, context.resources)) {
            priority += 20; // Boost achievable goals
        }
        // Adjust based on deadline
        if (goal.deadline) {
            const timeUntilDeadline = goal.deadline - Date.now();
            if (timeUntilDeadline < 60000) { // Less than 1 minute
                priority += 50; // Urgent
            }
            else if (timeUntilDeadline < 300000) { // Less than 5 minutes
                priority += 25; // High priority
            }
        }
        return priority;
    }
    /**
     * Sort goals by priority
     */
    static sortGoals(goals, context) {
        return goals.sort((a, b) => {
            const priorityA = context ? this.calculatePriority(a, context) : a.priority;
            const priorityB = context ? this.calculatePriority(b, context) : b.priority;
            return priorityB - priorityA; // Highest priority first
        });
    }
}
//# sourceMappingURL=goal_bridge.js.map