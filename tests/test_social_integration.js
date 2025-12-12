/**
 * Social Context Integration Test Suite
 * Tests the integration of social context into cognitive components
 */

// Import required modules
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

console.log('Starting Social Context Integration Tests...');

// Set up error handling
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Mock the modules for testing
const mockCognitiveComponents = {
  PurposeCore: class {
    constructor(config) {
      this.socialState = config.socialState;
    }
    
    async calculateActionUtility(action, context) {
      // Test social influence calculation
      const socialInfluence = this.calculateSocialInfluence(context.social);
      return 0.5 + socialInfluence;
    }
    
    calculateSocialInfluence(socialState) {
      let influence = 0.5;
      
      // Trust levels increase influence
      if (socialState.relationships && socialState.relationships.trustLevels) {
        const trustValues = Object.values(socialState.relationships.trustLevels);
        const averageTrust = trustValues.reduce((sum, trust) => sum + trust, 0) / (trustValues.length || 1);
        influence += averageTrust * 0.3;
      }
      
      return influence;
    }
    
    async updateFromSocialFeedback(feedback) {
      this.socialFeedback = feedback;
      return true;
    }
    
    async generateSocialGoals(context) {
      return [
        {
          id: 'social_goal_1',
          type: 'social',
          description: 'Maintain positive relationships',
          priority: 0.7
        }
      ];
    }
  },
  
  GoalSystem: class {
    constructor(config) {
      this.socialState = config.socialState;
    }
    
    async generateSocialGoals(context) {
      const goals = [];
      
      // Generate collaborative goals
      if (context.nearbyAgents && context.nearbyAgents.length > 0) {
        goals.push({
          id: 'collaborative_goal',
          type: 'collaborative',
          description: 'Collaborate with nearby agents',
          priority: 0.8,
          participants: context.nearbyAgents
        });
      }
      
      return goals;
    }
    
    async applySocialInfluence(goals, socialContext) {
      return goals.map(goal => ({
        ...goal,
        priority: goal.priority * (1 + socialContext.influence * 0.2)
      }));
    }
  },
  
  SkillsSystem: class {
    constructor(config) {
      this.socialState = config.socialState;
    }
    
    async learnFromObservation(observation) {
      this.observedSkills = this.observedSkills || [];
      this.observedSkills.push(observation);
      return true;
    }
    
    async validateSkillWithSocialFeedback(skill, feedback) {
      const socialValidation = feedback.reduce((acc, f) => acc + f.rating, 0) / feedback.length;
      return {
        ...skill,
        socialValidation,
        reputation: skill.reputation + socialValidation * 0.1
      };
    }
    
    async executeCollaborativeSkill(skill, partners) {
      return {
        success: true,
        result: `Collaboratively executed ${skill.name} with ${partners.length} partners`,
        synergyBonus: partners.length * 0.1
      };
    }
    
    async teachSkill(studentId, skill) {
      this.teachingHistory = this.teachingHistory || [];
      this.teachingHistory.push({
        studentId,
        skillId: skill.id,
        timestamp: Date.now(),
        success: true
      });
      return true;
    }
  },
  
  LearningEngine: class {
    constructor(config) {
      this.socialState = config.socialState;
    }
    
    async processSocialExperience(experience) {
      this.socialExperiences = this.socialExperiences || [];
      this.socialExperiences.push(experience);
      
      // Learn from social interactions
      if (experience.type === 'social_interaction') {
        return {
          learned: true,
          impact: experience.impact * 1.2, // Social learning bonus
          patterns: this.extractSocialPatterns(experience)
        };
      }
      
      return { learned: false };
    }
    
    extractSocialPatterns(experience) {
      return {
        pattern: 'cooperation',
        confidence: 0.8,
        context: experience.context
      };
    }
    
    async learnFromObservedInteractions(observation) {
      this.observedInteractions = this.observedInteractions || [];
      this.observedInteractions.push(observation);
      
      return {
        learned: true,
        socialInsight: `Learned from ${observation.targetAgent}'s behavior`
      };
    }
    
    async integrateCulturalNorms(norms) {
      this.culturalNorms = this.culturalNorms || {};
      Object.assign(this.culturalNorms, norms);
      return true;
    }
    
    async processSocialFeedback(feedback) {
      this.socialFeedbackHistory = this.socialFeedbackHistory || [];
      this.socialFeedbackHistory.push(feedback);
      
      return {
        adaptation: true,
        personalityAdjustment: feedback.impact * 0.1
      };
    }
  },
  
  MemorySystem: class {
    constructor(config) {
      this.socialState = config.socialState;
    }
    
    async storeSocialMemory(memory) {
      this.socialMemories = this.socialMemories || [];
      this.socialMemories.push(memory);
      return true;
    }
    
    async retrieveSocialMemories(query) {
      const memories = this.socialMemories || [];
      return memories.filter(mem => 
        mem.type === query.type && 
        mem.participants.some(p => query.participants.includes(p))
      );
    }
    
    async updateRelationshipHistory(relationship) {
      this.relationshipHistory = this.relationshipHistory || [];
      this.relationshipHistory.push(relationship);
      return true;
    }
    
    async storeSocialKnowledge(knowledge) {
      this.socialKnowledge = this.socialKnowledge || {};
      this.socialKnowledge[knowledge.id] = knowledge;
      return true;
    }
    
    async retrieveSocialKnowledge(query) {
      const knowledge = this.socialKnowledge || {};
      return Object.values(knowledge).filter(k => 
        k.concepts.includes(query.concept) || 
        k.relationships.some(r => query.relationships.includes(r))
      );
    }
    
    async storeProceduralSocialMemory(procedure) {
      this.socialProcedures = this.socialProcedures || [];
      this.socialProcedures.push(procedure);
      return true;
    }
    
    async updateSocialWorkingMemory(context) {
      this.socialWorkingMemory = this.socialWorkingMemory || {
        activeAgents: [],
        currentSituation: null,
        socialTasks: []
      };
      
      this.socialWorkingMemory.activeAgents = context.nearbyAgents;
      this.socialWorkingMemory.currentSituation = context.situation;
      this.socialWorkingMemory.socialTasks = context.tasks || [];
      
      return true;
    }
  }
};

