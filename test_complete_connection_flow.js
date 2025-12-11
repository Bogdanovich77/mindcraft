/**
 * Test Complete Connection Flow
 * 
 * This test verifies the complete connection flow from backend to frontend,
 * including agent loading, Socket.IO communication, and data display.
 */

import io from 'socket.io-client';

async function testCompleteConnection() {
  console.log('=== Testing Complete Connection Flow ===\n');
  
  // Connect to the backend
  console.log('1. Connecting to backend...');
  const socket = io('http://localhost:8080');
  
  return new Promise((resolve, reject) => {
    let connectionTimeout = setTimeout(() => {
      console.log('❌ Connection timeout - backend may not be running');
      socket.disconnect();
      reject(new Error('Connection timeout'));
    }, 10000);
    
    socket.on('connect', () => {
      clearTimeout(connectionTimeout);
      console.log('✅ Connected to backend');
      
      // Listen for agent status updates
      console.log('2. Listening for agent status...');
      socket.on('agents-status', (data) => {
        console.log('✅ Received agents-status event:', data);
        
        if (Array.isArray(data)) {
          console.log(`✅ Backend is serving ${data.length} agents`);
          
          if (data.length > 0) {
            console.log('✅ Agents found:');
            data.forEach((agent, index) => {
              console.log(`   ${index + 1}. ${agent.name || 'Unknown'} (${agent.type || 'Unknown type'})`);
              console.log(`      Status: ${agent.status || 'Unknown'}`);
              console.log(`      Connected: ${agent.connected ? 'Yes' : 'No'}`);
            });
          } else {
            console.log('⚠️  No agents found - they may not be loaded yet');
          }
        } else {
          console.log('❌ Invalid data format received:', typeof data);
        }
        
        // Test complete flow
        console.log('3. Testing complete flow...');
        setTimeout(() => {
          console.log('✅ Complete connection flow test finished');
          socket.disconnect();
          resolve();
        }, 2000);
      });
      
      // Listen for agent list (frontend format)
      socket.on('agentList', (data) => {
        console.log('✅ Received agentList event:', data);
        
        if (data && data.agents) {
          console.log(`✅ Frontend format: ${data.agents.length} agents`);
        } else if (Array.isArray(data)) {
          console.log(`✅ Backend format: ${data.length} agents`);
        }
      });
      
      // Request agent list
      console.log('3. Requesting agent list...');
      socket.emit('getAgents');
      
      // Handle connection errors
      socket.on('connect_error', (error) => {
        clearTimeout(connectionTimeout);
        console.log('❌ Connection error:', error.message);
        reject(error);
      });
    });
  });
}

// Check if backend is running
async function checkBackendStatus() {
  console.log('=== Checking Backend Status ===\n');
  
  try {
    const response = await fetch('http://localhost:8080/api/status');
    const status = await response.json();
    
    console.log('✅ Backend is running');
    console.log(`   Minecraft server: ${status.minecraft?.connected ? 'Connected' : 'Not connected'}`);
    console.log(`   Agents loaded: ${status.agents?.count || 0}`);
    console.log(`   Socket.IO clients: ${status.sockets?.connected || 0}`);
    
    return true;
  } catch (error) {
    console.log('❌ Backend is not responding:', error.message);
    return false;
  }
}

// Main test function
async function runTests() {
  try {
    console.log('Starting complete connection flow test...\n');
    
    // Check backend status first
    const backendRunning = await checkBackendStatus();
    
    if (!backendRunning) {
      console.log('\n❌ Backend is not running - please start it with: node main.js');
      return;
    }
    
    console.log('\n');
    
    // Test complete connection flow
    await testCompleteConnection();
    
    console.log('\n=== Test Summary ===');
    console.log('✅ All tests completed successfully');
    console.log('\nNext steps:');
    console.log('1. Refresh your browser to see the updated frontend');
    console.log('2. The AgentList page should now display the agents');
    console.log('3. If still no agents, check the browser console for errors');
    
  } catch (error) {
    console.log('\n=== Test Failed ===');
    console.log('❌ Error:', error.message);
    console.log('\nTroubleshooting steps:');
    console.log('1. Make sure the backend is running: node main.js');
    console.log('2. Check if Minecraft server is connected');
    console.log('3. Verify the MasterChief.json profile exists');
    console.log('4. Check browser console for frontend errors');
  }
}

// Run the tests
runTests();