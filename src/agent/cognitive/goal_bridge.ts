import { 
  Goal, 
  GoalLevel, 
  GoalStatus, 
  GoalPriority, 
  GoalCreationRequest,
  ResourceRequirement,
  GoalExecutionContext
} from './goal_types.js';
import { GoalDecompositionEngine } from './goal_decomposition.js';
import { GoalPrioritizationEngine } from './goal_prioritization.js';
import { GoalResourceManager } from './goal_resources.js';

/**
 * Legacy goal types from existing system
 */
export interface LegacyItemGoal {
  type: 'item';
  itemType: string;
  quantity: number;
  priority: number;
  active: boolean;
}

export interface LegacyBuildGoal {
  type: 'build';
  structure: string;
  location?: { x: number; y: number; z: number };
  priority: number;
  active: boolean;
  materials?: Record<string, number>;
}

export interface LegacyGoal {
  id: string;
  type: 'item' | 'build';
  priority: number;
  active: boolean;
  data: LegacyItemGoal | LegacyBuildGoal;
}

/**
 * Migration strategies for legacy goals
 */
export enum MigrationStrategy {
  DIRECT_CONVERSION = 'direct_conversion',     // Convert directly to equivalent goal
  HIERARCHICAL_DECOMPOSITION = 'hierarchical_decomposition', // Break into hierarchy
  CONTEXT_OPTIMIZATION = 'context_optimization', // Optimize based on current context
  PRESERVE_BEHAVIOR = 'preserve_behavior',     // Maintain exact same behavior
  ENHANCE_CAPABILITY = 'enhance_capability'    // Enhance with new capabilities
}

/**
 * Migration result
 */
export interface MigrationResult {
  originalLegacy: LegacyGoal;
  migratedGoals: Goal[];
  strategy: MigrationStrategy;
  success: boolean;
  errors: string[];
  warnings: string[];
  behavioralChanges: string[];
  enhancements: string[];
}

/**
 * Legacy goal bridge for migrating from flat to hierarchical goals
 */
export class LegacyGoalBridge {
  private decompositionEngine: GoalDecompositionEngine;
  private prioritizationEngine: GoalPrioritizationEngine;
  private resourceManager: GoalResourceManager;
  private migrationHistory: MigrationResult[];

  constructor(
    decompositionEngine: GoalDecompositionEngine,
    prioritizationEngine: GoalPrioritizationEngine,
    resourceManager: GoalResourceManager
  ) {
    this.decompositionEngine = decompositionEngine;
    this.prioritizationEngine = prioritizationEngine;
    this.resourceManager = resourceManager;
    this.migrationHistory = [];
  }

  /**
   * Migrate a single legacy goal to the new hierarchical system
   */
  async migrateGoal(
    legacyGoal: LegacyGoal, 
    context: GoalExecutionContext,
    strategy?: MigrationStrategy
  ): Promise<MigrationResult> {
    
    const selectedStrategy = strategy || this.selectOptimalStrategy(legacyGoal, context);
    const errors: string[] = [];
    const warnings: string[] = [];
    const behavioralChanges: string[] = [];
    const enhancements: string[] = [];

    try {
      let migratedGoals: Goal[] = [];

      switch (selectedStrategy) {
        case MigrationStrategy.DIRECT_CONVERSION:
          migratedGoals = await this.directConversion(legacyGoal, context);
          behavioralChanges.push('Converted to hierarchical structure');
          break;
        
        case MigrationStrategy.HIERARCHICAL_DECOMPOSITION:
          migratedGoals = await this.hierarchicalDecomposition(legacyGoal, context);
          behavioralChanges.push('Decomposed into strategic/tactical/operational goals');
          enhancements.push('Enhanced planning capabilities');
          break;
        
        case MigrationStrategy.CONTEXT_OPTIMIZATION:
          migratedGoals = await this.contextOptimization(legacyGoal, context);
          behavioralChanges.push('Optimized based on current context');
          enhancements.push('Context-aware execution');
          break;
        
        case MigrationStrategy.PRESERVE_BEHAVIOR:
          migratedGoals = await this.preserveBehavior(legacyGoal, context);
          behavioralChanges.push('Behavior preserved exactly');
          break;
        
        case MigrationStrategy.ENHANCE_CAPABILITY:
          migratedGoals = await this.enhanceCapability(legacyGoal, context);
          behavioralChanges.push('Enhanced with new cognitive capabilities');
          enhancements.push('Learning, adaptation, and optimization features');
          break;
        
        default:
          throw new Error(`Unknown migration strategy: ${selectedStrategy}`);
      }

      // Validate migration
      const validation = this.validateMigration(legacyGoal, migratedGoals);
      errors.push(...validation.errors);
      warnings.push(...validation.warnings);

      const result: MigrationResult = {
        originalLegacy: legacyGoal,
        migratedGoals,
        strategy: selectedStrategy,
        success: errors.length === 0,
        errors,
        warnings,
        behavioralChanges,
        enhancements
      };

      this.migrationHistory.push(result);
      return result;

    } catch (error) {
      return {
        originalLegacy: legacyGoal,
        migratedGoals: [],
        strategy: selectedStrategy,
        success: false,
        errors: [`Migration failed: ${(error as Error).message}`],
        warnings,
        behavioralChanges,
        enhancements
      };
    }
  }