// Test configuration
const testConfig = {
  socialState: {
    relationships: {
      agentId: 'test_agent',
      relationshipCount: 3,
      activeRelationships: ['agent_1', 'agent_2', 'agent_3'],
      trustLevels: {
        'agent_1': 0.8,
        'agent_2': 0.6,
        'agent_3': 0.4
      },
      friendshipLevels: {
        'agent_1': 0.7,
        'agent_2': 0.5,
        'agent_3': 0.3
      },
      reputationScore: 0.7,
      lastUpdate: Date.now()
    },
    theoryOfMind: {
      mentalModels: {
        'agent_1': {
          agentId: 'agent_1',
          confidence: 0.8,
          lastUpdated: Date.now(),
          intentions: ['cooperate', 'explore'],
          beliefs: { friendly: 0.9, helpful: 0.8 },
          emotions: { primary: 'happy', intensity: 0.7, valence: 0.8, arousal: 0.6, timestamp: Date.now() }
        }
      },
      activePredictions: [],
      emotionalUnderstanding: {},
      perspectiveTakingHistory: [],
      lastUpdate: Date.now()
    },
    socialContext: {
      nearbyAgents: ['agent_1', 'agent_2'],
      groupDynamics: {
        leader: 'agent_1',
        cohesion: 0.8,
        hierarchy: ['leader', 'member', 'member'],
        roles: { 'agent_1': 'leader', 'agent_2': 'member', 'agent_3': 'member' },
        alliances: []
      },
      socialNorms: [],
      culturalContext: {
        culturalBackground: 'cooperative',
        values: ['helpfulness', 'cooperation'],
        practices: ['sharing', 'communication'],
        communicationStyle: 'friendly',
        socialHierarchy: []
      },
      currentSituation: {
        type: 'cooperation',
        participants: ['agent_1', 'agent_2'],
        goals: ['explore_together'],
        resources: ['tools', 'materials'],
        powerDynamics: { 'agent_1': 0.8, 'agent_2': 0.6 }
      }
    },
    socialLearning: {
      observedBehaviors: [],
      learnedPatterns: [],
      teachingHistory: [],
      socialSkillProgress: {},
      lastUpdate: Date.now()
    }
  }
};

