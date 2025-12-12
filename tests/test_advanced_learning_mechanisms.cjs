#!/usr/bin/env node

/**
 * Test suite for Advanced Learning Mechanisms: Pattern Recognition and Generalization
 * Tests the SemanticMemorySystem.generalizeExperience() and EpisodicMemorySystem.consolidateEpisode() methods
 */

const { SemanticMemorySystem } = require('./src/agent/memory/semantic_memory.js');
const { EpisodicMemory, ExtendedEpisodicEvent } = require('./src/agent/memory/episodic_memory.js');

// Test configuration
const TEST_CONFIG = {
  verbose: true,
  timeout: 5000,
  testEvents: [
    {
      id: 'test_event_1',
      type: 'mining',
      action: 'mine_iron_ore',
      outcome: 'obtained_iron_ingot',
      location: { x: 100, y: 64, z: 200 },
      timestamp: Date.now() - 1000,
      importance: 0.8,
      success: true,
      emotional: { valence: 0.6, arousal: 0.5, urgency: 0.2 },
      tags: ['mining', 'resource_gathering'],
      metadata: { resources: { iron: 1 }, tools: ['pickaxe'] }
    },
    {
      id: 'test_event_2',
      type: 'combat',
      action: 'fight_zombie',
      outcome: 'defeated_enemy',
      location: { x: 105, y: 64, z: 205 },
      timestamp: Date.now() - 500,
      importance: 0.9,
      success: true,
      emotional: { valence: 0.4, arousal: 0.8, urgency: 0.7 },
      tags: ['combat', 'danger'],
      metadata: { enemies: ['zombie'], damage_taken: 2 }
    },
    {
      id: 'test_event_3',
      type: 'mining',
      action: 'mine_coal_ore',
      outcome: 'obtained_coal',
      location: { x: 100, y: 64, z: 200 },
      timestamp: Date.now(),
      importance: 0.7,
      success: true,
      emotional: { valence: 0.5, arousal: 0.3, urgency: 0.1 },
      tags: ['mining', 'resource_gathering'],
      metadata: { resources: { coal: 2 }, tools: ['pickaxe'] }
    }
  ]
};

// Test utilities
const testUtils = {
  createTestEvent(eventData) {
    return new ExtendedEpisodicEvent(eventData);
  },

  async runTest(testName, testFunction) {
    try {
      console.log(`\n🧪 Running test: ${testName}`);
      const result = await testFunction();
      if (result) {
        console.log(`✅ ${testName} - PASSED`);
        return true;
      } else {
        console.log(`❌ ${testName} - FAILED`);
        return false;
      }
    } catch (error) {
      console.log(`❌ ${testName} - ERROR: ${error.message}`);
      if (TEST_CONFIG.verbose) {
        console.log(error.stack);
      }
      return false;
    }
  },

  async measureExecutionTime(fn) {
    const start = Date.now();
    const result = await fn();
    const duration = Date.now() - start;
    return { result, duration };
  }
};

