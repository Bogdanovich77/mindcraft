/**
 * Resource Assessment System for Planning Engine
 * 
 * Provides comprehensive resource inventory tracking, requirement analysis,
 * and allocation optimization for the Mindcraft LangGraph planning system.
 */

import { 
  AgentState, 
  ResourceRequirement, 
  ResourceInventory, 
  ResourceItem, 
  ResourceTool, 
  ResourceLocation,
  ResourceAvailability,
  ResourceShortage,
  ResourceExcess,
  ResourceConflict,
  ResourceAllocation,
  AllocatedResource,
  ResourceAllocationOptimization,
  ResourceOptimization,
  ResourceAssessmentResult,
  Item,
  Skill,
  InventoryItem
} from '../langgraph/interfaces.js';

/**
 * Resource Assessment System class
 */
export class ResourceAssessmentSystem {
  private config: ResourceAssessmentConfig;
  private lastAssessmentTime: number = 0;
  private assessmentCache: Map<string, ResourceAssessmentResult> = new Map();
  private cacheTimeout: number = 30000; // 30 seconds

  constructor(config?: Partial<ResourceAssessmentConfig>) {
    this.config = {
      assessmentTimeout: 5000,
      enableCaching: true,
      cacheTimeout: 30000,
      maxCacheSize: 100,
      enableOptimization: true,
      optimizationThreshold: 0.1,
      enableConflictDetection: true,
      enableAllocationTracking: true,
      ...config
    };
  }

  /**
   * Assess current resource inventory and availability
   */
  async assessResources(agentState: AgentState): Promise<ResourceAssessmentResult> {
    const startTime = Date.now();
    const cacheKey = this.generateCacheKey(agentState);

    // Check cache first
    if (this.config.enableCaching && this.assessmentCache.has(cacheKey)) {
      const cached = this.assessmentCache.get(cacheKey)!;
      if (Date.now() - cached.assessmentTime < this.config.cacheTimeout) {
        return cached;
      }
    }

    try {
      // Build resource inventory
      const inventory = await this.buildResourceInventory(agentState);
      
      // Analyze availability
      const availability = await this.analyzeAvailability(inventory);
      
      // Identify shortages and excess
      const shortages = await this.identifyShortages(inventory);
      const excess = await this.identifyExcess(inventory);
      
      // Generate recommendations
      const recommendations = await this.generateRecommendations(inventory, shortages, excess);
      
      // Calculate total value and accessibility
      const totalValue = this.calculateTotalValue(inventory);
      const accessibility = this.calculateAccessibility(inventory);

      const result: ResourceAssessmentResult = {
        inventory,
        availability,
        shortages,
        excess,
        totalValue,
        accessibility,
        recommendations,
        assessmentTime: Date.now() - startTime,
        overallAvailability: this.calculateOverallAvailability(availability),
        conflicts: []
      };

      // Cache result
      if (this.config.enableCaching) {
        this.assessmentCache.set(cacheKey, result);
        this.cleanupCache();
      }

      this.lastAssessmentTime = Date.now();
      return result;

    } catch (error) {
      console.error('[RESOURCE_ASSESSMENT] Error during assessment:', error);
      throw error;
    }
  }