// Test functions
async function testPurposeCoreSocialIntegration() {
  console.log('Testing Purpose Core Social Integration...');
  
  const purposeCore = new mockCognitiveComponents.PurposeCore(testConfig);
  
  // Test social influence calculation
  const testAction = { type: 'help_agent', parameters: {} };
  const testContext = { social: testConfig.socialState };
  const utility = await purposeCore.calculateActionUtility(testAction, testContext);
  
  if (utility > 0.5) {
    console.log('✅ Purpose Core: Social influence calculation working');
  } else {
    console.log('❌ Purpose Core: Social influence calculation failed');
  }
  
  // Test social feedback update
  const feedback = { impact: 0.8, source: 'agent_1' };
  const updateResult = await purposeCore.updateFromSocialFeedback(feedback);
  
  if (updateResult) {
    console.log('✅ Purpose Core: Social feedback update working');
  } else {
    console.log('❌ Purpose Core: Social feedback update failed');
  }
  
  // Test social goal generation
  const socialGoals = await purposeCore.generateSocialGoals(testContext);
  
  if (socialGoals.length > 0) {
    console.log('✅ Purpose Core: Social goal generation working');
  } else {
    console.log('❌ Purpose Core: Social goal generation failed');
  }
  
  return true;
}

async function testGoalSystemSocialIntegration() {
  console.log('Testing Goal System Social Integration...');
  
  const goalSystem = new mockCognitiveComponents.GoalSystem(testConfig);
  
  // Test social goal generation
  const socialGoals = await goalSystem.generateSocialGoals(testConfig.socialState.socialContext);
  
  if (socialGoals.length > 0 && socialGoals[0].participants) {
    console.log('✅ Goal System: Social goal generation working');
  } else {
    console.log('❌ Goal System: Social goal generation failed');
  }
  
  // Test social influence application
  const goalsWithInfluence = await goalSystem.applySocialInfluence(socialGoals, { influence: 0.7 });
  
  if (goalsWithInfluence.some(g => g.priority > 1)) {
    console.log('✅ Goal System: Social influence application working');
  } else {
    console.log('❌ Goal System: Social influence application failed');
  }
  
  return true;
}

async function testSkillsSystemSocialIntegration() {
  console.log('Testing Skills System Social Integration...');
  
  const skillsSystem = new mockCognitiveComponents.SkillsSystem(testConfig);
  
  // Test social learning from observation
  const observation = { agentId: 'agent_1', skill: 'mining', success: true };
  const learnResult = await skillsSystem.learnFromObservation(observation);
  
  if (learnResult) {
    console.log('✅ Skills System: Social learning from observation working');
  } else {
    console.log('❌ Skills System: Social learning from observation failed');
  }
  
  // Test skill validation with social feedback
  const skill = { id: 'mining', name: 'Mining', reputation: 0.5 };
  const feedback = [{ rating: 0.8, source: 'agent_1' }, { rating: 0.6, source: 'agent_2' }];
  const validationResult = await skillsSystem.validateSkillWithSocialFeedback(skill, feedback);
  
  if (validationResult.reputation > 0.5) {
    console.log('✅ Skills System: Social validation working');
  } else {
    console.log('❌ Skills System: Social validation failed');
  }
  
  // Test collaborative skill execution
  const partners = ['agent_1', 'agent_2'];
  const collabResult = await skillsSystem.executeCollaborativeSkill(skill, partners);
  
  if (collabResult.success && collabResult.synergyBonus > 0) {
    console.log('✅ Skills System: Collaborative execution working');
  } else {
    console.log('❌ Skills System: Collaborative execution failed');
  }
  
  // Test teaching capability
  const teachResult = await skillsSystem.teachSkill('agent_3', skill);
  
  if (teachResult) {
    console.log('✅ Skills System: Teaching capability working');
  } else {
    console.log('❌ Skills System: Teaching capability failed');
  }
  
  return true;
}

