/**
 * Anti-Idle Goal System Integration
 * Integrates anti-idle goal generation with existing goal system
 */
import { GoalState, Goal } from '../langgraph/interfaces.js';
import { SkillsSystem } from './skills_system.js';
import { MemorySystem } from '../memory/memory_system.js';
import { WorldContext } from '../langgraph/interfaces.js';
/**
 * Anti-Idle Goal Integration
 * Provides integration between anti-idle goal generation and existing goal system
 */
export declare class AntiIdleGoalIntegration {
    private antiIdleGoalGenerator;
    constructor(purposeState: any, // Using any to avoid type conflicts
    skillsSystem: SkillsSystem, memorySystem: MemorySystem, worldContext: WorldContext);
    /**
     * Generate anti-idle goals if needed
     */
    generateAntiIdleGoalsIfNeeded(goalState: GoalState): Promise<Goal[]>;
    /**
     * Check if anti-idle goals should be generated
     */
    shouldGenerateAntiIdleGoals(goalState: GoalState): boolean;
    /**
     * Get anti-idle goal generation status
     */
    getStatus(): {
        totalGoalsGenerated: number;
        lastGenerationTime: number;
        generationRate: number;
    };
    private totalGoalsGenerated;
    private lastGenerationTime;
}
//# sourceMappingURL=goal_anti_idle_integration.d.ts.map