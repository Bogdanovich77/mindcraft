/**
 * Comprehensive Test for Message Analysis and Routing Logic Validation
 * 
 * This test validates that the LangGraph agent correctly:
 * 1. Detects message types (conversational vs action commands)
 * 2. Routes messages through appropriate processing paths
 * 3. Maintains conversation context and response history
 * 4. Handles edge cases and ambiguous messages
 * 5. Meets performance requirements for both processing modes
 */

import { LangGraphAgent } from './src/agent/langgraph/agent.js';
import { messageAnalysisNode, conversationProcessingNode, responseRoutingNode } from './src/agent/langgraph/state_nodes.ts';
import fs from 'fs';

// Test configuration
const TEST_CONFIG = {
    timeout: 10000, // 10 second timeout for individual tests
    performanceThresholds: {
        conversationalResponse: 2000, // <2 seconds for conversational messages
        actionProcessing: 3000,       // <3 seconds for action commands
        messageAnalysis: 100          // <100ms for message analysis
    }
};

// Test data for different message types
const TEST_MESSAGES = {
    // Conversational messages that should route to conversation processing
    conversational: [
        { message: "say hi to john_goodman", source: "test_user", expectedMode: "conversational" },
        { message: "hello there", source: "test_user", expectedMode: "conversational" },
        { message: "how are you doing?", source: "test_user", expectedMode: "conversational" },
        { message: "what are you up to?", source: "test_user", expectedMode: "conversational" },
        { message: "thanks for your help", source: "test_user", expectedMode: "conversational" },
        { message: "tell me about yourself", source: "test_user", expectedMode: "conversational" },
        { message: "good morning", source: "test_user", expectedMode: "conversational" },
        { message: "nice weather today", source: "test_user", expectedMode: "conversational" }
    ],
    
    // Action commands that should route to cognitive processing
    actionCommands: [
        { message: "go to the house", source: "test_user", expectedMode: "action" },
        { message: "get some wood", source: "test_user", expectedMode: "action" },
        { message: "craft a pickaxe", source: "test_user", expectedMode: "action" },
        { message: "build a shelter", source: "test_user", expectedMode: "action" },
        { message: "attack the zombie", source: "test_user", expectedMode: "action" },
        { message: "follow me", source: "test_user", expectedMode: "action" },
        { message: "collect stone", source: "test_user", expectedMode: "action" },
        { message: "place these blocks", source: "test_user", expectedMode: "action" }
    ],
    
    // Edge cases and ambiguous messages
    edgeCases: [
        { message: "hi! can you get wood", source: "test_user", expectedMode: "action" }, // Mixed: contains action command
        { message: "hello, go to the cave", source: "test_user", expectedMode: "action" }, // Mixed: action command takes priority
        { message: "help me build", source: "test_user", expectedMode: "action" }, // Contains action verb
        { message: "!", source: "test_user", expectedMode: "action" }, // Exclamation mark
        { message: "a", source: "test_user", expectedMode: "conversational" }, // Very short, likely conversational
        { message: "urgent help", source: "test_user", expectedMode: "action" }, // Urgent + action
        { message: "say hi and then go to john", source: "test_user", expectedMode: "action" } // Mixed with action
    ],
    
    // Performance test messages
    performance: [
        { message: "quick response test", source: "perf_test", expectedMode: "conversational" },
        { message: "execute action fast", source: "perf_test", expectedMode: "action" }
    ]
};

// Test results tracking
let testResults = {
    totalTests: 0,
    passedTests: 0,
    failedTests: 0,
    performanceMetrics: [],
    routingErrors: [],
    conversationErrors: [],
    edgeCaseResults: []
};

/**
 * Mock profile for testing
 */
