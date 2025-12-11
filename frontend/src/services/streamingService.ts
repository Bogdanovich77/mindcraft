/**
 * Streaming Service for High-Performance Data Management
 *
 * This service provides advanced streaming capabilities for real-time data processing,
 * including data transformation, aggregation, filtering, and intelligent caching
 * for optimal performance across all cognitive components.
 */

import type {
  AgentState,
  AgentStateUpdateEvent,
  PersonalityTraitUpdateEvent,
  PersonalityEmotionEvent,
  PersonalityMoodEvent,
  MemoryUpdateEvent,
  MemoryConsolidationEvent,
  GoalUpdateEvent,
  GoalProgressEvent,
  SocialDataUpdateEvent,
  SocialInteractionEvent,
  SkillDataUpdateEvent,
  SkillExperienceEvent,
  PerformanceMetricsUpdateEvent,
  SystemStatusUpdateEvent
} from '../types/socketEvents';

// Streaming configuration interface
export interface StreamingConfig {
  enableAggregation: boolean;
  aggregationWindow: number; // milliseconds
  enableFiltering: boolean;
  enableCaching: boolean;
  cacheSize: number;
  cacheTimeout: number; // milliseconds
  enableTransformation: boolean;
  enableCompression: boolean;
  compressionThreshold: number; // bytes
  maxConcurrentStreams: number;
  bufferSize: number;
  flushInterval: number; // milliseconds
}

// Data stream interface
export interface DataStream<T> {
  id: string;
  type: string;
  data: T[];
  timestamp: number;
  lastUpdate: number;
  isActive: boolean;
  subscribers: Set<(data: T[]) => void>;
  buffer: T[];
  aggregation: AggregationConfig<T> | null;
}

// Aggregation configuration
export interface AggregationConfig<T> {
  window: number;
  function: (data: T[]) => T;
  enabled: boolean;
}

// Data transformation interface
export interface DataTransformer<T, R> {
  id: string;
  transform: (data: T) => R;
  condition?: (data: T) => boolean;
  enabled: boolean;
}

// Data filter interface
export interface DataFilter<T> {
  id: string;
  filter: (data: T) => boolean;
  enabled: boolean;
}

// Cache entry interface
export interface CacheEntry<T> {
  key: string;
  data: T;
  timestamp: number;
  accessCount: number;
  size: number;
}

// Streaming metrics interface
export interface StreamingMetrics {
  totalStreams: number;
  activeStreams: number;
  totalEventsProcessed: number;
  eventsPerSecond: number;
  cacheHitRate: number;
  compressionRatio: number;
  averageLatency: number;
  bufferSize: number;
  memoryUsage: number;
}

export class StreamingService {
  private config: StreamingConfig;
  private streams: Map<string, DataStream<any>> = new Map();
  private transformers: Map<string, DataTransformer<any, any>> = new Map();
  private filters: Map<string, DataFilter<any>> = new Map();
  private cache: Map<string, CacheEntry<any>> = new Map();
  private metrics: StreamingMetrics;
  private flushTimer: ReturnType<typeof setInterval> | null = null;
  private processingQueue: Array<{ streamId: string; data: any; timestamp: number }> = [];
  private isProcessing = false;

  constructor(config: Partial<StreamingConfig> = {}) {
    this.config = {
      enableAggregation: true,
      aggregationWindow: 1000, // 1 second
      enableFiltering: true,
      enableCaching: true,
      cacheSize: 1000,
      cacheTimeout: 300000, // 5 minutes
      enableTransformation: true,
      enableCompression: false,
      compressionThreshold: 1024, // 1KB
      maxConcurrentStreams: 50,
      bufferSize: 100,
      flushInterval: 100, // 100ms
      ...config
    };

    this.metrics = {
      totalStreams: 0,
      activeStreams: 0,
      totalEventsProcessed: 0,
      eventsPerSecond: 0,
      cacheHitRate: 0,
      compressionRatio: 0,
      averageLatency: 0,
      bufferSize: 0,
      memoryUsage: 0
    };

    this.startFlushTimer();
  }

