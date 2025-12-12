/**
 * Dynamic Motivation System
 *
 * Drives agent behavior through evolving motivational states.
 * Motivations influence goal generation and action selection but never override reactive survival.
 */
export class MotivationSystem {
    profile;
    DEFAULT_DECAY_RATE = 0.01;
    SATIATION_DECAY_RATE = 0.02;
    constructor(initialProfile) {
        this.profile = {
            motivations: this.createDefaultMotivations(),
            primaryMotivation: 'survival',
            motivationVolatility: 0.3,
            ...initialProfile
        };
    }
    /**
     * Create default motivation set
     */
    createDefaultMotivations() {
        const motivations = new Map();
        motivations.set('survival', {
            type: 'survival',
            strength: 0.8,
            persistence: 0.9,
            satiation: 0.3,
            satiationThreshold: 0.7,
            decayRate: 0.005,
            lastUpdate: Date.now()
        });
        motivations.set('achievement', {
            type: 'achievement',
            strength: 0.6,
            persistence: 0.7,
            satiation: 0.5,
            satiationThreshold: 0.6,
            decayRate: 0.01,
            lastUpdate: Date.now()
        });
        motivations.set('social', {
            type: 'social',
            strength: 0.5,
            persistence: 0.6,
            satiation: 0.6,
            satiationThreshold: 0.5,
            decayRate: 0.015,
            lastUpdate: Date.now()
        });
        motivations.set('exploration', {
            type: 'exploration',
            strength: 0.4,
            persistence: 0.5,
            satiation: 0.7,
            satiationThreshold: 0.4,
            decayRate: 0.02,
            lastUpdate: Date.now()
        });
        motivations.set('creation', {
            type: 'creation',
            strength: 0.3,
            persistence: 0.4,
            satiation: 0.8,
            satiationThreshold: 0.3,
            decayRate: 0.025,
            lastUpdate: Date.now()
        });
        return motivations;
    }
    /**
     * Update all motivations based on time and events
     */
    update(deltaTime, events = []) {
        const currentTime = Date.now();
        // Update each motivation
        this.profile.motivations.forEach((motivation, type) => {
            // Natural decay
            motivation.strength = Math.max(0.1, motivation.strength - motivation.decayRate * deltaTime);
            // Satiation decay
            motivation.satiation = Math.max(0, motivation.satiation - this.SATIATION_DECAY_RATE * deltaTime);
            // Reduce strength if satiation is high
            if (motivation.satiation > motivation.satiationThreshold) {
                const satiationPenalty = (motivation.satiation - motivation.satiationThreshold) * 0.1;
                motivation.strength = Math.max(0.1, motivation.strength - satiationPenalty);
            }
            motivation.lastUpdate = currentTime;
        });
        // Process events
        events.forEach(event => this.processMotivationEvent(event));
        // Update primary motivation
        this.updatePrimaryMotivation();
    }
    /**
     * Process motivation-altering events
     */
    processMotivationEvent(event) {
        const motivation = this.profile.motivations.get(event.motivationType);
        if (!motivation)
            return;
        const volatility = this.profile.motivationVolatility;
        let strengthChange = event.impact * volatility;
        // Modify impact based on event type
        switch (event.type) {
            case 'success':
                strengthChange *= 1.5;
                motivation.satiation = Math.min(1, motivation.satiation + 0.2);
                break;
            case 'failure':
                strengthChange *= 1.2;
                motivation.satiation = Math.max(0, motivation.satiation - 0.1);
                break;
            case 'progress':
                strengthChange *= 1.0;
                motivation.satiation = Math.min(1, motivation.satiation + 0.05);
                break;
            case 'setback':
                strengthChange *= 0.8;
                motivation.satiation = Math.max(0, motivation.satiation - 0.05);
                break;
        }
        // Apply persistence modifier
        strengthChange *= motivation.persistence;
        // Update motivation strength
        motivation.strength = Math.max(0.1, Math.min(1, motivation.strength + strengthChange));
    }
    /**
     * Update the primary motivation based on current strengths
     */
    updatePrimaryMotivation() {
        let maxStrength = 0;
        let primaryType = 'survival';
        this.profile.motivations.forEach((motivation, type) => {
            if (motivation.strength > maxStrength) {
                maxStrength = motivation.strength;
                primaryType = type;
            }
        });
        this.profile.primaryMotivation = primaryType;
    }
    /**
     * Get current motivation profile
     */
    getProfile() {
        return {
            ...this.profile,
            motivations: new Map(this.profile.motivations)
        };
    }
    /**
     * Get motivation strength for a specific type
     */
    getMotivationStrength(type) {
        return this.profile.motivations.get(type)?.strength || 0;
    }
    /**
     * Get primary motivation type and strength
     */
    getPrimaryMotivation() {
        const primary = this.profile.motivations.get(this.profile.primaryMotivation);
        return {
            type: this.profile.primaryMotivation,
            strength: primary?.strength || 0
        };
    }
    /**
     * Calculate motivation influence on action selection
     */
    calculateActionInfluence(actionType, context) {
        let influence = 0;
        let totalWeight = 0;
        this.profile.motivations.forEach((motivation, type) => {
            const weight = this.getActionMotivationWeight(actionType, type);
            if (weight > 0) {
                influence += motivation.strength * weight;
                totalWeight += weight;
            }
        });
        return totalWeight > 0 ? influence / totalWeight : 0.5;
    }
    /**
     * Get weight of motivation for specific action type
     */
    getActionMotivationWeight(actionType, motivationType) {
        const weights = {
            'gather_food': { survival: 0.8, achievement: 0.2, social: 0.1, exploration: 0.1, creation: 0.0 },
            'build_shelter': { survival: 0.7, achievement: 0.3, social: 0.2, exploration: 0.0, creation: 0.4 },
            'craft_tools': { survival: 0.6, achievement: 0.4, social: 0.1, exploration: 0.1, creation: 0.3 },
            'explore': { survival: 0.3, achievement: 0.3, social: 0.2, exploration: 0.9, creation: 0.1 },
            'socialize': { survival: 0.1, achievement: 0.2, social: 0.9, exploration: 0.2, creation: 0.1 },
            'create': { survival: 0.2, achievement: 0.5, social: 0.3, exploration: 0.2, creation: 0.9 },
            'trade': { survival: 0.4, achievement: 0.4, social: 0.6, exploration: 0.2, creation: 0.2 },
            'combat': { survival: 0.8, achievement: 0.3, social: 0.1, exploration: 0.1, creation: 0.0 }
        };
        return weights[actionType]?.[motivationType] || 0;
    }
    /**
     * Generate goals based on current motivations
     */
    generateGoals() {
        const goals = [];
        this.profile.motivations.forEach((motivation, type) => {
            if (motivation.strength > 0.5) {
                const goalTypes = this.getGoalTypesForMotivation(type);
                goalTypes.forEach(goalType => {
                    goals.push({
                        type: goalType,
                        priority: motivation.strength,
                        motivation: type
                    });
                });
            }
        });
        // Sort by priority
        return goals.sort((a, b) => b.priority - a.priority);
    }
    /**
     * Get goal types associated with specific motivation
     */
    getGoalTypesForMotivation(motivationType) {
        const goalMap = {
            survival: ['gather_food', 'secure_shelter', 'maintain_health', 'acquire_tools'],
            achievement: ['complete_projects', 'improve_skills', 'accumulate_resources', 'build_impressive_structures'],
            social: ['form_alliances', 'trade_resources', 'help_others', 'establish_reputation'],
            exploration: ['discover_new_areas', 'map_territory', 'find_rare_resources', 'investigate_mysteries'],
            creation: ['build_unique_structures', 'create_art', 'innovate_designs', 'craft_masterpieces']
        };
        return goalMap[motivationType] || [];
    }
    /**
     * Check if motivation should trigger immediate action
     */
    shouldTriggerAction(motivationType) {
        const motivation = this.profile.motivations.get(motivationType);
        if (!motivation)
            return false;
        // High strength + low satiation = strong drive to act
        const urgency = motivation.strength * (1 - motivation.satiation);
        return urgency > 0.6;
    }
    /**
     * Create motivation system from legacy profile
     */
    static fromLegacyProfile(legacyProfile) {
        const motivationProfile = {};
        // Map legacy behaviors to motivations
        if (legacyProfile.behavior) {
            const motivations = new Map();
            // Base motivations from behavior patterns
            motivations.set('survival', {
                type: 'survival',
                strength: legacyProfile.behavior.survival_focused ? 0.9 : 0.7,
                persistence: 0.9,
                satiation: 0.3,
                satiationThreshold: 0.7,
                decayRate: 0.005,
                lastUpdate: Date.now()
            });
            motivations.set('achievement', {
                type: 'achievement',
                strength: legacyProfile.behavior.ambitious ? 0.8 : 0.5,
                persistence: legacyProfile.behavior.persistent ? 0.8 : 0.6,
                satiation: 0.5,
                satiationThreshold: 0.6,
                decayRate: 0.01,
                lastUpdate: Date.now()
            });
            motivations.set('social', {
                type: 'social',
                strength: legacyProfile.behavior.social ? 0.8 : 0.4,
                persistence: 0.6,
                satiation: 0.6,
                satiationThreshold: 0.5,
                decayRate: 0.015,
                lastUpdate: Date.now()
            });
            motivations.set('exploration', {
                type: 'exploration',
                strength: legacyProfile.behavior.explorer ? 0.8 : 0.4,
                persistence: 0.5,
                satiation: 0.7,
                satiationThreshold: 0.4,
                decayRate: 0.02,
                lastUpdate: Date.now()
            });
            motivations.set('creation', {
                type: 'creation',
                strength: legacyProfile.behavior.creative ? 0.8 : 0.3,
                persistence: 0.4,
                satiation: 0.8,
                satiationThreshold: 0.3,
                decayRate: 0.025,
                lastUpdate: Date.now()
            });
            motivationProfile.motivations = motivations;
        }
        return new MotivationSystem(motivationProfile);
    }
    /**
     * Export to legacy format
     */
    toLegacyProfile() {
        const motivations = this.profile.motivations;
        return {
            behavior: {
                survival_focused: (motivations.get('survival')?.strength ?? 0) > 0.7,
                ambitious: (motivations.get('achievement')?.strength ?? 0) > 0.6,
                social: (motivations.get('social')?.strength ?? 0) > 0.6,
                explorer: (motivations.get('exploration')?.strength ?? 0) > 0.6,
                creative: (motivations.get('creation')?.strength ?? 0) > 0.6,
                persistent: Array.from(motivations.values()).some(m => m.persistence > 0.7)
            }
        };
    }
}
//# sourceMappingURL=motivations.js.map