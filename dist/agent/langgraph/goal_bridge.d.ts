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
    /**
     * Extract quantity from hierarchical goal
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
     * Check if an item is a tool
     */
    private isTool;
}
/**
 * Goal bridge factory
 */
export declare class GoalBridgeFactory {
    /**
     * Create goal bridge with default options
     */
    static create(dataAdapter: LegacyNPCDataAdapter): GoalBridge;
    /**
     * Create goal bridge for development
     */
    static createForDevelopment(dataAdapter: LegacyNPCDataAdapter): GoalBridge;
    /**
     * Create goal bridge for production
     */
    static createForProduction(dataAdapter: LegacyNPCDataAdapter): GoalBridge;
}
/**
 * Goal utilities
 */
export declare class GoalUtils {
    /**
     * Check if a goal is achievable with current resources
     */
    static isAchievable(goal: Goal, availableResources: any): boolean;
    /**
     * Calculate goal priority based on multiple factors
     */
    static calculatePriority(goal: Goal, context: any): number;
    /**
     * Sort goals by priority
     */
    static sortGoals(goals: Goal[], context?: any): Goal[];
}
export {};
//# sourceMappingURL=goal_bridge.d.ts.map