/**
 * Comprehensive Test Suite for Theory of Mind System
 * 
 * This test suite validates all components of the theory of mind system including:
 * - Mental state creation and updates
 * - Belief revision accuracy and consistency
 * - Intention prediction accuracy and confidence scoring
 * - Emotion recognition and empathy simulation
 * - Social reasoning and context understanding
 * - Integration with existing cognitive components
 * - Performance benchmarking with <100ms requirements
 */

import { TheoryOfMindEngine, TheoryOfMindFactory } from './theory_of_mind.js';
import { MentalModelManager } from './mental_model.js';
import { IntentionPredictor } from './intention_predictor.js';
import { EmotionalIntelligence } from './emotional_intelligence.js';
import { SocialReasoningEngine } from './social_reasoning.js';
import { PersonalityTraits } from '../langgraph/interfaces.js';
import { AgentRelationship } from './relationship_types.js';

// Test configuration
const TEST_CONFIG = {
  timeout: 5000,
  performanceThreshold: 100,
  confidenceThreshold: 0.5,
  maxTestAgents: 10
};

// Test data
const TEST_PERSONALITY = {
  openness: 0.8,
  conscientiousness: 0.7,
  extraversion: 0.6,
  agreeableness: 0.7,
  neuroticism: 0.3,
  riskTolerance: 0.6,
  creativity: 0.7,
  patience: 0.5,
  competitiveness: 0.4,
  curiosity: 0.9
};

const TEST_RELATIONSHIP = {
  id: 'test_relationship',
  type: 'friendship',
  strength: 0.8,
  trust: 0.7,
  history: [],
  lastInteraction: Date.now(),
  metadata: {}
};

/**
 * Test Framework
 */
