/**
 * Migration Manager - Handles data conversion between legacy and new systems
 * Provides utilities for safe migration, validation, and rollback capabilities
 */
import { LegacyNPCDataAdapter, LegacyMemoryAdapter } from './legacy_adapter.js';
/**
 * Migration Manager Class
 * Handles the complete migration process from legacy to new system
 */
export class MigrationManager {
    migrationHistory = [];
    rollbackStack = [];
    /**
     * Migrate a complete profile from legacy to new format
     */
    async migrateProfile(profileData, options = {}) {
        const result = {
            success: false,
            errors: [],
            warnings: []
        };
        try {
            console.log('Starting profile migration...');
            // Validate input data
            const validation = this.validateLegacyProfile(profileData);
            if (!validation.isValid) {
                result.errors.push(...validation.errors);
                return result;
            }
            // Store rollback data
            const rollbackData = this.createRollbackSnapshot(profileData);
            result.rollbackData = rollbackData;
            // Create legacy adapters
            const dataAdapter = new LegacyNPCDataAdapter(profileData);
            const memoryAdapter = new LegacyMemoryAdapter(profileData.memory_bank);
            // Convert to new format
            const agentState = this.convertToAgentState(dataAdapter, memoryAdapter, options);
            // Validate migrated data
            const migratedValidation = this.validateMigratedData(agentState);
            if (!migratedValidation.isValid) {
                result.errors.push(...migratedValidation.errors);
                return result;
            }
            result.warnings.push(...validation.warnings);
            result.warnings.push(...migratedValidation.warnings);
            result.migratedData = {
                agentState,
                legacyData: dataAdapter.getNPCData().toObject(),
                memoryData: memoryAdapter.getLegacyMemory()
            };
            result.success = true;
            // Record migration
            this.recordMigration({
                timestamp: Date.now(),
                sourceFormat: 'legacy',
                targetFormat: 'langgraph',
                profileId: profileData.username || 'unknown',
                success: true,
                warnings: result.warnings
            });
            console.log('Profile migration completed successfully');
            return result;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            result.errors.push(`Migration failed: ${errorMessage}`);
            console.error('Profile migration failed:', error);
            // Record failed migration
            this.recordMigration({
                timestamp: Date.now(),
                sourceFormat: 'legacy',
                targetFormat: 'langgraph',
                profileId: profileData.username || 'unknown',
                success: false,
                errors: [errorMessage]
            });
            return result;
        }
    }
    /**
     * Migrate NPC data specifically
     */
    async migrateNPCData(npcData) {
        const result = {
            success: false,
            errors: [],
            warnings: []
        };
        try {
            // Validate NPC data
            if (!npcData || typeof npcData !== 'object') {
                result.errors.push('Invalid NPC data: must be an object');
                return result;
            }
            // Create temporary profile for migration
            const tempProfile = {
                username: 'temp_migration',
                npc: npcData
            };
            const migrationResult = await this.migrateProfile(tempProfile);
            return migrationResult;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            result.errors.push(`NPC data migration failed: ${errorMessage}`);
            return result;
        }
    }
    /**
     * Migrate memory bank data
     */
    async migrateMemoryBank(memoryData) {
        const result = {
            success: false,
            errors: [],
            warnings: []
        };
        try {
            const memoryAdapter = new LegacyMemoryAdapter(memoryData);
            const semanticMemory = memoryAdapter.toSemanticMemory();
            result.migratedData = {
                semantic: semanticMemory,
                episodic: {
                    episodes: [],
                    currentIndex: 0,
                    compressionLevel: 0
                },
                procedural: {
                    procedures: {},
                    sequences: {},
                    habits: []
                },
                working: {
                    currentFocus: '',
                    activeTasks: [],
                    buffer: [],
                    capacity: 7,
                    decayRate: 0.1
                }
            };
            result.success = true;
            return result;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            result.errors.push(`Memory migration failed: ${errorMessage}`);
            return result;
        }
    }
    /**
     * Rollback a migration
     */
    async rollback(migrationId) {
        const result = {
            success: false,
            errors: [],
            warnings: []
        };
        try {
            const rollbackData = this.rollbackStack.find(r => r.migrationId === migrationId);
            if (!rollbackData) {
                result.errors.push(`No rollback data found for migration ${migrationId}`);
                return result;
            }
            // Validate rollback data
            const validation = this.validateLegacyProfile(rollbackData.data);
            if (!validation.isValid) {
                result.errors.push('Rollback data is corrupted');
                return result;
            }
            result.migratedData = rollbackData.data;
            result.success = true;
            // Remove from rollback stack
            this.rollbackStack = this.rollbackStack.filter(r => r.migrationId !== migrationId);
            console.log(`Successfully rolled back migration ${migrationId}`);
            return result;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            result.errors.push(`Rollback failed: ${errorMessage}`);
            return result;
        }
    }
    /**
     * Get migration history
     */
    getMigrationHistory() {
        return [...this.migrationHistory];
    }
    /**
     * Clear migration history
     */
    clearHistory() {
        this.migrationHistory = [];
        this.rollbackStack = [];
    }
    /**
     * Validate legacy profile data
     */
    validateLegacyProfile(profileData) {
        const result = {
            isValid: true,
            errors: [],
            warnings: []
        };
        if (!profileData) {
            result.isValid = false;
            result.errors.push('Profile data is null or undefined');
            return result;
        }
        // Check required fields
        if (!profileData.username && !profileData.name) {
            result.warnings.push('Profile missing username/name');
        }
        // Validate NPC data if present
        if (profileData.npc) {
            if (profileData.npc.goals && !Array.isArray(profileData.npc.goals)) {
                result.errors.push('NPC goals must be an array');
                result.isValid = false;
            }
            if (profileData.npc.curr_goal && typeof profileData.npc.curr_goal !== 'object') {
                result.errors.push('Current goal must be an object');
                result.isValid = false;
            }
        }
        return result;
    }
    /**
     * Validate migrated data
     */
    validateMigratedData(agentState) {
        const result = {
            isValid: true,
            errors: [],
            warnings: []
        };
        if (!agentState.cognitive) {
            result.errors.push('Missing cognitive state in migrated data');
            result.isValid = false;
        }
        if (!agentState.metadata) {
            result.errors.push('Missing metadata in migrated data');
            result.isValid = false;
        }
        // Validate cognitive components
        if (agentState.cognitive) {
            if (!agentState.cognitive.purpose) {
                result.errors.push('Missing purpose state in cognitive data');
                result.isValid = false;
            }
            if (!agentState.cognitive.goals) {
                result.errors.push('Missing goal state in cognitive data');
                result.isValid = false;
            }
        }
        return result;
    }
    /**
     * Convert legacy data to AgentState using adapters
     */
    convertToAgentState(dataAdapter, memoryAdapter, options) {
        const agentState = dataAdapter.toAgentState();
        // Merge memory data
        if (agentState.cognitive && agentState.cognitive.memory) {
            agentState.cognitive.memory.semantic = memoryAdapter.toSemanticMemory();
        }
        // Apply migration options
        if (options.preserveOriginalIds) {
            // Keep original goal IDs where possible
            this.preserveOriginalIds(agentState);
        }
        if (options.migrateSkills) {
            // Add skill migration logic here when skills are implemented
            console.warn('Skill migration not yet implemented');
        }
        return agentState;
    }
    /**
     * Create rollback snapshot
     */
    createRollbackSnapshot(profileData) {
        return JSON.parse(JSON.stringify(profileData));
    }
    /**
     * Preserve original IDs during migration
     */
    preserveOriginalIds(agentState) {
        if (agentState.cognitive && agentState.cognitive.goals) {
            // Update goal IDs to preserve legacy references
            agentState.cognitive.goals.operationalGoals.forEach((goal, index) => {
                if (goal.id.startsWith('legacy_goal_')) {
                    goal.id = `preserved_legacy_goal_${index}`;
                }
            });
        }
    }
    /**
     * Record migration in history
     */
    recordMigration(record) {
        this.migrationHistory.push(record);
        // Keep only last 100 migrations
        if (this.migrationHistory.length > 100) {
            this.migrationHistory = this.migrationHistory.slice(-100);
        }
    }
}
/**
 * Utility functions for migration
 */
