/**
 * Skills Bridge
 *
 * Bridges the new dynamic skill progression system with the existing skills.js library.
 * Provides backward compatibility and seamless integration with legacy skill functions.
 */
import { SkillType, SkillCategory, ExperienceSource } from './skill_types.js';
// Import existing skills library
import * as LegacySkills from '../library/skills.js';
export class SkillsBridge {
    config;
    skillsSystem;
    learningEngine;
    synergySystem;
    milestoneSystem;
    experienceTracker;
    // Legacy integration
    legacySkillMappings = new Map();
    legacyCache = new Map();
    syncInProgress = false;
    // Statistics
    statistics;
    constructor(skillsSystem, learningEngine, synergySystem, milestoneSystem, experienceTracker, config) {
        this.skillsSystem = skillsSystem;
        this.learningEngine = learningEngine;
        this.synergySystem = synergySystem;
        this.milestoneSystem = milestoneSystem;
        this.experienceTracker = experienceTracker;
        this.config = {
            enableLegacyCompatibility: true,
            enableBidirectionalSync: true,
            syncInterval: 30 * 1000, // 30 seconds
            enableAutoMigration: true,
            migrateLegacyExperience: true,
            preserveLegacyData: true,
            enableCaching: true,
            cacheTimeout: 5 * 60 * 1000, // 5 minutes
            batchSize: 10,
            enableDebugLogging: false,
            logLevel: 'info',
            ...config
        };
        this.statistics = this.initializeStatistics();
        this.initializeSkillMappings();
        if (this.config.enableAutoMigration) {
            this.performAutoMigration();
        }
        if (this.config.enableBidirectionalSync) {
            this.startSyncCycle();
        }
    }
    /**
     * Initialize bridge statistics
     */
    initializeStatistics() {
        return {
            legacySkillsImported: 0,
            experienceConverted: 0,
            syncOperations: 0,
            errorsEncountered: 0,
            lastSyncTime: 0,
            averageSyncTime: 0
        };
    }
    /**
     * Initialize skill mappings between legacy and new systems
     */
    initializeSkillMappings() {
        // Combat skills
        this.addSkillMapping('sword', SkillType.SWORD_COMBAT, SkillCategory.COMBAT, 1.0);
        this.addSkillMapping('axe', SkillType.AXE_COMBAT, SkillCategory.COMBAT, 1.0);
        this.addSkillMapping('archery', SkillType.ARCHERY, SkillCategory.COMBAT, 1.0);
        this.addSkillMapping('defense', SkillType.DEFENSE, SkillCategory.COMBAT, 1.0);
        this.addSkillMapping('combat', SkillType.SWORD_COMBAT, SkillCategory.COMBAT, 0.8);
        // Crafting skills
        this.addSkillMapping('crafting', SkillType.CRAFTING, SkillCategory.CRAFTING, 1.0);
        this.addSkillMapping('woodworking', SkillType.WOODWORKING, SkillCategory.CRAFTING, 1.0);
        this.addSkillMapping('smithing', SkillType.SMITHING, SkillCategory.CRAFTING, 1.0);
        this.addSkillMapping('cooking', SkillType.COOKING, SkillCategory.CRAFTING, 1.0);
        this.addSkillMapping('alchemy', SkillType.ALCHEMY, SkillCategory.CRAFTING, 1.0);
        this.addSkillMapping('enchanting', SkillType.ENCHANTING, SkillCategory.CRAFTING, 1.0);
        // Building skills
        this.addSkillMapping('building', SkillType.CONSTRUCTION, SkillCategory.BUILDING, 1.0);
        this.addSkillMapping('construction', SkillType.CONSTRUCTION, SkillCategory.BUILDING, 1.0);
        this.addSkillMapping('architecture', SkillType.ARCHITECTURE, SkillCategory.BUILDING, 1.0);
        // Mining skills
        this.addSkillMapping('mining', SkillType.MINING, SkillCategory.MINING, 1.0);
        this.addSkillMapping('prospecting', SkillType.PROSPECTING, SkillCategory.MINING, 1.0);
        // Farming skills
        this.addSkillMapping('farming', SkillType.FARMING, SkillCategory.FARMING, 1.0);
        this.addSkillMapping('crop_farming', SkillType.CROP_FARMING, SkillCategory.FARMING, 1.0);
        this.addSkillMapping('animal_husbandry', SkillType.ANIMAL_HUSBANDRY, SkillCategory.FARMING, 1.0);
        // Exploration skills
        this.addSkillMapping('navigation', SkillType.NAVIGATION, SkillCategory.EXPLORATION, 1.0);
        this.addSkillMapping('mapping', SkillType.MAPPING, SkillCategory.EXPLORATION, 1.0);
        this.addSkillMapping('swimming', SkillType.SWIMMING, SkillCategory.EXPLORATION, 1.0);
        this.addSkillMapping('climbing', SkillType.CLIMBING, SkillCategory.EXPLORATION, 1.0);
        // Social skills
        this.addSkillMapping('trading', SkillType.TRADING, SkillCategory.SOCIAL, 1.0);
        this.addSkillMapping('persuasion', SkillType.PERSUASION, SkillCategory.SOCIAL, 1.0);
        this.addSkillMapping('leadership', SkillType.LEADERSHIP, SkillCategory.SOCIAL, 1.0);
        // Tool skills
        this.addSkillMapping('pickaxe', SkillType.PICKAXE_USE, SkillCategory.TOOL_USE, 1.0);
        this.addSkillMapping('shovel', SkillType.SHOVEL_USE, SkillCategory.TOOL_USE, 1.0);
        this.addSkillMapping('axe', SkillType.AXE_USE, SkillCategory.TOOL_USE, 1.0);
        this.addSkillMapping('fishing', SkillType.FISHING, SkillCategory.TOOL_USE, 1.0);
    }
    /**
     * Add a skill mapping
     */
    addSkillMapping(legacyName, newType, category, conversionFactor, additionalData = {}) {
        this.legacySkillMappings.set(legacyName, {
            legacyName,
            newType,
            category,
            conversionFactor,
            additionalData
        });
    }
    /**
     * Perform automatic migration from legacy system
     */
    performAutoMigration() {
        try {
            this.log('info', 'Starting automatic migration from legacy skills system');
            // Get legacy skills data
            const legacySkills = this.extractLegacySkillsData();
            // Migrate each skill
            legacySkills.forEach(legacySkill => {
                this.migrateLegacySkill(legacySkill);
            });
            this.log('info', `Migration completed: ${this.statistics.legacySkillsImported} skills imported`);
        }
        catch (error) {
            this.log('error', `Migration failed: ${error}`);
            this.statistics.errorsEncountered++;
        }
    }
    /**
     * Extract data from legacy skills system
     */
    extractLegacySkillsData() {
        const legacySkills = [];
        try {
            // Access legacy skills data structure
            // The skills.js file contains exported functions, not a skills data object
            // For now, we'll create a mock structure based on the functions available
            const mockLegacySkills = [
                { name: 'crafting', level: 1, experience: 0, category: 'crafting', lastUsed: Date.now(), usageCount: 0 },
                { name: 'mining', level: 1, experience: 0, category: 'mining', lastUsed: Date.now(), usageCount: 0 },
                { name: 'combat', level: 1, experience: 0, category: 'combat', lastUsed: Date.now(), usageCount: 0 },
                { name: 'building', level: 1, experience: 0, category: 'building', lastUsed: Date.now(), usageCount: 0 },
                { name: 'farming', level: 1, experience: 0, category: 'farming', lastUsed: Date.now(), usageCount: 0 }
            ];
            mockLegacySkills.forEach((data) => {
                legacySkills.push(data);
            });
        }
        catch (error) {
            this.log('error', `Failed to extract legacy skills data: ${error}`);
        }
        return legacySkills;
    }
    /**
     * Migrate a single legacy skill
     */
    migrateLegacySkill(legacySkill) {
        const mapping = this.legacySkillMappings.get(legacySkill.name);
        if (!mapping) {
            this.log('warn', `No mapping found for legacy skill: ${legacySkill.name}`);
            return;
        }
        try {
            // Check if skill already exists in new system
            const existingSkill = this.skillsSystem.getSkill(mapping.newType);
            if (!existingSkill) {
                // Create new skill using the learning engine
                const newSkill = this.skillsSystem.getSkill(mapping.newType);
                // Set usage statistics from legacy data
                if (newSkill) {
                    newSkill.usage.lastUsed = legacySkill.lastUsed;
                    newSkill.usage.totalUses = legacySkill.usageCount;
                    newSkill.usage.successfulUses = Math.floor(legacySkill.usageCount * 0.8); // Estimate
                    // Add initial experience
                    const initialExperience = Math.floor(legacySkill.experience * mapping.conversionFactor);
                    const experienceEvent = {
                        id: `migration_${legacySkill.name}_${Date.now()}`,
                        skillType: mapping.newType,
                        amount: initialExperience,
                        source: ExperienceSource.PRACTICE,
                        context: {
                            situation: 'migration',
                            location: { x: 0, y: 0, z: 0 },
                            participants: [],
                            tools: [],
                            difficulty: 0.5,
                            timePressure: 0.5,
                            riskLevel: 0.5,
                            socialContext: 'solo'
                        },
                        timestamp: Date.now(),
                        quality: 0.5,
                        difficulty: 0.5,
                        success: true,
                        impact: 0.5,
                        componentGains: {
                            knowledge: 0.3,
                            practical: 0.6,
                            creative: 0.1
                        },
                        synergyBonus: 0,
                        personalityBonus: 0,
                        contextBonus: 0,
                        plateauModifier: 0
                    };
                    this.learningEngine.processExperience(newSkill, experienceEvent, experienceEvent.context);
                }
            }
            else {
                // Update existing skill with legacy data
                const additionalExperience = Math.floor(legacySkill.experience * mapping.conversionFactor);
                const experienceEvent = {
                    id: `migration_update_${legacySkill.name}_${Date.now()}`,
                    skillType: mapping.newType,
                    amount: additionalExperience,
                    source: ExperienceSource.PRACTICE,
                    context: {
                        situation: 'migration_update',
                        location: { x: 0, y: 0, z: 0 },
                        participants: [],
                        tools: [],
                        difficulty: 0.5,
                        timePressure: 0.5,
                        riskLevel: 0.5,
                        socialContext: 'solo'
                    },
                    timestamp: Date.now(),
                    quality: 0.5,
                    difficulty: 0.5,
                    success: true,
                    impact: 0.5,
                    componentGains: {
                        knowledge: 0.3,
                        practical: 0.6,
                        creative: 0.1
                    },
                    synergyBonus: 0,
                    personalityBonus: 0,
                    contextBonus: 0,
                    plateauModifier: 0
                };
                this.learningEngine.processExperience(existingSkill, experienceEvent, experienceEvent.context);
                existingSkill.usage.lastUsed = Math.max(existingSkill.usage.lastUsed, legacySkill.lastUsed);
                existingSkill.usage.totalUses += legacySkill.usageCount;
            }
            this.statistics.legacySkillsImported++;
            this.statistics.experienceConverted += Math.floor(legacySkill.experience * mapping.conversionFactor);
            // Cache legacy data
            if (this.config.enableCaching) {
                this.legacyCache.set(legacySkill.name, legacySkill);
            }
        }
        catch (error) {
            this.log('error', `Failed to migrate legacy skill ${legacySkill.name}: ${error}`);
            this.statistics.errorsEncountered++;
        }
    }
    /**
     * Start bidirectional sync cycle
     */
    startSyncCycle() {
        setInterval(() => {
            if (!this.syncInProgress) {
                this.performBidirectionalSync();
            }
        }, this.config.syncInterval);
    }
    /**
     * Perform bidirectional synchronization
     */
    async performBidirectionalSync() {
        if (this.syncInProgress)
            return;
        this.syncInProgress = true;
        const startTime = Date.now();
        try {
            this.log('debug', 'Starting bidirectional sync');
            // Sync from new system to legacy
            if (this.config.enableLegacyCompatibility) {
                await this.syncToLegacy();
            }
            // Sync from legacy to new system
            await this.syncFromLegacy();
            // Update statistics
            const syncTime = Date.now() - startTime;
            this.statistics.syncOperations++;
            this.statistics.lastSyncTime = Date.now();
            this.statistics.averageSyncTime =
                (this.statistics.averageSyncTime + syncTime) / 2;
            this.log('debug', `Sync completed in ${syncTime}ms`);
        }
        catch (error) {
            this.log('error', `Sync failed: ${error}`);
            this.statistics.errorsEncountered++;
        }
        finally {
            this.syncInProgress = false;
        }
    }
    /**
     * Sync data from new system to legacy
     */
    async syncToLegacy() {
        const allSkills = this.skillsSystem.getAllSkills();
        for (const skill of allSkills) {
            try {
                // Find reverse mapping
                const reverseMappingName = this.findReverseMapping(skill.type);
                if (!reverseMappingName)
                    continue;
                // Get the mapping to access conversion factor
                const reverseMapping = this.legacySkillMappings.get(reverseMappingName);
                if (!reverseMapping)
                    continue;
                // Update legacy skill data
                const legacySkill = this.legacyCache.get(reverseMappingName);
                if (legacySkill) {
                    legacySkill.level = Math.floor(skill.proficiency.level / reverseMapping.conversionFactor);
                    legacySkill.experience = Math.floor(skill.proficiency.experience / reverseMapping.conversionFactor);
                    legacySkill.lastUsed = skill.usage.lastUsed;
                    legacySkill.usageCount = skill.usage.totalUses;
                    // Update legacy skills system (if writable)
                    this.updateLegacySkillData(reverseMappingName, legacySkill);
                }
            }
            catch (error) {
                this.log('warn', `Failed to sync skill ${skill.type} to legacy: ${error}`);
            }
        }
    }
    /**
     * Sync data from legacy system to new system
     */
    async syncFromLegacy() {
        const currentLegacyData = this.extractLegacySkillsData();
        for (const legacySkill of currentLegacyData) {
            try {
                const cachedLegacy = this.legacyCache.get(legacySkill.name);
                // Check if legacy data has changed
                if (!cachedLegacy || this.hasLegacyDataChanged(cachedLegacy, legacySkill)) {
                    this.migrateLegacySkill(legacySkill);
                }
            }
            catch (error) {
                this.log('warn', `Failed to sync legacy skill ${legacySkill.name}: ${error}`);
            }
        }
    }
    /**
     * Find reverse mapping from new skill type to legacy name
     */
    findReverseMapping(skillType) {
        for (const [legacyName, mapping] of this.legacySkillMappings) {
            if (mapping.newType === skillType) {
                return legacyName;
            }
        }
        return null;
    }
    /**
     * Check if legacy data has changed
     */
    hasLegacyDataChanged(cached, current) {
        return (cached.level !== current.level ||
            cached.experience !== current.experience ||
            cached.lastUsed !== current.lastUsed ||
            cached.usageCount !== current.usageCount);
    }
    /**
     * Update legacy skill data (placeholder implementation)
     */
    updateLegacySkillData(legacyName, data) {
        // This would need to be implemented based on the actual skills.js API
        // For now, we'll just log the update
        this.log('debug', `Would update legacy skill ${legacyName} with level ${data.level}, experience ${data.experience}`);
    }
    /**
     * Execute legacy skill function through bridge
     */
    executeLegacySkill(skillName, ...args) {
        if (!this.config.enableLegacyCompatibility) {
            throw new Error('Legacy compatibility is disabled');
        }
        try {
            // Check if skill exists in legacy system
            const legacyFunction = LegacySkills[skillName];
            if (typeof legacyFunction !== 'function') {
                throw new Error(`Legacy skill function ${skillName} not found`);
            }
            // Execute legacy function
            const result = legacyFunction.apply(null, args);
            // Track the execution in new system
            this.trackLegacyExecution(skillName, args, result);
            return result;
        }
        catch (error) {
            this.log('error', `Failed to execute legacy skill ${skillName}: ${error}`);
            throw error;
        }
    }
    /**
     * Track legacy skill execution in new system
     */
    trackLegacyExecution(skillName, args, result) {
        const mapping = this.legacySkillMappings.get(skillName);
        if (!mapping)
            return;
        try {
            // Create experience event for legacy execution
            const event = {
                id: `legacy_${skillName}_${Date.now()}`,
                skillType: mapping.newType,
                amount: this.calculateLegacyExperience(skillName, args, result),
                source: ExperienceSource.PRACTICE,
                context: this.createLegacyContext(args),
                timestamp: Date.now(),
                quality: this.assessLegacyExecutionQuality(result),
                difficulty: this.assessLegacyExecutionDifficulty(skillName, args),
                success: this.assessLegacyExecutionSuccess(result),
                impact: 0.5,
                componentGains: {
                    knowledge: 0.3,
                    practical: 0.6,
                    creative: 0.1
                },
                synergyBonus: 0,
                personalityBonus: 0,
                contextBonus: 0,
                plateauModifier: 0
            };
            // Add experience to new system through learning engine
            const skill = this.skillsSystem.getSkill(mapping.newType);
            if (skill) {
                this.learningEngine.processExperience(skill, event, event.context);
            }
            // Track in experience tracker
            this.experienceTracker.addExperienceEvent(event);
        }
        catch (error) {
            this.log('warn', `Failed to track legacy execution for ${skillName}: ${error}`);
        }
    }
    /**
     * Calculate experience for legacy execution
     */
    calculateLegacyExperience(skillName, args, result) {
        const mapping = this.legacySkillMappings.get(skillName);
        if (!mapping)
            return 1;
        // Base experience depends on skill complexity
        let baseExperience = 10;
        // Adjust based on execution result
        if (result && typeof result === 'object') {
            if (result.success)
                baseExperience *= 1.5;
            if (result.quality)
                baseExperience *= result.quality;
            if (result.difficulty)
                baseExperience *= (1 + result.difficulty);
        }
        // Apply conversion factor
        return Math.floor(baseExperience * mapping.conversionFactor);
    }
    /**
     * Create experience context from legacy arguments
     */
    createLegacyContext(args) {
        return {
            situation: 'legacy_execution',
            location: { x: 0, y: 0, z: 0 }, // Unknown location
            participants: [],
            tools: [],
            difficulty: 0.5,
            timePressure: 0.5,
            riskLevel: 0.5,
            socialContext: 'solo'
        };
    }
    /**
     * Assess quality of legacy execution
     */
    assessLegacyExecutionQuality(result) {
        if (!result)
            return 0.5;
        if (result.quality !== undefined)
            return Math.max(0, Math.min(1, result.quality));
        if (result.success !== undefined)
            return result.success ? 0.8 : 0.3;
        return 0.6;
    }
    /**
     * Assess difficulty of legacy execution
     */
    assessLegacyExecutionDifficulty(skillName, args) {
        // Simple heuristic based on skill type and arguments
        const mapping = this.legacySkillMappings.get(skillName);
        if (!mapping)
            return 0.5;
        let difficulty = 0.5;
        // Adjust based on skill category
        switch (mapping.category) {
            case SkillCategory.COMBAT:
                difficulty = 0.6;
                break;
            case SkillCategory.CRAFTING:
                difficulty = 0.4;
                break;
            case SkillCategory.MAGIC:
                difficulty = 0.8;
                break;
            default:
                difficulty = 0.5;
        }
        return difficulty;
    }
    /**
     * Assess success of legacy execution
     */
    assessLegacyExecutionSuccess(result) {
        if (!result)
            return false;
        if (result.success !== undefined)
            return result.success;
        if (result.error)
            return false;
        return true;
    }
    /**
     * Get bridge statistics
     */
    getStatistics() {
        return { ...this.statistics };
    }
    /**
     * Get skill mappings
     */
    getSkillMappings() {
        return new Map(this.legacySkillMappings);
    }
    /**
     * Force manual sync
     */
    async forceSync() {
        if (this.config.enableBidirectionalSync) {
            await this.performBidirectionalSync();
        }
    }
    /**
     * Clear legacy cache
     */
    clearLegacyCache() {
        this.legacyCache.clear();
    }
    /**
     * Reset bridge statistics
     */
    resetStatistics() {
        this.statistics = this.initializeStatistics();
    }
    /**
     * Log message with configured level
     */
    log(level, message) {
        if (!this.config.enableDebugLogging)
            return;
        const levelPriority = { error: 0, warn: 1, info: 2, debug: 3 };
        const configPriority = levelPriority[this.config.logLevel];
        const messagePriority = levelPriority[level];
        if (messagePriority <= configPriority) {
            console.log(`[SkillsBridge:${level.toUpperCase()}] ${message}`);
        }
    }
    /**
     * Get migration status
     */
    getMigrationStatus() {
        const totalLegacySkills = this.extractLegacySkillsData().length;
        const migratedSkills = this.statistics.legacySkillsImported;
        const pendingSkills = totalLegacySkills - migratedSkills;
        return {
            isComplete: pendingSkills === 0,
            totalLegacySkills,
            migratedSkills,
            pendingSkills,
            lastMigrationTime: this.statistics.lastSyncTime
        };
    }
    /**
     * Export bridge configuration
     */
    exportConfiguration() {
        const mappings = Array.from(this.legacySkillMappings.entries()).map(([legacyName, mapping]) => ({
            legacyName,
            mapping
        }));
        return {
            config: { ...this.config },
            mappings,
            statistics: { ...this.statistics }
        };
    }
}