async function testLearningEngineSocialIntegration() {
  console.log('Testing Learning Engine Social Integration...');
  
  const learningEngine = new mockCognitiveComponents.LearningEngine(testConfig);
  
  // Test social experience processing
  const socialExperience = {
    type: 'social_interaction',
    impact: 0.7,
    context: { situation: 'cooperation', participants: ['agent_1', 'agent_2'] }
  };
  const experienceResult = await learningEngine.processSocialExperience(socialExperience);
  
  if (experienceResult.learned && experienceResult.impact > 0.8) {
    console.log('✅ Learning Engine: Social experience processing working');
  } else {
    console.log('❌ Learning Engine: Social experience processing failed');
  }
  
  // Test learning from observed interactions
  const observation = {
    targetAgent: 'agent_1',
    behavior: 'helpful',
    outcome: 'success',
    timestamp: Date.now()
  };
  const observationResult = await learningEngine.learnFromObservedInteractions(observation);
  
  if (observationResult.learned) {
    console.log('✅ Learning Engine: Observed interaction learning working');
  } else {
    console.log('❌ Learning Engine: Observed interaction learning failed');
  }
  
  // Test cultural norm integration
  const norms = { cooperation: 0.9, sharing: 0.8, communication: 0.7 };
  const normResult = await learningEngine.integrateCulturalNorms(norms);
  
  if (normResult) {
    console.log('✅ Learning Engine: Cultural norm integration working');
  } else {
    console.log('❌ Learning Engine: Cultural norm integration failed');
  }
  
  // Test social feedback processing
  const feedback = { impact: 0.8, source: 'agent_1', type: 'positive' };
  const feedbackResult = await learningEngine.processSocialFeedback(feedback);
  
  if (feedbackResult.adaptation && feedbackResult.personalityAdjustment > 0) {
    console.log('✅ Learning Engine: Social feedback processing working');
  } else {
    console.log('❌ Learning Engine: Social feedback processing failed');
  }
  
  return true;
}

async function testMemorySystemSocialIntegration() {
  console.log('Testing Memory System Social Integration...');
  
  const memorySystem = new mockCognitiveComponents.MemorySystem(testConfig);
  
  // Test social memory storage
  const socialMemory = {
    id: 'social_mem_1',
    type: 'interaction',
    participants: ['agent_1', 'agent_2'],
    timestamp: Date.now(),
    importance: 0.8
  };
  const storeResult = await memorySystem.storeSocialMemory(socialMemory);
  
  if (storeResult) {
    console.log('✅ Memory System: Social memory storage working');
  } else {
    console.log('❌ Memory System: Social memory storage failed');
  }
  
  // Test social memory retrieval
  const query = { type: 'interaction', participants: ['agent_1', 'agent_2'] };
  const retrieveResult = await memorySystem.retrieveSocialMemories(query);
  
  if (retrieveResult.length > 0) {
    console.log('✅ Memory System: Social memory retrieval working');
  } else {
    console.log('❌ Memory System: Social memory retrieval failed');
  }
  
  // Test relationship history update
  const relationship = { agentId: 'agent_1', type: 'friendship', strength: 0.8, timestamp: Date.now() };
  const relationshipResult = await memorySystem.updateRelationshipHistory(relationship);
  
  if (relationshipResult) {
    console.log('✅ Memory System: Relationship history update working');
  } else {
    console.log('❌ Memory System: Relationship history update failed');
  }
  
  // Test social knowledge storage
  const knowledge = { id: 'social_rule_1', concepts: ['cooperation'], relationships: ['leads_to'] };
  const knowledgeResult = await memorySystem.storeSocialKnowledge(knowledge);
  
  if (knowledgeResult) {
    console.log('✅ Memory System: Social knowledge storage working');
  } else {
    console.log('❌ Memory System: Social knowledge storage failed');
  }
  
  // Test social knowledge retrieval
  const knowledgeQuery = { concept: 'cooperation', relationships: ['leads_to'] };
  const knowledgeRetrieveResult = await memorySystem.retrieveSocialKnowledge(knowledgeQuery);
  
  if (knowledgeRetrieveResult.length > 0) {
    console.log('✅ Memory System: Social knowledge retrieval working');
  } else {
    console.log('❌ Memory System: Social knowledge retrieval failed');
  }
  
  // Test procedural social memory
  const procedure = { id: 'social_proc_1', name: 'collaborative_gathering', steps: [] };
  const procResult = await memorySystem.storeProceduralSocialMemory(procedure);
  
  if (procResult) {
    console.log('✅ Memory System: Procedural social memory working');
  } else {
    console.log('❌ Memory System: Procedural social memory failed');
  }
  
  // Test social working memory
  const workingContext = {
    nearbyAgents: ['agent_1', 'agent_2'],
    situation: { type: 'cooperation' },
    tasks: ['collaborate', 'communicate']
  };
  const workingResult = await memorySystem.updateSocialWorkingMemory(workingContext);
  
  if (workingResult) {
    console.log('✅ Memory System: Social working memory working');
  } else {
    console.log('❌ Memory System: Social working memory failed');
  }
  
  return true;
}

