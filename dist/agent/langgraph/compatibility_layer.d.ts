/**
 * Compatibility Layer - Runtime integration for legacy and new systems
 * Manages dual-system operation, state synchronization, and seamless switching
 */
import { AgentAction } from './interfaces.js';
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
export declare class CompatibilityLayer {
    private agent;
    private options;
    private migrationManager;
    private dataAdapter;
    private controllerAdapter;
    private memoryAdapter;
    private lastSyncTime;
    private syncInterval;
    private isInitialized;
    private errorCount;
    private maxErrors;
    constructor(agent: Agent, options?: Partial<CompatibilityOptions>);
    /**
     * Initialize the compatibility layer
     */
    initialize(): Promise<boolean>;
    /**
     * Update cycle - called from agent update loop
     */
    update(deltaTime: number): Promise<void>;
    /**
     * Execute an action through the appropriate system
     */
    executeAction(action: AgentAction): Promise<boolean>;
    /**
     * Get current compatibility mode
     */
    getMode(): string;
    /**
     * Set compatibility mode
     */
    setMode(mode: 'legacy_only' | 'hybrid' | 'new_only'): void;
    /**
     * Check if the system is in hybrid mode
     */
    isHybridMode(): boolean;
    /**
     * Get system status
     */
    getStatus(): CompatibilityStatus;
    /**
     * Force synchronization between systems
     */
    forceSync(): Promise<boolean>;
    /**
     * Migrate to new system
     */
    migrateToNewSystem(): Promise<boolean>;
    /**
     * Initialize legacy adapters
     */
    private initializeLegacyAdapters;
    /**
     * Update in legacy-only mode
     */
    private updateLegacyOnly;
    /**
     * Update in hybrid mode
     */
    private updateHybrid;
    /**
     * Update in new-only mode
     */
    private updateNewOnly;
    /**
     * Execute action through legacy system
     */
    private executeLegacyAction;
    /**
     * Execute action in hybrid mode
     */
    private executeHybridAction;
    /**
     * Execute action through new system
     */
    private executeNewAction;
    /**
     * Synchronize state between legacy and new systems
     */
    private syncState;
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
export declare class CompatibilityLayerFactory {
    /**
     * Create compatibility layer with automatic mode detection
     */
    static create(agent: Agent, options?: Partial<CompatibilityOptions>): CompatibilityLayer;
    /**
     * Create for development/testing
     */
    static createForDevelopment(agent: Agent): CompatibilityLayer;
    /**
     * Create for production
     */
    static createForProduction(agent: Agent): CompatibilityLayer;
}
/**
 * Compatibility monitoring utilities
 */
export declare class CompatibilityMonitor {
    /**
     * Generate compatibility report
     */
    static generateReport(layer: CompatibilityLayer): string;
    /**
     * Check if compatibility layer is healthy
     */
    static isHealthy(layer: CompatibilityLayer): boolean;
    /**
     * Get recommendations for optimization
     */
    static getRecommendations(layer: CompatibilityLayer): string[];
}
export {};
//# sourceMappingURL=compatibility_layer.d.ts.map