  /**
   * Migrate multiple legacy goals
   */
  async migrateGoals(
    legacyGoals: LegacyGoal[], 
    context: GoalExecutionContext,
    strategy?: MigrationStrategy
  ): Promise<{
    results: MigrationResult[];
    summary: {
      total: number;
      successful: number;
      failed: number;
      totalMigratedGoals: number;
    };
  }> {
    
    const results: MigrationResult[] = [];

    for (const legacyGoal of legacyGoals) {
      const result = await this.migrateGoal(legacyGoal, context, strategy);
      results.push(result);
    }

    const summary = {
      total: legacyGoals.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      totalMigratedGoals: results.reduce((sum, r) => sum + r.migratedGoals.length, 0)
    };

    return { results, summary };
  }

  /**
   * Create backward-compatible wrapper for new goals
   */
  createLegacyWrapper(goals: Goal[]): LegacyGoal[] {
    const wrappers: LegacyGoal[] = [];

    for (const goal of goals) {
      if (goal.level === GoalLevel.OPERATIONAL) {
        // Convert operational goals back to legacy format
        const wrapper = this.goalToLegacy(goal);
        if (wrapper) {
          wrappers.push(wrapper);
        }
      }
    }

    return wrappers;
  }

  /**
   * Migration strategy implementations
   */
  private async directConversion(
    legacyGoal: LegacyGoal, 
    context: GoalExecutionContext
  ): Promise<Goal[]> {
    
    const operationalGoal = await this.createOperationalGoal(legacyGoal, context);
    return [operationalGoal];
  }

  private async hierarchicalDecomposition(
    legacyGoal: LegacyGoal, 
    context: GoalExecutionContext
  ): Promise<Goal[]> {
    
    // Create strategic goal
    const strategicGoal = this.createStrategicGoal(legacyGoal, context);
    
    // Create tactical goal
    const tacticalGoal = this.createTacticalGoal(legacyGoal, strategicGoal, context);
    
    // Create operational goal
    const operationalGoal = await this.createOperationalGoal(legacyGoal, context);
    operationalGoal.parentGoal = tacticalGoal.id;
    
    // Link hierarchy
    strategicGoal.subgoals = [tacticalGoal.id];
    tacticalGoal.subgoals = [operationalGoal.id];
    tacticalGoal.parentGoal = strategicGoal.id;

    return [strategicGoal, tacticalGoal, operationalGoal];
  }

  private async contextOptimization(
    legacyGoal: LegacyGoal, 
    context: GoalExecutionContext
  ): Promise<Goal[]> {
    
    // Analyze current context to optimize goal structure
    const contextAnalysis = this.analyzeContextForMigration(legacyGoal, context);
    
    if (contextAnalysis.hasUrgentNeed) {
      // Create urgent operational goal
      const urgentGoal = await this.createOperationalGoal(legacyGoal, context);
      urgentGoal.priority = GoalPriority.CRITICAL;
      return [urgentGoal];
    }
    
    if (contextAnalysis.hasAbundantResources) {
      // Create enhanced goal with resource optimization
      return this.hierarchicalDecomposition(legacyGoal, context);
    }
    
    // Standard conversion
    return this.directConversion(legacyGoal, context);
  }

