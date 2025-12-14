/**
 * Simplified LangGraph Agent Loader
 *
 * Handles loading and initialization of simplified LangGraph agents.
 * All complex cognitive components have been removed for maintainability.
 */

import { Agent } from './agent.js';
import { LangGraphAgent } from './langgraph/agent.js';
import settings from '../../settings.js';
import { readFileSync } from 'fs';

export class LangGraphAgentLoader {
    constructor() {
        console.log('[DEBUG] Simplified LangGraphAgentLoader constructor');
    }

    /**
     * Load agent based on profile type
     */
    async loadAgent(profilePath, options = {}) {
        console.log(`[DEBUG] Loading agent from profile: ${profilePath}`);
        try {
            // Load profile directly from file
            console.log('[DEBUG] Step 1: Loading profile...');
            const profile = this.loadProfileFromFile(profilePath);
            console.log(`[DEBUG] Profile loaded: ${profile.name}, agentType: ${profile.agentType}`);
            
            // All agents now use simplified LangGraph architecture
            console.log('[DEBUG] Step 2: Loading simplified LangGraph agent...');
            return await this.loadLangGraphAgent(profile, options);
            
        } catch (error) {
            console.error(`[DEBUG] Failed to load agent from ${profilePath}:`, error);
            throw error;
        }
    }

    /**
     * Load profile directly from file (simplified approach)
     */
    loadProfileFromFile(profilePath) {
        try {
            const profileData = readFileSync(profilePath, 'utf8');
            const profile = JSON.parse(profileData);
            
            // Ensure profile has required simplified fields
            if (!profile.name) {
                throw new Error('Profile missing required name field');
            }
            
            // Set simplified agent type if not specified
            if (!profile.agentType) {
                profile.agentType = 'langgraph_simplified';
            }
            
            return profile;
        } catch (error) {
            console.error(`Failed to load profile from ${profilePath}:`, error);
            throw error;
        }
    }

    /**
     * Load a simplified LangGraph agent
     */
    async loadLangGraphAgent(profile, options) {
        console.log('[DEBUG] loadLangGraphAgent called');
        try {
            console.log('[DEBUG] Creating new LangGraphAgent instance...');
            const agent = new LangGraphAgent();
            console.log('[DEBUG] LangGraphAgent instance created');
            
            // Initialize with simplified configuration
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
     * Get simplified agent statistics
     */
    async getAgentStats() {
        const profilePaths = settings.profiles || [];
        const stats = {
            total: profilePaths.length,
            langgraph_simplified: 0,
            errors: []
        };
        
        for (const profilePath of profilePaths) {
            try {
                const profile = this.loadProfileFromFile(profilePath);
                stats.langgraph_simplified++;
                
            } catch (error) {
                stats.errors.push({ profile: profilePath, error: error.message });
            }
        }
        
        return stats;
    }

    /**
     * Validate all agent profiles (simplified)
     */
    async validateAllProfiles() {
        const profilePaths = settings.profiles || [];
        const validationResults = {
            valid: [],
            invalid: []
        };
        
        for (const profilePath of profilePaths) {
            try {
                const profile = this.loadProfileFromFile(profilePath);
                
                // Basic validation
                if (!profile.name) {
                    validationResults.invalid.push({
                        profile: profilePath,
                        issue: 'Missing name field'
                    });
                    continue;
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