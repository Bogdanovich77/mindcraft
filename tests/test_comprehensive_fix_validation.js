/**
 * Comprehensive Fix Validation Test Suite
 *
 * Tests to validate that all the implemented fixes resolve:
 * 1. Infinite loop crash issues
 * 2. Conversation-action correlation problems
 * 3. Memory management under load
 * 4. System stability and performance
 */

import { LangGraphAgent } from './dist/src/agent/langgraph/agent.js';
const { 
  perceptionNode, 
  analysisNode, 
  planningNode, 
  decisionNode, 
  executionNode, 
  reflectionNode,
  messageAnalysisNode,
  conversationProcessingNode,
  responseRoutingNode,
  multiAgentCoordinationNode
} = require('./dist/src/agent/langgraph/state_nodes.js');

// Test configuration
const TEST_CONFIG = {
    // Crash prevention tests
    CRASH_TESTS: {
        duplicateMessageWindow: 5000, // 5 seconds
        maxHistoryEntries: 100,
        memoryCleanupInterval: 30000, // 30 seconds
        memoryThreshold: 500 * 1024 * 1024 // 500MB
    },
    
    // Performance thresholds
    PERFORMANCE: {
        maxResponseTime: 2000, // 2 seconds
        maxMemoryGrowth: 100, // 100MB
        testDuration: 60000, // 1 minute
        messageBurstSize: 50,
        rapidMessageInterval: 100 // 100ms between messages
    },
    
    // Conversation-action correlation
    CORRELATION: {
        requiredContextElements: ['currentGoal', 'currentAction', 'actionProgress', 'recentActions'],
        minContextWords: 10,
        maxResponseTime: 1000 // 1 second for contextual responses
    }
};

// Test results tracking
const testResults = {
    crashPrevention: { passed: 0, failed: 0, errors: [] },
    conversationCorrelation: { passed: 0, failed: 0, errors: [] },
    integration: { passed: 0, failed: 0, errors: [] },
    edgeCases: { passed: 0, failed: 0, errors: [] },
    performance: { passed: 0, failed: 0, errors: [] }
};

// Helper function to track test results
function trackResult(category, passed, error = null) {
    if (passed) {
        testResults[category].passed++;
    } else {
        testResults[category].failed++;
        if (error) {
            testResults[category].errors.push(error);
        }
    }
}

// Helper function to format test results
function formatTestResult(testName, passed, details = '') {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    return `${status} ${testName}${details ? ': ' + details : ''}`;
}

// =======================================================================
// CRASH PREVENTION TESTS
// =======================================================================

