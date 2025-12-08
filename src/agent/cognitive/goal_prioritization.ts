import { 
  Goal, 
  GoalStatus, 
  GoalPriority, 
  GoalPrioritizationResult, 
  RankedGoal, 
  PrioritizationFactors,
  GoalExecutionContext,
  GoalDependency,
  DependencyType,
  ResourceRequirement
} from './goal_types.js';
import { PersonalityTraits } from './personality.js';
import { MotivationSystem } from './motivations.js';
import { DecisionContext } from '../langgraph/interfaces.js';

/**
 * Priority calculation strategies
 */
export enum PrioritizationStrategy {
  WEIGHTED_SUM = 'weighted_sum',           // Traditional weighted sum approach
  FUZZY_LOGIC = 'fuzzy_logic',             // Fuzzy logic for uncertainty
  UTILITY_BASED = 'utility_based',         // Utility theory approach
  LEARNING_ADAPTIVE = 'learning_adaptive', // Machine learning adapted weights
  CONTEXT_DYNAMIC = 'context_dynamic',     // Context-aware dynamic weights
  MULTI_OBJECTIVE = 'multi_objective'      // Pareto optimal multi-objective
}

/**
 * Priority factors with detailed scoring
 */
export interface PriorityFactors {
  urgency: {
    score: number;              // 0-1
    weight: number;             // 0-1
    components: {
      timePressure: number;     // Deadline proximity
      opportunityCost: number;  // Cost of delay
      decayRate: number;        // Value decay over time
    };
    reasoning: string;
  };
  
  importance: {
    score: number;              // 0-1
    weight: number;             // 0-1
    components: {
      baseImportance: number;   // Intrinsic importance
      strategicValue: number;   // Strategic alignment
      impactScope: number;      // Scope of impact
    };
    reasoning: string;
  };
  
  feasibility: {
    score: number;              // 0-1
    weight: number;             // 0-1
    components: {
      resourceAvailability: number;  // Resource access
      skillReadiness: number;         // Skill requirements
      environmentalFit: number;      // Environmental conditions
      riskAssessment: number;         // Risk factors
    };
    reasoning: string;
  };
  
  resource: {
    score: number;              // 0-1
    weight: number;             // 0-1
    components: {
      efficiency: number;       // Resource efficiency
      costBenefit: number;      // Cost vs benefit
      sustainability: number;   // Long-term sustainability
      opportunityValue: number; // Resource opportunity
    };
    reasoning: string;
  };
  
  alignment: {
    score: number;              // 0-1
    weight: number;             // 0-1
    components: {
      personalityFit: number;   // Personality alignment
      motivationSupport: number; // Motivational support
      ethicalCompliance: number; // Ethical considerations
      socialHarmony: number;    // Social compatibility
    };
    reasoning: string;
  };
}

/**
 * Goal prioritization engine
 */
export class GoalPrioritizationEngine {
  private strategy: PrioritizationStrategy;
  private factors: PrioritizationFactors;
  private adaptiveWeights: AdaptiveWeightSystem;
  private contextAnalyzer: PriorityContextAnalyzer;
  private learningSystem: PriorityLearningSystem;

  constructor(config?: {
    strategy?: PrioritizationStrategy;
    factors?: PrioritizationFactors;
    learningEnabled?: boolean;
  }) {
    this.strategy = config?.strategy || PrioritizationStrategy.WEIGHTED_SUM;
    this.factors = config?.factors || this.getDefaultFactors();
    this.adaptiveWeights = new AdaptiveWeightSystem(this.factors);
    this.contextAnalyzer = new PriorityContextAnalyzer();
    this.learningSystem = new PriorityLearningSystem(config?.learningEnabled !== false);
  }

