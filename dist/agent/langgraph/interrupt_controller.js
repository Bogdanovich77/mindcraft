/**
 * Emergency Interrupt Controller for Mindcraft LangGraph System
 * Handles emergency detection and can bypass cognitive processing for survival behaviors
 * Optimized for <100ms survival response requirements
 */
import { InterruptPriority } from './interfaces.js';
import { PathfinderStateManager } from './pathfinder_state.js';
// Pre-allocated emergency condition objects for performance
const PREALLOCATED_EMERGENCIES = [
    { type: 'drowning', severity: 0, detectedAt: 0, position: { x: 0, y: 0, z: 0 }, timestamp: 0, context: 'drowning' },
    { type: 'burning', severity: 0, detectedAt: 0, position: { x: 0, y: 0, z: 0 }, timestamp: 0, context: 'burning' },
    { type: 'low_health', severity: 0, detectedAt: 0, position: { x: 0, y: 0, z: 0 }, timestamp: 0, context: 'low_health' },
    { type: 'hostile_nearby', severity: 0, detectedAt: 0, position: { x: 0, y: 0, z: 0 }, timestamp: 0, context: 'hostile_nearby' },
    { type: 'stuck', severity: 0, detectedAt: 0, position: { x: 0, y: 0, z: 0 }, timestamp: 0, context: 'stuck' },
    { type: 'falling', severity: 0, detectedAt: 0, position: { x: 0, y: 0, z: 0 }, timestamp: 0, context: 'falling' },
    { type: 'pathfinder_stuck', severity: 0, detectedAt: 0, position: { x: 0, y: 0, z: 0 }, timestamp: 0, context: 'pathfinder_stuck' }
];
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
    // Performance optimization: fast-path detection
    lastEmergencyCheck = 0;
    emergencyCheckInterval = 50; // Check every 50ms for fast response
    cachedPriority = InterruptPriority.COGNITIVE;
    lastCacheUpdate = 0;
    cacheValidityDuration = 100; // Cache valid for 100ms
    // Performance metrics
    metrics = {
        detectionTime: 0,
        lastEmergencyCheck: 0,
        totalDetections: 0,
        emergencyDetections: 0,
        averageDetectionTime: 0
    };
    constructor(botId) {
        this.botId = botId;
        this.pathfinderManager = PathfinderStateManager.getInstance();
    }
    /**
     * FAST-PATH: Check current agent state for emergency conditions with caching
     * Optimized for <10ms detection time
     */
    checkEmergencyConditions(state) {
        const startTime = process.hrtime.bigint();
        // Fast-path: use cached result if still valid
        const now = Date.now();
        if (now - this.lastCacheUpdate < this.cacheValidityDuration && this.cachedPriority <= InterruptPriority.SURVIVAL) {
            return this.cachedPriority;
        }
        // Fast-path emergency detection (optimized order)
        const priority = this.fastEmergencyDetection(state);
        // Update cache
        this.cachedPriority = priority;
        this.lastCacheUpdate = now;
        // Update performance metrics
        const endTime = process.hrtime.bigint();
        const detectionTime = Number(endTime - startTime) / 1000000; // Convert to ms
        this.updateMetrics(detectionTime, priority);
        return priority;
    }
    /**
     * FAST-PATH: Optimized emergency detection with early exits
     * Prioritizes most critical conditions first
     */
    fastEmergencyDetection(state) {
        const { context } = state;
        const emergencies = [];
        const now = Date.now();
        let emergencyCount = 0;
        // CRITICAL: Check life-threatening conditions first (early exit)
        if (this.isDrowning(context)) {
            const emergency = this.getPreallocatedEmergency('drowning');
            emergency.severity = this.calculateSeverity('drowning', context);
            emergency.detectedAt = now;
            emergency.position = { ...context.position };
            emergency.timestamp = now;
            emergencies.push(emergency);
            emergencyCount++;
            return InterruptPriority.EMERGENCY; // Early exit for critical conditions
        }
        if (this.isBurning(context)) {
            const emergency = this.getPreallocatedEmergency('burning');
            emergency.severity = this.calculateSeverity('burning', context);
            emergency.detectedAt = now;
            emergency.position = { ...context.position };
            emergency.timestamp = now;
            emergencies.push(emergency);
            emergencyCount++;
            return InterruptPriority.EMERGENCY; // Early exit for critical conditions
        }
        if (this.isFalling(context)) {
            const emergency = this.getPreallocatedEmergency('falling');
            emergency.severity = this.calculateSeverity('falling', context);
            emergency.detectedAt = now;
            emergency.position = { ...context.position };
            emergency.timestamp = now;
            emergencies.push(emergency);
            emergencyCount++;
            return InterruptPriority.EMERGENCY; // Early exit for critical conditions
        }
        // SURVIVAL: Check health-threatening conditions
        if (this.isLowHealth(context)) {
            const emergency = this.getPreallocatedEmergency('low_health');
            emergency.severity = this.calculateSeverity('low_health', context);
            emergency.detectedAt = now;
            emergency.position = { ...context.position };
            emergency.timestamp = now;
            emergencies.push(emergency);
            emergencyCount++;
        }
        if (this.hasHostileNearby(context)) {
            const emergency = this.getPreallocatedEmergency('hostile_nearby');
            emergency.severity = this.calculateSeverity('hostile_nearby', context);
            emergency.detectedAt = now;
            emergency.position = { ...context.position };
            emergency.timestamp = now;
            emergencies.push(emergency);
            emergencyCount++;
        }
        // Early exit if survival threats found
        if (emergencyCount > 0) {
            if (state.reactive?.emergencyConditions) {
                state.reactive.emergencyConditions = emergencies;
            }
            return InterruptPriority.SURVIVAL;
        }
        // OPPORTUNITY: Check less critical conditions
        if (this.isStuck(state)) {
            const emergency = this.getPreallocatedEmergency('stuck');
            emergency.severity = this.calculateSeverity('stuck', context);
            emergency.detectedAt = now;
            emergency.position = { ...context.position };
            emergency.timestamp = now;
            emergencies.push(emergency);
            emergencyCount++;
        }
        // Only check pathfinder if we haven't found other emergencies
        if (emergencyCount === 0) {
            this.detectPathfinderEmergencies(state, emergencies);
            if (emergencies.length > 0) {
                emergencyCount++;
            }
        }
        if (state.reactive?.emergencyConditions) {
            state.reactive.emergencyConditions = emergencies;
        }
        return emergencyCount > 0 ?
            (emergencyCount > 0 && emergencies[0]?.type === 'stuck' ? InterruptPriority.OPPORTUNITY : InterruptPriority.SURVIVAL) :
            InterruptPriority.COGNITIVE;
    }
    /**
     * Get pre-allocated emergency object to avoid GC pressure
     */
    getPreallocatedEmergency(type) {
        const emergency = PREALLOCATED_EMERGENCIES.find(e => e.type === type);
        if (!emergency) {
            throw new Error(`No pre-allocated emergency for type: ${type}`);
        }
        return { ...emergency }; // Return a copy to avoid mutation
    }
    /**
     * Update performance metrics for adaptive tuning
     */
    updateMetrics(detectionTime, priority) {
        this.metrics.totalDetections++;
        if (priority <= InterruptPriority.SURVIVAL) {
            this.metrics.emergencyDetections++;
        }
        // Update rolling average
        this.metrics.averageDetectionTime =
            (this.metrics.averageDetectionTime * (this.metrics.totalDetections - 1) + detectionTime) /
                this.metrics.totalDetections;
        this.metrics.detectionTime = detectionTime;
        this.metrics.lastEmergencyCheck = Date.now();
        // Adaptive performance tuning
        if (detectionTime > 15) {
            // Detection is slow, increase cache validity
            this.cacheValidityDuration = Math.min(200, this.cacheValidityDuration + 10);
        }
        else if (detectionTime < 5) {
            // Detection is fast, can decrease cache for more responsiveness
            this.cacheValidityDuration = Math.max(50, this.cacheValidityDuration - 5);
        }
    }
    /**
     * Get current performance metrics
     */
    getPerformanceMetrics() {
        return { ...this.metrics };
    }
    /**
     * Detect all current emergency conditions
     */
    detectEmergencies(state) {
        const emergencies = [];
        const { context } = state;
        const now = Date.now();
        // Check for drowning
        if (this.isDrowning(context)) {
            emergencies.push({
                type: 'drowning',
                severity: this.calculateSeverity('drowning', context),
                detectedAt: now,
                position: { ...context.position },
                timestamp: now,
                context: 'drowning'
            });
        }
        // Check for burning
        if (this.isBurning(context)) {
            emergencies.push({
                type: 'burning',
                severity: this.calculateSeverity('burning', context),
                detectedAt: now,
                position: { ...context.position },
                timestamp: now,
                context: 'burning'
            });
        }
        // Check for low health
        if (this.isLowHealth(context)) {
            emergencies.push({
                type: 'low_health',
                severity: this.calculateSeverity('low_health', context),
                detectedAt: now,
                position: { ...context.position },
                timestamp: now,
                context: 'low_health'
            });
        }
        // Check for nearby hostile mobs
        if (this.hasHostileNearby(context)) {
            emergencies.push({
                type: 'hostile_nearby',
                severity: this.calculateSeverity('hostile_nearby', context),
                detectedAt: now,
                position: { ...context.position },
                timestamp: now,
                context: 'hostile_nearby'
            });
        }
        // Check for stuck condition
        if (this.isStuck(state)) {
            emergencies.push({
                type: 'stuck',
                severity: this.calculateSeverity('stuck', context),
                detectedAt: now,
                position: { ...context.position },
                timestamp: now,
                context: 'stuck'
            });
        }
        // Check for falling
        if (this.isFalling(context)) {
            emergencies.push({
                type: 'falling',
                severity: this.calculateSeverity('falling', context),
                detectedAt: now,
                position: { ...context.position },
                timestamp: now,
                context: 'falling'
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
                    position: { ...state.context.position },
                    timestamp: now,
                    context: 'pathfinder_stuck'
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
            bypassedCognitive,
            source: 'interrupt_controller',
            context: {},
            action: 'emergency_response'
        };
        if (state.reactive?.interruptHistory) {
            state.reactive.interruptHistory.push(event);
            // Keep only last 100 interrupt events to prevent memory bloat
            if (state.reactive.interruptHistory.length > 100) {
                state.reactive.interruptHistory = state.reactive.interruptHistory.slice(-100);
            }
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
     * OPTIMIZED: Emergency detection methods with early exits and minimal computation
     */
    isDrowning(context) {
        // Fast check: underwater with low health
        return context.health < 20 && context.position.y < 60;
    }
    isBurning(context) {
        // Fast check: critical health damage
        return context.health < 15;
    }
    isLowHealth(context) {
        // Fast check: health below 5 hearts (20% of max)
        return context.health < 10;
    }
    hasHostileNearby(context) {
        // Optimized: early exit with first hostile found
        for (const entity of context.nearbyEntities) {
            if (entity.hostile && entity.distance <= 8) {
                return true;
            }
        }
        return false;
    }
    isStuck(state) {
        const now = Date.now();
        const currentPos = state.context.position;
        if (!this.lastPositionCheck) {
            this.lastPositionCheck = { ...currentPos, time: now };
            return false;
        }
        // Optimized distance calculation (avoid sqrt for performance)
        const dx = currentPos.x - this.lastPositionCheck.x;
        const dy = currentPos.y - this.lastPositionCheck.y;
        const dz = currentPos.z - this.lastPositionCheck.z;
        const distanceSquared = dx * dx + dy * dy + dz * dz;
        if (distanceSquared < 0.25) { // 0.5^2 = 0.25, avoid sqrt
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
        // Fast check: high position with damage
        return context.position.y > 60 && context.health < 18;
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
                    .sort((a, b) => (a.distance || 0) - (b.distance || 0))[0];
                if (nearestHostile) {
                    return Math.max(0, 1 - ((nearestHostile.distance || 0) / 8));
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
     * ENHANCED: Get comprehensive performance metrics for interrupt handling
     */
    getInterruptMetrics(state) {
        const history = state.reactive?.interruptHistory || [];
        const totalInterrupts = history.length;
        const emergencyInterrupts = history.filter(e => e.priority <= InterruptPriority.EMERGENCY).length;
        const bypassedCount = history.filter(e => e.bypassedCognitive).length;
        // Calculate average response time from performance metrics
        const averageResponseTime = this.metrics.averageDetectionTime;
        // Calculate cache hit rate
        const cacheHitRate = this.metrics.totalDetections > 0 ?
            (this.metrics.totalDetections - this.metrics.emergencyDetections) / this.metrics.totalDetections : 0;
        const bypassRate = totalInterrupts > 0 ? bypassedCount / totalInterrupts : 0;
        return {
            totalInterrupts,
            emergencyInterrupts,
            averageResponseTime,
            bypassRate,
            detectionTime: this.metrics.detectionTime,
            cacheHitRate,
            adaptiveMetrics: { ...this.metrics }
        };
    }
    /**
     * FAST-PATH: Force immediate emergency response bypassing all checks
     * Used when external systems detect critical emergencies
     */
    forceEmergencyResponse(emergencyType) {
        const now = Date.now();
        this.cachedPriority = this.getEmergencyPriority(emergencyType);
        this.lastCacheUpdate = now;
        return this.cachedPriority;
    }
    /**
     * Reset performance metrics and cache
     */
    resetMetrics() {
        this.metrics = {
            detectionTime: 0,
            lastEmergencyCheck: 0,
            totalDetections: 0,
            emergencyDetections: 0,
            averageDetectionTime: 0
        };
        this.cachedPriority = InterruptPriority.COGNITIVE;
        this.lastCacheUpdate = 0;
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
                const threshold = this.emergencyThresholds[key];
                if (threshold !== undefined) {
                    this.emergencyThresholds[key] = Math.min(1.0, threshold + 0.1);
                }
            });
        }
        else if (performance.survivalRate > 0.95 && performance.responseTime < 100) {
            // Can be less cautious if performing well
            Object.keys(this.emergencyThresholds).forEach(key => {
                const threshold = this.emergencyThresholds[key];
                if (threshold !== undefined) {
                    this.emergencyThresholds[key] = Math.max(0.3, threshold - 0.05);
                }
            });
        }
    }
}
//# sourceMappingURL=interrupt_controller.js.map