/**
 * Simple connection test script to verify WebSocket connectivity
 * Run this with: node frontend/test_connection.js
 */

import { io } from 'socket.io-client';

console.log('🔍 Testing WebSocket connection to MindServer...');
console.log('Make sure the backend is running with: npm run dev or node main.js');
console.log('');

const socket = io('http://localhost:8000', {
  transports: ['websocket', 'polling'],
  timeout: 10000,
  reconnection: false
});

let testPassed = false;
let testTimeout;

// Test timeout
testTimeout = setTimeout(() => {
  if (!testPassed) {
    console.error('❌ Connection test timed out after 10 seconds');
    console.log('');
    console.log('🔧 Troubleshooting:');
    console.log('1. Ensure the MindServer backend is running');
    console.log('2. Check that port 8000 is not blocked');
    console.log('3. Verify no other application is using port 8000');
    console.log('4. Try restarting the backend server');
    process.exit(1);
  }
}, 10000);

socket.on('connect', () => {
  console.log('✅ Successfully connected to MindServer!');
  console.log(`📡 Socket ID: ${socket.id}`);
  
  // Test basic events
  socket.emit('listen-to-agents');
  socket.emit('get_agent_list', {});
  
  testPassed = true;
  clearTimeout(testTimeout);
  
  setTimeout(() => {
    console.log('🎉 Connection test completed successfully!');
    socket.disconnect();
    process.exit(0);
  }, 2000);
});

socket.on('connect_error', (error) => {
  console.error('❌ Connection failed:', error.message);
  console.log('');
  
  // Provide specific troubleshooting based on error
  if (error.message.includes('ECONNREFUSED')) {
    console.error('🔍 Root cause: Backend server is not running');
    console.log('💡 Solution: Start the backend with: npm run dev or node main.js');
  } else if (error.message.includes('timeout')) {
    console.error('🔍 Root cause: Connection timeout');
    console.log('💡 Solution: Check if server is overloaded or network issues exist');
  } else {
    console.error('🔍 Root cause: Unknown connection issue');
    console.log('💡 Solution: Check server logs and try restarting');
  }
  
  clearTimeout(testTimeout);
  process.exit(1);
});

socket.on('agents-status', (data) => {
  console.log('📊 Received agents status:', data);
});

socket.on('disconnect', (reason) => {
  console.log(`🔌 Disconnected: ${reason}`);
});

console.log('⏳ Waiting for connection...');