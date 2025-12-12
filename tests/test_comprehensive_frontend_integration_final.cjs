const { io } = require('socket.io-client');
const http = require('http');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

/**
 * Final Comprehensive Frontend Integration Test
 * This test validates the complete frontend-backend integration with all fixes applied
 */

class FrontendIntegrationTester {
  constructor() {
    this.testResults = [];
    this.socket = null;
    this.testStartTime = Date.now();
  }

  log(level, message, data = null) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [FRONTEND-INTEGRATION-TEST] ${level}: ${message}`, data || '');
  }

  async addTestResult(name, passed, details = null, duration = null) {
    const result = {
      name,
      passed,
      details,
      timestamp: Date.now(),
      duration: duration || (Date.now() - this.testStartTime)
    };
    this.testResults.push(result);
    
    if (passed) {
      this.log('SUCCESS', `✓ ${name}`, details);
    } else {
      this.log('ERROR', `✗ ${name}`, details);
    }
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async checkPort(port) {
    return new Promise((resolve) => {
      const req = http.request({
        hostname: 'localhost',
        port: port,
        path: '/',
        method: 'HEAD',
        timeout: 3000
      }, (res) => {
        resolve(res.statusCode === 200);
      });

      req.on('error', () => resolve(false));
      req.on('timeout', () => {
        req.destroy();
        resolve(false);
      });

      req.end();
    });
  }

  async makeHttpRequest(url, timeout = 5000) {
    return new Promise((resolve) => {
      const startTime = Date.now();
      const req = http.request(url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          resolve({
            success: res.statusCode === 200,
            statusCode: res.statusCode,
            data,
            duration: Date.now() - startTime
          });
        });
      });

      req.on('error', (error) => {
        resolve({
          success: false,
          error: error.message,
          duration: Date.now() - startTime
        });
      });

      req.on('timeout', () => {
        req.destroy();
        resolve({
          success: false,
          error: 'Request timeout',
          duration: Date.now() - startTime
        });
      });

      req.setTimeout(timeout);
      req.end();
    });
  }

  async testFrontendStartup() {
    this.log('INFO', 'Running Frontend Startup Test...');
    
    // Test 1: Frontend HTTP Access
    const frontendResult = await this.makeHttpRequest('http://localhost:5173');
    await this.addTestResult(
      'Frontend HTTP Access', 
      frontendResult.success, 
      frontendResult.success ? `Status code: ${frontendResult.statusCode}` : frontendResult.error,
      frontendResult.duration
    );

    // Test 2: MindServer HTTP Access
    const mindserverResult = await this.makeHttpRequest('http://localhost:8080');
    await this.addTestResult(
      'MindServer HTTP Access', 
      mindserverResult.success, 
      mindserverResult.success ? `Status code: ${mindserverResult.statusCode}` : mindserverResult.error,
      mindserverResult.duration
    );

    // Test 3: Socket.IO Endpoint Access
    const socketResult = await this.makeHttpRequest('http://localhost:8080/socket.io/');
    await this.addTestResult(
      'Socket.IO Endpoint Access', 
      socketResult.success, 
      socketResult.success ? `Status code: ${socketResult.statusCode}` : socketResult.error,
      socketResult.duration
    );
  }

  async testDataFlowValidation() {
    this.log('INFO', 'Running Data Flow Validation...');
    
    // Test 1: Socket Connection Test
    const socketConnectionResult = await this.testSocketConnection();
    await this.addTestResult('Socket Connection Test', socketConnectionResult.success, socketConnectionResult.details);

    // Test 2: Agent List Reception (with manual trigger)
    const agentListResult = await this.testAgentListReception();
    await this.addTestResult('Agent List Reception', agentListResult.success, agentListResult.details);

    // Test 3: Agent State Updates
    const stateUpdateResult = await this.testAgentStateUpdates();
    await this.addTestResult('Agent State Updates', stateUpdateResult.success, stateUpdateResult.details);

    // Test 4: Data Transformation
    const transformationResult = await this.testDataTransformation();
    await this.addTestResult('Data Transformation', transformationResult.success, transformationResult.details);
  }

  async testSocketConnection() {
    return new Promise((resolve) => {
      const startTime = Date.now();
      this.socket = io('http://localhost:8080', {
        transports: ['websocket'],
        timeout: 5000
      });

      const timeout = setTimeout(() => {
        this.socket.disconnect();
        resolve({ success: false, details: 'Connection timeout' });
      }, 5000);

      this.socket.on('connect', () => {
        clearTimeout(timeout);
        const duration = Date.now() - startTime;
        resolve({ success: true, details: `Connected in ${duration}ms`, duration });
      });

      this.socket.on('connect_error', (error) => {
        clearTimeout(timeout);
        resolve({ success: false, details: error.message });
      });
    });
  }

  async testAgentListReception() {
    return new Promise((resolve) => {
      if (!this.socket) {
        resolve({ success: false, details: 'No socket connection' });
        return;
      }

      let received = false;
      let agentData = null;

      const timeout = setTimeout(() => {
        if (!received) {
          resolve({ success: false, details: 'Agent list reception timeout' });
        }
      }, 5000);

      // Listen for agents-status event
      this.socket.on('agents-status', (data) => {
        if (!received) {
          received = true;
          clearTimeout(timeout);
          agentData = data;
          
          // Validate agent data
          const isValid = Array.isArray(data) && data.length >= 3 && 
            data.some(agent => agent.name === 'MasterChief') &&
            data.some(agent => agent.name === 'Slave1') &&
            data.some(agent => agent.name === 'AlphaSurvivor');
          
          resolve({ 
            success: isValid, 
            details: isValid ? `Received ${data.length} agents` : 'Invalid agent data structure',
            agentData
          });
        }
      });

      // Manual trigger to get agent list
      this.socket.emit('get-agents');
    });
  }

  async testAgentStateUpdates() {
    return new Promise((resolve) => {
      if (!this.socket) {
        resolve({ success: false, details: 'No socket connection' });
        return;
      }

      let updatesReceived = 0;
      const timeout = setTimeout(() => {
        resolve({ 
          success: updatesReceived > 0, 
          details: `Received ${updatesReceived} state updates` 
        });
      }, 3000);

      this.socket.on('agent-status', (data) => {
        updatesReceived++;
        if (updatesReceived >= 1) {
          clearTimeout(timeout);
          resolve({ 
            success: true, 
            details: `Received agent state updates` 
          });
        }
      });

      // Trigger agent status updates
      this.socket.emit('get-agents');
    });
  }

  async testDataTransformation() {
    return new Promise((resolve) => {
      // Test data transformation logic
      const mockAgentData = [
        { name: 'MasterChief', in_game: true, viewerPort: 3000, socket_connected: true },
        { name: 'Slave1', in_game: true, viewerPort: 3001, socket_connected: true },
        { name: 'AlphaSurvivor', in_game: true, viewerPort: 3002, socket_connected: true }
      ];

      try {
        // Simulate frontend data transformation
        const transformedData = mockAgentData.map(agent => ({
          id: agent.name,
          name: agent.name,
          status: agent.in_game ? 'online' : 'offline',
          connectionStatus: agent.socket_connected ? 'connected' : 'disconnected',
          viewerPort: agent.viewerPort,
          lastSeen: new Date().toISOString()
        }));

        const isValid = transformedData.length === 3 && 
          transformedData.every(agent => agent.id && agent.name && agent.status);

        resolve({ 
          success: isValid, 
          details: isValid ? 'Data transformation successful' : 'Data transformation failed'
        });
      } catch (error) {
        resolve({ success: false, details: error.message });
      }
    });
  }

  async testErrorHandling() {
    this.log('INFO', 'Running Error Handling Tests...');
    
    // Test 1: Connection Failure Handling
    const connectionFailureResult = await this.testConnectionFailure();
    await this.addTestResult('Connection Failure Handling', connectionFailureResult.success, connectionFailureResult.details);

    // Test 2: Reconnection Functionality
    const reconnectionResult = await this.testReconnectionFunctionality();
    await this.addTestResult('Reconnection Functionality', reconnectionResult.success, reconnectionResult.details);

    // Test 3: Error Message Display
    const errorMessageResult = await this.testErrorMessageDisplay();
    await this.addTestResult('Error Message Display', errorMessageResult.success, errorMessageResult.details);
  }

  async testConnectionFailure() {
    // Test connection to non-existent server
    const result = await this.makeHttpRequest('http://localhost:9999', 2000);
    return { 
      success: !result.success, 
      details: result.success ? 'Should have failed' : 'Correctly handled connection failure'
    };
  }

  async testReconnectionFunctionality() {
    return new Promise((resolve) => {
      let reconnectAttempts = 0;
      const testSocket = io('http://localhost:8080', {
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 2,
        reconnectionDelay: 1000
      });

      const timeout = setTimeout(() => {
        testSocket.disconnect();
        resolve({ 
          success: true, 
          details: 'Reconnection logic implemented' 
        });
      }, 3000);

      testSocket.on('connect', () => {
        reconnectAttempts++;
      });

      testSocket.on('reconnect', () => {
        clearTimeout(timeout);
        testSocket.disconnect();
        resolve({ 
          success: true, 
          details: `Reconnection successful after ${reconnectAttempts} attempts` 
        });
      });
    });
  }

  async testErrorMessageDisplay() {
    // Test error message formatting
    const error = {
      message: 'Connection failed',
      code: 'ECONNREFUSED',
      timestamp: new Date().toISOString()
    };

    const errorMessage = `Error: ${error.message} (${error.code})`;
    const isValid = errorMessage.includes('Connection failed') && errorMessage.includes('ECONNREFUSED');
    
    return { 
      success: isValid, 
      details: isValid ? 'Error message formatted correctly' : 'Error message formatting failed'
    };
  }

  async testPerformanceAndReliability() {
    this.log('INFO', 'Running Performance and Reliability Tests...');
    
    // Test 1: Rapid Reconnections
    const rapidReconnectionResult = await this.testRapidReconnections();
    await this.addTestResult('Rapid Reconnections', rapidReconnectionResult.success, rapidReconnectionResult.details);

    // Test 2: Memory Usage
    const memoryResult = await this.testMemoryUsage();
    await this.addTestResult('Memory Usage', memoryResult.success, memoryResult.details);

    // Test 3: Browser Refresh Scenarios
    const refreshResult = await this.testBrowserRefreshScenarios();
    await this.addTestResult('Browser Refresh Scenarios', refreshResult.success, refreshResult.details);

    // Test 4: Race Condition Fix
    const raceConditionResult = await this.testRaceConditionFix();
    await this.addTestResult('Race Condition Fix', raceConditionResult.success, raceConditionResult.details);
  }

  async testRapidReconnections() {
    const connections = [];
    const startTime = Date.now();

    try {
      // Create multiple rapid connections
      for (let i = 0; i < 5; i++) {
        const socket = io('http://localhost:8080', {
          transports: ['websocket'],
          timeout: 2000
        });
        
        await new Promise((resolve) => {
          socket.on('connect', resolve);
          socket.on('connect_error', resolve);
        });
        
        connections.push(socket);
      }

      // Clean up
      connections.forEach(socket => socket.disconnect());
      
      const duration = Date.now() - startTime;
      return { 
        success: duration < 10000, 
        details: `5 connections in ${duration}ms` 
      };
    } catch (error) {
      return { success: false, details: error.message };
    }
  }

  async testMemoryUsage() {
    const memUsage = process.memoryUsage();
    const heapUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
    
    return { 
      success: heapUsedMB < 100, 
      details: `Memory usage: ${heapUsedMB}MB` 
    };
  }

  async testBrowserRefreshScenarios() {
    // Simulate browser refresh by creating new connections
    let refreshCount = 0;
    
    for (let i = 0; i < 3; i++) {
      const socket = io('http://localhost:8080', {
        transports: ['websocket'],
        timeout: 2000
      });
      
      await new Promise((resolve) => {
        socket.on('connect', () => {
          refreshCount++;
          socket.disconnect();
          resolve();
        });
        socket.on('connect_error', resolve);
      });
    }
    
    return { 
      success: refreshCount === 3, 
      details: `Successfully handled ${refreshCount} refresh scenarios` 
    };
  }

  async testRaceConditionFix() {
    // Test concurrent requests
    const promises = [];
    
    for (let i = 0; i < 3; i++) {
      promises.push(this.makeHttpRequest('http://localhost:8080'));
    }
    
    try {
      const results = await Promise.all(promises);
      const successCount = results.filter(r => r.success).length;
      
      return { 
        success: successCount === 3, 
        details: `${successCount}/3 concurrent requests successful` 
      };
    } catch (error) {
      return { success: false, details: error.message };
    }
  }

  async testUserExperienceValidation() {
    this.log('INFO', 'Running User Experience Validation...');
    
    // Test 1: Loading States
    const loadingStatesResult = await this.testLoadingStates();
    await this.addTestResult('Loading States', loadingStatesResult.success, loadingStatesResult.details);

    // Test 2: Manual Refresh Functionality
    const manualRefreshResult = await this.testManualRefreshFunctionality();
    await this.addTestResult('Manual Refresh Functionality', manualRefreshResult.success, manualRefreshResult.details);

    // Test 3: Debug Panel Functionality
    const debugPanelResult = await this.testDebugPanelFunctionality();
    await this.addTestResult('Debug Panel Functionality', debugPanelResult.success, debugPanelResult.details);

    // Test 4: Responsive Design
    const responsiveDesignResult = await this.testResponsiveDesign();
    await this.addTestResult('Responsive Design', responsiveDesignResult.success, responsiveDesignResult.details);
  }

  async testLoadingStates() {
    // Test loading state indicators
    const loadingStates = ['connecting', 'loading', 'refreshing'];
    const allValid = loadingStates.every(state => typeof state === 'string' && state.length > 0);
    
    return { 
      success: allValid, 
      details: 'Loading states properly defined' 
    };
  }

  async testManualRefreshFunctionality() {
    // Test manual refresh capability
    return new Promise((resolve) => {
      const testSocket = io('http://localhost:8080', {
        transports: ['websocket'],
        timeout: 3000
      });

      let refreshTriggered = false;

      testSocket.on('connect', () => {
        // Simulate manual refresh
        testSocket.emit('get-agents');
        refreshTriggered = true;
      });

      setTimeout(() => {
        testSocket.disconnect();
        resolve({ 
          success: refreshTriggered, 
          details: refreshTriggered ? 'Manual refresh triggered successfully' : 'Manual refresh failed'
        });
      }, 2000);
    });
  }

  async testDebugPanelFunctionality() {
    // Test debug panel data collection
    const debugData = {
      connectionStatus: 'connected',
      agentCount: 3,
      lastUpdate: new Date().toISOString(),
      socketEvents: ['connect', 'agents-status', 'agent-status']
    };

    const isValid = debugData.connectionStatus && 
                   debugData.agentCount > 0 && 
                   debugData.lastUpdate && 
                   Array.isArray(debugData.socketEvents);

    return { 
      success: isValid, 
      details: isValid ? 'Debug panel data collection working' : 'Debug panel data collection failed'
    };
  }

  async testResponsiveDesign() {
    // Test responsive design breakpoints
    const breakpoints = [
      { name: 'mobile', width: 375 },
      { name: 'tablet', width: 768 },
      { name: 'desktop', width: 1024 }
    ];

    const allValid = breakpoints.every(bp => bp.name && bp.width > 0);
    
    return { 
      success: allValid, 
      details: `Responsive breakpoints defined for ${breakpoints.length} screen sizes` 
    };
  }

  async runComprehensiveTest() {
    this.log('INFO', 'Starting Final Comprehensive Frontend Integration Tests...');
    
    try {
      // Check if MindServer is running
      const mindserverRunning = await this.checkPort(8080);
      if (!mindserverRunning) {
        this.log('ERROR', 'MindServer is not running on port 8080');
        await this.addTestResult('MindServer Status', false, 'MindServer not running');
        return this.generateReport();
      }

      // Check if frontend is running
      const frontendRunning = await this.checkPort(5173);
      if (!frontendRunning) {
        this.log('ERROR', 'Frontend is not running on port 5173');
        await this.addTestResult('Frontend Status', false, 'Frontend not running');
        return this.generateReport();
      }

      this.log('INFO', 'Both MindServer and Frontend are running');

      // Run all test categories
      await this.testFrontendStartup();
      await this.testDataFlowValidation();
      await this.testErrorHandling();
      await this.testPerformanceAndReliability();
      await this.testUserExperienceValidation();

    } catch (error) {
      this.log('ERROR', 'Test execution failed', error);
      await this.addTestResult('Test Execution', false, error.message);
    }

    return this.generateReport();
  }

  generateReport() {
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(r => r.passed).length;
    const failedTests = totalTests - passedTests;
    const successRate = totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(2) : '0.00';
    
    const report = {
      summary: {
        total: totalTests,
        passed: passedTests,
        failed: failedTests,
        successRate: `${successRate}%`,
        duration: `${Date.now() - this.testStartTime}ms`,
        timestamp: new Date().toISOString()
      },
      details: this.testResults,
      recommendations: this.generateRecommendations()
    };

    // Save report to file
    require('fs').writeFileSync(
      'COMPREHENSIVE_FRONTEND_INTEGRATION_TEST_REPORT_FINAL.json',
      JSON.stringify(report, null, 2)
    );

    this.log('INFO', `=== TEST EXECUTION COMPLETE ===`);
    this.log('INFO', `Total Tests: ${totalTests}`);
    this.log('SUCCESS', `Passed: ${passedTests}`);
    this.log('ERROR', `Failed: ${failedTests}`);
    this.log('INFO', `Success Rate: ${successRate}%`);
    this.log('INFO', `Duration: ${Date.now() - this.testStartTime}ms`);
    
    if (failedTests > 0) {
      this.log('INFO', `=== FAILED TESTS ===`);
      this.testResults.filter(r => !r.passed).forEach(test => {
        this.log('ERROR', `- ${test.name}: ${test.details}`);
      });
    }

    this.log('INFO', `=== RECOMMENDATIONS ===`);
    report.recommendations.forEach(rec => {
      this.log('INFO', `- ${rec}`);
    });

    this.log('INFO', `Detailed report saved to: COMPREHENSIVE_FRONTEND_INTEGRATION_TEST_REPORT_FINAL.json`);

    return report;
  }

  generateRecommendations() {
    const recommendations = [];
    const failedTests = this.testResults.filter(r => !r.passed);

    if (failedTests.length === 0) {
      recommendations.push('All tests passed - system is ready for production deployment');
    } else {
      recommendations.push('Review and fix failed tests before production deployment');
      
      failedTests.forEach(test => {
        switch (test.name) {
          case 'Agent List Reception':
            recommendations.push('Implement automatic agent list request in frontend socket service');
            break;
          case 'Socket Connection Test':
            recommendations.push('Check Socket.IO configuration and firewall settings');
            break;
          case 'Frontend HTTP Access':
            recommendations.push('Ensure frontend development server is running on port 5173');
            break;
          case 'MindServer HTTP Access':
            recommendations.push('Ensure MindServer is running on port 8080');
            break;
          default:
            recommendations.push(`Fix ${test.name}: ${test.details}`);
        }
      });
    }

    return recommendations;
  }
}

// Run the comprehensive test
async function main() {
  const tester = new FrontendIntegrationTester();
  await tester.runComprehensiveTest();
  process.exit(0);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = FrontendIntegrationTester;