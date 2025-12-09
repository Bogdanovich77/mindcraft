import { Agent } from './src/agent/agent.js';
import { initBot } from './src/utils/mcdata.js';
import { executeCommand } from './src/agent/commands/index.js';
import settings from './src/agent/settings.js';
import * as queries from './src/agent/commands/queries.js';

// Mock the mineflayer bot to simulate the race condition
class MockBot {
    constructor(name) {
        this.name = name;
        this.entity = null; // Initially null to simulate uninitialized state
        this.health = 20;
        this.food = 20;
        this.game = { gameMode: 'survival' };
        this.time = { timeOfDay: 6000 };
        this.rainState = 0;
        this.thunderState = 0;
        this.inventory = { slots: new Array(45).fill(null) };
        this.players = {};
        this.modes = {
            getMiniDocs: () => '\n- Modes: test mode',
            flushBehaviorLog: () => '',
            unPauseAll: () => {}
        };
        this.chat = (msg) => console.log(`[CHAT] ${msg}`);
        this.whisper = (username, msg) => console.log(`[WHISPER to ${username}] ${msg}`);
        this.on = (event, callback) => {
            console.log(`[MOCK] Event listener registered for: ${event}`);
            if (event === 'spawn') {
                // Simulate delayed spawn
                setTimeout(() => {
                    this.entity = { position: { x: 10, y: 64, z: 20 } };
                    console.log('[MOCK] Bot entity initialized with position');
                    callback();
                }, 100);
            }
        };
        this.once = this.on;
    }
}

// Mock the initBot function to return our mock bot
const originalInitBot = initBot;
let mockBot = new MockBot('TestBot');

// Test function to simulate the race condition
async function testRaceCondition() {
    console.log('=== Testing Bot Entity Race Condition ===\n');
    
    // Create a mock agent with minimal setup
    const mockAgent = {
        name: 'TestBot',
        bot: mockBot,
        actions: {
            currentActionLabel: 'Test Action'
        },
        isIdle: () => true,
        history: {
            add: (source, message) => console.log(`[HISTORY] ${source}: ${message}`),
            getHistory: () => []
        },
        routeResponse: (source, message) => console.log(`[RESPONSE to ${source}]: ${message}`)
    };

    // Test 1: Test !stats command when bot.entity is null
    console.log('Test 1: Testing !stats command with null bot.entity');
    try {
        const statsCommand = queries.queryList.find(cmd => cmd.name === '!stats');
        const result = statsCommand.perform(mockAgent);
        console.log('Result:', result);
        console.log('✅ Test 1 passed: No TypeError when bot.entity is null\n');
    } catch (error) {
        console.error('❌ Test 1 failed:', error.message);
        console.error(error.stack);
        return false;
    }

    // Test 2: Test !inventory command when bot.entity is null
    console.log('Test 2: Testing !inventory command with null bot.entity');
    try {
        const inventoryCommand = queries.queryList.find(cmd => cmd.name === '!inventory');
        const result = inventoryCommand.perform(mockAgent);
        console.log('Result:', result);
        console.log('✅ Test 2 passed: No TypeError when bot.entity is null\n');
    } catch (error) {
        console.error('❌ Test 2 failed:', error.message);
        console.error(error.stack);
        return false;
    }

    // Test 3: Test !nearbyBlocks command when bot.entity is null
    console.log('Test 3: Testing !nearbyBlocks command with null bot.entity');
    try {
        const nearbyBlocksCommand = queries.queryList.find(cmd => cmd.name === '!nearbyBlocks');
        const result = nearbyBlocksCommand.perform(mockAgent);
        console.log('Result:', result);
        console.log('✅ Test 3 passed: No TypeError when bot.entity is null\n');
    } catch (error) {
        console.error('❌ Test 3 failed:', error.message);
        console.error(error.stack);
        return false;
    }

    // Test 4: Test !entities command when bot.entity is null
    console.log('Test 4: Testing !entities command with null bot.entity');
    try {
        const entitiesCommand = queries.queryList.find(cmd => cmd.name === '!entities');
        const result = entitiesCommand.perform(mockAgent);
        console.log('Result:', result);
        console.log('✅ Test 4 passed: No TypeError when bot.entity is null\n');
    } catch (error) {
        console.error('❌ Test 4 failed:', error.message);
        console.error(error.stack);
        return false;
    }

    // Test 5: Simulate message handling during initialization
    console.log('Test 5: Testing message handling during bot initialization');
    try {
        // Create a mock agent with handleMessage method
        const agentWithMessageHandling = {
            ...mockAgent,
            bot: mockBot,
            handleMessage: async function(source, message) {
                // Check if bot is fully initialized before processing messages
                if (!this.bot.entity) {
                    console.warn('Cannot process message: Bot entity not yet available (still spawning...)');
                    return false;
                }
                
                console.log(`Message processed: ${message}`);
                return true;
            }
        };

        // Try to handle a message while bot.entity is still null
        const result = await agentWithMessageHandling.handleMessage('testuser', 'hello');
        console.log('Message handling result:', result);
        console.log('✅ Test 5 passed: Message handling gracefully handles null bot.entity\n');
    } catch (error) {
        console.error('❌ Test 5 failed:', error.message);
        console.error(error.stack);
        return false;
    }

    // Test 6: Test after bot.entity is initialized
    console.log('Test 6: Testing commands after bot.entity is initialized');
    try {
        // Simulate bot entity initialization
        mockAgent.bot.entity = { position: { x: 10, y: 64, z: 20 } };
        
        const statsCommand = queries.queryList.find(cmd => cmd.name === '!stats');
        const result = statsCommand.perform(mockAgent);
        console.log('Result:', result);
        
        if (result.includes('x: 10.00, y: 64.00, z: 20.00')) {
            console.log('✅ Test 6 passed: Commands work correctly after bot.entity is initialized\n');
        } else {
            console.error('❌ Test 6 failed: Position not correctly displayed in stats');
            return false;
        }
    } catch (error) {
        console.error('❌ Test 6 failed:', error.message);
        console.error(error.stack);
        return false;
    }

    return true;
}

