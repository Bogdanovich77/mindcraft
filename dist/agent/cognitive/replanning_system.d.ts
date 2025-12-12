import { AgentState, ReplanningTrigger, ReplanningResult, ReplanningSystemConfig } from '../langgraph/interfaces';
/**
 * Replanning System
 *
 * Handles dynamic plan adjustment, obstacle detection, alternative plan generation,
 * and real-time replanning based on changing conditions.
 */
export declare class ReplanningSystem {
    private config;
    private replanningHistory;
    private activeMonitoring;
    private lastReplanning;
    constructor(config?: Partial<ReplanningSystemConfig>);
    /**
     * Main replanning method - handles all replanning triggers
     */
    replan(trigger: ReplanningTrigger, agentState: AgentState): Promise<ReplanningResult>;
    /**
     * Monitor plan execution for obstacles and issues
     */
    monitorPlan(planId: string, agentState: AgentState): Promise<void>;
    /**
     * Stop monitoring a plan
     */
    stopMonitoring(planId: string): void;
    /**
     * Analyze current situation for replanning decisions
     */
    private analyzeSituation;
    /**
     * Determine if replanning is necessary
     */
    private shouldReplan;
    /**
     * Get current plan (would need to be implemented based on plan storage)
     */
    private getCurrentPlan;
    /**
     * Generate new plan based on trigger and analysis
     */
    private generateNewPlan;
    /**
     * Validate new plan
     */
    private validateNewPlan;
    /**
     * Calculate plan changes between original and new plan
     */
    private calculatePlanChanges;
    /**
     * Identify learning opportunities from replanning
     */
    private identifyLearningOpportunities;
    /**
     * Generate lessons from replanning
     */
    private generateLessons;
    private analyzeResourceChanges;
    private analyzeEnvironmentalChanges;
    private analyzeGoalChanges;
    private analyzeTimeConstraints;
    private analyzeRiskFactors;
    private generateFailureRecoveryPlan;
    private generateObstacleAvoidancePlan;
    private generateResourceAdaptationPlan;
    private generateGoalAdaptationPlan;
    private generateTimeOptimizedPlan;
    private generateConflictResolutionPlan;
    private generateGenericReplan;
    private generateRecoverySteps;
    private generateAvoidanceSteps;
    private generateResourceAdaptationSteps;
    private generateGoalAdaptationSteps;
    private generateTimeOptimizedSteps;
    private generateConflictResolutionSteps;
    private generateGenericSteps;
    private getTriggerScore;
    private getCurrentResourceUsage;
    private detectExecutionIssues;
    private detectBlockingFactors;
    private createReplanningResult;
    private addToHistory;
    private startMonitoring;
    /**
     * Get replanning history
     */
    getReplanningHistory(): ReplanningResult[];
    /**
     * Clear replanning history
     */
    clearHistory(): void;
    /**
     * Get configuration
     */
    getConfig(): ReplanningSystemConfig;
    /**
     * Update configuration
     */
    updateConfig(config: Partial<ReplanningSystemConfig>): void;
    /**
     * Get replanning statistics
     */
    getStatistics(): {
        totalReplans: number;
        successfulReplans: number;
        averageReplanningTime: number;
        lastReplanning: number;
        activeMonitoring: number;
    };
}
//# sourceMappingURL=replanning_system.d.ts.map