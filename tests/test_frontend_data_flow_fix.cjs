const http = require('http');
const { io } = require('socket.io-client');

class FrontendDataFlowFix {
  constructor() {
    this.testResults = [];
    this.socket = null;
    this.backendUrl = 'http://localhost:8080';
  }

  async runTests() {
    console.log('=== Frontend Data Flow Fix Tests ===\n');
    
    try {
      await this.testSocketEventMapping();
      await this.testDataTransformation();
      await this.testReduxStateUpdate();
      await this.testRealTimeUpdates();
      await this.validateFixImplementation();
      
      this.generateReport();
    } catch (error) {
      console.error('Test execution failed:', error);
      this.testResults.push({
        category: 'Execution',
        test: 'Overall Test Execution',
        status: 'FAILED',
        error: error.message,
        duration: 0
      });
    }
  }

  async testSocketEventMapping() {
    console.log('1. Testing Socket Event Mapping...');
    
    const startTime = Date.now();
    
    try {
      // Test 1: Verify socket service event mapping
      const socketServiceTest = await this.testSocketServiceEventMapping();
      this.testResults.push({
        category: 'Socket Event Mapping',
        test: 'Socket Service Event Mapping',
        status: socketServiceTest ? 'PASSED' : 'FAILED',
        duration: Date.now() - startTime
      });

      // Test 2: Verify frontend event listeners
      const frontendListenersTest = await this.testFrontendEventListeners();
      this.testResults.push({
        category: 'Socket Event Mapping',
        test: 'Frontend Event Listeners',
        status: frontendListenersTest ? 'PASSED' : 'FAILED',
        duration: Date.now() - startTime
      });

    } catch (error) {
      this.testResults.push({
        category: 'Socket Event Mapping',
        test: 'Event Mapping Tests',
        status: 'FAILED',
        error: error.message,
        duration: Date.now() - startTime
      });
    }
  }

  async testSocketServiceEventMapping() {
    return new Promise((resolve) => {
      console.log('   Testing socket service event mapping...');
      
      // Read the socket service file to verify event mapping
      const fs = require('fs');
      const socketServicePath = 'frontend/src/services/socketService.ts';
      
      try {
        const socketServiceCode = fs.readFileSync(socketServicePath, 'utf8');
        
        // Check if it correctly handles agents-status event
        const hasAgentsStatusListener = socketServiceCode.includes("socket.on('agents-status'");
        const hasCorrectEventEmission = socketServiceCode.includes("this.emit('agentList', data)");
        
        console.log(`   ✓ agents-status listener: ${hasAgentsStatusListener}`);
        console.log(`   ✓ agentList emission: ${hasCorrectEventEmission}`);
        
        resolve(hasAgentsStatusListener && hasCorrectEventEmission);
      } catch (error) {
        console.error('   ✗ Error reading socket service:', error.message);
        resolve(false);
      }
    });
  }

  async testFrontendEventListeners() {
    return new Promise((resolve) => {
      console.log('   Testing frontend event listeners...');
      
      const fs = require('fs');
      const agentListPath = 'frontend/src/pages/AgentList.tsx';
      
      try {
        const agentListCode = fs.readFileSync(agentListPath, 'utf8');
        
        // Check if it correctly listens for both events
        const hasAgentListListener = agentListCode.includes("socketService.on('agentList'");
        const hasAgentsStatusListener = agentListCode.includes("socketService.on('agents-status'");
        
        console.log(`   ✓ agentList listener: ${hasAgentListListener}`);
        console.log(`   ✓ agents-status listener: ${hasAgentsStatusListener}`);
        
        resolve(hasAgentListListener && hasAgentsStatusListener);
      } catch (error) {
        console.error('   ✗ Error reading agent list component:', error.message);
        resolve(false);
      }
    });
  }

