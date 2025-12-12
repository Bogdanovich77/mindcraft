import type { MemorySystem } from './memory_system.js';
/**
 * Bridge for migrating from legacy MemoryBank to enhanced memory system
 */
export declare class MemoryBridge {
    private migrationLog;
    constructor();
    /**
     * Migrate legacy memory bank data to new memory system
     */
    migrateLegacyMemory(legacyMemoryBank: any, memorySystem: MemorySystem): Promise<void>;
    /**
     * Create legacy-compatible wrapper for new memory system
     */
    createLegacyWrapper(memorySystem: MemorySystem): LegacyMemoryBankWrapper;
    /**
     * Get migration statistics
     */
    getMigrationStatistics(): MigrationStatistics;
    /**
     * Export current memory state to legacy format
     */
    exportToLegacyFormat(memorySystem: MemorySystem): Promise<any>;
    /**
     * Private helper methods
     */
    private migrateLocation;
    private migrateExtendedLocationData;
    private createLocationConcepts;
}
/**
 * Legacy-compatible wrapper for the new memory system
 */
export declare class LegacyMemoryBankWrapper {
    private memorySystem;
    private cache;
    private cacheTimeout;
    constructor(memorySystem: MemorySystem);
    /**
     * Legacy remember function - stores location
     */
    remember(name: string, x: number, y: number, z: number): Promise<void>;
    /**
     * Legacy recall function - retrieves location
     */
    recall(name: string): Promise<{
        x: number;
        y: number;
        z: number;
    } | null>;
    /**
     * Legacy forget function - removes location
     */
    forget(name: string): Promise<boolean>;
    /**
     * Legacy list function - lists all remembered locations
     */
    list(): Promise<string[]>;
    /**
     * Clear cache
     */
    clearCache(): void;
}
export interface MigrationRecord {
    timestamp: number;
    duration: number;
    locationsMigrated: number;
    conceptsCreated: number;
    errors: number;
    success: boolean;
}
export interface MigrationStatistics {
    totalMigrations: number;
    successfulMigrations: number;
    failedMigrations: number;
    totalLocationsMigrated: number;
    totalConceptsCreated: number;
    totalErrors: number;
    lastMigration: number;
}
//# sourceMappingURL=memory_bridge.d.ts.map