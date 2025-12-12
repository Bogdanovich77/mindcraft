/**
 * Main Anti-Idle System Coordinator
 *
 * Integrates all anti-idle components into a unified system
 * Coordinates goal generation, idle detection, opportunity detection,
 * personality-driven activities, configuration management, and monitoring
 */
import { AgentState } from '../langgraph/interfaces.js';
/**
 * Anti-idle system coordinator configuration
 */
export interface AntiIdleSystemConfig {
    enabled: boolean;
    mode: 'reactive' | 'proactive' | 'adaptive';
    integration: {
        goalSystem: boolean;
        idleDetection: boolean;
        opportunityDetection: boolean;
        activityGeneration: boolean;
        monitoring: boolean;
    };
    performance: {
        maxCpuUsage: number;
        maxMemoryUsage: number;
        maxResponseTime: number;
    };
}
/**
 * System status for anti-idle coordinator
 */
export interface AntiIdleSystemStatus {
    enabled: boolean;
    mode: string;
    components: {
        goalGenerator: boolean;
        idleDetector: boolean;
        opportunityDetector: boolean;
        activityGenerator: boolean;
        configManager: boolean;
        monitoring: boolean;
    };
    performance: {
        cpuUsage: number;
        memoryUsage: number;
        responseTime: number;
        errorRate: number;
    };
    statistics: {
        totalGoalsGenerated: number;
        totalActivitiesGenerated: number;
        totalOpportunitiesDetected: number;
        totalAlertsTriggered: number;
        averageActivityLevel: number;
        uptime: number;
    };
}
/**
 * Main anti-idle system coordinator
 */
export declare class AntiIdleSystem {
    private agentId;
    private purposeCore;
    private skillsSystem;
    private memorySystem;
    private config;
    private status;
    private lastUpdateTime;
    private updateInterval;
    private goalGenerator;
    private idleDetector;
    private opportunityDetector;
    private activityGenerator;
    private configManager;
    private monitoring;
    constructor(agentId: string, purposeCore: any, skillsSystem: any, memorySystem: any, config?: Partial<AntiIdleSystemConfig>);
    /**
     * Initialize all anti-idle components
     */
    private initializeComponents;
    /**
     * Initialize system status
     */
    private initializeStatus;
    /**
     * Start the anti-idle system
     */
    start(): void;
    /**
     * Stop the anti-idle system
     */
    stop(): void;
    /**
     * Update anti-idle system with current agent state
     */
    update(agentState: AgentState): Promise<void>;
    /**
     * Start all components
     */
    private startComponents;
    /**
     * Stop all components
     */
    private stopComponents;
    /**
     * Update all components with current agent state
     */
    private updateComponents;
    /**
     * Integrate generated goals with existing goal system
     */
    private integrateGeneratedGoals;
    /**
     * Handle idle detection
     */
    private handleIdleDetection;
    /**
     * Generate emergency anti-idle goals
     */
    private generateEmergencyAntiIdleGoals;
    /**
     * Execute immediate anti-idle actions
     */
    private executeImmediateAntiIdleActions;
    /**
     * Process detected opportunities
     */
    private processDetectedOpportunities;
    /**
     * Process generated activities
     */
    private processGeneratedActivities;
    /**
     * Select best activity from generated options
     */
    private selectBestActivity;
    /**
     * Calculate activity score
     */
    private calculateActivityScore;
    /**
     * Execute activity
     */
    private executeActivity;
    /**
     * Update system status
     */
    private updateSystemStatus;
    /**
     * Update performance metrics
     */
    private updatePerformanceMetrics;
    /**
     * Update statistics
     */
    private updateStatistics;
    /**
     * Calculate current activity level
     */
    private calculateCurrentActivityLevel;
    /**
     * Handle system errors
     */
    private handleSystemError;
    /**
     * Attempt error recovery
     */
    private attemptErrorRecovery;
    /**
     * Extract personality from agent state
     */
    private extractPersonality;
    /**
     * Start update loop
     */
    private startUpdateLoop;
    /**
     * Get current configuration
     */
    getConfig(): AntiIdleSystemConfig;
    /**
     * Update configuration
     */
    updateConfig(updates: Partial<AntiIdleSystemConfig>): void;
    /**
     * Get current status
     */
    getStatus(): AntiIdleSystemStatus;
    /**
     * Get component status
     */
    getComponentStatus(): {
        goalGenerator?: any;
        idleDetector?: any;
        opportunityDetector?: any;
        activityGenerator?: any;
        configManager?: any;
        monitoring?: any;
    };
    /**
     * Get performance metrics
     */
    getPerformanceMetrics(): {
        cpuUsage: number;
        memoryUsage: number;
        responseTime: number;
        errorRate: number;
    };
    /**
     * Get statistics
     */
    getStatistics(): {
        totalGoalsGenerated: number;
        totalActivitiesGenerated: number;
        totalOpportunitiesDetected: number;
        totalAlertsTriggered: number;
        averageActivityLevel: number;
        uptime: number;
    };
    /**
     * Reset system
     */
    reset(): void;
    /**
     * Enable/disable specific components
     */
    setComponentEnabled(component: keyof AntiIdleSystemConfig['integration'], enabled: boolean): void;
    /**
     * Set system mode
     */
    setMode(mode: 'reactive' | 'proactive' | 'adaptive'): void;
    /**
     * Optimize system for current environment
     */
    optimizeForEnvironment(environment: 'development' | 'testing' | 'production' | 'high_performance'): void;
}
//# sourceMappingURL=anti_idle_system.d.ts.map