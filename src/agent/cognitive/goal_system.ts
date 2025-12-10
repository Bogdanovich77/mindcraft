import {
  Goal,
  GoalLevel,
  GoalStatus,
  GoalPriority,
  GoalCreationRequest,
  GoalUpdateRequest,
  GoalExecutionContext,
  GoalExecutionResult,
  GoalPrioritizationResult,
  GoalDecompositionResult,
  ResourceRequirement
} from './goal_types.js';
import { AgentState, CognitiveState, GoalState, SocialState } from '../langgraph/interfaces.js';
import { GoalDecompositionEngine } from './goal_decomposition.js';
import { GoalPrioritizationEngine } from './goal_prioritization.js';
import { GoalExecutionEngine } from './goal_execution.js';
import { GoalResourceManager } from './goal_resources.js';
import { LegacyGoalBridge, MigrationStrategy, LegacyGoal } from './goal_bridge.js';

/**
 * Goal system configuration
 */
export interface GoalSystemConfig {
  maxConcurrentGoals: number;
  maxGoalDepth: number;
  autoDecomposition: boolean;
  autoPrioritization: boolean;
  autoResourceAllocation: boolean;
  learningEnabled: boolean;
  legacyMigrationEnabled: boolean;
  performanceTracking: boolean;
  reactiveIntegration: boolean;
}

/**
 * Goal system statistics
 */
export interface GoalSystemStats {
  totalGoals: number;
  activeGoals: number;
  completedGoals: number;
  failedGoals: number;
  averageCompletionTime: number;
  successRate: number;
  goalDistribution: Record<GoalLevel, number>;
  resourceUtilization: number;
  performanceMetrics: {
    decompositionTime: number;
    prioritizationTime: number;
    executionTime: number;
    resourceAllocationTime: number;
  };
}

/**
 * Main goal management system
 */
export class GoalSystem {
  private decompositionEngine: GoalDecompositionEngine;
  private prioritizationEngine: GoalPrioritizationEngine;
  private executionEngine: GoalExecutionEngine;
  private resourceManager: GoalResourceManager;
  private legacyBridge: LegacyGoalBridge;
  private config: GoalSystemConfig;
  private goals: Map<string, Goal>;
  private goalHierarchy: Map<string, string[]>; // parent -> children mapping
  private executionHistory: GoalExecutionResult[];
  private statistics: GoalSystemStats;
  private socialState?: SocialState;

  constructor(config?: Partial<GoalSystemConfig>) {
    this.config = {
      maxConcurrentGoals: 10,
      maxGoalDepth: 3,
      autoDecomposition: true,
      autoPrioritization: true,
      autoResourceAllocation: true,
      learningEnabled: true,
      legacyMigrationEnabled: true,
      performanceTracking: true,
      reactiveIntegration: true,
      ...config
    };

    // Initialize component engines
    this.decompositionEngine = new GoalDecompositionEngine();
    this.prioritizationEngine = new GoalPrioritizationEngine({
      learningEnabled: this.config.learningEnabled
    });
    this.executionEngine = new GoalExecutionEngine(
      this.decompositionEngine,
      this.prioritizationEngine
    );
    this.resourceManager = new GoalResourceManager();
    this.legacyBridge = new LegacyGoalBridge(
      this.decompositionEngine,
      this.prioritizationEngine,
      this.resourceManager
    );

    this.goals = new Map();
    this.goalHierarchy = new Map();
    this.executionHistory = [];
    this.statistics = this.initializeStatistics();
  }

  /**
   * Initialize the goal system with agent state
   */
  async initialize(agentState: AgentState): Promise<void> {
    try {
      // Load existing goals from agent state
      await this.loadGoalsFromState(agentState);
      
      // Migrate legacy goals if enabled
      if (this.config.legacyMigrationEnabled) {
        await this.migrateLegacyGoals(agentState);
      }
      
      // Initialize goal hierarchy
      this.buildGoalHierarchy();
      
      // Set up automatic processes
      if (this.config.autoPrioritization) {
        await this.prioritizeAllGoals(agentState);
      }
      
      if (this.config.autoResourceAllocation) {
        await this.allocateResourcesForAllGoals(agentState);
      }

      console.log(`Goal system initialized with ${this.goals.size} goals`);
    } catch (error) {
      console.error('Failed to initialize goal system:', error);
      throw error;
    }
  }