const createMockProfile = () => ({
    name: 'TestAgent',
    behavior: {
        adaptationRate: 0.1,
        reactiveModes: {}
    },
    purposeCore: {
        personality: {
            traits: {
                openness: 0.7,
                conscientiousness: 0.6,
                extraversion: 0.8,
                agreeableness: 0.7,
                neuroticism: 0.3,
                riskTolerance: 0.5,
                explorationDrive: 0.6,
                socialTendency: 0.8,
                buildingCreativity: 0.5,
                combatAggression: 0.3
            }
        },
        motivations: {
            primaryMotivation: 'social',
            secondaryMotivations: ['exploration']
        },
        values: {
            coreValues: ['helpfulness', 'efficiency']
        },
        ethics: {
            harmAvoidance: 0.8,
            fairnessConcern: 0.7
        }
    }
});

/**
 * Mock bot for testing
 */
const createMockBot = () => ({
    entity: {
        position: { x: 0, y: 64, z: 0 }
    },
    health: 20,
    food: 20,
    game: {
        dimension: 'overworld'
    },
    time: {
        timeOfDay: 6000
    },
    inventory: {
        items: () => []
    },
    entities: {},
    chat: (message) => {
        console.log(`[MOCK_CHAT] ${message}`);
    }
});

/**
 * Create initial agent state for testing
 */
const createTestAgentState = (agentId = 'test_agent') => ({
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
        inventory: [],
        equipment: {},
        lastMessage: undefined
    },
    reactive: {
        activeMode: 'none',
        emergencyConditions: [],
        lastReactiveAction: undefined,
        interruptHistory: []
    },
    cognitive: {
        purpose: {
            identity: { name: agentId, role: 'test', background: '', corePurpose: 'test' },
            personality: {
                openness: 0.7, conscientiousness: 0.6, extraversion: 0.8,
                agreeableness: 0.7, neuroticism: 0.3, riskTolerance: 0.5,
                explorationDrive: 0.6, socialTendency: 0.8,
                buildingCreativity: 0.5, combatAggression: 0.3
            },
            motivations: {
                primaryMotivation: 'social',
                secondaryMotivations: ['exploration'],
                drives: {},
                satisfactions: {}
            },
            values: {
                coreValues: ['helpfulness', 'efficiency'],
                valuePriorities: { helpfulness: 1.0, efficiency: 0.8 },
                moralConstraints: []
            },
            ethics: {
                harmAvoidance: 0.8, fairnessConcern: 0.7, loyaltyPriority: 0.6,
                authorityRespect: 0.5, purityConcern: 0.4
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
            working: {
                currentFocus: 'survival',
                activeTasks: [],
                buffer: [],
                capacity: 7,
                decayRate: 0.1
            }
        },
        processing: {
            currentPhase: 'perception',
            cognitiveLoad: 0.1,
            attentionLevel: 1.0,
            decisionThreshold: 0.5,
            processingHistory: []
        }
    },
    executive: {
        currentAction: undefined,
        actionQueue: [],
        decisionHistory: [],
        performanceMetrics: {
            reactiveResponseTime: [],
            cognitiveProcessingTime: [],
            successRate: 1.0,
            learningRate: 0.1,
            goalCompletionRate: 0.0,
            survivalEvents: 0,
            socialInteractions: 0
        },
        conversationalResponse: undefined,
        lastResponse: undefined,
        responseHistory: [],
        processingMode: 'action'
    },
    metadata: {
        agentId,
        startTime: Date.now(),
        lastUpdate: Date.now(),
        version: '1.0.0',
        performanceMode: 'balanced'
    }
});

/**
 * Test message analysis node directly
 */
