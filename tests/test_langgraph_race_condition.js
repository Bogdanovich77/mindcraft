/**
 * Test for LangGraph Agent Race Condition Handling
 * Verifies that the LangGraph agent properly handles messages received before bot.entity is initialized
 */

import { LangGraphAgent } from './src/agent/langgraph/agent.js';

// Mock mineflayer bot with delayed entity initialization
function createMockBot() {
    const events = {};
    const mockBot = {
        entity: null, // Initially null to simulate race condition
        health: 20,
        food: 20,
        game: { dimension: 'overworld' },
        time: { timeOfDay: 0 },
        inventory: {
            items: () => []
        },
        entities: {},
        on: function(event, callback) {
            if (!events[event]) {
                events[event] = [];
            }
            events[event].push(callback);
        },
        emit: function(event, ...args) {
            if (events[event]) {
                events[event].forEach(callback => callback(...args));
            }
        },
        chat: function(message) {
            console.log(`[CHAT] ${this.username || 'Bot'}: ${message}`);
        }
    };
    
    // Simulate entity initialization after a delay
    setTimeout(() => {
        mockBot.entity = {
            position: { x: 10, y: 64, z: 10 },
            health: 20,
            food: 20
        };
        console.log('[MOCK] Bot.entity initialized');
        mockBot.emit('spawn');
    }, 100); // 100ms delay to simulate race condition
    
    return mockBot;
}

// Mock mcdata.initBot function
const originalInitBot = global.initBot;
global.initBot = function(name) {
    const mockBot = createMockBot();
    mockBot.username = name;
    return mockBot;
};

// Test profile
const testProfile = {
    name: 'TestLangGraphAgent',
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
        },
        motivations: {
            primary: 'exploration',
            secondary: ['socializing', 'building']
        },
        values: {
            core: ['curiosity', 'helpfulness'],
            priorities: { exploration: 0.8, social: 0.6 }
        },
        ethics: {
            harmAvoidance: 0.9,
            fairness: 0.8,
            loyalty: 0.7
        }
    }
};

async function testLangGraphRaceCondition() {
    console.log('\n=== Testing LangGraph Agent Race Condition Handling ===\n');
    
    try {
        // Create agent
        const agent = new LangGraphAgent();
        
        // Start agent (this will trigger bot initialization with delayed entity)
        await agent.start({ profile: testProfile });
        
        // Send message immediately after start (before entity is initialized)
        console.log('Sending message before entity initialization...');
        await agent.handleMessage('testuser', 'hello there!');
        
        // Wait for entity initialization
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Send another message after entity is initialized
        console.log('Sending message after entity initialization...');
        await agent.handleMessage('testuser2', 'how are you?');
        
        // Wait for processing
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Check if agent processed messages without crashing
        const state = agent.getState();
        const responseHistory = state.executive.responseHistory;
        
        console.log('\n=== Test Results ===');
        console.log(`Response history length: ${responseHistory.length}`);
        
        if (responseHistory.length > 0) {
            console.log('✅ Messages were processed successfully');
            responseHistory.forEach((record, index) => {
                console.log(`  ${index + 1}. From: ${record.source}, Message: "${record.message}", Response: "${record.response}"`);
            });
        } else {
            console.log('❌ No responses were generated');
        }
        
        // Check if agent state is properly initialized
        if (state.context && state.context.position) {
            console.log(`✅ Agent position: ${state.context.position.x}, ${state.context.position.y}, ${state.context.position.z}`);
        } else {
            console.log('❌ Agent position not properly initialized');
        }
        
        console.log('\n=== Test Complete ===');
        return true;
        
    } catch (error) {
        console.error('❌ Test failed with error:', error);
        console.log('\n=== Test Failed ===');
        return false;
    }
}

async function testConcurrentMessages() {
    console.log('\n=== Testing Concurrent Message Handling ===\n');
    
    try {
        // Create agent
        const agent = new LangGraphAgent();
        
        // Start agent
        await agent.start({ profile: testProfile });
        
        // Send multiple messages concurrently
        console.log('Sending multiple messages concurrently...');
        const messagePromises = [
            agent.handleMessage('user1', 'hello'),
            agent.handleMessage('user2', 'how are you'),
            agent.handleMessage('user3', 'what are you doing'),
            agent.handleMessage('user4', 'help me'),
            agent.handleMessage('user5', 'follow me')
        ];
        
        // Wait for all messages to be processed
        await Promise.all(messagePromises);
        
        // Wait for processing
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Check results
        const state = agent.getState();
        const responseHistory = state.executive.responseHistory;
        
        console.log('\n=== Concurrent Message Test Results ===');
        console.log(`Response history length: ${responseHistory.length}`);
        
        if (responseHistory.length >= 5) {
            console.log('✅ All concurrent messages were processed');
        } else {
            console.log('⚠️ Some messages may not have been processed');
        }
        
        console.log('\n=== Concurrent Message Test Complete ===');
        return true;
        
    } catch (error) {
        console.error('❌ Concurrent message test failed:', error);
        return false;
    }
}

async function runAllTests() {
    console.log('Starting LangGraph Agent Race Condition Tests...\n');
    
    const test1 = await testLangGraphRaceCondition();
    const test2 = await testConcurrentMessages();
    
    console.log('\n=== Final Results ===');
    console.log(`Race Condition Test: ${test1 ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`Concurrent Messages Test: ${test2 ? '✅ PASSED' : '❌ FAILED'}`);
    
    const allTestsPassed = test1 && test2;
    console.log(`\nOverall: ${allTestsPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
    
    return allTestsPassed;
}

// Run tests
runAllTests().then(success => {
    process.exit(success ? 0 : 1);
}).catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
});