  /**
   * Assess resource availability for specific requirements
   */
  async assessResourceAvailability(
    requirements: ResourceRequirement[], 
    agentState: AgentState
  ): Promise<ResourceAssessmentResult> {
    const startTime = Date.now();
    
    try {
      // Get current inventory
      const inventory = await this.buildResourceInventory(agentState);
      
      // Check each requirement
      const availability: Record<string, ResourceAvailability> = {};
      const shortages: ResourceShortage[] = [];
      const excess: ResourceExcess[] = [];
      
      for (const requirement of requirements) {
        const available = this.checkResourceAvailability(requirement, inventory);
        availability[requirement.type] = available;
        
        if (available === ResourceAvailability.UNAVAILABLE || 
            available === ResourceAvailability.PARTIAL) {
          shortages.push(this.createShortage(requirement, inventory));
        }
      }

      // Generate recommendations
      const recommendations = await this.generateRequirementRecommendations(requirements, inventory);
      
      const result: ResourceAssessmentResult = {
        inventory,
        availability,
        shortages,
        excess,
        totalValue: this.calculateTotalValue(inventory),
        accessibility: this.calculateAccessibility(inventory),
        recommendations,
        assessmentTime: Date.now() - startTime,
        overallAvailability: this.calculateOverallAvailability(availability),
        conflicts: []
      };

      return result;

    } catch (error) {
      console.error('[RESOURCE_ASSESSMENT] Error checking availability:', error);
      throw error;
    }
  }

  /**
   * Optimize resource allocation for better efficiency
   */
  async optimizeResourceAllocation(
    allocation: ResourceAllocation, 
    agentState: AgentState
  ): Promise<ResourceAllocationOptimization> {
    const startTime = Date.now();
    
    if (!this.config.enableOptimization) {
      return {
        originalAllocation: allocation,
        optimizedAllocation: allocation,
        improvements: [],
        totalSavings: 0,
        efficiencyGain: 0,
        utilizationImprovement: 0,
        optimizationTime: Date.now() - startTime,
        conflictsResolved: 0
      };
    }

    try {
      // Analyze current allocation
      const analysis = await this.analyzeAllocation(allocation, agentState);
      
      // Generate optimizations
      const improvements = await this.generateOptimizations(allocation, analysis);
      
      // Create optimized allocation
      const optimizedAllocation = await this.applyOptimizations(allocation, improvements);
      
      // Calculate metrics
      const totalSavings = this.calculateSavings(allocation, optimizedAllocation);
      const efficiencyGain = this.calculateEfficiencyGain(allocation, optimizedAllocation);
      const utilizationImprovement = this.calculateUtilizationImprovement(allocation, optimizedAllocation);
      const conflictsResolved = improvements.filter(i => i.type === 'reallocation').length;

      const result: ResourceAllocationOptimization = {
        originalAllocation: allocation,
        optimizedAllocation,
        improvements,
        totalSavings,
        efficiencyGain,
        utilizationImprovement,
        optimizationTime: Date.now() - startTime,
        conflictsResolved
      };

      return result;

    } catch (error) {
      console.error('[RESOURCE_ASSESSMENT] Error optimizing allocation:', error);
      throw error;
    }
  }

  /**
   * Build comprehensive resource inventory from agent state
   */
  private async buildResourceInventory(agentState: AgentState): Promise<ResourceInventory> {
    const inventory: ResourceInventory = {
      items: {},
      tools: {},
      locations: {},
      skills: {},
      time: Date.now(),
      totalValue: 0,
      accessibility: 0
    };

    // Process inventory items
    for (const item of agentState.context.inventory) {
      inventory.items[item.type] = {
        type: item.type,
        quantity: item.count,
        quality: this.estimateItemQuality(item),
        accessibility: this.calculateItemAccessibility(item),
        estimatedValue: this.estimateItemValue(item),
        location: agentState.context.position,
        durability: this.estimateItemDurability(item),
        metadata: item.metadata
      };
    }

    // Process equipment as tools
    const equipment = agentState.context.equipment;
    if (equipment.weapon) {
      inventory.tools[equipment.weapon.type] = {
        type: equipment.weapon.type,
        durability: this.estimateToolDurability(equipment.weapon),
        efficiency: this.estimateToolEfficiency(equipment.weapon),
        skillRequirements: this.getToolSkillRequirements(equipment.weapon.type),
        estimatedTime: this.estimateToolUsageTime(equipment.weapon),
        metadata: equipment.weapon.metadata
      };
    }

    // Process skills
    for (const [skillName, skill] of Object.entries(agentState.cognitive.skills.skills)) {
      inventory.skills[skillName] = skill;
    }

    // Calculate totals
    inventory.totalValue = this.calculateTotalValue(inventory);
    inventory.accessibility = this.calculateAccessibility(inventory);

    return inventory;
  }

