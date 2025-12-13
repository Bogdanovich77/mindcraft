/**
 * Purpose Core System
 * 
 * Main integration point for personality, motivations, values, and ethics.
 * Provides purpose-driven decision making while respecting reactive interrupts.
 */

import { PersonalitySystem, PersonalityExperience } from './personality.js';
import { MotivationSystem, MotivationEvent } from './motivations.js';
import { ValueSystem, ValueEvent } from './values.js';
import { EthicsSystem } from './ethics.js';
import { PurposeDrivenDecisionMaker, ActionOption, DecisionContext, UtilityBreakdown } from './decision_maker.js';
import {
  AgentState,
  ProcessingState, 
  Goal, 
  Plan, 
  MemoryState, 
  SkillState, 
  ReactiveState, 
  ExecutiveState, 
  WorldContext, 
  SocialState, 
  SocialContext,
  Motivation
} from '../langgraph/interfaces.js';

export interface PurposeCoreState {
  personality: any;
  motivations: any;
  values: any;
  ethics: any;
  lastUpdate: number;
  activeGoals: string[];
  decisionHistory: Array<{
    action: string;
    utility: number;
    timestamp: number;
    outcome?: 'success' | 'failure' | 'partial';
  }>
}

export interface PurposeCoreConfig {
  initialPersonality?: Partial<any>;
  initialMotivations?: Partial<any>;
  initialValues?: Partial<any>;
  initialEthics?: Partial<any>;
  learningRate?: number;
  adaptationSpeed?: number;
  decisionTimeLimit?: number; // ms
}

export interface CognitiveInput {
  situation: string;
  availableActions: ActionOption[];
  context: DecisionContext;
  timeConstraints: number;
  interruptLevel: 'none' | 'low' | 'medium' | 'high' | 'emergency';
}

export interface CognitiveOutput {
  selectedAction: ActionOption | null;
  utility: UtilityBreakdown;
  reasoning: string;
  confidence: number;
  processingTime: number;
  yieldedToReactive: boolean;
}

export class PurposeCore {
  private personality!: PersonalitySystem;
  private motivations!: MotivationSystem;
  private values!: ValueSystem;
  private ethics!: EthicsSystem;
  private decisionMaker!: PurposeDrivenDecisionMaker;
  
  private state: PurposeCoreState;
  private config: Required<PurposeCoreConfig>;
  private socialState?: SocialState;
  
  constructor(config?: PurposeCoreConfig) {
    this.config = {
      initialPersonality: {},
      initialMotivations: {},
      initialValues: {},
      initialEthics: {},
      learningRate: 0.1,
      adaptationSpeed: 0.05,
      decisionTimeLimit: 2000,
      ...config
    };
    
    this.initializeComponents();
    this.state = this.createInitialState();
  }
  
  /**
   * Initialize all cognitive components
   */
  private initializeComponents(): void {
    this.personality = new PersonalitySystem(this.config.initialPersonality);
    this.motivations = new MotivationSystem(this.config.initialMotivations);
    this.values = new ValueSystem(this.config.initialValues);
    this.ethics = new EthicsSystem(this.config.initialEthics);
    
    this.decisionMaker = new PurposeDrivenDecisionMaker(
      this.personality,
      this.motivations,
      this.values,
      this.ethics
    );
  }
  
  /**
   * Create initial state
   */
  private createInitialState(): PurposeCoreState {
    return {
      personality: this.personality.getProfile(),
      motivations: this.motivations.getProfile(),
      values: this.values.getHierarchy(),
      ethics: this.ethics.getProfile(),
      lastUpdate: Date.now(),
      activeGoals: [],
      decisionHistory: []
    };
  }
  
