/**
 * Main Anti-Idle System Coordinator
 *
 * Integrates all anti-idle components into a unified system
 * Coordinates goal generation, idle detection, opportunity detection,
 * personality-driven activities, configuration management, and monitoring
 */
import { AntiIdleGoalGenerator } from './anti_idle_goal_generator.js';
import { IdleDetectionSystem } from './idle_detection_system.js';
import { EnvironmentalOpportunityDetector } from './environmental_opportunity_detector.js';
import { PersonalityActivityGenerator } from './personality_activity_generator.js';
import { AntiIdleConfigManager } from './anti_idle_config_manager.js';
import { AntiIdleMonitoringSystem } from './anti_idle_monitoring_system.js';
import { PurposeCore } from './purpose_core.js';
import { SkillsSystem } from './skills_system.js';
import { PersonalitySystem } from './personality.js';
import { MemorySystem } from '../memory/memory_system.js';
/**
 * Main anti-idle system coordinator
 */
export class AntiIdleSystem {
    agentId;
    purposeCore;
    skillsSystem;
    memorySystem;
    config;
    status;
    lastUpdateTime = 0;
    updateInterval = 5000; // 5 seconds
    // Component instances - properly initialize to avoid TypeScript errors
    goalGenerator;
    idleDetector;
    opportunityDetector;
    activityGenerator;
    configManager;
    monitoring;
    constructor(agentId, purposeCore, skillsSystem, memorySystem, config) {
        this.agentId = agentId;
        this.purposeCore = purposeCore;
        this.skillsSystem = skillsSystem;
        this.memorySystem = memorySystem;
        // Initialize configuration
        this.config = {
            enabled: true,
            mode: 'adaptive',
            integration: {
                goalSystem: true,
                idleDetection: true,
                opportunityDetection: true,
                activityGeneration: true,
                monitoring: true
            },
            performance: {
                maxCpuUsage: 80,
                maxMemoryUsage: 1024, // 1GB
                maxResponseTime: 2000 // 2 seconds
            },
            ...config
        };
        // Initialize components
        this.initializeComponents(agentId, purposeCore, skillsSystem, memorySystem);
        // Initialize status
        this.status = this.initializeStatus();
        console.log(`[ANTI_IDLE_SYSTEM] Anti-idle system initialized for agent ${this.agentId}`);
    }
    /**
     * Initialize all anti-idle components
     */
    initializeComponents(agentId, purposeCore, skillsSystem, memorySystem) {
        try {
            // Initialize configuration manager first
            this.configManager = new AntiIdleConfigManager(agentId, undefined, // Use default config path
            undefined // Use default config
            );
            // Initialize goal generator
            if (this.config.integration.goalSystem) {
                this.goalGenerator = new AntiIdleGoalGenerator(purposeCore, skillsSystem, memorySystem, this.configManager?.getConfig()?.goalGeneration);
            }
            // Initialize idle detector
            if (this.config.integration.idleDetection) {
                this.idleDetector = new IdleDetectionSystem(agentId, this.configManager?.getConfig()?.idleDetection);
            }
            // Initialize opportunity detector
            if (this.config.integration.opportunityDetection) {
                this.opportunityDetector = new EnvironmentalOpportunityDetector(agentId, this.configManager?.getConfig()?.opportunityDetection);
            }
            // Initialize activity generator
            if (this.config.integration.activityGeneration) {
                this.activityGenerator = new PersonalityActivityGenerator(agentId, this.configManager?.getConfig()?.activityGeneration);
            }
            // Initialize monitoring system
            if (this.config.integration.monitoring) {
                this.monitoring = new AntiIdleMonitoringSystem(agentId, this.idleDetector, // Non-null assertion since we check integration.monitoring
                this.goalGenerator, // Non-null assertion since we check integration.monitoring
                this.opportunityDetector, // Non-null assertion since we check integration.monitoring
                this.activityGenerator, // Non-null assertion since we check integration.monitoring
                this.configManager?.getConfig()?.global.monitoringEnabled ? {} : undefined);
            }
        }
        catch (error) {
            console.error('[ANTI_IDLE_SYSTEM] Error initializing components:', error);
            throw error;
        }
    }
    /**
     * Initialize system status
     */
    initializeStatus() {
        return {
            enabled: this.config.enabled,
            mode: this.config.mode,
            components: {
                goalGenerator: !!this.goalGenerator,
                idleDetector: !!this.idleDetector,
                opportunityDetector: !!this.opportunityDetector,
                activityGenerator: !!this.activityGenerator,
                configManager: !!this.configManager,
                monitoring: !!this.monitoring
            },
            performance: {
                cpuUsage: 0,
                memoryUsage: 0,
                responseTime: 0,
                errorRate: 0
            },
            statistics: {
                totalGoalsGenerated: 0,
                totalActivitiesGenerated: 0,
                totalOpportunitiesDetected: 0,
                totalAlertsTriggered: 0,
                averageActivityLevel: 0,
                uptime: 0
            }
        };
    }
    /**
     * Start the anti-idle system
     */
    start() {
        if (!this.config.enabled) {
            console.log(`[ANTI_IDLE_SYSTEM] Anti-idle system disabled for agent ${this.agentId}`);
            return;
        }
        console.log(`[ANTI_IDLE_SYSTEM] Starting anti-idle system for agent ${this.agentId} in ${this.config.mode} mode`);
        // Start all components
        this.startComponents();
        // Start update loop
        this.startUpdateLoop();
    }
    /**
     * Stop the anti-idle system
     */
    stop() {
        console.log(`[ANTI_IDLE_SYSTEM] Stopping anti-idle system for agent ${this.agentId}`);
        // Stop update loop
        // (In real implementation, would clear interval)
        // Stop all components
        this.stopComponents();
    }
    /**
     * Update anti-idle system with current agent state
     */
    async update(agentState) {
        if (!this.config.enabled) {
            return;
        }
        const now = Date.now();
        try {
            // Update all components
            await this.updateComponents(agentState);
            // Update system status
            this.updateSystemStatus(agentState);
            this.lastUpdateTime = now;
        }
        catch (error) {
            console.error('[ANTI_IDLE_SYSTEM] Error during update:', error);
            this.handleSystemError(error, agentState);
        }
    }
    /**
     * Start all components
     */
    startComponents() {
        try {
            // Components are initialized in constructor
            // In real implementation, would call start methods if available
            console.log('[ANTI_IDLE_SYSTEM] All components started');
        }
        catch (error) {
            console.error('[ANTI_IDLE_SYSTEM] Error starting components:', error);
        }
    }
    /**
     * Stop all components
     */
    stopComponents() {
        try {
            // In real implementation, would call stop methods if available
            console.log('[ANTI_IDLE_SYSTEM] All components stopped');
        }
        catch (error) {
            console.error('[ANTI_IDLE_SYSTEM] Error stopping components:', error);
        }
    }
    /**
     * Update all components with current agent state
     */
    async updateComponents(agentState) {
        const updatePromises = [];
        // Update goal generator
        if (this.goalGenerator && this.config.integration.goalSystem) {
            updatePromises.push(this.goalGenerator.generateAntiIdleGoals(agentState)
                .then(goals => {
                // Integrate goals with existing goal system
                this.integrateGeneratedGoals(goals, agentState);
            })
                .catch(error => {
                console.error('[ANTI_IDLE_SYSTEM] Goal generator error:', error);
            }));
        }
        // Update idle detector
        if (this.idleDetector && this.config.integration.idleDetection) {
            const isIdle = this.idleDetector.checkIdleStatus(agentState);
            // Trigger anti-idle response if idle detected
            if (isIdle) {
                updatePromises.push(this.handleIdleDetection(agentState));
            }
        }
        // Update opportunity detector
        if (this.opportunityDetector && this.config.integration.opportunityDetection) {
            updatePromises.push(this.opportunityDetector.scanForOpportunities(agentState)
                .then(opportunities => {
                // Process detected opportunities
                this.processDetectedOpportunities(opportunities, agentState);
            })
                .catch(error => {
                console.error('[ANTI_IDLE_SYSTEM] Opportunity detector error:', error);
            }));
        }
        // Update activity generator
        if (this.activityGenerator && this.config.integration.activityGeneration) {
            updatePromises.push(this.activityGenerator.generateActivities(agentState)
                .then(activities => {
                // Process generated activities
                this.processGeneratedActivities(activities, agentState);
            })
                .catch(error => {
                console.error('[ANTI_IDLE_SYSTEM] Activity generator error:', error);
            }));
        }
        // Update monitoring system
        if (this.monitoring && this.config.integration.monitoring) {
            this.monitoring.updateMonitoring(agentState);
        }
        // Wait for all updates to complete
        await Promise.allSettled(updatePromises);
    }
    /**
     * Integrate generated goals with existing goal system
     */
    integrateGeneratedGoals(goals, agentState) {
        try {
            // In real implementation, would integrate with existing goal system
            // This would add goals to the agent's goal queue
            console.log(`[ANTI_IDLE_SYSTEM] Generated ${goals.length} anti-idle goals to integrate`);
            // Update statistics
            this.status.statistics.totalGoalsGenerated += goals.length;
        }
        catch (error) {
            console.error('[ANTI_IDLE_SYSTEM] Error integrating goals:', error);
        }
    }
    /**
     * Handle idle detection
     */
    async handleIdleDetection(agentState) {
        try {
            // Generate emergency anti-idle goals
            const emergencyGoals = await this.generateEmergencyAntiIdleGoals(agentState);
            // Execute immediate anti-idle actions
            await this.executeImmediateAntiIdleActions(emergencyGoals, agentState);
            console.log(`[ANTI_IDLE_SYSTEM] Handled idle detection with ${emergencyGoals.length} emergency goals`);
        }
        catch (error) {
            console.error('[ANTI_IDLE_SYSTEM] Error handling idle detection:', error);
        }
    }
    /**
     * Generate emergency anti-idle goals
     */
    async generateEmergencyAntiIdleGoals(agentState) {
        const goals = [];
        // Generate immediate goals based on current state
        if (agentState.context.health < 20) {
            goals.push({
                type: 'emergency_health',
                description: 'Urgent health restoration needed',
                priority: 0, // CRITICAL
                immediate: true
            });
        }
        if (agentState.context.food < 15) {
            goals.push({
                type: 'emergency_food',
                description: 'Urgent food acquisition needed',
                priority: 0, // CRITICAL
                immediate: true
            });
        }
        return goals;
    }
    /**
     * Execute immediate anti-idle actions
     */
    async executeImmediateAntiIdleActions(goals, agentState) {
        try {
            // In real implementation, would execute immediate actions
            // This could include movement, interaction, or basic behaviors
            console.log(`[ANTI_IDLE_SYSTEM] Executed ${goals.length} immediate anti-idle actions`);
        }
        catch (error) {
            console.error('[ANTI_IDLE_SYSTEM] Error executing immediate actions:', error);
        }
    }
    /**
     * Process detected opportunities
     */
    processDetectedOpportunities(opportunities, agentState) {
        try {
            // Filter high-priority opportunities
            const highPriorityOpportunities = opportunities.filter(opp => opp.priority <= 1);
            if (highPriorityOpportunities.length > 0) {
                // Generate goals for high-priority opportunities
                const opportunityGoals = highPriorityOpportunities.map(opp => ({
                    type: 'opportunity',
                    description: opp.description,
                    priority: opp.priority,
                    source: 'anti_idle_system'
                }));
                // In real implementation, would add to goal system
                console.log(`[ANTI_IDLE_SYSTEM] Generated ${opportunityGoals.length} opportunity-based goals`);
            }
            // Update statistics
            this.status.statistics.totalOpportunitiesDetected += opportunities.length;
        }
        catch (error) {
            console.error('[ANTI_IDLE_SYSTEM] Error processing opportunities:', error);
        }
    }
    /**
     * Process generated activities
     */
    processGeneratedActivities(activities, agentState) {
        try {
            // Select best activity based on personality and context
            const bestActivity = this.selectBestActivity(activities, agentState);
            if (bestActivity) {
                // Execute or schedule the activity
                this.executeActivity(bestActivity, agentState);
                console.log(`[ANTI_IDLE_SYSTEM] Executed activity: ${bestActivity.description}`);
            }
            // Update statistics
            this.status.statistics.totalActivitiesGenerated += activities.length;
        }
        catch (error) {
            console.error('[ANTI_IDLE_SYSTEM] Error processing activities:', error);
        }
    }
    /**
     * Select best activity from generated options
     */
    selectBestActivity(activities, agentState) {
        if (activities.length === 0) {
            return null;
        }
        const personality = this.extractPersonality(agentState);
        // Score activities based on personality alignment and context
        const scoredActivities = activities.map(activity => ({
            ...activity,
            score: this.calculateActivityScore(activity, personality, agentState)
        }));
        // Sort by score and return best
        scoredActivities.sort((a, b) => b.score - a.score);
        return scoredActivities[0];
    }
    /**
     * Calculate activity score
     */
    calculateActivityScore(activity, personality, agentState) {
        let score = activity.personalityAlignment || 0.5;
        // Context-based scoring
        if (agentState.context.health < 30 && activity.type === 'combat') {
            score -= 0.3; // Avoid combat when low health
        }
        if (agentState.context.nearbyEntities?.length > 5 && activity.type === 'social') {
            score += 0.2; // Favor social when many entities nearby
        }
        return Math.max(0, Math.min(1, score));
    }
    /**
     * Execute activity
     */
    executeActivity(activity, agentState) {
        try {
            // In real implementation, would execute the activity
            // This could involve movement, interaction, crafting, etc.
            console.log(`[ANTI_IDLE_SYSTEM] Executing activity: ${activity.description}`);
        }
        catch (error) {
            console.error('[ANTI_IDLE_SYSTEM] Error executing activity:', error);
        }
    }
    /**
     * Update system status
     */
    updateSystemStatus(agentState) {
        try {
            // Update component status
            this.status.components.goalGenerator = !!this.goalGenerator;
            this.status.components.idleDetector = !!this.idleDetector;
            this.status.components.opportunityDetector = !!this.opportunityDetector;
            this.status.components.activityGenerator = !!this.activityGenerator;
            this.status.components.configManager = !!this.configManager;
            this.status.components.monitoring = !!this.monitoring;
            // Update performance metrics
            this.updatePerformanceMetrics(agentState);
            // Update statistics
            this.updateStatistics(agentState);
        }
        catch (error) {
            console.error('[ANTI_IDLE_SYSTEM] Error updating status:', error);
        }
    }
    /**
     * Update performance metrics
     */
    updatePerformanceMetrics(agentState) {
        try {
            const now = Date.now();
            // Get metrics from monitoring system
            const monitoringMetrics = this.monitoring?.getMetrics();
            if (monitoringMetrics) {
                this.status.performance.cpuUsage = monitoringMetrics.cpuUsage || 0;
                this.status.performance.memoryUsage = monitoringMetrics.memoryUsage || 0;
                this.status.performance.responseTime = monitoringMetrics.responseTime || 0;
                this.status.performance.errorRate = monitoringMetrics.errorCount || 0;
            }
        }
        catch (error) {
            console.error('[ANTI_IDLE_SYSTEM] Error updating performance metrics:', error);
        }
    }
    /**
     * Update statistics
     */
    updateStatistics(agentState) {
        try {
            const now = Date.now();
            // Update uptime
            if (this.status.statistics.uptime === 0) {
                this.status.statistics.uptime = now;
            }
            // Update average activity level
            const currentActivityLevel = this.calculateCurrentActivityLevel(agentState);
            this.status.statistics.averageActivityLevel =
                (this.status.statistics.averageActivityLevel * 0.8) + (currentActivityLevel * 0.2);
        }
        catch (error) {
            console.error('[ANTI_IDLE_SYSTEM] Error updating statistics:', error);
        }
    }
    /**
     * Calculate current activity level
     */
    calculateCurrentActivityLevel(agentState) {
        // Simple activity level calculation
        let activityLevel = 0.3; // Base level
        // Factor in recent actions
        if (agentState.executive?.currentAction) {
            activityLevel += 0.2;
        }
        // Factor in active goals
        const activeGoals = agentState.cognitive?.goals?.activeGoals || [];
        if (activeGoals.length > 0) {
            activityLevel += 0.3;
        }
        // Factor in recent responses
        const recentResponses = agentState.executive?.responseHistory || [];
        if (recentResponses.length > 2) {
            activityLevel += 0.2;
        }
        return Math.min(1.0, activityLevel);
    }
    /**
     * Handle system errors
     */
    handleSystemError(error, agentState) {
        try {
            console.error('[ANTI_IDLE_SYSTEM] System error:', error);
            // Attempt recovery
            this.attemptErrorRecovery(error, agentState);
        }
        catch (recoveryError) {
            console.error('[ANTI_IDLE_SYSTEM] Error during recovery:', recoveryError);
        }
    }
    /**
     * Attempt error recovery
     */
    attemptErrorRecovery(error, agentState) {
        try {
            // Reset affected components
            if (error.component === 'goalGenerator') {
                // Reset goal generator
                // Create a PurposeCore instance from the current state
                const purposeCore = agentState.cognitive?.purpose ?
                    agentState.cognitive.purpose : new PurposeCore();
                // If we have existing purpose state, initialize the PurposeCore with it
                if (agentState.cognitive?.purpose) {
                    // Initialize PurposeCore with existing state data
                    Object.assign(purposeCore, agentState.cognitive.purpose);
                }
                this.goalGenerator = new AntiIdleGoalGenerator(purposeCore instanceof PurposeCore ? purposeCore : new PurposeCore(), new SkillsSystem(new PersonalitySystem()), // Create SkillsSystem instance with PersonalitySystem
                new MemorySystem(), // Create MemorySystem instance
                this.configManager?.getConfig()?.goalGeneration);
            }
            console.log('[ANTI_IDLE_SYSTEM] Error recovery attempted for component:', error.component);
        }
        catch (recoveryError) {
            console.error('[ANTI_IDLE_SYSTEM] Recovery failed:', recoveryError);
        }
    }
    /**
     * Extract personality from agent state
     */
    extractPersonality(agentState) {
        return agentState.cognitive?.purpose?.personality || {
            openness: 0.5,
            conscientiousness: 0.5,
            extraversion: 0.5,
            agreeableness: 0.5,
            neuroticism: 0.5,
            riskTolerance: 0.5,
            explorationDrive: 0.5,
            socialTendency: 0.5,
            buildingCreativity: 0.5,
            combatAggression: 0.5
        };
    }
    /**
     * Start update loop
     */
    startUpdateLoop() {
        // In real implementation, would set up interval for periodic updates
        console.log('[ANTI_IDLE_SYSTEM] Update loop started');
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
        console.log(`[ANTI_IDLE_SYSTEM] Configuration updated for agent ${this.agentId}:`, updates);
    }
    /**
     * Get current status
     */
    getStatus() {
        return { ...this.status };
    }
    /**
     * Get component status
     */
    getComponentStatus() {
        return {
            goalGenerator: this.goalGenerator?.getStatistics?.(),
            idleDetector: this.idleDetector?.getMetrics?.(),
            opportunityDetector: this.opportunityDetector?.getStatistics?.(),
            activityGenerator: this.activityGenerator?.getStatistics?.(),
            configManager: this.configManager?.getConfigSummary?.(),
            monitoring: this.monitoring?.getMetrics?.()
        };
    }
    /**
     * Get performance metrics
     */
    getPerformanceMetrics() {
        return this.status.performance;
    }
    /**
     * Get statistics
     */
    getStatistics() {
        return this.status.statistics;
    }
    /**
     * Reset system
     */
    reset() {
        try {
            // Reset all components
            if (this.goalGenerator) {
                // this.goalGenerator.reset?.();
            }
            if (this.idleDetector) {
                this.idleDetector.reset();
            }
            if (this.activityGenerator) {
                this.activityGenerator.reset();
            }
            if (this.configManager) {
                this.configManager.reset();
            }
            if (this.monitoring) {
                // this.monitoring.reset?.();
            }
            // Reset status
            this.status = this.initializeStatus();
            console.log(`[ANTI_IDLE_SYSTEM] System reset for agent ${this.agentId}`);
        }
        catch (error) {
            console.error('[ANTI_IDLE_SYSTEM] Error during reset:', error);
        }
    }
    /**
     * Enable/disable specific components
     */
    setComponentEnabled(component, enabled) {
        if (component in this.config.integration) {
            this.config.integration[component] = enabled;
            console.log(`[ANTI_IDLE_SYSTEM] Component ${component} ${enabled ? 'enabled' : 'disabled'}`);
        }
    }
    /**
     * Set system mode
     */
    setMode(mode) {
        this.config.mode = mode;
        console.log(`[ANTI_IDLE_SYSTEM] Mode changed to ${mode}`);
    }
    /**
     * Optimize system for current environment
     */
    optimizeForEnvironment(environment) {
        // Apply environment-specific optimizations
        if (this.configManager) {
            this.configManager.optimizeForEnvironment(environment);
        }
        console.log(`[ANTI_IDLE_SYSTEM] Optimized for ${environment} environment`);
    }
}
//# sourceMappingURL=anti_idle_system.js.map