import { type ExtendedEpisodicEvent } from './episodic_memory.js';
import type { AgentState, MemoryQuery, MemoryRetrieval, ProceduralSkill, WorkingMemoryState, SocialState } from '../langgraph/interfaces.js';
/**
 * Main memory system orchestrator that coordinates all memory components
 */
export declare class MemorySystem {
    private semantic;
    private episodic;
    private procedural;
    private working;
    private consolidation;
    private bridge;
    private socialState?;
    private lastConsolidation;
    private consolidationInterval;
    private socialMemories;
    private relationshipHistory;
    private socialPatterns;
    constructor();
    /**
     * Lazy load MemoryBridge to avoid circular import
     */
    private getBridge;
    /**
     * Initialize memory system with legacy data
     */
    initialize(legacyMemoryBank?: any): Promise<void>;
    /**
     * Update memory system with new experience
     */
    update(agentState: AgentState, deltaTime: number): Promise<void>;
    /**
     * Store new episodic event
     */
    storeEvent(event: ExtendedEpisodicEvent): Promise<void>;
    /**
     * Store semantic knowledge
     */
    storeSemanticConcept(concept: any): Promise<void>;
    /**
     * Store procedural knowledge
     */
    storeProceduralSkill(skill: ProceduralSkill): Promise<void>;
    /**
     * Query memory for relevant information
     */
    query(query: MemoryQuery): Promise<MemoryRetrieval>;
    /**
     * Get current working memory state
     */
    getWorkingMemory(): WorkingMemoryState;
    /**
     * Get memory statistics
     */
    getStatistics(): any;
    /**
     * Learn from reactive emergency events
     */
    private learnFromReactiveEvent;
    /**
     * Perform memory consolidation
     */
    private performConsolidation;
    /**
     * Setup interactions between memory systems
     */
    private setupMemoryInteractions;
    /**
     * Rank query results by relevance
     */
    private rankResults;
    /**
     * Set social state for social-aware memory processing
     */
    setSocialState(socialState: SocialState): void;
    /**
     * Store social memory about another agent
     */
    storeSocialMemory(targetAgentId: string, memoryType: 'interaction' | 'observation' | 'relationship' | 'collaboration', content: any, emotional: {
        valence: number;
        arousal: number;
        dominance: number;
    }, context: any): Promise<void>;
    /**
     * Query social memories about specific agent
     */
    querySocialMemories(targetAgentId: string, memoryTypes?: string[], timeRange?: {
        start: number;
        end: number;
    }, importance?: {
        min: number;
        max: number;
    }): Promise<any[]>;
    /**
     * Get relationship history with agent
     */
    getRelationshipHistory(agentId: string): Promise<any[]>;
    /**
     * Update relationship history
     */
    private updateRelationshipHistory;
    /**
     * Extract social patterns from memories
     */
    private extractSocialPattern;
    /**
     * Calculate pattern similarity
     */
    private calculatePatternSimilarity;
    /**
     * Get social patterns
     */
    getSocialPatterns(patternType?: string): Map<string, any[]>;
    /**
     * Calculate social memory importance
     */
    private calculateSocialMemoryImportance;
    /**
     * Calculate social memory decay rate
     */
    private calculateSocialMemoryDecay;
    /**
     * Get social memory statistics
     */
    getSocialMemoryStatistics(): any;
    /**
     * Cleanup old social memories
     */
    cleanupSocialMemories(): Promise<void>;
    /**
     * Cleanup old memories to maintain performance
     */
    cleanup(): Promise<void>;
}
//# sourceMappingURL=memory_system.d.ts.map