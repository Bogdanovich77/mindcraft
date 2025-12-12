import type { WorkingMemoryItem, WorkingMemoryState, MemoryQuery, AgentState } from '../langgraph/interfaces.js';
import type { ExtendedEpisodicEvent } from './episodic_memory.js';
/**
 * Working memory system with attention management and capacity limits
 */
export declare class WorkingMemory {
    private items;
    private currentFocus;
    private capacity;
    private attentionLevel;
    private decayRate;
    private attentionWeights;
    private semanticQueryCallback?;
    constructor();
    /**
     * Initialize default working memory items
     */
    private initializeDefaultItems;
    /**
     * Update working memory with new agent state
     */
    update(agentState: AgentState, deltaTime: number): Promise<void>;
    /**
     * Add new item to working memory
     */
    addItem(item: Omit<WorkingMemoryItem, 'timestamp'>): Promise<void>;
    /**
     * Add event to working memory
     */
    addEvent(event: ExtendedEpisodicEvent): Promise<void>;
    /**
     * Query working memory
     */
    query(query: MemoryQuery): WorkingMemoryItem[];
    /**
     * Get current working memory state
     */
    getState(): WorkingMemoryState;
    /**
     * Get item by ID
     */
    getItem(id: string): WorkingMemoryItem | null;
    /**
     * Remove item by ID
     */
    removeItem(id: string): boolean;
    /**
     * Get current focus item
     */
    getFocusItem(): WorkingMemoryItem | null;
    /**
     * Set focus to specific item
     */
    setFocus(itemId: string): boolean;
    /**
     * Apply decay to all items
     */
    applyDecay(deltaTimeSeconds: number): void;
    /**
     * Register semantic query callback
     */
    onSemanticQuery(callback: (query: string) => Promise<any[]>): void;
    /**
     * Rank items by relevance to query
     */
    rankByRelevance(items: WorkingMemoryItem[], query: MemoryQuery): WorkingMemoryItem[];
    /**
     * Get memory statistics
     */
    getStatistics(): {
        itemCount: number;
        averagePriority: number;
        attentionLevel: number;
    };
    /**
     * Cleanup working memory
     */
    cleanup(): void;
    /**
     * Private helper methods
     */
    private updatePerceptions;
    private updateGoals;
    private updateAttentionLevel;
    private updateFocus;
    private getCurrentAttention;
    private replaceLowestPriority;
    private calculateRelevanceScore;
}
//# sourceMappingURL=working_memory.d.ts.map