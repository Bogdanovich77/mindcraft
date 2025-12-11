/**
 * Dynamic Skills System
 *
 * Comprehensive skill progression system with proficiency tracking, experience management,
 * learning characteristics, and adaptive growth rates. Integrates with personality and
 * goal systems while respecting reactive interrupts.
 */
import { SkillType, SkillCategory, ExperienceSource, PlateauType, PlateauSeverity, PlateauCause } from './skill_types.js';
export class SkillsSystem {
    skills = new Map();
    config;
    personality;
    plateaus = new Map();
    lastUpdate = Date.now();
    socialState;
    // Performance tracking
    recentProgress = [];
    recommendations = [];
    // Social learning tracking
    socialObservations = new Map(); // agentId -> observations
    teachingHistory = new Map(); // skillType -> students taught
    constructor(personality, config) {
        this.personality = personality;
        this.config = {
            baseLearningRate: 1.0,
            personalityInfluence: 0.3,
            synergyBonusMultiplier: 1.5,
            experienceFormula: {
                baseMultiplier: 10.0,
                difficultyExponent: 1.2,
                successBonus: 1.5,
                failurePenalty: 0.5,
                synergyExponent: 0.8,
                personalityExponent: 0.5,
                plateauFactor: 0.7
            },
            levelThresholds: {
                baseThreshold: 100,
                growthExponent: 1.5,
                masteryMultiplier: 2.0,
                specializationBonus: 1.3
            },
            plateauDetection: {
                stagnationPeriod: 7 * 24 * 60 * 60 * 1000, // 7 days
                minimumAttempts: 20,
                sensitivityThreshold: 0.1,
                autoBreakAttempts: true
            },
            maxTrackedSkills: 50,
            experienceHistorySize: 1000,
            updateInterval: 1000,
            enableLegacyBridge: true,
            enableGoalIntegration: true,
            enablePurposeIntegration: true,
            ...config
        };
        this.initializeCoreSkills();
    }
    /**
     * Initialize core skills with base values
     */
    initializeCoreSkills() {
        const coreSkills = [
            SkillType.SWORD_COMBAT,
            SkillType.MINING,
            SkillType.CONSTRUCTION,
            SkillType.COOKING,
            SkillType.TRADING,
            SkillType.NAVIGATION,
            SkillType.CRAFTING,
            SkillType.FIRE_STARTING
        ];
        coreSkills.forEach(skillType => {
            this.createSkill(skillType);
        });
    }
    /**
     * Create a new skill with default values
     */
    createSkill(skillType) {
        const personalityProfile = this.personality.getProfile();
        const personalityTraits = this.convertProfileToTraits(personalityProfile);
        const skillInfo = this.getSkillInfo(skillType);
        const skill = {
            id: `skill_${skillType}_${Date.now()}`,
            type: skillType,
            category: skillInfo.category,
            name: skillInfo.name,
            description: skillInfo.description,
            proficiency: this.createInitialProficiency(),
            components: this.createInitialComponents(skillType, personalityTraits),
            learning: this.createInitialLearning(skillType, personalityTraits),
            usage: this.createInitialUsage(),
            metadata: this.createInitialMetadata(skillType)
        };
        this.skills.set(skillType, skill);
        return skill;
    }
    /**
     * Convert personality profile to traits format
     */
    convertProfileToTraits(profile) {
        return {
            openness: profile.openness || 0.5,
            conscientiousness: profile.conscientiousness || 0.5,
            extraversion: profile.extraversion || 0.5,
            agreeableness: profile.agreeableness || 0.5,
            neuroticism: profile.neuroticism || 0.5,
            riskTolerance: profile.riskTolerance || 0.5,
            explorationDrive: profile.explorationDrive || 0.5,
            socialTendency: profile.extraversion || 0.5,
            buildingCreativity: profile.buildingCreativity || 0.5,
            combatAggression: profile.combatAggression || 0.5
        };
    }
    /**
     * Get skill information by type
     */
    getSkillInfo(skillType) {
        // Use partial record to avoid needing all skills
        const skillInfoMap = {
            [SkillType.SWORD_COMBAT]: {
                category: SkillCategory.COMBAT,
                name: 'Sword Combat',
                description: 'Proficiency with swords and bladed weapons in combat'
            },
            [SkillType.MINING]: {
                category: SkillCategory.MINING,
                name: 'Mining',
                description: 'Efficient extraction of ores and materials from the earth'
            },
            [SkillType.CONSTRUCTION]: {
                category: SkillCategory.BUILDING,
                name: 'Construction',
                description: 'Building structures and architectural projects'
            },
            [SkillType.COOKING]: {
                category: SkillCategory.CRAFTING,
                name: 'Cooking',
                description: 'Preparing food and managing culinary resources'
            },
            [SkillType.TRADING]: {
                category: SkillCategory.SOCIAL,
                name: 'Trading',
                description: 'Negotiating trades and managing economic interactions'
            },
            [SkillType.NAVIGATION]: {
                category: SkillCategory.EXPLORATION,
                name: 'Navigation',
                description: 'Finding paths and navigating through the world'
            },
            [SkillType.CRAFTING]: {
                category: SkillCategory.CRAFTING,
                name: 'Crafting',
                description: 'Creating items from raw materials and recipes'
            },
            [SkillType.FIRE_STARTING]: {
                category: SkillCategory.SURVIVAL,
                name: 'Fire Starting',
                description: 'Creating and maintaining fires for survival'
            },
            // Add more skill mappings as needed...
        };
        return skillInfoMap[skillType] || {
            category: SkillCategory.TOOL_USE,
            name: skillType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            description: `Proficiency in ${skillType.replace(/_/g, ' ')}`
        };
    }
    /**
     * Create initial proficiency metrics
     */
    createInitialProficiency() {
        return {
            level: 0,
            experience: 0,
            nextLevelThreshold: this.calculateLevelThreshold(1),
            masteryBonus: 0,
            potentialMaximum: 100,
            growthRate: 1.0,
            plateauLevel: 0,
            lastProgressUpdate: Date.now()
        };
    }
    /**
     * Create initial skill components based on personality
     */
    createInitialComponents(skillType, personality) {
        const traits = personality;
        // Base components influenced by personality
        let knowledge = 5 + traits.conscientiousness * 10;
        let practical = 5 + traits.extraversion * 8;
        let creative = 5 + traits.openness * 12;
        // Skill-specific adjustments
        switch (this.getSkillInfo(skillType).category) {
            case SkillCategory.COMBAT:
                practical += traits.riskTolerance * 10;
                break;
            case SkillCategory.CRAFTING:
                creative += traits.openness * 15;
                knowledge += traits.conscientiousness * 10;
                break;
            case SkillCategory.SOCIAL:
                practical += traits.extraversion * 15;
                creative += traits.agreeableness * 8;
                break;
            case SkillCategory.EXPLORATION:
                creative += traits.explorationDrive * 15;
                practical += traits.riskTolerance * 5;
                break;
        }
        // Normalize to 0-20 range for starting skills
        knowledge = Math.min(20, Math.max(0, knowledge));
        practical = Math.min(20, Math.max(0, practical));
        creative = Math.min(20, Math.max(0, creative));
        // Determine balance
        const maxComponent = Math.max(knowledge, practical, creative);
        let balance = 'balanced';
        if (knowledge === maxComponent && knowledge > practical + 5 && knowledge > creative + 5) {
            balance = 'knowledge_dominant';
        }
        else if (practical === maxComponent && practical > knowledge + 5 && practical > creative + 5) {
            balance = 'practical_dominant';
        }
        else if (creative === maxComponent && creative > knowledge + 5 && creative > practical + 5) {
            balance = 'creative_dominant';
        }
        return {
            knowledge,
            practical,
            creative,
            knowledgeGrowthRate: 1.0 + traits.conscientiousness * 0.5,
            practicalGrowthRate: 1.0 + traits.extraversion * 0.3,
            creativeGrowthRate: 1.0 + traits.openness * 0.7,
            balance
        };
    }
    /**
     * Create initial learning characteristics
     */
    createInitialLearning(skillType, personality) {
        const traits = personality;
        const skillInfo = this.getSkillInfo(skillType);
        // Base learning rate influenced by personality
        let learningRate = this.config.baseLearningRate;
        learningRate += traits.openness * 0.3; // Openness helps learning
        learningRate += traits.conscientiousness * 0.2; // Conscientiousness helps retention
        learningRate *= (1 - traits.neuroticism * 0.2); // Neuroticism hinders learning
        // Skill-specific difficulty
        let difficulty = 0.5; // Medium difficulty by default
        switch (skillInfo.category) {
            case SkillCategory.COMBAT:
                difficulty = 0.6 + (1 - traits.riskTolerance) * 0.3;
                break;
            case SkillCategory.MAGIC:
                difficulty = 0.8; // Magic is inherently difficult
                break;
            case SkillCategory.SURVIVAL:
                difficulty = 0.4; // Survival skills are more intuitive
                break;
        }
        return {
            learningRate: Math.min(2.0, Math.max(0.1, learningRate)),
            retentionRate: 0.8 + traits.conscientiousness * 0.2,
            transferAbility: 0.5 + traits.openness * 0.3,
            practiceEffectiveness: 0.7 + traits.extraversion * 0.2,
            difficulty,
            prerequisites: this.getSkillPrerequisites(skillType),
            learningMethods: this.getEffectiveLearningMethods(skillType),
            personalityModifiers: {
                openness: traits.openness,
                conscientiousness: traits.conscientiousness,
                extraversion: traits.extraversion,
                agreeableness: traits.agreeableness,
                neuroticism: traits.neuroticism,
                riskTolerance: traits.riskTolerance,
                explorationDrive: traits.explorationDrive
            },
            adaptiveRate: learningRate,
            preferredContext: this.getPreferredContexts(skillType, traits)
        };
    }
    /**
     * Create initial usage statistics
     */
    createInitialUsage() {
        return {
            totalUses: 0,
            successfulUses: 0,
            failedUses: 0,
            recentUses: [],
            averageExecutionTime: 0,
            lastUsed: 0,
            streakDays: 0,
            bestStreak: 0,
            useContexts: {},
            successRateTrend: [],
            efficiencyTrend: []
        };
    }
    /**
     * Create initial metadata
     */
    createInitialMetadata(skillType) {
        const skillInfo = this.getSkillInfo(skillType);
        const isCore = [
            SkillType.SWORD_COMBAT,
            SkillType.MINING,
            SkillType.CONSTRUCTION,
            SkillType.COOKING
        ].includes(skillType);
        return {
            createdAt: Date.now(),
            lastModified: Date.now(),
            version: '1.0.0',
            isCoreSkill: isCore,
            isSpecialized: false,
            childSkills: this.getChildSkills(skillType),
            totalLearningTime: 0,
            breakthroughCount: 0,
            plateausBroken: 0,
            taughtTo: [],
            sharedExperience: 0
        };
    }
    /**
     * Get skill prerequisites
     */
    getSkillPrerequisites(skillType) {
        const prerequisites = {
            [SkillType.CROSSBOW]: [SkillType.ARCHERY],
            [SkillType.HEAVY_ARMOR]: [SkillType.DEFENSE],
            [SkillType.SMITHING]: [SkillType.CRAFTING, SkillType.MINING],
            [SkillType.ALCHEMY]: [SkillType.COOKING],
            [SkillType.ARCHITECTURE]: [SkillType.CONSTRUCTION],
            [SkillType.PROSPECTING]: [SkillType.MINING],
            [SkillType.ANIMAL_HUSBANDRY]: [SkillType.CROP_FARMING],
            [SkillType.BREEDING]: [SkillType.ANIMAL_HUSBANDRY],
            [SkillType.ENCHANTING]: [SkillType.MAGIC],
            [SkillType.RITUAL_MAGIC]: [SkillType.SPELLCASTING],
            [SkillType.CAVE_NAVIGATION]: [SkillType.NAVIGATION, SkillType.MINING]
        };
        return prerequisites[skillType] || [];
    }
    /**
     * Get effective learning methods for skill type
     */
    getEffectiveLearningMethods(skillType) {
        const methods = [
            { type: 'practice', effectiveness: 0.8, context: 'general', requirements: [] },
            { type: 'observation', effectiveness: 0.6, context: 'social', requirements: [] },
            { type: 'study', effectiveness: 0.5, context: 'quiet', requirements: ['materials'] }
        ];
        // Add skill-specific methods
        const skillInfo = this.getSkillInfo(skillType);
        switch (skillInfo.category) {
            case SkillCategory.COMBAT:
                methods.push({ type: 'practice', effectiveness: 0.9, context: 'combat', requirements: ['opponent'] });
                break;
            case SkillCategory.CRAFTING:
                methods.push({ type: 'experimentation', effectiveness: 0.7, context: 'workshop', requirements: ['materials', 'tools'] });
                break;
            case SkillCategory.SOCIAL:
                methods.push({ type: 'teaching', effectiveness: 0.8, context: 'social', requirements: ['students'] });
                break;
        }
        return methods;
    }
    /**
     * Get preferred learning contexts based on skill and personality
     */
    getPreferredContexts(skillType, personality) {
        const contexts = ['general'];
        if (personality.extraversion > 0.7) {
            contexts.push('social', 'cooperative');
        }
        else if (personality.extraversion < 0.3) {
            contexts.push('solo', 'quiet');
        }
        if (personality.openness > 0.6) {
            contexts.push('exploration', 'experimentation');
        }
        const skillInfo = this.getSkillInfo(skillType);
        switch (skillInfo.category) {
            case SkillCategory.COMBAT:
                contexts.push('combat', 'training');
                break;
            case SkillCategory.CRAFTING:
                contexts.push('workshop', 'construction');
                break;
            case SkillCategory.EXPLORATION:
                contexts.push('wilderness', 'cave', 'navigation');
                break;
        }
        return contexts;
    }
    /**
     * Get child skills for a given skill
     */
    getChildSkills(skillType) {
        const childSkills = {
            [SkillType.SWORD_COMBAT]: [SkillType.AXE_COMBAT],
            [SkillType.ARCHERY]: [SkillType.CROSSBOW],
            [SkillType.CRAFTING]: [SkillType.WOODWORKING, SkillType.STONEWORKING, SkillType.SMITHING],
            [SkillType.MINING]: [SkillType.PROSPECTING, SkillType.CAVE_NAVIGATION],
            [SkillType.FARMING]: [SkillType.CROP_FARMING, SkillType.ANIMAL_HUSBANDRY],
            [SkillType.NAVIGATION]: [SkillType.MAPPING, SkillType.WAYFINDING]
        };
        return childSkills[skillType] || [];
    }
    /**
     * Calculate experience threshold for next level
     */
    calculateLevelThreshold(level) {
        const { baseThreshold, growthExponent, masteryMultiplier } = this.config.levelThresholds;
        const masteryLevel = Math.floor(level / 25); // Mastery every 25 levels
        const masteryBonus = masteryLevel > 0 ? Math.pow(masteryMultiplier, masteryLevel) : 1;
        return Math.floor(baseThreshold * Math.pow(level, growthExponent) * masteryBonus);
    }
    /**
     * Get skill by type, creating if it doesn't exist
     */
    getSkill(skillType) {
        let skill = this.skills.get(skillType);
        if (!skill) {
            skill = this.createSkill(skillType);
        }
        return skill;
    }
    /**
     * Get all skills
     */
    getAllSkills() {
        return Array.from(this.skills.values());
    }
    /**
     * Get skills by category
     */
    getSkillsByCategory(category) {
        return this.getAllSkills().filter(skill => skill.category === category);
    }
    /**
     * Check if skill exists
     */
    hasSkill(skillType) {
        return this.skills.has(skillType);
    }
    /**
     * Get skill level
     */
    getSkillLevel(skillType) {
        return this.getSkill(skillType).proficiency.level;
    }
    /**
     * Get skill proficiency metrics
     */
    getProficiency(skillType) {
        return { ...this.getSkill(skillType).proficiency };
    }
    /**
     * Get skill components
     */
    getComponents(skillType) {
        return { ...this.getSkill(skillType).components };
    }
    /**
     * Get skill learning characteristics
     */
    getLearning(skillType) {
        return { ...this.getSkill(skillType).learning };
    }
    /**
     * Get usage statistics
     */
    getUsage(skillType) {
        return { ...this.getSkill(skillType).usage };
    }
    /**
     * Update skill with new experience
     */
    updateSkill(skillType, experienceEvent) {
        const skill = this.getSkill(skillType);
        const previousLevel = skill.proficiency.level;
        // Process experience
        const processedExperience = this.processExperience(skill, experienceEvent);
        // Apply experience to skill
        this.applyExperience(skill, processedExperience);
        // Update usage statistics
        this.updateUsageStatistics(skill, experienceEvent);
        // Check for level progression
        const levelProgress = this.checkLevelProgression(skill);
        // Detect plateaus
        this.detectPlateaus(skill);
        // Update skill metadata
        skill.metadata.lastModified = Date.now();
        // Record progress
        const progress = {
            skillType,
            previousLevel,
            currentLevel: skill.proficiency.level,
            experienceGained: processedExperience.amount,
            timeSpent: Date.now() - experienceEvent.timestamp,
            breakthroughs: levelProgress.breakthroughs
        };
        this.recentProgress.push(progress);
        if (this.recentProgress.length > 100) {
            this.recentProgress = this.recentProgress.slice(-50);
        }
        this.lastUpdate = Date.now();
        return progress;
    }
    /**
     * Process experience event with all modifiers
     */
    processExperience(skill, event) {
        const formula = this.config.experienceFormula;
        let processedAmount = event.amount;
        // Apply difficulty modifier
        const difficultyModifier = Math.pow(1 + event.difficulty, formula.difficultyExponent);
        processedAmount *= difficultyModifier;
        // Apply success/failure modifier
        if (event.success) {
            processedAmount *= formula.successBonus;
        }
        else {
            processedAmount *= formula.failurePenalty;
        }
        // Apply quality modifier
        processedAmount *= (0.5 + event.quality * 0.5);
        // Apply skill-specific learning rate
        processedAmount *= skill.learning.adaptiveRate;
        // Apply synergy bonus
        processedAmount *= (1 + event.synergyBonus * formula.synergyExponent);
        // Apply personality bonus
        processedAmount *= (1 + event.personalityBonus * formula.personalityExponent);
        // Apply plateau modifier
        processedAmount *= (1 - event.plateauModifier * (1 - formula.plateauFactor));
        return {
            ...event,
            amount: Math.max(1, Math.floor(processedAmount))
        };
    }
    /**
     * Apply processed experience to skill
     */
    applyExperience(skill, experienceEvent) {
        const { amount, componentGains } = experienceEvent;
        // Add to total experience
        skill.proficiency.experience += amount;
        // Apply component gains
        skill.components.knowledge = Math.min(100, skill.components.knowledge + componentGains.knowledge);
        skill.components.practical = Math.min(100, skill.components.practical + componentGains.practical);
        skill.components.creative = Math.min(100, skill.components.creative + componentGains.creative);
        // Update component balance
        this.updateComponentBalance(skill);
        // Update last progress timestamp
        skill.proficiency.lastProgressUpdate = Date.now();
        // Update learning time
        skill.metadata.totalLearningTime += Date.now() - experienceEvent.timestamp;
    }
    /**
     * Update skill component balance
     */
    updateComponentBalance(skill) {
        const { knowledge, practical, creative } = skill.components;
        const maxComponent = Math.max(knowledge, practical, creative);
        const threshold = 5;
        if (knowledge === maxComponent && knowledge > practical + threshold && knowledge > creative + threshold) {
            skill.components.balance = 'knowledge_dominant';
        }
        else if (practical === maxComponent && practical > knowledge + threshold && practical > creative + threshold) {
            skill.components.balance = 'practical_dominant';
        }
        else if (creative === maxComponent && creative > knowledge + threshold && creative > practical + threshold) {
            skill.components.balance = 'creative_dominant';
        }
        else {
            skill.components.balance = 'balanced';
        }
    }
    /**
     * Update usage statistics
     */
    updateUsageStatistics(skill, event) {
        const usage = skill.usage;
        usage.totalUses++;
        if (event.success) {
            usage.successfulUses++;
        }
        else {
            usage.failedUses++;
        }
        // Update recent uses
        usage.recentUses.push(event.timestamp);
        const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000; // Keep last 7 days
        usage.recentUses = usage.recentUses.filter(time => time > cutoff);
        // Update last used
        usage.lastUsed = event.timestamp;
        // Update context usage
        const contextKey = event.context.situation;
        usage.useContexts[contextKey] = (usage.useContexts[contextKey] || 0) + 1;
        // Update success rate trend
        const recentSuccessRate = usage.successfulUses / usage.totalUses;
        usage.successRateTrend.push(recentSuccessRate);
        if (usage.successRateTrend.length > 20) {
            usage.successRateTrend = usage.successRateTrend.slice(-10);
        }
        // Update streak
        this.updateStreak(usage);
    }
    /**
     * Update usage streak
     */
    updateStreak(usage) {
        const now = Date.now();
        const lastUse = usage.lastUsed;
        const oneDay = 24 * 60 * 60 * 1000;
        if (lastUse && now - lastUse < oneDay * 2) { // Within 2 days
            usage.streakDays++;
        }
        else {
            usage.streakDays = 1;
        }
        usage.bestStreak = Math.max(usage.bestStreak, usage.streakDays);
    }
    /**
     * Check for level progression
     */
    checkLevelProgression(skill) {
        let breakthroughs = 0;
        let levelsGained = 0;
        while (skill.proficiency.experience >= skill.proficiency.nextLevelThreshold &&
            skill.proficiency.level < skill.proficiency.potentialMaximum) {
            skill.proficiency.experience -= skill.proficiency.nextLevelThreshold;
            skill.proficiency.level++;
            levelsGained++;
            // Calculate next threshold
            skill.proficiency.nextLevelThreshold = this.calculateLevelThreshold(skill.proficiency.level + 1);
            // Check for breakthrough at milestone levels
            if (skill.proficiency.level % 10 === 0) {
                breakthroughs++;
                skill.metadata.breakthroughCount++;
            }
            // Update mastery bonus
            if (skill.proficiency.level >= 50) {
                skill.proficiency.masteryBonus = Math.min(2.0, skill.proficiency.level / 50);
            }
        }
        return { breakthroughs };
    }
    /**
     * Detect learning plateaus
     */
    detectPlateaus(skill) {
        const config = this.config.plateauDetection;
        const now = Date.now();
        const stagnationPeriod = config.stagnationPeriod;
        // Check if skill has been stagnant
        if (skill.proficiency.lastProgressUpdate < now - stagnationPeriod &&
            skill.usage.totalUses >= config.minimumAttempts) {
            // Determine plateau type and severity
            const plateauType = this.determinePlateauType(skill);
            const severity = this.determinePlateauSeverity(skill);
            // Create or update plateau
            let plateau = this.plateaus.get(skill.type);
            if (!plateau) {
                plateau = {
                    skillType: skill.type,
                    level: skill.proficiency.level,
                    type: plateauType,
                    severity,
                    description: this.generatePlateauDescription(skill, plateauType, severity),
                    causes: this.identifyPlateauCauses(skill),
                    duration: now - skill.proficiency.lastProgressUpdate,
                    estimatedDuration: this.estimatePlateauDuration(skill, plateauType, severity),
                    breakingStrategies: this.generateBreakingStrategies(skill, plateauType),
                    recommendedActions: this.generateRecommendedActions(skill, plateauType),
                    breakoutProgress: 0,
                    lastBreakAttempt: 0
                };
                this.plateaus.set(skill.type, plateau);
            }
            skill.proficiency.plateauLevel = skill.proficiency.level;
        }
    }
    /**
     * Determine plateau type based on skill characteristics
     */
    determinePlateauType(skill) {
        const { components, usage } = skill;
        if (components.knowledge > components.practical && components.knowledge > components.creative) {
            return PlateauType.PRACTICAL;
        }
        else if (components.practical > components.knowledge && components.practical > components.creative) {
            return PlateauType.KNOWLEDGE;
        }
        else if (components.creative > components.knowledge && components.creative > components.practical) {
            return PlateauType.CREATIVE;
        }
        else if (usage.successRateTrend.length > 5 &&
            usage.successRateTrend.slice(-5).every(rate => rate < 0.6)) {
            return PlateauType.TECHNICAL;
        }
        else {
            return PlateauType.MOTIVATIONAL;
        }
    }
    /**
     * Determine plateau severity
     */
    determinePlateauSeverity(skill) {
        const stagnationTime = Date.now() - skill.proficiency.lastProgressUpdate;
        const oneWeek = 7 * 24 * 60 * 60 * 1000;
        if (stagnationTime < oneWeek) {
            return PlateauSeverity.MINOR;
        }
        else if (stagnationTime < oneWeek * 3) {
            return PlateauSeverity.MODERATE;
        }
        else if (stagnationTime < oneWeek * 6) {
            return PlateauSeverity.MAJOR;
        }
        else {
            return PlateauSeverity.SEVERE;
        }
    }
    /**
     * Generate plateau description
     */
    generatePlateauDescription(skill, type, severity) {
        const typeDescriptions = {
            [PlateauType.KNOWLEDGE]: 'theoretical understanding has plateaued',
            [PlateauType.PRACTICAL]: 'practical application has stagnated',
            [PlateauType.CREATIVE]: 'innovative thinking has stalled',
            [PlateauType.MOTIVATIONAL]: 'motivation and interest have waned',
            [PlateauType.TECHNICAL]: 'technical skill ceiling has been reached',
            [PlateauType.PSYCHOLOGICAL]: 'psychological barriers are blocking progress'
        };
        const severityDescriptions = {
            [PlateauSeverity.MINOR]: 'slight slowdown',
            [PlateauSeverity.MODERATE]: 'noticeable difficulty',
            [PlateauSeverity.MAJOR]: 'significant barrier',
            [PlateauSeverity.SEVERE]: 'nearly complete halt'
        };
        return `${skill.name} ${typeDescriptions[type]} - ${severityDescriptions[severity]}`;
    }
    /**
     * Identify plateau causes
     */
    identifyPlateauCauses(skill) {
        const causes = [];
        const { usage, components } = skill;
        // Check for overpractice
        if (usage.recentUses.length > 50) {
            causes.push(PlateauCause.OVERPRACTICE);
        }
        // Check for underchallenge
        if (usage.successRateTrend.length > 5 &&
            usage.successRateTrend.slice(-5).every(rate => rate > 0.9)) {
            causes.push(PlateauCause.UNDERCHALLENGE);
        }
        // Check for component imbalance
        const maxComponent = Math.max(components.knowledge, components.practical, components.creative);
        const minComponent = Math.min(components.knowledge, components.practical, components.creative);
        if (maxComponent - minComponent > 30) {
            causes.push(PlateauCause.LACK_OF_FOUNDATION);
        }
        return causes;
    }
    /**
     * Estimate plateau duration
     */
    estimatePlateauDuration(skill, type, severity) {
        const baseDurations = {
            [PlateauSeverity.MINOR]: 3 * 24 * 60 * 60 * 1000, // 3 days
            [PlateauSeverity.MODERATE]: 7 * 24 * 60 * 60 * 1000, // 1 week
            [PlateauSeverity.MAJOR]: 14 * 24 * 60 * 60 * 1000, // 2 weeks
            [PlateauSeverity.SEVERE]: 30 * 24 * 60 * 60 * 1000 // 1 month
        };
        const typeMultipliers = {
            [PlateauType.KNOWLEDGE]: 1.0,
            [PlateauType.PRACTICAL]: 0.8,
            [PlateauType.CREATIVE]: 1.2,
            [PlateauType.MOTIVATIONAL]: 0.6,
            [PlateauType.TECHNICAL]: 1.5,
            [PlateauType.PSYCHOLOGICAL]: 2.0
        };
        return Math.floor(baseDurations[severity] * typeMultipliers[type]);
    }
    /**
     * Generate breaking strategies (placeholder - would be expanded)
     */
    generateBreakingStrategies(skill, type) {
        // This would be expanded with specific strategies based on plateau type
        return [
            {
                name: 'Varied Practice',
                description: 'Try different approaches and contexts',
                effectiveness: 0.7,
                requirements: ['variety'],
                timeInvestment: 7 * 24 * 60 * 60 * 1000,
                successRate: 0.6
            }
        ];
    }
    /**
     * Generate recommended actions (placeholder - would be expanded)
     */
    generateRecommendedActions(skill, type) {
        const recommendations = {
            [PlateauType.KNOWLEDGE]: ['Study theory', 'Read guides', 'Ask experts'],
            [PlateauType.PRACTICAL]: ['Practice fundamentals', 'Try variations', 'Get feedback'],
            [PlateauType.CREATIVE]: ['Experiment freely', 'Try new combinations', 'Seek inspiration'],
            [PlateauType.MOTIVATIONAL]: ['Take a break', 'Set new goals', 'Find partners'],
            [PlateauType.TECHNICAL]: ['Review technique', 'Get coaching', 'Use better tools'],
            [PlateauType.PSYCHOLOGICAL]: ['Address fears', 'Build confidence', 'Change mindset']
        };
        return recommendations[type] || ['Take a break', 'Try new approach'];
    }
    /**
     * Get current plateaus
     */
    getPlateaus() {
        return Array.from(this.plateaus.values());
    }
    /**
     * Get plateau for specific skill
     */
    getPlateau(skillType) {
        return this.plateaus.get(skillType);
    }
    /**
     * Get recent progress
     */
    getRecentProgress() {
        return [...this.recentProgress];
    }
    /**
     * Generate skill recommendations
     */
    generateRecommendations() {
        this.recommendations = [];
        // Analyze current skill levels and suggest improvements
        const allSkills = this.getAllSkills();
        // Find underdeveloped skills in important categories
        const importantCategories = [SkillCategory.COMBAT, SkillCategory.SURVIVAL, SkillCategory.CRAFTING];
        for (const category of importantCategories) {
            const categorySkills = this.getSkillsByCategory(category);
            const weakestSkill = categorySkills.reduce((weakest, skill) => skill.proficiency.level < weakest.proficiency.level ? skill : weakest);
            if (weakestSkill.proficiency.level < 20) {
                this.recommendations.push({
                    skillType: weakestSkill.type,
                    priority: 1.0 - (weakestSkill.proficiency.level / 20),
                    reason: `Essential ${category} skill needs development`,
                    expectedBenefit: 0.8,
                    prerequisites: weakestSkill.learning.prerequisites,
                    learningPath: this.generateLearningPath(weakestSkill.type)
                });
            }
        }
        // Sort by priority
        this.recommendations.sort((a, b) => b.priority - a.priority);
        return this.recommendations;
    }
    /**
     * Generate learning path for skill
     */
    generateLearningPath(skillType) {
        const skill = this.getSkill(skillType);
        const path = [];
        // Add prerequisites first
        path.push(...skill.learning.prerequisites);
        // Add the skill itself
        path.push(skillType);
        // Add related skills that benefit from this one
        const relatedSkills = this.getRelatedSkills(skillType);
        path.push(...relatedSkills.slice(0, 3)); // Limit to 3 related skills
        return path;
    }
    /**
     * Get related skills that benefit from learning this skill
     */
    getRelatedSkills(skillType) {
        // This would be expanded with a proper synergy system
        const relatedMap = {
            [SkillType.SWORD_COMBAT]: [SkillType.AXE_COMBAT, SkillType.DEFENSE],
            [SkillType.MINING]: [SkillType.PROSPECTING, SkillType.CAVE_NAVIGATION],
            [SkillType.CRAFTING]: [SkillType.WOODWORKING, SkillType.STONEWORKING],
            [SkillType.COOKING]: [SkillType.ALCHEMY, SkillType.FARMING],
            [SkillType.TRADING]: [SkillType.PERSUASION, SkillType.NEGOTIATION]
        };
        return relatedMap[skillType] || [];
    }
    /**
     * Get skill recommendations
     */
    getRecommendations() {
        return [...this.recommendations];
    }
    /**
     * Update adaptive learning rates based on recent performance
     */
    updateAdaptiveLearning() {
        const now = Date.now();
        for (const skill of this.skills.values()) {
            // Calculate recent performance
            const recentUses = skill.usage.recentUses.filter(time => now - time < 7 * 24 * 60 * 60 * 1000);
            if (recentUses.length >= 5) {
                const recentSuccessRate = skill.usage.successfulUses / skill.usage.totalUses;
                const recentEfficiency = this.calculateRecentEfficiency(skill);
                // Adjust adaptive learning rate
                let adjustment = 1.0;
                if (recentSuccessRate > 0.8) {
                    adjustment *= 1.1; // Learning well, can increase rate
                }
                else if (recentSuccessRate < 0.4) {
                    adjustment *= 0.9; // Struggling, decrease rate for better retention
                }
                if (recentEfficiency > 0.8) {
                    adjustment *= 1.05; // Efficient learning
                }
                else if (recentEfficiency < 0.5) {
                    adjustment *= 0.95; // Inefficient learning
                }
                skill.learning.adaptiveRate = Math.max(0.1, Math.min(2.0, skill.learning.learningRate * adjustment));
            }
        }
    }
    /**
     * Calculate recent efficiency for skill
     */
    calculateRecentEfficiency(skill) {
        // Simplified efficiency calculation
        // In a full implementation, this would consider execution time, resource usage, etc.
        const successRate = skill.usage.successfulUses / Math.max(1, skill.usage.totalUses);
        return successRate;
    }
    /**
     * Get system statistics
     */
    getStatistics() {
        const skills = this.getAllSkills();
        const totalSkills = skills.length;
        const averageLevel = skills.reduce((sum, skill) => sum + skill.proficiency.level, 0) / totalSkills;
        const totalExperience = skills.reduce((sum, skill) => sum + skill.proficiency.experience, 0);
        const activePlateaus = this.plateaus.size;
        const recentProgress = this.recentProgress.filter(p => Date.now() - p.timeSpent < 24 * 60 * 60 * 1000).length;
        return {
            totalSkills,
            averageLevel,
            totalExperience,
            activePlateaus,
            recentProgress
        };
    }
    /**
     * Set social state for social-aware skill processing
     */
    setSocialState(socialState) {
        this.socialState = socialState;
    }
    /**
     * Learn from observing other agents
     */
    learnFromObservation(observedAgentId, observedSkill, context) {
        if (!this.socialState) {
            return null;
        }
        // Check relationship with observed agent
        const relationship = this.socialState.relationships.activeRelationships.includes(observedAgentId);
        const trustLevel = this.socialState.relationships.trustLevels[observedAgentId] || 0.5;
        // Higher trust and better relationship = better learning from observation
        const learningMultiplier = 0.3 + (trustLevel * 0.4) + (relationship ? 0.3 : 0);
        // Create observation event
        const observationEvent = {
            id: `observation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            skillType: observedSkill,
            amount: Math.floor(10 * learningMultiplier),
            source: ExperienceSource.OBSERVATION,
            success: true,
            quality: 0.6 + (trustLevel * 0.3),
            difficulty: 0.5,
            impact: 0.7, // Observation has moderate impact
            context: {
                ...context,
                situation: 'observing_agent',
                location: context.location || { x: 0, y: 0, z: 0 },
                participants: [observedAgentId],
                tools: context.tools || [],
                difficulty: 0.5,
                timePressure: 0.3,
                riskLevel: 0.1,
                socialContext: 'cooperative'
            },
            synergyBonus: 0,
            personalityBonus: 0,
            contextBonus: learningMultiplier * 0.2,
            plateauModifier: 0,
            componentGains: {
                knowledge: Math.floor(8 * learningMultiplier),
                practical: Math.floor(6 * learningMultiplier),
                creative: Math.floor(4 * learningMultiplier)
            },
            timestamp: Date.now()
        };
        // Record observation
        if (!this.socialObservations.has(observedAgentId)) {
            this.socialObservations.set(observedAgentId, []);
        }
        this.socialObservations.get(observedAgentId).push({
            skillType: observedSkill,
            timestamp: Date.now(),
            quality: observationEvent.quality,
            context
        });
        // Process the experience
        return this.updateSkill(observedSkill, observationEvent);
    }
    /**
     * Teach a skill to another agent
     */
    teachSkill(skillType, studentAgentId, teachingContext, teachingQuality = 0.7) {
        const skill = this.getSkill(skillType);
        if (skill.proficiency.level < 10) {
            return null; // Need sufficient skill level to teach
        }
        if (!this.socialState) {
            return null;
        }
        // Check relationship with student
        const relationship = this.socialState.relationships.activeRelationships.includes(studentAgentId);
        const trustLevel = this.socialState.relationships.trustLevels[studentAgentId] || 0.5;
        // Teaching improves teacher's understanding (learning by teaching)
        const teachingBonus = 0.2 + (teachingQuality * 0.3);
        // Create teaching experience event
        const teachingEvent = {
            id: `teaching_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            skillType,
            amount: Math.floor(15 * teachingBonus),
            source: ExperienceSource.TEACHING,
            success: true,
            quality: teachingQuality,
            difficulty: 0.3, // Teaching is generally easier than performing
            impact: 0.8, // Teaching has high impact on learning
            context: {
                situation: 'teaching_agent',
                location: teachingContext?.location || { x: 0, y: 0, z: 0 },
                participants: [studentAgentId],
                tools: teachingContext?.tools || [],
                difficulty: 0.3,
                timePressure: 0.2,
                riskLevel: 0.1,
                socialContext: 'teaching'
            },
            synergyBonus: 0.1,
            personalityBonus: this.personality.getProfile().traits?.agreeableness * 0.2 || 0.1,
            contextBonus: teachingBonus * 0.3,
            plateauModifier: 0,
            componentGains: {
                knowledge: Math.floor(12 * teachingBonus),
                practical: Math.floor(5 * teachingBonus),
                creative: Math.floor(8 * teachingBonus)
            },
            timestamp: Date.now()
        };
        // Record teaching
        const currentStudents = this.teachingHistory.get(skillType) || 0;
        this.teachingHistory.set(skillType, currentStudents + 1);
        // Update skill metadata
        skill.metadata.taughtTo.push(studentAgentId);
        // Process the experience
        return this.updateSkill(skillType, teachingEvent);
    }
    /**
     * Collaboratively execute a skill with other agents
     */
    collaborativeSkillExecution(skillType, collaborators, context) {
        const skill = this.getSkill(skillType);
        if (!this.socialState) {
            return null;
        }
        // Calculate collaboration effectiveness based on relationships
        let totalRelationshipStrength = 0;
        let validCollaborators = 0;
        collaborators.forEach(collaboratorId => {
            if (this.socialState.relationships.activeRelationships.includes(collaboratorId)) {
                const trustLevel = this.socialState.relationships.trustLevels[collaboratorId] || 0.5;
                const friendshipLevel = this.socialState.relationships.friendshipLevels[collaboratorId] || 0.5;
                totalRelationshipStrength += (trustLevel + friendshipLevel) / 2;
                validCollaborators++;
            }
        });
        const avgRelationshipStrength = validCollaborators > 0 ? totalRelationshipStrength / validCollaborators : 0.1;
        // Collaboration bonus based on relationship strength and team size
        const collaborationBonus = 0.3 + (avgRelationshipStrength * 0.4) + (validCollaborators * 0.1);
        // Create collaborative experience event
        const collaborationEvent = {
            id: `collaboration_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            skillType,
            amount: Math.floor(20 * collaborationBonus),
            source: ExperienceSource.SOCIAL, // Use SOCIAL instead of COLLABORATION
            success: true,
            quality: 0.7 + (avgRelationshipStrength * 0.2),
            difficulty: 0.4, // Collaboration often reduces difficulty
            impact: 0.9, // Collaboration has high impact
            context: {
                ...context,
                situation: 'collaborative_execution',
                location: context.location || { x: 0, y: 0, z: 0 },
                participants: collaborators,
                tools: context.tools || [],
                difficulty: 0.4,
                timePressure: 0.3,
                riskLevel: 0.2,
                socialContext: 'cooperative'
            },
            synergyBonus: 0.2,
            personalityBonus: this.personality.getProfile().traits?.agreeableness * 0.3 || 0.15,
            contextBonus: collaborationBonus * 0.4,
            plateauModifier: 0,
            componentGains: {
                knowledge: Math.floor(10 * collaborationBonus),
                practical: Math.floor(15 * collaborationBonus),
                creative: Math.floor(8 * collaborationBonus)
            },
            timestamp: Date.now()
        };
        // Process the experience
        return this.updateSkill(skillType, collaborationEvent);
    }
    /**
     * Get social skill reputation
     */
    getSocialSkillReputation(skillType) {
        const skill = this.getSkill(skillType);
        // Calculate reputation based on skill level, teaching history, and social feedback
        let reputation = skill.proficiency.level / 100; // Base from skill level
        const teachings = this.teachingHistory.get(skillType) || 0;
        reputation += Math.min(0.3, teachings * 0.05); // Teaching improves reputation
        // Social feedback from relationships
        if (this.socialState) {
            const avgTrust = this.socialState.relationships.activeRelationships.reduce((sum, agentId) => {
                return sum + (this.socialState.relationships.trustLevels[agentId] || 0.5);
            }, 0) / Math.max(1, this.socialState.relationships.activeRelationships.length);
            reputation += (avgTrust - 0.5) * 0.4; // Trust affects reputation
        }
        // Count observations and endorsements
        let observations = 0;
        let endorsements = 0;
        this.socialObservations.forEach(agentObservations => {
            agentObservations.forEach(obs => {
                if (obs.skillType === skillType) {
                    observations++;
                    if (obs.quality > 0.8) {
                        endorsements++;
                    }
                }
            });
        });
        return {
            reputation: Math.max(0, Math.min(1, reputation)),
            endorsements,
            teachings,
            observations
        };
    }
    /**
     * Identify social skill gaps
     */
    identifySocialSkillGaps() {
        if (!this.socialState) {
            return [];
        }
        const gaps = [];
        const allSkills = this.getAllSkills();
        // Analyze social skills importance based on current relationships and activities
        allSkills.forEach(skill => {
            let socialImportance = 0.5; // Base importance
            // Increase importance for social categories
            if (skill.category === SkillCategory.SOCIAL) {
                socialImportance = 0.8;
            }
            // Adjust based on relationship needs
            if (this.socialState.relationships.activeRelationships.length > 3) {
                socialImportance += 0.2; // More relationships = higher social skill importance
            }
            // Adjust based on group activities
            if (this.socialState.socialContext.groupDynamics?.cohesion > 0.6) {
                socialImportance += 0.1;
            }
            // Calculate gap based on skill level vs social importance
            const gap = Math.max(0, socialImportance - (skill.proficiency.level / 100));
            if (gap > 0.2) { // Only include significant gaps
                gaps.push({
                    skillType: skill.type,
                    gap,
                    recommendation: this.generateSocialSkillRecommendation(skill, gap),
                    priority: gap * socialImportance
                });
            }
        });
        // Sort by priority
        return gaps.sort((a, b) => b.priority - a.priority);
    }
    /**
     * Generate social skill recommendation
     */
    generateSocialSkillRecommendation(skill, gap) {
        const recommendations = [
            `Practice ${skill.name} through group activities`,
            `Observe skilled agents performing ${skill.name}`,
            `Find a mentor to improve ${skill.name}`,
            `Teach ${skill.name} to others to deepen understanding`,
            `Collaborate on projects requiring ${skill.name}`
        ];
        return recommendations[Math.floor(Math.random() * recommendations.length)];
    }
    /**
     * Get social learning insights
     */
    getSocialLearningInsights() {
        const mostObservedAgents = Array.from(this.socialObservations.entries())
            .sort((a, b) => b[1].length - a[1].length)
            .slice(0, 5)
            .map(entry => entry[0]);
        const mostTaughtSkills = Array.from(this.teachingHistory.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(entry => entry[0]);
        // Calculate collaboration effectiveness
        let collaborationEffectiveness = 0.5;
        let collaborationCount = 0;
        this.recentProgress.forEach(progress => {
            if (progress.timeSpent > 0) {
                // Check if this was from collaboration (simplified check)
                const socialProgress = this.recentProgress.filter(p => Math.abs(p.timeSpent - progress.timeSpent) < 1000).length;
                if (socialProgress > 1) {
                    collaborationEffectiveness += 0.1;
                    collaborationCount++;
                }
            }
        });
        collaborationEffectiveness = Math.min(1.0, collaborationEffectiveness);
        // Calculate social learning rate
        const socialLearningRate = this.recentProgress.filter(progress => progress.experienceGained > 10).length / Math.max(1, this.recentProgress.length);
        return {
            mostObservedAgents,
            mostTaughtSkills,
            collaborationEffectiveness,
            socialLearningRate
        };
    }
}