async function testMessageAnalysisNode() {
    console.log('\n=== Testing Message Analysis Node ===');
    
    const testCases = [
        ...TEST_MESSAGES.conversational,
        ...TEST_MESSAGES.actionCommands,
        ...TEST_MESSAGES.edgeCases
    ];
    
    for (const testCase of testCases) {
        testResults.totalTests++;
        
        try {
            const startTime = Date.now();
            
            // Create test state with message
            const testState = createTestAgentState();
            testState.context.lastMessage = {
                source: testCase.source,
                message: testCase.message,
                timestamp: Date.now(),
                type: 'conversational',
                priority: 0.5
            };
            
            // Execute message analysis node
            const result = await messageAnalysisNode(testState);
            const analysisTime = Date.now() - startTime;
            
            // Validate processing mode
            const actualMode = result.executive?.processingMode;
            const expectedMode = testCase.expectedMode;
            
            if (actualMode === expectedMode) {
                testResults.passedTests++;
                console.log(`✓ PASS: "${testCase.message}" -> ${actualMode} (${analysisTime}ms)`);
            } else {
                testResults.failedTests++;
                testResults.routingErrors.push({
                    message: testCase.message,
                    expected: expectedMode,
                    actual: actualMode,
                    analysisTime
                });
                console.log(`✗ FAIL: "${testCase.message}" -> expected ${expectedMode}, got ${actualMode}`);
            }
            
            // Validate analysis time
            if (analysisTime > TEST_CONFIG.performanceThresholds.messageAnalysis) {
                console.warn(`⚠ SLOW: Message analysis took ${analysisTime}ms (threshold: ${TEST_CONFIG.performanceThresholds.messageAnalysis}ms)`);
            }
            
            testResults.performanceMetrics.push({
                test: 'message_analysis',
                message: testCase.message,
                processingTime: analysisTime,
                mode: actualMode,
                success: actualMode === expectedMode
            });
            
        } catch (error) {
            testResults.failedTests++;
            console.log(`✗ ERROR: "${testCase.message}" -> ${error.message}`);
        }
    }
}

/**
 * Test conversation processing node
 */
async function testConversationProcessingNode() {
    console.log('\n=== Testing Conversation Processing Node ===');
    
    const conversationalMessages = TEST_MESSAGES.conversational;
    
    for (const testCase of conversationalMessages) {
        testResults.totalTests++;
        
        try {
            const startTime = Date.now();
            
            // Create test state with conversational message
            const testState = createTestAgentState();
            testState.context.lastMessage = {
                source: testCase.source,
                message: testCase.message,
                timestamp: Date.now(),
                type: 'conversational',
                priority: 0.5
            };
            testState.executive.processingMode = 'conversational';
            
            // Execute conversation processing node
            const result = await conversationProcessingNode(testState);
            const processingTime = Date.now() - startTime;
            
            // Validate response generation
            const hasResponse = result.executive?.conversationalResponse && 
                               result.executive.conversationalResponse.length > 0;
            
            if (hasResponse) {
                testResults.passedTests++;
                console.log(`✓ PASS: "${testCase.message}" -> "${result.executive.conversationalResponse.substring(0, 50)}..." (${processingTime}ms)`);
            } else {
                testResults.failedTests++;
                testResults.conversationErrors.push({
                    message: testCase.message,
                    error: 'No response generated',
                    processingTime
                });
                console.log(`✗ FAIL: "${testCase.message}" -> no response generated`);
            }
            
            // Validate processing time
            if (processingTime > TEST_CONFIG.performanceThresholds.conversationalResponse) {
                console.warn(`⚠ SLOW: Conversation processing took ${processingTime}ms (threshold: ${TEST_CONFIG.performanceThresholds.conversationalResponse}ms)`);
            }
            
            testResults.performanceMetrics.push({
                test: 'conversation_processing',
                message: testCase.message,
                processingTime,
                hasResponse,
                success: hasResponse
            });
            
        } catch (error) {
            testResults.failedTests++;
            console.log(`✗ ERROR: "${testCase.message}" -> ${error.message}`);
        }
    }
}

/**
 * Test response routing node
 */
