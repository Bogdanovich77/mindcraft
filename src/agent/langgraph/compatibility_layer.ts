/**
 * Compatibility Layer - Runtime integration for legacy and new systems
 * Manages dual-system operation, state synchronization, and seamless switching
 */

import { AgentState, AgentAction, InterruptPriority } from './interfaces.js';
import { LegacyNPCDataAdapter, LegacyControllerAdapter, LegacyMemoryAdapter } from './legacy_adapter.js';
import { MigrationManager, MigrationUtils } from './migration_manager.js';
import { Agent } from '../agent.js';

/**
 * Compatibility mode options
 */
interface CompatibilityOptions {
    mode: 'legacy_only' | 'hybrid' | 'new_only';
    enableStateSync: boolean;
    enableGoalBridge: boolean;
    enableMemoryBridge: boolean;
    autoMigration: boolean;
    fallbackOnError: boolean;
}

/**
 * Runtime compatibility layer
 */
export class CompatibilityLayer {
    private agent: Agent;
    private options: CompatibilityOptions;
    private migrationManager: MigrationManager;
    
    // Legacy system components
    private dataAdapter!: LegacyNPCDataAdapter;
    private controllerAdapter!: LegacyControllerAdapter;
    private memoryAdapter!: LegacyMemoryAdapter;
    
    // State management
    private lastSyncTime: number = 0;
    private syncInterval: number = 1000; // 1 second
    private isInitialized: boolean = false;
    private errorCount: number = 0;
    private maxErrors: number = 5;

    constructor(agent: Agent, options: Partial<CompatibilityOptions> = {}) {
        this.agent = agent;
        this.options = {
            mode: 'hybrid',
            enableStateSync: true,
            enableGoalBridge: true,
            enableMemoryBridge: true,
            autoMigration: false,
            fallbackOnError: true,
            ...options
        };
        
        this.migrationManager = new MigrationManager();
        
        // Initialize legacy adapters
        this.initializeLegacyAdapters();
    }

    /**
     * Initialize the compatibility layer
     */
    async initialize(): Promise<boolean> {
        try {
            console.log('Initializing compatibility layer...');
            
            // Check if migration is needed
            if (this.options.autoMigration && this.agent.prompter?.profile &&
                MigrationUtils.needsMigration(this.agent.prompter.profile)) {
                const migrationResult = await this.migrationManager.migrateProfile(this.agent.prompter.profile);
                if (!migrationResult.success) {
                    console.error('Auto-migration failed, falling back to legacy mode');
                    this.options.mode = 'legacy_only';
                }
            }

            // Initialize controller adapter
            await this.controllerAdapter.initialize();
            
            this.isInitialized = true;
            console.log(`Compatibility layer initialized in ${this.options.mode} mode`);
            return true;

        } catch (error) {
            console.error('Failed to initialize compatibility layer:', error);
            if (this.options.fallbackOnError) {
                this.options.mode = 'legacy_only';
                console.log('Fallback to legacy mode enabled');
                return true;
            }
            return false;
        }
    }

    /**
     * Update cycle - called from agent update loop
     */
    async update(deltaTime: number): Promise<void> {
        if (!this.isInitialized) return;

        try {
            // Update based on compatibility mode
            switch (this.options.mode) {
                case 'legacy_only':
                    await this.updateLegacyOnly(deltaTime);
                    break;
                case 'hybrid':
                    await this.updateHybrid(deltaTime);
                    break;
                case 'new_only':
                    await this.updateNewOnly(deltaTime);
                    break;
            }

            // Reset error count on successful update
            this.errorCount = 0;

        } catch (error) {
            this.errorCount++;
            console.error(`Compatibility layer update failed (${this.errorCount}/${this.maxErrors}):`, error);
            
            // Fallback to legacy mode if too many errors
            if (this.errorCount >= this.maxErrors && this.options.fallbackOnError) {
                console.log('Too many errors, falling back to legacy mode');
                this.options.mode = 'legacy_only';
                this.errorCount = 0;
            }
        }
    }

    /**
     * Execute an action through the appropriate system
     */
    async executeAction(action: AgentAction): Promise<boolean> {
        try {
            switch (this.options.mode) {
                case 'legacy_only':
                    return await this.executeLegacyAction(action);
                case 'hybrid':
                    return await this.executeHybridAction(action);
                case 'new_only':
                    return await this.executeNewAction(action);
                default:
                    return false;
            }

        } catch (error) {
            console.error('Action execution failed:', error);
            return false;
        }
    }

