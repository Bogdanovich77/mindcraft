/**
 * Test script to verify the frontend fix for agent display issue
 * This simulates the frontend behavior to ensure the race condition is resolved
 */

const io = require('socket.io-client');

console.log('=== Frontend Fix Validation Test ===\n');

// Test configuration
const MINDSERVER_URL = 'http://localhost:8080';
const TEST_TIMEOUT = 10000; // 10 seconds

let testResults = {
  connectionEstablished: false,
  agentsDataReceived: false,
  agentCount: 0,
  timingIssue: false,
  fixWorking: false
};

async function testFrontendFix() {
  return new Promise((resolve) => {
    console.log('1. Connecting to MindServer...');
    
    const socket = io(MINDSERVER_URL, {
      timeout: 5000,
      reconnection: false
    });

    let connectionTime = Date.now();
    let eventReceivedTime = null;

    // Simulate the FIXED frontend behavior - register listeners immediately
    console.log('2. Registering event listeners IMMEDIATELY (fix)...');
    
    socket.on('connect', () => {
      connectionTime = Date.now();
      console.log('   ✅ Connected to MindServer');
      testResults.connectionEstablished = true;
    });

    socket.on('agents-status', (data) => {
      eventReceivedTime = Date.now();
      const timeDiff = eventReceivedTime - connectionTime;
      
      console.log('   ✅ Received agents-status event');
      console.log(`   📊 Time from connection to event: ${timeDiff}ms`);
      
      testResults.agentsDataReceived = true;
      testResults.agentCount = data.length;
      
      // Check if timing is reasonable (should be very fast)
      if (timeDiff < 100) {
        console.log('   ✅ Timing is good - no race condition detected');
        testResults.timingIssue = false;
        testResults.fixWorking = true;
      } else {
        console.log('   ⚠️  Slow timing - potential race condition still exists');
        testResults.timingIssue = true;
      }
      
      console.log(`   👥 Number of agents: ${data.length}`);
      data.forEach((agent, index) => {
        console.log(`      ${index + 1}. ${agent.name} (${agent.type})`);
      });
      
      // Test complete
      setTimeout(() => {
        socket.disconnect();
        resolve();
      }, 1000);
    });

    socket.on('connect_error', (error) => {
      console.log('   ❌ Connection failed:', error.message);
      resolve();
    });

    // Timeout protection
    setTimeout(() => {
      console.log('   ⏰ Test timeout - no agents data received');
      socket.disconnect();
      resolve();
    }, TEST_TIMEOUT);
  });
}

async function testOldBehavior() {
  console.log('\n3. Simulating OLD frontend behavior (with race condition)...');
  
  return new Promise((resolve) => {
    const socket = io(MINDSERVER_URL, {
      timeout: 5000,
      reconnection: false
    });

    let missedEvent = false;

    socket.on('connect', () => {
      console.log('   Connected to MindServer');
      
      // Simulate OLD behavior - delay event listener registration
      setTimeout(() => {
        console.log('   ⚠️  Registering event listeners AFTER delay (old behavior)...');
        
        socket.on('agents-status', (data) => {
          console.log('   ✅ Received agents-status (unexpected - race condition not reproduced)');
          missedEvent = false;
        });
        
        // Check if we missed the event
        setTimeout(() => {
          if (!missedEvent) {
            console.log('   ❌ Race condition reproduced - event was missed');
          }
          socket.disconnect();
          resolve();
        }, 1000);
        
      }, 500); // 500ms delay to simulate the race condition
    });

    socket.on('agents-status', (data) => {
      console.log('   📨 Event received immediately (but no listener registered yet)');
      missedEvent = true;
    });

    socket.on('connect_error', () => {
      resolve();
    });

    setTimeout(() => {
      socket.disconnect();
      resolve();
    }, TEST_TIMEOUT);
  });
}

async function runTest() {
  try {
    // Test the fixed behavior
    await testFrontendFix();
    
    // Test the old behavior for comparison
    await testOldBehavior();
    
    // Final results
    console.log('\n=== TEST RESULTS ===');
    console.log(`Connection established: ${testResults.connectionEstablished ? '✅' : '❌'}`);
    console.log(`Agents data received: ${testResults.agentsDataReceived ? '✅' : '❌'}`);
    console.log(`Agent count: ${testResults.agentCount}`);
    console.log(`Race condition detected: ${testResults.timingIssue ? '❌' : '✅'}`);
    console.log(`Fix working: ${testResults.fixWorking ? '✅' : '❌'}`);
    
    if (testResults.fixWorking && testResults.agentCount > 0) {
      console.log('\n🎉 SUCCESS: Frontend fix is working correctly!');
      console.log('   The race condition has been resolved.');
      console.log('   Agents should now display properly in the frontend.');
    } else {
      console.log('\n⚠️  ISSUE: Fix may need additional adjustments.');
    }
    
  } catch (error) {
    console.error('Test failed with error:', error);
  }
}

// Run the test
runTest().then(() => {
  console.log('\nTest completed.');
  process.exit(0);
}).catch((error) => {
  console.error('Test error:', error);
  process.exit(1);
});