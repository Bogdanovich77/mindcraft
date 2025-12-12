import { 
  Goal, 
  GoalState, 
  SkillState, 
  WorldContext, 
  AgentState, 
  DecisionContext,
  PersonalityTraits,
  ValueHierarchy,
  EthicalFramework,
  Skill,
  ProficiencyMetrics,
  UsageStatistics,
  InventoryItem
} from '../langgraph/interfaces.js';

import {
  Goal as GoalType,  // Rename to avoid conflicts
  GoalExecutionContext,
  ResourceRequirement,
  GoalDependency,
  PrioritizationFactors,
  RankedGoal,
  GoalPrioritizationResult
} from './goal_types.js';

// Use GoalType for internal operations and Goal for interface compatibility
type EnhancedGoal = Goal & GoalType; // Combined type for full compatibility

/**
 * Goal Prioritization Engine for LangGraph v2
 * 
 * This engine calculates priority scores for goals based on multiple factors
 * including agent personality, motivations, skills, resources, and context.
 */

export interface GoalPriorityFactors {
  strategic: number;
  tactical: number;
  operational: number;
  social: number;
  personal: number;
  environmental: number;
  temporal: number;
  resource: number;
  risk: number;
  learning: number;
}

export interface GoalPriorityScore {
  goalId: string;
  score: number;
  factors: GoalPriorityFactors;
  confidence: number;
  reasoning: string;
  timestamp: number;
}

export class GoalPrioritizationEngine {
  private strategicWeight = 0.25;
  private tacticalWeight = 0.25;
  private operationalWeight = 0.2;
  private socialWeight = 0.1;
  private personalWeight = 0.1;
  private environmentalWeight = 0.05;
  private temporalWeight = 0.05;

  /**
   * Calculate priority score for a goal
   */
  calculateGoalPriority(
    goal: Goal, 
    agentState: AgentState, 
    context: DecisionContext,
    executionContext?: GoalExecutionContext
  ): GoalPriorityScore {
    const factors = this.calculateGoalFactors(goal, agentState, context, executionContext);
    
    const score = 
      (factors.strategic * this.strategicWeight) +
      (factors.tactical * this.tacticalWeight) +
      (factors.operational * this.operationalWeight) +
      (factors.social * this.socialWeight) +
      (factors.personal * this.personalWeight) +
      (factors.environmental * this.environmentalWeight) +
      (factors.temporal * this.temporalWeight);

    const confidence = this.calculateConfidence(goal, agentState, context);
    const reasoning = this.generateReasoning(goal, factors, agentState);

    return {
      goalId: goal.id,
      score: Math.max(0, Math.min(1, score)),
      factors,
      confidence,
      reasoning,
      timestamp: Date.now()
    };
  }

  /**
   * Calculate individual factor scores for a goal
   */
  private calculateGoalFactors(
    goal: Goal, 
    agentState: AgentState, 
    context: DecisionContext,
    executionContext?: GoalExecutionContext
  ): GoalPriorityFactors {
    // Use the new Planning Engine components for enhanced feasibility and resource assessment
    const feasibilityScore = this.calculateFeasibilityScore(goal, agentState, executionContext);
    const resourceScore = this.calculateResourceScore(goal, agentState, executionContext);
    
    return {
      strategic: this.calculateStrategicFactor(goal, agentState),
      tactical: this.calculateTacticalFactor(goal, agentState),
      operational: this.calculateOperationalFactor(goal, agentState),
      social: this.calculateSocialFactor(goal, agentState),
      personal: this.calculatePersonalFactor(goal, agentState),
      environmental: this.calculateEnvironmentalFactor(goal, agentState),
      temporal: this.calculateTemporalFactor(goal, agentState),
      resource: resourceScore, // Use enhanced resource score from Planning Engine
      risk: this.calculateRisk(goal, agentState),
      learning: this.calculateLearning(goal, agentState)
    };
  }

