/**
 * Experience Tracker
 * 
 * Collects, analyzes, and manages experience events across all skills.
 * Provides comprehensive experience analytics and learning insights.
 */

import {
  Skill,
  SkillType,
  ExperienceEvent,
  ExperienceSource,
  ExperienceContext,
  LearningSession,
  SkillProgress,
  LearningMethod
} from './skill_types.js';

export interface ExperienceTrackerConfig {
  // Collection settings
  maxHistorySize: number;
  collectionInterval: number;
  batchSize: number;
  
  // Analysis settings
  analysisWindow: number;          // Time window for analysis (milliseconds)
  trendAnalysisDepth: number;      // Number of data points for trend analysis
  outlierThreshold: number;        // Threshold for detecting outlier events
  
  // Performance settings
  enableRealTimeAnalysis: boolean;
  enablePredictiveInsights: boolean;
  maxConcurrentSessions: number;
  
  // Persistence settings
  enablePersistence: boolean;
  persistenceInterval: number;
  compressionThreshold: number;
}

export interface ExperienceAnalytics {
  // Basic statistics
  totalExperience: number;
  averageSessionLength: number;
  successRate: number;
  failureRate: number;
  
  // Time-based analytics
  experiencePerHour: number;
  experiencePerDay: number;
  peakPerformanceTimes: number[];
  learningVelocity: number;
  
  // Source analytics
  experienceBySource: Record<ExperienceSource, number>;
  sourceEffectiveness: Record<ExperienceSource, number>;
  
  // Context analytics
  experienceByContext: Record<string, number>;
  contextEffectiveness: Record<string, number>;
  
  // Quality analytics
  averageQuality: number;
  qualityDistribution: Record<string, number>;
  highQualityEvents: number;
  
  // Trend analytics
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
  confidence: number;              // 0-1 confidence in the insight
  actionable: boolean;
  suggestedActions: string[];
  expectedImpact: string;
}

export interface ExperiencePattern {
  pattern: string;
  frequency: number;
  strength: number;                // How strong the pattern is
  context: string[];
  skillTypes: SkillType[];
  description: string;
}

export class ExperienceTracker {
  private config: ExperienceTrackerConfig;
  private experienceHistory: ExperienceEvent[] = [];
  private activeSessions: Map<string, LearningSession> = new Map();
  private completedSessions: LearningSession[] = [];
  private analytics: ExperienceAnalytics;
  private insights: LearningInsight[] = [];
  private patterns: ExperiencePattern[] = [];
  
  // Performance tracking
  private lastAnalysis: number = 0;
  private lastCollection: number = 0;
  private sessionCounter: number = 0;
  
  constructor(config?: Partial<ExperienceTrackerConfig>) {
    this.config = {
      maxHistorySize: 10000,
      collectionInterval: 1000,     // 1 second
      batchSize: 50,
      analysisWindow: 24 * 60 * 60 * 1000, // 24 hours
      trendAnalysisDepth: 20,
      outlierThreshold: 2.0,        // 2 standard deviations
      enableRealTimeAnalysis: true,
      enablePredictiveInsights: true,
      maxConcurrentSessions: 10,
      enablePersistence: true,
      persistenceInterval: 60 * 1000, // 1 minute
      compressionThreshold: 1000,
      ...config
    };
    
    this.analytics = this.initializeAnalytics();
    this.startCollectionCycle();
  }
  