  private async preserveBehavior(
    legacyGoal: LegacyGoal, 
    context: GoalExecutionContext
  ): Promise<Goal[]> {
    
    // Create goal that mimics exact legacy behavior
    const behavioralGoal = await this.createBehavioralGoal(legacyGoal, context);
    return [behavioralGoal];
  }

  private async enhanceCapability(
    legacyGoal: LegacyGoal, 
    context: GoalExecutionContext
  ): Promise<Goal[]> {
    
    // Start with hierarchical decomposition
    const baseGoals = await this.hierarchicalDecomposition(legacyGoal, context);
    
    // Add enhancement features
    for (const goal of baseGoals) {
      goal.expectedLearning = this.generateLearningOutcomes(legacyGoal);
      goal.tags.push('enhanced', 'learning-enabled', 'adaptive');
    }

    return baseGoals;
  }

  /**
   * Goal creation helpers
   */
  private async createOperationalGoal(
    legacyGoal: LegacyGoal, 
    context: GoalExecutionContext
  ): Promise<Goal> {
    
    const now = Date.now();
    let objective: string;
    let successCriteria: string[];
    let requirements: ResourceRequirement[] = [];

    if (legacyGoal.type === 'item') {
      const itemData = legacyGoal.data as LegacyItemGoal;
      objective = `Acquire ${itemData.quantity}x ${itemData.itemType}`;
      successCriteria = [`Have ${itemData.quantity} ${itemData.itemType} in inventory`];
      requirements = [{
        type: 'item',
        name: itemData.itemType,
        quantity: itemData.quantity,
        consumable: false
      }];
    } else if (legacyGoal.type === 'build') {
      const buildData = legacyGoal.data as LegacyBuildGoal;
      objective = `Build ${buildData.structure}`;
      successCriteria = [`Structure ${buildData.structure} completed`];
      
      // Add material requirements
      if (buildData.materials) {
        requirements = Object.entries(buildData.materials).map(([name, quantity]) => ({
          type: 'item' as const,
          name,
          quantity,
          consumable: true
        }));
      }
    } else {
      throw new Error(`Unknown legacy goal type: ${(legacyGoal as any).type}`);
    }

    return {
      id: `goal_operational_${legacyGoal.id}_${now}`,
      name: objective,
      description: `Migrated from legacy goal: ${objective}`,
      level: GoalLevel.OPERATIONAL,
      status: legacyGoal.active ? GoalStatus.ACTIVE : GoalStatus.PENDING,
      priority: this.mapLegacyPriority(legacyGoal.priority),
      objective,
      successCriteria,
      createdAt: now,
      dependencies: [],
      subgoals: [],
      requirements,
      allocatedResources: [],
      progress: {
        percentage: 0,
        milestones: [],
        quality: { efficiency: 0, effectiveness: 0, elegance: 0, learning: 0 },
        timeSpent: 0,
        lastUpdate: now
      },
      motivationSource: 'legacy_migration',
      personalityAlignment: 0.5, // Neutral alignment
      ethicalScore: 0.8, // Generally ethical
      expectedLearning: [],
      tags: ['migrated', 'legacy'],
      category: legacyGoal.type,
      source: 'system'
    };
  }

