/**
 * Reputation System
 *
 * Comprehensive reputation tracking and management system
 * Following the established patterns from cognitive components
 */
import { AgentReputation, ReputationSystemConfig, RelationshipInteraction, SocialContext } from './relationship_types.js';
/**
 * Reputation calculation and tracking system
 */
export declare class ReputationSystem {
    private config;
    private reputationCache;
    private domainReputations;
    constructor(config?: Partial<ReputationSystemConfig>);
    /**
     * Get agent's reputation
     */
    getReputation(agentId: string): AgentReputation;
    /**
     * Update reputation based on interaction
     */
    updateReputation(agentId: string, interaction: RelationshipInteraction, context: SocialContext, witnessIds?: string[]): AgentReputation;
    /**
     * Add endorsement to agent's reputation
     */
    addEndorsement(agentId: string, endorserId: string, trait: string, strength: number, context: string): void;
    /**
     * Add criticism to agent's reputation
     */
    addCriticism(agentId: string, criticId: string, issue: string, severity: number, context: string, validity?: number): void;
    /**
     * Calculate reputation propagation through social network
     */
    calculatePropagatedReputation(agentId: string, networkConnections: Map<string, number>, // agentId -> connection strength
    maxDepth?: number): number;
    /**
     * Get domain-specific reputation
     */
    getDomainReputation(agentId: string, domain: string): number;
    /**
     * Predict reputation trajectory
     */
    predictReputationTrajectory(agentId: string, recentInteractions: RelationshipInteraction[], timeframe: number): {
        current: number;
        predicted: number;
        trend: 'improving' | 'stable' | 'declining';
        confidence: number;
    };
    /**
     * Get reputation summary for display
     */
    getReputationSummary(agentId: string): {
        globalScore: number;
        topDomains: Array<{
            domain: string;
            score: number;
        }>;
        topTraits: Array<{
            trait: string;
            score: number;
        }>;
        recentAccomplishments: number;
        endorsementCount: number;
        criticismCount: number;
        trend: 'improving' | 'stable' | 'declining';
    };
    /**
     * Create default reputation traits
     */
    private createDefaultReputationTraits;
    /**
     * Calculate reputation impact from interaction
     */
    private calculateReputationImpact;
    /**
     * Extract domains from interaction
     */
    private extractDomainsFromInteraction;
    /**
     * Update trait scores
     */
    private updateTraitScores;
    /**
     * Add accomplishment to reputation
     */
    private addAccomplishment;
    /**
     * Generate accomplishment description
     */
    private generateAccomplishmentDescription;
    /**
     * Calculate accomplishment impact
     */
    private calculateAccomplishmentImpact;
    /**
     * Process witness feedback for interactions
     */
    private processWitnessFeedback;
    /**
     * Apply endorsement to trait
     */
    private applyEndorsementToTrait;
    /**
     * Apply criticism to traits
     */
    private applyCriticismToTraits;
    /**
     * Apply time-based decay to reputation
     */
    private applyReputationDecay;
    /**
     * Apply decay projection for prediction
     */
    private applyDecayProjection;
    /**
     * Get configuration
     */
    getConfig(): ReputationSystemConfig;
    /**
     * Update configuration
     */
    updateConfig(newConfig: Partial<ReputationSystemConfig>): void;
    /**
     * Clear reputation cache
     */
    clearCache(): void;
    /**
     * Get cache statistics
     */
    getCacheStats(): {
        reputationCacheSize: number;
        domainCacheSize: number;
        memoryUsage: number;
    };
    /**
     * Calculate approximate memory usage
     */
    private calculateMemoryUsage;
}
//# sourceMappingURL=reputation_system.d.ts.map