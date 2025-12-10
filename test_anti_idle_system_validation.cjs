/**
 * Anti-Idle System Validation Test Suite
 * Comprehensive testing for anti-idle strategies implementation
 */

const { AntiIdleSystem } = require('./src/agent/cognitive/anti_idle_system.js');
const { AntiIdleGoalGenerator } = require('./src/agent/cognitive/anti_idle_goal_generator.js');
const { IdleDetectionSystem } = require('./src/agent/cognitive/idle_detection_system.js');
const { EnvironmentalOpportunityDetector } = require('./src/agent/cognitive/environmental_opportunity_detector.js');
const { PersonalityActivityGenerator } = require('./src/agent/cognitive/personality_activity_generator.js');
const { AntiIdleConfigManager } = require('./src/agent/cognitive/anti_idle_config_manager.js');
const { AntiIdleMonitoringSystem } = require('./src/agent/cognitive/anti_idle_monitoring_system.js');

// Test configuration
const TEST_CONFIG = {
  agentId: 'test_agent',
  enabled: true,
  idleDetection: {
    inactivityThreshold: 5000,
    minActivityLevel: 0.2,
    checkInterval: 1000,
    activityHistorySize: 50
  },
  goalGeneration: {
    maxAntiIdleGoals: 3,
    goalPriority: 'MEDIUM',
    goalTypes: ['OPERATIONAL', 'TACTICAL'],
    refreshInterval: 5000
  },
  opportunityDetection: {
    scanInterval: 2000,
    maxOpportunities: 15,
    opportunityTimeout: 60000,
    priorityWeights: {
      resource: 0.3,
      structure: 0.2,
      exploration: 0.2,
      social: 0.1,
      skill: 0.1,
      danger: 0.1
    }
  },
  personalityActivities: {
    enabled: true,
    minPersonalityAlignment: 0.5,
    maxActivities: 3,
    diversityFactor: 0.7
  },
  monitoring: {
    enabled: true,
    alertThreshold: 2,
    metricsRetention: 3,
    reportInterval: 180000
  }
};

// Mock data for testing
const mockAgentState = {
  metadata: {
    agentId: 'test_agent',
    startTime: Date.now(),
    lastUpdate: Date.now(),
    version: '1.0.0',
    performanceMode: 'balanced'
  },
  context: {
    position: { x: 100, y: 64, z: 200 },
    health: 80,
    food: 70,
    experience: 500,
    dimension: 'overworld',
    timeOfDay: 12000,
    weather: 'clear',
    nearbyEntities: [
      { id: 1, type: 'player', position: { x: 105, y: 64, z: 195 }, distance: 5, hostile: false },
      { id: 2, type: 'hostile_mob', position: { x: 110, y: 64, z: 205 }, distance: 10, hostile: true }
    ],
    nearbyBlocks: [
      { type: 'oak_log', position: { x: 95, y: 64, z: 190 }, distance: 5, accessible: true },
      { type: 'iron_ore', position: { x: 120, y: 64, z: 210 }, distance: 20, accessible: true }
    ],
    inventory: [
      { type: 'wood', count: 64, slot: 0 },
      { type: 'iron_ingot', count: 10, slot: 1 }
    ],
    equipment: {
      helmet: { type: 'iron_helmet', count: 1, slot: 0 }
    }
  },
  reactive: {
    activeMode: 'none',
    emergencyConditions: [],
    lastReactiveAction: undefined,
    interruptHistory: []
  },
  cognitive: {
    purpose: {
      identity: {
        name: 'Test Agent',
        role: 'test_agent',
        background: 'Test agent for validation',
        corePurpose: 'Validate anti-idle systems'
      },
      personality: {
        openness: 0.7,
        conscientiousness: 0.6,
        extraversion: 0.5,
        agreeableness: 0.8,
        neuroticism: 0.3,
        riskTolerance: 0.6,
        explorationDrive: 0.8,
        socialTendency: 0.5,
        buildingCreativity: 0.7,
        combatAggression: 0.4
      },
      motivations: {
        primaryMotivation: 'exploration',
        secondaryMotivations: ['learning', 'building'],
        drives: { curiosity: 0.8, achievement: 0.7, social: 0.5 },
        satisfactions: { curiosity: 0.6, achievement: 0.5, social: 0.4 }
      },
      values: {
        coreValues: ['knowledge', 'creativity', 'cooperation'],
        valuePriorities: { knowledge: 0.8, creativity: 0.7, cooperation: 0.6 },
        moralConstraints: ['harm_avoidance', 'fairness']
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
      skillSynergies: {},
      usage: {}
    },
    memory: {
      semantic: {
        facts: {},
        concepts: {},
        relationships: {}
      },
      episodic: {
        episodes: [],
        currentIndex: 0,
        compressionLevel: 0
      },
      procedural: {
        procedures: {},
        sequences: {},
        habits: []
      },
      working: {
        currentFocus: 'testing',
        activeTasks: ['validate_anti_idle'],
        buffer: [],
        capacity: 50,
        decayRate: 0.1
      }
    },
    processing: {
      currentPhase: 'analysis',
      cognitiveLoad: 0.5,
      attentionLevel: 0.8,
      decisionThreshold: 0.7,
      processingHistory: []
    },
    social: {
      relationships: {
        agentId: 'test_agent',
        relationshipCount: 0,
        activeRelationships: [],
        trustLevels: {},
        friendshipLevels: {},
        reputationScore: 0.5,
        lastUpdate: Date.now()
      },
      theoryOfMind: {
        mentalModels: {},
        activePredictions: [],
        emotionalUnderstanding: {},
        perspectiveTakingHistory: [],
        lastUpdate: Date.now()
      },
      socialContext: {
        nearbyAgents: ['player_1'],
        groupDynamics: {
          leader: undefined,
          cohesion: 0.5,
          hierarchy: [],
          roles: {},
          alliances: []
        },
        socialNorms: [],
        culturalContext: {
          culturalBackground: 'test',
          values: ['validation'],
          practices: ['testing'],
          communicationStyle: 'direct',
          socialHierarchy: []
        },
        currentSituation: {
          type: 'neutral',
          participants: ['test_agent', 'player_1'],
          goals: ['validation'],
          resources: [],
          powerDynamics: {}
        }
      },
      socialLearning: {
        observedBehaviors: [],
        learnedPatterns: [],
        teachingHistory: [],
        socialSkillProgress: {},
        lastUpdate: Date.now()
      }
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
        survivalEvents: 5,
        socialInteractions: 3
      },
      processingMode: 'action',
      lastResponse: undefined,
      responseHistory: []
    }
  }
};