  /**
   * Initialize analytics structure
   */
  private initializeAnalytics(): ExperienceAnalytics {
    return {
      totalExperience: 0,
      averageSessionLength: 0,
      successRate: 0,
      failureRate: 0,
      experiencePerHour: 0,
      experiencePerDay: 0,
      peakPerformanceTimes: [],
      learningVelocity: 0,
      experienceBySource: {
        [ExperienceSource.PRACTICE]: 0,
        [ExperienceSource.SUCCESS]: 0,
        [ExperienceSource.FAILURE]: 0,
        [ExperienceSource.TEACHING]: 0,
        [ExperienceSource.OBSERVATION]: 0,
        [ExperienceSource.EXPERIMENTATION]: 0,
        [ExperienceSource.SOCIAL]: 0,
        [ExperienceSource.BREAKTHROUGH]: 0
      },
      sourceEffectiveness: {
        [ExperienceSource.PRACTICE]: 1.0,
        [ExperienceSource.SUCCESS]: 1.0,
        [ExperienceSource.FAILURE]: 0.7,
        [ExperienceSource.TEACHING]: 1.2,
        [ExperienceSource.OBSERVATION]: 0.8,
        [ExperienceSource.EXPERIMENTATION]: 1.1,
        [ExperienceSource.SOCIAL]: 1.0,
        [ExperienceSource.BREAKTHROUGH]: 2.0
      },
      experienceByContext: {},
      contextEffectiveness: {},
      averageQuality: 0,
      qualityDistribution: {
        'poor': 0,
        'fair': 0,
        'good': 0,
        'excellent': 0
      },
      highQualityEvents: 0,
      experienceTrend: 'stable',
      learningEfficiencyTrend: 'stable',
      performanceTrend: 'stable'
    };
  }
  
  /**
   * Start the experience collection cycle
   */
  private startCollectionCycle(): void {
    setInterval(() => {
      this.collectExperiences();
      if (this.config.enableRealTimeAnalysis) {
        this.performRealTimeAnalysis();
      }
    }, this.config.collectionInterval);
  }
  
  /**
   * Add an experience event
   */
  public addExperienceEvent(event: ExperienceEvent): void {
    // Validate event
    if (!this.validateExperienceEvent(event)) {
      console.warn('Invalid experience event rejected:', event);
      return;
    }
    
    // Add to history
    this.experienceHistory.push(event);
    
    // Manage history size
    if (this.experienceHistory.length > this.config.maxHistorySize) {
      this.experienceHistory = this.experienceHistory.slice(-this.config.maxHistorySize);
    }
    
    // Update active session or create new one
    this.updateActiveSession(event);
    
    // Trigger immediate analysis for significant events
    if (event.impact > 0.8 || event.source === ExperienceSource.BREAKTHROUGH) {
      this.analyzeSignificantEvent(event);
    }
  }
  
  /**
   * Validate experience event
   */
  private validateExperienceEvent(event: ExperienceEvent): boolean {
    return !!(
      event.id &&
      event.skillType &&
      event.amount > 0 &&
      event.source &&
      event.context &&
      event.timestamp > 0
    );
  }
  
  /**
   * Update or create active learning session
   */
  private updateActiveSession(event: ExperienceEvent): void {
    const sessionId = this.generateSessionId(event);
    let session = this.activeSessions.get(sessionId);
    
    if (!session) {
      // Check if we have too many concurrent sessions
      if (this.activeSessions.size >= this.config.maxConcurrentSessions) {
        this.closeOldestSession();
      }
      
      // Create new session
      session = {
        id: sessionId,
        skillType: event.skillType,
        startTime: event.timestamp,
        endTime: undefined,
        duration: 0,
        experienceGained: 0,
        methods: [],
        context: event.context,
        outcomes: [],
        insights: []
      };
      
      this.activeSessions.set(sessionId, session);
    }
    
    // Update session
    session.experienceGained += event.amount;
    session.duration = event.timestamp - session.startTime;
    
    if (event.success) {
      session.outcomes.push('success');
    } else {
      session.outcomes.push('failure');
    }
    
    // Check if session should be closed
    if (this.shouldCloseSession(session, event)) {
      this.closeSession(sessionId);
    }
  }
  
  /**
   * Generate session ID for event
   */
  private generateSessionId(event: ExperienceEvent): string {
    // Group events by skill type and time proximity
    const timeWindow = 5 * 60 * 1000; // 5 minutes
    const recentSessions = Array.from(this.activeSessions.values())
      .filter(s => s.skillType === event.skillType)
      .filter(s => Math.abs(s.startTime - event.timestamp) < timeWindow);
    
    if (recentSessions.length > 0) {
      return recentSessions[0].id;
    }
    
    return `${event.skillType}_${event.timestamp}_${this.sessionCounter++}`;
  }
  