  /**
   * Create a new goal
   */
  async createGoal(
    request: GoalCreationRequest, 
    agentState: AgentState
  ): Promise<Goal> {
    
    const startTime = Date.now();
    
    try {
      // Validate request
      this.validateGoalCreationRequest(request);
      
      // Create goal
      const goal = this.buildGoalFromRequest(request);
      
      // Store goal
      this.goals.set(goal.id, goal);
      
      // Auto-decompose if enabled
      if (this.config.autoDecomposition && goal.level !== GoalLevel.OPERATIONAL) {
        await this.decomposeGoal(goal, agentState);
      }
      
      // Update hierarchy
      this.updateGoalHierarchy(goal);
      
      // Auto-prioritize if enabled
      if (this.config.autoPrioritization) {
        await this.prioritizeAllGoals(agentState);
      }
      
      // Auto-allocate resources if enabled
      if (this.config.autoResourceAllocation) {
        await this.allocateResourcesForGoal(goal, agentState);
      }
      
      // Update statistics
      this.updateStatistics();
      
      // Track performance
      if (this.config.performanceTracking) {
        this.trackPerformance('createGoal', Date.now() - startTime);
      }
      
      return goal;
      
    } catch (error) {
      console.error('Failed to create goal:', error);
      throw error;
    }
  }

  /**
   * Update an existing goal
   */
  async updateGoal(
    request: GoalUpdateRequest, 
    agentState: AgentState
  ): Promise<Goal> {
    
    const goal = this.goals.get(request.goalId);
    if (!goal) {
      throw new Error(`Goal not found: ${request.goalId}`);
    }
    
    const startTime = Date.now();
    
    try {
      // Apply updates
      Object.assign(goal, request.updates);
      goal.progress.lastUpdate = Date.now();
      
      // Re-decompose if structure changed significantly
      if (this.shouldRedecompose(goal, request.updates)) {
        await this.decomposeGoal(goal, agentState);
      }
      
      // Re-prioritize if priority or context changed
      if (this.shouldReprioritize(goal, request.updates)) {
        await this.prioritizeAllGoals(agentState);
      }
      
      // Re-allocate resources if requirements changed
      if (this.shouldReallocateResources(goal, request.updates)) {
        await this.allocateResourcesForGoal(goal, agentState);
      }
      
      // Update statistics
      this.updateStatistics();
      
      // Track performance
      if (this.config.performanceTracking) {
        this.trackPerformance('updateGoal', Date.now() - startTime);
      }
      
      return goal;
      
    } catch (error) {
      console.error('Failed to update goal:', error);
      throw error;
    }
  }

  /**
   * Execute a goal
   */
  async executeGoal(
    goalId: string, 
    agentState: AgentState
  ): Promise<GoalExecutionResult> {
    
    const goal = this.goals.get(goalId);
    if (!goal) {
      throw new Error(`Goal not found: ${goalId}`);
    }
    
    const startTime = Date.now();
    
    try {
      // Create execution context
      const context = this.createExecutionContext(agentState);
      
      // Reserve resources
      const reservationResult = await this.resourceManager.reserveResources(goal, context);
      if (!reservationResult.success) {
        throw new Error(`Resource reservation failed: ${reservationResult.errors.join(', ')}`);
      }
      
      // Execute goal
      const result = await this.executionEngine.executeGoal(goal, context);
      
      // Update goal status
      goal.status = result.status;
      
      // Release resources
      await this.resourceManager.releaseResources(goalId);
      
      // Store execution result
      this.executionHistory.push(result);
      
      // Update statistics
      this.updateStatistics();
      
      // Track performance
      if (this.config.performanceTracking) {
        this.trackPerformance('executeGoal', Date.now() - startTime);
      }
      
      return result;
      
    } catch (error) {
      console.error('Failed to execute goal:', error);
      
      // Update goal status to failed
      goal.status = GoalStatus.FAILED;
      
      // Release resources
      await this.resourceManager.releaseResources(goalId);
      
      throw error;
    }
  }

