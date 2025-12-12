import { AgentState, Plan, PlanningEngineConfig, PlanningResult, PlanningRequest } from '../langgraph/interfaces';
/**
 * Planning Engine
 *
 * Main orchestrator for all planning activities including resource assessment,
 * feasibility analysis, and replanning. Integrates with existing cognitive
 * components and multi-agent coordination.
 */
export declare class PlanningEngine {
    private config;
    private resourceAssessment;
    private feasibilityAnalyzer;
    private replanningSystem;
    private activePlans;
    private planningHistory;
    private lastPlanningTime;
    constructor(config?: Partial<PlanningEngineConfig>);
    /**
     * Main planning method - creates plans based on goals and context
     */
    createPlan(request: PlanningRequest, agentState: AgentState): Promise<PlanningResult>;
    /**
     * Update an existing plan
     */
    updatePlan(planId: string, updates: Partial<Plan>, agentState: AgentState): Promise<PlanningResult>;
    /**
     * Execute a plan step
     */
    executeStep(planId: string, stepId: string, agentState: AgentState): Promise<boolean>;
    /**
     * Complete a plan
     */
    completePlan(planId: string, agentState: AgentState): Promise<boolean>;
    /**
     * Cancel a plan
     */
    cancelPlan(planId: string, reason?: string): Promise<boolean>;
    /**
     * Get active plans
     */
    getActivePlans(): Plan[];
    /**
     * Get plan by ID
     */
    getPlan(planId: string): Plan | null;
    /**
     * Get planning history
     */
    getPlanningHistory(): PlanningResult[];
    /**
     * Clear planning history
     */
    clearHistory(): void;
    /**
     * Get configuration
     */
    getConfig(): PlanningEngineConfig;
    /**
     * Update configuration
     */
    updateConfig(config: Partial<PlanningEngineConfig>): void;
    /**
     * Get planning statistics
     */
    getStatistics(): {
        totalPlans: number;
        activePlans: number;
        completedPlans: number;
        cancelledPlans: number;
        averagePlanningTime: number;
        successRate: number;
        lastPlanningTime: number;
    };
    private validatePlanningRequest;
    private createPlanningContext;
    private generateInitialPlan;
    private determinePlanType;
    private generatePlanSteps;
    private optimizePlan;
    private generateAlternatives;
    private convertFeasibilityResult;
    private createPlanningResult;
    private updatePlanProgress;
    private addToHistory;
}
//# sourceMappingURL=planning_engine.d.ts.map