    /**
     * Get current compatibility mode
     */
    getMode(): string {
        return this.options.mode;
    }

    /**
     * Set compatibility mode
     */
    setMode(mode: 'legacy_only' | 'hybrid' | 'new_only'): void {
        console.log(`Switching compatibility mode from ${this.options.mode} to ${mode}`);
        this.options.mode = mode;
    }

    /**
     * Check if the system is in hybrid mode
     */
    isHybridMode(): boolean {
        return this.options.mode === 'hybrid';
    }

    /**
     * Get system status
     */
    getStatus(): CompatibilityStatus {
        const profile = this.agent.prompter?.profile;
        return {
            mode: this.options.mode,
            initialized: this.isInitialized,
            errorCount: this.errorCount,
            lastSyncTime: this.lastSyncTime,
            needsMigration: profile ? MigrationUtils.needsMigration(profile) : false,
            complexity: profile ? MigrationUtils.estimateComplexity(profile) : 'simple'
        };
    }

    /**
     * Force synchronization between systems
     */
    async forceSync(): Promise<boolean> {
        try {
            if (this.options.enableStateSync) {
                await this.syncState();
                this.lastSyncTime = Date.now();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Force sync failed:', error);
            return false;
        }
    }

    /**
     * Migrate to new system
     */
    async migrateToNewSystem(): Promise<boolean> {
        try {
            if (!this.agent.prompter?.profile) {
                console.error('No profile available for migration');
                return false;
            }
            
            const migrationResult = await this.migrationManager.migrateProfile(this.agent.prompter.profile);
            if (migrationResult.success) {
                this.options.mode = 'new_only';
                console.log('Successfully migrated to new system');
                return true;
            } else {
                console.error('Migration failed:', migrationResult.errors);
                return false;
            }
        } catch (error) {
            console.error('Migration to new system failed:', error);
            return false;
        }
    }

    /**
     * Initialize legacy adapters
     */
    private initializeLegacyAdapters(): void {
        if (!this.agent.prompter?.profile) {
            throw new Error('Agent profile is required for compatibility layer initialization');
        }
        
        this.dataAdapter = new LegacyNPCDataAdapter(this.agent.prompter.profile);
        this.controllerAdapter = new LegacyControllerAdapter(this.agent, this.dataAdapter);
        this.memoryAdapter = new LegacyMemoryAdapter(this.agent.prompter.profile.memory_bank);
    }

    /**
     * Update in legacy-only mode
     */
    private async updateLegacyOnly(deltaTime: number): Promise<void> {
        // Legacy system handles everything
        await this.controllerAdapter.executeNext();
    }

    /**
     * Update in hybrid mode
     */
    private async updateHybrid(deltaTime: number): Promise<void> {
        // Synchronize state if needed
        if (this.options.enableStateSync && 
            Date.now() - this.lastSyncTime > this.syncInterval) {
            await this.syncState();
            this.lastSyncTime = Date.now();
        }

        // Let new system handle cognitive processing
        // Legacy system handles reactive behaviors (already integrated)
        
        // Execute goals through legacy system for now
        if (this.agent.isIdle()) {
            await this.controllerAdapter.executeNext();
        }
    }

    /**
     * Update in new-only mode
     */
    private async updateNewOnly(deltaTime: number): Promise<void> {
        // New system handles everything
        // This will be implemented when the full LangGraph system is ready
        console.log('New-only mode not yet fully implemented');
    }

    /**
     * Execute action through legacy system
     */
    private async executeLegacyAction(action: AgentAction): Promise<boolean> {
        // Map action to legacy system calls
        switch (action.type) {
            case 'set_goal':
                const goalData = action.parameters;
                await this.controllerAdapter.setGoal(goalData.name, goalData.quantity);
                return true;
            case 'execute_goal':
                await this.controllerAdapter.executeNext();
                return true;
            default:
                console.warn(`Unknown action type in legacy mode: ${action.type}`);
                return false;
        }
    }

    /**
     * Execute action in hybrid mode
     */
    private async executeHybridAction(action: AgentAction): Promise<boolean> {
        // Route action based on type and cognitive flag
        if (action.cognitive) {
            // Send to new system (when implemented)
            return await this.executeNewAction(action);
        } else {
            // Send to legacy system
            return await this.executeLegacyAction(action);
        }
    }

    /**
     * Execute action through new system
     */
    private async executeNewAction(action: AgentAction): Promise<boolean> {
        // This will be implemented when the full LangGraph system is ready
        console.log(`New system action execution not yet implemented: ${action.type}`);
        return false;
    }

    /**
     * Synchronize state between legacy and new systems
     */
    private async syncState(): Promise<void> {
        try {
            if (!this.options.enableStateSync) return;

            // Sync from legacy to new
            this.controllerAdapter.syncState();
            
            // Sync memory if enabled
            if (this.options.enableMemoryBridge) {
                // Memory sync logic will be implemented when memory systems are integrated
            }

            // Sync goals if enabled
            if (this.options.enableGoalBridge) {
                // Goal sync logic will be implemented when goal bridge is created
            }

        } catch (error) {
            console.error('State synchronization failed:', error);
        }
    }
}

/**
 * Compatibility status interface
 */
interface CompatibilityStatus {
    mode: string;
    initialized: boolean;
    errorCount: number;
    lastSyncTime: number;
    needsMigration: boolean;
    complexity: 'simple' | 'moderate' | 'complex';
}

/**
 * Compatibility layer factory
 */
export class CompatibilityLayerFactory {
    /**
     * Create compatibility layer with automatic mode detection
     */
    static create(agent: Agent, options: Partial<CompatibilityOptions> = {}): CompatibilityLayer {
        const profile = agent.prompter?.profile;
        
        // Auto-detect mode if not specified
        if (!options.mode) {
            if (profile && MigrationUtils.needsMigration(profile)) {
                options.mode = 'legacy_only';
            } else {
                options.mode = 'hybrid';
            }
        }

        // Auto-adjust options based on profile complexity
        if (profile) {
            const complexity = MigrationUtils.estimateComplexity(profile);
            if (complexity === 'complex' && options.mode === 'hybrid') {
                console.log('Complex profile detected, enabling conservative sync settings');
                options.enableStateSync = options.enableStateSync !== false;
                options.fallbackOnError = true;
            }
        }

        return new CompatibilityLayer(agent, options);
    }

