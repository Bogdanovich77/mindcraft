/**
 * Trust Calculator
 * 
 * Advanced trust calculation algorithms for social relationships
 * Following the established patterns from cognitive components
 */

import {
  TrustMetrics,
  TrustUpdate,
  RelationshipInteraction,
  InteractionType,
  InteractionOutcome,
  PersonalityCompatibility,
  TrustCalculationConfig,
  SocialContext
} from './relationship_types.js';
import { PersonalityTraits } from '../cognitive/personality.js';
import { AgentState } from '../langgraph/interfaces.js';

/**
 * Trust calculation system with personality-driven algorithms
 */
export class TrustCalculator {
  private config: TrustCalculationConfig;
  private personalityCompatibilityCache: Map<string, PersonalityCompatibility>;
  
  constructor(config?: Partial<TrustCalculationConfig>) {
    this.config = {
      personalityWeight: 0.3,
      experienceWeight: 0.4,
      reputationWeight: 0.2,
      decayRate: 0.01, // 1% per hour
      recoveryRate: 0.05, // 5% per positive interaction
      breachThreshold: 0.3,
      repairThreshold: 0.7,
      ...config
    };
    
    this.personalityCompatibilityCache = new Map();
  }
  
  /**
   * Calculate initial trust level based on personality compatibility
   */
  calculateInitialTrust(
    agentPersonality: PersonalityTraits,
    targetPersonality: PersonalityTraits
  ): number {
    const compatibility = this.calculatePersonalityCompatibility(
      agentPersonality,
      targetPersonality
    );
    
    // Base trust from personality compatibility
    const personalityTrust = compatibility.compatibility * 0.6 + 
                            compatibility.trustPropensity * 0.4;
    
    // Apply personality-specific modifiers
    const agentModifiers = this.getPersonalityTrustModifiers(agentPersonality);
    const targetModifiers = this.getPersonalityTrustModifiers(targetPersonality);
    
    const combinedModifiers = (agentModifiers + targetModifiers) / 2;
    
    return Math.max(0, Math.min(1, personalityTrust * combinedModifiers));
  }
  
  /**
   * Update trust based on interaction outcome
   */
  updateTrust(
    currentTrust: TrustMetrics,
    interaction: RelationshipInteraction,
    agentPersonality: PersonalityTraits,
    reputationScore: number = 0.5
  ): TrustMetrics {
    const trustChange = this.calculateTrustChange(
      currentTrust,
      interaction,
      agentPersonality,
      reputationScore
    );
    
    const newLevel = Math.max(0, Math.min(1, 
      currentTrust.level + trustChange.overall
    ));
    
    const update: TrustUpdate = {
      timestamp: Date.now(),
      oldValue: currentTrust.level,
      newValue: newLevel,
      reason: trustChange.reason,
      source: interaction.type,
      context: interaction.context
    };
    
    // Update individual trust components
    const updatedTrust: TrustMetrics = {
      level: newLevel,
      reliability: this.updateComponentTrust(
        currentTrust.reliability,
        trustChange.reliability
      ),
      competence: this.updateComponentTrust(
        currentTrust.competence,
        trustChange.competence
      ),
      integrity: this.updateComponentTrust(
        currentTrust.integrity,
        trustChange.integrity
      ),
      consistency: this.updateComponentTrust(
        currentTrust.consistency,
        trustChange.consistency
      ),
      vulnerability: this.updateComponentTrust(
        currentTrust.vulnerability,
        trustChange.vulnerability
      ),
      lastUpdated: Date.now(),
      updateHistory: [...currentTrust.updateHistory.slice(-49), update] // Keep last 50
    };
    
    return updatedTrust;
  }
  
  /**
   * Apply time-based decay to trust levels
   */
  applyTrustDecay(trust: TrustMetrics, deltaTime: number): TrustMetrics {
    if (deltaTime <= 0) return trust;
    
    const hoursPassed = deltaTime / (1000 * 60 * 60);
    const decayFactor = Math.pow(1 - this.config.decayRate, hoursPassed);
    
    return {
      ...trust,
      level: Math.max(0.1, trust.level * decayFactor), // Minimum 0.1 trust
      reliability: Math.max(0.1, trust.reliability * decayFactor),
      competence: Math.max(0.1, trust.competence * decayFactor),
      integrity: Math.max(0.1, trust.integrity * decayFactor),
      consistency: Math.max(0.1, trust.consistency * decayFactor),
      vulnerability: Math.max(0, trust.vulnerability * decayFactor),
      lastUpdated: Date.now()
    };
  }
  
