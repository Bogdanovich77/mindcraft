/**
 * Mental Model System
 *
 * This component manages mental state representations for other agents,
 * including beliefs, intentions, emotions, knowledge, and perspective-taking.
 * It provides the foundation for theory of mind reasoning.
 */
import { MentalState, TheoryOfMindConfig, TheoryOfMindMetrics } from './tom_types.js';
import { PersonalityTraits } from '../langgraph/interfaces.js';
/**
 * Mental Model Manager
 *
 * Main class for managing mental states of other agents
 */
export declare class MentalModelManager {
    private mentalStates;
    private config;
    private metrics;
    private lastUpdateTime;
    private updateCount;
    constructor(config: TheoryOfMindConfig);
    /**
     * Initialize metrics tracking
     */
    private initializeMetrics;
    /**
     * Get or create mental state for an agent
     */
    getMentalState(agentId: string): MentalState;
    /**
     * Create a new mental state for an agent
     */
    private createMentalState;
    /**
     * Create initial belief system
     */
    private createBeliefSystem;
    /**
     * Create initial intention state
     */
    private createIntentionState;
    /**
     * Create initial emotional state
     */
    private createEmotionalState;
    /**
     * Create initial knowledge state
     */
    private createKnowledgeState;
    /**
     * Create initial perspective state
     */
    private createPerspectiveState;
    /**
     * Update mental state based on observation
     */
    updateFromObservation(agentId: string, observation: any, context: any, personality?: PersonalityTraits): void;
    /**
     * Update beliefs from observation
     */
    private updateBeliefsFromObservation;
    /**
     * Infer social belief type from behavior
     */
    private inferSocialBeliefType;
    /**
     * Update intentions from observation
     */
    private updateIntentionsFromObservation;
    /**
     * Infer intention from observed action
     */
    private inferIntentionFromAction;
    /**
     * Estimate action duration
     */
    private estimateActionDuration;
    /**
     * Update emotions from observation
     */
    private updateEmotionsFromObservation;
    /**
     * Infer emotion from behavioral cue
     */
    private inferEmotionFromCue;
    /**
     * Update knowledge from observation
     */
    private updateKnowledgeFromObservation;
    /**
     * Update perspective from context
     */
    private updatePerspectiveFromContext;
    /**
     * Update confidence based on personality
     */
    private updateConfidenceFromPersonality;
    /**
     * Check belief consistency
     */
    private checkBeliefConsistency;
    /**
     * Detect conflict between two beliefs
     */
    private detectBeliefConflict;
    /**
     * Update performance metrics
     */
    private updatePerformanceMetrics;
    /**
     * Update overall metrics
     */
    private updateMetrics;
    /**
     * Get mental state for an agent
     */
    getMentalStateSnapshot(agentId: string): MentalState | null;
    /**
     * Get all mental states
     */
    getAllMentalStates(): Map<string, MentalState>;
    /**
     * Remove mental state for an agent
     */
    removeMentalState(agentId: string): boolean;
    /**
     * Clear old mental states based on retention policy
     */
    cleanupOldStates(): number;
    /**
     * Get current metrics
     */
    getMetrics(): TheoryOfMindMetrics;
    /**
     * Predict agent's mental state at future time
     */
    predictMentalState(agentId: string, timeHorizon: number): MentalState | null;
    /**
     * Compare predicted mental state with actual
     */
    validatePrediction(agentId: string, predictedState: MentalState, actualState: MentalState): number;
    /**
     * Reset all mental states
     */
    reset(): void;
    /**
     * Get configuration
     */
    getConfig(): TheoryOfMindConfig;
    /**
     * Update configuration
     */
    updateConfig(newConfig: Partial<TheoryOfMindConfig>): void;
}
/**
 * Mental Model Factory
 *
 * Factory for creating mental model managers with different configurations
 */
export declare class MentalModelFactory {
    /**
     * Create mental model manager with default configuration
     */
    static createDefault(): MentalModelManager;
    /**
     * Create mental model manager for high-performance scenarios
     */
    static createHighPerformance(): MentalModelManager;
    /**
     * Create mental model manager for detailed social reasoning
     */
    static createDetailed(): MentalModelManager;
}
//# sourceMappingURL=mental_model.d.ts.map