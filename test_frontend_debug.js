import io from 'socket.io-client';

console.log('=== Frontend Debug Test ===');
console.log('Testing exact frontend socket service behavior...');

// Simulate the exact frontend socket service configuration
const socket = io('http://localhost:8080', {
  transports: ['websocket', 'polling'],
  timeout: 20000,
  forceNew: true,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5,
});

let eventLog = [];

socket.on('connect', () => {
  console.log('✅ Connected');
  eventLog.push('connect');
  
  // Simulate frontend behavior - check if agents-status is sent automatically
  console.log('Waiting for automatic agents-status...');
});

socket.on('agents-status', (data) => {
  console.log('✅ Received agents-status:', data);
  eventLog.push('agents-status');
  
  // Test the frontend's data transformation
  console.log('\n=== Testing Frontend Data Transformation ===');
  
  // Handle both formats: direct array and { agents: [...] }
  const agentsArray = Array.isArray(data) ? data : (data.agents || []);
  console.log('Processed agents array:', agentsArray);
  
  if (agentsArray.length === 0) {
    console.log('❌ No agents found - this would cause "No agents available"');
  } else {
    // Transform backend data format to frontend format (like AgentList does)
    const agentSummaries = agentsArray.map((agent) => ({
      id: agent.name,
      name: agent.name,
      profile: 'default',
      status: agent.in_game ? 'online' : 'offline',
      position: { x: 0, y: 64, z: 0 },
      health: 20,
      level: 1,
      lastUpdate: Date.now(),
    }));
    
    console.log('✅ Transformed agent summaries:', agentSummaries);
    console.log(`✅ ${agentSummaries.length} agents would be displayed in frontend`);
  }
});

socket.on('agentList', (data) => {
  console.log('✅ Received agentList:', data);
  eventLog.push('agentList');
});

socket.on('agentUpdate', (data) => {
  console.log('✅ Received agentUpdate:', data);
  eventLog.push('agentUpdate');
});

socket.on('connect_error', (error) => {
  console.error('❌ Connection error:', error);
  eventLog.push('connect_error');
});

socket.on('disconnect', (reason) => {
  console.log('❌ Disconnected:', reason);
  eventLog.push('disconnect');
});

// Test manual requests after connection
setTimeout(() => {
  console.log('\n=== Testing Manual Requests ===');
  
  console.log('Sending get_agent_list...');
  socket.emit('get_agent_list', {});
  
  setTimeout(() => {
    console.log('Sending listen-to-agents...');
    socket.emit('listen-to-agents', {});
  }, 1000);
  
}, 2000);

// Final analysis
setTimeout(() => {
  console.log('\n=== Final Analysis ===');
  console.log('Events received:', eventLog);
  
  if (eventLog.includes('agents-status')) {
    console.log('✅ agents-status event is working');
    console.log('✅ The issue is likely in the frontend React component or Redux store');
  } else {
    console.log('❌ agents-status event not received');
    console.log('❌ This indicates a connection or event handling issue');
  }
  
  console.log('\n=== Potential Issues ===');
  console.log('1. Frontend not properly listening to agents-status event');
  console.log('2. Redux state not being updated correctly');
  console.log('3. React component not re-rendering on state changes');
  console.log('4. Socket service not being initialized properly in React');
  
  socket.disconnect();
}, 8000);