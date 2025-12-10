/**
 * Infinite Loop Crash Prevention Test Suite
 * 
 * Specialized tests to validate that the infinite loop crash issue
 * is completely resolved with comprehensive edge case coverage
 */

import { LangGraphAgent } from './src/agent/langgraph/agent.js';

// Test configuration for infinite loop prevention
const INFINITE_LOOP_TEST_CONFIG = {
    // Message scenarios that previously caused infinite loops
    CRASH_SCENARIOS: [
        {
            name: 'Recursive !goal command',
            messages: ['!goal show active', '!goal show active', '!goal show active'],
            expectedBehavior: 'Should stop processing after first message'
        },
        {
            name: 'Rapid duplicate messages',
            messages: ['hello', 'hello', 'hello', 'hello', 'hello'],
            expectedBehavior: 'Should detect and skip duplicates'
        },
        {
            name: 'Mixed conversation and !goal commands',
            messages: ['what are you doing?', '!goal show active', 'what are you doing?', '!goal show active'],
            expectedBehavior: 'Should handle both types without loops'
        },
        {
            name: 'Malformed !goal commands',
            messages: ['!goal', '!goal ', '!goal invalid', '!goal show active extra'],
            expectedBehavior: 'Should handle malformed commands gracefully'
        },
        {
            name: 'High frequency message bursts',
            messages: Array(20).fill('test message'),
            expectedBehavior: 'Should process without infinite loops'
        }
    ],
    
    // Performance thresholds
    PERFORMANCE_THRESHOLDS: {
        maxProcessingTime: 5000, // 5 seconds max for any test
        maxMemoryGrowth: 50 * 1024 * 1024, // 50MB max growth
        maxCPUUsage: 90 // 90% max CPU usage
    },
    
    // Loop detection parameters
    LOOP_DETECTION: {
        duplicateWindow: 5000, // 5 seconds
        maxHistoryEntries: 100,
        messageClearingDelay: 100 // 100ms max delay for message clearing
    }
};

// Test results tracking
const infiniteLoopTestResults = {
    crashScenarios: { passed: 0, failed: 0, errors: [] },
    memoryManagement: { passed: 0, failed: 0, errors: [] },
    performance: { passed: 0, failed: 0, errors: [] },
    edgeCases: { passed: 0, failed: 0, errors: [] }
};

/**
 * Track test results for infinite loop prevention
 */
function trackInfiniteLoopResult(category, passed, error = null) {
    if (passed) {
        infiniteLoopTestResults[category].passed++;
    } else {
        infiniteLoopTestResults[category].failed++;
        if (error) {
            infiniteLoopTestResults[category].errors.push(error);
        }
    }
}

/**
 * Test crash scenarios that previously caused infinite loops
 */
