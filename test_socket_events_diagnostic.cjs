/**
 * Socket Events Diagnostic Test
 * 
 * This test specifically investigates the socket event flow between
 * MindServer and the frontend to identify why agent data is not being received.
 */

const io = require('socket.io-client');

const TEST_CONFIG = {
  MINDSERVER_URL: 'http://localhost:8080',
  TIMEOUT: 10000
};

function log(message, level = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [SOCKET-DIAGNOSTIC]`;
  
  switch (level) {
    case 'error':
      console.error(`${prefix} ERROR: ${message}`);
      break;
    case 'warn':
      console.warn(`${prefix} WARN: ${message}`);
      break;
    case 'success':
      console.log(`${prefix} SUCCESS: ${message}`);
      break;
    default:
      console.log(`${prefix} INFO: ${message}`);
  }
}

async function testSocketEvents() {
  log('Starting Socket Events Diagnostic Test...');
  
  return new Promise((resolve, reject) => {
    const socket = io(TEST_CONFIG.MINDSERVER_URL);
    const events = [];
    let testCompleted = false;
    
    // Track all events
    const originalEmit = socket.emit;
    const originalOn = socket.on;
    
    socket.emit = function(event, ...args) {
      log(`EMIT: ${event} - ${JSON.stringify(args)}`);
      events.push({ type: 'emit', event, data: args, timestamp: Date.now() });
      return originalEmit.apply(this, [event, ...args]);
    };
    
    socket.on = function(event, callback) {
      const wrappedCallback = (...args) => {
        log(`RECEIVED: ${event} - ${JSON.stringify(args)}`);
        events.push({ type: 'receive', event, data: args, timestamp: Date.now() });
        return callback.apply(this, args);
      };
      return originalOn.call(this, event, wrappedCallback);
    };
    
    // Connection events
    socket.on('connect', () => {
      log('Connected to MindServer', 'success');
      
      // Test different event names that might be used
      setTimeout(() => {
        if (!testCompleted) {
          log('Testing various agent list event names...');
          
          // Try different event names
          socket.emit('get_agent_list', {});
          socket.emit('getAgents', {});
          socket.emit('get-agent-list', {});
          socket.emit('list_agents', {});
          socket.emit('agent_list', {});
          socket.emit('listen-to-agents', {});
          socket.emit('listenToAgents', {});
          socket.emit('subscribe_agents', {});
        }
      }, 1000);
    });
    
    socket.on('connect_error', (error) => {
      log(`Connection error: ${error.message}`, 'error');
      if (!testCompleted) {
        testCompleted = true;
        reject(error);
      }
    });
    
    // Listen for all possible agent-related events
    const possibleEvents = [
      'agents-status',
      'agentStatus',
      'agent-status',
      'agents_status',
      'agentList',
      'agent-list',
      'agent_list',
      'agents',
      'state-update',
      'stateUpdate',
      'state-update',
      'agentUpdate',
      'agent-update',
      'agent_update',
      'agent:state',
      'agent:connected',
      'agent:disconnected',
      'system:status',
      'systemStatus'
    ];
    
    possibleEvents.forEach(eventName => {
      socket.on(eventName, (data) => {
        log(`Received event: ${eventName}`, 'success');
        log(`Data: ${JSON.stringify(data, null, 2)}`);
        
        // Check if this is agent data
        if (Array.isArray(data) || (data && data.agents && Array.isArray(data.agents))) {
          log('Found agent data!', 'success');
          if (!testCompleted) {
            testCompleted = true;
            resolve({
              success: true,
              eventName,
              data,
              events
            });
          }
        }
      });
    });
    
    // Generic event listener to catch everything
    socket.onAny((eventName, ...args) => {
      log(`ANY EVENT: ${eventName} - ${JSON.stringify(args)}`);
    });
    
    // Timeout
    setTimeout(() => {
      if (!testCompleted) {
        testCompleted = true;
        log('Test timeout - no agent data received', 'warn');
        resolve({
          success: false,
          error: 'Timeout - no agent data received',
          events,
          allEvents: events
        });
      }
    }, TEST_CONFIG.TIMEOUT);
  });
}

async function testMindServerEndpoints() {
  log('Testing MindServer HTTP endpoints...');
  
  const http = require('http');
  
  const endpoints = [
    '/',
    '/agents',
    '/api/agents',
    '/status',
    '/api/status',
    '/health',
    '/api/health'
  ];
  
  const results = [];
  
  for (const endpoint of endpoints) {
    try {
      const response = await new Promise((resolve, reject) => {
        const req = http.get(`http://localhost:8080${endpoint}`, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => resolve({ statusCode: res.statusCode, data }));
        });
        
        req.on('error', reject);
        req.setTimeout(5000, () => {
          req.destroy();
          reject(new Error('Request timeout'));
        });
      });
      
      results.push({ endpoint, success: true, statusCode: response.statusCode, data: response.data });
      log(`Endpoint ${endpoint}: ${response.statusCode}`, 'success');
    } catch (error) {
      results.push({ endpoint, success: false, error: error.message });
      log(`Endpoint ${endpoint}: ${error.message}`, 'error');
    }
  }
  
  return results;
}