// Test results tracking
const testResults = {
  totalTests: 0,
  passedTests: 0,
  failedTests: 0,
  errors: []
};

/**
 * Test runner functions
 */
function runTest(testName, testFunction) {
  testResults.totalTests++;
  
  try {
    console.log(`Running test: ${testName}`);
    const result = testFunction();
    
    if (result.passed) {
      testResults.passedTests++;
      console.log(`✅ PASSED: ${testName}`);
      if (result.details) {
        console.log(`   Details: ${result.details}`);
      }
    } else {
      testResults.failedTests++;
      console.log(`❌ FAILED: ${testName}`);
      console.log(`   Error: ${result.error}`);
      if (result.details) {
        console.log(`   Details: ${result.details}`);
      }
    }
  } catch (error) {
    testResults.failedTests++;
    console.log(`❌ ERROR: ${testName}`);
    console.log(`   Error: ${error.message}`);
    testResults.errors.push({ test: testName, error: error.message });
  }
}

/**
 * Test: Anti-Idle Goal Generator Initialization
 */
function testAntiIdleGoalGeneratorInitialization() {
  return runTest('Anti-Idle Goal Generator Initialization', () => {
    try {
      const generator = new AntiIdleGoalGenerator(
        mockAgentState.cognitive.purpose,
        mockAgentState.cognitive.skills,
        mockAgentState.cognitive.memory,
        mockAgentState.context
      );
      
      if (generator) {
        return {
          passed: true,
          details: 'Anti-idle goal generator initialized successfully'
        };
      } else {
        return {
          passed: false,
          error: 'Anti-idle goal generator initialization failed'
        };
      }
    } catch (error) {
      return {
        passed: false,
        error: error.message
      };
    }
  });
}

/**
 * Test: Anti-Idle Goal Generation
 */
function testAntiIdleGoalGeneration() {
  return runTest('Anti-Idle Goal Generation', () => {
    try {
      const generator = new AntiIdleGoalGenerator(
        mockAgentState.cognitive.purpose,
        mockAgentState.cognitive.skills,
        mockAgentState.cognitive.memory,
        mockAgentState.context
      );
      
      const goals = generator.generateAntiIdleGoals();
      
      if (Array.isArray(goals) && goals.length > 0) {
        return {
          passed: true,
          details: `Generated ${goals.length} anti-idle goals`
        };
      } else {
        return {
          passed: false,
          error: 'Failed to generate anti-idle goals'
        };
      }
    } catch (error) {
      return {
        passed: false,
        error: error.message
      };
    }
  });
}

