/**
 * Emergency Interrupt Controller for Mindcraft LangGraph System
 * Handles emergency detection and can bypass cognitive processing for survival behaviors
 */
import { InterruptPriority } from './interfaces.js';
import { PathfinderStateManager } from './pathfinder_state.js';
export class InterruptController {
    emergencyThresholds = {
        drowning: 0.8, // Air level below 20%
        burning: 0.9, // On fire or in lava
        low_health: 0.3, // Health below 30%
        hostile_nearby: 0.7, // Hostile mob within 8 blocks
        stuck: 0.6, // No movement for 5 seconds
        falling: 0.8, // Falling from height > 10 blocks
        pathfinder_stuck: 0.7 // Pathfinder operations stuck
    };
    lastPositionCheck = null;
    stuckThreshold = 5000; // 5 seconds without movement
    pathfinderManager;
    botId;
    lastPathfinderValidation = 0;
    pathfinderValidationInterval = 10000; // Validate every 10 seconds
    constructor(botId) {
        this.botId = botId;
        this.pathfinderManager = PathfinderStateManager.getInstance();
    }
    /**
     * Check current agent state for emergency conditions
     */
    checkEmergencyConditions(state) {
        const emergencies = this.detectEmergencies(state);
        // Add pathfinder-specific emergency detection
        this.detectPathfinderEmergencies(state, emergencies);
        state.reactive.emergencyConditions = emergencies;
        if (emergencies.length === 0) {
            return InterruptPriority.COGNITIVE;
        }
        // Find highest priority emergency
        const highestPriority = emergencies.reduce((min, emergency) => {
            const priority = this.getEmergencyPriority(emergency.type);
            return priority < min ? priority : min;
        }, InterruptPriority.COGNITIVE);
        return highestPriority;
    }
    /**
     * Detect all current emergency conditions
     */
    detectEmergencies(state) {
        const emergencies = [];
        const { context } = state;
        // Check for drowning
        if (this.isDrowning(context)) {
            emergencies.push({
                type: 'drowning',
                severity: this.calculateSeverity('drowning', context),
                detectedAt: Date.now(),
                position: { ...context.position }
            });
        }
        // Check for burning
        if (this.isBurning(context)) {
            emergencies.push({
                type: 'burning',
                severity: this.calculateSeverity('burning', context),
                detectedAt: Date.now(),
                position: { ...context.position }
            });
        }
        // Check for low health
        if (this.isLowHealth(context)) {
            emergencies.push({
                type: 'low_health',
                severity: this.calculateSeverity('low_health', context),
                detectedAt: Date.now(),
                position: { ...context.position }
            });
        }
        // Check for nearby hostile mobs
        if (this.hasHostileNearby(context)) {
            emergencies.push({
                type: 'hostile_nearby',
                severity: this.calculateSeverity('hostile_nearby', context),
                detectedAt: Date.now(),
                position: { ...context.position }
            });
        }
        // Check for stuck condition
        if (this.isStuck(state)) {
            emergencies.push({
                type: 'stuck',
                severity: this.calculateSeverity('stuck', context),
                detectedAt: Date.now(),
                position: { ...context.position }
            });
        }
        // Check for falling
        if (this.isFalling(context)) {
            emergencies.push({
                type: 'falling',
                severity: this.calculateSeverity('falling', context),
                detectedAt: Date.now(),
                position: { ...context.position }
            });
        }
        return emergencies;
    }
    /**
     * Detect pathfinder-specific emergency conditions
     */
    detectPathfinderEmergencies(state, emergencies) {
        const now = Date.now();
        // Validate pathfinder state at regular intervals
        if (now - this.lastPathfinderValidation > this.pathfinderValidationInterval) {
            this.lastPathfinderValidation = now;
            this.validateAndRecoverPathfinder();
        }
        // Check for stuck pathfinder operations
        const pathfinder = this.pathfinderManager.getPathfinder(this.botId);
        if (pathfinder && pathfinder.hasActiveOperations()) {
            const activeOperations = pathfinder.getActiveOperations();
            const stuckOperations = activeOperations.filter(op => {
                const age = now - op.startTime;
                return age > op.timeout * 1.5; // Operations over 150% of timeout are considered stuck
            });
            if (stuckOperations.length > 0) {
                emergencies.push({
                    type: 'pathfinder_stuck',
                    severity: this.calculateSeverity('pathfinder_stuck', state.context),
                    detectedAt: now,
                    position: { ...state.context.position }
                });
            }
        }
    }
    /**
     * Validate and recover pathfinder state if needed
     */
    validateAndRecoverPathfinder() {
        const pathfinder = this.pathfinderManager.getPathfinder(this.botId);
        if (!pathfinder)
            return;
        const validation = pathfinder.validateState();
        if (!validation.isValid) {
            console.warn(`[INTERRUPT] Pathfinder state validation failed for bot ${this.botId}:`, validation.issues);
            // Attempt automatic recovery for minor issues
            if (validation.corruptedOperations.length <= 3) {
                console.log(`[INTERRUPT] Attempting automatic pathfinder recovery for bot ${this.botId}`);
                pathfinder.recoverFromCorruption();
            }
            else {
                // For major corruption, trigger emergency interrupt
                console.error(`[INTERRUPT] Severe pathfinder corruption detected for bot ${this.botId}, triggering emergency recovery`);
                this.triggerPathfinderEmergencyRecovery();
            }
        }
    }
    /**
     * Trigger emergency pathfinder recovery
     */
    triggerPathfinderEmergencyRecovery() {
        console.log(`[INTERRUPT] Triggering emergency pathfinder recovery for bot ${this.botId}`);
        // Stop all pathfinder operations immediately
        const pathfinder = this.pathfinderManager.getPathfinder(this.botId);
        if (pathfinder) {
            pathfinder.stopAllOperations('emergency_corruption_recovery');
            pathfinder.recoverFromCorruption();
        }
    }
    /**
     * Determine if cognitive processing should be bypassed
     */
    shouldBypassCognitive(priority) {
        return priority <= InterruptPriority.SURVIVAL;
    }
    /**
     * Preempt cognitive processing for emergency response
     */
    preemptCognitiveProcessing(priority) {
        // This would signal the LangGraph to pause execution
        // Implementation depends on specific LangGraph integration
        console.log(`[INTERRUPT] Preempting cognitive processing - Priority: ${priority}`);
    }
    /**
     * Resume cognitive processing after emergency is handled
     */
    resumeCognitiveProcessing() {
        // This would signal the LangGraph to resume execution
        console.log(`[INTERRUPT] Resuming cognitive processing`);
    }
    /**
     * Record an interrupt event in the agent's history
     */
    recordInterrupt(state, priority, type, bypassedCognitive) {
        const event = {
            priority,
            type,
            timestamp: Date.now(),
            handled: false,
            bypassedCognitive
        };
        state.reactive.interruptHistory.push(event);
        // Keep only last 100 interrupt events to prevent memory bloat
        if (state.reactive.interruptHistory.length > 100) {
            state.reactive.interruptHistory = state.reactive.interruptHistory.slice(-100);
        }
    }
    /**
     * Get interrupt priority for emergency type
     */
    getEmergencyPriority(emergencyType) {
        switch (emergencyType) {
            case 'drowning':
            case 'burning':
            case 'falling':
                return InterruptPriority.EMERGENCY; // Life-threatening, <50ms response
            case 'low_health':
            case 'hostile_nearby':
                return InterruptPriority.SURVIVAL; // Health threat, <100ms response
            case 'stuck':
            case 'pathfinder_stuck':
                return InterruptPriority.OPPORTUNITY; // Opportunity to escape, <200ms response
            default:
                return InterruptPriority.COGNITIVE;
        }
    }
    /**
     * Emergency detection methods
     */
    isDrowning(context) {
        // Check if agent is underwater and air is low
        // This would need to be implemented based on mineflayer API
        return context.health < 20 && context.position.y < 60; // Simplified check
    }
    isBurning(context) {
        // Check if agent is on fire or in lava
        // This would need to be implemented based on mineflayer API
        return context.health < 15; // Simplified check
    }
    isLowHealth(context) {
        return context.health < 10; // Health below 5 hearts (20% of max)
    }
    hasHostileNearby(context) {
        return context.nearbyEntities.some(entity => entity.hostile && entity.distance <= 8);
    }
    isStuck(state) {
        const now = Date.now();
        const currentPos = state.context.position;
        if (!this.lastPositionCheck) {
            this.lastPositionCheck = { ...currentPos, time: now };
            return false;
        }
        // Check if agent hasn't moved significantly
        const distance = Math.sqrt(Math.pow(currentPos.x - this.lastPositionCheck.x, 2) +
            Math.pow(currentPos.y - this.lastPositionCheck.y, 2) +
            Math.pow(currentPos.z - this.lastPositionCheck.z, 2));
        if (distance < 0.5) { // Less than half block movement
            if (now - this.lastPositionCheck.time > this.stuckThreshold) {
                return true;
            }
        }
        else {
            // Agent moved, reset the stuck timer
            this.lastPositionCheck = { ...currentPos, time: now };
        }
        return false;
    }
    isFalling(context) {
        // Check if agent is falling from a dangerous height
        // This would need velocity information from mineflayer
        return context.position.y > 60 && context.health < 18; // Simplified check
    }
    /**
     * Calculate severity of emergency condition (0.0 to 1.0)
     */
    calculateSeverity(emergencyType, context) {
        const baseThreshold = this.emergencyThresholds[emergencyType] || 0.5;
        switch (emergencyType) {
            case 'drowning':
                // Severity based on how low health is
                return Math.max(0, 1 - (context.health / 20));
            case 'burning':
                // Severity based on damage taken
                return Math.max(0, 1 - (context.health / 20));
            case 'low_health':
                // Severity based on health percentage
                return Math.max(0, 1 - (context.health / 20));
            case 'hostile_nearby':
                // Severity based on distance to nearest hostile
                const nearestHostile = context.nearbyEntities
                    .filter(e => e.hostile)
                    .sort((a, b) => a.distance - b.distance)[0];
                if (nearestHostile) {
                    return Math.max(0, 1 - (nearestHostile.distance / 8));
                }
                return baseThreshold;
            case 'stuck':
                // Severity increases over time
                return baseThreshold;
            case 'pathfinder_stuck':
                // Severity based on number and age of stuck operations
                const pathfinder = this.pathfinderManager.getPathfinder(this.botId);
                if (pathfinder && pathfinder.hasActiveOperations()) {
                    const activeOperations = pathfinder.getActiveOperations();
                    const now = Date.now();
                    const stuckOps = activeOperations.filter(op => now - op.startTime > op.timeout);
                    if (stuckOps.length > 0) {
                        const maxAge = Math.max(...stuckOps.map(op => now - op.startTime));
                        const avgTimeout = activeOperations.reduce((sum, op) => sum + op.timeout, 0) / activeOperations.length;
                        return Math.min(1.0, (maxAge / avgTimeout) * baseThreshold);
                    }
                }
                return baseThreshold;
            case 'falling':
                // Severity based on height and health
                return Math.max(0, 1 - (context.health / 20));
            default:
                return baseThreshold;
        }
    }
    /**
     * Get performance metrics for interrupt handling
     */
    getInterruptMetrics(state) {
        const history = state.reactive.interruptHistory;
        const totalInterrupts = history.length;
        const emergencyInterrupts = history.filter(e => e.priority <= InterruptPriority.EMERGENCY).length;
        const bypassedCount = history.filter(e => e.bypassedCognitive).length;
        // Calculate average response time (would need timing data)
        const averageResponseTime = 75; // Placeholder - would be calculated from actual data
        const bypassRate = totalInterrupts > 0 ? bypassedCount / totalInterrupts : 0;
        return {
            totalInterrupts,
            emergencyInterrupts,
            averageResponseTime,
            bypassRate
        };
    }
    /**
     * Force cleanup of all pathfinder operations
     */
    forcePathfinderCleanup(reason = 'interrupt_controller_cleanup') {
        console.log(`[INTERRUPT] Force cleaning up pathfinder operations for bot ${this.botId}. Reason: ${reason}`);
        const pathfinder = this.pathfinderManager.getPathfinder(this.botId);
        if (pathfinder) {
            pathfinder.stopAllOperations(reason);
        }
    }
    /**
     * Get pathfinder state information
     */
    getPathfinderState() {
        const pathfinder = this.pathfinderManager.getPathfinder(this.botId);
        if (!pathfinder) {
            return {
                hasActiveOperations: false,
                activeOperationsCount: 0,
                metrics: null,
                validation: { isValid: true, issues: [], corruptedOperations: [], recommendations: [] }
            };
        }
        return {
            hasActiveOperations: pathfinder.hasActiveOperations(),
            activeOperationsCount: pathfinder.getActiveOperations().length,
            metrics: pathfinder.getMetrics(),
            validation: pathfinder.validateState()
        };
    }
    /**
     * Reset interrupt controller state
     */
    reset() {
        this.lastPositionCheck = null;
        this.lastPathfinderValidation = 0;
        // Also cleanup pathfinder state
        this.forcePathfinderCleanup('interrupt_controller_reset');
    }
    /**
     * Update emergency thresholds based on agent performance
     */
    updateThresholds(performance) {
        // Adaptive threshold adjustment based on performance
        if (performance.survivalRate < 0.8) {
            // Make agent more cautious
            Object.keys(this.emergencyThresholds).forEach(key => {
                this.emergencyThresholds[key] = Math.min(1.0, this.emergencyThresholds[key] + 0.1);
            });
        }
        else if (performance.survivalRate > 0.95 && performance.responseTime < 100) {
            // Can be less cautious if performing well
            Object.keys(this.emergencyThresholds).forEach(key => {
                this.emergencyThresholds[key] = Math.max(0.3, this.emergencyThresholds[key] - 0.05);
            });
        }
    }
}
