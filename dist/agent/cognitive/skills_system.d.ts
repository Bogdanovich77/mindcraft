/**
 * Dynamic Skills System
 *
 * Comprehensive skill progression system with proficiency tracking, experience management,
 * learning characteristics, and adaptive growth rates. Integrates with personality and
 * goal systems while respecting reactive interrupts.
 */
import { Skill, SkillType, SkillCategory, ProficiencyMetrics, SkillComponents, LearningCharacteristics, UsageStatistics, ExperienceEvent, LearningPlateau, SkillsSystemConfig, SkillProgress, SkillRecommendation } from './skill_types.js';
import { PersonalitySystem } from './personality.js';
import { SocialState } from '../langgraph/interfaces.js';
export declare class SkillsSystem {
    private skills;
    private config;
    private personality;
    private plateaus;
    private lastUpdate;
    private socialState?;
    private recentProgress;
    private recommendations;
    private socialObservations;
    private teachingHistory;
    constructor(personality: PersonalitySystem, config?: Partial<SkillsSystemConfig>);
    /**
     * Initialize core skills with base values
     */
    private initializeCoreSkills;
    /**
     * Create a new skill with default values
     */
    private createSkill;
    /**
     * Convert personality profile to traits format
     */
    private convertProfileToTraits;
    /**
     * Get skill information by type
     */
    private getSkillInfo;
    /**
     * Create initial proficiency metrics
     */
    private createInitialProficiency;
    /**
     * Create initial skill components based on personality
     */
    private createInitialComponents;
    /**
     * Create initial learning characteristics
     */
    private createInitialLearning;
    /**
     * Create initial usage statistics
     */
    private createInitialUsage;
    /**
     * Create initial metadata
     */
    private createInitialMetadata;
    /**
     * Get skill prerequisites
     */
    private getSkillPrerequisites;
    /**
     * Get effective learning methods for skill type
     */
    private getEffectiveLearningMethods;
    /**
     * Get preferred learning contexts based on skill and personality
     */
    private getPreferredContexts;
    /**
     * Get child skills for a given skill
     */
    private getChildSkills;
    /**
     * Calculate experience threshold for next level
     */
    private calculateLevelThreshold;
    /**
     * Get skill by type, creating if it doesn't exist
     */
    getSkill(skillType: SkillType): Skill;
    /**
     * Get all skills
     */
    getAllSkills(): Skill[];
    /**
     * Get skills by category
     */
    getSkillsByCategory(category: SkillCategory): Skill[];
    /**
     * Check if skill exists
     */
    hasSkill(skillType: SkillType): boolean;
    /**
     * Get skill level
     */
    getSkillLevel(skillType: SkillType): number;
    /**
     * Get skill proficiency metrics
     */
    getProficiency(skillType: SkillType): ProficiencyMetrics;
    /**
     * Get skill components
     */
    getComponents(skillType: SkillType): SkillComponents;
    /**
     * Get skill learning characteristics
     */
    getLearning(skillType: SkillType): LearningCharacteristics;
    /**
     * Get usage statistics
     */
    getUsage(skillType: SkillType): UsageStatistics;
    /**
     * Update skill with new experience
     */
    updateSkill(skillType: SkillType, experienceEvent: ExperienceEvent): SkillProgress;
    /**
     * Process experience event with all modifiers
     */
    private processExperience;
    /**
     * Apply processed experience to skill
     */
    private applyExperience;
    /**
     * Update skill component balance
     */
    private updateComponentBalance;
    /**
     * Update usage statistics
     */
    private updateUsageStatistics;
    /**
     * Update usage streak
     */
    private updateStreak;
    /**
     * Check for level progression
     */
    private checkLevelProgression;
    /**
     * Detect learning plateaus
     */
    private detectPlateaus;
    /**
     * Determine plateau type based on skill characteristics
     */
    private determinePlateauType;
    /**
     * Determine plateau severity
     */
    private determinePlateauSeverity;
    /**
     * Generate plateau description
     */
    private generatePlateauDescription;
    /**
     * Identify plateau causes
     */
    private identifyPlateauCauses;
    /**
     * Estimate plateau duration
     */
    private estimatePlateauDuration;
    /**
     * Generate breaking strategies (placeholder - would be expanded)
     */
    private generateBreakingStrategies;
    /**
     * Generate recommended actions (placeholder - would be expanded)
     */
    private generateRecommendedActions;
    /**
     * Get current plateaus
     */
    getPlateaus(): LearningPlateau[];
    /**
     * Get plateau for specific skill
     */
    getPlateau(skillType: SkillType): LearningPlateau | undefined;
    /**
     * Get recent progress
     */
    getRecentProgress(): SkillProgress[];
    /**
     * Generate skill recommendations
     */
    generateRecommendations(): SkillRecommendation[];
    /**
     * Generate learning path for skill
     */
    private generateLearningPath;
    /**
     * Get related skills that benefit from learning this skill
     */
    private getRelatedSkills;
    /**
     * Get skill recommendations
     */
    getRecommendations(): SkillRecommendation[];
    /**
     * Update adaptive learning rates based on recent performance
     */
    updateAdaptiveLearning(): void;
    /**
     * Calculate recent efficiency for skill
     */
    private calculateRecentEfficiency;
    /**
     * Get system statistics
     */
    getStatistics(): {
        totalSkills: number;
        averageLevel: number;
        totalExperience: number;
        activePlateaus: number;
        recentProgress: number;
    };
    /**
     * Set social state for social-aware skill processing
     */
    setSocialState(socialState: SocialState): void;
    /**
     * Learn from observing other agents
     */
    learnFromObservation(observedAgentId: string, observedSkill: SkillType, context: any): SkillProgress | null;
    /**
     * Teach a skill to another agent
     */
    teachSkill(skillType: SkillType, studentAgentId: string, teachingContext: any, teachingQuality?: number): SkillProgress | null;
    /**
     * Collaboratively execute a skill with other agents
     */
    collaborativeSkillExecution(skillType: SkillType, collaborators: string[], context: any): SkillProgress | null;
    /**
     * Get social skill reputation
     */
    getSocialSkillReputation(skillType: SkillType): {
        reputation: number;
        endorsements: number;
        teachings: number;
        observations: number;
    };
    /**
     * Identify social skill gaps
     */
    identifySocialSkillGaps(): {
        skillType: SkillType;
        gap: number;
        recommendation: string;
        priority: number;
    }[];
    /**
     * Generate social skill recommendation
     */
    private generateSocialSkillRecommendation;
    /**
     * Get social learning insights
     */
    getSocialLearningInsights(): {
        mostObservedAgents: string[];
        mostTaughtSkills: SkillType[];
        collaborationEffectiveness: number;
        socialLearningRate: number;
    };
}
//# sourceMappingURL=skills_system.d.ts.map