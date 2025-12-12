import io from 'socket.io-client';

console.log('Testing direct Socket.IO connection to backend...');

// Connect to the backend
const socket = io('http://localhost:8080', {
  transports: ['websocket', 'polling'],
  timeout: 5000,
  forceNew: true
});

let connected = false;
let agentsReceived = false;

socket.on('connect', () => {
  console.log('✅ Connected to backend Socket.IO server');
  connected = true;
  
  // Request agent list
  console.log('Requesting agent list...');
  socket.emit('get_agent_list', {});
  socket.emit('getAgents', {});
});

socket.on('connect_error', (error) => {
  console.error('❌ Connection error:', error.message);
});

socket.on('agents-status', (data) => {
  console.log('✅ Received agents-status event:', data);
  agentsReceived = true;
  
  if (Array.isArray(data)) {
    console.log(`✅ Found ${data.length} agents:`);
    data.forEach((agent, index) => {
      console.log(`  ${index + 1}. ${agent.name} (in_game: ${agent.in_game}, viewerPort: ${agent.viewerPort})`);
    });
  } else {
    console.log('❌ Data is not an array:', typeof data, data);
  }
});

socket.on('agentList', (data) => {
  console.log('✅ Received agentList event:', data);
  agentsReceived = true;
});

socket.on('system_status', (data) => {
  console.log('✅ Received system status:', data);
});

socket.on('disconnect', () => {
  console.log('❌ Disconnected from backend');
});

// Set a timeout to check results
setTimeout(() => {
  if (!connected) {
    console.log('❌ Failed to connect to backend Socket.IO server');
  } else if (!agentsReceived) {
    console.log('❌ Connected but no agents data received');
  } else {
    console.log('✅ Success: Backend is working and sending agent data');
  }
  
  socket.disconnect();
  process.exit(0);
}, 5000);