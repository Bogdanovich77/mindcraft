/**
 * Social System Performance Optimizations
 * 
 * Performance optimization utilities for the social relationship system
 * Ensuring sub-100ms emergency response requirements are met
 * Following established patterns from cognitive components
 */

import { RelationshipManager } from './relationship_manager.js';
import { AgentRelationship, RelationshipQuery, SocialSearchQuery } from './relationship_types.js';

/**
 * Performance optimization configurations
 */
export interface PerformanceConfig {
  enableCaching: boolean;
  cacheSize: number;
  cacheTTL: number; // milliseconds
  enableBatching: boolean;
  batchSize: number;
  batchTimeout: number; // milliseconds
  enableLazyLoading: boolean;
  maxConcurrentUpdates: number;
  enableCompression: boolean;
  memoryThreshold: number; // bytes
}

/**
 * Cache entry for relationship data
 */
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  accessCount: number;
  lastAccessed: number;
}

/**
 * Performance optimization manager
 */
export class SocialPerformanceOptimizer {
  private config: PerformanceConfig;
  private relationshipCache: Map<string, CacheEntry<AgentRelationship>>;
  private searchCache: Map<string, CacheEntry<any[]>>;
  private updateQueue: Array<{
    targetAgentId: string;
    update: any;
    timestamp: number;
  }>;
  private isProcessingBatch: boolean = false;
  private memoryUsage: number = 0;
  private performanceMetrics: {
    cacheHits: number;
    cacheMisses: number;
    batchedUpdates: number;
    averageResponseTime: number;
    memoryUsage: number;
  };

  constructor(config: Partial<PerformanceConfig> = {}) {
    this.config = {
      enableCaching: true,
      cacheSize: 1000,
      cacheTTL: 300000, // 5 minutes
      enableBatching: true,
      batchSize: 10,
      batchTimeout: 100, // 100ms
      enableLazyLoading: true,
      maxConcurrentUpdates: 5,
      enableCompression: true,
      memoryThreshold: 50 * 1024 * 1024, // 50MB
      ...config
    };

    this.relationshipCache = new Map();
    this.searchCache = new Map();
    this.updateQueue = [];
    
    this.performanceMetrics = {
      cacheHits: 0,
      cacheMisses: 0,
      batchedUpdates: 0,
      averageResponseTime: 0,
      memoryUsage: 0
    };

    // Start periodic cleanup
    this.startPeriodicCleanup();
  }

  /**
   * Get cached relationship or fetch from manager
   */
  async getCachedRelationship(
    targetAgentId: string,
    relationshipManager: RelationshipManager
  ): Promise<AgentRelationship | null> {
    const startTime = Date.now();

    if (!this.config.enableCaching) {
      return relationshipManager.getRelationship(targetAgentId);
    }

    // Check cache first
    const cacheKey = `relationship:${targetAgentId}`;
    const cached = this.relationshipCache.get(cacheKey);

    if (cached && this.isCacheEntryValid(cached)) {
      // Update access statistics
      cached.accessCount++;
      cached.lastAccessed = Date.now();
      this.performanceMetrics.cacheHits++;
      
      this.updateResponseTime(startTime);
      return cached.data;
    }

    // Cache miss - fetch from manager
    this.performanceMetrics.cacheMisses++;
    const relationship = relationshipManager.getRelationship(targetAgentId);

    if (relationship) {
      this.cacheRelationship(cacheKey, relationship);
    }

    this.updateResponseTime(startTime);
    return relationship;
  }

  /**
   * Get cached search results or perform search
   */
  async getCachedSearchResults(
    query: SocialSearchQuery,
    relationshipManager: RelationshipManager
  ): Promise<any> {
    const startTime = Date.now();

    if (!this.config.enableCaching) {
      return relationshipManager.searchRelationships(query);
    }

    // Create cache key from query
    const cacheKey = `search:${JSON.stringify(query)}`;
    const cached = this.searchCache.get(cacheKey);

    if (cached && this.isCacheEntryValid(cached)) {
      cached.accessCount++;
      cached.lastAccessed = Date.now();
      this.performanceMetrics.cacheHits++;
      
      this.updateResponseTime(startTime);
      return cached.data;
    }

    // Cache miss - perform search
    this.performanceMetrics.cacheMisses++;
    const results = relationshipManager.searchRelationships(query);

    if (results.relationships.length > 0) {
      this.cacheSearchResults(cacheKey, results);
    }

    this.updateResponseTime(startTime);
    return results;
  }

  /**
   * Queue relationship update for batch processing
   */
  queueRelationshipUpdate(
    targetAgentId: string,
    update: any,
    relationshipManager: RelationshipManager
  ): void {
    if (!this.config.enableBatching) {
      // Process immediately
      relationshipManager.processRelationshipUpdate(update);
      return;
    }

    // Add to queue
    this.updateQueue.push({
      targetAgentId,
      update,
      timestamp: Date.now()
    });

    // Process batch if size limit reached
    if (this.updateQueue.length >= this.config.batchSize) {
      this.processBatch(relationshipManager);
    } else {
      // Schedule batch processing
      this.scheduleBatchProcessing(relationshipManager);
    }

    this.performanceMetrics.batchedUpdates++;
  }