async function testResponseRoutingNode() {
    console.log('\n=== Testing Response Routing Node ===');
    
    const testCases = TEST_MESSAGES.conversational.slice(0, 3); // Test a few cases
    
    for (const testCase of testCases) {
        testResults.totalTests++;
        
        try {
            const startTime = Date.now();
            
            // Create test state with response ready to route
            const testState = createTestAgentState();
            testState.executive.conversationalResponse = `Test response to: ${testCase.message}`;
            testState.executive.processingMode = 'conversational';
            testState.executive.lastResponse = {
                source: testCase.source,
                message: testCase.message,
                response: testState.executive.conversationalResponse,
                timestamp: Date.now(),
                processingMode: 'conversational',
                responseTime: 0,
                success: true
            };
            
            // Execute response routing node
            const result = await responseRoutingNode(testState);
            const routingTime = Date.now() - startTime;
            
            // Validate routing (response should be cleared after routing)
            const responseCleared = !result.executive?.conversationalResponse;
            const messageCleared = !result.context?.lastMessage;
            
            if (responseCleared && messageCleared) {
                testResults.passedTests++;
                console.log(`✓ PASS: Response routing completed (${routingTime}ms)`);
            } else {
                testResults.failedTests++;
                console.log(`✗ FAIL: Response routing incomplete - response cleared: ${responseCleared}, message cleared: ${messageCleared}`);
            }
            
            testResults.performanceMetrics.push({
                test: 'response_routing',
                message: testCase.message,
                processingTime: routingTime,
                success: responseCleared && messageCleared
            });
            
        } catch (error) {
            testResults.failedTests++;
            console.log(`✗ ERROR: Response routing -> ${error.message}`);
        }
    }
}

/**
 * Test end-to-end message routing with LangGraph agent
 */
async function testEndToEndRouting() {
    console.log('\n=== Testing End-to-End Message Routing ===');
    
    // Create agent instance
    const agent = new LangGraphAgent();
    
    try {
        // Initialize with mock data
        await agent.start({
            profile: createMockProfile()
        });
        
        // Override bot connection with mock
        agent.bot = createMockBot();
        agent.initializeAgentState();
        
        // Test conversational message routing
        console.log('\n--- Testing Conversational Message Routing ---');
        const conversationalTest = TEST_MESSAGES.conversational[0];
        
        const conversationalStart = Date.now();
        await agent.handleMessage(conversationalTest.source, conversationalTest.message);
        const conversationalTime = Date.now() - conversationalStart;
        
        // Check if response was generated and routed
        const lastResponse = agent.agentState.executive.lastResponse;
        const conversationalSuccess = lastResponse && 
                                     lastResponse.message === conversationalTest.message &&
                                     lastResponse.response.length > 0;
        
        if (conversationalSuccess) {
            testResults.passedTests++;
            console.log(`✓ PASS: End-to-end conversational routing completed in ${conversationalTime}ms`);
        } else {
            testResults.failedTests++;
            console.log(`✗ FAIL: End-to-end conversational routing failed`);
        }
        
        testResults.totalTests++;
        
        // Test action command routing
        console.log('\n--- Testing Action Command Routing ---');
        const actionTest = TEST_MESSAGES.actionCommands[0];
        
        const actionStart = Date.now();
        await agent.handleMessage(actionTest.source, actionTest.message);
        const actionTime = Date.now() - actionStart;
        
        // Check if message was processed through cognitive pipeline
        const processingMode = agent.agentState.executive.processingMode;
        const actionSuccess = processingMode === 'action';
        
        if (actionSuccess) {
            testResults.passedTests++;
            console.log(`✓ PASS: End-to-end action routing completed in ${actionTime}ms`);
        } else {
            testResults.failedTests++;
            console.log(`✗ FAIL: End-to-end action routing failed - processing mode: ${processingMode}`);
        }
        
        testResults.totalTests++;
        
    } catch (error) {
        console.log(`✗ ERROR: End-to-end routing test failed -> ${error.message}`);
        testResults.failedTests += 2;
        testResults.totalTests += 2;
    }
}

/**
 * Test performance requirements
 */