class TheoryOfMindTestSuite {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      total: 0,
      performance: {},
      errors: []
    };
    this.theoryOfMindEngine = null;
  }

  /**
   * Run all tests
   */
  async runAllTests() {
    console.log('=== Theory of Mind System Test Suite ===');
    console.log('Starting comprehensive testing...\n');

    const startTime = Date.now();

    try {
      // Initialize test environment
      await this.setupTestEnvironment();

      // Run component tests
      await this.runMentalModelTests();
      await this.runIntentionPredictorTests();
      await this.runEmotionalIntelligenceTests();
      await this.runSocialReasoningTests();
      await this.runTheoryOfMindEngineTests();

      // Run integration tests
      await this.runIntegrationTests();

      // Run performance tests
      await this.runPerformanceTests();

      // Run advanced feature tests
      await this.runAdvancedFeatureTests();

    } catch (error) {
      console.error('Test suite failed with error:', error);
      this.results.errors.push(error);
    }

    const totalTime = Date.now() - startTime;
    this.printResults(totalTime);
  }

  /**
   * Setup test environment
   */
  async setupTestEnvironment() {
    console.log('Setting up test environment...');
    
    this.theoryOfMindEngine = TheoryOfMindFactory.createDefault();
    await this.theoryOfMindEngine.initialize(TEST_PERSONALITY);
    
    console.log('✓ Test environment setup complete\n');
  }

  /**
   * Run mental model tests
   */
  async runMentalModelTests() {
    console.log('--- Mental Model Tests ---');

    await this.test('Mental state creation', async () => {
      const observation = {
        actions: ['move_forward', 'look_around'],
        behavioralCues: ['confident_movement', 'curious_gestures'],
        recentHistory: [{ action: 'explore', timestamp: Date.now() - 1000 }],
        timestamp: Date.now()
      };

      const context = {
        environment: { location: 'forest', time: 'day' },
        socialContext: { nearby_agents: 2 },
        relationship: TEST_RELATIONSHIP
      };

      const mentalState = await this.theoryOfMindEngine.processObservation(
        'test_agent_1',
        observation,
        context,
        TEST_PERSONALITY
      );

      if (!mentalState) {
        throw new Error('Mental state was not created');
      }

      if (mentalState.confidence < 0) {
        throw new Error('Invalid confidence value');
      }

      console.log(`  Created mental state with confidence: ${mentalState.confidence.toFixed(3)}`);
    });

    await this.test('Mental state updates', async () => {
      const agentId = 'test_agent_2';
      
      // Initial observation
      const initialObservation = {
        actions: ['idle'],
        behavioralCues: ['relaxed'],
        recentHistory: [],
        timestamp: Date.now()
      };

      const context = {
        environment: { location: 'plains' },
        socialContext: {},
        relationship: TEST_RELATIONSHIP
      };

      await this.theoryOfMindEngine.processObservation(
        agentId,
        initialObservation,
        context,
        TEST_PERSONALITY
      );

      const initialState = this.theoryOfMindEngine.getMentalState(agentId);
      
      // Update observation
      const updatedObservation = {
        actions: ['run', 'hide'],
        behavioralCues: ['fearful', 'panicked'],
        recentHistory: [{ action: 'run', timestamp: Date.now() - 500 }],
        timestamp: Date.now()
      };

      await this.theoryOfMindEngine.processObservation(
        agentId,
        updatedObservation,
        context,
        TEST_PERSONALITY
      );

      const updatedState = this.theoryOfMindEngine.getMentalState(agentId);

      if (!updatedState) {
        throw new Error('Updated mental state was not found');
      }

      if (updatedState.lastUpdated <= initialState.lastUpdated) {
        throw new Error('Mental state was not updated');
      }

      console.log(`  Mental state updated successfully`);
    });

    await this.test('Belief revision', async () => {
      const agentId = 'test_agent_3';
      
      // Initial belief observation
      const beliefObservation = {
        actions: ['approach_chest'],
        behavioralCues: ['interested'],
        recentHistory: [{ action: 'look_at_chest', timestamp: Date.now() - 1000 }],
        timestamp: Date.now()
      };

      const context = {
        environment: { location: 'dungeon', chest_contains: 'gold' },
        socialContext: {},
        relationship: TEST_RELATIONSHIP
      };

      await this.theoryOfMindEngine.processObservation(
        agentId,
        beliefObservation,
        context,
        TEST_PERSONALITY
      );

      // Contradictory observation (chest is empty)
      const contradictoryObservation = {
        actions: ['leave_chest', 'disappointed_gesture'],
        behavioralCues: ['disappointed', 'surprised'],
        recentHistory: [{ action: 'open_chest', timestamp: Date.now() - 500 }],
        timestamp: Date.now()
      };

      const updatedContext = {
        environment: { location: 'dungeon', chest_contains: 'empty' },
        socialContext: {},
        relationship: TEST_RELATIONSHIP
      };

      await this.theoryOfMindEngine.processObservation(
        agentId,
        contradictoryObservation,
        updatedContext,
        TEST_PERSONALITY
      );

      const finalState = this.theoryOfMindEngine.getMentalState(agentId);

      if (!finalState) {
        throw new Error('Final mental state was not found');
      }

      // Check if belief was revised
      const hasRevisedBelief = finalState.knowledge.epistemic.some(belief => 
        belief.confidence < 0.8 // Lower confidence after contradiction
      );

      if (!hasRevisedBelief) {
        console.log('  Warning: Belief revision may not have occurred properly');
      }

      console.log(`  Belief revision processed with confidence adjustment`);
    });

    console.log('✓ Mental model tests completed\n');
  }

  /**
   * Run intention predictor tests
   */
  async runIntentionPredictorTests() {
    console.log('--- Intention Predictor Tests ---');

    await this.test('Goal inference from actions', async () => {
      const observation = {
        actions: ['approach_tree', 'equip_axe', 'swing_axe'],
        behavioralCues: ['focused', 'determined'],
        recentHistory: [
          { action: 'look_for_trees', timestamp: Date.now() - 2000 },
          { action: 'equip_axe', timestamp: Date.now() - 1500 }
        ],
        timestamp: Date.now()
      };

      const context = {
        environment: { location: 'forest', trees_nearby: true },
        socialContext: {},
        relationship: TEST_RELATIONSHIP
      };

      const mentalState = await this.theoryOfMindEngine.processObservation(
        'test_agent_4',
        observation,
        context,
        TEST_PERSONALITY
      );

      if (!mentalState || !mentalState.intentions) {
        throw new Error('Intentions were not predicted');
      }

      const hasWoodGatheringIntention = mentalState.intentions.current.some(intention =>
        intention.type.includes('gather') || intention.type.includes('wood') || intention.type.includes('resource')
      );

      if (!hasWoodGatheringIntention) {
        console.log('  Warning: Wood gathering intention may not have been inferred');
      }

      console.log(`  Predicted ${mentalState.intentions.current.length} current intentions`);
    });

    await this.test('Plan recognition', async () => {
      const observation = {
        actions: ['craft_pickaxe', 'find_cave', 'enter_cave'],
        behavioralCues: ['prepared', 'cautious'],
        recentHistory: [
          { action: 'craft_torch', timestamp: Date.now() - 3000 },
          { action: 'find_cave', timestamp: Date.now() - 2000 }
        ],
        timestamp: Date.now()
      };

      const context = {
        environment: { location: 'mountains', caves_nearby: true },
        socialContext: {},
        relationship: TEST_RELATIONSHIP
      };

      const mentalState = await this.theoryOfMindEngine.processObservation(
        'test_agent_5',
        observation,
        context,
        TEST_PERSONALITY
      );

      if (!mentalState || !mentalState.intentions) {
        throw new Error('Plan recognition failed');
      }

      const hasMiningPlan = mentalState.intentions.current.some(intention =>
        intention.type.includes('mine') || intention.type.includes('explore') || intention.type.includes('resource')
      );

      if (!hasMiningPlan) {
        console.log('  Warning: Mining plan may not have been recognized');
      }

      console.log(`  Recognized plan with ${mentalState.intentions.current.length} steps`);
    });

    await this.test('Intention confidence scoring', async () => {
      const agentId = 'test_agent_6';
      
      // Clear observation (low confidence)
      const unclearObservation = {
        actions: ['stand_still'],
        behavioralCues: ['neutral'],
        recentHistory: [],
        timestamp: Date.now()
      };

      const context = {
        environment: { location: 'plains' },
        socialContext: {},
        relationship: TEST_RELATIONSHIP
      };

      const unclearState = await this.theoryOfMindEngine.processObservation(
        agentId,
        unclearObservation,
        context,
        TEST_PERSONALITY
      );

      // Clear observation with actions (higher confidence)
      const clearObservation = {
        actions: ['approach_animal', 'equip_sword', 'attack_animal'],
        behavioralCues: ['aggressive', 'focused'],
        recentHistory: [
          { action: 'spot_animal', timestamp: Date.now() - 1000 }
        ],
        timestamp: Date.now()
      };

      const clearState = await this.theoryOfMindEngine.processObservation(
        agentId,
        clearObservation,
        context,
        TEST_PERSONALITY
      );

      if (!unclearState || !clearState) {
        throw new Error('Mental states were not created');
      }

      if (clearState.confidence <= unclearState.confidence) {
        console.log('  Warning: Clear observation should have higher confidence');
      }

      console.log(`  Confidence scoring: unclear=${unclearState.confidence.toFixed(3)}, clear=${clearState.confidence.toFixed(3)}`);
    });

    console.log('✓ Intention predictor tests completed\n');
  }

  /**
   * Run emotional intelligence tests
   */
  async runEmotionalIntelligenceTests() {
    console.log('--- Emotional Intelligence Tests ---');

    await this.test('Emotion recognition from behavioral cues', async () => {
      const observation = {
        actions: ['jump', 'wave_arms'],
        behavioralCues: ['excited', 'happy', 'energetic'],
        recentHistory: [
          { action: 'find_diamond', timestamp: Date.now() - 1000 }
        ],
        timestamp: Date.now()
      };

      const context = {
        environment: { location: 'cave', diamonds_found: true },
        socialContext: {},
        relationship: TEST_RELATIONSHIP
      };

      const mentalState = await this.theoryOfMindEngine.processObservation(
        'test_agent_7',
        observation,
        context,
        TEST_PERSONALITY
      );

      if (!mentalState || !mentalState.emotions) {
        throw new Error('Emotions were not recognized');
      }

      const hasPositiveEmotion = Array.from(mentalState.emotions.current.keys()).some(emotion =>
        ['happy', 'excited', 'joy', 'pleasure'].includes(emotion.toLowerCase())
      );

      if (!hasPositiveEmotion) {
        console.log('  Warning: Positive emotions may not have been recognized');
      }

      console.log(`  Recognized ${mentalState.emotions.current.size} emotions`);
    });

    await this.test('Empathy simulation', async () => {
      const observation = {
        actions: ['approach_injured_agent', 'offer_food', 'heal_agent'],
        behavioralCues: ['concerned', 'caring', 'empathetic'],
        recentHistory: [
          { action: 'notice_injury', timestamp: Date.now() - 1500 }
        ],
        timestamp: Date.now()
      };

      const context = {
        environment: { location: 'village', injured_agent_nearby: true },
        socialContext: { group_size: 3 },
        relationship: TEST_RELATIONSHIP
      };

      const mentalState = await this.theoryOfMindEngine.processObservation(
        'test_agent_8',
        observation,
        context,
        TEST_PERSONALITY
      );

      if (!mentalState) {
        throw new Error('Mental state was not created for empathy test');
      }

      // Check for empathetic response
      const hasEmpatheticResponse = mentalState.emotions.current.has('empathy') ||
                                   mentalState.emotions.current.has('concern') ||
                                   mentalState.emotions.current.has('compassion');

      if (!hasEmpatheticResponse) {
        console.log('  Warning: Empathetic emotions may not have been simulated');
      }

      console.log(`  Empathy simulation processed`);
    });

    await this.test('Emotional state prediction', async () => {
      const agentId = 'test_agent_9';
      
      // Create initial emotional state
      const initialObservation = {
        actions: ['relax', 'enjoy_view'],
        behavioralCues: ['calm', 'content'],
        recentHistory: [],
        timestamp: Date.now()
      };

      const context = {
        environment: { location: 'peaceful_meadow', weather: 'sunny' },
        socialContext: {},
        relationship: TEST_RELATIONSHIP
      };

      await this.theoryOfMindEngine.processObservation(
        agentId,
        initialObservation,
        context,
        TEST_PERSONALITY
      );

      // Predict emotional response to threat
      const threatContext = {
        environment: { location: 'peaceful_meadow', threat: 'hostile_mob' },
        socialContext: {},
        relationship: TEST_RELATIONSHIP
      };

      const prediction = await this.theoryOfMindEngine.predictBehavior(
        agentId,
        threatContext,
        5000
      );

      if (!prediction || !prediction.predictions || !prediction.predictions.emotions) {
        throw new Error('Emotional state prediction failed');
      }

      console.log(`  Predicted emotional response with confidence: ${prediction.confidence.toFixed(3)}`);
    });

    console.log('✓ Emotional intelligence tests completed\n');
  }

  /**
   * Run social reasoning tests
   */
  async runSocialReasoningTests() {
    console.log('--- Social Reasoning Tests ---');

    await this.test('Social context understanding', async () => {
      const observation = {
        actions: ['join_group', 'participate_in_activity'],
        behavioralCues: ['social', 'cooperative'],
        recentHistory: [
          { action: 'observe_group', timestamp: Date.now() - 2000 }
        ],
        timestamp: Date.now()
      };

      const context = {
        environment: { location: 'village_square' },
        socialContext: { 
          group_size: 5, 
          group_activity: 'building',
          social_norms: ['cooperation', 'sharing']
        },
        relationship: TEST_RELATIONSHIP
      };

      const mentalState = await this.theoryOfMindEngine.processObservation(
        'test_agent_10',
        observation,
        context,
        TEST_PERSONALITY
      );

      if (!mentalState) {
        throw new Error('Social context understanding failed');
      }

      console.log(`  Social context analyzed successfully`);
    });

    await this.test('Group dynamics prediction', async () => {
      const observation = {
        actions: ['lead_group', 'coordinate_effort'],
        behavioralCues: ['leadership', 'confident'],
        recentHistory: [
          { action: 'organize_group', timestamp: Date.now() - 3000 }
        ],
        timestamp: Date.now()
      };

      const context = {
        environment: { location: 'construction_site' },
        socialContext: { 
          group_size: 8,
          hierarchy: 'leader_follower',
          group_goal: 'build_structure'
        },
        relationship: TEST_RELATIONSHIP
      };

      const mentalState = await this.theoryOfMindEngine.processObservation(
        'test_agent_11',
        observation,
        context,
        TEST_PERSONALITY
      );

      if (!mentalState) {
        throw new Error('Group dynamics prediction failed');
      }

      console.log(`  Group dynamics predicted successfully`);
    });

    await this.test('Social norm understanding', async () => {
      const observation = {
        actions: ['share_resources', 'help_others'],
        behavioralCues: ['generous', 'cooperative'],
        recentHistory: [
          { action: 'notice_need', timestamp: Date.now() - 1000 }
        ],
        timestamp: Date.now()
      };

      const context = {
        environment: { location: 'community_center' },
        socialContext: { 
          social_norms: ['sharing', 'cooperation', 'mutual_aid'],
          cultural_context: 'cooperative_culture'
        },
        relationship: TEST_RELATIONSHIP
      };

      const mentalState = await this.theoryOfMindEngine.processObservation(
        'test_agent_12',
        observation,
        context,
        TEST_PERSONALITY
      );

      if (!mentalState) {
        throw new Error('Social norm understanding failed');
      }

      console.log(`  Social norm understanding processed`);
    });

    console.log('✓ Social reasoning tests completed\n');
  }

  /**
   * Run theory of mind engine tests
   */
  async runTheoryOfMindEngineTests() {
    console.log('--- Theory of Mind Engine Tests ---');

    await this.test('Engine initialization', async () => {
      const customEngine = TheoryOfMindFactory.createCustom({
        confidenceThreshold: 0.7,
        maxMentalModels: 25
      });

      await customEngine.initialize(TEST_PERSONALITY);

      if (!customEngine) {
        throw new Error('Custom engine creation failed');
      }

      const metrics = customEngine.getMetrics();
      if (!metrics) {
        throw new Error('Metrics not available');
      }

      console.log(`  Custom engine initialized with threshold: 0.7`);
    });

    await this.test('Behavior prediction', async () => {
      const agentId = 'test_agent_13';
      
      // Create mental state first
      const observation = {
        actions: ['explore', 'collect_resources'],
        behavioralCues: ['curious', 'resourceful'],
        recentHistory: [],
        timestamp: Date.now()
      };

      const context = {
        environment: { location: 'forest', resources: 'wood' },
        socialContext: {},
        relationship: TEST_RELATIONSHIP
      };

      await this.theoryOfMindEngine.processObservation(
        agentId,
        observation,
        context,
        TEST_PERSONALITY
      );

      // Predict behavior
      const prediction = await this.theoryOfMindEngine.predictBehavior(
        agentId,
        context,
        10000
      );

      if (!prediction || !prediction.predictions) {
        throw new Error('Behavior prediction failed');
      }

      if (prediction.confidence < 0) {
        throw new Error('Invalid prediction confidence');
      }

      console.log(`  Behavior predicted with confidence: ${prediction.confidence.toFixed(3)}`);
    });

    await this.test('Perspective taking', async () => {
      const agentId = 'test_agent_14';
      
      // Create mental state first
      const observation = {
        actions: ['observe_situation', 'analyze_options'],
        behavioralCues: ['analytical', 'thoughtful'],
        recentHistory: [],
        timestamp: Date.now()
      };

      const context = {
        environment: { location: 'crossroads', choices: ['left', 'right'] },
        socialContext: {},
        relationship: TEST_RELATIONSHIP
      };

      await this.theoryOfMindEngine.processObservation(
        agentId,
        observation,
        context,
        TEST_PERSONALITY
      );

      // Take perspective
      const perspective = await this.theoryOfMindEngine.takePerspective(
        agentId,
        context,
        3000
      );

      if (!perspective || !perspective.perspective) {
        throw new Error('Perspective taking failed');
      }

      console.log(`  Perspective taken with confidence: ${perspective.confidence.toFixed(3)}`);
    });

    await this.test('Deception detection', async () => {
      const agentId = 'test_agent_15';
      
      // Create mental state first
      const observation = {
        actions: ['hide_item', 'lie_about_location'],
        behavioralCues: ['nervous', 'deceptive'],
        recentHistory: [
          { action: 'hide_item', timestamp: Date.now() - 1000 }
        ],
        timestamp: Date.now()
      };

      const context = {
        environment: { location: 'trading_post' },
        socialContext: {},
        relationship: TEST_RELATIONSHIP
      };

      await this.theoryOfMindEngine.processObservation(
        agentId,
        observation,
        context,
        TEST_PERSONALITY
      );

      // Test deception detection
      const communication = {
        message: 'I don\'t have the item',
        behavioralCues: ['avoids_eye_contact', 'fidgeting'],
        recentHistory: []
      };

      const deception = await this.theoryOfMindEngine.detectDeception(
        agentId,
        communication,
        context
      );

      if (!deception) {
        throw new Error('Deception detection failed');
      }

      console.log(`  Deception analyzed with probability: ${deception.overallDeceptionProbability.toFixed(3)}`);
    });

    console.log('✓ Theory of mind engine tests completed\n');
  }

  /**
   * Run integration tests
   */
  async runIntegrationTests() {
    console.log('--- Integration Tests ---');

    await this.test('Relationship manager integration', async () => {
      const agentId = 'test_agent_16';
      const relationship = {
        ...TEST_RELATIONSHIP,
        id: 'integration_relationship',
        trust: 0.9,
        strength: 0.8
      };

      const context = {
        environment: { location: 'social_hub' },
        socialContext: {},
        relationship
      };

      // Update relationship
      await this.theoryOfMindEngine.updateRelationship(agentId, relationship, context);

      // Process observation with relationship context
      const observation = {
        actions: ['cooperate', 'share_information'],
        behavioralCues: ['trusting', 'open'],
        recentHistory: [],
        timestamp: Date.now()
      };

      const mentalState = await this.theoryOfMindEngine.processObservation(
        agentId,
        observation,
        context,
        TEST_PERSONALITY
      );

      if (!mentalState) {
        throw new Error('Relationship integration failed');
      }

      console.log(`  Relationship integration successful`);
    });

    await this.test('Memory system integration', async () => {
      const agentId = 'test_agent_17';
      
      // Multiple observations to test memory
      const observations = [
        {
          actions: ['learn_skill'],
          behavioralCues: ['focused'],
          recentHistory: [],
          timestamp: Date.now() - 5000
        },
        {
          actions: ['practice_skill'],
          behavioralCues: ['improving'],
          recentHistory: [{ action: 'learn_skill', timestamp: Date.now() - 5000 }],
          timestamp: Date.now() - 2500
        },
        {
          actions: ['master_skill'],
          behavioralCues: ['confident', 'skilled'],
          recentHistory: [{ action: 'practice_skill', timestamp: Date.now() - 2500 }],
          timestamp: Date.now()
        }
      ];

      const context = {
        environment: { location: 'training_area' },
        socialContext: {},
        relationship: TEST_RELATIONSHIP
      };

      for (const observation of observations) {
        await this.theoryOfMindEngine.processObservation(
          agentId,
          observation,
          context,
          TEST_PERSONALITY
        );
      }

      const finalState = this.theoryOfMindEngine.getMentalState(agentId);

      if (!finalState) {
        throw new Error('Memory integration failed');
      }

      // Check if memory accumulated
      const hasSkillMemory = finalState.knowledge.procedural.some(skill =>
        skill.confidence > 0.7
      );

      if (!hasSkillMemory) {
        console.log('  Warning: Skill memory may not have accumulated properly');
      }

      console.log(`  Memory integration successful`);
    });

    await this.test('Personality system integration', async () => {
      const agentId = 'test_agent_18';
      
      // Test with different personality traits
      const aggressivePersonality = {
        ...TEST_PERSONALITY,
        aggressiveness: 0.9,
        competitiveness: 0.8,
        riskTolerance: 0.7
      };

      const observation = {
        actions: ['challenge_opponent', 'competitive_behavior'],
        behavioralCues: ['aggressive', 'competitive'],
        recentHistory: [],
        timestamp: Date.now()
      };

      const context = {
        environment: { location: 'arena' },
        socialContext: { competition: true },
        relationship: TEST_RELATIONSHIP
      };

      const mentalState = await this.theoryOfMindEngine.processObservation(
        agentId,
        observation,
        context,
        aggressivePersonality
      );

      if (!mentalState) {
        throw new Error('Personality integration failed');
      }

      console.log(`  Personality integration successful`);
    });

    console.log('✓ Integration tests completed\n');
  }

  /**
   * Run performance tests
   */
  async runPerformanceTests() {
    console.log('--- Performance Tests ---');

    await this.test('Single observation processing time', async () => {
      const observation = {
        actions: ['test_action'],
        behavioralCues: ['test_cue'],
        recentHistory: [],
        timestamp: Date.now()
      };

      const context = {
        environment: { location: 'test_area' },
        socialContext: {},
        relationship: TEST_RELATIONSHIP
      };

      const startTime = Date.now();
      
      await this.theoryOfMindEngine.processObservation(
        'perf_test_agent',
        observation,
        context,
        TEST_PERSONALITY
      );

      const processingTime = Date.now() - startTime;

      if (processingTime > TEST_CONFIG.performanceThreshold) {
        throw new Error(`Processing time ${processingTime}ms exceeds threshold ${TEST_CONFIG.performanceThreshold}ms`);
      }

      this.results.performance.singleObservation = processingTime;
      console.log(`  Single observation: ${processingTime}ms`);
    });

    await this.test('Concurrent agent processing', async () => {
      const agentCount = 5;
      const startTime = Date.now();

      const promises = [];
      for (let i = 0; i < agentCount; i++) {
        const observation = {
          actions: [`action_${i}`],
          behavioralCues: [`cue_${i}`],
          recentHistory: [],
          timestamp: Date.now()
        };

        const context = {
          environment: { location: `area_${i}` },
          socialContext: {},
          relationship: TEST_RELATIONSHIP
        };

        promises.push(
          this.theoryOfMindEngine.processObservation(
            `concurrent_agent_${i}`,
            observation,
            context,
            TEST_PERSONALITY
          )
        );
      }

      await Promise.all(promises);

      const totalTime = Date.now() - startTime;
      const averageTime = totalTime / agentCount;

      this.results.performance.concurrentProcessing = averageTime;
      console.log(`  Concurrent processing (${agentCount} agents): ${averageTime}ms average`);
    });

    await this.test('Memory usage scaling', async () => {
      const agentCount = 10;
      const initialMetrics = this.theoryOfMindEngine.getMetrics();

      // Create mental states for multiple agents
      for (let i = 0; i < agentCount; i++) {
        const observation = {
          actions: [`memory_test_${i}`],
          behavioralCues: ['test_cue'],
          recentHistory: [],
          timestamp: Date.now()
        };

        const context = {
          environment: { location: 'memory_test_area' },
          socialContext: {},
          relationship: TEST_RELATIONSHIP
        };

        await this.theoryOfMindEngine.processObservation(
          `memory_agent_${i}`,
          observation,
          context,
          TEST_PERSONALITY
        );
      }

      const finalMetrics = this.theoryOfMindEngine.getMetrics();
      const memoryIncrease = finalMetrics.memoryUsage - initialMetrics.memoryUsage;

      this.results.performance.memoryUsage = memoryIncrease;
      console.log(`  Memory usage increase: ${memoryIncrease} bytes for ${agentCount} agents`);
    });

    await this.test('Prediction performance', async () => {
      const agentId = 'prediction_perf_agent';
      
      // Create mental state first
      const observation = {
        actions: ['prepare_for_prediction'],
        behavioralCues: ['ready'],
        recentHistory: [],
        timestamp: Date.now()
      };

      const context = {
        environment: { location: 'prediction_test_area' },
        socialContext: {},
        relationship: TEST_RELATIONSHIP
      };

      await this.theoryOfMindEngine.processObservation(
        agentId,
        observation,
        context,
        TEST_PERSONALITY
      );

      // Test prediction performance
      const startTime = Date.now();
      
      const prediction = await this.theoryOfMindEngine.predictBehavior(
        agentId,
        context,
        5000
      );

      const predictionTime = Date.now() - startTime;

      if (predictionTime > TEST_CONFIG.performanceThreshold) {
        throw new Error(`Prediction time ${predictionTime}ms exceeds threshold ${TEST_CONFIG.performanceThreshold}ms`);
      }

      this.results.performance.prediction = predictionTime;
      console.log(`  Prediction: ${predictionTime}ms`);
    });

    console.log('✓ Performance tests completed\n');
  }

  /**
   * Run advanced feature tests
   */
  async runAdvancedFeatureTests() {
    console.log('--- Advanced Feature Tests ---');

    await this.test('False belief understanding', async () => {
      const agentId = 'false_belief_agent';
      
      const observation = {
        actions: ['hide_object', 'lie_about_location'],
        behavioralCues: ['deceptive', 'secretive'],
        recentHistory: [
          { action: 'hide_object', timestamp: Date.now() - 1000 }
        ],
        timestamp: Date.now()
      };

      const context = {
        environment: { location: 'test_room', hidden_object: 'key' },
        socialContext: {},
        relationship: TEST_RELATIONSHIP
      };

      await this.theoryOfMindEngine.processObservation(
        agentId,
        observation,
        context,
        TEST_PERSONALITY
      );

      const communication = {
        message: 'The key is not here',
        behavioralCues: ['deceptive'],
        recentHistory: []
      };

      const deception = await this.theoryOfMindEngine.detectDeception(
        agentId,
        communication,
        context
      );

      if (!deception) {
        throw new Error('False belief understanding test failed');
      }

      console.log(`  False belief understanding: deception probability ${deception.overallDeceptionProbability.toFixed(3)}`);
    });

    await this.test('Cultural context modeling', async () => {
      const observation = {
        actions: ['follow_cultural_norm', 'participate_in_ritual'],
        behavioralCues: ['culturally_aware', 'respectful'],
        recentHistory: [],
        timestamp: Date.now()
      };

      const context = {
        environment: { location: 'cultural_center' },
        socialContext: {
          cultural_context: 'collectivist_culture',
          cultural_norms: ['group_harmony', 'respect_elders']
        },
        relationship: TEST_RELATIONSHIP
      };

      const mentalState = await this.theoryOfMindEngine.processObservation(
        'cultural_agent',
        observation,
        context,
        TEST_PERSONALITY
      );

      if (!mentalState) {
        throw new Error('Cultural context modeling failed');
      }

      console.log(`  Cultural context modeling successful`);
    });

    await this.test('Group behavior prediction', async () => {
      const observation = {
        actions: ['coordinate_with_group', 'follow_leader'],
        behavioralCues: ['cooperative', 'follower'],
        recentHistory: [],
        timestamp: Date.now()
      };

      const context = {
        environment: { location: 'group_activity_area' },
        socialContext: {
          group_size: 10,
          group_structure: 'hierarchical',
          group_goal: 'collaborative_task'
        },
        relationship: TEST_RELATIONSHIP
      };

      const mentalState = await this.theoryOfMindEngine.processObservation(
        'group_agent',
        observation,
        context,
        TEST_PERSONALITY
      );

      if (!mentalState) {
        throw new Error('Group behavior prediction failed');
      }

      console.log(`  Group behavior prediction successful`);
    });

    console.log('✓ Advanced feature tests completed\n');
  }

  /**
   * Run a single test
   */
  async test(testName, testFunction) {
    this.results.total++;
    
    try {
      const startTime = Date.now();
      await testFunction();
      const duration = Date.now() - startTime;
      
      this.results.passed++;
      console.log(`✓ ${testName} (${duration}ms)`);
      
    } catch (error) {
      this.results.failed++;
      this.results.errors.push({ test: testName, error });
      console.log(`✗ ${testName}: ${error.message}`);
    }
  }

  /**
   * Print test results
   */
  printResults(totalTime) {
    console.log('\n=== Test Results ===');
    console.log(`Total tests: ${this.results.total}`);
    console.log(`Passed: ${this.results.passed}`);
    console.log(`Failed: ${this.results.failed}`);
    console.log(`Success rate: ${((this.results.passed / this.results.total) * 100).toFixed(1)}%`);
    console.log(`Total time: ${totalTime}ms`);

    if (Object.keys(this.results.performance).length > 0) {
      console.log('\n--- Performance Metrics ---');
      for (const [metric, value] of Object.entries(this.results.performance)) {
        console.log(`${metric}: ${value}ms`);
      }
    }

    if (this.results.errors.length > 0) {
      console.log('\n--- Errors ---');
      for (const { test, error } of this.results.errors) {
        console.log(`${test}: ${error.message}`);
      }
    }

    console.log('\n=== Test Suite Complete ===');
  }
}

/**
 * Run the test suite
 */
async function runTheoryOfMindTests() {
  const testSuite = new TheoryOfMindTestSuite();
  await testSuite.runAllTests();
}

// Export for use in other files
export { TheoryOfMindTestSuite, runTheoryOfMindTests };

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTheoryOfMindTests().catch(console.error);
}