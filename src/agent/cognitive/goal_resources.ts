import { 
  Goal, 
  GoalStatus, 
  ResourceRequirement, 
  ResourceAllocation,
  AvailableResource,
  GoalExecutionContext,
  ExecutionError
} from './goal_types.js';
import { AgentState } from '../langgraph/interfaces.js';

/**
 * Resource types for goal management
 */
export enum ResourceType {
  ITEM = 'item',           // Physical items (blocks, tools, materials)
  TOOL = 'tool',           // Tools and equipment
  SKILL = 'skill',         // Skills and capabilities
  TIME = 'time',           // Time resources
  LOCATION = 'location',   // Location-specific resources
  ENERGY = 'energy',       // Energy/stamina resources
  SOCIAL = 'social',       // Social resources (help from others)
  INFORMATION = 'information' // Knowledge and information
}

/**
 * Resource priority levels
 */
export enum ResourcePriority {
  CRITICAL = 0,    // Essential for goal completion
  HIGH = 1,        // Very important
  MEDIUM = 2,      // Moderately important
  LOW = 3,         // Nice to have
  OPTIONAL = 4     // Can be substituted or skipped
}

/**
 * Resource allocation strategies
 */
export enum AllocationStrategy {
  FIRST_COME_FIRST_SERVED = 'first_come_first_served',
  PRIORITY_BASED = 'priority_based',
  EFFICIENCY_MAXIMIZATION = 'efficiency_maximization',
  FAIR_DISTRIBUTION = 'fair_distribution',
  OPPORTUNISTIC = 'opportunistic',
  CONSERVATIVE = 'conservative'
}

/**
 * Resource reservation status
 */
export enum ReservationStatus {
  PENDING = 'pending',
  RESERVED = 'reserved',
  ALLOCATED = 'allocated',
  CONSUMED = 'consumed',
  RELEASED = 'released',
  EXPIRED = 'expired'
}

/**
 * Resource reservation
 */
export interface ResourceReservation {
  id: string;
  goalId: string;
  resourceType: ResourceType;
  resourceName: string;
  quantity: number;
  quality: number;
  priority: ResourcePriority;
  status: ReservationStatus;
  createdAt: number;
  expiresAt?: number;
  allocatedAt?: number;
  consumedAt?: number;
  conditions: string[]; // Conditions for maintaining reservation
  alternatives: ResourceRequirement[]; // Alternative resources if primary unavailable
}

/**
 * Resource scarcity assessment
 */
export interface ResourceScarcity {
  resourceType: ResourceType;
  resourceName: string;
  scarcityLevel: number; // 0-1, 1 = extremely scarce
  estimatedAvailability: number;
  replenishmentRate: number;
  alternativeResources: string[];
  acquisitionDifficulty: number; // 0-1
}

/**
 * Resource optimization result
 */
export interface ResourceOptimizationResult {
  originalRequirements: ResourceRequirement[];
  optimizedRequirements: ResourceRequirement[];
  savings: {
    quantity: number;
    cost: number;
    time: number;
  };
  substitutions: Array<{
    original: ResourceRequirement;
    substitute: ResourceRequirement;
    efficiency: number;
  }>;
  confidence: number;
}

/**
 * Goal resource manager
 */
export class GoalResourceManager {
  private reservations: Map<string, ResourceReservation>;
  private allocationStrategy: AllocationStrategy;
  private scarcityCache: Map<string, ResourceScarcity>;
  private resourceOptimizer: ResourceOptimizer;
  private acquisitionPlanner: ResourceAcquisitionPlanner;

  constructor(allocationStrategy: AllocationStrategy = AllocationStrategy.PRIORITY_BASED) {
    this.reservations = new Map();
    this.allocationStrategy = allocationStrategy;
    this.scarcityCache = new Map();
    this.resourceOptimizer = new ResourceOptimizer();
    this.acquisitionPlanner = new ResourceAcquisitionPlanner();
  }

  /**
   * Assess resource availability for a goal
   */
  async assessResourceAvailability(
    goal: Goal, 
    context: GoalExecutionContext
  ): Promise<{
    available: AvailableResource[];
    missing: ResourceRequirement[];
    scarce: ResourceRequirement[];
    alternatives: Array<{
      original: ResourceRequirement;
      alternatives: ResourceRequirement[];
    }>;
  }> {
    
    const available: AvailableResource[] = [];
    const missing: ResourceRequirement[] = [];
    const scarce: ResourceRequirement[] = [];
    const alternatives: Array<{ original: ResourceRequirement; alternatives: ResourceRequirement[] }> = [];

    for (const requirement of goal.requirements) {
      const availableResource = this.findAvailableResource(requirement, context.availableResources);
      
      if (availableResource) {
        available.push(availableResource);
        
        // Check if quantity is sufficient
        if (availableResource.quantity < requirement.quantity) {
          scarce.push(requirement);
        }
      } else {
        missing.push(requirement);
        
        // Find alternatives
        const resourceAlternatives = await this.findAlternatives(requirement, context);
        if (resourceAlternatives.length > 0) {
          alternatives.push({
            original: requirement,
            alternatives: resourceAlternatives
          });
        }
      }
    }

    return { available, missing, scarce, alternatives };
  }