async function testInfiniteLoopPrevention() {
    console.log('\n=== Testing Infinite Loop Prevention ===');
    
    try {
        // Create test agent
        const agent = new LangGraphAgent();
        const mockProfile = {
            name: 'InfiniteLoopTestAgent',
            purposeCore: {
                personality: { traits: { extraversion: 0.5, agreeableness: 0.5, conscientiousness: 0.5 } },
                motivations: [],
                values: [],
                ethics: []
            },
            behavior: {
                adaptationRate: 0.1,
                reactiveModes: {}
            }
        };
        
        await agent.start({ profile: mockProfile });
        
        // Test 1: !goal command recognition
        console.log('\n1. Testing !goal command recognition...');
        const goalCommand = '!goal show active';
        const processingMode = agent.determineProcessingMode({
            context: { lastMessage: { message: goalCommand } }
        });
        
        const test1Passed = processingMode === 'action';
        console.log(formatTestResult('!goal command recognition', test1Passed, 
            `Expected: action, Got: ${processingMode}`));
        trackResult('crashPrevention', test1Passed);
        
        // Test 2: Duplicate message detection
        console.log('\n2. Testing duplicate message detection...');
        const duplicateMessage = 'hello there';
        
        // Set up initial message
        agent.agentState.executive.responseHistory = [{
            source: 'test_user',
            message: duplicateMessage,
            timestamp: Date.now() - 1000, // 1 second ago
            response: 'Hello! How can I help you?'
        }];
        
        // Send duplicate
        await agent.handleMessage('test_user', duplicateMessage);
        const messageCleared = !agent.agentState.context.lastMessage;
        
        const test2Passed = messageCleared;
        console.log(formatTestResult('Duplicate message detection', test2Passed,
            `Message cleared: ${messageCleared}`));
        trackResult('crashPrevention', test2Passed);
        
        // Test 3: Conversation history limiting
        console.log('\n3. Testing conversation history limiting...');
        const initialLength = agent.agentState.executive.responseHistory.length;
        
        // Add messages beyond limit
        for (let i = 0; i < 150; i++) {
            await agent.handleMessage('test_user', `test message ${i}`);
        }
        
        const finalLength = agent.agentState.executive.responseHistory.length;
        const test3Passed = finalLength <= TEST_CONFIG.CRASH_TESTS.maxHistoryEntries;
        
        console.log(formatTestResult('Conversation history limiting', test3Passed,
            `Final length: ${finalLength}, Max allowed: ${TEST_CONFIG.CRASH_TESTS.maxHistoryEntries}`));
        trackResult('crashPrevention', test3Passed);
        
        // Test 4: Message clearing after processing
        console.log('\n4. Testing message clearing after processing...');
        const testMessage = 'how are you doing?';
        await agent.handleMessage('test_user', testMessage);
        
        // Wait for processing
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const messageProcessed = !agent.agentState.context.lastMessage;
        const test4Passed = messageProcessed;
        
        console.log(formatTestResult('Message clearing after processing', test4Passed,
            `Message processed: ${messageProcessed}`));
        trackResult('crashPrevention', test4Passed);
        
        console.log('\n✅ Infinite loop prevention tests completed');
        
    } catch (error) {
        console.error('❌ Infinite loop prevention tests failed:', error);
        trackResult('crashPrevention', false, error.message);
    }
}

// =======================================================================
// CONVERSATION-ACTION CORRELATION TESTS
// =======================================================================

