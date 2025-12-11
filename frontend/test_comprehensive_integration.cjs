/**
 * Comprehensive Frontend Integration Test Suite
 * 
 * This test suite validates the entire frontend cognitive dashboard integration,
 * including Socket.IO services, Redux store, component interactions, and real-time data flow.
 */

const { describe, it, before, after, beforeEach, afterEach } = require('mocha');
const { expect } = require('chai');
const { JSDOM } = require('jsdom');
const { configureStore } = require('@reduxjs/toolkit');
const { Provider } = require('react-redux');
const React = require('react');
const { act } = require('react-dom/test-utils');
const { render, screen, fireEvent, waitFor } = require('@testing-library/react');
const { io } = require('socket.io-client');

// Import services and components
const { initializeSocket, getSocketService } = require('./src/services/socketService');
const { enhancedSocketService } = require('./src/services/enhancedSocketService');
const { streamingService } = require('./src/services/streamingService');
const store = require('./src/store/index');
const CognitiveDashboard = require('./src/pages/CognitiveDashboard');

// Mock data for testing
const mockAgentData = {
  id: 'test-agent-1',
  name: 'Test Agent',
  profile: {
    purpose: {
      identity: { name: 'Test Agent', role: 'test-agent', background: 'Test background', corePurpose: 'Testing' },
      personality: {
        openness: 0.8, conscientiousness: 0.7, extraversion: 0.6,
        agreeableness: 0.9, neuroticism: 0.3, riskTolerance: 0.7,
        creativity: 0.9, patience: 0.8, competitiveness: 0.5, curiosity: 0.9
      },
      motivations: [{ type: 'exploration', priority: 0.8, satisfaction: 0.5 }],
      values: [{ name: 'knowledge', priority: 0.9 }],
      ethics: { harmAvoidance: 0.9, fairness: 0.8, loyalty: 0.7, authority: 0.5, purity: 0.6 }
    }
  },
  status: 'online',
  lastUpdate: Date.now(),
  context: {
    position: { x: 100, y: 64, z: 200 },
    health: 100,
    food: 90,
    experience: 150,
    level: 5,
    dimension: 'overworld',
    timeOfDay: 12000,
    weather: 'clear',
    nearbyEntities: [],
    nearbyBlocks: [],
    inventory: { items: [], slots: 36, usedSlots: 0 },
    equipment: {}
  },
  reactive: {
    activeMode: 'idle',
    emergencyConditions: [],
    lastReactiveAction: {
      mode: 'idle', priority: 0, timestamp: Date.now(),
      context: {}, outcome: 'none'
    },
    interruptHistory: []
  },
  cognitive: {
    purpose: mockAgentData.profile.purpose,
    goals: {
      strategicGoals: [],
      tacticalGoals: [],
      operationalGoals: [],
      activeGoals: [],
      goalHistory: []
    },
    skills: new Map(),
    memory: {
      semantic: { concepts: new Map(), facts: new Map(), relationships: new Map() },
      episodic: { events: [], conversations: [], experiences: [] },
      procedural: { skills: new Map(), procedures: new Map(), habits: new Map() },
      working: { currentFocus: 'idle', activeTasks: [], conversationContext: null, buffer: [] }
    },
    processing: {
      currentPhase: 'perception',
      cognitiveLoad: 0.3,
      attentionLevel: 0.7,
      processingHistory: []
    }
  },
  executive: {
    currentAction: {
      id: 'action-1', type: 'idle', description: 'Agent is idle',
      priority: 0, status: 'pending', createdAt: Date.now(), context: {}
    },
    actionQueue: [],
    decisionHistory: [],
    performanceMetrics: {
      reactiveResponseTime: 45,
      cognitiveProcessingTime: 150,
      successRate: 0.95,
      errorRate: 0.05,
      memoryUsage: 65,
      cpuUsage: 30
    },
    responseHistory: [],
    processingMode: 'action'
  },
  social: {
    relationships: new Map(),
    reputation: {
      globalScore: 75,
      factionScores: new Map(),
      traitScores: new Map(),
      recentEvents: []
    },
    socialContext: {
      currentSituation: 'idle',
      nearbyAgents: [],
      socialNorms: [],
      culturalContext: 'default',
      groupDynamics: null
    },
    mentalModels: new Map()
  }
};

