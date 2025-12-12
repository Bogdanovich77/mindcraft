/**
 * Reputation System
 *
 * Comprehensive reputation tracking and management system
 * Following the established patterns from cognitive components
 */
import { InteractionType } from './relationship_types.js';
/**
 * Reputation calculation and tracking system
 */
export class ReputationSystem {
    config;
    reputationCache;
    domainReputations; // agent -> domain -> score
    constructor(config) {
        this.config = {
            globalWeight: 0.4,
            domainWeight: 0.4,
            traitWeight: 0.2,
            accomplishmentWeight: 0.3,
            endorsementWeight: 0.4,
            criticismWeight: 0.3,
            decayRate: 0.005, // 0.5% per hour
            updateThreshold: 5,
            ...config
        };
        this.reputationCache = new Map();
        this.domainReputations = new Map();
    }
    /**
     * Get agent's reputation
     */
    getReputation(agentId) {
        if (this.reputationCache.has(agentId)) {
            return this.reputationCache.get(agentId);
        }
        // Initialize new reputation
        const newReputation = {
            globalScore: 0.5, // Neutral starting point
            domainScores: new Map(),
            traits: this.createDefaultReputationTraits(),
            accomplishments: [],
            endorsements: [],
            criticisms: [],
            lastUpdated: Date.now()
        };
        this.reputationCache.set(agentId, newReputation);
        return newReputation;
    }
    /**
     * Update reputation based on interaction
     */
    updateReputation(agentId, interaction, context, witnessIds = []) {
        const reputation = this.getReputation(agentId);
        const impact = this.calculateReputationImpact(interaction, context);
        // Update global score
        const globalChange = impact.global * this.config.globalWeight;
        reputation.globalScore = Math.max(0, Math.min(1, reputation.globalScore + globalChange));
        // Update domain scores
        const domains = this.extractDomainsFromInteraction(interaction);
        domains.forEach(domain => {
            const currentScore = reputation.domainScores.get(domain) || 0.5;
            const domainChange = impact.domain * this.config.domainWeight;
            reputation.domainScores.set(domain, Math.max(0, Math.min(1, currentScore + domainChange)));
        });
        // Update trait scores
        this.updateTraitScores(reputation.traits, impact.traits);
        // Add accomplishment if significant
        if (impact.significance > 0.7 && interaction.outcome.success) {
            this.addAccomplishment(reputation, interaction, domains[0], witnessIds);
        }
        // Process endorsements and criticisms from witnesses
        this.processWitnessFeedback(reputation, interaction, witnessIds);
        // Apply time-based decay
        this.applyReputationDecay(reputation);
        reputation.lastUpdated = Date.now();
        this.reputationCache.set(agentId, reputation);
        return reputation;
    }
    /**
     * Add endorsement to agent's reputation
     */
    addEndorsement(agentId, endorserId, trait, strength, context) {
        const reputation = this.getReputation(agentId);
        const endorserReputation = this.getReputation(endorserId);
        // Weight endorsement by endorser's reputation
        const endorserWeight = Math.max(0.1, endorserReputation.globalScore);
        const endorsement = {
            endorserId,
            trait,
            strength: Math.max(0, Math.min(1, strength)),
            timestamp: Date.now(),
            context,
            weight: endorserWeight * this.config.endorsementWeight
        };
        reputation.endorsements.push(endorsement);
        // Update trait score based on endorsement
        this.applyEndorsementToTrait(reputation.traits, endorsement);
        // Keep only recent endorsements (last 100)
        reputation.endorsements = reputation.endorsements
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, 100);
        this.reputationCache.set(agentId, reputation);
    }
    /**
     * Add criticism to agent's reputation
     */
    addCriticism(agentId, criticId, issue, severity, context, validity = 0.5) {
        const reputation = this.getReputation(agentId);
        const criticReputation = this.getReputation(criticId);
        // Weight criticism by critic's reputation and validity
        const criticWeight = Math.max(0.1, criticReputation.globalScore);
        const effectiveWeight = criticWeight * validity * this.config.criticismWeight;
        const criticism = {
            criticId,
            issue,
            severity: Math.max(0, Math.min(1, severity)),
            timestamp: Date.now(),
            context,
            validity
        };
        reputation.criticisms.push(criticism);
        // Apply criticism impact to global score and traits
        const globalImpact = criticism.severity * effectiveWeight * -0.1;
        reputation.globalScore = Math.max(0, Math.min(1, reputation.globalScore + globalImpact));
        this.applyCriticismToTraits(reputation.traits, criticism, effectiveWeight);
        // Keep only recent criticisms (last 50)
        reputation.criticisms = reputation.criticisms
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, 50);
        this.reputationCache.set(agentId, reputation);
    }
    /**
     * Calculate reputation propagation through social network
     */
    calculatePropagatedReputation(agentId, networkConnections, // agentId -> connection strength
    maxDepth = 2) {
        const directReputation = this.getReputation(agentId).globalScore;
        if (maxDepth <= 0 || networkConnections.size === 0) {
            return directReputation;
        }
        let propagatedScore = directReputation * 0.6; // 60% weight to direct
        let networkWeight = 0.4;
        // Calculate weighted average of connected agents' reputations
        let totalWeight = 0;
        let weightedSum = 0;
        networkConnections.forEach((strength, connectedAgentId) => {
            const connectedReputation = this.getReputation(connectedAgentId).globalScore;
            const weight = strength * networkWeight;
            weightedSum += connectedReputation * weight;
            totalWeight += weight;
        });
        if (totalWeight > 0) {
            propagatedScore += weightedSum / totalWeight;
        }
        return Math.max(0, Math.min(1, propagatedScore));
    }
    /**
     * Get domain-specific reputation
     */
    getDomainReputation(agentId, domain) {
        const reputation = this.getReputation(agentId);
        return reputation.domainScores.get(domain) || reputation.globalScore;
    }
    /**
     * Predict reputation trajectory
     */
    predictReputationTrajectory(agentId, recentInteractions, timeframe // milliseconds
    ) {
        const reputation = this.getReputation(agentId);
        const current = reputation.globalScore;
        if (recentInteractions.length === 0) {
            return {
                current,
                predicted: this.applyDecayProjection(current, timeframe),
                trend: 'stable',
                confidence: 0.5
            };
        }
        // Analyze recent interaction trends
        const positiveInteractions = recentInteractions.filter(i => i.outcome.success && i.outcome.mutualBenefit > 0.5).length;
        const negativeInteractions = recentInteractions.filter(i => !i.outcome.success || i.outcome.emotionalImpact < -0.5).length;
        const trendScore = (positiveInteractions - negativeInteractions) / recentInteractions.length;
        // Calculate prediction based on trend and decay
        const hoursPassed = timeframe / (1000 * 60 * 60);
        const decayFactor = Math.pow(1 - this.config.decayRate, hoursPassed);
        const trendFactor = 1 + (trendScore * 0.1 * hoursPassed / 24);
        const predicted = Math.max(0, Math.min(1, current * decayFactor * trendFactor));
        let trend;
        if (predicted > current + 0.05) {
            trend = 'improving';
        }
        else if (predicted < current - 0.05) {
            trend = 'declining';
        }
        else {
            trend = 'stable';
        }
        const confidence = Math.min(0.9, recentInteractions.length / 20);
        return { current, predicted, trend, confidence };
    }
    /**
     * Get reputation summary for display
     */
    getReputationSummary(agentId) {
        const reputation = this.getReputation(agentId);
        // Get top domains
        const topDomains = Array.from(reputation.domainScores.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([domain, score]) => ({ domain, score }));
        // Get top traits
        const topTraits = Object.entries(reputation.traits)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([trait, score]) => ({ trait, score: score }));
        // Calculate trend based on recent activity
        const recentEndorsements = reputation.endorsements.filter(e => Date.now() - e.timestamp < 7 * 24 * 60 * 60 * 1000).length;
        const recentCriticism = reputation.criticisms.filter(c => Date.now() - c.timestamp < 7 * 24 * 60 * 60 * 1000).length;
        let trend;
        if (recentEndorsements > recentCriticism * 2) {
            trend = 'improving';
        }
        else if (recentCriticism > recentEndorsements * 2) {
            trend = 'declining';
        }
        else {
            trend = 'stable';
        }
        return {
            globalScore: reputation.globalScore,
            topDomains,
            topTraits,
            recentAccomplishments: reputation.accomplishments.length,
            endorsementCount: reputation.endorsements.length,
            criticismCount: reputation.criticisms.length,
            trend
        };
    }
    /**
     * Create default reputation traits
     */
    createDefaultReputationTraits() {
        return {
            reliability: 0.5,
            competence: 0.5,
            friendliness: 0.5,
            honesty: 0.5,
            generosity: 0.5,
            courage: 0.5,
            creativity: 0.5,
            leadership: 0.5,
            loyalty: 0.5
        };
    }
    /**
     * Calculate reputation impact from interaction
     */
    calculateReputationImpact(interaction, context) {
        const success = interaction.outcome.success;
        const mutualBenefit = interaction.outcome.mutualBenefit;
        const emotionalImpact = interaction.outcome.emotionalImpact;
        const satisfaction = interaction.outcome.satisfaction;
        let globalImpact = 0;
        let domainImpact = 0;
        const traits = {};
        // Calculate base impact
        const baseImpact = success ?
            mutualBenefit * 0.1 + satisfaction * 0.05 :
            -0.1 * (1 - satisfaction);
        globalImpact = baseImpact;
        domainImpact = baseImpact * 1.2; // Domain impact is stronger
        // Apply interaction-specific trait impacts
        switch (interaction.type) {
            case InteractionType.COLLABORATION:
                traits.reliability = success ? 0.08 : -0.12;
                traits.competence = success ? 0.1 : -0.08;
                traits.leadership = success ? 0.05 : -0.05;
                break;
            case InteractionType.HELP:
                traits.generosity = success ? 0.12 : -0.08;
                traits.reliability = success ? 0.08 : -0.1;
                traits.friendliness = success ? 0.06 : -0.04;
                break;
            case InteractionType.TRADE:
                traits.honesty = success ? 0.1 : -0.15;
                traits.reliability = success ? 0.06 : -0.1;
                break;
            case InteractionType.CONFLICT:
                traits.courage = success ? 0.08 : -0.05;
                traits.leadership = success ? 0.06 : -0.08;
                traits.friendliness = -0.1; // Conflict always reduces friendliness
                break;
            case InteractionType.SUPPORT:
                traits.friendliness = success ? 0.1 : -0.06;
                traits.generosity = success ? 0.08 : -0.05;
                traits.loyalty = success ? 0.06 : -0.04;
                break;
            case InteractionType.CONVERSATION:
                traits.friendliness = success ? 0.04 : -0.06;
                traits.honesty = success ? 0.02 : -0.04;
                break;
            case InteractionType.COMPETITION:
                traits.competence = success ? 0.08 : -0.06;
                traits.courage = success ? 0.05 : -0.03;
                break;
            case InteractionType.EXPLORATION:
                traits.creativity = success ? 0.1 : -0.04;
                traits.courage = success ? 0.08 : -0.06;
                break;
            case InteractionType.CELEBRATION:
                traits.friendliness = 0.08;
                traits.generosity = 0.06;
                traits.leadership = 0.04;
                break;
        }
        // Apply emotional impact modifier
        const emotionalModifier = 1 + Math.abs(emotionalImpact) * 0.3;
        Object.keys(traits).forEach(trait => {
            traits[trait] *= emotionalModifier;
        });
        globalImpact *= emotionalModifier;
        domainImpact *= emotionalModifier;
        // Calculate significance
        const significance = Math.abs(baseImpact) +
            (mutualBenefit * 0.3) +
            (Math.abs(emotionalImpact) * 0.2);
        return {
            global: globalImpact,
            domain: domainImpact,
            traits,
            significance: Math.max(0, Math.min(1, significance))
        };
    }
    /**
     * Extract domains from interaction
     */
    extractDomainsFromInteraction(interaction) {
        const domains = [];
        switch (interaction.type) {
            case InteractionType.COLLABORATION:
                domains.push('teamwork', 'project_management');
                break;
            case InteractionType.HELP:
                domains.push('support', 'assistance');
                break;
            case InteractionType.TRADE:
                domains.push('commerce', 'negotiation');
                break;
            case InteractionType.CONFLICT:
                domains.push('combat', 'dispute_resolution');
                break;
            case InteractionType.COMPETITION:
                domains.push('competition', 'skill');
                break;
            case InteractionType.EXPLORATION:
                domains.push('exploration', 'discovery');
                break;
            case InteractionType.CELEBRATION:
                domains.push('social', 'community');
                break;
            default:
                domains.push('general');
        }
        // Extract domain from context if available
        if (interaction.context) {
            const contextDomains = interaction.context.split(' ')
                .filter(word => ['building', 'mining', 'crafting', 'combat', 'social'].includes(word));
            domains.push(...contextDomains);
        }
        return [...new Set(domains)]; // Remove duplicates
    }
    /**
     * Update trait scores
     */
    updateTraitScores(traits, updates) {
        Object.entries(updates).forEach(([trait, change]) => {
            if (change !== undefined && trait in traits) {
                const currentScore = traits[trait];
                const newScore = Math.max(0, Math.min(1, currentScore + change));
                traits[trait] = newScore;
            }
        });
    }
    /**
     * Add accomplishment to reputation
     */
    addAccomplishment(reputation, interaction, domain, witnesses) {
        const accomplishment = {
            id: `acc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            description: this.generateAccomplishmentDescription(interaction),
            domain,
            impact: this.calculateAccomplishmentImpact(interaction),
            witnesses,
            timestamp: Date.now(),
            verified: witnesses.length > 0
        };
        reputation.accomplishments.push(accomplishment);
        // Keep only recent accomplishments (last 50)
        reputation.accomplishments = reputation.accomplishments
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, 50);
    }
    /**
     * Generate accomplishment description
     */
    generateAccomplishmentDescription(interaction) {
        const action = interaction.type.replace('_', ' ');
        const context = interaction.context || 'an activity';
        return `Successfully completed ${action} in ${context}`;
    }
    /**
     * Calculate accomplishment impact
     */
    calculateAccomplishmentImpact(interaction) {
        return Math.min(1, interaction.outcome.mutualBenefit * 0.6 +
            interaction.outcome.satisfaction * 0.4);
    }
    /**
     * Process witness feedback for interactions
     */
    processWitnessFeedback(reputation, interaction, witnessIds) {
        // This would be implemented with actual witness feedback
        // For now, it's a placeholder for future enhancement
    }
    /**
     * Apply endorsement to trait
     */
    applyEndorsementToTrait(traits, endorsement) {
        const trait = endorsement.trait.toLowerCase();
        if (trait in traits) {
            const currentScore = traits[trait];
            const change = endorsement.strength * endorsement.weight * 0.1;
            traits[trait] = Math.max(0, Math.min(1, currentScore + change));
        }
    }
    /**
     * Apply criticism to traits
     */
    applyCriticismToTraits(traits, criticism, weight) {
        const issue = criticism.issue.toLowerCase();
        // Map issue keywords to traits
        const traitMapping = {
            'unreliable': 'reliability',
            'incompetent': 'competence',
            'unfriendly': 'friendliness',
            'dishonest': 'honesty',
            'selfish': 'generosity',
            'cowardly': 'courage',
            'uncreative': 'creativity',
            'poor_leader': 'leadership'
        };
        const affectedTrait = traitMapping[issue];
        if (affectedTrait) {
            const currentScore = traits[affectedTrait];
            const change = criticism.severity * weight * -0.1;
            traits[affectedTrait] = Math.max(0, Math.min(1, currentScore + change));
        }
    }
    /**
     * Apply time-based decay to reputation
     */
    applyReputationDecay(reputation) {
        const now = Date.now();
        const hoursSinceUpdate = (now - reputation.lastUpdated) / (1000 * 60 * 60);
        if (hoursSinceUpdate < 1)
            return; // No decay for less than 1 hour
        const decayFactor = Math.pow(1 - this.config.decayRate, hoursSinceUpdate);
        // Apply decay to global score (minimum 0.1)
        reputation.globalScore = Math.max(0.1, reputation.globalScore * decayFactor);
        // Apply decay to domain scores
        reputation.domainScores.forEach((score, domain) => {
            reputation.domainScores.set(domain, Math.max(0.1, score * decayFactor));
        });
        // Apply decay to traits (minimum 0.1)
        Object.keys(reputation.traits).forEach(trait => {
            const currentScore = reputation.traits[trait];
            reputation.traits[trait] = Math.max(0.1, currentScore * decayFactor);
        });
    }
    /**
     * Apply decay projection for prediction
     */
    applyDecayProjection(currentScore, timeframe) {
        const hoursPassed = timeframe / (1000 * 60 * 60);
        const decayFactor = Math.pow(1 - this.config.decayRate, hoursPassed);
        return Math.max(0.1, currentScore * decayFactor);
    }
    /**
     * Get configuration
     */
    getConfig() {
        return { ...this.config };
    }
    /**
     * Update configuration
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
    }
    /**
     * Clear reputation cache
     */
    clearCache() {
        this.reputationCache.clear();
        this.domainReputations.clear();
    }
    /**
     * Get cache statistics
     */
    getCacheStats() {
        return {
            reputationCacheSize: this.reputationCache.size,
            domainCacheSize: this.domainReputations.size,
            memoryUsage: this.calculateMemoryUsage()
        };
    }
    /**
     * Calculate approximate memory usage
     */
    calculateMemoryUsage() {
        let size = 0;
        // Estimate reputation cache size
        this.reputationCache.forEach(reputation => {
            size += JSON.stringify(reputation).length * 2; // Rough byte estimate
        });
        // Estimate domain cache size
        this.domainReputations.forEach(domainMap => {
            size += domainMap.size * 20; // Rough estimate per entry
        });
        return size;
    }
}
//# sourceMappingURL=reputation_system.js.map