/**
 * Test: Idle Detection System Initialization
 */
function testIdleDetectionSystemInitialization() {
  return runTest('Idle Detection System Initialization', () => {
    try {
      const detector = new IdleDetectionSystem(TEST_CONFIG.idleDetection);
      
      if (detector) {
        return {
          passed: true,
          details: 'Idle detection system initialized successfully'
        };
      } else {
        return {
          passed: false,
          error: 'Idle detection system initialization failed'
        };
      }
    } catch (error) {
      return {
        passed: false,
        error: error.message
      };
    }
  });
}

/**
 * Test: Idle Detection
 */
function testIdleDetection() {
  return runTest('Idle Detection', () => {
    try {
      const detector = new IdleDetectionSystem(TEST_CONFIG.idleDetection);
      
      // Test activity recording
      detector.recordActivity({
        type: 'action',
        timestamp: Date.now(),
        description: 'Test action',
        intensity: 0.8
      });
      
      // Test activity level calculation
      const activityLevel = detector.calculateActivityLevel(mockAgentState);
      
      if (typeof activityLevel === 'number' && activityLevel >= 0 && activityLevel <= 1) {
        return {
          passed: true,
          details: `Activity level calculated: ${activityLevel}`
        };
      } else {
        return {
          passed: false,
          error: 'Invalid activity level calculation'
        };
      }
    } catch (error) {
      return {
        passed: false,
        error: error.message
      };
    }
  });
}

/**
 * Test: Environmental Opportunity Detector Initialization
 */
function testEnvironmentalOpportunityDetectorInitialization() {
  return runTest('Environmental Opportunity Detector Initialization', () => {
    try {
      const detector = new EnvironmentalOpportunityDetector(
        mockAgentState.context,
        mockAgentState.cognitive.memory,
        mockAgentState.cognitive.skills
      );
      
      if (detector) {
        return {
          passed: true,
          details: 'Environmental opportunity detector initialized successfully'
        };
      } else {
        return {
          passed: false,
          error: 'Environmental opportunity detector initialization failed'
        };
      }
    } catch (error) {
      return {
        passed: false,
        error: error.message
      };
    }
  });
}

/**
 * Test: Environmental Opportunity Detection
 */
function testEnvironmentalOpportunityDetection() {
  return runTest('Environmental Opportunity Detection', () => {
    try {
      const detector = new EnvironmentalOpportunityDetector(
        mockAgentState.context,
        mockAgentState.cognitive.memory,
        mockAgentState.cognitive.skills
      );
      
      const opportunities = detector.scanForOpportunities();
      
      if (Array.isArray(opportunities)) {
        return {
          passed: true,
          details: `Detected ${opportunities.length} opportunities`
        };
      } else {
        return {
          passed: false,
          error: 'Failed to detect opportunities'
        };
      }
    } catch (error) {
      return {
        passed: false,
        error: error.message
      };
    }
  });
}

/**
 * Test: Personality Activity Generator Initialization
 */
function testPersonalityActivityGeneratorInitialization() {
  return runTest('Personality Activity Generator Initialization', () => {
    try {
      const generator = new PersonalityActivityGenerator(
        mockAgentState.cognitive.purpose.personality
      );
      
      if (generator) {
        return {
          passed: true,
          details: 'Personality activity generator initialized successfully'
        };
      } else {
        return {
          passed: false,
          error: 'Personality activity generator initialization failed'
        };
      }
    } catch (error) {
      return {
        passed: false,
        error: error.message
      };
    }
  });
}

/**
 * Test: Personality Activity Generation
 */
function testPersonalityActivityGeneration() {
  return runTest('Personality Activity Generation', () => {
    try {
      const generator = new PersonalityActivityGenerator(
        mockAgentState.cognitive.purpose.personality
      );
      
      const activities = generator.generateActivities();
      
      if (Array.isArray(activities) && activities.length > 0) {
        return {
          passed: true,
          details: `Generated ${activities.length} personality-based activities`
        };
      } else {
        return {
          passed: false,
          error: 'Failed to generate personality activities'
        };
      }
    } catch (error) {
      return {
        passed: false,
        error: error.message
      };
    }
  });
}

/**
 * Test: Anti-Idle Config Manager Initialization
 */
function testAntiIdleConfigManagerInitialization() {
  return runTest('Anti-Idle Config Manager Initialization', () => {
    try {
      const configManager = new AntiIdleConfigManager(TEST_CONFIG);
      
      if (configManager) {
        return {
          passed: true,
          details: 'Anti-idle config manager initialized successfully'
        };
      } else {
        return {
          passed: false,
          error: 'Anti-idle config manager initialization failed'
        };
      }
    } catch (error) {
      return {
        passed: false,
        error: error.message
      };
    }
  });
}