  /**
   * Reserve resources for a goal
   */
  async reserveResources(
    goal: Goal, 
    context: GoalExecutionContext
  ): Promise<{
    success: boolean;
    reservations: ResourceReservation[];
    errors: ExecutionError[];
  }> {
    
    const reservations: ResourceReservation[] = [];
    const errors: ExecutionError[] = [];

    try {
      // Check resource availability
      const availability = await this.assessResourceAvailability(goal, context);
      
      // Handle missing critical resources
      for (const missing of availability.missing) {
        if (this.isCriticalResource(missing)) {
          errors.push({
            type: 'resource',
            severity: 'critical',
            message: `Critical resource missing: ${missing.name}`,
            timestamp: Date.now(),
            resolved: false
          });
        }
      }

      // Create reservations for available resources
      for (const available of availability.available) {
        const reservation = await this.createReservation(goal, available, context);
        if (reservation) {
          reservations.push(reservation);
        }
      }

      // Handle scarce resources
      for (const scarce of availability.scarce) {
        const partialReservation = await this.createPartialReservation(goal, scarce, context);
        if (partialReservation) {
          reservations.push(partialReservation);
        }
      }

      // Update goal with allocated resources
      goal.allocatedResources = reservations.map(r => ({
        requirement: this.requirementFromReservation(r),
        allocated: r.quantity,
        efficiency: this.calculateAllocationEfficiency(r, context),
        reservationExpiry: r.expiresAt
      }));

      return {
        success: errors.length === 0,
        reservations,
        errors
      };

    } catch (error) {
      errors.push({
        type: 'resource',
        severity: 'high',
        message: `Resource reservation failed: ${(error as Error).message}`,
        timestamp: Date.now(),
        resolved: false
      });

      // Clean up any partial reservations
      await this.releaseReservations(reservations.map(r => r.id));

      return {
        success: false,
        reservations: [],
        errors
      };
    }
  }

  /**
   * Allocate resources based on strategy
   */
  async allocateResources(
    goals: Goal[], 
    context: GoalExecutionContext
  ): Promise<{
    allocations: Map<string, ResourceAllocation[]>;
    conflicts: Array<{
      resource: string;
      competingGoals: string[];
      resolution: string;
    }>;
  }> {
    
    const allocations = new Map<string, ResourceAllocation[]>();
    const conflicts: Array<{ resource: string; competingGoals: string[]; resolution: string }> = [];

    switch (this.allocationStrategy) {
      case AllocationStrategy.PRIORITY_BASED:
        return this.allocateByPriority(goals, context);
      
      case AllocationStrategy.EFFICIENCY_MAXIMIZATION:
        return this.allocateForEfficiency(goals, context);
      
      case AllocationStrategy.FAIR_DISTRIBUTION:
        return this.allocateFairly(goals, context);
      
      case AllocationStrategy.OPPORTUNISTIC:
        return this.allocateOpportunistically(goals, context);
      
      case AllocationStrategy.CONSERVATIVE:
        return this.allocateConservatively(goals, context);
      
      default:
        return this.allocateByPriority(goals, context);
    }
  }

  /**
   * Optimize resource requirements for a goal
   */
  async optimizeResources(
    goal: Goal, 
    context: GoalExecutionContext
  ): Promise<ResourceOptimizationResult> {
    
    return this.resourceOptimizer.optimize(goal.requirements, context);
  }

  /**
   * Plan resource acquisition for missing resources
   */
  async planResourceAcquisition(
    goal: Goal, 
    missingResources: ResourceRequirement[], 
    context: GoalExecutionContext
  ): Promise<{
    acquisitionPlans: Array<{
      resource: ResourceRequirement;
      plan: AcquisitionPlan;
      priority: number;
      estimatedTime: number;
    }>;
    totalEstimatedTime: number;
    totalEstimatedCost: number;
  }> {
    
    const plans = [];
    let totalTime = 0;
    let totalCost = 0;

    for (const resource of missingResources) {
      const plan = await this.acquisitionPlanner.createPlan(resource, context);
      const priority = this.calculateAcquisitionPriority(resource, goal);
      
      plans.push({
        resource,
        plan,
        priority,
        estimatedTime: plan.estimatedTime
      });
      
      totalTime += plan.estimatedTime;
      totalCost += plan.estimatedCost;
    }

    return {
      acquisitionPlans: plans,
      totalEstimatedTime: totalTime,
      totalEstimatedCost: totalCost
    };
  }

