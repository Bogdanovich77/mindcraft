import io from 'socket.io-client';

console.log('Testing complete frontend-backend connection...');

// Connect to the backend the same way the frontend does
const socket = io('http://localhost:8080');

let connectionTest = {
  connected: false,
  agentListReceived: false,
  agents: []
};

socket.on('connect', () => {
  console.log('✅ Connected to backend server with socket ID:', socket.id);
  connectionTest.connected = true;
  
  // Request agent list exactly like the frontend does
  console.log('📡 Requesting agent list...');
  socket.emit('listen-to-agents', {});
});

socket.on('disconnect', () => {
  console.log('❌ Disconnected from backend server');
});

socket.on('agents-status', (data) => {
  console.log('📋 Received agents-status event:', data);
  connectionTest.agentListReceived = true;
  connectionTest.agents = data;
  
  // Test results
  console.log('\n=== CONNECTION TEST RESULTS ===');
  console.log('✅ Socket.IO Connection:', connectionTest.connected);
  console.log('✅ Agent List Received:', connectionTest.agentListReceived);
  console.log('📊 Agent Count:', connectionTest.agents.length);
  
  if (connectionTest.agents.length > 0) {
    console.log('🤖 Agents Found:');
    connectionTest.agents.forEach((agent, index) => {
      console.log(`  ${index + 1}. ${agent.name} (in_game: ${agent.in_game}, viewer: ${agent.viewerPort})`);
    });
    console.log('\n🎉 SUCCESS: Frontend should now display real agents!');
  } else {
    console.log('\n⚠️  WARNING: No agents found on backend');
  }
  
  setTimeout(() => {
    process.exit(0);
  }, 1000);
});

socket.on('agentList', (data) => {
  console.log('📋 Received agentList event:', data);
  connectionTest.agentListReceived = true;
  connectionTest.agents = data.agents || [];
});

socket.on('connect_error', (error) => {
  console.error('❌ Connection error:', error);
  console.log('\n=== CONNECTION TEST RESULTS ===');
  console.log('❌ Socket.IO Connection: FAILED');
  console.log('❌ Agent List Received: FAILED');
  console.log('\n🔧 TROUBLESHOOTING: Check if backend server is running on port 8080');
  process.exit(1);
});

// Timeout after 10 seconds
setTimeout(() => {
  console.log('\n=== CONNECTION TEST RESULTS ===');
  console.log('⏰ Test timed out after 10 seconds');
  console.log('❌ Socket.IO Connection:', connectionTest.connected);
  console.log('❌ Agent List Received:', connectionTest.agentListReceived);
  process.exit(1);
}, 10000);