  /**
   * Main cognitive processing cycle
   */
  async processCognitive(input: CognitiveInput): Promise<CognitiveOutput> {
    const startTime = Date.now();
    
    // Check if we should yield to reactive system
    if (this.shouldYieldToReactive(input)) {
      return {
        selectedAction: null,
        utility: {
          totalUtility: 0,
          purposeUtility: 0,
          personalityUtility: 0,
          motivationUtility: 0,
          ethicsUtility: 0,
          breakdown: { purpose: 0, personality: 0, motivations: 0, values: 0, ethics: 0 },
          reasoning: 'Yielded to reactive system'
        },
        reasoning: 'Emergency or high-priority interrupt - deferring to reactive behaviors',
        confidence: 0,
        processingTime: Date.now() - startTime,
        yieldedToReactive: true
      };
    }
    
    // Update internal state
    this.updateInternalState(input);
    
    // Apply social influence to decision making
    const socialInfluence = this.calculateSocialInfluence(input);
    
    // Generate goals if needed
    const goals = this.generateGoals();
    this.state.activeGoals = goals;
    
    // Select best action with social context
    const decision = this.decisionMaker.selectBestAction(input.availableActions, input.context);
    
    // Calculate confidence
    const confidence = this.calculateDecisionConfidence(decision.utility);
    
    // Record decision
    this.recordDecision(decision.action?.type || 'no_action', decision.utility.totalUtility);
    
    const processingTime = Date.now() - startTime;
    
    return {
      selectedAction: decision.action,
      utility: decision.utility,
      reasoning: decision.utility.reasoning,
      confidence,
      processingTime,
      yieldedToReactive: false
    };
  }
  
  /**
   * Check if cognitive processing should yield to reactive system
   */
  private shouldYieldToReactive(input: CognitiveInput): boolean {
    // Emergency interrupts always take priority
    if (input.interruptLevel === 'emergency') return true;
    
    // High priority interrupts with time pressure
    if (input.interruptLevel === 'high' && input.timeConstraints < 500) return true;
    
    // Time constraints exceeded
    if (input.timeConstraints < this.config.decisionTimeLimit * 0.5) return true;
    
    // Danger level too high for complex cognitive processing
    if (input.context.environmentalFactors.danger_level > 0.8) return true;
    
    return false;
  }
  
  /**
   * Update internal cognitive state
   */
  private updateInternalState(input: CognitiveInput): void {
    const deltaTime = Date.now() - this.state.lastUpdate;
    
    // Update all components with time-based decay
    this.motivations.update(deltaTime);
    this.values.update(deltaTime);
    
    // Update state snapshot
    this.state.personality = this.personality.getProfile();
    this.state.motivations = this.motivations.getProfile();
    this.state.values = this.values.getHierarchy();
    this.state.ethics = this.ethics.getProfile();
    this.state.lastUpdate = Date.now();
  }
  
  /**
   * Generate goals based on current motivations and values
   */
  private generateGoals(): string[] {
    const motivationGoals = this.motivations.generateGoals();
    const valueGuidance = this.values.getDecisionGuidance([
      'gather_resources', 'build_shelter', 'explore', 'socialize', 'create', 'defend'
    ]);
    
    // Combine motivation-driven and value-driven goals
    const goals: string[] = [];
    
    // Add top motivation goals
    motivationGoals.slice(0, 3).forEach(goal => {
      goals.push(goal.type);
    });
    
    // Add top value-aligned goals
    valueGuidance.slice(0, 2).forEach(guidance => {
      if (guidance.score > 0.6) {
        goals.push(guidance.action);
      }
    });
    
    return goals;
  }
  
  /**
   * Calculate confidence in decision
   */
  private calculateDecisionConfidence(utility: UtilityBreakdown): number {
    // Confidence based on utility score and consistency
    const utilityConfidence = utility.totalUtility;
    
    // Check for conflicts in decision components
    const breakdown = utility.breakdown;
    const variance = this.calculateVariance([
      breakdown.purpose,
      breakdown.personality,
      breakdown.motivations,
      breakdown.values,
      breakdown.ethics
    ]);
    
    // High variance reduces confidence
    const consistencyConfidence = Math.max(0, 1 - variance);
    
    // Weighted average
    return (utilityConfidence * 0.7 + consistencyConfidence * 0.3);
  }
  
  /**
   * Calculate variance of values
   */
  private calculateVariance(values: number[]): number {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }
  
  /**
   * Record decision for learning
   */
  private recordDecision(action: string, utility: number): void {
    this.state.decisionHistory.push({
      action,
      utility,
      timestamp: Date.now()
    });
    
    // Keep history manageable
    if (this.state.decisionHistory.length > 100) {
      this.state.decisionHistory = this.state.decisionHistory.slice(-50);
    }
  }
  
  /**
   * Process outcome for learning and adaptation
   */
  processOutcome(
    action: ActionOption,
    outcome: 'success' | 'failure' | 'partial',
    context: DecisionContext
  ): void {
    // Update decision maker with experience
    this.decisionMaker.updateFromExperience(action, outcome, context);
    
    // Update decision history
    const lastDecision = this.state.decisionHistory[this.state.decisionHistory.length - 1];
    if (lastDecision && lastDecision.action === action.type) {
      lastDecision.outcome = outcome;
    }
    
    // Trigger adaptation based on significant outcomes
    if (outcome === 'success' || outcome === 'failure') {
      this.adaptFromExperience(action, outcome, context);
    }
  }
  
