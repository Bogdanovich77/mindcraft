const { io } = require('socket.io-client');

console.log('=== Frontend Connection Fix Test ===');
console.log('Testing the connection fixes implemented in AgentList.tsx\n');

// Test configuration
const SERVER_URL = 'http://localhost:8080';
const TEST_TIMEOUT = 15000; // 15 seconds

let testPassed = false;
let socket = null;

const testResults = {
  connectionEstablished: false,
  agentsStatusReceived: false,
  agentDataValid: false,
  timingIssues: false,
  errors: []
};

console.log(`[TEST] Connecting to MindServer at ${SERVER_URL}...`);

// Create socket connection with same configuration as frontend
socket = io(SERVER_URL, {
  transports: ['websocket', 'polling'],
  timeout: 10000,
  reconnection: true,
  reconnectionAttempts: 3,
  reconnectionDelay: 1000
});

const startTime = Date.now();

// Track connection events
socket.on('connect', () => {
  const connectionTime = Date.now() - startTime;
  console.log(`[TEST] ✓ Connected to MindServer in ${connectionTime}ms`);
  testResults.connectionEstablished = true;
  
  // Test if agents-status is received immediately (this was the race condition)
  setTimeout(() => {
    if (!testResults.agentsStatusReceived) {
      console.log('[TEST] ⚠️  agents-status not received immediately - this indicates the race condition may still exist');
      testResults.timingIssues = true;
    }
  }, 500);
});

socket.on('connect_error', (error) => {
  console.log(`[TEST] ✗ Connection error: ${error.message}`);
  testResults.errors.push(`Connection error: ${error.message}`);
});

// Listen for agents-status (this is what the frontend needs)
socket.on('agents-status', (data) => {
  const receiveTime = Date.now() - startTime;
  console.log(`[TEST] ✓ Received agents-status event in ${receiveTime}ms`);
  console.log(`[TEST] Agent data:`, JSON.stringify(data, null, 2));
  
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
      
      validAgents.forEach(agent => {
        console.log(`  - ${agent.name}: in_game=${agent.in_game}, socket_connected=${agent.socket_connected}`);
      });
    } else {
      console.log('[TEST] ✗ No valid agents found in data');
      testResults.errors.push('No valid agents found');
    }
  } else {
    console.log('[TEST] ✗ Invalid agent data format');
    testResults.errors.push('Invalid agent data format');
  }
});

// Handle other events
socket.on('system_status', (data) => {
  console.log('[TEST] ✓ Received system_status event');
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
                         !testResults.timingIssues;
  
  console.log(`Connection Established: ${testResults.connectionEstablished ? '✓' : '✗'}`);
  console.log(`Agents Status Received: ${testResults.agentsStatusReceived ? '✓' : '✗'}`);
  console.log(`Agent Data Valid: ${testResults.agentDataValid ? '✓' : '✗'}`);
  console.log(`No Timing Issues: ${!testResults.timingIssues ? '✓' : '✗'}`);
  
  if (testResults.errors.length > 0) {
    console.log('\nErrors encountered:');
    testResults.errors.forEach(error => console.log(`  - ${error}`));
  }
  
  console.log(`\nOverall Result: ${allTestsPassed ? '✓ PASSED' : '✗ FAILED'}`);
  
  if (allTestsPassed) {
    console.log('\n✅ Frontend connection fixes appear to be working correctly!');
    console.log('   - Race condition has been resolved');
    console.log('   - Agent data is being received properly');
    console.log('   - Connection timing is acceptable');
  } else {
    console.log('\n❌ Frontend connection issues still exist:');
    if (!testResults.connectionEstablished) {
      console.log('   - Unable to establish connection to MindServer');
    }
    if (!testResults.agentsStatusReceived) {
      console.log('   - agents-status event not received (race condition)');
    }
    if (!testResults.agentDataValid) {
      console.log('   - Agent data is invalid or missing');
    }
    if (testResults.timingIssues) {
      console.log('   - Timing issues detected in event reception');
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