  /**
   * Process queued updates in batch
   */
  private async processBatch(relationshipManager: RelationshipManager): Promise<void> {
    if (this.isProcessingBatch || this.updateQueue.length === 0) {
      return;
    }

    this.isProcessingBatch = true;
    const startTime = Date.now();

    try {
      // Process updates in batches
      const batch = this.updateQueue.splice(0, this.config.batchSize);
      
      // Process updates concurrently with limit
      const chunks = this.chunkArray(batch, this.config.maxConcurrentUpdates);
      
      for (const chunk of chunks) {
        await Promise.all(
          chunk.map(item => {
            try {
              relationshipManager.processRelationshipUpdate(item.update);
            } catch (error) {
              console.error(`[SOCIAL_PERF] Error processing batch update for ${item.targetAgentId}:`, error);
            }
          })
        );
      }

      console.log(`[SOCIAL_PERF] Processed batch of ${batch.length} updates in ${Date.now() - startTime}ms`);

    } catch (error) {
      console.error(`[SOCIAL_PERF] Error processing batch:`, error);
    } finally {
      this.isProcessingBatch = false;
    }
  }

  /**
   * Schedule batch processing with timeout
   */
  private scheduleBatchProcessing(relationshipManager: RelationshipManager): void {
    setTimeout(() => {
      if (this.updateQueue.length > 0) {
        this.processBatch(relationshipManager);
      }
    }, this.config.batchTimeout);
  }

  /**
   * Cache relationship data
   */
  private cacheRelationship(key: string, relationship: AgentRelationship): void {
    // Check cache size limit
    if (this.relationshipCache.size >= this.config.cacheSize) {
      this.evictLeastUsedRelationship();
    }

    const entry: CacheEntry<AgentRelationship> = {
      data: relationship,
      timestamp: Date.now(),
      accessCount: 1,
      lastAccessed: Date.now()
    };

    this.relationshipCache.set(key, entry);
    this.updateMemoryUsage();
  }

  /**
   * Cache search results
   */
  private cacheSearchResults(key: string, results: any): void {
    // Check cache size limit
    if (this.searchCache.size >= this.config.cacheSize) {
      this.evictLeastUsedSearch();
    }

    const entry: CacheEntry<any[]> = {
      data: results,
      timestamp: Date.now(),
      accessCount: 1,
      lastAccessed: Date.now()
    };

    this.searchCache.set(key, entry);
    this.updateMemoryUsage();
  }

  /**
   * Check if cache entry is valid
   */
  private isCacheEntryValid<T>(entry: CacheEntry<T>): boolean {
    return (Date.now() - entry.timestamp) < this.config.cacheTTL;
  }

  /**
   * Evict least used relationship from cache
   */
  private evictLeastUsedRelationship(): void {
    let leastUsed: string | null = null;
    let lowestScore = Infinity;

    for (const [key, entry] of this.relationshipCache.entries()) {
      // Score based on access count and age
      const score = entry.accessCount / (Date.now() - entry.timestamp);
      if (score < lowestScore) {
        lowestScore = score;
        leastUsed = key;
      }
    }

    if (leastUsed) {
      this.relationshipCache.delete(leastUsed);
    }
  }

  /**
   * Evict least used search from cache
   */
  private evictLeastUsedSearch(): void {
    let leastUsed: string | null = null;
    let lowestScore = Infinity;

    for (const [key, entry] of this.searchCache.entries()) {
      const score = entry.accessCount / (Date.now() - entry.timestamp);
      if (score < lowestScore) {
        lowestScore = score;
        leastUsed = key;
      }
    }

    if (leastUsed) {
      this.searchCache.delete(leastUsed);
    }
  }

  /**
   * Update memory usage estimation
   */
  private updateMemoryUsage(): void {
    // Rough estimation of memory usage
    const relationshipSize = this.relationshipCache.size * 1024; // ~1KB per relationship
    const searchSize = this.searchCache.size * 512; // ~512B per search result
    const queueSize = this.updateQueue.length * 256; // ~256B per queued update
    
    this.memoryUsage = relationshipSize + searchSize + queueSize;
    this.performanceMetrics.memoryUsage = this.memoryUsage;

    // Check memory threshold
    if (this.memoryUsage > this.config.memoryThreshold) {
      this.performMemoryCleanup();
    }
  }

