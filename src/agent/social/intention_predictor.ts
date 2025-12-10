/**
 * Intention Predictor System
 * 
 * This component implements sophisticated intention prediction algorithms
 * that analyze observed behavior patterns to infer goals and plans.
 * It includes goal inference, plan recognition, and temporal intention tracking.
 */

import {
  Intention,
  IntentionType,
  PredictedIntention,
  IntentionConfidence,
  IntentionChange,
  ActionPlan,
  PlannedAction,
  Evidence,
  EvidenceType
} from './tom_types.js';

import { PersonalityTraits } from '../langgraph/interfaces.js';
import { AgentRelationship } from './relationship_types.js';

/**
 * Intention prediction context
 */
export interface IntentionPredictionContext {
  agentId: string;
  currentActions: any[];
  recentHistory: any[];
  environment: any;
  socialContext: any;
  personality?: PersonalityTraits;
  relationship?: AgentRelationship;
  timestamp: number;
}

/**
 * Intention pattern for recognition
 */
export interface IntentionPattern {
  id: string;
  name: string;
  intentionType: IntentionType;
  actionSequence: string[];
  contextRequirements: string[];
  confidenceThreshold: number;
  timeWindow: number; // milliseconds
  personalityCorrelation?: Partial<PersonalityTraits>;
}

/**
 * Intention predictor configuration
 */
export interface IntentionPredictorConfig {
  maxPredictionHorizon: number; // milliseconds
  minConfidenceThreshold: number;
  enablePlanRecognition: boolean;
  enableTemporalTracking: boolean;
  enablePersonalityInference: boolean;
  maxPatterns: number;
  updateFrequency: number; // milliseconds
  historyRetentionPeriod: number; // milliseconds
}

/**
 * Main intention predictor class
 */
export class IntentionPredictor {
  private patterns: Map<string, IntentionPattern>;
  private config: IntentionPredictorConfig;
  private predictionHistory: Map<string, PredictedIntention[]>;
  private confidenceMetrics: IntentionConfidence;
  private lastUpdateTime: number;

  constructor(config: IntentionPredictorConfig) {
    this.config = config;
    this.patterns = new Map();
    this.predictionHistory = new Map();
    this.confidenceMetrics = this.initializeConfidenceMetrics();
    this.lastUpdateTime = Date.now();
    
    this.initializePatterns();
  }

  /**
   * Initialize confidence metrics
   */
  private initializeConfidenceMetrics(): IntentionConfidence {
    return {
      overall: 0.5,
      byType: new Map(),
      accuracy: 0,
      correctPredictions: 0,
      totalPredictions: 0
    };
  }