  /**
   * Create a new data stream
   */
  createStream<T>(
    id: string,
    type: string,
    aggregationConfig?: AggregationConfig<T>
  ): DataStream<T> {
    if (this.streams.has(id)) {
      console.warn(`[StreamingService] Stream ${id} already exists`);
      return this.streams.get(id)!;
    }

    const stream: DataStream<T> = {
      id,
      type,
      data: [],
      timestamp: Date.now(),
      lastUpdate: Date.now(),
      isActive: true,
      subscribers: new Set(),
      buffer: [],
      aggregation: aggregationConfig || null
    };

    this.streams.set(id, stream);
    this.metrics.totalStreams++;
    this.metrics.activeStreams++;

    console.log(`[StreamingService] Created stream ${id} of type ${type}`);
    return stream;
  }

  /**
   * Get a data stream by ID
   */
  getStream<T>(id: string): DataStream<T> | null {
    return this.streams.get(id) || null;
  }

  /**
   * Delete a data stream
   */
  deleteStream(id: string): boolean {
    const stream = this.streams.get(id);
    if (stream) {
      stream.isActive = false;
      stream.subscribers.clear();
      this.streams.delete(id);
      this.metrics.activeStreams--;
      console.log(`[StreamingService] Deleted stream ${id}`);
      return true;
    }
    return false;
  }

  /**
   * Subscribe to a data stream
   */
  subscribe<T>(streamId: string, callback: (data: T[]) => void): () => void {
    const stream = this.getStream<T>(streamId);
    if (!stream) {
      throw new Error(`Stream ${streamId} not found`);
    }

    stream.subscribers.add(callback);
    
    // Return unsubscribe function
    return () => {
      stream.subscribers.delete(callback);
    };
  }

  /**
   * Push data to a stream
   */
  pushData<T>(streamId: string, data: T): void {
    const stream = this.getStream<T>(streamId);
    if (!stream || !stream.isActive) {
      return;
    }

    const startTime = Date.now();
    
    try {
      // Apply filters if enabled
      let processedData: T | null = data;
      if (this.config.enableFiltering) {
        processedData = this.applyFilters<T>(data);
        if (processedData === null) {
          return; // Data was filtered out
        }
      }

      // Apply transformations if enabled
      if (this.config.enableTransformation) {
        processedData = this.applyTransformations<T>(processedData!);
      }

      // Add to buffer for aggregation
      stream.buffer.push(processedData);
      stream.lastUpdate = Date.now();

      // Check if we should flush the buffer
      if (stream.buffer.length >= this.config.bufferSize) {
        this.flushStream(streamId);
      }

      // Update metrics
      this.metrics.totalEventsProcessed++;
      this.metrics.eventsPerSecond = this.calculateEventsPerSecond();
      this.metrics.averageLatency = Date.now() - startTime;

    } catch (error) {
      console.error(`[StreamingService] Error processing data for stream ${streamId}:`, error);
    }
  }

  /**
   * Flush a stream buffer
   */
  private flushStream<T>(streamId: string): void {
    const stream = this.getStream<T>(streamId);
    if (!stream || stream.buffer.length === 0) {
      return;
    }

    try {
      let processedData: T[] = [];

      // Apply aggregation if enabled
      if (this.config.enableAggregation && stream.aggregation && stream.aggregation.enabled) {
        const aggregated = stream.aggregation.function(stream.buffer);
        processedData = [aggregated];
      } else {
        processedData = [...stream.buffer];
      }

      // Update stream data
      stream.data = processedData;
      stream.timestamp = Date.now();

      // Notify subscribers
      stream.subscribers.forEach(callback => {
        try {
          callback(processedData);
        } catch (error) {
          console.error(`[StreamingService] Error in subscriber callback for stream ${streamId}:`, error);
        }
      });

      // Clear buffer
      stream.buffer = [];

      // Update cache if enabled
      if (this.config.enableCaching) {
        this.updateCache(streamId, processedData);
      }

    } catch (error) {
      console.error(`[StreamingService] Error flushing stream ${streamId}:`, error);
    }
  }

  /**
   * Apply filters to data
   */
  private applyFilters<T>(data: T): T | null {
    for (const filter of this.filters.values()) {
      if (filter.enabled && !filter.filter(data)) {
        return null; // Data filtered out
      }
    }
    return data;
  }

