/**
 * Personality-Driven Activity Generation System
 *
 * Generates activities based on agent personality traits
 * Ensures activities align with agent's core characteristics and preferences
 */
import { AgentState } from '../langgraph/interfaces.js';
/**
 * Activity categories for personality-driven generation
 */
export declare enum ActivityCategory {
    EXPLORATION = "exploration",
    SOCIAL = "social",
    BUILDING = "building",
    COMBAT = "combat",
    CRAFTING = "crafting",
    RESOURCE_GATHERING = "resource_gathering"
}
/**
 * Personality activity profile
 */
export interface PersonalityActivityProfile {
    explorationPreference: number;
    socialPreference: number;
    buildingPreference: number;
    combatPreference: number;
    craftingPreference: number;
    resourceGatheringPreference: number;
}
/**
 * Generated activity suggestion
 */
export interface PersonalityActivitySuggestion {
    type: ActivityCategory;
    description: string;
    personalityAlignment: number;
    estimatedDuration: number;
    requirements: string[];
    expectedOutcomes: string[];
    priority: number;
    context: any;
    confidence: number;
}
/**
 * Activity generation configuration
 */
export interface ActivityGenerationConfig {
    enabled: boolean;
    maxActivities: number;
    minPersonalityAlignment: number;
    diversityFactor: number;
    contextWeight: number;
    personalityWeight: number;
    refreshInterval: number;
}
/**
 * Main personality-driven activity generator
 */
export declare class PersonalityActivityGenerator {
    private agentId;
    private config;
    private lastGenerationTime;
    private activityHistory;
    constructor(agentId: string, config?: Partial<ActivityGenerationConfig>);
    /**
     * Generate personality-driven activities
     */
    generateActivities(agentState: AgentState): Promise<PersonalityActivitySuggestion[]>;
    /**
     * Create personality activity profile
     */
    private createActivityProfile;
    /**
     * Analyze current context for activity generation
     */
    private analyzeCurrentContext;
    /**
     * Generate exploration activities
     */
    private generateExplorationActivities;
    /**
     * Generate social activities
     */
    private generateSocialActivities;
    /**
     * Generate building activities
     */
    private generateBuildingActivities;
    /**
     * Generate combat activities
     */
    private generateCombatActivities;
    /**
     * Generate crafting activities
     */
    private generateCraftingActivities;
    /**
     * Generate resource gathering activities
     */
    private generateResourceActivities;
    /**
     * Filter and prioritize activities
     */
    private filterAndPrioritizeActivities;
    /**
     * Check if activity is appropriate for current context
     */
    private isContextAppropriate;
    /**
     * Ensure activity diversity
     */
    private ensureDiversity;
    private calculateExplorationPreference;
    private calculateSocialPreference;
    private calculateBuildingPreference;
    private calculateCombatPreference;
    private calculateCraftingPreference;
    private calculateResourcePreference;
    private calculateActivityPriority;
    private calculateActivityConfidence;
    private getRelevantTraits;
    private calculateInventoryLoad;
    private estimateTerrainType;
    private assessDangerLevel;
    private analyzeSocialContext;
    private isUnderwaterExplorationSafe;
    private extractPersonality;
    private updateActivityHistory;
    /**
     * Get current configuration
     */
    getConfig(): ActivityGenerationConfig;
    /**
     * Update configuration
     */
    updateConfig(updates: Partial<ActivityGenerationConfig>): void;
    /**
     * Get activity history
     */
    getActivityHistory(): PersonalityActivitySuggestion[];
    /**
     * Get statistics
     */
    getStatistics(): {
        totalActivitiesGenerated: number;
        activitiesByCategory: Record<ActivityCategory, number>;
        averagePersonalityAlignment: number;
        lastGenerationTime: number;
    };
    /**
     * Reset activity generator
     */
    reset(): void;
}
//# sourceMappingURL=personality_activity_generator.d.ts.map