    /**
     * Create for development/testing
     */
    static createForDevelopment(agent: Agent): CompatibilityLayer {
        return new CompatibilityLayer(agent, {
            mode: 'hybrid',
            enableStateSync: true,
            enableGoalBridge: true,
            enableMemoryBridge: true,
            autoMigration: true,
            fallbackOnError: true
        });
    }

    /**
     * Create for production
     */
    static createForProduction(agent: Agent): CompatibilityLayer {
        return new CompatibilityLayer(agent, {
            mode: 'legacy_only',
            enableStateSync: false,
            enableGoalBridge: false,
            enableMemoryBridge: false,
            autoMigration: false,
            fallbackOnError: true
        });
    }
}

/**
 * Compatibility monitoring utilities
 */
export class CompatibilityMonitor {
    /**
     * Generate compatibility report
     */
    static generateReport(layer: CompatibilityLayer): string {
        const status = layer.getStatus();
        
        let report = `Compatibility Layer Report:\n`;
        report += `- Mode: ${status.mode}\n`;
        report += `- Initialized: ${status.initialized}\n`;
        report += `- Error Count: ${status.errorCount}\n`;
        report += `- Last Sync: ${new Date(status.lastSyncTime).toISOString()}\n`;
        report += `- Needs Migration: ${status.needsMigration}\n`;
        report += `- Complexity: ${status.complexity}\n`;
        
        return report;
    }

    /**
     * Check if compatibility layer is healthy
     */
    static isHealthy(layer: CompatibilityLayer): boolean {
        const status = layer.getStatus();
        return status.initialized && status.errorCount < 3;
    }

    /**
     * Get recommendations for optimization
     */
    static getRecommendations(layer: CompatibilityLayer): string[] {
        const status = layer.getStatus();
        const recommendations: string[] = [];
        
        if (status.needsMigration && status.mode !== 'legacy_only') {
            recommendations.push('Consider migrating to new system for better performance');
        }
        
        if (status.errorCount > 0) {
            recommendations.push('Monitor error count, consider fallback to legacy mode');
        }
        
        if (status.complexity === 'complex' && status.mode === 'hybrid') {
            recommendations.push('Complex profile detected, consider conservative sync settings');
        }
        
        if (Date.now() - status.lastSyncTime > 10000) {
            recommendations.push('State sync appears to be delayed, check sync interval');
        }
        
        return recommendations;
    }
}