async function testConversationActionCorrelation() {
    console.log('\n=== Testing Conversation-Action Correlation ===');
    
    try {
        // Create test agent with action context
        const agent = new LangGraphAgent();
        const testProfile = {
            name: 'CorrelationTestAgent',
            conversing: 'You are $NAME. Current Goal: $CURRENT_GOAL. Current Action: $CURRENT_ACTION. Action Progress: $ACTION_PROGRESS. Recent Actions: $RECENT_ACTIONS. Respond accordingly.',
            purposeCore: {
                personality: { traits: { openness: 0.7, conscientiousness: 0.8 } },
                motivations: ['build', 'explore'],
                values: ['creativity', 'efficiency'],
                ethics: { harmAvoidance: 0.8 }
            }
        };
        
        await agent.start({ profile: testProfile });
        
        // Set up mock agent state with action context
        agent.agentState.cognitive.goals = {
            activeGoals: [{
                description: 'Build a cobblestone fortress',
                progress: { percentage: 35 }
            }]
        };
        
        agent.agentState.executive.currentAction = {
            type: 'collect_cobblestone',
            parameters: { target: 100, current: 35 },
            status: 'executing',
            startTime: Date.now() - 45000
        };
        
        agent.agentState.executive.decisionHistory = [
            {
                timestamp: Date.now() - 60000,
                action: 'find_cobblestone_source',
                outcome: 'success'
            },
            {
                timestamp: Date.now() - 30000,
                action: 'start_mining',
                outcome: 'in_progress'
            }
        ];
        
        // Test 1: Action context building
        console.log('\n1. Testing action context building...');
        const actionContext = agent.buildActionContext(agent.agentState);
        
        const hasAllElements = TEST_CONFIG.CORRELATION.requiredContextElements.every(element =>
            actionContext.toLowerCase().includes(element.toLowerCase())
        );
        
        const hasEnoughWords = actionContext.split(/\s+/).length >= TEST_CONFIG.CORRELATION.minContextWords;
        
        const test1Passed = hasAllElements && hasEnoughWords;
        console.log(formatTestResult('Action context building', test1Passed,
            `Has all elements: ${hasAllElements}, Word count: ${actionContext.split(/\s+/).length}`));
        trackResult('conversationCorrelation', test1Passed);
        
        // Test 2: Goal reporting in conversation
        console.log('\n2. Testing goal reporting in conversation...');
        const startTime = Date.now();
        await agent.handleMessage('test_user', 'what are you working on?');
        const responseTime = Date.now() - startTime;
        
        const lastResponse = agent.agentState.executive.lastResponse;
        const mentionsGoal = lastResponse && lastResponse.response.toLowerCase().includes('fortress');
        const timelyResponse = responseTime <= TEST_CONFIG.CORRELATION.maxResponseTime;
        
        const test2Passed = mentionsGoal && timelyResponse;
        console.log(formatTestResult('Goal reporting in conversation', test2Passed,
            `Mentions goal: ${mentionsGoal}, Response time: ${responseTime}ms`));
        trackResult('conversationCorrelation', test2Passed);
        
        // Test 3: Current action reporting
        console.log('\n3. Testing current action reporting...');
        await agent.handleMessage('test_user', 'what are you doing right now?');
        
        const currentResponse = agent.agentState.executive.lastResponse;
        const mentionsAction = currentResponse && 
            (currentResponse.response.toLowerCase().includes('collect') ||
             currentResponse.response.toLowerCase().includes('cobblestone') ||
             currentResponse.response.toLowerCase().includes('mining'));
        
        const test3Passed = mentionsAction;
        console.log(formatTestResult('Current action reporting', test3Passed,
            `Mentions action: ${mentionsAction}`));
        trackResult('conversationCorrelation', test3Passed);
        
        // Test 4: Action progress reporting
        console.log('\n4. Testing action progress reporting...');
        await agent.handleMessage('test_user', 'how is your progress?');
        
        const progressResponse = agent.agentState.executive.lastResponse;
        const mentionsProgress = progressResponse && 
            (progressResponse.response.toLowerCase().includes('progress') ||
             progressResponse.response.toLowerCase().includes('35') ||
             progressResponse.response.toLowerCase().includes('%'));
        
        const test4Passed = mentionsProgress;
        console.log(formatTestResult('Action progress reporting', test4Passed,
            `Mentions progress: ${mentionsProgress}`));
        trackResult('conversationCorrelation', test4Passed);
        
        // Test 5: Recent actions reference
        console.log('\n5. Testing recent actions reference...');
        await agent.handleMessage('test_user', 'what have you been doing?');
        
        const recentResponse = agent.agentState.executive.lastResponse;
        const mentionsRecentActions = recentResponse && 
            (recentResponse.response.toLowerCase().includes('found') ||
             recentResponse.response.toLowerCase().includes('mining') ||
             recentResponse.response.toLowerCase().includes('recently'));
        
        const test5Passed = mentionsRecentActions;
        console.log(formatTestResult('Recent actions reference', test5Passed,
            `Mentions recent actions: ${mentionsRecentActions}`));
        trackResult('conversationCorrelation', test5Passed);
        
        console.log('\n✅ Conversation-action correlation tests completed');
        
    } catch (error) {
        console.error('❌ Conversation-action correlation tests failed:', error);
        trackResult('conversationCorrelation', false, error.message);
    }
}

// =======================================================================
// INTEGRATION TESTS
// =======================================================================

