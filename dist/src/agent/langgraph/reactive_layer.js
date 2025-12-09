/**
 * Reactive Behavior Integration Layer for Mindcraft LangGraph System
 * Wraps existing modes system and integrates with cognitive processing
 * Optimized for <100ms survival response requirements
 */
import { InterruptPriority, ProcessingPhase } from './interfaces.js';
import { PathfinderStateManager } from './pathfinder_state.js';
// Pre-allocated mode objects for fast switching
const PREALLOCATED_MODES = new Map();
// Import existing modes system (would need to be adapted to ES modules)
// import { ModeController } from '../modes.js';
/**
 * OPTIMIZED: Wrapper for existing reactive modes to integrate with new architecture
 * Optimized for fast mode switching and execution
 */
export class LegacyModeWrapper {
    name;
    priority;
    legacyMode; // Would be the actual mode from modes.js
    executeFunction;
    isEmergencyMode;
    constructor(name, priority, legacyMode, executeFunction) {
        this.name = name;
        this.priority = priority;
        this.legacyMode = legacyMode;
        this.executeFunction = executeFunction;
        this.isEmergencyMode = priority <= InterruptPriority.SURVIVAL;
        // Pre-allocate mode object for fast switching
        if (!PREALLOCATED_MODES.has(name)) {
            PREALLOCATED_MODES.set(name, {
                name,
                priority,
                active: false,
                lastExecution: 0,
                executionCount: 0
            });
        }
    }
    /**
     * FAST-PATH: Execute mode with performance monitoring and optimized error handling
     */
    async execute(agent) {
        const startTime = process.hrtime.bigint();
        const modeData = PREALLOCATED_MODES.get(this.name);
        if (modeData) {
            modeData.active = true;
            modeData.lastExecution = Date.now();
            modeData.executionCount++;
        }
        try {
            // FAST-PATH: Emergency modes get optimized execution
            if (this.isEmergencyMode) {
                await this.executeEmergencyMode(agent);
            }
            else {
                await this.executeFunction(agent.bot);
            }
            // Record successful execution
            const endTime = process.hrtime.bigint();
            const executionTime = Number(endTime - startTime) / 1000000; // Convert to ms
            // Update performance metrics
            this.updateExecutionMetrics(agent, executionTime, 'success');
            // Conditional logging for performance
            if (executionTime > (this.isEmergencyMode ? 50 : 100)) {
                console.log(`[REACTIVE] Mode ${this.name} executed in ${executionTime.toFixed(1)}ms`);
            }
        }
        catch (error) {
            const endTime = process.hrtime.bigint();
            const executionTime = Number(endTime - startTime) / 1000000; // Convert to ms;
            // FAST-PATH: Optimized error handling for PathStopped
            if (error.message && error.message.includes('PathStopped')) {
                // Silent handling for performance - only log if slow
                if (executionTime > 30) {
                    console.log(`[REACTIVE] Mode ${this.name} interrupted (PathStopped) after ${executionTime.toFixed(1)}ms`);
                }
                // Fast pathfinder cleanup
                this.performFastPathfinderCleanup(agent);
                this.updateExecutionMetrics(agent, executionTime, 'interrupted');
                return; // Success - this was an expected interruption
            }
            // Handle other errors
            console.error(`[REACTIVE] Error executing mode ${this.name}:`, error.message);
            this.performFastPathfinderCleanup(agent);
            this.updateExecutionMetrics(agent, executionTime, 'error');
        }
        finally {
            if (modeData) {
                modeData.active = false;
            }
        }
    }
    /**
     * FAST-PATH: Optimized execution for emergency modes
     */
    async executeEmergencyMode(agent) {
        // Emergency modes get immediate execution with minimal overhead
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Emergency timeout')), 80); // 80ms timeout for emergencies
        });
        try {
            await Promise.race([
                this.executeFunction(agent.bot),
                timeoutPromise
            ]);
        }
        catch (error) {
            if (error.message === 'Emergency timeout') {
                console.warn(`[REACTIVE] Emergency mode ${this.name} timed out`);
                // Force pathfinder stop and continue
                if (agent.bot.pathfinder) {
                    agent.bot.pathfinder.stop();
                }
                return; // Don't fail the entire execution
            }
            throw error;
        }
    }
    /**
     * FAST-PATH: Optimized pathfinder cleanup for emergencies
     */
    performFastPathfinderCleanup(agent) {
        try {
            // Get bot ID from agent metadata
            const botId = agent.state.metadata?.agentId || 'unknown';
            const pathfinderManager = PathfinderStateManager.getInstance();
            const pathfinder = pathfinderManager.getPathfinder(botId);
            if (pathfinder) {
                // Fast cleanup without validation for emergencies
                pathfinder.stopAllOperations('emergency_interrupt');
            }
            else {
                // Fallback cleanup
                if (agent.bot.pathfinder) {
                    agent.bot.pathfinder.stop();
                    agent.bot.pathfinder.setGoal(null);
                }
                this.resetBotControls(agent.bot);
            }
        }
        catch (error) {
            // Silent error handling for performance
            // Only log if this is critical
            if (this.isEmergencyMode) {
                console.warn(`[REACTIVE] Emergency cleanup failed:`, error.message);
            }
        }
    }
    /**
     * Update execution metrics for performance monitoring
     */
    updateExecutionMetrics(agent, executionTime, result) {
        if (agent.state.executive.performanceMetrics.reactiveResponseTime) {
            agent.state.executive.performanceMetrics.reactiveResponseTime.push(executionTime);
        }
        // Update reactive layer metrics if available
        if (agent.state.reactive.metrics) {
            const metrics = agent.state.reactive.metrics;
            metrics.totalModeExecutions++;
            if (this.isEmergencyMode) {
                metrics.emergencyExecutions++;
            }
            metrics.averageExecutionTime =
                (metrics.averageExecutionTime * (metrics.totalModeExecutions - 1) + executionTime) /
                    metrics.totalModeExecutions;
            metrics.modeExecutionTime = executionTime;
        }
    }
    canHandle(state) {
        // Check if this mode can handle the current emergency conditions
        const emergencies = state.reactive.emergencyConditions;
        switch (this.name) {
            case 'self_preservation':
                return emergencies.some(e => e.type === 'drowning' || e.type === 'burning' || e.type === 'falling');
            case 'self_defense':
                return emergencies.some(e => e.type === 'hostile_nearby');
            case 'cowardice':
                return emergencies.some(e => e.type === 'hostile_nearby' || e.type === 'low_health');
            case 'unstuck':
                return emergencies.some(e => e.type === 'stuck');
            case 'hunting':
                return !emergencies.some(e => {
                    const emergencyPriority = LegacyModeWrapper.getEmergencyPriority(e.type);
                    return emergencyPriority <= InterruptPriority.SURVIVAL;
                }) && state.context.nearbyEntities.some(e => !e.hostile && e.distance < 16);
            case 'item_collecting':
                return !emergencies.some(e => {
                    const emergencyPriority = LegacyModeWrapper.getEmergencyPriority(e.type);
                    return emergencyPriority <= InterruptPriority.SURVIVAL;
                }) && state.context.nearbyBlocks.some(b => b.distance < 8);
            case 'torch_placing':
                return !emergencies.some(e => {
                    const emergencyPriority = LegacyModeWrapper.getEmergencyPriority(e.type);
                    return emergencyPriority <= InterruptPriority.SURVIVAL;
                }) && state.context.timeOfDay > 13000; // Night time
            default:
                return false;
        }
    }
    /**
     * Get interrupt priority for emergency type (static method)
     */
    static getEmergencyPriority(emergencyType) {
        switch (emergencyType) {
            case 'drowning':
            case 'burning':
            case 'falling':
                return InterruptPriority.EMERGENCY;
            case 'low_health':
            case 'hostile_nearby':
                return InterruptPriority.SURVIVAL;
            case 'stuck':
                return InterruptPriority.OPPORTUNITY;
            default:
                return InterruptPriority.COGNITIVE;
        }
    }
    /**
     * Perform enhanced pathfinder cleanup using state manager
     */
    performPathfinderCleanup(agent, reason) {
        try {
            // Get bot ID from agent metadata or use a default
            const botId = agent.state.metadata?.agentId || 'unknown';
            const pathfinderManager = PathfinderStateManager.getInstance();
            const pathfinder = pathfinderManager.getPathfinder(botId);
            if (pathfinder) {
                console.log(`[REACTIVE] Performing enhanced pathfinder cleanup for bot ${botId}. Reason: ${reason}`);
                // Stop all pathfinder operations
                pathfinder.stopAllOperations(reason);
                // Validate state after cleanup
                const validation = pathfinder.validateState();
                if (!validation.isValid) {
                    console.warn(`[REACTIVE] Pathfinder state validation failed after cleanup:`, validation.issues);
                    // Attempt recovery if there are issues
                    if (validation.corruptedOperations.length > 0) {
                        console.log(`[REACTIVE] Attempting pathfinder recovery for ${validation.corruptedOperations.length} corrupted operations`);
                        pathfinder.recoverFromCorruption();
                    }
                }
                // Log cleanup metrics
                const metrics = pathfinder.getMetrics();
                console.log(`[REACTIVE] Pathfinder cleanup completed. Active operations: ${metrics.currentActiveOperations}, Average cleanup time: ${metrics.averageCleanupTime}ms`);
            }
            else {
                // Fallback to basic cleanup if state manager not available
                console.log(`[REACTIVE] Using basic pathfinder cleanup for bot ${botId}. Reason: ${reason}`);
                if (agent.bot.pathfinder) {
                    agent.bot.pathfinder.stop();
                    agent.bot.pathfinder.setGoal(null);
                }
                // Reset bot controls
                this.resetBotControls(agent.bot);
            }
        }
        catch (cleanupError) {
            console.error(`[REACTIVE] Error during enhanced pathfinder cleanup:`, cleanupError);
            // Ultimate fallback - try to stop pathfinder directly
            try {
                if (agent.bot.pathfinder) {
                    agent.bot.pathfinder.stop();
                }
                this.resetBotControls(agent.bot);
            }
            catch (fallbackError) {
                console.error(`[REACTIVE] Even fallback pathfinder cleanup failed:`, fallbackError);
            }
        }
    }
    /**
     * Reset all bot controls to safe state
     */
    resetBotControls(bot) {
        try {
            bot.setControlState('forward', false);
            bot.setControlState('back', false);
            bot.setControlState('left', false);
            bot.setControlState('right', false);
            bot.setControlState('jump', false);
            bot.setControlState('sprint', false);
            bot.setControlState('sneak', false);
            // Stop any active digging
            if (bot.targetDigBlock) {
                bot.stopDigging();
            }
        }
        catch (error) {
            console.warn(`[REACTIVE] Error resetting bot controls:`, error);
        }
    }
}
/**
 * OPTIMIZED: Main reactive behavior layer implementation
 * Optimized for <100ms survival response requirements
 */
