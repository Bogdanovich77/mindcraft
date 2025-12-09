/**
 * Final Integration Validation Test for LangGraph Conversation Processing
 * 
 * This test validates the complete conversation processing system with the exact
 * examples that were failing in the original problem:
 * - "say hi to john_goodman"
 * - "work together with the other bot to build a house"
 * - "trade something with zorro_34"
 */

const { LangGraphAgentLoader } = require('./src/agent/langgraph_agent_loader.js');
const fs = require('fs');

// Test configuration
const TEST_CONFIG = {
    timeout: 5000,
    verbose: true,
    mockPrompter: true
};

// Test cases based on original problem examples
const TEST_CASES = [
    {
        name: "Simple Greeting",
        message: "say hi to john_goodman",
        source: "system",
        expectedType: "conversational",
        shouldGenerateResponse: true,
        responseLengthMin: 5
    },
    {
        name: "Collaborative Building",
        message: "work together with the other bot to build a house",
        source: "user",
        expectedType: "conversational",
        shouldGenerateResponse: true,
        responseLengthMin: 10
    },
    {
        name: "Trading Request",
        message: "trade something with zorro_34",
        source: "player",
        expectedType: "conversational",
        shouldGenerateResponse: true,
        responseLengthMin: 5
    },
    {
        name: "Action Command",
        message: "go to the village",
        source: "user",
        expectedType: "action",
        shouldGenerateResponse: false,
        shouldQueueAction: true
    },
    {
        name: "Mixed Conversation and Action",
        message: "hi! can you help me build a shelter?",
        source: "player",
        expectedType: "conversational",
        shouldGenerateResponse: true,
        responseLengthMin: 10
    },
    {
        name: "Emergency During Conversation",
        message: "help! I'm being attacked!",
        source: "player",
        expectedType: "conversational",
        shouldGenerateResponse: true,
        responseLengthMin: 5,
        isUrgent: true
    }
];

// Mock profile for testing
const MOCK_PROFILE = {
    name: "TestAgent",
    behavior: {
        reactiveModes: {},
        adaptationRate: 0.1
    },
    purposeCore: {
        personality: {
            traits: {
                openness: 0.7,
                conscientiousness: 0.6,
                extraversion: 0.8,
                agreeableness: 0.9,
                neuroticism: 0.3,
                riskTolerance: 0.5,
                explorationDrive: 0.6,
                socialTendency: 0.8,
                buildingCreativity: 0.5,
                combatAggression: 0.2
            }
        },
        motivations: {
            primaryMotivation: "social",
            secondaryMotivations: ["exploration", "building"]
        },
        values: {
            coreValues: ["cooperation", "creativity", "helpfulness"]
        },
        ethics: {
            harmAvoidance: 0.8,
            fairnessConcern: 0.9,
            loyaltyPriority: 0.7
        }
    }
};

// Mock bot for testing
const MOCK_BOT = {
    entity: {
        position: { x: 0, y: 64, z: 0 }
    },
    health: 20,
    food: 20,
    game: {
        dimension: "overworld"
    },
    time: {
        timeOfDay: 6000
    },
    inventory: {
        items: () => []
    },
    chat: (message) => {
        console.log(`[MOCK_CHAT] ${message}`);
    }
};

// Mock prompter for testing
class MockPrompter {
    constructor(agent, profile) {
        this.agent = agent;
        this.profile = profile;
        this.responses = {
            "say hi to john_goodman": "Hello john_goodman! Nice to meet you!",
            "work together with the other bot to build a house": "I'd love to help build a house together! Let's gather some materials first.",
            "trade something with zorro_34": "Sure! I can trade with zorro_34. What would you like to trade?",
            "hi! can you help me build a shelter?": "Hi there! I'd be happy to help you build a shelter. Let's find a good spot first.",
            "help! i'm being attacked!": "Help is on the way! I'll come assist you immediately!"
        };
    }

    async initExamples() {
        console.log("[MOCK_PROMPTER] Initialized with examples");
    }

    async promptConvo(history) {
        const lastMessage = history[history.length - 1]?.content || "";
        
        // Find matching response or generate default
        for (const [pattern, response] of Object.entries(this.responses)) {
            if (lastMessage.toLowerCase().includes(pattern.toLowerCase())) {
                return response;
            }
        }
        
        // Default response
        return "That's interesting! I'm here to help and learn. What would you like to do?";
    }
}

/**
 * Test runner class for comprehensive validation
 */
class ConversationIntegrationTest {
    constructor() {
        this.agent = null;
        this.testResults = [];
        this.startTime = Date.now();
    }

    async initialize() {
        console.log("=== Initializing LangGraph Agent for Testing ===");
        
        try {
            // Create agent using loader
            const loader = new LangGraphAgentLoader();
            
            // Load agent with mock profile
            this.agent = await loader.loadAgent(MOCK_PROFILE);
            
            // Override prompter with mock
            this.agent.prompter = new MockPrompter(this.agent, MOCK_PROFILE);
            
            // Override bot with mock
            this.agent.bot = MOCK_BOT;
            
            // Initialize agent state
            if (this.agent.initializeAgentState) {
                this.agent.initializeAgentState();
            }
            
            console.log("✅ Agent initialized successfully");
            return true;
            
        } catch (error) {
            console.error("❌ Failed to initialize agent:", error);
            return false;
        }
    }

