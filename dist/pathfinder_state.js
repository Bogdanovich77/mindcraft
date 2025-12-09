/**
 * Pathfinder State Management for Mindcraft LangGraph System
 * Provides comprehensive pathfinder state tracking and cleanup during interruptions
 */
/**
 * Main interruptible pathfinder class with comprehensive state management
 */
export class InterruptiblePathfinder {
    constructor(bot) {
        this.activeOperations = new Map();
        this.operationCounter = 0;
        this.cleanupTimeouts = new Map();
        this.metrics = {
            totalOperations: 0,
            successfulOperations: 0,
            interruptedOperations: 0,
            failedOperations: 0,
            averageExecutionTime: 0,
            averageCleanupTime: 0,
            currentActiveOperations: 0,
            peakActiveOperations: 0
        };
        // Configuration
        this.DEFAULT_TIMEOUT = 30000; // 30 seconds
        this.CLEANUP_TIMEOUT = 5000; // 5 seconds for cleanup
        this.MAX_CONCURRENT_OPERATIONS = 10;
        this.bot = bot;
        this.setupPathfinderListeners();
    }
    /**
     * Start a new pathfinding operation with tracking
     */
    async startOperation(type, goal, source, options = {}) {
        const operationId = this.generateOperationId();
        const operation = {
            id: operationId,
            type,
            startTime: Date.now(),
            timeout: options.timeout || this.DEFAULT_TIMEOUT,
            goal,
            status: 'active',
            priority: options.priority || 0,
            context: {
                source,
                metadata: options.metadata
            }
        };
        // Check concurrent operation limit
        if (this.activeOperations.size >= this.MAX_CONCURRENT_OPERATIONS) {
            throw new Error(`Maximum concurrent pathfinding operations (${this.MAX_CONCURRENT_OPERATIONS}) reached`);
        }
        this.activeOperations.set(operationId, operation);
        this.updateMetrics('start', operation);
        // Set timeout for automatic cleanup
        const timeoutHandle = setTimeout(() => {
            this.handleOperationTimeout(operationId);
        }, operation.timeout);
        this.cleanupTimeouts.set(operationId, timeoutHandle);
        console.log(`[PATHFINDER] Started operation ${operationId} (${type}) from ${source}`);
        return operationId;
    }
    /**
     * Complete a pathfinding operation successfully
     */
    completeOperation(operationId, result = 'success') {
        const operation = this.activeOperations.get(operationId);
        if (!operation) {
            console.warn(`[PATHFINDER] Attempted to complete unknown operation: ${operationId}`);
            return;
        }
        const cleanupStartTime = Date.now();
        // Clear timeout
        const timeoutHandle = this.cleanupTimeouts.get(operationId);
        if (timeoutHandle) {
            clearTimeout(timeoutHandle);
            this.cleanupTimeouts.delete(operationId);
        }
        // Update operation status
        operation.status = result === 'success' ? 'completed' : result;
        const executionTime = Date.now() - operation.startTime;
        // Perform cleanup
        this.performOperationCleanup(operationId);
        // Update metrics
        this.updateMetrics(result === 'success' ? 'complete' : result === 'interrupted' ? 'interrupt' : 'fail', operation);
        const cleanupTime = Date.now() - cleanupStartTime;
        this.updateCleanupMetrics(cleanupTime);
        // Remove from active operations
        this.activeOperations.delete(operationId);
        console.log(`[PATHFINDER] Completed operation ${operationId} (${operation.type}) in ${executionTime}ms with result: ${result}`);
    }
    /**
     * Force stop all active pathfinding operations
     */
    stopAllOperations(reason = 'emergency_interrupt') {
        const startTime = Date.now();
        const operationIds = Array.from(this.activeOperations.keys());
        console.log(`[PATHFINDER] Stopping all ${operationIds.length} operations. Reason: ${reason}`);
        operationIds.forEach(operationId => {
            this.forceStopOperation(operationId, reason);
        });
        const totalTime = Date.now() - startTime;
        console.log(`[PATHFINDER] Stopped all operations in ${totalTime}ms`);
    }
    /**
     * Force stop a specific operation
     */
    forceStopOperation(operationId, reason) {
        const operation = this.activeOperations.get(operationId);
        if (!operation)
            return;
        // Clear timeout
        const timeoutHandle = this.cleanupTimeouts.get(operationId);
        if (timeoutHandle) {
            clearTimeout(timeoutHandle);
            this.cleanupTimeouts.delete(operationId);
        }
        // Force stop pathfinder
        try {
            if (this.bot.pathfinder) {
                this.bot.pathfinder.stop();
            }
        }
        catch (error) {
            console.warn(`[PATHFINDER] Error stopping pathfinder for operation ${operationId}:`, error);
        }
        // Update status
        operation.status = 'interrupted';
        // Perform cleanup
        this.performOperationCleanup(operationId);
        // Update metrics
        this.updateMetrics('interrupt', operation);
        // Remove from active operations
        this.activeOperations.delete(operationId);
        console.log(`[PATHFINDER] Force stopped operation ${operationId}. Reason: ${reason}`);
    }
    /**
     * Handle operation timeout
     */
    handleOperationTimeout(operationId) {
        const operation = this.activeOperations.get(operationId);
        if (!operation)
            return;
        console.warn(`[PATHFINDER] Operation ${operationId} timed out after ${operation.timeout}ms`);
        // Force stop the operation
        this.forceStopOperation(operationId, 'timeout');
        // Update metrics
        this.updateMetrics('timeout', operation);
    }
    /**
     * Perform cleanup for a specific operation
     */
    performOperationCleanup(operationId) {
        try {
            // Stop pathfinder if still active
            if (this.bot.pathfinder && this.bot.pathfinder.isMoving()) {
                this.bot.pathfinder.stop();
            }
            // Clear any remaining goals
            if (this.bot.pathfinder) {
                this.bot.pathfinder.setGoal(null);
            }
            // Reset controls
            this.bot.setControlState('forward', false);
            this.bot.setControlState('back', false);
            this.bot.setControlState('left', false);
            this.bot.setControlState('right', false);
            this.bot.setControlState('jump', false);
            this.bot.setControlState('sprint', false);
            // Stop digging if active
            if (this.bot.targetDigBlock) {
                this.bot.stopDigging();
            }
            // Clear timeout handle
            const timeoutHandle = this.cleanupTimeouts.get(operationId);
            if (timeoutHandle) {
                clearTimeout(timeoutHandle);
                this.cleanupTimeouts.delete(operationId);
            }
        }
        catch (error) {
            console.error(`[PATHFINDER] Error during cleanup for operation ${operationId}:`, error);
        }
    }
    /**
     * Validate current pathfinder state
     */
    validateState() {
        const issues = [];
        const corruptedOperations = [];
        const recommendations = [];
        // Check for stuck operations
        const now = Date.now();
        for (const [id, operation] of this.activeOperations) {
            const age = now - operation.startTime;
            if (age > operation.timeout * 2) {
                issues.push(`Operation ${id} is severely overdue (${age}ms vs ${operation.timeout}ms timeout)`);
                corruptedOperations.push(operation);
            }
            if (operation.status !== 'active') {
                issues.push(`Operation ${id} has inactive status (${operation.status}) but is still tracked`);
                corruptedOperations.push(operation);
            }
        }
        // Check pathfinder state consistency
        if (this.bot.pathfinder) {
            const isPathfinderMoving = this.bot.pathfinder.isMoving();
            const hasActiveOperations = this.activeOperations.size > 0;
            if (isPathfinderMoving && !hasActiveOperations) {
                issues.push('Pathfinder is moving but no active operations are tracked');
                recommendations.push('Stop pathfinder and clear state');
            }
            if (!isPathfinderMoving && hasActiveOperations) {
                issues.push('Pathfinder is not moving but active operations are tracked');
                recommendations.push('Check for stuck operations and force cleanup');
            }
        }
        // Check for memory leaks in cleanup timeouts
        if (this.cleanupTimeouts.size !== this.activeOperations.size) {
            issues.push(`Cleanup timeout map size (${this.cleanupTimeouts.size}) doesn't match active operations (${this.activeOperations.size})`);
            recommendations.push('Sync cleanup timeout map with active operations');
        }
        const isValid = issues.length === 0;
        if (!isValid) {
            console.warn(`[PATHFINDER] State validation failed: ${issues.join(', ')}`);
        }
        return {
            isValid,
            issues,
            corruptedOperations,
            recommendations
        };
    }
    /**
     * Recover from corrupted state
     */
    recoverFromCorruption() {
        console.log('[PATHFINDER] Starting state recovery...');
        const validation = this.validateState();
        // Force stop all corrupted operations
        validation.corruptedOperations.forEach(operation => {
            this.forceStopOperation(operation.id, 'state_recovery');
        });
        // Clear all cleanup timeouts
        this.cleanupTimeouts.forEach(timeout => clearTimeout(timeout));
        this.cleanupTimeouts.clear();
        // Force pathfinder stop
        try {
            if (this.bot.pathfinder) {
                this.bot.pathfinder.stop();
                this.bot.pathfinder.setGoal(null);
            }
        }
        catch (error) {
            console.warn('[PATHFINDER] Error during recovery cleanup:', error);
        }
        // Reset all controls
        this.resetAllControls();
        console.log('[PATHFINDER] State recovery completed');
    }
    /**
     * Get current performance metrics
     */
    getMetrics() {
        return { ...this.metrics };
    }
    /**
     * Get active operations information
     */
    getActiveOperations() {
        return Array.from(this.activeOperations.values());
    }
    /**
     * Check if any operations are active
     */
    hasActiveOperations() {
        return this.activeOperations.size > 0;
    }
    /**
     * Get operation by ID
     */
    getOperation(operationId) {
        return this.activeOperations.get(operationId);
    }
    /**
     * Setup pathfinder event listeners
     */
    setupPathfinderListeners() {
        if (!this.bot.pathfinder)
            return;
        // Use bot event emitter for pathfinder events
        this.bot.on('goal_reached', () => {
            // Find and complete the operation that reached its goal
            for (const [id, operation] of this.activeOperations) {
                if (operation.status === 'active') {
                    this.completeOperation(id, 'success');
                    break;
                }
            }
        });
        this.bot.on('path_update', (path) => {
            // Could add path validation here
        });
        this.bot.on('goal_updated', (goal) => {
            // Track goal updates
        });
        // Listen for pathfinder stop events
        this.bot.on('path_stop', () => {
            // Handle pathfinder stop
            console.log('[PATHFINDER] Pathfinder stopped externally');
        });
    }
    /**
     * Generate unique operation ID
     */
    generateOperationId() {
        return `pf_op_${++this.operationCounter}_${Date.now()}`;
    }
    /**
     * Update performance metrics
     */
    updateMetrics(type, operation) {
        switch (type) {
            case 'start':
                this.metrics.totalOperations++;
                this.metrics.currentActiveOperations = this.activeOperations.size;
                this.metrics.peakActiveOperations = Math.max(this.metrics.peakActiveOperations, this.activeOperations.size);
                break;
            case 'complete':
                this.metrics.successfulOperations++;
                this.metrics.currentActiveOperations = this.activeOperations.size;
                break;
            case 'interrupt':
                this.metrics.interruptedOperations++;
                this.metrics.currentActiveOperations = this.activeOperations.size;
                break;
            case 'fail':
            case 'timeout':
                this.metrics.failedOperations++;
                this.metrics.currentActiveOperations = this.activeOperations.size;
                break;
        }
        // Update average execution time
        if (type !== 'start') {
            const executionTime = Date.now() - operation.startTime;
            this.metrics.averageExecutionTime =
                (this.metrics.averageExecutionTime * (this.metrics.totalOperations - 1) + executionTime) /
                    this.metrics.totalOperations;
        }
    }
    /**
     * Update cleanup metrics
     */
    updateCleanupMetrics(cleanupTime) {
        const totalCleanups = this.metrics.successfulOperations + this.metrics.interruptedOperations + this.metrics.failedOperations;
        this.metrics.averageCleanupTime =
            (this.metrics.averageCleanupTime * (totalCleanups - 1) + cleanupTime) / totalCleanups;
    }
    /**
     * Reset all bot controls
     */
    resetAllControls() {
        this.bot.setControlState('forward', false);
        this.bot.setControlState('back', false);
        this.bot.setControlState('left', false);
        this.bot.setControlState('right', false);
        this.bot.setControlState('jump', false);
        this.bot.setControlState('sprint', false);
        this.bot.setControlState('sneak', false);
    }
    /**
     * Cleanup resources
     */
    destroy() {
        console.log('[PATHFINDER] Destroying interruptible pathfinder...');
        // Stop all operations
        this.stopAllOperations('destroy');
        // Clear all timeouts
        this.cleanupTimeouts.forEach(timeout => clearTimeout(timeout));
        this.cleanupTimeouts.clear();
        // Clear operations
        this.activeOperations.clear();
    }
}
/**
 * Centralized pathfinder state manager
 */
