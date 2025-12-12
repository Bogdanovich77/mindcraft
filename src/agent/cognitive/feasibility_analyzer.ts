/**
 * Feasibility Analyzer for Planning Engine
 * 
 * Provides comprehensive plan viability assessment, risk analysis,
 * and success probability calculation for the Mindcraft LangGraph planning system.
 */

import { 
  AgentState, 
  Plan, 
  PlanStep,
  FeasibilityAnalysisResult,
  FeasibilityLevel,
  RiskLevel,
  BlockingFactor,
  AlternativePlan,
  ResourceRequirement,
  SkillRequirement,
  FeasibilityResult,
  FeasibilityFactor,
  RiskAnalysis,
  RiskFactor,
  MitigationStrategy,
  TimeEstimate,
  CostEstimate,
  Skill,
  PlanningEngineConfig
} from '../langgraph/interfaces.js';

/**
 * Feasibility Analyzer class
 */
export class FeasibilityAnalyzer {
  private config: FeasibilityAnalyzerConfig;
  private analysisHistory: Map<string, FeasibilityAnalysisResult> = new Map();
  private riskFactors: Map<string, number> = new Map();

  constructor(config?: Partial<FeasibilityAnalyzerConfig>) {
    this.config = {
      analysisTimeout: 3000,
      maxHistorySize: 100,
      enableRiskAnalysis: true,
      enableAlternativeGeneration: true,
      confidenceThreshold: 0.7,
      riskTolerance: 0.3,
      timeBuffer: 1.2,
      costBuffer: 1.1,
      minSuccessProbability: 0.6,
      skillWeight: 0.3,
      resourceWeight: 0.3,
      complexityWeight: 0.2,
      riskWeight: 0.2,
      riskFactors: {
        resource: 0.3,
        time: 0.2,
        skill: 0.2,
        environmental: 0.15,
        social: 0.15
      },
      ...config
    };

    this.initializeRiskFactors();
  }

  /**
   * Analyze feasibility of a plan
   */
  async analyzeFeasibility(plan: Plan, agentState: AgentState): Promise<FeasibilityAnalysisResult> {
    const startTime = Date.now();
    const cacheKey = `${plan.id}_${agentState.metadata.agentId}`;

    try {
      // Check if we have a recent analysis
      if (this.analysisHistory.has(cacheKey)) {
        const cached = this.analysisHistory.get(cacheKey)!;
        if (Date.now() - cached.analysisTime < 60000) { // 1 minute cache
          return cached;
        }
      }

      // Perform comprehensive analysis
      const feasibilityScore = await this.calculateFeasibilityScore(plan, agentState);
      const feasibilityLevel = this.determineFeasibilityLevel(feasibilityScore);
      const confidence = this.calculateConfidence(plan, agentState);
      const riskLevel = await this.assessRiskLevel(plan, agentState);
      const blockingFactors = await this.identifyBlockingFactors(plan, agentState);
      const alternativePlans = this.config.enableAlternativeGeneration ? 
        await this.generateAlternativePlans(plan, agentState) : [];
      const timeEstimation = await this.estimateTime(plan, agentState);
      const costEstimation = await this.estimateCost(plan, agentState);
      const successProbability = this.calculateSuccessProbability(feasibilityScore, riskLevel, confidence);

      const result: FeasibilityAnalysisResult = {
        planId: plan.id,
        feasibilityLevel,
        feasibilityScore,
        confidence,
        riskLevel,
        blockingFactors,
        alternativePlans,
        timeEstimation,
        costEstimation,
        successProbability,
        analysisTime: Date.now() - startTime
      };

      // Cache the result
      this.analysisHistory.set(cacheKey, result);
      this.cleanupHistory();

      return result;

    } catch (error) {
      console.error('[FEASIBILITY_ANALYZER] Error analyzing feasibility:', error);
      throw error;
    }
  }