  /**
   * Calculate trust repair after breach
   */
  calculateTrustRepair(
    currentTrust: TrustMetrics,
    repairActions: string[],
    agentPersonality: PersonalityTraits
  ): number {
    const forgivenessFactor = this.calculateForgivenessFactor(agentPersonality);
    const actionEffectiveness = repairActions.reduce((sum, action) => {
      return sum + this.getRepairActionEffectiveness(action);
    }, 0) / Math.max(1, repairActions.length);
    
    const repairPotential = forgivenessFactor * actionEffectiveness * this.config.recoveryRate;
    
    return Math.min(1, currentTrust.level + repairPotential);
  }
  
  /**
   * Predict future trust levels
   */
  predictTrustLevel(
    currentTrust: TrustMetrics,
    recentInteractions: RelationshipInteraction[],
    timeframe: number // milliseconds
  ): number {
    if (recentInteractions.length === 0) {
      // Apply decay only
      const hoursPassed = timeframe / (1000 * 60 * 60);
      const decayFactor = Math.pow(1 - this.config.decayRate, hoursPassed);
      return Math.max(0.1, currentTrust.level * decayFactor);
    }
    
    // Analyze interaction patterns
    const positiveInteractions = recentInteractions.filter(i => 
      i.outcome.success && i.outcome.mutualBenefit > 0.5
    ).length;
    
    const negativeInteractions = recentInteractions.filter(i => 
      !i.outcome.success || i.outcome.emotionalImpact < -0.5
    ).length;
    
    const interactionRatio = positiveInteractions / Math.max(1, recentInteractions.length);
    const trend = (positiveInteractions - negativeInteractions) / Math.max(1, recentInteractions.length);
    
    // Calculate predicted trust
    const hoursPassed = timeframe / (1000 * 60 * 60);
    const decayFactor = Math.pow(1 - this.config.decayRate, hoursPassed);
    const growthFactor = 1 + (trend * this.config.recoveryRate * hoursPassed / 24);
    
    return Math.max(0, Math.min(1, currentTrust.level * decayFactor * growthFactor));
  }
  
  /**
   * Calculate personality compatibility between agents
   */
  private calculatePersonalityCompatibility(
    personality1: PersonalityTraits,
    personality2: PersonalityTraits
  ): PersonalityCompatibility {
    const cacheKey = this.generateCompatibilityKey(personality1, personality2);
    
    if (this.personalityCompatibilityCache.has(cacheKey)) {
      return this.personalityCompatibilityCache.get(cacheKey)!;
    }
    
    const factors = this.calculateCompatibilityFactors(personality1, personality2);
    const compatibility = this.calculateOverallCompatibility(factors);
    
    const result: PersonalityCompatibility = {
      compatibility,
      factors,
      trustPropensity: this.calculateTrustPropensity(personality1, personality2),
      friendshipPropensity: this.calculateFriendshipPropensity(personality1, personality2),
      collaborationPropensity: this.calculateCollaborationPropensity(personality1, personality2)
    };
    
    // Cache result
    this.personalityCompatibilityCache.set(cacheKey, result);
    
    // Limit cache size
    if (this.personalityCompatibilityCache.size > 1000) {
      const firstKey = this.personalityCompatibilityCache.keys().next().value;
      this.personalityCompatibilityCache.delete(firstKey);
    }
    
    return result;
  }
  
  /**
   * Calculate trust change from interaction
   */
  private calculateTrustChange(
    currentTrust: TrustMetrics,
    interaction: RelationshipInteraction,
    agentPersonality: PersonalityTraits,
    reputationScore: number
  ): {
    overall: number;
    reliability: number;
    competence: number;
    integrity: number;
    consistency: number;
    vulnerability: number;
    reason: string;
  } {
    const baseChange = this.getInteractionTrustChange(interaction);
    const personalityModifier = this.getPersonalityInteractionModifier(
      agentPersonality,
      interaction
    );
    const reputationModifier = 1 + (reputationScore - 0.5) * 0.2;
    
    const overallChange = baseChange.overall * personalityModifier * reputationModifier;
    
    return {
      overall: overallChange,
      reliability: baseChange.reliability * personalityModifier,
      competence: baseChange.competence * personalityModifier,
      integrity: baseChange.integrity * personalityModifier,
      consistency: baseChange.consistency * personalityModifier,
      vulnerability: baseChange.vulnerability * personalityModifier,
      reason: this.generateTrustChangeReason(interaction, overallChange)
    };
  }
  