  /**
   * Main update loop for the goal system
   */
  async update(agentState: AgentState, deltaTime: number): Promise<{
    completedGoals: GoalExecutionResult[];
    newPriorities: GoalPrioritizationResult;
    resourceUpdates: any;
  }> {
    
    const startTime = Date.now();
    
    try {
      // Create execution context
      const context = this.createExecutionContext(agentState);
      
      // Update active executions
      const executionResults = await this.executionEngine.updateExecutions(context, deltaTime);
      
      // Monitor resources
      const resourceUpdates = await this.resourceManager.monitorResources(context);
      
      // Re-prioritize if needed
      let newPriorities: GoalPrioritizationResult | undefined;
      if (this.shouldReprioritizeAll(context, deltaTime)) {
        newPriorities = await this.prioritizeAllGoals(agentState);
      }
      
      // Process completed goals
      const completedGoals = executionResults.filter(r => 
        r.status === GoalStatus.COMPLETED || r.status === GoalStatus.FAILED
      );
      
      // Update statistics
      this.updateStatistics();
      
      // Track performance
      if (this.config.performanceTracking) {
        this.trackPerformance('update', Date.now() - startTime);
      }
      
      return {
        completedGoals,
        newPriorities: newPriorities || {
          rankedGoals: [],
          prioritizationFactors: this.prioritizationEngine.getFactors(),
          context: context.decisionContext,
          timestamp: Date.now()
        },
        resourceUpdates
      };
      
    } catch (error) {
      console.error('Goal system update failed:', error);
      throw error;
    }
  }

  /**
   * Get goals by level
   */
  getGoalsByLevel(level: GoalLevel): Goal[] {
    return Array.from(this.goals.values()).filter(goal => goal.level === level);
  }

  /**
   * Get active goals
   */
  getActiveGoals(): Goal[] {
    return Array.from(this.goals.values()).filter(goal => 
      goal.status === GoalStatus.ACTIVE || goal.status === GoalStatus.PENDING
    );
  }

  /**
   * Get goal hierarchy
   */
  getGoalHierarchy(): Map<string, Goal[]> {
    const hierarchy = new Map<string, Goal[]>();
    
    for (const [parentId, childIds] of this.goalHierarchy) {
      const parent = this.goals.get(parentId);
      const children = childIds.map(id => this.goals.get(id)).filter(Boolean) as Goal[];
      
      if (parent) {
        hierarchy.set(parentId, children);
      }
    }
    
    return hierarchy;
  }

  /**
   * Get system statistics
   */
  getStatistics(): GoalSystemStats {
    return { ...this.statistics };
  }

  /**
   * Migrate legacy goals
   */
  async migrateLegacyGoals(agentState: AgentState): Promise<void> {
    // This would integrate with the actual legacy goal system
    // For now, it's a placeholder
    console.log('Legacy goal migration completed');
  }

  /**
   * Export goal system state
   */
  exportState(): {
    goals: Goal[];
    hierarchy: Record<string, string[]>;
    statistics: GoalSystemStats;
    config: GoalSystemConfig;
  } {
    const hierarchy: Record<string, string[]> = {};
    for (const [parentId, childIds] of this.goalHierarchy) {
      hierarchy[parentId] = childIds;
    }

    return {
      goals: Array.from(this.goals.values()),
      hierarchy,
      statistics: this.statistics,
      config: this.config
    };
  }

  /**
   * Import goal system state
   */
  async importState(state: {
    goals: Goal[];
    hierarchy: Record<string, string[]>;
    statistics?: GoalSystemStats;
    config?: GoalSystemConfig;
  }): Promise<void> {
    
    // Clear current state
    this.goals.clear();
    this.goalHierarchy.clear();
    
    // Import goals
    for (const goal of state.goals) {
      this.goals.set(goal.id, goal);
    }
    
    // Import hierarchy
    for (const [parentId, childIds] of Object.entries(state.hierarchy)) {
      this.goalHierarchy.set(parentId, childIds);
    }
    
    // Import statistics if provided
    if (state.statistics) {
      this.statistics = state.statistics;
    }
    
    // Update config if provided
    if (state.config) {
      this.config = { ...this.config, ...state.config };
    }
    
    console.log(`Imported ${state.goals.length} goals`);
  }