// Test cases
const tests = {
  async testSemanticMemoryGeneralization() {
    const semanticMemory = new SemanticMemorySystem();
    const testEvent = testUtils.createTestEvent(TEST_CONFIG.testEvents[0]);

    // Test generalization experience
    await semanticMemory.generalizeExperience(testEvent);

    // Verify that concepts were created
    const ironConcept = semanticMemory.getConcept('iron_ore');
    if (!ironConcept) {
      console.log('❌ Iron ore concept not created');
      return false;
    }

    // Verify relationships were established
    const relationships = semanticMemory.getRelationships('iron_ore');
    if (relationships.length === 0) {
      console.log('❌ No relationships created for iron ore');
      return false;
    }

    // Verify procedural patterns were stored
    const patterns = semanticMemory.getProceduralPattern('mine_iron_ore');
    if (!patterns) {
      console.log('❌ Procedural pattern not created for mining iron ore');
      return false;
    }

    console.log('✅ Semantic memory generalization working correctly');
    return true;
  },

  async testEpisodicMemoryConsolidation() {
    const episodicMemory = new EpisodicMemory();
    const semanticMemory = new SemanticMemorySystem();
    
    // Set up reference between memories
    episodicMemory.setSemanticMemory(semanticMemory);

    const testEvent = testUtils.createTestEvent(TEST_CONFIG.testEvents[1]);

    // Store the event first
    await episodicMemory.storeEvent(testEvent);

    // Test consolidation
    await episodicMemory.consolidateEpisode(testEvent);

    // Verify episodic event importance was reduced
    const storedEvent = episodicMemory.getEventById(testEvent.id);
    if (storedEvent.importance >= testEvent.importance) {
      console.log('❌ Episodic event importance not reduced after consolidation');
      return false;
    }

    // Verify event was marked as consolidated
    if (!storedEvent.tags.includes('consolidated')) {
      console.log('❌ Event not marked as consolidated');
      return false;
    }

    // Verify semantic memory received the experience
    const zombieConcept = semanticMemory.getConcept('zombie');
    if (!zombieConcept) {
      console.log('❌ Zombie concept not created in semantic memory');
      return false;
    }

    console.log('✅ Episodic memory consolidation working correctly');
    return true;
  },

  async testPatternExtraction() {
    const semanticMemory = new SemanticMemorySystem();
    
    // Test multiple events to establish patterns
    for (const eventData of TEST_CONFIG.testEvents) {
      const testEvent = testUtils.createTestEvent(eventData);
      await semanticMemory.generalizeExperience(testEvent);
    }

    // Verify action-outcome patterns
    const miningPatterns = semanticMemory.getActionOutcomePattern('mining');
    if (!miningPatterns || miningPatterns.length === 0) {
      console.log('❌ No mining patterns extracted');
      return false;
    }

    // Verify environmental patterns
    const locationPatterns = semanticMemory.getEnvironmentalPattern({ x: 100, y: 64, z: 200 });
    if (!locationPatterns) {
      console.log('❌ No location patterns extracted');
      return false;
    }

    // Verify temporal patterns
    const recentPatterns = semanticMemory.getTemporalPattern(3600000); // 1 hour
    if (!recentPatterns) {
      console.log('❌ No temporal patterns extracted');
      return false;
    }

    console.log('✅ Pattern extraction working correctly');
    return true;
  },

  async testMemoryIntegration() {
    const episodicMemory = new EpisodicMemory();
    const semanticMemory = new SemanticMemorySystem();
    
    // Set up integration
    episodicMemory.setSemanticMemory(semanticMemory);

    // Store and consolidate multiple events
    for (const eventData of TEST_CONFIG.testEvents) {
      const testEvent = testUtils.createTestEvent(eventData);
      await episodicMemory.storeEvent(testEvent);
      
      // Consolidate high-importance events
      if (testEvent.importance >= 0.7) {
        await episodicMemory.consolidateEpisode(testEvent);
      }
    }

    // Verify semantic memory learned from episodic events
    const semanticStats = semanticMemory.getStatistics();
    if (semanticStats.conceptCount === 0) {
      console.log('❌ No concepts created in semantic memory');
      return false;
    }

    if (semanticStats.relationshipCount === 0) {
      console.log('❌ No relationships created in semantic memory');
      return false;
    }

    // Verify episodic memory statistics
    const episodicStats = episodicMemory.getStatistics();
    if (episodicStats.eventCount === 0) {
      console.log('❌ No events stored in episodic memory');
      return false;
    }

    console.log('✅ Memory integration working correctly');
    console.log(`📊 Semantic memory: ${semanticStats.conceptCount} concepts, ${semanticStats.relationshipCount} relationships`);
    console.log(`📊 Episodic memory: ${episodicStats.eventCount} events, avg importance: ${episodicStats.averageImportance.toFixed(2)}`);
    return true;
  },

  async testPerformance() {
    const episodicMemory = new EpisodicMemory();
    const semanticMemory = new SemanticMemorySystem();
    
    episodicMemory.setSemanticMemory(semanticMemory);

    // Test performance with multiple events
    const { result: consolidationResult, duration: consolidationDuration } = 
      await testUtils.measureExecutionTime(async () => {
        for (let i = 0; i < 10; i++) {
          const testEvent = testUtils.createTestEvent({
            ...TEST_CONFIG.testEvents[0],
            id: `perf_test_${i}`,
            timestamp: Date.now() - (i * 100)
          });
          
          await episodicMemory.storeEvent(testEvent);
          await episodicMemory.consolidateEpisode(testEvent);
        }
      });

    if (consolidationDuration > 1000) {
      console.log(`❌ Performance test failed: consolidation took ${consolidationDuration}ms (>1000ms)`);
      return false;
    }

    // Test semantic memory query performance
    const { result: queryResult, duration: queryDuration } = 
      await testUtils.measureExecutionTime(async () => {
        return await semanticMemory.query({
          query: 'mining',
          types: ['concept'],
          limit: 10
        });
      });

    if (queryDuration > 100) {
      console.log(`❌ Query performance test failed: query took ${queryDuration}ms (>100ms)`);
      return false;
    }

    console.log(`✅ Performance tests passed`);
    console.log(`📊 Consolidation: ${consolidationDuration}ms for 10 events`);
    console.log(`📊 Query: ${queryDuration}ms for semantic search`);
    return true;
  }
};

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting Advanced Learning Mechanisms Test Suite');
  console.log('=' .repeat(60));

  const testNames = Object.keys(tests);
  let passedTests = 0;
  let totalTests = testNames.length;

  for (const testName of testNames) {
    const result = await testUtils.runTest(testName, tests[testName]);
    if (result) passedTests++;
  }

  console.log('\n' + '=' .repeat(60));
  console.log('📊 Test Results Summary:');
  console.log(`✅ Passed: ${passedTests}/${totalTests} tests`);
  console.log(`❌ Failed: ${totalTests - passedTests}/${totalTests} tests`);
  
  const successRate = (passedTests / totalTests) * 100;
  console.log(`📈 Success Rate: ${successRate.toFixed(1)}%`);

  if (successRate >= 80) {
    console.log('🎉 Advanced Learning Mechanisms implementation is working correctly!');
    process.exit(0);
  } else {
    console.log('⚠️  Advanced Learning Mechanisms implementation needs improvement.');
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().catch(error => {
    console.error('❌ Test suite failed to run:', error);
    process.exit(1);
  });
}

module.exports = { tests, testUtils, runAllTests };
</code_write_result>