  /**
   * Check if session should be closed
   */
  private shouldCloseSession(session: LearningSession, event: ExperienceEvent): boolean {
    const timeSinceLastUpdate = event.timestamp - (session.endTime || session.startTime);
    const maxSessionGap = 10 * 60 * 1000; // 10 minutes
    
    return timeSinceLastUpdate > maxSessionGap || session.duration > 2 * 60 * 60 * 1000; // 2 hours max
  }
  
  /**
   * Close a learning session
   */
  private closeSession(sessionId: string): void {
    const session = this.activeSessions.get(sessionId);
    if (!session) return;
    
    session.endTime = Date.now();
    session.duration = session.endTime - session.startTime;
    
    // Move to completed sessions
    this.completedSessions.push(session);
    this.activeSessions.delete(sessionId);
    
    // Analyze completed session
    this.analyzeCompletedSession(session);
    
    // Manage completed sessions history
    if (this.completedSessions.length > this.config.maxHistorySize) {
      this.completedSessions = this.completedSessions.slice(-this.config.maxHistorySize);
    }
  }
  
  /**
   * Close oldest active session
   */
  private closeOldestSession(): void {
    const oldestSession = Array.from(this.activeSessions.values())
      .sort((a, b) => a.startTime - b.startTime)[0];
    
    if (oldestSession) {
      this.closeSession(oldestSession.id);
    }
  }
  
  /**
   * Collect experiences from active sessions
   */
  private collectExperiences(): void {
    // This would integrate with the broader system to collect experiences
    // For now, we'll just update session durations
    const now = Date.now();
    
    this.activeSessions.forEach(session => {
      if (!session.endTime) {
        session.duration = now - session.startTime;
      }
    });
    
    this.lastCollection = now;
  }
  
  /**
   * Perform real-time analysis
   */
  private performRealTimeAnalysis(): void {
    if (Date.now() - this.lastAnalysis < this.config.analysisWindow) {
      return; // Not enough time has passed
    }
    
    this.updateAnalytics();
    this.generateInsights();
    this.detectPatterns();
    
    this.lastAnalysis = Date.now();
  }
  
  /**
   * Update analytics with current data
   */
  private updateAnalytics(): void {
    const recentEvents = this.getRecentEvents(this.config.analysisWindow);
    
    if (recentEvents.length === 0) return;
    
    // Basic statistics
    this.analytics.totalExperience = recentEvents.reduce((sum, event) => sum + event.amount, 0);
    
    // Success/failure rates
    const successfulEvents = recentEvents.filter(e => e.success).length;
    this.analytics.successRate = successfulEvents / recentEvents.length;
    this.analytics.failureRate = 1 - this.analytics.successRate;
    
    // Experience by source
    Object.values(ExperienceSource).forEach(source => {
      this.analytics.experienceBySource[source] = recentEvents
        .filter(e => e.source === source)
        .reduce((sum, e) => sum + e.amount, 0);
    });
    
    // Experience by context
    this.analytics.experienceByContext = {};
    recentEvents.forEach(event => {
      const context = event.context.situation;
      this.analytics.experienceByContext[context] = 
        (this.analytics.experienceByContext[context] || 0) + event.amount;
    });
    
    // Quality analytics
    this.analytics.averageQuality = recentEvents.reduce((sum, e) => sum + e.quality, 0) / recentEvents.length;
    this.analytics.highQualityEvents = recentEvents.filter(e => e.quality > 0.8).length;
    
    // Update quality distribution
    this.analytics.qualityDistribution = {
      'poor': recentEvents.filter(e => e.quality < 0.3).length,
      'fair': recentEvents.filter(e => e.quality >= 0.3 && e.quality < 0.6).length,
      'good': recentEvents.filter(e => e.quality >= 0.6 && e.quality < 0.8).length,
      'excellent': recentEvents.filter(e => e.quality >= 0.8).length
    };
    
    // Time-based analytics
    this.updateTimeBasedAnalytics(recentEvents);
    
    // Trend analysis
    this.updateTrends();
  }
  
