import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { validateProfile, sanitizeProfile, validateForMigration } from './profileValidation.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROFILES_DIR = path.join(__dirname, '../../profiles');

/**
 * Profile Manager - Handles CRUD operations for agent profiles
 * Supports the simplified profile format with 7 core fields
 */
class ProfileManager {
    constructor() {
        this.profilesDir = PROFILES_DIR;
        this.ensureProfilesDirectory();
    }

    /**
     * Ensure the profiles directory exists
     */
    async ensureProfilesDirectory() {
        try {
            await fs.access(this.profilesDir);
        } catch (error) {
            await fs.mkdir(this.profilesDir, { recursive: true });
        }
    }

    /**
     * Get all available profiles
     * @returns {Promise<Array>} Array of profile names and basic info
     */
    async getProfiles() {
        try {
            const files = await fs.readdir(this.profilesDir);
            const profiles = [];

            for (const file of files) {
                if (file.endsWith('.json')) {
                    try {
                        const filePath = path.join(this.profilesDir, file);
                        const content = await fs.readFile(filePath, 'utf8');
                        const profile = JSON.parse(content);
                        
                        profiles.push({
                            name: profile.name || path.basename(file, '.json'),
                            displayName: profile.name,
                            model: profile.model,
                            agentType: profile.agentType,
                            profileVersion: profile.profileVersion,
                            compatibilityMode: profile.compatibilityMode,
                            fileName: file
                        });
                    } catch (error) {
                        console.warn(`Failed to read profile ${file}:`, error.message);
                    }
                }
            }

            return profiles;
        } catch (error) {
            console.error('Failed to get profiles:', error);
            throw new Error(`Failed to retrieve profiles: ${error.message}`);
        }
    }

    /**
     * Get a specific profile by name
     * @param {string} name - Profile name
     * @returns {Promise<Object>} Profile object
     */
    async getProfile(name) {
        try {
            // Try to find by filename first
            let filePath = path.join(this.profilesDir, `${name}.json`);
            
            // If not found, search by profile name in files
            try {
                await fs.access(filePath);
            } catch (error) {
                // Search for profile by name field
                const profiles = await this.getProfiles();
                const profileInfo = profiles.find(p => p.name === name || p.displayName === name);
                if (!profileInfo) {
                    throw new Error(`Profile '${name}' not found`);
                }
                filePath = path.join(this.profilesDir, profileInfo.fileName);
            }

            const content = await fs.readFile(filePath, 'utf8');
            const profile = JSON.parse(content);
            
            return profile;
        } catch (error) {
            console.error(`Failed to get profile ${name}:`, error);
            throw new Error(`Failed to retrieve profile '${name}': ${error.message}`);
        }
    }

    /**
     * Save or update a profile
     * @param {string} name - Profile name
     * @param {Object} profileData - Profile data
     * @returns {Promise<Object>} Saved profile
     */
    async saveProfile(name, profileData) {
        try {
            // Validate profile structure
            this.validateProfile(profileData);

            // Ensure profile name matches
            profileData.name = name;

            const filePath = path.join(this.profilesDir, `${name}.json`);
            
            // Add metadata
            profileData.updatedAt = new Date().toISOString();
            if (!profileData.createdAt) {
                profileData.createdAt = profileData.updatedAt;
            }

            await fs.writeFile(filePath, JSON.stringify(profileData, null, 2), 'utf8');
            
            return profileData;
        } catch (error) {
            console.error(`Failed to save profile ${name}:`, error);
            throw new Error(`Failed to save profile '${name}': ${error.message}`);
        }
    }

