/**
 * Purpose-Driven Decision Maker
 *
 * Integrates personality, motivations, values, and ethics to calculate
 * utility scores for action selection. Always respects reactive interrupts.
 */
import { PersonalitySystem } from './personality.js';
import { MotivationSystem } from './motivations.js';
import { ValueSystem } from './values.js';
import { EthicsSystem } from './ethics.js';
export interface ActionOption {
    id: string;
    type: string;
    description: string;
    requirements: string[];
    expectedOutcome: {
        success_probability: number;
        resource_cost: number;
        time_cost: number;
        benefits: string[];
        risks: string[];
    };
    interruptible: boolean;
}
export interface DecisionContext {
    currentSituation: string;
    availableResources: Record<string, number>;
    timeConstraints: number;
    socialContext: {
        allies_nearby: string[];
        enemies_nearby: string[];
        neutrals_nearby: string[];
    };
    environmentalFactors: {
        danger_level: number;
        resource_scarcity: number;
        opportunity_level: number;
    };
    urgency: 'low' | 'medium' | 'high' | 'emergency';
}
export interface UtilityBreakdown {
    totalUtility: number;
    purposeUtility: number;
    personalityUtility: number;
    motivationUtility: number;
    ethicsUtility: number;
    breakdown: {
        purpose: number;
        personality: number;
        motivations: number;
        values: number;
        ethics: number;
    };
    reasoning: string;
}
export declare class PurposeDrivenDecisionMaker {
    private personality;
    private motivations;
    private values;
    private ethics;
    private readonly WEIGHTS;
    constructor(personality: PersonalitySystem, motivations: MotivationSystem, values: ValueSystem, ethics: EthicsSystem);
    /**
     * Calculate utility score for an action option
     */
    calculateUtility(action: ActionOption, context: DecisionContext): UtilityBreakdown;
    /**
     * Calculate purpose-based utility
     */
    private calculatePurposeUtility;
    /**
     * Calculate personality-based utility
     */
    private calculatePersonalityUtility;
    /**
     * Calculate motivation-based utility
     */
    private calculateMotivationUtility;
    /**
     * Calculate values-based utility
     */
    private calculateValuesUtility;
    /**
     * Get alignment of action with motivation type
     */
    private getMotivationAlignment;
    /**
     * Calculate how well action fits current situation
     */
    private getSituationalFit;
    /**
     * Calculate resource efficiency
     */
    private calculateResourceEfficiency;
    /**
     * Calculate risk vs reward ratio
     */
    private calculateRiskReward;
    /**
     * Generate reasoning for decision
     */
    private generateReasoning;
    /**
     * Select best action from options
     */
    selectBestAction(options: ActionOption[], context: DecisionContext): {
        action: ActionOption | null;
        utility: UtilityBreakdown;
        allUtilities: Array<{
            action: ActionOption;
            utility: UtilityBreakdown;
        }>;
    };
    /**
     * Update decision systems based on experience
     */
    updateFromExperience(action: ActionOption, outcome: 'success' | 'failure' | 'partial', context: DecisionContext): void;
    /**
     * Get personality influences for experience
     */
    private getPersonalityInfluences;
    /**
     * Get primary motivation for action type
     */
    private getPrimaryMotivationForAction;
    /**
     * Get values affected by action
     */
    private getValuesForAction;
    /**
     * Check if decision maker should yield to reactive system
     */
    shouldYieldToReactive(context: DecisionContext): boolean;
}
//# sourceMappingURL=decision_maker.d.ts.map