/**
 * Idle Detection System
 *
 * Monitors agent activity levels and detects idle states
 * Triggers anti-idle mechanisms when inactivity thresholds are exceeded
 */
/**
 * Main idle detection system
 */
export class IdleDetectionSystem {
    agentId;
    config;
    activityHistory = [];
    lastActivityTime = Date.now();
    isIdle = false;
    idleStartTime;
    consecutiveIdlePeriods = 0;
    lastCheckTime = Date.now();
    metrics;
    constructor(agentId, config) {
        this.agentId = agentId;
        this.config = {
            inactivityThreshold: 30000, // 30 seconds
            minActivityLevel: 0.1, // 10% activity level
            checkInterval: 5000, // 5 seconds
            activityHistorySize: 100, // Keep 100 records
            cognitiveLoadThreshold: 0.2, // 20% cognitive load
            movementThreshold: 5.0, // 5 blocks movement
            ...config
        };
        this.metrics = {
            agentId: this.agentId,
            timestamp: Date.now(),
            activityLevel: 0,
            isIdle: false,
            consecutiveIdlePeriods: 0,
            lastActivityTime: this.lastActivityTime,
            activityHistory: [],
            cognitiveLoad: 0,
            movementActivity: 0,
            socialActivity: 0
        };
        console.log(`[IDLE_DETECTION] System initialized for agent ${this.agentId}`);
    }
    /**
     * Record agent activity
     */
    recordActivity(activity) {
        try {
            const now = Date.now();
            // Update activity record
            activity.timestamp = now;
            this.activityHistory.push(activity);
            // Keep only recent activity history
            if (this.activityHistory.length > this.config.activityHistorySize) {
                this.activityHistory = this.activityHistory.slice(-this.config.activityHistorySize);
            }
            // Update last activity time
            this.lastActivityTime = now;
            // Reset idle state if activity detected
            if (this.isIdle) {
                this.handleActivityResume();
            }
            // Update metrics
            this.updateMetrics();
            console.log(`[IDLE_DETECTION] Activity recorded: ${activity.type} (${activity.intensity})`);
        }
        catch (error) {
            console.error('[IDLE_DETECTION] Error recording activity:', error);
        }
    }
    /**
     * Check idle status
     */
    checkIdleStatus(agentState) {
        try {
            const now = Date.now();
            // Check if enough time has passed since last check
            if (now - this.lastCheckTime < this.config.checkInterval) {
                return this.isIdle;
            }
            this.lastCheckTime = now;
            // Calculate current activity level
            const activityLevel = this.calculateActivityLevel(agentState);
            const timeSinceLastActivity = now - this.lastActivityTime;
            // Determine if agent is idle
            const wasIdle = this.isIdle;
            this.isIdle = this.evaluateIdleCondition(activityLevel, timeSinceLastActivity, agentState);
            // Handle idle state transitions
            if (!wasIdle && this.isIdle) {
                this.handleIdleDetection(agentState);
            }
            else if (wasIdle && !this.isIdle) {
                this.handleActivityResume();
            }
            // Update metrics
            this.metrics.activityLevel = activityLevel;
            this.metrics.isIdle = this.isIdle;
            this.metrics.idleDuration = this.isIdle ? now - (this.idleStartTime || now) : undefined;
            this.metrics.lastActivityTime = this.lastActivityTime;
            this.metrics.timestamp = now;
            return this.isIdle;
        }
        catch (error) {
            console.error('[IDLE_DETECTION] Error checking idle status:', error);
            return this.isIdle; // Return previous state on error
        }
    }
    /**
     * Calculate overall activity level
     */
    calculateActivityLevel(agentState) {
        const now = Date.now();
        const recentWindow = 60000; // Last 1 minute
        // Get recent activities
        const recentActivities = this.activityHistory.filter(activity => now - activity.timestamp < recentWindow);
        if (recentActivities.length === 0) {
            return 0;
        }
        // Calculate weighted activity score
        let totalScore = 0;
        let totalWeight = 0;
        recentActivities.forEach(activity => {
            const age = now - activity.timestamp;
            const recencyWeight = Math.max(0.1, 1 - (age / recentWindow));
            const intensityWeight = activity.intensity;
            const typeWeight = this.getActivityTypeWeight(activity.type);
            const weightedScore = intensityWeight * recencyWeight * typeWeight;
            totalScore += weightedScore;
            totalWeight += recencyWeight * typeWeight;
        });
        const baseActivityLevel = totalWeight > 0 ? totalScore / totalWeight : 0;
        // Factor in cognitive load
        const cognitiveLoad = agentState.cognitive?.processing?.cognitiveLoad || 0;
        const cognitiveBonus = Math.min(0.3, cognitiveLoad * 0.5);
        // Factor in movement
        const movementBonus = this.calculateMovementActivity(agentState);
        // Factor in social activity
        const socialBonus = this.calculateSocialActivity(agentState);
        const finalActivityLevel = Math.min(1.0, baseActivityLevel + cognitiveBonus + movementBonus + socialBonus);
        // Update metrics
        this.metrics.cognitiveLoad = cognitiveLoad;
        this.metrics.movementActivity = movementBonus;
        this.metrics.socialActivity = socialBonus;
        return finalActivityLevel;
    }
    /**
     * Get weight for different activity types
     */
    getActivityTypeWeight(type) {
        const weights = {
            'action': 1.0,
            'movement': 0.8,
            'interaction': 0.9,
            'communication': 0.7,
            'cognitive': 0.6
        };
        return weights[type] || 0.5;
    }
    /**
     * Calculate movement-based activity
     */
    calculateMovementActivity(agentState) {
        const currentPos = agentState.context.position;
        // Simple movement detection based on position changes
        // In a real implementation, this would track position over time
        const movementScore = Math.random() * 0.2; // Placeholder
        return Math.min(0.2, movementScore);
    }
    /**
     * Calculate social activity
     */
    calculateSocialActivity(agentState) {
        const nearbyAgents = agentState.context.nearbyEntities?.filter(entity => entity.type === 'player' || entity.type === 'agent') || [];
        const recentMessages = agentState.executive?.responseHistory?.filter(response => Date.now() - response.timestamp < 300000 // Last 5 minutes
        ) || [];
        const socialScore = Math.min(0.2, (nearbyAgents.length * 0.05) + (recentMessages.length * 0.02));
        return socialScore;
    }
    /**
     * Evaluate if agent should be considered idle
     */
    evaluateIdleCondition(activityLevel, timeSinceLastActivity, agentState) {
        // Check inactivity threshold
        if (timeSinceLastActivity > this.config.inactivityThreshold) {
            return true;
        }
        // Check minimum activity level
        if (activityLevel < this.config.minActivityLevel) {
            return true;
        }
        // Check cognitive stall (low processing activity)
        const cognitiveLoad = agentState.cognitive?.processing?.cognitiveLoad || 0;
        if (cognitiveLoad < this.config.cognitiveLoadThreshold) {
            const hasActiveGoals = this.hasActiveGoals(agentState);
            if (!hasActiveGoals) {
                return true; // No goals and low cognitive activity
            }
        }
        return false;
    }
    /**
     * Check if agent has active goals
     */
    hasActiveGoals(agentState) {
        const activeGoals = agentState.cognitive?.goals?.activeGoals || [];
        return activeGoals.some(goal => goal.status === 'active' || goal.status === 'pending');
    }
    /**
     * Handle idle state detection
     */
    handleIdleDetection(agentState) {
        this.idleStartTime = Date.now();
        this.consecutiveIdlePeriods++;
        const activityLevel = this.calculateActivityLevel(agentState);
        const severity = this.calculateIdleSeverity(activityLevel);
        console.warn(`[IDLE_DETECTION] Agent ${this.agentId} entered idle state (severity: ${severity})`);
        // Trigger idle detection event
        this.onIdleDetected({
            startTime: this.idleStartTime,
            duration: 0,
            triggerType: this.determineTriggerType(agentState),
            severity
        });
    }
    /**
     * Handle activity resume
     */
    handleActivityResume() {
        if (this.idleStartTime) {
            const idleDuration = Date.now() - this.idleStartTime;
            console.log(`[IDLE_DETECTION] Agent ${this.agentId} resumed activity after ${idleDuration}ms idle`);
            // Trigger activity resume event
            this.onActivityResumed({
                startTime: this.idleStartTime,
                endTime: Date.now(),
                duration: idleDuration,
                triggerType: this.lastIdlePeriod?.triggerType || 'inactivity',
                resolutionType: 'activity_resume',
                severity: this.lastIdlePeriod?.severity || 'low'
            });
        }
        this.isIdle = false;
        this.idleStartTime = undefined;
    }
    /**
     * Calculate idle severity
     */
    calculateIdleSeverity(activityLevel) {
        if (activityLevel < 0.05)
            return 'critical';
        if (activityLevel < 0.1)
            return 'high';
        if (activityLevel < 0.2)
            return 'medium';
        return 'low';
    }
    /**
     * Determine trigger type for idle state
     */
    determineTriggerType(agentState) {
        const timeSinceLastActivity = Date.now() - this.lastActivityTime;
        const activityLevel = this.calculateActivityLevel(agentState);
        const hasActiveGoals = this.hasActiveGoals(agentState);
        const cognitiveLoad = agentState.cognitive?.processing?.cognitiveLoad || 0;
        if (timeSinceLastActivity > this.config.inactivityThreshold) {
            return 'inactivity';
        }
        if (activityLevel < this.config.minActivityLevel) {
            return 'low_activity';
        }
        if (!hasActiveGoals) {
            return 'no_goals';
        }
        if (cognitiveLoad < this.config.cognitiveLoadThreshold) {
            return 'cognitive_stall';
        }
        return 'inactivity';
    }
    /**
     * Update system metrics
     */
    updateMetrics() {
        this.metrics.activityHistory = [...this.activityHistory];
        this.metrics.consecutiveIdlePeriods = this.consecutiveIdlePeriods;
    }
    /**
     * Get current metrics
     */
    getMetrics() {
        return { ...this.metrics };
    }
    /**
     * Get current configuration
     */
    getConfig() {
        return { ...this.config };
    }
    /**
     * Update configuration
     */
    updateConfig(updates) {
        this.config = { ...this.config, ...updates };
        console.log(`[IDLE_DETECTION] Configuration updated for agent ${this.agentId}:`, updates);
    }
    /**
     * Get idle history
     */
    getIdleHistory() {
        return [...(this.idleHistory || [])];
    }
    /**
     * Force idle state (for testing)
     */
    forceIdleState(reason) {
        console.log(`[IDLE_DETECTION] Force idle state for agent ${this.agentId}: ${reason}`);
        this.isIdle = true;
        this.idleStartTime = Date.now();
    }
    /**
     * Reset idle detection
     */
    reset() {
        this.activityHistory = [];
        this.lastActivityTime = Date.now();
        this.isIdle = false;
        this.idleStartTime = undefined;
        this.consecutiveIdlePeriods = 0;
        this.lastCheckTime = Date.now();
        console.log(`[IDLE_DETECTION] System reset for agent ${this.agentId}`);
    }
    // Event handlers (to be overridden by integrating system)
    onIdleDetected(idlePeriod) {
        // Default implementation - can be overridden
        console.log(`[IDLE_DETECTION] Idle detected:`, idlePeriod);
        this.lastIdlePeriod = idlePeriod;
    }
    onActivityResumed(idlePeriod) {
        // Default implementation - can be overridden
        console.log(`[IDLE_DETECTION] Activity resumed:`, idlePeriod);
    }
    lastIdlePeriod;
    idleHistory = [];
}