  /**
   * Monitor resource usage and availability
   */
  async monitorResources(
    context: GoalExecutionContext
  ): Promise<{
    scarcityAlerts: ResourceScarcity[];
    expiringReservations: ResourceReservation[];
    usageEfficiency: Record<string, number>;
    recommendations: string[];
  }> {
    
    const scarcityAlerts: ResourceScarcity[] = [];
    const expiringReservations: ResourceReservation[] = [];
    const usageEfficiency: Record<string, number> = {};
    const recommendations: string[] = [];

    // Check for resource scarcity
    for (const resource of context.availableResources) {
      const scarcity = await this.assessScarcity(resource, context);
      if (scarcity.scarcityLevel > 0.7) {
        scarcityAlerts.push(scarcity);
        recommendations.push(`Acquire more ${resource.name} - scarcity level: ${scarcity.scarcityLevel.toFixed(2)}`);
      }
    }

    // Check for expiring reservations
    const now = Date.now();
    for (const reservation of this.reservations.values()) {
      if (reservation.expiresAt && reservation.expiresAt - now < (60 * 60 * 1000)) { // 1 hour
        expiringReservations.push(reservation);
        recommendations.push(`Reservation for ${reservation.resourceName} expires soon`);
      }
    }

    // Calculate usage efficiency
    for (const [resourceName, amount] of this.calculateResourceUsage(context)) {
      usageEfficiency[resourceName] = amount;
    }

    return {
      scarcityAlerts,
      expiringReservations,
      usageEfficiency,
      recommendations
    };
  }

  /**
   * Release resources when goal is completed or cancelled
   */
  async releaseResources(goalId: string): Promise<{
    released: ResourceReservation[];
    errors: string[];
  }> {
    
    const released: ResourceReservation[] = [];
    const errors: string[] = [];

    for (const reservation of this.reservations.values()) {
      if (reservation.goalId === goalId) {
        try {
          await this.releaseReservation(reservation.id);
          released.push(reservation);
        } catch (error) {
          errors.push(`Failed to release reservation ${reservation.id}: ${(error as Error).message}`);
        }
      }
    }

    return { released, errors };
  }

  /**
   * Helper methods
   */
  private findAvailableResource(
    requirement: ResourceRequirement, 
    availableResources: AvailableResource[]
  ): AvailableResource | null {
    
    return availableResources.find(resource => 
      resource.name === requirement.name && 
      resource.type === requirement.type &&
      resource.quantity >= requirement.quantity &&
      (!requirement.quality || resource.quality >= requirement.quality)
    ) || null;
  }

  private async findAlternatives(
    requirement: ResourceRequirement, 
    context: GoalExecutionContext
  ): Promise<ResourceRequirement[]> {
    
    const alternatives: ResourceRequirement[] = [];
    
    // Define alternative resources based on type
    const alternativeMap = new Map([
      ['wood', ['stone', 'dirt', 'cobblestone']],
      ['stone', ['wood', 'cobblestone', 'iron']],
      ['iron', ['stone', 'wood', 'gold']],
      ['diamond', ['iron', 'stone', 'gold']],
      ['food', ['bread', 'apple', 'cooked_meat']],
      ['tool', ['bare_hands', 'simpler_tool']]
    ]);

    const possibleAlternatives = alternativeMap.get(requirement.name.toLowerCase()) || [];
    
    for (const altName of possibleAlternatives) {
      const available = context.availableResources.find(r => 
        r.name.toLowerCase() === altName && r.type === requirement.type
      );
      
      if (available && available.quantity >= requirement.quantity) {
        alternatives.push({
          ...requirement,
          name: altName,
          quantity: Math.max(requirement.quantity, Math.floor(requirement.quantity * 0.8)) // May need more of alternative
        });
      }
    }

    return alternatives;
  }

  private isCriticalResource(requirement: ResourceRequirement): boolean {
    // Critical resources are those that prevent goal completion
    const criticalTypes = [ResourceType.TOOL, ResourceType.SKILL];
    return criticalTypes.includes(requirement.type as ResourceType) || requirement.quantity > 10;
  }

  private async createReservation(
    goal: Goal, 
    resource: AvailableResource, 
    context: GoalExecutionContext
  ): Promise<ResourceReservation | null> {
    
    const reservation: ResourceReservation = {
      id: this.generateReservationId(),
      goalId: goal.id,
      resourceType: resource.type as ResourceType,
      resourceName: resource.name,
      quantity: Math.min(resource.quantity, this.getRequiredQuantity(goal, resource)),
      quality: resource.quality,
      priority: this.mapGoalPriorityToResourcePriority(goal.priority),
      status: ReservationStatus.PENDING,
      createdAt: Date.now(),
      expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
      conditions: [],
      alternatives: []
    };

    // Check if reservation can be fulfilled
    if (await this.canReserve(reservation, context)) {
      reservation.status = ReservationStatus.RESERVED;
      reservation.allocatedAt = Date.now();
      this.reservations.set(reservation.id, reservation);
      return reservation;
    }

    return null;
  }

