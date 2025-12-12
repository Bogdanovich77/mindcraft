/**
 * Anti-Idle Goal Generation System
 *
 * Proactive goal generation mechanisms to ensure agents always have meaningful tasks
 * Integrates with existing goal system and personality-driven behavior
 */
import { GoalLevel, GoalPriority, GoalCreationRequest } from './goal_types.js';
import { AgentState } from '../langgraph/interfaces.js';
import { PurposeCore } from './purpose_core.js';
import { SkillsSystem } from './skills_system.js';
import { MemorySystem } from '../memory/memory_system.js';
/**
 * Resource need for anti-idle goal generation
 */
export interface ResourceNeed {
    type: string;
    amount: number;
    priority: number;
    reason: string;
}
/**
 * Activity suggestion for personality-driven goals
 */
export interface ActivitySuggestion {
    type: string;
    description: string;
    personalityAlignment: number;
    estimatedDuration: number;
    requirements: string[];
    expectedOutcomes: string[];
    category: 'exploration' | 'social' | 'building' | 'combat' | 'crafting' | 'resource_gathering';
}
/**
 * Environmental opportunity for anti-idle goals
 */
export interface EnvironmentalOpportunity {
    id: string;
    type: 'resource' | 'structure' | 'exploration' | 'social' | 'skill' | 'danger';
    priority: number;
    description: string;
    location: {
        x: number;
        y: number;
        z: number;
    };
    requirements: any[];
    estimatedValue: number;
    timeWindow?: number;
}
/**
 * Anti-idle goal generation configuration
 */
export interface AntiIdleGoalConfig {
    enabled: boolean;
    maxAntiIdleGoals: number;
    goalPriority: GoalPriority;
    goalTypes: GoalLevel[];
    refreshInterval: number;
    minActivityThreshold: number;
    personalityInfluence: number;
    opportunityDetection: boolean;
}
/**
 * Main anti-idle goal generator
 */
export declare class AntiIdleGoalGenerator {
    private purposeCore;
    private skillsSystem;
    private memorySystem;
    private config;
    private lastGenerationTime;
    private activeAntiIdleGoals;
    constructor(purposeCore: PurposeCore, skillsSystem: SkillsSystem, memorySystem: MemorySystem, config?: Partial<AntiIdleGoalConfig>);
    /**
     * Generate anti-idle goals based on current agent state
     */
    generateAntiIdleGoals(agentState: AgentState): Promise<GoalCreationRequest[]>;
    /**
     * Generate maintenance goals (health, food, equipment repair)
     */
    private generateMaintenanceGoals;
    /**
     * Generate exploration goals based on personality
     */
    private generateExplorationGoals;
    /**
     * Generate social goals based on personality and context
     */
    private generateSocialGoals;
    /**
     * Generate skill development goals
     */
    private generateSkillDevelopmentGoals;
    /**
     * Generate resource management goals
     */
    private generateResourceManagementGoals;
    /**
     * Detect environmental opportunities
     */
    private detectEnvironmentalOpportunities;
    /**
     * Generate opportunity-based goals
     */
    private generateOpportunityGoals;
    /**
     * Filter and prioritize goals based on personality and current state
     */
    private filterAndPrioritizeGoals;
    /**
     * Check if goal is suitable for current personality and state
     */
    private isGoalSuitable;
    /**
     * Calculate personality alignment for a goal
     */
    private calculatePersonalityAlignment;
    /**
     * Compare goal priority for sorting
     */
    private compareGoalPriority;
    /**
     * Create a goal request with common parameters
     */
    private createGoalRequest;
    /**
     * Analyze resource needs based on current inventory
     */
    private analyzeResourceNeeds;
    /**
     * Identify damaged equipment from inventory
     */
    private identifyDamagedEquipment;
    /**
     * Check if a resource is valuable
     */
    private isValuableResource;
    /**
     * Calculate resource priority
     */
    private calculateResourcePriority;
    /**
     * Calculate resource value
     */
    private calculateResourceValue;
    /**
     * Get resource requirements for gathering
     */
    private getResourceRequirements;
    /**
     * Check if material is hard to mine
     */
    private isHardMaterial;
    /**
     * Map numeric priority to GoalPriority enum
     */
    private mapPriorityFromNumber;
    /**
     * Extract personality from agent state
     */
    private extractPersonality;
    /**
     * Clean up old anti-idle goals
     */
    private cleanupOldAntiIdleGoals;
    /**
     * Update configuration
     */
    updateConfig(updates: Partial<AntiIdleGoalConfig>): void;
    /**
     * Get current configuration
     */
    getConfig(): AntiIdleGoalConfig;
    /**
     * Get anti-idle statistics
     */
    getStatistics(): {
        lastGenerationTime: number;
        activeAntiIdleGoals: number;
        totalGenerated: number;
    };
}
//# sourceMappingURL=anti_idle_goal_generator.d.ts.map