  /**
   * Calculate strategic alignment factor
   */
  private calculateStrategicFactor(goal: Goal, agentState: AgentState): number {
    const strategicGoals = agentState.cognitive.goals.strategicGoals;
    const activeStrategicGoals = strategicGoals.filter(g => g.status === 'active');
    
    if (activeStrategicGoals.length === 0) {
      return goal.type === 'strategic' ? 0.8 : 0.5;
    }

    // Check if this goal supports active strategic goals
    let alignmentScore = 0;
    for (const strategicGoal of activeStrategicGoals) {
      if (strategicGoal.dependencies.includes(goal.id) || 
          goal.dependencies.includes(strategicGoal.id)) {
        alignmentScore = Math.max(alignmentScore, 0.9);
      }
    }

    return alignmentScore > 0 ? alignmentScore : (goal.type === 'strategic' ? 0.7 : 0.3);
  }

  /**
   * Calculate tactical importance factor
   */
  private calculateTacticalFactor(goal: Goal, agentState: AgentState): number {
    const tacticalGoals = agentState.cognitive.goals.tacticalGoals;
    const activeTacticalGoals = tacticalGoals.filter(g => g.status === 'active');
    
    // Check if goal is a tactical prerequisite for multiple operational goals
    const dependentOperationalGoals = agentState.cognitive.goals.operationalGoals.filter(
      opGoal => opGoal.dependencies.includes(goal.id) && opGoal.status === 'active'
    );

    const dependencyCount = dependentOperationalGoals.length;
    let tacticalScore = 0.5;

    if (dependencyCount > 0) {
      tacticalScore = Math.min(0.9, 0.5 + (dependencyCount * 0.1));
    }

    // Adjust based on goal type
    if (goal.type === 'tactical') {
      tacticalScore *= 1.2;
    }

    return Math.max(0, Math.min(1, tacticalScore));
  }

  /**
   * Calculate operational readiness factor
   */
  private calculateOperationalFactor(goal: Goal, agentState: AgentState): number {
    if (goal.type !== 'operational') return 0.3;

    // Check if all dependencies are satisfied
    const satisfiedDependencies = goal.dependencies.filter(depId => {
      const allGoals = [
        ...agentState.cognitive.goals.strategicGoals,
        ...agentState.cognitive.goals.tacticalGoals,
        ...agentState.cognitive.goals.operationalGoals
      ];
      const depGoal = allGoals.find(g => g.id === depId);
      return depGoal && depGoal.status === 'completed';
    });

    const dependencyRatio = goal.dependencies.length > 0 
      ? satisfiedDependencies.length / goal.dependencies.length 
      : 1.0;

    // Check resource availability
    const resourceScore = this.calculateResourceAvailability(goal, agentState);

    return (dependencyRatio * 0.6) + (resourceScore * 0.4);
  }

  /**
   * Calculate social impact factor
   */
  private calculateSocialFactor(goal: Goal, agentState: AgentState): number {
    const socialState = agentState.cognitive.social;
    const nearbyAgents = socialState.socialContext.nearbyAgents;
    
    let socialScore = 0.5;

    // Goals that help others get higher social priority
    if (goal.description.includes('help') || 
        goal.description.includes('assist') || 
        goal.description.includes('support')) {
      socialScore += 0.3;
    }

    // Collaborative goals get higher priority when agents are nearby
    if (goal.resources.assistance && goal.resources.assistance.length > 0) {
      if (nearbyAgents.length > 0) {
        socialScore += 0.2;
      }
    }

    // Consider reputation and trust levels
    const reputationScore = socialState.relationships.reputationScore / 100;
    socialScore += reputationScore * 0.2;

    return Math.max(0, Math.min(1, socialScore));
  }

