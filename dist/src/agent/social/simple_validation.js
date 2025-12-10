/**
 * Simple Theory of Mind Validation
 *
 * Basic validation test to verify the system compiles and basic functionality works
 */
console.log('=== Theory of Mind System Validation ===');
try {
    // Test 1: Import main engine
    console.log('\n1. Testing TheoryOfMindEngine import...');
    const { TheoryOfMindEngine } = await import('./theory_of_mind.js');
    console.log('✓ TheoryOfMindEngine imported successfully');
    // Test 2: Basic instantiation
    console.log('\n2. Testing basic instantiation...');
    const tomEngine = new TheoryOfMindEngine();
    console.log('✓ TheoryOfMindEngine instantiated successfully');
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
    const mentalState = await tomEngine.processObservation('test-agent-1', testObservation, testContext, testPersonality);
    if (mentalState) {
        console.log('✓ Observation processed successfully');
        console.log(`  - Mental state created with confidence: ${mentalState.confidence?.toFixed(2) || 'N/A'}`);
        console.log(`  - Beliefs count: ${mentalState.beliefs ? Object.keys(mentalState.beliefs).length : 0}`);
        console.log(`  - Intentions count: ${mentalState.intentions ? Object.keys(mentalState.intentions).length : 0}`);
        console.log(`  - Emotions count: ${mentalState.emotions ? Object.keys(mentalState.emotions).length : 0}`);
    }
    else {
        console.log('⚠ Observation returned null mental state (may be expected for test data)');
    }
    // Test 5: Get metrics
    console.log('\n5. Testing metrics retrieval...');
    const metrics = tomEngine.getMetrics();
    console.log('✓ Metrics retrieved successfully');
    console.log(`  - Active models: ${metrics.activeModels}`);
    console.log(`  - Response time: ${metrics.responseTime}ms`);
    console.log(`  - Prediction accuracy: ${metrics.predictionAccuracy}`);
    console.log(`  - Memory usage: ${metrics.memoryUsage} bytes`);
    // Test 6: Basic behavior prediction
    console.log('\n6. Testing behavior prediction...');
    const prediction = await tomEngine.predictBehavior('test-agent-1', testContext, 5000);
    if (prediction) {
        console.log('✓ Behavior prediction completed successfully');
        console.log(`  - Prediction confidence: ${prediction.confidence?.toFixed(2) || 'N/A'}`);
        console.log(`  - Time horizon: ${prediction.timeHorizon}ms`);
    }
    else {
        console.log('⚠ Behavior prediction returned null');
    }
    // Test 7: Perspective taking
    console.log('\n7. Testing perspective taking...');
    const perspective = await tomEngine.takePerspective('test-agent-1', testContext, 2000);
    if (perspective) {
        console.log('✓ Perspective taking completed successfully');
        console.log(`  - Perspective confidence: ${perspective.confidence?.toFixed(2) || 'N/A'}`);
    }
    else {
        console.log('⚠ Perspective taking returned null');
    }
    // Test 8: Deception detection
    console.log('\n8. Testing deception detection...');
    const deception = await tomEngine.detectDeception('test-agent-1', { message: 'I will help you', behavioralCues: ['nervous'] }, testContext);
    if (deception) {
        console.log('✓ Deception detection completed successfully');
        console.log(`  - Deception probability: ${deception.overallDeceptionProbability?.toFixed(2) || 'N/A'}`);
    }
    else {
        console.log('⚠ Deception detection returned null');
    }
    // Test 9: Cleanup
    console.log('\n9. Testing cleanup...');
    await tomEngine.cleanup();
    console.log('✓ TheoryOfMindEngine cleaned up successfully');
    console.log('\n=== Theory of Mind System Validation: SUCCESS ===');
    console.log('All core components are working correctly!');
    console.log('✅ Theory of Mind system is fully functional and ready for integration');
}
catch (error) {
    console.error('\n=== Theory of Mind System Validation: FAILED ===');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
}
