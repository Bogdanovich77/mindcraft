/**
 * Profile Adapter - Integrates existing profile system with new LangGraph architecture
 * Handles profile loading, saving, and compatibility with the new cognitive system
 */
import { LegacyNPCDataAdapter } from './legacy_adapter.js';
import { MigrationManager } from './migration_manager.js';
/**
 * Profile adapter class
 */
export class ProfileAdapter {
    migrationManager;
    options;
    profileCache = new Map();
    constructor(options = {}) {
        this.options = {
            autoMigrate: true,
            backupOriginal: true,
            validateOnLoad: true,
            validateOnSave: true,
            preserveLegacy: true,
            ...options
        };
        this.migrationManager = new MigrationManager();
    }
    /**
     * Load and enhance a profile
     */
    async loadProfile(profilePath) {
        try {
            // Check cache first
            if (this.profileCache.has(profilePath)) {
                return this.profileCache.get(profilePath);
            }
            // Load the profile (this would integrate with existing profile loading)
            const legacyProfile = await this.loadLegacyProfile(profilePath);
            // Create enhanced profile
            const enhancedProfile = await this.enhanceProfile(legacyProfile);
            // Cache the result
            this.profileCache.set(profilePath, enhancedProfile);
            return enhancedProfile;
        }
        catch (error) {
            console.error(`Failed to load profile ${profilePath}:`, error);
            throw error;
        }
    }
    /**
     * Save an enhanced profile
     */
    async saveProfile(profilePath, profile) {
        try {
            // Update metadata
            profile.lastUpdated = Date.now();
            // Validate if enabled
            if (this.options.validateOnSave) {
                const validation = this.validateProfile(profile);
                if (!validation.isValid) {
                    throw new Error(`Profile validation failed: ${validation.errors.join(', ')}`);
                }
            }
            // Create backup if enabled
            if (this.options.backupOriginal) {
                await this.createBackup(profilePath, profile);
            }
            // Save the profile
            await this.saveEnhancedProfile(profilePath, profile);
            // Update cache
            this.profileCache.set(profilePath, profile);
        }
        catch (error) {
            console.error(`Failed to save profile ${profilePath}:`, error);
            throw error;
        }
    }
    /**
     * Migrate a profile to the new system
     */
    async migrateProfile(profilePath) {
        try {
            console.log(`Migrating profile ${profilePath}...`);
            // Load the legacy profile
            const legacyProfile = await this.loadLegacyProfile(profilePath);
            // Perform migration
            const migrationResult = await this.migrationManager.migrateProfile(legacyProfile);
            if (!migrationResult.success) {
                throw new Error(`Migration failed: ${migrationResult.errors.join(', ')}`);
            }
            // Create enhanced profile with migrated data
            const enhancedProfile = {
                ...legacyProfile,
                agentState: migrationResult.migratedData?.agentState,
                compatibilityMode: 'hybrid',
                migrationVersion: '1.0.0',
                lastMigrated: Date.now(),
                profileVersion: '2.0.0',
                createdAt: legacyProfile.createdAt || Date.now(),
                lastUpdated: Date.now()
            };
            // Preserve legacy data if enabled
            if (this.options.preserveLegacy) {
                enhancedProfile.npc = migrationResult.migratedData?.legacyData;
                enhancedProfile.memory_bank = migrationResult.migratedData?.memoryData;
            }
            // Save the migrated profile
            await this.saveProfile(profilePath, enhancedProfile);
            console.log(`Successfully migrated profile ${profilePath}`);
            return enhancedProfile;
        }
        catch (error) {
            console.error(`Profile migration failed for ${profilePath}:`, error);
            throw error;
        }
    }
    /**
     * Check if a profile needs migration
     */
    needsMigration(profile) {
        return !profile.agentState || !profile.migrationVersion;
    }
    /**
     * Get profile compatibility mode
     */
    getCompatibilityMode(profile) {
        return profile.compatibilityMode || 'legacy_only';
    }
    /**
     * Set profile compatibility mode
     */
    setCompatibilityMode(profile, mode) {
        profile.compatibilityMode = mode;
        profile.lastUpdated = Date.now();
    }
    /**
     * Extract agent state from profile
     */
    extractAgentState(profile) {
        if (!profile.agentState) {
            // Try to create from legacy data
            if (profile.npc) {
                const dataAdapter = new LegacyNPCDataAdapter(profile);
                const partialState = dataAdapter.toAgentState();
                profile.agentState = partialState;
            }
        }
        return profile.agentState || null;
    }
    /**
     * Update profile with agent state
     */
    updateAgentState(profile, agentState) {
        profile.agentState = agentState;
        profile.lastUpdated = Date.now();
        // Sync legacy data if in hybrid mode
        if (profile.compatibilityMode === 'hybrid' && this.options.preserveLegacy) {
            this.syncLegacyData(profile, agentState);
        }
    }
    /**
     * Get profile statistics
     */
    getProfileStats(profile) {
        const stats = {
            profileVersion: profile.profileVersion,
            compatibilityMode: profile.compatibilityMode || 'legacy_only',
            hasAgentState: !!profile.agentState,
            hasLegacyNPC: !!profile.npc,
            hasMemoryBank: !!profile.memory_bank,
            goalCount: profile.npc?.goals?.length || 0,
            memoryLocationCount: Object.keys(profile.memory_bank || {}).length,
            lastMigrated: profile.lastMigrated || 0,
            age: Date.now() - (profile.createdAt || Date.now())
        };
        return stats;
    }
    /**
     * Clear profile cache
     */
    clearCache() {
        this.profileCache.clear();
    }
    /**
     * Get cached profiles
     */
    getCachedProfiles() {
        return Array.from(this.profileCache.keys());
    }
    /**
     * Load legacy profile (integrates with existing system)
     */
    async loadLegacyProfile(profilePath) {
        // This would integrate with the existing profile loading system
        // For now, we'll assume it loads the JSON profile
        try {
            // In the actual implementation, this would use the existing profile loader
            const fs = await import('fs/promises');
            const data = await fs.readFile(profilePath, 'utf8');
            return JSON.parse(data);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            throw new Error(`Failed to load legacy profile: ${errorMessage}`);
        }
    }
    /**
     * Enhance a legacy profile
     */
    async enhanceProfile(legacyProfile) {
        const enhancedProfile = {
            ...legacyProfile,
            profileVersion: '1.0.0',
            createdAt: legacyProfile.createdAt || Date.now(),
            lastUpdated: Date.now()
        };
        // Auto-migrate if enabled and needed
        if (this.options.autoMigrate && this.needsMigration(enhancedProfile)) {
            try {
                const migrationResult = await this.migrationManager.migrateProfile(legacyProfile);
                if (migrationResult.success) {
                    enhancedProfile.agentState = migrationResult.migratedData?.agentState;
                    enhancedProfile.compatibilityMode = 'hybrid';
                    enhancedProfile.migrationVersion = '1.0.0';
                    enhancedProfile.lastMigrated = Date.now();
                    enhancedProfile.profileVersion = '2.0.0';
                }
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                console.warn('Auto-migration failed, keeping legacy profile:', errorMessage);
            }
        }
        return enhancedProfile;
    }
    /**
     * Save enhanced profile
     */
    async saveEnhancedProfile(profilePath, profile) {
        try {
            const fs = await import('fs/promises');
            const data = JSON.stringify(profile, null, 2);
            await fs.writeFile(profilePath, data, 'utf8');
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            throw new Error(`Failed to save enhanced profile: ${errorMessage}`);
        }
    }
    /**
     * Create profile backup
     */
    async createBackup(profilePath, profile) {
        try {
            const fs = await import('fs/promises');
            const backupPath = `${profilePath}.backup.${Date.now()}`;
            const data = JSON.stringify(profile, null, 2);
            await fs.writeFile(backupPath, data, 'utf8');
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.warn('Failed to create profile backup:', errorMessage);
        }
    }
    /**
     * Validate profile
     */
    validateProfile(profile) {
        const validation = {
            isValid: true,
            errors: [],
            warnings: []
        };
        // Check required fields
        if (!profile.username) {
            validation.errors.push('Profile missing username');
            validation.isValid = false;
        }
        // Check version compatibility
        if (!profile.profileVersion) {
            validation.warnings.push('Profile missing version information');
        }
        // Check agent state if in new or hybrid mode
        if (profile.compatibilityMode === 'new_only' || profile.compatibilityMode === 'hybrid') {
            if (!profile.agentState) {
                validation.errors.push('Agent state required for new/hybrid mode');
                validation.isValid = false;
            }
        }
        return validation;
    }
    /**
     * Sync legacy data with agent state
     */
    syncLegacyData(profile, agentState) {
        try {
            // Update NPC data from agent state
            if (profile.npc && agentState.cognitive) {
                const dataAdapter = new LegacyNPCDataAdapter(profile);
                dataAdapter.updateFromAgentState(agentState);
                profile.npc = dataAdapter.getNPCData().toObject();
            }
            // Update memory bank if needed
            if (profile.memory_bank && agentState.cognitive?.memory?.semantic) {
                // Memory sync logic would go here
            }
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.warn('Failed to sync legacy data:', errorMessage);
        }
    }
}
/**
 * Profile adapter factory
 */