  /**
   * Prioritize goals based on multiple factors and context
   */
  async prioritizeGoals(
    goals: Goal[], 
    context: GoalExecutionContext,
    strategy?: PrioritizationStrategy
  ): Promise<GoalPrioritizationResult> {
    
    const selectedStrategy = strategy || this.strategy;
    
    // Filter active goals
    const activeGoals = goals.filter(goal => 
      goal.status === GoalStatus.PENDING || 
      goal.status === GoalStatus.ACTIVE || 
      goal.status === GoalStatus.PAUSED
    );

    // Analyze context for dynamic factors
    const contextFactors = this.contextAnalyzer.analyzeContext(context, activeGoals);
    
    // Calculate priority scores for each goal
    const rankedGoals: RankedGoal[] = [];
    
    for (const goal of activeGoals) {
      const priorityResult = await this.calculateGoalPriority(
        goal, 
        context, 
        selectedStrategy,
        contextFactors
      );
      rankedGoals.push(priorityResult);
    }

    // Sort by priority score (descending)
    rankedGoals.sort((a, b) => b.priorityScore - a.priorityScore);
    
    // Assign ranks
    rankedGoals.forEach((ranked, index) => {
      ranked.rank = index + 1;
    });

    // Update learning system
    this.learningSystem.recordPrioritization(rankedGoals, context);

    return {
      rankedGoals,
      prioritizationFactors: this.factors,
      context: context.decisionContext,
      timestamp: Date.now()
    };
  }

  /**
   * Calculate priority for a single goal
   */
  private async calculateGoalPriority(
    goal: Goal, 
    context: GoalExecutionContext, 
    strategy: PrioritizationStrategy,
    contextFactors: any
  ): Promise<RankedGoal> {
    
    // Calculate individual factor scores
    const factors = await this.calculateFactorScores(goal, context, contextFactors);
    
    // Apply prioritization strategy
    let priorityScore: number;
    
    switch (strategy) {
      case PrioritizationStrategy.WEIGHTED_SUM:
        priorityScore = this.calculateWeightedSum(factors);
        break;
      
      case PrioritizationStrategy.FUZZY_LOGIC:
        priorityScore = this.calculateFuzzyLogic(factors);
        break;
      
      case PrioritizationStrategy.UTILITY_BASED:
        priorityScore = this.calculateUtilityBased(factors, goal, context);
        break;
      
      case PrioritizationStrategy.LEARNING_ADAPTIVE:
        priorityScore = this.calculateLearningAdaptive(factors, goal, context);
        break;
      
      case PrioritizationStrategy.CONTEXT_DYNAMIC:
        priorityScore = this.calculateContextDynamic(factors, contextFactors);
        break;
      
      case PrioritizationStrategy.MULTI_OBJECTIVE:
        priorityScore = this.calculateMultiObjective(factors, goal, context);
        break;
      
      default:
        priorityScore = this.calculateWeightedSum(factors);
    }

    // Apply dependency adjustments
    priorityScore = this.applyDependencyAdjustments(priorityScore, goal, context);
    
    // Apply reactive interrupt considerations
    priorityScore = this.applyReactiveConsiderations(priorityScore, goal, context);

    return {
      goal,
      priorityScore,
      rank: 0, // Will be assigned later
      factors: {
        urgency: factors.urgency.score,
        importance: factors.importance.score,
        feasibility: factors.feasibility.score,
        resource: factors.resource.score,
        alignment: factors.alignment.score
      },
      reasoning: this.generateReasoning(factors, priorityScore, strategy)
    };
  }

  /**
   * Calculate individual factor scores
   */
  private async calculateFactorScores(
    goal: Goal, 
    context: GoalExecutionContext, 
    contextFactors: any
  ): Promise<PriorityFactors> {
    
    const urgency = await this.calculateUrgency(goal, context, contextFactors);
    const importance = await this.calculateImportance(goal, context, contextFactors);
    const feasibility = await this.calculateFeasibility(goal, context, contextFactors);
    const resource = await this.calculateResource(goal, context, contextFactors);
    const alignment = await this.calculateAlignment(goal, context, contextFactors);

    return { urgency, importance, feasibility, resource, alignment };
  }

  /**
   * Calculate urgency score
   */
  private async calculateUrgency(
    goal: Goal, 
    context: GoalExecutionContext, 
    contextFactors: any
  ): Promise<PriorityFactors['urgency']> {
    
    const now = Date.now();
    
    // Time pressure from deadline
    let timePressure = 0;
    if (goal.deadline) {
      const timeRemaining = goal.deadline - now;
      const totalTime = goal.estimatedDuration || (24 * 60 * 60 * 1000); // 1 day default
      timePressure = Math.max(0, Math.min(1, 1 - (timeRemaining / totalTime)));
    }

    // Opportunity cost calculation
    const opportunityCost = this.calculateOpportunityCost(goal, context);
    
    // Value decay over time
    const decayRate = this.calculateValueDecay(goal, context);
    
    const score = (timePressure * 0.4) + (opportunityCost * 0.4) + (decayRate * 0.2);
    const weight = this.factors.urgencyWeight;

    return {
      score,
      weight,
      components: { timePressure, opportunityCost, decayRate },
      reasoning: `Urgency ${score.toFixed(2)}: Time pressure ${timePressure.toFixed(2)}, opportunity cost ${opportunityCost.toFixed(2)}, decay rate ${decayRate.toFixed(2)}`
    };
  }

