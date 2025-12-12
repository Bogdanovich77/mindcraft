/**
 * Reactive Behavior Integration Layer for Mindcraft LangGraph System
 * Wraps existing modes system and integrates with cognitive processing
 * Optimized for <100ms survival response requirements
 */
import { AgentState, InterruptPriority, ReactiveMode, ReactiveBehaviorLayer, InterruptController, Agent } from './interfaces.js';
import { Bot } from 'mineflayer';
/**
 * OPTIMIZED: Wrapper for existing reactive modes to integrate with new architecture
 * Optimized for fast mode switching and execution
 */
export declare class LegacyModeWrapper implements ReactiveMode {
    readonly name: string;
    readonly priority: InterruptPriority;
    private legacyMode;
    private executeFunction;
    private isEmergencyMode;
    constructor(name: string, priority: InterruptPriority, legacyMode: any, executeFunction: (bot: Bot) => Promise<void>);
    /**
     * FAST-PATH: Execute mode with performance monitoring and optimized error handling
     */
    execute(agent: Agent): Promise<void>;
    /**
     * FAST-PATH: Optimized execution for emergency modes
     */
    private executeEmergencyMode;
    /**
     * FAST-PATH: Optimized pathfinder cleanup for emergencies
     */
    private performFastPathfinderCleanup;
    /**
     * Update execution metrics for performance monitoring
     */
    private updateExecutionMetrics;
    canHandle(state: AgentState): boolean;
    /**
     * Get interrupt priority for emergency type (static method)
     */
    static getEmergencyPriority(emergencyType: string): InterruptPriority;
    /**
     * Perform enhanced pathfinder cleanup using state manager
     */
    private performPathfinderCleanup;
    /**
     * Reset all bot controls to safe state
     */
    private resetBotControls;
}
/**
 * OPTIMIZED: Main reactive behavior layer implementation
 * Optimized for <100ms survival response requirements
 */
export declare class ReactiveBehaviorLayerImpl implements ReactiveBehaviorLayer {
    private modes;
    private interruptController;
    private modeController;
    private lastModeCheck;
    private modeCheckInterval;
    private pathfinderManager;
    private botId;
    private lastPathfinderCleanup;
    private pathfinderCleanupInterval;
    private currentMode;
    private lastModeSwitch;
    private modeSwitchCooldown;
    private emergencyModeCache;
    private metrics;
    constructor(interruptController: InterruptController, bot: Bot, botId?: string);
    /**
     * FAST-PATH: Pre-allocate emergency modes for instant access
     */
    private preallocateEmergencyModes;
    /**
     * Initialize reactive modes from existing system
     */
    private initializeModes;
    /**
     * FAST-PATH: Optimized main update loop for reactive behavior layer
     * Prioritizes emergency detection and response
     */
    update(agent: Agent, deltaTime: number): Promise<void>;
    /**
     * FAST-PATH: Optimized emergency response with minimal overhead
     */
    private executeFastEmergencyResponse;
    /**
     * FAST-PATH: Execute mode with timeout and performance monitoring
     */
    private executeModeWithTimeout;
    /**
     * FAST-PATH: Check if mode can be switched (implements cooldown)
     */
    private canSwitchMode;
    /**
     * Record mode switch for metrics
     */
    private recordModeSwitch;
    /**
     * Update performance metrics
     */
    private updateMetrics;
    /**
     * Check emergency conditions (delegates to interrupt controller)
     */
    checkEmergencyConditions(state: AgentState): InterruptPriority;
    /**
     * Execute immediate reactive response for emergencies
     */
    executeReactiveResponse(agent: Agent, priority: InterruptPriority): Promise<void>;
    /**
     * Select the best reactive mode for current situation
     */
    selectReactiveMode(agent: Agent, priority: InterruptPriority): ReactiveMode;
    /**
     * Check for opportunistic behaviors when no emergencies are present
     */
    private checkOpportunisticBehaviors;
    /**
     * Monitor cognitive processing and interrupt if new emergencies arise
     */
    private monitorAndInterruptIfNeeded;
    /**
     * Get performance metrics for reactive layer
     */
    getPerformanceMetrics(): {
        totalModes: number;
        averageResponseTime: number;
        emergencyResponseRate: number;
        modeUsageStats: Record<string, number>;
    };
    /**
     * Update reactive layer parameters based on performance
     */
    updateParameters(performance: {
        responseTime: number;
        successRate: number;
        emergencyRate: number;
    }): void;
    /**
     * Perform periodic pathfinder maintenance
     */
    private performPeriodicPathfinderMaintenance;
    /**
     * Get pathfinder state information for debugging
     */
    getPathfinderState(): any;
    /**
     * Force pathfinder cleanup (for emergency situations)
     */
    forcePathfinderCleanup(reason?: string): void;
    /**
     * Reset reactive layer state
     */
    reset(): void;
    /**
     * Cleanup resources when destroying the reactive layer
     */
    destroy(): void;
}
/**
 * Create reactive behavior layer with existing modes system integration
 */
export declare function createReactiveBehaviorLayer(interruptController: InterruptController, bot: Bot): ReactiveBehaviorLayer;
/**
 * Bridge between existing ModeController and new reactive layer
 */
export declare class ModeControllerBridge {
    private legacyModeController;
    private reactiveLayer;
    constructor(legacyModeController: any, reactiveLayer: ReactiveBehaviorLayer);
    /**
     * Update legacy mode controller state from reactive layer
     */
    syncLegacyState(): void;
    /**
     * Get current active mode from legacy system
     */
    getCurrentMode(): string;
    /**
     * Set mode in legacy system
     */
    setMode(modeName: string): void;
}
//# sourceMappingURL=reactive_layer.d.ts.map