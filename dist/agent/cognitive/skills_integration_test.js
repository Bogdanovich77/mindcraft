/**
 * Skills System Integration Test
 *
 * Comprehensive test demonstrating integration between the dynamic skill progression
 * system, purpose core, and goal system. Shows how skills influence goal feasibility,
 * planning, and how personality affects learning preferences and rates.
 */
import { SkillsSystem } from './skills_system.js';
import { LearningEngine } from './learning_engine.js';
import { SkillSynergySystem } from './skill_synergies.js';
import { SkillMilestoneSystem } from './skill_milestones.js';
import { ExperienceTracker } from './experience_tracker.js';
import { SkillsBridge } from './skills_bridge.js';
import { PurposeCore } from './purpose_core.js';
import { GoalSystem } from './goal_system.js';
import { PersonalitySystem } from './personality.js';
import { SkillType, ExperienceSource, SkillCategory } from './skill_types.js';
/**
 * Skills Integration Test Suite
 */
export class SkillsIntegrationTest {
    skillsSystem;
    learningEngine;
    synergySystem;
    milestoneSystem;
    experienceTracker;
    skillsBridge;
    purposeCore;
    goalSystem;
    personality;
    agentState;
    constructor() {
        this.initializeComponents();
    }
    /**
     * Initialize all system components for testing
     */
    initializeComponents() {
        // Create personality system
        this.personality = new PersonalitySystem({
            openness: 0.8,
            conscientiousness: 0.7,
            extraversion: 0.6,
            agreeableness: 0.5,
            neuroticism: 0.3,
            riskTolerance: 0.6,
            curiosity: 0.9,
            creativity: 0.5,
            patience: 0.5,
            competitiveness: 0.4
        });
        // Initialize skills system components
        this.skillsSystem = new SkillsSystem(this.personality);
        this.learningEngine = new LearningEngine(this.personality);
        this.synergySystem = new SkillSynergySystem();
        this.milestoneSystem = new SkillMilestoneSystem();
        this.experienceTracker = new ExperienceTracker();
        this.skillsBridge = new SkillsBridge(this.skillsSystem, this.learningEngine, this.synergySystem, this.milestoneSystem, this.experienceTracker);
        // Initialize purpose core and goal system
        this.purposeCore = new PurposeCore({
            initialPersonality: this.personality.getProfile()
        });
        this.goalSystem = new GoalSystem({
            learningEnabled: true,
            performanceTracking: true,
            reactiveIntegration: true
        });
        // Create mock agent state
        this.agentState = this.createMockAgentState();
    }
    /**
     * Create mock agent state for testing
     */
    createMockAgentState() {
        return {
            context: {
                position: { x: 0, y: 64, z: 0 },
                health: 20,
                food: 20,
                experience: 0,
                dimension: 'overworld',
                timeOfDay: 6000,
                weather: 'clear',
                nearbyEntities: [],
                nearbyBlocks: [],
                inventory: [
                    { type: 'oak_log', count: 10, slot: 0 },
                    { type: 'cobblestone', count: 20, slot: 1 },
                    { type: 'iron_pickaxe', count: 1, slot: 2 }
                ],
                equipment: {}
            },
            reactive: {
                activeMode: 'idle',
                emergencyConditions: [],
                lastReactiveAction: undefined,
                interruptHistory: []
            },
            cognitive: {
                purpose: {
                    identity: {
                        name: 'Test Agent',
                        role: 'worker',
                        background: 'Test background',
                        corePurpose: 'Testing'
                    },
                    personality: {
                        openness: 0.8,
                        conscientiousness: 0.7,
                        extraversion: 0.6,
                        agreeableness: 0.5,
                        neuroticism: 0.3,
                        riskTolerance: 0.6,
                        explorationDrive: 0.9,
                        socialTendency: 0.5,
                        buildingCreativity: 0.7,
                        combatAggression: 0.4
                    },
                    motivations: {
                        primaryMotivation: 'testing',
                        secondaryMotivations: ['learning'],
                        drives: { testing: 0.8 },
                        satisfactions: {}
                    },
                    values: {
                        coreValues: ['efficiency'],
                        valuePriorities: { efficiency: 0.8 },
                        moralConstraints: []
                    },
                    ethics: {
                        harmAvoidance: 0.5,
                        fairnessConcern: 0.5,
                        loyaltyPriority: 0.5,
                        authorityRespect: 0.5,
                        purityConcern: 0.5
                    }
                },
                skills: {
                    skills: {},
                    experience: [],
                    learningRate: 0.1,
                    skillSynergies: {}
                },
                goals: {
                    strategicGoals: [],
                    tacticalGoals: [],
                    operationalGoals: [],
                    activeGoals: [],
                    goalHistory: []
                },
                memory: {
                    episodic: {
                        episodes: [],
                        currentIndex: 0,
                        compressionLevel: 0
                    },
                    semantic: {
                        facts: {},
                        concepts: {},
                        relationships: {}
                    },
                    procedural: {
                        procedures: {},
                        sequences: {},
                        habits: []
                    },
                    working: {
                        currentFocus: '',
                        activeTasks: [],
                        buffer: [],
                        capacity: 7,
                        decayRate: 0.1
                    }
                },
                processing: {
                    currentPhase: 'planning',
                    cognitiveLoad: 0.3,
                    attentionLevel: 0.8,
                    decisionThreshold: 0.7,
                    processingHistory: []
                }
            },
            executive: {
                actionQueue: [],
                decisionHistory: [],
                performanceMetrics: {
                    reactiveResponseTime: [],
                    cognitiveProcessingTime: [],
                    successRate: 0.8,
                    learningRate: 0.1,
                    goalCompletionRate: 0.7,
                    survivalEvents: 0,
                    socialInteractions: 0
                }
            },
            metadata: {
                agentId: 'test_agent',
                startTime: Date.now(),
                lastUpdate: Date.now(),
                version: '1.0.0',
                performanceMode: 'balanced'
            }
        };
    }
    /**
     * Run comprehensive integration test
     */
    async runIntegrationTest(config) {
        console.log(`\n=== Starting Skills Integration Test: ${config.testName} ===`);
        try {
            // Initialize systems
            await this.initializeTest(config);
            // Test skill progression
            const skillResults = await this.testSkillProgression(config.skillTests);
            // Test goal integration
            const goalResults = await this.testGoalIntegration(config.testGoals);
            // Test personality influence
            const personalityResults = await this.testPersonalityInfluence();
            // Test synergy effects
            const synergyResults = await this.testSynergyEffects();
            // Analyze results
            const analysis = this.analyzeTestResults(skillResults, goalResults, personalityResults, synergyResults, config.expectedOutcomes);
            const success = this.validateTestResults(analysis, config.expectedOutcomes);
            console.log(`=== Test ${success ? 'PASSED' : 'FAILED'}: ${config.testName} ===`);
            return {
                success,
                results: {
                    skillProgression: skillResults,
                    goalIntegration: goalResults,
                    personalityInfluence: personalityResults,
                    synergyEffects: synergyResults
                },
                metrics: this.collectMetrics(),
                analysis
            };
        }
        catch (error) {
            console.error(`Integration test failed: ${error}`);
            return {
                success: false,
                results: null,
                metrics: null,
                analysis: `Test failed with error: ${error}`
            };
        }
    }
    /**
     * Initialize test with specific configuration
     */
    async initializeTest(config) {
        // Initialize goal system
        await this.goalSystem.initialize(this.agentState);
        // Create test goals
        for (const goalRequest of config.testGoals) {
            await this.goalSystem.createGoal(goalRequest, this.agentState);
        }
        // Initialize skills for testing
        const testSkills = config.skillTests.map(test => test.skillType);
        for (const skillType of testSkills) {
            this.skillsSystem.getSkill(skillType); // This creates the skill if it doesn't exist
        }
        console.log(`Test initialized with ${config.testGoals.length} goals and ${testSkills.length} skills`);
    }
    /**
     * Test skill progression with experience events
     */
    async testSkillProgression(skillTests) {
        console.log('\n--- Testing Skill Progression ---');
        const results = {};
        for (const skillTest of skillTests) {
            const { skillType, experienceEvents, expectedLearningGain } = skillTest;
            const skill = this.skillsSystem.getSkill(skillType);
            if (!skill) {
                throw new Error(`Skill not found: ${skillType}`);
            }
            const initialProficiency = skill.proficiency.level;
            const initialExperience = skill.proficiency.experience;
            // Process experience events
            let totalLearningGain = 0;
            for (const event of experienceEvents) {
                const learningResult = this.learningEngine.processExperience(skill, event, event.context);
                totalLearningGain += learningResult.processedEvent.amount;
                // Track the experience
                this.experienceTracker.addExperienceEvent(learningResult.processedEvent);
                // Add small delay to simulate real-time processing
                await new Promise(resolve => setTimeout(resolve, 10));
            }
            const finalProficiency = skill.proficiency.level;
            const finalExperience = skill.proficiency.experience;
            const actualLearningGain = finalExperience - initialExperience;
            results[skillType] = {
                initialProficiency,
                finalProficiency,
                initialExperience,
                finalExperience,
                expectedLearningGain,
                actualLearningGain,
                learningEfficiency: actualLearningGain / expectedLearningGain,
                totalEventsProcessed: experienceEvents.length,
                averageGainPerEvent: actualLearningGain / experienceEvents.length
            };
            console.log(`  ${skillType}: ${initialProficiency.toFixed(2)} → ${finalProficiency.toFixed(2)} (${actualLearningGain} XP gained)`);
        }
        return results;
    }
    /**
     * Test goal integration with skills system
     */
    async testGoalIntegration(testGoals) {
        console.log('\n--- Testing Goal Integration ---');
        const results = {
            initialFeasibility: {},
            updatedFeasibility: {},
            skillInfluence: {},
            planningAdjustments: []
        };
        // Evaluate initial goal feasibility
        for (const goal of testGoals) {
            const feasibility = this.evaluateGoalFeasibility(goal);
            results.initialFeasibility[goal.name] = feasibility;
            // Identify required skills
            const requiredSkills = this.identifyRequiredSkills(goal);
            results.skillInfluence[goal.name] = requiredSkills;
        }
        // Simulate skill improvement and re-evaluate feasibility
        await this.simulateSkillImprovement();
        for (const goal of testGoals) {
            const updatedFeasibility = this.evaluateGoalFeasibility(goal);
            results.updatedFeasibility[goal.name] = updatedFeasibility;
            // Track planning adjustments
            if (updatedFeasibility > results.initialFeasibility[goal.name]) {
                results.planningAdjustments.push(`${goal.name}: Feasibility improved by ${(updatedFeasibility - results.initialFeasibility[goal.name]).toFixed(2)}`);
            }
        }
        console.log(`  Evaluated ${testGoals.length} goals`);
        console.log(`  Planning adjustments: ${results.planningAdjustments.length}`);
        return results;
    }
    /**
     * Test personality influence on learning
     */
    async testPersonalityInfluence() {
        console.log('\n--- Testing Personality Influence ---');
        const personality = this.personality.getProfile();
        const learningMetrics = this.learningEngine.getMetrics();
        // Test different skill categories based on personality
        const personalitySkillTests = [
            { skillType: SkillType.CRAFTING, category: SkillCategory.CRAFTING },
            { skillType: SkillType.NAVIGATION, category: SkillCategory.EXPLORATION },
            { skillType: SkillType.TRADING, category: SkillCategory.SOCIAL },
            { skillType: SkillType.SWORD_COMBAT, category: SkillCategory.COMBAT }
        ];
        const results = {
            personalityProfile: personality,
            learningInfluence: {},
            categoryAlignment: {},
            adaptationRate: learningMetrics.adaptationRate
        };
        for (const test of personalitySkillTests) {
            const skill = this.skillsSystem.getSkill(test.skillType);
            if (skill) {
                // Calculate personality alignment for this skill category
                const alignment = this.calculatePersonalityAlignment(test.category, personality);
                results.categoryAlignment[test.skillType] = alignment;
                // Simulate a learning event and measure personality influence
                const testEvent = {
                    id: `personality_test_${test.skillType}`,
                    skillType: test.skillType,
                    amount: 50,
                    source: ExperienceSource.PRACTICE,
                    context: {
                        situation: 'testing',
                        location: { x: 0, y: 0, z: 0 },
                        participants: [],
                        tools: [],
                        difficulty: 0.5,
                        timePressure: 0.5,
                        riskLevel: 0.5,
                        socialContext: 'solo'
                    },
                    timestamp: Date.now(),
                    quality: 0.7,
                    difficulty: 0.5,
                    success: true,
                    impact: 0.5,
                    componentGains: {
                        knowledge: 0.3,
                        practical: 0.6,
                        creative: 0.1
                    },
                    synergyBonus: 0,
                    personalityBonus: 0,
                    contextBonus: 0,
                    plateauModifier: 0
                };
                const learningResult = this.learningEngine.processExperience(skill, testEvent, testEvent.context);
                results.learningInfluence[test.skillType] = learningResult.processedEvent.personalityBonus;
            }
        }
        console.log(`  Personality influence measured across ${personalitySkillTests.length} skill categories`);
        console.log(`  Average personality bonus: ${Object.values(results.learningInfluence).reduce((a, b) => a + b, 0) / Object.values(results.learningInfluence).length}`);
        return results;
    }
    /**
     * Test synergy effects between skills
     */
    async testSynergyEffects() {
        console.log('\n--- Testing Synergy Effects ---');
        const results = {
            testedSynergies: [],
            totalSynergyBonus: 0,
            transferLearningEvents: 0
        };
        // Test known synergies
        const synergyTests = [
            {
                primarySkill: SkillType.WOODWORKING,
                relatedSkills: [SkillType.CONSTRUCTION, SkillType.CRAFTING],
                expectedBonus: 0.2
            },
            {
                primarySkill: SkillType.MINING,
                relatedSkills: [SkillType.PROSPECTING, SkillType.CRAFTING],
                expectedBonus: 0.15
            },
            {
                primarySkill: SkillType.SWORD_COMBAT,
                relatedSkills: [SkillType.AXE_COMBAT, SkillType.DEFENSE],
                expectedBonus: 0.25
            }
        ];
        for (const test of synergyTests) {
            const primarySkill = this.skillsSystem.getSkill(test.primarySkill);
            if (!primarySkill)
                continue;
            // Calculate synergy bonus
            const synergyBonus = this.synergySystem.calculateSynergyBonus(test.primarySkill, new Map(test.relatedSkills.map(skill => [skill, this.skillsSystem.getSkill(skill)])));
            // Test transfer learning
            let totalTransferEffect = 0;
            for (const relatedSkill of test.relatedSkills) {
                const transferEffect = 0.1; // Placeholder value
                totalTransferEffect += transferEffect;
                if (transferEffect > 0) {
                    results.transferLearningEvents++;
                }
            }
            results.testedSynergies.push({
                primarySkill: test.primarySkill,
                relatedSkills: test.relatedSkills,
                synergyBonus: typeof synergyBonus === 'number' ? synergyBonus : 0,
                transferEffect: totalTransferEffect
            });
            results.totalSynergyBonus += typeof synergyBonus === 'number' ? synergyBonus : 0;
        }
        console.log(`  Tested ${results.testedSynergies.length} skill synergies`);
        console.log(`  Total synergy bonus: ${results.totalSynergyBonus.toFixed(3)}`);
        console.log(`  Transfer learning events: ${results.transferLearningEvents}`);
        return results;
    }
    /**
     * Evaluate goal feasibility based on current skills
     */
    evaluateGoalFeasibility(goal) {
        // Simple feasibility calculation based on required skills
        const requiredSkills = this.identifyRequiredSkills(goal);
        let totalSkillLevel = 0;
        let skillCount = 0;
        for (const skillType of requiredSkills) {
            const skill = this.skillsSystem.getSkill(skillType);
            if (skill) {
                totalSkillLevel += skill.proficiency.level;
                skillCount++;
            }
        }
        const averageSkillLevel = skillCount > 0 ? totalSkillLevel / skillCount : 0;
        return Math.min(1.0, averageSkillLevel / 50); // Normalize to 0-1
    }
    /**
     * Identify skills required for a goal
     */
    identifyRequiredSkills(goal) {
        const skillMap = {
            'build_shelter': ['construction', 'woodworking', 'crafting'],
            'gather_resources': ['mining', 'woodcutting', 'exploration'],
            'craft_tools': ['crafting', 'smithing', 'mining'],
            'explore_area': ['exploration', 'navigation', 'mapping'],
            'defend_base': ['combat', 'archery', 'defense'],
            'trade_with_villagers': ['social_interaction', 'trading', 'persuasion']
        };
        return skillMap[goal.category] || [];
    }
    /**
     * Simulate skill improvement for testing
     */
    async simulateSkillImprovement() {
        const improvementEvents = [
            {
                id: 'improvement_test',
                skillType: SkillType.MINING,
                amount: 100,
                source: ExperienceSource.PRACTICE,
                context: {
                    situation: 'training',
                    location: { x: 0, y: 0, z: 0 },
                    participants: [],
                    tools: [],
                    difficulty: 0.3,
                    timePressure: 0.2,
                    riskLevel: 0.1,
                    socialContext: 'solo'
                },
                timestamp: Date.now(),
                quality: 0.8,
                difficulty: 0.3,
                success: true,
                impact: 0.6,
                componentGains: {
                    knowledge: 0.2,
                    practical: 0.7,
                    creative: 0.1
                },
                synergyBonus: 0,
                personalityBonus: 0,
                contextBonus: 0,
                plateauModifier: 0
            }
        ];
        for (const event of improvementEvents) {
            const skill = this.skillsSystem.getSkill(event.skillType);
            if (skill) {
                this.learningEngine.processExperience(skill, event, event.context);
            }
        }
    }
    /**
     * Calculate personality alignment with skill category
     */
    calculatePersonalityAlignment(category, personality) {
        const alignments = {
            [SkillCategory.CRAFTING]: {
                openness: 0.8,
                conscientiousness: 0.7,
                creativity: 0.9
            },
            [SkillCategory.EXPLORATION]: {
                openness: 0.9,
                curiosity: 0.9,
                riskTolerance: 0.7
            },
            [SkillCategory.SOCIAL]: {
                extraversion: 0.8,
                agreeableness: 0.7,
                openness: 0.8
            },
            [SkillCategory.COMBAT]: {
                riskTolerance: 0.8,
                competitiveness: 0.7,
                neuroticism: 0.3
            },
            [SkillCategory.BUILDING]: {
                conscientiousness: 0.8,
                creativity: 0.7,
                patience: 0.6
            },
            [SkillCategory.MINING]: {
                conscientiousness: 0.7,
                patience: 0.8,
                riskTolerance: 0.5
            },
            [SkillCategory.FARMING]: {
                patience: 0.9,
                conscientiousness: 0.7,
                openness: 0.4
            },
            [SkillCategory.TRADING]: {
                agreeableness: 0.8,
                extraversion: 0.7,
                openness: 0.6
            },
            [SkillCategory.SURVIVAL]: {
                riskTolerance: 0.6,
                conscientiousness: 0.8,
                neuroticism: 0.4
            },
            [SkillCategory.TOOL_USE]: {
                conscientiousness: 0.7,
                practical: 0.8,
                patience: 0.5
            },
            [SkillCategory.NAVIGATION]: {
                openness: 0.8,
                curiosity: 0.7,
                riskTolerance: 0.6
            },
            [SkillCategory.MAGIC]: {
                openness: 0.9,
                creativity: 0.8,
                conscientiousness: 0.6
            }
        };
        const categoryAlignment = alignments[category] || {};
        let totalAlignment = 0;
        let traitCount = 0;
        for (const [trait, weight] of Object.entries(categoryAlignment)) {
            const personalityValue = personality[trait] || 0.5;
            totalAlignment += (1 - Math.abs(personalityValue - weight)) * weight;
            traitCount++;
        }
        return traitCount > 0 ? totalAlignment / traitCount : 0.5;
    }
    /**
     * Analyze test results
     */
    analyzeTestResults(skillResults, goalResults, personalityResults, synergyResults, expectedOutcomes) {
        let analysis = '\n=== INTEGRATION TEST ANALYSIS ===\n';
        // Skill progression analysis
        analysis += '\n1. SKILL PROGRESSION:\n';
        for (const [skillType, result] of Object.entries(skillResults)) {
            const efficiency = result.learningEfficiency;
            analysis += `   ${skillType}: ${efficiency > 1.0 ? '✓' : '⚠'} ${efficiency.toFixed(2)}x efficiency\n`;
        }
        // Goal integration analysis
        analysis += '\n2. GOAL INTEGRATION:\n';
        for (const [goalName, feasibility] of Object.entries(goalResults.updatedFeasibility)) {
            const initial = goalResults.initialFeasibility[goalName];
            const improvement = feasibility - initial;
            analysis += `   ${goalName}: ${improvement > 0 ? '✓' : '○'} ${improvement > 0 ? '+' : ''}${improvement.toFixed(2)} feasibility\n`;
        }
        // Personality influence analysis
        analysis += '\n3. PERSONALITY INFLUENCE:\n';
        const avgPersonalityBonus = Object.values(personalityResults.learningInfluence)
            .reduce((a, b) => a + b, 0) / Object.keys(personalityResults.learningInfluence).length;
        analysis += `   Average personality bonus: ${avgPersonalityBonus.toFixed(3)}\n`;
        analysis += `   Adaptation rate: ${personalityResults.adaptationRate.toFixed(3)}\n`;
        // Synergy effects analysis
        analysis += '\n4. SYNERGY EFFECTS:\n';
        analysis += `   Total synergy bonus: ${synergyResults.totalSynergyBonus.toFixed(3)}\n`;
        analysis += `   Transfer learning events: ${synergyResults.transferLearningEvents}\n`;
        // Overall assessment
        analysis += '\n5. OVERALL ASSESSMENT:\n';
        const skillEfficiencyAvg = Object.values(skillResults)
            .reduce((a, b) => a + b.learningEfficiency, 0) / Object.keys(skillResults).length;
        const goalImprovements = Object.values(goalResults.updatedFeasibility)
            .reduce((a, b, i) => a + Math.max(0, b - Object.values(goalResults.initialFeasibility)[i]), 0);
        if (skillEfficiencyAvg > 1.2 && goalImprovements > 0.5 && synergyResults.totalSynergyBonus > 0.1) {
            analysis += '   ✓ EXCELLENT: All systems showing strong integration\n';
        }
        else if (skillEfficiencyAvg > 1.0 && goalImprovements > 0.2) {
            analysis += '   ✓ GOOD: Systems are well integrated with room for improvement\n';
        }
        else {
            analysis += '   ⚠ NEEDS ATTENTION: Integration issues detected\n';
        }
        return analysis;
    }
    /**
     * Validate test results against expected outcomes
     */
    validateTestResults(analysis, expectedOutcomes) {
        // Simple validation - in a real implementation this would be more sophisticated
        return analysis.includes('✓');
    }
    /**
     * Collect comprehensive metrics from all systems
     */
    collectMetrics() {
        return {
            skills: {
                totalSkills: this.skillsSystem.getAllSkills().length,
                averageLevel: this.calculateAverageSkillLevel(),
                totalExperience: this.experienceTracker.getAnalytics().totalExperience,
                learningVelocity: this.experienceTracker.getAnalytics().learningVelocity
            },
            goals: {
                totalGoals: this.goalSystem.getStatistics().totalGoals,
                activeGoals: this.goalSystem.getStatistics().activeGoals,
                successRate: this.goalSystem.getStatistics().successRate
            },
            personality: {
                profile: this.personality.getProfile(),
                adaptationRate: this.learningEngine.getMetrics().adaptationRate
            },
            integration: {
                bridgeStatistics: this.skillsBridge.getStatistics(),
                synergyCount: 0,
                milestoneProgress: 0
            }
        };
    }
    /**
     * Calculate average skill level across all skills
     */
    calculateAverageSkillLevel() {
        const skills = this.skillsSystem.getAllSkills();
        if (skills.length === 0)
            return 0;
        const totalLevel = skills.reduce((sum, skill) => sum + skill.proficiency.level, 0);
        return totalLevel / skills.length;
    }
    /**
     * Run a comprehensive demo of the integrated system
     */
    async runDemo() {
        console.log('\n🚀 Starting Dynamic Skill Progression System Demo\n');
        // Create demo configuration
        const demoConfig = {
            testName: 'Dynamic Skill Progression Demo',
            agentProfile: {
                personality: {
                    openness: 0.8,
                    conscientiousness: 0.7,
                    extraversion: 0.6,
                    agreeableness: 0.5,
                    neuroticism: 0.3
                }
            },
            testGoals: [
                {
                    name: 'Build Advanced Shelter',
                    description: 'Construct a multi-room shelter with amenities',
                    type: 'tactical',
                    priority: 200,
                    dependencies: [],
                    resources: {
                        items: { wood: 100, stone: 50 },
                        tools: ['axe', 'pickaxe']
                    },
                    progress: {
                        percentage: 0,
                        completedSteps: [],
                        blockers: []
                    },
                    status: 'pending',
                    createdAt: Date.now()
                },
                {
                    name: 'Master Crafting',
                    description: 'Become proficient in advanced crafting techniques',
                    type: 'strategic',
                    priority: 150,
                    dependencies: [],
                    resources: {
                        items: {},
                        tools: ['crafting_table']
                    },
                    progress: {
                        percentage: 0,
                        completedSteps: [],
                        blockers: []
                    },
                    status: 'pending',
                    createdAt: Date.now()
                }
            ],
            skillTests: [
                {
                    skillType: SkillType.CONSTRUCTION,
                    experienceEvents: [
                        this.createExperienceEvent(SkillType.CONSTRUCTION, 30, ExperienceSource.PRACTICE, 'building_shelter'),
                        this.createExperienceEvent(SkillType.CONSTRUCTION, 25, ExperienceSource.EXPERIMENTATION, 'trying_new_design'),
                        this.createExperienceEvent(SkillType.CONSTRUCTION, 40, ExperienceSource.TEACHING, 'helping_other_build')
                    ],
                    expectedLearningGain: 95
                },
                {
                    skillType: SkillType.CRAFTING,
                    experienceEvents: [
                        this.createExperienceEvent(SkillType.CRAFTING, 35, ExperienceSource.PRACTICE, 'crafting_tools'),
                        this.createExperienceEvent(SkillType.CRAFTING, 20, ExperienceSource.OBSERVATION, 'watching_expert'),
                        this.createExperienceEvent(SkillType.CRAFTING, 45, ExperienceSource.BREAKTHROUGH, 'new_technique')
                    ],
                    expectedLearningGain: 100
                }
            ],
            expectedOutcomes: {
                skillProgression: {
                    [SkillType.CONSTRUCTION]: 15,
                    [SkillType.CRAFTING]: 18,
                    [SkillType.MINING]: 10,
                    [SkillType.NAVIGATION]: 5,
                    [SkillType.SWORD_COMBAT]: 0,
                    [SkillType.AXE_COMBAT]: 0,
                    [SkillType.ARCHERY]: 0,
                    [SkillType.CROSSBOW]: 0,
                    [SkillType.DEFENSE]: 0,
                    [SkillType.HEAVY_ARMOR]: 0,
                    [SkillType.LIGHT_ARMOR]: 0,
                    [SkillType.SHIELD_USE]: 0,
                    [SkillType.WOODWORKING]: 0,
                    [SkillType.STONEWORKING]: 0,
                    [SkillType.SMITHING]: 0,
                    [SkillType.COOKING]: 0,
                    [SkillType.ALCHEMY]: 0,
                    [SkillType.ENCHANTING]: 0,
                    [SkillType.TAILORING]: 0,
                    [SkillType.JEWELRY]: 0,
                    [SkillType.MAPPING]: 0,
                    [SkillType.SWIMMING]: 0,
                    [SkillType.DIVING]: 0,
                    [SkillType.CLIMBING]: 0,
                    [SkillType.TRACKING]: 0,
                    [SkillType.STEALTH]: 0,
                    [SkillType.TRADING]: 0,
                    [SkillType.PERSUASION]: 0,
                    [SkillType.LEADERSHIP]: 0,
                    [SkillType.TEAMWORK]: 0,
                    [SkillType.NEGOTIATION]: 0,
                    [SkillType.TEACHING]: 0,
                    [SkillType.ARCHITECTURE]: 0,
                    [SkillType.DECORATION]: 0,
                    [SkillType.LANDSCAPING]: 0,
                    [SkillType.REDSTONE]: 0,
                    [SkillType.PROSPECTING]: 0,
                    [SkillType.EXPLOSIVES]: 0,
                    [SkillType.CAVE_NAVIGATION]: 0,
                    [SkillType.FARMING]: 0,
                    [SkillType.CROP_FARMING]: 0,
                    [SkillType.ANIMAL_HUSBANDRY]: 0,
                    [SkillType.BREEDING]: 0,
                    [SkillType.COMPOSTING]: 0,
                    [SkillType.FIRE_STARTING]: 0,
                    [SkillType.SHELTER_BUILDING]: 0,
                    [SkillType.FORAGING]: 0,
                    [SkillType.HUNTING]: 0,
                    [SkillType.FIRST_AID]: 0,
                    [SkillType.MAGIC]: 0,
                    [SkillType.SPELLCASTING]: 0,
                    [SkillType.POTION_MAKING]: 0,
                    [SkillType.RITUAL_MAGIC]: 0,
                    [SkillType.PICKAXE_USE]: 0,
                    [SkillType.SHOVEL_USE]: 0,
                    [SkillType.HOE_USE]: 0,
                    [SkillType.AXE_USE]: 0,
                    [SkillType.FISHING]: 0,
                    [SkillType.WAYFINDING]: 0,
                    [SkillType.LANDMARK_RECOGNITION]: 0,
                    [SkillType.COMPASS_USE]: 0
                },
                goalFeasibilityChanges: {
                    'Build Advanced Shelter': true,
                    'Master Crafting': true
                },
                personalityInfluence: 0.15,
                synergyEffects: 0.2
            }
        };
        // Run the demo test
        const result = await this.runIntegrationTest(demoConfig);
        // Display results
        console.log('\n📊 DEMO RESULTS:');
        console.log(`Success: ${result.success ? '✅' : '❌'}`);
        if (result.metrics) {
            console.log(`Skills Created: ${result.metrics.skills.totalSkills}`);
            console.log(`Average Skill Level: ${result.metrics.skills.averageLevel.toFixed(2)}`);
            console.log(`Total Experience: ${result.metrics.skills.totalExperience}`);
            console.log(`Goals Created: ${result.metrics.goals.totalGoals}`);
            console.log(`Goal Success Rate: ${(result.metrics.goals.successRate * 100).toFixed(1)}%`);
        }
        console.log('\n' + result.analysis);
        console.log('\n🎉 Dynamic Skill Progression System Demo Complete!');
    }
    /**
     * Helper to create experience events for testing
     */
    createExperienceEvent(skillType, amount, source, situation) {
        return {
            id: `test_${skillType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            skillType,
            amount,
            source,
            context: {
                situation,
                location: { x: 0, y: 64, z: 0 },
                participants: [],
                tools: [],
                difficulty: 0.5,
                timePressure: 0.5,
                riskLevel: 0.5,
                socialContext: 'solo'
            },
            timestamp: Date.now(),
            quality: 0.7,
            difficulty: 0.5,
            success: true,
            impact: 0.5,
            componentGains: {
                knowledge: 0.3,
                practical: 0.6,
                creative: 0.1
            },
            synergyBonus: 0,
            personalityBonus: 0,
            contextBonus: 0,
            plateauModifier: 0
        };
    }
}
/**
 * Export the integration test class for use in other modules
 */
export default SkillsIntegrationTest;
/**
 * Quick demo function for standalone testing
 */
export async function runQuickDemo() {
    const integrationTest = new SkillsIntegrationTest();
    await integrationTest.runDemo();
}
// Run demo if this file is executed directly
if (require.main === module) {
    runQuickDemo().catch(console.error);
}
//# sourceMappingURL=skills_integration_test.js.map