  /**
   * Analyze resource availability
   */
  private async analyzeAvailability(inventory: ResourceInventory): Promise<Record<string, ResourceAvailability>> {
    const availability: Record<string, ResourceAvailability> = {};

    // Analyze items
    for (const [itemType, item] of Object.entries(inventory.items)) {
      availability[itemType] = item.quantity > 0 ? 
        ResourceAvailability.AVAILABLE : 
        ResourceAvailability.UNAVAILABLE;
    }

    // Analyze tools
    for (const [toolType, tool] of Object.entries(inventory.tools)) {
      availability[toolType] = tool.durability > 0 ? 
        ResourceAvailability.AVAILABLE : 
        ResourceAvailability.UNAVAILABLE;
    }

    // Analyze skills
    for (const [skillName, skill] of Object.entries(inventory.skills)) {
      availability[skillName] = skill.proficiency.overall > 0.1 ? 
        ResourceAvailability.AVAILABLE : 
        ResourceAvailability.UNAVAILABLE;
    }

    return availability;
  }

  /**
   * Identify resource shortages
   */
  private async identifyShortages(inventory: ResourceInventory): Promise<ResourceShortage[]> {
    const shortages: ResourceShortage[] = [];

    // Critical resources that should always be available
    const criticalResources = ['wood', 'stone', 'food', 'torch'];
    
    for (const resourceType of criticalResources) {
      const item = inventory.items[resourceType];
      if (!item || item.quantity < 10) {
        shortages.push({
          type: resourceType,
          required: 10,
          available: item?.quantity || 0,
          amount: Math.max(0, 10 - (item?.quantity || 0)),
          priority: resourceType === 'food' ? 0 : 1
        });
      }
    }

    return shortages;
  }

  /**
   * Identify resource excess
   */
  private async identifyExcess(inventory: ResourceInventory): Promise<ResourceExcess[]> {
    const excess: ResourceExcess[] = [];

    // Resources that might be in excess
    const excessThresholds: Record<string, number> = {
      'cobblestone': 64,
      'dirt': 64,
      'gravel': 32,
      'sand': 32
    };

    for (const [resourceType, threshold] of Object.entries(excessThresholds)) {
      const item = inventory.items[resourceType];
      if (item && item.quantity > threshold) {
        excess.push({
          type: resourceType,
          available: item.quantity,
          required: threshold,
          amount: item.quantity - threshold,
          value: this.estimateItemValue({ type: resourceType, count: item.quantity, slot: 0 })
        });
      }
    }

    return excess;
  }

  /**
   * Generate recommendations based on assessment
   */
  private async generateRecommendations(
    inventory: ResourceInventory, 
    shortages: ResourceShortage[], 
    excess: ResourceExcess[]
  ): Promise<string[]> {
    const recommendations: string[] = [];

    // Resource shortage recommendations
    if (shortages.length > 0) {
      recommendations.push('Prioritize gathering critical resources: ' + 
        shortages.map(s => s.type).join(', '));
      
      if (shortages.some(s => s.type === 'food')) {
        recommendations.push('Hunt or gather food immediately to maintain energy levels');
      }
      
      if (shortages.some(s => s.type === 'wood')) {
        recommendations.push('Collect wood for tools and building materials');
      }
    }

    // Resource excess recommendations
    if (excess.length > 0) {
      recommendations.push('Consider trading or using excess resources: ' + 
        excess.map(e => e.type).join(', '));
    }

    // Tool recommendations
    const damagedTools = Object.entries(inventory.tools)
      .filter(([_, tool]) => tool.durability < 0.3);
    
    if (damagedTools.length > 0) {
      recommendations.push('Repair damaged tools: ' + damagedTools.map(([name]) => name).join(', '));
    }

    // Skill recommendations
    const lowSkills = Object.entries(inventory.skills)
      .filter(([_, skill]) => skill.proficiency.overall < 0.3);
    
    if (lowSkills.length > 0) {
      recommendations.push('Practice skills to improve proficiency: ' + 
        lowSkills.map(([name]) => name).join(', '));
    }

    return recommendations;
  }