  /**
   * Calculate importance score
   */
  private async calculateImportance(
    goal: Goal, 
    context: GoalExecutionContext, 
    contextFactors: any
  ): Promise<PriorityFactors['importance']> {
    
    // Base importance from priority level
    const baseImportance = this.mapPriorityToImportance(goal.priority);
    
    // Strategic value alignment
    const strategicValue = this.calculateStrategicValue(goal, context);
    
    // Impact scope assessment
    const impactScope = this.calculateImpactScope(goal, context);
    
    const score = (baseImportance * 0.3) + (strategicValue * 0.4) + (impactScope * 0.3);
    const weight = this.factors.importanceWeight;

    return {
      score,
      weight,
      components: { baseImportance, strategicValue, impactScope },
      reasoning: `Importance ${score.toFixed(2)}: Base ${baseImportance.toFixed(2)}, strategic ${strategicValue.toFixed(2)}, impact ${impactScope.toFixed(2)}`
    };
  }

  /**
   * Calculate feasibility score
   */
  private async calculateFeasibility(
    goal: Goal, 
    context: GoalExecutionContext, 
    contextFactors: any
  ): Promise<PriorityFactors['feasibility']> {
    
    // Resource availability
    const resourceAvailability = this.calculateResourceAvailability(goal, context);
    
    // Skill readiness assessment
    const skillReadiness = this.calculateSkillReadiness(goal, context);
    
    // Environmental fit
    const environmentalFit = this.calculateEnvironmentalFit(goal, context);
    
    // Risk assessment
    const riskAssessment = this.calculateRiskAssessment(goal, context);
    
    const score = (resourceAvailability * 0.3) + (skillReadiness * 0.3) + 
                  (environmentalFit * 0.2) + (riskAssessment * 0.2);
    const weight = this.factors.feasibilityWeight;

    return {
      score,
      weight,
      components: { resourceAvailability, skillReadiness, environmentalFit, riskAssessment },
      reasoning: `Feasibility ${score.toFixed(2)}: Resources ${resourceAvailability.toFixed(2)}, skills ${skillReadiness.toFixed(2)}, environment ${environmentalFit.toFixed(2)}, risk ${riskAssessment.toFixed(2)}`
    };
  }

  /**
   * Calculate resource efficiency score
   */
  private async calculateResource(
    goal: Goal, 
    context: GoalExecutionContext, 
    contextFactors: any
  ): Promise<PriorityFactors['resource']> {
    
    // Resource efficiency
    const efficiency = this.calculateResourceEfficiency(goal, context);
    
    // Cost-benefit analysis
    const costBenefit = this.calculateCostBenefit(goal, context);
    
    // Sustainability assessment
    const sustainability = this.calculateSustainability(goal, context);
    
    // Opportunity value
    const opportunityValue = this.calculateOpportunityValue(goal, context);
    
    const score = (efficiency * 0.3) + (costBenefit * 0.3) + 
                  (sustainability * 0.2) + (opportunityValue * 0.2);
    const weight = this.factors.resourceWeight;

    return {
      score,
      weight,
      components: { efficiency, costBenefit, sustainability, opportunityValue },
      reasoning: `Resource ${score.toFixed(2)}: Efficiency ${efficiency.toFixed(2)}, cost-benefit ${costBenefit.toFixed(2)}, sustainability ${sustainability.toFixed(2)}, opportunity ${opportunityValue.toFixed(2)}`
    };
  }

