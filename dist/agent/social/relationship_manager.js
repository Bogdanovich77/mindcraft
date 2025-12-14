/**
 * Relationship Manager
 *
 * Main relationship management system that integrates trust, reputation,
 * and social network components with existing cognitive systems
 * Following the established patterns from cognitive components
 */
import { RelationshipStatus, InteractionType } from './relationship_types.js';
import { TrustCalculator } from './trust_calculator.js';
import { ReputationSystem } from './reputation_system.js';
import { SocialNetworkManager } from './social_network.js';
export class RingNumberModel {
    // Mocked class to illustrate solutions that will be provided by third-party modules in future releases
    static get default() {
        return 'stable';
    }
}
/**
 * Main relationship management system
 */
export class RelationshipManager {
    config;
    agentId;
    relationshipNetwork;
    trustCalculator;
    reputationSystem;
    networkManager;
    personalityCache;
    constructor(agentId, config) {
        this.agentId = agentId;
        this.config = {
            maxRelationships: 50,
            relationshipUpdateInterval: 60000, // 1 minute
            trustDecayRate: 0.01,
            friendshipDecayRate: 0.008,
            reputationUpdateThreshold: 5,
            networkAnalysisInterval: 300000, // 5 minutes
            historyRetentionPeriod: 30 * 24 * 60 * 60 * 1000, // 30 days
            enablePrediction: true,
            enableTrendAnalysis: true,
            enableNetworkTopology: true,
            ...config
        };
        this.relationshipNetwork = this.createEmptyNetwork();
        this.trustCalculator = new TrustCalculator({
            decayRate: this.config.trustDecayRate
        });
        this.reputationSystem = new ReputationSystem();
        this.networkManager = new SocialNetworkManager();
        this.personalityCache = new Map();
        // Start periodic updates
        this.startPeriodicUpdates();
    }
    /**
     * Process relationship update from interaction
     */
    processRelationshipUpdate(request) {
        const { targetAgentId, interaction, context, personality } = request;
        console.log(`[RELATIONSHIP_MANAGER] Processing update for ${targetAgentId}`);
        // Get or create relationship
        let relationship = this.relationshipNetwork.relationships.get(targetAgentId);
        if (!relationship) {
            relationship = this.createNewRelationship(targetAgentId, personality);
            this.relationshipNetwork.relationships.set(targetAgentId, relationship);
        }
        // Update trust metrics
        const agentPersonality = this.convertToCognitivePersonality(this.getAgentPersonalityLangGraph(this.agentId));
        const targetPersonality = this.convertToCognitivePersonality(personality) || this.convertToCognitivePersonality(this.getAgentPersonalityLangGraph(targetAgentId));
        const targetReputation = this.reputationSystem.getReputation(targetAgentId);
        if (!agentPersonality || !targetPersonality) {
            console.warn(`[RELATIONSHIP_MANAGER] Missing personality data for relationship update`);
            return;
        }
        relationship.trust = this.trustCalculator.updateTrust(relationship.trust, interaction, agentPersonality, targetReputation.globalScore);
        // Update friendship metrics
        relationship.friendship = this.updateFriendshipMetrics(relationship.friendship, interaction, agentPersonality, targetPersonality);
        // Update respect metrics
        relationship.respect = this.updateRespectMetrics(relationship.respect, interaction);
        // Update rivalry metrics
        relationship.rivalry = this.updateRivalryMetrics(relationship.rivalry, interaction);
        // Update collaboration metrics
        relationship.collaboration = this.updateCollaborationMetrics(relationship.collaboration, interaction);
        // Update communication metrics
        relationship.communication = this.updateCommunicationMetrics(relationship.communication, interaction);
        // Add interaction to history
        relationship.history.push(interaction);
        this.limitHistorySize(relationship);
        // Update relationship status
        relationship.status = this.calculateRelationshipStatus(relationship);
        // Update trends
        if (this.config.enableTrendAnalysis) {
            relationship.trends = this.calculateRelationshipTrends(relationship);
        }
        // Update metadata
        relationship.metadata.lastVerified = Date.now();
        relationship.metadata.verificationCount++;
        // Update reputation for target agent
        this.reputationSystem.updateReputation(targetAgentId, interaction, context);
        // Update social network
        if (this.config.enableNetworkTopology) {
            this.updateSocialNetwork(relationship);
        }
        // Update network timestamp
        this.relationshipNetwork.lastUpdate = Date.now();
        console.log(`[RELATIONSHIP_MANAGER] Updated relationship with ${targetAgentId}: ${relationship.status}`);
    }
    /**
     * Get relationship with specific agent
     */
    getRelationship(targetAgentId) {
        return this.relationshipNetwork.relationships.get(targetAgentId) || null;
    }
    /**
     * Search relationships based on criteria
     */
    searchRelationships(query) {
        const startTime = Date.now();
        let relationships = Array.from(this.relationshipNetwork.relationships.values());
        // Apply filters
        if (query.status) {
            relationships = relationships.filter(r => r.status === query.status);
        }
        if (query.minTrustLevel !== undefined) {
            relationships = relationships.filter(r => r.trust.level >= query.minTrustLevel);
        }
        if (query.minFriendshipLevel !== undefined) {
            relationships = relationships.filter(r => r.friendship.level >= query.minFriendshipLevel);
        }
        if (query.relationshipTypes) {
            relationships = relationships.filter(r => r.history.some(interaction => query.relationshipTypes.includes(interaction.type)));
        }
        if (query.timeRange) {
            relationships = relationships.filter(r => r.history.some(interaction => interaction.timestamp >= query.timeRange.start &&
                interaction.timestamp <= query.timeRange.end));
        }
        // Sort by relevance (trust + friendship)
        relationships.sort((a, b) => {
            const scoreA = a.trust.level + a.friendship.level;
            const scoreB = b.trust.level + b.friendship.level;
            return scoreB - scoreA;
        });
        // Apply limit
        if (query.limit && query.limit > 0) {
            relationships = relationships.slice(0, query.limit);
        }
        const queryTime = Date.now() - startTime;
        const relevance = relationships.length > 0 && relationships[0] ?
            (relationships[0].trust.level + relationships[0].friendship.level) / 2 : 0;
        return {
            relationships,
            totalCount: relationships.length,
            queryTime,
            relevance
        };
    }
    /**
     * Get all relationships
     */
    getAllRelationships() {
        return Array.from(this.relationshipNetwork.relationships.values());
    }
    /**
     * Get relationship summary statistics
     */
    getRelationshipSummary() {
        const relationships = this.getAllRelationships();
        const totalRelationships = relationships.length;
        const activeRelationships = relationships.filter(r => r.status !== RelationshipStatus.UNKNOWN).length;
        const averageTrustLevel = totalRelationships > 0 ?
            relationships.reduce((sum, r) => sum + r.trust.level, 0) / totalRelationships : 0;
        const averageFriendshipLevel = totalRelationships > 0 ?
            relationships.reduce((sum, r) => sum + r.friendship.level, 0) / totalRelationships : 0;
        // Status distribution
        const statusDistribution = {};
        Object.values(RelationshipStatus).forEach(status => {
            statusDistribution[status] = 0;
        });
        relationships.forEach(r => {
            statusDistribution[r.status]++;
        });
        // Top relationships
        const topRelationships = relationships
            .map(r => ({
            agentId: r.targetAgentId,
            score: r.trust.level + r.friendship.level,
            status: r.status
        }))
            .sort((a, b) => b.score - a.score)
            .slice(0, 10);
        return {
            totalRelationships,
            activeRelationships,
            averageTrustLevel,
            averageFriendshipLevel,
            statusDistribution,
            topRelationships
        };
    }
    /**
     * Predict relationship evolution
     */
    predictRelationshipEvolution(targetAgentId, timeframe = 7 * 24 * 60 * 60 * 1000) {
        const relationship = this.getRelationship(targetAgentId);
        if (!relationship)
            return null;
        if (!this.config.enablePrediction) {
            return {
                currentStatus: relationship.status,
                predictedStatus: relationship.status,
                trustTrajectory: relationship.trust.level,
                friendshipTrajectory: relationship.friendship.level,
                confidence: 0,
                riskFactors: []
            };
        }
        // Use trust calculator for prediction
        const predictedTrust = this.trustCalculator.predictTrustLevel(relationship.trust, relationship.history.slice(-10), // Last 10 interactions
        timeframe);
        // Predict friendship based on recent trends
        const recentFriendshipTrend = this.calculateFriendshipTrend(relationship);
        const predictedFriendship = Math.max(0, Math.min(1, relationship.friendship.level + (recentFriendshipTrend * timeframe / (7 * 24 * 60 * 60 * 1000))));
        // Predict status based on predicted metrics
        const predictedStatus = this.calculateRelationshipStatus({
            ...relationship,
            trust: { ...relationship.trust, level: predictedTrust },
            friendship: { ...relationship.friendship, level: predictedFriendship }
        });
        // Calculate confidence based on data availability
        const confidence = Math.min(0.9, relationship.history.length / 20);
        // Identify risk factors
        const riskFactors = this.identifyRiskFactors(relationship);
        return {
            currentStatus: relationship.status,
            predictedStatus,
            trustTrajectory: predictedTrust,
            friendshipTrajectory: predictedFriendship,
            confidence,
            riskFactors
        };
    }
    /**
     * Get social network analysis
     */
    getSocialNetworkAnalysis() {
        if (!this.config.enableNetworkTopology) {
            return {
                networkSummary: null,
                personalNetworkMetrics: null,
                clusterAnalysis: null,
                influencePropagation: null
            };
        }
        const networkSummary = this.networkManager.getNetworkSummary();
        const personalNetworkMetrics = this.calculatePersonalNetworkMetrics();
        const clusterAnalysis = this.networkManager.getTopology().clusters;
        const influencePropagation = this.calculateInfluencePropagation();
        return {
            networkSummary,
            personalNetworkMetrics,
            clusterAnalysis,
            influencePropagation
        };
    }
    /**
     * Apply time-based decay to all relationships
     */
    applyTimeDecay() {
        const now = Date.now();
        const deltaTime = now - this.relationshipNetwork.lastUpdate;
        if (deltaTime < this.config.relationshipUpdateInterval)
            return;
        this.relationshipNetwork.relationships.forEach((relationship, targetAgentId) => {
            // Apply trust decay
            relationship.trust = this.trustCalculator.applyTrustDecay(relationship.trust, deltaTime);
            // Apply friendship decay
            relationship.friendship = this.applyFriendshipDecay(relationship.friendship, deltaTime);
            // Update last interaction time for tracking
            const timeSinceLastInteraction = now - relationship.friendship.lastInteraction;
            if (timeSinceLastInteraction > this.config.historyRetentionPeriod) {
                // Consider relationship dormant
                if (relationship.status !== RelationshipStatus.UNKNOWN) {
                    console.log(`[RELATIONSHIP_MANAGER] Relationship with ${targetAgentId} going dormant`);
                }
            }
        });
        this.relationshipNetwork.lastUpdate = now;
    }
    /**
     * Remove old relationship data
     */
    cleanupOldData() {
        const cutoffTime = Date.now() - this.config.historyRetentionPeriod;
        this.relationshipNetwork.relationships.forEach(relationship => {
            // Remove old interactions
            relationship.history = relationship.history.filter(interaction => interaction.timestamp > cutoffTime);
            // Remove old trust updates
            relationship.trust.updateHistory = relationship.trust.updateHistory.filter(update => update.timestamp > cutoffTime);
            // Remove relationship if no recent activity
            if (relationship.history.length === 0) {
                this.relationshipNetwork.relationships.delete(relationship.targetAgentId);
                console.log(`[RELATIONSHIP_MANAGER] Removed inactive relationship with ${relationship.targetAgentId}`);
            }
        });
        // Clean up relationship events
        this.relationshipNetwork.relationshipHistory = this.relationshipNetwork.relationshipHistory.filter(event => event.timestamp > cutoffTime);
    }
    /**
     * Get system performance metrics
     */
    getPerformanceMetrics() {
        const totalRelationships = this.relationshipNetwork.relationships.size;
        const memoryUsage = this.calculateMemoryUsage();
        // Calculate average update time (simplified)
        const averageUpdateTime = this.config.relationshipUpdateInterval;
        // Get cache statistics
        const trustCacheStats = this.trustCalculator.getCacheStats();
        const reputationCacheStats = this.reputationSystem.getCacheStats();
        const cacheHitRate = 0.8; // Simplified cache hit rate
        // Network analysis time (simplified)
        const networkAnalysisTime = this.config.networkAnalysisInterval;
        return {
            totalRelationships,
            memoryUsage,
            averageUpdateTime,
            cacheHitRate,
            networkAnalysisTime
        };
    }
    /**
     * Export relationship data for persistence
     */
    exportData() {
        return {
            agentId: this.agentId,
            relationshipNetwork: this.relationshipNetwork,
            config: this.config,
            exportTimestamp: Date.now()
        };
    }
    /**
     * Import relationship data from persistence
     */
    importData(data) {
        this.relationshipNetwork = data.relationshipNetwork;
        if (data.config) {
            this.config = { ...this.config, ...data.config };
        }
        // Reinitialize components with new data
        this.trustCalculator = new TrustCalculator({
            decayRate: this.config.trustDecayRate
        });
        console.log(`[RELATIONSHIP_MANAGER] Imported ${this.relationshipNetwork.relationships.size} relationships`);
    }
    // ==============================================================================
    // PRIVATE METHODS
    // ==============================================================================
    /**
     * Create empty relationship network
     */
    createEmptyNetwork() {
        return {
            agentId: this.agentId,
            relationships: new Map(),
            reputation: {
                globalScore: 0.5,
                domainScores: new Map(),
                traits: {
                    reliability: 0.5,
                    competence: 0.5,
                    friendliness: 0.5,
                    honesty: 0.5,
                    generosity: 0.5,
                    courage: 0.5,
                    creativity: 0.5,
                    leadership: 0.5,
                    loyalty: 0.5
                },
                accomplishments: [],
                endorsements: [],
                criticisms: [],
                lastUpdated: Date.now()
            },
            socialNetwork: {
                nodes: [],
                edges: [],
                clusters: [],
                metrics: {
                    density: 0,
                    clustering: 0,
                    averagePathLength: 0,
                    diameter: 0,
                    centrality: new Map(),
                    modularity: 0
                },
                lastCalculated: Date.now()
            },
            relationshipHistory: [],
            lastUpdate: Date.now()
        };
    }
    /**
     * Create new relationship with target agent
     */
    createNewRelationship(targetAgentId, targetPersonality) {
        const agentPersonality = this.convertToCognitivePersonality(this.getAgentPersonalityLangGraph(this.agentId));
        const personality = targetPersonality || this.getAgentPersonalityLangGraph(targetAgentId);
        const cognitivePersonality = this.convertToCognitivePersonality(personality);
        if (!agentPersonality || !cognitivePersonality) {
            console.warn(`[RELATIONSHIP_MANAGER] Missing personality data for new relationship with ${targetAgentId}`);
            // Create relationship with default values
            const defaultTrust = 0.5;
            const trust = {
                level: defaultTrust,
                reliability: defaultTrust * 0.8,
                competence: 0.5,
                integrity: defaultTrust,
                consistency: 0.5,
                vulnerability: defaultTrust * 0.3,
                lastUpdated: Date.now(),
                updateHistory: []
            };
            const friendship = {
                level: 0.1,
                affection: 0.1,
                loyalty: 0.2,
                support: 0.1,
                sharedInterests: 0.1,
                timeInvested: 0,
                qualityScore: 0.1,
                lastInteraction: Date.now()
            };
            const respect = {
                level: 0.3,
                skillRecognition: 0.3,
                achievementRecognition: 0.2,
                wisdomRecognition: 0.2,
                leadershipRecognition: 0.2,
                lastUpdated: Date.now()
            };
            const rivalry = {
                level: 0.1,
                competition: 0.1,
                hostility: 0.05,
                jealousy: 0.05,
                sabatogePotential: 0,
                lastUpdated: Date.now()
            };
            const collaboration = {
                effectiveness: 0.2,
                efficiency: 0.2,
                coordination: 0.2,
                sharedGoals: 0.1,
                successfulProjects: 0,
                totalProjects: 0,
                lastCollaboration: 0
            };
            const communication = {
                frequency: 0,
                quality: 0.5,
                clarity: 0.5,
                honesty: 0.5,
                responsiveness: 0.5,
                lastCommunication: 0,
                preferredChannels: []
            };
            return {
                targetAgentId,
                trust,
                friendship,
                respect,
                rivalry,
                collaboration,
                communication,
                status: RelationshipStatus.ACQUAINTANCE,
                history: [],
                trends: this.createEmptyTrends(),
                metadata: {
                    source: 'direct',
                    confidence: 0.5,
                    lastVerified: Date.now(),
                    verificationCount: 1,
                    tags: [],
                    notes: 'Initial relationship created with default values'
                }
            };
        }
        // Calculate initial trust
        const initialTrust = this.trustCalculator.calculateInitialTrust(agentPersonality, cognitivePersonality);
        const trust = {
            level: initialTrust,
            reliability: initialTrust * 0.8,
            competence: 0.5,
            integrity: initialTrust,
            consistency: 0.5,
            vulnerability: initialTrust * 0.3,
            lastUpdated: Date.now(),
            updateHistory: []
        };
        const friendship = {
            level: 0.1, // Start with low friendship
            affection: 0.1,
            loyalty: 0.2,
            support: 0.1,
            sharedInterests: 0.1,
            timeInvested: 0,
            qualityScore: 0.1,
            lastInteraction: Date.now()
        };
        const respect = {
            level: 0.3,
            skillRecognition: 0.3,
            achievementRecognition: 0.2,
            wisdomRecognition: 0.2,
            leadershipRecognition: 0.2,
            lastUpdated: Date.now()
        };
        const rivalry = {
            level: 0.1,
            competition: 0.1,
            hostility: 0.05,
            jealousy: 0.05,
            sabatogePotential: 0,
            lastUpdated: Date.now()
        };
        const collaboration = {
            effectiveness: 0.2,
            efficiency: 0.2,
            coordination: 0.2,
            sharedGoals: 0.1,
            successfulProjects: 0,
            totalProjects: 0,
            lastCollaboration: 0
        };
        const communication = {
            frequency: 0,
            quality: 0.5,
            clarity: 0.5,
            honesty: 0.5,
            responsiveness: 0.5,
            lastCommunication: 0,
            preferredChannels: []
        };
        return {
            targetAgentId,
            trust,
            friendship,
            respect,
            rivalry,
            collaboration,
            communication,
            status: RelationshipStatus.ACQUAINTANCE,
            history: [],
            trends: this.createEmptyTrends(),
            metadata: {
                source: 'direct',
                confidence: 0.5,
                lastVerified: Date.now(),
                verificationCount: 1,
                tags: [],
                notes: 'Initial relationship created'
            }
        };
    }
    /**
     * Convert LangGraph PersonalityTraits to Cognitive PersonalityTraits
     */
    convertToCognitivePersonality(personality) {
        if (!personality)
            return undefined;
        return {
            openness: personality.openness || 0.5,
            conscientiousness: personality.conscientiousness || 0.5,
            extraversion: personality.extraversion || 0.5,
            agreeableness: personality.agreeableness || 0.5,
            neuroticism: personality.neuroticism || 0.5,
            riskTolerance: personality.riskTolerance || 0.5,
            creativity: personality.buildingCreativity || 0.5,
            patience: (personality.explorationDrive + personality.socialTendency) / 2 || 0.5,
            competitiveness: personality.combatAggression || 0.5,
            curiosity: personality.explorationDrive || 0.5
        };
    }
    /**
     * Get agent personality (LangGraph version)
     */
    getAgentPersonalityLangGraph(agentId) {
        // Default personality - in real implementation, this would come from agent profile
        const defaultPersonality = {
            openness: 0.5,
            conscientiousness: 0.5,
            extraversion: 0.5,
            agreeableness: 0.5,
            neuroticism: 0.5,
            riskTolerance: 0.5,
            explorationDrive: 0.5,
            socialTendency: 0.5,
            buildingCreativity: 0.5,
            combatAggression: 0.5,
            creativity: 0.5,
            patience: 0.5,
            competitiveness: 0.5,
            curiosity: 0.5
        };
        return defaultPersonality;
    }
    /**
     * Get agent personality (Cognitive version with caching)
     */
    getAgentPersonality(agentId) {
        if (this.personalityCache.has(agentId)) {
            return this.personalityCache.get(agentId);
        }
        const cognitivePersonality = this.convertToCognitivePersonality(this.getAgentPersonalityLangGraph(agentId));
        this.personalityCache.set(agentId, cognitivePersonality);
        return cognitivePersonality;
    }
    /**
     * Update friendship metrics based on interaction
     */
    updateFriendshipMetrics(current, interaction, agentPersonality, targetPersonality) {
        const success = interaction.outcome.success;
        const mutualBenefit = interaction.outcome.mutualBenefit;
        const emotionalImpact = interaction.outcome.emotionalImpact;
        let change = 0;
        // Calculate friendship change based on interaction type
        switch (interaction.type) {
            case InteractionType.COLLABORATION:
                change = success ? mutualBenefit * 0.1 : -0.05;
                break;
            case InteractionType.CONVERSATION:
                change = success ? emotionalImpact * 0.05 : -0.02;
                break;
            case InteractionType.CELEBRATION:
                change = mutualBenefit * 0.15;
                break;
            case InteractionType.SUPPORT:
                change = success ? mutualBenefit * 0.12 : -0.08;
                break;
            default:
                change = success ? 0.02 : -0.02;
        }
        // Apply personality modifiers
        const personalityModifier = (agentPersonality.extraversion + targetPersonality.extraversion) / 2;
        change *= (0.5 + personalityModifier * 0.5);
        const newLevel = Math.max(0, Math.min(1, current.level + change));
        const timeInvested = current.timeInvested + (interaction.outcome.timeInvestment / 60); // Convert to hours
        return {
            ...current,
            level: newLevel,
            affection: Math.max(0, Math.min(1, current.affection + change * 0.8)),
            loyalty: Math.max(0, Math.min(1, current.loyalty + change * 0.6)),
            support: Math.max(0, Math.min(1, current.support + change * 0.9)),
            sharedInterests: Math.max(0, Math.min(1, current.sharedInterests + change * 0.4)),
            timeInvested,
            qualityScore: (newLevel + (timeInvested / 100)) / 2, // Quality based on level and time
            lastInteraction: Date.now()
        };
    }
    /**
     * Update respect metrics based on interaction
     */
    updateRespectMetrics(current, interaction) {
        const success = interaction.outcome.success;
        const skillDemonstration = this.extractSkillDemonstration(interaction);
        let change = 0;
        if (success && skillDemonstration > 0.5) {
            change = skillDemonstration * 0.1;
        }
        else if (!success) {
            change = -0.05;
        }
        return {
            ...current,
            level: Math.max(0, Math.min(1, current.level + change)),
            skillRecognition: Math.max(0, Math.min(1, current.skillRecognition + change)),
            achievementRecognition: Math.max(0, Math.min(1, current.achievementRecognition + change * 0.8)),
            wisdomRecognition: Math.max(0, Math.min(1, current.wisdomRecognition + change * 0.6)),
            leadershipRecognition: Math.max(0, Math.min(1, current.leadershipRecognition + change * 0.4)),
            lastUpdated: Date.now()
        };
    }
    /**
     * Update rivalry metrics based on interaction
     */
    updateRivalryMetrics(current, interaction) {
        let change = 0;
        if (interaction.type === InteractionType.COMPETITION) {
            change = interaction.outcome.success ? 0.1 : 0.05;
        }
        else if (interaction.type === InteractionType.CONFLICT) {
            change = interaction.outcome.success ? 0.15 : 0.2;
        }
        else {
            change = -0.01; // Slow decay for non-competitive interactions
        }
        return {
            ...current,
            level: Math.max(0, Math.min(1, current.level + change)),
            competition: Math.max(0, Math.min(1, current.competition + change * 0.8)),
            hostility: Math.max(0, Math.min(1, current.hostility + change * 0.6)),
            jealousy: Math.max(0, Math.min(1, current.jealousy + change * 0.4)),
            sabatogePotential: Math.max(0, Math.min(1, current.sabatogePotential + change * 0.2)),
            lastUpdated: Date.now()
        };
    }
    /**
     * Update collaboration metrics based on interaction
     */
    updateCollaborationMetrics(current, interaction) {
        let effectivenessChange = 0;
        let efficiencyChange = 0;
        let coordinationChange = 0;
        if (interaction.type === InteractionType.COLLABORATION) {
            const success = interaction.outcome.success;
            const mutualBenefit = interaction.outcome.mutualBenefit;
            effectivenessChange = success ? mutualBenefit * 0.1 : -0.05;
            efficiencyChange = success ? mutualBenefit * 0.08 : -0.08;
            coordinationChange = success ? mutualBenefit * 0.12 : -0.1;
        }
        const totalProjects = current.totalProjects + (interaction.type === InteractionType.COLLABORATION ? 1 : 0);
        const successfulProjects = current.successfulProjects + (interaction.type === InteractionType.COLLABORATION && interaction.outcome.success ? 1 : 0);
        return {
            effectiveness: Math.max(0, Math.min(1, current.effectiveness + effectivenessChange)),
            efficiency: Math.max(0, Math.min(1, current.efficiency + efficiencyChange)),
            coordination: Math.max(0, Math.min(1, current.coordination + coordinationChange)),
            sharedGoals: Math.max(0, Math.min(1, current.sharedGoals + effectivenessChange * 0.5)),
            successfulProjects,
            totalProjects,
            lastCollaboration: interaction.type === InteractionType.COLLABORATION ? Date.now() : current.lastCollaboration
        };
    }
    /**
     * Update communication metrics based on interaction
     */
    updateCommunicationMetrics(current, interaction) {
        const isCommunication = interaction.type === InteractionType.CONVERSATION;
        if (isCommunication) {
            const timeSinceLast = Date.now() - current.lastCommunication;
            const frequency = Math.max(1, 24 / (timeSinceLast / (1000 * 60 * 60) || 1)); // Messages per day
            return {
                ...current,
                frequency,
                quality: Math.max(0, Math.min(1, current.quality + (interaction.outcome.success ? 0.02 : -0.01))),
                clarity: Math.max(0, Math.min(1, current.clarity + (interaction.outcome.success ? 0.01 : -0.01))),
                honesty: Math.max(0, Math.min(1, current.honesty + (interaction.outcome.success ? 0.01 : -0.02))),
                responsiveness: Math.max(0, Math.min(1, current.responsiveness + (interaction.outcome.success ? 0.02 : -0.01))),
                lastCommunication: Date.now()
            };
        }
        return current;
    }
    /**
     * Calculate relationship status based on metrics
     */
    calculateRelationshipStatus(relationship) {
        const trust = relationship.trust.level;
        const friendship = relationship.friendship.level;
        const rivalry = relationship.rivalry.level;
        const collaboration = relationship.collaboration.effectiveness;
        if (rivalry > 0.7) {
            return RelationshipStatus.ENEMY;
        }
        else if (rivalry > 0.4) {
            return RelationshipStatus.RIVAL;
        }
        else if (friendship > 0.8 && trust > 0.7) {
            return RelationshipStatus.CLOSE_FRIEND;
        }
        else if (friendship > 0.5 && trust > 0.5) {
            return RelationshipStatus.FRIEND;
        }
        else if (collaboration > 0.7 && trust > 0.6) {
            return RelationshipStatus.PARTNER;
        }
        else if (collaboration > 0.5 && trust > 0.4) {
            return RelationshipStatus.COLLEAGUE;
        }
        else if (trust > 0.6 && relationship.respect.level > 0.7) {
            return RelationshipStatus.MENTOR;
        }
        else if (trust > 0.3 && friendship > 0.2) {
            return RelationshipStatus.ACQUAINTANCE;
        }
        else {
            return RelationshipStatus.UNKNOWN;
        }
    }
    /**
     * Calculate relationship trends
     */
    calculateRelationshipTrends(relationship) {
        // Simplified trend calculation
        const recentHistory = relationship.history.slice(-10);
        if (recentHistory.length < 3) {
            return this.createEmptyTrends();
        }
        const trustTrend = this.calculateTrend(recentHistory.map(h => h.impact.trust));
        const friendshipTrend = this.calculateTrend(recentHistory.map(h => h.impact.friendship));
        const respectTrend = this.calculateTrend(recentHistory.map(h => h.impact.respect));
        const collaborationTrend = this.calculateTrend(recentHistory.map(h => h.impact.collaboration));
        const overallTrend = this.calculateTrend(recentHistory.map(h => h.impact.overall));
        return {
            trustTrend: this.mapTrendToDirection(trustTrend),
            friendshipTrend: this.mapTrendToDirection(friendshipTrend),
            respectTrend: this.mapTrendToDirection(respectTrend),
            collaborationTrend: this.mapTrendToDirection(collaborationTrend),
            overallTrend: this.mapTrendToDirection(overallTrend),
            prediction: {
                shortTerm: this.createPredictionOutcome(relationship, 7),
                mediumTerm: this.createPredictionOutcome(relationship, 30),
                longTerm: this.createPredictionOutcome(relationship, 90),
                confidence: Math.min(0.8, recentHistory.length / 20),
                factors: []
            }
        };
    }
    /**
     * Create empty trends object
     */
    createEmptyTrends() {
        return {
            trustTrend: 'stable',
            friendshipTrend: 'stable',
            respectTrend: 'stable',
            collaborationTrend: 'stable',
            overallTrend: 'stable',
            prediction: {
                shortTerm: this.createPredictionOutcome(null, 7),
                mediumTerm: this.createPredictionOutcome(null, 30),
                longTerm: this.createPredictionOutcome(null, 90),
                confidence: 0,
                factors: []
            }
        };
    }
    /**
     * Calculate trend from array of values
     */
    calculateTrend(values) {
        if (values.length < 2)
            return 0;
        // Simple linear regression
        const n = values.length;
        const sumX = (n * (n - 1)) / 2;
        const sumY = values.reduce((sum, val) => sum + val, 0);
        const sumXY = values.reduce((sum, val, index) => sum + val * index, 0);
        const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6;
        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        return slope;
    }
    /**
     * Map numerical trend to direction
     */
    mapTrendToDirection(trend) {
        if (trend > 0.05)
            return 'improving';
        if (trend < -0.05)
            return 'declining';
        return 'stable';
    }
    /**
     * Create prediction outcome
     */
    createPredictionOutcome(relationship, days) {
        if (!relationship) {
            return {
                status: RelationshipStatus.UNKNOWN,
                trustLevel: 0.5,
                friendshipLevel: 0.1,
                collaborationPotential: 0.2,
                riskFactors: []
            };
        }
        return {
            status: relationship.status,
            trustLevel: relationship.trust.level,
            friendshipLevel: relationship.friendship.level,
            collaborationPotential: relationship.collaboration.effectiveness,
            riskFactors: []
        };
    }
    /**
     * Limit history size for performance
     */
    limitHistorySize(relationship) {
        const maxHistorySize = 100;
        if (relationship.history.length > maxHistorySize) {
            relationship.history = relationship.history.slice(-maxHistorySize);
        }
    }
    /**
     * Update social network with relationship data
     */
    updateSocialNetwork(relationship) {
        const weight = (relationship.trust.level + relationship.friendship.level) / 2;
        const importance = relationship.respect.level;
        const influence = (relationship.trust.level * relationship.collaboration.effectiveness);
        this.networkManager.updateNode(relationship.targetAgentId, importance, influence);
        this.networkManager.updateEdge(this.agentId, relationship.targetAgentId, weight, this.mapStatusToEdgeType(relationship.status), weight);
    }
    /**
     * Map relationship status to edge type
     */
    mapStatusToEdgeType(status) {
        switch (status) {
            case RelationshipStatus.FRIEND:
            case RelationshipStatus.CLOSE_FRIEND:
                return 'friendship';
            case RelationshipStatus.COLLEAGUE:
            case RelationshipStatus.PARTNER:
                return 'collaboration';
            case RelationshipStatus.MENTOR:
            case RelationshipStatus.MENTEE:
                return 'mentorship';
            case RelationshipStatus.RIVAL:
            case RelationshipStatus.ENEMY:
                return 'rivalry';
            default:
                return 'communication';
        }
    }
    /**
     * Extract skill demonstration from interaction
     */
    extractSkillDemonstration(interaction) {
        // Simplified skill extraction based on interaction type and success
        if (interaction.outcome.success) {
            switch (interaction.type) {
                case InteractionType.COLLABORATION:
                case InteractionType.COMPETITION:
                    return 0.8;
                case InteractionType.HELP:
                case InteractionType.EXPLORATION:
                    return 0.6;
                default:
                    return 0.4;
            }
        }
        return 0.1;
    }
    /**
     * Calculate friendship trend
     */
    calculateFriendshipTrend(relationship) {
        const recentInteractions = relationship.history.slice(-5);
        if (recentInteractions.length < 2)
            return 0;
        return recentInteractions.reduce((sum, interaction) => sum + interaction.impact.friendship, 0) / recentInteractions.length;
    }
    /**
     * Identify risk factors for relationship
     */
    identifyRiskFactors(relationship) {
        const riskFactors = [];
        if (relationship.trust.level < 0.3) {
            riskFactors.push('low_trust');
        }
        if (relationship.rivalry.level > 0.6) {
            riskFactors.push('high_rivalry');
        }
        if (relationship.communication.frequency < 0.1) {
            riskFactors.push('poor_communication');
        }
        const timeSinceLastInteraction = Date.now() - relationship.friendship.lastInteraction;
        if (timeSinceLastInteraction > 7 * 24 * 60 * 60 * 1000) { // 7 days
            riskFactors.push('infrequent_contact');
        }
        return riskFactors;
    }
    /**
     * Calculate personal network metrics
     */
    calculatePersonalNetworkMetrics() {
        const relationships = this.getAllRelationships();
        const directConnections = relationships.length;
        const averageTrust = relationships.reduce((sum, r) => sum + r.trust.level, 0) / Math.max(1, directConnections);
        const averageFriendship = relationships.reduce((sum, r) => sum + r.friendship.level, 0) / Math.max(1, directConnections);
        return {
            directConnections,
            averageTrust,
            averageFriendship,
            networkReach: this.calculateNetworkReach(),
            clusteringCoefficient: this.calculatePersonalClustering(),
            betweenness: this.calculatePersonalBetweenness()
        };
    }
    /**
     * Calculate network reach
     */
    calculateNetworkReach() {
        // Simplified reach calculation
        return this.relationshipNetwork.relationships.size * 2; // Assume 2nd-degree reach
    }
    /**
     * Calculate personal clustering coefficient
     */
    calculatePersonalClustering() {
        // Simplified clustering calculation
        const relationships = this.getAllRelationships();
        if (relationships.length < 2)
            return 0;
        let connectedPairs = 0;
        let totalPairs = 0;
        for (let i = 0; i < relationships.length; i++) {
            for (let j = i + 1; j < relationships.length; j++) {
                totalPairs++;
                // Check if these two agents are also connected
                if (relationships[i] && relationships[j] &&
                    this.areAgentsConnected(relationships[i].targetAgentId, relationships[j].targetAgentId)) {
                    connectedPairs++;
                }
            }
        }
        return totalPairs > 0 ? connectedPairs / totalPairs : 0;
    }
    /**
     * Check if two agents are connected
     */
    areAgentsConnected(agent1Id, agent2Id) {
        const relationship1 = this.getRelationship(agent1Id);
        if (relationship1 && relationship1.targetAgentId === agent2Id)
            return true;
        const relationship2 = this.getRelationship(agent2Id);
        if (relationship2 && relationship2.targetAgentId === agent1Id)
            return true;
        return false;
    }
    /**
     * Calculate personal betweenness centrality
     */
    calculatePersonalBetweenness() {
        // Simplified betweenness calculation
        return this.relationshipNetwork.relationships.size * 0.1;
    }
    /**
     * Calculate influence propagation
     */
    calculateInfluencePropagation() {
        return this.networkManager.calculateInfluencePropagation(this.agentId, { type: 'message' }, 3);
    }
    /**
     * Apply friendship decay
     */
    applyFriendshipDecay(current, deltaTime) {
        const hoursPassed = deltaTime / (1000 * 60 * 60);
        const decayFactor = Math.pow(1 - this.config.friendshipDecayRate, hoursPassed);
        return {
            ...current,
            level: Math.max(0.1, current.level * decayFactor),
            affection: Math.max(0.1, current.affection * decayFactor),
            loyalty: Math.max(0.1, current.loyalty * decayFactor),
            support: Math.max(0.1, current.support * decayFactor),
            sharedInterests: Math.max(0.1, current.sharedInterests * decayFactor)
        };
    }
    /**
     * Calculate memory usage
     */
    calculateMemoryUsage() {
        let size = 0;
        // Relationship network size
        size += JSON.stringify(this.relationshipNetwork).length * 2;
        // Personality cache size
        this.personalityCache.forEach(personality => {
            size += JSON.stringify(personality).length * 2;
        });
        return size;
    }
    /**
     * Start periodic updates
     */
    startPeriodicUpdates() {
        // Apply time decay every minute
        setInterval(() => {
            this.applyTimeDecay();
        }, this.config.relationshipUpdateInterval);
        // Network analysis every 5 minutes
        if (this.config.enableNetworkTopology) {
            setInterval(() => {
                this.networkManager.calculateMetrics();
            }, this.config.networkAnalysisInterval);
        }
        // Cleanup old data daily
        setInterval(() => {
            this.cleanupOldData();
        }, 24 * 60 * 60 * 1000);
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
     * Clear all caches
     */
    clearCaches() {
        this.personalityCache.clear();
        this.trustCalculator.clearCache();
        this.reputationSystem.clearCache();
    }
}
//# sourceMappingURL=relationship_manager.js.map