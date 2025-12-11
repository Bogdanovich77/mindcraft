/**
 * Anti-Idle Goal System Integration
 * Integrates anti-idle goal generation with existing goal system
 */
import { AntiIdleGoalGenerator } from './anti_idle_goal_generator.js';
/**
 * Anti-Idle Goal Integration
 * Provides integration between anti-idle goal generation and existing goal system
 */
export class AntiIdleGoalIntegration {
    antiIdleGoalGenerator;
    constructor(purposeState, // Using any to avoid type conflicts
    skillsSystem, memorySystem, worldContext) {
        this.antiIdleGoalGenerator = new AntiIdleGoalGenerator(purposeState, skillsSystem, memorySystem, undefined // No config provided, use defaults
        );
    }
    /**
     * Generate anti-idle goals if needed
     */
    async generateAntiIdleGoalsIfNeeded(goalState) {
        const activeGoals = [
            ...goalState.strategicGoals,
            ...goalState.tacticalGoals,
            ...goalState.operationalGoals
        ].filter(g => g.status === 'active');
        // Generate anti-idle goals if we have too few active goals
        if (activeGoals.length < 3) {
            const antiIdleGoalRequests = await this.antiIdleGoalGenerator.generateAntiIdleGoals(goalState);
            // Convert GoalCreationRequest[] to Goal[]
            const antiIdleGoals = antiIdleGoalRequests.map(request => ({
                id: request.name,
                name: request.name,
                description: request.description,
                level: request.level,
                type: 'strategic', // Proper type casting
                status: 'pending',
                priority: request.priority,
                objective: request.objective,
                successCriteria: request.successCriteria,
                createdAt: Date.now(),
                dependencies: [],
                subgoals: [],
                requirements: request.requirements || [],
                resources: {
                    items: {}, // Empty Record<string, number>
                    tools: []
                },
                allocatedResources: [],
                progress: {
                    percentage: 0,
                    milestones: [],
                    quality: { efficiency: 0, effectiveness: 0, elegance: 0, learning: 0 },
                    timeSpent: 0,
                    lastUpdate: Date.now(),
                    completedSteps: [],
                    blockers: []
                },
                motivationSource: request.motivationSource,
                personalityAlignment: 0.5,
                ethicalScore: 0.8,
                expectedLearning: [],
                tags: request.tags || [],
                source: 'anti_idle_system'
            }));
            console.log(`[ANTI_IDLE_GOAL_INTEGRATION] Generated ${antiIdleGoals.length} anti-idle goals`);
            return antiIdleGoals;
        }
        return [];
    }
    /**
     * Check if anti-idle goals should be generated
     */
    shouldGenerateAntiIdleGoals(goalState) {
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
    getStatus() {
        const now = Date.now();
        const timeSinceLastGeneration = now - (this.lastGenerationTime || 0);
        const generationRate = timeSinceLastGeneration > 0 ? 1000 / timeSinceLastGeneration : 0;
        return {
            totalGoalsGenerated: this.totalGoalsGenerated || 0,
            lastGenerationTime: this.lastGenerationTime || 0,
            generationRate
        };
    }
    totalGoalsGenerated = 0;
    lastGenerationTime = 0;
}
