/**
 * Emotional Intelligence System
 *
 * This component implements sophisticated emotion recognition, empathy simulation,
 * and emotional state prediction for social reasoning. It includes emotion recognition
 * from behavioral cues, empathy modeling, and emotional contagion simulation.
 */
import { Emotion } from './tom_types.js';
/**
 * Main emotional intelligence class
 */
export class EmotionalIntelligence {
    config;
    emotionPatterns;
    emotionalHistory;
    empathyHistory; // observer -> target -> empathy level
    moodStates;
    metrics;
    lastUpdateTime;
    constructor(config) {
        this.config = config;
        this.emotionPatterns = new Map();
        this.emotionalHistory = new Map();
        this.empathyHistory = new Map();
        this.moodStates = new Map();
        this.metrics = this.initializeMetrics();
        this.lastUpdateTime = Date.now();
        this.initializeEmotionPatterns();
    }
    /**
     * Initialize emotional intelligence metrics
     */
    initializeMetrics() {
        return {
            recognition: 0.5,
            understanding: 0.5,
            regulation: 0.5,
            utilization: 0.5,
            overall: 0.5
        };
    }
    /**
     * Initialize emotion recognition patterns
     */
    initializeEmotionPatterns() {
        // Joy pattern
        this.emotionPatterns.set(Emotion.JOY, {
            emotion: Emotion.JOY,
            cues: [
                { type: 'jumping', weight: 0.8, threshold: 0.5 },
                { type: 'fast_movement', weight: 0.4, threshold: 0.6 },
                { type: 'vocalization_positive', weight: 0.7, threshold: 0.4 },
                { type: 'social_approach', weight: 0.6, threshold: 0.5 },
                { type: 'explorative_behavior', weight: 0.5, threshold: 0.4 }
            ],
            contextFactors: ['success', 'achievement', 'social_positive', 'resource_gain'],
            personalityCorrelation: { extraversion: 0.7, openness: 0.6 },
            confidenceThreshold: 0.6
        });
        // Sadness pattern
        this.emotionPatterns.set(Emotion.SADNESS, {
            emotion: Emotion.SADNESS,
            cues: [
                { type: 'slumped_shoulders', weight: 0.8, threshold: 0.5 },
                { type: 'slow_movement', weight: 0.7, threshold: 0.6 },
                { type: 'social_withdrawal', weight: 0.6, threshold: 0.5 },
                { type: 'vocalization_negative', weight: 0.5, threshold: 0.4 },
                { type: 'inactivity', weight: 0.4, threshold: 0.7 }
            ],
            contextFactors: ['failure', 'loss', 'social_rejection', 'threat'],
            personalityCorrelation: { neuroticism: 0.6 },
            confidenceThreshold: 0.5
        });
        // Anger pattern
        this.emotionPatterns.set(Emotion.ANGER, {
            emotion: Emotion.ANGER,
            cues: [
                { type: 'aggressive_posture', weight: 0.9, threshold: 0.5 },
                { type: 'rapid_movement', weight: 0.7, threshold: 0.6 },
                { type: 'vocalization_aggressive', weight: 0.8, threshold: 0.4 },
                { type: 'threatening_behavior', weight: 0.8, threshold: 0.5 },
                { type: 'destructive_actions', weight: 0.6, threshold: 0.6 }
            ],
            contextFactors: ['obstacle', 'frustration', 'threat', 'injustice'],
            personalityCorrelation: { neuroticism: 0.7, agreeableness: 0.3 },
            confidenceThreshold: 0.7
        });
        // Fear pattern
        this.emotionPatterns.set(Emotion.FEAR, {
            emotion: Emotion.FEAR,
            cues: [
                { type: 'fleeing', weight: 0.9, threshold: 0.4 },
                { type: 'freezing', weight: 0.7, threshold: 0.5 },
                { type: 'trembling', weight: 0.6, threshold: 0.6 },
                { type: 'vigilant_scanning', weight: 0.5, threshold: 0.5 },
                { type: 'hiding', weight: 0.8, threshold: 0.4 }
            ],
            contextFactors: ['danger', 'threat', 'uncertainty', 'predator'],
            personalityCorrelation: { neuroticism: 0.8 },
            confidenceThreshold: 0.6
        });
        // Surprise pattern
        this.emotionPatterns.set(Emotion.SURPRISE, {
            emotion: Emotion.SURPRISE,
            cues: [
                { type: 'sudden_stop', weight: 0.7, threshold: 0.5 },
                { type: 'orientation_change', weight: 0.6, threshold: 0.4 },
                { type: 'investigative_behavior', weight: 0.5, threshold: 0.5 },
                { type: 'vocalization_surprise', weight: 0.4, threshold: 0.6 }
            ],
            contextFactors: ['unexpected_event', 'novel_stimulus', 'sudden_change'],
            personalityCorrelation: { openness: 0.7 },
            confidenceThreshold: 0.5
        });
        // Disgust pattern
        this.emotionPatterns.set(Emotion.DISGUST, {
            emotion: Emotion.DISGUST,
            cues: [
                { type: 'avoidance', weight: 0.8, threshold: 0.5 },
                { type: 'rejection_behavior', weight: 0.7, threshold: 0.4 },
                { type: 'vocalization_disgust', weight: 0.5, threshold: 0.6 },
                { type: 'facial_disgust', weight: 0.6, threshold: 0.5 }
            ],
            contextFactors: ['contamination', 'moral_violation', 'unpleasant_stimulus'],
            personalityCorrelation: { conscientiousness: 0.6 },
            confidenceThreshold: 0.5
        });
        // Trust pattern
        this.emotionPatterns.set(Emotion.TRUST, {
            emotion: Emotion.TRUST,
            cues: [
                { type: 'cooperation', weight: 0.8, threshold: 0.5 },
                { type: 'sharing', weight: 0.7, threshold: 0.4 },
                { type: 'proximity_seek', weight: 0.6, threshold: 0.5 },
                { type: 'vocalization_calm', weight: 0.5, threshold: 0.4 }
            ],
            contextFactors: ['cooperation', 'shared_goals', 'safety', 'familiarity'],
            personalityCorrelation: { agreeableness: 0.8 },
            confidenceThreshold: 0.6
        });
        // Anticipation pattern
        this.emotionPatterns.set(Emotion.ANTICIPATION, {
            emotion: Emotion.ANTICIPATION,
            cues: [
                { type: 'preparatory_behavior', weight: 0.7, threshold: 0.5 },
                { type: 'goal_oriented_movement', weight: 0.6, threshold: 0.4 },
                { type: 'vigilant_waiting', weight: 0.5, threshold: 0.6 },
                { type: 'exploratory_scanning', weight: 0.4, threshold: 0.5 }
            ],
            contextFactors: ['upcoming_event', 'goal_opportunity', 'expected_reward'],
            personalityCorrelation: { conscientiousness: 0.7, openness: 0.5 },
            confidenceThreshold: 0.5
        });
    }
    /**
     * Recognize emotions from behavioral cues
     */
    recognizeEmotions(context) {
        const recognizedEmotions = new Map();
        try {
            if (!this.config.enableEmotionRecognition) {
                return recognizedEmotions;
            }
            // Analyze behavioral cues for each emotion pattern
            for (const [emotion, pattern] of this.emotionPatterns.entries()) {
                const emotionScore = this.calculateEmotionScore(pattern, context);
                if (emotionScore >= pattern.confidenceThreshold) {
                    recognizedEmotions.set(emotion, emotionScore);
                }
            }
            // Apply mood influence if enabled
            if (this.config.enableMoodModeling) {
                this.applyMoodInfluence(recognizedEmotions, context.agentId);
            }
            // Apply personality influence if available
            if (context.personality) {
                this.applyPersonalityInfluence(recognizedEmotions, context.personality);
            }
            // Store in emotional history
            this.storeEmotionalState(context.agentId, recognizedEmotions, context);
            // Update metrics
            this.updateRecognitionMetrics(recognizedEmotions);
            this.lastUpdateTime = Date.now();
        }
        catch (error) {
            console.error('[EMOTIONAL_INTELLIGENCE] Error recognizing emotions:', error);
        }
        return recognizedEmotions;
    }
    /**
     * Calculate emotion score based on pattern matching
     */
    calculateEmotionScore(pattern, context) {
        let cueScore = 0;
        let contextScore = 0;
        let personalityScore = 0;
        // Calculate cue-based score
        const matchingCues = context.behavioralCues.filter(cue => pattern.cues.some(patternCue => cue.type === patternCue.type && cue.intensity >= patternCue.threshold));
        if (matchingCues.length > 0) {
            const totalWeight = matchingCues.reduce((sum, cue) => {
                const patternCue = pattern.cues.find(pc => pc.type === cue.type);
                return sum + (patternCue?.weight || 0);
            }, 0);
            const maxPossibleWeight = pattern.cues.reduce((sum, pc) => sum + pc.weight, 0);
            cueScore = totalWeight / maxPossibleWeight;
        }
        // Calculate context-based score
        const contextFactors = this.extractContextFactors(context);
        const matchingContextFactors = contextFactors.filter(factor => pattern.contextFactors.includes(factor));
        if (pattern.contextFactors.length > 0) {
            contextScore = matchingContextFactors.length / pattern.contextFactors.length;
        }
        // Calculate personality-based score
        if (pattern.personalityCorrelation && context.personality) {
            personalityScore = this.calculatePersonalityCorrelation(pattern.personalityCorrelation, context.personality);
        }
        // Weighted combination
        const totalScore = (cueScore * 0.6) + (contextScore * 0.3) + (personalityScore * 0.1);
        return Math.min(1.0, totalScore);
    }
    /**
     * Extract context factors from context
     */
    extractContextFactors(context) {
        const factors = [];
        // Extract from environment
        if (context.environment) {
            if (context.environment.danger_level > 0.7)
                factors.push('danger');
            if (context.environment.danger_level > 0.5)
                factors.push('threat');
            if (context.environment.resources_available)
                factors.push('resource_gain');
            if (context.environment.obstacles)
                factors.push('obstacle');
        }
        // Extract from social context
        if (context.socialContext) {
            if (context.socialContext.allies)
                factors.push('cooperation');
            if (context.socialContext.conflicts)
                factors.push('conflict');
            if (context.socialContext.social_positive)
                factors.push('social_positive');
            if (context.socialContext.social_rejection)
                factors.push('social_rejection');
        }
        // Extract from recent actions
        for (const action of context.recentActions.slice(-5)) {
            if (action.outcome === 'success')
                factors.push('success');
            if (action.outcome === 'failure')
                factors.push('failure');
            if (action.type === 'attack')
                factors.push('aggression');
            if (action.type === 'flee')
                factors.push('escape');
        }
        return factors;
    }
    /**
     * Calculate personality correlation score
     */
    calculatePersonalityCorrelation(patternCorrelation, personality) {
        let totalCorrelation = 0;
        let traitCount = 0;
        for (const [trait, patternValue] of Object.entries(patternCorrelation)) {
            const personalityValue = personality[trait];
            if (personalityValue !== undefined) {
                const correlation = 1 - Math.abs(patternValue - personalityValue);
                totalCorrelation += correlation;
                traitCount++;
            }
        }
        return traitCount > 0 ? totalCorrelation / traitCount : 0;
    }
    /**
     * Apply mood influence to recognized emotions
     */
    applyMoodInfluence(emotions, agentId) {
        const moodState = this.moodStates.get(agentId);
        if (!moodState)
            return;
        const moodInfluence = this.config.moodInfluenceFactor;
        for (const [emotion, intensity] of emotions.entries()) {
            let moodModifier = 0;
            // Positive mood enhances positive emotions
            if (moodState.valence > 0.5) {
                if ([Emotion.JOY, Emotion.TRUST, Emotion.ANTICIPATION].includes(emotion)) {
                    moodModifier = moodState.valence * moodInfluence;
                }
                else if ([Emotion.SADNESS, Emotion.ANGER, Emotion.FEAR, Emotion.DISGUST].includes(emotion)) {
                    moodModifier = -moodState.valence * moodInfluence * 0.5;
                }
            }
            // Negative mood enhances negative emotions
            else if (moodState.valence < -0.5) {
                if ([Emotion.SADNESS, Emotion.ANGER, Emotion.FEAR, Emotion.DISGUST].includes(emotion)) {
                    moodModifier = Math.abs(moodState.valence) * moodInfluence;
                }
                else if ([Emotion.JOY, Emotion.TRUST, Emotion.ANTICIPATION].includes(emotion)) {
                    moodModifier = -Math.abs(moodState.valence) * moodInfluence * 0.5;
                }
            }
            const adjustedIntensity = Math.max(0, Math.min(1, intensity + moodModifier));
            emotions.set(emotion, adjustedIntensity);
        }
    }
    /**
     * Apply personality influence to emotions
     */
    applyPersonalityInfluence(emotions, personality) {
        const personalityInfluence = 0.2; // 20% personality influence
        // Personality-emotion mappings
        const personalityEmotions = [
            { trait: 'extraversion', emotions: [Emotion.JOY, Emotion.TRUST], influence: personality.extraversion },
            { trait: 'neuroticism', emotions: [Emotion.ANGER, Emotion.FEAR, Emotion.SADNESS], influence: personality.neuroticism },
            { trait: 'openness', emotions: [Emotion.SURPRISE, Emotion.ANTICIPATION], influence: personality.openness },
            { trait: 'agreeableness', emotions: [Emotion.TRUST, Emotion.JOY], influence: personality.agreeableness },
            { trait: 'conscientiousness', emotions: [Emotion.ANTICIPATION], influence: personality.conscientiousness }
        ];
        for (const { trait, emotions: traitEmotions, influence } of personalityEmotions) {
            const modifier = influence * personalityInfluence;
            for (const emotion of traitEmotions) {
                const currentIntensity = emotions.get(emotion) || 0;
                const adjustedIntensity = Math.max(0, Math.min(1, currentIntensity + modifier));
                emotions.set(emotion, adjustedIntensity);
            }
        }
    }
    /**
     * Store emotional state in history
     */
    storeEmotionalState(agentId, emotions, context) {
        const emotionalState = {
            currentEmotions: emotions,
            predictedResponses: new Map(),
            mood: this.getMoodState(agentId),
            empathy: new Map(),
            intelligence: this.metrics
        };
        const history = this.emotionalHistory.get(agentId) || [];
        history.push(emotionalState);
        // Trim old history based on retention period
        const cutoffTime = Date.now() - this.config.historyRetentionPeriod;
        const filteredHistory = history.filter(state => context.timestamp > cutoffTime);
        this.emotionalHistory.set(agentId, filteredHistory);
    }
    /**
     * Get or create mood state for agent
     */
    getMoodState(agentId) {
        let moodState = this.moodStates.get(agentId);
        if (!moodState) {
            moodState = {
                valence: 0, // Neutral
                arousal: 0.5, // Moderate
                dominance: 0.5, // Moderate
                duration: 0,
                stability: 0.8
            };
            this.moodStates.set(agentId, moodState);
        }
        return moodState;
    }
    /**
     * Update mood state based on emotions
     */
    updateMoodState(agentId, emotions) {
        if (!this.config.enableMoodModeling)
            return;
        const moodState = this.getMoodState(agentId);
        const previousMood = { ...moodState };
        // Calculate valence from emotions
        let positiveValence = 0;
        let negativeValence = 0;
        for (const [emotion, intensity] of emotions.entries()) {
            if ([Emotion.JOY, Emotion.TRUST, Emotion.ANTICIPATION].includes(emotion)) {
                positiveValence += intensity;
            }
            else if ([Emotion.SADNESS, Emotion.ANGER, Emotion.FEAR, Emotion.DISGUST].includes(emotion)) {
                negativeValence += intensity;
            }
        }
        // Update mood valence with smoothing
        const emotionValence = (positiveValence - negativeValence) / emotions.size || 0;
        moodState.valence = (previousMood.valence * 0.7) + (emotionValence * 0.3);
        // Update arousal based on emotion intensity
        const avgIntensity = Array.from(emotions.values()).reduce((sum, val) => sum + val, 0) / emotions.size || 0.5;
        moodState.arousal = (previousMood.arousal * 0.8) + (avgIntensity * 0.2);
        // Update duration
        moodState.duration += this.config.updateFrequency;
        // Update stability based on emotional consistency
        const history = this.emotionalHistory.get(agentId) || [];
        if (history.length > 1) {
            const previousEmotions = history[history.length - 2].currentEmotions;
            const consistency = this.calculateEmotionalConsistency(emotions, previousEmotions);
            moodState.stability = (previousMood.stability * 0.9) + (consistency * 0.1);
        }
        this.moodStates.set(agentId, moodState);
    }
    /**
     * Calculate emotional consistency between two emotion states
     */
    calculateEmotionalConsistency(current, previous) {
        if (current.size === 0 && previous.size === 0)
            return 1.0;
        if (current.size === 0 || previous.size === 0)
            return 0.0;
        let totalDifference = 0;
        let emotionCount = 0;
        for (const emotion of Array.from(new Set([...current.keys(), ...previous.keys()]))) {
            const currentIntensity = current.get(emotion) || 0;
            const previousIntensity = previous.get(emotion) || 0;
            totalDifference += Math.abs(currentIntensity - previousIntensity);
            emotionCount++;
        }
        const avgDifference = totalDifference / emotionCount;
        return Math.max(0, 1 - avgDifference);
    }
    /**
     * Simulate empathy for another agent's emotions
     */
    simulateEmpathy(context) {
        try {
            if (!this.config.enableEmpathySimulation) {
                return 0;
            }
            let empathyScore = 0;
            // Base empathy from relationship
            if (context.relationship) {
                empathyScore += context.relationship.trust.level * 0.3;
                empathyScore += context.relationship.friendship.level * 0.2;
            }
            // Personality-based empathy
            if (context.observerPersonality) {
                empathyScore += context.observerPersonality.agreeableness * 0.3;
                empathyScore += context.observerPersonality.extraversion * 0.1;
            }
            // Emotional resonance based on target emotions
            let emotionalResonance = 0;
            for (const [emotion, intensity] of context.targetEmotions.entries()) {
                // Higher resonance for emotions observer is prone to
                if (context.observerPersonality) {
                    if (emotion === Emotion.JOY && context.observerPersonality.extraversion > 0.6) {
                        emotionalResonance += intensity * 0.2;
                    }
                    if (emotion === Emotion.FEAR && context.observerPersonality.neuroticism > 0.6) {
                        emotionalResonance += intensity * 0.2;
                    }
                }
                emotionalResonance += intensity * 0.1; // Base resonance
            }
            empathyScore += Math.min(1.0, emotionalResonance) * 0.4;
            // Situation-based empathy
            const situationEmpathy = this.calculateSituationEmpathy(context.situation);
            empathyScore += situationEmpathy * 0.1;
            // Clamp to valid range
            empathyScore = Math.max(0, Math.min(1, empathyScore));
            // Store empathy history
            this.storeEmpathyHistory(context.observerId, context.targetId, empathyScore);
            // Update metrics
            this.updateEmpathyMetrics(empathyScore);
            return empathyScore;
        }
        catch (error) {
            console.error('[EMOTIONAL_INTELLIGENCE] Error simulating empathy:', error);
            return 0;
        }
    }
    /**
     * Calculate situation-based empathy
     */
    calculateSituationEmpathy(situation) {
        const empathySituations = {
            'danger': 0.8,
            'pain': 0.9,
            'loss': 0.7,
            'failure': 0.6,
            'success': 0.4,
            'joy': 0.5,
            'celebration': 0.3,
            'conflict': 0.6,
            'cooperation': 0.4
        };
        for (const [key, value] of Object.entries(empathySituations)) {
            if (situation.toLowerCase().includes(key)) {
                return value;
            }
        }
        return 0.3; // Default empathy
    }
    /**
     * Store empathy history
     */
    storeEmpathyHistory(observerId, targetId, empathyScore) {
        let observerHistory = this.empathyHistory.get(observerId);
        if (!observerHistory) {
            observerHistory = new Map();
            this.empathyHistory.set(observerId, observerHistory);
        }
        observerHistory.set(targetId, empathyScore);
    }
    /**
     * Predict emotional response to situation
     */
    predictEmotionalResponse(agentId, situation, context) {
        try {
            const personality = context.personality;
            const moodState = this.getMoodState(agentId);
            const emotionalHistory = this.emotionalHistory.get(agentId) || [];
            // Predict based on personality
            let predictedEmotion = Emotion.SURPRISE; // Default
            let intensity = 0.5;
            let confidence = 0.5;
            if (personality) {
                if (situation.includes('danger') || situation.includes('threat')) {
                    if (personality.neuroticism > 0.7) {
                        predictedEmotion = Emotion.FEAR;
                        intensity = 0.8 + (personality.neuroticism * 0.2);
                        confidence = 0.8;
                    }
                    else if (personality.conscientiousness > 0.7) {
                        predictedEmotion = Emotion.ANTICIPATION;
                        intensity = 0.6 + (personality.conscientiousness * 0.2);
                        confidence = 0.7;
                    }
                }
                else if (situation.includes('success') || situation.includes('achievement')) {
                    if (personality.extraversion > 0.6) {
                        predictedEmotion = Emotion.JOY;
                        intensity = 0.7 + (personality.extraversion * 0.3);
                        confidence = 0.8;
                    }
                }
                else if (situation.includes('social') || situation.includes('cooperation')) {
                    if (personality.agreeableness > 0.7) {
                        predictedEmotion = Emotion.TRUST;
                        intensity = 0.6 + (personality.agreeableness * 0.2);
                        confidence = 0.7;
                    }
                }
            }
            // Adjust based on mood
            if (moodState.valence > 0.5 && [Emotion.JOY, Emotion.TRUST].includes(predictedEmotion)) {
                intensity += moodState.valence * 0.2;
            }
            else if (moodState.valence < -0.5 && [Emotion.ANGER, Emotion.FEAR, Emotion.SADNESS].includes(predictedEmotion)) {
                intensity += Math.abs(moodState.valence) * 0.2;
            }
            // Adjust based on past responses
            if (emotionalHistory.length > 0) {
                const pastResponses = emotionalHistory.slice(-5);
                const similarPastResponses = pastResponses.filter(state => state.currentEmotions.has(predictedEmotion));
                if (similarPastResponses.length > 0) {
                    const avgPastIntensity = similarPastResponses.reduce((sum, state) => sum + (state.currentEmotions.get(predictedEmotion) || 0), 0) / similarPastResponses.length;
                    intensity = (intensity + avgPastIntensity) / 2;
                    confidence = Math.min(0.9, confidence + 0.1);
                }
            }
            // Clamp values
            intensity = Math.max(0, Math.min(1, intensity));
            confidence = Math.max(0, Math.min(1, confidence));
            return {
                situation,
                emotion: predictedEmotion,
                intensity,
                confidence,
                timeHorizon: 30000 // 30 seconds
            };
        }
        catch (error) {
            console.error('[EMOTIONAL_INTELLIGENCE] Error predicting emotional response:', error);
            return null;
        }
    }
    /**
     * Simulate emotional contagion between agents
     */
    simulateEmotionalContagion(sourceId, targetId, sourceEmotions, context) {
        const contagiousEmotions = new Map();
        try {
            if (!this.config.enableEmotionalContagion) {
                return contagiousEmotions;
            }
            const relationship = context.relationship;
            const targetPersonality = context.targetPersonality;
            // Calculate contagion strength based on relationship and personality
            let contagionStrength = 0.1; // Base contagion
            if (relationship) {
                contagionStrength += relationship.trust.level * 0.3;
                contagionStrength += relationship.friendship.level * 0.2;
            }
            if (targetPersonality) {
                contagionStrength += (1 - targetPersonality.conscientiousness) * 0.2; // Less conscientious = more susceptible
                contagionStrength += targetPersonality.agreeableness * 0.1;
                contagionStrength += targetPersonality.extraversion * 0.1;
            }
            contagionStrength = Math.min(0.8, contagionStrength); // Max contagion strength
            // Apply contagion if above threshold
            if (contagionStrength >= this.config.contagionThreshold) {
                for (const [emotion, intensity] of sourceEmotions.entries()) {
                    // Some emotions are more contagious than others
                    let emotionContagionFactor = 1.0;
                    if ([Emotion.JOY, Emotion.FEAR, Emotion.ANGER].includes(emotion)) {
                        emotionContagionFactor = 1.2; // High contagion
                    }
                    else if ([Emotion.TRUST, Emotion.ANTICIPATION].includes(emotion)) {
                        emotionContagionFactor = 0.8; // Lower contagion
                    }
                    const contagiousIntensity = intensity * contagionStrength * emotionContagionFactor;
                    if (contagiousIntensity > 0.1) { // Minimum threshold for contagion
                        contagiousEmotions.set(emotion, contagiousIntensity);
                    }
                }
            }
        }
        catch (error) {
            console.error('[EMOTIONAL_INTELLIGENCE] Error simulating emotional contagion:', error);
        }
        return contagiousEmotions;
    }
    /**
     * Update recognition metrics
     */
    updateRecognitionMetrics(recognizedEmotions) {
        if (recognizedEmotions.size === 0)
            return;
        const avgConfidence = Array.from(recognizedEmotions.values())
            .reduce((sum, val) => sum + val, 0) / recognizedEmotions.size;
        this.metrics.recognition = (this.metrics.recognition + avgConfidence) / 2;
        this.updateOverallMetrics();
    }
    /**
     * Update empathy metrics
     */
    updateEmpathyMetrics(empathyScore) {
        this.metrics.understanding = (this.metrics.understanding + empathyScore) / 2;
        this.updateOverallMetrics();
    }
    /**
     * Update overall metrics
     */
    updateOverallMetrics() {
        this.metrics.overall = (this.metrics.recognition +
            this.metrics.understanding +
            this.metrics.regulation +
            this.metrics.utilization) / 4;
    }
    /**
     * Get emotional history for an agent
     */
    getEmotionalHistory(agentId) {
        return this.emotionalHistory.get(agentId) || [];
    }
    /**
     * Get mood state for an agent
     */
    getPublicMoodState(agentId) {
        return this.getMoodState(agentId);
    }
    /**
     * Get empathy level between agents
     */
    getEmpathyLevel(observerId, targetId) {
        const observerHistory = this.empathyHistory.get(observerId);
        return observerHistory?.get(targetId) || 0;
    }
    /**
     * Get current metrics
     */
    getMetrics() {
        return { ...this.metrics };
    }
    /**
     * Clear history for an agent
     */
    clearHistory(agentId) {
        this.emotionalHistory.delete(agentId);
        this.moodStates.delete(agentId);
        // Remove from empathy history
        for (const [observerId, targets] of this.empathyHistory.entries()) {
            targets.delete(agentId);
        }
    }
    /**
     * Reset all emotional intelligence state
     */
    reset() {
        this.emotionalHistory.clear();
        this.empathyHistory.clear();
        this.moodStates.clear();
        this.metrics = this.initializeMetrics();
        this.lastUpdateTime = Date.now();
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
}
/**
 * Emotional Intelligence Factory
 */
export class EmotionalIntelligenceFactory {
    /**
     * Create default emotional intelligence system
     */
    static createDefault() {
        const config = {
            enableEmotionRecognition: true,
            enableEmpathySimulation: true,
            enableEmotionalContagion: true,
            enableMoodModeling: true,
            emotionDecayRate: 0.1,
            moodInfluenceFactor: 0.3,
            empathyThreshold: 0.5,
            contagionThreshold: 0.3,
            updateFrequency: 1000,
            historyRetentionPeriod: 10 * 60 * 1000 // 10 minutes
        };
        return new EmotionalIntelligence(config);
    }
    /**
     * Create high-performance emotional intelligence system
     */
    static createHighPerformance() {
        const config = {
            enableEmotionRecognition: true,
            enableEmpathySimulation: false,
            enableEmotionalContagion: false,
            enableMoodModeling: true,
            emotionDecayRate: 0.2,
            moodInfluenceFactor: 0.2,
            empathyThreshold: 0.7,
            contagionThreshold: 0.5,
            updateFrequency: 500,
            historyRetentionPeriod: 5 * 60 * 1000 // 5 minutes
        };
        return new EmotionalIntelligence(config);
    }
    /**
     * Create detailed emotional intelligence system
     */
    static createDetailed() {
        const config = {
            enableEmotionRecognition: true,
            enableEmpathySimulation: true,
            enableEmotionalContagion: true,
            enableMoodModeling: true,
            emotionDecayRate: 0.05,
            moodInfluenceFactor: 0.4,
            empathyThreshold: 0.3,
            contagionThreshold: 0.2,
            updateFrequency: 2000,
            historyRetentionPeriod: 30 * 60 * 1000 // 30 minutes
        };
        return new EmotionalIntelligence(config);
    }
}
//# sourceMappingURL=emotional_intelligence.js.map