  private async createPartialReservation(
    goal: Goal, 
    requirement: ResourceRequirement, 
    context: GoalExecutionContext
  ): Promise<ResourceReservation | null> {
    
    // Find partial availability
    const available = context.availableResources.find(r => 
      r.name === requirement.name && r.type === requirement.type
    );

    if (!available || available.quantity === 0) {
      return null;
    }

    const reservation: ResourceReservation = {
      id: this.generateReservationId(),
      goalId: goal.id,
      resourceType: requirement.type as ResourceType,
      resourceName: requirement.name,
      quantity: Math.min(available.quantity, requirement.quantity),
      quality: available.quality,
      priority: this.mapGoalPriorityToResourcePriority(goal.priority),
      status: ReservationStatus.PENDING,
      createdAt: Date.now(),
      expiresAt: Date.now() + (12 * 60 * 60 * 1000), // 12 hours for partial
      conditions: [`Additional ${requirement.quantity - available.quantity} needed`],
      alternatives: []
    };

    if (await this.canReserve(reservation, context)) {
      reservation.status = ReservationStatus.RESERVED;
      reservation.allocatedAt = Date.now();
      this.reservations.set(reservation.id, reservation);
      return reservation;
    }

    return null;
  }

  private async canReserve(reservation: ResourceReservation, context: GoalExecutionContext): Promise<boolean> {
    // Check if resource can be reserved based on current conditions
    const existingReservations = Array.from(this.reservations.values()).filter(r => 
      r.resourceName === reservation.resourceName && 
      r.status === ReservationStatus.RESERVED
    );

    const totalReserved = existingReservations.reduce((sum, r) => sum + r.quantity, 0);
    const available = context.availableResources.find(r => r.name === reservation.resourceName);

    if (!available) return false;

    return (totalReserved + reservation.quantity) <= available.quantity;
  }

  private getRequiredQuantity(goal: Goal, resource: AvailableResource): number {
    const requirement = goal.requirements.find(r => 
      r.name === resource.name && r.type === resource.type
    );
    return requirement?.quantity || 1;
  }

  private mapGoalPriorityToResourcePriority(goalPriority: any): ResourcePriority {
    switch (goalPriority) {
      case 0: return ResourcePriority.CRITICAL;
      case 1: return ResourcePriority.HIGH;
      case 2: return ResourcePriority.MEDIUM;
      case 3: return ResourcePriority.LOW;
      case 4: return ResourcePriority.OPTIONAL;
      default: return ResourcePriority.MEDIUM;
    }
  }

  private calculateAllocationEfficiency(reservation: ResourceReservation, context: GoalExecutionContext): number {
    // Calculate how efficiently the resource is allocated
    const available = context.availableResources.find(r => r.name === reservation.resourceName);
    if (!available) return 0;

    return Math.min(1, reservation.quantity / available.quantity);
  }

  private requirementFromReservation(reservation: ResourceReservation): ResourceRequirement {
    return {
      type: reservation.resourceType as any,
      name: reservation.resourceName,
      quantity: reservation.quantity,
      quality: reservation.quality,
      consumable: true // Default assumption
    };
  }

  private async allocateByPriority(
    goals: Goal[], 
    context: GoalExecutionContext
  ): Promise<{ allocations: Map<string, ResourceAllocation[]>; conflicts: any[] }> {
    
    const allocations = new Map<string, ResourceAllocation[]>();
    const conflicts: any[] = [];
    
    // Sort goals by priority
    const sortedGoals = goals.sort((a, b) => (a.priority as number) - (b.priority as number));
    
    // Allocate resources to highest priority goals first
    for (const goal of sortedGoals) {
      const goalAllocations = await this.allocateForGoal(goal, context);
      allocations.set(goal.id, goalAllocations);
    }

    return { allocations, conflicts };
  }

  private async allocateForEfficiency(
    goals: Goal[], 
    context: GoalExecutionContext
  ): Promise<{ allocations: Map<string, ResourceAllocation[]>; conflicts: any[] }> {
    
    const allocations = new Map<string, ResourceAllocation[]>();
    const conflicts: any[] = [];
    
    // Calculate efficiency scores for each goal-resource combination
    const efficiencyScores = await this.calculateEfficiencyScores(goals, context);
    
    // Allocate to maximize overall efficiency
    for (const goal of goals) {
      const goalAllocations = await this.allocateForGoal(goal, context);
      allocations.set(goal.id, goalAllocations);
    }

    return { allocations, conflicts };
  }

  private async allocateFairly(
    goals: Goal[], 
    context: GoalExecutionContext
  ): Promise<{ allocations: Map<string, ResourceAllocation[]>; conflicts: any[] }> {
    
    const allocations = new Map<string, ResourceAllocation[]>();
    const conflicts: any[] = [];
    
    // Distribute resources evenly among goals
    for (const goal of goals) {
      const goalAllocations = await this.allocateForGoal(goal, context);
      allocations.set(goal.id, goalAllocations);
    }

    return { allocations, conflicts };
  }

  private async allocateOpportunistically(
    goals: Goal[], 
    context: GoalExecutionContext
  ): Promise<{ allocations: Map<string, ResourceAllocation[]>; conflicts: any[] }> {
    
    const allocations = new Map<string, ResourceAllocation[]>();
    const conflicts: any[] = [];
    
    // Prioritize goals that can leverage current opportunities
    const opportunityGoals = this.sortByOpportunity(goals, context);
    
    for (const goal of opportunityGoals) {
      const goalAllocations = await this.allocateForGoal(goal, context);
      allocations.set(goal.id, goalAllocations);
    }

    return { allocations, conflicts };
  }

