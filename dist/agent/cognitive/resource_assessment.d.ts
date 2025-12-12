/**
 * Resource Assessment System for Planning Engine
 *
 * Provides comprehensive resource inventory tracking, requirement analysis,
 * and allocation optimization for the Mindcraft LangGraph planning system.
 */
import { AgentState, ResourceRequirement, ResourceAllocation, ResourceAllocationOptimization, ResourceAssessmentResult } from '../langgraph/interfaces.js';
/**
 * Resource Assessment System class
 */
export declare class ResourceAssessmentSystem {
    private config;
    private lastAssessmentTime;
    private assessmentCache;
    private cacheTimeout;
    constructor(config?: Partial<ResourceAssessmentConfig>);
    /**
     * Assess current resource inventory and availability
     */
    assessResources(agentState: AgentState): Promise<ResourceAssessmentResult>;
    /**
     * Assess resource availability for specific requirements
     */
    assessResourceAvailability(requirements: ResourceRequirement[], agentState: AgentState): Promise<ResourceAssessmentResult>;
    /**
     * Optimize resource allocation for better efficiency
     */
    optimizeResourceAllocation(allocation: ResourceAllocation, agentState: AgentState): Promise<ResourceAllocationOptimization>;
    /**
     * Build comprehensive resource inventory from agent state
     */
    private buildResourceInventory;
    /**
     * Analyze resource availability
     */
    private analyzeAvailability;
    /**
     * Identify resource shortages
     */
    private identifyShortages;
    /**
     * Identify resource excess
     */
    private identifyExcess;
    /**
     * Generate recommendations based on assessment
     */
    private generateRecommendations;
    /**
     * Check availability of a specific resource
     */
    private checkResourceAvailability;
    /**
     * Create shortage object
     */
    private createShortage;
    /**
     * Generate recommendations for specific requirements
     */
    private generateRequirementRecommendations;
    /**
     * Analyze current allocation
     */
    private analyzeAllocation;
    /**
     * Generate optimization strategies
     */
    private generateOptimizations;
    /**
     * Apply optimizations to create new allocation
     */
    private applyOptimizations;
    /**
     * Calculate savings between allocations
     */
    private calculateSavings;
    /**
     * Calculate efficiency gain
     */
    private calculateEfficiencyGain;
    /**
     * Calculate utilization improvement
     */
    private calculateUtilizationImprovement;
    /**
     * Helper methods for resource analysis
     */
    private calculateTotalValue;
    private calculateAccessibility;
    private estimateItemQuality;
    private calculateItemAccessibility;
    private estimateItemValue;
    private estimateItemDurability;
    private estimateToolDurability;
    private estimateToolEfficiency;
    private getToolSkillRequirements;
    private estimateToolUsageTime;
    private calculateResourcePriority;
    private calculateAllocationWaste;
    private identifyAllocationOpportunities;
    private calculateConflictImpact;
    private calculateResolutionCost;
    private calculateResolutionRisk;
    private isConflictResolved;
    private calculateOverallAvailability;
    private generateCacheKey;
    private cleanupCache;
}
/**
 * Resource assessment configuration
 */
export interface ResourceAssessmentConfig {
    assessmentTimeout: number;
    enableCaching: boolean;
    cacheTimeout: number;
    maxCacheSize: number;
    enableOptimization: boolean;
    optimizationThreshold: number;
    enableConflictDetection: boolean;
    enableAllocationTracking: boolean;
}
//# sourceMappingURL=resource_assessment.d.ts.map