  /**
   * Perform memory cleanup when threshold is exceeded
   */
  private performMemoryCleanup(): void {
    console.warn(`[SOCIAL_PERF] Memory usage (${this.memoryUsage} bytes) exceeds threshold (${this.config.memoryThreshold} bytes)`);

    // Clear half of each cache
    const relationshipCount = Math.floor(this.relationshipCache.size / 2);
    const searchCount = Math.floor(this.searchCache.size / 2);

    for (let i = 0; i < relationshipCount; i++) {
      this.evictLeastUsedRelationship();
    }

    for (let i = 0; i < searchCount; i++) {
      this.evictLeastUsedSearch();
    }

    this.updateMemoryUsage();
    console.log(`[SOCIAL_PERF] Memory cleanup completed. New usage: ${this.memoryUsage} bytes`);
  }

  /**
   * Update average response time
   */
  private updateResponseTime(startTime: number): void {
    const responseTime = Date.now() - startTime;
    const current = this.performanceMetrics.averageResponseTime;
    this.performanceMetrics.averageResponseTime = (current + responseTime) / 2;
  }

  /**
   * Start periodic cleanup of expired cache entries
   */
  private startPeriodicCleanup(): void {
    setInterval(() => {
      this.cleanupExpiredEntries();
    }, this.config.cacheTTL / 2); // Clean up half as often as TTL
  }

  /**
   * Clean up expired cache entries
   */
  private cleanupExpiredEntries(): void {
    const now = Date.now();
    let cleanedCount = 0;

    // Clean relationship cache
    for (const [key, entry] of this.relationshipCache.entries()) {
      if ((now - entry.timestamp) > this.config.cacheTTL) {
        this.relationshipCache.delete(key);
        cleanedCount++;
      }
    }

    // Clean search cache
    for (const [key, entry] of this.searchCache.entries()) {
      if ((now - entry.timestamp) > this.config.cacheTTL) {
        this.searchCache.delete(key);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      console.log(`[SOCIAL_PERF] Cleaned up ${cleanedCount} expired cache entries`);
      this.updateMemoryUsage();
    }
  }

  /**
   * Chunk array into smaller arrays
   */
  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics() {
    return {
      ...this.performanceMetrics,
      cacheHitRate: this.performanceMetrics.cacheHits / 
        (this.performanceMetrics.cacheHits + this.performanceMetrics.cacheMisses) || 0,
      queuedUpdates: this.updateQueue.length,
      cacheSize: {
        relationships: this.relationshipCache.size,
        searches: this.searchCache.size
      },
      memoryUsage: this.memoryUsage,
      config: this.config
    };
  }

  /**
   * Clear all caches
   */
  clearCaches(): void {
    this.relationshipCache.clear();
    this.searchCache.clear();
    this.updateQueue.length = 0;
    this.updateMemoryUsage();
    console.log(`[SOCIAL_PERF] All caches cleared`);
  }

  /**
   * Optimize cache settings based on usage patterns
   */
  optimizeCacheSettings(): void {
    const metrics = this.getPerformanceMetrics();

    // Adjust cache size based on hit rate
    if (metrics.cacheHitRate < 0.7 && this.config.cacheSize < 2000) {
      this.config.cacheSize = Math.min(this.config.cacheSize * 1.5, 2000);
      console.log(`[SOCIAL_PERF] Increased cache size to ${this.config.cacheSize} due to low hit rate (${metrics.cacheHitRate.toFixed(2)})`);
    } else if (metrics.cacheHitRate > 0.9 && this.config.cacheSize > 500) {
      this.config.cacheSize = Math.max(this.config.cacheSize * 0.8, 500);
      console.log(`[SOCIAL_PERF] Decreased cache size to ${this.config.cacheSize} due to high hit rate (${metrics.cacheHitRate.toFixed(2)})`);
    }

    // Adjust batch size based on processing time
    if (metrics.averageResponseTime > 50 && this.config.batchSize > 5) {
      this.config.batchSize = Math.max(this.config.batchSize * 0.8, 5);
      console.log(`[SOCIAL_PERF] Decreased batch size to ${this.config.batchSize} due to high response time (${metrics.averageResponseTime.toFixed(2)}ms)`);
    } else if (metrics.averageResponseTime < 20 && this.config.batchSize < 20) {
      this.config.batchSize = Math.min(this.config.batchSize * 1.2, 20);
      console.log(`[SOCIAL_PERF] Increased batch size to ${this.config.batchSize} due to low response time (${metrics.averageResponseTime.toFixed(2)}ms)`);
    }
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    this.clearCaches();
    this.updateQueue.length = 0;
    console.log(`[SOCIAL_PERF] Performance optimizer cleanup completed`);
  }
}

/**
 * Global performance optimizer instance
 */
let globalOptimizer: SocialPerformanceOptimizer | null = null;

/**
 * Get or create global performance optimizer
 */
export function getPerformanceOptimizer(config?: Partial<PerformanceConfig>): SocialPerformanceOptimizer {
  if (!globalOptimizer) {
    globalOptimizer = new SocialPerformanceOptimizer(config);
  }
  return globalOptimizer;
}

/**
 * Cleanup global optimizer
 */
export function cleanupPerformanceOptimizer(): void {
  if (globalOptimizer) {
    globalOptimizer.cleanup();
    globalOptimizer = null;
  }
}