  /**
   * Update time-based analytics
   */
  private updateTimeBasedAnalytics(events: ExperienceEvent[]): void {
    if (events.length === 0) return;
    
    const timeSpan = events[events.length - 1].timestamp - events[0].timestamp;
    const hours = timeSpan / (1000 * 60 * 60);
    const days = timeSpan / (1000 * 60 * 60 * 24);
    
    this.analytics.experiencePerHour = hours > 0 ? this.analytics.totalExperience / hours : 0;
    this.analytics.experiencePerDay = days > 0 ? this.analytics.totalExperience / days : 0;
    
    // Calculate average session length
    if (this.completedSessions.length > 0) {
      const totalSessionTime = this.completedSessions.reduce((sum, s) => sum + s.duration, 0);
      this.analytics.averageSessionLength = totalSessionTime / this.completedSessions.length;
    }
    
    // Learning velocity (experience per hour in best sessions)
    const bestSessions = this.completedSessions
      .sort((a, b) => b.experienceGained / b.duration - a.experienceGained / a.duration)
      .slice(0, 5);
    
    if (bestSessions.length > 0) {
      const avgVelocity = bestSessions.reduce((sum, s) => 
        sum + (s.experienceGained / s.duration) * (1000 * 60 * 60), 0) / bestSessions.length;
      this.analytics.learningVelocity = avgVelocity;
    }
  }
  
  /**
   * Update trend analysis
   */
  private updateTrends(): void {
    const timeWindows = [
      this.getRecentEvents(60 * 60 * 1000),   // Last hour
      this.getRecentEvents(6 * 60 * 60 * 1000), // Last 6 hours
      this.getRecentEvents(24 * 60 * 60 * 1000) // Last 24 hours
    ];
    
    if (timeWindows.some(w => w.length === 0)) return;
    
    // Experience trend
    const experiencePerWindow = timeWindows.map(w =>
      w.reduce((sum, e) => sum + e.amount, 0)
    );
    this.analytics.experienceTrend = this.calculateTrend(experiencePerWindow);
    
    // Efficiency trend (success rate)
    const successRates = timeWindows.map(w => {
      if (w.length === 0) return 0;
      return w.filter(e => e.success).length / w.length;
    });
    this.analytics.learningEfficiencyTrend = this.calculateLearningEfficiencyTrend(successRates);
    
    // Performance trend (average quality)
    const qualities = timeWindows.map(w => {
      if (w.length === 0) return 0;
      return w.reduce((sum, e) => sum + e.quality, 0) / w.length;
    });
    this.analytics.performanceTrend = this.calculatePerformanceTrend(qualities);
  }
  
  /**
   * Calculate trend from data points
   */
  private calculateTrend(values: number[]): 'increasing' | 'decreasing' | 'stable' {
    if (values.length < 2) return 'stable';
    
    // Simple linear regression
    const n = values.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = values.reduce((sum, val) => sum + val, 0);
    const sumXY = values.reduce((sum, val, index) => sum + val * index, 0);
    const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6;
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    
    if (slope > 0.1) return 'increasing';
    if (slope < -0.1) return 'decreasing';
    return 'stable';
  }
  
  /**
   * Calculate learning efficiency trend
   */
  private calculateLearningEfficiencyTrend(values: number[]): 'stable' | 'improving' | 'declining' {
    const trend = this.calculateTrend(values);
    switch (trend) {
      case 'increasing': return 'improving';
      case 'decreasing': return 'declining';
      default: return 'stable';
    }
  }
  
  /**
   * Calculate performance trend
   */
  private calculatePerformanceTrend(values: number[]): 'stable' | 'rising' | 'falling' {
    const trend = this.calculateTrend(values);
    switch (trend) {
      case 'increasing': return 'rising';
      case 'decreasing': return 'falling';
      default: return 'stable';
    }
  }
  