  /**
   * Initialize intention patterns
   */
  private initializePatterns(): void {
    // Resource gathering patterns
    this.addPattern({
      id: 'collect_wood',
      name: 'Collect Wood Resources',
      intentionType: IntentionType.RESOURCE_ACQUISITION,
      actionSequence: ['move', 'look', 'break', 'collect'],
      contextRequirements: ['trees', 'forest'],
      confidenceThreshold: 0.6,
      timeWindow: 30000,
      personalityCorrelation: { conscientiousness: 0.7 }
    });

    this.addPattern({
      id: 'collect_stone',
      name: 'Collect Stone Resources',
      intentionType: IntentionType.RESOURCE_ACQUISITION,
      actionSequence: ['move', 'look', 'break', 'collect'],
      contextRequirements: ['mountains', 'caves'],
      confidenceThreshold: 0.6,
      timeWindow: 30000,
      personalityCorrelation: { conscientiousness: 0.6 }
    });

    // Building patterns
    this.addPattern({
      id: 'build_shelter',
      name: 'Build Shelter',
      intentionType: IntentionType.CONSTRUCTION,
      actionSequence: ['move', 'place', 'build', 'place'],
      contextRequirements: ['flat_ground', 'resources'],
      confidenceThreshold: 0.7,
      timeWindow: 60000,
      personalityCorrelation: { conscientiousness: 0.8 }
    });

    // Exploration patterns
    this.addPattern({
      id: 'explore_area',
      name: 'Explore New Area',
      intentionType: IntentionType.EXPLORATION,
      actionSequence: ['move', 'look', 'move', 'look'],
      contextRequirements: ['unknown_area'],
      confidenceThreshold: 0.5,
      timeWindow: 45000,
      personalityCorrelation: { openness: 0.8 }
    });

    // Combat patterns
    this.addPattern({
      id: 'engage_hostile',
      name: 'Engage Hostile Entity',
      intentionType: IntentionType.COMBAT,
      actionSequence: ['approach', 'attack', 'retreat', 'attack'],
      contextRequirements: ['hostile_entities'],
      confidenceThreshold: 0.8,
      timeWindow: 15000,
      personalityCorrelation: { neuroticism: 0.3 }
    });

    // Social interaction patterns
    this.addPattern({
      id: 'seek_social',
      name: 'Seek Social Interaction',
      intentionType: IntentionType.SOCIAL_INTERACTION,
      actionSequence: ['move', 'communicate', 'wait', 'communicate'],
      contextRequirements: ['other_agents'],
      confidenceThreshold: 0.6,
      timeWindow: 20000,
      personalityCorrelation: { extraversion: 0.8 }
    });

    // Escape patterns
    this.addPattern({
      id: 'flee_danger',
      name: 'Flee from Danger',
      intentionType: IntentionType.ESCAPE,
      actionSequence: ['detect_threat', 'run', 'hide', 'look'],
      contextRequirements: ['danger', 'threats'],
      confidenceThreshold: 0.9,
      timeWindow: 10000
    });

    // Cooperation patterns
    this.addPattern({
      id: 'cooperate_build',
      name: 'Cooperative Building',
      intentionType: IntentionType.COOPERATION,
      actionSequence: ['communicate', 'coordinate', 'build', 'assist'],
      contextRequirements: ['allies', 'shared_goal'],
      confidenceThreshold: 0.7,
      timeWindow: 90000,
      personalityCorrelation: { agreeableness: 0.8 }
    });
  }

  /**
   * Add an intention pattern
   */
  public addPattern(pattern: IntentionPattern): void {
    this.patterns.set(pattern.id, pattern);
  }

  /**
   * Predict intentions based on current context
   */
  public predictIntentions(context: IntentionPredictionContext): PredictedIntention[] {
    const predictions: PredictedIntention[] = [];
    
    try {
      // Analyze current actions for pattern matching
      const matchedPatterns = this.matchPatterns(context);
      
      // Generate predictions from matched patterns
      for (const patternMatch of matchedPatterns) {
        const prediction = this.createPredictionFromPattern(patternMatch, context);
        if (prediction.confidence >= this.config.minConfidenceThreshold) {
          predictions.push(prediction);
        }
      }
      
      // Generate predictions from goal inference
      const goalPredictions = this.inferGoalsFromContext(context);
      predictions.push(...goalPredictions);
      
      // Generate temporal predictions if enabled
      if (this.config.enableTemporalTracking) {
        const temporalPredictions = this.generateTemporalPredictions(context);
        predictions.push(...temporalPredictions);
      }
      
      // Sort by confidence and probability
      predictions.sort((a, b) => (b.confidence * b.probability) - (a.confidence * a.probability));
      
      // Store in history
      this.storePredictionHistory(context.agentId, predictions);
      
      // Update confidence metrics
      this.updateConfidenceMetrics(predictions);
      
      this.lastUpdateTime = Date.now();
      
    } catch (error) {
      console.error('[INTENTION_PREDICTOR] Error predicting intentions:', error);
    }
    
    return predictions;
  }