    /**
     * Create a new profile
     * @param {Object} profileData - Profile data
     * @returns {Promise<Object>} Created profile
     */
    async createProfile(profileData) {
        try {
            if (!profileData.name) {
                throw new Error('Profile name is required');
            }

            const name = profileData.name;
            
            // Check if profile already exists
            try {
                await this.getProfile(name);
                throw new Error(`Profile '${name}' already exists`);
            } catch (error) {
                if (!error.message.includes('not found')) {
                    throw error;
                }
            }

            // Set defaults for new profile
            const newProfile = {
                name: name,
                model: profileData.model || "ollama/hf.co/unsloth/Qwen3-30B-A3B-Instruct-2507-20000-GGUF:Q4_K_XL",
                embedding: profileData.embedding || "ollama/nomic-embed-text:latest",
                agentType: profileData.agentType || "langgraph_simplified",
                profileVersion: profileData.profileVersion || "3.0.0",
                compatibilityMode: profileData.compatibilityMode || "simplified_only",
                agentState: this.createDefaultAgentState(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                ...profileData
            };

            return await this.saveProfile(name, newProfile);
        } catch (error) {
            console.error(`Failed to create profile:`, error);
            throw error;
        }
    }

    /**
     * Delete a profile
     * @param {string} name - Profile name
     * @returns {Promise<boolean>} True if deleted
     */
    async deleteProfile(name) {
        try {
            // Find the profile file
            let filePath = path.join(this.profilesDir, `${name}.json`);
            
            try {
                await fs.access(filePath);
            } catch (error) {
                // Search for profile by name field
                const profiles = await this.getProfiles();
                const profileInfo = profiles.find(p => p.name === name || p.displayName === name);
                if (!profileInfo) {
                    throw new Error(`Profile '${name}' not found`);
                }
                filePath = path.join(this.profilesDir, profileInfo.fileName);
            }

            await fs.unlink(filePath);
            return true;
        } catch (error) {
            console.error(`Failed to delete profile ${name}:`, error);
            throw new Error(`Failed to delete profile '${name}': ${error.message}`);
        }
    }

    /**
     * Create default agent state for new profiles
     * @returns {Object} Default agent state
     */
    createDefaultAgentState() {
        return {
            worldContext: {
                position: { x: 0, y: 64, z: 0 },
                health: 20,
                food: 20,
                experience: 0,
                inventory: {
                    items: [],
                    slots: 36,
                    usedSlots: 0,
                    length: 0
                },
                equipment: {},
                nearbyEntities: [],
                timeOfDay: 0,
                weather: "clear",
                dimension: "overworld",
                biome: "plains",
                lightLevel: 15
            },
            personality: "friendly and helpful personality",
            goals: "survival and exploration",
            mandate: "",
            conversation: {
                message: "",
                sender: "",
                isRequestForHelp: false,
                isOfferOfAssistance: false,
                targetBot: "",
                timestamp: 0
            },
            lastAction: "",
            response: ""
        };
    }

    /**
     * Validate profile for migration
     * @param {string} name - Profile name
     * @returns {Promise<Object>} Migration validation result
     */
    async validateForMigration(name) {
        try {
            const profile = await this.getProfile(name);
            return validateForMigration(profile);
        } catch (error) {
            throw new Error(`Failed to validate profile for migration: ${error.message}`);
        }
    }

    /**
     * Get profile validation details
     * @param {string} name - Profile name
     * @returns {Promise<Object>} Validation result
     */
    async getProfileValidation(name) {
        try {
            const profile = await this.getProfile(name);
            return validateProfile(profile);
        } catch (error) {
            throw new Error(`Failed to get profile validation: ${error.message}`);
        }
    }

    /**
     * Backup a profile
     * @param {string} name - Profile name
     * @param {string} backupDir - Backup directory
     * @returns {Promise<string>} Backup file path
     */
    async backupProfile(name, backupDir = null) {
        try {
            const profile = await this.getProfile(name);
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupFileName = `${name}_backup_${timestamp}.json`;
            
            const targetDir = backupDir || path.join(this.profilesDir, '../profiles_backup');
            await fs.mkdir(targetDir, { recursive: true });
            
            const backupPath = path.join(targetDir, backupFileName);
            await fs.writeFile(backupPath, JSON.stringify(profile, null, 2), 'utf8');
            
            return backupPath;
        } catch (error) {
            throw new Error(`Failed to backup profile '${name}': ${error.message}`);
        }
    }

    /**
     * Check if a profile exists
     * @param {string} name - Profile name
     * @returns {Promise<boolean>} True if exists
     */
    async profileExists(name) {
        try {
            await this.getProfile(name);
            return true;
        } catch (error) {
            return false;
        }
    }
}

export default ProfileManager;