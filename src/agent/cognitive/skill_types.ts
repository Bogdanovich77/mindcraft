/**
 * Skill Type Definitions and Interfaces
 *
 * Comprehensive type system for dynamic skill progression with experience tracking,
 * proficiency metrics, learning characteristics, and skill synergies.
 */

// Re-export PersonalityTraits for use in this file
export interface PersonalityTraits {
  openness: number;        // Big Five traits
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
  riskTolerance: number;   // Gaming-specific traits
  explorationDrive: number;
  socialTendency: number;
  buildingCreativity: number;
  combatAggression: number;
}

// ============================================================================
// SKILL CATEGORIES AND TYPES
// ============================================================================

export enum SkillCategory {
  COMBAT = 'combat',
  CRAFTING = 'crafting',
  EXPLORATION = 'exploration',
  SOCIAL = 'social',
  BUILDING = 'building',
  MINING = 'mining',
  FARMING = 'farming',
  TRADING = 'trading',
  SURVIVAL = 'survival',
  MAGIC = 'magic',
  TOOL_USE = 'tool_use',
  NAVIGATION = 'navigation'
}

export enum SkillType {
  // Combat
  SWORD_COMBAT = 'sword_combat',
  AXE_COMBAT = 'axe_combat',
  ARCHERY = 'archery',
  CROSSBOW = 'crossbow',
  DEFENSE = 'defense',
  HEAVY_ARMOR = 'heavy_armor',
  LIGHT_ARMOR = 'light_armor',
  SHIELD_USE = 'shield_use',
  
  // Crafting
  CRAFTING = 'crafting',
  WOODWORKING = 'woodworking',
  STONEWORKING = 'stoneworking',
  SMITHING = 'smithing',
  COOKING = 'cooking',
  ALCHEMY = 'alchemy',
  ENCHANTING = 'enchanting',
  TAILORING = 'tailoring',
  JEWELRY = 'jewelry',
  
  // Exploration
  MAPPING = 'mapping',
  NAVIGATION = 'navigation',
  SWIMMING = 'swimming',
  DIVING = 'diving',
  CLIMBING = 'climbing',
  TRACKING = 'tracking',
  STEALTH = 'stealth',
  
  // Social
  TRADING = 'trading',
  PERSUASION = 'persuasion',
  LEADERSHIP = 'leadership',
  TEAMWORK = 'teamwork',
  NEGOTIATION = 'negotiation',
  TEACHING = 'teaching',
  
  // Building
  CONSTRUCTION = 'construction',
  ARCHITECTURE = 'architecture',
  DECORATION = 'decoration',
  LANDSCAPING = 'landscaping',
  REDSTONE = 'redstone',
  
  // Mining
  MINING = 'mining',
  PROSPECTING = 'prospecting',
  EXPLOSIVES = 'explosives',
  CAVE_NAVIGATION = 'cave_navigation',
  
  // Farming
  FARMING = 'farming',
  CROP_FARMING = 'crop_farming',
  ANIMAL_HUSBANDRY = 'animal_husbandry',
  BREEDING = 'breeding',
  COMPOSTING = 'composting',
  
  // Survival
  FIRE_STARTING = 'fire_starting',
  SHELTER_BUILDING = 'shelter_building',
  FORAGING = 'foraging',
  HUNTING = 'hunting',
  FIRST_AID = 'first_aid',
  
  // Magic
  MAGIC = 'magic',
  SPELLCASTING = 'spellcasting',
  POTION_MAKING = 'potion_making',
  RITUAL_MAGIC = 'ritual_magic',
  
  // Tool Use
  PICKAXE_USE = 'pickaxe_use',
  SHOVEL_USE = 'shovel_use',
  HOE_USE = 'hoe_use',
  AXE_USE = 'axe_use',
  FISHING = 'fishing',
  
  // Navigation
  WAYFINDING = 'wayfinding',
  LANDMARK_RECOGNITION = 'landmark_recognition',
  COMPASS_USE = 'compass_use'
}

