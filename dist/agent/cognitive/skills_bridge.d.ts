/**
 * Skills Bridge
 *
 * Bridges the new dynamic skill progression system with the existing skills.js library.
 * Provides backward compatibility and seamless integration with legacy skill functions.
 */
import { SkillType, SkillCategory } from './skill_types.js';
import { SkillsSystem } from './skills_system.js';
import { LearningEngine } from './learning_engine.js';
import { SkillSynergySystem } from './skill_synergies.js';
import { SkillMilestoneSystem } from './skill_milestones.js';
import { ExperienceTracker } from './experience_tracker.js';
export interface SkillsBridgeConfig {
    enableLegacyCompatibility: boolean;
    enableBidirectionalSync: boolean;
    syncInterval: number;
    enableAutoMigration: boolean;
    migrateLegacyExperience: boolean;
    preserveLegacyData: boolean;
    enableCaching: boolean;
    cacheTimeout: number;
    batchSize: number;
    enableDebugLogging: boolean;
    logLevel: 'error' | 'warn' | 'info' | 'debug';
}
export interface LegacySkillData {
    name: string;
    level: number;
    experience: number;
    category: string;
    lastUsed: number;
    usageCount: number;
}
export interface SkillMapping {
    legacyName: string;
    newType: SkillType;
    category: SkillCategory;
    conversionFactor: number;
    additionalData: Record<string, any>;
}
export interface BridgeStatistics {
    legacySkillsImported: number;
    experienceConverted: number;
    syncOperations: number;
    errorsEncountered: number;
    lastSyncTime: number;
    averageSyncTime: number;
}
export declare class SkillsBridge {
    private config;
    private skillsSystem;
    private learningEngine;
    private synergySystem;
    private milestoneSystem;
    private experienceTracker;
    private legacySkillMappings;
    private legacyCache;
    private syncInProgress;
    private statistics;
    constructor(skillsSystem: SkillsSystem, learningEngine: LearningEngine, synergySystem: SkillSynergySystem, milestoneSystem: SkillMilestoneSystem, experienceTracker: ExperienceTracker, config?: Partial<SkillsBridgeConfig>);
    /**
     * Initialize bridge statistics
     */
    private initializeStatistics;
    /**
     * Initialize skill mappings between legacy and new systems
     */
    private initializeSkillMappings;
    /**
     * Add a skill mapping
     */
    private addSkillMapping;
    /**
     * Perform automatic migration from legacy system
     */
    private performAutoMigration;
    /**
     * Extract data from legacy skills system
     */
    private extractLegacySkillsData;
    /**
     * Migrate a single legacy skill
     */
    private migrateLegacySkill;
    /**
     * Start bidirectional sync cycle
     */
    private startSyncCycle;
    /**
     * Perform bidirectional synchronization
     */
    private performBidirectionalSync;
    /**
     * Sync data from new system to legacy
     */
    private syncToLegacy;
    /**
     * Sync data from legacy system to new system
     */
    private syncFromLegacy;
    /**
     * Find reverse mapping from new skill type to legacy name
     */
    private findReverseMapping;
    /**
     * Check if legacy data has changed
     */
    private hasLegacyDataChanged;
    /**
     * Update legacy skill data (placeholder implementation)
     */
    private updateLegacySkillData;
    /**
     * Execute legacy skill function through bridge
     */
    executeLegacySkill(skillName: string, ...args: any[]): any;
    /**
     * Track legacy skill execution in new system
     */
    private trackLegacyExecution;
    /**
     * Calculate experience for legacy execution
     */
    private calculateLegacyExperience;
    /**
     * Create experience context from legacy arguments
     */
    private createLegacyContext;
    /**
     * Assess quality of legacy execution
     */
    private assessLegacyExecutionQuality;
    /**
     * Assess difficulty of legacy execution
     */
    private assessLegacyExecutionDifficulty;
    /**
     * Assess success of legacy execution
     */
    private assessLegacyExecutionSuccess;
    /**
     * Get bridge statistics
     */
    getStatistics(): BridgeStatistics;
    /**
     * Get skill mappings
     */
    getSkillMappings(): Map<string, SkillMapping>;
    /**
     * Force manual sync
     */
    forceSync(): Promise<void>;
    /**
     * Clear legacy cache
     */
    clearLegacyCache(): void;
    /**
     * Reset bridge statistics
     */
    resetStatistics(): void;
    /**
     * Log message with configured level
     */
    private log;
    /**
     * Get migration status
     */
    getMigrationStatus(): {
        isComplete: boolean;
        totalLegacySkills: number;
        migratedSkills: number;
        pendingSkills: number;
        lastMigrationTime: number;
    };
    /**
     * Export bridge configuration
     */
    exportConfiguration(): {
        config: SkillsBridgeConfig;
        mappings: Array<{
            legacyName: string;
            mapping: SkillMapping;
        }>;
        statistics: BridgeStatistics;
    };
}
//# sourceMappingURL=skills_bridge.d.ts.map