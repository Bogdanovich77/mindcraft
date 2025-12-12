/**
 * Social Reasoning Engine
 *
 * This component implements higher-level social cognition including group dynamics
 * prediction, social norm understanding, and cultural context modeling. It provides
 * sophisticated social decision-making support for cognitive components.
 */
import { SocialSituation, SituationType, SocialRole, PowerBalance, GroupDynamics, SocialNorm, NormType, CulturalContext } from './tom_types.js';
import { PersonalityTraits } from '../langgraph/interfaces.js';
import { AgentRelationship } from './relationship_types.js';
/**
 * Social reasoning input context
 */
export interface SocialReasoningInput {
    agentId: string;
    nearbyAgents: string[];
    currentSituation: any;
    environment: any;
    relationships: Map<string, AgentRelationship>;
    personality?: PersonalityTraits;
    culturalBackground?: string;
    timestamp: number;
}
/**
 * Social reasoning output
 */
export interface SocialReasoningOutput {
    situationAssessment: SocialSituation;
    groupDynamics: GroupDynamics;
    socialNorms: SocialNorm[];
    culturalContext: CulturalContext;
    recommendations: SocialRecommendation[];
    confidence: number;
    processingTime: number;
}
/**
 * Social recommendation for decision making
 */
export interface SocialRecommendation {
    type: RecommendationType;
    priority: number;
    description: string;
    expectedOutcome: string;
    risks: string[];
    confidence: number;
    reasoning: string;
}
/**
 * Types of social recommendations
 */
export declare enum RecommendationType {
    SOCIAL_APPROACH = "social_approach",
    SOCIAL_AVOID = "social_avoid",
    COOPERATE = "cooperate",
    COMPETE = "compete",
    LEAD = "lead",
    FOLLOW = "follow",
    MEDIATE = "mediate",
    OBSERVE = "observe",
    COMMUNICATE = "communicate",
    WITHDRAW = "withdraw"
}
/**
 * Social reasoning configuration
 */
export interface SocialReasoningConfig {
    enableGroupDynamics: boolean;
    enableNormUnderstanding: boolean;
    enableCulturalContext: boolean;
    enablePowerAnalysis: boolean;
    enableCommunicationAnalysis: boolean;
    maxRecommendations: number;
    confidenceThreshold: number;
    updateFrequency: number;
    contextRetentionPeriod: number;
}
/**
 * Social situation pattern for recognition
 */
export interface SocialSituationPattern {
    situationType: SituationType;
    indicators: Array<{
        type: string;
        weight: number;
        threshold: number;
    }>;
    contextRequirements: string[];
    typicalRoles: SocialRole[];
    commonNorms: NormType[];
    powerStructure: PowerBalance;
}
/**
 * Main social reasoning engine class
 */
export declare class SocialReasoningEngine {
    private config;
    private situationPatterns;
    private culturalContexts;
    private socialNorms;
    private reasoningHistory;
    private lastUpdateTime;
    constructor(config: SocialReasoningConfig);
    /**
     * Initialize social situation patterns
     */
    private initializeSituationPatterns;
    /**
     * Initialize cultural contexts
     */
    private initializeCulturalContexts;
    /**
     * Initialize social norms
     */
    private initializeSocialNorms;
    /**
     * Perform social reasoning analysis
     */
    analyzeSocialContext(input: SocialReasoningInput): SocialReasoningOutput;
    /**
     * Assess the current social situation
     */
    private assessSocialSituation;
    /**
     * Calculate situation score based on pattern matching
     */
    private calculateSituationScore;
    /**
     * Check if input has a specific indicator
     */
    private hasIndicator;
    /**
     * Assign social roles to participants
     */
    private assignSocialRoles;
    /**
     * Analyze power dynamics in the situation
     */
    private analyzePowerDynamics;
    /**
     * Identify influence clusters
     */
    private identifyInfluenceClusters;
    /**
     * Analyze communication pattern
     */
    private analyzeCommunicationPattern;
    /**
     * Analyze group dynamics
     */
    private analyzeGroupDynamics;
    /**
     * Identify applicable social norms
     */
    private identifySocialNorms;
    /**
     * Check if a norm context is relevant to the input
     */
    private isContextRelevant;
    /**
     * Determine cultural context
     */
    private determineCulturalContext;
    /**
     * Generate social recommendations
     */
    private generateRecommendations;
    /**
     * Create cooperation recommendation
     */
    private createCooperationRecommendation;
    /**
     * Create competition recommendation
     */
    private createCompetitionRecommendation;
    /**
     * Create conflict resolution recommendation
     */
    private createConflictResolutionRecommendation;
    /**
     * Create social engagement recommendation
     */
    private createSocialEngagementRecommendation;
    /**
     * Create crisis response recommendation
     */
    private createCrisisResponseRecommendation;
    /**
     * Create cultural recommendation
     */
    private createCulturalRecommendation;
    /**
     * Create norm compliance recommendation
     */
    private createNormComplianceRecommendation;
    /**
     * Calculate overall confidence
     */
    private calculateOverallConfidence;
    /**
     * Store reasoning history
     */
    private storeReasoningHistory;
    /**
     * Create default situation
     */
    private createDefaultSituation;
    /**
     * Create default group dynamics
     */
    private createDefaultGroupDynamics;
    /**
     * Create default cultural context
     */
    private createDefaultCulturalContext;
    /**
     * Get reasoning history for an agent
     */
    getReasoningHistory(agentId: string): SocialReasoningOutput[];
    /**
     * Get configuration
     */
    getConfig(): SocialReasoningConfig;
    /**
     * Update configuration
     */
    updateConfig(newConfig: Partial<SocialReasoningConfig>): void;
    /**
     * Reset all reasoning state
     */
    reset(): void;
}
/**
 * Social Reasoning Engine Factory
 */
export declare class SocialReasoningEngineFactory {
    /**
     * Create default social reasoning engine
     */
    static createDefault(): SocialReasoningEngine;
    /**
     * Create high-performance social reasoning engine
     */
    static createHighPerformance(): SocialReasoningEngine;
    /**
     * Create detailed social reasoning engine
     */
    static createDetailed(): SocialReasoningEngine;
}
//# sourceMappingURL=social_reasoning.d.ts.map