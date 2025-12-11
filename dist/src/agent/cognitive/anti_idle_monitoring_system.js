/**
 * Anti-Idle Monitoring and Alerting System
 *
 * Monitors agent activity and generates alerts for prolonged idleness
 * Provides comprehensive metrics and performance tracking
 */
/**
 * Alert severity levels
 */
export var AlertSeverity;
(function (AlertSeverity) {
    AlertSeverity["INFO"] = "info";
    AlertSeverity["WARNING"] = "warning";
    AlertSeverity["ERROR"] = "error";
    AlertSeverity["CRITICAL"] = "critical";
})(AlertSeverity || (AlertSeverity = {}));
/**
 * Alert types for anti-idle system
 */
export var AlertType;
(function (AlertType) {
    AlertType["CONSECUTIVE_IDLE"] = "consecutive_idle";
    AlertType["PROLONGED_INACTIVITY"] = "prolonged_inactivity";
    AlertType["LOW_ACTIVITY_LEVEL"] = "low_activity_level";
    AlertType["SYSTEM_PERFORMANCE"] = "system_performance";
    AlertType["CONFIGURATION_ERROR"] = "configuration_error";
    AlertType["INTEGRATION_FAILURE"] = "integration_failure";
    AlertType["RESOURCE_EXHAUSTION"] = "resource_exhaustion";
})(AlertType || (AlertType = {}));
/**
 * Main anti-idle monitoring system
 */