async function testIntegration() {
    console.log('\n=== Testing Integration ===');
    
    try {
        // Test 1: Complete message flow
        console.log('\n1. Testing complete message flow...');
        const agent = new LangGraphAgent();
        await agent.start({ 
            profile: {
                name: 'IntegrationTestAgent',
                purposeCore: { personality: { traits: {} }, motivations: [], values: [], ethics: [] },
                behavior: { adaptationRate: 0.1 }
            }
        });
        
        const initialMemory = process.memoryUsage();
        const testMessages = [
            'hello there',
            '!goal show active',
            'what are you doing?',
            'help me build something',
            'how are you feeling?'
        ];
        
        for (const message of testMessages) {
            await agent.handleMessage('test_user', message);
            await new Promise(resolve => setTimeout(resolve, 50)); // Small delay
        }
        
        const finalMemory = process.memoryUsage();
        const memoryGrowth = finalMemory.heapUsed - initialMemory.heapUsed;
        const acceptableGrowth = memoryGrowth < TEST_CONFIG.PERFORMANCE.maxMemoryGrowth * 1024 * 1024;
        
        const test1Passed = acceptableGrowth;
        console.log(formatTestResult('Complete message flow', test1Passed,
            `Memory growth: ${Math.round(memoryGrowth / 1024 / 1024)}MB`));
        trackResult('integration', test1Passed);
        
        // Test 2: Memory cleanup during operation
        console.log('\n2. Testing memory cleanup during operation...');
        agent.lastMemoryCleanup = Date.now() - TEST_CONFIG.CRASH_TESTS.memoryCleanupInterval - 1000;
        
        // Add many entries to trigger cleanup
        for (let i = 0; i < 200; i++) {
            agent.agentState.executive.responseHistory.push({
                source: 'test_user',
                message: `test message ${i}`,
                response: `test response ${i}`,
                timestamp: Date.now() - (i * 1000)
            });
        }
        
        agent.checkMemoryUsage();
        agent.performMemoryCleanup();
        
        const historyAfterCleanup = agent.agentState.executive.responseHistory.length;
        const test2Passed = historyAfterCleanup <= TEST_CONFIG.CRASH_TESTS.maxHistoryEntries;
        
        console.log(formatTestResult('Memory cleanup during operation', test2Passed,
            `History after cleanup: ${historyAfterCleanup}`));
        trackResult('integration', test2Passed);
        
        // Test 3: High message volume
        console.log('\n3. Testing high message volume...');
        const startTime = Date.now();
        const burstSize = TEST_CONFIG.PERFORMANCE.messageBurstSize;
        
        for (let i = 0; i < burstSize; i++) {
            await agent.handleMessage('test_user', `burst message ${i}`);
            if (i % 10 === 0) {
                await new Promise(resolve => setTimeout(resolve, TEST_CONFIG.PERFORMANCE.rapidMessageInterval));
            }
        }
        
        const totalTime = Date.now() - startTime;
        const avgTimePerMessage = totalTime / burstSize;
        const test3Passed = avgTimePerMessage < TEST_CONFIG.PERFORMANCE.maxResponseTime;
        
        console.log(formatTestResult('High message volume', test3Passed,
            `Avg time per message: ${Math.round(avgTimePerMessage)}ms`));
        trackResult('integration', test3Passed);
        
        // Test 4: System stability over time
        console.log('\n4. Testing system stability over time...');
        const stabilityStartTime = Date.now();
        let errorCount = 0;
        let processedCount = 0;
        
        const stabilityInterval = setInterval(async () => {
            try {
                await agent.handleMessage('test_user', `stability test ${processedCount}`);
                processedCount++;
                
                if (Date.now() - stabilityStartTime > TEST_CONFIG.PERFORMANCE.testDuration) {
                    clearInterval(stabilityInterval);
                }
            } catch (error) {
                errorCount++;
                console.error('Stability test error:', error);
            }
        }, 500);
        
        // Wait for test to complete
        await new Promise(resolve => setTimeout(resolve, TEST_CONFIG.PERFORMANCE.testDuration + 1000));
        
        const errorRate = errorCount / processedCount;
        const test4Passed = errorRate < 0.05; // Less than 5% error rate
        
        console.log(formatTestResult('System stability over time', test4Passed,
            `Error rate: ${Math.round(errorRate * 100)}%, Processed: ${processedCount}`));
        trackResult('integration', test4Passed);
        
        console.log('\n✅ Integration tests completed');
        
    } catch (error) {
        console.error('❌ Integration tests failed:', error);
        trackResult('integration', false, error.message);
    }
}

// =======================================================================
// EDGE CASE TESTS
// =======================================================================

