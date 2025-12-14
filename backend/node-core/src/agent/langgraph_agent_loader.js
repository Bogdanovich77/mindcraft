/**
 * LangGraph Agent Loader
 *
 * Handles loading and initialization of both legacy and new LangGraph agent types.
 * Provides backward compatibility while enabling the new cognitive architecture.
 */

import { Agent } from './agent.js';
import { LangGraphAgent } from './langgraph/agent.js';
import { ProfileAdapter } from './langgraph/profile_adapter.js';
import settings from '../settings.js';

export class LangGraphAgentLoader {
    constructor() {
        console.log('[DEBUG] LangGraphAgentLoader constructor - initializing profile adapter...');
        try {
            this.profileAdapter = new ProfileAdapter({
                autoMigrate: true,
                backupOriginal: false,
                validateOnLoad: true,
                preserveLegacy: true
            });
            console.log('[DEBUG] ProfileAdapter initialized successfully');
        } catch (error) {
            console.error('[DEBUG] Failed to initialize ProfileAdapter:', error);
            throw error;
        }
    }

    /**
     * Load agent based on profile type
     */
    async loadAgent(profilePath, options = {}) {
        console.log(`[DEBUG] Loading agent from profile: ${profilePath}`);
        try {
            // Load and enhance profile
            console.log('[DEBUG] Step 1: Loading profile...');
            const profile = await this.profileAdapter.loadProfile(profilePath);
            console.log(`[DEBUG] Profile loaded: ${profile.name}, agentType: ${profile.agentType}, compatibilityMode: ${profile.compatibilityMode}`);
            
            // Determine agent type based on profile
            console.log('[DEBUG] Step 2: Determining agent type...');
            const agentType = this.determineAgentType(profile);
            console.log(`[DEBUG] Determined agent type: ${agentType}`);
            
            console.log(`Loading agent '${profile.name}' as ${agentType} type`);
            
            switch (agentType) {
                case 'langgraph_v2':
                    console.log('[DEBUG] Step 3: Loading LangGraph agent...');
                    return await this.loadLangGraphAgent(profile, options);
                    
                case 'legacy':
                default:
                    console.log('[DEBUG] Step 3: Loading legacy agent...');
                    return await this.loadLegacyAgent(profile, options);
            }
            
        } catch (error) {
            console.error(`[DEBUG] Failed to load agent from ${profilePath}:`, error);
            throw error;
        }
    }

    /**
     * Determine the appropriate agent type for a profile
     */
    determineAgentType(profile) {
        console.log(`[DEBUG] determineAgentType called with profile:`, {
            name: profile.name,
            agentType: profile.agentType,
            profileVersion: profile.profileVersion,
            compatibilityMode: profile.compatibilityMode,
            hasPurposeCore: !!profile.purposeCore
        });

        // Check if profile has been migrated to LangGraph v2
        if (profile.agentType === 'langgraph_v2' || 
            profile.profileVersion === '2.0.0' ||
            profile.purposeCore) {
            console.log('[DEBUG] determineAgentType returning: langgraph_v2 (condition 1)');
            return 'langgraph_v2';
        }
        
        // Check compatibility mode setting
        if (profile.compatibilityMode === 'new_only') {
            console.log('[DEBUG] determineAgentType returning: langgraph_v2 (condition 2)');
            return 'langgraph_v2';
        }
        
        // Default to legacy for backward compatibility
        console.log('[DEBUG] determineAgentType returning: legacy (default)');
        return 'legacy';
    }

    /**
     * Load a new LangGraph agent
     */
    async loadLangGraphAgent(profile, options) {
        console.log('[DEBUG] loadLangGraphAgent called');
        try {
            console.log('[DEBUG] Creating new LangGraphAgent instance...');
            const agent = new LangGraphAgent();
            console.log('[DEBUG] LangGraphAgent instance created');
            
            // Initialize with LangGraph-specific configuration
            console.log('[DEBUG] Initializing LangGraphAgent with profile...');
            await agent.start({
                profile: profile,
                ...options
            });
            console.log('[DEBUG] LangGraphAgent initialized successfully');
            
            return agent;
        } catch (error) {
            console.error('[DEBUG] Failed to load LangGraph agent:', error);
            throw error;
        }
    }

    /**
     * Load a legacy agent
     */
    async loadLegacyAgent(profile, options) {
        console.log('[DEBUG] loadLegacyAgent called');
        try {
            console.log('[DEBUG] Creating new Agent instance...');
            const agent = new Agent();
            console.log('[DEBUG] Agent instance created');
            
            // Initialize with legacy configuration
            console.log('[DEBUG] Initializing Agent with legacy options...');
            await agent.start(options.load_mem, options.init_message, options.count_id);
            console.log('[DEBUG] Agent initialized successfully');
            
            return agent;
        } catch (error) {
            console.error('[DEBUG] Failed to load legacy agent:', error);
            throw error;
        }
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
                
            } catch (error) {
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
                
            } catch (error) {
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
                
            } catch (error) {
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
                
            } catch (error) {
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