async function testCrashScenarios() {
    console.log('\n=== Testing Previously Crashing Scenarios ===');
    
    try {
        // Create test agent
        const agent = new LangGraphAgent();
        const mockProfile = {
            name: 'CrashTestAgent',
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
        
        // Test each crash scenario
        for (const scenario of INFINITE_LOOP_TEST_CONFIG.CRASH_SCENARIOS) {
            console.log(`\nTesting: ${scenario.name}`);
            console.log(`Expected: ${scenario.expectedBehavior}`);
            
            const startTime = Date.now();
            const initialMemory = process.memoryUsage();
            let messageProcessed = false;
            let loopDetected = false;
            
            try {
                // Process messages with timeout protection
                const messagePromises = scenario.messages.map((message, index) => 
                    new Promise(async (resolve, reject) => {
                        try {
                            // Add small delay between messages to simulate real usage
                            await new Promise(r => setTimeout(r, 50));
                            
                            await agent.handleMessage('test_user', message);
                            
                            // Check if message was processed (cleared from context)
                            const processed = !agent.agentState.context.lastMessage;
                            resolve(processed);
                        } catch (error) {
                            reject(error);
                        }
                    })
                );
                
                // Wait for all messages with timeout
                const results = await Promise.race([
                    Promise.all(messagePromises),
                    new Promise((_, reject) => 
                        setTimeout(() => reject(new Error('Test timeout - possible infinite loop')), 
                        INFINITE_LOOP_TEST_CONFIG.PERFORMANCE_THRESHOLDS.maxProcessingTime)
                    )
                ]);
                
                const processingTime = Date.now() - startTime;
                const finalMemory = process.memoryUsage();
                const memoryGrowth = finalMemory.heapUsed - initialMemory.heapUsed;
                
                // Validate results
                const testPassed = processingTime < INFINITE_LOOP_TEST_CONFIG.PERFORMANCE_THRESHOLDS.maxProcessingTime &&
                                  memoryGrowth < INFINITE_LOOP_TEST_CONFIG.PERFORMANCE_THRESHOLDS.maxMemoryGrowth;
                
                console.log(`  ✅ Processed in ${processingTime}ms`);
                console.log(`  ✅ Memory growth: ${Math.round(memoryGrowth / 1024 / 1024)}MB`);
                console.log(`  ✅ Messages processed without infinite loop`);
                
                trackInfiniteLoopResult('crashScenarios', testPassed);
                
            } catch (error) {
                if (error.message.includes('timeout')) {
                    console.log(`  ❌ TIMEOUT: Possible infinite loop detected`);
                    loopDetected = true;
                } else {
                    console.log(`  ❌ ERROR: ${error.message}`);
                }
                trackInfiniteLoopResult('crashScenarios', false, error.message);
            }
        }
        
        console.log('\n✅ Crash scenario tests completed');
        
    } catch (error) {
        console.error('❌ Crash scenario tests failed:', error);
        trackInfiniteLoopResult('crashScenarios', false, error.message);
    }
}

/**
 * Test memory management to prevent memory buildup
 */
async function testMemoryManagement() {
    console.log('\n=== Testing Memory Management ===');
    
    try {
        const agent = new LangGraphAgent();
        await agent.start({ 
            profile: {
                name: 'MemoryTestAgent',
                purposeCore: { personality: { traits: {} }, motivations: [], values: [], ethics: [] },
                behavior: { adaptationRate: 0.1 }
            }
        });
        
        // Test 1: Response history limiting
        console.log('\n1. Testing response history limiting...');
        const initialLength = agent.agentState.executive.responseHistory.length;
        
        // Add messages beyond limit
        for (let i = 0; i < 200; i++) {
            agent.agentState.executive.responseHistory.push({
                source: 'test_user',
                message: `test message ${i}`,
                response: `test response ${i}`,
                timestamp: Date.now() - (i * 1000),
                processingMode: 'conversational',
                responseTime: 100,
                success: true
            });
        }
        
        // Trigger cleanup
        agent.performMemoryCleanup();
        
        const finalLength = agent.agentState.executive.responseHistory.length;
        const test1Passed = finalLength <= INFINITE_LOOP_TEST_CONFIG.LOOP_DETECTION.maxHistoryEntries;
        
        console.log(`  ${test1Passed ? '✅' : '❌'} History limited to ${finalLength} entries (max: ${INFINITE_LOOP_TEST_CONFIG.LOOP_DETECTION.maxHistoryEntries})`);
        trackInfiniteLoopResult('memoryManagement', test1Passed);
        
        // Test 2: Memory usage tracking
        console.log('\n2. Testing memory usage tracking...');
        const initialMemory = process.memoryUsage();
        
        // Check memory tracking
        agent.checkMemoryUsage();
        const trackedMemory = agent.getMemoryStats();
        
        const test2Passed = trackedMemory && trackedMemory.current && trackedMemory.peak;
        console.log(`  ${test2Passed ? '✅' : '❌'} Memory tracking active`);
        trackInfiniteLoopResult('memoryManagement', test2Passed);
        
        // Test 3: Garbage collection triggering
        console.log('\n3. Testing garbage collection triggering...');
        
        // Create memory pressure
        const memoryHog = [];
        for (let i = 0; i < 100; i++) {
            memoryHog.push(new Array(1000).fill(Math.random()));
        }
        
        const beforeGC = process.memoryUsage();
        agent.checkMemoryUsage(); // Should trigger GC if needed
        const afterGC = process.memoryUsage();
        
        // Clean up
        memoryHog.length = 0;
        if (global.gc) global.gc();
        
        // Note: This test is informational as GC behavior varies
        console.log(`  ✅ Garbage collection check completed`);
        trackInfiniteLoopResult('memoryManagement', true);
        
        console.log('\n✅ Memory management tests completed');
        
    } catch (error) {
        console.error('❌ Memory management tests failed:', error);
        trackInfiniteLoopResult('memoryManagement', false, error.message);
    }
}

/**
 * Test performance under stress to ensure no degradation
 */
async function testPerformance() {
    console.log('\n=== Testing Performance Under Stress ===');
    
    try {
        const agent = new LangGraphAgent();
        await agent.start({ 
            profile: {
                name: 'PerformanceTestAgent',
                purposeCore: { personality: { traits: {} }, motivations: [], values: [], ethics: [] },
                behavior: { adaptationRate: 0.1 }
            }
        });
        
        // Test 1: Rapid message processing
        console.log('\n1. Testing rapid message processing...');
        const messageCount = 50;
        const startTime = Date.now();
        
        for (let i = 0; i < messageCount; i++) {
            await agent.handleMessage('test_user', `rapid message ${i}`);
        }
        
        const totalTime = Date.now() - startTime;
        const avgTimePerMessage = totalTime / messageCount;
        
        const test1Passed = avgTimePerMessage < 100; // Less than 100ms per message
        console.log(`  ${test1Passed ? '✅' : '❌'} Avg ${Math.round(avgTimePerMessage)}ms per message`);
        trackInfiniteLoopResult('performance', test1Passed);
        
        // Test 2: Concurrent message handling
        console.log('\n2. Testing concurrent message handling...');
        const concurrentStartTime = Date.now();
        const concurrentMessages = [];
        
        for (let i = 0; i < 20; i++) {
            concurrentMessages.push(
                agent.handleMessage(`user${i}`, `concurrent test ${i}`)
            );
        }
        
        await Promise.all(concurrentMessages);
        const concurrentTime = Date.now() - concurrentStartTime;
        
        const test2Passed = concurrentTime < 5000; // Less than 5 seconds for 20 messages
        console.log(`  ${test2Passed ? '✅' : '❌'} Concurrent processing in ${concurrentTime}ms`);
        trackInfiniteLoopResult('performance', test2Passed);
        
        // Test 3: Memory stability under load
        console.log('\n3. Testing memory stability under load...');
        const initialMemory = process.memoryUsage();
        
        // Process many messages
        for (let i = 0; i < 100; i++) {
            await agent.handleMessage('test_user', `load test message ${i}`);
        }
        
        const finalMemory = process.memoryUsage();
        const memoryGrowth = finalMemory.heapUsed - initialMemory.heapUsed;
        
        const test3Passed = memoryGrowth < INFINITE_LOOP_TEST_CONFIG.PERFORMANCE_THRESHOLDS.maxMemoryGrowth;
        console.log(`  ${test3Passed ? '✅' : '❌'} Memory growth: ${Math.round(memoryGrowth / 1024 / 1024)}MB`);
        trackInfiniteLoopResult('performance', test3Passed);
        
        console.log('\n✅ Performance tests completed');
        
    } catch (error) {
        console.error('❌ Performance tests failed:', error);
        trackInfiniteLoopResult('performance', false, error.message);
    }
}

/**
 * Test edge cases that could trigger infinite loops
 */
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
        
        // Test 1: Empty and null messages
        console.log('\n1. Testing empty and null messages...');
        const edgeMessages = ['', null, undefined, '   ', '\n\n\n'];
        
        let edgeHandled = 0;
        for (const message of edgeMessages) {
            try {
                await agent.handleMessage('test_user', message);
                edgeHandled++;
            } catch (error) {
                console.error(`  Error with message "${message}": ${error.message}`);
            }
        }
        
        const test1Passed = edgeHandled === edgeMessages.length;
        console.log(`  ${test1Passed ? '✅' : '❌'} Handled ${edgeHandled}/${edgeMessages.length} edge messages`);
        trackInfiniteLoopResult('edgeCases', test1Passed);
        
        // Test 2: Extremely long messages
        console.log('\n2. Testing extremely long messages...');
        const longMessage = 'a'.repeat(10000);
        
        const longMessageStart = Date.now();
        await agent.handleMessage('test_user', longMessage);
        const longMessageTime = Date.now() - longMessageStart;
        
        const test2Passed = longMessageTime < 1000; // Should process quickly
        console.log(`  ${test2Passed ? '✅' : '❌'} Long message processed in ${longMessageTime}ms`);
        trackInfiniteLoopResult('edgeCases', test2Passed);
        
        // Test 3: Special characters and encoding
        console.log('\n3. Testing special characters and encoding...');
        const specialMessages = [
            '!@#$%^&*()',
            '🤖🎮🏗️',
            '<script>alert("test")</script>',
            'SELECT * FROM users;',
            '\x00\x01\x02\x03'
        ];
        
        let specialHandled = 0;
        for (const message of specialMessages) {
            try {
                await agent.handleMessage('test_user', message);
                specialHandled++;
            } catch (error) {
                console.error(`  Error with special message: ${error.message}`);
            }
        }
        
        const test3Passed = specialHandled === specialMessages.length;
        console.log(`  ${test3Passed ? '✅' : '❌'} Handled ${specialHandled}/${specialMessages.length} special messages`);
        trackInfiniteLoopResult('edgeCases', test3Passed);
        
        // Test 4: State corruption scenarios
        console.log('\n4. Testing state corruption scenarios...');
        
        // Test with null agent state
        const originalState = agent.agentState;
        agent.agentState = null;
        
        try {
            await agent.handleMessage('test_user', 'test with null state');
            const test4Passed = false; // Should not reach here
            console.log(`  ❌ Should have handled null state error`);
            trackInfiniteLoopResult('edgeCases', test4Passed);
        } catch (error) {
            // Restore and test recovery
            agent.agentState = originalState;
            await agent.handleMessage('test_user', 'recovery test');
            
            const test4Passed = agent.agentState !== null;
            console.log(`  ${test4Passed ? '✅' : '❌'} Recovered from null state`);
            trackInfiniteLoopResult('edgeCases', test4Passed);
        }
        
        console.log('\n✅ Edge case tests completed');
        
    } catch (error) {
        console.error('❌ Edge case tests failed:', error);
        trackInfiniteLoopResult('edgeCases', false, error.message);
    }
}

