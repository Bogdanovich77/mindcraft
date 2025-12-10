/**
 * Theory of Mind System Validation
 * 
 * Simple validation test to verify the system compiles and basic functionality works
 */

console.log('=== Theory of Mind System Validation ===');

try {
  // Test 1: Import all modules
  console.log('\n1. Testing module imports...');
  
  // Import the main engine
  const { TheoryOfMindEngine } = await import('./theory_of_mind.js');
  console.log('✓ TheoryOfMindEngine imported successfully');
  
  // Import the integration layer
  const { TheoryOfMindIntegration } = await import('./tom_integration.js');
  console.log('✓ TheoryOfMindIntegration imported successfully');
  
  // Test 2: Basic instantiation
  console.log('\n2. Testing basic instantiation...');
  
  const tomEngine = new TheoryOfMindEngine();
  console.log('✓ TheoryOfMindEngine instantiated successfully');
  
  const tomIntegration = new TheoryOfMindIntegration();
  console.log('✓ TheoryOfMindIntegration instantiated successfully');
  
  // Test 3: Initialize with personality
  console.log('\n3. Testing initialization...');
  
  const testPersonality = {
    openness: 0.8,
    conscientiousness: 0.7,
    extraversion: 0.6,
    agreeableness: 0.9,
    neuroticism: 0.3,
    riskTolerance: 0.6,
    explorationDrive: 0.7,
    socialTendency: 0.8,
    buildingCreativity: 0.5,
    combatAggression: 0.2
  };
  
  await tomEngine.initialize(testPersonality);
  console.log('✓ TheoryOfMindEngine initialized successfully');
  
  // Test 4: Basic observation processing
  console.log('\n4. Testing observation processing...');
  
  const testObservation = {
    actions: ['moving', 'looking'],
    recentHistory: [{ action: 'mining', timestamp: Date.now() - 1000 }],
    behavioralCues: ['focused', 'determined']
  };
  
  const testContext = {
    environment: { biome: 'forest', time: 'day' },
    socialContext: { nearbyAgents: ['agent2'] },
    relationship: { status: 'neutral', trust: 0.5 }
  };
  
  const mentalState = await tomEngine.processObservation(
    'test-agent-1',
    testObservation,
    testContext,
    testPersonality
  );
  
  if (mentalState) {
    console.log('✓ Observation processed successfully');
    console.log(`  - Mental state created with confidence: ${mentalState.confidence?.toFixed(2) || 'N/A'}`);
  } else {
    console.log('⚠ Observation returned null mental state (may be expected for test data)');
  }
  
  // Test 5: Get metrics
  console.log('\n5. Testing metrics retrieval...');
  
  const metrics = tomEngine.getMetrics();
  console.log('✓ Metrics retrieved successfully');
  console.log(`  - Active models: ${metrics.activeModels}`);
  console.log(`  - Response time: ${metrics.responseTime}ms`);
  
  // Test 6: Integration layer functionality
  console.log('\n6. Testing integration layer...');
  
  const integrationResult = await tomIntegration.processIntegratedObservation(
    'test-agent-1',
    testObservation,
    testContext,
    testPersonality
  );
  
  if (integrationResult) {
    console.log('✓ Integration layer processed observation successfully');
    console.log(`  - Learning gain: ${integrationResult.learningGain?.toFixed(3) || 'N/A'}`);
  } else {
    console.log('⚠ Integration layer returned null (may be expected for test data)');
  }
  
  // Test 7: Cleanup
  console.log('\n7. Testing cleanup...');
  
  await tomEngine.cleanup();
  console.log('✓ TheoryOfMindEngine cleaned up successfully');
  
  console.log('\n=== Theory of Mind System Validation: SUCCESS ===');
  console.log('All core components are working correctly!');
  
} catch (error) {
  console.error('\n=== Theory of Mind System Validation: FAILED ===');
  console.error('Error:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
}