  /**
   * Calculate alignment score
   */
  private async calculateAlignment(
    goal: Goal, 
    context: GoalExecutionContext, 
    contextFactors: any
  ): Promise<PriorityFactors['alignment']> {
    
    // Personality fit
    const personalityFit = goal.personalityAlignment || 0.5;
    
    // Motivation support
    const motivationSupport = this.calculateMotivationSupport(goal, context);
    
    // Ethical compliance
    const ethicalCompliance = goal.ethicalScore || 0.5;
    
    // Social harmony
    const socialHarmony = this.calculateSocialHarmony(goal, context);
    
    const score = (personalityFit * 0.3) + (motivationSupport * 0.3) + 
                  (ethicalCompliance * 0.2) + (socialHarmony * 0.2);
    const weight = this.factors.alignmentWeight;

    return {
      score,
      weight,
      components: { personalityFit, motivationSupport, ethicalCompliance, socialHarmony },
      reasoning: `Alignment ${score.toFixed(2)}: Personality ${personalityFit.toFixed(2)}, motivation ${motivationSupport.toFixed(2)}, ethical ${ethicalCompliance.toFixed(2)}, social ${socialHarmony.toFixed(2)}`
    };
  }

  /**
   * Weighted sum calculation strategy
   */
  private calculateWeightedSum(factors: PriorityFactors): number {
    let totalScore = 0;
    let totalWeight = 0;

    for (const [factorName, factor] of Object.entries(factors)) {
      totalScore += factor.score * factor.weight;
      totalWeight += factor.weight;
    }

    return totalWeight > 0 ? totalScore / totalWeight : 0;
  }

  /**
   * Fuzzy logic calculation strategy
   */
  private calculateFuzzyLogic(factors: PriorityFactors): number {
    // Apply fuzzy logic rules for uncertainty handling
    const urgencyFuzzy = this.fuzzifyScore(factors.urgency.score);
    const importanceFuzzy = this.fuzzifyScore(factors.importance.score);
    const feasibilityFuzzy = this.fuzzifyScore(factors.feasibility.score);
    
    // Fuzzy rules
    let score = 0;
    if (urgencyFuzzy === 'high' && importanceFuzzy === 'high') {
      score = 0.9;
    } else if (urgencyFuzzy === 'high' || importanceFuzzy === 'high') {
      score = 0.7;
    } else if (feasibilityFuzzy === 'low') {
      score = 0.2;
    } else {
      score = this.calculateWeightedSum(factors);
    }

    return score;
  }

  /**
   * Utility-based calculation strategy
   */
  private calculateUtilityBased(factors: PriorityFactors, goal: Goal, context: GoalExecutionContext): number {
    // Utility function considering risk and reward
    const expectedValue = this.calculateExpectedValue(goal, context);
    const risk = 1 - factors.feasibility.score;
    const utility = expectedValue - (risk * 0.5);
    
    return Math.max(0, Math.min(1, utility));
  }

  /**
   * Learning-adaptive calculation strategy
   */
  private calculateLearningAdaptive(factors: PriorityFactors, goal: Goal, context: GoalExecutionContext): number {
    // Use adaptive weights based on learning
    const adaptiveFactors = this.adaptiveWeights.getAdaptiveFactors(goal, context);
    let totalScore = 0;
    let totalWeight = 0;

    for (const [factorName, factor] of Object.entries(factors)) {
      const adaptiveWeight = adaptiveFactors[factorName as keyof typeof adaptiveFactors] || factor.weight;
      totalScore += factor.score * adaptiveWeight;
      totalWeight += adaptiveWeight;
    }

    return totalWeight > 0 ? totalScore / totalWeight : 0;
  }

  /**
   * Context-dynamic calculation strategy
   */
  private calculateContextDynamic(factors: PriorityFactors, contextFactors: any): number {
    // Adjust weights based on context
    const dynamicFactors = this.adjustFactorsForContext(factors, contextFactors);
    return this.calculateWeightedSum(dynamicFactors);
  }

  /**
   * Multi-objective calculation strategy
   */
  private calculateMultiObjective(factors: PriorityFactors, goal: Goal, context: GoalExecutionContext): number {
    // Pareto optimal multi-objective optimization
    const objectives = [
      factors.urgency.score,
      factors.importance.score,
      factors.feasibility.score,
      factors.resource.score,
      factors.alignment.score
    ];

    // Simple Pareto ranking (could be more sophisticated)
    const dominatedCount = objectives.filter(obj => obj < 0.5).length;
    const score = 1 - (dominatedCount / objectives.length);

    return score;
  }