  /**
   * Match action patterns against known intention patterns
   */
  private matchPatterns(context: IntentionPredictionContext): Array<{
    pattern: IntentionPattern;
    matchScore: number;
    matchedActions: string[];
  }> {
    const matches: Array<{
      pattern: IntentionPattern;
      matchScore: number;
      matchedActions: string[];
    }> = [];
    
    const recentActions = context.recentHistory.slice(-10).map(h => h.type);
    
    for (const pattern of this.patterns.values()) {
      const matchResult = this.matchPattern(pattern, recentActions, context);
      if (matchResult.matchScore > 0) {
        matches.push(matchResult);
      }
    }
    
    // Sort by match score
    matches.sort((a, b) => b.matchScore - a.matchScore);
    
    return matches;
  }

  /**
   * Match a specific pattern against actions
   */
  private matchPattern(
    pattern: IntentionPattern,
    actions: string[],
    context: IntentionPredictionContext
  ): {
    pattern: IntentionPattern;
    matchScore: number;
    matchedActions: string[];
  } {
    let matchScore = 0;
    const matchedActions: string[] = [];
    
    // Check action sequence match
    const sequenceScore = this.calculateSequenceMatch(pattern.actionSequence, actions);
    matchScore += sequenceScore * 0.6;
    
    // Check context requirements
    const contextScore = this.calculateContextMatch(pattern.contextRequirements, context);
    matchScore += contextScore * 0.3;
    
    // Check personality correlation if enabled
    let personalityScore = 0;
    if (this.config.enablePersonalityInference && pattern.personalityCorrelation && context.personality) {
      personalityScore = this.calculatePersonalityMatch(pattern.personalityCorrelation, context.personality);
      matchScore += personalityScore * 0.1;
    }
    
    // Extract matched actions for this pattern
    for (const action of pattern.actionSequence) {
      if (actions.includes(action)) {
        matchedActions.push(action);
      }
    }
    
    return {
      pattern,
      matchScore,
      matchedActions
    };
  }

  /**
   * Calculate sequence match score
   */
  private calculateSequenceMatch(patternSequence: string[], actions: string[]): number {
    if (patternSequence.length === 0 || actions.length === 0) {
      return 0;
    }
    
    let matches = 0;
    for (const patternAction of patternSequence) {
      if (actions.includes(patternAction)) {
        matches++;
      }
    }
    
    return matches / patternSequence.length;
  }

  /**
   * Calculate context match score
   */
  private calculateContextMatch(requirements: string[], context: IntentionPredictionContext): number {
    if (requirements.length === 0) {
      return 1.0; // No requirements = always matches
    }
    
    let matches = 0;
    for (const requirement of requirements) {
      if (this.contextHasRequirement(context, requirement)) {
        matches++;
      }
    }
    
    return matches / requirements.length;
  }

  /**
   * Check if context has a specific requirement
   */
  private contextHasRequirement(context: IntentionPredictionContext, requirement: string): boolean {
    // Simple context checking - would be more sophisticated in practice
    const contextStr = JSON.stringify(context.environment).toLowerCase();
    const socialStr = JSON.stringify(context.socialContext).toLowerCase();
    
    return contextStr.includes(requirement.toLowerCase()) || 
           socialStr.includes(requirement.toLowerCase());
  }

  /**
   * Calculate personality match score
   */
  private calculatePersonalityMatch(
    patternCorrelation: Partial<PersonalityTraits>,
    personality: PersonalityTraits
  ): number {
    let totalCorrelation = 0;
    let traitCount = 0;
    
    for (const [trait, patternValue] of Object.entries(patternCorrelation)) {
      const personalityValue = personality[trait as keyof PersonalityTraits];
      if (personalityValue !== undefined) {
        // Calculate correlation based on similarity
        const correlation = 1 - Math.abs((patternValue as number) - personalityValue);
        totalCorrelation += correlation;
        traitCount++;
      }
    }
    
    return traitCount > 0 ? totalCorrelation / traitCount : 0;
  }