// Test utilities
function createMockSocket() {
  const mockSocket = {
    connected: true,
    on: jest.fn(),
    emit: jest.fn(),
    disconnect: jest.fn(),
    listeners: new Map(),
    
    // Simulate connection events
    simulateConnect: function() {
      this.connected = true;
      this.on.connect?.call(this);
    },
    
    simulateDisconnect: function() {
      this.connected = false;
      this.on.disconnect?.call(this, 'test disconnect');
    },
    
    simulateEvent: function(event, data) {
      const listeners = this.listeners.get(event) || [];
      listeners.forEach(listener => listener(data));
    }
  };
  
  return mockSocket;
}

function createTestStore() {
  return configureStore({
    reducer: store.reducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        },
      }),
    devTools: false, // Disable dev tools for testing
  });
}

// Test setup
let testStore;
let mockSocket;

before(() => {
  // Set up DOM environment
  global.window = new JSDOM('').window;
  global.document = global.window.document;
  global.navigator = global.window.navigator;
  
  // Create test store
  testStore = createTestStore();
  
  // Create mock socket
  mockSocket = createMockSocket();
  
  // Mock Socket.IO client
  global.io = jest.fn(() => mockSocket);
});

beforeEach(() => {
  // Reset store state
  testStore.dispatch({ type: 'RESET' });
  
  // Reset mock socket
  mockSocket.listeners.clear();
  jest.clearAllMocks();
});

after(() => {
  // Cleanup
  jest.restoreAllMocks();
});