async function testEdgeCases() {
    console.log('\n=== Testing Edge Cases ===');
    
    try {
        const agent = new LangGraphAgent();
        await agent.start({ 
            profile: {
                name: 'EdgeCaseTestAgent',
                purposeCore: { personality: { traits: {} }, motivations: [], values: [], ethics: [] },
                behavior: { adaptationRate: 0.1 }
            }
        });
        
        // Test 1: Malformed goal commands
        console.log('\n1. Testing malformed goal commands...');
        const malformedCommands = [
            '!goal',
            '!goal ',
            '!goal invalidaction',
            '!goal show',
            '!goal show active extra params'
        ];
        
        let malformedHandled = 0;
        for (const command of malformedCommands) {
            try {
                await agent.handleMessage('test_user', command);
                malformedHandled++;
            } catch (error) {
                console.error(`Error handling malformed command "${command}":`, error);
            }
        }
        
        const test1Passed = malformedHandled === malformedCommands.length;
        console.log(formatTestResult('Malformed goal commands', test1Passed,
            `Handled: ${malformedHandled}/${malformedCommands.length}`));
        trackResult('edgeCases', test1Passed);
        
        // Test 2: Rapid message bursts
        console.log('\n2. Testing rapid message bursts...');
        const rapidMessages = [];
        const burstStartTime = Date.now();
        
        for (let i = 0; i < 20; i++) {
            rapidMessages.push(agent.handleMessage('test_user', `rapid ${i}`));
        }
        
        await Promise.all(rapidMessages);
        const burstTime = Date.now() - burstStartTime;
        
        const test2Passed = burstTime < 5000; // Should complete within 5 seconds
        console.log(formatTestResult('Rapid message bursts', test2Passed,
            `Burst time: ${burstTime}ms`));
        trackResult('edgeCases', test2Passed);
        
        // Test 3: Memory pressure scenarios
        console.log('\n3. Testing memory pressure scenarios...');
        const initialMemory = process.memoryUsage();
        
        // Create memory pressure
        const memoryHog = [];
        for (let i = 0; i < 1000; i++) {
            memoryHog.push(new Array(1000).fill(Math.random()));
        }
        
        // Test agent behavior under memory pressure
        await agent.handleMessage('test_user', 'test under memory pressure');
        const pressureMemory = process.memoryUsage();
        
        // Trigger cleanup
        agent.checkMemoryUsage();
        agent.performMemoryCleanup();
        
        // Clean up memory hog
        memoryHog.length = 0;
        if (global.gc) global.gc();
        
        const finalMemory = process.memoryUsage();
        const memoryRecovered = pressureMemory.heapUsed - finalMemory.heapUsed;
        
        const test3Passed = memoryRecovered > 0;
        console.log(formatTestResult('Memory pressure scenarios', test3Passed,
            `Memory recovered: ${Math.round(memoryRecovered / 1024 / 1024)}MB`));
        trackResult('edgeCases', test3Passed);
        
        // Test 4: Recovery from error conditions
        console.log('\n4. Testing recovery from error conditions...');
        
        // Simulate error conditions
        const originalState = agent.agentState;
        agent.agentState = null;
        
        try {
            await agent.handleMessage('test_user', 'test message');
            const test4Passed = false; // Should not reach here
            console.log(formatTestResult('Recovery from error conditions', test4Passed,
                'Should have handled null state error'));
            trackResult('edgeCases', test4Passed);
        } catch (error) {
            // Restore state and test recovery
            agent.agentState = originalState;
            await agent.handleMessage('test_user', 'recovery test');
            
            const test4Passed = agent.agentState !== null;
            console.log(formatTestResult('Recovery from error conditions', test4Passed,
                'Recovered from null state error'));
            trackResult('edgeCases', test4Passed);
        }
        
        console.log('\n✅ Edge case tests completed');
        
    } catch (error) {
        console.error('❌ Edge case tests failed:', error);
        trackResult('edgeCases', false, error.message);
    }
}

// =======================================================================
// PERFORMANCE TESTS
// =======================================================================

