/**
 * Theory of Mind Integration Layer
 *
 * This integration layer connects the theory of mind system with existing
 * cognitive components including the PurposeCore, Memory systems, Learning Engine,
 * and LangGraph state management. It provides seamless integration and data flow
 * between all components.
 */
import { TheoryOfMindEngine } from './theory_of_mind.js';
import { MentalState } from './tom_types.js';
import { PersonalityTraits } from '../langgraph/interfaces.js';
import { PurposeCore } from '../cognitive/purpose_core.js';
import { GoalSystem } from '../cognitive/goal_system.js';
import { SkillsSystem } from '../cognitive/skills_system.js';
import { LearningEngine } from '../cognitive/learning_engine.js';
import { MemorySystem } from '../memory/memory_system.js';
import { AgentRelationship } from './relationship_types.js';
/**
 * Integration configuration for theory of mind system
 */
export interface TomIntegrationConfig {
    enablePurposeCoreIntegration: boolean;
    enableGoalSystemIntegration: boolean;
    enableSkillsSystemIntegration: boolean;
    enableLearningEngineIntegration: boolean;
    enableMemorySystemIntegration: boolean;
    enableLangGraphIntegration: boolean;
    updateFrequency: number;
    confidenceThreshold: number;
    enableBidirectionalLearning: boolean;
}
/**
 * Theory of Mind integration manager
 */
export declare class TomIntegrationManager {
    private config;
    private theoryOfMindEngine;
    private purposeCore;
    private goalSystem;
    private skillsSystem;
    private learningEngine;
    private memorySystem;
    private isInitialized;
    private integrationMetrics;
    constructor(theoryOfMindEngine: TheoryOfMindEngine, config?: Partial<TomIntegrationConfig>);
    /**
     * Initialize integration with cognitive components
     */
    initialize(personality: PersonalityTraits, components: {
        purposeCore?: PurposeCore;
        goalSystem?: GoalSystem;
        skillsSystem?: SkillsSystem;
        learningEngine?: LearningEngine;
        memorySystem?: MemorySystem;
    }): Promise<void>;
    /**
     * Process observation with full cognitive integration
     */
    processIntegratedObservation(targetAgentId: string, observation: any, context: any, observerPersonality: PersonalityTraits): Promise<IntegratedObservationResult>;
    /**
     * Predict behavior with cognitive integration
     */
    predictIntegratedBehavior(targetAgentId: string, context: any, timeHorizon?: number): Promise<IntegratedBehaviorPrediction>;
    /**
     * Update relationship with cognitive integration
     */
    updateIntegratedRelationship(targetAgentId: string, relationship: AgentRelationship, context: any): Promise<void>;
    /**
     * Get integration metrics
     */
    getIntegrationMetrics(): TomIntegrationMetrics;
    /**
     * Reset integration state
     */
    reset(): Promise<void>;
    /**
     * Cleanup integration resources
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
     * Setup bidirectional learning
     */
    private setupBidirectionalLearning;
    /**
     * Integrate with PurposeCore
     */
    private integrateWithPurposeCore;
    /**
     * Integrate with Goal System
     */
    private integrateWithGoalSystem;
    /**
     * Integrate with Skills System
     */
    private integrateWithSkillsSystem;
    /**
     * Integrate with Learning Engine
     */
    private integrateWithLearningEngine;
    /**
     * Integrate with Memory System
     */
    private integrateWithMemorySystem;
    /**
     * Enhance prediction with cognitive components
     */
    private enhancePredictionWithCognition;
    /**
     * Helper methods for integration calculations
     */
    private calculateOverallConfidence;
    private calculatePersonalityAlignment;
    private analyzeMotivations;
    private assessValueConsistency;
    private evaluateEthicalStance;
    private calculatePurposeConfidence;
    private generatePurposeInsights;
    private assessGoalCompatibility;
    private suggestPlanningAdjustments;
    private estimateResourceRequirements;
    private calculateGoalSuccessProbability;
    private calculateGoalConfidence;
    private generateGoalRecommendations;
    private identifySkillRequirements;
    private assessSkillCapabilities;
    private identifyLearningOpportunities;
    private analyzeSkillSynergies;
    private calculateSkillsConfidence;
    private generateSkillSuggestions;
    private generateAdaptationSuggestions;
    private calculateMemoryConfidence;
    private generateMemoryInsights;
    private getPurposeCoreAdjustments;
    private getGoalSystemAdjustments;
    private getSkillsSystemAdjustments;
    private getLearningAdjustments;
    private getMemoryAdjustments;
    private updatePurposeCoreRelationship;
    private updateGoalSystemRelationship;
    private updateSkillsSystemRelationship;
    private updateMemorySystemRelationship;
    /**
     * Update integration metrics
     */
    private updateIntegrationMetrics;
}
/**
 * Type definitions for integration results
 */
export interface TomIntegrationMetrics {
    totalIntegrations: number;
    successfulIntegrations: number;
    averageIntegrationTime: number;
    peakIntegrationTime: number;
    componentUsage: {
        purposeCore: number;
        goalSystem: number;
        skillsSystem: number;
        learningEngine: number;
        memorySystem: number;
    };
    learningEvents: number;
    confidenceImprovements: number;
}
export interface IntegratedObservationResult {
    targetAgentId: string;
    mentalState: MentalState;
    purposeCoreInsights: PurposeCoreIntegrationResult | null;
    goalSystemInsights: GoalSystemIntegrationResult | null;
    skillsSystemInsights: SkillsSystemIntegrationResult | null;
    learningInsights: LearningEngineIntegrationResult | null;
    memoryInsights: MemorySystemIntegrationResult | null;
    overallConfidence: number;
    processingTime: number;
    timestamp: number;
}
export interface PurposeCoreIntegrationResult {
    purposeAnalysis: any;
    confidence: number;
    insights: string[];
}
export interface GoalSystemIntegrationResult {
    goalAnalysis: any;
    confidence: number;
    recommendations: string[];
}
export interface SkillsSystemIntegrationResult {
    skillsAnalysis: any;
    confidence: number;
    developmentSuggestions: string[];
}
export interface LearningEngineIntegrationResult {
    learningOutcome: any;
    confidence: number;
    adaptationSuggestions: string[];
}
export interface MemorySystemIntegrationResult {
    storageResult: any;
    retrievedMemories: any[];
    confidence: number;
    memoryInsights: string[];
}
export interface IntegratedBehaviorPrediction {
    targetAgentId: string;
    timeHorizon: number;
    basePrediction: any;
    cognitiveEnhancements: CognitiveEnhancements;
    integratedConfidence: number;
    timestamp: number;
}
export interface CognitiveEnhancements {
    purposeCoreAdjustments: any;
    goalSystemAdjustments: any;
    skillsSystemAdjustments: any;
    learningAdjustments: any;
    memoryAdjustments: any;
    overallConfidence: number;
}
/**
 * Factory for creating integration managers
 */
export declare class TomIntegrationFactory {
    /**
     * Create integration manager with default configuration
     */
    static createDefault(theoryOfMindEngine: TheoryOfMindEngine): TomIntegrationManager;
    /**
     * Create integration manager with custom configuration
     */
    static createCustom(theoryOfMindEngine: TheoryOfMindEngine, config: Partial<TomIntegrationConfig>): TomIntegrationManager;
    /**
     * Create integration manager optimized for performance
     */
    static createPerformanceOptimized(theoryOfMindEngine: TheoryOfMindEngine): TomIntegrationManager;
}
//# sourceMappingURL=tom_integration.d.ts.map