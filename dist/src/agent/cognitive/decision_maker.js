/**
 * Purpose-Driven Decision Maker
 *
 * Integrates personality, motivations, values, and ethics to calculate
 * utility scores for action selection. Always respects reactive interrupts.
 */
export class PurposeDrivenDecisionMaker {
    personality;
    motivations;
    values;
    ethics;
    WEIGHTS = {
        purpose: 0.4,
        personality: 0.3,
        motivations: 0.2,
        ethics: 0.1
    };
    constructor(personality, motivations, values, ethics) {
        this.personality = personality;
        this.motivations = motivations;
        this.values = values;
        this.ethics = ethics;
    }
    /**
     * Calculate utility score for an action option
     */
    calculateUtility(action, context) {
        // Skip calculation for emergency situations - reactive handles this
        if (context.urgency === 'emergency') {
            return {
                totalUtility: 0,
                purposeUtility: 0,
                personalityUtility: 0,
                motivationUtility: 0,
                ethicsUtility: 0,
                breakdown: {
                    purpose: 0,
                    personality: 0,
                    motivations: 0,
                    values: 0,
                    ethics: 0
                },
                reasoning: 'Emergency situation - deferring to reactive system'
            };
        }
        // Check ethical constraints first
        const ethicalEvaluation = this.ethics.evaluateAction(action.type, {
            ...context,
            innocent_bystanders: context.socialContext.neutrals_nearby.length > 0,
            allies_nearby: context.socialContext.allies_nearby.length > 0,
            life_threatening: context.environmentalFactors.danger_level > 0.8,
            social_context: context.socialContext.allies_nearby.length > 0 ||
                context.socialContext.neutrals_nearby.length > 0,
            survival_need: context.urgency === 'high'
        });
        // If action violates absolute constraints, return zero utility
        if (!ethicalEvaluation.permissible) {
            return {
                totalUtility: 0,
                purposeUtility: 0,
                personalityUtility: 0,
                motivationUtility: 0,
                ethicsUtility: -1,
                breakdown: {
                    purpose: 0,
                    personality: 0,
                    motivations: 0,
                    values: 0,
                    ethics: ethicalEvaluation.ethicalScore
                },
                reasoning: ethicalEvaluation.reasoning
            };
        }
        // Calculate component utilities
        const purposeUtility = this.calculatePurposeUtility(action, context);
        const personalityUtility = this.calculatePersonalityUtility(action, context);
        const motivationUtility = this.calculateMotivationUtility(action, context);
        const valuesUtility = this.calculateValuesUtility(action, context);
        const ethicsUtility = ethicalEvaluation.ethicalScore;
        // Weight and combine utilities
        const totalUtility = purposeUtility * this.WEIGHTS.purpose +
            personalityUtility * this.WEIGHTS.personality +
            motivationUtility * this.WEIGHTS.motivations +
            ethicsUtility * this.WEIGHTS.ethics;
        return {
            totalUtility: Math.max(0, Math.min(1, totalUtility)),
            purposeUtility,
            personalityUtility,
            motivationUtility,
            ethicsUtility,
            breakdown: {
                purpose: purposeUtility,
                personality: personalityUtility,
                motivations: motivationUtility,
                values: valuesUtility,
                ethics: ethicsUtility
            },
            reasoning: this.generateReasoning(action, context, {
                purpose: purposeUtility,
                personality: personalityUtility,
                motivations: motivationUtility,
                values: valuesUtility,
                ethics: ethicsUtility
            })
        };
    }
    /**
     * Calculate purpose-based utility
     */
    calculatePurposeUtility(action, context) {
        let utility = 0.5; // Neutral baseline
        // Consider alignment with primary goals
        const primaryMotivation = this.motivations.getPrimaryMotivation();
        const motivationAlignment = this.getMotivationAlignment(action.type, primaryMotivation.type);
        utility += motivationAlignment * 0.3;
        // Consider situational appropriateness
        const situationalFit = this.getSituationalFit(action, context);
        utility += situationalFit * 0.2;
        // Consider resource efficiency
        const resourceEfficiency = this.calculateResourceEfficiency(action, context);
        utility += resourceEfficiency * 0.2;
        // Consider risk vs reward
        const riskReward = this.calculateRiskReward(action, context);
        utility += riskReward * 0.3;
        return Math.max(0, Math.min(1, utility));
    }
    /**
     * Calculate personality-based utility
     */
    calculatePersonalityUtility(action, context) {
        return this.personality.calculateActionInfluence(action.type, context);
    }
    /**
     * Calculate motivation-based utility
     */
    calculateMotivationUtility(action, context) {
        return this.motivations.calculateActionInfluence(action.type, context);
    }
    /**
     * Calculate values-based utility
     */
    calculateValuesUtility(action, context) {
        return this.values.calculateActionInfluence(action.type, context);
    }
    /**
     * Get alignment of action with motivation type
     */
    getMotivationAlignment(actionType, motivationType) {
        const alignments = {
            'survival': {
                'gather_food': 1, 'build_shelter': 0.9, 'craft_tools': 0.8,
                'secure_area': 0.9, 'heal': 0.8, 'flee_danger': 1
            },
            'achievement': {
                'complete_project': 1, 'improve_skill': 0.9, 'acquire_resource': 0.8,
                'build_impressive': 0.9, 'compete': 0.7, 'explore': 0.6
            },
            'social': {
                'help_ally': 1, 'trade': 0.8, 'communicate': 0.9,
                'form_alliance': 0.9, 'share_resources': 0.7, 'defend_ally': 0.8
            },
            'exploration': {
                'explore': 1, 'discover': 0.9, 'map_area': 0.8,
                'investigate': 0.9, 'find_rare': 0.8, 'adventure': 0.9
            },
            'creation': {
                'build': 1, 'craft': 0.9, 'create_art': 0.8,
                'design': 0.9, 'innovate': 0.8, 'construct': 0.9
            }
        };
        return alignments[motivationType]?.[actionType] ?? 0.3;
    }
    /**
     * Calculate how well action fits current situation
     */
    getSituationalFit(action, context) {
        let fit = 0.5;
        // Danger level considerations
        if (context.environmentalFactors.danger_level > 0.7) {
            if (action.type.includes('defend') || action.type.includes('flee') || action.type.includes('secure')) {
                fit += 0.3;
            }
            else if (action.type.includes('explore') || action.type.includes('create')) {
                fit -= 0.3;
            }
        }
        // Resource scarcity considerations
        if (context.environmentalFactors.resource_scarcity > 0.7) {
            if (action.type.includes('gather') || action.type.includes('craft') || action.type.includes('trade')) {
                fit += 0.3;
            }
            else if (action.type.includes('share') || action.type.includes('waste')) {
                fit -= 0.2;
            }
        }
        // Social context considerations
        if (context.socialContext.allies_nearby.length > 0) {
            if (action.type.includes('cooperate') || action.type.includes('help') || action.type.includes('trade')) {
                fit += 0.2;
            }
        }
        if (context.socialContext.enemies_nearby.length > 0) {
            if (action.type.includes('defend') || action.type.includes('flee') || action.type.includes('prepare')) {
                fit += 0.3;
            }
            else if (action.type.includes('explore') || action.type.includes('relax')) {
                fit -= 0.3;
            }
        }
        return Math.max(0, Math.min(1, fit));
    }
    /**
     * Calculate resource efficiency
     */
    calculateResourceEfficiency(action, context) {
        const cost = action.expectedOutcome.resource_cost;
        const benefits = action.expectedOutcome.benefits.length;
        if (cost === 0)
            return 1;
        // Check if required resources are available
        const hasResources = action.requirements.every(req => context.availableResources[req] >= 1);
        if (!hasResources)
            return 0;
        // Efficiency = benefits / cost
        const efficiency = benefits / (cost + 1);
        return Math.max(0, Math.min(1, efficiency));
    }
    /**
     * Calculate risk vs reward ratio
     */
    calculateRiskReward(action, context) {
        const successProb = action.expectedOutcome.success_probability;
        const riskCount = action.expectedOutcome.risks.length;
        const benefitCount = action.expectedOutcome.benefits.length;
        // Basic risk-reward calculation
        const riskFactor = Math.max(0, 1 - (riskCount * 0.2));
        const rewardFactor = Math.min(1, benefitCount * 0.3);
        const probabilityFactor = successProb;
        return (riskFactor + rewardFactor + probabilityFactor) / 3;
    }
    /**
     * Generate reasoning for decision
     */
    generateReasoning(action, context, breakdown) {
        const reasons = [];
        if (breakdown.purpose > 0.7) {
            reasons.push('strongly aligns with primary goals');
        }
        else if (breakdown.purpose < 0.3) {
            reasons.push('poorly aligned with current objectives');
        }
        if (breakdown.personality > 0.7) {
            reasons.push('fits personality profile');
        }
        else if (breakdown.personality < 0.3) {
            reasons.push('conflicts with personality traits');
        }
        if (breakdown.motivations > 0.7) {
            reasons.push('meets current motivational drives');
        }
        else if (breakdown.motivations < 0.3) {
            reasons.push('doesn\'t address current motivations');
        }
        if (breakdown.values > 0.7) {
            reasons.push('aligns with core values');
        }
        else if (breakdown.values < 0.3) {
            reasons.push('conflicts with important values');
        }
        if (breakdown.ethics > 0.7) {
            reasons.push('ethically sound');
        }
        else if (breakdown.ethics < 0.3) {
            reasons.push('has ethical concerns');
        }
        return reasons.length > 0 ? reasons.join('; ') : 'acceptable option';
    }
    /**
     * Select best action from options
     */
    selectBestAction(options, context) {
        // Calculate utilities for all options
        const utilities = options.map(action => ({
            action,
            utility: this.calculateUtility(action, context)
        }));
        // Sort by utility (highest first)
        utilities.sort((a, b) => b.utility.totalUtility - a.utility.totalUtility);
        const best = utilities[0];
        return {
            action: best?.action || null,
            utility: best?.utility || {
                totalUtility: 0,
                purposeUtility: 0,
                personalityUtility: 0,
                motivationUtility: 0,
                ethicsUtility: 0,
                breakdown: { purpose: 0, personality: 0, motivations: 0, values: 0, ethics: 0 },
                reasoning: 'No valid actions available'
            },
            allUtilities: utilities
        };
    }
    /**
     * Update decision systems based on experience
     */
    updateFromExperience(action, outcome, context) {
        const outcomeValue = outcome === 'success' ? 1 : outcome === 'failure' ? -1 : 0;
        // Update personality
        const personalityExperience = {
            success: outcome === 'success',
            intensity: Math.abs(outcomeValue),
            traitInfluences: this.getPersonalityInfluences(action.type, outcomeValue),
            context
        };
        this.personality.updateFromExperience(personalityExperience);
        // Update motivations
        const motivationEvent = {
            type: outcome === 'success' ? 'success' : outcome === 'failure' ? 'failure' : 'progress',
            motivationType: this.getPrimaryMotivationForAction(action.type),
            impact: outcomeValue * 0.5,
            context
        };
        this.motivations.update(0, [motivationEvent]);
        // Update values
        const valueEvent = {
            type: 'action_taken',
            affectedValues: this.getValuesForAction(action.type),
            reinforcement: outcomeValue * 0.3,
            context
        };
        this.values.update(0, [valueEvent]);
        // Update ethics
        this.ethics.updateFromExperience(action.type, outcomeValue, context);
    }
    /**
     * Get personality influences for experience
     */
    getPersonalityInfluences(actionType, outcome) {
        const influences = {};
        // Map actions to personality traits
        const actionTraits = {
            'explore': ['openness', 'curiosity'],
            'build': ['conscientiousness', 'creativity'],
            'socialize': ['extraversion', 'agreeableness'],
            'compete': ['competitiveness', 'riskTolerance'],
            'create': ['creativity', 'openness']
        };
        const traits = actionTraits[actionType] || [];
        traits.forEach(trait => {
            influences[trait] = outcome * 0.1;
        });
        return influences;
    }
    /**
     * Get primary motivation for action type
     */
    getPrimaryMotivationForAction(actionType) {
        const motivationMap = {
            'gather_food': 'survival',
            'build_shelter': 'survival',
            'complete_project': 'achievement',
            'help_ally': 'social',
            'explore': 'exploration',
            'create': 'creation'
        };
        return motivationMap[actionType] || 'survival';
    }
    /**
     * Get values affected by action
     */
    getValuesForAction(actionType) {
        const valueMap = {
            'help_ally': ['compassion', 'cooperation', 'loyalty'],
            'attack': ['courage', 'justice'],
            'share_resources': ['cooperation', 'compassion'],
            'build': ['creativity', 'growth'],
            'explore': ['freedom', 'knowledge', 'courage']
        };
        return valueMap[actionType] || [];
    }
    /**
     * Check if decision maker should yield to reactive system
     */
    shouldYieldToReactive(context) {
        return context.urgency === 'emergency' ||
            context.environmentalFactors.danger_level > 0.9 ||
            context.timeConstraints < 1000; // Less than 1 second
    }
}