  /**
   * Helper methods for factor calculations
   */
  private mapPriorityToImportance(priority: GoalPriority): number {
    switch (priority) {
      case GoalPriority.CRITICAL: return 1.0;
      case GoalPriority.HIGH: return 0.8;
      case GoalPriority.MEDIUM: return 0.6;
      case GoalPriority.LOW: return 0.4;
      case GoalPriority.BACKGROUND: return 0.2;
      default: return 0.5;
    }
  }

  private calculateOpportunityCost(goal: Goal, context: GoalExecutionContext): number {
    // Simple heuristic based on competing goals
    const competingGoals = [
      ...(context.agentState.cognitive?.goals?.strategicGoals || []),
      ...(context.agentState.cognitive?.goals?.tacticalGoals || []),
      ...(context.agentState.cognitive?.goals?.operationalGoals || [])
    ].filter((g: any) =>
      g.id !== goal.id && g.status === GoalStatus.ACTIVE
    ).length || 0;
    
    return Math.min(1, competingGoals * 0.1);
  }

  private calculateValueDecay(goal: Goal, context: GoalExecutionContext): number {
    // Calculate how quickly goal value decays over time
    if (!goal.deadline) return 0.1; // Low decay for non-deadline goals
    
    const timeElapsed = Date.now() - goal.createdAt;
    const totalTime = goal.estimatedDuration || (24 * 60 * 60 * 1000);
    const decayRate = timeElapsed / totalTime;
    
    return Math.min(1, decayRate);
  }

  private calculateStrategicValue(goal: Goal, context: GoalExecutionContext): number {
    // Assess strategic value based on goal level and alignment
    if (goal.level === 'strategic') return 0.9;
    if (goal.level === 'tactical') return 0.7;
    if (goal.level === 'operational') return 0.5;
    return 0.5;
  }

  private calculateImpactScope(goal: Goal, context: GoalExecutionContext): number {
    // Assess scope of impact
    const tags = goal.tags || [];
    if (tags.includes('global') || tags.includes('empire')) return 1.0;
    if (tags.includes('community') || tags.includes('team')) return 0.7;
    if (tags.includes('personal')) return 0.5;
    return 0.5;
  }

  private calculateResourceAvailability(goal: Goal, context: GoalExecutionContext): number {
    // Check if required resources are available
    let availabilityScore = 1.0;
    
    for (const requirement of goal.requirements) {
      const available = context.availableResources.find(r => r.name === requirement.name);
      if (!available || available.quantity < requirement.quantity) {
        availabilityScore -= 0.2;
      }
    }
    
    return Math.max(0, availabilityScore);
  }

  private calculateSkillReadiness(goal: Goal, context: GoalExecutionContext): number {
    // Assess skill readiness (placeholder - would integrate with skills system)
    return 0.7; // Default assumption
  }

  private calculateEnvironmentalFit(goal: Goal, context: GoalExecutionContext): number {
    // Assess environmental compatibility
    const dangerousConditions = context.environmentalConditions.filter(c => 
      c.type === 'danger' && c.severity > 0.7
    ).length;
    
    return Math.max(0, 1 - (dangerousConditions * 0.2));
  }

  private calculateRiskAssessment(goal: Goal, context: GoalExecutionContext): number {
    // Assess overall risk level
    const riskFactors = goal.requirements.length * 0.1 + 
                       goal.dependencies.length * 0.15;
    return Math.max(0, 1 - riskFactors);
  }

  private calculateResourceEfficiency(goal: Goal, context: GoalExecutionContext): number {
    // Calculate resource usage efficiency
    return 0.8; // Placeholder
  }

  private calculateCostBenefit(goal: Goal, context: GoalExecutionContext): number {
    // Calculate cost vs benefit ratio
    return 0.7; // Placeholder
  }

  private calculateSustainability(goal: Goal, context: GoalExecutionContext): number {
    // Assess long-term sustainability
    return 0.6; // Placeholder
  }

  private calculateOpportunityValue(goal: Goal, context: GoalExecutionContext): number {
    // Calculate opportunity value
    return 0.5; // Placeholder
  }

  private calculateMotivationSupport(goal: Goal, context: GoalExecutionContext): number {
    // Assess how well goal supports motivations
    return goal.motivationSource ? 0.8 : 0.5;
  }

  private calculateSocialHarmony(goal: Goal, context: GoalExecutionContext): number {
    // Assess social compatibility
    const socialContext = context.socialContext;
    if (socialContext.activeCollaborations.length > 0) return 0.8;
    if (socialContext.nearbyAgents.length > 0) return 0.6;
    return 0.5;
  }

