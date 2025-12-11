import io from 'socket.io-client';

console.log('Testing connection status and timing...');

// Track connection events
const connectionEvents = [];
const agentEvents = [];

// Connect exactly like the frontend does
const socket = io('http://localhost:8080', {
  transports: ['websocket', 'polling'],
  timeout: 20000,
  forceNew: true,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5,
});

socket.on('connect', () => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ✅ Connected to backend`);
  connectionEvents.push({ event: 'connect', timestamp });
  
  // Simulate frontend behavior: request agents immediately after connection
  setTimeout(() => {
    console.log('Requesting agents after connection...');
    socket.emit('getAgents');
    socket.emit('get_agent_list', {});
  }, 100); // Small delay to simulate Redux state update
});

socket.on('connect_error', (error) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ❌ Connection error:`, error.message);
  connectionEvents.push({ event: 'connect_error', timestamp, error: error.message });
});

socket.on('disconnect', (reason) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ❌ Disconnected:`, reason);
  connectionEvents.push({ event: 'disconnect', timestamp, reason });
});

// Listen for agent events
socket.on('agents-status', (data) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ✅ Received agents-status:`, data);
  agentEvents.push({ event: 'agents-status', timestamp, data });
});

socket.on('agentList', (data) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ✅ Received agentList:`, data);
  agentEvents.push({ event: 'agentList', timestamp, data });
});

// Check results after a delay
setTimeout(() => {
  console.log('\n=== Connection Timeline ===');
  connectionEvents.forEach(event => {
    console.log(`${event.timestamp}: ${event.event}`, event.error || event.reason || '');
  });
  
  console.log('\n=== Agent Events Timeline ===');
  agentEvents.forEach(event => {
    console.log(`${event.timestamp}: ${event.event}`, event.data);
  });
  
  console.log('\n=== Analysis ===');
  const connected = connectionEvents.some(e => e.event === 'connect');
  const agentsReceived = agentEvents.length > 0;
  
  if (connected && agentsReceived) {
    console.log('✅ SUCCESS: Frontend should be working');
    console.log(`- Connection established: YES`);
    console.log(`- Agent data received: YES (${agentEvents.length} events)`);
    console.log(`- Issue might be in frontend Redux state or component rendering`);
  } else if (connected) {
    console.log('❌ ISSUE: Connected but no agent data received');
    console.log(`- Connection established: YES`);
    console.log(`- Agent data received: NO`);
    console.log(`- Check if backend is emitting events correctly`);
  } else {
    console.log('❌ ISSUE: Not connected to backend');
    console.log(`- Connection established: NO`);
    console.log(`- Agent data received: NO`);
    console.log(`- Check backend server and network connectivity`);
  }
  
  socket.disconnect();
  process.exit(0);
}, 5000);