  private async allocateConservatively(
    goals: Goal[], 
    context: GoalExecutionContext
  ): Promise<{ allocations: Map<string, ResourceAllocation[]>; conflicts: any[] }> {
    
    const allocations = new Map<string, ResourceAllocation[]>();
    const conflicts: any[] = [];
    
    // Allocate resources conservatively, keeping reserves
    for (const goal of goals) {
      const conservativeAllocations = await this.allocateForGoalConservatively(goal, context);
      allocations.set(goal.id, conservativeAllocations);
    }

    return { allocations, conflicts };
  }

  private async allocateForGoal(goal: Goal, context: GoalExecutionContext): Promise<ResourceAllocation[]> {
    const allocations: ResourceAllocation[] = [];

    for (const requirement of goal.requirements) {
      const available = context.availableResources.find(r => 
        r.name === requirement.name && r.type === requirement.type
      );

      if (available) {
        const allocated = Math.min(requirement.quantity, available.quantity);
        allocations.push({
          requirement,
          allocated,
          efficiency: allocated / requirement.quantity,
          reservationExpiry: Date.now() + (24 * 60 * 60 * 1000)
        });
      }
    }

    return allocations;
  }

  private async allocateForGoalConservatively(goal: Goal, context: GoalExecutionContext): Promise<ResourceAllocation[]> {
    const allocations: ResourceAllocation[] = [];

    for (const requirement of goal.requirements) {
      const available = context.availableResources.find(r => 
        r.name === requirement.name && r.type === requirement.type
      );

      if (available) {
        // Allocate conservatively - only 80% of what's available
        const allocated = Math.min(
          Math.floor(requirement.quantity * 0.8), 
          Math.floor(available.quantity * 0.8)
        );
        allocations.push({
          requirement,
          allocated,
          efficiency: allocated / requirement.quantity,
          reservationExpiry: Date.now() + (12 * 60 * 60 * 1000) // Shorter reservation
        });
      }
    }

    return allocations;
  }

  private async calculateEfficiencyScores(goals: Goal[], context: GoalExecutionContext): Promise<Map<string, number>> {
    const scores = new Map<string, number>();

    for (const goal of goals) {
      let efficiency = 0;
      let totalRequirements = 0;

      for (const requirement of goal.requirements) {
        const available = context.availableResources.find(r => 
          r.name === requirement.name && r.type === requirement.type
        );

        if (available) {
          efficiency += Math.min(1, available.quantity / requirement.quantity);
        }
        totalRequirements++;
      }

      scores.set(goal.id, totalRequirements > 0 ? efficiency / totalRequirements : 0);
    }

    return scores;
  }

  private sortByOpportunity(goals: Goal[], context: GoalExecutionContext): Goal[] {
    return goals.sort((a, b) => {
      const aOpportunity = this.calculateOpportunityScore(a, context);
      const bOpportunity = this.calculateOpportunityScore(b, context);
      return bOpportunity - aOpportunity;
    });
  }

  private calculateOpportunityScore(goal: Goal, context: GoalExecutionContext): number {
    let score = 0;

    // Check for environmental opportunities
    for (const condition of context.environmentalConditions) {
      if (condition.type === 'opportunity') {
        score += condition.severity;
      }
    }

    // Check for resource abundance
    for (const requirement of goal.requirements) {
      const available = context.availableResources.find(r => 
        r.name === requirement.name && r.type === requirement.type
      );

      if (available && available.quantity > requirement.quantity * 2) {
        score += 0.2;
      }
    }

    return score;
  }

  private async assessScarcity(resource: AvailableResource, context: GoalExecutionContext): Promise<ResourceScarcity> {
    const cacheKey = `${resource.type}_${resource.name}`;
    
    if (this.scarcityCache.has(cacheKey)) {
      const cached = this.scarcityCache.get(cacheKey)!;
      // Return cached if recent (within 5 minutes)
      if (Date.now() - cached.estimatedAvailability < 5 * 60 * 1000) {
        return cached;
      }
    }

    // Calculate scarcity based on current availability and demand
    const totalDemand = this.calculateTotalDemand(resource, context);
    const scarcityLevel = Math.max(0, Math.min(1, 1 - (resource.quantity / Math.max(1, totalDemand))));

    const scarcity: ResourceScarcity = {
      resourceType: resource.type as ResourceType,
      resourceName: resource.name,
      scarcityLevel,
      estimatedAvailability: resource.quantity,
      replenishmentRate: this.estimateReplenishmentRate(resource),
      alternativeResources: await this.findAlternativeResources(resource, context),
      acquisitionDifficulty: this.estimateAcquisitionDifficulty(resource, context)
    };

    this.scarcityCache.set(cacheKey, scarcity);
    return scarcity;
  }

