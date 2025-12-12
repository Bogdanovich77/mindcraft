import { Goal, ResourceRequirement, ResourceAllocation, AvailableResource, GoalExecutionContext, ExecutionError } from './goal_types.js';
/**
 * Resource types for goal management
 */
export declare enum ResourceType {
    ITEM = "item",// Physical items (blocks, tools, materials)
    TOOL = "tool",// Tools and equipment
    SKILL = "skill",// Skills and capabilities
    TIME = "time",// Time resources
    LOCATION = "location",// Location-specific resources
    ENERGY = "energy",// Energy/stamina resources
    SOCIAL = "social",// Social resources (help from others)
    INFORMATION = "information"
}
/**
 * Resource priority levels
 */
export declare enum ResourcePriority {
    CRITICAL = 0,// Essential for goal completion
    HIGH = 1,// Very important
    MEDIUM = 2,// Moderately important
    LOW = 3,// Nice to have
    OPTIONAL = 4
}
/**
 * Resource allocation strategies
 */
export declare enum AllocationStrategy {
    FIRST_COME_FIRST_SERVED = "first_come_first_served",
    PRIORITY_BASED = "priority_based",
    EFFICIENCY_MAXIMIZATION = "efficiency_maximization",
    FAIR_DISTRIBUTION = "fair_distribution",
    OPPORTUNISTIC = "opportunistic",
    CONSERVATIVE = "conservative"
}
/**
 * Resource reservation status
 */
export declare enum ReservationStatus {
    PENDING = "pending",
    RESERVED = "reserved",
    ALLOCATED = "allocated",
    CONSUMED = "consumed",
    RELEASED = "released",
    EXPIRED = "expired"
}
/**
 * Resource reservation
 */
export interface ResourceReservation {
    id: string;
    goalId: string;
    resourceType: ResourceType;
    resourceName: string;
    quantity: number;
    quality: number;
    priority: ResourcePriority;
    status: ReservationStatus;
    createdAt: number;
    expiresAt?: number;
    allocatedAt?: number;
    consumedAt?: number;
    conditions: string[];
    alternatives: ResourceRequirement[];
}
/**
 * Resource scarcity assessment
 */
export interface ResourceScarcity {
    resourceType: ResourceType;
    resourceName: string;
    scarcityLevel: number;
    estimatedAvailability: number;
    replenishmentRate: number;
    alternativeResources: string[];
    acquisitionDifficulty: number;
}
/**
 * Resource optimization result
 */
export interface ResourceOptimizationResult {
    originalRequirements: ResourceRequirement[];
    optimizedRequirements: ResourceRequirement[];
    savings: {
        quantity: number;
        cost: number;
        time: number;
    };
    substitutions: Array<{
        original: ResourceRequirement;
        substitute: ResourceRequirement;
        efficiency: number;
    }>;
    confidence: number;
}
/**
 * Goal resource manager
 */
export declare class GoalResourceManager {
    private reservations;
    private allocationStrategy;
    private scarcityCache;
    private resourceOptimizer;
    private acquisitionPlanner;
    constructor(allocationStrategy?: AllocationStrategy);
    /**
     * Assess resource availability for a goal
     */
    assessResourceAvailability(goal: Goal, context: GoalExecutionContext): Promise<{
        available: AvailableResource[];
        missing: ResourceRequirement[];
        scarce: ResourceRequirement[];
        alternatives: Array<{
            original: ResourceRequirement;
            alternatives: ResourceRequirement[];
        }>;
    }>;
    /**
     * Reserve resources for a goal
     */
    reserveResources(goal: Goal, context: GoalExecutionContext): Promise<{
        success: boolean;
        reservations: ResourceReservation[];
        errors: ExecutionError[];
    }>;
    /**
     * Allocate resources based on strategy
     */
    allocateResources(goals: Goal[], context: GoalExecutionContext): Promise<{
        allocations: Map<string, ResourceAllocation[]>;
        conflicts: Array<{
            resource: string;
            competingGoals: string[];
            resolution: string;
        }>;
    }>;
    /**
     * Optimize resource requirements for a goal
     */
    optimizeResources(goal: Goal, context: GoalExecutionContext): Promise<ResourceOptimizationResult>;
    /**
     * Plan resource acquisition for missing resources
     */
    planResourceAcquisition(goal: Goal, missingResources: ResourceRequirement[], context: GoalExecutionContext): Promise<{
        acquisitionPlans: Array<{
            resource: ResourceRequirement;
            plan: AcquisitionPlan;
            priority: number;
            estimatedTime: number;
        }>;
        totalEstimatedTime: number;
        totalEstimatedCost: number;
    }>;
    /**
     * Monitor resource usage and availability
     */
    monitorResources(context: GoalExecutionContext): Promise<{
        scarcityAlerts: ResourceScarcity[];
        expiringReservations: ResourceReservation[];
        usageEfficiency: Record<string, number>;
        recommendations: string[];
    }>;
    /**
     * Release resources when goal is completed or cancelled
     */
    releaseResources(goalId: string): Promise<{
        released: ResourceReservation[];
        errors: string[];
    }>;
    /**
     * Helper methods
     */
    private findAvailableResource;
    private findAlternatives;
    private isCriticalResource;
    private createReservation;
    private createPartialReservation;
    private canReserve;
    private getRequiredQuantity;
    private mapGoalPriorityToResourcePriority;
    private calculateAllocationEfficiency;
    private requirementFromReservation;
    private allocateByPriority;
    private allocateForEfficiency;
    private allocateFairly;
    private allocateOpportunistically;
    private allocateConservatively;
    private allocateForGoal;
    private allocateForGoalConservatively;
    private calculateEfficiencyScores;
    private sortByOpportunity;
    private calculateOpportunityScore;
    private assessScarcity;
    private calculateTotalDemand;
    private estimateReplenishmentRate;
    private findAlternativeResources;
    private estimateAcquisitionDifficulty;
    private calculateAcquisitionPriority;
    private calculateResourceUsage;
    private releaseReservation;
    private releaseReservations;
    private generateReservationId;
    /**
     * Get current resource status
     */
    getResourceStatus(): {
        totalReservations: number;
        activeReservations: number;
        expiredReservations: number;
        resourceUtilization: Record<string, number>;
    };
}
/**
 * Acquisition plan interface
 */
export interface AcquisitionPlan {
    resource: ResourceRequirement;
    strategy: string;
    steps: string[];
    estimatedTime: number;
    estimatedCost: number;
    requirements: ResourceRequirement[];
    risks: string[];
    alternatives: AcquisitionStrategy[];
}
/**
 * Acquisition strategy interface
 */
interface AcquisitionStrategy {
    name: string;
    steps: string[];
    estimatedTime: number;
    estimatedCost: number;
    requirements: ResourceRequirement[];
    risks: string[];
}
export {};
//# sourceMappingURL=goal_resources.d.ts.map