/**
 * Idle Detection System
 *
 * Monitors agent activity levels and detects idle states
 * Triggers anti-idle mechanisms when inactivity thresholds are exceeded
 */
import { AgentState } from '../langgraph/interfaces.js';
/**
 * Activity record for tracking agent behavior
 */
export interface ActivityRecord {
    type: 'action' | 'movement' | 'interaction' | 'communication' | 'cognitive';
    timestamp: number;
    description: string;
    intensity: number;
    duration?: number;
}
/**
 * Idle detection configuration
 */
export interface IdleDetectionConfig {
    inactivityThreshold: number;
    minActivityLevel: number;
    checkInterval: number;
    activityHistorySize: number;
    cognitiveLoadThreshold: number;
    movementThreshold: number;
}
/**
 * Idle period information
 */
export interface IdlePeriod {
    startTime: number;
    endTime?: number;
    duration: number;
    triggerType: 'inactivity' | 'low_activity' | 'no_goals' | 'cognitive_stall';
    resolutionType?: 'auto_goal' | 'manual_intervention' | 'system_restart' | 'activity_resume';
    severity: 'low' | 'medium' | 'high' | 'critical';
}
/**
 * System metrics for idle detection
 */
export interface IdleDetectionMetrics {
    agentId: string;
    timestamp: number;
    activityLevel: number;
    isIdle: boolean;
    idleDuration?: number;
    consecutiveIdlePeriods: number;
    lastActivityTime: number;
    activityHistory: ActivityRecord[];
    cognitiveLoad: number;
    movementActivity: number;
    socialActivity: number;
}
/**
 * Main idle detection system
 */
export declare class IdleDetectionSystem {
    private agentId;
    private config;
    private activityHistory;
    private lastActivityTime;
    private isIdle;
    private idleStartTime?;
    private consecutiveIdlePeriods;
    private lastCheckTime;
    private metrics;
    constructor(agentId: string, config?: Partial<IdleDetectionConfig>);
    /**
     * Record agent activity
     */
    recordActivity(activity: ActivityRecord): void;
    /**
     * Check idle status
     */
    checkIdleStatus(agentState: AgentState): boolean;
    /**
     * Calculate overall activity level
     */
    private calculateActivityLevel;
    /**
     * Get weight for different activity types
     */
    private getActivityTypeWeight;
    /**
     * Calculate movement-based activity
     */
    private calculateMovementActivity;
    /**
     * Calculate social activity
     */
    private calculateSocialActivity;
    /**
     * Evaluate if agent should be considered idle
     */
    private evaluateIdleCondition;
    /**
     * Check if agent has active goals
     */
    private hasActiveGoals;
    /**
     * Handle idle state detection
     */
    private handleIdleDetection;
    /**
     * Handle activity resume
     */
    private handleActivityResume;
    /**
     * Calculate idle severity
     */
    private calculateIdleSeverity;
    /**
     * Determine trigger type for idle state
     */
    private determineTriggerType;
    /**
     * Update system metrics
     */
    private updateMetrics;
    /**
     * Get current metrics
     */
    getMetrics(): IdleDetectionMetrics;
    /**
     * Get current configuration
     */
    getConfig(): IdleDetectionConfig;
    /**
     * Update configuration
     */
    updateConfig(updates: Partial<IdleDetectionConfig>): void;
    /**
     * Get idle history
     */
    getIdleHistory(): IdlePeriod[];
    /**
     * Force idle state (for testing)
     */
    forceIdleState(reason: string): void;
    /**
     * Reset idle detection
     */
    reset(): void;
    protected onIdleDetected(idlePeriod: IdlePeriod): void;
    protected onActivityResumed(idlePeriod: IdlePeriod): void;
    private lastIdlePeriod?;
    private idleHistory;
}
//# sourceMappingURL=idle_detection_system.d.ts.map