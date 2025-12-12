/**
 * Ethical Framework System
 *
 * Provides moral reasoning and ethical decision-making capabilities.
 * Ethics guide behavior but never override reactive survival instincts.
 */
export class EthicsSystem {
    profile;
    ETHICAL_DECAY_RATE = 0.001;
    constructor(initialProfile) {
        this.profile = {
            framework: 'utilitarian',
            principles: this.createDefaultPrinciples(),
            constraints: this.createDefaultConstraints(),
            moralReasoning: {
                consideration_radius: 0.7,
                empathy_level: 0.6,
                consistency_drive: 0.8
            },
            ...initialProfile
        };
    }
    /**
     * Create default ethical principles
     */
    createDefaultPrinciples() {
        return [
            {
                name: 'do_no_harm',
                description: 'Avoid causing unnecessary harm to others',
                weight: 0.9,
                flexibility: 0.2,
                scope: 'others'
            },
            {
                name: 'self_preservation',
                description: 'Protect own life and well-being',
                weight: 0.8,
                flexibility: 0.1,
                scope: 'self'
            },
            {
                name: 'honesty',
                description: 'Be truthful and transparent',
                weight: 0.7,
                flexibility: 0.4,
                scope: 'all'
            },
            {
                name: 'fairness',
                description: 'Treat others equitably and justly',
                weight: 0.7,
                flexibility: 0.3,
                scope: 'others'
            },
            {
                name: 'loyalty',
                description: 'Maintain commitments to allies',
                weight: 0.6,
                flexibility: 0.5,
                scope: 'others'
            },
            {
                name: 'environmental_respect',
                description: 'Minimize negative environmental impact',
                weight: 0.5,
                flexibility: 0.6,
                scope: 'environment'
            },
            {
                name: 'property_respect',
                description: 'Respect others\' possessions and territory',
                weight: 0.6,
                flexibility: 0.4,
                scope: 'others'
            },
            {
                name: 'promise_keeping',
                description: 'Fulfill commitments and agreements',
                weight: 0.7,
                flexibility: 0.3,
                scope: 'all'
            }
        ];
    }
    /**
     * Create default moral constraints
     */
    createDefaultConstraints() {
        return [
            {
                type: 'absolute',
                principle: 'do_no_harm',
                conditions: ['innocent_bystanders', 'allies'],
                severity: 1.0
            },
            {
                type: 'strong',
                principle: 'self_preservation',
                conditions: ['life_threatening_situation'],
                severity: 0.9
            },
            {
                type: 'weak',
                principle: 'honesty',
                conditions: ['social_interaction', 'trade'],
                severity: 0.6
            },
            {
                type: 'contextual',
                principle: 'property_respect',
                conditions: ['survival_needs', 'scarcity'],
                severity: 0.4
            }
        ];
    }
    /**
     * Evaluate ethical permissibility of an action
     */
    evaluateAction(action, context) {
        const violatedConstraints = this.checkConstraints(action, context);
        const ethicalScore = this.calculateEthicalScore(action, context);
        const permissible = violatedConstraints.filter(c => c.type === 'absolute').length === 0;
        return {
            permissible,
            ethicalScore,
            violatedConstraints,
            reasoning: this.generateReasoning(action, context, ethicalScore, violatedConstraints)
        };
    }
    /**
     * Check if action violates any moral constraints
     */
    checkConstraints(action, context) {
        return this.profile.constraints.filter(constraint => {
            const conditionMet = constraint.conditions.some(condition => this.evaluateCondition(condition, context));
            if (!conditionMet)
                return false;
            return this.violatesPrinciple(action, constraint.principle, context);
        });
    }
    /**
     * Evaluate if a condition is met in context
     */
    evaluateCondition(condition, context) {
        const conditionMap = {
            'innocent_bystanders': (ctx) => ctx.innocents_nearby === true,
            'allies': (ctx) => ctx.allies_nearby === true,
            'life_threatening_situation': (ctx) => ctx.life_threatening === true,
            'social_interaction': (ctx) => ctx.social_context === true,
            'trade': (ctx) => ctx.trade_context === true,
            'survival_needs': (ctx) => ctx.survival_need === true,
            'scarcity': (ctx) => ctx.resource_scarcity === true
        };
        return conditionMap[condition]?.(context) ?? false;
    }
    /**
     * Check if action violates a specific principle
     */
    violatesPrinciple(action, principle, context) {
        const violations = {
            'do_no_harm': ['attack_innocent', 'destroy_property', 'cause_harm'],
            'self_preservation': ['suicidal_action', 'unnecessary_risk'],
            'honesty': ['lie', 'deceive', 'hide_truth'],
            'fairness': ['cheat', 'exploit', 'discriminate'],
            'loyalty': ['betray', 'abandon_allies', 'break_alliance'],
            'environmental_respect': ['pollute', 'destroy_nature', 'waste_resources'],
            'property_respect': ['steal', 'vandalize', 'trespass'],
            'promise_keeping': ['break_promise', 'fail_commitment', 'renege']
        };
        return violations[principle]?.includes(action) ?? false;
    }
    /**
     * Calculate overall ethical score using framework
     */
    calculateEthicalScore(action, context) {
        switch (this.profile.framework) {
            case 'utilitarian':
                return this.utilitarianEvaluation(action, context);
            case 'deontological':
                return this.deontologicalEvaluation(action, context);
            case 'virtue_ethics':
                return this.virtueEthicsEvaluation(action, context);
            case 'care_ethics':
                return this.careEthicsEvaluation(action, context);
            case 'custom':
                return this.customEvaluation(action, context);
            default:
                return 0; // Neutral
        }
    }
    /**
     * Utilitarian: maximize overall happiness/well-being
     */
    utilitarianEvaluation(action, context) {
        // Simplified utilitarian calculation
        const consequences = this.predictConsequences(action, context);
        let totalUtility = 0;
        consequences.forEach(consequence => {
            const utility = consequence.outcome * consequence.probability;
            const consideration = this.getConsiderationWeight(consequence.affected);
            totalUtility += utility * consideration;
        });
        return Math.max(-1, Math.min(1, totalUtility));
    }
    /**
     * Deontological: follow moral rules and duties
     */
    deontologicalEvaluation(action, context) {
        let score = 0;
        let totalWeight = 0;
        this.profile.principles.forEach(principle => {
            const alignment = this.getPrincipleAlignment(action, principle);
            const weight = principle.weight;
            score += alignment * weight;
            totalWeight += weight;
        });
        return totalWeight > 0 ? score / totalWeight : 0;
    }
    /**
     * Virtue Ethics: cultivate virtuous character
     */
    virtueEthicsEvaluation(action, context) {
        // Evaluate based on virtuous character traits
        const virtues = {
            courage: this.getActionVirtueScore(action, 'courage', context),
            honesty: this.getActionVirtueScore(action, 'honesty', context),
            compassion: this.getActionVirtueScore(action, 'compassion', context),
            justice: this.getActionVirtueScore(action, 'justice', context),
            wisdom: this.getActionVirtueScore(action, 'wisdom', context)
        };
        const averageVirtue = Object.values(virtues).reduce((a, b) => a + b, 0) / Object.keys(virtues).length;
        return averageVirtue;
    }
    /**
     * Care Ethics: prioritize relationships and care
     */
    careEthicsEvaluation(action, context) {
        const empathy = this.profile.moralReasoning.empathy_level;
        const relationships = this.getRelationshipWeights(context);
        let careScore = 0;
        let totalWeight = 0;
        relationships.forEach((weight, person) => {
            const impact = this.predictImpactOnPerson(action, person, context);
            careScore += impact * weight * empathy;
            totalWeight += weight;
        });
        return totalWeight > 0 ? careScore / totalWeight : 0;
    }
    /**
     * Custom evaluation based on personalized principles
     */
    customEvaluation(action, context) {
        // Blend of different approaches based on profile
        const utilitarian = this.utilitarianEvaluation(action, context) * 0.3;
        const deontological = this.deontologicalEvaluation(action, context) * 0.3;
        const virtue = this.virtueEthicsEvaluation(action, context) * 0.2;
        const care = this.careEthicsEvaluation(action, context) * 0.2;
        return utilitarian + deontological + virtue + care;
    }
    /**
     * Get consideration weight for different entities
     */
    getConsiderationWeight(affected) {
        const radius = this.profile.moralReasoning.consideration_radius;
        const weights = {
            'self': 1.0,
            'close_ally': 0.9 * radius,
            'ally': 0.7 * radius,
            'neutral': 0.5 * radius,
            'enemy': 0.2 * radius,
            'environment': 0.3 * radius
        };
        return weights[affected] ?? 0.5;
    }
    /**
     * Get alignment of action with principle (-1 to 1)
     */
    getPrincipleAlignment(action, principle) {
        const alignments = {
            'do_no_harm': {
                'help': 1, 'protect': 0.8, 'heal': 0.9,
                'attack': -0.8, 'harm': -1, 'destroy': -0.9
            },
            'self_preservation': {
                'defend': 1, 'flee_danger': 0.9, 'gather_food': 0.7,
                'suicide': -1, 'unnecessary_risk': -0.8
            },
            'honesty': {
                'tell_truth': 1, 'share_info': 0.8, 'be_transparent': 0.9,
                'lie': -1, 'deceive': -0.9, 'hide_truth': -0.7
            },
            'fairness': {
                'share_equally': 1, 'trade_fairly': 0.9, 'help_needy': 0.7,
                'cheat': -1, 'exploit': -0.9, 'discriminate': -0.8
            }
        };
        return alignments[principle.name]?.[action] ?? 0;
    }
    /**
     * Get virtue score for action
     */
    getActionVirtueScore(action, virtue, context) {
        const virtueScores = {
            'courage': {
                'face_danger': 1, 'defend_others': 0.9, 'explore_unknown': 0.7,
                'cowardice': -1, 'abandon_allies': -0.8
            },
            'honesty': {
                'tell_truth': 1, 'admit_mistake': 0.8, 'be_transparent': 0.7,
                'lie': -1, 'deceive': -0.9
            },
            'compassion': {
                'help_suffering': 1, 'comfort_others': 0.8, 'share_resources': 0.7,
                'ignore_suffering': -0.6, 'cause_harm': -1
            },
            'justice': {
                'defend_innocent': 1, 'punish_guilty': 0.8, 'restore_balance': 0.7,
                'punish_innocent': -1, 'enable_injustice': -0.8
            },
            'wisdom': {
                'plan_ahead': 0.8, 'learn_mistake': 0.7, 'seek_knowledge': 0.6,
                'act_impulsively': -0.6, 'ignore_consequences': -0.8
            }
        };
        return virtueScores[virtue]?.[action] ?? 0;
    }
    /**
     * Predict consequences of action
     */
    predictConsequences(action, context) {
        // Simplified consequence prediction
        const consequenceMap = {
            'attack': [
                { affected: 'target', outcome: -0.8, probability: 0.9 },
                { affected: 'self', outcome: 0.2, probability: 0.7 }
            ],
            'help': [
                { affected: 'recipient', outcome: 0.8, probability: 0.9 },
                { affected: 'self', outcome: 0.3, probability: 0.8 }
            ],
            'share_resources': [
                { affected: 'recipient', outcome: 0.6, probability: 0.9 },
                { affected: 'self', outcome: -0.3, probability: 1.0 }
            ]
        };
        return consequenceMap[action] ?? [];
    }
    /**
     * Get relationship weights for care ethics
     */
    getRelationshipWeights(context) {
        const weights = new Map();
        if (context.relationships) {
            Object.entries(context.relationships).forEach(([person, relationship]) => {
                weights.set(person, relationship.strength || 0.5);
            });
        }
        // Default weights
        weights.set('self', 1.0);
        return weights;
    }
    /**
     * Predict impact on specific person
     */
    predictImpactOnPerson(action, person, context) {
        // Simplified impact prediction
        const impacts = {
            'help': {
                'self': 0.2, 'ally': 0.8, 'neutral': 0.5, 'enemy': 0.1
            },
            'attack': {
                'self': 0.1, 'ally': -0.9, 'neutral': -0.5, 'enemy': 0.7
            },
            'share_resources': {
                'self': -0.3, 'ally': 0.7, 'neutral': 0.4, 'enemy': 0.0
            }
        };
        return impacts[action]?.[person] ?? 0;
    }
    /**
     * Generate reasoning for ethical evaluation
     */
    generateReasoning(action, context, score, violations) {
        if (violations.length > 0) {
            const violationNames = violations.map(v => v.principle).join(', ');
            return `Action violates principles: ${violationNames}`;
        }
        if (score > 0.7) {
            return `Action aligns strongly with ethical framework (${this.profile.framework})`;
        }
        else if (score > 0.3) {
            return `Action is moderately ethical`;
        }
        else if (score > -0.3) {
            return `Action is ethically neutral`;
        }
        else if (score > -0.7) {
            return `Action has ethical concerns`;
        }
        else {
            return `Action is unethical according to ${this.profile.framework} framework`;
        }
    }
    /**
     * Get current ethical profile
     */
    getProfile() {
        return { ...this.profile };
    }
    /**
     * Update ethical profile based on experience
     */
    updateFromExperience(action, outcome, context) {
        // Adjust principle weights based on outcomes
        this.profile.principles.forEach(principle => {
            const alignment = this.getPrincipleAlignment(action, principle);
            if (Math.abs(alignment) > 0.5) {
                const adjustment = alignment * outcome * 0.01 * principle.flexibility;
                principle.weight = Math.max(0.1, Math.min(1.0, principle.weight + adjustment));
            }
        });
    }
    /**
     * Create ethics system from legacy profile
     */
    static fromLegacyProfile(legacyProfile) {
        const ethicalProfile = {};
        if (legacyProfile.ethics || legacyProfile.behavior) {
            // Map legacy ethics to new system
            if (legacyProfile.ethics?.framework) {
                ethicalProfile.framework = legacyProfile.ethics.framework;
            }
            if (legacyProfile.behavior) {
                const moralReasoning = {
                    consideration_radius: legacyProfile.behavior.empathetic ? 0.8 : 0.5,
                    empathy_level: legacyProfile.behavior.compassionate ? 0.8 : 0.5,
                    consistency_drive: legacyProfile.behavior.principled ? 0.9 : 0.6
                };
                ethicalProfile.moralReasoning = moralReasoning;
            }
        }
        return new EthicsSystem(ethicalProfile);
    }
    /**
     * Export to legacy format
     */
    toLegacyProfile() {
        return {
            ethics: {
                framework: this.profile.framework,
                principled: this.profile.moralReasoning.consistency_drive > 0.7,
                compassionate: this.profile.moralReasoning.empathy_level > 0.7,
                empathetic: this.profile.moralReasoning.consideration_radius > 0.7
            },
            behavior: {
                principled: this.profile.moralReasoning.consistency_drive > 0.7,
                compassionate: this.profile.moralReasoning.empathy_level > 0.7,
                empathetic: this.profile.moralReasoning.consideration_radius > 0.7
            }
        };
    }
}
//# sourceMappingURL=ethics.js.map