  /**
   * Perform detailed feasibility analysis with all factors
   */
  async performDetailedFeasibilityAnalysis(plan: Plan, agentState: AgentState): Promise<FeasibilityResult> {
    const startTime = Date.now();

    try {
      // Analyze individual feasibility factors
      const skillFeasibility = await this.analyzeSkillFeasibility(plan, agentState);
      const resourceFeasibility = await this.analyzeResourceFeasibility(plan, agentState);
      const complexityFeasibility = await this.analyzeComplexityFeasibility(plan, agentState);
      const riskAnalysis = await this.performRiskAnalysis(plan, agentState);

      // Calculate overall feasibility
      const overallFeasibility = this.calculateOverallFeasibility(
        skillFeasibility,
        resourceFeasibility,
        complexityFeasibility,
        riskAnalysis
      );

      // Generate time and cost estimates
      const timeEstimate = await this.estimateTime(plan, agentState);
      const costEstimate = await this.estimateCost(plan, agentState);

      // Calculate success probability
      const successProbability = this.calculateSuccessProbability(
        overallFeasibility,
        riskAnalysis.overallRisk,
        this.calculateConfidence(plan, agentState)
      );

      // Generate recommendations
      const recommendations = await this.generateFeasibilityRecommendations(
        skillFeasibility,
        resourceFeasibility,
        complexityFeasibility,
        riskAnalysis
      );

      const result: FeasibilityResult = {
        planId: plan.id,
        overallFeasibility,
        successProbability,
        isFeasible: overallFeasibility >= this.config.minSuccessProbability,
        timeEstimate,
        costEstimate,
        riskAnalysis,
        skillFeasibility,
        resourceFeasibility,
        complexityFeasibility,
        recommendations,
        analyzedAt: Date.now(),
        analysisTime: Date.now() - startTime
      };

      return result;

    } catch (error) {
      console.error('[FEASIBILITY_ANALYZER] Error in detailed analysis:', error);
      throw error;
    }
  }

  /**
   * Calculate overall feasibility score
   */
  private async calculateFeasibilityScore(plan: Plan, agentState: AgentState): Promise<number> {
    const factors = await Promise.all([
      this.calculateSkillFeasibility(plan, agentState),
      this.calculateResourceFeasibility(plan, agentState),
      this.calculateComplexityFeasibility(plan, agentState),
      this.calculateEnvironmentalFeasibility(plan, agentState),
      this.calculateSocialFeasibility(plan, agentState)
    ]);

    // Weighted average based on configuration
    const weights = [
      this.config.skillWeight,
      this.config.resourceWeight,
      this.config.complexityWeight,
      this.config.riskFactors.environmental,
      this.config.riskFactors.social
    ];

    const weightedSum = factors.reduce((sum, factor, index) => sum + factor * weights[index], 0);
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);