// ============================================================================
// CORE SKILL INTERFACES
// ============================================================================

export interface Skill {
  id: string;
  type: SkillType;
  category: SkillCategory;
  name: string;
  description: string;
  
  // Proficiency metrics
  proficiency: ProficiencyMetrics;
  
  // Component breakdown
  components: SkillComponents;
  
  // Learning characteristics
  learning: LearningCharacteristics;
  
  // Usage statistics
  usage: UsageStatistics;
  
  // Skill metadata
  metadata: SkillMetadata;
}

export interface ProficiencyMetrics {
  level: number;                    // 0-100 skill level
  experience: number;               // Total experience points
  nextLevelThreshold: number;       // XP needed for next level
  masteryBonus: number;             // Bonus from mastery effects
  potentialMaximum: number;         // Maximum potential level
  growthRate: number;               // Current growth rate multiplier
  plateauLevel: number;             // Current plateau (if any)
  lastProgressUpdate: number;       // Timestamp of last progress
}

export interface SkillComponents {
  knowledge: number;    // Theoretical understanding (0-100)
  practical: number;    // Hands-on capability (0-100)
  creative: number;     // Innovation and adaptation (0-100)
  
  // Component growth rates
  knowledgeGrowthRate: number;
  practicalGrowthRate: number;
  creativeGrowthRate: number;
  
  // Component balance
  balance: 'knowledge_dominant' | 'practical_dominant' | 'creative_dominant' | 'balanced';
}

export interface LearningCharacteristics {
  learningRate: number;           // Base learning speed
  retentionRate: number;          // How well skill is retained
  transferAbility: number;        // Ability to transfer to other skills
  practiceEffectiveness: number;  // How much practice helps
  difficulty: number;             // Inherent difficulty (0-1)
  prerequisites: SkillType[];     // Required skills
  learningMethods: LearningMethod[]; // Effective learning methods
  
  // Personality influences
  personalityModifiers: PersonalityModifiers;
  
  // Adaptive learning
  adaptiveRate: number;           // Current adaptive learning rate
  preferredContext: string[];     // Preferred learning contexts
}

export interface PersonalityModifiers {
  openness: number;        // Affects creative component
  conscientiousness: number; // Affects knowledge retention
  extraversion: number;     // Affects social learning
  agreeableness: number;   // Affects cooperative learning
  neuroticism: number;     // Affects stress learning
  riskTolerance: number;   // Affects difficult skill attempts
  explorationDrive: number; // Affects discovery learning
}

export interface UsageStatistics {
  totalUses: number;
  successfulUses: number;
  failedUses: number;
  recentUses: number[];          // Timestamps of recent uses
  averageExecutionTime: number;
  lastUsed: number;
  streakDays: number;            // Current usage streak
  bestStreak: number;            // Best historical streak
  
  // Context usage
  useContexts: Record<string, number>; // Usage in different contexts
  
  // Performance trends
  successRateTrend: number[];    // Recent success rate trend
  efficiencyTrend: number[];     // Recent efficiency trend
}

export interface SkillMetadata {
  createdAt: number;
  lastModified: number;
  version: string;
  
  // Skill characteristics
  isCoreSkill: boolean;          // Fundamental skill
  isSpecialized: boolean;        // Specialized variant
  parentSkill?: SkillType;       // Parent skill if specialized
  childSkills: SkillType[];      // Derived skills
  
  // Learning history
  totalLearningTime: number;     // Total time spent learning
  breakthroughCount: number;     // Number of breakthrough moments
  plateausBroken: number;        // Number of plateaus overcome
  
  // Social aspects
  taughtBy?: string;             // Who taught this skill
  taughtTo: string[];            // Who this skill was taught to
  sharedExperience: number;      // Experience gained socially
}

// ============================================================================
// LEARNING AND EXPERIENCE INTERFACES
// ============================================================================

