/**
 * Goal Prioritization Engine
 */
import * as Interfaces from '../langgraph/interfaces.js';
/**
 * Goal Prioritization Engine for LangGraph v2
 *
 * This engine calculates priority scores for goals based on multiple factors
 * including agent personality, motivations, skills, resources, and context.
 */
export declare class GoalPrioritizationEngine {
    private strategicWeight;
    private tacticalWeight;
    private operationalWeight;
    private socialWeight;
    private personalWeight;
    private environmentalWeight;
    private temporalWeight;
    /**
     * Calculate priority score for a goal
     */
    calculateGoalPriority(goal: Interfaces.Goal, agentState: Interfaces.AgentState, context: Interfaces.DecisionContext, executionContext?: Interfaces.GoalExecutionContext): Interfaces.GoalPriorityScore;
    /**
     * Calculate individual factor scores for a goal
     */
    private calculatePrioritizationFactors;
    /**
     * Calculate urgency factor
     */
    private calculateUrgencyFactor;
    /**
     * Calculate skill alignment factor
     */
    private calculateSkillAlignmentFactor;
    /**
     * Extract required skills from goal
     */
    private extractRequiredSkills;
    /**
     * Calculate value alignment
     */
    private calculateValueAlignment;
    /**
     * Calculate social priority factor
     */
    private calculateSocialPriorityFactor;
    /**
     * Calculate feasibility score
     */
    private calculateFeasibilityScore;
    /**
     * Calculate resource availability factor
     */
    private calculateResourceAvailabilityFactor;
    /**
     * Calculate skill factor
     */
    private calculateSkillFactor;
    /**
     * Calculate environmental factor
     */
    private calculateEnvironmentalFactor;
    /**
     * Calculate risk assessment
     */
    private calculateRisk;
    /**
     * Prioritize multiple goals and return ranked results
     */
    prioritizeGoals(goals: Interfaces.Goal[], context: Interfaces.GoalExecutionContext): Interfaces.GoalPrioritizationResult;
    /**
     * Get current prioritization factors and weights
     */
    getFactors(): Interfaces.PrioritizationFactors;
}
//# sourceMappingURL=goal_prioritization.d.ts.map