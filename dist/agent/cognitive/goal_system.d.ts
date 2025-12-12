import { Goal, GoalLevel, GoalCreationRequest, GoalUpdateRequest, GoalExecutionResult, GoalPrioritizationResult } from './goal_types.js';
import { AgentState, SocialState } from '../langgraph/interfaces.js';
import { PlanningEngine } from '../langgraph/interfaces.js';
/**
 * Goal system configuration
 */
export interface GoalSystemConfig {
    maxConcurrentGoals: number;
    maxGoalDepth: number;
    autoDecomposition: boolean;
    autoPrioritization: boolean;
    autoResourceAllocation: boolean;
    learningEnabled: boolean;
    legacyMigrationEnabled: boolean;
    performanceTracking: boolean;
    reactiveIntegration: boolean;
}
/**
 * Goal system statistics
 */
export interface GoalSystemStats {
    totalGoals: number;
    activeGoals: number;
    completedGoals: number;
    failedGoals: number;
    averageCompletionTime: number;
    successRate: number;
    goalDistribution: Record<GoalLevel, number>;
    resourceUtilization: number;
    performanceMetrics: {
        decompositionTime: number;
        prioritizationTime: number;
        executionTime: number;
        resourceAllocationTime: number;
    };
}
/**
 * Main goal management system
 */
export declare class GoalSystem {
    private decompositionEngine;
    private prioritizationEngine;
    private executionEngine;
    private resourceManager;
    private legacyBridge;
    private config;
    private goals;
    private goalHierarchy;
    private executionHistory;
    private statistics;
    private socialState?;
    private planningEngine?;
    constructor(config?: Partial<GoalSystemConfig>);
    /**
     * Initialize the goal system with agent state
     */
    initialize(agentState: AgentState): Promise<void>;
    /**
     * Create a new goal
     */
    createGoal(request: GoalCreationRequest, agentState: AgentState): Promise<Goal>;
    /**
     * Update an existing goal
     */
    updateGoal(request: GoalUpdateRequest, agentState: AgentState): Promise<Goal>;
    /**
     * Execute a goal
     */
    executeGoal(goalId: string, agentState: AgentState): Promise<GoalExecutionResult>;
    /**
     * Main update loop for the goal system
     */
    update(agentState: AgentState, deltaTime: number): Promise<{
        completedGoals: GoalExecutionResult[];
        newPriorities: GoalPrioritizationResult;
        resourceUpdates: any;
    }>;
    /**
     * Get goals by level
     */
    getGoalsByLevel(level: GoalLevel): Goal[];
    /**
     * Get active goals
     */
    getActiveGoals(): Goal[];
    /**
     * Get goal hierarchy
     */
    getGoalHierarchy(): Map<string, Goal[]>;
    /**
     * Get system statistics
     */
    getStatistics(): GoalSystemStats;
    /**
     * Migrate legacy goals
     */
    migrateLegacyGoals(agentState: AgentState): Promise<void>;
    /**
     * Export goal system state
     */
    exportState(): {
        goals: Goal[];
        hierarchy: Record<string, string[]>;
        statistics: GoalSystemStats;
        config: GoalSystemConfig;
    };
    /**
     * Import goal system state
     */
    importState(state: {
        goals: Goal[];
        hierarchy: Record<string, string[]>;
        statistics?: GoalSystemStats;
        config?: GoalSystemConfig;
    }): Promise<void>;
    /**
     * Private helper methods
     */
    private loadGoalsFromState;
    private convertLegacyGoal;
    private mapLegacyStatus;
    private mapLegacyPriority;
    private convertLegacyRequirements;
    private buildGoalHierarchy;
    private updateGoalHierarchy;
    private decomposeGoal;
    private prioritizeAllGoals;
    private allocateResourcesForGoal;
    private allocateResourcesForAllGoals;
    private createExecutionContext;
    private extractAvailableResources;
    private extractEnvironmentalConditions;
    private extractSocialContext;
    private validateGoalCreationRequest;
    private buildGoalFromRequest;
    private shouldRedecompose;
    private shouldReprioritize;
    private shouldReallocateResources;
    private shouldReprioritizeAll;
    private initializeStatistics;
    private updateStatistics;
    private trackPerformance;
    /**
     * Set social state for social-aware goal processing
     */
    setSocialState(socialState: SocialState): void;
    /**
     * Generate social-aware goals
     */
    generateSocialGoals(agentState: AgentState): string[];
    /**
     * Apply social influence to goal prioritization
     */
    applySocialInfluenceToGoals(goals: Goal[], agentState: AgentState): Goal[];
    /**
     * Create collaborative goal with other agents
     */
    createCollaborativeGoal(goalName: string, description: string, collaborators: string[], agentState: AgentState): Goal;
    /**
     * Calculate collaborative goal priority
     */
    private calculateCollaborativePriority;
    /**
     * Calculate social alignment for collaborative goals
     */
    private calculateSocialAlignment;
    /**
     * Estimate time needed for collaborative goal
     */
    private estimateCollaborativeTime;
    /**
     * Generate anti-idle goals if needed
     */
    private generateAntiIdleGoalsIfNeeded;
    /**
     * Set planning engine for goal-driven planning
     */
    setPlanningEngine(planningEngine: PlanningEngine): void;
    /**
     * Create plan from goal
     */
    createPlanFromGoal(goalId: string, agentState: AgentState): Promise<string | null>;
    /**
     * Get plan for goal
     */
    getPlanForGoal(goalId: string): string | null;
    /**
     * Update goal based on plan progress
     */
    updateGoalFromPlanProgress(planId: string, progress: any, agentState: AgentState): Promise<void>;
    /**
     * Map goal priority to plan priority
     */
    private mapGoalPriorityToPlanPriority;
    /**
     * Convert goal requirements to plan requirements
     */
    private convertGoalRequirementsToPlanRequirements;
}
//# sourceMappingURL=goal_system.d.ts.map