    return totalWeight > 0 ? weightedSum / totalWeight : 0;
  }

  /**
   * Calculate skill feasibility
   */
  private async calculateSkillFeasibility(plan: Plan, agentState: AgentState): Promise<number> {
    if (plan.steps.length === 0) return 1.0;

    let totalSkillScore = 0;
    let stepCount = 0;

    for (const step of plan.steps) {
      if (!step.requiredSkills || step.requiredSkills.length === 0) {
        totalSkillScore += 1.0;
        stepCount++;
        continue;
      }

      let stepSkillScore = 0;
      for (const skillReq of step.requiredSkills) {
        const skill = agentState.cognitive.skills.skills[skillReq.type];
        if (skill) {
          const proficiencyRatio = skill.proficiency.overall / skillReq.minProficiency;
          stepSkillScore += Math.min(1.0, proficiencyRatio);
        } else {
          stepSkillScore += 0.0;
        }
      }

      totalSkillScore += stepSkillScore / step.requiredSkills.length;
      stepCount++;
    }

    return stepCount > 0 ? totalSkillScore / stepCount : 0.0;
  }

  /**
   * Calculate resource feasibility
   */
  private async calculateResourceFeasibility(plan: Plan, agentState: AgentState): Promise<number> {
    const inventory = agentState.context.inventory;
    let totalResourceScore = 0;
    let resourceCount = 0;

    // Check plan resource requirements
    for (const [resourceType, amount] of Object.entries(plan.resourceRequirements.items)) {
      const available = inventory.find(item => item.type === resourceType);
      const availableAmount = available ? available.count : 0;
      
      const score = Math.min(1.0, availableAmount / amount);
      totalResourceScore += score;
      resourceCount++;
    }

    // Check step-specific resource requirements
    for (const step of plan.steps) {
      if (!step.requiredResources || step.requiredResources.length === 0) continue;

      for (const resourceReq of step.requiredResources) {
        const available = inventory.find(item => item.type === resourceReq.type);
        const availableAmount = available ? available.count : 0;
        
        const score = Math.min(1.0, availableAmount / resourceReq.amount);
        totalResourceScore += score;
        resourceCount++;
      }
    }

    return resourceCount > 0 ? totalResourceScore / resourceCount : 1.0;
  }

  /**
   * Calculate complexity feasibility
   */
  private async calculateComplexityFeasibility(plan: Plan, agentState: AgentState): Promise<number> {
    const stepCount = plan.steps.length;
    const dependencyCount = plan.dependencies.length;
    const estimatedDuration = plan.estimatedDuration;

    // Complexity factors
    const stepComplexity = Math.max(0, 1.0 - (stepCount - 5) * 0.1); // Penalty for many steps
    const dependencyComplexity = Math.max(0, 1.0 - dependencyCount * 0.15); // Penalty for many dependencies
    const timeComplexity = Math.max(0, 1.0 - (estimatedDuration - 300000) / 1000000); // Penalty for long duration

    // Agent's capability to handle complexity
    const agentCapability = this.calculateAgentComplexityCapability(agentState);

    return Math.min(1.0, (stepComplexity + dependencyComplexity + timeComplexity) / 3 * agentCapability);
  }

  /**
   * Calculate environmental feasibility
   */
  private async calculateEnvironmentalFeasibility(plan: Plan, agentState: AgentState): Promise<number> {
    let environmentalScore = 1.0;

    // Check weather impact
    const weather = agentState.context.weather;
    if (weather === 'storm' || weather === 'thunder') {
      environmentalScore *= 0.7;
    }

    // Check time of day impact
    const timeOfDay = agentState.context.timeOfDay;
    if (timeOfDay < 6000 || timeOfDay > 18000) { // Night time
      environmentalScore *= 0.8;
    }

    // Check dimension impact
    const dimension = agentState.context.dimension;
    if (dimension === 'nether') {
      environmentalScore *= 0.6; // More dangerous
    } else if (dimension === 'end') {
      environmentalScore *= 0.4; // Very dangerous
    }

    return Math.max(0.1, environmentalScore);
  }

  /**
   * Calculate social feasibility
   */
  private async calculateSocialFeasibility(plan: Plan, agentState: AgentState): Promise<number> {
    let socialScore = 1.0;

    // Check if plan requires collaboration
    const requiresCollaboration = plan.type === 'collaborative' || 
      plan.steps.some(step => step.requiredResources?.some(req => req.type === 'assistance'));

    if (requiresCollaboration) {
      // Check available nearby agents
      const nearbyAgents = agentState.context.nearbyEntities.filter(e => e.type === 'player' || e.type === 'agent');
      if (nearbyAgents.length === 0) {
        socialScore *= 0.3; // No one to collaborate with
      } else {
        socialScore *= 0.8; // Some collaboration possible
      }
    }

    return socialScore;
  }

  /**
   * Determine feasibility level from score
   */
  private determineFeasibilityLevel(score: number): FeasibilityLevel {
    if (score >= 0.9) return FeasibilityLevel.VERY_HIGH;
    if (score >= 0.7) return FeasibilityLevel.HIGH;
    if (score >= 0.5) return FeasibilityLevel.MEDIUM;
    if (score >= 0.3) return FeasibilityLevel.LOW;
    return FeasibilityLevel.VERY_LOW;
  }

  /**
   * Calculate confidence in analysis
   */
  private calculateConfidence(plan: Plan, agentState: AgentState): number {
    let confidence = 0.8; // Base confidence

    // Adjust based on plan completeness
    if (plan.steps.length === 0) confidence -= 0.3;
    if (plan.resourceRequirements.items && Object.keys(plan.resourceRequirements.items).length === 0) confidence -= 0.2;

    // Adjust based on agent state completeness
    if (agentState.context.inventory.length === 0) confidence -= 0.2;
    if (Object.keys(agentState.cognitive.skills.skills).length === 0) confidence -= 0.2;

    // Adjust based on environmental information
    if (!agentState.context.weather) confidence -= 0.1;

    return Math.max(0.1, Math.min(1.0, confidence));
  }

  /**
   * Assess overall risk level
   */
  private async assessRiskLevel(plan: Plan, agentState: AgentState): Promise<RiskLevel> {
    const riskScore = await this.calculateRiskScore(plan, agentState);
    
    if (riskScore >= 0.8) return RiskLevel.CRITICAL;
    if (riskScore >= 0.6) return RiskLevel.HIGH;
    if (riskScore >= 0.4) return RiskLevel.MEDIUM;
    if (riskScore >= 0.2) return RiskLevel.LOW;
    return RiskLevel.CRITICAL; // Very low feasibility is critical risk
  }

  /**
   * Calculate risk score
   */
  private async calculateRiskScore(plan: Plan, agentState: AgentState): Promise<number> {
    const riskFactors = await Promise.all([
      this.calculateResourceRisk(plan, agentState),
      this.calculateTimeRisk(plan, agentState),
      this.calculateSkillRisk(plan, agentState),
      this.calculateEnvironmentalRisk(plan, agentState),
      this.calculateSocialRisk(plan, agentState)
    ]);

    const weights = [
      this.config.riskFactors.resource,
      this.config.riskFactors.time,
      this.config.riskFactors.skill,
      this.config.riskFactors.environmental,
      this.config.riskFactors.social
    ];

    const weightedSum = riskFactors.reduce((sum, factor, index) => sum + factor * weights[index], 0);
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);

    return totalWeight > 0 ? weightedSum / totalWeight : 0.5;
  }

  /**
   * Identify blocking factors
   */
  private async identifyBlockingFactors(plan: Plan, agentState: AgentState): Promise<BlockingFactor[]> {
    const blockingFactors: BlockingFactor[] = [];

    // Resource blocking factors
    for (const [resourceType, amount] of Object.entries(plan.resourceRequirements.items)) {
      const available = agentState.context.inventory.find(item => item.type === resourceType);
      if (!available || available.count < amount) {
        blockingFactors.push({
          type: 'resource',
          severity: 'critical',
          description: `Insufficient ${resourceType}: need ${amount}, have ${available?.count || 0}`,
          estimatedDelay: 300000, // 5 minutes
          mitigationStrategies: [`Gather ${resourceType}`, `Find alternative to ${resourceType}`]
        });
      }
    }

    // Skill blocking factors
    for (const step of plan.steps) {
      if (!step.requiredSkills) continue;
      
      for (const skillReq of step.requiredSkills) {
        const skill = agentState.cognitive.skills.skills[skillReq.type];
        if (!skill || skill.proficiency.overall < skillReq.minProficiency) {
          blockingFactors.push({
            type: 'skill',
            severity: 'high',
            description: `Insufficient ${skillReq.type} skill: need ${skillReq.minProficiency}, have ${skill?.proficiency.overall || 0}`,
            estimatedDelay: 600000, // 10 minutes
            mitigationStrategies: [`Practice ${skillReq.type}`, `Find alternative approach`]
          });
        }
      }
    }

    // Time blocking factors
    if (plan.deadline && Date.now() + plan.estimatedDuration > plan.deadline) {
      blockingFactors.push({
        type: 'time',
        severity: 'critical',
        description: `Plan cannot be completed before deadline`,
        estimatedDelay: plan.deadline - (Date.now() + plan.estimatedDuration),
        mitigationStrategies: [`Extend deadline`, `Reduce plan scope`, `Optimize execution`]
      });
    }

    // Environmental blocking factors
    if (agentState.context.dimension === 'nether' || agentState.context.dimension === 'end') {
      blockingFactors.push({
        type: 'environmental',
        severity: 'medium',
        description: `Dangerous environment: ${agentState.context.dimension}`,
        estimatedDelay: 120000, // 2 minutes
        mitigationStrategies: [`Bring better equipment`, `Wait for better conditions`, `Find safer alternative`]
      });
    }

    return blockingFactors;
  }

  /**
   * Generate alternative plans
   */
  private async generateAlternativePlans(plan: Plan, agentState: AgentState): Promise<AlternativePlan[]> {
    const alternatives: AlternativePlan[] = [];

    // Generate simpler alternative
    const simplerPlan = await this.generateSimplerAlternative(plan, agentState);
    if (simplerPlan) {
      alternatives.push(simplerPlan);
    }

    // Generate resource-efficient alternative
    const efficientPlan = await this.generateResourceEfficientAlternative(plan, agentState);
    if (efficientPlan) {
      alternatives.push(efficientPlan);
    }

    // Generate faster alternative
    const fasterPlan = await this.generateFasterAlternative(plan, agentState);
    if (fasterPlan) {
      alternatives.push(fasterPlan);
    }

    return alternatives;
  }

  /**
   * Estimate time requirements
   */
  private async estimateTime(plan: Plan, agentState: AgentState): Promise<{min: number; max: number; confidence: number}> {
    const baseTime = plan.estimatedDuration;
    const timeBuffer = this.config.timeBuffer;
    
    // Adjust based on agent skills
    const skillMultiplier = this.calculateSkillTimeMultiplier(agentState);
    
    // Adjust based on complexity
    const complexityMultiplier = 1.0 + (plan.steps.length - 5) * 0.1;
    
    // Adjust based on environmental factors
    const environmentalMultiplier = this.calculateEnvironmentalTimeMultiplier(agentState);
    
    const adjustedTime = baseTime * skillMultiplier * complexityMultiplier * environmentalMultiplier;
    
    return {
      min: adjustedTime * 0.8,
      max: adjustedTime * 1.5,
      confidence: 0.7
    };
  }

  /**
   * Estimate cost requirements
   */
  private async estimateCost(plan: Plan, agentState: AgentState): Promise<{min: number; max: number; confidence: number}> {
    const baseCost = this.calculateBaseCost(plan);
    const costBuffer = this.config.costBuffer;
    
    // Adjust based on resource availability
    const resourceMultiplier = this.calculateResourceCostMultiplier(plan, agentState);
    
    // Adjust based on skill efficiency
    const skillMultiplier = this.calculateSkillCostMultiplier(agentState);
    
    const adjustedCost = baseCost * resourceMultiplier * skillMultiplier;
    
    return {
      min: adjustedCost * 0.9,
      max: adjustedCost * 1.3,
      confidence: 0.6
    };
  }

  /**
   * Calculate success probability
   */
  private calculateSuccessProbability(feasibilityScore: number, riskLevel: RiskLevel, confidence: number): number {
    const riskPenalty = this.getRiskPenalty(riskLevel);
    const confidenceBonus = confidence * 0.1;
    
    return Math.max(0.0, Math.min(1.0, feasibilityScore - riskPenalty + confidenceBonus));
  }

  /**
   * Analyze skill feasibility in detail
   */
  private async analyzeSkillFeasibility(plan: Plan, agentState: AgentState): Promise<FeasibilityFactor> {
    const score = await this.calculateSkillFeasibility(plan, agentState);
    const criticalFactors: string[] = [];
    const improvements: string[] = [];

    // Identify critical skill gaps
    for (const step of plan.steps) {
      if (!step.requiredSkills) continue;
      
      for (const skillReq of step.requiredSkills) {
        const skill = agentState.cognitive.skills.skills[skillReq.type];
        if (!skill || skill.proficiency.overall < skillReq.minProficiency) {
          criticalFactors.push(`${skillReq.type} skill gap`);
          improvements.push(`Practice ${skillReq.type} to level ${skillReq.minProficiency}`);
        }
      }
    }

    return {
      factor: 'skill_feasibility',
      score,
      description: `Skill feasibility assessment based on required vs available skills`,
      criticalFactors,
      improvements
    };
  }

  /**
   * Analyze resource feasibility in detail
   */
  private async analyzeResourceFeasibility(plan: Plan, agentState: AgentState): Promise<FeasibilityFactor> {
    const score = await this.calculateResourceFeasibility(plan, agentState);
    const criticalFactors: string[] = [];
    const improvements: string[] = [];

    // Identify critical resource gaps
    for (const [resourceType, amount] of Object.entries(plan.resourceRequirements.items)) {
      const available = agentState.context.inventory.find(item => item.type === resourceType);
      if (!available || available.count < amount) {
        criticalFactors.push(`${resourceType} shortage`);
        improvements.push(`Gather ${amount - (available?.count || 0)} more ${resourceType}`);
      }
    }

    return {
      factor: 'resource_feasibility',
      score,
      description: `Resource feasibility assessment based on required vs available resources`,
      criticalFactors,
      improvements
    };
  }

  /**
   * Analyze complexity feasibility in detail
   */
  private async analyzeComplexityFeasibility(plan: Plan, agentState: AgentState): Promise<FeasibilityFactor> {
    const score = await this.calculateComplexityFeasibility(plan, agentState);
    const criticalFactors: string[] = [];
    const improvements: string[] = [];

    if (plan.steps.length > 10) {
      criticalFactors.push('High step count');
      improvements.push('Break down into smaller sub-plans');
    }

    if (plan.dependencies.length > 5) {
      criticalFactors.push('Many dependencies');
      improvements.push('Reduce dependencies or parallelize independent tasks');
    }

    return {
      factor: 'complexity_feasibility',
      score,
      description: `Complexity feasibility assessment based on plan structure and dependencies`,
      criticalFactors,
      improvements
    };
  }

  /**
   * Perform detailed risk analysis
   */
  private async performRiskAnalysis(plan: Plan, agentState: AgentState): Promise<RiskAnalysis> {
    const criticalRisks: RiskFactor[] = [];
    const mitigatedRisks: RiskFactor[] = [];

    // Analyze different risk categories
    const resourceRisks = await this.analyzeResourceRisks(plan, agentState);
    const timeRisks = await this.analyzeTimeRisks(plan, agentState);
    const skillRisks = await this.analyzeSkillRisks(plan, agentState);
    const environmentalRisks = await this.analyzeEnvironmentalRisks(plan, agentState);

    criticalRisks.push(...resourceRisks.critical, ...timeRisks.critical, ...skillRisks.critical, ...environmentalRisks.critical);
    mitigatedRisks.push(...resourceRisks.mitigated, ...timeRisks.mitigated, ...skillRisks.mitigated, ...environmentalRisks.mitigated);

    const overallRisk = this.calculateOverallRisk(criticalRisks, mitigatedRisks);
    const residualRisk = this.calculateResidualRisk(criticalRisks, mitigatedRisks);

    return {
      overallRisk,
      criticalRisks,
      mitigatedRisks,
      residualRisk
    };
  }

  // Helper methods for risk analysis
  private async analyzeResourceRisks(plan: Plan, agentState: AgentState): Promise<{critical: RiskFactor[], mitigated: RiskFactor[]}> {
    const critical: RiskFactor[] = [];
    const mitigated: RiskFactor[] = [];

    for (const [resourceType, amount] of Object.entries(plan.resourceRequirements.items)) {
      const available = agentState.context.inventory.find(item => item.type === resourceType);
      const shortage = amount - (available?.count || 0);
      
      if (shortage > 0) {
        critical.push({
          factor: `resource_shortage_${resourceType}`,
          probability: 0.8,
          impact: shortage / amount,
          description: `Shortage of ${resourceType}: need ${amount}, have ${available?.count || 0}`,
          mitigation: {
            strategy: 'gather_resources',
            effectiveness: 0.7,
            cost: shortage * 2,
            description: `Gather ${shortage} more ${resourceType}`
          }
        });
      }
    }

    return { critical, mitigated };
  }

  private async analyzeTimeRisks(plan: Plan, agentState: AgentState): Promise<{critical: RiskFactor[], mitigated: RiskFactor[]}> {
    const critical: RiskFactor[] = [];
    const mitigated: RiskFactor[] = [];

    if (plan.deadline && Date.now() + plan.estimatedDuration > plan.deadline) {
      const overrun = (Date.now() + plan.estimatedDuration) - plan.deadline;
      critical.push({
        factor: 'deadline_miss',
        probability: 0.9,
        impact: overrun / plan.estimatedDuration,
        description: `Plan will miss deadline by ${Math.round(overrun / 60000)} minutes`,
        mitigation: {
          strategy: 'optimize_execution',
          effectiveness: 0.6,
          cost: overrun * 0.1,
          description: 'Optimize execution to reduce time'
        }
      });
    }

    return { critical, mitigated };
  }

  private async analyzeSkillRisks(plan: Plan, agentState: AgentState): Promise<{critical: RiskFactor[], mitigated: RiskFactor[]}> {
    const critical: RiskFactor[] = [];
    const mitigated: RiskFactor[] = [];

    for (const step of plan.steps) {
      if (!step.requiredSkills) continue;
      
      for (const skillReq of step.requiredSkills) {
        const skill = agentState.cognitive.skills.skills[skillReq.type];
        if (!skill || skill.proficiency.overall < skillReq.minProficiency) {
          const gap = skillReq.minProficiency - (skill?.proficiency.overall || 0);
          critical.push({
            factor: `skill_gap_${skillReq.type}`,
            probability: 0.7,
            impact: gap / skillReq.minProficiency,
            description: `Skill gap in ${skillReq.type}: need ${skillReq.minProficiency}, have ${skill?.proficiency.overall || 0}`,
            mitigation: {
              strategy: 'practice_skill',
              effectiveness: 0.8,
              cost: gap * 100,
              description: `Practice ${skillReq.type} to required level`
            }
          });
        }
      }
    }

    return { critical, mitigated };
  }

  private async analyzeEnvironmentalRisks(plan: Plan, agentState: AgentState): Promise<{critical: RiskFactor[], mitigated: RiskFactor[]}> {
    const critical: RiskFactor[] = [];
    const mitigated: RiskFactor[] = [];

    if (agentState.context.dimension === 'nether' || agentState.context.dimension === 'end') {
      critical.push({
        factor: 'dangerous_environment',
        probability: 0.6,
        impact: 0.5,
        description: `Dangerous environment: ${agentState.context.dimension}`,
        mitigation: {
          strategy: 'better_equipment',
          effectiveness: 0.7,
          cost: 100,
          description: 'Bring better equipment for dangerous environment'
        }
      });
    }

    return { critical, mitigated };
  }

  // Additional helper methods
  private initializeRiskFactors(): void {
    this.riskFactors.set('resource', 0.3);
    this.riskFactors.set('time', 0.2);
    this.riskFactors.set('skill', 0.2);
    this.riskFactors.set('environmental', 0.15);
    this.riskFactors.set('social', 0.15);
  }

  private cleanupHistory(): void {
    if (this.analysisHistory.size > this.config.maxHistorySize) {
      const entries = Array.from(this.analysisHistory.entries());
      entries.sort((a, b) => a[1].analysisTime - b[1].analysisTime);
      
      const toRemove = entries.slice(0, this.analysisHistory.size - this.config.maxHistorySize);
      toRemove.forEach(([key]) => this.analysisHistory.delete(key));
    }
  }

  private calculateAgentComplexityCapability(agentState: AgentState): number {
    // Base capability on intelligence and experience
    const experience = agentState.context.experience;
    const intelligence = agentState.cognitive.purpose.personality.openness;
    const conscientiousness = agentState.cognitive.purpose.personality.conscientiousness;
    
    return Math.min(1.0, (experience / 10000 + intelligence + conscientiousness) / 3);
  }

  private calculateResourceRisk(plan: Plan, agentState: AgentState): Promise<number> {
    return Promise.resolve(0.3); // Simplified implementation
  }

  private calculateTimeRisk(plan: Plan, agentState: AgentState): Promise<number> {
    return Promise.resolve(0.2); // Simplified implementation
  }

  private calculateSkillRisk(plan: Plan, agentState: AgentState): Promise<number> {
    return Promise.resolve(0.2); // Simplified implementation
  }

  private calculateEnvironmentalRisk(plan: Plan, agentState: AgentState): Promise<number> {
    return Promise.resolve(0.15); // Simplified implementation
  }

  private calculateSocialRisk(plan: Plan, agentState: AgentState): Promise<number> {
    return Promise.resolve(0.15); // Simplified implementation
  }

  private getRiskPenalty(riskLevel: RiskLevel): number {
    switch (riskLevel) {
      case RiskLevel.CRITICAL: return 0.4;
      case RiskLevel.HIGH: return 0.3;
      case RiskLevel.MEDIUM: return 0.2;
      case RiskLevel.LOW: return 0.1;
      default: return 0.2;
    }
  }

  private calculateSkillTimeMultiplier(agentState: AgentState): number {
    const avgSkillLevel = Object.values(agentState.cognitive.skills.skills)
      .reduce((sum, skill) => sum + skill.proficiency.overall, 0) / 
      Object.keys(agentState.cognitive.skills.skills).length;
    
    return Math.max(0.5, 2.0 - avgSkillLevel); // Higher skills = faster execution
  }

  private calculateEnvironmentalTimeMultiplier(agentState: AgentState): number {
    const multiplier = agentState.context.dimension === 'nether' ? 1.3 : 1.0;
    return multiplier;
  }

  private calculateBaseCost(plan: Plan): number {
    return plan.steps.length * 10; // Simplified cost calculation
  }

  private calculateResourceCostMultiplier(plan: Plan, agentState: AgentState): number {
    return 1.0; // Simplified implementation
  }

  private calculateSkillCostMultiplier(agentState: AgentState): number {
    const avgSkillLevel = Object.values(agentState.cognitive.skills.skills)
      .reduce((sum, skill) => sum + skill.proficiency.overall, 0) / 
      Object.keys(agentState.cognitive.skills.skills).length;
    
    return Math.max(0.7, 2.0 - avgSkillLevel); // Higher skills = lower cost
  }

  private calculateOverallFeasibility(
    skillFeasibility: FeasibilityFactor,
    resourceFeasibility: FeasibilityFactor,
    complexityFeasibility: FeasibilityFactor,
    riskAnalysis: RiskAnalysis
  ): number {
    const skillWeight = 0.3;
    const resourceWeight = 0.3;
    const complexityWeight = 0.2;
    const riskWeight = 0.2;

    const riskPenalty = riskAnalysis.overallRisk * 0.5;
    
    return Math.max(0, Math.min(1, 
      skillFeasibility.score * skillWeight +
      resourceFeasibility.score * resourceWeight +
      complexityFeasibility.score * complexityWeight +
      (1 - riskPenalty) * riskWeight
    ));
  }

  private generateFeasibilityRecommendations(
    skillFeasibility: FeasibilityFactor,
    resourceFeasibility: FeasibilityFactor,
    complexityFeasibility: FeasibilityFactor,
    riskAnalysis: RiskAnalysis
  ): string[] {
    const recommendations: string[] = [];
    
    recommendations.push(...skillFeasibility.improvements);
    recommendations.push(...resourceFeasibility.improvements);
    recommendations.push(...complexityFeasibility.improvements);
    
    if (riskAnalysis.overallRisk > 0.7) {
      recommendations.push('Consider reducing plan scope to lower risk');
    }
    
    return recommendations;
  }

  private async generateSimplerAlternative(plan: Plan, agentState: AgentState): Promise<AlternativePlan | null> {
    // Simplified implementation
    return {
      id: plan.id + '_simpler',
      description: 'Simplified version with fewer steps',
      feasibilityScore: plan.feasibilityScore * 1.1,
      riskLevel: RiskLevel.MEDIUM,
      timeEstimation: plan.estimatedDuration * 0.8,
      cost: plan.estimatedDuration * 0.9,
      blockingFactors: []
    };
  }

  private async generateResourceEfficientAlternative(plan: Plan, agentState: AgentState): Promise<AlternativePlan | null> {
    // Simplified implementation
    return {
      id: plan.id + '_efficient',
      description: 'Resource-efficient version',
      feasibilityScore: plan.feasibilityScore * 1.05,
      riskLevel: RiskLevel.MEDIUM,
      timeEstimation: plan.estimatedDuration * 1.1,
      cost: plan.estimatedDuration * 0.7,
      blockingFactors: []
    };
  }

  private async generateFasterAlternative(plan: Plan, agentState: AgentState): Promise<AlternativePlan | null> {
    // Simplified implementation
    return {
      id: plan.id + '_faster',
      description: 'Faster execution version',
      feasibilityScore: plan.feasibilityScore * 0.95,
      riskLevel: RiskLevel.HIGH,
      timeEstimation: plan.estimatedDuration * 0.6,
      cost: plan.estimatedDuration * 1.2,
      blockingFactors: []
    };
  }

  private calculateOverallRisk(criticalRisks: RiskFactor[], mitigatedRisks: RiskFactor[]): number {
    const criticalRiskSum = criticalRisks.reduce((sum, risk) => sum + risk.probability * risk.impact, 0);
    const mitigatedRiskSum = mitigatedRisks.reduce((sum, risk) => sum + risk.probability * risk.impact * (1 - risk.mitigation.effectiveness), 0);
    
    return Math.min(1.0, criticalRiskSum + mitigatedRiskSum);
  }

  private calculateResidualRisk(criticalRisks: RiskFactor[], mitigatedRisks: RiskFactor[]): number {
    const residualRiskSum = mitigatedRisks.reduce((sum, risk) => sum + risk.probability * risk.impact * (1 - risk.mitigation.effectiveness), 0);
    
    return Math.min(1.0, residualRiskSum);
  }
}

// ============================================================================
// CONFIGURATION INTERFACE
// ============================================================================

/**
 * Feasibility analyzer configuration
 */
export interface FeasibilityAnalyzerConfig {
  analysisTimeout: number;
  maxHistorySize: number;
  enableRiskAnalysis: boolean;
  enableAlternativeGeneration: boolean;
  confidenceThreshold: number;
  riskTolerance: number;
  timeBuffer: number;
  costBuffer: number;
  minSuccessProbability: number;
  skillWeight: number;
  resourceWeight: number;
  complexityWeight: number;
  riskWeight: number;
  riskFactors: {
    resource: number;
    time: number;
    skill: number;
    environmental: number;
    social: number;
  };
}