  private createStrategicGoal(
    legacyGoal: LegacyGoal, 
    context: GoalExecutionContext
  ): Goal {
    
    const now = Date.now();
    let strategicObjective: string;
    
    if (legacyGoal.type === 'item') {
      const itemData = legacyGoal.data as LegacyItemGoal;
      strategicObjective = `Establish resource acquisition capability for ${itemData.itemType}`;
    } else if (legacyGoal.type === 'build') {
      const buildData = legacyGoal.data as LegacyBuildGoal;
      strategicObjective = `Develop construction expertise and infrastructure`;
    } else {
      strategicObjective = 'Achieve operational excellence';
    }

    return {
      id: `goal_strategic_${legacyGoal.id}_${now}`,
      name: strategicObjective,
      description: `Strategic goal derived from legacy: ${legacyGoal.id}`,
      level: GoalLevel.STRATEGIC,
      status: GoalStatus.ACTIVE,
      priority: GoalPriority.MEDIUM,
      objective: strategicObjective,
      successCriteria: [
        'Sustainable resource acquisition established',
        'Operational efficiency improved',
        'Capability development completed'
      ],
      createdAt: now,
      dependencies: [],
      subgoals: [],
      requirements: [],
      allocatedResources: [],
      progress: {
        percentage: 0,
        milestones: [],
        quality: { efficiency: 0, effectiveness: 0, elegance: 0, learning: 0 },
        timeSpent: 0,
        lastUpdate: now
      },
      motivationSource: 'strategic_planning',
      personalityAlignment: 0.7,
      ethicalScore: 0.9,
      expectedLearning: [
        { type: 'skill', area: 'planning', expectedGain: 0.8 },
        { type: 'knowledge', area: 'resource_management', expectedGain: 0.6 }
      ],
      tags: ['strategic', 'migrated', 'long_term'],
      category: 'strategic',
      source: 'system'
    };
  }

  private createTacticalGoal(
    legacyGoal: LegacyGoal, 
    strategicGoal: Goal, 
    context: GoalExecutionContext
  ): Goal {
    
    const now = Date.now();
    let tacticalObjective: string;
    
    if (legacyGoal.type === 'item') {
      const itemData = legacyGoal.data as LegacyItemGoal;
      tacticalObjective = `Implement efficient ${itemData.itemType} gathering and processing`;
    } else if (legacyGoal.type === 'build') {
      const buildData = legacyGoal.data as LegacyBuildGoal;
      tacticalObjective = `Execute construction project: ${buildData.structure}`;
    } else {
      tacticalObjective = 'Execute tactical operations';
    }

    return {
      id: `goal_tactical_${legacyGoal.id}_${now}`,
      name: tacticalObjective,
      description: `Tactical goal supporting: ${strategicGoal.name}`,
      level: GoalLevel.TACTICAL,
      status: GoalStatus.ACTIVE,
      priority: GoalPriority.HIGH,
      objective: tacticalObjective,
      successCriteria: [
        'Operational plan established',
        'Resources allocated',
        'Execution initiated'
      ],
      createdAt: now,
      dependencies: [{
        goalId: strategicGoal.id,
        type: 'prerequisite' as any,
        strength: 1.0
      }],
      subgoals: [],
      parentGoal: strategicGoal.id,
      requirements: [],
      allocatedResources: [],
      progress: {
        percentage: 0,
        milestones: [],
        quality: { efficiency: 0, effectiveness: 0, elegance: 0, learning: 0 },
        timeSpent: 0,
        lastUpdate: now
      },
      motivationSource: 'tactical_execution',
      personalityAlignment: 0.6,
      ethicalScore: 0.8,
      expectedLearning: [
        { type: 'experience', area: 'execution', expectedGain: 0.7 }
      ],
      tags: ['tactical', 'migrated', 'medium_term'],
      category: 'tactical',
      source: 'system'
    };
  }

  private async createBehavioralGoal(
    legacyGoal: LegacyGoal, 
    context: GoalExecutionContext
  ): Promise<Goal> {
    
    // Create goal that preserves exact legacy behavior
    const operationalGoal = await this.createOperationalGoal(legacyGoal, context);
    
    // Add behavioral preservation metadata
    operationalGoal.tags.push('behavior_preserved', 'legacy_compatible');
    operationalGoal.description += ' (Exact legacy behavior preserved)';
    
    return operationalGoal;
  }

