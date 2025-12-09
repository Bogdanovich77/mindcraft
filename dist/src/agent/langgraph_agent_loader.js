/**
 * LangGraph Agent Loader
 *
 * Handles loading and initialization of both legacy and new LangGraph agent types.
 * Provides backward compatibility while enabling the new cognitive architecture.
 */
import { Agent } from './agent.js';
import { LangGraphAgent } from '../dist/src/agent/langgraph/agent.js';
import { ProfileAdapter } from '../dist/src/agent/langgraph/profile_adapter.js';
import settings from '../../settings.js';
export class LangGraphAgentLoader {
    constructor() {
        this.profileAdapter = new ProfileAdapter({
            autoMigrate: true,
            backupOriginal: false,
            validateOnLoad: true,
            preserveLegacy: true
        });
    }
    /**
     * Load agent based on profile type
     */
    async loadAgent(profilePath, options = {}) {
        try {
            // Load and enhance profile
            const profile = await this.profileAdapter.loadProfile(profilePath);
            // Determine agent type based on profile
            const agentType = this.determineAgentType(profile);
            console.log(`Loading agent '${profile.name}' as ${agentType} type`);
            switch (agentType) {
                case 'langgraph_v2':
                    return await this.loadLangGraphAgent(profile, options);
                case 'legacy':
                default:
                    return await this.loadLegacyAgent(profile, options);
            }
        }
        catch (error) {
            console.error(`Failed to load agent from ${profilePath}:`, error);
            throw error;
        }
    }
    /**
     * Determine the appropriate agent type for a profile
     */
    determineAgentType(profile) {
        // Check if profile has been migrated to LangGraph v2
        if (profile.agentType === 'langgraph_v2' ||
            profile.profileVersion === '2.0.0' ||
            profile.purposeCore) {
            return 'langgraph_v2';
        }
        // Check compatibility mode setting
        if (profile.compatibilityMode === 'new_only') {
            return 'langgraph_v2';
        }
        // Default to legacy for backward compatibility
        return 'legacy';
    }
    /**
     * Load a new LangGraph agent
     */
    async loadLangGraphAgent(profile, options) {
        const agent = new LangGraphAgent();
        // Initialize with LangGraph-specific configuration
        await agent.start({
            profile: profile,
            ...options
        });
        return agent;
    }
    /**
     * Load a legacy agent
     */
    async loadLegacyAgent(profile, options) {
        const agent = new Agent();
        // Initialize with legacy configuration
        await agent.start(options.load_mem, options.init_message, options.count_id);
        return agent;
    }
    /**
     * Load multiple agents from settings
     */
    async loadAllAgents() {
        const agents = [];
        const profilePaths = settings.profiles || [];
        console.log(`Loading ${profilePaths.length} agents...`);
        for (let i = 0; i < profilePaths.length; i++) {
            const profilePath = profilePaths[i];
            try {
                const agent = await this.loadAgent(profilePath, {
                    count_id: i,
                    load_mem: settings.load_memory,
                    init_message: settings.init_message
                });
                agents.push(agent);
            }
            catch (error) {
                console.error(`Failed to load agent from ${profilePath}:`, error);
                // Continue loading other agents even if one fails
            }
        }
        console.log(`Successfully loaded ${agents.length} agents`);
        return agents;
    }
    /**
     * Migrate all profiles to new system
     */
    async migrateAllProfiles() {
        const profilePaths = settings.profiles || [];
        const migrationResults = {
            successful: [],
            failed: []
        };
        console.log(`Migrating ${profilePaths.length} profiles to LangGraph v2...`);
        for (const profilePath of profilePaths) {
            try {
                const migratedProfile = await this.profileAdapter.migrateProfile(profilePath);
                migrationResults.successful.push(profilePath);
                console.log(`✅ Migrated ${profilePath}`);
            }
            catch (error) {
                migrationResults.failed.push({ profile: profilePath, error: error.message });
                console.error(`❌ Failed to migrate ${profilePath}:`, error.message);
            }
        }
        console.log(`Migration complete: ${migrationResults.successful.length} successful, ${migrationResults.failed.length} failed`);
        return migrationResults;
    }
    /**
     * Get agent statistics
     */
    async getAgentStats() {
        const profilePaths = settings.profiles || [];
        const stats = {
            total: profilePaths.length,
            langgraph_v2: 0,
            legacy: 0,
            migrated: 0,
            errors: []
        };
        for (const profilePath of profilePaths) {
            try {
                const profile = await this.profileAdapter.loadProfile(profilePath);
                const agentType = this.determineAgentType(profile);
                stats[agentType]++;
                if (profile.migratedAt) {
                    stats.migrated++;
                }
            }
            catch (error) {
                stats.errors.push({ profile: profilePath, error: error.message });
            }
        }
        return stats;
    }
    /**
     * Create a hybrid agent that supports both systems
     */
    async createHybridAgent(profilePath, options = {}) {
        const profile = await this.profileAdapter.loadProfile(profilePath);
        // Set compatibility mode to hybrid
        this.profileAdapter.setCompatibilityMode(profile, 'hybrid');
        // Save the updated profile
        await this.profileAdapter.saveProfile(profilePath, profile);
        // Load as LangGraph agent with legacy support
        return await this.loadLangGraphAgent(profile, options);
    }
    /**
     * Validate all agent profiles
     */
    async validateAllProfiles() {
        const profilePaths = settings.profiles || [];
        const validationResults = {
            valid: [],
            invalid: []
        };
        for (const profilePath of profilePaths) {
            try {
                const profile = await this.profileAdapter.loadProfile(profilePath);
                // Basic validation
                if (!profile.name) {
                    validationResults.invalid.push({
                        profile: profilePath,
                        issue: 'Missing name field'
                    });
                    continue;
                }
                const agentType = this.determineAgentType(profile);
                if (agentType === 'langgraph_v2') {
                    // Validate LangGraph structure
                    if (!profile.purposeCore) {
                        validationResults.invalid.push({
                            profile: profilePath,
                            issue: 'Missing purposeCore for LangGraph agent'
                        });
                        continue;
                    }
                }
                validationResults.valid.push(profilePath);
            }
            catch (error) {
                validationResults.invalid.push({
                    profile: profilePath,
                    issue: error.message
                });
            }
        }
        return validationResults;
    }
}
/**
 * Factory function to create agent loader
 */
export function createAgentLoader() {
    return new LangGraphAgentLoader();
}
/**
 * Export default loader instance
 */
export default new LangGraphAgentLoader();
