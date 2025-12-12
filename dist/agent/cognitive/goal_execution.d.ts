import { Goal, GoalExecutionResult, ResourceUsage, ExecutionError, GoalExecutionContext } from './goal_types.js';
import { InterruptPriority } from '../langgraph/interfaces.js';
import { GoalDecompositionEngine } from './goal_decomposition.js';
import { GoalPrioritizationEngine } from './goal_prioritization.js';
/**
 * Execution strategies for different goal types
 */
export declare enum ExecutionStrategy {
    SEQUENTIAL = "sequential",// Execute steps in order
    PARALLEL = "parallel",// Execute multiple steps simultaneously
    ADAPTIVE = "adaptive",// Adapt strategy based on conditions
    OPPORTUNISTIC = "opportunistic",// Leverage opportunities as they arise
    CONSERVATIVE = "conservative",// Minimize risk and ensure stability
    AGGRESSIVE = "aggressive",// Maximize speed and efficiency
    COLLABORATIVE = "collaborative"
}
/**
 * Execution monitoring levels
 */
export declare enum MonitoringLevel {
    MINIMAL = "minimal",// Basic progress tracking
    STANDARD = "standard",// Regular monitoring and adjustments
    INTENSIVE = "intensive",// Continuous monitoring and optimization
    ADAPTIVE = "adaptive"
}
/**
 * Execution state for active goals
 */
export interface ExecutionState {
    goalId: string;
    strategy: ExecutionStrategy;
    monitoringLevel: MonitoringLevel;
    currentStep: number;
    startTime: number;
    estimatedCompletion: number;
    actualProgress: number;
    resourceUsage: ResourceUsage[];
    errors: ExecutionError[];
    adaptations: ExecutionAdaptation[];
    checkpointsPassed: string[];
    interruptHistory: ExecutionInterrupt[];
}
/**
 * Execution adaptation record
 */
export interface ExecutionAdaptation {
    timestamp: number;
    reason: string;
    originalStrategy: ExecutionStrategy;
    newStrategy: ExecutionStrategy;
    impact: 'low' | 'medium' | 'high';
    success: boolean;
}
/**
 * Execution interrupt record
 */
export interface ExecutionInterrupt {
    timestamp: number;
    priority: InterruptPriority;
    reason: string;
    handled: boolean;
    resumedAt?: number;
}
/**
 * Goal execution engine
 */
export declare class GoalExecutionEngine {
    private decompositionEngine;
    private prioritizationEngine;
    private activeExecutions;
    private executionHistory;
    private performanceMonitor;
    private adaptationEngine;
    constructor(decompositionEngine: GoalDecompositionEngine, prioritizationEngine: GoalPrioritizationEngine);
    /**
     * Execute a goal with specified strategy and monitoring
     */
    executeGoal(goal: Goal, context: GoalExecutionContext, strategy?: ExecutionStrategy, monitoringLevel?: MonitoringLevel): Promise<GoalExecutionResult>;
    /**
     * Monitor and update active goal executions
     */
    updateExecutions(context: GoalExecutionContext, deltaTime: number): Promise<GoalExecutionResult[]>;
    /**
     * Execute goal using specific strategy
     */
    private executeWithStrategy;
    /**
     * Sequential execution strategy
     */
    private executeSequential;
    /**
     * Parallel execution strategy
     */
    private executeParallel;
    /**
     * Adaptive execution strategy
     */
    private executeAdaptive;
    /**
     * Opportunistic execution strategy
     */
    private executeOpportunistic;
    /**
     * Conservative execution strategy
     */
    private executeConservative;
    /**
     * Aggressive execution strategy
     */
    private executeAggressive;
    /**
     * Collaborative execution strategy
     */
    private executeCollaborative;
    /**
     * Helper methods for execution
     */
    private selectOptimalStrategy;
    private selectMonitoringLevel;
    private executeStep;
    private executeStepWithStrategy;
    private executeOpportunity;
    private executeNextStep;
    private executeStepSafely;
    private executeStepAggressively;
    private checkStepPrerequisites;
    private checkGoalCompletion;
    private updateGoalProgress;
    private createExecutionOutcome;
    private generateNextActions;
    private createFailureResult;
    private identifyParallelSteps;
    private assessExecutionConditions;
    private scanForOpportunities;
    private validateSafetyConditions;
    private waitForSafeConditions;
    private identifyCollaborators;
    private delegateTasks;
    private executeCollaborativeTasks;
    private calculateUrgency;
    private estimateComplexity;
    private assessRiskLevel;
    private assessCollaborationOpportunity;
    private mapPriorityToImportance;
    private calculateProgress;
    private checkForInterrupts;
    private handleInterrupt;
    private updateExecutionProgress;
    private completeExecution;
    private adaptExecution;
    /**
     * Get execution statistics
     */
    getExecutionStats(): {
        totalExecutions: number;
        successRate: number;
        averageDuration: number;
        commonErrors: string[];
    };
}
//# sourceMappingURL=goal_execution.d.ts.map