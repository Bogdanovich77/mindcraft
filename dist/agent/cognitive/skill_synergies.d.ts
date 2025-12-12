/**
 * Skill Synergy System
 *
 * Manages skill interactions, transfer learning, and synergy bonuses.
 * Implements direct, analogical, and creative transfer between related skills.
 */
import { Skill, SkillType, ExperienceEvent, SynergyType } from './skill_types.js';
export declare enum SynergyStrength {
    VERY_WEAK = "very_weak",
    WEAK = "weak",
    MODERATE = "moderate",
    STRONG = "strong",
    VERY_STRONG = "very_strong"
}
export interface SkillSynergy {
    sourceSkill: SkillType;
    targetSkill: SkillType;
    synergyType: SynergyType;
    strength: SynergyStrength;
    bonusMultiplier: number;
    prerequisites: {
        sourceLevel: number;
        targetLevel?: number;
    };
    description: string;
}
export interface SynergyBonus {
    synergyType: SynergyType;
    bonusAmount: number;
    contributingSkills: SkillType[];
    totalBonus: number;
}
export interface TransferLearningResult {
    transferredExperience: number;
    bonusMultiplier: number;
    contributingSkills: SkillType[];
    transferEfficiency: number;
    diminishingReturns: number;
}
export interface SkillRelationship {
    skill1: SkillType;
    skill2: SkillType;
    relationship: 'direct' | 'analogical' | 'creative' | 'prerequisite';
    strength: number;
    bidirectional: boolean;
}
export declare class SkillSynergySystem {
    private synergies;
    private relationships;
    private transferHistory;
    constructor();
    /**
     * Initialize predefined skill synergies
     */
    private initializeSynergies;
    /**
     * Initialize skill relationships
     */
    private initializeRelationships;
    /**
     * Add a new skill synergy
     */
    addSynergy(synergy: SkillSynergy): void;
    /**
     * Calculate synergy bonus for a skill based on all related skills
     */
    calculateSynergyBonus(targetSkill: SkillType, allSkills: Map<SkillType, Skill>): SynergyBonus;
    /**
     * Calculate transfer learning from experience event
     */
    calculateTransferLearning(event: ExperienceEvent, targetSkill: SkillType, allSkills: Map<SkillType, Skill>): TransferLearningResult;
    /**
     * Get all synergies for a target skill
     */
    getSynergies(targetSkill: SkillType): SkillSynergy[];
    /**
     * Get skill relationship between two skills
     */
    getRelationship(skill1: SkillType, skill2: SkillType): SkillRelationship | null;
    /**
     * Get related skills for a given skill
     */
    getRelatedSkills(skill: SkillType, maxDistance?: number): SkillType[];
    /**
     * Get multiplier for synergy strength
     */
    private getStrengthMultiplier;
    /**
     * Calculate diminishing returns for skill transfer
     */
    private calculateDiminishingReturns;
    /**
     * Calculate total diminishing returns for a target skill
     */
    private calculateTotalDiminishingReturns;
    /**
     * Record a skill transfer for diminishing returns calculation
     */
    private recordTransfer;
    /**
     * Get synergy recommendations for skill development
     */
    getSynergyRecommendations(currentSkills: Map<SkillType, Skill>, targetSkill: SkillType): SkillSynergy[];
    /**
     * Calculate potential benefit of developing a synergy
     */
    private calculatePotentialBenefit;
    /**
     * Reset synergy system
     */
    reset(): void;
    /**
     * Get transfer statistics
     */
    getTransferStatistics(): {
        totalTransfers: number;
        mostTransferred: Array<{
            from: SkillType;
            to: SkillType;
            count: number;
        }>;
        averageDiminishingReturns: number;
    };
}
//# sourceMappingURL=skill_synergies.d.ts.map