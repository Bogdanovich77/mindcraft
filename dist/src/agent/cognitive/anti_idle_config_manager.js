/**
 * Anti-Idle Configuration Manager
 *
 * Manages configuration settings for anti-idle behavior
 * Provides validation, persistence, and dynamic updates
 */
import { GoalLevel } from './goal_types.js';
/**
 * Main anti-idle configuration manager
 */
export class AntiIdleConfigManager {
    agentId;
    config;
    presets = new Map();
    configPath;
    lastSaveTime = 0;
    constructor(agentId, configPath, initialConfig) {
        this.agentId = agentId;
        this.configPath = configPath || `./anti_idle_config_${this.agentId}.json`;
        // Initialize presets
        this.initializePresets();
        // Load or create configuration
        this.config = this.loadConfiguration(initialConfig);
        console.log(`[ANTI_IDLE_CONFIG_MANAGER] Initialized for agent ${this.agentId}`);
    }
    /**
     * Initialize configuration presets
     */
    initializePresets() {
        // Development preset
        this.presets.set('development', {
            name: 'Development',
            description: 'Optimized for development and testing with frequent activity',
            config: {
                enabled: true,
                mode: 'aggressive',
                goalGeneration: {
                    enabled: true,
                    maxAntiIdleGoals: 8,
                    goalPriority: 1, // HIGH
                    goalTypes: [GoalLevel.TACTICAL, GoalLevel.OPERATIONAL], // TACTICAL, OPERATIONAL
                    refreshInterval: 30000, // 30 seconds
                    minActivityThreshold: 0.2,
                    personalityInfluence: 0.8,
                    opportunityDetection: true
                },
                idleDetection: {
                    inactivityThreshold: 15000, // 15 seconds
                    minActivityLevel: 0.2,
                    checkInterval: 3000, // 3 seconds
                    activityHistorySize: 50,
                    cognitiveLoadThreshold: 0.3,
                    movementThreshold: 3.0
                },
                activityGeneration: {
                    enabled: true,
                    maxActivities: 5,
                    minPersonalityAlignment: 0.4,
                    diversityFactor: 0.9,
                    contextWeight: 0.4,
                    personalityWeight: 0.8,
                    refreshInterval: 120000 // 2 minutes
                },
                opportunityDetection: {
                    scanRadius: 48,
                    scanInterval: 5000, // 5 seconds
                    maxOpportunities: 30,
                    minConfidence: 0.2,
                    personalityWeight: 0.8,
                    valueThresholds: {
                        resource: 15,
                        structure: 25,
                        exploration: 20,
                        social: 10,
                        skill: 8
                    }
                },
                global: {
                    performanceMode: 'cognitive',
                    resourceUsage: 'standard',
                    alertingEnabled: true,
                    loggingLevel: 'debug',
                    monitoringEnabled: true
                }
            },
            environment: 'development'
        });
        // Production preset
        this.presets.set('production', {
            name: 'Production',
            description: 'Balanced configuration for stable production environment',
            config: {
                enabled: true,
                mode: 'balanced',
                goalGeneration: {
                    enabled: true,
                    maxAntiIdleGoals: 5,
                    goalPriority: 2, // MEDIUM
                    goalTypes: [GoalLevel.TACTICAL, GoalLevel.OPERATIONAL], // TACTICAL, OPERATIONAL
                    refreshInterval: 60000, // 1 minute
                    minActivityThreshold: 0.1,
                    personalityInfluence: 0.7,
                    opportunityDetection: true
                },
                idleDetection: {
                    inactivityThreshold: 30000, // 30 seconds
                    minActivityLevel: 0.1,
                    checkInterval: 5000, // 5 seconds
                    activityHistorySize: 100,
                    cognitiveLoadThreshold: 0.2,
                    movementThreshold: 5.0
                },
                activityGeneration: {
                    enabled: true,
                    maxActivities: 3,
                    minPersonalityAlignment: 0.6,
                    diversityFactor: 0.7,
                    contextWeight: 0.3,
                    personalityWeight: 0.7,
                    refreshInterval: 300000 // 5 minutes
                },
                opportunityDetection: {
                    scanRadius: 32,
                    scanInterval: 10000, // 10 seconds
                    maxOpportunities: 20,
                    minConfidence: 0.3,
                    personalityWeight: 0.7,
                    valueThresholds: {
                        resource: 20,
                        structure: 30,
                        exploration: 25,
                        social: 15,
                        skill: 10
                    }
                },
                global: {
                    performanceMode: 'balanced',
                    resourceUsage: 'standard',
                    alertingEnabled: true,
                    loggingLevel: 'info',
                    monitoringEnabled: true
                }
            },
            environment: 'production'
        });
        // High performance preset
        this.presets.set('high_performance', {
            name: 'High Performance',
            description: 'Maximum anti-idle responsiveness for high-performance environments',
            config: {
                enabled: true,
                mode: 'aggressive',
                goalGeneration: {
                    enabled: true,
                    maxAntiIdleGoals: 10,
                    goalPriority: 1, // HIGH
                    goalTypes: [GoalLevel.STRATEGIC, GoalLevel.TACTICAL, GoalLevel.OPERATIONAL], // All goal types
                    refreshInterval: 15000, // 15 seconds
                    minActivityThreshold: 0.05,
                    personalityInfluence: 0.9,
                    opportunityDetection: true
                },
                idleDetection: {
                    inactivityThreshold: 10000, // 10 seconds
                    minActivityLevel: 0.05,
                    checkInterval: 2000, // 2 seconds
                    activityHistorySize: 200,
                    cognitiveLoadThreshold: 0.1,
                    movementThreshold: 2.0
                },
                activityGeneration: {
                    enabled: true,
                    maxActivities: 6,
                    minPersonalityAlignment: 0.3,
                    diversityFactor: 0.9,
                    contextWeight: 0.4,
                    personalityWeight: 0.9,
                    refreshInterval: 60000 // 1 minute
                },
                opportunityDetection: {
                    scanRadius: 64,
                    scanInterval: 3000, // 3 seconds
                    maxOpportunities: 50,
                    minConfidence: 0.1,
                    personalityWeight: 0.9,
                    valueThresholds: {
                        resource: 10,
                        structure: 20,
                        exploration: 15,
                        social: 8,
                        skill: 5
                    }
                },
                global: {
                    performanceMode: 'cognitive',
                    resourceUsage: 'maximum',
                    alertingEnabled: true,
                    loggingLevel: 'warn',
                    monitoringEnabled: true
                }
            },
            environment: 'high_performance'
        });
        // Conservative preset
        this.presets.set('conservative', {
            name: 'Conservative',
            description: 'Minimal anti-idle interference for resource-constrained environments',
            config: {
                enabled: true,
                mode: 'conservative',
                goalGeneration: {
                    enabled: true,
                    maxAntiIdleGoals: 3,
                    goalPriority: 3, // LOW
                    goalTypes: [GoalLevel.OPERATIONAL], // Only operational goals
                    refreshInterval: 120000, // 2 minutes
                    minActivityThreshold: 0.3,
                    personalityInfluence: 0.5,
                    opportunityDetection: false
                },
                idleDetection: {
                    inactivityThreshold: 60000, // 1 minute
                    minActivityLevel: 0.3,
                    checkInterval: 10000, // 10 seconds
                    activityHistorySize: 50,
                    cognitiveLoadThreshold: 0.4,
                    movementThreshold: 10.0
                },
                activityGeneration: {
                    enabled: true,
                    maxActivities: 2,
                    minPersonalityAlignment: 0.8,
                    diversityFactor: 0.3,
                    contextWeight: 0.2,
                    personalityWeight: 0.5,
                    refreshInterval: 600000 // 10 minutes
                },
                opportunityDetection: {
                    scanRadius: 16,
                    scanInterval: 30000, // 30 seconds
                    maxOpportunities: 10,
                    minConfidence: 0.5,
                    personalityWeight: 0.5,
                    valueThresholds: {
                        resource: 30,
                        structure: 40,
                        exploration: 35,
                        social: 25,
                        skill: 20
                    }
                },
                global: {
                    performanceMode: 'survival',
                    resourceUsage: 'minimal',
                    alertingEnabled: false,
                    loggingLevel: 'error',
                    monitoringEnabled: false
                }
            },
            environment: 'production'
        });
    }
    /**
     * Load configuration from file or create default
     */
    loadConfiguration(initialConfig) {
        try {
            // Try to load from file
            if (this.configPath && this.fileExists(this.configPath)) {
                const fileContent = this.readConfigFile(this.configPath);
                if (fileContent) {
                    const loadedConfig = JSON.parse(fileContent);
                    if (this.validateConfig(loadedConfig)) {
                        console.log(`[ANTI_IDLE_CONFIG_MANAGER] Configuration loaded from ${this.configPath}`);
                        return { ...this.getDefaultConfig(), ...loadedConfig, ...initialConfig };
                    }
                    else {
                        console.warn('[ANTI_IDLE_CONFIG_MANAGER] Invalid configuration in file, using defaults');
                    }
                }
            }
        }
        catch (error) {
            console.error('[ANTI_IDLE_CONFIG_MANAGER] Error loading configuration:', error);
        }
        // Return default with any initial overrides
        return { ...this.getDefaultConfig(), ...initialConfig };
    }
    /**
     * Get default configuration
     */
    getDefaultConfig() {
        return this.presets.get('production')?.config || this.createMinimalConfig();
    }
    /**
     * Create minimal configuration
     */
    createMinimalConfig() {
        return {
            enabled: true,
            mode: 'balanced',
            goalGeneration: {
                enabled: true,
                maxAntiIdleGoals: 5,
                goalPriority: 2, // MEDIUM
                goalTypes: [GoalLevel.OPERATIONAL, GoalLevel.TACTICAL], // OPERATIONAL, TACTICAL
                refreshInterval: 60000, // 1 minute
                minActivityThreshold: 0.1,
                personalityInfluence: 0.7,
                opportunityDetection: true
            },
            idleDetection: {
                inactivityThreshold: 30000, // 30 seconds
                minActivityLevel: 0.1,
                checkInterval: 5000, // 5 seconds
                activityHistorySize: 100,
                cognitiveLoadThreshold: 0.2,
                movementThreshold: 5.0
            },
            activityGeneration: {
                enabled: true,
                maxActivities: 3,
                minPersonalityAlignment: 0.6,
                diversityFactor: 0.7,
                contextWeight: 0.3,
                personalityWeight: 0.7,
                refreshInterval: 300000 // 5 minutes
            },
            opportunityDetection: {
                scanRadius: 32,
                scanInterval: 10000, // 10 seconds
                maxOpportunities: 20,
                minConfidence: 0.3,
                personalityWeight: 0.7,
                valueThresholds: {
                    resource: 20,
                    structure: 30,
                    exploration: 25,
                    social: 15,
                    skill: 10
                }
            },
            global: {
                performanceMode: 'balanced',
                resourceUsage: 'standard',
                alertingEnabled: true,
                loggingLevel: 'info',
                monitoringEnabled: true
            }
        };
    }
    /**
     * Validate configuration
     */
    validateConfig(config) {
        try {
            // Check required top-level properties
            const requiredProps = ['enabled', 'mode', 'goalGeneration', 'idleDetection', 'activityGeneration', 'opportunityDetection', 'global'];
            for (const prop of requiredProps) {
                if (!(prop in config)) {
                    console.error(`[ANTI_IDLE_CONFIG_MANAGER] Missing required property: ${prop}`);
                    return false;
                }
            }
            // Check mode values
            const validModes = ['conservative', 'balanced', 'aggressive'];
            if (!validModes.includes(config.mode)) {
                console.error(`[ANTI_IDLE_CONFIG_MANAGER] Invalid mode: ${config.mode}`);
                return false;
            }
            // Check numeric ranges
            if (config.goalGeneration?.maxAntiIdleGoals < 1 || config.goalGeneration?.maxAntiIdleGoals > 20) {
                console.error('[ANTI_IDLE_CONFIG_MANAGER] Invalid maxAntiIdleGoals range');
                return false;
            }
            if (config.idleDetection?.inactivityThreshold < 5000 || config.idleDetection?.inactivityThreshold > 300000) {
                console.error('[ANTI_IDLE_CONFIG_MANAGER] Invalid inactivityThreshold range');
                return false;
            }
            return true;
        }
        catch (error) {
            console.error('[ANTI_IDLE_CONFIG_MANAGER] Configuration validation error:', error);
            return false;
        }
    }
    /**
     * Save configuration to file
     */
    saveConfiguration() {
        try {
            const configJson = JSON.stringify(this.config, null, 2);
            this.writeConfigFile(this.configPath, configJson);
            this.lastSaveTime = Date.now();
            console.log(`[ANTI_IDLE_CONFIG_MANAGER] Configuration saved to ${this.configPath}`);
            return true;
        }
        catch (error) {
            console.error('[ANTI_IDLE_CONFIG_MANAGER] Error saving configuration:', error);
            return false;
        }
    }
    /**
     * Apply preset configuration
     */
    applyPreset(presetName) {
        const preset = this.presets.get(presetName);
        if (!preset) {
            console.error(`[ANTI_IDLE_CONFIG_MANAGER] Unknown preset: ${presetName}`);
            return false;
        }
        if (this.validateConfig(preset.config)) {
            this.config = { ...preset.config };
            console.log(`[ANTI_IDLE_CONFIG_MANAGER] Applied preset: ${presetName}`);
            return true;
        }
        else {
            console.error(`[ANTI_IDLE_CONFIG_MANAGER] Invalid preset configuration: ${presetName}`);
            return false;
        }
    }
    /**
     * Update specific configuration sections
     */
    updateGoalGenerationConfig(updates) {
        this.config.goalGeneration = { ...this.config.goalGeneration, ...updates };
        console.log(`[ANTI_IDLE_CONFIG_MANAGER] Goal generation config updated:`, updates);
    }
    updateIdleDetectionConfig(updates) {
        this.config.idleDetection = { ...this.config.idleDetection, ...updates };
        console.log(`[ANTI_IDLE_CONFIG_MANAGER] Idle detection config updated:`, updates);
    }
    updateActivityGenerationConfig(updates) {
        this.config.activityGeneration = { ...this.config.activityGeneration, ...updates };
        console.log(`[ANTI_IDLE_CONFIG_MANAGER] Activity generation config updated:`, updates);
    }
    updateOpportunityDetectionConfig(updates) {
        this.config.opportunityDetection = { ...this.config.opportunityDetection, ...updates };
        console.log(`[ANTI_IDLE_CONFIG_MANAGER] Opportunity detection config updated:`, updates);
    }
    updateGlobalConfig(updates) {
        this.config.global = { ...this.config.global, ...updates };
        console.log(`[ANTI_IDLE_CONFIG_MANAGER] Global config updated:`, updates);
    }
    /**
     * Get current configuration
     */
    getConfig() {
        return { ...this.config };
    }
    /**
     * Get available presets
     */
    getPresets() {
        return new Map(this.presets);
    }
    /**
     * Optimize configuration for current environment
     */
    optimizeForEnvironment(environment) {
        const presetName = environment === 'high_performance' ? 'high_performance' :
            environment === 'development' ? 'development' : 'production';
        this.applyPreset(presetName);
        // Apply environment-specific optimizations
        if (environment === 'development') {
            this.updateGlobalConfig({ loggingLevel: 'debug', monitoringEnabled: true });
        }
        else if (environment === 'production') {
            this.updateGlobalConfig({ loggingLevel: 'warn', resourceUsage: 'standard' });
        }
        else if (environment === 'high_performance') {
            this.updateGlobalConfig({ resourceUsage: 'maximum', performanceMode: 'cognitive' });
        }
    }
    /**
     * Auto-adjust configuration based on performance
     */
    autoAdjust(performanceMetrics) {
        const adjustments = {};
        // Adjust based on response time
        if (performanceMetrics.averageResponseTime > 2000) {
            adjustments.goalGeneration = {
                ...this.config.goalGeneration,
                refreshInterval: Math.max(15000, this.config.goalGeneration.refreshInterval * 0.8)
            };
            adjustments.idleDetection = {
                ...this.config.idleDetection,
                checkInterval: Math.max(2000, this.config.idleDetection.checkInterval * 0.8)
            };
        }
        else if (performanceMetrics.averageResponseTime < 500) {
            // Can be more aggressive
            adjustments.goalGeneration = {
                ...this.config.goalGeneration,
                refreshInterval: Math.min(30000, this.config.goalGeneration.refreshInterval * 1.2)
            };
        }
        // Adjust based on success rate
        if (performanceMetrics.successRate < 0.7) {
            // Reduce aggressiveness
            adjustments.goalGeneration = {
                ...this.config.goalGeneration,
                maxAntiIdleGoals: Math.max(3, this.config.goalGeneration.maxAntiIdleGoals - 1)
            };
            adjustments.activityGeneration = {
                ...this.config.activityGeneration,
                maxActivities: Math.max(2, this.config.activityGeneration.maxActivities - 1)
            };
        }
        else if (performanceMetrics.successRate > 0.9) {
            // Can be more aggressive
            adjustments.goalGeneration = {
                ...this.config.goalGeneration,
                maxAntiIdleGoals: Math.min(10, this.config.goalGeneration.maxAntiIdleGoals + 1)
            };
            adjustments.activityGeneration = {
                ...this.config.activityGeneration,
                maxActivities: Math.min(6, this.config.activityGeneration.maxActivities + 1)
            };
        }
        // Adjust based on resource usage
        if (performanceMetrics.resourceUsage > 0.8) {
            // Reduce resource usage
            adjustments.opportunityDetection = {
                ...this.config.opportunityDetection,
                scanRadius: Math.max(16, this.config.opportunityDetection.scanRadius * 0.8),
                maxOpportunities: Math.max(10, this.config.opportunityDetection.maxOpportunities * 0.8)
            };
        }
        // Apply adjustments
        if (adjustments.goalGeneration) {
            this.updateGoalGenerationConfig(adjustments.goalGeneration);
        }
        if (adjustments.idleDetection) {
            this.updateIdleDetectionConfig(adjustments.idleDetection);
        }
        if (adjustments.activityGeneration) {
            this.updateActivityGenerationConfig(adjustments.activityGeneration);
        }
        if (adjustments.opportunityDetection) {
            this.updateOpportunityDetectionConfig(adjustments.opportunityDetection);
        }
        console.log('[ANTI_IDLE_CONFIG_MANAGER] Auto-adjustment applied based on performance metrics');
    }
    /**
     * Export configuration
     */
    exportConfig() {
        return JSON.stringify(this.config, null, 2);
    }
    /**
     * Import configuration
     */
    importConfig(configJson) {
        try {
            const importedConfig = JSON.parse(configJson);
            if (this.validateConfig(importedConfig)) {
                this.config = { ...importedConfig };
                console.log('[ANTI_IDLE_CONFIG_MANAGER] Configuration imported successfully');
                return true;
            }
            else {
                console.error('[ANTI_IDLE_CONFIG_MANAGER] Invalid imported configuration');
                return false;
            }
        }
        catch (error) {
            console.error('[ANTI_IDLE_CONFIG_MANAGER] Error importing configuration:', error);
            return false;
        }
    }
    /**
     * Get configuration summary
     */
    getConfigSummary() {
        return {
            mode: this.config.mode,
            enabled: this.config.enabled,
            totalAntiIdleGoals: this.config.goalGeneration.maxAntiIdleGoals,
            idleThreshold: this.config.idleDetection.inactivityThreshold,
            activityGenerationEnabled: this.config.activityGeneration.enabled,
            opportunityDetectionEnabled: this.config.opportunityDetection.scanRadius > 0,
            monitoringEnabled: this.config.global.monitoringEnabled
        };
    }
    // File system helpers (placeholder implementations)
    fileExists(path) {
        try {
            // In a real implementation, this would check file system
            return false; // Placeholder
        }
        catch (error) {
            return false;
        }
    }
    readConfigFile(path) {
        try {
            // In a real implementation, this would read from file system
            return null; // Placeholder
        }
        catch (error) {
            return null;
        }
    }
    writeConfigFile(path, content) {
        try {
            // In a real implementation, this would write to file system
            console.log(`[ANTI_IDLE_CONFIG_MANAGER] Would write config to: ${path}`);
        }
        catch (error) {
            console.error('[ANTI_IDLE_CONFIG_MANAGER] Error writing config file:', error);
        }
    }
    /**
     * Reset to default configuration
     */
    reset() {
        this.config = this.getDefaultConfig();
        console.log(`[ANTI_IDLE_CONFIG_MANAGER] Configuration reset to defaults for agent ${this.agentId}`);
    }
    /**
     * Get configuration statistics
     */
    getStatistics() {
        return {
            lastSaveTime: this.lastSaveTime,
            configurationAge: this.lastSaveTime > 0 ? Date.now() - this.lastSaveTime : 0,
            presetApplied: null, // Would track this in real implementation
            adjustmentCount: 0 // Would track this in real implementation
        };
    }
}
