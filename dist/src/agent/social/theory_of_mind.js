/**
 * Theory of Mind Engine
 *
 * This is the main orchestrator for the theory of mind system, integrating
 * all components to provide comprehensive social cognition capabilities.
 * It coordinates mental modeling, intention prediction, emotional intelligence,
 * and social reasoning to enable agents to understand and predict other agents'
 * mental states and behaviors.
 */
import { MentalModelManager } from './mental_model.js';
import { IntentionPredictor } from './intention_predictor.js';
import { EmotionalIntelligence } from './emotional_intelligence.js';
import { SocialReasoningEngine } from './social_reasoning.js';
/**
 * Main Theory of Mind Engine
 *
 * Coordinates all theory of mind components and provides the primary
 * interface for mental state modeling and social cognition.
 */
export class TheoryOfMindEngine {
    config;
    mentalModelManager;
    intentionPredictor;
    emotionalIntelligence;
    socialReasoning;
    metrics;
    isInitialized = false;
    currentPersonality;
    constructor(config) {
        this.config = this.createDefaultConfig(config);
        this.metrics = this.initializeMetrics();
        // Initialize components with their specific configuration types
        this.mentalModelManager = new MentalModelManager(this.config);
        const intentionPredictorConfig = {
            maxPredictionHorizon: 60000,
            minConfidenceThreshold: this.config.confidenceThreshold,
            enablePlanRecognition: true,
            enableTemporalTracking: true,
            enablePersonalityInference: true,
            maxPatterns: 50,
            updateFrequency: this.config.updateFrequency,
            historyRetentionPeriod: this.config.memoryRetentionPeriod
        };
        this.intentionPredictor = new IntentionPredictor(intentionPredictorConfig);
        const emotionalIntelligenceConfig = {
            enableEmotionRecognition: this.config.enableEmotionalIntelligence,
            enableEmpathySimulation: this.config.enableEmotionalIntelligence,
            enableEmotionalContagion: this.config.enableEmotionalIntelligence,
            enableMoodModeling: this.config.enableEmotionalIntelligence,
            emotionDecayRate: 0.1,
            moodInfluenceFactor: 0.3,
            empathyThreshold: 0.5,
            contagionThreshold: 0.3,
            updateFrequency: this.config.updateFrequency,
            historyRetentionPeriod: this.config.memoryRetentionPeriod
        };
        this.emotionalIntelligence = new EmotionalIntelligence(emotionalIntelligenceConfig);
        const socialReasoningConfig = {
            enableGroupDynamics: this.config.enableSocialReasoning,
            enableNormUnderstanding: this.config.enableSocialReasoning,
            enableCulturalContext: this.config.enableSocialReasoning,
            enablePowerAnalysis: this.config.enableSocialReasoning,
            enableCommunicationAnalysis: this.config.enableSocialReasoning,
            maxRecommendations: 5,
            confidenceThreshold: this.config.confidenceThreshold,
            updateFrequency: this.config.updateFrequency,
            contextRetentionPeriod: this.config.memoryRetentionPeriod
        };
        this.socialReasoning = new SocialReasoningEngine(socialReasoningConfig);
    }
    /**
     * Initialize the theory of mind engine
     */
    async initialize(personality) {
        try {
            console.log('[THEORY_OF_MIND] Initializing theory of mind engine...');
            // Store the personality for later use
            this.currentPersonality = personality;
            // Initialize all components - they don't have initialize methods, so we just log
            console.log('[THEORY_OF_MIND] Mental model manager ready');
            console.log('[THEORY_OF_MIND] Intention predictor ready');
            console.log('[THEORY_OF_MIND] Emotional intelligence ready');
            console.log('[THEORY_OF_MIND] Social reasoning engine ready');
            this.isInitialized = true;
            console.log('[THEORY_OF_MIND] Theory of mind engine initialized successfully');
        }
        catch (error) {
            console.error('[THEORY_OF_MIND] Error initializing theory of mind engine:', error);
            throw error;
        }
    }
    /**
     * Process an observation about another agent
     */
    async processObservation(targetAgentId, observation, context, observerPersonality) {
        const startTime = Date.now();
        try {
            if (!this.isInitialized) {
                throw new Error('Theory of mind engine not initialized');
            }
            console.log(`[THEORY_OF_MIND] Processing observation for agent ${targetAgentId}`);
            // Step 1: Update mental model based on observation
            this.mentalModelManager.updateFromObservation(targetAgentId, observation, context, observerPersonality);
            const mentalState = this.mentalModelManager.getMentalState(targetAgentId);
            if (!mentalState) {
                console.log(`[THEORY_OF_MIND] No mental state created for agent ${targetAgentId}`);
                return null;
            }
            // Step 2: Predict intentions based on updated mental state
            const intentionContext = {
                agentId: targetAgentId,
                currentActions: observation.actions || [],
                recentHistory: observation.recentHistory || [],
                environment: context.environment || {},
                socialContext: context.socialContext || {},
                personality: observerPersonality,
                relationship: context.relationship,
                timestamp: Date.now()
            };
            const intentionPredictions = this.intentionPredictor.predictIntentions(intentionContext);
            // Step 3: Analyze emotional state and responses
            const emotionContext = {
                agentId: targetAgentId,
                behavioralCues: observation.behavioralCues || [],
                recentActions: observation.recentHistory || [],
                environment: context.environment || {},
                socialContext: context.socialContext || {},
                personality: observerPersonality,
                relationship: context.relationship,
                timestamp: Date.now()
            };
            const emotionalAnalysis = this.emotionalIntelligence.recognizeEmotions(emotionContext);
            // Step 4: Perform social reasoning
            const socialReasoningInput = {
                agentId: targetAgentId,
                nearbyAgents: context.nearbyAgents || [],
                currentSituation: context.currentSituation || {},
                environment: context.environment || {},
                relationships: context.relationships || new Map(),
                personality: observerPersonality,
                culturalBackground: context.culturalBackground,
                timestamp: Date.now()
            };
            const socialContextOutput = this.socialReasoning.analyzeSocialContext(socialReasoningInput);
            // Convert SocialReasoningOutput to SocialReasoningContext
            const socialContext = {
                situation: socialContextOutput.situationAssessment,
                groupDynamics: socialContextOutput.groupDynamics,
                socialNorms: socialContextOutput.socialNorms,
                culturalContext: socialContextOutput.culturalContext
            };
            // Step 5: Integrate all components into comprehensive mental state
            const integratedMentalState = await this.integrateMentalState(mentalState, intentionPredictions, emotionalAnalysis, socialContext);
            // Update metrics
            const processingTime = Date.now() - startTime;
            this.updateMetrics(processingTime, true);
            console.log(`[THEORY_OF_MIND] Observation processed in ${processingTime}ms`);
            return integratedMentalState;
        }
        catch (error) {
            console.error('[THEORY_OF_MIND] Error processing observation:', error);
            const processingTime = Date.now() - startTime;
            this.updateMetrics(processingTime, false);
            return null;
        }
    }
    /**
     * Get current mental state for an agent
     */
    getMentalState(agentId) {
        return this.mentalModelManager.getMentalState(agentId);
    }
    /**
     * Predict agent's behavior in a given context
     */
    async predictBehavior(agentId, context, timeHorizon = 5000) {
        try {
            if (!this.isInitialized) {
                throw new Error('Theory of mind engine not initialized');
            }
            const mentalState = this.getMentalState(agentId);
            if (!mentalState) {
                console.log(`[THEORY_OF_MIND] No mental state available for agent ${agentId}`);
                return null;
            }
            // Use all components to predict behavior
            const intentionContext = {
                agentId,
                currentActions: context.currentActions || [],
                recentHistory: context.recentHistory || [],
                environment: context.environment || {},
                socialContext: context.socialContext || {},
                personality: context.personality,
                relationship: context.relationship,
                timestamp: Date.now()
            };
            const intentionPrediction = this.intentionPredictor.predictIntentions(intentionContext);
            const emotionalPrediction = this.emotionalIntelligence.predictEmotionalResponse(agentId, JSON.stringify(context), { personality: context.personality });
            const socialPrediction = this.socialReasoning.analyzeSocialContext({
                agentId,
                nearbyAgents: context.nearbyAgents || [],
                currentSituation: context.currentSituation || {},
                environment: context.environment || {},
                relationships: context.relationships || new Map(),
                personality: context.personality,
                culturalBackground: context.culturalBackground,
                timestamp: Date.now()
            });
            // Combine predictions
            return {
                agentId,
                timeHorizon,
                predictions: {
                    intentions: intentionPrediction,
                    emotions: emotionalPrediction,
                    social: socialPrediction
                },
                confidence: this.calculateOverallConfidence([
                    intentionPrediction.length > 0 ? intentionPrediction[0]?.confidence || 0 : 0,
                    emotionalPrediction?.confidence || 0,
                    socialPrediction?.confidence || 0
                ]),
                timestamp: Date.now()
            };
        }
        catch (error) {
            console.error('[THEORY_OF_MIND] Error predicting behavior:', error);
            return null;
        }
    }
    /**
     * Update theory of mind with new relationship information
     */
    async updateRelationship(agentId, relationship, context) {
        try {
            if (!this.isInitialized) {
                return;
            }
            console.log(`[THEORY_OF_MIND] Updating relationship for agent ${agentId}`);
            // Update mental model with relationship information
            // Update mental model with relationship information
            const relationshipObservation = {
                relationship: relationship,
                socialBehavior: { [agentId]: 'relationship_update' },
                timestamp: Date.now()
            };
            this.mentalModelManager.updateFromObservation(agentId, relationshipObservation, context);
            // Note: IntentionPredictor doesn't have updateRelationshipContext method
            // It will use the updated mental state in next prediction
            // Note: EmotionalIntelligence doesn't have updateRelationship method
            // It will use the updated context in next analysis
            // Note: SocialReasoning doesn't have updateRelationship method
            // It will use the updated relationships in next analysis
        }
        catch (error) {
            console.error('[THEORY_OF_MIND] Error updating relationship:', error);
        }
    }
    /**
     * Perform perspective-taking for another agent
     */
    async takePerspective(agentId, situation, perspectiveTime = 2000) {
        try {
            if (!this.isInitialized) {
                throw new Error('Theory of mind engine not initialized');
            }
            const mentalState = this.getMentalState(agentId);
            if (!mentalState) {
                console.log(`[THEORY_OF_MIND] No mental state available for perspective-taking with agent ${agentId}`);
                return null;
            }
            console.log(`[THEORY_OF_MIND] Taking perspective of agent ${agentId}`);
            // Use mental model manager for perspective-taking
            const perspectiveResult = this.mentalModelManager.predictMentalState(agentId, perspectiveTime);
            // Enhance with emotional intelligence
            const emotionalPerspective = this.emotionalIntelligence.predictEmotionalResponse(agentId, JSON.stringify(situation), { mentalState });
            // Enhance with social reasoning
            const socialPerspective = this.socialReasoning.analyzeSocialContext({
                agentId,
                nearbyAgents: situation.nearbyAgents || [],
                currentSituation: situation,
                environment: situation.environment || {},
                relationships: situation.relationships || new Map(),
                personality: this.currentPersonality,
                culturalBackground: situation.culturalBackground,
                timestamp: Date.now()
            });
            return {
                agentId,
                situation,
                perspective: perspectiveResult,
                emotionalContext: emotionalPerspective,
                socialContext: socialPerspective,
                confidence: perspectiveResult.confidence,
                timestamp: Date.now()
            };
        }
        catch (error) {
            console.error('[THEORY_OF_MIND] Error taking perspective:', error);
            return null;
        }
    }
    /**
     * Detect potential deception or false beliefs
     */
    async detectDeception(agentId, communication, context) {
        try {
            if (!this.isInitialized || !this.config.enableFalseBeliefUnderstanding) {
                return null;
            }
            const mentalState = this.getMentalState(agentId);
            if (!mentalState) {
                return null;
            }
            console.log(`[THEORY_OF_MIND] Analyzing for deception from agent ${agentId}`);
            // Use mental model manager for false belief detection
            // Use mental model for false belief detection
            const falseBeliefState = mentalState.perspective.falseBeliefUnderstanding;
            const deceptionAnalysis = {
                detected: falseBeliefState.deceptionDetection > 0.5,
                confidence: falseBeliefState.deceptionDetection,
                falseBeliefs: Array.from(falseBeliefState.detectedFalseBeliefs.entries())
            };
            // Cross-reference with emotional intelligence for inconsistencies
            const emotionContext = {
                agentId,
                behavioralCues: communication.behavioralCues || [],
                recentActions: communication.recentHistory || [],
                environment: context.environment || {},
                socialContext: context.socialContext || {},
                personality: this.currentPersonality,
                relationship: context.relationship,
                timestamp: Date.now()
            };
            const recognizedEmotions = this.emotionalIntelligence.recognizeEmotions(emotionContext);
            const emotionalInconsistencies = {
                detected: recognizedEmotions.size > 0,
                emotions: recognizedEmotions,
                inconsistencyScore: Array.from(recognizedEmotions.values()).reduce((a, b) => a + b, 0) / Math.max(1, recognizedEmotions.size)
            };
            // Use social reasoning for context validation
            const socialValidation = this.socialReasoning.analyzeSocialContext({
                agentId,
                nearbyAgents: context.nearbyAgents || [],
                currentSituation: communication,
                environment: context.environment || {},
                relationships: context.relationships || new Map(),
                personality: context.personality,
                culturalBackground: context.culturalBackground,
                timestamp: Date.now()
            });
            const validationScore = socialValidation.confidence;
            return {
                agentId,
                communication,
                deception: deceptionAnalysis,
                emotionalInconsistencies,
                socialValidation,
                overallDeceptionProbability: this.calculateDeceptionProbability(deceptionAnalysis, emotionalInconsistencies, socialValidation),
                timestamp: Date.now()
            };
        }
        catch (error) {
            console.error('[THEORY_OF_MIND] Error detecting deception:', error);
            return null;
        }
    }
    /**
     * Get current theory of mind metrics
     */
    getMetrics() {
        return { ...this.metrics };
    }
    /**
     * Reset the theory of mind engine
     */
    async reset() {
        console.log('[THEORY_OF_MIND] Resetting theory of mind engine...');
        try {
            this.mentalModelManager.reset();
            this.intentionPredictor.reset();
            this.emotionalIntelligence.reset();
            this.socialReasoning.reset();
            this.metrics = this.initializeMetrics();
            console.log('[THEORY_OF_MIND] Theory of mind engine reset complete');
        }
        catch (error) {
            console.error('[THEORY_OF_MIND] Error resetting theory of mind engine:', error);
        }
    }
    /**
     * Cleanup resources
     */
    async cleanup() {
        console.log('[THEORY_OF_MIND] Cleaning up theory of mind engine...');
        try {
            // Use reset for cleanup since components don't have cleanup methods
            this.mentalModelManager.reset();
            this.intentionPredictor.reset();
            this.emotionalIntelligence.reset();
            this.socialReasoning.reset();
            this.isInitialized = false;
            console.log('[THEORY_OF_MIND] Theory of mind engine cleanup complete');
        }
        catch (error) {
            console.error('[THEORY_OF_MIND] Error during cleanup:', error);
        }
    }
    /**
     * Create default configuration
     */
    createDefaultConfig(override) {
        const defaultConfig = {
            maxMentalModels: 50,
            confidenceThreshold: 0.5,
            updateFrequency: 1000,
            memoryRetentionPeriod: 24 * 60 * 60 * 1000, // 24 hours
            enablePerspectiveTaking: true,
            enableFalseBeliefUnderstanding: true,
            enableEmotionalIntelligence: true,
            enableSocialReasoning: true,
            performance: {
                enableCaching: true,
                cacheSizeLimit: 100,
                enableLazyLoading: true,
                batchSize: 10,
                enableParallelProcessing: false,
                maxConcurrentOperations: 5
            }
        };
        return { ...defaultConfig, ...override };
    }
    /**
     * Initialize metrics
     */
    initializeMetrics() {
        return {
            predictionAccuracy: 0,
            responseTime: 0,
            memoryUsage: 0,
            activeModels: 0,
            confidenceDistribution: {
                high: 0,
                medium: 0,
                low: 0
            },
            performance: {
                averageUpdate: 0,
                peakUpdate: 0,
                totalUpdates: 0
            }
        };
    }
    /**
     * Integrate mental state from all components
     */
    async integrateMentalState(baseMentalState, intentionPredictions, emotionalAnalysis, socialContext) {
        // Create integrated mental state
        const integratedState = {
            ...baseMentalState,
            intentions: {
                ...baseMentalState.intentions,
                ...intentionPredictions
            },
            emotions: {
                ...baseMentalState.emotions,
                ...emotionalAnalysis
            },
            lastUpdated: Date.now(),
            confidence: this.calculateOverallConfidence([
                baseMentalState.confidence,
                intentionPredictions?.confidence || 0,
                emotionalAnalysis?.confidence || 0
            ])
        };
        return integratedState;
    }
    /**
     * Calculate overall confidence from multiple sources
     */
    calculateOverallConfidence(confidences) {
        if (confidences.length === 0)
            return 0;
        const sum = confidences.reduce((acc, conf) => acc + conf, 0);
        return sum / confidences.length;
    }
    /**
     * Calculate deception probability
     */
    calculateDeceptionProbability(deceptionAnalysis, emotionalInconsistencies, socialValidation) {
        const deceptionScore = deceptionAnalysis?.confidence || 0;
        const emotionalScore = emotionalInconsistencies?.inconsistencyScore || 0;
        const socialScore = socialValidation?.validationScore || 0;
        // Weighted average with emphasis on deception analysis
        return (deceptionScore * 0.5 + emotionalScore * 0.3 + socialScore * 0.2);
    }
    /**
     * Update performance metrics
     */
    updateMetrics(processingTime, success) {
        this.metrics.responseTime = processingTime;
        this.metrics.performance.totalUpdates++;
        // Update average
        const total = this.metrics.performance.totalUpdates;
        this.metrics.performance.averageUpdate =
            (this.metrics.performance.averageUpdate * (total - 1) + processingTime) / total;
        // Update peak
        if (processingTime > this.metrics.performance.peakUpdate) {
            this.metrics.performance.peakUpdate = processingTime;
        }
        // Update active models count
        this.metrics.activeModels = this.mentalModelManager.getAllMentalStates().size;
        // Update memory usage (simplified estimate)
        this.metrics.memoryUsage = this.mentalModelManager.getAllMentalStates().size * 1024; // 1KB per state estimate
    }
}
/**
 * Factory for creating theory of mind engines
 */
