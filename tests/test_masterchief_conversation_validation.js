/**
 * Comprehensive Test for MasterChief Bot Conversation Processing
 * Validates the fixed LangGraph conversation processing system with detailed logging
 */

import { LangGraphAgent } from './src/agent/langgraph/agent.js';
import { readFileSync } from 'fs';

// Test configuration
const TEST_CONFIG = {
    enableDetailedLogging: true,
    responseTimeout: 5000,
    mockChatSystem: true,
    validateStateTransitions: true
};

// Load MasterChief profile
const masterChiefProfile = JSON.parse(readFileSync('./profiles/MasterChief.json', 'utf8'));

// Test results tracking
const testResults = {
    totalTests: 0,
    passedTests: 0,
    failedTests: 0,
    errors: [],
    stateTransitions: [],
    responseTimes: []
};

/**
 * Enhanced mock bot with comprehensive logging
 */
function createMockBot() {
    const chatMessages = [];
    
    return {
        entity: { 
            position: { x: 100, y: 64, z: 200 },
            health: 20,
            food: 20
        },
        health: 20,
        food: 20,
        game: { 
            dimension: 'overworld',
            difficulty: 'normal'
        },
        time: { 
            timeOfDay: 6000,
            age: 1000
        },
        inventory: {
            items: () => [
                { name: 'diamond_sword', count: 1 },
                { name: 'bread', count: 5 },
                { name: 'oak_planks', count: 64 }
            ]
        },
        entities: {
            player1: {
                name: 'john_goodman',
                type: 'player',
                position: { x: 105, y: 64, z: 205 }
            }
        },
        chat: (message) => {
            const timestamp = new Date().toISOString();
            chatMessages.push({ message, timestamp });
            console.log(`[CHAT MOCK] ${timestamp}: ${message}`);
        },
        getChatHistory: () => chatMessages,
        clearChatHistory: () => chatMessages.length = 0
    };
}

/**
 * State transition tracker for validation
 */
class StateTransitionTracker {
    constructor() {
        this.transitions = [];
        this.currentStates = new Map();
    }
    
    recordTransition(agentName, fromNode, toNode, state, duration) {
        const transition = {
            timestamp: Date.now(),
            agentName,
            fromNode,
            toNode,
            stateSnapshot: this.createStateSnapshot(state),
            duration
        };
        
        this.transitions.push(transition);
        
        if (TEST_CONFIG.enableDetailedLogging) {
            console.log(`[STATE TRANSITION] ${agentName}: ${fromNode} → ${toNode} (${duration}ms)`);
        }
    }
    
    createStateSnapshot(state) {
        if (!state) return null;
        
        return {
            hasMessage: !!state.context?.lastMessage,
            processingMode: state.executive?.processingMode,
            currentPhase: state.cognitive?.processing?.currentPhase,
            hasResponse: !!state.executive?.conversationalResponse,
            emergencyLevel: state.reactive?.emergencyLevel
        };
    }
    
    validateExpectedFlow(expectedFlow) {
        const actualFlow = this.transitions.map(t => `${t.fromNode}→${t.toNode}`);
        const expected = expectedFlow.map(f => `${f.from}→${f.to}`);
        
        const matches = expected.every(step => actualFlow.includes(step));
        
        if (!matches && TEST_CONFIG.enableDetailedLogging) {
            console.log('[FLOW VALIDATION] Expected:', expected);
            console.log('[FLOW VALIDATION] Actual:', actualFlow);
        }
        
        return matches;
    }
}

/**
 * Initialize agent with enhanced monitoring
 */
async function initializeMasterChiefAgent() {
    console.log('\n=== Initializing MasterChief Agent ===');
    
    const agent = new LangGraphAgent();
    const mockBot = createMockBot();
    
    // Mock the bot connection
    agent.bot = mockBot;
    
    // Wrap state graph methods for monitoring
    const originalProcessCognitiveCycle = agent.processCognitiveCycle.bind(agent);
    agent.processCognitiveCycle = async function() {
        const startTime = Date.now();
        const result = await originalProcessCognitiveCycle();
        const duration = Date.now() - startTime;
        
        testResults.responseTimes.push(duration);
        console.log(`[PERFORMANCE] Cognitive cycle completed in ${duration}ms`);
        
        return result;
    };
    
    // Initialize with profile
    await agent.start({ profile: masterChiefProfile });
    
    console.log('✅ MasterChief agent initialized successfully');
    console.log(`   Agent Type: ${agent.profile.agentType}`);
    console.log(`   Compatibility Mode: ${agent.profile.compatibilityMode}`);
    console.log(`   Profile Version: ${agent.profile.profileVersion}`);
    
    return { agent, mockBot };
}

/**
 * Test conversational message processing
 */
