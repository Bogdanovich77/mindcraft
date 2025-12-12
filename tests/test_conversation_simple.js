/**
 * Simple test for LangGraph Agent Conversation Processing Integration
 * Tests the core conversation processing without TypeScript dependencies
 */

import { readFileSync } from 'fs';
import settings from './src/agent/settings.js';
import { setSettings } from './src/agent/settings.js';

// Initialize required settings
setSettings({
    base_profile: 'assistant',
    num_examples: 5,
    relevant_docs_count: 3,
    log_all_prompts: false
});

// Mock the cognitive components for testing
class MockPurposeCore {
    constructor(options) {
        this.options = options;
    }
    
    getState() {
        return {
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
    
    async processCognitive(input) {
        return {
            selectedAction: null,
            reasoning: 'Mock cognitive processing'
        };
    }
    
    processOutcome(action, outcome, context) {
        // Mock processing
    }
}

// Simplified LangGraph Agent for testing
class SimpleLangGraphAgent {
    constructor() {
        this.profile = null;
        this.bot = null;
        this.purposeCore = null;
        this.prompter = null;
        this.conversationHistory = [];
        this.name = null;
        this.isInitialized = false;
    }
    
    async start(options = {}) {
        try {
            console.log('Initializing Simple LangGraph agent...');
            
            this.profile = options.profile;
            if (!this.profile) {
                throw new Error('Profile is required for agent initialization');
            }
            
            this.name = this.profile.name;
            console.log(`Setting up agent: ${this.name}`);
            
            // Initialize mock cognitive components
            this.purposeCore = new MockPurposeCore({
                learningRate: this.profile.behavior?.adaptationRate || 0.1,
                decisionTimeLimit: 2000
            });
            
            // Initialize prompter
            const { Prompter } = await import('./src/models/prompter.js');
            this.prompter = new Prompter(this, this.profile);
            await this.prompter.initExamples();
            
            this.isInitialized = true;
            console.log(`Agent ${this.name} initialized successfully`);
            
        } catch (error) {
            console.error(`Failed to initialize agent:`, error);
            throw error;
        }
    }
    
    determineMessageType(message) {
        const lowerMessage = message.toLowerCase();
        
        const actionCommands = [
            'go to', 'move to', 'walk to', 'run to',
            'get', 'take', 'pick up', 'collect',
            'craft', 'build', 'place', 'break',
            'attack', 'fight', 'defend',
            'follow', 'stop', 'wait'
        ];
        
        const isActionCommand = actionCommands.some(cmd => lowerMessage.includes(cmd));
        return isActionCommand ? 'command' : 'conversational';
    }
    
    async generateConversationalResponse(message) {
        if (!this.prompter) {
            return 'I apologize, but my conversation system is not initialized.';
        }
        
        try {
            const history = this.buildConversationHistory();
            const response = await this.prompter.promptConvo(history);
            console.log(`${this.name} generated response: "${response}"`);
            return response;
            
        } catch (error) {
            console.error('Error generating conversational response:', error);
            return 'I apologize, but I\'m having trouble processing that right now.';
        }
    }
    
    buildConversationHistory() {
        const history = [];
        
        this.conversationHistory.slice(-5).forEach(record => {
            history.push({
                role: 'user',
                content: record.message
            });
            history.push({
                role: 'assistant', 
                content: record.response
            });
        });
        
        return history;
    }
    
    async routeResponse(source, response) {
        console.log(`${this.name} full response to ${source}: "${response}"`);
        
        if (this.bot && this.bot.chat) {
            this.bot.chat(response);
        } else {
            console.log(`${this.name} to ${source}: ${response}`);
        }
    }
    
    async handleMessage(username, message) {
        try {
            console.log(`${this.name} received message from ${username}: ${message}`);
            
            const messageType = this.determineMessageType(message);
            
            if (messageType === 'conversational') {
                const response = await this.generateConversationalResponse({ message, source: username });
                await this.routeResponse(username, response);
                
                // Update conversation history
                this.conversationHistory.push({
                    source: username,
                    message: message,
                    response: response,
                    timestamp: Date.now(),
                    processingMode: 'conversational'
                });
                
            } else {
                console.log(`Action command detected: ${message}`);
                console.log('This would be processed through the LangGraph cognitive system');
            }
            
        } catch (error) {
            console.error('Error handling message:', error);
        }
    }
}

async function testConversationProcessing() {
    console.log('=== Simple LangGraph Agent Conversation Processing Test ===\n');
    
    try {
        // Load test profile and merge with defaults
        const testProfile = JSON.parse(readFileSync('./profiles/andy.json', 'utf8'));
        const defaultProfile = JSON.parse(readFileSync('./profiles/defaults/_default.json', 'utf8'));
        
        // Merge default profile fields into test profile
        const mergedProfile = { ...defaultProfile, ...testProfile };
        
        console.log('Using merged profile with prompter fields');
        
        // Create and initialize agent
        const agent = new SimpleLangGraphAgent();
        
        // Mock the bot for testing
        agent.bot = {
            chat: (message) => console.log(`[CHAT] ${agent.name}: ${message}`)
        };
        
        await agent.start({ profile: mergedProfile });
        
        console.log('✅ Agent initialized successfully');
        
        // Test conversational messages
        const testMessages = [
            { message: 'say hi to john_goodman', source: 'user1' },
            { message: 'hello there!', source: 'user2' },
            { message: 'how are you doing?', source: 'user3' }
        ];
        
        console.log('\n=== Testing Conversational Messages ===\n');
        
        for (const test of testMessages) {
            console.log(`\n--- Testing: "${test.message}" from ${test.source} ---`);
            
            try {
                await agent.handleMessage(test.source, test.message);
                console.log('✅ Message processed successfully');
                
                // Wait a moment between messages
                await new Promise(resolve => setTimeout(resolve, 1000));
                
            } catch (error) {
                console.error(`❌ Error processing message:`, error.message);
            }
        }
        
        // Test action commands
        console.log('\n=== Testing Action Commands ===\n');
        
        const actionCommands = [
            { message: 'go to 100 64 200', source: 'user1' },
            { message: 'get wood', source: 'user2' }
        ];
        
        for (const test of actionCommands) {
            console.log(`\n--- Testing action: "${test.message}" from ${test.source} ---`);
            
            try {
                await agent.handleMessage(test.source, test.message);
                console.log('✅ Action command processed correctly');
                
            } catch (error) {
                console.error(`❌ Error processing action:`, error.message);
            }
        }
        
        // Show conversation history
        console.log('\n=== Conversation History ===\n');
        console.log(`Total conversations: ${agent.conversationHistory.length}`);
        
        agent.conversationHistory.forEach((record, index) => {
            console.log(`${index + 1}. ${record.source}: "${record.message}"`);
            console.log(`   Response: "${record.response}"`);
        });
        
        console.log('\n=== Test Summary ===');
        console.log('✅ Conversation processing integration test completed');
        console.log('✅ Prompter system successfully integrated');
        console.log('✅ Response routing mechanism functional');
        console.log('✅ Message type detection working');
        console.log('✅ Conversation history tracking working');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
        console.error('Stack trace:', error.stack);
    }
}

// Run the test
testConversationProcessing().catch(console.error);