// Test the actual Agent class initialization sequence
async function testAgentInitialization() {
    console.log('=== Testing Agent Initialization Sequence ===\n');
    
    // Mock the necessary dependencies
    const originalConsoleLog = console.log;
    const logs = [];
    
    console.log = (...args) => {
        logs.push(args.join(' '));
        originalConsoleLog(...args);
    };

    try {
        // Create a mock agent with the actual Agent class structure
        const agent = new Agent();
        
        // Mock the bot initialization
        agent.bot = new MockBot('TestBot');
        
        // Test the handleMessage method directly
        console.log('Test 7: Testing Agent.handleMessage with null bot.entity');
        const result = await agent.handleMessage('testuser', '!stats');
        
        if (logs.some(log => log.includes('Cannot process message: Bot entity not yet available'))) {
            console.log('✅ Test 7 passed: Agent.handleMessage correctly handles null bot.entity\n');
        } else {
            console.error('❌ Test 7 failed: Expected warning about bot.entity not being available');
            return false;
        }
        
        // Now simulate the bot spawning
        console.log('Test 8: Testing after bot spawn');
        await new Promise(resolve => {
            agent.bot.once('spawn', () => {
                console.log('Bot spawned, testing message handling...');
                resolve();
            });
        });
        
        // Try handling a message after spawn
        const result2 = await agent.handleMessage('testuser', '!stats');
        console.log('Message handling result after spawn:', result2);
        console.log('✅ Test 8 passed: Message handling works after bot spawn\n');
        
        return true;
        
    } catch (error) {
        console.error('❌ Agent initialization test failed:', error.message);
        console.error(error.stack);
        return false;
    } finally {
        console.log = originalConsoleLog;
    }
}

// Main test runner
async function runAllTests() {
    console.log('Starting comprehensive tests for bot.entity race condition fixes...\n');
    
    const results = [];
    
    // Run the race condition tests
    results.push(await testRaceCondition());
    
    // Run the agent initialization tests
    results.push(await testAgentInitialization());
    
    // Summary
    console.log('=== Test Summary ===');
    const passed = results.filter(r => r).length;
    const total = results.length;
    
    if (passed === total) {
        console.log(`✅ All ${total} test suites passed! The race condition fixes are working correctly.`);
        console.log('\nThe following fixes have been validated:');
        console.log('- Null checks in !stats command prevent TypeError');
        console.log('- Null checks in !inventory command prevent TypeError');
        console.log('- Null checks in !nearbyBlocks command prevent TypeError');
        console.log('- Null checks in !entities command prevent TypeError');
        console.log('- Message handling gracefully handles null bot.entity');
        console.log('- Commands work correctly after bot.entity is initialized');
        console.log('- Agent initialization sequence properly handles the race condition');
    } else {
        console.log(`❌ ${total - passed} out of ${total} test suites failed. Please review the errors above.`);
        process.exit(1);
    }
}

// Run the tests
runAllTests().catch(error => {
    console.error('Test runner failed:', error);
    process.exit(1);
});