  /**
   * Calculate personal alignment factor
   */
  private calculatePersonalFactor(goal: Goal, agentState: AgentState): number {
    const personality = agentState.cognitive.purpose.personality;
    const motivations = agentState.cognitive.purpose.motivations;
    const values = agentState.cognitive.purpose.values;

    let personalScore = 0.5;

    // Personality alignment
    if (goal.description.includes('explore') || goal.description.includes('discover')) {
      personalScore += personality.curiosity * 0.3;
    }
    if (goal.description.includes('build') || goal.description.includes('create')) {
      personalScore += personality.creativity * 0.3;
    }
    if (goal.description.includes('fight') || goal.description.includes('combat')) {
      personalScore += personality.riskTolerance * 0.3;
    }

    // Motivation alignment
    if (motivations.primaryMotivation === 'achievement' && 
        (goal.description.includes('complete') || goal.description.includes('achieve'))) {
      personalScore += 0.2;
    }
    if (motivations.primaryMotivation === 'social' && 
        (goal.description.includes('help') || goal.description.includes('trade'))) {
      personalScore += 0.2;
    }

    // Value alignment
    const valueAlignment = this.calculateValueAlignment(goal, values);
    personalScore += valueAlignment * 0.2;

    return Math.max(0, Math.min(1, personalScore));
  }

  /**
   * Calculate environmental suitability factor
   */
  private calculateEnvironmentalFactor(goal: Goal, agentState: AgentState): number {
    const worldContext = agentState.context;
    let environmentalScore = 0.5;

    // Time of day considerations
    if (goal.description.includes('explore') && worldContext.timeOfDay >= 12000 && worldContext.timeOfDay <= 23000) {
      environmentalScore -= 0.3; // Night exploration penalty
    }

    // Weather considerations
    if (worldContext.weather === 'rain' && goal.description.includes('build')) {
      environmentalScore -= 0.2;
    }
    if (worldContext.weather === 'clear' && goal.description.includes('explore')) {
      environmentalScore += 0.2;
    }

    // Health considerations
    if (worldContext.health < 10 && goal.type !== 'strategic') {
      environmentalScore -= 0.4;
    }

    return Math.max(0, Math.min(1, environmentalScore));
  }

  /**
   * Calculate temporal urgency factor
   */
  private calculateTemporalFactor(goal: Goal, agentState: AgentState): number {
    let temporalScore = 0.5;

    // Deadline considerations
    if (goal.deadline) {
      const now = Date.now();
      const timeRemaining = goal.deadline - now;
      const timeRatio = timeRemaining / (goal.deadline - goal.createdAt);
      
      if (timeRatio < 0.1) {
        temporalScore = 1.0; // Very urgent
      } else if (timeRatio < 0.3) {
        temporalScore = 0.8; // Urgent
      } else if (timeRatio < 0.6) {
        temporalScore = 0.6; // Moderate urgency
      } else {
        temporalScore = 0.3; // Low urgency
      }
    }

    // Age of goal (older goals get slight priority boost)
    const age = Date.now() - goal.createdAt;
    const ageInHours = age / (1000 * 60 * 60);
    if (ageInHours > 24) {
      temporalScore += 0.1;
    }

    return Math.max(0, Math.min(1, temporalScore));
  }

  /**
   * Calculate resource availability and efficiency (enhanced for Planning Engine)
   */
  private calculateResource(goal: Goal, agentState: AgentState, executionContext?: GoalExecutionContext): number {
    // Use the new calculateResourceScore method
    return this.calculateResourceScore(goal, agentState, executionContext);
  }

  /**
   * Calculate resource availability score
   */
  private calculateResourceAvailability(goal: Goal, agentState: AgentState): number {
    const inventory = agentState.context.inventory;
    const requiredItems = goal.resources.items;
    
    if (Object.keys(requiredItems).length === 0) {
      return 1.0; // No resources required
    }

    let availabilityScore = 0;
    let totalRequired = 0;

    for (const [itemType, required] of Object.entries(requiredItems)) {
      totalRequired += required;
      const available = inventory.find(item => item.type === itemType)?.count || 0;
      availabilityScore += Math.min(1, available / required);
    }

    return totalRequired > 0 ? availabilityScore / Object.keys(requiredItems).length : 1.0;
  }