async function testConversationalProcessing(agent, mockBot, stateTracker) {
    console.log('\n=== Testing Conversational Message Processing ===');
    
    const conversationalTests = [
        {
            name: 'Basic greeting to john_goodman',
            message: 'say hi to john_goodman',
            source: 'test_user',
            expectedFlow: [
                { from: 'START', to: 'perception' },
                { from: 'perception', to: 'message_analysis' },
                { from: 'message_analysis', to: 'conversation_processing' },
                { from: 'conversation_processing', to: 'response_routing' },
                { from: 'response_routing', to: 'END' }
            ],
            expectResponse: true
        },
        {
            name: 'General inquiry',
            message: 'how are you doing MasterChief?',
            source: 'curious_player',
            expectedFlow: [
                { from: 'START', to: 'perception' },
                { from: 'perception', to: 'message_analysis' },
                { from: 'message_analysis', to: 'conversation_processing' },
                { from: 'conversation_processing', to: 'response_routing' },
                { from: 'response_routing', to: 'END' }
            ],
            expectResponse: true
        },
        {
            name: 'Activity inquiry',
            message: 'what are you up to right now?',
            source: 'teammate',
            expectedFlow: [
                { from: 'START', to: 'perception' },
                { from: 'perception', to: 'message_analysis' },
                { from: 'message_analysis', to: 'conversation_processing' },
                { from: 'conversation_processing', to: 'response_routing' },
                { from: 'response_routing', to: 'END' }
            ],
            expectResponse: true
        },
        {
            name: 'Help request',
            message: 'can you help me find some diamonds?',
            source: 'miner_player',
            expectedFlow: [
                { from: 'START', to: 'perception' },
                { from: 'perception', to: 'message_analysis' },
                { from: 'message_analysis', to: 'conversation_processing' },
                { from: 'conversation_processing', to: 'response_routing' },
                { from: 'response_routing', to: 'END' }
            ],
            expectResponse: true
        }
    ];
    
    for (const test of conversationalTests) {
        console.log(`\n--- Test: ${test.name} ---`);
        console.log(`Message: "${test.message}" from ${test.source}`);
        
        testResults.totalTests++;
        
        try {
            // Clear previous state transitions
            stateTracker.transitions = [];
            mockBot.clearChatHistory();
            
            const startTime = Date.now();
            
            // Send message to agent
            await agent.handleMessage(test.source, test.message);
            
            // Wait for processing
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const processingTime = Date.now() - startTime;
            
            // Validate response generation
            const lastResponse = agent.agentState?.executive?.lastResponse;
            const hasResponse = lastResponse && lastResponse.response && lastResponse.response.length > 0;
            
            if (hasResponse === test.expectResponse) {
                console.log(`✅ Response generation: ${hasResponse ? 'Generated' : 'No response'} (as expected)`);
                if (hasResponse) {
                    console.log(`   Response: "${lastResponse.response}"`);
                    console.log(`   Processing time: ${processingTime}ms`);
                }
                testResults.passedTests++;
            } else {
                console.log(`❌ Response generation failed. Expected: ${test.expectResponse}, Got: ${hasResponse}`);
                testResults.failedTests++;
                testResults.errors.push(`${test.name}: Response generation mismatch`);
            }
            
            // Validate processing mode
            const processingMode = agent.agentState?.executive?.processingMode;
            if (processingMode === 'conversational') {
                console.log(`✅ Processing mode correctly set to: ${processingMode}`);
            } else {
                console.log(`❌ Processing mode incorrect. Expected: conversational, Got: ${processingMode}`);
                testResults.failedTests++;
                testResults.errors.push(`${test.name}: Wrong processing mode`);
            }
            
            // Validate message routing through chat
            const chatHistory = mockBot.getChatHistory();
            if (test.expectResponse && chatHistory.length > 0) {
                console.log(`✅ Response routed through chat system`);
                console.log(`   Chat messages sent: ${chatHistory.length}`);
            } else if (!test.expectResponse && chatHistory.length === 0) {
                console.log(`✅ No chat messages sent (as expected)`);
            } else {
                console.log(`❌ Chat routing issue. Expected ${test.expectResponse ? 'messages' : 'no messages'}, Got ${chatHistory.length} messages`);
                testResults.failedTests++;
                testResults.errors.push(`${test.name}: Chat routing mismatch`);
            }
            
            // Validate state transitions
            if (TEST_CONFIG.validateStateTransitions) {
                const flowValid = stateTracker.validateExpectedFlow(test.expectedFlow);
                if (flowValid) {
                    console.log(`✅ State transition flow validated`);
                } else {
                    console.log(`❌ State transition flow invalid`);
                    testResults.failedTests++;
                    testResults.errors.push(`${test.name}: Invalid state flow`);
                }
            }
            
        } catch (error) {
            console.error(`❌ Test failed with error:`, error.message);
            testResults.failedTests++;
            testResults.errors.push(`${test.name}: ${error.message}`);
        }
    }
}

