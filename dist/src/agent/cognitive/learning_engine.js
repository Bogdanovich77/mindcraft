/**
 * Learning Engine
 *
 * Advanced experience processing system that handles skill learning, adaptation,
 * and progression. Implements realistic learning curves, personality influences,
 * and contextual learning effects.
 */
import { ExperienceSource } from './skill_types.js';
export class LearningEngine {
    config;
    personality;
    metrics;
    learningHistory = [];
    adaptiveModifiers = new Map();
    constructor(personality, config) {
        this.personality = personality;
        this.config = {
            baseExperienceMultiplier: 1.0,
            difficultyScaling: 1.5,
            successRewardMultiplier: 1.5,
            failureLearningMultiplier: 0.7,
            timeDecayRate: 0.1,
            practiceBonusDecay: 0.05,
            consolidationPeriod: 24 * 60 * 60 * 1000, // 24 hours
            personalityInfluenceStrength: 0.3,
            traitLearningModifiers: {
                openness: 1.2,
                conscientiousness: 1.1,
                extraversion: 1.0,
                agreeableness: 0.9,
                neuroticism: 0.8,
                riskTolerance: 1.1,
                explorationDrive: 1.3,
                socialTendency: 1.0,
                buildingCreativity: 1.1,
                combatAggression: 1.0
            },
            contextBonusMultiplier: 1.2,
            socialLearningBonus: 1.3,
            environmentalModifiers: {
                'combat': 1.1,
                'peaceful': 1.0,
                'social': 1.2,
                'solo': 0.9,
                'dangerous': 1.3,
                'safe': 0.9,
                'complex': 1.2,
                'simple': 0.8
            },
            adaptiveLearningRate: 0.1,
            plateauDetectionSensitivity: 0.15,
            breakthroughThreshold: 0.8,
            ...config
        };
        this.metrics = this.initializeMetrics();
    }
    /**
     * Initialize learning metrics
     */
    initializeMetrics() {
        return {
            totalExperienceProcessed: 0,
            averageLearningRate: 1.0,
            personalityInfluence: 0,
            contextEffects: 0,
            adaptationRate: 0,
            breakthroughCount: 0,
            plateauOvercomeCount: 0
        };
    }
    /**
     * Process experience event and calculate learning gains
     */
    processExperience(skill, event, currentContext) {
        // Calculate base experience
        const baseExperience = this.calculateBaseExperience(event, skill.learning);
        // Apply personality modifiers
        const personalityProfile = this.personality.getProfile();
        const personalityTraits = this.convertProfileToTraits(personalityProfile);
        const personalityModifier = this.calculatePersonalityModifier(skill, personalityTraits);
        // Apply context modifiers
        const contextModifier = this.calculateContextModifier(event, currentContext, skill);
        // Apply difficulty scaling
        const difficultyModifier = this.calculateDifficultyModifier(event.difficulty, skill.learning.difficulty);
        // Apply success/failure modifiers
        const outcomeModifier = this.calculateOutcomeModifier(event.success, event.quality);
        // Apply adaptive modifiers
        const adaptiveModifier = this.getAdaptiveModifier(skill.type);
        // Apply time-based modifiers
        const timeModifier = this.calculateTimeModifier(skill, event);
        // Calculate component gains
        const componentGains = this.calculateComponentGains(skill, event, personalityModifier);
        // Calculate final experience amount
        const finalExperience = Math.floor(baseExperience *
            personalityModifier *
            contextModifier *
            difficultyModifier *
            outcomeModifier *
            adaptiveModifier *
            timeModifier);
        // Create processed experience event
        const processedEvent = {
            ...event,
            amount: Math.max(1, finalExperience),
            componentGains,
            synergyBonus: this.calculateSynergyBonus(skill, event),
            personalityBonus: personalityModifier - 1,
            contextBonus: contextModifier - 1,
            plateauModifier: this.calculatePlateauModifier(skill)
        };
        // Analyze learning patterns
        const learningAnalysis = this.analyzeLearning(skill, processedEvent);
        // Determine adaptations needed
        const adaptations = this.determineAdaptations(skill, learningAnalysis);
        // Update metrics
        this.updateMetrics(processedEvent, learningAnalysis);
        // Update adaptive modifiers
        this.updateAdaptiveModifiers(skill.type, learningAnalysis);
        return {
            processedEvent,
            learningAnalysis,
            adaptations
        };
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
     * Calculate base experience from event
     */
    calculateBaseExperience(event, learning) {
        let baseExperience = event.amount * this.config.baseExperienceMultiplier;
        // Apply skill-specific learning rate
        baseExperience *= learning.learningRate;
        // Apply source-specific modifiers
        switch (event.source) {
            case ExperienceSource.BREAKTHROUGH:
                baseExperience *= 3.0;
                break;
            case ExperienceSource.TEACHING:
                baseExperience *= 1.5;
                break;
            case ExperienceSource.EXPERIMENTATION:
                baseExperience *= 1.3;
                break;
            case ExperienceSource.OBSERVATION:
                baseExperience *= 0.7;
                break;
            case ExperienceSource.FAILURE:
                baseExperience *= this.config.failureLearningMultiplier;
                break;
            default:
                baseExperience *= 1.0;
        }
        return baseExperience;
    }
    /**
     * Calculate personality-based learning modifier
     */
    calculatePersonalityModifier(skill, personality) {
        const traits = personality;
        const skillCategory = skill.category;
        const modifiers = this.config.traitLearningModifiers;
        let totalModifier = 1.0;
        let traitCount = 0;
        // Category-specific personality influences
        switch (skillCategory) {
            case 'combat':
                totalModifier *= (1 + (traits.riskTolerance - 0.5) * modifiers.riskTolerance * 0.3);
                totalModifier *= (1 + (traits.combatAggression - 0.5) * modifiers.combatAggression * 0.2);
                traitCount += 2;
                break;
            case 'crafting':
                totalModifier *= (1 + (traits.openness - 0.5) * modifiers.openness * 0.4);
                totalModifier *= (1 + (traits.conscientiousness - 0.5) * modifiers.conscientiousness * 0.3);
                totalModifier *= (1 + (traits.buildingCreativity - 0.5) * modifiers.buildingCreativity * 0.3);
                traitCount += 3;
                break;
            case 'social':
                totalModifier *= (1 + (traits.extraversion - 0.5) * modifiers.extraversion * 0.4);
                totalModifier *= (1 + (traits.agreeableness - 0.5) * modifiers.agreeableness * 0.2);
                totalModifier *= (1 + (traits.socialTendency - 0.5) * modifiers.socialTendency * 0.3);
                traitCount += 3;
                break;
            case 'exploration':
                totalModifier *= (1 + (traits.openness - 0.5) * modifiers.openness * 0.3);
                totalModifier *= (1 + (traits.explorationDrive - 0.5) * modifiers.explorationDrive * 0.5);
                totalModifier *= (1 + (traits.riskTolerance - 0.5) * modifiers.riskTolerance * 0.2);
                traitCount += 3;
                break;
            default:
                totalModifier *= (1 + (traits.openness - 0.5) * modifiers.openness * 0.2);
                totalModifier *= (1 + (traits.conscientiousness - 0.5) * modifiers.conscientiousness * 0.2);
                traitCount += 2;
        }
        // General personality influence
        const neuroticismImpact = (0.5 - traits.neuroticism) * modifiers.neuroticism * 0.2;
        totalModifier *= (1 + neuroticismImpact);
        // Apply personality influence strength
        const personalityWeight = Math.min(1.0, traitCount * 0.1);
        const finalModifier = 1.0 + (totalModifier - 1.0) * this.config.personalityInfluenceStrength * personalityWeight;
        return Math.max(0.3, Math.min(2.0, finalModifier));
    }
    /**
     * Calculate context-based learning modifier
     */
    calculateContextModifier(event, context, skill) {
        let modifier = 1.0;
        // Environmental context modifier
        const envModifier = this.config.environmentalModifiers[context.situation] || 1.0;
        modifier *= envModifier;
        // Social context bonus
        if (context.socialContext === 'cooperative') {
            modifier *= this.config.socialLearningBonus;
        }
        else if (context.socialContext === 'teaching') {
            modifier *= this.config.socialLearningBonus * 1.2;
        }
        else if (context.socialContext === 'solo') {
            modifier *= 0.9; // Slightly reduced for solo learning
        }
        // Time pressure effect
        if (context.timePressure > 0.7) {
            modifier *= 0.8; // High time pressure reduces learning
        }
        else if (context.timePressure < 0.3) {
            modifier *= 1.1; // Low time pressure improves learning
        }
        // Risk level effect
        if (context.riskLevel > 0.8) {
            modifier *= 1.2; // High risk can enhance learning (survival bias)
        }
        else if (context.riskLevel < 0.2) {
            modifier *= 0.9; // Very low risk may reduce engagement
        }
        // Preferred context bonus
        if (skill.learning.preferredContext.includes(context.situation)) {
            modifier *= this.config.contextBonusMultiplier;
        }
        return Math.max(0.5, Math.min(1.5, modifier));
    }
    /**
     * Calculate difficulty-based modifier
     */
    calculateDifficultyModifier(eventDifficulty, skillDifficulty) {
        // Optimal learning occurs when challenge matches skill level
        const difficultyRatio = eventDifficulty / skillDifficulty;
        let modifier = 1.0;
        if (difficultyRatio > 1.5) {
            // Too difficult - reduced learning but still some benefit
            modifier = 0.6 + (1.0 / difficultyRatio) * 0.4;
        }
        else if (difficultyRatio > 1.0) {
            // Challenging but achievable - optimal learning
            modifier = 1.0 + (difficultyRatio - 1.0) * this.config.difficultyScaling;
        }
        else if (difficultyRatio > 0.5) {
            // Easy task - reduced learning
            modifier = 0.7 + difficultyRatio * 0.3;
        }
        else {
            // Very easy - minimal learning
            modifier = 0.5;
        }
        return Math.max(0.3, Math.min(2.0, modifier));
    }
    /**
     * Calculate outcome-based modifier
     */
    calculateOutcomeModifier(success, quality) {
        let modifier = 1.0;
        if (success) {
            // Success bonus based on quality
            modifier *= this.config.successRewardMultiplier;
            modifier *= (0.5 + quality * 0.5); // Quality factor
        }
        else {
            // Failure still provides some learning
            modifier *= this.config.failureLearningMultiplier;
            modifier *= (0.3 + quality * 0.3); // Even failed attempts have some quality
        }
        return modifier;
    }
    /**
     * Get adaptive modifier for skill
     */
    getAdaptiveModifier(skillType) {
        return this.adaptiveModifiers.get(skillType) || 1.0;
    }
    /**
     * Calculate time-based learning modifier
     */
    calculateTimeModifier(skill, event) {
        const now = Date.now();
        const timeSinceLastUse = now - skill.usage.lastUsed;
        const consolidationPeriod = this.config.consolidationPeriod;
        let modifier = 1.0;
        // Spaced learning bonus
        if (timeSinceLastUse > consolidationPeriod && timeSinceLastUse < consolidationPeriod * 7) {
            modifier *= 1.2; // Spaced practice bonus
        }
        else if (timeSinceLastUse < consolidationPeriod * 0.1) {
            // Too frequent practice - diminishing returns
            const recentUses = skill.usage.recentUses.filter(time => now - time < consolidationPeriod).length;
            if (recentUses > 10) {
                modifier *= 0.8; // Overpractice penalty
            }
        }
        // Streak bonus
        if (skill.usage.streakDays > 3) {
            modifier *= 1.1; // Consistent practice bonus
        }
        return modifier;
    }
    /**
     * Calculate component-specific gains
     */
    calculateComponentGains(skill, event, personalityModifier) {
        const components = skill.components;
        const baseGain = event.amount * 0.01; // Convert to component points
        let knowledgeGain = baseGain * components.knowledgeGrowthRate;
        let practicalGain = baseGain * components.practicalGrowthRate;
        let creativeGain = baseGain * components.creativeGrowthRate;
        // Adjust gains based on event type and context
        switch (event.source) {
            case ExperienceSource.PRACTICE:
                knowledgeGain *= 0.6;
                practicalGain *= 2.0;
                creativeGain *= 0.7;
                break;
            case ExperienceSource.OBSERVATION:
                knowledgeGain *= 1.5;
                practicalGain *= 0.5;
                creativeGain *= 1.0;
                break;
            case ExperienceSource.EXPERIMENTATION:
                knowledgeGain *= 0.8;
                practicalGain *= 1.2;
                creativeGain *= 2.0;
                break;
            case ExperienceSource.TEACHING:
                knowledgeGain *= 1.5;
                practicalGain *= 1.0;
                creativeGain *= 1.3;
                break;
        }
        // Apply personality influence to components
        const traits = this.convertProfileToTraits(this.personality.getProfile());
        if (traits.openness > 0.7) {
            creativeGain *= 1.3;
            knowledgeGain *= 1.1;
        }
        if (traits.conscientiousness > 0.7) {
            knowledgeGain *= 1.3;
        }
        if (traits.extraversion > 0.7) {
            practicalGain *= 1.2;
        }
        return {
            knowledge: knowledgeGain * personalityModifier,
            practical: practicalGain * personalityModifier,
            creative: creativeGain * personalityModifier
        };
    }
    /**
     * Calculate synergy bonus (placeholder for now)
     */
    calculateSynergyBonus(skill, event) {
        // This would be expanded with the skill synergy system
        return 0.1; // Base synergy bonus
    }
    /**
     * Calculate plateau modifier
     */
    calculatePlateauModifier(skill) {
        // Check if skill is at a plateau
        const plateauLevel = skill.proficiency.plateauLevel;
        const currentLevel = skill.proficiency.level;
        if (plateauLevel > 0 && currentLevel <= plateauLevel + 5) {
            // Still near plateau - reduced learning
            return 0.7;
        }
        return 0.0; // No plateau modifier
    }
    /**
     * Analyze learning patterns and generate insights
     */
    analyzeLearning(skill, event) {
        const recentSessions = this.getRecentLearningSessions(skill.type, 10);
        // Calculate learning velocity (experience per hour)
        const learningVelocity = this.calculateLearningVelocity(recentSessions);
        // Calculate retention rate
        const retentionRate = this.calculateRetentionRate(skill);
        // Calculate transfer potential
        const transferPotential = this.calculateTransferPotential(skill);
        // Identify optimal contexts
        const optimalContexts = this.identifyOptimalContexts(recentSessions);
        // Recommend learning methods
        const recommendedMethods = this.recommendLearningMethods(skill, recentSessions);
        // Calculate personality alignment
        const personalityAlignment = this.calculatePersonalityAlignment(skill);
        // Calculate learning efficiency
        const learningEfficiency = this.calculateLearningEfficiency(recentSessions);
        return {
            skillType: skill.type,
            learningVelocity,
            retentionRate,
            transferPotential,
            optimalContexts,
            recommendedMethods,
            personalityAlignment,
            learningEfficiency
        };
    }
    /**
     * Get recent learning sessions for skill
     */
    getRecentLearningSessions(skillType, count) {
        return this.learningHistory
            .filter(session => session.skillType === skillType)
            .slice(-count);
    }
    /**
     * Calculate learning velocity
     */
    calculateLearningVelocity(sessions) {
        if (sessions.length === 0)
            return 0;
        const totalExperience = sessions.reduce((sum, session) => sum + session.experienceGained, 0);
        const totalTime = sessions.reduce((sum, session) => sum + session.duration, 0);
        const hours = totalTime / (1000 * 60 * 60);
        return hours > 0 ? totalExperience / hours : 0;
    }
    /**
     * Calculate retention rate
     */
    calculateRetentionRate(skill) {
        const retentionRate = skill.learning.retentionRate;
        const timeSinceLastUse = Date.now() - skill.usage.lastUsed;
        const daysSinceLastUse = timeSinceLastUse / (1000 * 60 * 60 * 24);
        // Apply time-based decay
        const decayFactor = Math.exp(-this.config.timeDecayRate * daysSinceLastUse);
        return retentionRate * decayFactor;
    }
    /**
     * Calculate transfer potential
     */
    calculateTransferPotential(skill) {
        return skill.learning.transferAbility;
    }
    /**
     * Identify optimal learning contexts
     */
    identifyOptimalContexts(sessions) {
        const contextPerformance = {};
        sessions.forEach(session => {
            const context = session.context.situation;
            if (!contextPerformance[context]) {
                contextPerformance[context] = { totalExp: 0, count: 0 };
            }
            contextPerformance[context].totalExp += session.experienceGained;
            contextPerformance[context].count++;
        });
        // Calculate average experience per context and sort
        const contextAverages = Object.entries(contextPerformance)
            .map(([context, data]) => ({
            context,
            average: data.totalExp / data.count
        }))
            .sort((a, b) => b.average - a.average);
        return contextAverages.slice(0, 3).map(item => item.context);
    }
    /**
     * Recommend learning methods based on performance
     */
    recommendLearningMethods(skill, sessions) {
        // For now, return the skill's existing effective methods
        // This could be enhanced with analysis of recent performance
        return skill.learning.learningMethods
            .sort((a, b) => b.effectiveness - a.effectiveness)
            .slice(0, 3);
    }
    /**
     * Calculate personality alignment with skill
     */
    calculatePersonalityAlignment(skill) {
        const personalityProfile = this.personality.getProfile();
        const traits = this.convertProfileToTraits(personalityProfile);
        const skillModifiers = skill.learning.personalityModifiers;
        // Calculate how well personality matches skill requirements
        const alignment = Object.entries(skillModifiers)
            .reduce((sum, [trait, value]) => {
            const traitValue = traits[trait] || 0.5;
            const match = 1 - Math.abs(traitValue - value);
            return sum + match;
        }, 0) / Object.keys(skillModifiers).length;
        return alignment;
    }
    /**
     * Calculate learning efficiency
     */
    calculateLearningEfficiency(sessions) {
        if (sessions.length === 0)
            return 0;
        const successfulSessions = sessions.filter(session => session.outcomes.some(outcome => outcome.includes('success'))).length;
        return successfulSessions / sessions.length;
    }
    /**
     * Determine adaptations needed based on learning analysis
     */
    determineAdaptations(skill, analysis) {
        const adaptations = [];
        // Low learning velocity
        if (analysis.learningVelocity < 10) {
            adaptations.push('increase_practice_frequency');
            adaptations.push('try_different_contexts');
        }
        // Low retention rate
        if (analysis.retentionRate < 0.6) {
            adaptations.push('implement_spaced_repetition');
            adaptations.push('add_review_sessions');
        }
        // Low personality alignment
        if (analysis.personalityAlignment < 0.5) {
            adaptations.push('adjust_learning_approach');
            adaptations.push('consider_alternative_skills');
        }
        // Low efficiency
        if (analysis.learningEfficiency < 0.7) {
            adaptations.push('focus_on_fundamentals');
            adaptations.push('reduce_difficulty_temporarily');
        }
        return adaptations;
    }
    /**
     * Update learning metrics
     */
    updateMetrics(event, analysis) {
        this.metrics.totalExperienceProcessed += event.amount;
        this.metrics.averageLearningRate =
            (this.metrics.averageLearningRate + analysis.learningVelocity) / 2;
        this.metrics.personalityInfluence = analysis.personalityAlignment;
        this.metrics.contextEffects = event.contextBonus;
        // Check for breakthrough
        if (event.source === ExperienceSource.BREAKTHROUGH) {
            this.metrics.breakthroughCount++;
        }
    }
    /**
     * Update adaptive modifiers based on learning performance
     */
    updateAdaptiveModifiers(skillType, analysis) {
        const currentModifier = this.adaptiveModifiers.get(skillType) || 1.0;
        // Adjust based on learning efficiency
        let adjustment = 1.0;
        if (analysis.learningEfficiency > 0.8) {
            adjustment = 1.1; // Increase rate for efficient learning
        }
        else if (analysis.learningEfficiency < 0.5) {
            adjustment = 0.9; // Decrease rate for inefficient learning
        }
        // Apply adaptive learning rate
        const newModifier = currentModifier + (adjustment - 1.0) * this.config.adaptiveLearningRate;
        this.adaptiveModifiers.set(skillType, Math.max(0.5, Math.min(1.5, newModifier)));
    }
    /**
     * Record learning session
     */
    recordLearningSession(session) {
        this.learningHistory.push(session);
        // Keep history manageable
        if (this.learningHistory.length > 1000) {
            this.learningHistory = this.learningHistory.slice(-500);
        }
    }
    /**
     * Get learning metrics
     */
    getMetrics() {
        return { ...this.metrics };
    }
    /**
     * Get learning history
     */
    getLearningHistory(skillType) {
        if (skillType) {
            return this.learningHistory.filter(session => session.skillType === skillType);
        }
        return [...this.learningHistory];
    }
    /**
     * Get adaptive modifiers
     */
    getAdaptiveModifiers() {
        return new Map(this.adaptiveModifiers);
    }
    /**
     * Reset learning engine
     */
    reset() {
        this.metrics = this.initializeMetrics();
        this.learningHistory = [];
        this.adaptiveModifiers.clear();
    }
}