  /**
   * Helper methods
   */
  private selectOptimalStrategy(legacyGoal: LegacyGoal, context: GoalExecutionContext): MigrationStrategy {
    // Analyze goal and context to select best migration strategy
    
    if (this.shouldPreserveBehavior(legacyGoal, context)) {
      return MigrationStrategy.PRESERVE_BEHAVIOR;
    }
    
    if (this.hasComplexRequirements(legacyGoal)) {
      return MigrationStrategy.HIERARCHICAL_DECOMPOSITION;
    }
    
    if (this.hasContextOpportunities(context)) {
      return MigrationStrategy.CONTEXT_OPTIMIZATION;
    }
    
    if (this.canEnhance(legacyGoal, context)) {
      return MigrationStrategy.ENHANCE_CAPABILITY;
    }
    
    return MigrationStrategy.DIRECT_CONVERSION;
  }

  private shouldPreserveBehavior(legacyGoal: LegacyGoal, context: GoalExecutionContext): boolean {
    // Preserve behavior for critical or time-sensitive goals
    return legacyGoal.priority <= 1 || legacyGoal.active;
  }

  private hasComplexRequirements(legacyGoal: LegacyGoal): boolean {
    if (legacyGoal.type === 'build') {
      const buildData = legacyGoal.data as LegacyBuildGoal;
      return !!(buildData.materials && Object.keys(buildData.materials).length > 3);
    }
    return false;
  }

  private hasContextOpportunities(context: GoalExecutionContext): boolean {
    return context.environmentalConditions.some(c => c.type === 'opportunity') ||
           context.availableResources.some(r => r.quantity > 50);
  }

  private canEnhance(legacyGoal: LegacyGoal, context: GoalExecutionContext): boolean {
    // Can enhance if we have good context and resources
    return context.availableResources.length > 5 && 
           context.environmentalConditions.filter(c => c.type === 'danger').length === 0;
  }

  private analyzeContextForMigration(legacyGoal: LegacyGoal, context: GoalExecutionContext): {
    hasUrgentNeed: boolean;
    hasAbundantResources: boolean;
    hasThreats: boolean;
    hasOpportunities: boolean;
  } {
    return {
      hasUrgentNeed: legacyGoal.priority <= 1,
      hasAbundantResources: context.availableResources.some(r => r.quantity > 100),
      hasThreats: context.environmentalConditions.some(c => c.type === 'danger'),
      hasOpportunities: context.environmentalConditions.some(c => c.type === 'opportunity')
    };
  }

  private generateLearningOutcomes(legacyGoal: LegacyGoal): any[] {
    const outcomes = [];
    
    if (legacyGoal.type === 'item') {
      outcomes.push({ type: 'skill', area: 'resource_gathering', expectedGain: 0.6 });
    } else if (legacyGoal.type === 'build') {
      outcomes.push({ type: 'skill', area: 'construction', expectedGain: 0.7 });
    }
    
    outcomes.push({ type: 'experience', area: 'goal_execution', expectedGain: 0.5 });
    return outcomes;
  }

  private mapLegacyPriority(legacyPriority: number): GoalPriority {
    if (legacyPriority <= 1) return GoalPriority.CRITICAL;
    if (legacyPriority <= 3) return GoalPriority.HIGH;
    if (legacyPriority <= 5) return GoalPriority.MEDIUM;
    if (legacyPriority <= 7) return GoalPriority.LOW;
    return GoalPriority.BACKGROUND;
  }

  private validateMigration(legacyGoal: LegacyGoal, migratedGoals: Goal[]): {
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (migratedGoals.length === 0) {
      errors.push('No goals were created during migration');
    }

    // Check for required goal levels
    const hasOperational = migratedGoals.some(g => g.level === GoalLevel.OPERATIONAL);
    if (!hasOperational) {
      errors.push('Migration must include at least one operational goal');
    }

    // Check for valid goal structure
    for (const goal of migratedGoals) {
      if (!goal.objective || goal.objective.trim() === '') {
        errors.push(`Goal ${goal.id} has empty objective`);
      }
      
      if (goal.successCriteria.length === 0) {
        warnings.push(`Goal ${goal.id} has no success criteria`);
      }
    }

    return { errors, warnings };
  }

