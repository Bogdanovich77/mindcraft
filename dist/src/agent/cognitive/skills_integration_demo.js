/**
 * Skills System Integration Demo
 *
 * Demonstrates the integration between the dynamic skill progression system,
 * purpose core, and goal system. Shows how skills influence goal feasibility,
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
import { SkillType, ExperienceSource } from './skill_types.js';
/**
 * Simple integration demo that shows the key concepts working together
 */
export class SkillsIntegrationDemo {
    skillsSystem;
    learningEngine;
    synergySystem;
    milestoneSystem;
    experienceTracker;
    skillsBridge;
    purposeCore;
    goalSystem;
    personality;
    constructor() {
        this.initializeComponents();
    }
    /**
     * Initialize all system components
     */
    initializeComponents() {
        console.log('🔧 Initializing Skills System Components...');
        // Create personality system with specific traits
        this.personality = new PersonalitySystem({
            openness: 0.8,
            conscientiousness: 0.7,
            extraversion: 0.6,
            agreeableness: 0.5,
            neuroticism: 0.3,
            riskTolerance: 0.6,
            creativity: 0.7,
            patience: 0.6,
            competitiveness: 0.4,
            curiosity: 0.9
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
        console.log('✅ All components initialized successfully');
    }
    /**
     * Run the complete integration demo
     */
    async runDemo() {
        console.log('\n🚀 Starting Dynamic Skill Progression System Integration Demo\n');
        try {
            // Demo 1: Basic Skill Progression
            await this.demoBasicSkillProgression();
            // Demo 2: Personality-Influenced Learning
            await this.demoPersonalityInfluence();
            // Demo 3: Skill Synergies
            await this.demoSkillSynergies();
            // Demo 4: Integration with Purpose Core
            await this.demoPurposeCoreIntegration();
            // Demo 5: Goal-Driven Skill Development
            await this.demoGoalDrivenSkills();
            // Demo 6: Legacy System Bridge
            await this.demoLegacyBridge();
            console.log('\n🎉 Integration Demo Completed Successfully!');
            this.printSummary();
        }
        catch (error) {
            console.error('❌ Demo failed:', error);
        }
    }
    /**
     * Demo 1: Basic Skill Progression
     */
    async demoBasicSkillProgression() {
        console.log('\n📈 Demo 1: Basic Skill Progression');
        console.log('----------------------------------------');
        // Create a new skill
        const miningSkill = this.skillsSystem.getSkill(SkillType.MINING);
        console.log(`Initial ${SkillType.MINING} level: ${miningSkill.proficiency.level.toFixed(2)}`);
        // Create experience events
        const experienceEvents = [
            this.createExperienceEvent(SkillType.MINING, 30, ExperienceSource.PRACTICE, 'mining_iron'),
            this.createExperienceEvent(SkillType.MINING, 25, ExperienceSource.PRACTICE, 'mining_coal'),
            this.createExperienceEvent(SkillType.MINING, 40, ExperienceSource.EXPERIMENTATION, 'efficiency_test')
        ];
        // Process experience
        for (const event of experienceEvents) {
            const learningResult = this.learningEngine.processExperience(miningSkill, event, event.context);
            this.experienceTracker.addExperienceEvent(learningResult.processedEvent);
            console.log(`  Gained ${learningResult.processedEvent.amount} XP (quality: ${learningResult.processedEvent.quality.toFixed(2)})`);
        }
        console.log(`Final ${SkillType.MINING} level: ${miningSkill.proficiency.level.toFixed(2)}`);
        console.log(`Total experience: ${miningSkill.proficiency.experience}`);
    }
    /**
     * Demo 2: Personality-Influenced Learning
     */
    async demoPersonalityInfluence() {
        console.log('\n🧠 Demo 2: Personality-Influenced Learning');
        console.log('--------------------------------------------');
        const personality = this.personality.getProfile();
        console.log('Personality Profile:');
        console.log(`  Openness: ${personality.traits.openness.toFixed(2)} (affects creativity & exploration)`);
        console.log(`  Conscientiousness: ${personality.traits.conscientiousness.toFixed(2)} (affects precision & planning)`);
        console.log(`  Risk Tolerance: ${personality.traits.riskTolerance.toFixed(2)} (affects combat & exploration)`);
        // Test different skill categories
        const testSkills = [
            SkillType.CRAFTING, // High creativity alignment
            SkillType.NAVIGATION, // High exploration alignment
            SkillType.SWORD_COMBAT // High risk tolerance alignment
        ];
        for (const skillType of testSkills) {
            const skill = this.skillsSystem.getSkill(skillType);
            const event = this.createExperienceEvent(skillType, 50, ExperienceSource.PRACTICE, 'personality_test');
            const learningResult = this.learningEngine.processExperience(skill, event, event.context);
            console.log(`  ${skillType}: Personality bonus = ${(learningResult.processedEvent.personalityBonus * 100).toFixed(1)}%`);
        }
    }
    /**
     * Demo 3: Skill Synergies
     */
    async demoSkillSynergies() {
        console.log('\n🔗 Demo 3: Skill Synergies');
        console.log('---------------------------');
        // Develop related skills to show synergy effects
        const primarySkill = this.skillsSystem.getSkill(SkillType.WOODWORKING);
        const relatedSkills = [
            this.skillsSystem.getSkill(SkillType.CONSTRUCTION),
            this.skillsSystem.getSkill(SkillType.CRAFTING)
        ];
        // Train the primary skill
        const primaryEvent = this.createExperienceEvent(SkillType.WOODWORKING, 60, ExperienceSource.PRACTICE, 'building_structure');
        const primaryResult = this.learningEngine.processExperience(primarySkill, primaryEvent, primaryEvent.context);
        console.log(`Primary skill (${SkillType.WOODWORKING}) gained: ${primaryResult.processedEvent.amount} XP`);
        console.log(`Synergy bonus: ${(primaryResult.processedEvent.synergyBonus * 100).toFixed(1)}%`);
        // Show how related skills benefit
        for (const relatedSkill of relatedSkills) {
            const transferBonus = this.calculateTransferBonus(SkillType.WOODWORKING, relatedSkill.type);
            console.log(`  Transfer bonus to ${relatedSkill.type}: ${(transferBonus * 100).toFixed(1)}%`);
        }
    }
    /**
     * Demo 4: Integration with Purpose Core
     */
    async demoPurposeCoreIntegration() {
        console.log('\n🎯 Demo 4: Purpose Core Integration');
        console.log('------------------------------------');
        // Get purpose core state
        const purposeState = this.purposeCore.getState();
        console.log('Active Goals from Purpose Core:');
        purposeState.activeGoals.forEach(goal => {
            console.log(`  - ${goal}`);
        });
        // Show how skills align with personality-driven goals
        const personality = this.personality.getProfile();
        const skillAlignment = this.calculateSkillPersonalityAlignment(personality);
        console.log('Skill-Personality Alignment:');
        for (const [skill, alignment] of Object.entries(skillAlignment)) {
            console.log(`  ${skill}: ${(alignment * 100).toFixed(1)}%`);
        }
    }
    /**
     * Demo 5: Goal-Driven Skill Development
     */
    async demoGoalDrivenSkills() {
        console.log('\n📋 Demo 5: Goal-Driven Skill Development');
        console.log('------------------------------------------');
        // Simulate goal-driven skill training
        const goalOrientedSkills = [
            { skill: SkillType.CONSTRUCTION, goal: 'Build Shelter', priority: 'high' },
            { skill: SkillType.CRAFTING, goal: 'Craft Tools', priority: 'medium' },
            { skill: SkillType.MINING, goal: 'Gather Resources', priority: 'high' }
        ];
        for (const { skill, goal, priority } of goalOrientedSkills) {
            const skillObj = this.skillsSystem.getSkill(skill);
            const contextModifier = priority === 'high' ? 1.2 : 1.0;
            const event = this.createExperienceEvent(skill, Math.floor(40 * contextModifier), ExperienceSource.PRACTICE, `goal_driven_${goal}`);
            const learningResult = this.learningEngine.processExperience(skillObj, event, event.context);
            console.log(`  ${goal} (${skill}): ${learningResult.processedEvent.amount} XP (priority bonus: ${((contextModifier - 1) * 100).toFixed(0)}%)`);
        }
    }
    /**
     * Demo 6: Legacy System Bridge
     */
    async demoLegacyBridge() {
        console.log('\n🌉 Demo 6: Legacy System Bridge');
        console.log('---------------------------------');
        // Show bridge statistics
        const bridgeStats = this.skillsBridge.getStatistics();
        console.log('Bridge Statistics:');
        console.log(`  Legacy skills imported: ${bridgeStats.legacySkillsImported}`);
        console.log(`  Experience converted: ${bridgeStats.experienceConverted}`);
        console.log(`  Sync operations: ${bridgeStats.syncOperations}`);
        // Show skill mappings
        const mappings = this.skillsBridge.getSkillMappings();
        console.log(`\nSkill Mappings (${mappings.size} total):`);
        for (const [legacy, mapping] of Array.from(mappings.entries()).slice(0, 5)) {
            console.log(`  ${legacy} → ${mapping.newType} (factor: ${mapping.conversionFactor})`);
        }
    }
    /**
     * Create an experience event for testing
     */
    createExperienceEvent(skillType, amount, source, situation) {
        return {
            id: `demo_${skillType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
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
    /**
     * Calculate transfer bonus between skills
     */
    calculateTransferBonus(fromSkill, toSkill) {
        // Simple transfer bonus calculation
        const transferMap = {
            [SkillType.WOODWORKING]: [SkillType.CONSTRUCTION, SkillType.CRAFTING],
            [SkillType.MINING]: [SkillType.CRAFTING, SkillType.PROSPECTING],
            [SkillType.SWORD_COMBAT]: [SkillType.AXE_COMBAT, SkillType.DEFENSE]
        };
        const relatedSkills = transferMap[fromSkill] || [];
        return relatedSkills.includes(toSkill) ? 0.15 : 0;
    }
    /**
     * Calculate skill-personality alignment
     */
    calculateSkillPersonalityAlignment(personality) {
        const alignments = {};
        // Crafting skills align with creativity and conscientiousness
        alignments.crafting = (personality.traits.openness * 0.5 + personality.traits.conscientiousness * 0.3 + personality.traits.creativity * 0.2);
        // Combat skills align with risk tolerance
        alignments.combat = (personality.traits.riskTolerance * 0.6 + personality.traits.competitiveness * 0.4);
        // Social skills align with extraversion and agreeableness
        alignments.social = (personality.traits.extraversion * 0.5 + personality.traits.agreeableness * 0.3 + personality.traits.openness * 0.2);
        // Exploration skills align with openness and curiosity
        alignments.exploration = (personality.traits.openness * 0.4 + personality.traits.curiosity * 0.6);
        return alignments;
    }
    /**
     * Print summary of the demo
     */
    printSummary() {
        console.log('\n📊 INTEGRATION DEMO SUMMARY');
        console.log('============================');
        // Skills summary
        const allSkills = this.skillsSystem.getAllSkills();
        console.log(`Skills Created: ${allSkills.length}`);
        console.log(`Average Skill Level: ${(allSkills.reduce((sum, skill) => sum + skill.proficiency.level, 0) / allSkills.length).toFixed(2)}`);
        // Experience summary
        const experienceAnalytics = this.experienceTracker.getAnalytics();
        console.log(`Total Experience Processed: ${experienceAnalytics.totalExperience}`);
        console.log(`Learning Velocity: ${experienceAnalytics.learningVelocity.toFixed(2)} XP/hour`);
        // Learning engine summary
        const learningMetrics = this.learningEngine.getMetrics();
        console.log(`Personality Influence: ${(learningMetrics.personalityInfluence * 100).toFixed(1)}%`);
        console.log(`Adaptation Rate: ${learningMetrics.adaptationRate.toFixed(3)}`);
        // Bridge summary
        const bridgeStats = this.skillsBridge.getStatistics();
        console.log(`Legacy Integration: ${bridgeStats.legacySkillsImported} skills migrated`);
        console.log('\n✅ All systems working together successfully!');
        console.log('🎯 Skills influence goals, goals drive skill development');
        console.log('🧠 Personality affects learning rates and preferences');
        console.log('🔗 Skill synergies create transfer learning effects');
        console.log('🌉 Legacy system bridge ensures backward compatibility');
    }
}
/**
 * Quick demo function for standalone testing
 */
export async function runSkillsIntegrationDemo() {
    const demo = new SkillsIntegrationDemo();
    await demo.runDemo();
}
// Export the demo class
export default SkillsIntegrationDemo;