  /**
   * Get base trust change for interaction type
   */
  private getInteractionTrustChange(interaction: RelationshipInteraction): {
    overall: number;
    reliability: number;
    competence: number;
    integrity: number;
    consistency: number;
    vulnerability: number;
    coordination?: number;
    loyalty?: number;
    honesty?: number;
    rivalry?: number;
    friendship?: number;
  } {
    const success = interaction.outcome.success;
    const mutualBenefit = interaction.outcome.mutualBenefit;
    const emotionalImpact = interaction.outcome.emotionalImpact;
    
    let baseChange = {
      overall: 0,
      reliability: 0,
      competence: 0,
      integrity: 0,
      consistency: 0,
      vulnerability: 0,
      coordination: 0,
      loyalty: 0,
      honesty: 0,
      rivalry: 0,
      friendship: 0
    };
    
    switch (interaction.type) {
      case InteractionType.COLLABORATION:
        baseChange.overall = success ? 0.1 * mutualBenefit : -0.15;
        baseChange.competence = success ? 0.15 : -0.1;
        baseChange.reliability = success ? 0.1 : -0.2;
        baseChange.coordination = success ? 0.12 : -0.1;
        break;
        
      case InteractionType.HELP:
        baseChange.overall = success ? 0.15 * mutualBenefit : -0.1;
        baseChange.reliability = success ? 0.2 : -0.15;
        baseChange.integrity = success ? 0.1 : -0.05;
        baseChange.vulnerability = success ? 0.05 : -0.1;
        break;
        
      case InteractionType.TRADE:
        baseChange.overall = success ? 0.05 : -0.2;
        baseChange.integrity = success ? 0.15 : -0.25;
        baseChange.reliability = success ? 0.1 : -0.15;
        break;
        
      case InteractionType.CONFLICT:
        baseChange.overall = success ? 0.05 : -0.25;
        baseChange.integrity = success ? 0.1 : -0.2;
        baseChange.vulnerability = -0.1;
        break;
        
      case InteractionType.SUPPORT:
        baseChange.overall = success ? 0.12 * mutualBenefit : -0.08;
        baseChange.loyalty = success ? 0.15 : -0.1;
        baseChange.vulnerability = success ? 0.08 : -0.05;
        break;
        
      case InteractionType.CONVERSATION:
        baseChange.overall = success ? 0.02 : -0.05;
        baseChange.honesty = success ? 0.03 : -0.08;
        break;
        
      case InteractionType.COMPETITION:
        baseChange.overall = success ? 0.03 : -0.1;
        baseChange.competence = success ? 0.08 : -0.05;
        baseChange.rivalry = 0.05;
        break;
        
      case InteractionType.CELEBRATION:
        baseChange.overall = 0.08 * mutualBenefit;
        baseChange.friendship = 0.1;
        baseChange.vulnerability = 0.05;
        break;
    }
    
    // Apply emotional impact modifier
    const emotionalModifier = 1 + Math.abs(emotionalImpact) * 0.3;
    Object.keys(baseChange).forEach(key => {
      baseChange[key] *= emotionalModifier;
    });
    
    return baseChange;
  }
  
  /**
   * Get personality-based trust modifiers
   */
  private getPersonalityTrustModifiers(personality: PersonalityTraits): number {
    let modifier = 1.0;
    
    // Agreeableness increases trust propensity
    modifier += personality.agreeableness * 0.2;
    
    // Neuroticism decreases trust propensity
    modifier -= personality.neuroticism * 0.15;
    
    // Openness affects trust in new relationships
    modifier += (personality.openness - 0.5) * 0.1;
    
    // Conscientiousness affects reliability trust
    modifier += personality.conscientiousness * 0.1;
    
    // Extraversion affects social trust
    modifier += (personality.extraversion - 0.5) * 0.05;
    
    return Math.max(0.5, Math.min(1.5, modifier));
  }
  
