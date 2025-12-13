/**
 * Purpose Core System
 *
 * Main integration point for personality, motivations, values, and ethics.
 * Provides purpose-driven decision making while respecting reactive interrupts.
 */
import { ActionOption, DecisionContext, UtilityBreakdown } from './decision_maker.js';
import { SocialState } from '../langgraph/interfaces.js';
export interface PurposeCoreState {
    personality: any;
    motivations: any;
    values: any;
    ethics: any;
    lastUpdate: number;
    activeGoals: string[];
    decisionHistory: Array<{
        action: string;
        utility: number;
        timestamp: number;
        outcome?: 'success' | 'failure' | 'partial';
    }>;
}
export interface PurposeCoreConfig {
    initialPersonality?: Partial<any>;
    initialMotivations?: Partial<any>;
    initialValues?: Partial<any>;
    initialEthics?: Partial<any>;
    learningRate?: number;
    adaptationSpeed?: number;
    decisionTimeLimit?: number;
}
export interface CognitiveInput {
    situation: string;
    availableActions: ActionOption[];
    context: DecisionContext;
    timeConstraints: number;
    interruptLevel: 'none' | 'low' | 'medium' | 'high' | 'emergency';
}
export interface CognitiveOutput {
    selectedAction: ActionOption | null;
    utility: UtilityBreakdown;
    reasoning: string;
    confidence: number;
    processingTime: number;
    yieldedToReactive: boolean;
}
export declare class PurposeCore {
    private personality;
    private motivations;
    private values;
    private ethics;
    private decisionMaker;
    private state;
    private config;
    private socialState?;
    constructor(config?: PurposeCoreConfig);
    /**
     * Initialize all cognitive components
     */
    private initializeComponents;
    /**
     * Create initial state
     */
    private createInitialState;
    /**
     * Main cognitive processing cycle
     */
    processCognitive(input: CognitiveInput): Promise<CognitiveOutput>;
    /**
     * Check if cognitive processing should yield to reactive system
     */
    private shouldYieldToReactive;
    /**
     * Update internal cognitive state
     */
    private updateInternalState;
    /**
     * Generate goals based on current motivations and values
     */
    private generateGoals;
    /**
     * Calculate confidence in decision
     */
    private calculateDecisionConfidence;
    /**
     * Calculate variance of values
     */
    private calculateVariance;
    /**
     * Record decision for learning
     */
    private recordDecision;
    /**
     * Process outcome for learning and adaptation
     */
    processOutcome(action: ActionOption, outcome: 'success' | 'failure' | 'partial', context: DecisionContext): void;
    /**
     * Adapt cognitive systems based on experience
     */
    private adaptFromExperience;
    /**
     * Reinforce successful behavioral patterns
     */
    private reinforceSuccessfulPatterns;
    /**
     * Adjust for failed behavioral patterns
     */
    private adjustForFailedPatterns;
    /**
     * Get primary motivation for action type
     */
    private getPrimaryMotivationForAction;
    /**
     * Get values affected by action
     */
    private getValuesForAction;
    /**
     * Get current purpose core state
     */
    getState(): PurposeCoreState;
    /**
     * Get current active goals
     */
    getActiveGoals(): string[];
    /**
     * Get decision history
     */
    getDecisionHistory(): Array<{
        action: string;
        utility: number;
        timestamp: number;
        outcome?: 'success' | 'failure' | 'partial';
    }>;
    /**
     * Check if purpose core is ready for decision making
     */
    isReady(): boolean;
    /**
     * Reset purpose core to initial state
     */
    reset(): void;
    /**
     * Create purpose core from legacy profile
     */
    static fromLegacyProfile(legacyProfile: any): PurposeCore;
    /**
     * Set social state for social-aware decision making
     */
    setSocialState(socialState: SocialState): void;
    /**
     * Calculate social influence on decision making
     */
    private calculateSocialInfluence;
    /**
     * Calculate social learning influence
     */
    private calculateSocialLearningInfluence;
    /**
     * Update personality based on social feedback
     */
    updateFromSocialFeedback(feedback: {
        trustChanges: Record<string, number>;
        reputationChanges: Record<string, number>;
        socialNormViolations: string[];
        groupConformity: number;
    }): void;
    /**
     * Generate socially-aware goals
     */
    generateSocialGoals(): string[];
    /**
     * Generate social relationship goals
     */
    private generateSocialRelationshipGoals;
    /**
     * Export to legacy profile format
     */
    toLegacyProfile(): any;
}
//# sourceMappingURL=purpose_core.d.ts.map