    async runAllTests() {
        console.log("\n=== Running Final Integration Validation Tests ===");
        
        for (const testCase of TEST_CASES) {
            await this.runSingleTest(testCase);
        }
        
        this.generateFinalReport();
    }

    async runSingleTest(testCase) {
        console.log(`\n--- Testing: ${testCase.name} ---`);
        console.log(`Message: "${testCase.message}" from ${testCase.source}`);
        
        const testResult = {
            name: testCase.name,
            message: testCase.message,
            source: testCase.source,
            startTime: Date.now(),
            success: false,
            errors: [],
            responseGenerated: false,
            responseContent: null,
            processingTime: 0,
            stateChanges: {}
        };

        try {
            // Reset agent state before test
            if (this.agent.agentState) {
                this.agent.agentState.context.lastMessage = undefined;
                this.agent.agentState.executive.conversationalResponse = undefined;
                this.agent.agentState.executive.processingMode = 'action';
            }
            
            // Test message handling
            const messageStartTime = Date.now();
            
            // Use agent's message handling method
            if (this.agent.handleMessage) {
                await this.agent.handleMessage(testCase.source, testCase.message);
            } else if (this.agent.testConversationProcessing) {
                await this.agent.testConversationProcessing(testCase.message, testCase.source);
            } else {
                throw new Error("Agent does not have message handling methods");
            }
            
            testResult.processingTime = Date.now() - messageStartTime;
            
            // Validate results
            await this.validateTestResults(testCase, testResult);
            
        } catch (error) {
            testResult.errors.push(`Test execution error: ${error.message}`);
            console.error(`❌ Test failed with error:`, error);
        }
        
        testResult.endTime = Date.now();
        this.testResults.push(testResult);
        
        // Log test result
        if (testResult.success) {
            console.log("✅ Test PASSED");
            if (testResult.responseGenerated) {
                console.log(`   Response: "${testResult.responseContent}"`);
                console.log(`   Processing time: ${testResult.processingTime}ms`);
            }
        } else {
            console.log("❌ Test FAILED");
            testResult.errors.forEach(error => console.log(`   Error: ${error}`));
        }
    }

    async validateTestResults(testCase, testResult) {
        // Get agent state
        const state = this.agent.agentState || this.agent.getState();
        
        if (!state) {
            testResult.errors.push("Agent state is not available");
            return;
        }
        
        // Check processing mode
        const expectedMode = testCase.expectedType;
        const actualMode = state.executive?.processingMode;
        
        if (actualMode !== expectedMode) {
            testResult.errors.push(`Expected processing mode: ${expectedMode}, got: ${actualMode}`);
        }
        
        // Check response generation
        if (testCase.shouldGenerateResponse) {
            const response = state.executive?.conversationalResponse;
            const lastResponse = state.executive?.lastResponse;
            
            if (!response && !lastResponse) {
                testResult.errors.push("Expected conversational response but none was generated");
            } else {
                testResult.responseGenerated = true;
                testResult.responseContent = response || lastResponse?.response;
                
                // Check response length
                if (testCase.responseLengthMin && testResult.responseContent.length < testCase.responseLengthMin) {
                    testResult.errors.push(`Response too short: expected min ${testCase.responseLengthMin}, got ${testResult.responseContent.length}`);
                }
                
                // Check for empty response (original problem)
                if (!testResult.responseContent || testResult.responseContent.trim() === "") {
                    testResult.errors.push("Generated empty response - ORIGINAL BUG REPRODUCED");
                }
            }
        } else {
            // For action commands, check that no conversational response was generated
            const response = state.executive?.conversationalResponse;
            if (response) {
                testResult.errors.push("Unexpected conversational response for action command");
            }
        }
        
        // Check action queue for action commands
        if (testCase.shouldQueueAction) {
            const actionQueue = state.executive?.actionQueue;
            if (!actionQueue || actionQueue.length === 0) {
                testResult.errors.push("Expected action to be queued but queue is empty");
            }
        }
        
        // Check response history
        const responseHistory = state.executive?.responseHistory;
        if (testCase.shouldGenerateResponse && (!responseHistory || responseHistory.length === 0)) {
            testResult.errors.push("Expected response history entry but none found");
        }
        
        // Check processing time requirements
        if (testResult.processingTime > 2000) {
            testResult.errors.push(`Processing time exceeded 2s limit: ${testResult.processingTime}ms`);
        }
        
        // Test passed if no errors
        testResult.success = testResult.errors.length === 0;
    }