  /**
   * Calculate compatibility factors between personalities
   */
  private calculateCompatibilityFactors(
    personality1: PersonalityTraits,
    personality2: PersonalityTraits
  ): any[] {
    const traits: (keyof PersonalityTraits)[] = [
      'openness', 'conscientiousness', 'extraversion', 
      'agreeableness', 'neuroticism', 'riskTolerance',
      'creativity', 'patience', 'competitiveness', 'curiosity'
    ];
    
    return traits.map(trait => ({
      trait,
      weight: this.getTraitWeight(trait),
      similarity: this.calculateTraitSimilarity(personality1[trait], personality2[trait]),
      complementarity: this.calculateTraitComplementarity(personality1[trait], personality2[trait])
    }));
  }
  
  /**
   * Calculate overall compatibility from factors
   */
  private calculateOverallCompatibility(factors: any[]): number {
    const weightedSum = factors.reduce((sum, factor) => {
      const combinedScore = factor.similarity * 0.7 + factor.complementarity * 0.3;
      return sum + combinedScore * factor.weight;
    }, 0);
    
    const totalWeight = factors.reduce((sum, factor) => sum + factor.weight, 0);
    
    return Math.max(0, Math.min(1, weightedSum / totalWeight));
  }
  
  /**
   * Calculate trait similarity (0 to 1)
   */
  private calculateTraitSimilarity(value1: number, value2: number): number {
    const difference = Math.abs(value1 - value2);
    return Math.max(0, 1 - difference);
  }
  
  /**
   * Calculate trait complementarity (0 to 1)
   */
  private calculateTraitComplementarity(value1: number, value2: number): number {
    // Some traits work well when different (complementary)
    const optimalDifference = 0.3;
    const difference = Math.abs(value1 - value2);
    return Math.max(0, 1 - Math.abs(difference - optimalDifference));
  }
  
  /**
   * Get weight for personality trait in compatibility
   */
  private getTraitWeight(trait: keyof PersonalityTraits): number {
    const weights: Record<keyof PersonalityTraits, number> = {
      openness: 0.1,
      conscientiousness: 0.15,
      extraversion: 0.1,
      agreeableness: 0.2, // Highest weight for social compatibility
      neuroticism: 0.15,
      riskTolerance: 0.1,
      creativity: 0.05,
      patience: 0.05,
      competitiveness: 0.05,
      curiosity: 0.05
    };
    
    return weights[trait];
  }
  
  /**
   * Calculate trust propensity between personalities
   */
  private calculateTrustPropensity(
    personality1: PersonalityTraits,
    personality2: PersonalityTraits
  ): number {
    // Trust is higher with agreeable, conscientious, and emotionally stable partners
    const targetTrustworthiness = 
      personality2.agreeableness * 0.3 +
      personality2.conscientiousness * 0.3 +
      (1 - personality2.neuroticism) * 0.2 +
      personality2.openness * 0.1 +
      personality2.extraversion * 0.1;
    
    // Trust propensity is modified by the agent's own personality
    const agentTrustPropensity = 
      (1 - personality1.neuroticism) * 0.4 +
      personality1.agreeableness * 0.3 +
      personality1.openness * 0.2 +
      personality1.conscientiousness * 0.1;
    
    return Math.min(1, targetTrustworthiness * agentTrustPropensity);
  }
  
  /**
   * Calculate friendship propensity between personalities
   */
  private calculateFriendshipPropensity(
    personality1: PersonalityTraits,
    personality2: PersonalityTraits
  ): number {
    // Friendship based on similarity in social traits
    const socialSimilarity = 
      (1 - Math.abs(personality1.extraversion - personality2.extraversion)) * 0.3 +
      (1 - Math.abs(personality1.agreeableness - personality2.agreeableness)) * 0.3 +
      (1 - Math.abs(personality1.openness - personality2.openness)) * 0.2 +
      (1 - Math.abs(personality1.neuroticism - personality2.neuroticism)) * 0.2;
    
    return socialSimilarity;
  }
  
