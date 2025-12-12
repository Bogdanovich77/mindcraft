/**
 * Profile Adapter - Integrates existing profile system with new LangGraph architecture
 * Handles profile loading, saving, and compatibility with the new cognitive system
 */
import { AgentState } from './interfaces.js';
/**
 * Enhanced profile interface with LangGraph support
 */
interface EnhancedProfile {
    username: string;
    name?: string;
    role?: string;
    background?: string;
    npc?: any;
    memory_bank?: any;
    modes?: any;
    skin?: any;
    agentState?: AgentState;
    compatibilityMode?: 'legacy_only' | 'hybrid' | 'new_only';
    migrationVersion?: string;
    lastMigrated?: number;
    profileVersion: string;
    createdAt: number;
    lastUpdated: number;
}
/**
 * Profile adapter options
 */
interface ProfileAdapterOptions {
    autoMigrate: boolean;
    backupOriginal: boolean;
    validateOnLoad: boolean;
    validateOnSave: boolean;
    preserveLegacy: boolean;
}
/**
 * Profile adapter class
 */
export declare class ProfileAdapter {
    private migrationManager;
    private options;
    private profileCache;
    constructor(options?: Partial<ProfileAdapterOptions>);
    /**
     * Load and enhance a profile
     */
    loadProfile(profilePath: string): Promise<EnhancedProfile>;
    /**
     * Save an enhanced profile
     */
    saveProfile(profilePath: string, profile: EnhancedProfile): Promise<void>;
    /**
     * Migrate a profile to the new system
     */
    migrateProfile(profilePath: string): Promise<EnhancedProfile>;
    /**
     * Check if a profile needs migration
     */
    needsMigration(profile: EnhancedProfile): boolean;
    /**
     * Get profile compatibility mode
     */
    getCompatibilityMode(profile: EnhancedProfile): 'legacy_only' | 'hybrid' | 'new_only';
    /**
     * Set profile compatibility mode
     */
    setCompatibilityMode(profile: EnhancedProfile, mode: 'legacy_only' | 'hybrid' | 'new_only'): void;
    /**
     * Extract agent state from profile
     */
    extractAgentState(profile: EnhancedProfile): AgentState | null;
    /**
     * Update profile with agent state
     */
    updateAgentState(profile: EnhancedProfile, agentState: AgentState): void;
    /**
     * Get profile statistics
     */
    getProfileStats(profile: EnhancedProfile): ProfileStats;
    /**
     * Clear profile cache
     */
    clearCache(): void;
    /**
     * Get cached profiles
     */
    getCachedProfiles(): string[];
    /**
     * Load legacy profile (integrates with existing system)
     */
    private loadLegacyProfile;
    /**
     * Enhance a legacy profile
     */
    private enhanceProfile;
    /**
     * Save enhanced profile
     */
    private saveEnhancedProfile;
    /**
     * Create profile backup
     */
    private createBackup;
    /**
     * Validate profile
     */
    private validateProfile;
    /**
     * Sync legacy data with agent state
     */
    private syncLegacyData;
}
/**
 * Profile statistics interface
 */
interface ProfileStats {
    profileVersion: string;
    compatibilityMode: string;
    hasAgentState: boolean;
    hasLegacyNPC: boolean;
    hasMemoryBank: boolean;
    goalCount: number;
    memoryLocationCount: number;
    lastMigrated?: number;
    age: number;
}
/**
 * Profile adapter factory
 */
export declare class ProfileAdapterFactory {
    /**
     * Create profile adapter with default options
     */
    static create(): ProfileAdapter;
    /**
     * Create profile adapter for development
     */
    static createForDevelopment(): ProfileAdapter;
    /**
     * Create profile adapter for production
     */
    static createForProduction(): ProfileAdapter;
}
/**
 * Profile utilities
 */
export declare class ProfileUtils {
    /**
     * Generate profile report
     */
    static generateReport(profile: EnhancedProfile): string;
    /**
     * Check if profile is healthy
     */
    static isHealthy(profile: EnhancedProfile): boolean;
    /**
     * Get recommendations for profile optimization
     */
    static getRecommendations(profile: EnhancedProfile): string[];
}
export {};
//# sourceMappingURL=profile_adapter.d.ts.map