export class ReactiveBehaviorLayerImpl {
    modes = [];
    interruptController;
    modeController; // Would be the existing ModeController
    lastModeCheck = 0;
    modeCheckInterval = 50; // Reduced to 50ms for faster response
    pathfinderManager;
    botId;
    lastPathfinderCleanup = 0;
    pathfinderCleanupInterval = 15000; // Reduced to 15 seconds for better maintenance
    // Performance optimization: fast-path mode switching
    currentMode = null;
    lastModeSwitch = 0;
    modeSwitchCooldown = 25; // 25ms minimum between switches
    emergencyModeCache = new Map();
    // Performance metrics
    metrics = {
        modeExecutionTime: 0,
        emergencyResponseTime: 0,
        totalModeExecutions: 0,
        emergencyExecutions: 0,
        averageExecutionTime: 0,
        lastModeSwitch: 0,
        modeSwitchCount: 0
    };
    constructor(interruptController, bot, botId = 'default') {
        this.interruptController = interruptController;
        this.botId = botId;
        this.pathfinderManager = PathfinderStateManager.getInstance();
        // Register pathfinder with state manager
        this.pathfinderManager.registerPathfinder(botId, bot);
        this.initializeModes(bot);
        this.preallocateEmergencyModes();
    }
    /**
     * FAST-PATH: Pre-allocate emergency modes for instant access
     */
    preallocateEmergencyModes() {
        // Cache emergency modes for instant access
        const emergencyModeNames = ['self_preservation', 'self_defense', 'cowardice'];
        for (const mode of this.modes) {
            if (emergencyModeNames.includes(mode.name)) {
                this.emergencyModeCache.set(mode.name, mode);
            }
        }
    }
    /**
     * Initialize reactive modes from existing system
     */
    initializeModes(bot) {
        // This would integrate with the existing modes.js system
        // For now, creating placeholder wrappers
        // Self-preservation modes (highest priority)
        this.modes.push(new LegacyModeWrapper('self_preservation', InterruptPriority.EMERGENCY, null, // Would be actual mode from modes.js
        async (bot) => {
            // Placeholder implementation
            console.log('[REACTIVE] Executing self preservation mode');
            // Would call actual self preservation logic
        }));
        // Defense modes
        this.modes.push(new LegacyModeWrapper('self_defense', InterruptPriority.SURVIVAL, null, async (bot) => {
            console.log('[REACTIVE] Executing self defense mode');
            // Would call actual defense logic
        }));
        // Escape modes
        this.modes.push(new LegacyModeWrapper('cowardice', InterruptPriority.SURVIVAL, null, async (bot) => {
            console.log('[REACTIVE] Executing cowardice mode');
            // Would call actual escape logic
        }));
        // Utility modes
        this.modes.push(new LegacyModeWrapper('unstuck', InterruptPriority.OPPORTUNITY, null, async (bot) => {
            console.log('[REACTIVE] Executing unstuck mode');
            // Would call actual unstuck logic
        }));
        // Opportunistic modes (lowest priority)
        this.modes.push(new LegacyModeWrapper('hunting', InterruptPriority.COGNITIVE, null, async (bot) => {
            console.log('[REACTIVE] Executing hunting mode');
            // Would call actual hunting logic
        }));
        this.modes.push(new LegacyModeWrapper('item_collecting', InterruptPriority.COGNITIVE, null, async (bot) => {
            console.log('[REACTIVE] Executing item collecting mode');
            // Would call actual item collection logic
        }));
        this.modes.push(new LegacyModeWrapper('torch_placing', InterruptPriority.COGNITIVE, null, async (bot) => {
            console.log('[REACTIVE] Executing torch placing mode');
            // Would call actual torch placing logic
        }));
        // Sort modes by priority (lower number = higher priority)
        this.modes.sort((a, b) => a.priority - b.priority);
    }
    /**
     * FAST-PATH: Optimized main update loop for reactive behavior layer
     * Prioritizes emergency detection and response
     */
    async update(agent, deltaTime) {
        const startTime = process.hrtime.bigint();
        const now = Date.now();
        // FAST-PATH: Emergency detection first (highest priority)
        const priority = this.interruptController.checkEmergencyConditions(agent.state);
        // If emergency detected, execute immediate response and bypass everything else
        if (priority <= InterruptPriority.SURVIVAL) {
            await this.executeFastEmergencyResponse(agent, priority);
            this.updateMetrics(startTime, priority);
            return; // Early exit for emergencies
        }
        // Only perform maintenance if no emergency and enough time has passed
        if (now - this.lastPathfinderCleanup > this.pathfinderCleanupInterval) {
            // Non-blocking maintenance
            this.performPeriodicPathfinderMaintenance(agent).catch(() => { }); // Ignore errors for performance
            this.lastPathfinderCleanup = now;
        }
        // Check for opportunistic behaviors at regular intervals (reduced frequency)
        if (now - this.lastModeCheck > this.modeCheckInterval) {
            await this.checkOpportunisticBehaviors(agent);
            this.lastModeCheck = now;
        }
        // Monitor cognitive processing and interrupt if needed (only if not in reflection)
        if (agent.state.cognitive.processing.currentPhase !== ProcessingPhase.REFLECTION) {
            await this.monitorAndInterruptIfNeeded(agent);
        }
        this.updateMetrics(startTime, priority);
    }
    /**
     * FAST-PATH: Optimized emergency response with minimal overhead
     */
    async executeFastEmergencyResponse(agent, priority) {
        const responseStart = process.hrtime.bigint();
        try {
            // FAST-PATH: Use cached emergency mode for instant access
            const emergencyType = agent.state.reactive.emergencyConditions[0]?.type;
            let activeMode = null;
            if (emergencyType) {
                // Try to get cached emergency mode
                switch (emergencyType) {
                    case 'drowning':
                    case 'burning':
                    case 'falling':
                        activeMode = this.emergencyModeCache.get('self_preservation');
                        break;
                    case 'hostile_nearby':
                        activeMode = this.emergencyModeCache.get('self_defense');
                        break;
                    case 'low_health':
                        activeMode = this.emergencyModeCache.get('cowardice');
                        break;
                }
            }
            // Fallback to mode selection if cache miss
            if (!activeMode) {
                activeMode = this.selectReactiveMode(agent, priority);
            }
            if (!activeMode) {
                console.warn('[REACTIVE] No emergency mode available for priority:', priority);
                return;
            }
            // Fast mode switch with cooldown check
            if (this.canSwitchMode(activeMode)) {
                await this.executeModeWithTimeout(agent, activeMode, priority);
                this.recordModeSwitch(activeMode);
            }
            // Update agent state
            agent.state.reactive.lastReactiveAction = {
                mode: activeMode.name,
                priority,
                timestamp: Date.now(),
                context: agent.state.context,
                action: activeMode.name,
                result: 'success'
            };
            const responseTime = Number(process.hrtime.bigint() - responseStart) / 1000000;
            this.metrics.emergencyResponseTime = responseTime;
            this.metrics.emergencyExecutions++;
            // Validate performance requirements
            if (priority <= InterruptPriority.EMERGENCY && responseTime > 50) {
                console.warn(`[REACTIVE] Emergency response took ${responseTime.toFixed(1)}ms (target: <50ms)`);
            }
            else if (priority === InterruptPriority.SURVIVAL && responseTime > 100) {
                console.warn(`[REACTIVE] Survival response took ${responseTime.toFixed(1)}ms (target: <100ms)`);
            }
        }
        catch (error) {
            console.error('[REACTIVE] Emergency response failed:', error.message);
            // Record failed response
            agent.state.reactive.lastReactiveAction = {
                mode: 'emergency_failed',
                priority,
                timestamp: Date.now(),
                context: agent.state.context,
                action: 'none',
                result: 'failed'
            };
        }
    }
    /**
     * FAST-PATH: Execute mode with timeout and performance monitoring
     */
    async executeModeWithTimeout(agent, mode, priority) {
        const timeout = priority <= InterruptPriority.EMERGENCY ? 80 : 150; // Different timeouts for different priorities
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Mode execution timeout')), timeout);
        });
        try {
            await Promise.race([
                mode.execute(agent),
                timeoutPromise
            ]);
        }
        catch (error) {
            if (error.message === 'Mode execution timeout') {
                console.warn(`[REACTIVE] Mode ${mode.name} timed out after ${timeout}ms`);
                // Force cleanup and continue
                this.forcePathfinderCleanup('mode_timeout');
                return; // Don't fail the entire execution
            }
            throw error;
        }
    }
    /**
     * FAST-PATH: Check if mode can be switched (implements cooldown)
     */
    canSwitchMode(mode) {
        const now = Date.now();
        // Emergency modes can always switch
        if (mode.priority <= InterruptPriority.SURVIVAL) {
            return true;
        }
        // Non-emergency modes respect cooldown
        return now - this.lastModeSwitch > this.modeSwitchCooldown;
    }
    /**
     * Record mode switch for metrics
     */
    recordModeSwitch(mode) {
        this.currentMode = mode;
        this.lastModeSwitch = Date.now();
        this.metrics.modeSwitchCount++;
        this.metrics.lastModeSwitch = this.lastModeSwitch;
    }
    /**
     * Update performance metrics
     */
    updateMetrics(startTime, priority) {
        const executionTime = Number(process.hrtime.bigint() - startTime) / 1000000;
        this.metrics.totalModeExecutions++;
        this.metrics.modeExecutionTime = executionTime;
        this.metrics.averageExecutionTime =
            (this.metrics.averageExecutionTime * (this.metrics.totalModeExecutions - 1) + executionTime) /
                this.metrics.totalModeExecutions;
    }
    /**
     * Check emergency conditions (delegates to interrupt controller)
     */
    checkEmergencyConditions(state) {
        return this.interruptController.checkEmergencyConditions(state);
    }
    /**
     * Execute immediate reactive response for emergencies
     */
    async executeReactiveResponse(agent, priority) {
        const startTime = Date.now();
        try {
            // Select appropriate reactive mode
            const activeMode = this.selectReactiveMode(agent, priority);
            if (!activeMode) {
                console.warn('[REACTIVE] No suitable mode found for priority:', priority);
                return;
            }
            // Record interrupt before execution
            // Note: recordInterrupt would need to be added to InterruptController interface
            // this.interruptController.recordInterrupt(
            //   agent.state,
            //   priority,
            //   activeMode.name,
            //   true // Bypassed cognitive processing
            // );
            // Execute the reactive mode
            await activeMode.execute(agent);
            // Update agent state with reactive action context
            agent.state.reactive.lastReactiveAction = {
                mode: activeMode.name,
                priority,
                timestamp: Date.now(),
                context: agent.state.context,
                action: activeMode.name,
                result: 'success'
            };
            const executionTime = Date.now() - startTime;
            console.log(`[REACTIVE] Emergency response completed in ${executionTime}ms`);
            // Validate response time requirements
            if (priority <= InterruptPriority.EMERGENCY && executionTime > 50) {
                console.warn(`[REACTIVE] Emergency response took ${executionTime}ms (target: <50ms)`);
            }
            else if (priority === InterruptPriority.SURVIVAL && executionTime > 100) {
                console.warn(`[REACTIVE] Survival response took ${executionTime}ms (target: <100ms)`);
            }
        }
        catch (error) {
            console.error('[REACTIVE] Error during emergency response:', error);
            // Record failed response
            agent.state.reactive.lastReactiveAction = {
                mode: 'emergency_failed',
                priority,
                timestamp: Date.now(),
                context: agent.state.context,
                action: 'none',
                result: 'failed'
            };
        }
    }
    /**
     * Select the best reactive mode for current situation
     */
    selectReactiveMode(agent, priority) {
        // Find modes that can handle the current situation and match priority
        const suitableModes = this.modes.filter(mode => mode.priority === priority && mode.canHandle(agent.state));
        if (suitableModes.length === 0) {
            // If no exact priority match, try lower priority modes
            const fallbackModes = this.modes.filter(mode => mode.priority > priority && mode.canHandle(agent.state));
            if (fallbackModes.length > 0) {
                return fallbackModes[0];
            }
            // Return a default mode that does nothing
            return new LegacyModeWrapper('none', InterruptPriority.COGNITIVE, null, async (bot) => {
                // Do nothing
            });
        }
        // Return highest priority suitable mode
        return suitableModes[0];
    }
    /**
     * Check for opportunistic behaviors when no emergencies are present
     */
    async checkOpportunisticBehaviors(agent) {
        // Only check opportunistic modes if no emergency conditions
        const priority = this.interruptController.checkEmergencyConditions(agent.state);
        if (priority > InterruptPriority.OPPORTUNITY) {
            const opportunisticModes = this.modes.filter(mode => mode.priority === InterruptPriority.OPPORTUNITY && mode.canHandle(agent.state));
            if (opportunisticModes.length > 0) {
                const selectedMode = opportunisticModes[0];
                // Don't interrupt cognitive processing for opportunities,
                // but queue them for potential execution
                console.log(`[REACTIVE] Opportunity detected: ${selectedMode.name}`);
                // Could add to cognitive consideration queue
                // For now, just logging
            }
        }
    }
    /**
     * Monitor cognitive processing and interrupt if new emergencies arise
     */
    async monitorAndInterruptIfNeeded(agent) {
        const currentPriority = this.interruptController.checkEmergencyConditions(agent.state);
        if (currentPriority <= InterruptPriority.SURVIVAL) {
            console.log(`[REACTIVE] Interrupting cognitive processing for emergency (priority: ${currentPriority})`);
            // Signal cognitive processing to stop
            this.interruptController.preemptCognitiveProcessing(currentPriority);
            // Execute emergency response
            await this.executeReactiveResponse(agent, currentPriority);
            // Resume cognitive processing after emergency is handled
            this.interruptController.resumeCognitiveProcessing();
        }
    }
    /**
     * Get performance metrics for reactive layer
     */
    getPerformanceMetrics() {
        const modeUsage = {};
        // Calculate mode usage statistics
        this.modes.forEach(mode => {
            modeUsage[mode.name] = 0; // Would be calculated from actual usage data
        });
        return {
            totalModes: this.modes.length,
            averageResponseTime: 75, // Placeholder - would be calculated from actual data
            emergencyResponseRate: 0.1, // Placeholder - would be calculated from actual data
            modeUsageStats: modeUsage
        };
    }
    /**
     * Update reactive layer parameters based on performance
     */
    updateParameters(performance) {
        // Adaptive adjustment of mode check interval
        if (performance.responseTime > 100) {
            // Increase check interval if responses are slow
            this.modeCheckInterval = Math.min(200, this.modeCheckInterval + 10);
        }
        else if (performance.responseTime < 50) {
            // Decrease check interval if responses are fast
            this.modeCheckInterval = Math.max(50, this.modeCheckInterval - 10);
        }
        console.log(`[REACTIVE] Updated mode check interval to ${this.modeCheckInterval}ms`);
    }
    /**
     * Perform periodic pathfinder maintenance
     */
    async performPeriodicPathfinderMaintenance(agent) {
        try {
            const pathfinder = this.pathfinderManager.getPathfinder(this.botId);
            if (!pathfinder)
                return;
            console.log(`[REACTIVE] Performing periodic pathfinder maintenance for bot ${this.botId}`);
            // Validate current state
            const validation = pathfinder.validateState();
            if (!validation.isValid) {
                console.warn(`[REACTIVE] Pathfinder state issues detected:`, validation.issues);
                // Attempt recovery for minor issues
                if (validation.corruptedOperations.length <= 2) {
                    console.log(`[REACTIVE] Attempting automatic recovery for ${validation.corruptedOperations.length} corrupted operations`);
                    pathfinder.recoverFromCorruption();
                }
                else {
                    // For major issues, force complete cleanup
                    console.log(`[REACTIVE] Major pathfinder corruption detected, forcing complete cleanup`);
                    pathfinder.stopAllOperations('periodic_maintenance_cleanup');
                    pathfinder.recoverFromCorruption();
                }
            }
            // Log performance metrics
            const metrics = pathfinder.getMetrics();
            if (metrics.currentActiveOperations > 0) {
                console.log(`[REACTIVE] Pathfinder status: ${metrics.currentActiveOperations} active operations, ${metrics.interruptedOperations} interrupted, ${metrics.averageCleanupTime}ms avg cleanup`);
            }
            // Check for memory leaks or performance issues
            if (metrics.currentActiveOperations > 5) {
                console.warn(`[REACTIVE] High number of active pathfinder operations (${metrics.currentActiveOperations}), may indicate stuck operations`);
                // Force cleanup of old operations
                const activeOps = pathfinder.getActiveOperations();
                const now = Date.now();
                const oldOps = activeOps.filter(op => now - op.startTime > 60000); // Operations older than 1 minute
                if (oldOps.length > 0) {
                    console.log(`[REACTIVE] Cleaning up ${oldOps.length} old pathfinder operations`);
                    oldOps.forEach(op => {
                        pathfinder.stopAllOperations('old_operation_cleanup');
                    });
                }
            }
        }
        catch (error) {
            console.error(`[REACTIVE] Error during periodic pathfinder maintenance:`, error);
        }
    }
    /**
     * Get pathfinder state information for debugging
     */
    getPathfinderState() {
        const pathfinder = this.pathfinderManager.getPathfinder(this.botId);
        if (!pathfinder) {
            return { available: false };
        }
        return {
            available: true,
            activeOperations: pathfinder.getActiveOperations(),
            metrics: pathfinder.getMetrics(),
            validation: pathfinder.validateState()
        };
    }
    /**
     * Force pathfinder cleanup (for emergency situations)
     */
    forcePathfinderCleanup(reason = 'manual_force_cleanup') {
        console.log(`[REACTIVE] Force cleaning up pathfinder for bot ${this.botId}. Reason: ${reason}`);
        const pathfinder = this.pathfinderManager.getPathfinder(this.botId);
        if (pathfinder) {
            pathfinder.stopAllOperations(reason);
            pathfinder.recoverFromCorruption();
        }
    }
    /**
     * Reset reactive layer state
     */
    reset() {
        this.lastModeCheck = 0;
        this.lastPathfinderCleanup = 0;
        // Cleanup pathfinder state
        this.forcePathfinderCleanup('reactive_layer_reset');
        console.log('[REACTIVE] Reactive layer reset');
    }
    /**
     * Cleanup resources when destroying the reactive layer
     */
    destroy() {
        console.log(`[REACTIVE] Destroying reactive layer for bot ${this.botId}`);
        // Unregister pathfinder from state manager
        this.pathfinderManager.unregisterPathfinder(this.botId);
        console.log('[REACTIVE] Reactive layer destroyed');
    }
}
// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================
/**
 * Create reactive behavior layer with existing modes system integration
 */
export function createReactiveBehaviorLayer(interruptController, bot) {
    const layer = new ReactiveBehaviorLayerImpl(interruptController, bot);
    return layer;
}
/**
 * Bridge between existing ModeController and new reactive layer
 */
export class ModeControllerBridge {
    legacyModeController; // Would be existing ModeController
    reactiveLayer;
    constructor(legacyModeController, reactiveLayer) {
        this.legacyModeController = legacyModeController;
        this.reactiveLayer = reactiveLayer;
    }
    /**
     * Update legacy mode controller state from reactive layer
     */
    syncLegacyState() {
        // Sync state between legacy and new systems
        // This would ensure backward compatibility
    }
    /**
     * Get current active mode from legacy system
     */
    getCurrentMode() {
        // Would get current mode from legacy system
        return 'none';
    }
    /**
     * Set mode in legacy system
     */
    setMode(modeName) {
        // Would set mode in legacy system
        console.log(`[BRIDGE] Setting legacy mode to: ${modeName}`);
    }
}
