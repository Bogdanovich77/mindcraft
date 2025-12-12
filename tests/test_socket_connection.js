import io from 'socket.io-client';

console.log('Testing Socket.IO connection to backend...');

// Connect to the backend
const socket = io('http://localhost:8080');

socket.on('connect', () => {
  console.log('Connected to backend server with socket ID:', socket.id);
  
  // Request agent list
  console.log('Requesting agent list...');
  socket.emit('listen-to-agents', {});
});

socket.on('disconnect', () => {
  console.log('Disconnected from backend server');
});

socket.on('agents-status', (data) => {
  console.log('Received agents-status event:', data);
  process.exit(0);
});

socket.on('agentList', (data) => {
  console.log('Received agentList event:', data);
  process.exit(0);
});

socket.on('connect_error', (error) => {
  console.error('Connection error:', error);
  process.exit(1);
});

// Timeout after 5 seconds
setTimeout(() => {
  console.log('Test timed out after 5 seconds');
  process.exit(1);
}, 5000);