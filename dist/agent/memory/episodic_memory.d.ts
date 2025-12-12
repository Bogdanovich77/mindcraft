import type { EpisodicEvent } from '../langgraph/interfaces.js';
interface MemoryQuery {
    query: string;
    types?: string[];
    filters?: any;
    importance?: number;
    timeRange?: {
        start: number;
        end: number;
    };
    limit?: number;
}
/**
 * Episodic memory system for storing events with forgetting curves and consolidation
 */
export declare class EpisodicMemory {
    private events;
    private timelines;
    private emotionalTags;
    private consolidationQueue;
    private maxEvents;
    private forgettingCurve;
    private consolidationThreshold;
    private eventStoredCallbacks;
    private semanticMemoryRef;
    constructor();
    /**
     * Set reference to semantic memory for consolidation
     */
    setSemanticMemory(semanticMemory: any): void;
    /**
     * Store a new episodic event
     */
    storeEvent(event: ExtendedEpisodicEvent): Promise<void>;
    /**
     * Consolidate a specific episode to semantic memory
     */
    consolidateEpisode(episode: ExtendedEpisodicEvent): Promise<void>;
    /**
     * Store extracted patterns in working memory for immediate access
     */
    private storePatternsInWorkingMemory;
    /**
     * Query episodic memory
     */
    query(query: MemoryQuery): Promise<ExtendedEpisodicEvent[]>;
    /**
     * Get recent events within time window
     */
    getRecentEvents(timeWindowMs: number): Promise<ExtendedEpisodicEvent[]>;
    /**
     * Get event by ID
     */
    getEventById(eventId: string): ExtendedEpisodicEvent | null;
    /**
     * Apply forgetting decay to all events
     */
    applyDecay(deltaTimeMs: number): Promise<void>;
    /**
     * Consolidate important events
     */
    consolidateEvents(eventIds: string[]): Promise<void>;
    /**
     * Get events by emotional valence
     */
    getEventsByEmotion(emotionType: 'positive' | 'negative' | 'high_arousal' | 'low_arousal'): ExtendedEpisodicEvent[];
    /**
     * Get causal chain of events
     */
    getCausalChain(startEventId: string, maxDepth?: number): ExtendedEpisodicEvent[];
    /**
     * Rank events by relevance to query
     */
    rankByRelevance(events: ExtendedEpisodicEvent[], query: MemoryQuery): ExtendedEpisodicEvent[];
    /**
     * Get memory statistics
     */
    getStatistics(): {
        eventCount: number;
        averageImportance: number;
        oldestEvent: number;
    };
    /**
     * Register callback for event storage
     */
    onEventStored(callback: (event: ExtendedEpisodicEvent) => void): void;
    /**
     * Cleanup old events
     */
    cleanup(): Promise<void>;
    /**
     * Private helper methods
     */
    private calculateImportance;
    private updateTimelines;
    private processEmotionalTags;
    private extractPatterns;
    private isCausallyRelated;
    private calculateRelevanceScore;
    private cleanupLeastImportantEvents;
    private cleanupOldTimelines;
}
export interface ExtendedEpisodicEvent extends EpisodicEvent {
    type: string;
    action?: string;
    outcome?: string;
    success?: boolean;
    emotional?: {
        valence: number;
        arousal: number;
        urgency: number;
    };
    metadata?: Record<string, any>;
}
export interface EpisodicTimeline {
    id: string;
    events: string[];
    location: {
        x: number;
        y: number;
        z: number;
    };
    startTime: number;
    endTime: number;
}
export interface EmotionalTag {
    id: string;
    valence: number;
    arousal: number;
    eventIds: string[];
    frequency: number;
}
export interface ExtractedPattern {
    type: 'action_outcome' | 'emergency_response' | 'social_pattern' | 'location_pattern' | 'resource_pattern';
    action?: string;
    outcome?: string;
    context?: any;
    trigger?: string;
    response?: string;
    emotional?: any;
    confidence: number;
}
/**
 * Forgetting curve implementation based on Ebbinghaus's law
 */
export declare class ForgettingCurve {
    private decayConstant;
    private importanceFactor;
    calculateAdjustedImportance(originalImportance: number, timeSinceDays: number): number;
    calculateRetentionProbability(originalImportance: number, timeSinceDays: number): number;
}
export {};
//# sourceMappingURL=episodic_memory.d.ts.map