  /**
   * Check availability of a specific resource
   */
  private checkResourceAvailability(
    requirement: ResourceRequirement, 
    inventory: ResourceInventory
  ): ResourceAvailability {
    const item = inventory.items[requirement.type];
    
    if (!item) {
      return ResourceAvailability.UNAVAILABLE;
    }
    
    if (item.quantity >= requirement.amount) {
      return ResourceAvailability.AVAILABLE;
    }
    
    if (item.quantity > 0) {
      return ResourceAvailability.PARTIAL;
    }
    
    return ResourceAvailability.UNAVAILABLE;
  }

  /**
   * Create shortage object
   */
  private createShortage(requirement: ResourceRequirement, inventory: ResourceInventory): ResourceShortage {
    const item = inventory.items[requirement.type];
    const available = item?.quantity || 0;
    
    return {
      type: requirement.type,
      required: requirement.amount,
      available,
      amount: Math.max(0, requirement.amount - available),
      priority: this.calculateResourcePriority(requirement.type)
    };
  }

  /**
   * Generate recommendations for specific requirements
   */
  private async generateRequirementRecommendations(
    requirements: ResourceRequirement[], 
    inventory: ResourceInventory
  ): Promise<string[]> {
    const recommendations: string[] = [];
    
    for (const requirement of requirements) {
      const available = this.checkResourceAvailability(requirement, inventory);
      
      if (available === ResourceAvailability.UNAVAILABLE) {
        recommendations.push(`Acquire ${requirement.amount} ${requirement.type} - currently unavailable`);
      } else if (available === ResourceAvailability.PARTIAL) {
        const item = inventory.items[requirement.type];
        const shortage = requirement.amount - (item?.quantity || 0);
        recommendations.push(`Acquire additional ${shortage} ${requirement.type} - have ${item?.quantity || 0}`);
      }
    }
    
    return recommendations;
  }

  /**
   * Analyze current allocation
   */
  private async analyzeAllocation(
    allocation: ResourceAllocation, 
    agentState: AgentState
  ): Promise<AllocationAnalysis> {
    const analysis: AllocationAnalysis = {
      utilization: 0,
      efficiency: 0,
      conflicts: allocation.conflicts,
      bottlenecks: [],
      waste: 0,
      opportunities: []
    };

    // Calculate utilization
    const totalAllocated = Object.values(allocation.resources).reduce((sum, r) => sum + r.quantity, 0);
    const totalAvailable = Object.values(agentState.context.inventory).reduce((sum, i) => sum + i.count, 0);
    analysis.utilization = totalAvailable > 0 ? totalAllocated / totalAvailable : 0;

    // Calculate efficiency
    analysis.efficiency = allocation.efficiency;

    // Identify bottlenecks
    for (const conflict of allocation.conflicts) {
      if (conflict.severity === 'high' || conflict.severity === 'critical') {
        analysis.bottlenecks.push(conflict.type + ' conflict');
      }
    }

    // Calculate waste
    analysis.waste = this.calculateAllocationWaste(allocation);

    // Identify opportunities
    analysis.opportunities = this.identifyAllocationOpportunities(allocation, agentState);

    return analysis;
  }