  /**
   * Adapt cognitive systems based on experience
   */
  private adaptFromExperience(
    action: ActionOption,
    outcome: 'success' | 'failure' | 'partial',
    context: DecisionContext
  ): void {
    const adaptationStrength = this.config.adaptationSpeed;
    
    if (outcome === 'success') {
      // Reinforce successful patterns
      this.reinforceSuccessfulPatterns(action, context, adaptationStrength);
    } else if (outcome === 'failure') {
      // Adjust for failed patterns
      this.adjustForFailedPatterns(action, context, adaptationStrength);
    }
  }
  
  /**
   * Reinforce successful behavioral patterns
   */
  private reinforceSuccessfulPatterns(action: ActionOption, context: any, strength: number): void {
    // Create positive reinforcement events
    const motivationEvent: MotivationEvent = {
      type: 'success',
      motivationType: this.getPrimaryMotivationForAction(action.type),
      impact: strength,
      context
    };
    
    const valueEvent: ValueEvent = {
      type: 'action_taken',
      affectedValues: this.getValuesForAction(action.type),
      reinforcement: strength * 0.5,
      context
    };
    
    // Apply reinforcement
    this.motivations.update(0, [motivationEvent]);
    this.values.update(0, [valueEvent]);
  }
  
  /**
   * Adjust for failed behavioral patterns
   */
  private adjustForFailedPatterns(action: ActionOption, context: any, strength: number): void {
    // Create negative reinforcement events
    const motivationEvent: MotivationEvent = {
      type: 'failure',
      motivationType: this.getPrimaryMotivationForAction(action.type),
      impact: -strength,
      context
    };
    
    const valueEvent: ValueEvent = {
      type: 'outcome_observed',
      affectedValues: this.getValuesForAction(action.type),
      reinforcement: -strength * 0.3,
      context
    };
    
    // Apply adjustments
    this.motivations.update(0, [motivationEvent]);
    this.values.update(0, [valueEvent]);
  }
  