  /**
   * Create prediction from pattern match
   */
  private createPredictionFromPattern(
    patternMatch: {
      pattern: IntentionPattern;
      matchScore: number;
      matchedActions: string[];
    },
    context: IntentionPredictionContext
  ): PredictedIntention {
    const intentionId = `predicted_${patternMatch.pattern.id}_${Date.now()}`;
    
    // Create action plan from pattern
    const actionPlan: ActionPlan = {
      actions: patternMatch.pattern.actionSequence.map((action, index) => ({
        action,
        expectedTiming: Date.now() + (index * 5000), // 5 seconds per action
        priority: patternMatch.pattern.actionSequence.length - index,
        dependencies: index > 0 ? [patternMatch.pattern.actionSequence[index - 1]] : []
      })),
      expectedOutcomes: [patternMatch.pattern.name],
      requiredResources: this.inferRequiredResources(patternMatch.pattern.intentionType),
      estimatedCompletion: Date.now() + patternMatch.pattern.timeWindow
    };
    
    // Calculate confidence based on match score and pattern threshold
    const confidence = Math.min(1.0, patternMatch.matchScore / patternMatch.pattern.confidenceThreshold);
    
    // Calculate probability based on context and personality
    const probability = this.calculateIntentionProbability(patternMatch.pattern, context);
    
    return {
      id: intentionId,
      goal: patternMatch.pattern.name,
      type: patternMatch.pattern.intentionType,
      priority: this.calculateIntentionPriority(patternMatch.pattern, context),
      expectedDuration: patternMatch.pattern.timeWindow,
      progress: 0,
      detectedAt: Date.now(),
      confidence,
      evidence: [{
        type: EvidenceType.OBSERVATION,
        content: patternMatch.matchedActions,
        strength: patternMatch.matchScore,
        timestamp: Date.now(),
        source: 'pattern_matching'
      }],
      plan: actionPlan,
      timeHorizon: this.config.maxPredictionHorizon,
      probability,
      alternatives: this.generateAlternativeIntentions(patternMatch.pattern, context)
    };
  }

  /**
   * Infer required resources for intention type
   */
  private inferRequiredResources(intentionType: IntentionType): string[] {
    const resourceMap: Record<IntentionType, string[]> = {
      [IntentionType.RESOURCE_ACQUISITION]: ['tools', 'inventory_space'],
      [IntentionType.CONSTRUCTION]: ['materials', 'tools', 'building_space'],
      [IntentionType.EXPLORATION]: ['food', 'tools', 'light_source'],
      [IntentionType.COMBAT]: ['weapons', 'armor', 'health'],
      [IntentionType.SOCIAL_INTERACTION]: [],
      [IntentionType.ESCAPE]: ['health', 'speed'],
      [IntentionType.COOPERATION]: ['communication', 'shared_resources'],
      [IntentionType.COMPETITION]: ['resources', 'skills'],
      [IntentionType.COMMUNICATION]: [],
      [IntentionType.SURVIVAL]: ['food', 'water', 'shelter']
    };
    
    return resourceMap[intentionType] || [];
  }

  /**
   * Calculate intention probability based on context
   */
  private calculateIntentionProbability(
    pattern: IntentionPattern,
    context: IntentionPredictionContext
  ): number {
    let probability = pattern.confidenceThreshold;
    
    // Adjust based on environmental factors
    if (context.environment.danger_level > 0.7) {
      if (pattern.intentionType === IntentionType.ESCAPE || pattern.intentionType === IntentionType.COMBAT) {
        probability += 0.2;
      } else {
        probability -= 0.1;
      }
    }
    
    // Adjust based on social context
    if (context.socialContext.allies && pattern.intentionType === IntentionType.COOPERATION) {
      probability += 0.15;
    }
    
    // Adjust based on time of day
    const hour = new Date(context.timestamp).getHours();
    if (hour >= 20 || hour <= 6) { // Night time
      if (pattern.intentionType === IntentionType.CONSTRUCTION || pattern.intentionType === IntentionType.SURVIVAL) {
        probability += 0.1;
      } else if (pattern.intentionType === IntentionType.EXPLORATION) {
        probability -= 0.1;
      }
    }
    
    return Math.max(0, Math.min(1, probability));
  }

