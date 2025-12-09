/**
 * Personality System - Big Five Traits + Gaming-Specific Traits
 *
 * Provides the foundation for consistent, personality-driven behavior.
 * Personality traits influence but never override reactive survival behaviors.
 */
export class PersonalitySystem {
    profile;
    baselineTraits;
    constructor(initialTraits) {
        this.baselineTraits = this.createDefaultTraits();
        this.profile = {
            traits: { ...this.baselineTraits, ...initialTraits },
            confidence: 0.7,
            adaptability: 0.3,
            consistency: 0.8
        };
    }
    /**
     * Create default personality traits
     */
    createDefaultTraits() {
        return {
            openness: 0.5,
            conscientiousness: 0.5,
            extraversion: 0.5,
            agreeableness: 0.5,
            neuroticism: 0.5,
            riskTolerance: 0.5,
            creativity: 0.5,
            patience: 0.5,
            competitiveness: 0.5,
            curiosity: 0.5
        };
    }
    /**
     * Get current personality profile
     */
    getProfile() {
        return { ...this.profile };
    }
    /**
     * Calculate personality influence on action utility
     */
    calculateActionInfluence(actionType, context) {
        const traits = this.profile.traits;
        let influence = 0.5; // Neutral baseline
        // Action-specific personality influences
        switch (actionType) {
            case 'explore':
                influence = (traits.openness * 0.4) +
                    (traits.curiosity * 0.3) +
                    (traits.riskTolerance * 0.2) +
                    (traits.extraversion * 0.1);
                break;
            case 'build':
                influence = (traits.conscientiousness * 0.4) +
                    (traits.creativity * 0.3) +
                    (traits.patience * 0.2) +
                    (traits.openness * 0.1);
                break;
            case 'social':
                influence = (traits.extraversion * 0.4) +
                    (traits.agreeableness * 0.3) +
                    (1 - traits.neuroticism) * 0.2 +
                    (traits.openness * 0.1);
                break;
            case 'combat':
                influence = (traits.riskTolerance * 0.3) +
                    (traits.competitiveness * 0.3) +
                    (1 - traits.neuroticism) * 0.2 +
                    (traits.agreeableness * -0.2); // Negative influence
                break;
            case 'craft':
                influence = (traits.conscientiousness * 0.3) +
                    (traits.creativity * 0.3) +
                    (traits.patience * 0.2) +
                    (traits.openness * 0.2);
                break;
            case 'trade':
                influence = (traits.agreeableness * 0.3) +
                    (traits.extraversion * 0.3) +
                    (traits.openness * 0.2) +
                    (1 - traits.competitiveness) * 0.2;
                break;
        }
        // Apply confidence modifier
        influence = influence * (0.5 + this.profile.confidence * 0.5);
        return Math.max(0, Math.min(1, influence));
    }
    /**
     * Update personality based on experience
     */
    updateFromExperience(experience) {
        const adaptability = this.profile.adaptability;
        // Gradually adjust traits based on experience
        Object.keys(experience.traitInfluences).forEach(traitKey => {
            const trait = traitKey;
            const influence = experience.traitInfluences[trait];
            if (influence !== undefined && trait in this.profile.traits) {
                const currentValue = this.profile.traits[trait];
                const adjustment = influence * adaptability * experience.intensity;
                this.profile.traits[trait] = Math.max(0, Math.min(1, currentValue + adjustment));
            }
        });
        // Update confidence based on success/failure
        if (experience.success) {
            this.profile.confidence = Math.min(1, this.profile.confidence + 0.01 * adaptability);
        }
        else {
            this.profile.confidence = Math.max(0.1, this.profile.confidence - 0.02 * adaptability);
        }
    }
    /**
     * Get stress level based on neuroticism and context
     */
    calculateStressLevel(context) {
        const baseStress = this.profile.traits.neuroticism;
        let stressModifier = 0;
        // Contextual stress factors
        if (context.danger)
            stressModifier += 0.3;
        if (context.unknown)
            stressModifier += 0.2;
        if (context.time_pressure)
            stressModifier += 0.2;
        if (context.social_pressure)
            stressModifier += 0.1 * (1 - this.profile.traits.extraversion);
        return Math.max(0, Math.min(1, baseStress + stressModifier));
    }
    /**
     * Determine if personality supports risk-taking
     */
    shouldTakeRisk(context) {
        const riskThreshold = this.profile.traits.riskTolerance;
        const stressLevel = this.calculateStressLevel(context);
        const confidence = this.profile.confidence;
        // High stress reduces risk tolerance
        const adjustedThreshold = riskThreshold * (1 - stressLevel * 0.5) * confidence;
        return adjustedThreshold > 0.5;
    }
    /**
     * Create personality profile from legacy profile data
     */
    static fromLegacyProfile(legacyProfile) {
        const traits = {};
        // Map legacy personality indicators to new system
        if (legacyProfile.personality) {
            traits.openness = legacyProfile.personality.curious || 0.5;
            traits.conscientiousness = legacyProfile.personality.organized || 0.5;
            traits.extraversion = legacyProfile.personality.social || 0.5;
            traits.agreeableness = legacyProfile.personality.friendly || 0.5;
            traits.neuroticism = legacyProfile.personality.anxious || 0.5;
        }
        // Gaming traits from behavior patterns
        if (legacyProfile.behavior) {
            traits.riskTolerance = legacyProfile.behavior.brave ? 0.8 : 0.3;
            traits.creativity = legacyProfile.behavior.creative ? 0.8 : 0.3;
            traits.patience = legacyProfile.behavior.patient ? 0.8 : 0.3;
            traits.competitiveness = legacyProfile.behavior.competitive ? 0.8 : 0.3;
            traits.curiosity = legacyProfile.behavior.explorer ? 0.8 : 0.3;
        }
        return new PersonalitySystem(traits);
    }
    /**
     * Export personality to legacy format
     */
    toLegacyProfile() {
        return {
            personality: {
                curious: this.profile.traits.openness > 0.6,
                organized: this.profile.traits.conscientiousness > 0.6,
                social: this.profile.traits.extraversion > 0.6,
                friendly: this.profile.traits.agreeableness > 0.6,
                anxious: this.profile.traits.neuroticism > 0.6
            },
            behavior: {
                brave: this.profile.traits.riskTolerance > 0.6,
                creative: this.profile.traits.creativity > 0.6,
                patient: this.profile.traits.patience > 0.6,
                competitive: this.profile.traits.competitiveness > 0.6,
                explorer: this.profile.traits.curiosity > 0.6
            }
        };
    }
}
