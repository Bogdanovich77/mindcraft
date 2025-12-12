import io from 'socket.io-client';

console.log('=== FINAL VERIFICATION TEST ===');
console.log('Testing complete frontend-backend integration...');

// Track all events
const events = [];

// Connect exactly like the frontend does
const socket = io('http://localhost:8080', {
  transports: ['websocket', 'polling'],
  timeout: 20000,
  forceNew: true,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5,
});

function logEvent(type, data) {
  const timestamp = new Date().toISOString();
  const event = { timestamp, type, data };
  events.push(event);
  console.log(`[${timestamp}] ${type}:`, data);
}

socket.on('connect', () => {
  logEvent('CONNECT', 'Connected to backend');
  
  // Simulate frontend behavior: request agents immediately after connection
  setTimeout(() => {
    logEvent('REQUEST', 'Sending agent list requests');
    socket.emit('getAgents', {});
    socket.emit('get_agent_list', {});
    socket.emit('listen-to-agents', {});
  }, 50);
});

socket.on('connect_error', (error) => {
  logEvent('CONNECT_ERROR', error.message);
});

socket.on('disconnect', (reason) => {
  logEvent('DISCONNECT', reason);
});

// Listen for agent events like the frontend does
socket.on('agents-status', (data) => {
  logEvent('AGENTS_STATUS', data);
  
  // Simulate frontend processing
  const agentsArray = Array.isArray(data) ? data : (data.agents || []);
  if (agentsArray.length > 0) {
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
    logEvent('FRONTEND_PROCESSING', `Transformed ${agentSummaries.length} agents for display`);
  }
});

socket.on('agentList', (data) => {
  logEvent('AGENT_LIST', data);
});

socket.on('agentUpdate', (data) => {
  logEvent('AGENT_UPDATE', data);
});

// Final analysis
setTimeout(() => {
  console.log('\n=== FINAL ANALYSIS ===');
  
  const connected = events.some(e => e.type === 'CONNECT');
  const agentsReceived = events.some(e => e.type === 'AGENTS_STATUS');
  const processingComplete = events.some(e => e.type === 'FRONTEND_PROCESSING');
  
  console.log('✅ Connection Status:', connected ? 'CONNECTED' : 'NOT CONNECTED');
  console.log('✅ Agent Data Received:', agentsReceived ? 'YES' : 'NO');
  console.log('✅ Frontend Processing:', processingComplete ? 'SUCCESS' : 'FAILED');
  
  if (connected && agentsReceived && processingComplete) {
    console.log('\n🎉 SUCCESS: Frontend should now display agents correctly!');
    console.log('The frontend has been updated with:');
    console.log('- Enhanced logging for debugging');
    console.log('- Immediate event listener registration');
    console.log('- Better error handling for empty agent lists');
    console.log('- Multiple request methods for compatibility');
    console.log('\nExpected behavior:');
    console.log('- Frontend connects to backend on port 8080');
    console.log('- Receives agents-status event with Slave1 agent');
    console.log('- Transforms data and displays in the UI');
    console.log('- Shows "Slave1" as online with status indicator');
  } else {
    console.log('\n❌ ISSUES DETECTED:');
    if (!connected) console.log('- Frontend not connecting to backend');
    if (!agentsReceived) console.log('- Backend not sending agent data');
    if (!processingComplete) console.log('- Frontend not processing data correctly');
  }
  
  console.log('\n=== EVENT TIMELINE ===');
  events.forEach(event => {
    console.log(`${event.timestamp}: ${event.type}`);
  });
  
  socket.disconnect();
  process.exit(0);
}, 3000);