  /**
   * Calculate resource efficiency score
   */
  private calculateResourceEfficiency(goal: Goal, agentState: AgentState): number {
    const inventory = agentState.context.inventory;
    const requiredItems = goal.resources.items;
    
    let efficiencyScore = 0.5; // Base efficiency

    // Check tool quality and availability
    for (const tool of goal.resources.tools) {
      const toolItem = inventory.find(item => item.type === tool);
      if (toolItem) {
        efficiencyScore += 0.1; // Tool available
        // Could check tool quality/durability here
      } else {
        efficiencyScore -= 0.2; // Tool missing
      }
    }

    return Math.max(0, Math.min(1, efficiencyScore));
  }

  /**
   * Calculate cost-benefit analysis
   */
  private calculateCostBenefit(goal: Goal, agentState: AgentState): number {
    // Simple cost-benefit based on goal type and resources
    let cost = 0;
    let benefit = 0.5;

    // Calculate resource cost
    for (const [itemType, amount] of Object.entries(goal.resources.items)) {
      cost += amount * 0.1; // Simple cost calculation
    }

    // Estimate benefit based on goal type
    switch (goal.type) {
      case 'strategic':
        benefit = 0.9;
        break;
      case 'tactical':
        benefit = 0.7;
        break;
      case 'operational':
        benefit = 0.5;
        break;
    }

    const costBenefitRatio = benefit / (cost + 0.1);
    return Math.max(0, Math.min(1, costBenefitRatio));
  }

  /**
   * Calculate sustainability score
   */
  private calculateSustainability(goal: Goal, agentState: AgentState): number {
    // Check if goal uses renewable resources
    let sustainabilityScore = 0.7; // Base sustainability

    const requiredItems = goal.resources.items;
    
    // Penalize non-renewable resource usage
    if (requiredItems['coal'] || requiredItems['diamond'] || requiredItems['iron']) {
      sustainabilityScore -= 0.2;
    }

    // Bonus for renewable resources
    if (requiredItems['wood'] || requiredItems['wheat'] || requiredItems['seeds']) {
      sustainabilityScore += 0.2;
    }

    return Math.max(0, Math.min(1, sustainabilityScore));
  }

  /**
   * Calculate opportunity value
   */
  private calculateOpportunityValue(goal: Goal, agentState: AgentState): number {
    let opportunityScore = 0.5;

    // Check for time-sensitive opportunities
    const worldContext = agentState.context;
    
    if (worldContext.weather === 'clear' && goal.description.includes('explore')) {
      opportunityScore += 0.3;
    }

    if (worldContext.timeOfDay >= 0 && worldContext.timeOfDay <= 12000 && 
        goal.description.includes('build')) {
      opportunityScore += 0.2; // Daytime building bonus
    }

    return Math.max(0, Math.min(1, opportunityScore));
  }

  /**
   * Calculate resource scarcity impact
   */
  private calculateResourceScarcity(goal: Goal, agentState: AgentState): number {
    const inventory = agentState.context.inventory;
    const requiredItems = goal.resources.items;
    
    let scarcityScore = 0.5;

    for (const [itemType, amount] of Object.entries(requiredItems)) {
      const available = inventory.find(item => item.type === itemType)?.count || 0;
      const ratio = available / amount;
      
      if (ratio < 0.5) {
        scarcityScore -= 0.2; // Resource is scarce
      } else if (ratio > 2) {
        scarcityScore += 0.1; // Resource is abundant
      }
    }

    return Math.max(0, Math.min(1, scarcityScore));
  }

  /**
   * Calculate resource accessibility
   */
  private calculateResourceAccessibility(goal: Goal, agentState: AgentState): number {
    // Check if required resources are easily accessible
    let accessibilityScore = 0.7;

    // Check location requirements
    if (goal.resources.location) {
      const distance = this.calculateDistance(
        agentState.context.position,
        goal.resources.location
      );
      
      if (distance < 50) {
        accessibilityScore += 0.2;
      } else if (distance > 200) {
        accessibilityScore -= 0.3;
      }
    }

    return Math.max(0, Math.min(1, accessibilityScore));
  }

