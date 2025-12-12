/**
 * Social System Integration
 *
 * Integration layer for connecting the social relationship system
 * with existing cognitive components (PurposeCore, MemorySystem, etc.)
 * Following established patterns from cognitive components
 */
import { RelationshipManager } from './relationship_manager.js';
import { PurposeCore } from '../cognitive/purpose_core.js';
import { MemorySystem } from '../memory/memory_system.js';
import { LearningEngine } from '../cognitive/learning_engine.js';
import { RelationshipUpdateRequest, SocialDecisionFactors } from './relationship_types.js';
/**
 * Social System Integration Manager
 *
 * Coordinates social relationship processing with cognitive components
 */
export declare class SocialSystemIntegration {
    private relationshipManager;
    private purposeCore;
    private memorySystem;
    private learningEngine;
    private agentId;
    private isInitialized;
    private lastUpdateTime;
    private updateCount;
    private averageUpdateTime;
    constructor(agentId: string);
    /**
     * Initialize integration with cognitive components
     */
    initialize(purposeCore?: PurposeCore, memorySystem?: MemorySystem, learningEngine?: LearningEngine): Promise<void>;
    /**
     * Process social interaction with full cognitive integration
     */
    processSocialInteraction(request: RelationshipUpdateRequest): Promise<void>;
    /**
     * Get social decision factors for cognitive processing
     */
    getSocialDecisionFactors(targetAgentId?: string): Promise<SocialDecisionFactors>;
    /**
     * Get relationship manager for direct access
     */
    getRelationshipManager(): RelationshipManager;
    /**
     * Check if social system is initialized
     */
    isReady(): boolean;
    /**
     * Get performance metrics
     */
    getPerformanceMetrics(): {
        updateCount: number;
        averageUpdateTime: number;
        lastUpdateTime: number;
        isInitialized: boolean;
        relationshipMetrics: {
            totalRelationships: number;
            memoryUsage: number;
            averageUpdateTime: number;
            cacheHitRate: number;
            networkAnalysisTime: number;
        };
    };
    /**
     * Export social system data for persistence
     */
    exportData(): Promise<any>;
    /**
     * Import social system data from persistence
     */
    importData(data: any): Promise<void>;
    /**
     * Enhance interaction context with cognitive data
     */
    private enhanceInteractionContext;
    /**
     * Update memory systems with social interaction
     */
    private updateMemoryWithSocialInteraction;
    /**
     * Process learning from social interaction
     */
    private processSocialLearning;
    /**
     * Load relationship data from memory system
     */
    private loadRelationshipDataFromMemory;
    /**
     * Update performance metrics
     */
    private updatePerformanceMetrics;
    /**
     * Get default social factors when system is not initialized
     */
    private getDefaultSocialFactors;
    /**
     * Cleanup resources
     */
    cleanup(): void;
}
//# sourceMappingURL=social_integration.d.ts.map