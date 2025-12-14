/**
 * Goal Bridge - Converts between flat legacy goals and hierarchical goal system
 * Handles goal synchronization, decomposition, and priority management
 */
/**
 * Utility function to convert numeric priority to string literal
 */
function mapPriority(priority) {
    if (priority >= 80)
        return 'critical';
    if (priority >= 60)
        return 'high';
    if (priority >= 40)
        return 'medium';
    return 'low';
}
/**
 * Utility function to convert dictionary to ResourceRequirement array
 */
function convertToResourceRequirements(items) {
    return Object.entries(items).map(([name, amount]) => ({
        type: name,
        amount,
        priority: 1
    }));
}
/**
 * Utility function to convert string array to ResourceRequirement array
 */
function convertToolsToRequirements(tools) {
    return tools.map(tool => ({
        type: tool,
        amount: 1,
        priority: 1
    }));
}
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
                if (activeGoal) {
                    const legacyName = this.newToLegacyMap.get(activeGoal.id);
                    if (legacyName) {
                        legacyData.curr_goal = {
                            name: legacyName,
                            quantity: this.extractQuantityFromGoal(activeGoal)
                        };
                    }
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
        const numericPriority = this.options.preservePriorities ? (100 - index) : 50;
        const goal = {
            id: goalId,
            type: 'operational',
            description: `Obtain ${legacyGoal.quantity}x ${legacyGoal.name}`,
            priority: mapPriority(numericPriority),
            status: 'pending',
            createdAt: Date.now(),
            updatedAt: Date.now(),
            dependencies: [],
            resources: this.options.estimateResources ? this.estimateResources(legacyGoal) : {
                required: convertToResourceRequirements({ [legacyGoal.name]: legacyGoal.quantity }),
                allocated: [],
                items: convertToResourceRequirements({ [legacyGoal.name]: legacyGoal.quantity }),
                tools: []
            },
            progress: {
                current: 0,
                target: legacyGoal.quantity,
                percentage: 0,
                completedSteps: 0
            }
        };
        // Add strategic context if it's a construction goal
        if (this.isConstructionGoal(legacyGoal.name)) {
            goal.type = 'tactical';
            goal.description = `Build ${legacyGoal.name}`;
        }
        return goal;
    }
    /**
     * Extract quantity from a hierarchical goal
     */
    extractQuantityFromGoal(goal) {
        if (goal.progress && goal.progress.target) {
            return goal.progress.target;
        }
        // Extract from description as fallback
        const match = goal.description.match(/(\d+)x?\s+(\w+)/);
        if (match && match[1]) {
            return parseInt(match[1], 10);
        }
        return 1; // Default quantity
    }
    /**
     * Extract legacy goal from hierarchical goal
     */
    extractLegacyGoalFromHierarchical(goal) {
        if (!goal || !goal.description) {
            return null;
        }
        // Extract item name and quantity from description
        const match = goal.description.match(/(?:Obtain|Build|Craft|Collect)\s+(\d+)x?\s+(\w+)/);
        if (match && match[1] && match[2]) {
            return {
                name: match[2],
                quantity: parseInt(match[1], 10)
            };
        }
        // Fallback: extract item name without quantity
        const nameMatch = goal.description.match(/(?:Obtain|Build|Craft|Collect)\s+(\w+)/);
        if (nameMatch && nameMatch[1]) {
            return {
                name: nameMatch[1],
                quantity: 1
            };
        }
        return null;
    }
    /**
     * Decompose build goals into sub-goals
     */
    decomposeBuildGoal(goal) {
        const subGoals = [];
        // Extract target structure from description
        const structureMatch = goal.description.match(/Build\s+(.+)/);
        if (!structureMatch) {
            return [goal];
        }
        const structureName = structureMatch[1];
        // Create sub-goals for common building materials
        const commonMaterials = [
            { name: 'wood', quantity: 64 },
            { name: 'stone', quantity: 64 },
            { name: 'cobblestone', quantity: 64 }
        ];
        commonMaterials.forEach((material, index) => {
            const subGoal = {
                id: `${goal.id}_material_${index}`,
                type: 'operational',
                description: `Collect ${material.quantity}x ${material.name} for ${structureName}`,
                priority: goal.priority,
                status: 'pending',
                createdAt: Date.now(),
                updatedAt: Date.now(),
                dependencies: [],
                resources: {
                    required: convertToResourceRequirements({ [material.name]: material.quantity }),
                    allocated: [],
                    items: convertToResourceRequirements({ [material.name]: material.quantity }),
                    tools: convertToolsToRequirements(this.inferRequiredTools(material.name))
                },
                progress: {
                    current: 0,
                    target: material.quantity,
                    percentage: 0,
                    completedSteps: 0
                }
            };
            subGoals.push(subGoal);
        });
        // Add the final building goal
        const buildGoal = {
            ...goal,
            id: `${goal.id}_build`,
            type: 'operational',
            dependencies: subGoals.map(sg => sg.id),
            resources: {
                required: [],
                allocated: [],
                items: [],
                tools: convertToolsToRequirements(['crafting_table'])
            }
        };
        subGoals.push(buildGoal);
        return subGoals;
    }
    /**
     * Decompose craft goals into sub-goals
     */
    decomposeCraftGoal(goal) {
        const subGoals = [];
        // Extract target item from description
        const itemMatch = goal.description.match(/Craft\s+(.+)/);
        if (!itemMatch) {
            return [goal];
        }
        const itemName = itemMatch[1];
        // Create sub-goals for crafting materials (simplified)
        const craftingMaterials = [
            { name: 'wood', quantity: 4 },
            { name: 'stone', quantity: 8 }
        ];
        craftingMaterials.forEach((material, index) => {
            const subGoal = {
                id: `${goal.id}_material_${index}`,
                type: 'operational',
                description: `Collect ${material.quantity}x ${material.name} for crafting ${itemName}`,
                priority: goal.priority,
                status: 'pending',
                createdAt: Date.now(),
                updatedAt: Date.now(),
                dependencies: [],
                resources: {
                    required: convertToResourceRequirements({ [material.name]: material.quantity }),
                    allocated: [],
                    items: convertToResourceRequirements({ [material.name]: material.quantity }),
                    tools: convertToolsToRequirements(this.inferRequiredTools(material.name))
                },
                progress: {
                    current: 0,
                    target: material.quantity,
                    percentage: 0,
                    completedSteps: 0
                }
            };
            subGoals.push(subGoal);
        });
        // Add the final crafting goal
        const craftGoal = {
            ...goal,
            id: `${goal.id}_craft`,
            type: 'operational',
            dependencies: subGoals.map(sg => sg.id),
            resources: {
                required: [],
                allocated: [],
                items: [],
                tools: convertToolsToRequirements(['crafting_table'])
            }
        };
        subGoals.push(craftGoal);
        return subGoals;
    }
    /**
     * Decompose collect goals into sub-goals
     */
    decomposeCollectGoal(goal) {
        // For collect goals, we typically don't need further decomposition
        // Just return the original goal
        return [goal];
    }
    /**
     * Estimate resource requirements for a legacy goal
     */
    estimateResources(legacyGoal) {
        const resources = {
            required: convertToResourceRequirements({ [legacyGoal.name]: legacyGoal.quantity }),
            allocated: [],
            items: convertToResourceRequirements({ [legacyGoal.name]: legacyGoal.quantity }),
            tools: convertToolsToRequirements(this.inferRequiredTools(legacyGoal.name))
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
}
//# sourceMappingURL=goal_bridge.js.map