  /**
   * Calculate risk assessment factor
   */
  private calculateRisk(goal: Goal, agentState: AgentState): number {
    let riskScore = 0.5;

    // Environmental risk
    const worldContext = agentState.context;
    if (worldContext.health < 15) {
      riskScore -= 0.3;
    }

    // Hostile entities nearby
    const hostileEntities = worldContext.nearbyEntities.filter(e => e.hostile);
    if (hostileEntities.length > 0) {
      riskScore -= hostileEntities.length * 0.1;
    }

    // Risky goal types
    if (goal.description.includes('combat') || goal.description.includes('danger')) {
      riskScore -= 0.2;
    }

    // Personality risk tolerance
    const riskTolerance = agentState.cognitive.purpose.personality.riskTolerance;
    riskScore += (riskTolerance - 0.5) * 0.4;

    return Math.max(0, Math.min(1, riskScore));
  }

  /**
   * Calculate learning and growth potential
   */
  private calculateLearning(goal: Goal, agentState: AgentState): number {
    let learningScore = 0.5;

    // Skill development opportunities
    const skills = agentState.cognitive.skills;
    
    if (goal.description.includes('craft')) {
      const craftingSkill = skills.skills['crafting'];
      if (craftingSkill && craftingSkill.proficiency.overall < 0.7) {
        learningScore += 0.3;
      }
    }

    if (goal.description.includes('explore')) {
      const explorationSkill = skills.skills['exploration'];
      if (explorationSkill && explorationSkill.proficiency.overall < 0.7) {
        learningScore += 0.3;
      }
    }

    // Personality learning preference
    const openness = agentState.cognitive.purpose.personality.openness;
    learningScore += (openness - 0.5) * 0.3;

    return Math.max(0, Math.min(1, learningScore));
  }

  /**
   * Calculate confidence in priority assessment
   */
  private calculateConfidence(goal: Goal, agentState: AgentState, context: DecisionContext): number {
    let confidence = 0.7;

    // Higher confidence for well-defined goals
    if (goal.description.length > 50 && goal.resources.items) {
      confidence += 0.1;
    }

    // Lower confidence in high-stress situations
    if (context.urgency > 0.8) {
      confidence -= 0.2;
    }

    // Higher confidence with more complete information
    if (agentState.context.nearbyEntities.length > 0 && 
        agentState.context.nearbyBlocks.length > 0) {
      confidence += 0.1;
    }

    return Math.max(0, Math.min(1, confidence));
  }

  /**
   * Generate reasoning for priority score
   */
  private generateReasoning(goal: Goal, factors: GoalPriorityFactors, agentState: AgentState): string {
    const reasons = [];

    if (factors.strategic > 0.7) {
      reasons.push('Strong strategic alignment');
    }
    if (factors.tactical > 0.7) {
      reasons.push('Important tactical objective');
    }
    if (factors.operational > 0.7) {
      reasons.push('Ready for execution');
    }
    if (factors.social > 0.7) {
      reasons.push('High social impact');
    }
    if (factors.personal > 0.7) {
      reasons.push('Strong personal alignment');
    }
    if (factors.resource > 0.7) {
      reasons.push('Excellent resource availability');
    }
    if (factors.risk < 0.3) {
      reasons.push('Low risk assessment');
    }
    if (factors.learning > 0.7) {
      reasons.push('High learning potential');
    }

    return reasons.length > 0 ? reasons.join(', ') : 'Standard priority assessment';
  }

