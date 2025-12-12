/**
 * Emotional Intelligence System
 *
 * This component implements sophisticated emotion recognition, empathy simulation,
 * and emotional state prediction for social reasoning. It includes emotion recognition
 * from behavioral cues, empathy modeling, and emotional contagion simulation.
 */
import { EmotionalState, Emotion, EmotionalResponse, MoodState, EmotionalIntelligence as EmotionalIntelligenceMetrics } from './tom_types.js';
import { PersonalityTraits } from '../langgraph/interfaces.js';
import { AgentRelationship } from './relationship_types.js';
/**
 * Behavioral cue for emotion recognition
 */
export interface BehavioralCue {
    type: string;
    intensity: number;
    timestamp: number;
    context: any;
}
/**
 * Emotion recognition context
 */
export interface EmotionRecognitionContext {
    agentId: string;
    behavioralCues: BehavioralCue[];
    recentActions: any[];
    environment: any;
    socialContext: any;
    personality?: PersonalityTraits;
    relationship?: AgentRelationship;
    timestamp: number;
}
/**
 * Empathy simulation context
 */
export interface EmpathySimulationContext {
    observerId: string;
    targetId: string;
    targetEmotions: Map<Emotion, number>;
    situation: string;
    relationship?: AgentRelationship;
    observerPersonality?: PersonalityTraits;
    targetPersonality?: PersonalityTraits;
    timestamp: number;
}
/**
 * Emotional intelligence configuration
 */
export interface EmotionalIntelligenceConfig {
    enableEmotionRecognition: boolean;
    enableEmpathySimulation: boolean;
    enableEmotionalContagion: boolean;
    enableMoodModeling: boolean;
    emotionDecayRate: number;
    moodInfluenceFactor: number;
    empathyThreshold: number;
    contagionThreshold: number;
    updateFrequency: number;
    historyRetentionPeriod: number;
}
/**
 * Emotional cue patterns for recognition
 */
export interface EmotionCuePattern {
    emotion: Emotion;
    cues: Array<{
        type: string;
        weight: number;
        threshold: number;
    }>;
    contextFactors: string[];
    personalityCorrelation?: Partial<PersonalityTraits>;
    confidenceThreshold: number;
}
/**
 * Main emotional intelligence class
 */
export declare class EmotionalIntelligence {
    private config;
    private emotionPatterns;
    private emotionalHistory;
    private empathyHistory;
    private moodStates;
    private metrics;
    private lastUpdateTime;
    constructor(config: EmotionalIntelligenceConfig);
    /**
     * Initialize emotional intelligence metrics
     */
    private initializeMetrics;
    /**
     * Initialize emotion recognition patterns
     */
    private initializeEmotionPatterns;
    /**
     * Recognize emotions from behavioral cues
     */
    recognizeEmotions(context: EmotionRecognitionContext): Map<Emotion, number>;
    /**
     * Calculate emotion score based on pattern matching
     */
    private calculateEmotionScore;
    /**
     * Extract context factors from context
     */
    private extractContextFactors;
    /**
     * Calculate personality correlation score
     */
    private calculatePersonalityCorrelation;
    /**
     * Apply mood influence to recognized emotions
     */
    private applyMoodInfluence;
    /**
     * Apply personality influence to emotions
     */
    private applyPersonalityInfluence;
    /**
     * Store emotional state in history
     */
    private storeEmotionalState;
    /**
     * Get or create mood state for agent
     */
    private getMoodState;
    /**
     * Update mood state based on emotions
     */
    updateMoodState(agentId: string, emotions: Map<Emotion, number>): void;
    /**
     * Calculate emotional consistency between two emotion states
     */
    private calculateEmotionalConsistency;
    /**
     * Simulate empathy for another agent's emotions
     */
    simulateEmpathy(context: EmpathySimulationContext): number;
    /**
     * Calculate situation-based empathy
     */
    private calculateSituationEmpathy;
    /**
     * Store empathy history
     */
    private storeEmpathyHistory;
    /**
     * Predict emotional response to situation
     */
    predictEmotionalResponse(agentId: string, situation: string, context: any): EmotionalResponse | null;
    /**
     * Simulate emotional contagion between agents
     */
    simulateEmotionalContagion(sourceId: string, targetId: string, sourceEmotions: Map<Emotion, number>, context: any): Map<Emotion, number>;
    /**
     * Update recognition metrics
     */
    private updateRecognitionMetrics;
    /**
     * Update empathy metrics
     */
    private updateEmpathyMetrics;
    /**
     * Update overall metrics
     */
    private updateOverallMetrics;
    /**
     * Get emotional history for an agent
     */
    getEmotionalHistory(agentId: string): EmotionalState[];
    /**
     * Get mood state for an agent
     */
    getPublicMoodState(agentId: string): MoodState;
    /**
     * Get empathy level between agents
     */
    getEmpathyLevel(observerId: string, targetId: string): number;
    /**
     * Get current metrics
     */
    getMetrics(): EmotionalIntelligenceMetrics;
    /**
     * Clear history for an agent
     */
    clearHistory(agentId: string): void;
    /**
     * Reset all emotional intelligence state
     */
    reset(): void;
    /**
     * Get configuration
     */
    getConfig(): EmotionalIntelligenceConfig;
    /**
     * Update configuration
     */
    updateConfig(newConfig: Partial<EmotionalIntelligenceConfig>): void;
}
/**
 * Emotional Intelligence Factory
 */
export declare class EmotionalIntelligenceFactory {
    /**
     * Create default emotional intelligence system
     */
    static createDefault(): EmotionalIntelligence;
    /**
     * Create high-performance emotional intelligence system
     */
    static createHighPerformance(): EmotionalIntelligence;
    /**
     * Create detailed emotional intelligence system
     */
    static createDetailed(): EmotionalIntelligence;
}
//# sourceMappingURL=emotional_intelligence.d.ts.map