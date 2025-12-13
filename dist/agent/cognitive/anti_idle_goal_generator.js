/**
 * Anti-Idle Goal Generation System
 *
 * Proactive goal generation mechanisms to ensure agents always have meaningful tasks
 * Integrates with existing goal system and personality-driven behavior
 */
import { GoalLevel, GoalPriority, GoalStatus } from './goal_types.js';
/**
 * Main anti-idle goal generator
 */
export class AntiIdleGoalGenerator {
    purposeCore;
    skillsSystem;
    memorySystem;
    config;
    lastGenerationTime = 0;
    activeAntiIdleGoals = new Set();
    constructor(purposeCore, skillsSystem, memorySystem, config) {
        this.purposeCore = purposeCore;
        this.skillsSystem = skillsSystem;
        this.memorySystem = memorySystem;
        this.config = {
            enabled: true,
            maxAntiIdleGoals: 5,
            goalPriority: GoalPriority.MEDIUM,
            goalTypes: [GoalLevel.OPERATIONAL, GoalLevel.TACTICAL],
            refreshInterval: 60000, // 1 minute
            minActivityThreshold: 0.1,
            personalityInfluence: 0.7,
            opportunityDetection: true,
            ...config
        };
    }
    /**
     * Generate anti-idle goals based on current agent state
     */
    async generateAntiIdleGoals(agentState) {
        if (!this.config.enabled) {
            return [];
        }
        const now = Date.now();
        // Check if enough time has passed since last generation
        if (now - this.lastGenerationTime < this.config.refreshInterval) {
            return [];
        }
        this.lastGenerationTime = now;
        const goals = [];
        const personality = this.extractPersonality(agentState);
        const context = agentState.context;
        try {
            // Generate maintenance goals
            goals.push(...this.generateMaintenanceGoals(personality, context));
            // Generate exploration goals
            goals.push(...this.generateExplorationGoals(personality, context, agentState));
            // Generate social goals
            goals.push(...this.generateSocialGoals(personality, context, agentState));
            // Generate skill development goals
            goals.push(...this.generateSkillDevelopmentGoals(personality, agentState));
            // Generate resource management goals
            goals.push(...this.generateResourceManagementGoals(personality, context));
            // Generate opportunity-based goals
            if (this.config.opportunityDetection) {
                const opportunities = await this.detectEnvironmentalOpportunities(context);
                goals.push(...this.generateOpportunityGoals(opportunities, personality));
            }
            // Filter and prioritize goals
            const filteredGoals = this.filterAndPrioritizeGoals(goals, personality, agentState);
            // Clean up old anti-idle goals
            this.cleanupOldAntiIdleGoals(agentState);
            console.log(`[ANTI_IDLE_GOAL_GENERATOR] Generated ${filteredGoals.length} anti-idle goals`);
            return filteredGoals;
        }
        catch (error) {
            console.error('[ANTI_IDLE_GOAL_GENERATOR] Error generating anti-idle goals:', error);
            return [];
        }
    }
    /**
     * Generate maintenance goals (health, food, equipment repair)
     */
    generateMaintenanceGoals(personality, context) {
        const goals = [];
        // Health maintenance goal
        if (context.health < 15) {
            goals.push(this.createGoalRequest('health_restoration', 'Restore health to safe levels', GoalLevel.OPERATIONAL, 'Find food or healing methods to restore health', ['health_above_15'], GoalPriority.HIGH, 'survival'));
        }
        // Food maintenance goal
        if (context.food < 15) {
            goals.push(this.createGoalRequest('food_acquisition', 'Acquire food to maintain energy', GoalLevel.OPERATIONAL, 'Find and gather food sources', ['food_above_15'], GoalPriority.HIGH, 'survival'));
        }
        // Equipment repair goal
        const damagedEquipment = this.identifyDamagedEquipment(context);
        if (damagedEquipment.length > 0) {
            goals.push(this.createGoalRequest('equipment_repair', `Repair damaged equipment: ${damagedEquipment.join(', ')}`, GoalLevel.TACTICAL, 'Gather resources and repair damaged items', ['equipment_repaired'], GoalPriority.MEDIUM, 'maintenance'));
        }
        return goals;
    }
    /**
     * Generate exploration goals based on personality
     */
    generateExplorationGoals(personality, context, agentState) {
        const goals = [];
        // Personality-driven exploration
        if (personality.openness > 0.7) {
            goals.push(this.createGoalRequest('exploration', 'Explore new areas and discover resources', GoalLevel.TACTICAL, 'Systematically explore unvisited regions', ['areas_explored'], GoalPriority.MEDIUM, 'exploration'));
        }
        // Memory-based exploration
        const unexploredAreas = []; // Explicit type annotation
        if (unexploredAreas.length > 0) {
            goals.push(this.createGoalRequest('area_discovery', `Explore ${unexploredAreas.length} unexplored regions`, GoalLevel.TACTICAL, 'Visit and map unexplored areas', unexploredAreas.map(area => `explored_${area}`), GoalPriority.LOW, 'exploration'));
        }
        return goals;
    }
    /**
     * Generate social goals based on personality and context
     */
    generateSocialGoals(personality, context, agentState) {
        const goals = [];
        const nearbyAgents = context.nearbyEntities?.filter((e) => e.type === 'player' || e.type === 'agent') || [];
        if (nearbyAgents.length > 0 && personality.extraversion > 0.6) {
            goals.push(this.createGoalRequest('social_interaction', 'Engage with nearby agents or players', GoalLevel.OPERATIONAL, 'Initiate conversation or collaboration', ['social_interaction_completed'], GoalPriority.MEDIUM, 'social'));
        }
        // Group participation goals
        if (agentState.cognitive?.social?.socialContext?.groupDynamics?.cohesion > 0.6) {
            goals.push(this.createGoalRequest('group_participation', 'Participate in group activities', GoalLevel.TACTICAL, 'Join and contribute to group efforts', ['group_activity_participated'], GoalPriority.MEDIUM, 'social'));
        }
        return goals;
    }
    /**
     * Generate skill development goals
     */
    generateSkillDevelopmentGoals(personality, agentState) {
        const goals = [];
        const skills = this.skillsSystem.getAllSkills?.() || [];
        const underdevelopedSkills = skills.filter((skill) => skill.proficiency.overall < 0.5 &&
            (personality.openness > 0.6));
        underdevelopedSkills.forEach((skill) => {
            goals.push(this.createGoalRequest(`skill_development_${skill.type}`, `Practice ${skill.type} to improve proficiency`, GoalLevel.TACTICAL, `Engage in activities that improve ${skill.type} skills`, [`skill_${skill.type}_improved`], GoalPriority.LOW, 'skill_development'));
        });
        return goals;
    }
    /**
     * Generate resource management goals
     */
    generateResourceManagementGoals(personality, context) {
        const goals = [];
        const neededResources = this.analyzeResourceNeeds(context);
        neededResources.forEach((resource) => {
            goals.push(this.createGoalRequest(`resource_collection_${resource.type}`, `Collect ${resource.amount} ${resource.type}`, GoalLevel.OPERATIONAL, resource.reason, [`resource_${resource.type}_collected`], this.mapPriorityFromNumber(resource.priority), 'resource_management'));
        });
        return goals;
    }
    /**
     * Detect environmental opportunities
     */
    async detectEnvironmentalOpportunities(context) {
        const opportunities = [];
        // Resource opportunities
        const nearbyBlocks = context.nearbyBlocks || [];
        const valuableBlocks = nearbyBlocks.filter((block) => this.isValuableResource(block.type));
        valuableBlocks.forEach((block) => {
            opportunities.push({
                id: `resource_${block.position.x}_${block.position.y}_${block.position.z}`,
                type: 'resource',
                priority: this.calculateResourcePriority(block.type),
                description: `Collect ${block.type} at ${block.position}`,
                location: block.position,
                requirements: this.getResourceRequirements(block.type),
                estimatedValue: this.calculateResourceValue(block.type),
                timeWindow: 30000 // 30 seconds
            });
        });
        return opportunities;
    }
    /**
     * Generate opportunity-based goals
     */
    generateOpportunityGoals(opportunities, personality) {
        const goals = [];
        opportunities.forEach((opportunity) => {
            if (opportunity.priority <= 2) { // High or medium priority
                goals.push(this.createGoalRequest(`opportunity_${opportunity.id}`, opportunity.description, GoalLevel.OPERATIONAL, opportunity.description, [`opportunity_${opportunity.id}_completed`], this.mapPriorityFromNumber(opportunity.priority), 'opportunity'));
            }
        });
        return goals;
    }
    /**
     * Filter and prioritize goals based on personality and current state
     */
    filterAndPrioritizeGoals(goals, personality, agentState) {
        return goals
            .filter(goal => this.isGoalSuitable(goal, personality, agentState))
            .sort((a, b) => this.compareGoalPriority(a, b, personality))
            .slice(0, this.config.maxAntiIdleGoals);
    }
    /**
     * Check if goal is suitable for current personality and state
     */
    isGoalSuitable(goal, personality, agentState) {
        // Check personality alignment
        const alignment = this.calculatePersonalityAlignment(goal, personality);
        if (alignment < this.config.personalityInfluence) {
            return false;
        }
        // Check if already have similar active goals
        const activeGoals = agentState.cognitive?.goals?.activeGoals || [];
        const hasSimilarGoal = activeGoals.some((activeGoal) => activeGoal.description?.toLowerCase().includes(goal.description.toLowerCase()));
        return !hasSimilarGoal;
    }
    /**
     * Calculate personality alignment for a goal
     */
    calculatePersonalityAlignment(goal, personality) {
        let alignment = 0.5; // Base alignment
        // Category-based personality alignment
        switch (goal.category) {
            case 'exploration':
                alignment += (personality.openness + personality.explorationDrive) * 0.3;
                break;
            case 'social':
                alignment += personality.extraversion * 0.4;
                break;
            case 'building':
                alignment += (personality.conscientiousness + personality.buildingCreativity) * 0.3;
                break;
            case 'combat':
                alignment += personality.riskTolerance * 0.3;
                break;
            case 'crafting':
                alignment += personality.conscientiousness * 0.3;
                break;
            case 'resource_gathering':
                alignment += personality.conscientiousness * 0.3;
                break;
        }
        return Math.min(1.0, alignment);
    }
    /**
     * Compare goal priority for sorting
     */
    compareGoalPriority(a, b, personality) {
        const alignmentA = this.calculatePersonalityAlignment(a, personality);
        const alignmentB = this.calculatePersonalityAlignment(b, personality);
        // Sort by personality alignment first, then by priority
        if (Math.abs(alignmentA - alignmentB) > 0.1) {
            return alignmentB - alignmentA;
        }
        return (a.priority || 5) - (b.priority || 5);
    }
    /**
     * Create a goal request with common parameters
     */
    createGoalRequest(id, name, level, description, successCriteria, priority, category) {
        return {
            name: `anti_idle_${id}_${Date.now()}`,
            description,
            level,
            objective: description,
            successCriteria,
            priority,
            category,
            tags: ['anti_idle', category],
            motivationSource: 'anti_idle_system'
        };
    }
    /**
     * Analyze resource needs based on current inventory
     */
    analyzeResourceNeeds(context) {
        const needs = [];
        const inventory = context.inventory || [];
        // Food needs
        const foodCount = inventory.find((item) => item.type === 'food')?.count || 0;
        if (foodCount < 10) {
            needs.push({
                type: 'food',
                amount: 20 - foodCount,
                priority: 2,
                reason: 'Low food supplies'
            });
        }
        // Building materials
        const woodCount = inventory.find((item) => item.type === 'wood')?.count || 0;
        if (woodCount < 64) {
            needs.push({
                type: 'wood',
                amount: 64 - woodCount,
                priority: 1,
                reason: 'Need wood for building and crafting'
            });
        }
        // Tool materials
        const ironCount = inventory.find((item) => item.type === 'iron')?.count || 0;
        if (ironCount < 10) {
            needs.push({
                type: 'iron',
                amount: 10 - ironCount,
                priority: 1,
                reason: 'Need iron for tools and equipment'
            });
        }
        return needs;
    }
    /**
     * Identify damaged equipment from inventory
     */
    identifyDamagedEquipment(context) {
        const damaged = [];
        const equipment = context.equipment || {};
        Object.entries(equipment).forEach(([slot, item]) => {
            if (item && item.durability && item.durability < 0.3) {
                damaged.push(`${slot} (${item.type})`);
            }
        });
        return damaged;
    }
    /**
     * Check if a resource is valuable
     */
    isValuableResource(blockType) {
        const valuableResources = [
            'diamond_ore', 'iron_ore', 'gold_ore', 'coal_ore',
            'emerald_ore', 'redstone_ore', 'lapis_ore'
        ];
        return valuableResources.includes(blockType);
    }
    /**
     * Calculate resource priority
     */
    calculateResourcePriority(blockType) {
        const priorityMap = {
            'diamond_ore': 1,
            'iron_ore': 2,
            'gold_ore': 2,
            'coal_ore': 3,
            'emerald_ore': 1,
            'redstone_ore': 2,
            'lapis_ore': 3
        };
        return priorityMap[blockType] || 3;
    }
    /**
     * Calculate resource value
     */
    calculateResourceValue(blockType) {
        const valueMap = {
            'diamond_ore': 100,
            'iron_ore': 50,
            'gold_ore': 40,
            'coal_ore': 20,
            'emerald_ore': 80,
            'redstone_ore': 30,
            'lapis_ore': 25
        };
        return valueMap[blockType] || 10;
    }
    /**
     * Get resource requirements for gathering
     */
    getResourceRequirements(blockType) {
        const requirements = [];
        if (this.isHardMaterial(blockType)) {
            requirements.push({
                type: 'tool',
                name: 'pickaxe',
                quantity: 1
            });
        }
        return requirements;
    }
    /**
     * Check if material is hard to mine
     */
    isHardMaterial(blockType) {
        const hardMaterials = [
            'iron_ore', 'gold_ore', 'diamond_ore', 'stone'
        ];
        return hardMaterials.includes(blockType);
    }
    /**
     * Map numeric priority to GoalPriority enum
     */
    mapPriorityFromNumber(priority) {
        switch (priority) {
            case 1: return GoalPriority.HIGH;
            case 2: return GoalPriority.MEDIUM;
            case 3: return GoalPriority.LOW;
            default: return GoalPriority.MEDIUM;
        }
    }
    /**
     * Extract personality from agent state
     */
    extractPersonality(agentState) {
        return agentState.cognitive?.purpose?.personality || {
            openness: 0.5,
            conscientiousness: 0.5,
            extraversion: 0.5,
            agreeableness: 0.5,
            neuroticism: 0.5,
            riskTolerance: 0.5,
            explorationDrive: 0.5,
            socialTendency: 0.5,
            buildingCreativity: 0.5,
            combatAggression: 0.5
        };
    }
    /**
     * Clean up old anti-idle goals
     */
    cleanupOldAntiIdleGoals(agentState) {
        const now = Date.now();
        const activeGoals = agentState.cognitive?.goals?.activeGoals || [];
        // Remove anti-idle goals that are too old (over 10 minutes)
        activeGoals.forEach((goal) => {
            if (goal.tags?.includes('anti_idle') &&
                now - goal.createdAt > 600000) { // 10 minutes
                goal.status = GoalStatus.CANCELLED;
                console.log(`[ANTI_IDLE_GOAL_GENERATOR] Cancelled old anti-idle goal: ${goal.id}`);
            }
        });
    }
    /**
     * Update configuration
     */
    updateConfig(updates) {
        this.config = { ...this.config, ...updates };
        console.log('[ANTI_IDLE_GOAL_GENERATOR] Configuration updated:', updates);
    }
    /**
     * Get current configuration
     */
    getConfig() {
        return { ...this.config };
    }
    /**
     * Get anti-idle statistics
     */
    getStatistics() {
        return {
            lastGenerationTime: this.lastGenerationTime,
            activeAntiIdleGoals: this.activeAntiIdleGoals.size,
            totalGenerated: this.activeAntiIdleGoals.size
        };
    }
}
//# sourceMappingURL=anti_idle_goal_generator.js.map