  private calculateTotalDemand(resource: AvailableResource, context: GoalExecutionContext): number {
    let totalDemand = 0;

    // Sum up requirements from all active goals
    const allGoals = [
      ...(context.agentState.cognitive?.goals?.strategicGoals || []),
      ...(context.agentState.cognitive?.goals?.tacticalGoals || []),
      ...(context.agentState.cognitive?.goals?.operationalGoals || [])
    ];

    for (const goal of allGoals) {
      // Convert to our Goal interface format - the interfaces.ts Goal has different structure
      // For now, assume requirements exist or use a default
      const requirements = (goal as any).requirements || [];
      for (const requirement of requirements) {
        if (requirement.name === resource.name && requirement.type === resource.type) {
          totalDemand += requirement.quantity;
        }
      }
    }

    return totalDemand;
  }

  private estimateReplenishmentRate(resource: AvailableResource): number {
    // Simple heuristic based on resource type
    switch (resource.type) {
      case 'item':
        return resource.name.includes('wood') ? 0.8 : 0.3;
      case 'tool':
        return 0.1; // Tools don't replenish naturally
      case 'energy':
        return 0.9; // Energy replenishes quickly
      default:
        return 0.5;
    }
  }

  private async findAlternativeResources(resource: AvailableResource, context: GoalExecutionContext): Promise<string[]> {
    // Return potential alternative resource names
    const alternatives: string[] = [];
    
    if (resource.type === 'item') {
      alternatives.push('stone', 'wood', 'dirt');
    }
    
    return alternatives;
  }

  private estimateAcquisitionDifficulty(resource: AvailableResource, context: GoalExecutionContext): number {
    // Estimate how difficult it is to acquire more of this resource
    const scarcity = this.calculateTotalDemand(resource, context);
    return Math.min(1, scarcity / 10);
  }

  private calculateAcquisitionPriority(resource: ResourceRequirement, goal: Goal): number {
    // Higher priority for critical resources and high-priority goals
    const criticality = this.isCriticalResource(resource) ? 1.0 : 0.5;
    const goalPriority = 1.0 - ((goal.priority as number) / 4.0); // Invert so lower number = higher priority
    return criticality * goalPriority;
  }

  private calculateResourceUsage(context: GoalExecutionContext): Map<string, number> {
    const usage = new Map<string, number>();

    // Calculate current resource usage efficiency
    for (const resource of context.availableResources) {
      const totalReserved = Array.from(this.reservations.values())
        .filter(r => r.resourceName === resource.name && r.status === ReservationStatus.ALLOCATED)
        .reduce((sum, r) => sum + r.quantity, 0);

      const efficiency = resource.quantity > 0 ? totalReserved / resource.quantity : 0;
      usage.set(resource.name, efficiency);
    }

    return usage;
  }

  private async releaseReservation(reservationId: string): Promise<void> {
    const reservation = this.reservations.get(reservationId);
    if (reservation) {
      reservation.status = ReservationStatus.RELEASED;
      this.reservations.delete(reservationId);
    }
  }

  private async releaseReservations(reservationIds: string[]): Promise<void> {
    for (const id of reservationIds) {
      await this.releaseReservation(id);
    }
  }

