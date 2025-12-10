/**
 * Social System Integration
 *
 * Integration layer for connecting the social relationship system
 * with existing cognitive components (PurposeCore, MemorySystem, etc.)
 * Following established patterns from cognitive components
 */
import { RelationshipManager } from './relationship_manager.js';
/**
 * Social System Integration Manager
 *
 * Coordinates social relationship processing with cognitive components
 */
export class SocialSystemIntegration {
    relationshipManager;
    purposeCore = null;
    memorySystem = null;
    learningEngine = null;
    agentId;
    isInitialized = false;
    // Performance monitoring
    lastUpdateTime = 0;
    updateCount = 0;
    averageUpdateTime = 0;
    constructor(agentId) {
        this.agentId = agentId;
        this.relationshipManager = new RelationshipManager(agentId);
    }
    /**
     * Initialize integration with cognitive components
     */
    async initialize(purposeCore, memorySystem, learningEngine) {
        try {
            console.log(`[SOCIAL_INTEGRATION] Initializing social system for agent ${this.agentId}`);
            // Set up cognitive component references
            this.purposeCore = purposeCore || null;
            this.memorySystem = memorySystem || null;
            this.learningEngine = learningEngine || null;
            // Initialize relationship manager with personality data
            if (this.purposeCore) {
                const state = this.purposeCore.getState();
                const personality = state.personality;
                if (personality) {
                    // Personality will be used when processing interactions
                    console.log(`[SOCIAL_INTEGRATION] Personality data available for social processing`);
                }
            }
            // Load existing relationship data from memory
            await this.loadRelationshipDataFromMemory();
            this.isInitialized = true;
            console.log(`[SOCIAL_INTEGRATION] Social system initialized successfully for agent ${this.agentId}`);
        }
        catch (error) {
            console.error(`[SOCIAL_INTEGRATION] Failed to initialize social system:`, error);
            throw error;
        }
    }
    /**
     * Process social interaction with full cognitive integration
     */
    async processSocialInteraction(request) {
        if (!this.isInitialized) {
            throw new Error('Social system not initialized. Call initialize() first.');
        }
        const startTime = Date.now();
        try {
            console.log(`[SOCIAL_INTEGRATION] Processing social interaction with ${request.targetAgentId}`);
            // Enhance interaction context with cognitive data
            const enhancedRequest = await this.enhanceInteractionContext(request);
            // Process relationship update
            this.relationshipManager.processRelationshipUpdate(enhancedRequest);
            // Update memory systems with social interaction
            await this.updateMemoryWithSocialInteraction(enhancedRequest);
            // Process learning from social interaction
            await this.processSocialLearning(enhancedRequest);
            // Update performance metrics
            this.updatePerformanceMetrics(startTime);
            console.log(`[SOCIAL_INTEGRATION] Social interaction processed in ${Date.now() - startTime}ms`);
        }
        catch (error) {
            console.error(`[SOCIAL_INTEGRATION] Error processing social interaction:`, error);
            throw error;
        }
    }
    /**
     * Get social decision factors for cognitive processing
     */
    async getSocialDecisionFactors(targetAgentId) {
        if (!this.isInitialized) {
            return this.getDefaultSocialFactors();
        }
        try {
            const factors = {
                trustLevel: 0.5,
                friendshipLevel: 0.5,
                reputationScore: 0.5,
                collaborationHistory: 0,
                recentInteractions: [],
                socialObligations: [],
                conflicts: [],
                allies: [],
                rivals: [],
                influenceLevel: 0.5,
                socialCohesion: 0.5
            };
            if (targetAgentId) {
                // Get specific relationship factors
                const relationship = this.relationshipManager.getRelationship(targetAgentId);
                if (relationship) {
                    factors.trustLevel = relationship.trust.level;
                    factors.friendshipLevel = relationship.friendship.level;
                    factors.collaborationHistory = relationship.collaboration.successfulProjects || 0;
                    factors.recentInteractions = relationship.history
                        .slice(-5)
                        .map(interaction => ({
                        agentId: targetAgentId,
                        type: interaction.type,
                        timestamp: interaction.timestamp,
                        outcome: interaction.outcome?.success || false,
                        impact: interaction.impact?.overall || 0
                    }));
                }
                // Get reputation for target agent
                const reputation = this.relationshipManager.getPerformanceMetrics();
                if (reputation) {
                    factors.reputationScore = 0.5; // Default reputation score
                    // Use network metrics for influence level
                }
            }
            // Get network-level factors
            const networkMetrics = this.relationshipManager.getPerformanceMetrics();
            factors.socialCohesion = 0.5; // Default cohesion
            factors.influenceLevel = Math.max(factors.influenceLevel, 0.5);
            // Get allies and rivals
            const allies = this.relationshipManager.searchRelationships({
                minTrustLevel: 0.7,
                minFriendshipLevel: 0.6
            });
            factors.allies = allies.relationships.map(r => r.targetAgentId);
            const rivals = this.relationshipManager.searchRelationships({});
            // Filter for low trust relationships
            factors.rivals = rivals.relationships
                .filter(r => r.trust.level < 0.3)
                .map(r => r.targetAgentId);
            return factors;
        }
        catch (error) {
            console.error(`[SOCIAL_INTEGRATION] Error getting social decision factors:`, error);
            return this.getDefaultSocialFactors();
        }
    }
    /**
     * Get relationship manager for direct access
     */
    getRelationshipManager() {
        return this.relationshipManager;
    }
    /**
     * Check if social system is initialized
     */
    isReady() {
        return this.isInitialized;
    }
    /**
     * Get performance metrics
     */
    getPerformanceMetrics() {
        return {
            updateCount: this.updateCount,
            averageUpdateTime: this.averageUpdateTime,
            lastUpdateTime: this.lastUpdateTime,
            isInitialized: this.isInitialized,
            relationshipMetrics: this.relationshipManager.getPerformanceMetrics()
        };
    }
    /**
     * Export social system data for persistence
     */
    async exportData() {
        if (!this.isInitialized) {
            throw new Error('Social system not initialized');
        }
        const relationshipData = this.relationshipManager.exportData();
        return {
            ...relationshipData,
            integrationMetrics: this.getPerformanceMetrics(),
            exportTimestamp: Date.now()
        };
    }
    /**
     * Import social system data from persistence
     */
    async importData(data) {
        try {
            // Import relationship data
            this.relationshipManager.importData(data);
            // Import integration metrics if available
            if (data.integrationMetrics) {
                this.updateCount = data.integrationMetrics.updateCount || 0;
                this.averageUpdateTime = data.integrationMetrics.averageUpdateTime || 0;
                this.lastUpdateTime = data.integrationMetrics.lastUpdateTime || 0;
            }
            console.log(`[SOCIAL_INTEGRATION] Social system data imported successfully`);
        }
        catch (error) {
            console.error(`[SOCIAL_INTEGRATION] Error importing social system data:`, error);
            throw error;
        }
    }
    /**
     * Enhance interaction context with cognitive data
     */
    async enhanceInteractionContext(request) {
        const enhanced = { ...request };
        // Add personality-based context if available
        if (this.purposeCore) {
            const state = this.purposeCore.getState();
            const personality = state.personality;
            if (personality) {
                const enhancedContext = enhanced.context;
                if (!enhancedContext.personalityFactors) {
                    enhancedContext.personalityFactors = {
                        agreeableness: personality.agreeableness || 0.5,
                        extraversion: personality.extraversion || 0.5,
                        openness: personality.openness || 0.5,
                        conscientiousness: personality.conscientiousness || 0.5,
                        neuroticism: personality.neuroticism || 0.5
                    };
                }
            }
            // Add motivation-based context
            const motivations = state.motivations;
            if (motivations) {
                const enhancedContext = enhanced.context;
                if (!enhancedContext.motivationFactors) {
                    enhancedContext.motivationFactors = {
                        socialConnection: motivations.find(m => m.type === 'social')?.intensity || 0.5,
                        achievement: motivations.find(m => m.type === 'achievement')?.intensity || 0.5,
                        cooperation: motivations.find(m => m.type === 'cooperation')?.intensity || 0.5
                    };
                }
            }
        }
        // Add memory-based context if available
        if (this.memorySystem) {
            try {
                // For now, skip memory context as the interface needs to be defined
                // This will be implemented when memory system integration is complete
                console.log(`[SOCIAL_INTEGRATION] Memory context integration pending`);
            }
            catch (error) {
                console.warn(`[SOCIAL_INTEGRATION] Error getting memory context:`, error);
            }
        }
        return enhanced;
    }
    /**
     * Update memory systems with social interaction
     */
    async updateMemoryWithSocialInteraction(request) {
        if (!this.memorySystem || !request.interaction) {
            return;
        }
        try {
            // Create episodic memory for social interaction
            const episodicMemory = {
                id: `social_${request.interaction.id}`,
                timestamp: request.interaction.timestamp,
                type: 'social_interaction',
                description: `Social interaction with ${request.targetAgentId}: ${request.interaction.context}`,
                emotionalWeight: request.interaction.outcome?.emotionalImpact || 0.5,
                significance: Math.abs(request.interaction.impact?.overall || 0),
                tags: ['social', request.interaction.type, request.targetAgentId],
                relatedAgents: [request.targetAgentId],
                location: request.context.location || null,
                participants: request.interaction.participants || [],
                outcome: {
                    success: request.interaction.outcome?.success || false,
                    satisfaction: request.interaction.outcome?.satisfaction || 0.5,
                    impact: request.interaction.impact
                }
            };
            // Memory integration will be implemented when interface is available
            console.log(`[SOCIAL_INTEGRATION] Adding episodic memory: ${episodicMemory.id}`);
            // Update semantic memory with relationship facts
            const relationship = this.relationshipManager.getRelationship(request.targetAgentId);
            if (relationship) {
                const semanticFact = {
                    id: `relationship_${request.targetAgentId}`,
                    concept: `relationship_with_${request.targetAgentId}`,
                    fact: `Current relationship status: ${relationship.status}`,
                    confidence: Math.max(relationship.trust.level, relationship.friendship.level),
                    lastUpdated: Date.now(),
                    source: 'social_system'
                };
                // Memory integration will be implemented when interface is available
                console.log(`[SOCIAL_INTEGRATION] Adding semantic fact: ${semanticFact.id}`);
            }
        }
        catch (error) {
            console.error(`[SOCIAL_INTEGRATION] Error updating memory with social interaction:`, error);
        }
    }
    /**
     * Process learning from social interaction
     */
    async processSocialLearning(request) {
        if (!this.learningEngine || !request.interaction) {
            return;
        }
        try {
            // Create learning experience from social interaction
            const learningExperience = {
                id: `social_learning_${request.interaction.id}`,
                timestamp: request.interaction.timestamp,
                type: 'social_learning',
                skillType: 'social',
                amount: Math.abs(request.interaction.impact?.overall || 0) * 10,
                source: 'interaction',
                context: {
                    situation: `social_interaction_${request.interaction.type}`,
                    targetAgent: request.targetAgentId,
                    interactionContext: request.interaction.context,
                    outcome: request.interaction.outcome,
                    personalityFactors: request.context.personalityFactors,
                    success: request.interaction.outcome?.success || false
                },
                difficulty: request.interaction.outcome?.success ? 0.5 : 0.7,
                riskLevel: 0.1, // Social interactions are generally low risk
                socialContext: 'dyadic',
                metadata: {
                    interactionType: request.interaction.type,
                    impact: request.interaction.impact
                }
            };
            // Process the learning experience
            if (this.learningEngine) {
                console.log(`[SOCIAL_INTEGRATION] Processing learning experience: ${learningExperience.id}`);
                // Learning engine integration will be implemented when interface is available
            }
        }
        catch (error) {
            console.error(`[SOCIAL_INTEGRATION] Error processing social learning:`, error);
        }
    }
    /**
     * Load relationship data from memory system
     */
    async loadRelationshipDataFromMemory() {
        if (!this.memorySystem) {
            return;
        }
        try {
            // Memory integration will be implemented when interface is available
            console.log(`[SOCIAL_INTEGRATION] Loading relationship data from memory - pending interface implementation`);
        }
        catch (error) {
            console.warn(`[SOCIAL_INTEGRATION] No previous relationship data found in memory`);
        }
    }
    /**
     * Update performance metrics
     */
    updatePerformanceMetrics(startTime) {
        const updateTime = Date.now() - startTime;
        this.updateCount++;
        this.averageUpdateTime = (this.averageUpdateTime * (this.updateCount - 1) + updateTime) / this.updateCount;
        this.lastUpdateTime = Date.now();
    }
    /**
     * Get default social factors when system is not initialized
     */
    getDefaultSocialFactors() {
        return {
            trustLevel: 0.5,
            friendshipLevel: 0.5,
            reputationScore: 0.5,
            collaborationHistory: 0,
            recentInteractions: [],
            socialObligations: [],
            conflicts: [],
            allies: [],
            rivals: [],
            influenceLevel: 0.5,
            socialCohesion: 0.5
        };
    }
    /**
     * Cleanup resources
     */
    cleanup() {
        console.log(`[SOCIAL_INTEGRATION] Cleaning up social system for agent ${this.agentId}`);
        // Save current state to memory before cleanup
        if (this.memorySystem && this.isInitialized) {
            this.exportData().then(data => {
                // Memory integration will be implemented when interface is available
                console.log(`[SOCIAL_INTEGRATION] Saving relationship data to memory - pending interface implementation`);
            });
        }
        this.isInitialized = false;
    }
}