  private calculateExpectedValue(goal: Goal, context: GoalExecutionContext): number {
    // Calculate expected value of goal completion
    const importance = this.mapPriorityToImportance(goal.priority);
    const feasibility = this.calculateResourceAvailability(goal, context);
    return importance * feasibility;
  }

  private fuzzifyScore(score: number): 'low' | 'medium' | 'high' {
    if (score < 0.33) return 'low';
    if (score < 0.67) return 'medium';
    return 'high';
  }

  private adjustFactorsForContext(factors: PriorityFactors, contextFactors: any): PriorityFactors {
    // Adjust factor weights based on context
    const adjusted = { ...factors };
    
    if (contextFactors.hasUrgentThreats) {
      adjusted.urgency.weight = Math.min(1, adjusted.urgency.weight * 1.5);
    }
    
    if (contextFactors.resourceScarcity) {
      adjusted.resource.weight = Math.min(1, adjusted.resource.weight * 1.3);
    }
    
    return adjusted;
  }

  private applyDependencyAdjustments(
    priorityScore: number, 
    goal: Goal, 
    context: GoalExecutionContext
  ): number {
    // Adjust priority based on dependencies
    let adjustment = 1.0;
    
    for (const dependency of goal.dependencies) {
      if (dependency.type === DependencyType.PREREQUISITE) {
        // If prerequisites are not met, reduce priority
        const prereqGoal = [
          ...(context.agentState.cognitive?.goals?.strategicGoals || []),
          ...(context.agentState.cognitive?.goals?.tacticalGoals || []),
          ...(context.agentState.cognitive?.goals?.operationalGoals || [])
        ].find((g: any) => g.id === dependency.goalId);
        if (!prereqGoal || prereqGoal.status !== GoalStatus.COMPLETED) {
          adjustment *= 0.8;
        }
      }
    }
    
    return priorityScore * adjustment;
  }

  private applyReactiveConsiderations(
    priorityScore: number, 
    goal: Goal, 
    context: GoalExecutionContext
  ): number {
    // Consider reactive interrupt priorities
    // Non-urgent goals should be lower priority when reactive threats exist
    const hasThreats = context.environmentalConditions.some(c => c.type === 'danger');
    
    if (hasThreats && goal.priority !== GoalPriority.CRITICAL) {
      return priorityScore * 0.7;
    }
    
    return priorityScore;
  }

  private generateReasoning(
    factors: PriorityFactors, 
    priorityScore: number, 
    strategy: PrioritizationStrategy
  ): string {
    const factorReasonings = Object.values(factors).map(f => f.reasoning).join('; ');
    return `${strategy} strategy: Score ${priorityScore.toFixed(3)}. ${factorReasonings}`;
  }

  private getDefaultFactors(): PrioritizationFactors {
    return {
      urgencyWeight: 0.25,
      importanceWeight: 0.30,
      feasibilityWeight: 0.20,
      resourceWeight: 0.15,
      alignmentWeight: 0.10
    };
  }

  /**
   * Update prioritization factors based on learning
   */
  updateFactors(newFactors: Partial<PrioritizationFactors>): void {
    this.factors = { ...this.factors, ...newFactors };
    this.adaptiveWeights.updateBaseFactors(this.factors);
  }

  /**
   * Get current prioritization factors
   */
  getFactors(): PrioritizationFactors {
    return { ...this.factors };
  }
}

/**
 * Adaptive weight system for learning-based prioritization
 */
class AdaptiveWeightSystem {
  private baseFactors: PrioritizationFactors;
  private adaptationHistory: Array<{
    timestamp: number;
    factors: PrioritizationFactors;
    success: number;
  }> = [];

  constructor(baseFactors: PrioritizationFactors) {
    this.baseFactors = { ...baseFactors };
  }

  getAdaptiveFactors(goal: Goal, context: GoalExecutionContext): PrioritizationFactors {
    // Return adapted weights based on learning history
    const recentAdaptations = this.adaptationHistory.slice(-10);
    
    if (recentAdaptations.length === 0) {
      return this.baseFactors;
    }

    // Simple adaptation based on recent success
    const avgSuccess = recentAdaptations.reduce((sum, h) => sum + h.success, 0) / recentAdaptations.length;
    const adaptation = recentAdaptations[recentAdaptations.length - 1];
    
    if (avgSuccess < 0.5) {
      // Low success, adjust weights
      return this.adjustWeightsForLowSuccess(adaptation.factors);
    }

    return this.baseFactors;
  }

