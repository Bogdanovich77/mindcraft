/**
 * Learning Engine
 *
 * Advanced experience processing system that handles skill learning, adaptation,
 * and progression. Implements realistic learning curves, personality influences,
 * and contextual learning effects.
 */
import { Skill, SkillType, ExperienceEvent, ExperienceContext, PersonalityTraits, LearningSession, LearningMethod } from './skill_types.js';
import { PersonalitySystem } from './personality.js';
import { SocialState } from '../langgraph/interfaces.js';
export interface LearningEngineConfig {
    baseExperienceMultiplier: number;
    difficultyScaling: number;
    successRewardMultiplier: number;
    failureLearningMultiplier: number;
    timeDecayRate: number;
    practiceBonusDecay: number;
    consolidationPeriod: number;
    personalityInfluenceStrength: number;
    traitLearningModifiers: Record<keyof PersonalityTraits, number>;
    contextBonusMultiplier: number;
    socialLearningBonus: number;
    environmentalModifiers: Record<string, number>;
    adaptiveLearningRate: number;
    plateauDetectionSensitivity: number;
    breakthroughThreshold: number;
}
export interface LearningMetrics {
    totalExperienceProcessed: number;
    averageLearningRate: number;
    personalityInfluence: number;
    contextEffects: number;
    adaptationRate: number;
    breakthroughCount: number;
    plateauOvercomeCount: number;
}
export interface LearningAnalysis {
    skillType: SkillType;
    learningVelocity: number;
    retentionRate: number;
    transferPotential: number;
    optimalContexts: string[];
    recommendedMethods: LearningMethod[];
    personalityAlignment: number;
    learningEfficiency: number;
}
export declare class LearningEngine {
    private config;
    private personality;
    private metrics;
    private learningHistory;
    private adaptiveModifiers;
    private socialState?;
    private socialLearningHistory;
    private culturalNorms;
    constructor(personality: PersonalitySystem, config?: Partial<LearningEngineConfig>);
    /**
     * Initialize learning metrics
     */
    private initializeMetrics;
    /**
     * Process experience event and calculate learning gains
     */
    processExperience(skill: Skill, event: ExperienceEvent, currentContext: ExperienceContext): {
        processedEvent: ExperienceEvent;
        learningAnalysis: LearningAnalysis;
        adaptations: string[];
    };
    /**
     * Convert personality profile to traits format
     */
    private convertProfileToTraits;
    /**
     * Calculate base experience from event
     */
    private calculateBaseExperience;
    /**
     * Calculate personality-based learning modifier
     */
    private calculatePersonalityModifier;
    /**
     * Calculate context-based learning modifier
     */
    private calculateContextModifier;
    /**
     * Calculate difficulty-based modifier
     */
    private calculateDifficultyModifier;
    /**
     * Calculate outcome-based modifier
     */
    private calculateOutcomeModifier;
    /**
     * Get adaptive modifier for skill
     */
    private getAdaptiveModifier;
    /**
     * Calculate time-based learning modifier
     */
    private calculateTimeModifier;
    /**
     * Calculate component-specific gains
     */
    private calculateComponentGains;
    /**
     * Calculate synergy bonus (placeholder for now)
     */
    private calculateSynergyBonus;
    /**
     * Calculate plateau modifier
     */
    private calculatePlateauModifier;
    /**
     * Analyze learning patterns and generate insights
     */
    private analyzeLearning;
    /**
     * Get recent learning sessions for skill
     */
    private getRecentLearningSessions;
    /**
     * Calculate learning velocity
     */
    private calculateLearningVelocity;
    /**
     * Calculate retention rate
     */
    private calculateRetentionRate;
    /**
     * Calculate transfer potential
     */
    private calculateTransferPotential;
    /**
     * Identify optimal learning contexts
     */
    private identifyOptimalContexts;
    /**
     * Recommend learning methods based on performance
     */
    private recommendLearningMethods;
    /**
     * Calculate personality alignment with skill
     */
    private calculatePersonalityAlignment;
    /**
     * Calculate learning efficiency
     */
    private calculateLearningEfficiency;
    /**
     * Determine adaptations needed based on learning analysis
     */
    private determineAdaptations;
    /**
     * Update learning metrics
     */
    private updateMetrics;
    /**
     * Update adaptive modifiers based on learning performance
     */
    private updateAdaptiveModifiers;
    /**
     * Record learning session
     */
    recordLearningSession(session: LearningSession): void;
    /**
     * Get learning metrics
     */
    getMetrics(): LearningMetrics;
    /**
     * Get learning history
     */
    getLearningHistory(skillType?: SkillType): LearningSession[];
    /**
     * Get adaptive modifiers
     */
    getAdaptiveModifiers(): Map<SkillType, number>;
    /**
     * Reset learning engine
     */
    /**
     * Set social state for social-aware learning processing
     */
    setSocialState(socialState: SocialState): void;
    /**
     * Process social experience with enhanced learning
     */
    processSocialExperience(skill: Skill, event: ExperienceEvent, socialContext: any): {
        processedEvent: ExperienceEvent;
        learningAnalysis: LearningAnalysis;
        socialInsights: any;
    };
    /**
     * Learn from observed social interactions
     */
    learnFromSocialInteraction(observedAgents: string[], interactionType: 'cooperation' | 'competition' | 'teaching' | 'conflict', context: any): {
        learningGains: Map<SkillType, number>;
        socialPatterns: any[];
        culturalInsights: any[];
    };
    /**
     * Generate social learning insights
     */
    private generateSocialInsights;
    /**
     * Calculate social learning bonus
     */
    private calculateSocialLearningBonus;
    /**
     * Update cultural norms based on experience
     */
    private updateCulturalNorms;
    /**
     * Get relevant cultural norms for skill and context
     */
    private getRelevantCulturalNorms;
    /**
     * Calculate social effectiveness from insights
     */
    private calculateSocialEffectiveness;
    /**
     * Calculate cultural alignment
     */
    private calculateCulturalAlignment;
    /**
     * Record social learning event
     */
    private recordSocialLearning;
    /**
     * Get social learning history
     */
    getSocialLearningHistory(skillType?: SkillType): Map<string, any[]>;
    /**
     * Get cultural norms
     */
    getCulturalNorms(): Map<string, number>;
    /**
     * Reset learning engine
     */
    reset(): void;
}
//# sourceMappingURL=learning_engine.d.ts.map