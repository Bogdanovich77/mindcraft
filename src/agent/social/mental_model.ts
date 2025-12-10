/**
 * Mental Model System
 * 
 * This component manages mental state representations for other agents,
 * including beliefs, intentions, emotions, knowledge, and perspective-taking.
 * It provides the foundation for theory of mind reasoning.
 */

import {
  MentalState,
  BeliefSystem,
  EpistemicBelief,
  SocialBelief,
  BeliefSource,
  Evidence,
  EvidenceType,
  BeliefConsistency,
  BeliefRevision,
  RevisionType,
  IntentionState,
  Intention,
  IntentionType,
  PredictedIntention,
  IntentionConfidence,
  IntentionChange,
  ActionPlan,
  PlannedAction,
  EmotionalState,
  Emotion,
  EmotionalResponse,
  MoodState,
  EmotionalIntelligence,
  KnowledgeState,
  KnowledgeFact,
  UnknownFact,
  SourceReliability,
  SourceType,
  KnowledgeConfidence,
  PerspectiveState,
  PerspectiveTakingAbility,
  FalseBeliefState,
  FalseBelief,
  PerspectiveSwitch,
  TheoryOfMindConfig,
  TheoryOfMindMetrics
} from './tom_types.js';

import { PersonalityTraits } from '../langgraph/interfaces.js';
import { AgentRelationship } from './relationship_types.js';

/**
 * Mental Model Manager
 * 
 * Main class for managing mental states of other agents
 */
export class MentalModelManager {
  private mentalStates: Map<string, MentalState>;
  private config: TheoryOfMindConfig;
  private metrics: TheoryOfMindMetrics;
  private lastUpdateTime: number;
  private updateCount: number;

  constructor(config: TheoryOfMindConfig) {
    this.mentalStates = new Map();
    this.config = config;
    this.metrics = this.initializeMetrics();
    this.lastUpdateTime = Date.now();
    this.updateCount = 0;
  }

