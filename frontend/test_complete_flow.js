const { io } = require('socket.io-client');

console.log('🔍 Testing complete frontend data flow...');

const socket = io('http://localhost:8000');

socket.on('connect', () => {
  console.log('✅ Connected to MindServer');
  
  // Request agent list like the frontend does
  socket.emit('get_agent_list', {});
  socket.emit('listen-to-agents', {});
});

socket.on('agents-status', (data) => {
  console.log('📊 Received agents-status:', data);
  
  if (Array.isArray(data) && data.length > 0) {
    console.log('✅ Agent data received successfully');
    console.log(`📈 Found ${data.length} agents:`);
    
    data.forEach((agent, index) => {
      console.log(`   ${index + 1}. ${agent.name} (${agent.in_game ? 'online' : 'offline'})`);
    });
    
    // Test the transformation logic like AgentList.tsx does
    const transformedAgents = data.map((agent) => ({
      id: agent.name,
      name: agent.name,
      profile: 'default',
      status: agent.in_game ? 'online' : 'offline',
      position: { x: 0, y: 64, z: 0 },
      health: 20,
      level: 1,
      lastUpdate: Date.now(),
    }));
    
    console.log('🔄 Transformed agents for frontend:', transformedAgents);
    console.log('✅ Complete flow test - SUCCESS');
    
    setTimeout(() => {
      socket.disconnect();
      process.exit(0);
    }, 1000);
  } else {
    console.log('⚠️  No agents found or invalid data format');
    setTimeout(() => {
      socket.disconnect();
      process.exit(1);
    }, 1000);
  }
});

socket.on('connect_error', (error) => {
  console.error('❌ Connection failed:', error.message);
  process.exit(1);
});

// Timeout after 10 seconds
setTimeout(() => {
  console.error('❌ Test timeout - no response received');
  socket.disconnect();
  process.exit(1);
}, 10000);