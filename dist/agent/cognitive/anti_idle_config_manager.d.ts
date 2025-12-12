/**
 * Anti-Idle Configuration Manager
 *
 * Manages configuration settings for anti-idle behavior
 * Provides validation, persistence, and dynamic updates
 */
import { AntiIdleGoalConfig } from './anti_idle_goal_generator.js';
import { IdleDetectionConfig } from './idle_detection_system.js';
import { ActivityGenerationConfig } from './personality_activity_generator.js';
import { OpportunityDetectionConfig } from './environmental_opportunity_detector.js';
/**
 * Complete anti-idle system configuration
 */
export interface AntiIdleSystemConfig {
    enabled: boolean;
    mode: 'conservative' | 'balanced' | 'aggressive';
    goalGeneration: AntiIdleGoalConfig;
    idleDetection: IdleDetectionConfig;
    activityGeneration: ActivityGenerationConfig;
    opportunityDetection: OpportunityDetectionConfig;
    global: {
        performanceMode: 'survival' | 'balanced' | 'cognitive';
        resourceUsage: 'minimal' | 'standard' | 'maximum';
        alertingEnabled: boolean;
        loggingLevel: 'error' | 'warn' | 'info' | 'debug';
        monitoringEnabled: boolean;
    };
}
/**
 * Configuration presets for different environments
 */
export interface AntiIdlePreset {
    name: string;
    description: string;
    config: AntiIdleSystemConfig;
    environment: 'development' | 'testing' | 'production' | 'high_performance';
}
/**
 * Main anti-idle configuration manager
 */
export declare class AntiIdleConfigManager {
    private agentId;
    private config;
    private presets;
    private configPath;
    private lastSaveTime;
    constructor(agentId: string, configPath?: string, initialConfig?: Partial<AntiIdleSystemConfig>);
    /**
     * Initialize configuration presets
     */
    private initializePresets;
    /**
     * Load configuration from file or create default
     */
    private loadConfiguration;
    /**
     * Get default configuration
     */
    private getDefaultConfig;
    /**
     * Create minimal configuration
     */
    private createMinimalConfig;
    /**
     * Validate configuration
     */
    private validateConfig;
    /**
     * Save configuration to file
     */
    saveConfiguration(): boolean;
    /**
     * Apply preset configuration
     */
    applyPreset(presetName: string): boolean;
    /**
     * Update specific configuration sections
     */
    updateGoalGenerationConfig(updates: Partial<AntiIdleGoalConfig>): void;
    updateIdleDetectionConfig(updates: Partial<IdleDetectionConfig>): void;
    updateActivityGenerationConfig(updates: Partial<ActivityGenerationConfig>): void;
    updateOpportunityDetectionConfig(updates: Partial<OpportunityDetectionConfig>): void;
    updateGlobalConfig(updates: Partial<AntiIdleSystemConfig['global']>): void;
    /**
     * Get current configuration
     */
    getConfig(): AntiIdleSystemConfig;
    /**
     * Get available presets
     */
    getPresets(): Map<string, AntiIdlePreset>;
    /**
     * Optimize configuration for current environment
     */
    optimizeForEnvironment(environment: 'development' | 'testing' | 'production' | 'high_performance'): void;
    /**
     * Auto-adjust configuration based on performance
     */
    autoAdjust(performanceMetrics: {
        averageResponseTime: number;
        successRate: number;
        resourceUsage: number;
        errorRate: number;
    }): void;
    /**
     * Export configuration
     */
    exportConfig(): string;
    /**
     * Import configuration
     */
    importConfig(configJson: string): boolean;
    /**
     * Get configuration summary
     */
    getConfigSummary(): {
        mode: string;
        enabled: boolean;
        totalAntiIdleGoals: number;
        idleThreshold: number;
        activityGenerationEnabled: boolean;
        opportunityDetectionEnabled: boolean;
        monitoringEnabled: boolean;
    };
    private fileExists;
    private readConfigFile;
    private writeConfigFile;
    /**
     * Reset to default configuration
     */
    reset(): void;
    /**
     * Get configuration statistics
     */
    getStatistics(): {
        lastSaveTime: number;
        configurationAge: number;
        presetApplied: string | null;
        adjustmentCount: number;
    };
}
//# sourceMappingURL=anti_idle_config_manager.d.ts.map