  /**
   * Apply transformations to data
   */
  private applyTransformations<T>(data: T): T {
    let transformed = data;
    
    for (const transformer of this.transformers.values()) {
      if (transformer.enabled) {
        if (!transformer.condition || transformer.condition(transformed)) {
          transformed = transformer.transform(transformed);
        }
      }
    }
    
    return transformed;
  }

  /**
   * Update cache with stream data
   */
  private updateCache<T>(streamId: string, data: T[]): void {
    const key = `stream:${streamId}`;
    const size = this.calculateSize(data);

    // Check cache size limit
    if (this.cache.size >= this.config.cacheSize) {
      this.evictOldestCacheEntry();
    }

    const entry: CacheEntry<T[]> = {
      key,
      data,
      timestamp: Date.now(),
      accessCount: 0,
      size
    };

    this.cache.set(key, entry);
  }

  /**
   * Get data from cache
   */
  getCachedData<T>(streamId: string): T[] | null {
    const key = `stream:${streamId}`;
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if cache entry is expired
    if (Date.now() - entry.timestamp > this.config.cacheTimeout) {
      this.cache.delete(key);
      return null;
    }

    // Update access metrics
    entry.accessCount++;
    return entry.data as T[];
  }

  /**
   * Evict oldest cache entry
   */
  private evictOldestCacheEntry(): void {
    let oldestKey: string | null = null;
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  /**
   * Add a data transformer
   */
  addTransformer<T, R>(transformer: DataTransformer<T, R>): void {
    this.transformers.set(transformer.id, transformer);
  }

  /**
   * Remove a data transformer
   */
  removeTransformer(id: string): boolean {
    return this.transformers.delete(id);
  }

  /**
   * Add a data filter
   */
  addFilter<T>(filter: DataFilter<T>): void {
    this.filters.set(filter.id, filter);
  }

  /**
   * Remove a data filter
   */
  removeFilter(id: string): boolean {
    return this.filters.delete(id);
  }

  /**
   * Start flush timer
   */
  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      this.flushAllStreams();
    }, this.config.flushInterval);
  }

  /**
   * Flush all active streams
   */
  private flushAllStreams(): void {
    for (const [streamId, stream] of this.streams.entries()) {
      if (stream.isActive && stream.buffer.length > 0) {
        this.flushStream(streamId);
      }
    }
  }

  /**
   * Calculate events per second
   */
  private calculateEventsPerSecond(): number {
    // Simplified calculation - in production, use a more sophisticated approach
    return this.metrics.eventsPerSecond * 0.9 + 1;
  }

  /**
   * Calculate data size
   */
  private calculateSize(data: any): number {
    return JSON.stringify(data).length;
  }

  /**
   * Get streaming metrics
   */
  getMetrics(): StreamingMetrics {
    this.metrics.bufferSize = Array.from(this.streams.values())
      .reduce((total, stream) => total + stream.buffer.length, 0);
    
    this.metrics.memoryUsage = this.calculateSize(this.cache) + this.calculateSize(this.streams);
    
    // Calculate cache hit rate
    const totalAccesses = Array.from(this.cache.values())
      .reduce((total, entry) => total + entry.accessCount, 0);
    this.metrics.cacheHitRate = totalAccesses > 0 ? totalAccesses / (totalAccesses + this.metrics.totalEventsProcessed) : 0;

    return { ...this.metrics };
  }

  /**
   * Reset metrics
   */
  resetMetrics(): void {
    this.metrics = {
      totalStreams: this.streams.size,
      activeStreams: this.streams.size,
      totalEventsProcessed: 0,
      eventsPerSecond: 0,
      cacheHitRate: 0,
      compressionRatio: 0,
      averageLatency: 0,
      bufferSize: 0,
      memoryUsage: 0
    };
  }

  /**
   * Clear all streams
   */
  clearAllStreams(): void {
    for (const streamId of this.streams.keys()) {
      this.deleteStream(streamId);
    }
    this.streams.clear();
    this.cache.clear();
    this.resetMetrics();
  }

  /**
   * Destroy the streaming service
   */
  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    
    this.clearAllStreams();
    this.transformers.clear();
    this.filters.clear();
  }

  /**
   * Create predefined streams for cognitive components
   */
  createCognitiveStreams(): void {
    // Agent state stream
    this.createStream<AgentStateUpdateEvent>('agent-state', 'agent-state', {
      window: this.config.aggregationWindow,
      enabled: this.config.enableAggregation,
      function: (events) => events[events.length - 1] // Keep latest
    });

    // Personality stream
    this.createStream<PersonalityTraitUpdateEvent>('personality', 'personality', {
      window: this.config.aggregationWindow,
      enabled: this.config.enableAggregation,
      function: (events) => events[events.length - 1] // Keep latest
    });

    // Emotion stream
    this.createStream<PersonalityEmotionEvent>('emotions', 'emotions', {
      window: this.config.aggregationWindow,
      enabled: this.config.enableAggregation,
      function: (events) => events[events.length - 1] // Keep latest
    });

    // Memory stream
    this.createStream<MemoryUpdateEvent>('memory', 'memory', {
      window: this.config.aggregationWindow,
      enabled: this.config.enableAggregation,
      function: (events) => events[events.length - 1] // Keep latest
    });

    // Goals stream
    this.createStream<GoalUpdateEvent>('goals', 'goals', {
      window: this.config.aggregationWindow,
      enabled: this.config.enableAggregation,
      function: (events) => events[events.length - 1] // Keep latest
    });

    // Social stream
    this.createStream<SocialDataUpdateEvent>('social', 'social', {
      window: this.config.aggregationWindow,
      enabled: this.config.enableAggregation,
      function: (events) => events[events.length - 1] // Keep latest
    });

    // Skills stream
    this.createStream<SkillDataUpdateEvent>('skills', 'skills', {
      window: this.config.aggregationWindow,
      enabled: this.config.enableAggregation,
      function: (events) => events[events.length - 1] // Keep latest
    });

    // Performance stream
    this.createStream<PerformanceMetricsUpdateEvent>('performance', 'performance', {
      window: this.config.aggregationWindow,
      enabled: this.config.enableAggregation,
      function: (events) => events[events.length - 1] // Keep latest
    });

    console.log('[StreamingService] Created cognitive streams');
  }
}

