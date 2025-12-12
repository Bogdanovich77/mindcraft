/**
 * Skill Type Definitions and Interfaces
 *
 * Comprehensive type system for dynamic skill progression with experience tracking,
 * proficiency metrics, learning characteristics, and skill synergies.
 */
export interface PersonalityTraits {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
    riskTolerance: number;
    explorationDrive: number;
    socialTendency: number;
    buildingCreativity: number;
    combatAggression: number;
}
export declare enum SkillCategory {
    COMBAT = "combat",
    CRAFTING = "crafting",
    EXPLORATION = "exploration",
    SOCIAL = "social",
    BUILDING = "building",
    MINING = "mining",
    FARMING = "farming",
    TRADING = "trading",
    SURVIVAL = "survival",
    MAGIC = "magic",
    TOOL_USE = "tool_use",
    NAVIGATION = "navigation"
}
export declare enum SkillType {
    SWORD_COMBAT = "sword_combat",
    AXE_COMBAT = "axe_combat",
    ARCHERY = "archery",
    CROSSBOW = "crossbow",
    DEFENSE = "defense",
    HEAVY_ARMOR = "heavy_armor",
    LIGHT_ARMOR = "light_armor",
    SHIELD_USE = "shield_use",
    CRAFTING = "crafting",
    WOODWORKING = "woodworking",
    STONEWORKING = "stoneworking",
    SMITHING = "smithing",
    COOKING = "cooking",
    ALCHEMY = "alchemy",
    ENCHANTING = "enchanting",
    TAILORING = "tailoring",
    JEWELRY = "jewelry",
    MAPPING = "mapping",
    NAVIGATION = "navigation",
    SWIMMING = "swimming",
    DIVING = "diving",
    CLIMBING = "climbing",
    TRACKING = "tracking",
    STEALTH = "stealth",
    TRADING = "trading",
    PERSUASION = "persuasion",
    LEADERSHIP = "leadership",
    TEAMWORK = "teamwork",
    NEGOTIATION = "negotiation",
    TEACHING = "teaching",
    CONSTRUCTION = "construction",
    ARCHITECTURE = "architecture",
    DECORATION = "decoration",
    LANDSCAPING = "landscaping",
    REDSTONE = "redstone",
    MINING = "mining",
    PROSPECTING = "prospecting",
    EXPLOSIVES = "explosives",
    CAVE_NAVIGATION = "cave_navigation",
    FARMING = "farming",
    CROP_FARMING = "crop_farming",
    ANIMAL_HUSBANDRY = "animal_husbandry",
    BREEDING = "breeding",
    COMPOSTING = "composting",
    FIRE_STARTING = "fire_starting",
    SHELTER_BUILDING = "shelter_building",
    FORAGING = "foraging",
    HUNTING = "hunting",
    FIRST_AID = "first_aid",
    MAGIC = "magic",
    SPELLCASTING = "spellcasting",
    POTION_MAKING = "potion_making",
    RITUAL_MAGIC = "ritual_magic",
    PICKAXE_USE = "pickaxe_use",
    SHOVEL_USE = "shovel_use",
    HOE_USE = "hoe_use",
    AXE_USE = "axe_use",
    FISHING = "fishing",
    WAYFINDING = "wayfinding",
    LANDMARK_RECOGNITION = "landmark_recognition",
    COMPASS_USE = "compass_use"
}
export interface Skill {
    id: string;
    type: SkillType;
    category: SkillCategory;
    name: string;
    description: string;
    proficiency: ProficiencyMetrics;
    components: SkillComponents;
    learning: LearningCharacteristics;
    usage: UsageStatistics;
    metadata: SkillMetadata;
}
export interface ProficiencyMetrics {
    level: number;
    experience: number;
    nextLevelThreshold: number;
    masteryBonus: number;
    potentialMaximum: number;
    growthRate: number;
    plateauLevel: number;
    lastProgressUpdate: number;
}
export interface SkillComponents {
    knowledge: number;
    practical: number;
    creative: number;
    knowledgeGrowthRate: number;
    practicalGrowthRate: number;
    creativeGrowthRate: number;
    balance: 'knowledge_dominant' | 'practical_dominant' | 'creative_dominant' | 'balanced';
}
export interface LearningCharacteristics {
    learningRate: number;
    retentionRate: number;
    transferAbility: number;
    practiceEffectiveness: number;
    difficulty: number;
    prerequisites: SkillType[];
    learningMethods: LearningMethod[];
    personalityModifiers: PersonalityModifiers;
    adaptiveRate: number;
    preferredContext: string[];
}
export interface PersonalityModifiers {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
    riskTolerance: number;
    explorationDrive: number;
}
export interface UsageStatistics {
    totalUses: number;
    successfulUses: number;
    failedUses: number;
    recentUses: number[];
    averageExecutionTime: number;
    lastUsed: number;
    streakDays: number;
    bestStreak: number;
    useContexts: Record<string, number>;
    successRateTrend: number[];
    efficiencyTrend: number[];
}
export interface SkillMetadata {
    createdAt: number;
    lastModified: number;
    version: string;
    isCoreSkill: boolean;
    isSpecialized: boolean;
    parentSkill?: SkillType;
    childSkills: SkillType[];
    totalLearningTime: number;
    breakthroughCount: number;
    plateausBroken: number;
    taughtBy?: string;
    taughtTo: string[];
    sharedExperience: number;
}
export interface LearningMethod {
    type: 'practice' | 'study' | 'observation' | 'teaching' | 'experimentation';
    effectiveness: number;
    context: string;
    requirements: string[];
}
export interface ExperienceEvent {
    id: string;
    skillType: SkillType;
    amount: number;
    source: ExperienceSource;
    context: ExperienceContext;
    timestamp: number;
    quality: number;
    difficulty: number;
    success: boolean;
    impact: number;
    componentGains: {
        knowledge: number;
        practical: number;
        creative: number;
    };
    synergyBonus: number;
    personalityBonus: number;
    contextBonus: number;
    plateauModifier: number;
}
export declare enum ExperienceSource {
    PRACTICE = "practice",
    SUCCESS = "success",
    FAILURE = "failure",
    TEACHING = "teaching",
    OBSERVATION = "observation",
    EXPERIMENTATION = "experimentation",
    SOCIAL = "social",
    BREAKTHROUGH = "breakthrough"
}
export interface ExperienceContext {
    situation: string;
    location: {
        x: number;
        y: number;
        z: number;
    };
    participants: string[];
    tools: string[];
    difficulty: number;
    timePressure: number;
    riskLevel: number;
    socialContext: 'solo' | 'cooperative' | 'competitive' | 'teaching';
}
export interface SkillSynergy {
    fromSkill: SkillType;
    toSkill: SkillType;
    synergyType: SynergyType;
    strength: number;
    transferMechanism: TransferMechanism;
    learningBonus: number;
    experienceBonus: number;
    thresholdReduction: number;
    requiredLevel: number;
    context: string[];
}
export declare enum SynergyType {
    DIRECT = "direct",// Direct skill transfer
    ANALOGICAL = "analogical",// Similar principles
    CREATIVE = "creative",// Creative application
    TOOL_BASED = "tool_based",// Shared tool knowledge
    KNOWLEDGE_BASED = "knowledge_based",// Shared theoretical knowledge
    MOTOR_BASED = "motor_based"
}
export declare enum TransferMechanism {
    IMMEDIATE = "immediate",// Immediate benefit
    PRACTICE_REQUIRED = "practice_required",// Requires practice to unlock
    THRESHOLD_BASED = "threshold_based",// Unlocks at skill threshold
    CONTEXT_DEPENDENT = "context_dependent",// Only in specific contexts
    CONSCIOUS_APPLICATION = "conscious_application"
}
export interface SkillMilestone {
    id: string;
    skillType: SkillType;
    level: number;
    name: string;
    description: string;
    type: MilestoneType;
    tier: MilestoneTier;
    requirements: MilestoneRequirement[];
    rewards: MilestoneReward[];
    unlocks: string[];
    achievedAt?: number;
    progress: number;
}
export declare enum MilestoneType {
    ABILITY_UNLOCK = "ability_unlock",
    SPECIALIZATION = "specialization",
    MASTERY = "mastery",
    BREAKTHROUGH = "breakthrough",
    TEACHING = "teaching",
    INNOVATION = "innovation"
}
export declare enum MilestoneTier {
    NOVICE = "novice",
    APPRENTICE = "apprentice",
    JOURNEYMAN = "journeyman",
    EXPERT = "expert",
    MASTER = "master",
    GRANDMASTER = "grandmaster"
}
export interface MilestoneRequirement {
    type: 'level' | 'skill' | 'experience' | 'practice' | 'success_rate';
    target: string | number;
    value: number;
    description: string;
}
export interface MilestoneReward {
    type: 'ability' | 'bonus' | 'synergy' | 'specialization' | 'title';
    name: string;
    value: number | string;
    description: string;
}
export interface SkillSpecialization {
    id: string;
    baseSkill: SkillType;
    name: string;
    description: string;
    focusArea: string;
    modifiers: SpecializationModifiers;
    requirements: SpecializationRequirement[];
    unlocked: boolean;
    unlockedAt?: number;
    progress: number;
    activeEffects: SpecializationEffect[];
}
export interface SpecializationModifiers {
    skillBonus: number;
    learningBonus: number;
    experienceBonus: number;
    synergyBonus: number;
    penalties: Record<string, number>;
}
export interface SpecializationRequirement {
    type: 'skill_level' | 'milestone' | 'practice' | 'context';
    skill: SkillType;
    value: number;
    description: string;
}
export interface SpecializationEffect {
    name: string;
    type: 'passive' | 'active' | 'conditional';
    description: string;
    value: number;
    condition?: string;
}
export interface LearningPlateau {
    skillType: SkillType;
    level: number;
    type: PlateauType;
    severity: PlateauSeverity;
    description: string;
    causes: PlateauCause[];
    duration: number;
    estimatedDuration: number;
    breakingStrategies: PlateauBreakingStrategy[];
    recommendedActions: string[];
    breakoutProgress: number;
    lastBreakAttempt: number;
}
export declare enum PlateauType {
    KNOWLEDGE = "knowledge",// Theoretical understanding plateau
    PRACTICAL = "practical",// Practical application plateau
    CREATIVE = "creative",// Creative innovation plateau
    MOTIVATIONAL = "motivational",// Motivation/interest plateau
    TECHNICAL = "technical",// Technical skill ceiling
    PSYCHOLOGICAL = "psychological"
}
export declare enum PlateauSeverity {
    MINOR = "minor",// Slight slowdown
    MODERATE = "moderate",// Noticeable difficulty
    MAJOR = "major",// Significant barrier
    SEVERE = "severe"
}
export declare enum PlateauCause {
    OVERPRACTICE = "overpractice",
    UNDERCHALLENGE = "underchallenge",
    POOR_TECHNIQUE = "poor_technique",
    LACK_OF_FOUNDATION = "lack_of_foundation",
    MOTIVATION_LOSS = "motivation_loss",
    BURNOUT = "burnout",
    INEFFICIENT_METHODS = "inefficient_methods"
}
export interface PlateauBreakingStrategy {
    name: string;
    description: string;
    effectiveness: number;
    requirements: string[];
    timeInvestment: number;
    successRate: number;
}
export interface SkillsSystemConfig {
    baseLearningRate: number;
    personalityInfluence: number;
    synergyBonusMultiplier: number;
    experienceFormula: ExperienceFormula;
    levelThresholds: LevelThresholdConfig;
    plateauDetection: PlateauDetectionConfig;
    maxTrackedSkills: number;
    experienceHistorySize: number;
    updateInterval: number;
    enableLegacyBridge: boolean;
    enableGoalIntegration: boolean;
    enablePurposeIntegration: boolean;
}
export interface ExperienceFormula {
    baseMultiplier: number;
    difficultyExponent: number;
    successBonus: number;
    failurePenalty: number;
    synergyExponent: number;
    personalityExponent: number;
    plateauFactor: number;
}
export interface LevelThresholdConfig {
    baseThreshold: number;
    growthExponent: number;
    masteryMultiplier: number;
    specializationBonus: number;
}
export interface PlateauDetectionConfig {
    stagnationPeriod: number;
    minimumAttempts: number;
    sensitivityThreshold: number;
    autoBreakAttempts: boolean;
}
export type SkillProgress = {
    skillType: SkillType;
    previousLevel: number;
    currentLevel: number;
    experienceGained: number;
    timeSpent: number;
    breakthroughs: number;
};
export type SkillRecommendation = {
    skillType: SkillType;
    priority: number;
    reason: string;
    expectedBenefit: number;
    prerequisites: SkillType[];
    learningPath: SkillType[];
};
export type SkillComparison = {
    skill1: SkillType;
    skill2: SkillType;
    similarity: number;
    transferPotential: number;
    recommendedOrder: SkillType[];
};
export type LearningSession = {
    id: string;
    skillType: SkillType;
    startTime: number;
    endTime?: number;
    duration: number;
    experienceGained: number;
    methods: LearningMethod[];
    context: ExperienceContext;
    outcomes: string[];
    insights: string[];
};
//# sourceMappingURL=skill_types.d.ts.map