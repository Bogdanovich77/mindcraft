/**
 * Intention Predictor System
 *
 * This component implements sophisticated intention prediction algorithms
 * that analyze observed behavior patterns to infer goals and plans.
 * It includes goal inference, plan recognition, and temporal intention tracking.
 */
import { Intention, IntentionType, PredictedIntention, IntentionConfidence, IntentionChange } from './tom_types.js';
import { PersonalityTraits } from '../langgraph/interfaces.js';
import { AgentRelationship } from './relationship_types.js';
/**
 * Intention prediction context
 */
export interface IntentionPredictionContext {
    agentId: string;
    currentActions: any[];
    recentHistory: any[];
    environment: any;
    socialContext: any;
    personality?: PersonalityTraits;
    relationship?: AgentRelationship;
    timestamp: number;
}
/**
 * Intention pattern for recognition
 */
export interface IntentionPattern {
    id: string;
    name: string;
    intentionType: IntentionType;
    actionSequence: string[];
    contextRequirements: string[];
    confidenceThreshold: number;
    timeWindow: number;
    personalityCorrelation?: Partial<PersonalityTraits>;
}
/**
 * Intention predictor configuration
 */
export interface IntentionPredictorConfig {
    maxPredictionHorizon: number;
    minConfidenceThreshold: number;
    enablePlanRecognition: boolean;
    enableTemporalTracking: boolean;
    enablePersonalityInference: boolean;
    maxPatterns: number;
    updateFrequency: number;
    historyRetentionPeriod: number;
}
/**
 * Main intention predictor class
 */
export declare class IntentionPredictor {
    private patterns;
    private config;
    private predictionHistory;
    private confidenceMetrics;
    private lastUpdateTime;
    constructor(config: IntentionPredictorConfig);
    /**
     * Initialize confidence metrics
     */
    private initializeConfidenceMetrics;
    /**
     * Initialize intention patterns
     */
    private initializePatterns;
    /**
     * Add an intention pattern
     */
    addPattern(pattern: IntentionPattern): void;
    /**
     * Predict intentions based on current context
     */
    predictIntentions(context: IntentionPredictionContext): PredictedIntention[];
    /**
     * Match action patterns against known intention patterns
     */
    private matchPatterns;
    /**
     * Match a specific pattern against actions
     */
    private matchPattern;
    /**
     * Calculate sequence match score
     */
    private calculateSequenceMatch;
    /**
     * Calculate context match score
     */
    private calculateContextMatch;
    /**
     * Check if context has a specific requirement
     */
    private contextHasRequirement;
    /**
     * Calculate personality match score
     */
    private calculatePersonalityMatch;
    /**
     * Create prediction from pattern match
     */
    private createPredictionFromPattern;
    /**
     * Infer required resources for intention type
     */
    private inferRequiredResources;
    /**
     * Calculate intention probability based on context
     */
    private calculateIntentionProbability;
    /**
     * Calculate intention priority
     */
    private calculateIntentionPriority;
    /**
     * Generate alternative intentions
     */
    private generateAlternativeIntentions;
    /**
     * Get similar intention types
     */
    private getSimilarIntentionTypes;
    /**
     * Find pattern by intention type
     */
    private findPatternByType;
    /**
     * Infer goals from context without pattern matching
     */
    private inferGoalsFromContext;
    /**
     * Create health-related intention
     */
    private createHealthIntention;
    /**
     * Create hunger-related intention
     */
    private createHungerIntention;
    /**
     * Create storage-related intention
     */
    private createStorageIntention;
    /**
     * Create social interaction intention
     */
    private createSocialIntention;
    /**
     * Generate temporal predictions
     */
    private generateTemporalPredictions;
    /**
     * Create continuation prediction from recent prediction
     */
    private createContinuationPrediction;
    /**
     * Store prediction history
     */
    private storePredictionHistory;
    /**
     * Update confidence metrics
     */
    private updateConfidenceMetrics;
    /**
     * Validate prediction against actual outcome
     */
    validatePrediction(agentId: string, predictionId: string, actualIntention: Intention): number;
    /**
     * Detect intention changes
     */
    detectIntentionChanges(agentId: string, currentPredictions: PredictedIntention[], previousPredictions: PredictedIntention[]): IntentionChange[];
    /**
     * Get prediction history for an agent
     */
    getPredictionHistory(agentId: string): PredictedIntention[];
    /**
     * Get confidence metrics
     */
    getConfidenceMetrics(): IntentionConfidence;
    /**
     * Get all patterns
     */
    getPatterns(): Map<string, IntentionPattern>;
    /**
     * Clear prediction history for an agent
     */
    clearHistory(agentId: string): void;
    /**
     * Reset all predictor state
     */
    reset(): void;
    /**
     * Get configuration
     */
    getConfig(): IntentionPredictorConfig;
    /**
     * Update configuration
     */
    updateConfig(newConfig: Partial<IntentionPredictorConfig>): void;
}
/**
 * Intention Predictor Factory
 */
export declare class IntentionPredictorFactory {
    /**
     * Create default intention predictor
     */
    static createDefault(): IntentionPredictor;
    /**
     * Create high-performance intention predictor
     */
    static createHighPerformance(): IntentionPredictor;
    /**
     * Create detailed intention predictor
     */
    static createDetailed(): IntentionPredictor;
}
//# sourceMappingURL=intention_predictor.d.ts.map