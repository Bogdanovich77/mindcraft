/**
 * Skill Milestones and Specialization System
 *
 * Manages skill progression milestones, achievement tracking, and specialization
 * unlocking. Provides structured advancement paths and ability unlocks.
 */
import { SkillType, SkillMilestone, SkillSpecialization, SpecializationEffect } from './skill_types.js';
export interface MilestoneProgress {
    milestoneId: string;
    skillType: SkillType;
    progress: number;
    requirementsProgress: Record<string, number>;
    estimatedTimeToComplete: number;
    isAchieved: boolean;
    achievedAt?: number;
}
export interface SpecializationProgress {
    specializationId: string;
    baseSkill: SkillType;
    progress: number;
    requirementsProgress: Record<string, number>;
    isUnlocked: boolean;
    unlockedAt?: number;
    activeEffects: string[];
}
export interface MilestoneSystemConfig {
    enableMilestones: boolean;
    enableSpecializations: boolean;
    autoUnlockSpecializations: boolean;
    progressUpdateInterval: number;
    milestoneNotificationThreshold: number;
    maxActiveSpecializations: number;
    specializationSwitchCooldown: number;
    trackMilestoneHistory: boolean;
    trackSpecializationHistory: boolean;
    celebrateAchievements: boolean;
}
export declare class SkillMilestoneSystem {
    private config;
    private milestones;
    private specializations;
    private milestoneProgress;
    private specializationProgress;
    private activeSpecializations;
    constructor(config?: Partial<MilestoneSystemConfig>);
    /**
     * Initialize predefined skill milestones
     */
    private initializeMilestones;
    /**
     * Initialize predefined skill specializations
     */
    private initializeSpecializations;
    /**
     * Add milestones for a skill
     */
    addMilestones(skillType: SkillType, milestones: SkillMilestone[]): void;
    /**
     * Add specializations for a skill
     */
    addSpecializations(skillType: SkillType, specializations: SkillSpecialization[]): void;
    /**
     * Update milestone progress based on skill activity
     */
    updateMilestoneProgress(skillType: SkillType, skillLevel: number, experience: number, practiceData: Record<string, number>, successRate?: number): MilestoneProgress[];
    /**
     * Update specialization progress
     */
    updateSpecializationProgress(skillType: SkillType, skillLevel: number, practiceData: Record<string, number>, completedMilestones: string[]): SpecializationProgress[];
    /**
     * Unlock a specialization
     */
    unlockSpecialization(specializationId: string): boolean;
    /**
     * Get active specializations for a skill
     */
    getActiveSpecializations(skillType: SkillType): SkillSpecialization[];
    /**
     * Get available milestones for a skill
     */
    getAvailableMilestones(skillType: SkillType): SkillMilestone[];
    /**
     * Get milestone progress
     */
    getMilestoneProgress(milestoneId: string): MilestoneProgress | null;
    /**
     * Get specialization progress
     */
    getSpecializationProgress(specializationId: string): SpecializationProgress | null;
    /**
     * Get next milestones for a skill
     */
    getNextMilestones(skillType: SkillType, currentLevel: number): SkillMilestone[];
    /**
     * Get available specializations for a skill
     */
    getAvailableSpecializations(skillType: SkillType): SkillSpecialization[];
    /**
     * Handle milestone achievement
     */
    private handleMilestoneAchievement;
    /**
     * Calculate milestone bonuses for a skill
     */
    calculateMilestoneBonuses(skillType: SkillType): {
        skillBonus: number;
        learningBonus: number;
        experienceBonus: number;
        abilityUnlocks: string[];
    };
    /**
     * Calculate specialization bonuses for a skill
     */
    calculateSpecializationBonuses(skillType: SkillType): {
        skillBonus: number;
        learningBonus: number;
        experienceBonus: number;
        synergyBonus: number;
        penalties: Record<string, number>;
        activeEffects: SpecializationEffect[];
    };
    /**
     * Reset milestone system
     */
    reset(): void;
    /**
     * Get system statistics
     */
    getStatistics(): {
        totalMilestones: number;
        achievedMilestones: number;
        totalSpecializations: number;
        unlockedSpecializations: number;
        activeSpecializations: number;
        averageMilestoneProgress: number;
        averageSpecializationProgress: number;
    };
}
//# sourceMappingURL=skill_milestones.d.ts.map