export class PathfinderStateManager {
    constructor() {
        this.pathfinders = new Map();
        this.globalMetrics = {
            totalOperations: 0,
            successfulOperations: 0,
            interruptedOperations: 0,
            failedOperations: 0,
            averageExecutionTime: 0,
            averageCleanupTime: 0,
            currentActiveOperations: 0,
            peakActiveOperations: 0
        };
    }
    /**
     * Get singleton instance
     */
    static getInstance() {
        if (!PathfinderStateManager.instance) {
            PathfinderStateManager.instance = new PathfinderStateManager();
        }
        return PathfinderStateManager.instance;
    }
    /**
     * Register a new pathfinder instance
     */
    registerPathfinder(botId, bot) {
        if (this.pathfinders.has(botId)) {
            throw new Error(`Pathfinder for bot ${botId} already exists`);
        }
        const pathfinder = new InterruptiblePathfinder(bot);
        this.pathfinders.set(botId, pathfinder);
        console.log(`[PATHFINDER_MANAGER] Registered pathfinder for bot ${botId}`);
        return pathfinder;
    }
    /**
     * Unregister a pathfinder instance
     */
    unregisterPathfinder(botId) {
        const pathfinder = this.pathfinders.get(botId);
        if (pathfinder) {
            pathfinder.destroy();
            this.pathfinders.delete(botId);
            console.log(`[PATHFINDER_MANAGER] Unregistered pathfinder for bot ${botId}`);
        }
    }
    /**
     * Get pathfinder instance for bot
     */
    getPathfinder(botId) {
        return this.pathfinders.get(botId);
    }
    /**
     * Stop all pathfinding operations across all bots
     */
    stopAllOperations(reason = 'global_interrupt') {
        console.log(`[PATHFINDER_MANAGER] Stopping all operations for ${this.pathfinders.size} pathfinders. Reason: ${reason}`);
        this.pathfinders.forEach((pathfinder, botId) => {
            pathfinder.stopAllOperations(reason);
        });
    }
    /**
     * Validate all pathfinder states
     */
    validateAllStates() {
        const results = {};
        this.pathfinders.forEach((pathfinder, botId) => {
            results[botId] = pathfinder.validateState();
        });
        return results;
    }
    /**
     * Recover all pathfinders from corruption
     */
    recoverAll() {
        console.log('[PATHFINDER_MANAGER] Starting global recovery...');
        this.pathfinders.forEach((pathfinder, botId) => {
            pathfinder.recoverFromCorruption();
        });
        console.log('[PATHFINDER_MANAGER] Global recovery completed');
    }
    /**
     * Get aggregated metrics across all pathfinders
     */
    getGlobalMetrics() {
        let totalOps = 0;
        let successfulOps = 0;
        let interruptedOps = 0;
        let failedOps = 0;
        let totalExecTime = 0;
        let totalCleanupTime = 0;
        let currentActive = 0;
        let peakActive = 0;
        this.pathfinders.forEach(pathfinder => {
            const metrics = pathfinder.getMetrics();
            totalOps += metrics.totalOperations;
            successfulOps += metrics.successfulOperations;
            interruptedOps += metrics.interruptedOperations;
            failedOps += metrics.failedOperations;
            totalExecTime += metrics.averageExecutionTime * metrics.totalOperations;
            totalCleanupTime += metrics.averageCleanupTime * (metrics.successfulOperations + metrics.interruptedOperations + metrics.failedOperations);
            currentActive += metrics.currentActiveOperations;
            peakActive = Math.max(peakActive, metrics.peakActiveOperations);
        });
        return {
            totalOperations: totalOps,
            successfulOperations: successfulOps,
            interruptedOperations: interruptedOps,
            failedOperations: failedOps,
            averageExecutionTime: totalOps > 0 ? totalExecTime / totalOps : 0,
            averageCleanupTime: totalOps > 0 ? totalCleanupTime / totalOps : 0,
            currentActiveOperations: currentActive,
            peakActiveOperations: peakActive
        };
    }
    /**
     * Get summary of all active operations
     */
    getAllActiveOperations() {
        const results = {};
        this.pathfinders.forEach((pathfinder, botId) => {
            results[botId] = pathfinder.getActiveOperations();
        });
        return results;
    }
    /**
     * Cleanup all pathfinders
     */
    destroy() {
        console.log('[PATHFINDER_MANAGER] Destroying all pathfinders...');
        this.pathfinders.forEach((pathfinder, botId) => {
            pathfinder.destroy();
        });
        this.pathfinders.clear();
        PathfinderStateManager.instance = null;
    }
}
PathfinderStateManager.instance = null;
