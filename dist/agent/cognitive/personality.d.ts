/**
 * Personality System - Big Five Traits + Gaming-Specific Traits
 *
 * Provides the foundation for consistent, personality-driven behavior.
 * Personality traits influence but never override reactive survival behaviors.
 */
export interface PersonalityTraits {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
    riskTolerance: number;
    creativity: number;
    patience: number;
    competitiveness: number;
    curiosity: number;
}
export interface PersonalityProfile {
    traits: PersonalityTraits;
    confidence: number;
    adaptability: number;
    consistency: number;
}
export declare class PersonalitySystem {
    private profile;
    private baselineTraits;
    constructor(initialTraits?: Partial<PersonalityTraits>);
    /**
     * Create default personality traits
     */
    private createDefaultTraits;
    /**
     * Get current personality profile
     */
    getProfile(): PersonalityProfile;
    /**
     * Calculate personality influence on action utility
     */
    calculateActionInfluence(actionType: string, context: any): number;
    /**
     * Update personality based on experience
     */
    updateFromExperience(experience: PersonalityExperience): void;
    /**
     * Get stress level based on neuroticism and context
     */
    calculateStressLevel(context: any): number;
    /**
     * Determine if personality supports risk-taking
     */
    shouldTakeRisk(context: any): boolean;
    /**
     * Create personality profile from legacy profile data
     */
    static fromLegacyProfile(legacyProfile: any): PersonalitySystem;
    /**
     * Export personality to legacy format
     */
    toLegacyProfile(): any;
}
export interface PersonalityExperience {
    success: boolean;
    intensity: number;
    traitInfluences: {
        [key in keyof PersonalityTraits]?: number;
    };
    context: any;
}
//# sourceMappingURL=personality.d.ts.map