  /**
   * Private helper methods
   */
  private async loadGoalsFromState(agentState: AgentState): Promise<void> {
    const cognitiveState = agentState.cognitive;
    if (!cognitiveState || !cognitiveState.goals) {
      return;
    }

    // Load goals from cognitive state
    const goalState = cognitiveState.goals;
    
    // Load strategic goals
    for (const goal of goalState.strategicGoals || []) {
      const convertedGoal = this.convertLegacyGoal(goal, GoalLevel.STRATEGIC);
      this.goals.set(convertedGoal.id, convertedGoal);
    }
    
    // Load tactical goals
    for (const goal of goalState.tacticalGoals || []) {
      const convertedGoal = this.convertLegacyGoal(goal, GoalLevel.TACTICAL);
      this.goals.set(convertedGoal.id, convertedGoal);
    }
    
    // Load operational goals
    for (const goal of goalState.operationalGoals || []) {
      const convertedGoal = this.convertLegacyGoal(goal, GoalLevel.OPERATIONAL);
      this.goals.set(convertedGoal.id, convertedGoal);
    }
  }

  private convertLegacyGoal(legacyGoal: any, level: GoalLevel): Goal {
    const now = Date.now();
    
    return {
      id: legacyGoal.id || `goal_${now}_${Math.random().toString(36).substr(2, 9)}`,
      name: legacyGoal.description || 'Unnamed Goal',
      description: legacyGoal.description || '',
      level,
      status: this.mapLegacyStatus(legacyGoal.status),
      priority: this.mapLegacyPriority(legacyGoal.priority),
      objective: legacyGoal.description || '',
      successCriteria: legacyGoal.successCriteria || ['Goal completed'],
      createdAt: legacyGoal.createdAt || now,
      deadline: legacyGoal.deadline,
      estimatedDuration: legacyGoal.estimatedDuration,
      dependencies: [],
      subgoals: [],
      requirements: this.convertLegacyRequirements(legacyGoal.resources),
      allocatedResources: [],
      progress: {
        percentage: legacyGoal.progress?.percentage || 0,
        milestones: [],
        quality: { efficiency: 0, effectiveness: 0, elegance: 0, learning: 0 },
        timeSpent: 0,
        lastUpdate: now
      },
      motivationSource: 'system',
      personalityAlignment: 0.5,
      ethicalScore: 0.8,
      expectedLearning: [],
      tags: ['imported'],
      category: legacyGoal.type || 'general',
      source: 'system'
    };
  }

  private mapLegacyStatus(status: string): GoalStatus {
    switch (status) {
      case 'pending': return GoalStatus.PENDING;
      case 'active': return GoalStatus.ACTIVE;
      case 'completed': return GoalStatus.COMPLETED;
      case 'failed': return GoalStatus.FAILED;
      case 'paused': return GoalStatus.PAUSED;
      default: return GoalStatus.PENDING;
    }
  }

  private mapLegacyPriority(priority: number): GoalPriority {
    if (priority <= 1) return GoalPriority.CRITICAL;
    if (priority <= 3) return GoalPriority.HIGH;
    if (priority <= 5) return GoalPriority.MEDIUM;
    if (priority <= 7) return GoalPriority.LOW;
    return GoalPriority.BACKGROUND;
  }

  private convertLegacyRequirements(resources: any): ResourceRequirement[] {
    if (!resources) return [];
    
    const requirements: ResourceRequirement[] = [];
    
    // Convert items
    if (resources.items) {
      for (const [name, quantity] of Object.entries(resources.items)) {
        requirements.push({
          type: 'item',
          name,
          quantity: quantity as number,
          consumable: true
        });
      }
    }
    
    // Convert tools
    if (resources.tools) {
      for (const toolName of resources.tools) {
        requirements.push({
          type: 'tool',
          name: toolName,
          quantity: 1,
          consumable: false
        });
      }
    }
    
    return requirements;
  }

