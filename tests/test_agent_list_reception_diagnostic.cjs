const { io } = require('socket.io-client');
const http = require('http');

/**
 * Diagnostic test to investigate the Agent List Reception issue
 * This test will specifically examine why the agent list is not being received
 * despite the socket connection working properly.
 */

class AgentListReceptionDiagnostic {
  constructor() {
    this.testResults = [];
    this.socket = null;
    this.agentListReceived = false;
    this.receivedAgentList = null;
    this.eventLog = [];
  }

  log(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const logEntry = { timestamp, level, message, data };
    this.eventLog.push(logEntry);
    console.log(`[${timestamp}] [AGENT-LIST-DIAGNOSTIC] ${level}: ${message}`, data || '');
  }

  async testMindServerAgentList() {
    this.log('INFO', 'Testing MindServer agent list endpoint...');
    
    return new Promise((resolve) => {
      const options = {
        hostname: 'localhost',
        port: 8080,
        path: '/api/agents',
        method: 'GET',
        timeout: 5000
      };

      const req = http.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const agents = JSON.parse(data);
            this.log('SUCCESS', `MindServer agent list endpoint returned ${agents.length} agents`, agents);
            resolve({ success: true, agents });
          } catch (error) {
            this.log('ERROR', 'Failed to parse agent list from MindServer', error.message);
            resolve({ success: false, error: error.message });
          }
        });
      });

      req.on('error', (error) => {
        this.log('ERROR', 'MindServer agent list endpoint request failed', error.message);
        resolve({ success: false, error: error.message });
      });

      req.on('timeout', () => {
        this.log('ERROR', 'MindServer agent list endpoint request timed out');
        req.destroy();
        resolve({ success: false, error: 'Request timeout' });
      });

      req.end();
    });
  }

  async testSocketEventReception() {
    this.log('INFO', 'Testing socket event reception for agent list...');
    
    return new Promise((resolve) => {
      this.socket = io('http://localhost:8080', {
        transports: ['websocket'],
        timeout: 5000,
        forceNew: true
      });

      let eventReceived = false;
      let eventData = null;
      let timeoutId = null;

      const cleanup = () => {
        if (timeoutId) clearTimeout(timeoutId);
        if (this.socket) {
          this.socket.disconnect();
          this.socket = null;
        }
      };

      // Set up event listeners
      this.socket.on('connect', () => {
        this.log('INFO', 'Socket connected for agent list test', { socketId: this.socket.id });
      });

      this.socket.on('agents-status', (data) => {
        this.log('SUCCESS', 'Received agents-status event', data);
        eventReceived = true;
        eventData = data;
        cleanup();
        resolve({ success: true, event: 'agents-status', data });
      });

      this.socket.on('agentList', (data) => {
        this.log('SUCCESS', 'Received agentList event', data);
        eventReceived = true;
        eventData = data;
        cleanup();
        resolve({ success: true, event: 'agentList', data });
      });

      this.socket.on('agent-status', (data) => {
        this.log('INFO', 'Received agent-status event (individual agent)', data);
      });

      this.socket.on('connect_error', (error) => {
        this.log('ERROR', 'Socket connection error', error.message);
        cleanup();
        resolve({ success: false, error: error.message });
      });

      // Set timeout
      timeoutId = setTimeout(() => {
        this.log('ERROR', 'Socket event reception timeout');
        cleanup();
        resolve({ success: false, error: 'Event reception timeout' });
      }, 10000);

      // Connect
      this.socket.connect();
    });
  }

  async testSocketEventListening() {
    this.log('INFO', 'Testing socket event listening patterns...');
    
    return new Promise((resolve) => {
      this.socket = io('http://localhost:8080', {
        transports: ['websocket'],
        timeout: 5000,
        forceNew: true
      });

      const events = [];
      let timeoutId = null;

      const cleanup = () => {
        if (timeoutId) clearTimeout(timeoutId);
        if (this.socket) {
          this.socket.disconnect();
          this.socket = null;
        }
      };

      // Listen for ALL events
      this.socket.onAny((eventName, ...args) => {
        events.push({ event: eventName, data: args[0], timestamp: Date.now() });
        this.log('INFO', `Received event: ${eventName}`, args[0]);
      });

      this.socket.on('connect', () => {
        this.log('INFO', 'Socket connected for event listening test', { socketId: this.socket.id });
      });

      this.socket.on('connect_error', (error) => {
        this.log('ERROR', 'Socket connection error', error.message);
        cleanup();
        resolve({ success: false, error: error.message, events });
      });

      // Set timeout
      timeoutId = setTimeout(() => {
        this.log('INFO', 'Event listening test completed', { totalEvents: events.length, events });
        cleanup();
        resolve({ success: true, events });
      }, 15000);

      // Connect
      this.socket.connect();
    });
  }

  async testManualEventTrigger() {
    this.log('INFO', 'Testing manual event trigger to MindServer...');
    
    return new Promise((resolve) => {
      // Test if we can manually trigger agent list emission
      this.socket = io('http://localhost:8080', {
        transports: ['websocket'],
        timeout: 5000,
        forceNew: true
      });

      let eventReceived = false;
      let timeoutId = null;

      const cleanup = () => {
        if (timeoutId) clearTimeout(timeoutId);
        if (this.socket) {
          this.socket.disconnect();
          this.socket = null;
        }
      };

      this.socket.on('connect', () => {
        this.log('INFO', 'Socket connected for manual trigger test', { socketId: this.socket.id });
        
        // Try to request agent list
        this.log('INFO', 'Sending get-agents request to MindServer');
        this.socket.emit('get-agents');
        
        // Also try other possible event names
        this.socket.emit('getAgents');
        this.socket.emit('request-agents');
        this.socket.emit('getAgentList');
      });

      this.socket.on('agents-status', (data) => {
        this.log('SUCCESS', 'Received agents-status after manual trigger', data);
        eventReceived = true;
        cleanup();
        resolve({ success: true, event: 'agents-status', data, trigger: 'manual' });
      });

      this.socket.on('agentList', (data) => {
        this.log('SUCCESS', 'Received agentList after manual trigger', data);
        eventReceived = true;
        cleanup();
        resolve({ success: true, event: 'agentList', data, trigger: 'manual' });
      });

      this.socket.on('connect_error', (error) => {
        this.log('ERROR', 'Socket connection error', error.message);
        cleanup();
        resolve({ success: false, error: error.message });
      });

      // Set timeout
      timeoutId = setTimeout(() => {
        this.log('ERROR', 'Manual event trigger test timed out');
        cleanup();
        resolve({ success: false, error: 'Manual trigger timeout' });
      }, 10000);

      // Connect
      this.socket.connect();
    });
  }

  async runDiagnostic() {
    this.log('INFO', 'Starting Agent List Reception Diagnostic...');
    
    const results = {
      mindServerApi: null,
      socketEventReception: null,
      socketEventListening: null,
      manualEventTrigger: null,
      eventLog: this.eventLog
    };

    try {
      // Test 1: Check MindServer API directly
      this.log('INFO', '=== Test 1: MindServer API Check ===');
      results.mindServerApi = await this.testMindServerAgentList();
      await this.sleep(1000);

      // Test 2: Test socket event reception
      this.log('INFO', '=== Test 2: Socket Event Reception ===');
      results.socketEventReception = await this.testSocketEventReception();
      await this.sleep(1000);

      // Test 3: Listen to all socket events
      this.log('INFO', '=== Test 3: Socket Event Listening ===');
      results.socketEventListening = await this.testSocketEventListening();
      await this.sleep(1000);

      // Test 4: Manual event trigger
      this.log('INFO', '=== Test 4: Manual Event Trigger ===');
      results.manualEventTrigger = await this.testManualEventTrigger();
      await this.sleep(1000);

    } catch (error) {
      this.log('ERROR', 'Diagnostic failed', error);
    }

    // Generate recommendations
    const recommendations = this.generateRecommendations(results);
    
    // Save report
    const report = {
      timestamp: new Date().toISOString(),
      results,
      recommendations,
      summary: {
        totalTests: 4,
        successfulTests: Object.values(results).filter(r => r && r.success).length,
        failedTests: Object.values(results).filter(r => r && !r.success).length
      }
    };

    require('fs').writeFileSync(
      'AGENT_LIST_RECEPTION_DIAGNOSTIC_REPORT.json',
      JSON.stringify(report, null, 2)
    );

    this.log('INFO', 'Diagnostic complete', report.summary);
    this.log('INFO', 'Report saved to: AGENT_LIST_RECEPTION_DIAGNOSTIC_REPORT.json');

    return report;
  }

  generateRecommendations(results) {
    const recommendations = [];

    if (!results.mindServerApi?.success) {
      recommendations.push('MindServer API endpoint is not accessible - check if server is running correctly');
    }

    if (!results.socketEventReception?.success) {
      recommendations.push('Socket event reception failed - check event names and MindServer emission logic');
    }

    if (results.socketEventListening?.success && results.socketEventListening.events.length === 0) {
      recommendations.push('No events received from MindServer - check if agent data is being emitted');
    }

    if (results.manualEventTrigger?.success) {
      recommendations.push('Manual trigger worked - implement automatic agent list request in frontend');
    }

    if (!results.manualEventTrigger?.success) {
      recommendations.push('Manual trigger failed - check MindServer event handling implementation');
    }

    return recommendations;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Run the diagnostic
async function main() {
  const diagnostic = new AgentListReceptionDiagnostic();
  await diagnostic.runDiagnostic();
  process.exit(0);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = AgentListReceptionDiagnostic;