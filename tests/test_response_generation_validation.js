/**
 * Comprehensive Test for Response Generation and Routing Mechanism
 * LangGraph Agent Conversation Processing Validation
 *
 * This test validates:
 * 1. Response generation with personality-driven responses
 * 2. Contextually appropriate responses
 * 3. Prompter system integration
 * 4. Response routing back to users
 * 5. Response history and context management
 * 6. Performance validation (<2 seconds for conversational)
 * 7. Complete message flow integration
 * 8. Original problem examples ("say hi to john_goodman")
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test configuration
const TEST_CONFIG = {
    timeout: 30000,
    performanceThresholds: {
        responseGeneration: 2000, // 2 seconds max for conversational responses
        messageRouting: 100,       // 100ms max for routing
        memoryUsage: 100 * 1024 * 1024 // 100MB max memory usage
    },
    testScenarios: [
        {
            name: 'Simple Greeting',
            message: 'hello',
            source: 'test_user',
            expectedType: 'conversational',
            minResponseLength: 5
        },
        {
            name: 'Personal Greeting to User',
            message: 'say hi to john_goodman',
            source: 'test_user',
            expectedType: 'conversational',
            minResponseLength: 10,
            shouldContain: ['john_goodman', 'hi']
        },
        {
            name: 'Help Request',
            message: 'can you help me find wood?',
            source: 'test_user',
            expectedType: 'conversational',
            shouldContain: ['help', 'wood']
        },
        {
            name: 'Action Command',
            message: 'go to the forest',
            source: 'test_user',
            expectedType: 'action',
            shouldNotRoute: true
        },
        {
            name: 'Complex Conversation',
            message: 'how are you doing today? I noticed you were building something earlier.',
            source: 'test_user',
            expectedType: 'conversational',
            minResponseLength: 15
        },
        {
            name: 'Urgent Message',
            message: 'help! I need assistance urgently!',
            source: 'test_user',
            expectedType: 'conversational',
            priority: 0.9
        }
    ]
};

// Mock implementations for testing
class MockPrompter {
    constructor(agent, profile) {
        this.agent = agent;
        this.profile = profile;
        this.callCount = 0;
        this.responses = [
            "Hello! I'm doing well, thank you for asking.",
            "Hi john_goodman! Great to see you! How can I help you today?",
            "I'd be happy to help you find wood! Let me look around for some trees.",
            "I'm currently exploring and working on my goals. What brings you here?",
            "I'm doing great! I was working on a shelter earlier. How about you?",
            "I hear you need urgent help! I'm on my way to assist you right now!"
        ];
    }

    async initExamples() {
        // Mock initialization
        return Promise.resolve();
    }

    async promptConvo(history) {
        this.callCount++;
        const responseIndex = (this.callCount - 1) % this.responses.length;
        return this.responses[responseIndex];
    }
}

class MockBot {
    constructor() {
        this.chat = {
            send: (message) => {
                console.log(`[MOCK CHAT] ${message}`);
            }
        };
        this.entity = {
            position: { x: 0, y: 64, z: 0 }
        };
        this.health = 20;
        this.food = 20;
        this.inventory = {
            items: () => []
        };
        this.entities = {};
        this.time = { timeOfDay: 6000 };
        this.game = { dimension: 'overworld' };
        
        // Event system
        this.eventHandlers = {};
    }

    on(event, handler) {
        if (!this.eventHandlers[event]) {
            this.eventHandlers[event] = [];
        }
        this.eventHandlers[event].push(handler);
    }

    emit(event, ...args) {
        if (this.eventHandlers[event]) {
            this.eventHandlers[event].forEach(handler => handler(...args));
        }
    }

    // Mock chat functionality
    chat(message) {
        this.emit('chat', 'test_user', message);
    }
}

class MockPurposeCore {
    constructor(options) {
        this.options = options;
        this.state = {
            personality: {
                openness: 0.7,
                conscientiousness: 0.8,
                extraversion: 0.6,
                agreeableness: 0.9,
                neuroticism: 0.3,
                riskTolerance: 0.5,
                explorationDrive: 0.7,
                socialTendency: 0.8,
                buildingCreativity: 0.6,
                combatAggression: 0.2
            }
        };
    }

    getState() {
        return this.state;
    }

    isReady() {
        return true;
    }

    async processCognitive(input) {
        return {
            selectedAction: null,
            reasoning: 'Mock cognitive processing'
        };
    }

    processOutcome(action, outcome, context) {
        // Mock outcome processing
    }
}

// Test utilities
class TestValidator {
    constructor() {
        this.results = [];
        this.startTime = Date.now();
        this.memoryUsage = process.memoryUsage();
    }

    addResult(testName, passed, details = {}) {
        this.results.push({
            testName,
            passed,
            details,
            timestamp: Date.now() - this.startTime
        });
    }

    validateResponse(response, expected) {
        const issues = [];

        if (expected.minResponseLength && response.length < expected.minResponseLength) {
            issues.push(`Response too short: ${response.length} < ${expected.minResponseLength}`);
        }

        if (expected.shouldContain) {
            expected.shouldContain.forEach(term => {
                if (!response.toLowerCase().includes(term.toLowerCase())) {
                    issues.push(`Response should contain: ${term}`);
                }
            });
        }

        if (expected.shouldNotContain) {
            expected.shouldNotContain.forEach(term => {
                if (response.toLowerCase().includes(term.toLowerCase())) {
                    issues.push(`Response should not contain: ${term}`);
                }
            });
        }

        return issues;
    }

    validatePerformance(duration, threshold) {
        return duration <= threshold;
    }

    validateMemoryUsage() {
        const currentUsage = process.memoryUsage();
        const heapUsed = currentUsage.heapUsed - this.memoryUsage.heapUsed;
        return heapUsed <= TEST_CONFIG.performanceThresholds.memoryUsage;
    }

    generateReport() {
        const passed = this.results.filter(r => r.passed).length;
        const total = this.results.length;
        const passRate = total > 0 ? (passed / total * 100).toFixed(2) : 0;

        const report = {
            summary: {
                total,
                passed,
                failed: total - passed,
                passRate: `${passRate}%`,
                duration: Date.now() - this.startTime,
                memoryUsage: process.memoryUsage()
            },
            results: this.results,
            performance: {
                memoryValidation: this.validateMemoryUsage(),
                thresholds: TEST_CONFIG.performanceThresholds
            }
        };

        return report;
    }
}

// Main test class
class ResponseGenerationValidator {
    constructor() {
        this.validator = new TestValidator();
        this.agent = null;
        this.testProfile = this.createTestProfile();
    }

    createTestProfile() {
        return {
            name: 'TestAgent',
            behavior: {
                reactiveModes: {},
                adaptationRate: 0.1
            },
            purposeCore: {
                personality: {
                    traits: {
                        openness: 0.7,
                        conscientiousness: 0.8,
                        extraversion: 0.6,
                        agreeableness: 0.9,
                        neuroticism: 0.3
                    }
                }
            }
        };
    }

    async initializeAgent() {
        try {
            // Import LangGraphAgent
            const { LangGraphAgent } = await import('./src/agent/langgraph/agent.js');
            
            this.agent = new LangGraphAgent();
            
            // Override prompter with mock
            const originalStart = this.agent.start.bind(this.agent);
            this.agent.start = async (options = {}) => {
                await originalStart(options);
                this.agent.prompter = new MockPrompter(this.agent, this.agent.profile);
            };

            // Initialize with mock bot
            const mockBot = new MockBot();
            this.agent.bot = mockBot;
            
            await this.agent.start({ profile: this.testProfile });
            
            // Initialize agent state manually for testing
            this.agent.initializeAgentState();
            
            console.log('✅ LangGraph agent initialized successfully');
            return true;
            
        } catch (error) {
            console.error('❌ Failed to initialize agent:', error);
            return false;
        }
    }

    async testConversationProcessing() {
        console.log('\n=== Testing Conversation Processing ===');
        
        for (const scenario of TEST_CONFIG.testScenarios) {
            console.log(`\nTesting: ${scenario.name}`);
            console.log(`Message: "${scenario.message}" from ${scenario.source}`);
            
            const startTime = Date.now();
            let response = null;
            let error = null;
            
            try {
                // Test message processing
                await this.agent.handleMessage(scenario.source, scenario.message);
                
                // Check if response was generated
                const lastResponse = this.agent.agentState.executive.lastResponse;
                if (lastResponse) {
                    response = lastResponse.response;
                }
                
                const duration = Date.now() - startTime;
                
                // Validate response
                const issues = this.validator.validateResponse(response, scenario);
                const performanceOk = this.validator.validatePerformance(
                    duration, 
                    TEST_CONFIG.performanceThresholds.responseGeneration
                );
                
                // Validate processing mode
                const processingMode = this.agent.agentState.executive.processingMode;
                const modeCorrect = processingMode === scenario.expectedType;
                
                const testPassed = issues.length === 0 && performanceOk && modeCorrect && response !== null;
                
                this.validator.addResult(
                    `Conversation: ${scenario.name}`,
                    testPassed,
                    {
                        message: scenario.message,
                        response,
                        duration,
                        processingMode,
                        expectedMode: scenario.expectedType,
                        issues,
                        performanceOk,
                        responseHistory: this.agent.agentState.executive.responseHistory.length
                    }
                );
                
                if (testPassed) {
                    console.log(`✅ Passed: Response generated in ${duration}ms`);
                    console.log(`   Response: "${response}"`);
                } else {
                    console.log(`❌ Failed: ${issues.join(', ')}`);
                    if (!performanceOk) {
                        console.log(`   Performance: ${duration}ms > ${TEST_CONFIG.performanceThresholds.responseGeneration}ms`);
                    }
                    if (!modeCorrect) {
                        console.log(`   Mode: ${processingMode} != ${scenario.expectedType}`);
                    }
                }
                
            } catch (err) {
                error = err;
                const duration = Date.now() - startTime;
                
                this.validator.addResult(
                    `Conversation: ${scenario.name}`,
                    false,
                    {
                        message: scenario.message,
                        error: error.message,
                        duration,
                        stack: error.stack
                    }
                );
                
                console.log(`❌ Failed with error: ${error.message}`);
            }
        }
    }

    async testResponseRouting() {
        console.log('\n=== Testing Response Routing ===');
        
        const testMessage = 'hello routing test';
        const testSource = 'routing_test_user';
        
        // Mock the routeResponse method to capture calls
        let routedResponse = null;
        let routedSource = null;
        
        const originalRouteResponse = this.agent.routeResponse.bind(this.agent);
        this.agent.routeResponse = async (source, response) => {
            routedResponse = response;
            routedSource = source;
            console.log(`[ROUTE MOCK] Routing to ${source}: "${response}"`);
            return originalRouteResponse(source, response);
        };
        
        try {
            const startTime = Date.now();
            
            // Send test message
            await this.agent.handleMessage(testSource, testMessage);
            
            const duration = Date.now() - startTime;
            
            // Validate routing
            const routingWorked = routedResponse !== null && routedSource === testSource;
            const performanceOk = this.validator.validatePerformance(
                duration,
                TEST_CONFIG.performanceThresholds.messageRouting
            );
            
            this.validator.addResult(
                'Response Routing',
                routingWorked && performanceOk,
                {
                    testMessage,
                    routedResponse,
                    routedSource,
                    duration,
                    performanceOk
                }
            );
            
            if (routingWorked && performanceOk) {
                console.log(`✅ Response routing works: "${routedResponse}" to ${routedSource}`);
            } else {
                console.log(`❌ Response routing failed`);
                if (!routingWorked) {
                    console.log(`   No response routed`);
                }
                if (!performanceOk) {
                    console.log(`   Routing too slow: ${duration}ms`);
                }
            }
            
        } catch (error) {
            this.validator.addResult(
                'Response Routing',
                false,
                {
                    error: error.message
                }
            );
            
            console.log(`❌ Response routing error: ${error.message}`);
        }
    }

    async testResponseHistory() {
        console.log('\n=== Testing Response History ===');
        
        const testMessages = [
            'first message',
            'second message', 
            'third message'
        ];
        
        try {
            // Send multiple messages
            for (let i = 0; i < testMessages.length; i++) {
                await this.agent.handleMessage('history_test', testMessages[i]);
                // Small delay to ensure different timestamps
                await new Promise(resolve => setTimeout(resolve, 10));
            }
            
            // Check response history
            const history = this.agent.agentState.executive.responseHistory;
            const historyLength = history.length;
            const hasCorrectMessages = history.length >= testMessages.length;
            
            // Check last response
            const lastResponse = this.agent.agentState.executive.lastResponse;
            const hasLastResponse = lastResponse !== null;
            
            // Check conversation context in episodic memory
            const episodes = this.agent.agentState.cognitive.memory.episodic.episodes;
            const hasEpisodicRecords = episodes.length > 0;
            
            this.validator.addResult(
                'Response History Management',
                hasCorrectMessages && hasLastResponse && hasEpisodicRecords,
                {
                    historyLength,
                    expectedLength: testMessages.length,
                    hasLastResponse,
                    hasEpisodicRecords,
                    episodesCount: episodes.length
                }
            );
            
            if (hasCorrectMessages && hasLastResponse && hasEpisodicRecords) {
                console.log(`✅ Response history working: ${historyLength} responses recorded`);
                console.log(`   Episodic memory: ${episodes.length} episodes stored`);
            } else {
                console.log(`❌ Response history management failed`);
                console.log(`   History length: ${historyLength} (expected >= ${testMessages.length})`);
                console.log(`   Last response: ${hasLastResponse}`);
                console.log(`   Episodic records: ${hasEpisodicRecords}`);
            }
            
        } catch (error) {
            this.validator.addResult(
                'Response History Management',
                false,
                {
                    error: error.message
                }
            );
            
            console.log(`❌ Response history error: ${error.message}`);
        }
    }

    async testOriginalProblemExample() {
        console.log('\n=== Testing Original Problem Example ===');
        
        const originalMessage = 'say hi to john_goodman';
        const expectedUser = 'john_goodman';
        
        try {
            const startTime = Date.now();
            
            // Test the exact original problem scenario
            await this.agent.handleMessage('test_user', originalMessage);
            
            const duration = Date.now() - startTime;
            const response = this.agent.agentState.executive.lastResponse?.response;
            
            // Validate the specific requirements
            const responseGenerated = response !== null && response.length > 0;
            const mentionsUser = response && response.toLowerCase().includes(expectedUser.toLowerCase());
            const isGreeting = response && (
                response.toLowerCase().includes('hi') || 
                response.toLowerCase().includes('hello') ||
                response.toLowerCase().includes('hey')
            );
            const performanceOk = duration < TEST_CONFIG.performanceThresholds.responseGeneration;
            
            const testPassed = responseGenerated && mentionsUser && isGreeting && performanceOk;
            
            this.validator.addResult(
                'Original Problem: "say hi to john_goodman"',
                testPassed,
                {
                    originalMessage,
                    response,
                    duration,
                    responseGenerated,
                    mentionsUser,
                    isGreeting,
                    performanceOk
                }
            );
            
            if (testPassed) {
                console.log(`✅ Original problem solved in ${duration}ms`);
                console.log(`   Response: "${response}"`);
            } else {
                console.log(`❌ Original problem not solved`);
                if (!responseGenerated) console.log(`   No response generated`);
                if (!mentionsUser) console.log(`   Doesn't mention ${expectedUser}`);
                if (!isGreeting) console.log(`   Not a greeting`);
                if (!performanceOk) console.log(`   Too slow: ${duration}ms`);
            }
            
        } catch (error) {
            this.validator.addResult(
                'Original Problem: "say hi to john_goodman"',
                false,
                {
                    error: error.message
                }
            );
            
            console.log(`❌ Original problem test error: ${error.message}`);
        }
    }

    async testPrompterIntegration() {
        console.log('\n=== Testing Prompter Integration ===');
        
        try {
            // Check if prompter is initialized
            const prompterExists = this.agent.prompter !== null;
            const prompterInitialized = this.agent.prompter && this.agent.prompter.callCount !== undefined;
            
            // Send a test message to trigger prompter
            await this.agent.handleMessage('prompter_test', 'test prompter integration');
            
            const prompterCalled = this.agent.prompter && this.agent.prompter.callCount > 0;
            const conversationHistoryBuilt = this.agent.buildConversationHistory !== undefined;
            
            this.validator.addResult(
                'Prompter System Integration',
                prompterExists && prompterInitialized && prompterCalled,
                {
                    prompterExists,
                    prompterInitialized,
                    prompterCalled,
                    callCount: this.agent.prompter ? this.agent.prompter.callCount : 0,
                    conversationHistoryBuilt
                }
            );
            
            if (prompterExists && prompterInitialized && prompterCalled) {
                console.log(`✅ Prompter integration working: ${this.agent.prompter.callCount} calls made`);
            } else {
                console.log(`❌ Prompter integration failed`);
                console.log(`   Prompter exists: ${prompterExists}`);
                console.log(`   Prompter initialized: ${prompterInitialized}`);
                console.log(`   Prompter called: ${prompterCalled}`);
            }
            
        } catch (error) {
            this.validator.addResult(
                'Prompter System Integration',
                false,
                {
                    error: error.message
                }
            );
            
            console.log(`❌ Prompter integration error: ${error.message}`);
        }
    }

    async runAllTests() {
        console.log('🚀 Starting Response Generation and Routing Validation Tests');
        console.log(`Configuration: ${TEST_CONFIG.testScenarios.length} test scenarios`);
        console.log(`Performance thresholds:`, TEST_CONFIG.performanceThresholds);
        
        const testStartTime = Date.now();
        
        try {
            // Initialize agent
            const initialized = await this.initializeAgent();
            if (!initialized) {
                throw new Error('Failed to initialize agent');
            }
            
            // Run all test suites
            await this.testConversationProcessing();
            await this.testResponseRouting();
            await this.testResponseHistory();
            await this.testPrompterIntegration();
            await this.testOriginalProblemExample();
            
        } catch (error) {
            console.error('❌ Test suite failed:', error);
            this.validator.addResult(
                'Test Suite Execution',
                false,
                {
                    error: error.message,
                    stack: error.stack
                }
            );
        }
        
        const totalDuration = Date.now() - testStartTime;
        
        // Generate and display report
        const report = this.validator.generateReport();
        this.displayReport(report, totalDuration);
        
        // Save report to file
        await this.saveReport(report);
        
        return report;
    }

    displayReport(report, totalDuration) {
        console.log('\n' + '='.repeat(80));
        console.log('📊 RESPONSE GENERATION VALIDATION REPORT');
        console.log('='.repeat(80));
        
        console.log('\n📈 SUMMARY:');
        console.log(`   Total Tests: ${report.summary.total}`);
        console.log(`   Passed: ${report.summary.passed}`);
        console.log(`   Failed: ${report.summary.failed}`);
        console.log(`   Pass Rate: ${report.summary.passRate}`);
        console.log(`   Total Duration: ${totalDuration}ms`);
        
        console.log('\n💾 MEMORY USAGE:');
        console.log(`   Heap Used: ${(report.summary.memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`);
        console.log(`   Memory Validation: ${report.performance.memoryValidation ? '✅ PASS' : '❌ FAIL'}`);
        
        console.log('\n📋 DETAILED RESULTS:');
        report.results.forEach(result => {
            const status = result.passed ? '✅' : '❌';
            console.log(`   ${status} ${result.testName}`);
            
            if (!result.passed && result.details.issues) {
                result.details.issues.forEach(issue => {
                    console.log(`      - ${issue}`);
                });
            }
            
            if (result.details.duration) {
                console.log(`      Duration: ${result.details.duration}ms`);
            }
        });
        
        console.log('\n' + '='.repeat(80));
        
        // Overall assessment
        const allCriticalTestsPassed = report.results
            .filter(r => r.testName.includes('Original Problem') || 
                        r.testName.includes('Response Routing') ||
                        r.testName.includes('Prompter System'))
            .every(r => r.passed);
        
        if (allCriticalTestsPassed && parseFloat(report.summary.passRate) >= 80) {
            console.log('🎉 RESPONSE GENERATION AND ROUTING SYSTEM READY FOR INTEGRATION');
        } else {
            console.log('⚠️  RESPONSE GENERATION SYSTEM NEEDS ATTENTION BEFORE INTEGRATION');
        }
    }

    async saveReport(report) {
        const reportPath = './RESPONSE_GENERATION_VALIDATION_REPORT.md';
        
        let markdown = '# Response Generation and Routing Validation Report\n\n';
        markdown += `**Generated:** ${new Date().toISOString()}\n`;
        markdown += `**Total Duration:** ${report.summary.duration}ms\n\n`;
        
        markdown += '## Summary\n\n';
        markdown += `- **Total Tests:** ${report.summary.total}\n`;
        markdown += `- **Passed:** ${report.summary.passed}\n`;
        markdown += `- **Failed:** ${report.summary.failed}\n`;
        markdown += `- **Pass Rate:** ${report.summary.passRate}\n\n`;
        
        markdown += '## Performance Thresholds\n\n';
        markdown += `- **Response Generation:** ${TEST_CONFIG.performanceThresholds.responseGeneration}ms\n`;
        markdown += `- **Message Routing:** ${TEST_CONFIG.performanceThresholds.messageRouting}ms\n`;
        markdown += `- **Memory Usage:** ${(TEST_CONFIG.performanceThresholds.memoryUsage / 1024 / 1024).toFixed(2)}MB\n\n`;
        
        markdown += '## Detailed Results\n\n';
        report.results.forEach(result => {
            const status = result.passed ? '✅' : '❌';
            markdown += `### ${status} ${result.testName}\n\n`;
            
            if (result.details.response) {
                markdown += `**Response:** "${result.details.response}"\n\n`;
            }
            
            if (result.details.duration) {
                markdown += `**Duration:** ${result.details.duration}ms\n\n`;
            }
            
            if (!result.passed && result.details.issues) {
                markdown += '**Issues:**\n';
                result.details.issues.forEach(issue => {
                    markdown += `- ${issue}\n`;
                });
                markdown += '\n';
            }
        });
        
        markdown += '## Assessment\n\n';
        const criticalTests = report.results.filter(r => 
            r.testName.includes('Original Problem') || 
            r.testName.includes('Response Routing') ||
            r.testName.includes('Prompter System')
        );
        
        const criticalPassed = criticalTests.every(r => r.passed);
        const overallPassRate = parseFloat(report.summary.passRate);
        
        if (criticalPassed && overallPassRate >= 80) {
            markdown += '🎉 **READY FOR INTEGRATION** - All critical tests passed and overall pass rate is acceptable.\n';
        } else {
            markdown += '⚠️ **NEEDS ATTENTION** - Some critical tests failed or pass rate is too low.\n';
        }
        
        fs.writeFileSync(reportPath, markdown);
        console.log(`\n📄 Report saved to: ${reportPath}`);
    }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const validator = new ResponseGenerationValidator();
    
    validator.runAllTests()
        .then(report => {
            const exitCode = report.summary.failed > 0 ? 1 : 0;
            process.exit(exitCode);
        })
        .catch(error => {
            console.error('Test execution failed:', error);
            process.exit(1);
        });
}

export { ResponseGenerationValidator, TEST_CONFIG };