  /**
   * Prioritize multiple goals and return ranked results
   */
  prioritizeGoals(
    goals: GoalType[], // Use the goal_types Goal type
    context: GoalExecutionContext
  ): GoalPrioritizationResult {
    const rankedGoals: RankedGoal[] = [];
    
    // Calculate priority scores for all goals
    const goalScores = goals.map(goal => {
      const priorityScore = this.calculateGoalPriority(goal as any, context.agentState, context.decisionContext, context);
      
      return {
        goal,
        priorityScore: priorityScore.score,
        rank: 0, // Will be set after sorting
        factors: {
          urgency: priorityScore.factors.temporal,
          importance: (priorityScore.factors.strategic + priorityScore.factors.tactical) / 2,
          feasibility: this.calculateFeasibilityScore(goal as any, context.agentState, context),
          resource: priorityScore.factors.resource,
          alignment: (priorityScore.factors.personal + priorityScore.factors.social) / 2
        },
        reasoning: priorityScore.reasoning
      };
    });

    // Sort goals by priority score (descending)
    goalScores.sort((a, b) => b.priorityScore - a.priorityScore);
    
    // Assign ranks
    goalScores.forEach((goalScore, index) => {
      goalScore.rank = index + 1;
    });

    return {
      rankedGoals: goalScores,
      prioritizationFactors: this.getFactors(),
      context: context.decisionContext,
      timestamp: Date.now()
    };
  }

  /**
   * Get current prioritization factors and weights
   */
  getFactors(): PrioritizationFactors {
    return {
      urgencyWeight: this.temporalWeight,
      importanceWeight: this.strategicWeight + this.tacticalWeight,
      feasibilityWeight: 0.2, // Weight for feasibility assessment
      resourceWeight: this.environmentalWeight,
      alignmentWeight: this.personalWeight + this.socialWeight
    };
  }