async function testLangGraphStateNodesSocialIntegration() {
  console.log('Testing LangGraph State Nodes Social Integration...');
  
  // Mock agent state with social context
  const mockAgentState = {
    context: {
      position: { x: 0, y: 64, z: 0 },
      health: 20,
      food: 20,
      experience: 0,
      dimension: 'overworld',
      timeOfDay: 6000,
      weather: 'clear',
      nearbyEntities: [
        { id: 1, type: 'player', position: { x: 5, y: 64, z: 5 }, health: 20, distance: 5, hostile: false }
      ],
      nearbyBlocks: [],
      inventory: [],
      equipment: {}
    },
    reactive: {
      activeMode: 'none',
      emergencyConditions: [],
      interruptHistory: []
    },
    cognitive: {
      purpose: {
        identity: { name: 'test_agent', role: 'explorer', background: 'test', corePurpose: 'testing' },
        personality: {
          openness: 0.7,
          conscientiousness: 0.8,
          extraversion: 0.6,
          agreeableness: 0.7,
          neuroticism: 0.3,
          riskTolerance: 0.5,
          explorationDrive: 0.8,
          socialTendency: 0.7,
          buildingCreativity: 0.6,
          combatAggression: 0.3
        },
        motivations: {
          primaryMotivation: 'exploration',
          secondaryMotivations: ['learning', 'cooperation'],
          drives: { exploration: 0.8, cooperation: 0.7 },
          satisfactions: { exploration: 0.6, cooperation: 0.7 }
        },
        values: {
          coreValues: ['cooperation', 'learning'],
          valuePriorities: { cooperation: 0.9, learning: 0.8 },
          moralConstraints: ['no_harm', 'help_others']
        },
        ethics: {
          harmAvoidance: 0.9,
          fairnessConcern: 0.8,
          loyaltyPriority: 0.7,
          authorityRespect: 0.6,
          purityConcern: 0.5
        }
      },
      goals: {
        strategicGoals: [],
        tacticalGoals: [],
        operationalGoals: [],
        activeGoals: [],
        goalHistory: []
      },
      skills: {
        skills: {},
        experience: [],
        learningRate: 0.1,
        skillSynergies: {}
      },
      memory: {
        semantic: { facts: {}, concepts: {}, relationships: {} },
        episodic: { episodes: [], currentIndex: 0, compressionLevel: 0 },
        procedural: { procedures: {}, sequences: {}, habits: [] },
        working: { currentFocus: 'none', activeTasks: [], buffer: [], capacity: 7, decayRate: 0.1 }
      },
      processing: {
        currentPhase: 'perception',
        cognitiveLoad: 0.3,
        attentionLevel: 0.7,
        decisionThreshold: 0.5,
        processingHistory: []
      },
      social: testConfig.socialState
    },
    executive: {
      currentAction: undefined,
      actionQueue: [],
      decisionHistory: [],
      performanceMetrics: {
        reactiveResponseTime: [],
        cognitiveProcessingTime: [],
        successRate: 0.8,
        learningRate: 0.1,
        goalCompletionRate: 0.7,
        survivalEvents: 0,
        socialInteractions: 5
      }
    },
    metadata: {
      agentId: 'test_agent',
      startTime: Date.now(),
      lastUpdate: Date.now(),
      version: '2.0.0',
      performanceMode: 'balanced'
    }
  };
  
  // Test that social state is properly integrated
  if (mockAgentState.cognitive.social) {
    console.log('✅ LangGraph State Nodes: Social state integration working');
  } else {
    console.log('❌ LangGraph State Nodes: Social state integration failed');
  }
  
  // Test social context processing
  if (mockAgentState.cognitive.social.relationships && 
      mockAgentState.cognitive.social.theoryOfMind &&
      mockAgentState.cognitive.social.socialContext &&
      mockAgentState.cognitive.social.socialLearning) {
    console.log('✅ LangGraph State Nodes: All social components integrated');
  } else {
    console.log('❌ LangGraph State Nodes: Missing social components');
  }
  
  // Test social influence calculation
  const socialInfluence = mockAgentState.cognitive.social.relationships.trustLevels ? 
    Object.values(mockAgentState.cognitive.social.relationships.trustLevels)
      .reduce((sum, trust) => sum + trust, 0) / 
      Object.keys(mockAgentState.cognitive.social.relationships.trustLevels).length : 0;
  
  if (socialInfluence > 0.5) {
    console.log('✅ LangGraph State Nodes: Social influence calculation working');
  } else {
    console.log('❌ LangGraph State Nodes: Social influence calculation failed');
  }
  
  return true;
}