export class ProfileAdapterFactory {
    /**
     * Create profile adapter with default options
     */
    static create() {
        return new ProfileAdapter();
    }
    /**
     * Create profile adapter for development
     */
    static createForDevelopment() {
        return new ProfileAdapter({
            autoMigrate: true,
            backupOriginal: true,
            validateOnLoad: true,
            preserveLegacy: true
        });
    }
    /**
     * Create profile adapter for production
     */
    static createForProduction() {
        return new ProfileAdapter({
            autoMigrate: false,
            backupOriginal: true,
            validateOnLoad: true,
            preserveLegacy: true
        });
    }
}
/**
 * Profile utilities
 */
export class ProfileUtils {
    /**
     * Generate profile report
     */
    static generateReport(profile) {
        const adapter = ProfileAdapterFactory.create();
        const stats = adapter.getProfileStats(profile);
        let report = `Profile Report:\n`;
        report += `- Username: ${profile.username}\n`;
        report += `- Version: ${stats.profileVersion}\n`;
        report += `- Compatibility Mode: ${stats.compatibilityMode}\n`;
        report += `- Agent State: ${stats.hasAgentState ? 'Present' : 'Missing'}\n`;
        report += `- Legacy NPC: ${stats.hasLegacyNPC ? 'Present' : 'Missing'}\n`;
        report += `- Memory Bank: ${stats.hasMemoryBank ? 'Present' : 'Missing'}\n`;
        report += `- Goals: ${stats.goalCount}\n`;
        report += `- Memory Locations: ${stats.memoryLocationCount}\n`;
        report += `- Last Migrated: ${stats.lastMigrated ? new Date(stats.lastMigrated).toISOString() : 'Never'}\n`;
        report += `- Age: ${Math.round(stats.age / 1000 / 60)} minutes\n`;
        return report;
    }
    /**
     * Check if profile is healthy
     */
    static isHealthy(profile) {
        const adapter = ProfileAdapterFactory.create();
        const stats = adapter.getProfileStats(profile);
        // Basic health checks
        if (!profile.username)
            return false;
        if (stats.compatibilityMode === 'new_only' && !stats.hasAgentState)
            return false;
        if (stats.age > 24 * 60 * 60 * 1000 && !stats.lastMigrated)
            return false; // Old profile not migrated
        return true;
    }
    /**
     * Get recommendations for profile optimization
     */
    static getRecommendations(profile) {
        const recommendations = [];
        const adapter = ProfileAdapterFactory.create();
        const stats = adapter.getProfileStats(profile);
        if (!stats.hasAgentState) {
            recommendations.push('Consider migrating to new LangGraph system for enhanced capabilities');
        }
        if (stats.compatibilityMode === 'legacy_only') {
            recommendations.push('Switch to hybrid mode to gradually transition to new system');
        }
        if (stats.goalCount > 20) {
            recommendations.push('Large number of goals detected, consider goal consolidation');
        }
        if (stats.memoryLocationCount > 100) {
            recommendations.push('Many memory locations, consider memory cleanup or organization');
        }
        if (!stats.lastMigrated && stats.age > 7 * 24 * 60 * 60 * 1000) {
            recommendations.push('Profile is over a week old, consider migration to latest version');
        }
        return recommendations;
    }
}
//# sourceMappingURL=profile_adapter.js.map