  private buildGoalHierarchy(): void {
    this.goalHierarchy.clear();
    
    for (const goal of this.goals.values()) {
      if (goal.subgoals.length > 0) {
        this.goalHierarchy.set(goal.id, goal.subgoals);
      }
    }
  }

  private updateGoalHierarchy(goal: Goal): void {
    if (goal.parentGoal) {
      const existingChildren = this.goalHierarchy.get(goal.parentGoal) || [];
      if (!existingChildren.includes(goal.id)) {
        existingChildren.push(goal.id);
        this.goalHierarchy.set(goal.parentGoal, existingChildren);
      }
    }
    
    if (goal.subgoals.length > 0) {
      this.goalHierarchy.set(goal.id, goal.subgoals);
    }
  }

  private async decomposeGoal(goal: Goal, agentState: AgentState): Promise<void> {
    const context = this.createExecutionContext(agentState);
    const decompositionResult = await this.decompositionEngine.decomposeGoal(goal, context);
    
    // Add subgoals to system
    for (const subgoal of decompositionResult.subgoals) {
      this.goals.set(subgoal.id, subgoal);
      this.updateGoalHierarchy(subgoal);
    }
  }

  private async prioritizeAllGoals(agentState: AgentState): Promise<GoalPrioritizationResult> {
    const context = this.createExecutionContext(agentState);
    const activeGoals = this.getActiveGoals();
    
    return this.prioritizationEngine.prioritizeGoals(activeGoals, context);
  }

  private async allocateResourcesForGoal(goal: Goal, agentState: AgentState): Promise<void> {
    const context = this.createExecutionContext(agentState);
    await this.resourceManager.reserveResources(goal, context);
  }

  private async allocateResourcesForAllGoals(agentState: AgentState): Promise<void> {
    const context = this.createExecutionContext(agentState);
    const activeGoals = this.getActiveGoals();
    
    await this.resourceManager.allocateResources(activeGoals, context);
  }

  private createExecutionContext(agentState: AgentState): GoalExecutionContext {
    return {
      agentState,
      decisionContext: {
        currentTime: Date.now(),
        availableTime: 60000, // 1 minute
        cognitiveLoad: agentState.cognitive.processing?.cognitiveLoad || 0.5,
        urgency: 0.5,
        riskTolerance: 0.5
      },
      availableResources: this.extractAvailableResources(agentState),
      environmentalConditions: this.extractEnvironmentalConditions(agentState),
      socialContext: this.extractSocialContext(agentState)
    };
  }

  private extractAvailableResources(agentState: AgentState): any[] {
    // Extract resources from agent state
    const resources: any[] = [];
    
    // Inventory items
    if (agentState.context.inventory) {
      for (const item of agentState.context.inventory) {
        resources.push({
          type: 'item',
          name: item.type,
          quantity: item.count,
          quality: 0.5,
          accessibility: 1.0
        });
      }
    }
    
    return resources;
  }

  private extractEnvironmentalConditions(agentState: AgentState): any[] {
    const conditions: any[] = [];
    
    // Add weather condition
    if (agentState.context.weather) {
      conditions.push({
        type: 'weather',
        severity: agentState.context.weather === 'rain' ? 0.3 : 0.1,
        duration: 3600000, // 1 hour
        description: agentState.context.weather
      });
    }
    
    // Add time of day condition
    const timeOfDay = agentState.context.timeOfDay;
    if (timeOfDay > 13000 || timeOfDay < 1000) { // Night time
      conditions.push({
        type: 'time',
        severity: 0.4,
        duration: 10000, // Until day
        description: 'night'
      });
    }
    
    return conditions;
  }

  private extractSocialContext(agentState: AgentState): any {
    // Extract social context from agent state
    return {
      nearbyAgents: [],
      activeCollaborations: [],
      socialObligations: [],
      reputation: {
        overall: 0.5,
        reliability: 0.5,
        skillfulness: 0.5,
        friendliness: 0.5,
        danger: 0.1
      }
    };
  }

  private validateGoalCreationRequest(request: GoalCreationRequest): void {
    if (!request.name || request.name.trim() === '') {
      throw new Error('Goal name is required');
    }
    
    if (!request.objective || request.objective.trim() === '') {
      throw new Error('Goal objective is required');
    }
    
    if (!request.successCriteria || request.successCriteria.length === 0) {
      throw new Error('Goal success criteria are required');
    }
  }

