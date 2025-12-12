/**
 * Ethical Framework System
 *
 * Provides moral reasoning and ethical decision-making capabilities.
 * Ethics guide behavior but never override reactive survival instincts.
 */
export type EthicalFramework = 'utilitarian' | 'deontological' | 'virtue_ethics' | 'care_ethics' | 'custom';
export interface EthicalPrinciple {
    name: string;
    description: string;
    weight: number;
    flexibility: number;
    scope: 'self' | 'others' | 'environment' | 'all';
}
export interface MoralConstraint {
    type: 'absolute' | 'strong' | 'weak' | 'contextual';
    principle: string;
    conditions: string[];
    severity: number;
}
export interface EthicalProfile {
    framework: EthicalFramework;
    principles: EthicalPrinciple[];
    constraints: MoralConstraint[];
    moralReasoning: {
        consideration_radius: number;
        empathy_level: number;
        consistency_drive: number;
    };
}
export interface EthicalDilemma {
    action: string;
    consequences: Array<{
        affected: string;
        outcome: string;
        probability: number;
        severity: number;
    }>;
    conflicting_principles: string[];
    context: any;
}
export declare class EthicsSystem {
    private profile;
    private readonly ETHICAL_DECAY_RATE;
    constructor(initialProfile?: Partial<EthicalProfile>);
    /**
     * Create default ethical principles
     */
    private createDefaultPrinciples;
    /**
     * Create default moral constraints
     */
    private createDefaultConstraints;
    /**
     * Evaluate ethical permissibility of an action
     */
    evaluateAction(action: string, context: any): {
        permissible: boolean;
        ethicalScore: number;
        violatedConstraints: MoralConstraint[];
        reasoning: string;
    };
    /**
     * Check if action violates any moral constraints
     */
    private checkConstraints;
    /**
     * Evaluate if a condition is met in context
     */
    private evaluateCondition;
    /**
     * Check if action violates a specific principle
     */
    private violatesPrinciple;
    /**
     * Calculate overall ethical score using framework
     */
    private calculateEthicalScore;
    /**
     * Utilitarian: maximize overall happiness/well-being
     */
    private utilitarianEvaluation;
    /**
     * Deontological: follow moral rules and duties
     */
    private deontologicalEvaluation;
    /**
     * Virtue Ethics: cultivate virtuous character
     */
    private virtueEthicsEvaluation;
    /**
     * Care Ethics: prioritize relationships and care
     */
    private careEthicsEvaluation;
    /**
     * Custom evaluation based on personalized principles
     */
    private customEvaluation;
    /**
     * Get consideration weight for different entities
     */
    private getConsiderationWeight;
    /**
     * Get alignment of action with principle (-1 to 1)
     */
    private getPrincipleAlignment;
    /**
     * Get virtue score for action
     */
    private getActionVirtueScore;
    /**
     * Predict consequences of action
     */
    private predictConsequences;
    /**
     * Get relationship weights for care ethics
     */
    private getRelationshipWeights;
    /**
     * Predict impact on specific person
     */
    private predictImpactOnPerson;
    /**
     * Generate reasoning for ethical evaluation
     */
    private generateReasoning;
    /**
     * Get current ethical profile
     */
    getProfile(): EthicalProfile;
    /**
     * Update ethical profile based on experience
     */
    updateFromExperience(action: string, outcome: number, context: any): void;
    /**
     * Create ethics system from legacy profile
     */
    static fromLegacyProfile(legacyProfile: any): EthicsSystem;
    /**
     * Export to legacy format
     */
    toLegacyProfile(): any;
}
//# sourceMappingURL=ethics.d.ts.map