import io from 'socket.io-client';

console.log('=== Frontend Connection Test ===');
console.log('Testing frontend connection to MindServer...');

const socket = io('http://localhost:8080', {
  transports: ['websocket', 'polling'],
  timeout: 20000,
  forceNew: true,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5,
});

let connectionStatus = 'connecting';
let agentsReceived = false;

socket.on('connect', () => {
  console.log('✅ Connected to MindServer');
  console.log('Socket ID:', socket.id);
  connectionStatus = 'connected';
  
  // Test the events the frontend expects
  console.log('\n=== Testing Frontend Events ===');
  
  // Request agent list like the frontend does
  console.log('Sending get_agent_list request...');
  socket.emit('get_agent_list', {});
  
  // Also try alternative event name
  console.log('Sending getAgents request...');
  socket.emit('getAgents', {});
  
  // Start listening for agent updates
  console.log('Sending listen-to-agents request...');
  socket.emit('listen-to-agents', {});
});

socket.on('agents-status', (data) => {
  console.log('✅ Received agents-status event:', data);
  agentsReceived = true;
  
  if (Array.isArray(data)) {
    console.log(`✅ Agents data is array with ${data.length} agents`);
    data.forEach((agent, index) => {
      console.log(`  Agent ${index + 1}: ${agent.name} (in_game: ${agent.in_game})`);
    });
  } else {
    console.log('❌ Agents data is not an array:', typeof data);
  }
});

socket.on('agentList', (data) => {
  console.log('✅ Received agentList event:', data);
});

socket.on('state-update', (data) => {
  console.log('✅ Received state-update event');
  console.log('  Keys:', Object.keys(data));
});

socket.on('connect_error', (error) => {
  console.error('❌ Connection error:', error.message);
  connectionStatus = 'error';
});

socket.on('disconnect', (reason) => {
  console.log('❌ Disconnected:', reason);
  connectionStatus = 'disconnected';
});

// Test results after timeout
setTimeout(() => {
  console.log('\n=== Test Results ===');
  console.log('Connection Status:', connectionStatus);
  console.log('Agents Received:', agentsReceived);
  
  if (connectionStatus === 'connected' && agentsReceived) {
    console.log('✅ Frontend connection is working correctly');
    console.log('❌ The issue is likely in the frontend event handling or Redux state management');
  } else if (connectionStatus === 'connected') {
    console.log('✅ Connection works but agents not received');
    console.log('❌ The issue is likely in event naming or data format');
  } else {
    console.log('❌ Connection failed - backend may not be running or accessible');
  }
  
  socket.disconnect();
}, 5000);