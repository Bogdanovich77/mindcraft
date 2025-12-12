/**
 * Trust Calculator
 *
 * Advanced trust calculation algorithms for social relationships
 * Following the established patterns from cognitive components
 */
import { TrustMetrics, RelationshipInteraction, TrustCalculationConfig } from './relationship_types.js';
import { PersonalityTraits } from '../cognitive/personality.js';
/**
 * Trust calculation system with personality-driven algorithms
 */
export declare class TrustCalculator {
    private config;
    private personalityCompatibilityCache;
    constructor(config?: Partial<TrustCalculationConfig>);
    /**
     * Calculate initial trust level based on personality compatibility
     */
    calculateInitialTrust(agentPersonality: PersonalityTraits, targetPersonality: PersonalityTraits): number;
    /**
     * Update trust based on interaction outcome
     */
    updateTrust(currentTrust: TrustMetrics, interaction: RelationshipInteraction, agentPersonality: PersonalityTraits, reputationScore?: number): TrustMetrics;
    /**
     * Apply time-based decay to trust levels
     */
    applyTrustDecay(trust: TrustMetrics, deltaTime: number): TrustMetrics;
    /**
     * Calculate trust repair after breach
     */
    calculateTrustRepair(currentTrust: TrustMetrics, repairActions: string[], agentPersonality: PersonalityTraits): number;
    /**
     * Predict future trust levels
     */
    predictTrustLevel(currentTrust: TrustMetrics, recentInteractions: RelationshipInteraction[], timeframe: number): number;
    /**
     * Calculate personality compatibility between agents
     */
    private calculatePersonalityCompatibility;
    /**
     * Calculate trust change from interaction
     */
    private calculateTrustChange;
    /**
     * Get base trust change for interaction type
     */
    private getInteractionTrustChange;
    /**
     * Get personality-based trust modifiers
     */
    private getPersonalityTrustModifiers;
    /**
     * Calculate compatibility factors between personalities
     */
    private calculateCompatibilityFactors;
    /**
     * Calculate overall compatibility from factors
     */
    private calculateOverallCompatibility;
    /**
     * Calculate trait similarity (0 to 1)
     */
    private calculateTraitSimilarity;
    /**
     * Calculate trait complementarity (0 to 1)
     */
    private calculateTraitComplementarity;
    /**
     * Get weight for personality trait in compatibility
     */
    private getTraitWeight;
    /**
     * Calculate trust propensity between personalities
     */
    private calculateTrustPropensity;
    /**
     * Calculate friendship propensity between personalities
     */
    private calculateFriendshipPropensity;
    /**
     * Calculate collaboration propensity between personalities
     */
    private calculateCollaborationPropensity;
    /**
     * Generate cache key for personality compatibility
     */
    private generateCompatibilityKey;
    /**
     * Update individual trust component
     */
    private updateComponentTrust;
    /**
     * Calculate forgiveness factor based on personality
     */
    private calculateForgivenessFactor;
    /**
     * Get effectiveness of repair action
     */
    private getRepairActionEffectiveness;
    /**
     * Get personality modifier for interaction
     */
    private getPersonalityInteractionModifier;
    /**
     * Generate reason for trust change
     */
    private generateTrustChangeReason;
    /**
     * Get configuration
     */
    getConfig(): TrustCalculationConfig;
    /**
     * Update configuration
     */
    updateConfig(newConfig: Partial<TrustCalculationConfig>): void;
    /**
     * Clear compatibility cache
     */
    clearCache(): void;
    /**
     * Get cache statistics
     */
    getCacheStats(): {
        size: number;
        hits: number;
        misses: number;
    };
}
//# sourceMappingURL=trust_calculator.d.ts.map