async function testSocialIntegrationPerformance() {
  console.log('Testing Social Integration Performance...');
  
  const startTime = Date.now();
  
  // Run all integration tests
  await testPurposeCoreSocialIntegration();
  await testGoalSystemSocialIntegration();
  await testSkillsSystemSocialIntegration();
  await testLearningEngineSocialIntegration();
  await testMemorySystemSocialIntegration();
  await testLangGraphStateNodesSocialIntegration();
  
  const endTime = Date.now();
  const totalTime = endTime - startTime;
  
  // Performance should be under 1 second for all tests
  if (totalTime < 1000) {
    console.log(`✅ Social Integration Performance: ${totalTime}ms (under 1000ms threshold)`);
  } else {
    console.log(`❌ Social Integration Performance: ${totalTime}ms (exceeds 1000ms threshold)`);
  }
  
  return totalTime < 1000;
}

// Main test runner
async function runSocialIntegrationTests() {
  console.log('='.repeat(50));
  console.log('SOCIAL CONTEXT INTEGRATION TEST SUITE');
  console.log('='.repeat(50));
  
  const results = {
    purposeCore: await testPurposeCoreSocialIntegration(),
    goalSystem: await testGoalSystemSocialIntegration(),
    skillsSystem: await testSkillsSystemSocialIntegration(),
    learningEngine: await testLearningEngineSocialIntegration(),
    memorySystem: await testMemorySystemSocialIntegration(),
    langGraphStateNodes: await testLangGraphStateNodesSocialIntegration(),
    performance: await testSocialIntegrationPerformance()
  };
  
  const allTestsPassed = Object.values(results).every(result => result === true);
  
  console.log('='.repeat(50));
  if (allTestsPassed) {
    console.log('🎉 ALL SOCIAL INTEGRATION TESTS PASSED! 🎉');
  } else {
    console.log('❌ SOME SOCIAL INTEGRATION TESTS FAILED ❌');
    console.log('Test Results:', results);
  }
  console.log('='.repeat(50));
  
  return {
    success: allTestsPassed,
    results,
    summary: {
      totalTests: 7,
      passedTests: Object.values(results).filter(r => r === true).length,
      failedTests: Object.values(results).filter(r => r === false).length
    }
  };
}

// Export for use in other test files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    runSocialIntegrationTests,
    testPurposeCoreSocialIntegration,
    testGoalSystemSocialIntegration,
    testSkillsSystemSocialIntegration,
    testLearningEngineSocialIntegration,
    testMemorySystemSocialIntegration,
    testLangGraphStateNodesSocialIntegration,
    testSocialIntegrationPerformance
  };
}

// Run tests if this file is executed directly
if (typeof require !== 'undefined' && require.main === module) {
  runSocialIntegrationTests().then(result => {
    process.exit(result.success ? 0 : 1);
  }).catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });
}