  private adjustWeightsForLowSuccess(factors: PrioritizationFactors): PrioritizationFactors {
    // Increase weight of factors that were underperforming
    return {
      ...factors,
      feasibilityWeight: Math.min(1, factors.feasibilityWeight * 1.2),
      resourceWeight: Math.min(1, factors.resourceWeight * 1.1)
    };
  }

  updateBaseFactors(newFactors: PrioritizationFactors): void {
    this.baseFactors = { ...newFactors };
  }

  recordAdaptation(success: number): void {
    this.adaptationHistory.push({
      timestamp: Date.now(),
      factors: { ...this.baseFactors },
      success
    });

    // Keep only recent history
    if (this.adaptationHistory.length > 50) {
      this.adaptationHistory = this.adaptationHistory.slice(-50);
    }
  }
}

/**
 * Context analyzer for priority calculations
 */
class PriorityContextAnalyzer {
  analyzeContext(context: GoalExecutionContext, goals: Goal[]): any {
    return {
      hasUrgentThreats: context.environmentalConditions.some(c => 
        c.type === 'danger' && c.severity > 0.7
      ),
      resourceScarcity: this.assessResourceScarcity(context),
      timePressure: this.assessTimePressure(goals),
      socialDynamics: this.assessSocialDynamics(context)
    };
  }

  private assessResourceScarcity(context: GoalExecutionContext): boolean {
    // Check if resources are scarce
    const totalRequirements = context.availableResources.reduce((sum, r) => sum + r.quantity, 0);
    return totalRequirements < 100; // Arbitrary threshold
  }

  private assessTimePressure(goals: Goal[]): boolean {
    // Check if there's high time pressure
    const urgentGoals = goals.filter(g => 
      g.deadline && (g.deadline - Date.now()) < (60 * 60 * 1000) // 1 hour
    ).length;
    
    return urgentGoals > 2;
  }

  private assessSocialDynamics(context: GoalExecutionContext): any {
    return {
      hasCollaborations: context.socialContext.activeCollaborations.length > 0,
      hasObligations: context.socialContext.socialObligations.length > 0,
      socialComplexity: context.socialContext.nearbyAgents.length
    };
  }
}

/**
 * Learning system for priority optimization
 */
class PriorityLearningSystem {
  private enabled: boolean;
  private learningHistory: Array<{
    timestamp: number;
    goals: RankedGoal[];
    context: GoalExecutionContext;
    outcome?: number;
  }> = [];

  constructor(enabled: boolean = true) {
    this.enabled = enabled;
  }

  recordPrioritization(goals: RankedGoal[], context: GoalExecutionContext): void {
    if (!this.enabled) return;

    this.learningHistory.push({
      timestamp: Date.now(),
      goals: [...goals],
      context
    });

    // Keep history manageable
    if (this.learningHistory.length > 100) {
      this.learningHistory = this.learningHistory.slice(-100);
    }
  }

  recordOutcome(prioritizationId: number, outcome: number): void {
    if (!this.enabled || prioritizationId >= this.learningHistory.length) return;

    this.learningHistory[prioritizationId].outcome = outcome;
  }

  analyzePatterns(): any {
    if (!this.enabled || this.learningHistory.length < 10) {
      return null;
    }

    // Analyze patterns in successful vs unsuccessful prioritizations
    const successful = this.learningHistory.filter(h => (h.outcome || 0) > 0.7);
    const unsuccessful = this.learningHistory.filter(h => (h.outcome || 0) < 0.3);

    return {
      successfulPatterns: this.extractPatterns(successful),
      unsuccessfulPatterns: this.extractPatterns(unsuccessful)
    };
  }

  private extractPatterns(history: any[]): any {
    // Extract common patterns from prioritization history
    return {
      avgUrgencyWeight: history.reduce((sum, h) => 
        sum + h.goals[0]?.factors?.urgency || 0, 0) / history.length,
      avgImportanceWeight: history.reduce((sum, h) => 
        sum + h.goals[0]?.factors?.importance || 0, 0) / history.length
    };
  }
}