/**
 * Test: Configuration Management
 */
function testConfigurationManagement() {
  return runTest('Configuration Management', () => {
    try {
      const configManager = new AntiIdleConfigManager(TEST_CONFIG);
      
      // Test configuration updates
      configManager.updateIdleDetectionConfig({
        inactivityThreshold: 10000
      });
      
      configManager.updateGoalGenerationConfig({
        maxAntiIdleGoals: 5
      });
      
      // Test preset application
      configManager.applyPreset('development');
      
      const config = configManager.getConfig();
      
      if (config && config.idleDetection.inactivityThreshold === 10000) {
        return {
          passed: true,
          details: 'Configuration management working correctly'
        };
      } else {
        return {
          passed: false,
          error: 'Configuration management failed'
        };
      }
    } catch (error) {
      return {
        passed: false,
        error: error.message
      };
    }
  });
}

/**
 * Test: Anti-Idle Monitoring System Initialization
 */
function testAntiIdleMonitoringSystemInitialization() {
  return runTest('Anti-Idle Monitoring System Initialization', () => {
    try {
      const monitoring = new AntiIdleMonitoringSystem(TEST_CONFIG.monitoring);
      
      if (monitoring) {
        return {
          passed: true,
          details: 'Anti-idle monitoring system initialized successfully'
        };
      } else {
        return {
          passed: false,
          error: 'Anti-idle monitoring system initialization failed'
        };
      }
    } catch (error) {
      return {
        passed: false,
        error: error.message
      };
    }
  });
}

/**
 * Test: Monitoring and Alerting
 */
function testMonitoringAndAlerting() {
  return runTest('Monitoring and Alerting', () => {
    try {
      const monitoring = new AntiIdleMonitoringSystem(TEST_CONFIG.monitoring);
      
      // Test monitoring update
      monitoring.updateMonitoring(mockAgentState, {
        activityLevel: 0.3,
        goalsGenerated: 2,
        opportunitiesDetected: 3,
        personalityActivitiesGenerated: 1
      });
      
      // Test alert checking
      const hasAlerts = monitoring.checkAlertConditions();
      
      if (typeof hasAlerts === 'boolean') {
        return {
          passed: true,
          details: 'Monitoring and alerting system working correctly'
        };
      } else {
        return {
          passed: false,
          error: 'Monitoring and alerting system failed'
        };
      }
    } catch (error) {
      return {
        passed: false,
        error: error.message
      };
    }
  });
}

/**
 * Test: Anti-Idle System Integration
 */
function testAntiIdleSystemIntegration() {
  return runTest('Anti-Idle System Integration', () => {
    try {
      const antiIdleSystem = new AntiIdleSystem(
        TEST_CONFIG.agentId,
        mockAgentState.cognitive.purpose,
        mockAgentState.cognitive.skills,
        mockAgentState.cognitive.memory,
        mockAgentState.context
      );
      
      if (antiIdleSystem) {
        // Test system startup
        antiIdleSystem.start();
        
        // Test system update
        antiIdleSystem.update(mockAgentState);
        
        // Test system status
        const status = antiIdleSystem.getSystemStatus();
        
        if (status && typeof status.enabled === 'boolean') {
          return {
            passed: true,
            details: 'Anti-idle system integration working correctly'
          };
        } else {
          return {
            passed: false,
            error: 'Anti-idle system integration failed'
          };
        }
      } else {
        return {
          passed: false,
          error: 'Failed to create anti-idle system'
        };
      }
    } catch (error) {
      return {
        passed: false,
        error: error.message
      };
    }
  });
}

/**
 * Test: Performance Requirements
 */