  /**
   * Initialize metrics tracking
   */
  private initializeMetrics(): TheoryOfMindMetrics {
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
   * Get or create mental state for an agent
   */
  public getMentalState(agentId: string): MentalState {
    let mentalState = this.mentalStates.get(agentId);
    
    if (!mentalState) {
      mentalState = this.createMentalState(agentId);
      this.mentalStates.set(agentId, mentalState);
      this.updateMetrics();
    }
    
    return mentalState;
  }

  /**
   * Create a new mental state for an agent
   */
  private createMentalState(agentId: string): MentalState {
    return {
      agentId,
      lastUpdated: Date.now(),
      confidence: 0.1, // Start with low confidence
      beliefs: this.createBeliefSystem(),
      intentions: this.createIntentionState(),
      emotions: this.createEmotionalState(),
      knowledge: this.createKnowledgeState(),
      perspective: this.createPerspectiveState()
    };
  }

  /**
   * Create initial belief system
   */
  private createBeliefSystem(): BeliefSystem {
    return {
      epistemicBeliefs: new Map(),
      socialBeliefs: new Map(),
      consistency: {
        overallScore: 1.0,
        contradictions: 0,
        contradictoryPairs: [],
        lastChecked: Date.now()
      },
      revisionHistory: []
    };
  }

  /**
   * Create initial intention state
   */
  private createIntentionState(): IntentionState {
    return {
      activeIntentions: new Map(),
      predictedIntentions: new Map(),
      confidence: {
        overall: 0.1,
        byType: new Map(),
        accuracy: 0,
        correctPredictions: 0,
        totalPredictions: 0
      },
      changeHistory: []
    };
  }

  /**
   * Create initial emotional state
   */
  private createEmotionalState(): EmotionalState {
    return {
      currentEmotions: new Map(),
      predictedResponses: new Map(),
      mood: {
        valence: 0, // Neutral
        arousal: 0.5, // Moderate arousal
        dominance: 0.5, // Moderate dominance
        duration: 0,
        stability: 0.8
      },
      empathy: new Map(),
      intelligence: {
        recognition: 0.5,
        understanding: 0.5,
        regulation: 0.5,
        utilization: 0.5,
        overall: 0.5
      }
    };
  }

  /**
   * Create initial knowledge state
   */
  private createKnowledgeState(): KnowledgeState {
    return {
      knownFacts: new Map(),
      unknownFacts: new Map(),
      sources: new Map(),
      confidence: {
        overall: 0.1,
        byDomain: new Map(),
        accuracy: 0,
        completeness: 0.1
      }
    };
  }

  /**
   * Create initial perspective state
   */
  private createPerspectiveState(): PerspectiveState {
    return {
      currentPerspective: 'self',
      perspectiveTaking: {
        adoption: 0.5,
        maintenance: 0.5,
        switching: 0.5,
        overall: 0.5
      },
      falseBeliefUnderstanding: {
        understandsFalseBeliefs: false,
        deceptionDetection: 0.1,
        detectedFalseBeliefs: new Map(),
        accuracy: 0
      },
      switchHistory: []
    };
  }

  /**
   * Update mental state based on observation
   */
  public updateFromObservation(
    agentId: string,
    observation: any,
    context: any,
    personality?: PersonalityTraits
  ): void {
    const startTime = Date.now();
    
    try {
      const mentalState = this.getMentalState(agentId);
      
      // Update beliefs from observation
      this.updateBeliefsFromObservation(mentalState.beliefs, observation, context);
      
      // Update intentions from observed actions
      this.updateIntentionsFromObservation(mentalState.intentions, observation, context);
      
      // Update emotions from behavioral cues
      this.updateEmotionsFromObservation(mentalState.emotions, observation, context);
      
      // Update knowledge from observation
      this.updateKnowledgeFromObservation(mentalState.knowledge, observation, context);
      
      // Update perspective based on context
      this.updatePerspectiveFromContext(mentalState.perspective, observation, context);
      
      // Update confidence based on personality if available
      if (personality) {
        this.updateConfidenceFromPersonality(mentalState, personality);
      }
      
      // Update timestamp
      mentalState.lastUpdated = Date.now();
      
      // Check consistency
      this.checkBeliefConsistency(mentalState.beliefs);
      
      // Update metrics
      this.updatePerformanceMetrics(Date.now() - startTime);
      
      this.updateCount++;
      this.lastUpdateTime = Date.now();
      
    } catch (error) {
      console.error(`[MENTAL_MODEL] Error updating mental state for ${agentId}:`, error);
    }
  }

  /**
   * Update beliefs from observation
   */
  private updateBeliefsFromObservation(
    beliefs: BeliefSystem,
    observation: any,
    context: any
  ): void {
    // Create evidence from observation
    const evidence: Evidence = {
      type: EvidenceType.OBSERVATION,
      content: observation,
      strength: 0.8,
      timestamp: Date.now(),
      source: 'direct_observation'
    };

    // Update epistemic beliefs about world state
    if (observation.worldState) {
      for (const [key, value] of Object.entries(observation.worldState)) {
        const beliefId = `world_${key}`;
        let belief = beliefs.epistemicBeliefs.get(beliefId);
        
        if (!belief) {
          belief = {
            proposition: `${key} is ${value}`,
            confidence: 0.5,
            source: BeliefSource.DIRECT_OBSERVATION,
            timestamp: Date.now(),
            evidence: [evidence],
            active: true
          };
        } else {
          // Update existing belief
          belief.confidence = Math.min(1.0, belief.confidence + 0.1);
          belief.evidence.push(evidence);
          belief.timestamp = Date.now();
        }
        
        beliefs.epistemicBeliefs.set(beliefId, belief);
      }
    }

    // Update social beliefs about other agents
    if (observation.socialBehavior) {
      for (const [targetAgent, behavior] of Object.entries(observation.socialBehavior as any)) {
        const beliefId = `social_${targetAgent}`;
        let belief = beliefs.socialBeliefs.get(beliefId);
        
        if (!belief) {
          belief = {
            targetAgentId: targetAgent,
            belief: `Agent ${targetAgent} exhibits ${behavior} behavior`,
            confidence: 0.6,
            type: this.inferSocialBeliefType(behavior),
            source: BeliefSource.DIRECT_OBSERVATION,
            timestamp: Date.now(),
            evidence: [evidence],
          };
        } else {
          // Update existing belief
          belief.confidence = Math.min(1.0, belief.confidence + 0.1);
          belief.evidence.push(evidence);
          belief.timestamp = Date.now();
        }
        
        beliefs.socialBeliefs.set(beliefId, belief);
      }
    }
  }

  /**
   * Infer social belief type from behavior
   */
  private inferSocialBeliefType(behavior: any): any {
    // This would be implemented with actual behavior analysis
    // For now, return a generic type
    return 'capabilities';
  }

  /**
   * Update intentions from observation
   */
  private updateIntentionsFromObservation(
    intentions: IntentionState,
    observation: any,
    context: any
  ): void {
    if (observation.actions) {
      for (const action of observation.actions) {
        const intention = this.inferIntentionFromAction(action, context);
        if (intention) {
          intentions.activeIntentions.set(intention.id, intention);
        }
      }
    }
  }

  /**
   * Infer intention from observed action
   */
  private inferIntentionFromAction(action: any, context: any): Intention | null {
    const intentionId = `intention_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Simple intention inference based on action type
    let goal: string;
    let type: IntentionType;
    let priority: number;
    
    switch (action.type) {
      case 'move':
        goal = 'navigate to location';
        type = IntentionType.EXPLORATION;
        priority = 0.6;
        break;
      case 'collect':
        goal = 'acquire resources';
        type = IntentionType.RESOURCE_ACQUISITION;
        priority = 0.7;
        break;
      case 'build':
        goal = 'construct something';
        type = IntentionType.CONSTRUCTION;
        priority = 0.8;
        break;
      case 'attack':
        goal = 'engage in combat';
        type = IntentionType.COMBAT;
        priority = 0.9;
        break;
      case 'communicate':
        goal = 'interact socially';
        type = IntentionType.SOCIAL_INTERACTION;
        priority = 0.5;
        break;
      default:
        goal = 'perform action';
        type = IntentionType.SURVIVAL;
        priority = 0.4;
    }
    
    return {
      id: intentionId,
      goal,
      type,
      priority,
      expectedDuration: this.estimateActionDuration(action),
      progress: 0,
      detectedAt: Date.now(),
      confidence: 0.6,
      evidence: [{
        type: EvidenceType.ACTION,
        content: action,
        strength: 0.8,
        timestamp: Date.now(),
        source: 'observation'
      }]
    };
  }

  /**
   * Estimate action duration
   */
  private estimateActionDuration(action: any): number {
    // Simple duration estimation based on action type
    const durations: Record<string, number> = {
      'move': 5000,
      'collect': 3000,
      'build': 10000,
      'attack': 2000,
      'communicate': 1000
    };
    
    return durations[action.type] || 5000;
  }

  /**
   * Update emotions from observation
   */
  private updateEmotionsFromObservation(
    emotions: EmotionalState,
    observation: any,
    context: any
  ): void {
    if (observation.behavioralCues) {
      for (const cue of observation.behavioralCues) {
        const emotion = this.inferEmotionFromCue(cue);
        if (emotion) {
          const currentIntensity = emotions.currentEmotions.get(emotion) || 0;
          emotions.currentEmotions.set(emotion, Math.min(1.0, currentIntensity + 0.1));
        }
      }
    }
  }

  /**
   * Infer emotion from behavioral cue
   */
  private inferEmotionFromCue(cue: any): Emotion | null {
    // Simple emotion inference based on cues
    switch (cue.type) {
      case 'fast_movement':
        return Emotion.FEAR;
      case 'jumping':
        return Emotion.JOY;
      case 'aggressive_posture':
        return Emotion.ANGER;
      case 'slumped_shoulders':
        return Emotion.SADNESS;
      default:
        return null;
    }
  }

  /**
   * Update knowledge from observation
   */
  private updateKnowledgeFromObservation(
    knowledge: KnowledgeState,
    observation: any,
    context: any
  ): void {
    // Add new facts from observation
    if (observation.facts) {
      for (const [key, value] of Object.entries(observation.facts)) {
        const fact: KnowledgeFact = {
          fact: `${key}: ${value}`,
          confidence: 0.8,
          source: 'direct_observation',
          acquiredAt: Date.now(),
          lastVerified: Date.now(),
          usageCount: 0,
          valid: true
        };
        
        knowledge.knownFacts.set(key, fact);
      }
    }
  }

  /**
   * Update perspective from context
   */
  private updatePerspectiveFromContext(
    perspective: PerspectiveState,
    observation: any,
    context: any
  ): void {
    // Update perspective based on social context
    if (context.socialSituation) {
      perspective.currentPerspective = context.socialSituation.type;
    }
  }

  /**
   * Update confidence based on personality
   */
  private updateConfidenceFromPersonality(
    mentalState: MentalState,
    personality: PersonalityTraits
  ): void {
    // Personality traits influence confidence in mental models
    const openness = personality.openness || 0.5;
    const conscientiousness = personality.conscientiousness || 0.5;
    
    // Higher openness and conscientiousness increase confidence
    const personalityModifier = (openness + conscientiousness) / 2;
    mentalState.confidence = Math.min(1.0, mentalState.confidence + personalityModifier * 0.1);
  }

  /**
   * Check belief consistency
   */
  private checkBeliefConsistency(beliefs: BeliefSystem): void {
    const contradictions: Array<{
      belief1: string;
      belief2: string;
      conflictLevel: number;
    }> = [];
    
    // Check for contradictions in epistemic beliefs
    const epistemicArray = Array.from(beliefs.epistemicBeliefs.entries());
    for (let i = 0; i < epistemicArray.length; i++) {
      for (let j = i + 1; j < epistemicArray.length; j++) {
        const [id1, belief1] = epistemicArray[i];
        const [id2, belief2] = epistemicArray[j];
        
        const conflict = this.detectBeliefConflict(belief1, belief2);
        if (conflict > 0.5) {
          contradictions.push({
            belief1: id1,
            belief2: id2,
            conflictLevel: conflict
          });
        }
      }
    }
    
    // Update consistency metrics
    beliefs.consistency.contradictions = contradictions.length;
    beliefs.consistency.contradictoryPairs = contradictions;
    beliefs.consistency.overallScore = Math.max(0, 1.0 - contradictions.length * 0.1);
    beliefs.consistency.lastChecked = Date.now();
  }

  /**
   * Detect conflict between two beliefs
   */
  private detectBeliefConflict(belief1: EpistemicBelief, belief2: EpistemicBelief): number {
    // Simple conflict detection based on proposition content
    const prop1 = belief1.proposition.toLowerCase();
    const prop2 = belief2.proposition.toLowerCase();
    
    // Check for direct contradictions
    if (prop1.includes('is') && prop2.includes('is not')) {
      const subject1 = prop1.split(' is ')[0];
      const subject2 = prop2.split(' is not ')[0];
      
      if (subject1 === subject2) {
        return 0.9; // High conflict
      }
    }
    
    // Check for opposing states
    const opposingPairs = [
      ['alive', 'dead'],
      ['present', 'absent'],
      ['friendly', 'hostile'],
      ['safe', 'dangerous']
    ];
    
    for (const [state1, state2] of opposingPairs) {
      if (prop1.includes(state1) && prop2.includes(state2)) {
        return 0.8; // High conflict
      }
    }
    
    return 0; // No conflict detected
  }

  /**
   * Update performance metrics
   */
  private updatePerformanceMetrics(updateTime: number): void {
    this.metrics.performance.totalUpdates++;
    this.metrics.responseTime = updateTime;
    
    // Update average
    const total = this.metrics.performance.totalUpdates;
    const current = this.metrics.performance.averageUpdate;
    this.metrics.performance.averageUpdate = (current * (total - 1) + updateTime) / total;
    
    // Update peak
    if (updateTime > this.metrics.performance.peakUpdate) {
      this.metrics.performance.peakUpdate = updateTime;
    }
  }

  /**
   * Update overall metrics
   */
  private updateMetrics(): void {
    this.metrics.activeModels = this.mentalStates.size;
    
    // Calculate confidence distribution
    let high = 0, medium = 0, low = 0;
    
    for (const mentalState of this.mentalStates.values()) {
      if (mentalState.confidence > 0.7) high++;
      else if (mentalState.confidence > 0.4) medium++;
      else low++;
    }
    
    const total = this.mentalStates.size || 1;
    this.metrics.confidenceDistribution = {
      high: high / total,
      medium: medium / total,
      low: low / total
    };
    
    // Estimate memory usage (rough calculation)
    this.metrics.memoryUsage = this.mentalStates.size * 1024; // 1KB per mental state estimate
  }

  /**
   * Get mental state for an agent
   */
  public getMentalStateSnapshot(agentId: string): MentalState | null {
    return this.mentalStates.get(agentId) || null;
  }

  /**
   * Get all mental states
   */
  public getAllMentalStates(): Map<string, MentalState> {
    return new Map(this.mentalStates);
  }

  /**
   * Remove mental state for an agent
   */
  public removeMentalState(agentId: string): boolean {
    return this.mentalStates.delete(agentId);
  }

  /**
   * Clear old mental states based on retention policy
   */
  public cleanupOldStates(): number {
    const cutoffTime = Date.now() - this.config.memoryRetentionPeriod;
    let removedCount = 0;
    
    for (const [agentId, mentalState] of this.mentalStates.entries()) {
      if (mentalState.lastUpdated < cutoffTime) {
        this.mentalStates.delete(agentId);
        removedCount++;
      }
    }
    
    if (removedCount > 0) {
      this.updateMetrics();
    }
    
    return removedCount;
  }

  /**
   * Get current metrics
   */
  public getMetrics(): TheoryOfMindMetrics {
    this.updateMetrics();
    return { ...this.metrics };
  }

  /**
   * Predict agent's mental state at future time
   */
  public predictMentalState(
    agentId: string,
    timeHorizon: number
  ): MentalState | null {
    const currentState = this.mentalStates.get(agentId);
    if (!currentState) {
      return null;
    }
    
    // Create a predicted copy of the mental state
    const predictedState: MentalState = {
      ...currentState,
      agentId: `${agentId}_predicted`,
      lastUpdated: Date.now() + timeHorizon,
      confidence: Math.max(0.1, currentState.confidence - 0.1) // Confidence decreases over time
    };
    
    // Decay emotions over time
    for (const [emotion, intensity] of predictedState.emotions.currentEmotions.entries()) {
      predictedState.emotions.currentEmotions.set(emotion, intensity * 0.8);
    }
    
    // Update intentions based on time horizon
    for (const [id, intention] of predictedState.intentions.activeIntentions.entries()) {
      intention.progress = Math.min(1.0, intention.progress + (timeHorizon / intention.expectedDuration));
    }
    
    return predictedState;
  }

  /**
   * Compare predicted mental state with actual
   */
  public validatePrediction(
    agentId: string,
    predictedState: MentalState,
    actualState: MentalState
  ): number {
    let accuracy = 0;
    let factors = 0;
    
    // Compare belief confidence
    const beliefDiff = Math.abs(predictedState.confidence - actualState.confidence);
    accuracy += (1 - beliefDiff);
    factors++;
    
    // Compare emotional states
    const predictedEmotions = Array.from(predictedState.emotions.currentEmotions.values());
    const actualEmotions = Array.from(actualState.emotions.currentEmotions.values());
    
    if (predictedEmotions.length > 0 && actualEmotions.length > 0) {
      const emotionDiff = Math.abs(
        predictedEmotions.reduce((a, b) => a + b, 0) / predictedEmotions.length -
        actualEmotions.reduce((a, b) => a + b, 0) / actualEmotions.length
      );
      accuracy += (1 - emotionDiff);
      factors++;
    }
    
    // Compare intention counts
    const intentionDiff = Math.abs(
      predictedState.intentions.activeIntentions.size - 
      actualState.intentions.activeIntentions.size
    ) / Math.max(predictedState.intentions.activeIntentions.size, 1);
    accuracy += (1 - intentionDiff);
    factors++;
    
    const overallAccuracy = factors > 0 ? accuracy / factors : 0;
    
    // Update metrics
    this.metrics.predictionAccuracy = 
      (this.metrics.predictionAccuracy * this.updateCount + overallAccuracy) / (this.updateCount + 1);
    
    return overallAccuracy;
  }

  /**
   * Reset all mental states
   */
  public reset(): void {
    this.mentalStates.clear();
    this.metrics = this.initializeMetrics();
    this.updateCount = 0;
    this.lastUpdateTime = Date.now();
  }

  /**
   * Get configuration
   */
  public getConfig(): TheoryOfMindConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  public updateConfig(newConfig: Partial<TheoryOfMindConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

/**
 * Mental Model Factory
 * 
 * Factory for creating mental model managers with different configurations
 */
export class MentalModelFactory {
  /**
   * Create mental model manager with default configuration
   */
  static createDefault(): MentalModelManager {
    const defaultConfig: TheoryOfMindConfig = {
      maxMentalModels: 50,
      confidenceThreshold: 0.5,
      updateFrequency: 1000,
      memoryRetentionPeriod: 7 * 24 * 60 * 60 * 1000, // 7 days
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
    
    return new MentalModelManager(defaultConfig);
  }

  /**
   * Create mental model manager for high-performance scenarios
   */
  static createHighPerformance(): MentalModelManager {
    const highPerfConfig: TheoryOfMindConfig = {
      maxMentalModels: 20,
      confidenceThreshold: 0.7,
      updateFrequency: 500,
      memoryRetentionPeriod: 24 * 60 * 60 * 1000, // 1 day
      enablePerspectiveTaking: false,
      enableFalseBeliefUnderstanding: false,
      enableEmotionalIntelligence: true,
      enableSocialReasoning: false,
      performance: {
        enableCaching: true,
        cacheSizeLimit: 50,
        enableLazyLoading: true,
        batchSize: 20,
        enableParallelProcessing: true,
        maxConcurrentOperations: 10
      }
    };
    
    return new MentalModelManager(highPerfConfig);
  }

  /**
   * Create mental model manager for detailed social reasoning
   */
  static createDetailed(): MentalModelManager {
    const detailedConfig: TheoryOfMindConfig = {
      maxMentalModels: 100,
      confidenceThreshold: 0.3,
      updateFrequency: 2000,
      memoryRetentionPeriod: 30 * 24 * 60 * 60 * 1000, // 30 days
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
    
    return new MentalModelManager(detailedConfig);
  }
}