  /**
   * Helper method to calculate distance between two positions
   */
  private calculateDistance(pos1: { x: number; y: number; z: number }, 
                           pos2: { x: number; y: number; z: number }): number {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    const dz = pos1.z - pos2.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  /**
   * Helper method to calculate value alignment
   */
  private calculateValueAlignment(goal: Goal, values: ValueHierarchy): number {
    // Simple value alignment based on goal description keywords
    let alignment = 0.5;

    if (values.coreValues.includes('cooperation') && 
        (goal.description.includes('help') || goal.description.includes('team'))) {
      alignment += 0.3;
    }

    if (values.coreValues.includes('efficiency') && 
        (goal.description.includes('optimize') || goal.description.includes('improve'))) {
      alignment += 0.3;
    }

    if (values.coreValues.includes('exploration') && 
        (goal.description.includes('explore') || goal.description.includes('discover'))) {
      alignment += 0.3;
    }

    return Math.max(0, Math.min(1, alignment));
  }

  /**
   * Calculate enhanced feasibility score with detailed assessment
   * Returns a numeric score (0-1) for goal feasibility
   */
  private calculateFeasibilityScore(goal: Goal, agentState: AgentState, executionContext?: GoalExecutionContext): number {
    // Resource availability assessment
    const resourceAvailability = this.calculateResourceAvailability(goal, agentState);
    
    // Skill readiness assessment with detailed analysis
    const skillReadiness = this.calculateSkillReadiness(goal, agentState);
    
    // Environmental fit assessment
    const environmentalFit = this.calculateEnvironmentalFit(goal, agentState);
    
    // Risk assessment
    const riskAssessment = this.calculateRisk(goal, agentState);
    
    // Time feasibility
    const timeFeasibility = this.calculateTimeFeasibility(goal, agentState);
    
    // Dependency feasibility
    const dependencyFeasibility = this.calculateDependencyFeasibility(goal, agentState);

    const score = (resourceAvailability * 0.25) + (skillReadiness * 0.25) + 
                  (environmentalFit * 0.15) + (riskAssessment * 0.15) +
                  (timeFeasibility * 0.1) + (dependencyFeasibility * 0.1);

    return Math.max(0, Math.min(1, score));
  }

  /**
   * Calculate enhanced resource score with detailed assessment
   * Returns a numeric score (0-1) for resource efficiency and availability
   */
  private calculateResourceScore(goal: Goal, agentState: AgentState, executionContext?: GoalExecutionContext): number {
    const resourceAvailability = this.calculateResourceAvailability(goal, agentState);
    const resourceEfficiency = this.calculateResourceEfficiency(goal, agentState);
    const costBenefit = this.calculateCostBenefit(goal, agentState);
    const sustainability = this.calculateSustainability(goal, agentState);
    const opportunityValue = this.calculateOpportunityValue(goal, agentState);
    const resourceScarcity = this.calculateResourceScarcity(goal, agentState);
    const resourceAccessibility = this.calculateResourceAccessibility(goal, agentState);

    const score = (resourceAvailability * 0.25) + (resourceEfficiency * 0.25) + 
                  (costBenefit * 0.2) + (sustainability * 0.15) + (opportunityValue * 0.1) +
                  (resourceScarcity * 0.05);

    return Math.max(0, Math.min(1, score));
  }

  /**
   * Calculate enhanced feasibility with detailed assessment (legacy method for backward compatibility)
   */
  private calculateFeasibility(goal: Goal, agentState: AgentState, executionContext?: GoalExecutionContext): GoalPriorityFactors {
    // Use the new calculateFeasibilityScore method for the overall feasibility
    const feasibilityScore = this.calculateFeasibilityScore(goal, agentState, executionContext);
    
    return {
      strategic: this.calculateStrategicFactor(goal, agentState),
      tactical: this.calculateTacticalFactor(goal, agentState),
      operational: this.calculateOperationalFactor(goal, agentState),
      social: this.calculateSocialFactor(goal, agentState),
      personal: this.calculatePersonalFactor(goal, agentState),
      environmental: this.calculateEnvironmentalFit(goal, agentState),
      temporal: this.calculateTimeFeasibility(goal, agentState),
      resource: this.calculateResourceScore(goal, agentState, executionContext),
      risk: this.calculateRisk(goal, agentState),
      learning: this.calculateLearning(goal, agentState)
    };
  }

  /**
   * Calculate detailed skill readiness assessment
   */
  private calculateSkillReadiness(goal: Goal, agentState: AgentState): number {
    const skills = agentState.cognitive.skills;
    let totalSkillScore = 0;
    let skillCount = 0;

    // Analyze required skills based on goal description
    const requiredSkills = this.extractRequiredSkills(goal);
    
    for (const skillType of requiredSkills) {
      const skill = skills.skills[skillType];
      if (skill) {
        // Calculate skill readiness with proficiency and recent usage
        const proficiencyScore = skill.proficiency.overall;
        const experienceBonus = this.calculateExperienceBonus(skill);
        const generalCapability = this.assessGeneralCapability(skill);
        
        const skillReadiness = (proficiencyScore * 0.5) + 
                              (experienceBonus * 0.3) + 
                              (generalCapability * 0.2);
        
        totalSkillScore += skillReadiness;
        skillCount++;
      } else {
        // No skill available
        totalSkillScore += 0.1;
        skillCount++;
      }
    }

    return skillCount > 0 ? totalSkillScore / skillCount : 0.5;
  }

  /**
   * Calculate experience bonus based on recent skill usage
   */
  private calculateExperienceBonus(skill: Skill): number {
    const recentUses = skill.usage.recentUses;
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);
    
    // Count recent uses within the last hour
    const recentCount = recentUses.filter(timestamp => timestamp > oneHourAgo).length;
    
    // Bonus for recent usage (diminishing returns)
    return Math.min(0.3, recentCount * 0.1);
  }

  /**
   * Assess general capability beyond specific proficiency
   */
  private assessGeneralCapability(skill: Skill): number {
    const successRate = skill.usage.totalUses > 0 
      ? skill.usage.successfulUses / skill.usage.totalUses 
      : 0.5;
    
    const avgExecutionTime = skill.usage.averageExecutionTime;
    const timeEfficiency = avgExecutionTime > 0 
      ? Math.max(0.1, 1 - (avgExecutionTime / 10000)) // Normalize to 10 seconds
      : 0.5;
    
    return (successRate * 0.7) + (timeEfficiency * 0.3);
  }