  /**
   * Generate learning insights
   */
  private generateInsights(): void {
    const newInsights: LearningInsight[] = [];
    
    // Analyze performance patterns
    if (this.analytics.successRate < 0.5) {
      newInsights.push({
        type: 'warning',
        priority: 'high',
        title: 'Low Success Rate',
        description: `Success rate is ${(this.analytics.successRate * 100).toFixed(1)}%, consider reviewing techniques`,
        confidence: 0.8,
        actionable: true,
        suggestedActions: ['Review basic techniques', 'Reduce difficulty temporarily', 'Focus on fundamentals'],
        expectedImpact: 'Improved success rate and learning efficiency'
      });
    }
    
    // Analyze learning velocity
    if (this.analytics.learningVelocity < 10) {
      newInsights.push({
        type: 'recommendation',
        priority: 'medium',
        title: 'Slow Learning Progress',
        description: 'Learning velocity could be improved with better practice methods',
        confidence: 0.7,
        actionable: true,
        suggestedActions: ['Try different learning contexts', 'Increase practice frequency', 'Find optimal difficulty'],
        expectedImpact: '50-100% increase in learning speed'
      });
    }
    
    // Analyze source effectiveness
    const bestSource = Object.entries(this.analytics.sourceEffectiveness)
      .sort(([, a], [, b]) => b - a)[0];
    
    if (bestSource && bestSource[1] > 1.2) {
      newInsights.push({
        type: 'opportunity',
        priority: 'medium',
        title: 'Effective Learning Method',
        description: `${bestSource[0]} is showing excellent results`,
        confidence: 0.9,
        actionable: true,
        suggestedActions: [`Increase ${bestSource[0]} activities`, 'Apply similar methods to related skills'],
        expectedImpact: 'Enhanced learning efficiency'
      });
    }
    
    // Analyze quality trends
    if (this.analytics.performanceTrend === 'falling') {
      newInsights.push({
        type: 'warning',
        priority: 'high',
        title: 'Declining Performance Quality',
        description: 'Recent performance quality is decreasing',
        confidence: 0.6,
        actionable: true,
        suggestedActions: ['Take a break to prevent burnout', 'Review recent technique changes', 'Check for fatigue'],
        expectedImpact: 'Stabilized or improved performance quality'
      });
    }
    
    // Update insights (keep only recent and high-priority ones)
    this.insights = [...newInsights, ...this.insights]
      .sort((a, b) => {
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      })
      .slice(0, 10); // Keep top 10 insights
  }
  
  /**
   * Detect learning patterns
   */
  private detectPatterns(): void {
    const patterns: ExperiencePattern[] = [];
    const recentEvents = this.getRecentEvents(7 * 24 * 60 * 60 * 1000); // Last 7 days
    
    // Time-based patterns
    const hourlyDistribution: Record<number, number> = {};
    recentEvents.forEach(event => {
      const hour = new Date(event.timestamp).getHours();
      hourlyDistribution[hour] = (hourlyDistribution[hour] || 0) + event.amount;
    });
    
    const peakHours = Object.entries(hourlyDistribution)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([hour]) => parseInt(hour));
    
    if (peakHours.length > 0) {
      patterns.push({
        pattern: 'peak_performance_hours',
        frequency: peakHours.length / 24,
        strength: 0.7,
        context: peakHours.map(h => `hour_${h}`),
        skillTypes: [...new Set(recentEvents.map(e => e.skillType))],
        description: `Best performance during hours: ${peakHours.join(', ')}`
      });
    }
    
    // Context-based patterns
    const contextPerformance: Record<string, { total: number; count: number; quality: number }> = {};
    recentEvents.forEach(event => {
      const context = event.context.situation;
      if (!contextPerformance[context]) {
        contextPerformance[context] = { total: 0, count: 0, quality: 0 };
      }
      contextPerformance[context].total += event.amount;
      contextPerformance[context].count++;
      contextPerformance[context].quality += event.quality;
    });
    
    Object.entries(contextPerformance).forEach(([context, data]) => {
      const avgExperience = data.total / data.count;
      const avgQuality = data.quality / data.count;
      
      if (avgExperience > 50 && avgQuality > 0.7) {
        patterns.push({
          pattern: 'high_performance_context',
          frequency: data.count / recentEvents.length,
          strength: avgQuality,
          context: [context],
          skillTypes: [...new Set(recentEvents.filter(e => e.context.situation === context).map(e => e.skillType))],
          description: `High performance in ${context} context`
        });
      }
    });
    