  /**
   * Calculate intention priority
   */
  private calculateIntentionPriority(
    pattern: IntentionPattern,
    context: IntentionPredictionContext
  ): number {
    let priority = 0.5; // Base priority
    
    // Survival intentions have higher priority
    if (pattern.intentionType === IntentionType.SURVIVAL || pattern.intentionType === IntentionType.ESCAPE) {
      priority = 0.9;
    } else if (pattern.intentionType === IntentionType.COMBAT) {
      priority = 0.8;
    }
    
    // Adjust based on agent's current state
    if (context.environment.danger_level > 0.5) {
      priority += 0.2;
    }
    
    // Adjust based on personality
    if (context.personality) {
      if (context.personality.conscientiousness > 0.7 && pattern.intentionType === IntentionType.CONSTRUCTION) {
        priority += 0.1;
      }
      if (context.personality.extraversion > 0.7 && pattern.intentionType === IntentionType.SOCIAL_INTERACTION) {
        priority += 0.1;
      }
    }
    
    return Math.max(0, Math.min(1, priority));
  }

  /**
   * Generate alternative intentions
   */
  private generateAlternativeIntentions(
    pattern: IntentionPattern,
    context: IntentionPredictionContext
  ): Array<{ intention: Intention; probability: number }> {
    const alternatives: Array<{ intention: Intention; probability: number }> = [];
    
    // Generate alternatives based on similar intention types
    const similarTypes = this.getSimilarIntentionTypes(pattern.intentionType);
    
    for (const similarType of similarTypes) {
      const similarPattern = this.findPatternByType(similarType);
      if (similarPattern) {
        const alternativeIntention: Intention = {
          id: `alt_${similarPattern.id}_${Date.now()}`,
          goal: similarPattern.name,
          type: similarPattern.intentionType,
          priority: this.calculateIntentionPriority(similarPattern, context),
          expectedDuration: similarPattern.timeWindow,
          progress: 0,
          detectedAt: Date.now(),
          confidence: similarPattern.confidenceThreshold * 0.8, // Lower confidence for alternatives
          evidence: [{
            type: EvidenceType.ACTION,
            content: 'alternative_intention',
            strength: 0.5,
            timestamp: Date.now(),
            source: 'pattern_matching'
          }]
        };
        
        alternatives.push({
          intention: alternativeIntention,
          probability: this.calculateIntentionProbability(similarPattern, context) * 0.7
        });
      }
    }
    
    return alternatives.slice(0, 3); // Limit to top 3 alternatives
  }

  /**
   * Get similar intention types
   */
  private getSimilarIntentionTypes(intentionType: IntentionType): IntentionType[] {
    const similarityMap: Record<IntentionType, IntentionType[]> = {
      [IntentionType.RESOURCE_ACQUISITION]: [IntentionType.CONSTRUCTION, IntentionType.SURVIVAL],
      [IntentionType.CONSTRUCTION]: [IntentionType.RESOURCE_ACQUISITION, IntentionType.COOPERATION],
      [IntentionType.EXPLORATION]: [IntentionType.RESOURCE_ACQUISITION, IntentionType.SOCIAL_INTERACTION],
      [IntentionType.COMBAT]: [IntentionType.ESCAPE, IntentionType.SURVIVAL],
      [IntentionType.SOCIAL_INTERACTION]: [IntentionType.COOPERATION, IntentionType.COMMUNICATION],
      [IntentionType.ESCAPE]: [IntentionType.COMBAT, IntentionType.SURVIVAL],
      [IntentionType.COOPERATION]: [IntentionType.SOCIAL_INTERACTION, IntentionType.CONSTRUCTION],
      [IntentionType.COMPETITION]: [IntentionType.COMBAT, IntentionType.RESOURCE_ACQUISITION],
      [IntentionType.COMMUNICATION]: [IntentionType.SOCIAL_INTERACTION, IntentionType.COOPERATION],
      [IntentionType.SURVIVAL]: [IntentionType.RESOURCE_ACQUISITION, IntentionType.ESCAPE]
    };
    
    return similarityMap[intentionType] || [];
  }