  /**
   * Generate optimization strategies
   */
  private async generateOptimizations(
    allocation: ResourceAllocation, 
    analysis: AllocationAnalysis
  ): Promise<ResourceOptimization[]> {
    const optimizations: ResourceOptimization[] = [];

    // Conflict resolution optimizations
    for (const conflict of analysis.conflicts) {
      optimizations.push({
        type: 'reallocation',
        description: `Resolve ${conflict.type} conflict between ${conflict.competingPlans.join(' and ')}`,
        impact: this.calculateConflictImpact(conflict),
        cost: this.calculateResolutionCost(conflict),
        risk: this.calculateResolutionRisk(conflict)
      });
    }

    // Utilization optimizations
    if (analysis.utilization < 0.7) {
      optimizations.push({
        type: 'prioritization',
        description: 'Improve resource utilization through better prioritization',
        impact: 0.3 - analysis.utilization,
        cost: 0.1,
        risk: 0.05
      });
    }

    // Waste reduction optimizations
    if (analysis.waste > 0.1) {
      optimizations.push({
        type: 'substitution',
        description: 'Reduce waste through resource substitution',
        impact: analysis.waste,
        cost: 0.05,
        risk: 0.1
      });
    }

    return optimizations;
  }

  /**
   * Apply optimizations to create new allocation
   */
  private async applyOptimizations(
    allocation: ResourceAllocation, 
    optimizations: ResourceOptimization[]
  ): Promise<ResourceAllocation> {
    const optimizedAllocation: ResourceAllocation = {
      ...allocation,
      resources: { ...allocation.resources },
      conflicts: [...allocation.conflicts],
      efficiency: allocation.efficiency,
      utilization: allocation.utilization
    };

    // Apply each optimization
    for (const optimization of optimizations) {
      switch (optimization.type) {
        case 'reallocation':
          optimizedAllocation.conflicts = optimizedAllocation.conflicts.filter(
            c => !this.isConflictResolved(c, optimization)
          );
          break;
        case 'prioritization':
          optimizedAllocation.utilization = Math.min(1.0, optimizedAllocation.utilization + optimization.impact);
          break;
        case 'substitution':
          optimizedAllocation.efficiency = Math.min(1.0, optimizedAllocation.efficiency + optimization.impact);
          break;
      }
    }

    return optimizedAllocation;
  }

  /**
   * Calculate savings between allocations
   */
  private calculateSavings(original: ResourceAllocation, optimized: ResourceAllocation): number {
    return original.totalCost - optimized.totalCost;
  }

  /**
   * Calculate efficiency gain
   */
  private calculateEfficiencyGain(original: ResourceAllocation, optimized: ResourceAllocation): number {
    return optimized.efficiency - original.efficiency;
  }

  /**
   * Calculate utilization improvement
   */
  private calculateUtilizationImprovement(original: ResourceAllocation, optimized: ResourceAllocation): number {
    return optimized.utilization - original.utilization;
  }

  /**
   * Helper methods for resource analysis
   */
  private calculateTotalValue(inventory: ResourceInventory): number {
    return Object.values(inventory.items).reduce((sum, item) => sum + item.estimatedValue, 0);
  }

  private calculateAccessibility(inventory: ResourceInventory): number {
    if (Object.keys(inventory.items).length === 0) return 0;
    
    const totalAccessibility = Object.values(inventory.items).reduce((sum, item) => sum + item.accessibility, 0);
    return totalAccessibility / Object.keys(inventory.items).length;
  }

  private estimateItemQuality(item: InventoryItem): number {
    // Simple quality estimation based on item type and metadata
    return item.metadata?.quality || 0.8;
  }

  private calculateItemAccessibility(item: InventoryItem): number {
    // Accessibility based on slot position and quantity
    return item.count > 0 ? 1.0 : 0.0;
  }

  private estimateItemValue(item: InventoryItem): number {
    // Simple value estimation
    const baseValues: Record<string, number> = {
      'wood': 1,
      'stone': 2,
      'iron': 10,
      'gold': 15,
      'diamond': 50,
      'food': 3
    };
    return (baseValues[item.type] || 1) * item.count;
  }

  private estimateItemDurability(item: InventoryItem): number {
    return item.metadata?.durability || 1.0;
  }

