import { Goal, GoalExecutionContext } from './goal_types.js';
import { GoalDecompositionEngine } from './goal_decomposition.js';
import { GoalPrioritizationEngine } from './goal_prioritization.js';
import { GoalResourceManager } from './goal_resources.js';
/**
 * Legacy goal types from existing system
 */
export interface LegacyItemGoal {
    type: 'item';
    itemType: string;
    quantity: number;
    priority: number;
    active: boolean;
}
export interface LegacyBuildGoal {
    type: 'build';
    structure: string;
    location?: {
        x: number;
        y: number;
        z: number;
    };
    priority: number;
    active: boolean;
    materials?: Record<string, number>;
}
export interface LegacyGoal {
    id: string;
    type: 'item' | 'build';
    priority: number;
    active: boolean;
    data: LegacyItemGoal | LegacyBuildGoal;
}
/**
 * Migration strategies for legacy goals
 */
export declare enum MigrationStrategy {
    DIRECT_CONVERSION = "direct_conversion",// Convert directly to equivalent goal
    HIERARCHICAL_DECOMPOSITION = "hierarchical_decomposition",// Break into hierarchy
    CONTEXT_OPTIMIZATION = "context_optimization",// Optimize based on current context
    PRESERVE_BEHAVIOR = "preserve_behavior",// Maintain exact same behavior
    ENHANCE_CAPABILITY = "enhance_capability"
}
/**
 * Migration result
 */
export interface MigrationResult {
    originalLegacy: LegacyGoal;
    migratedGoals: Goal[];
    strategy: MigrationStrategy;
    success: boolean;
    errors: string[];
    warnings: string[];
    behavioralChanges: string[];
    enhancements: string[];
}
/**
 * Legacy goal bridge for migrating from flat to hierarchical goals
 */
export declare class LegacyGoalBridge {
    private decompositionEngine;
    private prioritizationEngine;
    private resourceManager;
    private migrationHistory;
    constructor(decompositionEngine: GoalDecompositionEngine, prioritizationEngine: GoalPrioritizationEngine, resourceManager: GoalResourceManager);
    /**
     * Migrate a single legacy goal to the new hierarchical system
     */
    migrateGoal(legacyGoal: LegacyGoal, context: GoalExecutionContext, strategy?: MigrationStrategy): Promise<MigrationResult>;
    /**
     * Migrate multiple legacy goals
     */
    migrateGoals(legacyGoals: LegacyGoal[], context: GoalExecutionContext, strategy?: MigrationStrategy): Promise<{
        results: MigrationResult[];
        summary: {
            total: number;
            successful: number;
            failed: number;
            totalMigratedGoals: number;
        };
    }>;
    /**
     * Create backward-compatible wrapper for new goals
     */
    createLegacyWrapper(goals: Goal[]): LegacyGoal[];
    /**
     * Migration strategy implementations
     */
    private directConversion;
    private hierarchicalDecomposition;
    private contextOptimization;
    private preserveBehavior;
    private enhanceCapability;
    /**
     * Goal creation helpers
     */
    private createOperationalGoal;
    private createStrategicGoal;
    private createTacticalGoal;
    private createBehavioralGoal;
    /**
     * Helper methods
     */
    private selectOptimalStrategy;
    private shouldPreserveBehavior;
    private hasComplexRequirements;
    private hasContextOpportunities;
    private canEnhance;
    private analyzeContextForMigration;
    private generateLearningOutcomes;
    private mapLegacyPriority;
    private validateMigration;
    private goalToLegacy;
    private mapToLegacyPriority;
    private extractMaterialsFromRequirements;
    /**
     * Get migration statistics
     */
    getMigrationStats(): {
        totalMigrations: number;
        successRate: number;
        commonStrategies: Record<MigrationStrategy, number>;
        commonErrors: string[];
    };
    /**
     * Export migration history for analysis
     */
    exportMigrationHistory(): MigrationResult[];
    /**
     * Clear migration history
     */
    clearHistory(): void;
}
/**
 * Legacy goal data access interface
 */
export interface LegacyGoalDataAccess {
    loadLegacyGoals(): Promise<LegacyGoal[]>;
    saveLegacyGoals(goals: LegacyGoal[]): Promise<void>;
    backupLegacyGoals(): Promise<string>;
}
/**
 * Default implementation of legacy data access
 */
export declare class DefaultLegacyGoalDataAccess implements LegacyGoalDataAccess {
    loadLegacyGoals(): Promise<LegacyGoal[]>;
    saveLegacyGoals(goals: LegacyGoal[]): Promise<void>;
    backupLegacyGoals(): Promise<string>;
}
//# sourceMappingURL=goal_bridge.d.ts.map