  /**
   * Find pattern by intention type
   */
  private findPatternByType(intentionType: IntentionType): IntentionPattern | null {
    for (const pattern of this.patterns.values()) {
      if (pattern.intentionType === intentionType) {
        return pattern;
      }
    }
    return null;
  }

  /**
   * Infer goals from context without pattern matching
   */
  private inferGoalsFromContext(context: IntentionPredictionContext): PredictedIntention[] {
    const predictions: PredictedIntention[] = [];
    
    // Infer from environmental needs
    if (context.environment.health_low) {
      predictions.push(this.createHealthIntention(context));
    }
    
    if (context.environment.hunger_high) {
      predictions.push(this.createHungerIntention(context));
    }
    
    if (context.environment.inventory_full) {
      predictions.push(this.createStorageIntention(context));
    }
    
    // Infer from social needs
    if (context.socialContext.lonely && context.personality?.extraversion > 0.6) {
      predictions.push(this.createSocialIntention(context));
    }
    
    return predictions.filter(p => p.confidence >= this.config.minConfidenceThreshold);
  }

  /**
   * Create health-related intention
   */
  private createHealthIntention(context: IntentionPredictionContext): PredictedIntention {
    return {
      id: `health_intention_${Date.now()}`,
      goal: 'Restore Health',
      type: IntentionType.SURVIVAL,
      priority: 0.9,
      expectedDuration: 30000,
      progress: 0,
      detectedAt: Date.now(),
      confidence: 0.8,
      evidence: [{
        type: EvidenceType.OBSERVATION,
        content: 'low_health',
        strength: 0.9,
        timestamp: Date.now(),
        source: 'context_inference'
      }],
      timeHorizon: this.config.maxPredictionHorizon,
      probability: 0.85,
      alternatives: []
    };
  }

  /**
   * Create hunger-related intention
   */
  private createHungerIntention(context: IntentionPredictionContext): PredictedIntention {
    return {
      id: `hunger_intention_${Date.now()}`,
      goal: 'Find Food',
      type: IntentionType.RESOURCE_ACQUISITION,
      priority: 0.8,
      expectedDuration: 45000,
      progress: 0,
      detectedAt: Date.now(),
      confidence: 0.7,
      evidence: [{
        type: EvidenceType.OBSERVATION,
        content: 'high_hunger',
        strength: 0.8,
        timestamp: Date.now(),
        source: 'context_inference'
      }],
      timeHorizon: this.config.maxPredictionHorizon,
      probability: 0.75,
      alternatives: []
    };
  }

  /**
   * Create storage-related intention
   */
  private createStorageIntention(context: IntentionPredictionContext): PredictedIntention {
    return {
      id: `storage_intention_${Date.now()}`,
      goal: 'Find Storage',
      type: IntentionType.CONSTRUCTION,
      priority: 0.6,
      expectedDuration: 60000,
      progress: 0,
      detectedAt: Date.now(),
      confidence: 0.6,
      evidence: [{
        type: EvidenceType.OBSERVATION,
        content: 'inventory_full',
        strength: 0.7,
        timestamp: Date.now(),
        source: 'context_inference'
      }],
      timeHorizon: this.config.maxPredictionHorizon,
      probability: 0.65,
      alternatives: []
    };
  }