  private goalToLegacy(goal: Goal): LegacyGoal | null {
    // Convert operational goal back to legacy format
    if (goal.level !== GoalLevel.OPERATIONAL) {
      return null;
    }

    const legacyId = goal.id.replace('goal_operational_', '').split('_')[0];
    
    if (goal.category === 'item') {
      // Extract item and quantity from objective
      const match = goal.objective.match(/Acquire (\d+)x (.+)/);
      if (match) {
        const [, quantity, itemType] = match;
        return {
          id: legacyId,
          type: 'item',
          priority: this.mapToLegacyPriority(goal.priority),
          active: goal.status === GoalStatus.ACTIVE,
          data: {
            type: 'item',
            itemType,
            quantity: parseInt(quantity),
            priority: this.mapToLegacyPriority(goal.priority),
            active: goal.status === GoalStatus.ACTIVE
          }
        };
      }
    } else if (goal.category === 'build') {
      // Extract structure name from objective
      const match = goal.objective.match(/Build (.+)/);
      if (match) {
        const [, structure] = match;
        return {
          id: legacyId,
          type: 'build',
          priority: this.mapToLegacyPriority(goal.priority),
          active: goal.status === GoalStatus.ACTIVE,
          data: {
            type: 'build',
            structure,
            materials: this.extractMaterialsFromRequirements(goal.requirements),
            priority: this.mapToLegacyPriority(goal.priority),
            active: goal.status === GoalStatus.ACTIVE
          }
        };
      }
    }

    return null;
  }

  private mapToLegacyPriority(priority: GoalPriority): number {
    switch (priority) {
      case GoalPriority.CRITICAL: return 0;
      case GoalPriority.HIGH: return 2;
      case GoalPriority.MEDIUM: return 5;
      case GoalPriority.LOW: return 7;
      case GoalPriority.BACKGROUND: return 9;
      default: return 5;
    }
  }

  private extractMaterialsFromRequirements(requirements: ResourceRequirement[]): Record<string, number> {
    const materials: Record<string, number> = {};
    
    for (const req of requirements) {
      if (req.type === 'item') {
        materials[req.name] = req.quantity;
      }
    }
    
    return materials;
  }

  /**
   * Get migration statistics
   */
  getMigrationStats(): {
    totalMigrations: number;
    successRate: number;
    commonStrategies: Record<MigrationStrategy, number>;
    commonErrors: string[];
  } {
    const total = this.migrationHistory.length;
    const successful = this.migrationHistory.filter(m => m.success).length;
    
    const strategyCounts = {} as Record<MigrationStrategy, number>;
    for (const migration of this.migrationHistory) {
      strategyCounts[migration.strategy] = (strategyCounts[migration.strategy] || 0) + 1;
    }

    const errorCounts = new Map<string, number>();
    for (const migration of this.migrationHistory) {
      for (const error of migration.errors) {
        errorCounts.set(error, (errorCounts.get(error) || 0) + 1);
      }
    }

    const commonErrors = Array.from(errorCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([error]) => error);

    return {
      totalMigrations: total,
      successRate: total > 0 ? successful / total : 0,
      commonStrategies: strategyCounts,
      commonErrors
    };
  }

  /**
   * Export migration history for analysis
   */
  exportMigrationHistory(): MigrationResult[] {
    return [...this.migrationHistory];
  }

  /**
   * Clear migration history
   */
  clearHistory(): void {
    this.migrationHistory = [];
  }
}

/**
 * Legacy goal data access interface
 */
export interface LegacyGoalDataAccess {
  loadLegacyGoals(): Promise<LegacyGoal[]>;
  saveLegacyGoals(goals: LegacyGoal[]): Promise<void>;
  backupLegacyGoals(): Promise<string>;
}

/**
 * Default implementation of legacy data access
 */
export class DefaultLegacyGoalDataAccess implements LegacyGoalDataAccess {
  async loadLegacyGoals(): Promise<LegacyGoal[]> {
    // This would integrate with the actual legacy goal storage
    // For now, return empty array
    return [];
  }

  async saveLegacyGoals(goals: LegacyGoal[]): Promise<void> {
    // This would save goals to the legacy storage system
    console.log(`Saving ${goals.length} legacy goals`);
  }

  async backupLegacyGoals(): Promise<string> {
    // This would create a backup of legacy goals
    const goals = await this.loadLegacyGoals();
    const backup = JSON.stringify(goals, null, 2);
    return backup;
  }
}