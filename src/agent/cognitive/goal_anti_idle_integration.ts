/**
 * Anti-Idle Goal System Integration
 * Integrates anti-idle goal generation with existing goal system
 */

import { GoalState, Goal, GoalLevel, GoalStatus } from '../langgraph/interfaces.js';
import { AntiIdleGoalGenerator } from './anti_idle_goal_generator.js';
import { PurposeState } from './purpose_core.js';
import { SkillState } from './skills_system.js';
import { MemoryState } from '../memory/memory_system.js';
import { WorldContext } from '../langgraph/interfaces.js';

/**
 * Anti-Idle Goal Integration
 * Provides integration between anti-idle goal generation and existing goal system
 */
export class AntiIdleGoalIntegration {
  private antiIdleGoalGenerator: AntiIdleGoalGenerator;
  
  constructor(
    purposeState: PurposeState,
    skillState: SkillState,
    memoryState: MemoryState,
    worldContext: WorldContext
  ) {
    this.antiIdleGoalGenerator = new AntiIdleGoalGenerator(
      purposeState,
      skillState,
      memoryState,
      worldContext
    );
  }
  
  /**
   * Generate anti-idle goals if needed
   */
  generateAntiIdleGoalsIfNeeded(goalState: GoalState): Goal[] {
    const activeGoals = [
      ...goalState.strategicGoals,
      ...goalState.tacticalGoals,
      ...goalState.operationalGoals
    ].filter(g => g.status === 'active');
    
    // Generate anti-idle goals if we have too few active goals
    if (activeGoals.length < 3) {
      const antiIdleGoals = this.antiIdleGoalGenerator.generateAntiIdleGoals();
      
      console.log(`[ANTI_IDLE_GOAL_INTEGRATION] Generated ${antiIdleGoals.length} anti-idle goals`);
      return antiIdleGoals;
    }
    
    return [];
  }
  
  /**
   * Check if anti-idle goals should be generated
   */
  shouldGenerateAntiIdleGoals(goalState: GoalState): boolean {
    const activeGoals = [
      ...goalState.strategicGoals,
      ...goalState.tacticalGoals,
      ...goalState.operationalGoals
    ].filter(g => g.status === 'active');
    
    return activeGoals.length < 3;
  }
  
  /**
   * Get anti-idle goal generation status
   */
  getStatus(): {
    totalGoalsGenerated: number;
    lastGenerationTime: number;
    generationRate: number;
  } {
    const now = Date.now();
    const timeSinceLastGeneration = now - (this.lastGenerationTime || 0);
    const generationRate = timeSinceLastGeneration > 0 ? 1000 / timeSinceLastGeneration : 0;
    
    return {
      totalGoalsGenerated: this.totalGoalsGenerated || 0,
      lastGenerationTime: this.lastGenerationTime || 0,
      generationRate
    };
  }
  
  private totalGoalsGenerated: number = 0;
  private lastGenerationTime: number = 0;
}