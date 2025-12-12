/**
 * Migration Manager - Handles data conversion between legacy and new systems
 * Provides utilities for safe migration, validation, and rollback capabilities
 */
/**
 * Migration result interface
 */
interface MigrationResult {
    success: boolean;
    errors: string[];
    warnings: string[];
    migratedData?: any;
    rollbackData?: any;
}
/**
 * Migration Manager Class
 * Handles the complete migration process from legacy to new system
 */
export declare class MigrationManager {
    private migrationHistory;
    private rollbackStack;
    /**
     * Migrate a complete profile from legacy to new format
     */
    migrateProfile(profileData: any, options?: MigrationOptions): Promise<MigrationResult>;
    /**
     * Migrate NPC data specifically
     */
    migrateNPCData(npcData: any): Promise<MigrationResult>;
    /**
     * Migrate memory bank data
     */
    migrateMemoryBank(memoryData: any): Promise<MigrationResult>;
    /**
     * Rollback a migration
     */
    rollback(migrationId: string): Promise<MigrationResult>;
    /**
     * Get migration history
     */
    getMigrationHistory(): MigrationRecord[];
    /**
     * Clear migration history
     */
    clearHistory(): void;
    /**
     * Validate legacy profile data
     */
    private validateLegacyProfile;
    /**
     * Validate migrated data
     */
    private validateMigratedData;
    /**
     * Convert legacy data to AgentState using adapters
     */
    private convertToAgentState;
    /**
     * Create rollback snapshot
     */
    private createRollbackSnapshot;
    /**
     * Preserve original IDs during migration
     */
    private preserveOriginalIds;
    /**
     * Record migration in history
     */
    private recordMigration;
}
/**
 * Migration options interface
 */
interface MigrationOptions {
    preserveOriginalIds?: boolean;
    migrateSkills?: boolean;
    validateOnly?: boolean;
    createBackup?: boolean;
}
/**
 * Migration record interface
 */
interface MigrationRecord {
    timestamp: number;
    sourceFormat: string;
    targetFormat: string;
    profileId: string;
    success: boolean;
    errors?: string[];
    warnings?: string[];
}
/**
 * Utility functions for migration
 */
export declare class MigrationUtils {
    /**
     * Check if a profile needs migration
     */
    static needsMigration(profileData: any): boolean;
    /**
     * Estimate migration complexity
     */
    static estimateComplexity(profileData: any): 'simple' | 'moderate' | 'complex';
    /**
     * Generate migration report
     */
    static generateReport(profileData: any): string;
}
export declare const migrationManager: MigrationManager;
export {};
//# sourceMappingURL=migration_manager.d.ts.map