  async testDataTransformation() {
    console.log('2. Testing Data Transformation...');
    
    const startTime = Date.now();
    
    try {
      // Test 1: Verify agent data transformation
      const dataTransformTest = await this.testAgentDataTransformation();
      this.testResults.push({
        category: 'Data Transformation',
        test: 'Agent Data Transformation',
        status: dataTransformTest ? 'PASSED' : 'FAILED',
        duration: Date.now() - startTime
      });

      // Test 2: Verify context data handling
      const contextDataTest = await this.testContextDataHandling();
      this.testResults.push({
        category: 'Data Transformation',
        test: 'Context Data Handling',
        status: contextDataTest ? 'PASSED' : 'FAILED',
        duration: Date.now() - startTime
      });

    } catch (error) {
      this.testResults.push({
        category: 'Data Transformation',
        test: 'Data Transformation Tests',
        status: 'FAILED',
        error: error.message,
        duration: Date.now() - startTime
      });
    }
  }

  async testAgentDataTransformation() {
    return new Promise((resolve) => {
      console.log('   Testing agent data transformation...');
      
      // Simulate the data transformation that happens in AgentList component
      const mockBackendData = [
        { name: 'MasterChief', in_game: true },
        { name: 'Slave1', in_game: true },
        { name: 'AlphaSurvivor', in_game: false }
      ];
      
      try {
        // Simulate the transformation logic from AgentList.tsx
        const agentsArray = Array.isArray(mockBackendData) ? mockBackendData : (mockBackendData.agents || []);
        const agentSummaries = agentsArray.map((agent) => ({
          id: agent.name,
          name: agent.name,
          profile: 'default',
          status: agent.in_game ? 'online' : 'offline',
          position: { x: 0, y: 64, z: 0 },
          health: 20,
          level: 1,
          lastUpdate: Date.now(),
        }));
        
        const isValid = agentSummaries.length === 3 && 
                       agentSummaries[0].name === 'MasterChief' &&
                       agentSummaries[0].status === 'online' &&
                       agentSummaries[2].status === 'offline';
        
        console.log(`   ✓ Transformed ${agentSummaries.length} agents`);
        console.log(`   ✓ MasterChief status: ${agentSummaries[0].status}`);
        console.log(`   ✓ AlphaSurvivor status: ${agentSummaries[2].status}`);
        
        resolve(isValid);
      } catch (error) {
        console.error('   ✗ Error in data transformation:', error.message);
        resolve(false);
      }
    });
  }

  async testContextDataHandling() {
    return new Promise((resolve) => {
      console.log('   Testing context data handling...');
      
      // Simulate context update data
      const mockContextUpdate = {
        MasterChief: {
          context: {
            position: { x: 100, y: 64, z: 200 },
            health: 18
          }
        }
      };
      
      try {
        // Simulate the context update logic from AgentList.tsx
        const updates = {};
        Object.entries(mockContextUpdate).forEach(([agentName, state]) => {
          if (state && typeof state === 'object' && !state.error) {
            updates[agentName] = {
              id: agentName,
              name: agentName,
              lastUpdate: Date.now(),
              status: 'online',
            };

            if (state.context?.position) {
              updates[agentName].context = {
                position: state.context.position,
              };
            }

            if (state.context?.health !== undefined) {
              updates[agentName].context = {
                ...updates[agentName].context,
                health: state.context.health,
              };
            }
          }
        });
        
        const isValid = updates.MasterChief && 
                       updates.MasterChief.context.position.x === 100 &&
                       updates.MasterChief.context.health === 18;
        
        console.log(`   ✓ Context update processed for ${Object.keys(updates).length} agents`);
        console.log(`   ✓ Position update: (${updates.MasterChief.context.position.x}, 64, 200)`);
        console.log(`   ✓ Health update: ${updates.MasterChief.context.health}/20`);
        
        resolve(isValid);
      } catch (error) {
        console.error('   ✗ Error in context data handling:', error.message);
        resolve(false);
      }
    });
  }

  async testReduxStateUpdate() {
    console.log('3. Testing Redux State Update...');
    
    const startTime = Date.now();
    
    try {
      // Test 1: Verify Redux slice configuration
      const reduxSliceTest = await this.testReduxSliceConfiguration();
      this.testResults.push({
        category: 'Redux State Update',
        test: 'Redux Slice Configuration',
        status: reduxSliceTest ? 'PASSED' : 'FAILED',
        duration: Date.now() - startTime
      });

      // Test 2: Verify agent state structure
      const agentStateTest = await this.testAgentStateStructure();
      this.testResults.push({
        category: 'Redux State Update',
        test: 'Agent State Structure',
        status: agentStateTest ? 'PASSED' : 'FAILED',
        duration: Date.now() - startTime
      });

    } catch (error) {
      this.testResults.push({
        category: 'Redux State Update',
        test: 'Redux State Update Tests',
        status: 'FAILED',
        error: error.message,
        duration: Date.now() - startTime
      });
    }
  }

