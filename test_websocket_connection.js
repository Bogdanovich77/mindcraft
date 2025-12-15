/**
 * Test WebSocket Connection to FastAPI Gateway
 * This script tests the WebSocket connection and authentication flow
 */

const { io } = require('socket.io-client');

console.log('🔍 Testing WebSocket Connection to FastAPI Gateway...');
console.log('==================================================');

async function testWebSocketConnection() {
  try {
    // Connect to the FastAPI Gateway WebSocket endpoint
    console.log('📡 Connecting to ws://localhost:8000...');
    
    const socket = io('http://localhost:8000', {
      transports: ['websocket', 'polling'],
      timeout: 10000,
      forceNew: true,
      reconnection: false
    });

    // Set up event handlers
    socket.on('connect', () => {
      console.log('✅ Connected successfully to WebSocket server');
      console.log(`🆔 Socket ID: ${socket.id}`);
      
      // Test authentication after connection
      console.log('🔐 Testing authentication...');
      
      // Create a simple JWT token for testing (in real app, this would come from auth)
      const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0LXVzZXIiLCJpYXQiOjE2NjU3NjkwNTZ9.test-signature';
      
      socket.emit('authenticate', { token: testToken });
    });

    socket.on('authenticated', (data) => {
      console.log('✅ Authentication successful:', data);
      
      // Test sending a message that requires authentication
      console.log('📨 Testing authenticated message...');
      socket.emit('get_agent_list', {});
    });

    socket.on('authentication_error', (error) => {
      console.log('❌ Authentication failed:', error);
      
      // Try without authentication to see what happens
      console.log('📨 Testing message without authentication...');
      socket.emit('get_agent_list', {});
    });

    socket.on('connect_error', (error) => {
      console.error('❌ Connection failed:', error.message);
      process.exit(1);
    });

    socket.on('error', (error) => {
      console.error('❌ Socket error:', error);
    });

    socket.on('agents-status', (data) => {
      console.log('✅ Received agent list response:', data);
      console.log('🎉 WebSocket connection and authentication working!');
      socket.disconnect();
      process.exit(0);
    });

    // Timeout after 15 seconds
    setTimeout(() => {
      console.log('⏰ Test timeout - disconnecting...');
      socket.disconnect();
      process.exit(1);
    }, 15000);

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test
testWebSocketConnection();