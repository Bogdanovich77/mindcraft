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
export interface GoalPriorityFactors {
    strategic: number;
    tactical: number;
    operational: number;
    social: number;
    personal: number;
    environmental: number;
    temporal: number;
    resource: number;
    risk: number;
    learning: number;
}
export interface GoalPriorityScore {
    goalId: string;
    score: number;
    factors: GoalPriorityFactors;
    confidence: number;
    reasoning: string;
    timestamp: number;
}
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
    private calculateGoalFactors;
    /**
     * Calculate strategic alignment factor
     */
    private calculateStrategicFactor;
    /**
     * Calculate tactical importance factor
     */
    private calculateTacticalFactor;
    /**
     * Calculate operational readiness factor
     */
    private calculateOperationalFactor;
    /**
     * Calculate social impact factor
     */
    private calculateSocialFactor;
    /**
     * Calculate personal alignment factor
     */
    private calculatePersonalFactor;
    /**
     * Calculate environmental suitability factor
     */
    private calculateEnvironmentalFactor;
    /**
     * Calculate temporal urgency factor
     */
    private calculateTemporalFactor;
    /**
     * Calculate resource availability and efficiency (enhanced for Planning Engine)
     */
    private calculateResource;
    /**
     * Calculate resource availability score
     */
    private calculateResourceAvailability;
    /**
     * Calculate resource efficiency score
     */
    private calculateResourceEfficiency;
    /**
     * Calculate cost-benefit analysis
     */
    private calculateCostBenefit;
    /**
     * Calculate sustainability score
     */
    private calculateSustainability;
    /**
     * Calculate opportunity value
     */
    private calculateOpportunityValue;
    /**
     * Calculate resource scarcity impact
     */
    private calculateResourceScarcity;
    /**
     * Calculate resource accessibility
     */
    private calculateResourceAccessibility;
    /**
     * Calculate risk assessment factor
     */
    private calculateRisk;
    /**
     * Calculate learning and growth potential
     */
    private calculateLearning;
    /**
     * Calculate confidence in priority assessment
     */
    private calculateConfidence;
    /**
     * Generate reasoning for priority score
     */
    private generateReasoning;
    /**
     * Prioritize multiple goals and return ranked results
     */
    prioritizeGoals(goals: Interfaces.GoalType[], // Use the goal_types Goal type
    context: Interfaces.GoalExecutionContext): Interfaces.GoalPrioritizationResult;
    /**
     * Get current prioritization factors and weights
     */
    getFactors(): PrioritizationFactors;
    private calculatePrioritizationFactors;
    /**
     * Helper method to calculate distance between two positions
     */
    private calculateDistance;
    private calculateSocialPriorityFactor;
    private calculateMotivationAlignment;
    /**
     * Helper method to calculate value alignment
     */
    private calculateValueAlignment;
    /**
     * Calculate enhanced feasibility score with detailed assessment
     * Returns a numeric score (0-1) for goal feasibility
     */
    private calculateFeasibilityScore;
    private calculateResourceAvailabilityFactor;
    private calculateToolAvailabilityFactor;
    private calculateAssistanceFactor;
    private calculateCostFactor;
    /**
     * Calculate enhanced resource score with detailed assessment
     * Returns a numeric score (0-1) for resource efficiency and availability
     */
    private calculateResourceScore;
    /**
     * Calculate enhanced feasibility with detailed assessment (legacy method for backward compatibility)
     */
    private calculateFeasibility;
    /**
     * Calculate detailed skill readiness assessment
     */
    private calculateSkillReadiness;
    /**
     * Calculate experience bonus based on recent skill usage
     */
    private calculateExperienceBonus;
    /**
     * Assess general capability beyond specific proficiency
     */
    private assessGeneralCapability;
    /**
     * Calculate environmental fit assessment
     */
    private calculateEnvironmentalFit;
    private calculateResourceFactor;
    private calculateGoalTypeFactor;
    /**
     * Calculate time feasibility based on deadlines and duration
     */
    private calculateTimeFeasibility;
    /**
     * Calculate dependency feasibility
     */
    private calculateDependencyFeasibility;
    /**
     * Extract required skills from goal description
     */
    private extractRequiredSkills;
    private calculateSkillFactor;
    private calculateSkillPriorityFactor;
}
//# sourceMappingURL=goal_prioritization.d.ts.map