  private generateReservationId(): string {
    return `reservation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get current resource status
   */
  getResourceStatus(): {
    totalReservations: number;
    activeReservations: number;
    expiredReservations: number;
    resourceUtilization: Record<string, number>;
  } {
    const total = this.reservations.size;
    const active = Array.from(this.reservations.values()).filter(r => 
      r.status === ReservationStatus.RESERVED || r.status === ReservationStatus.ALLOCATED
    ).length;
    const expired = Array.from(this.reservations.values()).filter(r => 
      r.status === ReservationStatus.EXPIRED
    ).length;

    const utilization: Record<string, number> = {};
    for (const reservation of this.reservations.values()) {
      utilization[reservation.resourceName] = (utilization[reservation.resourceName] || 0) + reservation.quantity;
    }

    return {
      totalReservations: total,
      activeReservations: active,
      expiredReservations: expired,
      resourceUtilization: utilization
    };
  }
}

/**
 * Resource optimizer for finding efficient resource combinations
 */
class ResourceOptimizer {
  async optimize(
    requirements: ResourceRequirement[], 
    context: GoalExecutionContext
  ): Promise<ResourceOptimizationResult> {
    
    const optimized = [...requirements];
    const substitutions: Array<{ original: ResourceRequirement; substitute: ResourceRequirement; efficiency: number }> = [];
    
    // Find potential substitutions
    for (const requirement of requirements) {
      const substitutes = await this.findSubstitutes(requirement, context);
      
      for (const substitute of substitutes) {
        const efficiency = this.calculateSubstitutionEfficiency(requirement, substitute, context);
        
        if (efficiency > 0.8) {
          substitutions.push({
            original: requirement,
            substitute,
            efficiency
          });
          
          // Replace in optimized requirements
          const index = optimized.indexOf(requirement);
          if (index !== -1) {
            optimized[index] = substitute;
          }
        }
      }
    }

    // Calculate savings
    const savings = this.calculateSavings(requirements, optimized);

    return {
      originalRequirements: requirements,
      optimizedRequirements: optimized,
      savings,
      substitutions,
      confidence: this.calculateOptimizationConfidence(substitutions)
    };
  }

  private async findSubstitutes(
    requirement: ResourceRequirement, 
    context: GoalExecutionContext
  ): Promise<ResourceRequirement[]> {
    // Find potential substitutes based on resource type and properties
    const substitutes: ResourceRequirement[] = [];
    
    const substitutionMap = new Map([
      ['diamond_pickaxe', ['iron_pickaxe', 'stone_pickaxe']],
      ['iron_sword', ['stone_sword', 'wooden_sword']],
      ['bread', ['apple', 'cooked_meat']],
      ['stone', ['cobblestone', 'wood']]
    ]);

    const possibleSubstitutes = substitutionMap.get(requirement.name.toLowerCase()) || [];
    
    for (const substitute of possibleSubstitutes) {
      const available = context.availableResources.find(r => r.name === substitute);
      if (available) {
        substitutes.push({
          ...requirement,
          name: substitute,
          quantity: Math.ceil(requirement.quantity * 1.2) // May need more of lower-tier substitute
        });
      }
    }

    return substitutes;
  }

  private calculateSubstitutionEfficiency(
    original: ResourceRequirement, 
    substitute: ResourceRequirement, 
    context: GoalExecutionContext
  ): number {
    // Calculate efficiency of substitution (0-1)
    const originalAvailable = context.availableResources.find(r => r.name === original.name);
    const substituteAvailable = context.availableResources.find(r => r.name === substitute.name);

    if (!originalAvailable && substituteAvailable) {
      return 1.0; // Perfect substitution if original unavailable
    }

    if (!substituteAvailable) {
      return 0.0; // No substitution possible
    }

    // Consider quality difference and availability
    const qualityRatio = (substituteAvailable.quality || 0) / (originalAvailable?.quality || 1);
    const availabilityRatio = originalAvailable ?
      substituteAvailable.quantity / originalAvailable.quantity : 1;

    return Math.min(1, qualityRatio * availabilityRatio);
  }

  private calculateSavings(
    original: ResourceRequirement[], 
    optimized: ResourceRequirement[]
  ): { quantity: number; cost: number; time: number } {
    
    let quantitySavings = 0;
    let costSavings = 0;
    let timeSavings = 0;

    for (let i = 0; i < original.length; i++) {
      const orig = original[i];
      const opt = optimized[i];

      if (orig.name !== opt.name) {
        // Calculate savings from substitution
        quantitySavings += orig.quantity - opt.quantity;
        costSavings += this.estimateResourceCost(orig) - this.estimateResourceCost(opt);
        timeSavings += this.estimateAcquisitionTime(orig) - this.estimateAcquisitionTime(opt);
      }
    }

    return {
      quantity: quantitySavings,
      cost: costSavings,
      time: timeSavings
    };
  }

  private estimateResourceCost(requirement: ResourceRequirement): number {
    // Simple cost estimation based on resource type and quantity
    const baseCosts: Record<string, number> = {
      'diamond': 100,
      'iron': 50,
      'stone': 10,
      'wood': 5,
      'food': 20
    };

    const baseCost = baseCosts[requirement.name.toLowerCase()] || 10;
    return baseCost * requirement.quantity;
  }

  private estimateAcquisitionTime(requirement: ResourceRequirement): number {
    // Estimate time to acquire resource (in minutes)
    const baseTimes: Record<string, number> = {
      'diamond': 30,
      'iron': 15,
      'stone': 5,
      'wood': 2,
      'food': 10
    };

    const baseTime = baseTimes[requirement.name.toLowerCase()] || 10;
    return baseTime * Math.ceil(requirement.quantity / 10);
  }

  private calculateOptimizationConfidence(substitutions: any[]): number {
    if (substitutions.length === 0) return 1.0;
    
    const avgEfficiency = substitutions.reduce((sum, sub) => sum + sub.efficiency, 0) / substitutions.length;
    return avgEfficiency;
  }
}

/**
 * Resource acquisition planner
 */
class ResourceAcquisitionPlanner {
  async createPlan(
    resource: ResourceRequirement, 
    context: GoalExecutionContext
  ): Promise<AcquisitionPlan> {
    
    const strategies = await this.identifyAcquisitionStrategies(resource, context);
    const bestStrategy = this.selectBestStrategy(strategies, context);

    return {
      resource,
      strategy: bestStrategy.name,
      steps: bestStrategy.steps,
      estimatedTime: bestStrategy.estimatedTime,
      estimatedCost: bestStrategy.estimatedCost,
      requirements: bestStrategy.requirements,
      risks: bestStrategy.risks,
      alternatives: strategies.filter(s => s.name !== bestStrategy.name)
    };
  }

  private async identifyAcquisitionStrategies(
    resource: ResourceRequirement, 
    context: GoalExecutionContext
  ): Promise<AcquisitionStrategy[]> {
    
    const strategies: AcquisitionStrategy[] = [];

    // Mining strategy for resources
    if (resource.type === 'item' && this.isMineable(resource.name)) {
      strategies.push(this.createMiningStrategy(resource, context));
    }

    // Crafting strategy
    if (this.isCraftable(resource.name)) {
      strategies.push(this.createCraftingStrategy(resource, context));
    }

    // Trading strategy
    strategies.push(this.createTradingStrategy(resource, context));

    // Gathering strategy
    if (this.isGatherable(resource.name)) {
      strategies.push(this.createGatheringStrategy(resource, context));
    }

    return strategies;
  }

  private selectBestStrategy(strategies: AcquisitionStrategy[], context: GoalExecutionContext): AcquisitionStrategy {
    // Select strategy based on efficiency, cost, and time
    return strategies.sort((a, b) => {
      const scoreA = (a.estimatedTime * 0.4) + (a.estimatedCost * 0.3) + (a.risks.length * 0.3);
      const scoreB = (b.estimatedTime * 0.4) + (b.estimatedCost * 0.3) + (b.risks.length * 0.3);
      return scoreA - scoreB;
    })[0] || strategies[0];
  }

  private isMineable(resourceName: string): boolean {
    const mineable = ['stone', 'iron', 'coal', 'diamond', 'gold', 'copper'];
    return mineable.includes(resourceName.toLowerCase());
  }

  private isCraftable(resourceName: string): boolean {
    const craftable = ['pickaxe', 'sword', 'armor', 'tool', 'bread'];
    return craftable.some(c => resourceName.toLowerCase().includes(c));
  }

  private isGatherable(resourceName: string): boolean {
    const gatherable = ['wood', 'food', 'apple', 'wheat'];
    return gatherable.includes(resourceName.toLowerCase());
  }

  private createMiningStrategy(resource: ResourceRequirement, context: GoalExecutionContext): AcquisitionStrategy {
    return {
      name: 'mining',
      steps: [
        'Find suitable mining location',
        'Gather mining tools',
        'Mine required resources',
        'Return to base'
      ],
      estimatedTime: Math.ceil(resource.quantity * 2), // 2 minutes per unit
      estimatedCost: resource.quantity * 5, // Tool wear cost
      requirements: [
        { type: 'tool' as any, name: 'pickaxe', quantity: 1, quality: 0.5, consumable: false }
      ],
      risks: ['Cave collapse', 'Mob encounters', 'Getting lost']
    };
  }

  private createCraftingStrategy(resource: ResourceRequirement, context: GoalExecutionContext): AcquisitionStrategy {
    return {
      name: 'crafting',
      steps: [
        'Gather raw materials',
        'Access crafting table',
        'Craft required items',
        'Quality check'
      ],
      estimatedTime: Math.ceil(resource.quantity * 1), // 1 minute per unit
      estimatedCost: resource.quantity * 3, // Material cost
      requirements: [
        { type: 'item' as any, name: 'raw_materials', quantity: resource.quantity * 2, quality: 0.5, consumable: true }
      ],
      risks: ['Insufficient materials', 'Crafting failure', 'Quality issues']
    };
  }

  private createTradingStrategy(resource: ResourceRequirement, context: GoalExecutionContext): AcquisitionStrategy {
    return {
      name: 'trading',
      steps: [
        'Find trading partners',
        'Prepare trade goods',
        'Negotiate trade',
        'Complete exchange'
      ],
      estimatedTime: Math.ceil(resource.quantity * 0.5), // 30 seconds per unit
      estimatedCost: resource.quantity * 10, // Trade cost
      requirements: [
        { type: 'item' as any, name: 'trade_goods', quantity: resource.quantity, quality: 0.5, consumable: true }
      ],
      risks: ['No trading partners', 'Unfavorable rates', 'Scams']
    };
  }

  private createGatheringStrategy(resource: ResourceRequirement, context: GoalExecutionContext): AcquisitionStrategy {
    return {
      name: 'gathering',
      steps: [
        'Locate resource sources',
        'Travel to location',
        'Gather resources',
        'Return to storage'
      ],
      estimatedTime: Math.ceil(resource.quantity * 0.75), // 45 seconds per unit
      estimatedCost: resource.quantity * 2, // Travel cost
      requirements: [
        { type: 'tool' as any, name: 'gathering_tools', quantity: 1, quality: 0.3, consumable: false }
      ],
      risks: ['Resource depletion', 'Environmental hazards', 'Competition']
    };
  }
}

/**
 * Acquisition plan interface
 */
export interface AcquisitionPlan {
  resource: ResourceRequirement;
  strategy: string;
  steps: string[];
  estimatedTime: number; // in minutes
  estimatedCost: number; // in resource units
  requirements: ResourceRequirement[];
  risks: string[];
  alternatives: AcquisitionStrategy[];
}

/**
 * Acquisition strategy interface
 */
interface AcquisitionStrategy {
  name: string;
  steps: string[];
  estimatedTime: number;
  estimatedCost: number;
  requirements: ResourceRequirement[];
  risks: string[];
}