// Export singleton instance
export const streamingService = new StreamingService();

// Export utility functions for creating common transformers and filters
export const createCommonTransformers = () => ({
  // Normalize personality traits
  normalizePersonalityTraits: {
    id: 'normalize-personality-traits',
    transform: (data: PersonalityTraitUpdateEvent) => ({
      ...data,
      traits: Object.fromEntries(
        Object.entries(data.traits).map(([key, value]) => [
          key,
          Math.max(0, Math.min(1, value)) // Clamp between 0 and 1
        ])
      )
    }),
    enabled: true
  },

  // Calculate emotion intensity
  calculateEmotionIntensity: {
    id: 'calculate-emotion-intensity',
    transform: (data: PersonalityEmotionEvent) => ({
      ...data,
      calculatedIntensity: (data as any).intensity * 100 // Convert to percentage
    }),
    enabled: true
  },

  // Extract memory metrics
  extractMemoryMetrics: {
    id: 'extract-memory-metrics',
    transform: (data: MemoryUpdateEvent) => ({
      ...data,
      metrics: {
        totalMemories: Array.isArray(data.memory) ? data.memory.length : 0,
        lastUpdate: data.timestamp,
        memoryType: data.memoryType
      }
    }),
    enabled: true
  }
});

export const createCommonFilters = () => ({
  // Filter out empty agent states
  filterEmptyAgentStates: {
    id: 'filter-empty-agent-states',
    filter: (data: AgentStateUpdateEvent) => data.state && Object.keys(data.state).length > 0,
    enabled: true
  },

  // Filter out low-intensity emotions
  filterLowIntensityEmotions: {
    id: 'filter-low-intensity-emotions',
    filter: (data: PersonalityEmotionEvent) => (data as any).intensity > 0.1,
    enabled: true
  },

  // Filter out old data
  filterOldData: {
    id: 'filter-old-data',
    filter: (data: any) => Date.now() - data.timestamp < 60000, // Last 60 seconds
    enabled: false // Disabled by default
  }
});