    generateFinalReport() {
        console.log("\n" + "=".repeat(60));
        console.log("FINAL INTEGRATION VALIDATION REPORT");
        console.log("=".repeat(60));
        
        const totalTests = this.testResults.length;
        const passedTests = this.testResults.filter(t => t.success).length;
        const failedTests = totalTests - passedTests;
        
        console.log(`\nTest Summary:`);
        console.log(`  Total tests: ${totalTests}`);
        console.log(`  Passed: ${passedTests} ✅`);
        console.log(`  Failed: ${failedTests} ❌`);
        console.log(`  Success rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
        
        // Performance metrics
        const avgProcessingTime = this.testResults.reduce((sum, t) => sum + t.processingTime, 0) / totalTests;
        console.log(`\nPerformance Metrics:`);
        console.log(`  Average processing time: ${avgProcessingTime.toFixed(2)}ms`);
        console.log(`  Fastest response: ${Math.min(...this.testResults.map(t => t.processingTime))}ms`);
        console.log(`  Slowest response: ${Math.max(...this.testResults.map(t => t.processingTime))}ms`);
        
        // Original problem validation
        console.log(`\nOriginal Problem Validation:`);
        const originalProblemTests = this.testResults.filter(t => 
            t.message.includes("say hi") || 
            t.message.includes("work together") || 
            t.message.includes("trade")
        );
        
        const originalProblemFixed = originalProblemTests.every(t => 
            t.success && t.responseGenerated && t.responseContent && t.responseContent.trim() !== ""
        );
        
        if (originalProblemFixed) {
            console.log("  ✅ ORIGINAL ISSUE RESOLVED: All original problem examples now generate proper responses");
        } else {
            console.log("  ❌ ORIGINAL ISSUE PERSISTS: Some original problem examples still fail");
            originalProblemTests.filter(t => !t.success).forEach(t => {
                console.log(`     Failed: "${t.message}" - ${t.errors.join(", ")}`);
            });
        }
        
        // Detailed results
        console.log(`\nDetailed Results:`);
        this.testResults.forEach(test => {
            const status = test.success ? "✅" : "❌";
            console.log(`  ${status} ${test.name}: ${test.processingTime}ms`);
            if (test.responseGenerated) {
                console.log(`     Response: "${test.responseContent}"`);
            }
            if (!test.success) {
                test.errors.forEach(error => console.log(`     Error: ${error}`));
            }
        });
        
        // Final verdict
        console.log(`\n${"=".repeat(60)}`);
        if (originalProblemFixed && failedTests === 0) {
            console.log("🎉 ALL TESTS PASSED - CONVERSATION PROCESSING FULLY VALIDATED");
            console.log("   The LangGraph agent now properly handles conversational messages");
            console.log("   and generates appropriate responses instead of empty strings.");
        } else if (originalProblemFixed) {
            console.log("⚠️  ORIGINAL ISSUE FIXED but some additional tests failed");
            console.log("   The core conversation processing works, but some edge cases need attention.");
        } else {
            console.log("❌ CRITICAL ISSUE - Original problem not fully resolved");
            console.log("   The conversation processing system still has fundamental issues.");
        }
        console.log("=".repeat(60));
        
        // Save report to file
        this.saveReportToFile();
    }

    saveReportToFile() {
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                totalTests: this.testResults.length,
                passedTests: this.testResults.filter(t => t.success).length,
                failedTests: this.testResults.filter(t => !t.success).length,
                successRate: (this.testResults.filter(t => t.success).length / this.testResults.length * 100).toFixed(1)
            },
            performance: {
                averageProcessingTime: this.testResults.reduce((sum, t) => sum + t.processingTime, 0) / this.testResults.length,
                fastestResponse: Math.min(...this.testResults.map(t => t.processingTime)),
                slowestResponse: Math.max(...this.testResults.map(t => t.processingTime))
            },
            originalProblemValidation: {
                fixed: this.testResults.filter(t => 
                    t.message.includes("say hi") || 
                    t.message.includes("work together") || 
                    t.message.includes("trade")
                ).every(t => t.success && t.responseGenerated && t.responseContent && t.responseContent.trim() !== "")
            },
            detailedResults: this.testResults
        };
        
        try {
            fs.writeFileSync('FINAL_INTEGRATION_VALIDATION_REPORT.json', JSON.stringify(report, null, 2));
            console.log(`\n📄 Detailed report saved to: FINAL_INTEGRATION_VALIDATION_REPORT.json`);
        } catch (error) {
            console.error("Failed to save report:", error);
        }
    }
}

/**
 * Main test execution
 */
async function runFinalIntegrationValidation() {
    console.log("🚀 Starting Final Integration Validation for LangGraph Conversation Processing");
    console.log("This test validates the fix for the original problem where agents generated");
    console.log("empty responses for conversational messages like 'say hi to john_goodman'\n");
    
    const test = new ConversationIntegrationTest();
    
    // Initialize test environment
    if (!await test.initialize()) {
        console.error("❌ Failed to initialize test environment");
        process.exit(1);
    }
    
    // Run all tests
    await test.runAllTests();
    
    console.log("\n🏁 Final Integration Validation Complete");
}

// Run tests if this file is executed directly
if (require.main === module) {
    runFinalIntegrationValidation().catch(error => {
        console.error("Test execution failed:", error);
        process.exit(1);
    });
}

module.exports = { ConversationIntegrationTest, runFinalIntegrationValidation };