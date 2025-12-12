/**
 * Skills System Integration Test
 *
 * Comprehensive test demonstrating integration between the dynamic skill progression
 * system, purpose core, and goal system. Shows how skills influence goal feasibility,
 * planning, and how personality affects learning preferences and rates.
 */
import { SkillType, ExperienceEvent } from './skill_types.js';
/**
 * Integration test configuration
 */
interface IntegrationTestConfig {
    testName: string;
    agentProfile: any;
    testGoals: any[];
    skillTests: Array<{
        skillType: SkillType;
        experienceEvents: ExperienceEvent[];
        expectedLearningGain: number;
    }>;
    expectedOutcomes: {
        skillProgression: Record<SkillType, number>;
        goalFeasibilityChanges: Record<string, boolean>;
        personalityInfluence: number;
        synergyEffects: number;
    };
}
/**
 * Skills Integration Test Suite
 */
export declare class SkillsIntegrationTest {
    private skillsSystem;
    private learningEngine;
    private synergySystem;
    private milestoneSystem;
    private experienceTracker;
    private skillsBridge;
    private purposeCore;
    private goalSystem;
    private personality;
    private agentState;
    constructor();
    /**
     * Initialize all system components for testing
     */
    private initializeComponents;
    /**
     * Create mock agent state for testing
     */
    private createMockAgentState;
    /**
     * Run comprehensive integration test
     */
    runIntegrationTest(config: IntegrationTestConfig): Promise<{
        success: boolean;
        results: any;
        metrics: any;
        analysis: string;
    }>;
    /**
     * Initialize test with specific configuration
     */
    private initializeTest;
    /**
     * Test skill progression with experience events
     */
    private testSkillProgression;
    /**
     * Test goal integration with skills system
     */
    private testGoalIntegration;
    /**
     * Test personality influence on learning
     */
    private testPersonalityInfluence;
    /**
     * Test synergy effects between skills
     */
    private testSynergyEffects;
    /**
     * Evaluate goal feasibility based on current skills
     */
    private evaluateGoalFeasibility;
    /**
     * Identify skills required for a goal
     */
    private identifyRequiredSkills;
    /**
     * Simulate skill improvement for testing
     */
    private simulateSkillImprovement;
    /**
     * Calculate personality alignment with skill category
     */
    private calculatePersonalityAlignment;
    /**
     * Analyze test results
     */
    private analyzeTestResults;
    /**
     * Validate test results against expected outcomes
     */
    private validateTestResults;
    /**
     * Collect comprehensive metrics from all systems
     */
    private collectMetrics;
    /**
     * Calculate average skill level across all skills
     */
    private calculateAverageSkillLevel;
    /**
     * Run a comprehensive demo of the integrated system
     */
    runDemo(): Promise<void>;
    /**
     * Helper to create experience events for testing
     */
    private createExperienceEvent;
}
/**
 * Export the integration test class for use in other modules
 */
export default SkillsIntegrationTest;
/**
 * Quick demo function for standalone testing
 */
export declare function runQuickDemo(): Promise<void>;
//# sourceMappingURL=skills_integration_test.d.ts.map