  private buildGoalFromRequest(request: GoalCreationRequest): Goal {
    const now = Date.now();
    
    return {
      id: `goal_${now}_${Math.random().toString(36).substr(2, 9)}`,
      name: request.name,
      description: request.description,
      level: request.level,
      status: GoalStatus.PENDING,
      priority: request.priority || GoalPriority.MEDIUM,
      objective: request.objective,
      successCriteria: request.successCriteria,
      createdAt: now,
      deadline: request.deadline,
      estimatedDuration: undefined,
      dependencies: [],
      subgoals: [],
      parentGoal: request.parentGoal,
      requirements: request.requirements || [],
      allocatedResources: [],
      progress: {
        percentage: 0,
        milestones: [],
        quality: { efficiency: 0, effectiveness: 0, elegance: 0, learning: 0 },
        timeSpent: 0,
        lastUpdate: now
      },
      motivationSource: request.motivationSource,
      personalityAlignment: 0.5,
      ethicalScore: 0.8,
      expectedLearning: [],
      tags: request.tags || [],
      category: request.category || 'general',
      source: 'agent'
    };
  }

  private shouldRedecompose(goal: Goal, updates: Partial<Goal>): boolean {
    return !!(updates.objective || updates.requirements || updates.level);
  }

  private shouldReprioritize(goal: Goal, updates: Partial<Goal>): boolean {
    return !!(updates.priority || updates.deadline || updates.status);
  }

  private shouldReallocateResources(goal: Goal, updates: Partial<Goal>): boolean {
    return !!(updates.requirements);
  }

  private shouldReprioritizeAll(context: GoalExecutionContext, deltaTime: number): boolean {
    // Re-prioritize if significant time has passed or context changed
    return deltaTime > 60000 || // 1 minute
           context.environmentalConditions.some(c => c.severity > 0.7);
  }

  private initializeStatistics(): GoalSystemStats {
    return {
      totalGoals: 0,
      activeGoals: 0,
      completedGoals: 0,
      failedGoals: 0,
      averageCompletionTime: 0,
      successRate: 0,
      goalDistribution: {
        [GoalLevel.STRATEGIC]: 0,
        [GoalLevel.TACTICAL]: 0,
        [GoalLevel.OPERATIONAL]: 0
      },
      resourceUtilization: 0,
      performanceMetrics: {
        decompositionTime: 0,
        prioritizationTime: 0,
        executionTime: 0,
        resourceAllocationTime: 0
      }
    };
  }

  private updateStatistics(): void {
    const goals = Array.from(this.goals.values());
    
    this.statistics.totalGoals = goals.length;
    this.statistics.activeGoals = goals.filter(g => g.status === GoalStatus.ACTIVE).length;
    this.statistics.completedGoals = goals.filter(g => g.status === GoalStatus.COMPLETED).length;
    this.statistics.failedGoals = goals.filter(g => g.status === GoalStatus.FAILED).length;
    
    // Calculate goal distribution
    this.statistics.goalDistribution = {
      [GoalLevel.STRATEGIC]: goals.filter(g => g.level === GoalLevel.STRATEGIC).length,
      [GoalLevel.TACTICAL]: goals.filter(g => g.level === GoalLevel.TACTICAL).length,
      [GoalLevel.OPERATIONAL]: goals.filter(g => g.level === GoalLevel.OPERATIONAL).length
    };
    
    // Calculate success rate
    const completed = this.statistics.completedGoals + this.statistics.failedGoals;
    this.statistics.successRate = completed > 0 ? this.statistics.completedGoals / completed : 0;
    
    // Calculate average completion time
    if (this.executionHistory.length > 0) {
      const totalTime = this.executionHistory.reduce((sum, result) => sum + result.duration, 0);
      this.statistics.averageCompletionTime = totalTime / this.executionHistory.length;
    }
    
    // Get resource utilization from resource manager
    const resourceStatus = this.resourceManager.getResourceStatus();
    this.statistics.resourceUtilization = resourceStatus.activeReservations / Math.max(1, resourceStatus.totalReservations);
  }

