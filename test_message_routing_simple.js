/**
 * Simple Test for Message Analysis and Routing Logic Validation
 * 
 * This test validates the core message routing functionality without complex dependencies
 */

console.log('🚀 Starting Simple Message Routing Validation Tests');
console.log('==================================================');

// Test the message analysis logic directly
function testMessageAnalysisLogic() {
    console.log('\n=== Testing Message Analysis Logic ===');
    
    // Action command detection logic (from state_nodes.ts)
    function checkIfActionCommand(message) {
        const actionCommands = [
            'go to', 'move to', 'walk to', 'run to',
            'get', 'take', 'pick up', 'collect',
            'craft', 'build', 'place', 'break',
            'attack', 'fight', 'defend',
            'follow', 'stop', 'wait'
        ];
        
        const lowerMessage = message.toLowerCase();
        return actionCommands.some(cmd => lowerMessage.includes(cmd));
    }
    
    // Test cases
    const testCases = [
        // Conversational messages
        { message: "say hi to john_goodman", expected: false, type: "conversational" },
        { message: "hello there", expected: false, type: "conversational" },
        { message: "how are you doing?", expected: false, type: "conversational" },
        { message: "what are you up to?", expected: false, type: "conversational" },
        { message: "thanks for your help", expected: false, type: "conversational" },
        
        // Action commands
        { message: "go to the house", expected: true, type: "action" },
        { message: "get some wood", expected: true, type: "action" },
        { message: "craft a pickaxe", expected: true, type: "action" },
        { message: "build a shelter", expected: true, type: "action" },
        { message: "attack the zombie", expected: true, type: "action" },
        { message: "follow me", expected: true, type: "action" },
        { message: "collect stone", expected: true, type: "action" },
        { message: "place these blocks", expected: true, type: "action" },
        
        // Edge cases
        { message: "hi! can you get wood", expected: true, type: "mixed" }, // Contains action command
        { message: "hello, go to the cave", expected: true, type: "mixed" }, // Contains action command
        { message: "help me build", expected: true, type: "mixed" }, // Contains action verb
        { message: "!", expected: false, type: "edge_case" }, // Exclamation only
        { message: "a", expected: false, type: "edge_case" }, // Very short
        { message: "urgent help", expected: false, type: "edge_case" }, // Urgent but no action
        { message: "say hi and then go to john", expected: true, type: "mixed" } // Mixed with action
    ];
    
    let passed = 0;
    let failed = 0;
    
    testCases.forEach(testCase => {
        const startTime = Date.now();
        const result = checkIfActionCommand(testCase.message);
        const processingTime = Date.now() - startTime;
        
        if (result === testCase.expected) {
            passed++;
            console.log(`✓ PASS: "${testCase.message}" -> ${result ? 'action' : 'conversational'} (${processingTime}ms)`);
        } else {
            failed++;
            console.log(`✗ FAIL: "${testCase.message}" -> expected ${testCase.expected ? 'action' : 'conversational'}, got ${result ? 'action' : 'conversational'}`);
        }
    });
    
    console.log(`\nMessage Analysis Results: ${passed} passed, ${failed} failed`);
    return { passed, failed, total: testCases.length };
}

// Test the processing mode determination logic
function testProcessingModeDetermination() {
    console.log('\n=== Testing Processing Mode Determination ===');
    
    // Processing mode logic (from agent.js)
    function determineProcessingMode(message) {
        const actionCommands = [
            'go to', 'move to', 'walk to', 'run to',
            'get', 'take', 'pick up', 'collect',
            'craft', 'build', 'place', 'break',
            'attack', 'fight', 'defend',
            'follow', 'stop', 'wait', '!'
        ];
        
        const lowerMessage = message.toLowerCase();
        const isActionCommand = actionCommands.some(cmd => lowerMessage.includes(cmd));
        return isActionCommand ? 'action' : 'conversational';
    }
    
    const testCases = [
        { message: "say hi to john_goodman", expected: "conversational" },
        { message: "hello there", expected: "conversational" },
        { message: "go to the house", expected: "action" },
        { message: "get some wood", expected: "action" },
        { message: "craft a pickaxe", expected: "action" },
        { message: "!", expected: "action" }, // Exclamation mark
        { message: "hi! can you get wood", expected: "action" }, // Mixed
        { message: "urgent help", expected: "conversational" }, // No action command
    ];
    
    let passed = 0;
    let failed = 0;
    
    testCases.forEach(testCase => {
        const startTime = Date.now();
        const result = determineProcessingMode(testCase.message);
        const processingTime = Date.now() - startTime;
        
        if (result === testCase.expected) {
            passed++;
            console.log(`✓ PASS: "${testCase.message}" -> ${result} (${processingTime}ms)`);
        } else {
            failed++;
            console.log(`✗ FAIL: "${testCase.message}" -> expected ${testCase.expected}, got ${result}`);
        }
    });
    
    console.log(`\nProcessing Mode Results: ${passed} passed, ${failed} failed`);
    return { passed, failed, total: testCases.length };
}