  /**
   * Create social interaction intention
   */
  private createSocialIntention(context: IntentionPredictionContext): PredictedIntention {
    return {
      id: `social_intention_${Date.now()}`,
      goal: 'Seek Social Contact',
      type: IntentionType.SOCIAL_INTERACTION,
      priority: 0.5,
      expectedDuration: 20000,
      progress: 0,
      detectedAt: Date.now(),
      confidence: 0.5,
      evidence: [{
        type: EvidenceType.ACTION,
        content: 'social_need',
        strength: 0.6,
        timestamp: Date.now(),
        source: 'context_inference'
      }],
      timeHorizon: this.config.maxPredictionHorizon,
      probability: 0.6,
      alternatives: []
    };
  }

  /**
   * Generate temporal predictions
   */
  private generateTemporalPredictions(context: IntentionPredictionContext): PredictedIntention[] {
    const predictions: PredictedIntention[] = [];
    
    // Get agent's prediction history
    const history = this.predictionHistory.get(context.agentId) || [];
    
    if (history.length > 0) {
      // Predict continuation of current intentions
      const recentPredictions = history.slice(-3);
      for (const recent of recentPredictions) {
        if (recent.progress < 0.8) { // Still in progress
          const continuation = this.createContinuationPrediction(recent, context);
          predictions.push(continuation);
        }
      }
    }
    
    return predictions;
  }

  /**
   * Create continuation prediction from recent prediction
   */
  private createContinuationPrediction(
    recent: PredictedIntention,
    context: IntentionPredictionContext
  ): PredictedIntention {
    const timePassed = Date.now() - recent.detectedAt;
    const progressIncrement = Math.min(0.2, timePassed / recent.expectedDuration);
    
    return {
      ...recent,
      id: `${recent.id}_continuation`,
      progress: Math.min(1.0, recent.progress + progressIncrement),
      confidence: Math.max(0.3, recent.confidence - 0.1), // Confidence decreases slightly
      probability: Math.max(0.3, recent.probability - 0.1),
      detectedAt: Date.now()
    };
  }

  /**
   * Store prediction history
   */
  private storePredictionHistory(agentId: string, predictions: PredictedIntention[]): void {
    const history = this.predictionHistory.get(agentId) || [];
    history.push(...predictions);
    
    // Trim old predictions based on retention period
    const cutoffTime = Date.now() - this.config.historyRetentionPeriod;
    const filteredHistory = history.filter(p => p.detectedAt > cutoffTime);
    
    this.predictionHistory.set(agentId, filteredHistory);
  }

  /**
   * Update confidence metrics
   */
  private updateConfidenceMetrics(predictions: PredictedIntention[]): void {
    if (predictions.length === 0) return;
    
    // Update overall confidence
    const avgConfidence = predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length;
    this.confidenceMetrics.overall = (this.confidenceMetrics.overall + avgConfidence) / 2;
    
    // Update confidence by type
    for (const prediction of predictions) {
      const current = this.confidenceMetrics.byType.get(prediction.type) || 0.5;
      const updated = (current + prediction.confidence) / 2;
      this.confidenceMetrics.byType.set(prediction.type, updated);
    }
    
    this.confidenceMetrics.totalPredictions += predictions.length;
  }

  /**
   * Validate prediction against actual outcome
   */
  public validatePrediction(
    agentId: string,
    predictionId: string,
    actualIntention: Intention
  ): number {
    const history = this.predictionHistory.get(agentId) || [];
    const prediction = history.find(p => p.id === predictionId);
    
    if (!prediction) {
      console.warn(`[INTENTION_PREDICTOR] Prediction ${predictionId} not found for agent ${agentId}`);
      return 0;
    }
    
    // Calculate accuracy based on type and goal similarity
    let accuracy = 0;
    
    if (prediction.type === actualIntention.type) {
      accuracy += 0.5; // 50% for correct type
    }
    
    if (prediction.goal.toLowerCase().includes(actualIntention.goal.toLowerCase()) ||
        actualIntention.goal.toLowerCase().includes(prediction.goal.toLowerCase())) {
      accuracy += 0.5; // 50% for similar goal
    }
    
    // Update metrics
    this.confidenceMetrics.correctPredictions += accuracy;
    this.confidenceMetrics.accuracy = this.confidenceMetrics.correctPredictions / this.confidenceMetrics.totalPredictions;
    
    return accuracy;
  }