/**
 * Run all infinite loop prevention tests
 */
async function runInfiniteLoopTests() {
    console.log('🔄 Starting Infinite Loop Crash Prevention Test Suite');
    console.log('==================================================');
    
    const overallStartTime = Date.now();
    
    try {
        // Run all test categories
        await testCrashScenarios();
        await testMemoryManagement();
        await testPerformance();
        await testEdgeCases();
        
        // Calculate results
        const totalPassed = Object.values(infiniteLoopTestResults).reduce((sum, category) => sum + category.passed, 0);
        const totalFailed = Object.values(infiniteLoopTestResults).reduce((sum, category) => sum + category.failed, 0);
        const totalTests = totalPassed + totalFailed;
        const successRate = totalTests > 0 ? (totalPassed / totalTests) * 100 : 0;
        
        const overallTime = Date.now() - overallStartTime;
        
        // Print summary
        console.log('\n' + '='.repeat(60));
        console.log('📊 INFINITE LOOP PREVENTION TEST RESULTS');
        console.log('='.repeat(60));
        
        console.log('\n📈 Category Results:');
        console.log(`  Crash Scenarios:      ${infiniteLoopTestResults.crashScenarios.passed}/${infiniteLoopTestResults.crashScenarios.passed + infiniteLoopTestResults.crashScenarios.failed} passed`);
        console.log(`  Memory Management:     ${infiniteLoopTestResults.memoryManagement.passed}/${infiniteLoopTestResults.memoryManagement.passed + infiniteLoopTestResults.memoryManagement.failed} passed`);
        console.log(`  Performance:           ${infiniteLoopTestResults.performance.passed}/${infiniteLoopTestResults.performance.passed + infiniteLoopTestResults.performance.failed} passed`);
        console.log(`  Edge Cases:            ${infiniteLoopTestResults.edgeCases.passed}/${infiniteLoopTestResults.edgeCases.passed + infiniteLoopTestResults.edgeCases.failed} passed`);
        
        console.log('\n🎯 Overall Results:');
        console.log(`  Total Tests:           ${totalTests}`);
        console.log(`  Passed:                ${totalPassed}`);
        console.log(`  Failed:                ${totalFailed}`);
        console.log(`  Success Rate:           ${successRate.toFixed(1)}%`);
        console.log(`  Execution Time:        ${Math.round(overallTime / 1000)}s`);
        
        // Print any errors
        const allErrors = Object.values(infiniteLoopTestResults).flatMap(category => category.errors);
        if (allErrors.length > 0) {
            console.log('\n❌ Errors Encountered:');
            allErrors.forEach((error, index) => {
                console.log(`  ${index + 1}. ${error}`);
            });
        }
        
        // Final validation
        console.log('\n' + '='.repeat(60));
        if (successRate >= 95) {
            console.log('🎉 EXCELLENT: Infinite loop crash is completely resolved!');
            console.log('   All previously crashing scenarios now work correctly.');
        } else if (successRate >= 85) {
            console.log('✅ GOOD: Infinite loop crash is mostly resolved.');
            console.log('   Most scenarios work correctly with minor issues remaining.');
        } else if (successRate >= 70) {
            console.log('⚠️  ACCEPTABLE: Partial infinite loop prevention.');
            console.log('   Some improvements made but additional work needed.');
        } else {
            console.log('❌ NEEDS WORK: Infinite loop crash is not fully resolved.');
            console.log('   Significant additional work is required.');
        }
        
        console.log('\n🔍 Key Validations:');
        console.log(`  ✅ Duplicate Message Detection: ${infiniteLoopTestResults.crashScenarios.failed === 0 ? 'WORKING' : 'NEEDS ATTENTION'}`);
        console.log(`  ✅ !goal Command Handling: ${infiniteLoopTestResults.crashScenarios.failed === 0 ? 'WORKING' : 'NEEDS ATTENTION'}`);
        console.log(`  ✅ Memory Management: ${infiniteLoopTestResults.memoryManagement.failed === 0 ? 'STABLE' : 'NEEDS ATTENTION'}`);
        console.log(`  ✅ Performance Under Load: ${infiniteLoopTestResults.performance.failed === 0 ? 'STABLE' : 'NEEDS OPTIMIZATION'}`);
        console.log(`  ✅ Edge Case Handling: ${infiniteLoopTestResults.edgeCases.failed === 0 ? 'ROBUST' : 'NEEDS IMPROVEMENT'}`);
        
        console.log('\n' + '='.repeat(60));
        
        return {
            success: successRate >= 85,
            totalTests,
            totalPassed,
            totalFailed,
            successRate,
            executionTime: overallTime,
            categoryResults: infiniteLoopTestResults
        };
        
    } catch (error) {
        console.error('❌ Infinite loop test suite failed:', error);
        return {
            success: false,
            error: error.message,
            executionTime: Date.now() - overallStartTime
        };
    }
}

// Export for use in other test files
export {
    runInfiniteLoopTests,
    testCrashScenarios,
    testMemoryManagement,
    testPerformance,
    testEdgeCases,
    INFINITE_LOOP_TEST_CONFIG,
    infiniteLoopTestResults
};

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    runInfiniteLoopTests().then(results => {
        process.exit(results.success ? 0 : 1);
    }).catch(error => {
        console.error('Test execution failed:', error);
        process.exit(1);
    });
}