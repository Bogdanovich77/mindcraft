import io from 'socket.io-client';

console.log('Testing agent visibility in MindServer UI...');

// Connect to the MindServer
const socket = io('http://localhost:8080');

socket.on('connect', () => {
  console.log('✓ Connected to MindServer on port 8080');
  console.log('Socket ID:', socket.id);
});

socket.on('agents-status', (agents) => {
  console.log('\n=== AGENTS STATUS ===');
  console.log(`Number of agents: ${agents.length}`);
  
  if (agents.length === 0) {
    console.log('❌ No agents found in the system');
  } else {
    agents.forEach((agent, index) => {
      console.log(`\nAgent ${index + 1}:`);
      console.log(`  Name: ${agent.name}`);
      console.log(`  In game: ${agent.in_game}`);
      console.log(`  Viewer port: ${agent.viewer_port}`);
      console.log(`  Socket connected: ${agent.socket_connected}`);
    });
    console.log('\n✓ Agents are visible in the UI!');
  }
  
  // Disconnect after receiving the status
  setTimeout(() => {
    socket.disconnect();
    process.exit(0);
  }, 1000);
});

socket.on('connect_error', (error) => {
  console.error('❌ Failed to connect to MindServer:', error.message);
  process.exit(1);
});

// Timeout after 5 seconds
setTimeout(() => {
  console.error('❌ Timeout: Did not receive agent status');
  socket.disconnect();
  process.exit(1);
}, 5000);