export interface LearningMethod {
  type: 'practice' | 'study' | 'observation' | 'teaching' | 'experimentation';
  effectiveness: number;         // 0-1 effectiveness for this skill
  context: string;              // Learning context
  requirements: string[];        // Required conditions
}

export interface ExperienceEvent {
  id: string;
  skillType: SkillType;
  amount: number;
  source: ExperienceSource;
  context: ExperienceContext;
  timestamp: number;
  
  // Experience characteristics
  quality: number;               // Quality of experience (0-1)
  difficulty: number;            // Difficulty of task (0-1)
  success: boolean;              // Whether the action was successful
  impact: number;                // Overall impact on learning
  
  // Component breakdown
  componentGains: {
    knowledge: number;
    practical: number;
    creative: number;
  };
  
  // Learning factors
  synergyBonus: number;          // Bonus from related skills
  personalityBonus: number;      // Bonus from personality traits
  contextBonus: number;          // Bonus from learning context
  plateauModifier: number;       // Modifier due to plateaus
}

export enum ExperienceSource {
  PRACTICE = 'practice',
  SUCCESS = 'success',
  FAILURE = 'failure',
  TEACHING = 'teaching',
  OBSERVATION = 'observation',
  EXPERIMENTATION = 'experimentation',
  SOCIAL = 'social',
  BREAKTHROUGH = 'breakthrough'
}

export interface ExperienceContext {
  situation: string;
  location: { x: number; y: number; z: number };
  participants: string[];
  tools: string[];
  difficulty: number;
  timePressure: number;
  riskLevel: number;
  socialContext: 'solo' | 'cooperative' | 'competitive' | 'teaching';
}

// ============================================================================
// SKILL SYNERGY INTERFACES
// ============================================================================

export interface SkillSynergy {
  fromSkill: SkillType;
  toSkill: SkillType;
  synergyType: SynergyType;
  strength: number;              // 0-1 strength of synergy
  transferMechanism: TransferMechanism;
  
  // Learning effects
  learningBonus: number;         // Bonus to learning rate
  experienceBonus: number;       // Bonus to experience gain
  thresholdReduction: number;    // Reduction in difficulty thresholds
  
  // Conditions
  requiredLevel: number;         // Minimum level in fromSkill
  context: string[];            // Contexts where synergy applies
}

export enum SynergyType {
  DIRECT = 'direct',             // Direct skill transfer
  ANALOGICAL = 'analogical',     // Similar principles
  CREATIVE = 'creative',         // Creative application
  TOOL_BASED = 'tool_based',     // Shared tool knowledge
  KNOWLEDGE_BASED = 'knowledge_based', // Shared theoretical knowledge
  MOTOR_BASED = 'motor_based'    // Shared motor patterns
}

export enum TransferMechanism {
  IMMEDIATE = 'immediate',       // Immediate benefit
  PRACTICE_REQUIRED = 'practice_required', // Requires practice to unlock
  THRESHOLD_BASED = 'threshold_based',     // Unlocks at skill threshold
  CONTEXT_DEPENDENT = 'context_dependent', // Only in specific contexts
  CONSCIOUS_APPLICATION = 'conscious_application' // Requires conscious effort
}

// ============================================================================
// MILESTONE AND SPECIALIZATION INTERFACES
// ============================================================================

export interface SkillMilestone {
  id: string;
  skillType: SkillType;
  level: number;                 // Required level
  name: string;
  description: string;
  
  // Milestone characteristics
  type: MilestoneType;
  tier: MilestoneTier;
  requirements: MilestoneRequirement[];
  
  // Rewards and unlocks
  rewards: MilestoneReward[];
  unlocks: string[];            // New abilities or specializations
  
  // Achievement data
  achievedAt?: number;
  progress: number;              // Progress toward milestone (0-1)
}

export enum MilestoneType {
  ABILITY_UNLOCK = 'ability_unlock',
  SPECIALIZATION = 'specialization',
  MASTERY = 'mastery',
  BREAKTHROUGH = 'breakthrough',
  TEACHING = 'teaching',
  INNOVATION = 'innovation'
}