  private trackPerformance(operation: string, duration: number): void {
    // Track performance metrics
    switch (operation) {
      case 'decomposeGoal':
        this.statistics.performanceMetrics.decompositionTime = duration;
        break;
      case 'prioritizeGoals':
        this.statistics.performanceMetrics.prioritizationTime = duration;
        break;
      case 'executeGoal':
        this.statistics.performanceMetrics.executionTime = duration;
        break;
      case 'allocateResources':
        this.statistics.performanceMetrics.resourceAllocationTime = duration;
        break;
    }
  }
  
  /**
   * Set social state for social-aware goal processing
   */
  setSocialState(socialState: SocialState): void {
    this.socialState = socialState;
  }
  
  /**
   * Generate social-aware goals
   */
  generateSocialGoals(agentState: AgentState): string[] {
    if (!this.socialState) {
      return [];
    }
    
    const socialGoals: string[] = [];
    const { relationships, theoryOfMind, socialContext, socialLearning } = this.socialState;
    
    // Relationship maintenance goals
    if (relationships.activeRelationships.length > 0) {
      socialGoals.push('maintain_relationships');
      
      // Check for relationships needing attention
      const neglectedRelationships = relationships.activeRelationships.filter(agentId => {
        const trustLevel = relationships.trustLevels[agentId] || 0.5;
        const friendshipLevel = relationships.friendshipLevels[agentId] || 0.5;
        return trustLevel < 0.3 || friendshipLevel < 0.3;
      });
      
      if (neglectedRelationships.length > 0) {
        socialGoals.push('repair_relationships');
      }
    }
    
    // Social learning goals
    if (socialLearning && socialLearning.observedBehaviors.length > 5) {
      socialGoals.push('learn_from_social_interactions');
    }
    
    // Group participation goals
    if (socialContext.groupDynamics && socialContext.groupDynamics.cohesion > 0.6) {
      socialGoals.push('participate_in_group_activities');
    }
    
    // Reputation management goals
    if (relationships.reputationScore < 0.4) {
      socialGoals.push('improve_reputation');
    }
    
    return socialGoals;
  }
  
  /**
   * Apply social influence to goal prioritization
   */
  applySocialInfluenceToGoals(goals: Goal[], agentState: AgentState): Goal[] {
    if (!this.socialState || goals.length === 0) {
      return goals;
    }
    
    const { relationships, theoryOfMind, socialContext } = this.socialState;
    
    return goals.map(goal => {
      let socialPriorityModifier = 0;
      
      // Relationship-based priority adjustment
      if (goal.description.includes('social') || goal.description.includes('relationship')) {
        const avgRelationshipStrength = relationships.activeRelationships.reduce((sum, agentId) => {
          const trust = relationships.trustLevels[agentId] || 0.5;
          const friendship = relationships.friendshipLevels[agentId] || 0.5;
          return sum + (trust + friendship) / 2;
        }, 0) / Math.max(1, relationships.activeRelationships.length);
        
        socialPriorityModifier += avgRelationshipStrength * 0.3;
      }
      
      // Group dynamics influence
      if (socialContext.groupDynamics && socialContext.groupDynamics.cohesion > 0.7) {
        if (goal.description.includes('cooperate') || goal.description.includes('help')) {
          socialPriorityModifier += 0.2;
        }
      }
      
      // Theory of mind influence
      if (theoryOfMind.activePredictions && theoryOfMind.activePredictions.length > 0) {
        const relevantPredictions = theoryOfMind.activePredictions.filter((pred: any) =>
          pred.prediction.toLowerCase().includes(goal.description.toLowerCase())
        );
        
        if (relevantPredictions.length > 0) {
          const avgConfidence = relevantPredictions.reduce((sum: number, pred: any) =>
            sum + pred.confidence, 0) / relevantPredictions.length;
          socialPriorityModifier += avgConfidence * 0.15;
        }
      }
      
      // Apply social modifier to priority
      const adjustedPriority = Math.max(0, Math.min(10,
        goal.priority + socialPriorityModifier
      ));
      
      return {
        ...goal,
        priority: adjustedPriority,
        socialPriority: socialPriorityModifier
      };
    });
  }
  