  /**
   * Detect intention changes
   */
  public detectIntentionChanges(
    agentId: string,
    currentPredictions: PredictedIntention[],
    previousPredictions: PredictedIntention[]
  ): IntentionChange[] {
    const changes: IntentionChange[] = [];
    
    // Find new intentions
    for (const current of currentPredictions) {
      const previous = previousPredictions.find(p => p.type === current.type);
      if (!previous) {
        changes.push({
          previousIntention: 'none',
          newIntention: current.goal,
          reason: 'new_intention_detected',
          timestamp: Date.now(),
          confidence: current.confidence
        });
      }
    }
    
    // Find abandoned intentions
    for (const previous of previousPredictions) {
      const current = currentPredictions.find(p => p.type === previous.type);
      if (!current) {
        changes.push({
          previousIntention: previous.goal,
          newIntention: 'none',
          reason: 'intention_abandoned',
          timestamp: Date.now(),
          confidence: previous.confidence
        });
      }
    }
    
    return changes;
  }

  /**
   * Get prediction history for an agent
   */
  public getPredictionHistory(agentId: string): PredictedIntention[] {
    return this.predictionHistory.get(agentId) || [];
  }

  /**
   * Get confidence metrics
   */
  public getConfidenceMetrics(): IntentionConfidence {
    return { ...this.confidenceMetrics };
  }

  /**
   * Get all patterns
   */
  public getPatterns(): Map<string, IntentionPattern> {
    return new Map(this.patterns);
  }

  /**
   * Clear prediction history for an agent
   */
  public clearHistory(agentId: string): void {
    this.predictionHistory.delete(agentId);
  }

  /**
   * Reset all predictor state
   */
  public reset(): void {
    this.predictionHistory.clear();
    this.confidenceMetrics = this.initializeConfidenceMetrics();
    this.lastUpdateTime = Date.now();
  }

  /**
   * Get configuration
   */
  public getConfig(): IntentionPredictorConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  public updateConfig(newConfig: Partial<IntentionPredictorConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

/**
 * Intention Predictor Factory
 */
export class IntentionPredictorFactory {
  /**
   * Create default intention predictor
   */
  static createDefault(): IntentionPredictor {
    const config: IntentionPredictorConfig = {
      maxPredictionHorizon: 60000, // 1 minute
      minConfidenceThreshold: 0.5,
      enablePlanRecognition: true,
      enableTemporalTracking: true,
      enablePersonalityInference: true,
      maxPatterns: 50,
      updateFrequency: 1000,
      historyRetentionPeriod: 5 * 60 * 1000 // 5 minutes
    };
    
    return new IntentionPredictor(config);
  }

  /**
   * Create high-performance intention predictor
   */
  static createHighPerformance(): IntentionPredictor {
    const config: IntentionPredictorConfig = {
      maxPredictionHorizon: 30000, // 30 seconds
      minConfidenceThreshold: 0.7,
      enablePlanRecognition: true,
      enableTemporalTracking: false,
      enablePersonalityInference: false,
      maxPatterns: 20,
      updateFrequency: 500,
      historyRetentionPeriod: 2 * 60 * 1000 // 2 minutes
    };
    
    return new IntentionPredictor(config);
  }

  /**
   * Create detailed intention predictor
   */
  static createDetailed(): IntentionPredictor {
    const config: IntentionPredictorConfig = {
      maxPredictionHorizon: 120000, // 2 minutes
      minConfidenceThreshold: 0.3,
      enablePlanRecognition: true,
      enableTemporalTracking: true,
      enablePersonalityInference: true,
      maxPatterns: 100,
      updateFrequency: 2000,
      historyRetentionPeriod: 15 * 60 * 1000 // 15 minutes
    };
    
    return new IntentionPredictor(config);
  }
}