export enum MilestoneTier {
  NOVICE = 'novice',
  APPRENTICE = 'apprentice',
  JOURNEYMAN = 'journeyman',
  EXPERT = 'expert',
  MASTER = 'master',
  GRANDMASTER = 'grandmaster'
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
  
  // Specialization characteristics
  focusArea: string;
  modifiers: SpecializationModifiers;
  requirements: SpecializationRequirement[];
  
  // Progress
  unlocked: boolean;
  unlockedAt?: number;
  progress: number;
  
  // Effects
  activeEffects: SpecializationEffect[];
}

export interface SpecializationModifiers {
  skillBonus: number;            // Direct skill bonus
  learningBonus: number;         // Learning rate bonus
  experienceBonus: number;       // Experience gain bonus
  synergyBonus: number;          // Enhanced synergies
  
  // Trade-offs
  penalties: Record<string, number>; // Skill penalties for focus
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

// ============================================================================
// LEARNING PLATEAU INTERFACES
// ============================================================================

export interface LearningPlateau {
  skillType: SkillType;
  level: number;                 // Plateau level
  type: PlateauType;
  severity: PlateauSeverity;
  
  // Plateau characteristics
  description: string;
  causes: PlateauCause[];
  duration: number;              // How long plateau has existed
  estimatedDuration: number;     // Estimated time to break
  
  // Breaking strategies
  breakingStrategies: PlateauBreakingStrategy[];
  recommendedActions: string[];
  
  // Progress tracking
  breakoutProgress: number;      // Progress toward breaking plateau
  lastBreakAttempt: number;
}

export enum PlateauType {
  KNOWLEDGE = 'knowledge',       // Theoretical understanding plateau
  PRACTICAL = 'practical',       // Practical application plateau
  CREATIVE = 'creative',         // Creative innovation plateau
  MOTIVATIONAL = 'motivational', // Motivation/interest plateau
  TECHNICAL = 'technical',       // Technical skill ceiling
  PSYCHOLOGICAL = 'psychological' // Psychological barrier
}

export enum PlateauSeverity {
  MINOR = 'minor',               // Slight slowdown
  MODERATE = 'moderate',         // Noticeable difficulty
  MAJOR = 'major',               // Significant barrier
  SEVERE = 'severe'              // Nearly complete halt
}

export enum PlateauCause {
  OVERPRACTICE = 'overpractice',
  UNDERCHALLENGE = 'underchallenge',
  POOR_TECHNIQUE = 'poor_technique',
  LACK_OF_FOUNDATION = 'lack_of_foundation',
  MOTIVATION_LOSS = 'motivation_loss',
  BURNOUT = 'burnout',
  INEFFICIENT_METHODS = 'inefficient_methods'
}

export interface PlateauBreakingStrategy {
  name: string;
  description: string;
  effectiveness: number;         // 0-1 effectiveness
  requirements: string[];
  timeInvestment: number;        // Estimated time required
  successRate: number;           // Probability of success
}

// ============================================================================
// SYSTEM CONFIGURATION INTERFACES
// ============================================================================

export interface SkillsSystemConfig {
  // Learning rates
  baseLearningRate: number;
  personalityInfluence: number;
  synergyBonusMultiplier: number;
  
  // Experience calculations
  experienceFormula: ExperienceFormula;
  levelThresholds: LevelThresholdConfig;
  plateauDetection: PlateauDetectionConfig;
  
  // Performance
  maxTrackedSkills: number;
  experienceHistorySize: number;
  updateInterval: number;
  
  // Integration
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
  stagnationPeriod: number;      // Time without progress to detect plateau
  minimumAttempts: number;       // Minimum attempts before detection
  sensitivityThreshold: number;  // How sensitive detection is
  autoBreakAttempts: boolean;    // Automatically attempt breaking strategies
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

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