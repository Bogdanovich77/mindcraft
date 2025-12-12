/**
 * Pathfinder State Management for Mindcraft LangGraph System
 * Provides comprehensive pathfinder state tracking and cleanup during interruptions
 */
import { Bot } from 'mineflayer';
/**
 * Interface for tracking active pathfinding operations
 */
export interface PathfinderOperation {
    id: string;
    type: 'goto' | 'follow' | 'collect' | 'custom';
    startTime: number;
    timeout: number;
    goal: any;
    status: 'active' | 'completed' | 'interrupted' | 'failed' | 'timeout';
    priority: number;
    context: {
        source: string;
        metadata?: Record<string, any>;
    };
}
/**
 * Interface for pathfinder state validation
 */
export interface PathfinderStateValidation {
    isValid: boolean;
    issues: string[];
    corruptedOperations: PathfinderOperation[];
    recommendations: string[];
}
/**
 * Performance metrics for pathfinder operations
 */
export interface PathfinderMetrics {
    totalOperations: number;
    successfulOperations: number;
    interruptedOperations: number;
    failedOperations: number;
    averageExecutionTime: number;
    averageCleanupTime: number;
    currentActiveOperations: number;
    peakActiveOperations: number;
}
/**
 * Main interruptible pathfinder class with comprehensive state management
 */
export declare class InterruptiblePathfinder {
    private bot;
    private activeOperations;
    private operationCounter;
    private cleanupTimeouts;
    private metrics;
    private readonly DEFAULT_TIMEOUT;
    private readonly CLEANUP_TIMEOUT;
    private readonly MAX_CONCURRENT_OPERATIONS;
    constructor(bot: Bot);
    /**
     * Start a new pathfinding operation with tracking
     */
    startOperation(type: PathfinderOperation['type'], goal: any, source: string, options?: {
        timeout?: number;
        priority?: number;
        metadata?: Record<string, any>;
    }): Promise<string>;
    /**
     * Complete a pathfinding operation successfully
     */
    completeOperation(operationId: string, result?: 'success' | 'interrupted' | 'failed'): void;
    /**
     * Force stop all active pathfinding operations
     */
    stopAllOperations(reason?: string): void;
    /**
     * Force stop a specific operation
     */
    private forceStopOperation;
    /**
     * Handle operation timeout
     */
    private handleOperationTimeout;
    /**
     * Perform cleanup for a specific operation
     */
    private performOperationCleanup;
    /**
     * Validate current pathfinder state
     */
    validateState(): PathfinderStateValidation;
    /**
     * Recover from corrupted state
     */
    recoverFromCorruption(): void;
    /**
     * Get current performance metrics
     */
    getMetrics(): PathfinderMetrics;
    /**
     * Get active operations information
     */
    getActiveOperations(): PathfinderOperation[];
    /**
     * Check if any operations are active
     */
    hasActiveOperations(): boolean;
    /**
     * Get operation by ID
     */
    getOperation(operationId: string): PathfinderOperation | undefined;
    /**
     * Setup pathfinder event listeners
     */
    private setupPathfinderListeners;
    /**
     * Generate unique operation ID
     */
    private generateOperationId;
    /**
     * Update performance metrics
     */
    private updateMetrics;
    /**
     * Update cleanup metrics
     */
    private updateCleanupMetrics;
    /**
     * Reset all bot controls
     */
    private resetAllControls;
    /**
     * Cleanup resources
     */
    destroy(): void;
}
/**
 * Centralized pathfinder state manager
 */
export declare class PathfinderStateManager {
    private static instance;
    private pathfinders;
    private globalMetrics;
    private constructor();
    /**
     * Get singleton instance
     */
    static getInstance(): PathfinderStateManager;
    /**
     * Register a new pathfinder instance
     */
    registerPathfinder(botId: string, bot: Bot): InterruptiblePathfinder;
    /**
     * Unregister a pathfinder instance
     */
    unregisterPathfinder(botId: string): void;
    /**
     * Get pathfinder instance for bot
     */
    getPathfinder(botId: string): InterruptiblePathfinder | undefined;
    /**
     * Stop all pathfinding operations across all bots
     */
    stopAllOperations(reason?: string): void;
    /**
     * Validate all pathfinder states
     */
    validateAllStates(): Record<string, PathfinderStateValidation>;
    /**
     * Recover all pathfinders from corruption
     */
    recoverAll(): void;
    /**
     * Get aggregated metrics across all pathfinders
     */
    getGlobalMetrics(): PathfinderMetrics;
    /**
     * Get summary of all active operations
     */
    getAllActiveOperations(): Record<string, PathfinderOperation[]>;
    /**
     * Cleanup all pathfinders
     */
    destroy(): void;
}
//# sourceMappingURL=pathfinder_state.d.ts.map