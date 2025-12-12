import { Goal, GoalDecompositionResult, GoalExecutionContext } from './goal_types.js';
/**
 * Goal decomposition strategies
 */
export declare enum DecompositionStrategy {
    HIERARCHICAL = "hierarchical",// Break into strategic->tactical->operational
    TEMPORAL = "temporal",// Break by time phases
    RESOURCE_BASED = "resource_based",// Break by resource requirements
    SKILL_BASED = "skill_based",// Break by skill requirements
    DEPENDENCY_DRIVEN = "dependency_driven",// Break by dependencies
    CONTEXT_AWARE = "context_aware",// Adapt to current context
    OPPORTUNISTIC = "opportunistic"
}
/**
 * Goal decomposition engine
 */
export declare class GoalDecompositionEngine {
    private templates;
    private contextAnalyzer;
    private patternMatcher;
    constructor();
    /**
     * Decompose a goal into subgoals based on strategy and context
     */
    decomposeGoal(goal: Goal, context: GoalExecutionContext, strategy?: DecompositionStrategy): Promise<GoalDecompositionResult>;
    /**
     * Select best decomposition strategy for a goal
     */
    private selectStrategy;
    /**
     * Find matching decomposition template
     */
    private findTemplate;
    /**
     * Decompose goal using template
     */
    private decomposeFromTemplate;
    /**
     * Decompose goal dynamically without template
     */
    private decomposeDynamically;
    /**
     * Hierarchical decomposition (strategic -> tactical -> operational)
     */
    private hierarchicalDecomposition;
    /**
     * Temporal decomposition by phases
     */
    private temporalDecomposition;
    /**
     * Resource-based decomposition
     */
    private resourceBasedDecomposition;
    /**
     * Skill-based decomposition
     */
    private skillBasedDecomposition;
    /**
     * Dependency-driven decomposition
     */
    private dependencyDrivenDecomposition;
    /**
     * Context-aware decomposition
     */
    private contextAwareDecomposition;
    /**
     * Opportunistic decomposition
     */
    private opportunisticDecomposition;
    /**
     * Generate tactical goals from strategic goal
     */
    private generateTacticalGoals;
    /**
     * Generate operational goals from tactical goal
     */
    private generateOperationalGoals;
    /**
     * Create goal from pattern template
     */
    private createGoalFromPattern;
    /**
     * Initialize decomposition templates
     */
    private initializeTemplates;
    /**
     * Helper methods for decomposition logic
     */
    private calculateUrgency;
    private estimateComplexity;
    private analyzeResourceConstraints;
    private analyzeTimePressure;
    private needsResourceAcquisition;
    private identifyRequiredSkills;
    private needsSkillDevelopment;
    private analyzeDependencies;
    private identifyOpportunities;
    private identifyTemporalPhases;
    private createPhaseSubgoal;
    private createResourceAcquisitionGoal;
    private createExecutionSubgoal;
    private createSkillDevelopmentGoal;
    private createDependencySubgoal;
    private createOpportunityGoals;
    private createThreatMitigationGoals;
    private createOpportunityBasedGoal;
    private createConstructionTacticalGoal;
    private createEconomicTacticalGoal;
    private createExplorationTacticalGoal;
    private createGatheringGoal;
    private generateTaskBreakdown;
    private calculateSubgoalPriority;
    private interpolatePattern;
    private generateGoalId;
    private validateDecomposition;
    private calculateDecompositionConfidence;
    private createExecutionPlan;
}
//# sourceMappingURL=goal_decomposition.d.ts.map