  /**
   * Get primary motivation for action type
   */
  private getPrimaryMotivationForAction(actionType: string): any {
    const motivationMap: Record<string, string> = {
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
  private getValuesForAction(actionType: string): any[] {
    const valueMap: Record<string, string[]> = {
      'help_ally': ['compassion', 'cooperation', 'loyalty'],
      'attack': ['courage', 'justice'],
      'share_resources': ['cooperation', 'compassion'],
      'build': ['creativity', 'growth'],
      'explore': ['freedom', 'knowledge', 'courage']
    };
    
    return valueMap[actionType] || [];
  }
  
  /**
   * Get current purpose core state
   */
  getState(): PurposeCoreState {
    return { ...this.state };
  }
  
  /**
   * Get current active goals
   */
  getActiveGoals(): string[] {
    return [...this.state.activeGoals];
  }
  
  /**
   * Get decision history
   */
  getDecisionHistory(): Array<{
    action: string;
    utility: number;
    timestamp: number;
    outcome?: 'success' | 'failure' | 'partial';
  }> {
    return [...this.state.decisionHistory];
  }
  
  /**
   * Check if purpose core is ready for decision making
   */
  isReady(): boolean {
    return this.state.lastUpdate > 0 && 
           this.state.activeGoals.length > 0 &&
           this.personality.getProfile().confidence > 0.3;
  }
  
  /**
   * Reset purpose core to initial state
   */
  reset(): void {
    this.initializeComponents();
    this.state = this.createInitialState();
  }
  
  /**
   * Create purpose core from legacy profile
   */
  static fromLegacyProfile(legacyProfile: any): PurposeCore {
    const config: PurposeCoreConfig = {
      initialPersonality: PersonalitySystem.fromLegacyProfile(legacyProfile).getProfile(),
      initialMotivations: MotivationSystem.fromLegacyProfile(legacyProfile).getProfile(),
      initialValues: ValueSystem.fromLegacyProfile(legacyProfile).getHierarchy(),
      initialEthics: EthicsSystem.fromLegacyProfile(legacyProfile).getProfile()
    };
    
    return new PurposeCore(config);
  }
  
  /**
   * Set social state for social-aware decision making
   */
  setSocialState(socialState: SocialState): void {
    this.socialState = socialState;
  }
  
  /**
   * Calculate social influence on decision making
   */
  private calculateSocialInfluence(input: CognitiveInput): any {
    if (!this.socialState) {
      return {
        trustInfluence: 0,
        reputationInfluence: 0,
        groupPressure: 0,
        socialNorms: [],
        relationshipContext: null
      };
    }
    
    const { relationships, theoryOfMind, socialContext } = this.socialState;
    
    // Calculate trust-based influence
    let trustInfluence = 0;
    let relationshipContext = null;
    
    // Combine all nearby agents from social context
    const nearbyAgents = [
      ...(input.context.socialContext?.allies_nearby || []),
      ...(input.context.socialContext?.enemies_nearby || []),
      ...(input.context.socialContext?.neutrals_nearby || [])
    ];
    
    if (nearbyAgents.length > 0) {
      const agentTrustLevels = nearbyAgents.map(agentId => {
        const relationship = relationships.get(agentId || '');
        return relationship?.trustLevel || 0.5;
      });
      trustInfluence = agentTrustLevels.reduce((sum, trust) => sum + trust, 0) / agentTrustLevels.length;
      
      // Find most trusted relationship for context
      const mostTrustedAgent = nearbyAgents.reduce((best, agentId) => {
        if (!best || !agentId) return agentId || best || '';
        const bestTrust = relationships.get(best)?.trustLevel || 0;
        const currentTrust = relationships.get(agentId)?.trustLevel || 0;
        return currentTrust > bestTrust ? agentId : best;
      }, '');
      
      const mostTrustedRelationship = relationships.get(mostTrustedAgent || '');
      relationshipContext = {
        agentId: mostTrustedAgent || '',
        trustLevel: mostTrustedRelationship?.trustLevel || 0.5,
        friendshipLevel: mostTrustedRelationship?.friendshipScore || 0.5,
        status: 'active'
      };
    }
    
    // Calculate reputation influence
    const reputationInfluence = this.socialState.reputation?.globalScore || 0.5;
    
    // Calculate group pressure from social context
    let groupPressure = 0;
    const socialNorms: string[] = [];
    
    if (socialContext.groupDynamics && socialContext.groupDynamics.cohesion > 0.7) {
      groupPressure = socialContext.groupDynamics.cohesion * 0.3;
      socialNorms.push(...socialContext.socialNorms);
    }
    
    // Apply theory of mind insights
    let tomInfluence = 0;
    if (theoryOfMind.size > 0) {
      const mentalModels = Array.from(theoryOfMind.values());
      const avgPredictionConfidence = mentalModels.reduce((sum: number, model: any) =>
        sum + (model.confidence || 0.5), 0) / mentalModels.length;
      tomInfluence = avgPredictionConfidence * 0.2;
    }
    
    return {
      trustInfluence,
      reputationInfluence,
      groupPressure: groupPressure + tomInfluence,
      socialNorms,
      relationshipContext,
      socialLearningInfluence: 0 // Placeholder for social learning influence
    };
  }
  
  /**
   * Calculate social learning influence
   */
  private calculateSocialLearningInfluence(socialLearning: any): number {
    if (!socialLearning || !socialLearning.learnedPatterns) return 0;
    
    const recentPatterns = socialLearning.learnedPatterns.filter((pattern: any) =>
      Date.now() - pattern.lastObserved < 24 * 60 * 60 * 1000 // Last 24 hours
    );
    
    if (recentPatterns.length === 0) return 0;
    
    const avgSuccess = recentPatterns.reduce((sum: number, pattern: any) =>
      sum + pattern.success, 0) / recentPatterns.length;
    
    return avgSuccess * 0.15; // 15% maximum influence from social learning
  }
  
  /**
   * Update personality based on social feedback
   */
  updateFromSocialFeedback(feedback: {
    trustChanges: Record<string, number>;
    reputationChanges: Record<string, number>;
    socialNormViolations: string[];
    groupConformity: number;
  }): void {
    // Update personality based on social feedback
    const personalityProfile = this.personality.getProfile();
    
    // Adjust agreeableness based on trust changes
    if (feedback.trustChanges) {
      const avgTrustChange = Object.values(feedback.trustChanges).reduce((sum: number, change: number) =>
        sum + Math.abs(change), 0) / Object.values(feedback.trustChanges).length;
      
      if (avgTrustChange > 0.1) {
        personalityProfile.traits.agreeableness = Math.min(1.0, (personalityProfile.traits.agreeableness || 0.5) + 0.02);
      } else if (avgTrustChange < -0.1) {
        personalityProfile.traits.agreeableness = Math.max(0.0, (personalityProfile.traits.agreeableness || 0.5) - 0.02);
      }
    }
    
    // Adjust extraversion based on group conformity
    if (feedback.groupConformity > 0.7) {
      personalityProfile.traits.extraversion = Math.min(1.0, (personalityProfile.traits.extraversion || 0.5) + 0.01);
    } else if (feedback.groupConformity < 0.3) {
      personalityProfile.traits.extraversion = Math.max(0.0, (personalityProfile.traits.extraversion || 0.5) - 0.01);
    }
    
    // Update personality system with modified profile
    this.personality = new PersonalitySystem(personalityProfile.traits);
  }
  
  /**
   * Generate socially-aware goals
   */
  generateSocialGoals(): string[] {
    if (!this.socialState) {
      return this.generateGoals();
    }
    
    const { relationships, socialContext } = this.socialState;
    const goals: string[] = [];
    
    // Relationship maintenance goals
    if (relationships.size > 0) {
      goals.push('maintain_relationships');
      
      // Check for relationships needing attention
      const relationshipArray = Array.from(relationships.entries());
      const neglectedRelationships = relationshipArray.filter(([agentId, relationship]) => {
        const trustLevel = relationship.trustLevel || 0.5;
        const friendshipLevel = relationship.friendshipScore || 0.5;
        return trustLevel < 0.3 || friendshipLevel < 0.3;
      });
      
      if (neglectedRelationships.length > 0) {
        goals.push('repair_relationships');
      }
    }
    
    // Group participation goals
    if (socialContext.groupDynamics && socialContext.groupDynamics.cohesion > 0.6) {
      goals.push('participate_in_group_activities');
    }
    
    // Reputation management goals
    const reputationScore = this.socialState.reputation?.globalScore || 0.5;
    if (reputationScore < 0.4) {
      goals.push('improve_reputation');
    }
    
    return goals;
  }
  
  /**
   * Generate social relationship goals
   */
  private generateSocialRelationshipGoals(input: CognitiveInput): Goal[] {
    if (!this.socialState) {
      return [];
    }
    
    const { relationships, socialContext } = this.socialState;
    const goals: Goal[] = [];
    
    // Check for relationship maintenance opportunities
    if (relationships.size > 0) {
      const relationshipArray = Array.from(relationships.entries());
      const neglectedRelationships = relationshipArray.filter(([agentId, relationship]) => {
        const trustLevel = relationship.trustLevel || 0.5;
        const friendshipLevel = relationship.friendshipScore || 0.5;
        return trustLevel < 0.6 || friendshipLevel < 0.6;
      });
      
      for (const [agentId, relationship] of neglectedRelationships) {
        goals.push({
          id: `improve_relationship_${agentId}`,
          type: 'social',
          priority: 'medium',
          status: 'pending',
          description: `Improve relationship with ${agentId} - Trust: ${relationship.trustLevel}, Friendship: ${relationship.friendshipScore}`,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          dependencies: [],
          resources: {
            required: [],
            allocated: []
          },
          progress: {
            current: 0,
            target: 100,
            percentage: 0
          }
        });
      }
    }
    
    // Check reputation status
    const reputationScore = this.socialState.reputation?.globalScore || 0.5;
    if (reputationScore < 0.4) {
      goals.push({
        id: 'improve_reputation',
        type: 'social',
        priority: 'high',
        status: 'pending',
        description: `Improve community reputation - Current reputation: ${reputationScore}`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        dependencies: [],
        resources: {
          required: [],
          allocated: []
        },
        progress: {
          current: 0,
          target: 100,
          percentage: 0
        }
      });
    }
    
    return goals;
  }

  /**
   * Export to legacy profile format
   */
  toLegacyProfile(): any {
    return {
      personality: this.personality.toLegacyProfile().personality,
      behavior: {
        ...this.personality.toLegacyProfile().behavior,
        ...this.motivations.toLegacyProfile().behavior,
        ...this.values.toLegacyProfile().behavior,
        ...this.ethics.toLegacyProfile().behavior
      },
      values: this.values.toLegacyProfile().values,
      ethics: this.ethics.toLegacyProfile().ethics,
      goals: this.state.activeGoals,
      socialState: this.socialState
    };
  }
}