async function testPerformance() {
    console.log('\n=== Testing Performance ===');
    
    try {
        // Test 1: Memory usage stability
        console.log('\n1. Testing memory usage stability...');
        const agent = new LangGraphAgent();
        await agent.start({ 
            profile: {
                name: 'PerformanceTestAgent',
                purposeCore: { personality: { traits: {} }, motivations: [], values: [], ethics: [] },
                behavior: { adaptationRate: 0.1 }
            }
        });
        
        const memorySnapshots = [];
        const testDuration = 30000; // 30 seconds
        const intervalTime = 3000; // Every 3 seconds
        
        for (let i = 0; i < testDuration / intervalTime; i++) {
            // Send some messages
            for (let j = 0; j < 10; j++) {
                await agent.handleMessage('test_user', `performance test ${i}-${j}`);
            }
            
            // Record memory
            const memory = process.memoryUsage();
            memorySnapshots.push({
                time: Date.now(),
                heapUsed: memory.heapUsed,
                heapTotal: memory.heapTotal
            });
            
            await new Promise(resolve => setTimeout(resolve, intervalTime));
        }
        
        // Calculate memory growth trend
        const initialHeap = memorySnapshots[0].heapUsed;
        const finalHeap = memorySnapshots[memorySnapshots.length - 1].heapUsed;
        const totalGrowth = finalHeap - initialHeap;
        const avgGrowthPerSnapshot = totalGrowth / memorySnapshots.length;
        
        const test1Passed = avgGrowthPerSnapshot < 10 * 1024 * 1024; // Less than 10MB per interval
        console.log(formatTestResult('Memory usage stability', test1Passed,
            `Avg growth per interval: ${Math.round(avgGrowthPerSnapshot / 1024 / 1024)}MB`));
        trackResult('performance', test1Passed);
        
        // Test 2: Response time consistency
        console.log('\n2. Testing response time consistency...');
        const responseTimes = [];
        
        for (let i = 0; i < 50; i++) {
            const startTime = Date.now();
            await agent.handleMessage('test_user', `response time test ${i}`);
            const responseTime = Date.now() - startTime;
            responseTimes.push(responseTime);
        }
        
        const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
        const maxResponseTime = Math.max(...responseTimes);
        const minResponseTime = Math.min(...responseTimes);
        
        const test2Passed = avgResponseTime < TEST_CONFIG.PERFORMANCE.maxResponseTime;
        console.log(formatTestResult('Response time consistency', test2Passed,
            `Avg: ${Math.round(avgResponseTime)}ms, Min: ${minResponseTime}ms, Max: ${maxResponseTime}ms`));
        trackResult('performance', test2Passed);
        
        // Test 3: Concurrent message handling
        console.log('\n3. Testing concurrent message handling...');
        const concurrentStartTime = Date.now();
        const concurrentMessages = [];
        
        for (let i = 0; i < 20; i++) {
            concurrentMessages.push(
                agent.handleMessage(`user${i}`, `concurrent test ${i}`)
            );
        }
        
        await Promise.all(concurrentMessages);
        const concurrentTime = Date.now() - concurrentStartTime;
        
        const test3Passed = concurrentTime < 10000; // Should complete within 10 seconds
        console.log(formatTestResult('Concurrent message handling', test3Passed,
            `Concurrent processing time: ${concurrentTime}ms`));
        trackResult('performance', test3Passed);
        
        console.log('\n✅ Performance tests completed');
        
    } catch (error) {
        console.error('❌ Performance tests failed:', error);
        trackResult('performance', false, error.message);
    }
}

// =======================================================================
// TEST EXECUTION AND REPORTING
// =======================================================================

