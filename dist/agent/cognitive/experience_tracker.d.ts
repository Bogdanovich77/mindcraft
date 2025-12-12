/**
 * Experience Tracker
 *
 * Collects, analyzes, and manages experience events across all skills.
 * Provides comprehensive experience analytics and learning insights.
 */
import { SkillType, ExperienceEvent, ExperienceSource, LearningSession } from './skill_types.js';
export interface ExperienceTrackerConfig {
    maxHistorySize: number;
    collectionInterval: number;
    batchSize: number;
    analysisWindow: number;
    trendAnalysisDepth: number;
    outlierThreshold: number;
    enableRealTimeAnalysis: boolean;
    enablePredictiveInsights: boolean;
    maxConcurrentSessions: number;
    enablePersistence: boolean;
    persistenceInterval: number;
    compressionThreshold: number;
}
export interface ExperienceAnalytics {
    totalExperience: number;
    averageSessionLength: number;
    successRate: number;
    failureRate: number;
    experiencePerHour: number;
    experiencePerDay: number;
    peakPerformanceTimes: number[];
    learningVelocity: number;
    experienceBySource: Record<ExperienceSource, number>;
    sourceEffectiveness: Record<ExperienceSource, number>;
    experienceByContext: Record<string, number>;
    contextEffectiveness: Record<string, number>;
    averageQuality: number;
    qualityDistribution: Record<string, number>;
    highQualityEvents: number;
    experienceTrend: 'increasing' | 'decreasing' | 'stable';
    learningEfficiencyTrend: 'improving' | 'declining' | 'stable';
    performanceTrend: 'rising' | 'falling' | 'stable';
}
export interface LearningInsight {
    type: 'recommendation' | 'warning' | 'achievement' | 'opportunity';
    priority: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;
    skillType?: SkillType;
    confidence: number;
    actionable: boolean;
    suggestedActions: string[];
    expectedImpact: string;
}
export interface ExperiencePattern {
    pattern: string;
    frequency: number;
    strength: number;
    context: string[];
    skillTypes: SkillType[];
    description: string;
}
export declare class ExperienceTracker {
    private config;
    private experienceHistory;
    private activeSessions;
    private completedSessions;
    private analytics;
    private insights;
    private patterns;
    private lastAnalysis;
    private lastCollection;
    private sessionCounter;
    constructor(config?: Partial<ExperienceTrackerConfig>);
    /**
     * Initialize analytics structure
     */
    private initializeAnalytics;
    /**
     * Start the experience collection cycle
     */
    private startCollectionCycle;
    /**
     * Add an experience event
     */
    addExperienceEvent(event: ExperienceEvent): void;
    /**
     * Validate experience event
     */
    private validateExperienceEvent;
    /**
     * Update or create active learning session
     */
    private updateActiveSession;
    /**
     * Generate session ID for event
     */
    private generateSessionId;
    /**
     * Check if session should be closed
     */
    private shouldCloseSession;
    /**
     * Close a learning session
     */
    private closeSession;
    /**
     * Close oldest active session
     */
    private closeOldestSession;
    /**
     * Collect experiences from active sessions
     */
    private collectExperiences;
    /**
     * Perform real-time analysis
     */
    private performRealTimeAnalysis;
    /**
     * Update analytics with current data
     */
    private updateAnalytics;
    /**
     * Update time-based analytics
     */
    private updateTimeBasedAnalytics;
    /**
     * Update trend analysis
     */
    private updateTrends;
    /**
     * Calculate trend from data points
     */
    private calculateTrend;
    /**
     * Calculate learning efficiency trend
     */
    private calculateLearningEfficiencyTrend;
    /**
     * Calculate performance trend
     */
    private calculatePerformanceTrend;
    /**
     * Generate learning insights
     */
    private generateInsights;
    /**
     * Detect learning patterns
     */
    private detectPatterns;
    /**
     * Analyze significant event
     */
    private analyzeSignificantEvent;
    /**
     * Analyze completed session
     */
    private analyzeCompletedSession;
    /**
     * Get recent events within time window
     */
    private getRecentEvents;
    /**
     * Get current analytics
     */
    getAnalytics(): ExperienceAnalytics;
    /**
     * Get current insights
     */
    getInsights(): LearningInsight[];
    /**
     * Get detected patterns
     */
    getPatterns(): ExperiencePattern[];
    /**
     * Get experience history for skill
     */
    getSkillExperienceHistory(skillType: SkillType, limit?: number): ExperienceEvent[];
    /**
     * Get learning sessions for skill
     */
    getSkillSessions(skillType: SkillType): LearningSession[];
    /**
     * Get active sessions
     */
    getActiveSessions(): LearningSession[];
    /**
     * Force analytics update
     */
    forceAnalysis(): void;
    /**
     * Reset experience tracker
     */
    reset(): void;
    /**
     * Get system statistics
     */
    getStatistics(): {
        totalEvents: number;
        activeSessions: number;
        completedSessions: number;
        totalExperience: number;
        averageSessionLength: number;
        insightsGenerated: number;
        patternsDetected: number;
    };
}
//# sourceMappingURL=experience_tracker.d.ts.map