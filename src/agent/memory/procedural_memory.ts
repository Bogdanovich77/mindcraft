import type { 
  ProceduralSkill, 
  ProceduralStep, 
  ProceduralAdaptation,
  MemoryQuery,
  WorldContext 
} from '../langgraph/interfaces.js';
import type { ExtendedEpisodicEvent } from './episodic_memory.js';

/**
 * Procedural memory system for storing skills, routines, and strategies with adaptation
 */
export class ProceduralMemory {
  private skills: Map<string, ExtendedProceduralSkill> = new Map();
  private routines: Map<string, ProceduralRoutine> = new Map();
  private strategies: Map<string, ProceduralStrategy> = new Map();
  private performanceHistory: Map<string, PerformanceRecord[]> = new Map();
  
  private maxSkills: number = 200;
  private maxRoutines: number = 100;
  private maxStrategies: number = 50;
  private adaptationThreshold: number = 0.1; // Minimum performance improvement to keep adaptation
  
  constructor() {
    this.initializeBasicSkills();
  }
  
  /**
   * Initialize basic Minecraft skills
   */
  private initializeBasicSkills(): void {
    const basicSkills = [
      {
        id: 'movement',
        name: 'Basic Movement',
        type: 'skill' as const,
        sequence: [
          {
            action: 'move_forward',
            parameters: { distance: 1 },
            conditions: ['path_clear'],
            expectedOutcome: 'position_changed',
            duration: 500
          }
        ],
        conditions: ['alive', 'not_stuck'],
        outcomes: ['position_changed'],
        proficiency: 0.8,
        usageCount: 0,
        lastUsed: Date.now()
      },
      {
        id: 'dig_block',
        name: 'Dig Block',
        type: 'skill' as const,
        sequence: [
          {
            action: 'target_block',
            parameters: { range: 5 },
            conditions: ['block_in_range'],
            expectedOutcome: 'block_targeted',
            duration: 200
          },
          {
            action: 'dig',
            parameters: {},
            conditions: ['block_targeted', 'tool_equipped'],
            expectedOutcome: 'block_dropped',
            duration: 1000
          }
        ],
        conditions: ['tool_equipped', 'block_in_range'],
        outcomes: ['block_dropped', 'tool_damage'],
        proficiency: 0.6,
        usageCount: 0,
        lastUsed: Date.now()
      },
      {
        id: 'emergency_escape',
        name: 'Emergency Escape',
        type: 'strategy' as const,
        sequence: [
          {
            action: 'assess_threat',
            parameters: { scan_radius: 10 },
            conditions: ['danger_detected'],
            expectedOutcome: 'threat_identified',
            duration: 100
          },
          {
            action: 'find_escape_route',
            parameters: { avoid_threats: true },
            conditions: ['threat_identified'],
            expectedOutcome: 'escape_route_found',
            duration: 500
          },
          {
            action: 'move_to_safety',
            parameters: { urgency: 'high' },
            conditions: ['escape_route_found'],
            expectedOutcome: 'safe_position_reached',
            duration: 2000
          }
        ],
        conditions: ['danger_detected', 'low_health'],
        outcomes: ['safe_position_reached', 'threat_avoided'],
        proficiency: 0.7,
        usageCount: 0,
        lastUsed: Date.now()
      }
    ];
    
    for (const skill of basicSkills) {
      this.skills.set(skill.id, {
        ...skill,
        adaptations: []
      });
    }
  }
  
  /**
   * Store a new procedural skill
   */
  async storeSkill(skill: ProceduralSkill): Promise<void> {
    const extendedSkill: ExtendedProceduralSkill = {
      ...skill,
      adaptations: skill.adaptations || []
    };
    
    // Check capacity limits
    if (this.skills.size >= this.maxSkills) {
      await this.cleanupLeastUsedSkills();
    }
    
    // Update existing skill or add new one
    if (this.skills.has(skill.id)) {
      const existing = this.skills.get(skill.id)!;
      
      // Update proficiency with weighted average
      existing.proficiency = (existing.proficiency * 0.7 + skill.proficiency * 0.3);
      existing.lastUsed = Date.now();
      
      // Merge adaptations if they improve performance
      for (const adaptation of skill.adaptations) {
        await this.mergeAdaptation(existing, adaptation);
      }
    } else {
      this.skills.set(skill.id, extendedSkill);
    }
  }
  