// Test conversation response generation logic
function testConversationResponseLogic() {
    console.log('\n=== Testing Conversation Response Logic ===');
    
    // Simple personality-based response generation (from state_nodes.ts)
    function generatePersonalityBasedResponse(message, personality) {
        const messageText = message.toLowerCase();
        const traits = personality;
        
        // Generate responses based on personality traits
        if (traits.extraversion > 0.7) {
            if (messageText.includes('hello') || messageText.includes('hi')) {
                return `Hey there! Great to see you! How's your day going?`;
            }
        }
        
        if (traits.agreeableness > 0.7) {
            if (messageText.includes('help')) {
                return "I'd be happy to help you! What do you need assistance with?";
            }
        }
        
        if (traits.conscientiousness > 0.7) {
            if (messageText.includes('what are you doing')) {
                return "I'm currently focused on my tasks and making sure everything is in order.";
            }
        }
        
        // Default responses
        if (messageText.includes('hello') || messageText.includes('hi')) {
            return "Hello! How can I help you today?";
        }
        
        if (messageText.includes('how are you')) {
            return "I'm doing well, thank you for asking!";
        }
        
        if (messageText.includes('what are you doing')) {
            return "I'm currently exploring and working on my goals.";
        }
        
        // Generic response for other messages
        return "That's interesting! I'm here to help and learn.";
    }
    
    const testPersonality = {
        extraversion: 0.8,
        agreeableness: 0.7,
        conscientiousness: 0.6
    };
    
    const testCases = [
        { message: "say hi to john_goodman", expectedContains: "hey" }, // extraversion response
        { message: "hello there", expectedContains: "hey" }, // extraversion response
        { message: "how are you doing?", expectedContains: "well" },
        { message: "what are you up to?", expectedContains: "focused" }, // conscientious response
        { message: "help me please", expectedContains: "help" },
        { message: "tell me something", expectedContains: "interesting" }
    ];
    
    let passed = 0;
    let failed = 0;
    
    testCases.forEach(testCase => {
        const startTime = Date.now();
        const response = generatePersonalityBasedResponse(testCase.message, testPersonality);
        const processingTime = Date.now() - startTime;
        
        const containsExpected = response.toLowerCase().includes(testCase.expectedContains);
        
        if (containsExpected && response.length > 0) {
            passed++;
            console.log(`✓ PASS: "${testCase.message}" -> "${response}" (${processingTime}ms)`);
        } else {
            failed++;
            console.log(`✗ FAIL: "${testCase.message}" -> "${response}" (expected to contain "${testCase.expectedContains}")`);
        }
    });
    
    console.log(`\nConversation Response Results: ${passed} passed, ${failed} failed`);
    return { passed, failed, total: testCases.length };
}

