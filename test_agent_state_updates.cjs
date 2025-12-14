/**
 * Test script to validate agent state updates for inventory and location
 * This script tests the fix for the real-time stats updates issue
 */

const io = require('socket.io-client');

console.log('🧪 Testing Agent State Updates Fix');
console.log('=====================================');

// Test configuration
const SOCKET_URL = 'http://localhost:8080';
const TEST_AGENT_NAME = 'TestAgent';

async function testAgentStateUpdates() {
    let socket;
    let testPassed = true;
    let eventReceived = false;
    let receivedData = null;

    try {
        console.log('📡 Connecting to Socket.IO server...');
        socket = io(SOCKET_URL);

        // Wait for connection
        await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Connection timeout'));
            }, 5000);

            socket.on('connect', () => {
                clearTimeout(timeout);
                console.log('✅ Connected to Socket.IO server');
                resolve();
            });

            socket.on('connect_error', (error) => {
                clearTimeout(timeout);
                reject(error);
            });
        });

        // Set up event listener for agent:state:update
        console.log('👂 Setting up event listener for agent:state:update...');
        socket.on('agent:state:update', (data) => {
            console.log('📨 Received agent:state:update event:', data);
            eventReceived = true;
            receivedData = data;

            // Validate the data structure
            if (!data.agentId) {
                console.error('❌ Missing agentId in event data');
                testPassed = false;
            }

            if (!data.worldContext) {
                console.error('❌ Missing worldContext in event data');
                testPassed = false;
            } else {
                // Check for worldContext fields
                if (!data.worldContext.position) {
                    console.error('❌ Missing position in worldContext');
                    testPassed = false;
                } else {
                    console.log('✅ Position data found:', data.worldContext.position);
                }

                if (!data.worldContext.inventory) {
                    console.error('❌ Missing inventory in worldContext');
                    testPassed = false;
                } else {
                    console.log('✅ Inventory data found:', data.worldContext.inventory);
                }

                if (typeof data.worldContext.health !== 'number') {
                    console.error('❌ Missing or invalid health in worldContext');
                    testPassed = false;
                } else {
                    console.log('✅ Health data found:', data.worldContext.health);
                }
            }

            // Check for other required fields
            const requiredFields = ['personality', 'goals', 'mandate', 'lastAction', 'response'];
            for (const field of requiredFields) {
                if (data[field] === undefined || data[field] === null) {
                    console.error(`❌ Missing or null field: ${field}`);
                    testPassed = false;
                } else {
                    console.log(`✅ ${field} field found:`, typeof data[field] === 'string' ? data[field].substring(0, 50) + '...' : data[field]);
                }
            }
        });

        // Request agent list to trigger events
        console.log('📋 Requesting agent list...');
        socket.emit('get_agent_list');

        // Wait for events
        console.log('⏳ Waiting for agent state updates (10 seconds)...');
        await new Promise((resolve) => {
            setTimeout(resolve, 10000);
        });

        // Check if we received any events
        if (!eventReceived) {
            console.error('❌ No agent:state:update events received');
            console.log('💡 This could mean:');
            console.log('   - No agents are currently running');
            console.log('   - The backend is not emitting events');
            console.log('   - The Socket.IO connection is not working properly');
            testPassed = false;
        } else {
            console.log('✅ Agent state update event received');
        }

    } catch (error) {
        console.error('❌ Test failed with error:', error.message);
        testPassed = false;
    } finally {
        if (socket) {
            socket.disconnect();
            console.log('🔌 Disconnected from Socket.IO server');
        }
    }

    return testPassed;
}

async function main() {
    console.log('🚀 Starting agent state updates test...\n');

    const success = await testAgentStateUpdates();

    console.log('\n📊 Test Results:');
    console.log('================');
    if (success) {
        console.log('✅ All tests passed! The fix appears to be working correctly.');
        console.log('🎉 Inventory and location updates should now work in the UI.');
    } else {
        console.log('❌ Some tests failed. Please check the errors above.');
        console.log('🔧 Additional troubleshooting may be needed.');
    }

    console.log('\n💡 Next Steps:');
    console.log('1. Start the Mindcraft backend if not already running');
    console.log('2. Start some agents to generate state updates');
    console.log('3. Check the browser console for the new debug logs');
    console.log('4. Verify that inventory and location are updating in the UI');

    process.exit(success ? 0 : 1);
}

// Run the test
main().catch((error) => {
    console.error('💥 Test script failed:', error);
    process.exit(1);
});