  /**
   * Learn from experience and improve skills
   */
  async learnFromExperience(event: ExtendedEpisodicEvent): Promise<void> {
    if (!event.action || !event.success) return;
    
    // Find related skills
    const relatedSkills = this.findSkillsByAction(event.action);
    
    for (const skill of relatedSkills) {
      // Update proficiency based on success
      const improvement = event.importance * 0.1;
      skill.proficiency = Math.min(1.0, skill.proficiency + improvement);
      skill.usageCount++;
      skill.lastUsed = Date.now();
      
      // Record performance
      await this.recordPerformance(skill.id, {
        timestamp: event.timestamp,
        success: event.success,
        duration: event.duration || 1000,
        context: {
          position: event.location,
          health: 20, // Default values - in real implementation these would come from event
          food: 20,
          experience: 0,
          dimension: 'overworld',
          timeOfDay: 0,
          weather: 'clear',
          nearbyEntities: [],
          nearbyBlocks: [],
          inventory: [],
          equipment: {
            helmet: undefined,
            chestplate: undefined,
            leggings: undefined,
            boots: undefined,
            weapon: undefined
          }
        },
        effectiveness: event.importance
      });
      
      // Check for adaptation opportunities
      if (event.metadata?.adaptation) {
        await this.createAdaptation(skill, event);
      }
    }
  }
  
  /**
   * Query procedural memory
   */
  async query(query: MemoryQuery): Promise<ProceduralSkill[]> {
    const results: ProceduralSkill[] = [];
    const queryLower = query.query.toLowerCase();
    
    for (const skill of this.skills.values()) {
      // Apply type filter
      if (query.filters?.type && skill.type !== query.filters.type) {
        continue;
      }
      
      // Apply proficiency filter
      if (query.importance && skill.proficiency < query.importance) {
        continue;
      }
      
      // Check text relevance
      let relevance = 0;
      if (skill.name.toLowerCase().includes(queryLower)) {
        relevance += 0.8;
      }
      
      // Check sequence actions
      for (const step of skill.sequence) {
        if (step.action.toLowerCase().includes(queryLower)) {
          relevance += 0.4;
        }
      }
      
      // Check outcomes
      for (const outcome of skill.outcomes) {
        if (outcome.toLowerCase().includes(queryLower)) {
          relevance += 0.3;
        }
      }
      
      // Calculate final score
      const score = relevance * skill.proficiency;
      
      if (score > 0.1) {
        results.push(skill);
      }
    }
    
    // Sort by proficiency and relevance
    results.sort((a, b) => (b.proficiency * b.usageCount) - (a.proficiency * a.usageCount));
    
    if (query.limit) {
      return results.slice(0, query.limit);
    }
    
    return results;
  }
  
  /**
   * Get best skill for given context
   */
  getBestSkillForContext(context: WorldContext, action?: string): ProceduralSkill | null {
    let candidates = Array.from(this.skills.values());
    
    // Filter by action if specified
    if (action) {
      candidates = candidates.filter(skill => 
        skill.sequence.some(step => step.action === action)
      );
    }
    
    // Filter by applicable conditions
    candidates = candidates.filter(skill => 
      this.areConditionsMet(skill.conditions, context)
    );
    
    if (candidates.length === 0) return null;
    
    // Select best based on proficiency and recent success
    return candidates.reduce((best, current) => {
      const bestScore = this.calculateSkillScore(best, context);
      const currentScore = this.calculateSkillScore(current, context);
      return currentScore > bestScore ? current : best;
    });
  }
  
  /**
   * Create routine from frequently used skill sequence
   */
  async createRoutine(skillIds: string[], name: string): Promise<void> {
    if (this.routines.size >= this.maxRoutines) {
      await this.cleanupLeastUsedRoutines();
    }
    
    const routine: ProceduralRoutine = {
      id: `routine_${Date.now()}`,
      name,
      skills: skillIds,
      triggerConditions: [],
      frequency: 0,
      efficiency: 0,
      lastUsed: Date.now()
    };
    
    this.routines.set(routine.id, routine);
  }
  
