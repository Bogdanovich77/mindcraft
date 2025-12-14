/**
 * Goal Bridge - Converts between flat legacy goals and hierarchical goal system
 * Handles goal synchronization, decomposition, and priority management
 */
import { Goal, GoalState } from './interfaces.js';
import { LegacyNPCDataAdapter } from './legacy_adapter.js';
import { NPCData } from '../npc/data.js';
/**
 * Legacy goal interface
 */
interface LegacyGoal {
    name: string;
    quantity: number;
}
/**
 * Goal conversion options
 */
interface GoalConversionOptions {
    preservePriorities: boolean;
    autoDecompose: boolean;
    estimateResources: boolean;
    createDependencies: boolean;
}
/**
 * Goal bridge class
 */
export declare class GoalBridge {
    private dataAdapter;
    private options;
    private legacyToNewMap;
    private newToLegacyMap;
    constructor(dataAdapter: LegacyNPCDataAdapter, options?: Partial<GoalConversionOptions>);
    /**
     * Convert legacy goals to hierarchical goals
     */
    convertLegacyGoals(legacyGoals: LegacyGoal[]): Goal[];
    /**
     * Convert hierarchical goals back to legacy format
     */
    convertToLegacyGoals(hierarchicalGoals: Goal[]): LegacyGoal[];
    /**
     * Synchronize goals between legacy and new systems
     */
    synchronizeGoals(legacyData: NPCData, goalState: GoalState): void;
    /**
     * Decompose a complex goal into simpler operational goals
     */
    decomposeGoal(goal: Goal): Goal[];
    /**
     * Update legacy data from hierarchical goals
     */
    updateLegacyData(goalState: GoalState, legacyData: NPCData): void;
    /**
     * Get goal mapping information
     */
    getGoalMappings(): {
        legacyToNew: Record<string, string>;
        newToLegacy: Record<string, string>;
    };
    /**
     * Clear goal mappings
     */
    clearMappings(): void;
    /**
     * Convert a single legacy goal to hierarchical format
     */
    private convertSingleLegacyGoal;
    /**
     * Extract quantity from a hierarchical goal
     */
    private extractQuantityFromGoal;
    /**
     * Extract legacy goal from hierarchical goal
     */
    private extractLegacyGoalFromHierarchical;
    /**
     * Decompose build goals into sub-goals
     */
    private decomposeBuildGoal;
    /**
     * Decompose craft goals into sub-goals
     */
    private decomposeCraftGoal;
    /**
     * Decompose collect goals into sub-goals
     */
    private decomposeCollectGoal;
    /**
     * Estimate resource requirements for a legacy goal
     */
    private estimateResources;
    /**
     * Infer required tools for a goal
     */
    private inferRequiredTools;
    /**
     * Check if a goal is a construction goal
     */
    private isConstructionGoal;
    /**
     * Merge goals, preserving existing ones and adding new ones
     */
    private mergeGoals;
}
export {};
//# sourceMappingURL=goal_bridge.d.ts.map