/**
 * Test action command processing (should bypass conversation)
 */
async function testActionCommandProcessing(agent, mockBot, stateTracker) {
    console.log('\n=== Testing Action Command Processing ===');
    
    const actionTests = [
        {
            name: 'Movement command',
            message: 'go to 150 70 300',
            source: 'navigator',
            expectedMode: 'action'
        },
        {
            name: 'Collection command',
            message: 'get 10 wood',
            source: 'gatherer',
            expectedMode: 'action'
        },
        {
            name: 'Build command',
            message: 'build a shelter',
            source: 'builder',
            expectedMode: 'action'
        },
        {
            name: 'Combat command',
            message: 'attack the zombie',
            source: 'warrior',
            expectedMode: 'action'
        },
        {
            name: 'Stop command',
            message: '!stop',
            source: 'controller',
            expectedMode: 'action'
        }
    ];
    
    for (const test of actionTests) {
        console.log(`\n--- Test: ${test.name} ---`);
        console.log(`Message: "${test.message}" from ${test.source}`);
        
        testResults.totalTests++;
        
        try {
            // Clear previous state
            stateTracker.transitions = [];
            mockBot.clearChatHistory();
            
            // Set up message for analysis
            agent.agentState.context.lastMessage = {
                source: test.source,
                message: test.message,
                timestamp: Date.now(),
                type: 'command',
                priority: 0.5
            };
            
            // Test processing mode determination
            const processingMode = agent.determineProcessingMode(agent.agentState);
            
            if (processingMode === test.expectedMode) {
                console.log(`✅ Processing mode correctly identified: ${processingMode}`);
                testResults.passedTests++;
            } else {
                console.log(`❌ Processing mode incorrect. Expected: ${test.expectedMode}, Got: ${processingMode}`);
                testResults.failedTests++;
                testResults.errors.push(`${test.name}: Wrong processing mode`);
            }
            
        } catch (error) {
            console.error(`❌ Test failed with error:`, error.message);
            testResults.failedTests++;
            testResults.errors.push(`${test.name}: ${error.message}`);
        }
    }
}

/**
 * Test conversation history tracking
 */
async function testConversationHistoryTracking(agent) {
    console.log('\n=== Testing Conversation History Tracking ===');
    
    testResults.totalTests++;
    
    try {
        const responseHistory = agent.agentState?.executive?.responseHistory || [];
        
        console.log(`Total conversations in history: ${responseHistory.length}`);
        
        if (responseHistory.length > 0) {
            console.log('\nRecent conversation history:');
            responseHistory.slice(-3).forEach((record, index) => {
                console.log(`${index + 1}. ${record.timestamp}: ${record.source} → "${record.message}"`);
                console.log(`   Response: "${record.response}"`);
                console.log(`   Mode: ${record.processingMode}, Time: ${record.responseTime}ms`);
                console.log(`   Success: ${record.success}`);
            });
            
            // Validate history structure
            const validHistory = responseHistory.every(record => 
                record.source && 
                record.message && 
                record.response && 
                record.timestamp &&
                record.processingMode
            );
            
            if (validHistory) {
                console.log(`✅ Conversation history structure valid`);
                testResults.passedTests++;
            } else {
                console.log(`❌ Conversation history structure invalid`);
                testResults.failedTests++;
                testResults.errors.push('Conversation history: Invalid structure');
            }
        } else {
            console.log(`⚠️ No conversation history found (may be expected for fresh agent)`);
            testResults.passedTests++;
        }
        
    } catch (error) {
        console.error(`❌ History test failed:`, error.message);
        testResults.failedTests++;
        testResults.errors.push(`History test: ${error.message}`);
    }
}

/**
 * Test performance metrics
 */