  /**
   * Execute skill with adaptation
   */
  async executeSkill(skillId: string, context: WorldContext): Promise<SkillExecutionResult> {
    const skill = this.skills.get(skillId);
    if (!skill) {
      return { success: false, error: 'Skill not found' };
    }
    
    // Check conditions
    if (!this.areConditionsMet(skill.conditions, context)) {
      return { success: false, error: 'Conditions not met' };
    }
    
    // Select best adaptation for context
    const adaptation = this.selectBestAdaptation(skill, context);
    const sequence = adaptation?.modification || skill.sequence;
    
    // Update usage statistics
    skill.usageCount++;
    skill.lastUsed = Date.now();
    
    return {
      success: true,
      sequence,
      adaptation: adaptation?.context,
      estimatedDuration: sequence.reduce((sum, step) => sum + step.duration, 0)
    };
  }
  
  /**
   * Rank skills by relevance to query
   */
  rankByRelevance(skills: ProceduralSkill[], query: MemoryQuery): ProceduralSkill[] {
    return skills.sort((a, b) => {
      const scoreA = this.calculateRelevanceScore(a, query);
      const scoreB = this.calculateRelevanceScore(b, query);
      return scoreB - scoreA;
    });
  }
  
  /**
   * Get memory statistics
   */
  getStatistics() {
    const totalProficiency = Array.from(this.skills.values()).reduce((sum, s) => sum + s.proficiency, 0);
    const totalUsage = Array.from(this.skills.values()).reduce((sum, s) => sum + s.usageCount, 0);
    
    return {
      skillCount: this.skills.size,
      averageProficiency: this.skills.size > 0 ? totalProficiency / this.skills.size : 0,
      totalUsage
    };
  }
  
  /**
   * Cleanup old skills
   */
  async cleanup(): Promise<void> {
    await this.cleanupLeastUsedSkills();
    await this.cleanupLeastUsedRoutines();
    await this.cleanupPoorAdaptations();
  }
  
  /**
   * Private helper methods
   */
  private findSkillsByAction(action: string): ExtendedProceduralSkill[] {
    return Array.from(this.skills.values()).filter(skill =>
      skill.sequence.some(step => step.action === action)
    );
  }
  
  private async recordPerformance(skillId: string, record: PerformanceRecord): Promise<void> {
    if (!this.performanceHistory.has(skillId)) {
      this.performanceHistory.set(skillId, []);
    }
    
    const history = this.performanceHistory.get(skillId)!;
    history.push(record);
    
    // Keep only recent performance records
    const cutoff = Date.now() - (7 * 24 * 60 * 60 * 1000); // 7 days
    const recent = history.filter(r => r.timestamp > cutoff);
    this.performanceHistory.set(skillId, recent);
  }
  
  private async createAdaptation(skill: ExtendedProceduralSkill, event: ExtendedEpisodicEvent): Promise<void> {
    const adaptation: ProceduralAdaptation = {
      context: JSON.stringify(event.location),
      modification: skill.sequence, // Start with current sequence
      performance: event.importance,
      timestamp: event.timestamp
    };
    
    // TODO: Implement actual adaptation logic based on event metadata
    // For now, just store the basic adaptation
    
    skill.adaptations.push(adaptation);
    
    // Limit adaptations per skill
    if (skill.adaptations.length > 10) {
      skill.adaptations.sort((a, b) => b.performance - a.performance);
      skill.adaptations = skill.adaptations.slice(0, 10);
    }
  }
  
  private async mergeAdaptation(skill: ExtendedProceduralSkill, newAdaptation: ProceduralAdaptation): Promise<void> {
    const existingIndex = skill.adaptations.findIndex(a => a.context === newAdaptation.context);
    
    if (existingIndex >= 0) {
      const existing = skill.adaptations[existingIndex];
      // Keep the better performing adaptation
      if (newAdaptation.performance > existing.performance) {
        skill.adaptations[existingIndex] = newAdaptation;
      }
    } else {
      skill.adaptations.push(newAdaptation);
    }
  }
  
  private areConditionsMet(conditions: string[], context: WorldContext): boolean {
    // Simple condition checking - in real implementation, this would be more sophisticated
    for (const condition of conditions) {
      switch (condition) {
        case 'alive':
          if (context.health <= 0) return false;
          break;
        case 'low_health':
          if (context.health > 5) return false;
          break;
        case 'tool_equipped':
          if (!context.equipment.weapon && !context.equipment.helmet) return false;
          break;
        // Add more condition checks as needed
      }
    }
    return true;
  }
  
