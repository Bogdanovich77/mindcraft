/**
 * Social System Performance Optimizations
 *
 * Performance optimization utilities for the social relationship system
 * Ensuring sub-100ms emergency response requirements are met
 * Following established patterns from cognitive components
 */
import { RelationshipManager } from './relationship_manager.js';
import { AgentRelationship, SocialSearchQuery } from './relationship_types.js';
/**
 * Performance optimization configurations
 */
export interface PerformanceConfig {
    enableCaching: boolean;
    cacheSize: number;
    cacheTTL: number;
    enableBatching: boolean;
    batchSize: number;
    batchTimeout: number;
    enableLazyLoading: boolean;
    maxConcurrentUpdates: number;
    enableCompression: boolean;
    memoryThreshold: number;
}
/**
 * Performance optimization manager
 */
export declare class SocialPerformanceOptimizer {
    private config;
    private relationshipCache;
    private searchCache;
    private updateQueue;
    private isProcessingBatch;
    private memoryUsage;
    private performanceMetrics;
    constructor(config?: Partial<PerformanceConfig>);
    /**
     * Get cached relationship or fetch from manager
     */
    getCachedRelationship(targetAgentId: string, relationshipManager: RelationshipManager): Promise<AgentRelationship | null>;
    /**
     * Get cached search results or perform search
     */
    getCachedSearchResults(query: SocialSearchQuery, relationshipManager: RelationshipManager): Promise<any>;
    /**
     * Queue relationship update for batch processing
     */
    queueRelationshipUpdate(targetAgentId: string, update: any, relationshipManager: RelationshipManager): void;
    /**
     * Process queued updates in batch
     */
    private processBatch;
    /**
     * Schedule batch processing with timeout
     */
    private scheduleBatchProcessing;
    /**
     * Cache relationship data
     */
    private cacheRelationship;
    /**
     * Cache search results
     */
    private cacheSearchResults;
    /**
     * Check if cache entry is valid
     */
    private isCacheEntryValid;
    /**
     * Evict least used relationship from cache
     */
    private evictLeastUsedRelationship;
    /**
     * Evict least used search from cache
     */
    private evictLeastUsedSearch;
    /**
     * Update memory usage estimation
     */
    private updateMemoryUsage;
    /**
     * Perform memory cleanup when threshold is exceeded
     */
    private performMemoryCleanup;
    /**
     * Update average response time
     */
    private updateResponseTime;
    /**
     * Start periodic cleanup of expired cache entries
     */
    private startPeriodicCleanup;
    /**
     * Clean up expired cache entries
     */
    private cleanupExpiredEntries;
    /**
     * Chunk array into smaller arrays
     */
    private chunkArray;
    /**
     * Get performance metrics
     */
    getPerformanceMetrics(): {
        cacheHitRate: number;
        queuedUpdates: number;
        cacheSize: {
            relationships: number;
            searches: number;
        };
        memoryUsage: number;
        config: PerformanceConfig;
        cacheHits: number;
        cacheMisses: number;
        batchedUpdates: number;
        averageResponseTime: number;
    };
    /**
     * Clear all caches
     */
    clearCaches(): void;
    /**
     * Optimize cache settings based on usage patterns
     */
    optimizeCacheSettings(): void;
    /**
     * Cleanup resources
     */
    cleanup(): void;
}
/**
 * Get or create global performance optimizer
 */
export declare function getPerformanceOptimizer(config?: Partial<PerformanceConfig>): SocialPerformanceOptimizer;
/**
 * Cleanup global optimizer
 */
export declare function cleanupPerformanceOptimizer(): void;
//# sourceMappingURL=performance_optimizations.d.ts.map