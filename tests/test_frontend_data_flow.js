import io from 'socket.io-client';

console.log('Testing frontend data flow...');

// Connect exactly like the frontend does
const socket = io('http://localhost:8080', {
  transports: ['websocket', 'polling'],
  timeout: 20000,
  forceNew: true,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5,
});

let testData = {
  connected: false,
  agentsStatusReceived: false,
  agentListReceived: false,
  agentsData: null
};

socket.on('connect', () => {
  console.log('✅ Connected to backend server');
  testData.connected = true;
  
  // Send the same events the frontend sends
  console.log('📡 Sending get_agent_list...');
  socket.emit('get_agent_list', {});
  
  console.log('📡 Sending listen-to-agents...');
  socket.emit('listen-to-agents', {});
});

socket.on('disconnect', () => {
  console.log('❌ Disconnected from backend server');
});

// Listen for the exact events the frontend expects
socket.on('agents-status', (data) => {
  console.log('📋 Received agents-status event:', data);
  testData.agentsStatusReceived = true;
  testData.agentsData = data;
  checkResults();
});

socket.on('agentList', (data) => {
  console.log('📋 Received agentList event:', data);
  testData.agentListReceived = true;
  if (!testData.agentsData) {
    testData.agentsData = data;
  }
  checkResults();
});

socket.on('connect_error', (error) => {
  console.error('❌ Connection error:', error);
  process.exit(1);
});

function checkResults() {
  if (testData.agentsStatusReceived || testData.agentListReceived) {
    console.log('\n=== FRONTEND DATA FLOW TEST RESULTS ===');
    console.log('✅ Socket.IO Connection:', testData.connected);
    console.log('✅ Agents-Status Event Received:', testData.agentsStatusReceived);
    console.log('✅ AgentList Event Received:', testData.agentListReceived);
    
    if (testData.agentsData) {
      const agentsArray = Array.isArray(testData.agentsData) ? testData.agentsData : (testData.agentsData.agents || []);
      console.log('📊 Agent Count:', agentsArray.length);
      
      if (agentsArray.length > 0) {
        console.log('🤖 Agents Found:');
        agentsArray.forEach((agent, index) => {
          console.log(`  ${index + 1}. ${agent.name} (in_game: ${agent.in_game}, viewer: ${agent.viewerPort})`);
        });
        
        console.log('\n🎉 SUCCESS: Frontend data flow is working!');
        console.log('The frontend should now display agents properly.');
      } else {
        console.log('\n⚠️  WARNING: No agents found in data');
      }
    }
    
    setTimeout(() => {
      process.exit(0);
    }, 1000);
  }
}

// Timeout after 10 seconds
setTimeout(() => {
  console.log('\n=== FRONTEND DATA FLOW TEST RESULTS ===');
  console.log('⏰ Test timed out after 10 seconds');
  console.log('❌ Socket.IO Connection:', testData.connected);
  console.log('❌ Agents-Status Event Received:', testData.agentsStatusReceived);
  console.log('❌ AgentList Event Received:', testData.agentListReceived);
  process.exit(1);
}, 10000);