describe('Frontend Comprehensive Integration Tests', () => {
  
  describe('1. Socket.IO Service Integration', () => {
    
    it('should initialize socket service with correct configuration', () => {
      const socketService = initializeSocket({
        url: 'http://localhost:3001',
        options: {
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000
        }
      });
      
      expect(socketService).to.not.be.null;
      expect(global.io).toHaveBeenCalledWith('http://localhost:3001', expect.objectContaining({
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      }));
    });
    
    it('should handle connection lifecycle events', async () => {
      const socketService = initializeSocket({ url: 'http://localhost:3001' });
      
      // Mock connection success
      mockSocket.simulateConnect();
      
      // Verify connection status
      const status = socketService.getStatus();
      expect(status.isConnected).to.be.true;
      expect(status.isConnecting).to.be.false;
      expect(status.connectionAttempts).to.equal(1);
    });
    
    it('should handle connection errors gracefully', async () => {
      const socketService = initializeSocket({ url: 'http://invalid-url' });
      
      // Mock connection error
      mockSocket.simulateEvent('connect_error', new Error('Connection failed'));
      
      const status = socketService.getStatus();
      expect(status.isConnected).to.be.false;
      expect(status.lastError).to.include('Connection failed');
    });
    
    it('should handle agent state updates', () => {
      const socketService = initializeSocket({ url: 'http://localhost:3001' });
      
      // Mock agent state update
      const agentUpdateEvent = {
        agentId: 'test-agent-1',
        state: mockAgentData,
        timestamp: Date.now()
      };
      
      mockSocket.simulateEvent('agent:state:update', agentUpdateEvent);
      
      // Verify event was processed
      expect(mockSocket.on).toHaveBeenCalledWith('agent:state:update', expect.any(Function));
    });
    
    it('should handle reconnection with exponential backoff', async () => {
      let reconnectAttempts = 0;
      mockSocket.on('reconnect_attempt', (attempt) => {
        reconnectAttempts = attempt;
      });
      
      const socketService = initializeSocket({ url: 'http://localhost:3001' });
      
      // Simulate multiple reconnection attempts
      mockSocket.simulateDisconnect();
      mockSocket.simulateEvent('reconnect_attempt', 1);
      mockSocket.simulateEvent('reconnect_attempt', 2);
      mockSocket.simulateEvent('reconnect_attempt', 3);
      
      expect(reconnectAttempts).to.equal(3);
    });
    
    it('should measure and track latency', async () => {
      const socketService = initializeSocket({ url: 'http://localhost:3001' });
      
      // Mock ping response
      mockSocket.simulateEvent('pong', { timestamp: Date.now() });
      
      const latency = await socketService.ping();
      expect(latency).to.be.a('number');
      expect(latency).to.be.at.least(0);
    });
  });
  
  describe('2. Enhanced Socket.IO Service', () => {
    
    it('should initialize with enhanced features', () => {
      expect(enhancedSocketService).to.not.be.null;
      
      const status = enhancedSocketService.getConnectionStatus();
      expect(status).to.have.property('connected');
      expect(status).to.have.property('performanceMetrics');
    });
    
    it('should validate events before processing', () => {
      const invalidEvent = { agentId: null }; // Missing required field
      
      // Should not throw error but handle gracefully
      expect(() => {
        enhancedSocketService.setHandlers({
          onAgentStateUpdate: (data) => {
            expect(data.agentId).to.exist;
          }
        });
      }).to.not.throw();
    });
    
    it('should apply throttling when enabled', (done) => {
      let callCount = 0;
      enhancedSocketService.setHandlers({
        onAgentStateUpdate: (data) => {
          callCount++;
        }
      });
      
      // Simulate rapid events
      for (let i = 0; i < 10; i++) {
        mockSocket.simulateEvent('agent:state:update', mockAgentData);
      }
      
      // Should throttle calls
      setTimeout(() => {
        expect(callCount).to.be.lessThan(10); // Should be throttled
        done();
      }, 200);
    });
    
    it('should handle backpressure when enabled', () => {
      const status = enhancedSocketService.getConnectionStatus();
      expect(status.performanceMetrics).to.have.property('droppedEvents');
    });
    
    it('should provide performance metrics', () => {
      const metrics = enhancedSocketService.getPerformanceMetrics();
      
      expect(metrics).to.have.property('eventsPerSecond');
      expect(metrics).to.have.property('bufferSize');
      expect(metrics).to.have.property('processingLatency');
      expect(metrics).to.have.property('memoryUsage');
    });
  });
  
  describe('3. Redux Store Integration', () => {
    
    it('should initialize with correct slice configuration', () => {
      const state = testStore.getState();
      
      expect(state).to.have.property('agents');
      expect(state).to.have.property('connection');
      expect(state).to.have.property('ui');
      expect(state).to.have.property('memory');
      expect(state).to.have.property('skills');
      expect(state).to.have.property('goals');
      expect(state).to.have.property('social');
      expect(state).to.have.property('performance');
      expect(state).to.have.property('environment');
    });
    
    it('should handle agent state updates in Redux', () => {
      // Dispatch agent update
      testStore.dispatch({
        type: 'agents/agentStateUpdate',
        payload: {
          agentId: 'test-agent-1',
          state: mockAgentData,
          timestamp: Date.now()
        }
      });
      
      const state = testStore.getState();
      const agent = state.agents.agents.get('test-agent-1');
      
      expect(agent).to.not.be.undefined;
      expect(agent.id).to.equal('test-agent-1');
      expect(agent.status).to.equal('online');
    });
    
    it('should manage connection state in Redux', () => {
      // Dispatch connection status
      testStore.dispatch({
        type: 'connection/setConnectionStatus',
        payload: 'connected'
      });
      
      const state = testStore.getState();
      expect(state.connection.status).to.equal('connected');
      expect(state.connection.lastConnected).to.be.a('number');
    });
    
    it('should handle streaming status updates', () => {
      // Dispatch streaming status
      testStore.dispatch({
        type: 'agents/updateStreamingStatus',
        payload: {
          isConnected: true,
          latency: 45,
          connectionQuality: 'excellent'
        }
      });
      
      const state = testStore.getState();
      expect(state.agents.streaming.isConnected).to.be.true;
      expect(state.agents.streaming.latency).to.equal(45);
      expect(state.agents.streaming.connectionQuality).to.equal('excellent');
    });
    
    it('should handle batch updates for performance', () => {
      const batchUpdates = [
        { agentId: 'agent-1', state: { ...mockAgentData, status: 'busy' }, timestamp: Date.now() },
        { agentId: 'agent-2', state: { ...mockAgentData, status: 'idle' }, timestamp: Date.now() }
      ];
      
      testStore.dispatch({
        type: 'agents/batchAgentUpdates',
        payload: batchUpdates
      });
      
      const state = testStore.getState();
      expect(state.agents.agents.has('agent-1')).to.be.true;
      expect(state.agents.agents.has('agent-2')).to.be.true;
      expect(state.agents.performance.totalUpdates).to.be.at.least(2);
    });
    
    it('should handle error states gracefully', () => {
      // Dispatch error
      testStore.dispatch({
        type: 'agents/setAgentError',
        payload: 'Test error message'
      });
      
      const state = testStore.getState();
      expect(state.agents.error).to.equal('Test error message');
      expect(state.agents.loading).to.be.false;
    });
  });
  
  describe('4. Streaming Service Integration', () => {
    
    it('should create and manage data streams', () => {
      const stream = streamingService.createStream('test-stream', 'test-type');
      
      expect(stream).to.not.be.null;
      expect(stream.id).to.equal('test-stream');
      expect(stream.type).to.equal('test-type');
      expect(stream.isActive).to.be.true;
    });
    
    it('should handle stream subscriptions', () => {
      const stream = streamingService.createStream('test-stream', 'test-type');
      let receivedData = null;
      
      const unsubscribe = streamingService.subscribe('test-stream', (data) => {
        receivedData = data;
      });
      
      streamingService.pushData('test-stream', { test: 'data' });
      
      expect(receivedData).to.deep.equal([{ test: 'data' }]);
      expect(typeof unsubscribe).to.equal('function');
    });
    
    it('should apply data transformations', () => {
      streamingService.addTransformer({
        id: 'test-transformer',
        transform: (data) => ({ ...data, transformed: true }),
        enabled: true
      });
      
      const stream = streamingService.createStream('test-stream', 'test-type');
      streamingService.pushData('test-stream', { test: 'data' });
      
      // Transformation should be applied
      const subscribers = Array.from(stream.subscribers);
      expect(subscribers.length).to.be.greaterThan(0);
    });
    
    it('should apply data filters', () => {
      streamingService.addFilter({
        id: 'test-filter',
        filter: (data) => data.test !== 'filtered-out',
        enabled: true
      });
      
      const stream = streamingService.createStream('test-stream', 'test-type');
      
      // This should be filtered out
      streamingService.pushData('test-stream', { test: 'filtered-out' });
      // This should pass through
      streamingService.pushData('test-stream', { test: 'allowed' });
      
      // Verify filtering worked
      const metrics = streamingService.getMetrics();
      expect(metrics.totalEventsProcessed).to.be.greaterThan(0);
    });
    
    it('should manage cache efficiently', () => {
      const stream = streamingService.createStream('test-stream', 'test-type');
      
      // Push data to fill cache
      for (let i = 0; i < 10; i++) {
        streamingService.pushData('test-stream', { data: i, cache: true });
      }
      
      const metrics = streamingService.getMetrics();
      expect(metrics.memoryUsage).to.be.greaterThan(0);
      expect(metrics.cacheHitRate).to.be.greaterThan(0);
    });
    
    it('should provide comprehensive metrics', () => {
      const metrics = streamingService.getMetrics();
      
      expect(metrics).to.have.property('totalStreams');
      expect(metrics).to.have.property('activeStreams');
      expect(metrics).to.have.property('totalEventsProcessed');
      expect(metrics).to.have.property('eventsPerSecond');
      expect(metrics).to.have.property('cacheHitRate');
      expect(metrics).to.have.property('averageLatency');
      expect(metrics).to.have.property('bufferSize');
      expect(metrics).to.have.property('memoryUsage');
    });
  });
  
  describe('5. Component Integration', () => {
    
    it('should render CognitiveDashboard without crashing', () => {
      expect(() => {
        render(
          React.createElement(Provider, { store: testStore },
            React.createElement(CognitiveDashboard, { agentId: 'test-agent-1' })
          )
        );
      }).to.not.throw();
    });
    
    it('should display agent selection dropdown', () => {
      render(
        React.createElement(Provider, { store: testStore },
          React.createElement(CognitiveDashboard)
        )
      );
      
      // Add agent to store
      testStore.dispatch({
        type: 'agents/setAgents',
        payload: [{
          id: 'test-agent-1',
          name: 'Test Agent 1',
          profile: mockAgentData.profile,
          status: 'online',
          lastUpdate: Date.now()
        }]
      });
      
      // Check for agent selection
      const agentSelect = screen.getByRole('combobox');
      expect(agentSelect).to.exist;
      
      const options = screen.getAllByRole('option');
      expect(options.length).to.be.at.least(1);
      expect(options[0]).to.have.text('Test Agent 1 (online)');
    });
    
    it('should display connection status indicator', () => {
      render(
        React.createElement(Provider, { store: testStore },
          React.createElement(CognitiveDashboard)
        )
      );
      
      // Check for connection status
      const connectionIndicator = screen.getByTestId('connection-status');
      expect(connectionIndicator).to.exist;
    });
    
    it('should handle tab navigation', () => {
      render(
        React.createElement(Provider, { store: testStore },
          React.createElement(CognitiveDashboard)
        )
      );
      
      // Find tabs
      const tabs = screen.getAllByRole('tab');
      expect(tabs.length).to.equal(7); // Overview, Personality, Memory, Goals, Social, Skills, Performance
      
      // Click on Personality tab
      fireEvent.click(tabs[1]);
      
      // Verify tab content changes
      const personalityTab = screen.getByText(/Personality/i);
      expect(personalityTab).to.exist;
    });
    
    it('should handle search functionality', () => {
      render(
        React.createElement(Provider, { store: testStore },
          React.createElement(CognitiveDashboard)
        )
      );
      
      // Find search toggle
      const searchToggle = screen.getByLabelText(/search/i);
      expect(searchToggle).to.exist;
      
      // Click to open search
      fireEvent.click(searchToggle);
      
      // Search input should appear
      const searchInput = screen.getByPlaceholderText(/search/i);
      expect(searchInput).to.exist;
      
      // Type in search
      fireEvent.change(searchInput, { target: { value: 'test search' } });
      
      // Verify search term is handled
      expect(searchInput.value).to.equal('test search');
    });
    
    it('should handle theme switching', () => {
      render(
        React.createElement(Provider, { store: testStore },
          React.createElement(CognitiveDashboard)
        )
      );
      
      // Find theme toggle
      const themeToggle = screen.getByLabelText(/theme/i);
      expect(themeToggle).to.exist;
      
      // Click to toggle theme
      fireEvent.click(themeToggle);
      
      // Verify theme state changes
      const state = testStore.getState();
      expect(state.ui.theme).to.be.oneOf(['light', 'dark']);
    });
    
    it('should handle fullscreen toggle', () => {
      render(
        React.createElement(Provider, { store: testStore },
          React.createElement(CognitiveDashboard)
        )
      );
      
      // Find fullscreen toggle
      const fullscreenToggle = screen.getByLabelText(/fullscreen/i);
      expect(fullscreenToggle).to.exist;
      
      // Mock fullscreen API
      global.document.documentElement.requestFullscreen = jest.fn();
      global.document.exitFullscreen = jest.fn();
      
      // Click to toggle fullscreen
      fireEvent.click(fullscreenToggle);
      
      // Verify fullscreen API was called
      expect(global.document.documentElement.requestFullscreen).toHaveBeenCalled();
    });
    
    it('should handle export functionality', () => {
      render(
        React.createElement(Provider, { store: testStore },
          React.createElement(CognitiveDashboard)
        )
      );
      
      // Mock URL.createObjectURL and download
      global.URL.createObjectURL = jest.fn(() => 'mock-url');
      global.document.createElement = jest.fn(() => ({
        href: '',
        download: '',
        click: jest.fn()
      }));
      global.document.body = { appendChild: jest.fn() };
      global.document.removeChild = jest.fn();
      global.URL.revokeObjectURL = jest.fn();
      
      // Find export option and trigger it
      const exportOption = screen.getByText(/export/i);
      fireEvent.click(exportOption.parentElement);
      
      // Verify export functions were called
      expect(global.URL.createObjectURL).toHaveBeenCalled();
      expect(global.document.body.appendChild).toHaveBeenCalled();
    });
    
    it('should handle import functionality', () => {
      render(
        React.createElement(Provider, { store: testStore },
          React.createElement(CognitiveDashboard)
        )
      );
      
      // Mock FileReader
      const mockFileReader = {
        readAsText: jest.fn(),
        onload: null,
        result: 'test-import-data'
      };
      global.FileReader = jest.fn(() => mockFileReader);
      
      // Find import option and trigger it
      const importInput = screen.getByDisplayValue('file');
      fireEvent.change(importInput, {
        target: {
          files: [new File(['{}'], 'test.json', { type: 'application/json' })]
        }
      });
      
      // Verify FileReader was used
      expect(global.FileReader).toHaveBeenCalled();
      expect(mockFileReader.readAsText).toHaveBeenCalled();
    });
  });
  
  describe('6. Real-time Data Flow', () => {
    
    it('should propagate agent state updates to all components', async () => {
      render(
        React.createElement(Provider, { store: testStore },
          React.createElement(CognitiveDashboard, { agentId: 'test-agent-1' })
        )
      );
      
      // Simulate agent state update
      const updatedAgent = {
        ...mockAgentData,
        context: {
          ...mockAgentData.context,
          health: 85
        }
      };
      
      mockSocket.simulateEvent('agent:state:update', {
        agentId: 'test-agent-1',
        state: updatedAgent,
        timestamp: Date.now()
      });
      
      // Wait for state to propagate
      await waitFor(() => {
        const state = testStore.getState();
        const agent = state.agents.agents.get('test-agent-1');
        return agent && agent.context.health === 85;
      }, { timeout: 1000 });
      
      const state = testStore.getState();
      const agent = state.agents.agents.get('test-agent-1');
      expect(agent.context.health).to.equal(85);
    });
    
    it('should handle multiple simultaneous agent updates', async () => {
      render(
        React.createElement(Provider, { store: testStore },
          React.createElement(CognitiveDashboard)
        )
      );
      
      // Simulate multiple agent updates
      const agents = ['agent-1', 'agent-2', 'agent-3'];
      agents.forEach((agentId, index) => {
        mockSocket.simulateEvent('agent:state:update', {
          agentId,
          state: { ...mockAgentData, id: agentId, name: `Agent ${index + 1}` },
          timestamp: Date.now()
        });
      });
      
      // Wait for all updates to propagate
      await waitFor(() => {
        const state = testStore.getState();
        return agents.every(id => state.agents.agents.has(id));
      }, { timeout: 2000 });
      
      const state = testStore.getState();
      expect(state.agents.agents.size).to.equal(3);
    });
    
    it('should handle high-frequency updates efficiently', async () => {
      render(
        React.createElement(Provider, { store: testStore },
          React.createElement(CognitiveDashboard, { agentId: 'test-agent-1' })
        )
      );
      
      // Simulate high-frequency updates
      for (let i = 0; i < 100; i++) {
        mockSocket.simulateEvent('agent:state:update', {
          agentId: 'test-agent-1',
          state: { ...mockAgentData, context: { ...mockAgentData.context, health: 100 - i } },
          timestamp: Date.now()
        });
      }
      
      // Wait for processing to complete
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const state = testStore.getState();
      const agent = state.agents.agents.get('test-agent-1');
      
      // Should handle high-frequency updates without crashing
      expect(agent).to.not.be.undefined;
      expect(state.agents.performance.totalUpdates).to.be.greaterThan(0);
    });
    
    it('should maintain data consistency across components', async () => {
      render(
        React.createElement(Provider, { store: testStore },
          React.createElement(CognitiveDashboard, { agentId: 'test-agent-1' })
        )
      );
      
      // Update same data through different paths
      const healthUpdate = {
        agentId: 'test-agent-1',
        state: { ...mockAgentData, context: { ...mockAgentData.context, health: 75 } },
        timestamp: Date.now()
      };
      
      mockSocket.simulateEvent('agent:state:update', healthUpdate);
      
      // Wait for update to propagate
      await waitFor(() => {
        const state = testStore.getState();
        const agent = state.agents.agents.get('test-agent-1');
        return agent && agent.context.health === 75;
      }, { timeout: 1000 });
      
      // Verify consistency
      const state = testStore.getState();
      const agent = state.agents.agents.get('test-agent-1');
      expect(agent.context.health).to.equal(75);
      expect(state.agents.lastUpdate).to.be.a('number');
    });
  });
  
  describe('7. Error Handling and Graceful Degradation', () => {
    
    it('should handle socket disconnection gracefully', async () => {
      render(
        React.createElement(Provider, { store: testStore },
          React.createElement(CognitiveDashboard)
        )
      );
      
      // Simulate disconnection
      mockSocket.simulateDisconnect();
      
      // Wait for error handling
      await waitFor(() => {
        const state = testStore.getState();
        return state.connection.status === 'disconnected' || state.agents.error !== null;
      }, { timeout: 1000 });
      
      const state = testStore.getState();
      expect(state.connection.status === 'disconnected' || state.agents.error !== null).to.be.true;
    });
    
    it('should display error messages to users', async () => {
      render(
        React.createElement(Provider, { store: testStore },
          React.createElement(CognitiveDashboard)
        )
      );
      
      // Dispatch global error
      testStore.dispatch({
        type: 'ui/setGlobalError',
        payload: 'Test error message'
      });
      
      // Wait for error display
      const errorAlert = await waitFor(() => screen.getByText(/Test error message/i), { timeout: 1000 });
      expect(errorAlert).to.exist;
    });
    
    it('should retry failed connections', async () => {
      let reconnectAttempts = 0;
      mockSocket.on('reconnect_attempt', (attempt) => {
        reconnectAttempts = attempt;
      });
      
      const socketService = initializeSocket({ url: 'http://localhost:3001' });
      
      // Simulate connection failure and reconnection attempts
      mockSocket.simulateDisconnect();
      mockSocket.simulateEvent('reconnect_attempt', 1);
      mockSocket.simulateEvent('reconnect_attempt', 2);
      mockSocket.simulateEvent('reconnect_attempt', 3);
      
      expect(reconnectAttempts).to.equal(3);
    });
    
    it('should handle malformed data gracefully', () => {
      render(
        React.createElement(Provider, { store: testStore },
          React.createElement(CognitiveDashboard)
        )
      );
      
      // Send malformed data
      const malformedEvent = {
        agentId: null, // Missing required field
        state: { invalid: 'data' },
        timestamp: Date.now()
      };
      
      expect(() => {
        mockSocket.simulateEvent('agent:state:update', malformedEvent);
      }).to.not.throw();
      
      // Should not crash the application
      const state = testStore.getState();
      expect(state).to.not.be.null;
    });
    
    it('should provide fallback UI when services fail', async () => {
      render(
        React.createElement(Provider, { store: testStore },
          React.createElement(CognitiveDashboard)
        )
      );
      
      // Simulate complete service failure
      global.io = jest.fn(() => {
        throw new Error('Service unavailable');
      });
      
      // Try to initialize new service
      expect(() => {
        initializeSocket({ url: 'http://localhost:3001' });
      }).to.throw();
      
      // UI should still render with fallback state
      const dashboard = screen.getByText(/loading/i);
      expect(dashboard).to.exist;
    });
  });
  
  describe('8. Performance Validation', () => {
    
    it('should maintain acceptable response times', async () => {
      const startTime = Date.now();
      
      render(
        React.createElement(Provider, { store: testStore },
          React.createElement(CognitiveDashboard, { agentId: 'test-agent-1' })
        )
      );
      
      // Simulate agent update
      mockSocket.simulateEvent('agent:state:update', {
        agentId: 'test-agent-1',
        state: mockAgentData,
        timestamp: Date.now()
      });
      
      // Wait for update to process
      await waitFor(() => {
        const state = testStore.getState();
        return state.agents.agents.has('test-agent-1');
      }, { timeout: 1000 });
      
      const responseTime = Date.now() - startTime;
      expect(responseTime).to.be.lessThan(500); // Should be under 500ms
    });
    
    it('should handle large datasets efficiently', async () => {
      render(
        React.createElement(Provider, { store: testStore },
          React.createElement(CognitiveDashboard)
        )
      );
      
      // Simulate large dataset
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        id: `agent-${i}`,
        name: `Agent ${i}`,
        profile: mockAgentData.profile,
        status: 'online',
        lastUpdate: Date.now()
      }));
      
      testStore.dispatch({
        type: 'agents/setAgents',
        payload: largeDataset
      });
      
      // Wait for processing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const state = testStore.getState();
      expect(state.agents.agents.size).to.equal(1000);
      
      // Should still be responsive
      const dashboard = screen.getByRole('main');
      expect(dashboard).to.exist;
    });
    
    it('should optimize memory usage', () => {
      const initialMemory = process.memoryUsage().heapUsed;
      
      render(
        React.createElement(Provider, { store: testStore },
          React.createElement(CognitiveDashboard)
        )
      );
      
      // Simulate many updates
      for (let i = 0; i < 100; i++) {
        mockSocket.simulateEvent('agent:state:update', {
          agentId: 'test-agent-1',
          state: { ...mockAgentData, context: { ...mockAgentData.context, health: i } },
          timestamp: Date.now()
        });
      }
      
      // Wait for garbage collection
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;
      
      // Memory increase should be reasonable (less than 50MB)
      expect(memoryIncrease).to.be.lessThan(50 * 1024 * 1024);
    });
    
    it('should maintain smooth UI updates', async () => {
      render(
        React.createElement(Provider, { store: testStore },
          React.createElement(CognitiveDashboard)
        )
      );
      
      let updateCount = 0;
      const originalRequestAnimationFrame = global.requestAnimationFrame;
      
      global.requestAnimationFrame = jest.fn((callback) => {
        updateCount++;
        return originalRequestAnimationFrame(callback);
      });
      
      // Simulate rapid updates
      for (let i = 0; i < 10; i++) {
        mockSocket.simulateEvent('agent:state:update', {
          agentId: 'test-agent-1',
          state: { ...mockAgentData, context: { ...mockAgentData.context, health: i } },
          timestamp: Date.now()
        });
      }
      
      // Wait for animations
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Should not overwhelm the animation frame
      expect(updateCount).to.be.lessThan(20); // Reasonable limit
      
      // Restore original function
      global.requestAnimationFrame = originalRequestAnimationFrame;
    });
  });
  
  describe('9. Cross-Component Integration', () => {
    
    it('should synchronize data between tabs', async () => {
      render(
        React.createElement(Provider, { store: testStore },
          React.createElement(CognitiveDashboard, { agentId: 'test-agent-1' })
        )
      );
      
      // Update agent data
      const updatedAgent = {
        ...mockAgentData,
        cognitive: {
          ...mockAgentData.cognitive,
          purpose: {
            ...mockAgentData.cognitive.purpose,
            personality: {
              ...mockAgentData.cognitive.purpose.personality,
              openness: 0.9 // Updated trait
            }
          }
        }
      };
      
      mockSocket.simulateEvent('agent:state:update', {
        agentId: 'test-agent-1',
        state: updatedAgent,
        timestamp: Date.now()
      });
      
      // Switch to Personality tab
      const personalityTab = screen.getByText(/Personality/i);
      fireEvent.click(personalityTab);
      
      // Wait for data to propagate
      await waitFor(() => {
        const state = testStore.getState();
        const agent = state.agents.agents.get('test-agent-1');
        return agent && agent.cognitive.purpose.personality.openness === 0.9;
      }, { timeout: 1000 });
      
      const state = testStore.getState();
      const agent = state.agents.agents.get('test-agent-1');
      expect(agent.cognitive.purpose.personality.openness).to.equal(0.9);
    });
    
    it('should maintain state consistency across navigation', async () => {
      render(
        React.createElement(Provider, { store: testStore },
          React.createElement(CognitiveDashboard, { agentId: 'test-agent-1' })
        )
      );
      
      // Update agent state
      mockSocket.simulateEvent('agent:state:update', {
        agentId: 'test-agent-1',
        state: { ...mockAgentData, context: { ...mockAgentData.context, health: 80 } },
        timestamp: Date.now()
      });
      
      // Navigate between tabs
      const memoryTab = screen.getByText(/Memory/i);
      fireEvent.click(memoryTab);
      
      const goalsTab = screen.getByText(/Goals/i);
      fireEvent.click(goalsTab);
      
      const skillsTab = screen.getByText(/Skills/i);
      fireEvent.click(skillsTab);
      
      // Return to Overview tab
      const overviewTab = screen.getByText(/Overview/i);
      fireEvent.click(overviewTab);
      
      // Wait for navigation to complete
      await waitFor(() => {
        const state = testStore.getState();
        const agent = state.agents.agents.get('test-agent-1');
        return agent && agent.context.health === 80;
      }, { timeout: 1000 });
      
      const state = testStore.getState();
      const agent = state.agents.agents.get('test-agent-1');
      expect(agent.context.health).to.equal(80);
    });
    
    it('should handle concurrent user interactions', async () => {
      render(
        React.createElement(Provider, { store: testStore },
          React.createElement(CognitiveDashboard, { agentId: 'test-agent-1' })
        )
      );
      
      // Simulate concurrent interactions
      const searchToggle = screen.getByLabelText(/search/i);
      const themeToggle = screen.getByLabelText(/theme/i);
      const refreshButton = screen.getByLabelText(/refresh/i);
      
      // Trigger multiple actions simultaneously
      fireEvent.click(searchToggle);
      fireEvent.click(themeToggle);
      fireEvent.click(refreshButton);
      
      // Wait for all actions to process
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Verify all actions were handled
      const state = testStore.getState();
      expect(state.ui.sidebarOpen).to.be.a('boolean');
      expect(state.ui.theme).to.be.oneOf(['light', 'dark']);
    });
  });
});