  private estimateToolDurability(tool: InventoryItem): number {
    return tool.metadata?.durability || 0.8;
  }

  private estimateToolEfficiency(tool: InventoryItem): number {
    return tool.metadata?.efficiency || 0.7;
  }

  private getToolSkillRequirements(toolType: string): string[] {
    const requirements: Record<string, string[]> = {
      'pickaxe': ['mining'],
      'axe': ['woodcutting'],
      'sword': ['combat'],
      'shovel': ['digging']
    };
    return requirements[toolType] || [];
  }

  private estimateToolUsageTime(tool: InventoryItem): number {
    return tool.metadata?.usageTime || 1000;
  }

  private calculateResourcePriority(resourceType: string): number {
    const priorities: Record<string, number> = {
      'food': 0,
      'wood': 1,
      'stone': 1,
      'iron': 2,
      'diamond': 3
    };
    return priorities[resourceType] || 2;
  }

  private calculateAllocationWaste(allocation: ResourceAllocation): number {
    // Simple waste calculation based on over-allocation
    return allocation.conflicts.length * 0.1;
  }

  private identifyAllocationOpportunities(allocation: ResourceAllocation, agentState: AgentState): string[] {
    const opportunities: string[] = [];
    
    if (allocation.conflicts.length > 0) {
      opportunities.push('Resolve resource conflicts');
    }
    
    if (allocation.efficiency < 0.8) {
      opportunities.push('Improve allocation efficiency');
    }
    
    return opportunities;
  }

  private calculateConflictImpact(conflict: ResourceConflict): number {
    const severityMultipliers: Record<string, number> = {
      'low': 0.1,
      'medium': 0.3,
      'high': 0.6,
      'critical': 1.0
    };
    return severityMultipliers[conflict.severity] || 0.5;
  }

  private calculateResolutionCost(conflict: ResourceConflict): number {
    return conflict.competingPlans.length * 0.1;
  }

  private calculateResolutionRisk(conflict: ResourceConflict): number {
    return this.calculateConflictImpact(conflict) * 0.5;
  }

  private isConflictResolved(conflict: ResourceConflict, optimization: ResourceOptimization): boolean {
    return optimization.description.includes(conflict.type);
  }

  private calculateOverallAvailability(availability: Record<string, ResourceAvailability>): number {
    if (Object.keys(availability).length === 0) return 0;
    
    const availableCount = Object.values(availability).filter(
      a => a === ResourceAvailability.AVAILABLE
    ).length;
    
    return availableCount / Object.keys(availability).length;
  }

  private generateCacheKey(agentState: AgentState): string {
    return `${agentState.metadata.agentId}_${agentState.context.inventory.length}_${Date.now()}`;
  }

  private cleanupCache(): void {
    if (this.assessmentCache.size > this.config.maxCacheSize) {
      const entries = Array.from(this.assessmentCache.entries());
      entries.sort((a, b) => a[1].assessmentTime - b[1].assessmentTime);
      
      // Remove oldest entries
      const toRemove = entries.slice(0, this.assessmentCache.size - this.config.maxCacheSize);
      toRemove.forEach(([key]) => this.assessmentCache.delete(key));
    }
  }
}

// ============================================================================
// CONFIGURATION AND SUPPORTING INTERFACES
// ============================================================================

/**
 * Resource assessment configuration
 */
export interface ResourceAssessmentConfig {
  assessmentTimeout: number;
  enableCaching: boolean;
  cacheTimeout: number;
  maxCacheSize: number;
  enableOptimization: boolean;
  optimizationThreshold: number;
  enableConflictDetection: boolean;
  enableAllocationTracking: boolean;
}

/**
 * Allocation analysis result
 */
interface AllocationAnalysis {
  utilization: number;
  efficiency: number;
  conflicts: ResourceConflict[];
  bottlenecks: string[];
  waste: number;
  opportunities: string[];
}