  /**
   * Calculate environmental fit assessment
   */
  private calculateEnvironmentalFit(goal: Goal, agentState: AgentState): number {
    const worldContext = agentState.context;
    let fitScore = 0.5;

    // Weather considerations for different goal types
    if (goal.description.includes('build') || goal.description.includes('construct')) {
      if (worldContext.weather === 'clear') {
        fitScore += 0.3;
      } else if (worldContext.weather === 'rain') {
        fitScore -= 0.2;
      }
    }

    if (goal.description.includes('explore') || goal.description.includes('travel')) {
      if (worldContext.weather === 'clear') {
        fitScore += 0.2;
      } else if (worldContext.weather === 'thunder') {
        fitScore -= 0.3;
      }
    }

    // Time of day considerations
    if (goal.description.includes('mine') || goal.description.includes('cave')) {
      // Any time is good for mining, but night is slightly better
      if (worldContext.timeOfDay >= 13000 && worldContext.timeOfDay <= 23000) {
        fitScore += 0.1;
      }
    }

    if (goal.description.includes('farm') || goal.description.includes('grow')) {
      // Daytime is better for farming
      if (worldContext.timeOfDay >= 0 && worldContext.timeOfDay <= 12000) {
        fitScore += 0.2;
      }
    }

    return Math.max(0, Math.min(1, fitScore));
  }

  /**
   * Calculate time feasibility based on deadlines and duration
   */
  private calculateTimeFeasibility(goal: Goal, agentState: AgentState): number {
    let feasibilityScore = 0.7; // Base feasibility

    if (goal.deadline) {
      const now = Date.now();
      const timeRemaining = goal.deadline - now;
      const timeSinceCreation = now - goal.createdAt;
      const totalTime = timeSinceCreation + timeRemaining;
      
      if (timeRemaining < 0) {
        feasibilityScore = 0; // Past deadline
      } else if (timeRemaining < (totalTime * 0.1)) {
        feasibilityScore = 0.2; // Very tight deadline
      } else if (timeRemaining < (totalTime * 0.3)) {
        feasibilityScore = 0.5; // Tight deadline
      } else if (timeRemaining > (totalTime * 0.8)) {
        feasibilityScore = 1.0; // Plenty of time
      }
    }

    return feasibilityScore;
  }

  /**
   * Calculate dependency feasibility
   */
  private calculateDependencyFeasibility(goal: Goal, agentState: AgentState): number {
    if (goal.dependencies.length === 0) {
      return 1.0; // No dependencies
    }

    const allGoals = [
      ...agentState.cognitive.goals.strategicGoals,
      ...agentState.cognitive.goals.tacticalGoals,
      ...agentState.cognitive.goals.operationalGoals
    ];

    let completedDependencies = 0;
    let blockedDependencies = 0;

    for (const depId of goal.dependencies) {
      const depGoal = allGoals.find(g => g.id === depId);
      if (depGoal) {
        if (depGoal.status === 'completed') {
          completedDependencies++;
        } else if (depGoal.status === 'failed' || depGoal.status === 'paused') {
          blockedDependencies++;
        }
      } else {
        blockedDependencies++; // Dependency not found
      }
    }

    if (blockedDependencies > 0) {
      return 0.1; // Blocked dependencies
    }

    return completedDependencies / goal.dependencies.length;
  }

  /**
   * Extract required skills from goal description
   */
  private extractRequiredSkills(goal: Goal): string[] {
    const skills: string[] = [];
    const description = goal.description.toLowerCase();

    if (description.includes('mine') || description.includes('dig') || description.includes('ore')) {
      skills.push('mining');
    }
    if (description.includes('craft') || description.includes('build') || description.includes('create')) {
      skills.push('crafting');
    }
    if (description.includes('fight') || description.includes('combat') || description.includes('attack')) {
      skills.push('combat');
    }
    if (description.includes('explore') || description.includes('travel') || description.includes('discover')) {
      skills.push('exploration');
    }
    if (description.includes('farm') || description.includes('grow') || description.includes('harvest')) {
      skills.push('agriculture');
    }
    if (description.includes('trade') || description.includes('buy') || description.includes('sell')) {
      skills.push('trading');
    }
    if (description.includes('social') || description.includes('talk') || description.includes('help')) {
      skills.push('social');
    }

    return skills.length > 0 ? skills : ['survival']; // Default skill
  }
}