export class TheoryOfMindFactory {
    /**
     * Create a theory of mind engine with default configuration
     */
    static createDefault() {
        return new TheoryOfMindEngine();
    }
    /**
     * Create a theory of mind engine with custom configuration
     */
    static createCustom(config) {
        return new TheoryOfMindEngine(config);
    }
    /**
     * Create a theory of mind engine optimized for performance
     */
    static createPerformanceOptimized() {
        const config = {
            maxMentalModels: 20,
            confidenceThreshold: 0.7,
            updateFrequency: 2000,
            performance: {
                enableCaching: true,
                cacheSizeLimit: 50,
                enableLazyLoading: true,
                batchSize: 20,
                enableParallelProcessing: true,
                maxConcurrentOperations: 10
            }
        };
        return new TheoryOfMindEngine(config);
    }
    /**
     * Create a theory of mind engine for high accuracy
     */
    static createHighAccuracy() {
        const config = {
            maxMentalModels: 100,
            confidenceThreshold: 0.3,
            updateFrequency: 500,
            enablePerspectiveTaking: true,
            enableFalseBeliefUnderstanding: true,
            enableEmotionalIntelligence: true,
            enableSocialReasoning: true,
            performance: {
                enableCaching: true,
                cacheSizeLimit: 200,
                enableLazyLoading: false,
                batchSize: 5,
                enableParallelProcessing: false,
                maxConcurrentOperations: 3
            }
        };
        return new TheoryOfMindEngine(config);
    }
}