export class MigrationUtils {
    /**
     * Check if a profile needs migration
     */
    static needsMigration(profileData) {
        return !profileData.agentState && profileData.npc;
    }
    /**
     * Estimate migration complexity
     */
    static estimateComplexity(profileData) {
        if (!profileData.npc)
            return 'simple';
        const goalCount = profileData.npc.goals?.length || 0;
        const memoryCount = Object.keys(profileData.memory_bank || {}).length;
        if (goalCount > 10 || memoryCount > 50)
            return 'complex';
        if (goalCount > 5 || memoryCount > 20)
            return 'moderate';
        return 'simple';
    }
    /**
     * Generate migration report
     */
    static generateReport(profileData) {
        const complexity = this.estimateComplexity(profileData);
        const needsMigration = this.needsMigration(profileData);
        let report = `Migration Report:\n`;
        report += `- Profile: ${profileData.username || 'unknown'}\n`;
        report += `- Needs Migration: ${needsMigration}\n`;
        report += `- Complexity: ${complexity}\n`;
        if (profileData.npc) {
            report += `- Goals: ${profileData.npc.goals?.length || 0}\n`;
            report += `- Current Goal: ${profileData.npc.curr_goal ? 'yes' : 'no'}\n`;
            report += `- Built Structures: ${Object.keys(profileData.npc.built || {}).length}\n`;
        }
        if (profileData.memory_bank) {
            report += `- Memory Locations: ${Object.keys(profileData.memory_bank).length}\n`;
        }
        return report;
    }
}
// Export singleton instance
export const migrationManager = new MigrationManager();