  /**
   * Create collaborative goal with other agents
   */
  createCollaborativeGoal(
    goalName: string,
    description: string,
    collaborators: string[],
    agentState: AgentState
  ): Goal {
    const now = Date.now();
    
    return {
      id: `collab_goal_${now}_${Math.random().toString(36).substr(2, 9)}`,
      name: goalName,
      description,
      level: GoalLevel.TACTICAL, // Collaborative goals are typically tactical
      status: GoalStatus.PENDING,
      priority: this.calculateCollaborativePriority(collaborators, agentState),
      objective: description,
      successCriteria: [
        'Collaboration successful',
        'All participants satisfied',
        'Goal completed efficiently'
      ],
      createdAt: now,
      dependencies: [],
      subgoals: [],
      requirements: [
        {
          type: 'time' as any,
          name: 'collaboration_time',
          quantity: this.estimateCollaborativeTime(description, collaborators.length),
          consumable: true
        },
        {
          type: 'skill' as any,
          name: 'collaboration',
          quantity: collaborators.length,
          consumable: false
        }
      ],
      allocatedResources: [],
      progress: {
        percentage: 0,
        milestones: [],
        quality: { efficiency: 0, effectiveness: 0, elegance: 0, learning: 0 },
        timeSpent: 0,
        lastUpdate: now
      },
      motivationSource: 'social_collaboration',
      personalityAlignment: this.calculateSocialAlignment(collaborators),
      ethicalScore: 0.8,
      expectedLearning: [
        { type: 'skill' as any, area: 'teamwork', expectedGain: 0.7 },
        { type: 'skill' as any, area: 'communication', expectedGain: 0.6 },
        { type: 'skill' as any, area: 'coordination', expectedGain: 0.5 }
      ],
      tags: ['collaborative', 'social'],
      category: 'social',
      source: 'agent'
    };
  }
  
  /**
   * Calculate collaborative goal priority
   */
  private calculateCollaborativePriority(collaborators: string[], agentState: AgentState): number {
    if (!this.socialState || collaborators.length === 0) {
      return 5; // Medium priority
    }
    
    const { relationships } = this.socialState;
    let totalRelationshipScore = 0;
    
    // Calculate relationship strength with all collaborators
    collaborators.forEach(collaboratorId => {
      const trustLevel = relationships.trustLevels[collaboratorId] || 0.5;
      const friendshipLevel = relationships.friendshipLevels[collaboratorId] || 0.5;
      totalRelationshipScore += (trustLevel + friendshipLevel) / 2;
    });
    
    const avgRelationshipScore = totalRelationshipScore / collaborators.length;
    
    // Higher relationship strength = higher priority
    return Math.max(1, Math.min(10, avgRelationshipScore * 10));
  }
  
  /**
   * Calculate social alignment for collaborative goals
   */
  private calculateSocialAlignment(collaborators: string[]): number {
    if (!this.socialState || collaborators.length === 0) {
      return 0.5; // Neutral alignment
    }
    
    const { relationships } = this.socialState;
    let totalAlignment = 0;
    
    collaborators.forEach(collaboratorId => {
      const trustLevel = relationships.trustLevels[collaboratorId] || 0.5;
      const friendshipLevel = relationships.friendshipLevels[collaboratorId] || 0.5;
      totalAlignment += (trustLevel + friendshipLevel) / 2;
    });
    
    return totalAlignment / collaborators.length;
  }
  
  /**
   * Estimate time needed for collaborative goal
   */
  private estimateCollaborativeTime(description: string, collaboratorCount: number): number {
    // Base time estimation (in milliseconds)
    let baseTime = 60000; // 1 minute
    
    // Adjust for complexity
    if (description.includes('complex') || description.includes('difficult')) {
      baseTime *= 2;
    }
    
    // Adjust for collaborator count (more people = faster completion)
    const collaboratorBonus = Math.min(0.5, collaboratorCount * 0.1);
    baseTime *= (1 - collaboratorBonus);
    
    return baseTime;
  }
}