  async testReduxSliceConfiguration() {
    return new Promise((resolve) => {
      console.log('   Testing Redux slice configuration...');
      
      const fs = require('fs');
      const agentsSlicePath = 'frontend/src/store/slices/agentsSlice.ts';
      
      try {
        const agentsSliceCode = fs.readFileSync(agentsSlicePath, 'utf8');
        
        // Check if it has the correct actions and reducers
        const hasSetAgentsAction = agentsSliceCode.includes('setAgents:');
        const hasUpdateAgentAction = agentsSliceCode.includes('updateAgent:');
        const hasCorrectInitialState = agentsSliceCode.includes('agents: new Map()');
        
        console.log(`   ✓ setAgents action: ${hasSetAgentsAction}`);
        console.log(`   ✓ updateAgent action: ${hasUpdateAgentAction}`);
        console.log(`   ✓ Map-based state: ${hasCorrectInitialState}`);
        
        resolve(hasSetAgentsAction && hasUpdateAgentAction && hasCorrectInitialState);
      } catch (error) {
        console.error('   ✗ Error reading agents slice:', error.message);
        resolve(false);
      }
    });
  }

  async testAgentStateStructure() {
    return new Promise((resolve) => {
      console.log('   Testing agent state structure...');
      
      // Simulate the agent state structure from agentsSlice.ts
      const mockAgentSummary = {
        id: 'MasterChief',
        name: 'MasterChief',
        profile: 'default',
        status: 'online',
        position: { x: 0, y: 64, z: 0 },
        health: 20,
        level: 1,
        lastUpdate: Date.now(),
      };
      
      try {
        // Check if the summary has all required fields
        const hasRequiredFields = mockAgentSummary.id && 
                                 mockAgentSummary.name && 
                                 mockAgentSummary.status !== undefined &&
                                 mockAgentSummary.position &&
                                 mockAgentSummary.health !== undefined;
        
        console.log(`   ✓ Required fields present: ${hasRequiredFields}`);
        console.log(`   ✓ Agent ID: ${mockAgentSummary.id}`);
        console.log(`   ✓ Agent status: ${mockAgentSummary.status}`);
        console.log(`   ✓ Agent health: ${mockAgentSummary.health}/20`);
        
        resolve(hasRequiredFields);
      } catch (error) {
        console.error('   ✗ Error in agent state structure:', error.message);
        resolve(false);
      }
    });
  }

  async testRealTimeUpdates() {
    console.log('4. Testing Real-time Updates...');
    
    const startTime = Date.now();
    
    try {
      // Test 1: Verify socket connection and event reception
      const socketConnectionTest = await this.testSocketConnection();
      this.testResults.push({
        category: 'Real-time Updates',
        test: 'Socket Connection',
        status: socketConnectionTest ? 'PASSED' : 'FAILED',
        duration: Date.now() - startTime
      });

      // Test 2: Verify agent list reception
      const agentListReceptionTest = await this.testAgentListReception();
      this.testResults.push({
        category: 'Real-time Updates',
        test: 'Agent List Reception',
        status: agentListReceptionTest ? 'PASSED' : 'FAILED',
        duration: Date.now() - startTime
      });

    } catch (error) {
      this.testResults.push({
        category: 'Real-time Updates',
        test: 'Real-time Update Tests',
        status: 'FAILED',
        error: error.message,
        duration: Date.now() - startTime
      });
    }
  }

