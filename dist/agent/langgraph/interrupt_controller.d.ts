/**
 * Emergency Interrupt Controller for Mindcraft LangGraph System
 * Handles emergency detection and can bypass cognitive processing for survival behaviors
 * Optimized for <100ms survival response requirements
 */
import { AgentState, InterruptPriority } from './interfaces.js';
import { PathfinderStateValidation } from './pathfinder_state.js';
interface InterruptMetrics {
    detectionTime: number;
    lastEmergencyCheck: number;
    totalDetections: number;
    emergencyDetections: number;
    averageDetectionTime: number;
}
export declare class InterruptController {
    private emergencyThresholds;
    private lastPositionCheck;
    private stuckThreshold;
    private pathfinderManager;
    private botId;
    private lastPathfinderValidation;
    private pathfinderValidationInterval;
    private lastEmergencyCheck;
    private emergencyCheckInterval;
    private cachedPriority;
    private lastCacheUpdate;
    private cacheValidityDuration;
    private metrics;
    constructor(botId: string);
    /**
     * FAST-PATH: Check current agent state for emergency conditions with caching
     * Optimized for <10ms detection time
     */
    checkEmergencyConditions(state: AgentState): InterruptPriority;
    /**
     * FAST-PATH: Optimized emergency detection with early exits
     * Prioritizes most critical conditions first
     */
    private fastEmergencyDetection;
    /**
     * Get pre-allocated emergency object to avoid GC pressure
     */
    private getPreallocatedEmergency;
    /**
     * Update performance metrics for adaptive tuning
     */
    private updateMetrics;
    /**
     * Get current performance metrics
     */
    getPerformanceMetrics(): InterruptMetrics;
    /**
     * Detect all current emergency conditions
     */
    private detectEmergencies;
    /**
     * Detect pathfinder-specific emergency conditions
     */
    private detectPathfinderEmergencies;
    /**
     * Validate and recover pathfinder state if needed
     */
    private validateAndRecoverPathfinder;
    /**
     * Trigger emergency pathfinder recovery
     */
    private triggerPathfinderEmergencyRecovery;
    /**
     * Determine if cognitive processing should be bypassed
     */
    shouldBypassCognitive(priority: InterruptPriority): boolean;
    /**
     * Preempt cognitive processing for emergency response
     */
    preemptCognitiveProcessing(priority: InterruptPriority): void;
    /**
     * Resume cognitive processing after emergency is handled
     */
    resumeCognitiveProcessing(): void;
    /**
     * Record an interrupt event in the agent's history
     */
    recordInterrupt(state: AgentState, priority: InterruptPriority, type: string, bypassedCognitive: boolean): void;
    /**
     * Get interrupt priority for emergency type
     */
    private getEmergencyPriority;
    /**
     * OPTIMIZED: Emergency detection methods with early exits and minimal computation
     */
    private isDrowning;
    private isBurning;
    private isLowHealth;
    private hasHostileNearby;
    private isStuck;
    private isFalling;
    /**
     * Calculate severity of emergency condition (0.0 to 1.0)
     */
    private calculateSeverity;
    /**
     * ENHANCED: Get comprehensive performance metrics for interrupt handling
     */
    getInterruptMetrics(state: AgentState): {
        totalInterrupts: number;
        emergencyInterrupts: number;
        averageResponseTime: number;
        bypassRate: number;
        detectionTime: number;
        cacheHitRate: number;
        adaptiveMetrics: InterruptMetrics;
    };
    /**
     * FAST-PATH: Force immediate emergency response bypassing all checks
     * Used when external systems detect critical emergencies
     */
    forceEmergencyResponse(emergencyType: string): InterruptPriority;
    /**
     * Reset performance metrics and cache
     */
    resetMetrics(): void;
    /**
     * Force cleanup of all pathfinder operations
     */
    forcePathfinderCleanup(reason?: string): void;
    /**
     * Get pathfinder state information
     */
    getPathfinderState(): {
        hasActiveOperations: boolean;
        activeOperationsCount: number;
        metrics: any;
        validation: PathfinderStateValidation;
    };
    /**
     * Reset interrupt controller state
     */
    reset(): void;
    /**
     * Update emergency thresholds based on agent performance
     */
    updateThresholds(performance: {
        survivalRate: number;
        responseTime: number;
    }): void;
}
export {};
//# sourceMappingURL=interrupt_controller.d.ts.map