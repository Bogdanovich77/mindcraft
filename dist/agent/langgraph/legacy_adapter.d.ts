/**
 * Legacy Adapter - Main compatibility layer for existing NPC system
 * Wraps the existing NPCData, ItemGoal, and BuildGoal systems to work with LangGraph
 */
import { NPCData } from '../npc/data.js';
import { NPCContoller } from '../npc/controller.js';
import { MemoryBank } from '../memory_bank.js';
import { AgentState } from './interfaces.js';
import { Agent } from '../agent.js';
/**
 * Legacy NPC Data Adapter
 * Converts between flat NPCData structure and hierarchical AgentState
 */
export declare class LegacyNPCDataAdapter {
    private npcData;
    private originalProfile;
    constructor(profileData: any);
    /**
     * Convert legacy NPCData to AgentState cognitive components
     */
    toAgentState(): Partial<AgentState>;
    /**
     * Extract purpose state from legacy profile
     */
    private extractPurposeState;
    /**
     * Extract goal state from flat NPC goals
     */
    private extractGoalState;
    /**
     * Extract skill state from legacy system
     */
    private extractSkillState;
    /**
     * Extract memory state from legacy MemoryBank
     */
    private extractMemoryState;
    /**
     * Update legacy NPCData from AgentState
     */
    updateFromAgentState(agentState: AgentState): void;
    /**
     * Get the legacy NPCData instance
     */
    getNPCData(): NPCData;
    /**
     * Get the original profile data
     */
    getOriginalProfile(): any;
    private inferCorePurpose;
    private extractPersonality;
    private extractMotivations;
    private extractValues;
    private extractEthics;
    private inferRequiredTools;
    private extractItemNameFromGoal;
    private extractQuantityFromGoal;
    private shouldDoRoutine;
    private shouldSetGoals;
}
/**
 * Legacy Controller Adapter
 * Wraps the existing NPCController to work with the new Agent interface
 */
export declare class LegacyControllerAdapter {
    private controller;
    private dataAdapter;
    private agent;
    constructor(agent: Agent, dataAdapter: LegacyNPCDataAdapter);
    /**
     * Initialize the legacy controller
     */
    initialize(): Promise<void>;
    /**
     * Execute next goal using legacy system
     */
    executeNext(): Promise<boolean>;
    /**
     * Set a goal using legacy system
     */
    setGoal(name?: string | null, quantity?: number): Promise<void>;
    /**
     * Get built positions from legacy system
     */
    getBuiltPositions(): any[];
    /**
     * Get current building from legacy system
     */
    currentBuilding(): string | null;
    /**
     * Sync state between legacy and new systems
     */
    syncState(): void;
    /**
     * Get the underlying controller for direct access if needed
     */
    getController(): NPCContoller;
}
/**
 * Legacy Memory Adapter
 * Bridges the old MemoryBank with new semantic memory system
 */
export declare class LegacyMemoryAdapter {
    private memoryBank;
    constructor(memoryData?: any);
    /**
     * Convert legacy memory to semantic memory format
     */
    toSemanticMemory(): any;
    /**
     * Remember a place using legacy system
     */
    rememberPlace(name: string, x: number, y: number, z: number): void;
    /**
     * Recall a place using legacy system
     */
    recallPlace(name: string): [number, number, number] | undefined;
    /**
     * Get legacy memory data for persistence
     */
    getLegacyMemory(): any;
    /**
     * Get the underlying memory bank
     */
    getMemoryBank(): MemoryBank;
}
//# sourceMappingURL=legacy_adapter.d.ts.map