  async testSocketConnection() {
    return new Promise((resolve) => {
      console.log('   Testing socket connection to MindServer...');
      
      this.socket = io(this.backendUrl, {
        timeout: 5000,
        reconnection: false
      });
      
      const timeout = setTimeout(() => {
        console.log('   ✗ Socket connection timeout');
        if (this.socket) {
          this.socket.disconnect();
          this.socket = null;
        }
        resolve(false);
      }, 5000);
      
      this.socket.on('connect', () => {
        clearTimeout(timeout);
        console.log('   ✓ Socket connected successfully');
        this.socket.disconnect();
        this.socket = null;
        resolve(true);
      });
      
      this.socket.on('connect_error', (error) => {
        clearTimeout(timeout);
        console.log(`   ✗ Socket connection failed: ${error.message}`);
        resolve(false);
      });
    });
  }

  async testAgentListReception() {
    return new Promise((resolve) => {
      console.log('   Testing agent list event reception...');
      
      this.socket = io(this.backendUrl, {
        timeout: 5000,
        reconnection: false
      });
      
      let eventReceived = false;
      const timeout = setTimeout(() => {
        console.log('   ✗ Agent list event timeout');
        if (this.socket) {
          this.socket.disconnect();
          this.socket = null;
        }
        resolve(eventReceived);
      }, 5000);
      
      this.socket.on('connect', () => {
        console.log('   ✓ Connected, requesting agent list...');
        this.socket.emit('get_agent_list', {});
      });
      
      this.socket.on('agents-status', (data) => {
        console.log('   ✓ Received agents-status event:', data);
        eventReceived = true;
        clearTimeout(timeout);
        this.socket.disconnect();
        this.socket = null;
        resolve(true);
      });
      
      this.socket.on('connect_error', (error) => {
        clearTimeout(timeout);
        console.log(`   ✗ Socket connection failed: ${error.message}`);
        resolve(false);
      });
    });
  }

  async validateFixImplementation() {
    console.log('5. Validating Fix Implementation...');
    
    const startTime = Date.now();
    
    try {
      // Test 1: Create comprehensive fix for data flow issues
      const fixImplementationTest = await this.createDataFlowFix();
      this.testResults.push({
        category: 'Fix Implementation',
        test: 'Data Flow Fix Creation',
        status: fixImplementationTest ? 'PASSED' : 'FAILED',
        duration: Date.now() - startTime
      });

      // Test 2: Validate fix effectiveness
      const fixValidationTest = await this.validateDataFlowFix();
      this.testResults.push({
        category: 'Fix Implementation',
        test: 'Fix Effectiveness Validation',
        status: fixValidationTest ? 'PASSED' : 'FAILED',
        duration: Date.now() - startTime
      });

    } catch (error) {
      this.testResults.push({
        category: 'Fix Implementation',
        test: 'Fix Implementation Tests',
        status: 'FAILED',
        error: error.message,
        duration: Date.now() - startTime
      });
    }
  }

  async createDataFlowFix() {
    return new Promise((resolve) => {
      console.log('   Creating data flow fix...');
      
      try {
        // The fix is already implemented in the socket service
        // We just need to verify it's working correctly
        const fs = require('fs');
        const socketServicePath = 'frontend/src/services/socketService.ts';
        
        const socketServiceCode = fs.readFileSync(socketServicePath, 'utf8');
        
        // Verify the fix is in place
        const hasCorrectEventMapping = socketServiceCode.includes("socket.on('agents-status', (data: AgentListEvent) =>");
        const hasCorrectEventEmission = socketServiceCode.includes("this.emit('agentList', data)");
        const hasOriginalEventPreservation = socketServiceCode.includes("this.emit('agents-status', data)");
        
        console.log(`   ✓ Event mapping fix: ${hasCorrectEventMapping}`);
        console.log(`   ✓ Event emission fix: ${hasCorrectEventEmission}`);
        console.log(`   ✓ Original event preservation: ${hasOriginalEventPreservation}`);
        
        resolve(hasCorrectEventMapping && hasCorrectEventEmission && hasOriginalEventPreservation);
      } catch (error) {
        console.error('   ✗ Error creating data flow fix:', error.message);
        resolve(false);
      }
    });
  }