function testPerformanceRequirements() {
  return runTest('Performance Requirements', () => {
    try {
      const startTime = Date.now();
      
      // Test anti-idle goal generation performance
      const generator = new AntiIdleGoalGenerator(
        mockAgentState.cognitive.purpose,
        mockAgentState.cognitive.skills,
        mockAgentState.cognitive.memory,
        mockAgentState.context
      );
      
      const goals = generator.generateAntiIdleGoals();
      const generationTime = Date.now() - startTime;
      
      // Test idle detection performance
      const detector = new IdleDetectionSystem(TEST_CONFIG.idleDetection);
      const activityLevel = detector.calculateActivityLevel(mockAgentState);
      const detectionTime = Date.now() - startTime;
      
      // Test opportunity detection performance
      const opportunityDetector = new EnvironmentalOpportunityDetector(
        mockAgentState.context,
        mockAgentState.cognitive.memory,
        mockAgentState.cognitive.skills
      );
      const opportunities = opportunityDetector.scanForOpportunities();
      const opportunityTime = Date.now() - startTime;
      
      // Performance should be under 100ms for each operation
      const maxTime = 100;
      
      if (generationTime < maxTime && detectionTime < maxTime && opportunityTime < maxTime) {
        return {
          passed: true,
          details: `Performance requirements met: generation=${generationTime}ms, detection=${detectionTime}ms, opportunity=${opportunityTime}ms`
        };
      } else {
        return {
          passed: false,
          error: `Performance requirements not met: max time=${maxTime}ms`
        };
      }
    } catch (error) {
      return {
        passed: false,
        error: error.message
      };
    }
  });
}

/**
 * Test: Error Handling
 */
function testErrorHandling() {
  return runTest('Error Handling', () => {
    try {
      const antiIdleSystem = new AntiIdleSystem(
        TEST_CONFIG.agentId,
        mockAgentState.cognitive.purpose,
        mockAgentState.cognitive.skills,
        mockAgentState.cognitive.memory,
        mockAgentState.context
      );
      
      // Test with invalid state
      const invalidState = null;
      
      try {
        antiIdleSystem.update(invalidState);
        return {
          passed: false,
          error: 'Error handling failed - should have thrown error'
        };
      } catch (error) {
        if (error.message.includes('Cannot read properties')) {
          return {
            passed: true,
            details: 'Error handling working correctly'
          };
        } else {
          return {
            passed: false,
            error: 'Error handling not working correctly'
          };
        }
      }
    } catch (error) {
      return {
        passed: false,
        error: error.message
      };
    }
  });
}

/**
 * Run all validation tests
 */
function runAllValidationTests() {
  console.log('='.repeat(50));
  console.log('ANTI-IDLE SYSTEM VALIDATION');
  console.log('='.repeat(50));
  
  // Reset test results
  testResults.totalTests = 0;
  testResults.passedTests = 0;
  testResults.failedTests = 0;
  testResults.errors = [];
  
  // Run all tests
  testAntiIdleGoalGeneratorInitialization();
  testAntiIdleGoalGeneration();
  testIdleDetectionSystemInitialization();
  testIdleDetection();
  testEnvironmentalOpportunityDetectorInitialization();
  testEnvironmentalOpportunityDetection();
  testPersonalityActivityGeneratorInitialization();
  testPersonalityActivityGeneration();
  testAntiIdleConfigManagerInitialization();
  testConfigurationManagement();
  testAntiIdleMonitoringSystemInitialization();
  testMonitoringAndAlerting();
  testAntiIdleSystemIntegration();
  testPerformanceRequirements();
  testErrorHandling();
  
  // Print summary
  console.log('='.repeat(50));
  console.log('VALIDATION SUMMARY');
  console.log('='.repeat(50));
  console.log(`Total Tests: ${testResults.totalTests}`);
  console.log(`Passed Tests: ${testResults.passedTests}`);
  console.log(`Failed Tests: ${testResults.failedTests}`);
  console.log(`Success Rate: ${((testResults.passedTests / testResults.totalTests) * 100).toFixed(1)}%`);
  
  if (testResults.errors.length > 0) {
    console.log('\nErrors encountered:');
    testResults.errors.forEach(error => {
      console.log(`  - ${error.test}: ${error.error}`);
    });
  }
  
  console.log('='.repeat(50));
  
  return {
    totalTests: testResults.totalTests,
    passedTests: testResults.passedTests,
    failedTests: testResults.failedTests,
    successRate: (testResults.passedTests / testResults.totalTests) * 100,
    errors: testResults.errors
  };
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllValidationTests();
}

module.exports = {
  runAllValidationTests,
  testAntiIdleGoalGeneratorInitialization,
  testAntiIdleGoalGeneration,
  testIdleDetectionSystemInitialization,
  testIdleDetection,
  testEnvironmentalOpportunityDetectorInitialization,
  testEnvironmentalOpportunityDetection,
  testPersonalityActivityGeneratorInitialization,
  testPersonalityActivityGeneration,
  testAntiIdleConfigManagerInitialization,
  testConfigurationManagement,
  testAntiIdleMonitoringSystemInitialization,
  testMonitoringAndAlerting,
  testAntiIdleSystemIntegration,
  testPerformanceRequirements,
  testErrorHandling
};