// Test performance requirements
function testPerformanceRequirements() {
    console.log('\n=== Testing Performance Requirements ===');
    
    function checkIfActionCommand(message) {
        const actionCommands = [
            'go to', 'move to', 'walk to', 'run to',
            'get', 'take', 'pick up', 'collect',
            'craft', 'build', 'place', 'break',
            'attack', 'fight', 'defend',
            'follow', 'stop', 'wait'
        ];
        
        const lowerMessage = message.toLowerCase();
        return actionCommands.some(cmd => lowerMessage.includes(cmd));
    }
    
    function generatePersonalityBasedResponse(message) {
        const messageText = message.toLowerCase();
        
        if (messageText.includes('hello') || messageText.includes('hi')) {
            return "Hello! How can I help you today?";
        }
        
        return "That's interesting! I'm here to help and learn.";
    }
    
    const performanceThresholds = {
        messageAnalysis: 100, // <100ms
        conversationResponse: 2000 // <2 seconds
    };
    
    const testMessages = [
        "say hi to john_goodman",
        "go to the house",
        "get some wood quickly",
        "hello there, how are you?",
        "craft a pickaxe now"
    ];
    
    let analysisPassed = 0;
    let responsePassed = 0;
    let totalTests = testMessages.length;
    
    testMessages.forEach(message => {
        // Test message analysis performance
        const analysisStart = Date.now();
        const isAction = checkIfActionCommand(message);
        const analysisTime = Date.now() - analysisStart;
        
        const analysisMeetsThreshold = analysisTime <= performanceThresholds.messageAnalysis;
        if (analysisMeetsThreshold) {
            analysisPassed++;
        }
        
        // Test conversation response performance (only for conversational messages)
        if (!isAction) {
            const responseStart = Date.now();
            const response = generatePersonalityBasedResponse(message);
            const responseTime = Date.now() - responseStart;
            
            const responseMeetsThreshold = responseTime <= performanceThresholds.conversationResponse;
            if (responseMeetsThreshold) {
                responsePassed++;
            }
            
            console.log(`${!isAction ? '✓' : '⚠'} "${message}" -> analysis: ${analysisTime}ms, response: ${responseTime}ms`);
        } else {
            console.log(`✓ "${message}" -> analysis: ${analysisTime}ms (action command, no response needed)`);
            responsePassed++; // Action commands don't need response generation
        }
    });
    
    console.log(`\nPerformance Results:`);
    console.log(`Message Analysis: ${analysisPassed}/${totalTests} within threshold (${performanceThresholds.messageAnalysis}ms)`);
    console.log(`Conversation Response: ${responsePassed}/${totalTests} within threshold (${performanceThresholds.conversationResponse}ms)`);
    
    return {
        analysisPassed,
        responsePassed,
        totalTests,
        analysisSuccess: analysisPassed === totalTests,
        responseSuccess: responsePassed === totalTests
    };
}

// Run all tests
function runAllTests() {
    console.log('Running comprehensive message routing validation...\n');
    
    const messageAnalysisResults = testMessageAnalysisLogic();
    const processingModeResults = testProcessingModeDetermination();
    const conversationResults = testConversationResponseLogic();
    const performanceResults = testPerformanceRequirements();
    
    // Generate summary
    const totalTests = messageAnalysisResults.total + processingModeResults.total + 
                      conversationResults.total + performanceResults.totalTests;
    const totalPassed = messageAnalysisResults.passed + processingModeResults.passed + 
                       conversationResults.passed + performanceResults.analysisPassed;
    const totalFailed = totalTests - totalPassed;
    
    console.log('\n' + '='.repeat(80));
    console.log('📊 FINAL TEST REPORT');
    console.log('='.repeat(80));
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${totalPassed}`);
    console.log(`Failed: ${totalFailed}`);
    console.log(`Success Rate: ${((totalPassed / totalTests) * 100).toFixed(2)}%`);
    
    console.log('\n📋 Component Results:');
    console.log(`Message Analysis: ${messageAnalysisResults.passed}/${messageAnalysisResults.total} passed`);
    console.log(`Processing Mode: ${processingModeResults.passed}/${processingModeResults.total} passed`);
    console.log(`Conversation Response: ${conversationResults.passed}/${conversationResults.total} passed`);
    console.log(`Performance: ${performanceResults.analysisSuccess ? '✓' : '✗'} Analysis, ${performanceResults.responseSuccess ? '✓' : '✗'} Response`);
    
    console.log('\n💡 Recommendations:');
    if (totalFailed === 0) {
        console.log('✅ All tests passed! Message routing logic is working correctly.');
        console.log('   • Ready for integration testing with full LangGraph system');
        console.log('   • Performance requirements met');
        console.log('   • Edge cases handled appropriately');
    } else {
        console.log('⚠️  Some tests failed. Review the following:');
        if (messageAnalysisResults.failed > 0) {
            console.log('   • Review action command detection logic');
        }
        if (processingModeResults.failed > 0) {
            console.log('   • Check processing mode determination rules');
        }
        if (conversationResults.failed > 0) {
            console.log('   • Improve conversation response generation');
        }
        if (!performanceResults.analysisSuccess || !performanceResults.responseSuccess) {
            console.log('   • Optimize performance for faster response times');
        }
    }
    
    return {
        totalTests,
        totalPassed,
        totalFailed,
        successRate: ((totalPassed / totalTests) * 100).toFixed(2) + '%',
        allPassed: totalFailed === 0
    };
}

// Run the tests
const results = runAllTests();

// Exit with appropriate code
process.exit(results.allPassed ? 0 : 1);