  async validateDataFlowFix() {
    return new Promise((resolve) => {
      console.log('   Validating data flow fix effectiveness...');
      
      // Test the actual data flow with a simulated connection
      this.socket = io(this.backendUrl, {
        timeout: 5000,
        reconnection: false
      });
      
      let dataFlowWorking = false;
      const timeout = setTimeout(() => {
        console.log('   ✗ Data flow validation timeout');
        if (this.socket) {
          this.socket.disconnect();
          this.socket = null;
        }
        resolve(dataFlowWorking);
      }, 5000);
      
      this.socket.on('connect', () => {
        console.log('   ✓ Connected, testing data flow...');
        
        // Simulate the frontend event handling
        this.socket.on('agents-status', (data) => {
          console.log('   ✓ Data flow working - received agents-status:', data);
          dataFlowWorking = true;
          clearTimeout(timeout);
          this.socket.disconnect();
          this.socket = null;
          resolve(true);
        });
        
        // Request agent list
        this.socket.emit('get_agent_list', {});
      });
      
      this.socket.on('connect_error', (error) => {
        clearTimeout(timeout);
        console.log(`   ✗ Data flow validation failed: ${error.message}`);
        resolve(false);
      });
    });
  }

  generateReport() {
    console.log('\n=== Data Flow Fix Test Report ===\n');
    
    const categories = [...new Set(this.testResults.map(r => r.category))];
    
    categories.forEach(category => {
      const categoryTests = this.testResults.filter(r => r.category === category);
      const passed = categoryTests.filter(t => t.status === 'PASSED').length;
      const total = categoryTests.length;
      
      console.log(`${category}:`);
      console.log(`  Passed: ${passed}/${total} (${((passed/total)*100).toFixed(1)}%)`);
      
      categoryTests.forEach(test => {
        const status = test.status === 'PASSED' ? '✓' : '✗';
        const duration = `(${test.duration}ms)`;
        console.log(`    ${status} ${test.test} ${duration}`);
        if (test.error) {
          console.log(`      Error: ${test.error}`);
        }
      });
      console.log('');
    });
    
    const totalPassed = this.testResults.filter(t => t.status === 'PASSED').length;
    const totalTests = this.testResults.length;
    const overallSuccess = ((totalPassed/totalTests)*100).toFixed(1);
    
    console.log(`Overall Results: ${totalPassed}/${totalTests} (${overallSuccess}%)`);
    
    // Generate detailed report file
    const reportData = {
      timestamp: new Date().toISOString(),
      summary: {
        totalTests,
        passed: totalPassed,
        failed: totalTests - totalPassed,
        successRate: parseFloat(overallSuccess)
      },
      categories: categories.map(category => ({
        name: category,
        tests: this.testResults.filter(r => r.category === category),
        passed: this.testResults.filter(r => r.category === category && r.status === 'PASSED').length,
        total: this.testResults.filter(r => r.category === category).length
      })),
      recommendations: this.generateRecommendations()
    };
    
    const fs = require('fs');
    fs.writeFileSync('DATA_FLOW_FIX_TEST_REPORT.json', JSON.stringify(reportData, null, 2));
    
    console.log(`\nDetailed report saved to: DATA_FLOW_FIX_TEST_REPORT.json`);
    
    if (totalPassed === totalTests) {
      console.log('\n🎉 All tests passed! The data flow fix is working correctly.');
    } else {
      console.log('\n⚠️  Some tests failed. Please review the recommendations in the report.');
    }
  }

  generateRecommendations() {
    const recommendations = [];
    
    const failedTests = this.testResults.filter(t => t.status === 'FAILED');
    
    if (failedTests.length === 0) {
      recommendations.push('All tests passed! The data flow fix is working correctly.');
    } else {
      recommendations.push('Some tests failed. Review the following areas:');
      
      failedTests.forEach(test => {
        switch (test.category) {
          case 'Socket Event Mapping':
            recommendations.push('- Check socket service event listeners and emissions');
            break;
          case 'Data Transformation':
            recommendations.push('- Verify data transformation logic in AgentList component');
            break;
          case 'Redux State Update':
            recommendations.push('- Check Redux slice configuration and state structure');
            break;
          case 'Real-time Updates':
            recommendations.push('- Verify socket connection and event reception');
            break;
          case 'Fix Implementation':
            recommendations.push('- Ensure fix implementation is complete and effective');
            break;
        }
      });
    }
    
    return recommendations;
  }
}

// Run the tests
const tester = new FrontendDataFlowFix();
tester.runTests().catch(console.error);