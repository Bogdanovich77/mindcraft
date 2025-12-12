/**
 * Profile System Integration
 *
 * Provides seamless integration between the new Purpose Core system
 * and the existing legacy profile system for backward compatibility.
 */
import { PurposeCore } from './purpose_core.js';
export interface LegacyProfile {
    id?: string;
    name?: string;
    personality?: {
        curious?: boolean;
        organized?: boolean;
        social?: boolean;
        friendly?: boolean;
        anxious?: boolean;
    };
    behavior?: {
        brave?: boolean;
        creative?: boolean;
        patient?: boolean;
        competitive?: boolean;
        explorer?: boolean;
        cooperative?: boolean;
        honest?: boolean;
        empathetic?: boolean;
        compassionate?: boolean;
        principled?: boolean;
        survival_focused?: boolean;
        ambitious?: boolean;
        persistent?: boolean;
    };
    values?: Record<string, number>;
    ethics?: {
        framework?: string;
        principled?: boolean;
        compassionate?: boolean;
        empathetic?: boolean;
    };
    goals?: string[];
    skills?: Record<string, number>;
    preferences?: Record<string, any>;
}
export interface ProfileMigrationResult {
    success: boolean;
    purposeCore: PurposeCore | null;
    warnings: string[];
    errors: string[];
    migratedFields: string[];
    preservedFields: string[];
}
export declare class ProfileIntegration {
    private readonly FIELD_MAPPINGS;
    /**
     * Convert legacy profile to Purpose Core
     */
    static migrateProfile(legacyProfile: LegacyProfile): ProfileMigrationResult;
    /**
     * Perform the actual migration
     */
    private performMigration;
    /**
     * Validate legacy profile structure
     */
    private validateLegacyProfile;
    /**
     * Create Purpose Core from legacy profile data
     */
    private createPurposeCoreFromLegacy;
    /**
     * Extract personality data from legacy profile
     */
    private extractPersonalityData;
    /**
     * Extract motivation data from legacy profile
     */
    private extractMotivationData;
    /**
     * Extract value data from legacy profile
     */
    private extractValueData;
    /**
     * Extract ethics data from legacy profile
     */
    private extractEthicsData;
    /**
     * Track which fields were migrated
     */
    private trackMigration;
    /**
     * Convert Purpose Core back to legacy profile format
     */
    static convertToLegacyProfile(purposeCore: PurposeCore): LegacyProfile;
    /**
     * Create hybrid profile that combines both systems
     */
    static createHybridProfile(purposeCore: PurposeCore, legacyProfile: LegacyProfile): LegacyProfile;
    /**
     * Validate migration compatibility
     */
    static checkMigrationCompatibility(profile: LegacyProfile): {
        compatible: boolean;
        issues: string[];
        recommendations: string[];
    };
    /**
     * Get migration statistics
     */
    static getMigrationStats(profile: LegacyProfile): {
        totalFields: number;
        migratableFields: number;
        preservedFields: number;
        migrationCompleteness: number;
    };
}
//# sourceMappingURL=profile_integration.d.ts.map