/**
 * Personality-Driven Activity Generation System
 *
 * Generates activities based on agent personality traits
 * Ensures activities align with agent's core characteristics and preferences
 */
/**
 * Activity categories for personality-driven generation
 */
export var ActivityCategory;
(function (ActivityCategory) {
    ActivityCategory["EXPLORATION"] = "exploration";
    ActivityCategory["SOCIAL"] = "social";
    ActivityCategory["BUILDING"] = "building";
    ActivityCategory["COMBAT"] = "combat";
    ActivityCategory["CRAFTING"] = "crafting";
    ActivityCategory["RESOURCE_GATHERING"] = "resource_gathering";
})(ActivityCategory || (ActivityCategory = {}));
/**
 * Main personality-driven activity generator
 */
export class PersonalityActivityGenerator {
    agentId;
    config;
    lastGenerationTime = 0;
    activityHistory = [];
    constructor(agentId, config) {
        this.agentId = agentId;
        this.config = {
            enabled: true,
            maxActivities: 3,
            minPersonalityAlignment: 0.5,
            diversityFactor: 0.7,
            contextWeight: 0.3,
            personalityWeight: 0.7,
            refreshInterval: 300000, // 5 minutes
            ...config
        };
        console.log(`[PERSONALITY_ACTIVITY_GENERATOR] Initialized for agent ${this.agentId}`);
    }
    /**
     * Generate personality-driven activities
     */
    async generateActivities(agentState) {
        if (!this.config.enabled) {
            return [];
        }
        const now = Date.now();
        // Check refresh interval
        if (now - this.lastGenerationTime < this.config.refreshInterval) {
            return [];
        }
        this.lastGenerationTime = now;
        try {
            const personality = this.extractPersonality(agentState);
            const profile = this.createActivityProfile(personality);
            const context = this.analyzeCurrentContext(agentState);
            // Generate activities for each category
            const activities = [];
            activities.push(...this.generateExplorationActivities(profile, personality, context));
            activities.push(...this.generateSocialActivities(profile, personality, context));
            activities.push(...this.generateBuildingActivities(profile, personality, context));
            activities.push(...this.generateCombatActivities(profile, personality, context));
            activities.push(...this.generateCraftingActivities(profile, personality, context));
            activities.push(...this.generateResourceActivities(profile, personality, context));
            // Filter and prioritize activities
            const filteredActivities = this.filterAndPrioritizeActivities(activities, profile, personality, context);
            // Update activity history
            this.updateActivityHistory(filteredActivities);
            console.log(`[PERSONALITY_ACTIVITY_GENERATOR] Generated ${filteredActivities.length} activities for agent ${this.agentId}`);
            return filteredActivities;
        }
        catch (error) {
            console.error('[PERSONALITY_ACTIVITY_GENERATOR] Error generating activities:', error);
            return [];
        }
    }
    /**
     * Create personality activity profile
     */
    createActivityProfile(personality) {
        return {
            explorationPreference: this.calculateExplorationPreference(personality),
            socialPreference: this.calculateSocialPreference(personality),
            buildingPreference: this.calculateBuildingPreference(personality),
            combatPreference: this.calculateCombatPreference(personality),
            craftingPreference: this.calculateCraftingPreference(personality),
            resourceGatheringPreference: this.calculateResourcePreference(personality)
        };
    }
    /**
     * Analyze current context for activity generation
     */
    analyzeCurrentContext(agentState) {
        return {
            timeOfDay: agentState.context.timeOfDay,
            weather: agentState.context.weather,
            health: agentState.context.health,
            food: agentState.context.food,
            nearbyEntities: agentState.context.nearbyEntities?.length || 0,
            inventoryLoad: this.calculateInventoryLoad(agentState.context.inventory || []),
            terrainType: this.estimateTerrainType(agentState),
            dangerLevel: this.assessDangerLevel(agentState),
            socialContext: this.analyzeSocialContext(agentState)
        };
    }
    /**
     * Generate exploration activities
     */
    generateExplorationActivities(profile, personality, context) {
        const activities = [];
        if (profile.explorationPreference > 0.6) {
            // Cave exploration
            activities.push({
                type: ActivityCategory.EXPLORATION,
                description: 'Explore nearby cave systems for resources',
                personalityAlignment: profile.explorationPreference,
                estimatedDuration: 600000, // 10 minutes
                requirements: ['torch', 'pickaxe', 'food'],
                expectedOutcomes: ['resources', 'experience', 'discovery'],
                priority: this.calculateActivityPriority(profile.explorationPreference, context),
                context: { explorationType: 'cave', riskLevel: 'medium' },
                confidence: this.calculateActivityConfidence('exploration', personality, context)
            });
            // Surface exploration
            activities.push({
                type: ActivityCategory.EXPLORATION,
                description: 'Map surrounding terrain and biomes',
                personalityAlignment: profile.explorationPreference * 0.8,
                estimatedDuration: 900000, // 15 minutes
                requirements: ['map_tools', 'navigation'],
                expectedOutcomes: ['knowledge', 'mapping', 'landmarks'],
                priority: this.calculateActivityPriority(profile.explorationPreference * 0.8, context),
                context: { explorationType: 'surface', riskLevel: 'low' },
                confidence: this.calculateActivityConfidence('surface_exploration', personality, context)
            });
            // Underwater exploration (if appropriate)
            if (this.isUnderwaterExplorationSafe(context)) {
                activities.push({
                    type: ActivityCategory.EXPLORATION,
                    description: 'Explore underwater ruins and resources',
                    personalityAlignment: profile.explorationPreference * 0.6,
                    estimatedDuration: 450000, // 7.5 minutes
                    requirements: ['respiration_equipment', 'light_source'],
                    expectedOutcomes: ['rare_resources', 'discovery'],
                    priority: this.calculateActivityPriority(profile.explorationPreference * 0.6, context),
                    context: { explorationType: 'underwater', riskLevel: 'high' },
                    confidence: this.calculateActivityConfidence('underwater_exploration', personality, context)
                });
            }
        }
        return activities;
    }
    /**
     * Generate social activities
     */
    generateSocialActivities(profile, personality, context) {
        const activities = [];
        if (profile.socialPreference > 0.6 && context.nearbyEntities > 0) {
            // Social interaction
            activities.push({
                type: ActivityCategory.SOCIAL,
                description: 'Initiate conversation with nearby agents',
                personalityAlignment: profile.socialPreference,
                estimatedDuration: 300000, // 5 minutes
                requirements: ['communication_skills'],
                expectedOutcomes: ['social_bonds', 'information', 'collaboration'],
                priority: this.calculateActivityPriority(profile.socialPreference, context),
                context: { socialType: 'conversation', participants: context.nearbyEntities },
                confidence: this.calculateActivityConfidence('social_interaction', personality, context)
            });
            // Group activity participation
            if (context.socialContext?.groupActivity) {
                activities.push({
                    type: ActivityCategory.SOCIAL,
                    description: 'Join group activity or project',
                    personalityAlignment: profile.socialPreference * 0.9,
                    estimatedDuration: 600000, // 10 minutes
                    requirements: ['teamwork_skills', 'cooperation'],
                    expectedOutcomes: ['group_success', 'social_capital', 'shared_goals'],
                    priority: this.calculateActivityPriority(profile.socialPreference * 0.9, context),
                    context: { socialType: 'group_participation', riskLevel: 'low' },
                    confidence: this.calculateActivityConfidence('group_activity', personality, context)
                });
            }
            // Teaching/mentoring
            if (personality.extraversion > 0.8) {
                activities.push({
                    type: ActivityCategory.SOCIAL,
                    description: 'Share knowledge or skills with others',
                    personalityAlignment: profile.socialPreference * 0.7,
                    estimatedDuration: 450000, // 7.5 minutes
                    requirements: ['teaching_skills', 'patience'],
                    expectedOutcomes: ['social_influence', 'skill_sharing', 'reputation'],
                    priority: this.calculateActivityPriority(profile.socialPreference * 0.7, context),
                    context: { socialType: 'teaching', riskLevel: 'very_low' },
                    confidence: this.calculateActivityConfidence('teaching', personality, context)
                });
            }
        }
        return activities;
    }
    /**
     * Generate building activities
     */
    generateBuildingActivities(profile, personality, context) {
        const activities = [];
        if (profile.buildingPreference > 0.6) {
            // Shelter improvement
            activities.push({
                type: ActivityCategory.BUILDING,
                description: 'Improve or expand current shelter',
                personalityAlignment: profile.buildingPreference,
                estimatedDuration: 900000, // 15 minutes
                requirements: ['building_materials', 'tools', 'planning'],
                expectedOutcomes: ['shelter', 'comfort', 'storage'],
                priority: this.calculateActivityPriority(profile.buildingPreference, context),
                context: { buildingType: 'shelter_improvement', complexity: 'medium' },
                confidence: this.calculateActivityConfidence('building', personality, context)
            });
            // Utility construction
            activities.push({
                type: ActivityCategory.BUILDING,
                description: 'Build utility structures (farms, workshops)',
                personalityAlignment: profile.buildingPreference * 0.8,
                estimatedDuration: 1200000, // 20 minutes
                requirements: ['resources', 'tools', 'blueprints'],
                expectedOutcomes: ['automation', 'efficiency', 'sustainability'],
                priority: this.calculateActivityPriority(profile.buildingPreference * 0.8, context),
                context: { buildingType: 'utilities', complexity: 'high' },
                confidence: this.calculateActivityConfidence('construction', personality, context)
            });
            // Creative building
            if (personality.buildingCreativity > 0.7) {
                activities.push({
                    type: ActivityCategory.BUILDING,
                    description: 'Create artistic or decorative structures',
                    personalityAlignment: profile.buildingPreference * 0.6,
                    estimatedDuration: 750000, // 12.5 minutes
                    requirements: ['creative_materials', 'artistic_vision'],
                    expectedOutcomes: ['self_expression', 'beauty', 'uniqueness'],
                    priority: this.calculateActivityPriority(profile.buildingPreference * 0.6, context),
                    context: { buildingType: 'creative', complexity: 'low' },
                    confidence: this.calculateActivityConfidence('creative_building', personality, context)
                });
            }
        }
        return activities;
    }
    /**
     * Generate combat activities
     */
    generateCombatActivities(profile, personality, context) {
        const activities = [];
        if (profile.combatPreference > 0.6) {
            // Combat training
            activities.push({
                type: ActivityCategory.COMBAT,
                description: 'Practice combat skills and techniques',
                personalityAlignment: profile.combatPreference * 0.8,
                estimatedDuration: 600000, // 10 minutes
                requirements: ['combat_equipment', 'training_space'],
                expectedOutcomes: ['skill_improvement', 'readiness', 'confidence'],
                priority: this.calculateActivityPriority(profile.combatPreference * 0.8, context),
                context: { combatType: 'training', riskLevel: 'low' },
                confidence: this.calculateActivityConfidence('combat_training', personality, context)
            });
            // Hostile mob hunting
            if (context.dangerLevel === 'low') {
                activities.push({
                    type: ActivityCategory.COMBAT,
                    description: 'Hunt hostile mobs for resources and experience',
                    personalityAlignment: profile.combatPreference,
                    estimatedDuration: 900000, // 15 minutes
                    requirements: ['weapons', 'armor', 'tactics'],
                    expectedOutcomes: ['resources', 'combat_experience', 'safety'],
                    priority: this.calculateActivityPriority(profile.combatPreference, context),
                    context: { combatType: 'hunting', riskLevel: 'medium' },
                    confidence: this.calculateActivityConfidence('hunting', personality, context)
                });
            }
            // Defense preparation
            if (context.dangerLevel === 'medium' || context.dangerLevel === 'high') {
                activities.push({
                    type: ActivityCategory.COMBAT,
                    description: 'Prepare defenses and secure area',
                    personalityAlignment: profile.combatPreference * 0.9,
                    estimatedDuration: 450000, // 7.5 minutes
                    requirements: ['defense_materials', 'strategic_thinking'],
                    expectedOutcomes: ['security', 'safety', 'preparedness'],
                    priority: this.calculateActivityPriority(profile.combatPreference * 0.9, context),
                    context: { combatType: 'defense', riskLevel: 'high' },
                    confidence: this.calculateActivityConfidence('defense_preparation', personality, context)
                });
            }
        }
        return activities;
    }
    /**
     * Generate crafting activities
     */
    generateCraftingActivities(profile, personality, context) {
        const activities = [];
        if (profile.craftingPreference > 0.6) {
            // Tool improvement
            activities.push({
                type: ActivityCategory.CRAFTING,
                description: 'Craft improved tools and equipment',
                personalityAlignment: profile.craftingPreference,
                estimatedDuration: 600000, // 10 minutes
                requirements: ['materials', 'crafting_table', 'recipes'],
                expectedOutcomes: ['better_tools', 'efficiency', 'skill_progression'],
                priority: this.calculateActivityPriority(profile.craftingPreference, context),
                context: { craftingType: 'tool_improvement', complexity: 'medium' },
                confidence: this.calculateActivityConfidence('tool_crafting', personality, context)
            });
            // Resource processing
            activities.push({
                type: ActivityCategory.CRAFTING,
                description: 'Process raw resources into usable materials',
                personalityAlignment: profile.craftingPreference * 0.8,
                estimatedDuration: 450000, // 7.5 minutes
                requirements: ['raw_materials', 'processing_tools'],
                expectedOutcomes: ['processed_materials', 'efficiency', 'value_addition'],
                priority: this.calculateActivityPriority(profile.craftingPreference * 0.8, context),
                context: { craftingType: 'resource_processing', complexity: 'low' },
                confidence: this.calculateActivityConfidence('resource_processing', personality, context)
            });
            // Experimental crafting
            if (personality.buildingCreativity > 0.7) {
                activities.push({
                    type: ActivityCategory.CRAFTING,
                    description: 'Experiment with new recipes and combinations',
                    personalityAlignment: profile.craftingPreference * 0.6,
                    estimatedDuration: 750000, // 12.5 minutes
                    requirements: ['experimental_materials', 'creativity', 'risk_tolerance'],
                    expectedOutcomes: ['innovation', 'new_items', 'learning'],
                    priority: this.calculateActivityPriority(profile.craftingPreference * 0.6, context),
                    context: { craftingType: 'experimental', complexity: 'high', riskLevel: 'medium' },
                    confidence: this.calculateActivityConfidence('experimental_crafting', personality, context)
                });
            }
        }
        return activities;
    }
    /**
     * Generate resource gathering activities
     */
    generateResourceActivities(profile, personality, context) {
        const activities = [];
        if (profile.resourceGatheringPreference > 0.6) {
            // Essential resource collection
            activities.push({
                type: ActivityCategory.RESOURCE_GATHERING,
                description: 'Collect essential resources (food, wood, stone)',
                personalityAlignment: profile.resourceGatheringPreference,
                estimatedDuration: 900000, // 15 minutes
                requirements: ['gathering_tools', 'storage_space'],
                expectedOutcomes: ['essentials', 'sustainability', 'preparedness'],
                priority: this.calculateActivityPriority(profile.resourceGatheringPreference, context),
                context: { resourceType: 'essentials', urgency: 'medium' },
                confidence: this.calculateActivityConfidence('essential_gathering', personality, context)
            });
            // Rare resource hunting
            activities.push({
                type: ActivityCategory.RESOURCE_GATHERING,
                description: 'Search for rare and valuable resources',
                personalityAlignment: profile.resourceGatheringPreference * 0.8,
                estimatedDuration: 1200000, // 20 minutes
                requirements: ['exploration_tools', 'risk_tolerance', 'persistence'],
                expectedOutcomes: ['valuable_resources', 'discovery', 'wealth'],
                priority: this.calculateActivityPriority(profile.resourceGatheringPreference * 0.8, context),
                context: { resourceType: 'rare', urgency: 'low', riskLevel: 'medium' },
                confidence: this.calculateActivityConfidence('rare_hunting', personality, context)
            });
            // Resource organization
            activities.push({
                type: ActivityCategory.RESOURCE_GATHERING,
                description: 'Organize and optimize resource storage',
                personalityAlignment: profile.resourceGatheringPreference * 0.6,
                estimatedDuration: 300000, // 5 minutes
                requirements: ['organization_skills', 'storage_system'],
                expectedOutcomes: ['efficiency', 'organization', 'clarity'],
                priority: this.calculateActivityPriority(profile.resourceGatheringPreference * 0.6, context),
                context: { resourceType: 'organization', urgency: 'low' },
                confidence: this.calculateActivityConfidence('resource_organization', personality, context)
            });
        }
        return activities;
    }
    /**
     * Filter and prioritize activities
     */
    filterAndPrioritizeActivities(activities, profile, personality, context) {
        // Filter by minimum personality alignment
        let filtered = activities.filter(activity => activity.personalityAlignment >= this.config.minPersonalityAlignment);
        // Filter by context appropriateness
        filtered = filtered.filter(activity => this.isContextAppropriate(activity, context));
        // Apply diversity factor
        if (this.config.diversityFactor > 0.5) {
            filtered = this.ensureDiversity(filtered);
        }
        // Sort by priority and personality alignment
        filtered.sort((a, b) => {
            const scoreA = a.priority * a.personalityAlignment;
            const scoreB = b.priority * b.personalityAlignment;
            return scoreB - scoreA;
        });
        // Limit to maximum activities
        return filtered.slice(0, this.config.maxActivities);
    }
    /**
     * Check if activity is appropriate for current context
     */
    isContextAppropriate(activity, context) {
        // Time-based filtering
        const hour = context.timeOfDay || 0;
        const isNightTime = hour < 6 || hour > 18;
        // Don't suggest dangerous activities at night unless necessary
        if (isNightTime && activity.context?.riskLevel === 'high') {
            return false;
        }
        // Health-based filtering
        if (context.health < 20 && activity.context?.riskLevel === 'high') {
            return false;
        }
        // Weather-based filtering
        if (context.weather === 'storm' && activity.type === ActivityCategory.EXPLORATION) {
            return false;
        }
        return true;
    }
    /**
     * Ensure activity diversity
     */
    ensureDiversity(activities) {
        const categories = new Set();
        const diverse = [];
        // First pass: add one from each category
        activities.forEach(activity => {
            if (!categories.has(activity.type) && diverse.length < this.config.maxActivities) {
                diverse.push(activity);
                categories.add(activity.type);
            }
        });
        // Second pass: fill remaining slots with highest priority activities
        const remaining = activities.filter(activity => !categories.has(activity.type));
        remaining.sort((a, b) => b.priority - a.priority);
        const slotsRemaining = this.config.maxActivities - diverse.length;
        for (let i = 0; i < slotsRemaining && i < remaining.length; i++) {
            diverse.push(remaining[i]);
        }
        return diverse;
    }
    // Personality preference calculation methods
    calculateExplorationPreference(personality) {
        return (personality.openness * 0.4 +
            personality.explorationDrive * 0.3 +
            personality.riskTolerance * 0.2 +
            (1 - personality.neuroticism) * 0.1);
    }
    calculateSocialPreference(personality) {
        return (personality.extraversion * 0.5 +
            personality.agreeableness * 0.3 +
            (1 - personality.neuroticism) * 0.2);
    }
    calculateBuildingPreference(personality) {
        return (personality.conscientiousness * 0.3 +
            personality.buildingCreativity * 0.4 +
            personality.socialTendency * 0.2 +
            personality.openness * 0.1);
    }
    calculateCombatPreference(personality) {
        return (personality.combatAggression * 0.4 +
            personality.riskTolerance * 0.3 +
            (1 - personality.neuroticism) * 0.2 +
            personality.combatAggression * 0.1);
    }
    calculateCraftingPreference(personality) {
        return (personality.buildingCreativity * 0.3 +
            personality.conscientiousness * 0.3 +
            personality.socialTendency * 0.2 +
            personality.openness * 0.2);
    }
    calculateResourcePreference(personality) {
        return (personality.conscientiousness * 0.4 +
            personality.riskTolerance * 0.3 +
            personality.openness * 0.2 +
            personality.socialTendency * 0.1);
    }
    // Utility methods
    calculateActivityPriority(personalityAlignment, context) {
        let priority = personalityAlignment * 10; // Base priority from alignment
        // Context modifiers
        if (context.dangerLevel === 'high')
            priority += 5;
        if (context.health < 30)
            priority += 3;
        if (context.food < 30)
            priority += 2;
        if (context.nearbyEntities > 5)
            priority -= 1; // Less priority when crowded
        return Math.max(1, Math.min(20, priority));
    }
    calculateActivityConfidence(activityType, personality, context) {
        let confidence = 0.7; // Base confidence
        // Personality-based confidence
        const relevantTraits = this.getRelevantTraits(activityType);
        relevantTraits.forEach(trait => {
            confidence += personality[trait] * 0.1;
        });
        // Context-based confidence
        if (context.dangerLevel === 'low')
            confidence += 0.1;
        if (context.health > 50)
            confidence += 0.1;
        if (context.inventoryLoad < 0.8)
            confidence += 0.1;
        return Math.max(0.1, Math.min(1.0, confidence));
    }
    getRelevantTraits(activityType) {
        const traitMap = {
            'exploration': ['openness', 'explorationDrive', 'riskTolerance'],
            'social_interaction': ['extraversion', 'agreeableness'],
            'building': ['buildingCreativity', 'conscientiousness', 'patience'],
            'combat_training': ['combatAggression', 'riskTolerance'],
            'hunting': ['combatAggression', 'riskTolerance'],
            'defense_preparation': ['conscientiousness', 'riskTolerance'],
            'tool_crafting': ['buildingCreativity', 'conscientiousness', 'patience'],
            'resource_processing': ['conscientiousness', 'patience'],
            'experimental_crafting': ['buildingCreativity', 'openness', 'riskTolerance'],
            'essential_gathering': ['conscientiousness', 'patience'],
            'rare_hunting': ['explorationDrive', 'riskTolerance'],
            'resource_organization': ['conscientiousness', 'patience']
        };
        return traitMap[activityType] || [];
    }
    calculateInventoryLoad(inventory) {
        if (!inventory || inventory.length === 0)
            return 0;
        const totalSlots = 36; // Standard inventory size
        const usedSlots = inventory.reduce((count, item) => count + (item.count || 1), 0);
        return usedSlots / totalSlots;
    }
    estimateTerrainType(agentState) {
        const position = agentState.context.position;
        // Simple terrain estimation based on y-coordinate
        if (position.y < 60)
            return 'underground';
        if (position.y < 70)
            return 'surface';
        if (position.y < 80)
            return 'hills';
        return 'mountains';
    }
    assessDangerLevel(agentState) {
        const nearbyEntities = agentState.context.nearbyEntities || [];
        const hostileEntities = nearbyEntities.filter(entity => entity.hostile);
        if (hostileEntities.length > 3)
            return 'high';
        if (hostileEntities.length > 0)
            return 'medium';
        return 'low';
    }
    analyzeSocialContext(agentState) {
        const nearbyEntities = agentState.context.nearbyEntities || [];
        const socialEntities = nearbyEntities.filter(entity => entity.type === 'player' || entity.type === 'agent');
        return {
            groupActivity: socialEntities.length > 2,
            socialDensity: socialEntities.length,
            socialOpportunities: socialEntities.length > 0
        };
    }
    isUnderwaterExplorationSafe(context) {
        return context.health > 50 && // Good health
            context.inventoryLoad < 0.8; // Not overburdened
    }
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
    updateActivityHistory(activities) {
        this.activityHistory.push(...activities);
        // Keep only recent history
        if (this.activityHistory.length > 50) {
            this.activityHistory = this.activityHistory.slice(-50);
        }
    }
    // Public API methods
    /**
     * Get current configuration
     */
    getConfig() {
        return { ...this.config };
    }
    /**
     * Update configuration
     */
    updateConfig(updates) {
        this.config = { ...this.config, ...updates };
        console.log(`[PERSONALITY_ACTIVITY_GENERATOR] Configuration updated for agent ${this.agentId}:`, updates);
    }
    /**
     * Get activity history
     */
    getActivityHistory() {
        return [...this.activityHistory];
    }
    /**
     * Get statistics
     */
    getStatistics() {
        const activitiesByCategory = {
            [ActivityCategory.EXPLORATION]: 0,
            [ActivityCategory.SOCIAL]: 0,
            [ActivityCategory.BUILDING]: 0,
            [ActivityCategory.COMBAT]: 0,
            [ActivityCategory.CRAFTING]: 0,
            [ActivityCategory.RESOURCE_GATHERING]: 0
        };
        this.activityHistory.forEach(activity => {
            activitiesByCategory[activity.type]++;
        });
        const averageAlignment = this.activityHistory.length > 0 ?
            this.activityHistory.reduce((sum, activity) => sum + activity.personalityAlignment, 0) / this.activityHistory.length : 0;
        return {
            totalActivitiesGenerated: this.activityHistory.length,
            activitiesByCategory,
            averagePersonalityAlignment: averageAlignment,
            lastGenerationTime: this.lastGenerationTime
        };
    }
    /**
     * Reset activity generator
     */
    reset() {
        this.activityHistory = [];
        this.lastGenerationTime = 0;
        console.log(`[PERSONALITY_ACTIVITY_GENERATOR] Reset for agent ${this.agentId}`);
    }
}
//# sourceMappingURL=personality_activity_generator.js.map