  private selectBestAdaptation(skill: ExtendedProceduralSkill, context: WorldContext): ProceduralAdaptation | null {
    if (skill.adaptations.length === 0) return null;
    
    // For now, return the best performing adaptation
    // In real implementation, this would consider context matching
    return skill.adaptations.reduce((best, current) => 
      current.performance > best.performance ? current : best
    );
  }
  
  private calculateSkillScore(skill: ProceduralSkill, context: WorldContext): number {
    const recentPerformance = this.getRecentPerformance(skill.id);
    const performanceBonus = recentPerformance ? recentPerformance.effectiveness : 0;
    const recencyBonus = this.calculateRecencyBonus(skill.lastUsed);
    
    return skill.proficiency * 0.6 + performanceBonus * 0.3 + recencyBonus * 0.1;
  }
  
  private getRecentPerformance(skillId: string): PerformanceRecord | null {
    const history = this.performanceHistory.get(skillId);
    if (!history || history.length === 0) return null;
    
    // Get most recent performance
    return history.reduce((mostRecent, current) => 
      current.timestamp > mostRecent.timestamp ? current : mostRecent
    );
  }
  
  private calculateRecencyBonus(lastUsed: number): number {
    const daysSinceUse = (Date.now() - lastUsed) / (1000 * 60 * 60 * 24);
    return Math.max(0, 1 - daysSinceUse / 30); // Decay over 30 days
  }
  
  private calculateRelevanceScore(skill: ProceduralSkill, query: MemoryQuery): number {
    const queryLower = query.query.toLowerCase();
    let score = 0;
    
    if (skill.name.toLowerCase().includes(queryLower)) score += 0.8;
    
    for (const step of skill.sequence) {
      if (step.action.toLowerCase().includes(queryLower)) score += 0.4;
    }
    
    for (const outcome of skill.outcomes) {
      if (outcome.toLowerCase().includes(queryLower)) score += 0.3;
    }
    
    return score * skill.proficiency;
  }
  
  private async cleanupLeastUsedSkills(): Promise<void> {
    if (this.skills.size <= this.maxSkills * 0.8) return;
    
    const sorted = Array.from(this.skills.entries())
      .sort(([, a], [, b]) => {
        const scoreA = a.proficiency * a.usageCount;
        const scoreB = b.proficiency * b.usageCount;
        return scoreA - scoreB;
      });
    
    const toRemove = Math.floor(sorted.length * 0.2);
    for (let i = 0; i < toRemove; i++) {
      this.skills.delete(sorted[i][0]);
      this.performanceHistory.delete(sorted[i][0]);
    }
  }
  
  private async cleanupLeastUsedRoutines(): Promise<void> {
    if (this.routines.size <= this.maxRoutines * 0.8) return;
    
    const sorted = Array.from(this.routines.entries())
      .sort(([, a], [, b]) => a.frequency - b.frequency);
    
    const toRemove = Math.floor(sorted.length * 0.2);
    for (let i = 0; i < toRemove; i++) {
      this.routines.delete(sorted[i][0]);
    }
  }
  
  private async cleanupPoorAdaptations(): Promise<void> {
    for (const skill of this.skills.values()) {
      skill.adaptations = skill.adaptations.filter(adaptation => 
        adaptation.performance >= this.adaptationThreshold
      );
    }
  }
}

// Extended interfaces
export interface ExtendedProceduralSkill extends ProceduralSkill {
  adaptations: ProceduralAdaptation[];
}

export interface ProceduralRoutine {
  id: string;
  name: string;
  skills: string[];
  triggerConditions: string[];
  frequency: number;
  efficiency: number;
  lastUsed: number;
}

export interface ProceduralStrategy {
  id: string;
  name: string;
  goals: string[];
  tactics: string[];
  successRate: number;
  complexity: number;
}

export interface PerformanceRecord {
  timestamp: number;
  success: boolean;
  duration: number;
  context: WorldContext;
  effectiveness: number;
}

export interface SkillExecutionResult {
  success: boolean;
  sequence?: ProceduralStep[];
  adaptation?: string;
  estimatedDuration?: number;
  error?: string;
}