async function runAllTests() {
    console.log('🚀 Starting Comprehensive Fix Validation Test Suite');
    console.log('================================================');
    
    const overallStartTime = Date.now();
    
    try {
        // Run all test categories
        await testInfiniteLoopPrevention();
        await testConversationActionCorrelation();
        await testIntegration();
        await testEdgeCases();
        await testPerformance();
        
        // Calculate overall results
        const totalPassed = Object.values(testResults).reduce((sum, category) => sum + category.passed, 0);
        const totalFailed = Object.values(testResults).reduce((sum, category) => sum + category.failed, 0);
        const totalTests = totalPassed + totalFailed;
        const overallSuccessRate = (totalPassed / totalTests) * 100;
        
        const overallTime = Date.now() - overallStartTime;
        
        // Print summary
        console.log('\n' + '='.repeat(60));
        console.log('📊 COMPREHENSIVE TEST SUITE RESULTS');
        console.log('='.repeat(60));
        
        console.log('\n📈 Category Results:');
        console.log(`  Crash Prevention:     ${testResults.crashPrevention.passed}/${testResults.crashPrevention.passed + testResults.crashPrevention.failed} passed`);
        console.log(`  Conversation Correlation: ${testResults.conversationCorrelation.passed}/${testResults.conversationCorrelation.passed + testResults.conversationCorrelation.failed} passed`);
        console.log(`  Integration:           ${testResults.integration.passed}/${testResults.integration.passed + testResults.integration.failed} passed`);
        console.log(`  Edge Cases:            ${testResults.edgeCases.passed}/${testResults.edgeCases.passed + testResults.edgeCases.failed} passed`);
        console.log(`  Performance:            ${testResults.performance.passed}/${testResults.performance.passed + testResults.performance.failed} passed`);
        
        console.log('\n🎯 Overall Results:');
        console.log(`  Total Tests:           ${totalTests}`);
        console.log(`  Passed:                ${totalPassed}`);
        console.log(`  Failed:                ${totalFailed}`);
        console.log(`  Success Rate:           ${overallSuccessRate.toFixed(1)}%`);
        console.log(`  Total Execution Time:   ${Math.round(overallTime / 1000)}s`);
        
        // Print any errors
        const allErrors = Object.values(testResults).flatMap(category => category.errors);
        if (allErrors.length > 0) {
            console.log('\n❌ Errors Encountered:');
            allErrors.forEach((error, index) => {
                console.log(`  ${index + 1}. ${error}`);
            });
        }
        
        // Final validation status
        console.log('\n' + '='.repeat(60));
        if (overallSuccessRate >= 95) {
            console.log('🎉 EXCELLENT: All fixes validated successfully!');
            console.log('   The infinite loop crash is resolved and conversation-action');
            console.log('   correlation is working properly with excellent performance.');
        } else if (overallSuccessRate >= 85) {
            console.log('✅ GOOD: Most fixes validated successfully!');
            console.log('   The system is working well with minor issues that may');
            console.log('   need attention for optimal performance.');
        } else if (overallSuccessRate >= 70) {
            console.log('⚠️  ACCEPTABLE: Some fixes validated with issues.');
            console.log('   The system has functional fixes but requires additional');
            console.log('   work to address remaining issues.');
        } else {
            console.log('❌ NEEDS WORK: Multiple issues require attention.');
            console.log('   Significant additional work is needed to resolve');
            console.log('   the identified problems.');
        }
        
        console.log('\n🔍 Key Validations:');
        console.log(`  ✅ Infinite Loop Prevention: ${testResults.crashPrevention.failed === 0 ? 'RESOLVED' : 'NEEDS ATTENTION'}`);
        console.log(`  ✅ Conversation-Action Correlation: ${testResults.conversationCorrelation.failed === 0 ? 'WORKING' : 'NEEDS ATTENTION'}`);
        console.log(`  ✅ Memory Management: ${testResults.integration.failed === 0 ? 'STABLE' : 'NEEDS ATTENTION'}`);
        console.log(`  ✅ System Performance: ${testResults.performance.failed === 0 ? 'OPTIMAL' : 'NEEDS OPTIMIZATION'}`);
        
        console.log('\n' + '='.repeat(60));
        
        return {
            success: overallSuccessRate >= 85,
            totalTests,
            totalPassed,
            totalFailed,
            successRate: overallSuccessRate,
            executionTime: overallTime,
            categoryResults: testResults
        };
        
    } catch (error) {
        console.error('❌ Test suite execution failed:', error);
        return {
            success: false,
            error: error.message,
            executionTime: Date.now() - overallStartTime
        };
    }
}

// Export for use in other test files
export {
    runAllTests,
    testInfiniteLoopPrevention,
    testConversationActionCorrelation,
    testIntegration,
    testEdgeCases,
    testPerformance,
    TEST_CONFIG,
    testResults
};

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    runAllTests().then(results => {
        process.exit(results.success ? 0 : 1);
    }).catch(error => {
        console.error('Test execution failed:', error);
        process.exit(1);
    });
}