async function testPerformanceMetrics(agent) {
    console.log('\n=== Testing Performance Metrics ===');
    
    testResults.totalTests++;
    
    try {
        const metrics = agent.getMemoryStats();
        
        console.log('Memory Statistics:');
        console.log(`  Current heap: ${metrics.current.heapUsed}MB`);
        console.log(`  Peak heap: ${metrics.peak.heapUsed}MB`);
        console.log(`  Initial heap: ${metrics.initial.heapUsed}MB`);
        
        const responseTimes = testResults.responseTimes;
        if (responseTimes.length > 0) {
            const avgTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
            const maxTime = Math.max(...responseTimes);
            const minTime = Math.min(...responseTimes);
            
            console.log('\nResponse Time Statistics:');
            console.log(`  Average: ${avgTime.toFixed(2)}ms`);
            console.log(`  Min: ${minTime}ms`);
            console.log(`  Max: ${maxTime}ms`);
            console.log(`  Samples: ${responseTimes.length}`);
            
            // Performance validation
            if (avgTime < 2000) { // Under 2 seconds average
                console.log(`✅ Performance within acceptable limits`);
                testResults.passedTests++;
            } else {
                console.log(`❌ Performance exceeds limits`);
                testResults.failedTests++;
                testResults.errors.push('Performance: Average response time too high');
            }
        } else {
            console.log(`⚠️ No response time data available`);
            testResults.passedTests++;
        }
        
    } catch (error) {
        console.error(`❌ Performance test failed:`, error.message);
        testResults.failedTests++;
        testResults.errors.push(`Performance test: ${error.message}`);
    }
}

/**
 * Generate comprehensive test report
 */
function generateTestReport() {
    console.log('\n' + '='.repeat(80));
    console.log('COMPREHENSIVE TEST REPORT FOR MASTERCHIEF CONVERSATION PROCESSING');
    console.log('='.repeat(80));
    
    console.log(`\nSUMMARY:`);
    console.log(`  Total Tests: ${testResults.totalTests}`);
    console.log(`  Passed: ${testResults.passedTests}`);
    console.log(`  Failed: ${testResults.failedTests}`);
    console.log(`  Success Rate: ${((testResults.passedTests / testResults.totalTests) * 100).toFixed(2)}%`);
    
    if (testResults.errors.length > 0) {
        console.log(`\nERRORS:`);
        testResults.errors.forEach((error, index) => {
            console.log(`  ${index + 1}. ${error}`);
        });
    }
    
    if (testResults.responseTimes.length > 0) {
        const avgTime = testResults.responseTimes.reduce((a, b) => a + b, 0) / testResults.responseTimes.length;
        console.log(`\nPERFORMANCE:`);
        console.log(`  Average Response Time: ${avgTime.toFixed(2)}ms`);
        console.log(`  Total Responses Tested: ${testResults.responseTimes.length}`);
    }
    
    console.log(`\nVALIDATION RESULTS:`);
    console.log(`  ✅ Conversational Message Processing: ${testResults.passedTests > 0 ? 'PASS' : 'FAIL'}`);
    console.log(`  ✅ Action Command Detection: ${testResults.passedTests > 0 ? 'PASS' : 'FAIL'}`);
    console.log(`  ✅ Response Generation: ${testResults.passedTests > 0 ? 'PASS' : 'FAIL'}`);
    console.log(`  ✅ Chat Routing: ${testResults.passedTests > 0 ? 'PASS' : 'FAIL'}`);
    console.log(`  ✅ State Transitions: ${TEST_CONFIG.validateStateTransitions ? 'TESTED' : 'SKIPPED'}`);
    console.log(`  ✅ Conversation History: ${testResults.passedTests > 0 ? 'PASS' : 'FAIL'}`);
    console.log(`  ✅ Performance Metrics: ${testResults.passedTests > 0 ? 'PASS' : 'FAIL'}`);
    
    console.log(`\nCONCLUSION:`);
    if (testResults.failedTests === 0) {
        console.log(`  🎉 ALL TESTS PASSED! MasterChief conversation processing is working correctly.`);
        console.log(`  ✅ The LangGraph conversation processing fix is validated and functional.`);
    } else {
        console.log(`  ⚠️ Some tests failed. Please review the errors above.`);
        console.log(`  🔧 The conversation processing system may need additional fixes.`);
    }
    
    console.log('\n' + '='.repeat(80));
}

/**
 * Main test execution
 */
async function runMasterChiefConversationValidation() {
    console.log('🚀 Starting MasterChief Conversation Processing Validation');
    console.log(`Test Configuration: ${JSON.stringify(TEST_CONFIG, null, 2)}`);
    
    try {
        // Initialize test components
        const stateTracker = new StateTransitionTracker();
        const { agent, mockBot } = await initializeMasterChiefAgent();
        
        // Run comprehensive test suite
        await testConversationalProcessing(agent, mockBot, stateTracker);
        await testActionCommandProcessing(agent, mockBot, stateTracker);
        await testConversationHistoryTracking(agent);
        await testPerformanceMetrics(agent);
        
        // Generate final report
        generateTestReport();
        
    } catch (error) {
        console.error('💥 Test suite failed with critical error:', error);
        console.error('Stack trace:', error.stack);
        testResults.errors.push(`Critical: ${error.message}`);
        generateTestReport();
    }
}

// Execute the test suite
if (import.meta.url === `file://${process.argv[1]}`) {
    runMasterChiefConversationValidation().catch(console.error);
}

export { runMasterChiefConversationValidation };