export class AntiIdleMonitoringSystem {
    agentId;
    idleDetectionSystem;
    goalGenerator;
    opportunityDetector;
    activityGenerator;
    config;
    alerts = [];
    metrics;
    lastReportTime = 0;
    consecutiveIdleCount = 0;
    lastAlertTime = {};
    performanceHistory = [];
    constructor(agentId, idleDetectionSystem, goalGenerator, opportunityDetector, activityGenerator, config) {
        this.agentId = agentId;
        this.idleDetectionSystem = idleDetectionSystem;
        this.goalGenerator = goalGenerator;
        this.opportunityDetector = opportunityDetector;
        this.activityGenerator = activityGenerator;
        this.config = {
            enabled: true,
            alertThresholds: {
                consecutiveIdlePeriods: 3,
                prolongedInactivityDuration: 300000, // 5 minutes
                lowActivityLevelThreshold: 0.05,
                systemPerformanceThreshold: 0.8,
                errorRateThreshold: 0.1
            },
            reporting: {
                enabled: true,
                interval: 60000, // 1 minute
                maxHistorySize: 100,
                includePerformanceMetrics: true,
                includeActivityMetrics: true
            },
            alerting: {
                enabled: true,
                channels: ['console', 'log'],
                severity: [AlertSeverity.WARNING, AlertSeverity.ERROR, AlertSeverity.CRITICAL],
                cooldownPeriod: 30000 // 30 seconds
            },
            ...config
        };
        this.metrics = this.initializeMetrics();
        console.log(`[ANTI_IDLE_MONITORING] Initialized for agent ${this.agentId}`);
    }
    /**
     * Update monitoring system with current agent state
     */
    updateMonitoring(agentState) {
        if (!this.config.enabled) {
            return;
        }
        const now = Date.now();
        try {
            // Update basic metrics
            this.updateBasicMetrics(agentState);
            // Check for alert conditions
            this.checkAlertConditions(agentState);
            // Generate periodic report
            if (now - this.lastReportTime >= this.config.reporting.interval) {
                this.generateReport();
                this.lastReportTime = now;
            }
            // Clean up old data
            this.cleanupOldData(now);
        }
        catch (error) {
            console.error('[ANTI_IDLE_MONITORING] Error updating monitoring:', error);
            this.createAlert(AlertType.SYSTEM_PERFORMANCE, AlertSeverity.ERROR, `Monitoring update error: ${error.message}`, { error: error.message, stack: error.stack });
        }
    }
    /**
     * Update basic performance metrics
     */
    updateBasicMetrics(agentState) {
        const now = Date.now();
        // Get metrics from subsystems
        const idleMetrics = this.idleDetectionSystem.getMetrics();
        const goalStats = this.goalGenerator.getStatistics();
        const opportunityStats = this.opportunityDetector.getStatistics();
        const activityStats = this.activityGenerator.getStatistics();
        // Update activity metrics
        this.metrics.currentActivityLevel = idleMetrics.activityLevel;
        this.metrics.isIdle = idleMetrics.isIdle;
        this.metrics.idleDuration = idleMetrics.idleDuration || 0;
        // Update goal metrics
        this.metrics.antiIdleGoalsCreated = goalStats.totalGenerated;
        this.metrics.antiIdleGoalsCompleted = goalStats.totalGenerated; // Would track completions in real system
        // Update opportunity metrics
        this.metrics.opportunitiesDetected = opportunityStats.totalOpportunities;
        this.metrics.opportunitiesActed = 0; // Would track in real system
        // Update activity metrics
        this.metrics.totalActivitiesGenerated = activityStats.totalActivitiesGenerated;
        this.metrics.activitiesCompleted = 0; // Would track in real system
        // Update system performance metrics
        this.metrics.timestamp = now;
        this.metrics.errorCount = this.getRecentErrorCount();
        // Calculate derived metrics
        this.updateDerivedMetrics();
    }
    /**
     * Check for alert conditions
     */
    checkAlertConditions(agentState) {
        const now = Date.now();
        // Check consecutive idle periods
        if (this.consecutiveIdleCount >= this.config.alertThresholds.consecutiveIdlePeriods) {
            this.createAlert(AlertType.CONSECUTIVE_IDLE, AlertSeverity.WARNING, `Agent has been idle for ${this.consecutiveIdleCount} consecutive periods`, {
                consecutivePeriods: this.consecutiveIdleCount,
                totalIdleTime: this.metrics.idleDuration
            });
        }
        // Check prolonged inactivity
        if (this.metrics.idleDuration >= this.config.alertThresholds.prolongedInactivityDuration) {
            this.createAlert(AlertType.PROLONGED_INACTIVITY, AlertSeverity.ERROR, `Agent has been inactive for ${this.metrics.idleDuration}ms`, {
                idleDuration: this.metrics.idleDuration,
                activityLevel: this.metrics.currentActivityLevel
            });
        }
        // Check low activity level
        if (this.metrics.currentActivityLevel < this.config.alertThresholds.lowActivityLevelThreshold) {
            this.createAlert(AlertType.LOW_ACTIVITY_LEVEL, AlertSeverity.WARNING, `Agent activity level is critically low: ${this.metrics.currentActivityLevel}`, {
                activityLevel: this.metrics.currentActivityLevel,
                threshold: this.config.alertThresholds.lowActivityLevelThreshold
            });
        }
        // Check system performance
        const performanceScore = this.calculatePerformanceScore();
        if (performanceScore < this.config.alertThresholds.systemPerformanceThreshold) {
            this.createAlert(AlertType.SYSTEM_PERFORMANCE, AlertSeverity.ERROR, `System performance degraded: ${performanceScore}`, {
                performanceScore,
                metrics: this.metrics
            });
        }
        // Check error rate
        const errorRate = this.calculateErrorRate();
        if (errorRate > this.config.alertThresholds.errorRateThreshold) {
            this.createAlert(AlertType.SYSTEM_PERFORMANCE, AlertSeverity.CRITICAL, `High error rate detected: ${errorRate}`, {
                errorRate,
                recentErrors: this.getRecentErrors()
            });
        }
    }
    /**
     * Create and store alert
     */
    createAlert(type, severity, message, data) {
        const now = Date.now();
        // Check cooldown period
        const lastAlertTime = this.lastAlertTime[type] || 0;
        if (now - lastAlertTime < this.config.alerting.cooldownPeriod) {
            return; // Still in cooldown
        }
        const alert = {
            id: `alert_${type}_${now}`,
            agentId: this.agentId,
            type,
            severity,
            timestamp: now,
            message,
            data: data || {},
            acknowledged: false,
            resolved: false
        };
        this.alerts.push(alert);
        this.lastAlertTime[type] = now;
        // Log alert
        this.logAlert(alert);
        // Limit alert history
        if (this.alerts.length > 100) {
            this.alerts = this.alerts.slice(-100);
        }
    }
    /**
     * Log alert to configured channels
     */
    logAlert(alert) {
        const logMessage = `[ANTI_IDLE_ALERT] ${alert.severity.toUpperCase()}: ${alert.message}`;
        this.config.alerting.channels.forEach(channel => {
            switch (channel) {
                case 'console':
                    console[alert.severity](logMessage);
                    break;
                case 'log':
                    // In real implementation, would write to log file
                    console.log(logMessage);
                    break;
                case 'file':
                    // In real implementation, would write to alert file
                    console.log(`[FILE_LOG] ${logMessage}`);
                    break;
                case 'network':
                    // In real implementation, would send to monitoring system
                    console.log(`[NETWORK_ALERT] ${logMessage}`);
                    break;
            }
        });
    }
    /**
     * Calculate overall performance score
     */
    calculatePerformanceScore() {
        let score = 1.0; // Perfect score
        // Factor in activity level
        score -= (1 - this.metrics.currentActivityLevel) * 0.3;
        // Factor in goal completion
        if (this.metrics.antiIdleGoalsCreated > 0) {
            const completionRate = this.metrics.antiIdleGoalsCompleted / this.metrics.antiIdleGoalsCreated;
            score -= (1 - completionRate) * 0.2;
        }
        // Factor in error rate
        const errorRate = this.calculateErrorRate();
        score -= errorRate * 0.3;
        // Factor in response time
        if (this.metrics.responseTime > 1000) {
            score -= Math.min(0.2, (this.metrics.responseTime - 1000) / 5000);
        }
        return Math.max(0, Math.min(1, score));
    }
    /**
     * Calculate recent error rate
     */
    calculateErrorRate() {
        const recentAlerts = this.alerts.filter(alert => alert.timestamp > Date.now() - 300000 && // Last 5 minutes
            [AlertSeverity.ERROR, AlertSeverity.CRITICAL].includes(alert.severity));
        return recentAlerts.length / 60; // Errors per minute over last 5 minutes
    }
    /**
     * Get recent error count
     */
    getRecentErrorCount() {
        const fiveMinutesAgo = Date.now() - 300000;
        return this.alerts.filter(alert => alert.timestamp > fiveMinutesAgo &&
            [AlertSeverity.ERROR, AlertSeverity.CRITICAL].includes(alert.severity)).length;
    }
    /**
     * Get recent errors
     */
    getRecentErrors() {
        const fiveMinutesAgo = Date.now() - 300000;
        return this.alerts.filter(alert => alert.timestamp > fiveMinutesAgo &&
            [AlertSeverity.ERROR, AlertSeverity.CRITICAL].includes(alert.severity));
    }
    /**
     * Update derived metrics
     */
    updateDerivedMetrics() {
        // Calculate average activity duration
        if (this.metrics.totalActivitiesGenerated > 0) {
            // Would calculate from actual activity completion data
            this.metrics.averageActivityDuration = 300000; // 5 minutes placeholder
        }
        // Calculate activity success rate
        if (this.metrics.totalActivitiesGenerated > 0) {
            // Would calculate from actual activity completion data
            this.metrics.activitySuccessRate = 0.8; // 80% placeholder
        }
        // Calculate goal completion rate
        if (this.metrics.antiIdleGoalsCreated > 0) {
            this.metrics.goalCompletionRate = this.metrics.antiIdleGoalsCompleted / this.metrics.antiIdleGoalsCreated;
        }
        // Calculate opportunity response time
        if (this.metrics.opportunitiesDetected > 0) {
            // Would calculate from actual opportunity response data
            this.metrics.opportunityResponseTime = 5000; // 5 seconds placeholder
        }
    }
    /**
     * Initialize metrics structure
     */
    initializeMetrics() {
        return {
            agentId: this.agentId,
            timestamp: Date.now(),
            totalActivitiesGenerated: 0,
            activitiesCompleted: 0,
            averageActivityDuration: 0,
            activitySuccessRate: 0,
            antiIdleGoalsCreated: 0,
            antiIdleGoalsCompleted: 0,
            goalCompletionRate: 0,
            averageGoalGenerationTime: 0,
            opportunitiesDetected: 0,
            opportunitiesActed: 0,
            opportunityResponseTime: 0,
            cpuUsage: 0,
            memoryUsage: 0,
            responseTime: 0,
            errorCount: 0,
            currentActivityLevel: 0,
            isIdle: false,
            idleDuration: 0
        };
    }
    /**
     * Clean up old data
     */
    cleanupOldData(now) {
        // Clean old alerts (older than 24 hours)
        const twentyFourHoursAgo = now - 86400000;
        this.alerts = this.alerts.filter(alert => alert.timestamp > twentyFourHoursAgo);
        // Clean old performance history
        if (this.performanceHistory.length > this.config.reporting.maxHistorySize) {
            this.performanceHistory = this.performanceHistory.slice(-this.config.reporting.maxHistorySize);
        }
    }
    /**
     * Generate periodic report
     */
    generateReport() {
        if (!this.config.reporting.enabled) {
            return;
        }
        const report = {
            timestamp: Date.now(),
            agentId: this.agentId,
            metrics: this.metrics,
            alerts: {
                total: this.alerts.length,
                unacknowledged: this.alerts.filter(a => !a.acknowledged).length,
                unresolved: this.alerts.filter(a => !a.resolved).length,
                byType: this.groupAlertsByType(),
                bySeverity: this.groupAlertsBySeverity()
            },
            performance: {
                score: this.calculatePerformanceScore(),
                trend: this.calculatePerformanceTrend(),
                recommendations: this.generateRecommendations()
            }
        };
        // Send report to configured channels
        this.sendReport(report);
        console.log(`[ANTI_IDLE_MONITORING] Generated report for agent ${this.agentId}`);
    }
    /**
     * Group alerts by type
     */
    groupAlertsByType() {
        const grouped = {};
        this.alerts.forEach(alert => {
            grouped[alert.type] = (grouped[alert.type] || 0) + 1;
        });
        return grouped;
    }
    /**
     * Group alerts by severity
     */
    groupAlertsBySeverity() {
        const grouped = {};
        this.alerts.forEach(alert => {
            grouped[alert.severity] = (grouped[alert.severity] || 0) + 1;
        });
        return grouped;
    }
    /**
     * Calculate performance trend
     */
    calculatePerformanceTrend() {
        if (this.performanceHistory.length < 3) {
            return 'unknown';
        }
        const recent = this.performanceHistory.slice(-3);
        const scores = recent.map(h => this.calculatePerformanceScore());
        if (scores[2] > scores[1] && scores[1] > scores[0]) {
            return 'improving';
        }
        else if (scores[2] < scores[1] && scores[1] < scores[0]) {
            return 'degrading';
        }
        else {
            return 'stable';
        }
    }
    /**
     * Generate recommendations based on current state
     */
    generateRecommendations() {
        const recommendations = [];
        if (this.metrics.currentActivityLevel < 0.1) {
            recommendations.push('Consider reducing inactivity thresholds or increasing goal generation frequency');
        }
        if (this.metrics.goalCompletionRate < 0.5) {
            recommendations.push('Review goal generation parameters and adjust personality alignment weights');
        }
        if (this.calculateErrorRate() > 0.05) {
            recommendations.push('Check system configuration and reduce error-prone operations');
        }
        if (this.metrics.responseTime > 2000) {
            recommendations.push('Optimize system performance or reduce monitoring frequency');
        }
        return recommendations;
    }
    /**
     * Send report to output channels
     */
    sendReport(report) {
        const reportJson = JSON.stringify(report, null, 2);
        console.log(`[ANTI_IDLE_MONITORING_REPORT] ${reportJson}`);
        // In real implementation, would send to monitoring system
        if (this.config.alerting.channels.includes('network')) {
            // Send to network monitoring system
            console.log(`[NETWORK_REPORT] Would send report to monitoring system`);
        }
    }
    // Public API methods
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
        console.log(`[ANTI_IDLE_MONITORING] Configuration updated for agent ${this.agentId}:`, updates);
    }
    /**
     * Get current metrics
     */
    getMetrics() {
        return { ...this.metrics };
    }
    /**
     * Get alert history
     */
    getAlerts() {
        return [...this.alerts];
    }
    /**
     * Get active alerts
     */
    getActiveAlerts() {
        return this.alerts.filter(alert => !alert.resolved);
    }
    /**
     * Get alerts by type
     */
    getAlertsByType(type) {
        return this.alerts.filter(alert => alert.type === type);
    }
    /**
     * Get alerts by severity
     */
    getAlertsBySeverity(severity) {
        return this.alerts.filter(alert => alert.severity === severity);
    }
    /**
     * Acknowledge alert
     */
    acknowledgeAlert(alertId) {
        const alert = this.alerts.find(a => a.id === alertId);
        if (alert) {
            alert.acknowledged = true;
            console.log(`[ANTI_IDLE_MONITORING] Alert acknowledged: ${alertId}`);
            return true;
        }
        return false;
    }
    /**
     * Resolve alert
     */
    resolveAlert(alertId, resolution) {
        const alert = this.alerts.find(a => a.id === alertId);
        if (alert) {
            alert.resolved = true;
            alert.resolvedAt = Date.now();
            if (resolution) {
                alert.resolution = resolution;
            }
            console.log(`[ANTI_IDLE_MONITORING] Alert resolved: ${alertId} - ${resolution || 'No resolution provided'}`);
            return true;
        }
        return false;
    }
    /**
     * Get performance history
     */
    getPerformanceHistory() {
        return [...this.performanceHistory];
    }
    /**
     * Reset monitoring system
     */
    reset() {
        this.alerts = [];
        this.metrics = this.initializeMetrics();
        this.performanceHistory = [];
        this.consecutiveIdleCount = 0;
        this.lastAlertTime = {};
        this.lastReportTime = 0;
        console.log(`[ANTI_IDLE_MONITORING] System reset for agent ${this.agentId}`);
    }
    /**
     * Update consecutive idle count (called by idle detection system)
     */
    updateConsecutiveIdleCount(count) {
        this.consecutiveIdleCount = count;
    }
    /**
     * Record metrics for monitoring system (alias for getMetrics)
     */
    recordMetrics() {
        return this.getMetrics();
    }
}
