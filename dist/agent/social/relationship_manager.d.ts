/**
 * Relationship Manager
 *
 * Main relationship management system that integrates trust, reputation,
 * and social network components with existing cognitive systems
 * Following the established patterns from cognitive components
 */
import { RelationshipNetwork, AgentRelationship, RelationshipUpdateRequest, RelationshipQuery, RelationshipSearchResult, RelationshipManagerConfig, RelationshipStatus } from './relationship_types.js';
/**
 * Main relationship management system
 */
export declare class RelationshipManager {
    private config;
    private agentId;
    private relationshipNetwork;
    private trustCalculator;
    private reputationSystem;
    private networkManager;
    private personalityCache;
    constructor(agentId: string, config?: Partial<RelationshipManagerConfig>);
    /**
     * Process relationship update from interaction
     */
    processRelationshipUpdate(request: RelationshipUpdateRequest): void;
    /**
     * Get relationship with specific agent
     */
    getRelationship(targetAgentId: string): AgentRelationship | null;
    /**
     * Search relationships based on criteria
     */
    searchRelationships(query: RelationshipQuery): RelationshipSearchResult;
    /**
     * Get all relationships
     */
    getAllRelationships(): AgentRelationship[];
    /**
     * Get relationship summary statistics
     */
    getRelationshipSummary(): {
        totalRelationships: number;
        activeRelationships: number;
        averageTrustLevel: number;
        averageFriendshipLevel: number;
        statusDistribution: Record<RelationshipStatus, number>;
        topRelationships: Array<{
            agentId: string;
            score: number;
            status: RelationshipStatus;
        }>;
    };
    /**
     * Predict relationship evolution
     */
    predictRelationshipEvolution(targetAgentId: string, timeframe?: number): {
        currentStatus: RelationshipStatus;
        predictedStatus: RelationshipStatus;
        trustTrajectory: number;
        friendshipTrajectory: number;
        confidence: number;
        riskFactors: string[];
    } | null;
    /**
     * Get social network analysis
     */
    getSocialNetworkAnalysis(): {
        networkSummary: any;
        personalNetworkMetrics: any;
        clusterAnalysis: any;
        influencePropagation: any;
    };
    /**
     * Apply time-based decay to all relationships
     */
    applyTimeDecay(): void;
    /**
     * Remove old relationship data
     */
    cleanupOldData(): void;
    /**
     * Get system performance metrics
     */
    getPerformanceMetrics(): {
        totalRelationships: number;
        memoryUsage: number;
        averageUpdateTime: number;
        cacheHitRate: number;
        networkAnalysisTime: number;
    };
    /**
     * Export relationship data for persistence
     */
    exportData(): {
        agentId: string;
        relationshipNetwork: RelationshipNetwork;
        config: RelationshipManagerConfig;
        exportTimestamp: number;
    };
    /**
     * Import relationship data from persistence
     */
    importData(data: {
        relationshipNetwork: RelationshipNetwork;
        config?: RelationshipManagerConfig;
    }): void;
    /**
     * Create empty relationship network
     */
    private createEmptyNetwork;
    /**
     * Create new relationship with target agent
     */
    private createNewRelationship;
    /**
     * Convert LangGraph PersonalityTraits to Cognitive PersonalityTraits
     */
    private convertToCognitivePersonality;
    /**
     * Get agent personality (LangGraph version)
     */
    private getAgentPersonalityLangGraph;
    /**
     * Get agent personality (Cognitive version with caching)
     */
    private getAgentPersonality;
    /**
     * Update friendship metrics based on interaction
     */
    private updateFriendshipMetrics;
    /**
     * Update respect metrics based on interaction
     */
    private updateRespectMetrics;
    /**
     * Update rivalry metrics based on interaction
     */
    private updateRivalryMetrics;
    /**
     * Update collaboration metrics based on interaction
     */
    private updateCollaborationMetrics;
    /**
     * Update communication metrics based on interaction
     */
    private updateCommunicationMetrics;
    /**
     * Calculate relationship status based on metrics
     */
    private calculateRelationshipStatus;
    /**
     * Calculate relationship trends
     */
    private calculateRelationshipTrends;
    /**
     * Create empty trends object
     */
    private createEmptyTrends;
    /**
     * Calculate trend from array of values
     */
    private calculateTrend;
    /**
     * Map numerical trend to direction
     */
    private mapTrendToDirection;
    /**
     * Create prediction outcome
     */
    private createPredictionOutcome;
    /**
     * Limit history size for performance
     */
    private limitHistorySize;
    /**
     * Update social network with relationship data
     */
    private updateSocialNetwork;
    /**
     * Map relationship status to edge type
     */
    private mapStatusToEdgeType;
    /**
     * Extract skill demonstration from interaction
     */
    private extractSkillDemonstration;
    /**
     * Calculate friendship trend
     */
    private calculateFriendshipTrend;
    /**
     * Identify risk factors for relationship
     */
    private identifyRiskFactors;
    /**
     * Calculate personal network metrics
     */
    private calculatePersonalNetworkMetrics;
    /**
     * Calculate network reach
     */
    private calculateNetworkReach;
    /**
     * Calculate personal clustering coefficient
     */
    private calculatePersonalClustering;
    /**
     * Check if two agents are connected
     */
    private areAgentsConnected;
    /**
     * Calculate personal betweenness centrality
     */
    private calculatePersonalBetweenness;
    /**
     * Calculate influence propagation
     */
    private calculateInfluencePropagation;
    /**
     * Apply friendship decay
     */
    private applyFriendshipDecay;
    /**
     * Calculate memory usage
     */
    private calculateMemoryUsage;
    /**
     * Start periodic updates
     */
    private startPeriodicUpdates;
    /**
     * Get configuration
     */
    getConfig(): RelationshipManagerConfig;
    /**
     * Update configuration
     */
    updateConfig(newConfig: Partial<RelationshipManagerConfig>): void;
    /**
     * Clear all caches
     */
    clearCaches(): void;
}
//# sourceMappingURL=relationship_manager.d.ts.map