async function testPerformanceRequirements() {
    console.log('\n=== Testing Performance Requirements ===');
    
    const performanceTests = TEST_MESSAGES.performance;
    
    for (const testCase of performanceTests) {
        testResults.totalTests++;
        
        try {
            const startTime = Date.now();
            
            // Create test state
            const testState = createTestAgentState();
            testState.context.lastMessage = {
                source: testCase.source,
                message: testCase.message,
                timestamp: Date.now(),
                type: 'conversational',
                priority: 0.5
            };
            
            // Run through message analysis
            const analysisResult = await messageAnalysisNode(testState);
            const analysisTime = Date.now() - startTime;
            
            // If conversational, test conversation processing
            let totalTime = analysisTime;
            if (analysisResult.executive.processingMode === 'conversational') {
                const conversationStart = Date.now();
                const conversationResult = await conversationProcessingNode({
                    ...testState,
                    ...analysisResult
                });
                const conversationTime = Date.now() - conversationStart;
                totalTime += conversationTime;
                
                // Test response routing
                const routingStart = Date.now();
                await responseRoutingNode({
                    ...testState,
                    ...analysisResult,
                    ...conversationResult
                });
                const routingTime = Date.now() - routingStart;
                totalTime += routingTime;
            }
            
            // Check performance thresholds
            const threshold = testCase.expectedMode === 'conversational' 
                ? TEST_CONFIG.performanceThresholds.conversationalResponse
                : TEST_CONFIG.performanceThresholds.actionProcessing;
            
            const meetsRequirement = totalTime <= threshold;
            
            if (meetsRequirement) {
                testResults.passedTests++;
                console.log(`✓ PASS: "${testCase.message}" -> ${totalTime}ms (threshold: ${threshold}ms)`);
            } else {
                testResults.failedTests++;
                console.log(`✗ FAIL: "${testCase.message}" -> ${totalTime}ms exceeds threshold ${threshold}ms`);
            }
            
            testResults.performanceMetrics.push({
                test: 'performance_requirement',
                message: testCase.message,
                processingTime: totalTime,
                threshold,
                success: meetsRequirement
            });
            
        } catch (error) {
            testResults.failedTests++;
            console.log(`✗ ERROR: Performance test failed -> ${error.message}`);
        }
    }
}

/**
 * Test edge cases and ambiguous messages
 */
async function testEdgeCases() {
    console.log('\n=== Testing Edge Cases and Ambiguous Messages ===');
    
    for (const testCase of TEST_MESSAGES.edgeCases) {
        testResults.totalTests++;
        
        try {
            const startTime = Date.now();
            
            // Create test state
            const testState = createTestAgentState();
            testState.context.lastMessage = {
                source: testCase.source,
                message: testCase.message,
                timestamp: Date.now(),
                type: 'conversational',
                priority: 0.5
            };
            
            // Execute message analysis
            const result = await messageAnalysisNode(testState);
            const analysisTime = Date.now() - startTime;
            
            // Validate routing decision
            const actualMode = result.executive?.processingMode;
            const expectedMode = testCase.expectedMode;
            
            const success = actualMode === expectedMode;
            
            if (success) {
                testResults.passedTests++;
                console.log(`✓ PASS: Edge case "${testCase.message}" -> ${actualMode} (${analysisTime}ms)`);
            } else {
                testResults.failedTests++;
                console.log(`✗ FAIL: Edge case "${testCase.message}" -> expected ${expectedMode}, got ${actualMode}`);
            }
            
            testResults.edgeCaseResults.push({
                message: testCase.message,
                expected: expectedMode,
                actual: actualMode,
                processingTime: analysisTime,
                success
            });
            
        } catch (error) {
            testResults.failedTests++;
            console.log(`✗ ERROR: Edge case test failed -> ${error.message}`);
        }
    }
}

/**
 * Generate comprehensive test report
 */
function generateTestReport() {
    const report = {
        summary: {
            totalTests: testResults.totalTests,
            passedTests: testResults.passedTests,
            failedTests: testResults.failedTests,
            successRate: ((testResults.passedTests / testResults.totalTests) * 100).toFixed(2) + '%'
        },
        performance: {
            averageProcessingTime: testResults.performanceMetrics.length > 0 
                ? (testResults.performanceMetrics.reduce((sum, m) => sum + m.processingTime, 0) / testResults.performanceMetrics.length).toFixed(2) + 'ms'
                : 'N/A',
            slowestTest: testResults.performanceMetrics.length > 0
                ? Math.max(...testResults.performanceMetrics.map(m => m.processingTime)) + 'ms'
                : 'N/A',
            fastestTest: testResults.performanceMetrics.length > 0
                ? Math.min(...testResults.performanceMetrics.map(m => m.processingTime)) + 'ms'
                : 'N/A'
        },
        routingErrors: testResults.routingErrors,
        conversationErrors: testResults.conversationErrors,
        edgeCaseResults: testResults.edgeCaseResults,
        detailedMetrics: testResults.performanceMetrics,
        recommendations: generateRecommendations()
    };
    
    return report;
}

