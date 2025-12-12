/**
 * Theory of Mind Engine
 *
 * This is the main orchestrator for the theory of mind system, integrating
 * all components to provide comprehensive social cognition capabilities.
 * It coordinates mental modeling, intention prediction, emotional intelligence,
 * and social reasoning to enable agents to understand and predict other agents'
 * mental states and behaviors.
 */
import { MentalState, TheoryOfMindConfig, TheoryOfMindMetrics } from './tom_types.js';
import { PersonalityTraits } from '../langgraph/interfaces.js';
import { AgentRelationship } from './relationship_types.js';
/**
 * Main Theory of Mind Engine
 *
 * Coordinates all theory of mind components and provides the primary
 * interface for mental state modeling and social cognition.
 */
export declare class TheoryOfMindEngine {
    private config;
    private mentalModelManager;
    private intentionPredictor;
    private emotionalIntelligence;
    private socialReasoning;
    private metrics;
    private isInitialized;
    private currentPersonality;
    constructor(config?: Partial<TheoryOfMindConfig>);
    /**
     * Initialize the theory of mind engine
     */
    initialize(personality: PersonalityTraits): Promise<void>;
    /**
     * Process an observation about another agent
     */
    processObservation(targetAgentId: string, observation: any, context: any, observerPersonality: PersonalityTraits): Promise<MentalState | null>;
    /**
     * Get current mental state for an agent
     */
    getMentalState(agentId: string): MentalState | null;
    /**
     * Predict agent's behavior in a given context
     */
    predictBehavior(agentId: string, context: any, timeHorizon?: number): Promise<any>;
    /**
     * Update theory of mind with new relationship information
     */
    updateRelationship(agentId: string, relationship: AgentRelationship, context: any): Promise<void>;
    /**
     * Perform perspective-taking for another agent
     */
    takePerspective(agentId: string, situation: any, perspectiveTime?: number): Promise<any>;
    /**
     * Detect potential deception or false beliefs
     */
    detectDeception(agentId: string, communication: any, context: any): Promise<any>;
    /**
     * Get current theory of mind metrics
     */
    getMetrics(): TheoryOfMindMetrics;
    /**
     * Reset the theory of mind engine
     */
    reset(): Promise<void>;
    /**
     * Cleanup resources
     */
    cleanup(): Promise<void>;
    /**
     * Create default configuration
     */
    private createDefaultConfig;
    /**
     * Initialize metrics
     */
    private initializeMetrics;
    /**
     * Integrate mental state from all components
     */
    private integrateMentalState;
    /**
     * Calculate overall confidence from multiple sources
     */
    private calculateOverallConfidence;
    /**
     * Calculate deception probability
     */
    private calculateDeceptionProbability;
    /**
     * Update performance metrics
     */
    private updateMetrics;
}
/**
 * Factory for creating theory of mind engines
 */
export declare class TheoryOfMindFactory {
    /**
     * Create a theory of mind engine with default configuration
     */
    static createDefault(): TheoryOfMindEngine;
    /**
     * Create a theory of mind engine with custom configuration
     */
    static createCustom(config: Partial<TheoryOfMindConfig>): TheoryOfMindEngine;
    /**
     * Create a theory of mind engine optimized for performance
     */
    static createPerformanceOptimized(): TheoryOfMindEngine;
    /**
     * Create a theory of mind engine for high accuracy
     */
    static createHighAccuracy(): TheoryOfMindEngine;
}
//# sourceMappingURL=theory_of_mind.d.ts.map