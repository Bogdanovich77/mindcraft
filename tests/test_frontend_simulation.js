import io from 'socket.io-client';

console.log('Simulating frontend connection behavior...');

// Connect exactly like the frontend does
const socket = io('http://localhost:8080', {
  transports: ['websocket', 'polling'],
  timeout: 20000,
  forceNew: true,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5,
});

let connectionStatus = 'disconnected';
let agentData = null;

socket.on('connect', () => {
  console.log('✅ Connected to backend');
  connectionStatus = 'connected';
  
  // Request agents like the frontend does
  console.log('Sending getAgents request...');
  socket.emit('getAgents');
  
  console.log('Sending get_agent_list request...');
  socket.emit('get_agent_list', {});
});

socket.on('connect_error', (error) => {
  console.error('❌ Connection error:', error.message);
  connectionStatus = 'error';
});

// Listen for both event names like the frontend
socket.on('agents-status', (data) => {
  console.log('✅ Received agents-status event:', data);
  agentData = data;
  
  if (Array.isArray(data)) {
    console.log(`✅ Data is array with ${data.length} agents`);
    data.forEach((agent, index) => {
      console.log(`  Agent ${index + 1}: ${agent.name} (in_game: ${agent.in_game})`);
    });
  } else if (data && data.agents && Array.isArray(data.agents)) {
    console.log(`✅ Data has agents property with ${data.agents.length} agents`);
    data.agents.forEach((agent, index) => {
      console.log(`  Agent ${index + 1}: ${agent.name} (in_game: ${agent.in_game})`);
    });
  } else {
    console.log('❌ Unexpected data format:', typeof data, data);
  }
});

socket.on('agentList', (data) => {
  console.log('✅ Received agentList event:', data);
  agentData = data;
});

socket.on('disconnect', () => {
  console.log('❌ Disconnected from backend');
  connectionStatus = 'disconnected';
});

// Check results after a short delay
setTimeout(() => {
  console.log('\n=== Results ===');
  console.log('Connection status:', connectionStatus);
  
  if (connectionStatus === 'connected' && agentData) {
    console.log('✅ SUCCESS: Frontend simulation worked - agents data received');
  } else if (connectionStatus === 'connected') {
    console.log('❌ ISSUE: Connected but no agents data received');
  } else {
    console.log('❌ ISSUE: Not connected to backend');
  }
  
  socket.disconnect();
  process.exit(0);
}, 3000);