/**
 * Generate recommendations based on test results
 */
function generateRecommendations() {
    const recommendations = [];
    
    if (testResults.routingErrors.length > 0) {
        recommendations.push('Review message analysis logic for action command detection');
    }
    
    if (testResults.conversationErrors.length > 0) {
        recommendations.push('Investigate conversation processing node for response generation issues');
    }
    
    const slowTests = testResults.performanceMetrics.filter(m => 
        m.processingTime > TEST_CONFIG.performanceThresholds.conversationalResponse
    );
    
    if (slowTests.length > 0) {
        recommendations.push('Optimize conversation processing for better performance');
    }
    
    const edgeCaseFailures = testResults.edgeCaseResults.filter(r => !r.success);
    if (edgeCaseFailures.length > 0) {
        recommendations.push('Improve handling of ambiguous and mixed-type messages');
    }
    
    if (testResults.passedTests === testResults.totalTests) {
        recommendations.push('All tests passed! System is ready for production deployment.');
    }
    
    return recommendations;
}

/**
 * Main test execution function
 */
async function runMessageRoutingTests() {
    console.log('🚀 Starting Message Analysis and Routing Logic Validation Tests');
    console.log('================================================================');
    
    const startTime = Date.now();
    
    try {
        // Run all test suites
        await testMessageAnalysisNode();
        await testConversationProcessingNode();
        await testResponseRoutingNode();
        await testEndToEndRouting();
        await testPerformanceRequirements();
        await testEdgeCases();
        
        const totalTestTime = Date.now() - startTime;
        
        // Generate and display report
        const report = generateTestReport();
        
        console.log('\n' + '='.repeat(80));
        console.log('📊 TEST REPORT');
        console.log('='.repeat(80));
        console.log(`Total Tests: ${report.summary.totalTests}`);
        console.log(`Passed: ${report.summary.passedTests}`);
        console.log(`Failed: ${report.summary.failedTests}`);
        console.log(`Success Rate: ${report.summary.successRate}`);
        console.log(`Total Test Time: ${totalTestTime}ms`);
        console.log(`Average Processing Time: ${report.performance.averageProcessingTime}`);
        console.log(`Slowest Test: ${report.performance.slowestTest}`);
        console.log(`Fastest Test: ${report.performance.fastestTest}`);
        
        if (report.routingErrors.length > 0) {
            console.log('\n🔍 Routing Errors:');
            report.routingErrors.forEach(error => {
                console.log(`  - "${error.message}" -> expected ${error.expected}, got ${error.actual}`);
            });
        }
        
        if (report.conversationErrors.length > 0) {
            console.log('\n💬 Conversation Errors:');
            report.conversationErrors.forEach(error => {
                console.log(`  - "${error.message}" -> ${error.error}`);
            });
        }
        
        console.log('\n💡 Recommendations:');
        report.recommendations.forEach(rec => {
            console.log(`  • ${rec}`);
        });
        
        // Save detailed report to file
        const reportPath = `message_routing_test_report_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        console.log(`\n📄 Detailed report saved to: ${reportPath}`);
        
        // Exit with appropriate code
        if (report.summary.failedTests > 0) {
            console.log('\n❌ Some tests failed. Check the report for details.');
            process.exit(1);
        } else {
            console.log('\n✅ All tests passed! Message routing logic is working correctly.');
            process.exit(0);
        }
        
    } catch (error) {
        console.error('\n💥 Test suite failed with error:', error);
        process.exit(1);
    }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    runMessageRoutingTests().catch(console.error);
}

export {
    runMessageRoutingTests,
    testMessageAnalysisNode,
    testConversationProcessingNode,
    testResponseRoutingNode,
    testEndToEndRouting,
    testPerformanceRequirements,
    testEdgeCases,
    generateTestReport
};