    this.patterns = patterns;
  }
  
  /**
   * Analyze significant event
   */
  private analyzeSignificantEvent(event: ExperienceEvent): void {
    // Generate immediate insights for breakthrough events
    if (event.source === ExperienceSource.BREAKTHROUGH) {
      this.insights.unshift({
        type: 'achievement',
        priority: 'critical',
        title: 'Breakthrough Achievement!',
        description: `Major breakthrough in ${event.skillType} skill`,
        skillType: event.skillType,
        confidence: 1.0,
        actionable: false,
        suggestedActions: ['Document the breakthrough', 'Share with others', 'Build on this success'],
        expectedImpact: 'Accelerated learning in related areas'
      });
    }
  }
  
  /**
   * Analyze completed session
   */
  private analyzeCompletedSession(session: LearningSession): void {
    // Generate session-specific insights
    const successRate = session.outcomes.filter(o => o === 'success').length / session.outcomes.length;
    const experiencePerHour = (session.experienceGained / session.duration) * (1000 * 60 * 60);
    
    if (successRate > 0.9 && experiencePerHour > 100) {
      session.insights.push('Exceptional performance session');
    } else if (successRate < 0.3) {
      session.insights.push('Challenging session - consider technique review');
    }
    
    if (session.duration > 2 * 60 * 60 * 1000) { // 2 hours
      session.insights.push('Extended practice session - monitor for fatigue');
    }
  }
  
  /**
   * Get recent events within time window
   */
  private getRecentEvents(timeWindow: number): ExperienceEvent[] {
    const cutoff = Date.now() - timeWindow;
    return this.experienceHistory.filter(event => event.timestamp >= cutoff);
  }
  
  /**
   * Get current analytics
   */
  public getAnalytics(): ExperienceAnalytics {
    return { ...this.analytics };
  }
  
  /**
   * Get current insights
   */
  public getInsights(): LearningInsight[] {
    return [...this.insights];
  }
  
  /**
   * Get detected patterns
   */
  public getPatterns(): ExperiencePattern[] {
    return [...this.patterns];
  }
  
  /**
   * Get experience history for skill
   */
  public getSkillExperienceHistory(skillType: SkillType, limit?: number): ExperienceEvent[] {
    const skillEvents = this.experienceHistory.filter(event => event.skillType === skillType);
    return limit ? skillEvents.slice(-limit) : skillEvents;
  }
  
  /**
   * Get learning sessions for skill
   */
  public getSkillSessions(skillType: SkillType): LearningSession[] {
    return this.completedSessions.filter(session => session.skillType === skillType);
  }
  
  /**
   * Get active sessions
   */
  public getActiveSessions(): LearningSession[] {
    return Array.from(this.activeSessions.values());
  }
  
  /**
   * Force analytics update
   */
  public forceAnalysis(): void {
    this.updateAnalytics();
    this.generateInsights();
    this.detectPatterns();
  }
  
  /**
   * Reset experience tracker
   */
  public reset(): void {
    this.experienceHistory = [];
    this.activeSessions.clear();
    this.completedSessions = [];
    this.insights = [];
    this.patterns = [];
    this.analytics = this.initializeAnalytics();
    this.lastAnalysis = 0;
    this.lastCollection = 0;
    this.sessionCounter = 0;
  }
  
  /**
   * Get system statistics
   */
  public getStatistics(): {
    totalEvents: number;
    activeSessions: number;
    completedSessions: number;
    totalExperience: number;
    averageSessionLength: number;
    insightsGenerated: number;
    patternsDetected: number;
  } {
    return {
      totalEvents: this.experienceHistory.length,
      activeSessions: this.activeSessions.size,
      completedSessions: this.completedSessions.length,
      totalExperience: this.analytics.totalExperience,
      averageSessionLength: this.analytics.averageSessionLength,
      insightsGenerated: this.insights.length,
      patternsDetected: this.patterns.length
    };
  }
}