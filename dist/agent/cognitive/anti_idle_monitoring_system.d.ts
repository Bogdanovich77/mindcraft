/**
 * Anti-Idle Monitoring and Alerting System
 *
 * Monitors agent activity and generates alerts for prolonged idleness
 * Provides comprehensive metrics and performance tracking
 */
import { AgentState } from '../langgraph/interfaces.js';
import { IdleDetectionSystem } from './idle_detection_system.js';
import { AntiIdleGoalGenerator } from './anti_idle_goal_generator.js';
import { EnvironmentalOpportunityDetector } from './environmental_opportunity_detector.js';
import { PersonalityActivityGenerator } from './personality_activity_generator.js';
/**
 * Alert severity levels
 */
export declare enum AlertSeverity {
    INFO = "info",
    WARNING = "warning",
    ERROR = "error",
    CRITICAL = "critical"
}
/**
 * Alert types for anti-idle system
 */
export declare enum AlertType {
    CONSECUTIVE_IDLE = "consecutive_idle",
    PROLONGED_INACTIVITY = "prolonged_inactivity",
    LOW_ACTIVITY_LEVEL = "low_activity_level",
    SYSTEM_PERFORMANCE = "system_performance",
    CONFIGURATION_ERROR = "configuration_error",
    INTEGRATION_FAILURE = "integration_failure",
    RESOURCE_EXHAUSTION = "resource_exhaustion"
}
/**
 * System alert definition
 */
export interface AntiIdleAlert {
    id: string;
    agentId: string;
    type: AlertType;
    severity: AlertSeverity;
    timestamp: number;
    message: string;
    data: any;
    acknowledged: boolean;
    resolved: boolean;
    resolution?: string;
    resolvedAt?: number;
}
/**
 * Performance metrics for anti-idle system
 */
export interface AntiIdlePerformanceMetrics {
    agentId: string;
    timestamp: number;
    totalActivitiesGenerated: number;
    activitiesCompleted: number;
    averageActivityDuration: number;
    activitySuccessRate: number;
    antiIdleGoalsCreated: number;
    antiIdleGoalsCompleted: number;
    goalCompletionRate: number;
    averageGoalGenerationTime: number;
    opportunitiesDetected: number;
    opportunitiesActed: number;
    opportunityResponseTime: number;
    cpuUsage: number;
    memoryUsage: number;
    responseTime: number;
    errorCount: number;
    currentActivityLevel: number;
    isIdle: boolean;
    idleDuration: number;
}
/**
 * Monitoring configuration
 */
export interface MonitoringConfig {
    enabled: boolean;
    alertThresholds: {
        consecutiveIdlePeriods: number;
        prolongedInactivityDuration: number;
        lowActivityLevelThreshold: number;
        systemPerformanceThreshold: number;
        errorRateThreshold: number;
    };
    reporting: {
        enabled: boolean;
        interval: number;
        maxHistorySize: number;
        includePerformanceMetrics: boolean;
        includeActivityMetrics: boolean;
    };
    alerting: {
        enabled: boolean;
        channels: string[];
        severity: AlertSeverity[];
        cooldownPeriod: number;
    };
}
/**
 * Main anti-idle monitoring system
 */
export declare class AntiIdleMonitoringSystem {
    private agentId;
    private idleDetectionSystem;
    private goalGenerator;
    private opportunityDetector;
    private activityGenerator;
    private config;
    private alerts;
    private metrics;
    private lastReportTime;
    private consecutiveIdleCount;
    private lastAlertTime;
    private performanceHistory;
    constructor(agentId: string, idleDetectionSystem: IdleDetectionSystem, goalGenerator: AntiIdleGoalGenerator, opportunityDetector: EnvironmentalOpportunityDetector, activityGenerator: PersonalityActivityGenerator, config?: Partial<MonitoringConfig>);
    /**
     * Update monitoring system with current agent state
     */
    updateMonitoring(agentState: AgentState): void;
    /**
     * Update basic performance metrics
     */
    private updateBasicMetrics;
    /**
     * Check for alert conditions
     */
    private checkAlertConditions;
    /**
     * Create and store alert
     */
    private createAlert;
    /**
     * Log alert to configured channels
     */
    private logAlert;
    /**
     * Calculate overall performance score
     */
    private calculatePerformanceScore;
    /**
     * Calculate recent error rate
     */
    private calculateErrorRate;
    /**
     * Get recent error count
     */
    private getRecentErrorCount;
    /**
     * Get recent errors
     */
    private getRecentErrors;
    /**
     * Update derived metrics
     */
    private updateDerivedMetrics;
    /**
     * Initialize metrics structure
     */
    private initializeMetrics;
    /**
     * Clean up old data
     */
    private cleanupOldData;
    /**
     * Generate periodic report
     */
    private generateReport;
    /**
     * Group alerts by type
     */
    private groupAlertsByType;
    /**
     * Group alerts by severity
     */
    private groupAlertsBySeverity;
    /**
     * Calculate performance trend
     */
    private calculatePerformanceTrend;
    /**
     * Generate recommendations based on current state
     */
    private generateRecommendations;
    /**
     * Send report to output channels
     */
    private sendReport;
    /**
     * Get current configuration
     */
    getConfig(): MonitoringConfig;
    /**
     * Update configuration
     */
    updateConfig(updates: Partial<MonitoringConfig>): void;
    /**
     * Get current metrics
     */
    getMetrics(): AntiIdlePerformanceMetrics;
    /**
     * Get alert history
     */
    getAlerts(): AntiIdleAlert[];
    /**
     * Get active alerts
     */
    getActiveAlerts(): AntiIdleAlert[];
    /**
     * Get alerts by type
     */
    getAlertsByType(type: AlertType): AntiIdleAlert[];
    /**
     * Get alerts by severity
     */
    getAlertsBySeverity(severity: AlertSeverity): AntiIdleAlert[];
    /**
     * Acknowledge alert
     */
    acknowledgeAlert(alertId: string): boolean;
    /**
     * Resolve alert
     */
    resolveAlert(alertId: string, resolution?: string): boolean;
    /**
     * Get performance history
     */
    getPerformanceHistory(): AntiIdlePerformanceMetrics[];
    /**
     * Reset monitoring system
     */
    reset(): void;
    /**
     * Update consecutive idle count (called by idle detection system)
     */
    updateConsecutiveIdleCount(count: number): void;
    /**
     * Record metrics for monitoring system (alias for getMetrics)
     */
    recordMetrics(): AntiIdlePerformanceMetrics;
}
//# sourceMappingURL=anti_idle_monitoring_system.d.ts.map