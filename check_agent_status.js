import io from 'socket.io-client';

console.log('Connecting to MindServer to check agent status...');

const socket = io('http://localhost:8080');

socket.on('connect', () => {
  console.log('Connected to MindServer');
  console.log('Socket ID:', socket.id);
  
  // Listen for agents-status update (sent automatically on connection)
  // No need to emit anything - the server sends this automatically
});

socket.on('agents-status', (data) => {
  console.log('\n=== AGENTS STATUS ===');
  console.log('Number of agents:', data.length);
  
  data.forEach((agent, index) => {
    console.log(`\nAgent ${index + 1}:`);
    console.log('  Name:', agent.name);
    console.log('  In Game:', agent.in_game);
    console.log('  Viewer Port:', agent.viewer_port);
    console.log('  Socket Connected:', agent.socket_connected);
  });
  
  console.log('\n=== END AGENTS STATUS ===');
  socket.disconnect();
});

socket.on('agent_connected', (data) => {
  console.log('Agent connected:', data);
});

socket.on('agent_disconnected', (data) => {
  console.log('Agent disconnected:', data);
});

socket.on('connect_error', (error) => {
  console.error('Connection error:', error.message);
  process.exit(1);
});

socket.on('disconnect', () => {
  console.log('Disconnected from server');
  process.exit(0);
});

// Timeout after 10 seconds
setTimeout(() => {
  console.log('Timeout reached - no response from server');
  socket.disconnect();
  process.exit(1);
}, 10000);