async function checkAgentFiles() {
  log('Checking agent configuration files...');
  
  const fs = require('fs');
  const path = require('path');
  
  const agentFiles = [
    'MasterChief.json',
    'Slave1.json', 
    'AlphaSurvivor.json',
    'andy.json',
    'andy-4.json'
  ];
  
  const results = [];
  
  for (const filename of agentFiles) {
    try {
      const filepath = path.join(process.cwd(), filename);
      if (fs.existsSync(filepath)) {
        const content = JSON.parse(fs.readFileSync(filepath, 'utf8'));
        results.push({ filename, exists: true, valid: true, content: content.name || 'Unknown' });
        log(`Agent file ${filename}: Found (${content.name || 'Unknown'})`, 'success');
      } else {
        results.push({ filename, exists: false });
        log(`Agent file ${filename}: Not found`, 'warn');
      }
    } catch (error) {
      results.push({ filename, exists: true, valid: false, error: error.message });
      log(`Agent file ${filename}: Invalid - ${error.message}`, 'error');
    }
  }
  
  return results;
}

async function runDiagnostics() {
  log('=== SOCKET EVENTS DIAGNOSTIC TEST ===');
  
  try {
    // Test 1: Check agent files
    log('\n--- Test 1: Agent Files ---');
    const agentFilesResult = await checkAgentFiles();
    
    // Test 2: Test HTTP endpoints
    log('\n--- Test 2: HTTP Endpoints ---');
    const endpointsResult = await testMindServerEndpoints();
    
    // Test 3: Test socket events
    log('\n--- Test 3: Socket Events ---');
    const socketResult = await testSocketEvents();
    
    // Generate report
    const report = {
      timestamp: new Date().toISOString(),
      agentFiles: agentFilesResult,
      httpEndpoints: endpointsResult,
      socketEvents: socketResult,
      summary: {
        agentFilesFound: agentFilesResult.filter(f => f.exists).length,
        endpointsWorking: endpointsResult.filter(e => e.success).length,
        socketDataReceived: socketResult.success
      }
    };
    
    // Save report
    const fs = require('fs');
    fs.writeFileSync(
      'SOCKET_EVENTS_DIAGNOSTIC_REPORT.json',
      JSON.stringify(report, null, 2)
    );
    
    // Display summary
    log('\n=== DIAGNOSTIC SUMMARY ===');
    log(`Agent Files Found: ${report.summary.agentFilesFound}`);
    log(`HTTP Endpoints Working: ${report.summary.endpointsWorking}`);
    log(`Socket Data Received: ${report.summary.socketDataReceived ? 'YES' : 'NO'}`);
    
    if (!socketResult.success) {
      log('\n=== ISSUES FOUND ===');
      log('Socket events are not returning agent data', 'error');
      log('Possible causes:', 'warn');
      log('1. Agents are not running in MindServer', 'warn');
      log('2. Socket event names are different than expected', 'warn');
      log('3. MindServer is not emitting agent data', 'warn');
      log('4. Authentication or authorization required', 'warn');
      
      if (socketResult.events && socketResult.events.length > 0) {
        log('\n=== EVENTS LOGGED ===');
        socketResult.events.forEach(event => {
          log(`${event.type.toUpperCase()}: ${event.event} at ${new Date(event.timestamp).toISOString()}`);
        });
      }
    }
    
    log('\nDetailed report saved to: SOCKET_EVENTS_DIAGNOSTIC_REPORT.json');
    
  } catch (error) {
    log(`Diagnostic test failed: ${error.message}`, 'error');
    process.exit(1);
  }
}

// Run diagnostics
if (require.main === module) {
  runDiagnostics();
}

module.exports = { runDiagnostics, testSocketEvents };