  /**
   * Calculate collaboration propensity between personalities
   */
  private calculateCollaborationPropensity(
    personality1: PersonalityTraits,
    personality2: PersonalityTraits
  ): number {
    // Collaboration based on complementary work styles
    const workStyleCompatibility = 
      Math.min(personality1.conscientiousness, personality2.conscientiousness) * 0.3 +
      (1 - Math.abs(personality1.riskTolerance - personality2.riskTolerance)) * 0.2 +
      Math.max(personality1.openness, personality2.openness) * 0.2 +
      Math.min(personality1.agreeableness, personality2.agreeableness) * 0.2 +
      (1 - Math.max(personality1.neuroticism, personality2.neuroticism)) * 0.1;
    
    return workStyleCompatibility;
  }
  
  /**
   * Generate cache key for personality compatibility
   */
  private generateCompatibilityKey(
    personality1: PersonalityTraits,
    personality2: PersonalityTraits
  ): string {
    const traits1 = Object.values(personality1).map(v => (v as number).toFixed(2)).join(',');
    const traits2 = Object.values(personality2).map(v => (v as number).toFixed(2)).join(',');
    return `${traits1}|${traits2}`;
  }
  
  /**
   * Update individual trust component
   */
  private updateComponentTrust(currentValue: number, change: number): number {
    return Math.max(0, Math.min(1, currentValue + change));
  }
  
  /**
   * Calculate forgiveness factor based on personality
   */
  private calculateForgivenessFactor(personality: PersonalityTraits): number {
    return (
      personality.agreeableness * 0.4 +
      personality.openness * 0.2 +
      (1 - personality.neuroticism) * 0.3 +
      personality.extraversion * 0.1
    );
  }
  
  /**
   * Get effectiveness of repair action
   */
  private getRepairActionEffectiveness(action: string): number {
    const effectiveness: Record<string, number> = {
      'apology': 0.6,
      'compensation': 0.7,
      'explanation': 0.5,
      'changed_behavior': 0.8,
      'reconciliation': 0.7,
      'time': 0.3,
      'mediation': 0.6,
      'gift': 0.4,
      'favor': 0.5
    };
    
    return effectiveness[action.toLowerCase()] || 0.3;
  }
  
  /**
   * Get personality modifier for interaction
   */
  private getPersonalityInteractionModifier(
    personality: PersonalityTraits,
    interaction: RelationshipInteraction
  ): number {
    let modifier = 1.0;
    
    // Agreeable agents respond better to positive interactions
    if (interaction.outcome.success) {
      modifier += personality.agreeableness * 0.2;
    }
    
    // Neurotic agents are more affected by negative interactions
    if (!interaction.outcome.success) {
      modifier -= personality.neuroticism * 0.3;
    }
    
    // Open agents are more receptive to new types of interactions
    if (interaction.type === InteractionType.COLLABORATION || 
        interaction.type === InteractionType.EXPLORATION) {
      modifier += personality.openness * 0.1;
    }
    
    return Math.max(0.5, Math.min(1.5, modifier));
  }
  
  /**
   * Generate reason for trust change
   */
  private generateTrustChangeReason(
    interaction: RelationshipInteraction,
    change: number
  ): string {
    const direction = change > 0 ? 'increased' : 'decreased';
    const magnitude = Math.abs(change);
    
    let reason = `Trust ${direction} due to ${interaction.type}`;
    
    if (magnitude > 0.1) {
      reason += ' (significant)';
    } else if (magnitude > 0.05) {
      reason += ' (moderate)';
    } else {
      reason += ' (minor)';
    }
    
    if (interaction.outcome.success) {
      reason += ' - successful outcome';
    } else {
      reason += ' - unsuccessful outcome';
    }
    
    return reason;
  }
  
  /**
   * Get configuration
   */
  getConfig(): TrustCalculationConfig {
    return { ...this.config };
  }
  
  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<TrustCalculationConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
  
  /**
   * Clear compatibility cache
   */
  clearCache(): void {
    this.personalityCompatibilityCache.clear();
  }
  
  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; hits: number; misses: number } {
    return {
      size: this.personalityCompatibilityCache.size,
      hits: 0, // TODO: Implement hit tracking
      misses: 0 // TODO: Implement miss tracking
    };
  }
}