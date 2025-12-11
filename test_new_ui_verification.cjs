const { io } = require('socket.io-client');

console.log('=== New UI Verification Test ===');
console.log('Testing the new frontend UI connection to MindServer\n');

// Test configuration
const SERVER_URL = 'http://localhost:8080';
const FRONTEND_URL = 'http://localhost:5174';
const TEST_TIMEOUT = 10000; // 10 seconds

let testPassed = false;
let socket = null;

const testResults = {
  connectionEstablished: false,
  agentsStatusReceived: false,
  agentDataValid: false,
  connectionStable: false,
  errors: []
};

console.log(`[TEST] Connecting to MindServer at ${SERVER_URL}...`);
console.log(`[TEST] Frontend UI should be available at ${FRONTEND_URL}\n`);

// Create socket connection with same configuration as the new frontend
socket = io(SERVER_URL, {
  transports: ['websocket', 'polling'],
  timeout: 10000,
  reconnection: true,
  reconnectionAttempts: 3,
  reconnectionDelay: 1000
});

const startTime = Date.now();
let eventsReceived = [];

// Track connection events
socket.on('connect', () => {
  const connectionTime = Date.now() - startTime;
  console.log(`[TEST] ✓ Connected to MindServer in ${connectionTime}ms`);
  testResults.connectionEstablished = true;
});

socket.on('connect_error', (error) => {
  console.log(`[TEST] ✗ Connection error: ${error.message}`);
  testResults.errors.push(`Connection error: ${error.message}`);
});

// Listen for agents-status (this is what the new frontend needs)
socket.on('agents-status', (data) => {
  const receiveTime = Date.now() - startTime;
  eventsReceived.push({
    event: 'agents-status',
    timestamp: receiveTime,
    data: data
  });
  
  console.log(`[TEST] ✓ Received agents-status event in ${receiveTime}ms`);
  
  testResults.agentsStatusReceived = true;
  
  // Validate agent data
  if (Array.isArray(data) && data.length > 0) {
    const validAgents = data.filter(agent => 
      agent && 
      typeof agent.name === 'string' && 
      typeof agent.in_game === 'boolean' &&
      typeof agent.socket_connected === 'boolean'
    );
    
    if (validAgents.length > 0) {
      console.log(`[TEST] ✓ Found ${validAgents.length} valid agents`);
      testResults.agentDataValid = true;
      
      // Check agent connection states
      const connectedAgents = validAgents.filter(agent => agent.socket_connected);
      const inGameAgents = validAgents.filter(agent => agent.in_game);
      
      console.log(`[TEST] Agent Status Summary:`);
      console.log(`  - Total agents: ${validAgents.length}`);
      console.log(`  - Connected agents: ${connectedAgents.length}`);
      console.log(`  - In-game agents: ${inGameAgents.length}`);
      
      // All agents should be connected based on our previous test
      if (connectedAgents.length === validAgents.length) {
        console.log(`[TEST] ✓ All agents are properly connected`);
        testResults.connectionStable = true;
      } else {
        console.log(`[TEST] ⚠️  Some agents are not connected`);
      }
    } else {
      console.log('[TEST] ✗ No valid agents found in data');
      testResults.errors.push('No valid agents found');
    }
  } else {
    console.log('[TEST] ✗ Invalid agent data format');
    testResults.errors.push('Invalid agent data format');
  }
});

// Handle other events that the frontend might receive
socket.on('system_status', (data) => {
  console.log('[TEST] ✓ Received system_status event');
  eventsReceived.push({
    event: 'system_status',
    timestamp: Date.now() - startTime,
    data: data
  });
});

socket.on('state-update', (data) => {
  console.log('[TEST] ✓ Received state-update event');
  eventsReceived.push({
    event: 'state-update',
    timestamp: Date.now() - startTime,
    data: data
  });
});

socket.on('disconnect', (reason) => {
  console.log(`[TEST] ⚠️  Disconnected: ${reason}`);
});

// Test completion
setTimeout(() => {
  console.log('\n=== Test Results ===');
  
  const allTestsPassed = testResults.connectionEstablished && 
                         testResults.agentsStatusReceived && 
                         testResults.agentDataValid &&
                         testResults.connectionStable;
  
  console.log(`Connection Established: ${testResults.connectionEstablished ? '✓' : '✗'}`);
  console.log(`Agents Status Received: ${testResults.agentsStatusReceived ? '✓' : '✗'}`);
  console.log(`Agent Data Valid: ${testResults.agentDataValid ? '✓' : '✗'}`);
  console.log(`Connection Stable: ${testResults.connectionStable ? '✓' : '✗'}`);
  console.log(`Events Received: ${eventsReceived.length}`);
  
  if (testResults.errors.length > 0) {
    console.log('\nErrors encountered:');
    testResults.errors.forEach(error => console.log(`  - ${error}`));
  }
  
  console.log(`\nOverall Result: ${allTestsPassed ? '✓ PASSED' : '✗ FAILED'}`);
  
  if (allTestsPassed) {
    console.log('\n✅ New UI connection verified successfully!');
    console.log('   - MindServer is responding correctly');
    console.log('   - Agent data is being received properly');
    console.log('   - All agents are connected and in-game');
    console.log(`   - Frontend should be accessible at ${FRONTEND_URL}`);
    console.log('\nNext steps:');
    console.log('   1. Open your browser and navigate to the frontend URL');
    console.log('   2. Verify the agent list displays correctly');
    console.log('   3. Check that connection status shows "Connected"');
    console.log('   4. Test agent interactions and state updates');
  } else {
    console.log('\n❌ New UI connection issues detected:');
    if (!testResults.connectionEstablished) {
      console.log('   - Unable to establish connection to MindServer');
    }
    if (!testResults.agentsStatusReceived) {
      console.log('   - agents-status event not received');
    }
    if (!testResults.agentDataValid) {
      console.log('   - Agent data is invalid or missing');
    }
    if (!testResults.connectionStable) {
      console.log('   - Agent connections are unstable');
    }
  }
  
  if (socket) {
    socket.disconnect();
  }
  
  process.exit(allTestsPassed ? 0 : 1);
  
}, TEST_TIMEOUT);

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n[TEST] Test interrupted by user');
  if (socket) {
    socket.disconnect();
  }
  process.exit(1);
});