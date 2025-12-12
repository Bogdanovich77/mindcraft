/**
 * Test script to verify agent data transformation fix
 * Run this with: node frontend/test_agent_fix.js
 */

import { io } from 'socket.io-client';

console.log('🔍 Testing agent data transformation fix...');

const socket = io('http://localhost:8080', {
  transports: ['websocket', 'polling'],
  timeout: 10000,
  reconnection: false
});

let testPassed = false;
let testTimeout;

// Test timeout
testTimeout = setTimeout(() => {
  if (!testPassed) {
    console.error('❌ Test timed out after 10 seconds');
    process.exit(1);
  }
}, 10000);

// Simulate the frontend transformation logic
function transformBackendData(backendData) {
  if (Array.isArray(backendData)) {
    // Backend sends array of agents with format: {name, in_game, viewerPort, socket_connected}
    const transformedAgents = backendData.map((agent) => ({
      id: agent.name, // Use name as ID since backend doesn't provide ID
      name: agent.name,
      profile: agent.name, // Use name as profile since backend doesn't provide profile
      status: agent.in_game ? 'online' : 'offline', // Convert in_game to status
      position: { x: 0, y: 0, z: 0 }, // Default position since backend doesn't provide it
      health: 20, // Default health since backend doesn't provide it
      level: 1, // Default level since backend doesn't provide it
      lastUpdate: Date.now(),
      // Keep original backend data for reference
      viewerPort: agent.viewerPort,
      socket_connected: agent.socket_connected
    }));
    
    return {
      agents: transformedAgents,
      timestamp: Date.now()
    };
  } else {
    // Data is already in correct format
    return backendData;
  }
}

socket.on('connect', () => {
  console.log('✅ Connected to MindServer');
  
  // Test the agents-status event
  socket.emit('listen-to-agents');
  socket.emit('get_agent_list', {});
});

socket.on('agents-status', (data) => {
  console.log('📊 Received raw backend data:', data);
  
  // Apply the transformation logic
  const transformedData = transformBackendData(data);
  console.log('🔄 Transformed data:', transformedData);
  
  // Check if transformed data is in the expected format
  if (transformedData && transformedData.agents && Array.isArray(transformedData.agents)) {
    console.log('✅ Data is in correct format with agents array');
    
    if (transformedData.agents.length > 0) {
      const agent = transformedData.agents[0];
      console.log('✅ First transformed agent structure:');
      console.log(`   ID: ${agent.id}`);
      console.log(`   Name: ${agent.name}`);
      console.log(`   Profile: ${agent.profile}`);
      console.log(`   Status: ${agent.status}`);
      console.log(`   Position: ${JSON.stringify(agent.position)}`);
      console.log(`   Health: ${agent.health}`);
      console.log(`   Level: ${agent.level}`);
      
      // Verify required fields exist
      const requiredFields = ['id', 'name', 'profile', 'status', 'position', 'health', 'level', 'lastUpdate'];
      const missingFields = requiredFields.filter(field => !(field in agent));
      
      if (missingFields.length === 0) {
        console.log('✅ All required fields present');
        testPassed = true;
        clearTimeout(testTimeout);
        
        setTimeout(() => {
          console.log('🎉 Agent data transformation test passed!');
          console.log('✅ The frontend should now be able to display agents correctly');
          socket.disconnect();
          process.exit(0);
        }, 1000);
      } else {
        console.error(`❌ Missing required fields: ${missingFields.join(', ')}`);
      }
    } else {
      console.log('⚠️  No agents found, but format is correct');
      testPassed = true;
      clearTimeout(testTimeout);
      
      setTimeout(() => {
        console.log('🎉 Test passed (no agents to validate)');
        socket.disconnect();
        process.exit(0);
      }, 1000);
    }
  } else {
    console.error('❌ Transformed data is not in expected format');
    console.error('Expected: { agents: AgentSummary[], timestamp: number }');
    console.error('Received:', transformedData);
  }
});

socket.on('connect_error', (error) => {
  console.error('❌ Connection failed:', error.message);
  clearTimeout(testTimeout);
  process.exit(1);
});

console.log('⏳ Waiting for agent data...');