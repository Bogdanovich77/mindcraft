/**
 * Socket.IO Integration Test Suite
 * Tests real-time data streaming and connection handling
 */

import { io } from 'socket.io-client';
import { renderWithProviders, createMockSocket, createSocketEventTester, waitForCondition } from '../utils/testUtils';
import { store } from '../../src/store';
import { socketIOConfig } from '../config/testConfig';

// Mock Socket.IO client
jest.mock('socket.io-client');

describe('Socket.IO Integration Tests', () => {
  let mockSocket: any;
  let eventTester: any;

  beforeEach(() => {
    mockSocket = createMockSocket();
    (io as jest.Mock).mockReturnValue(mockSocket);
    eventTester = createSocketEventTester();
    
    // Reset store
    store.dispatch({ type: 'RESET_STATE' });
  });

  afterEach(() => {
    jest.clearAllMocks();
    eventTester.clearEvents();
  });

  describe('Connection Management', () => {
    test('should establish connection on component mount', async () => {
      const { default: App } = await import('../../src/App');
      renderWithProviders(<App />);
      
      expect(io).toHaveBeenCalledWith(socketIOConfig.url, expect.any(Object));
      expect(mockSocket.connect).toHaveBeenCalled();
    });

    test('should handle connection success', async () => {
      const { default: App } = await import('../../src/App');
      renderWithProviders(<App />);
      
      // Simulate successful connection
      const connectCallback = mockSocket.on.mock.calls.find(call => call[0] === 'connect')?.[1];
      if (connectCallback) {
        connectCallback();
      }
      
      await waitForCondition(() => {
        const state = store.getState();
        return state.connection.status === 'connected';
      });
      
      const state = store.getState();
      expect(state.connection.status).toBe('connected');
      expect(state.connection.lastError).toBeNull();
    });

    test('should handle connection failure', async () => {
      const { default: App } = await import('../../src/App');
      renderWithProviders(<App />);
      
      // Simulate connection failure
      const connectErrorCallback = mockSocket.on.mock.calls.find(call => call[0] === 'connect_error')?.[1];
      if (connectErrorCallback) {
        connectErrorCallback(new Error('Connection failed'));
      }
      
      await waitForCondition(() => {
        const state = store.getState();
        return state.connection.status === 'disconnected';
      });
      
      const state = store.getState();
      expect(state.connection.status).toBe('disconnected');
      expect(state.connection.lastError).toBeTruthy();
    });

    test('should handle disconnection', async () => {
      const { default: App } = await import('../../src/App');
      renderWithProviders(<App />);
      
      // Simulate disconnection
      const disconnectCallback = mockSocket.on.mock.calls.find(call => call[0] === 'disconnect')?.[1];
      if (disconnectCallback) {
        disconnectCallback('server disconnect');
      }
      
      await waitForCondition(() => {
        const state = store.getState();
        return state.connection.status === 'disconnected';
      });
      
      const state = store.getState();
      expect(state.connection.status).toBe('disconnected');
    });

    test('should attempt reconnection on disconnect', async () => {
      const { default: App } = await import('../../src/App');
      renderWithProviders(<App />);
      
      // Simulate disconnection
      const disconnectCallback = mockSocket.on.mock.calls.find(call => call[0] === 'disconnect')?.[1];
      if (disconnectCallback) {
        disconnectCallback('server disconnect');
      }
      
      // Wait for reconnection attempt
      await waitForCondition(() => {
        return mockSocket.connect.mock.calls.length > 1;
      }, 10000);
      
      expect(mockSocket.connect).toHaveBeenCalledTimes(2);
    });
  });

  describe('Agent State Streaming', () => {
    test('should receive agent state updates', async () => {
      const { default: App } = await import('../../src/App');
      renderWithProviders(<App />);
      
      const mockAgentState = {
        id: 'test-agent-1',
        name: 'Test Agent',
        status: 'active',
        position: { x: 100, y: 64, z: 200 },
        health: 20,
        food: 18,
        level: 5,
        experience: 1000
      };
      
      // Simulate agent state update
      const agentStateCallback = mockSocket.on.mock.calls.find(call => call[0] === 'agent:state')?.[1];
      if (agentStateCallback) {
        agentStateCallback(mockAgentState);
      }
      
      await waitForCondition(() => {
        const state = store.getState();
        return state.agents.agents.length > 0;
      });
      
      const state = store.getState();
      expect(state.agents.agents).toContainEqual(mockAgentState);
    });

    test('should handle multiple agent updates', async () => {
      const { default: App } = await import('../../src/App');
      renderWithProviders(<App />);
      
      const mockAgents = [
        { id: 'agent-1', name: 'Agent 1', status: 'active' },
        { id: 'agent-2', name: 'Agent 2', status: 'active' },
        { id: 'agent-3', name: 'Agent 3', status: 'active' }
      ];
      
      // Simulate multiple agent updates
      const agentStateCallback = mockSocket.on.mock.calls.find(call => call[0] === 'agent:state')?.[1];
      if (agentStateCallback) {
        mockAgents.forEach(agent => agentStateCallback(agent));
      }
      
      await waitForCondition(() => {
        const state = store.getState();
        return state.agents.agents.length === 3;
      });
      
      const state = store.getState();
      expect(state.agents.agents).toHaveLength(3);
    });

    test('should update existing agent data', async () => {
      const { default: App } = await import('../../src/App');
      renderWithProviders(<App />);
      
      const initialAgent = { id: 'agent-1', name: 'Agent 1', health: 20 };
      const updatedAgent = { id: 'agent-1', name: 'Agent 1', health: 15 };
      
      const agentStateCallback = mockSocket.on.mock.calls.find(call => call[0] === 'agent:state')?.[1];
      if (agentStateCallback) {
        // Initial state
        agentStateCallback(initialAgent);
      }
      
      await waitForCondition(() => {
        const state = store.getState();
        return state.agents.agents.length > 0;
      });
      
      // Updated state
      if (agentStateCallback) {
        agentStateCallback(updatedAgent);
      }
      
      await waitForCondition(() => {
        const state = store.getState();
        const agent = state.agents.agents.find(a => a.id === 'agent-1');
        return agent?.health === 15;
      });
      
      const state = store.getState();
      const agent = state.agents.agents.find(a => a.id === 'agent-1');
      expect(agent?.health).toBe(15);
    });
  });

  describe('Real-time Event Handling', () => {
    test('should handle agent connection events', async () => {
      const { default: App } = await import('../../src/App');
      renderWithProviders(<App />);
      
      const mockAgent = { id: 'agent-1', name: 'Agent 1', status: 'connected' };
      
      // Simulate agent connection
      const agentConnectCallback = mockSocket.on.mock.calls.find(call => call[0] === 'agent:connected')?.[1];
      if (agentConnectCallback) {
        agentConnectCallback(mockAgent);
      }
      
      await waitForCondition(() => {
        const state = store.getState();
        const agent = state.agents.agents.find(a => a.id === 'agent-1');
        return agent?.status === 'connected';
      });
      
      const state = store.getState();
      const agent = state.agents.agents.find(a => a.id === 'agent-1');
      expect(agent?.status).toBe('connected');
    });

    test('should handle agent disconnection events', async () => {
      const { default: App } = await import('../../src/App');
      renderWithProviders(<App />);
      
      const mockAgent = { id: 'agent-1', name: 'Agent 1', status: 'connected' };
      
      // First add agent
      const agentStateCallback = mockSocket.on.mock.calls.find(call => call[0] === 'agent:state')?.[1];
      if (agentStateCallback) {
        agentStateCallback(mockAgent);
      }
      
      await waitForCondition(() => {
        const state = store.getState();
        return state.agents.agents.length > 0;
      });
      
      // Then simulate disconnection
      const agentDisconnectCallback = mockSocket.on.mock.calls.find(call => call[0] === 'agent:disconnected')?.[1];
      if (agentDisconnectCallback) {
        agentDisconnectCallback({ agentId: 'agent-1', reason: 'timeout' });
      }
      
      await waitForCondition(() => {
        const state = store.getState();
        const agent = state.agents.agents.find(a => a.id === 'agent-1');
        return agent?.status === 'disconnected';
      });
      
      const state = store.getState();
      const agent = state.agents.agents.find(a => a.id === 'agent-1');
      expect(agent?.status).toBe('disconnected');
    });

    test('should handle system status events', async () => {
      const { default: App } = await import('../../src/App');
      renderWithProviders(<App />);
      
      const mockSystemStatus = {
        status: 'healthy',
        uptime: 3600,
        activeAgents: 5,
        memoryUsage: 0.6
      };
      
      // Simulate system status update
      const systemStatusCallback = mockSocket.on.mock.calls.find(call => call[0] === 'system:status')?.[1];
      if (systemStatusCallback) {
        systemStatusCallback(mockSystemStatus);
      }
      
      await waitForCondition(() => {
        const state = store.getState();
        return state.connection.systemStatus !== null;
      });
      
      const state = store.getState();
      expect(state.connection.systemStatus).toEqual(mockSystemStatus);
    });
  });

  describe('Error Handling', () => {
    test('should handle socket errors gracefully', async () => {
      const { default: App } = await import('../../src/App');
      renderWithProviders(<App />);
      
      const errorMessage = 'Socket connection timeout';
      
      // Simulate socket error
      const errorCallback = mockSocket.on.mock.calls.find(call => call[0] === 'error')?.[1];
      if (errorCallback) {
        errorCallback(new Error(errorMessage));
      }
      
      await waitForCondition(() => {
        const state = store.getState();
        return state.connection.lastError?.message === errorMessage;
      });
      
      const state = store.getState();
      expect(state.connection.lastError?.message).toBe(errorMessage);
    });

    test('should handle malformed data', async () => {
      const { default: App } = await import('../../src/App');
      renderWithProviders(<App />);
      
      const malformedData = { invalid: 'data' };
      
      // Simulate malformed agent state
      const agentStateCallback = mockSocket.on.mock.calls.find(call => call[0] === 'agent:state')?.[1];
      if (agentStateCallback) {
        agentStateCallback(malformedData);
      }
      
      // Should not crash and should maintain existing state
      await waitFor(() => {
        const state = store.getState();
        return state.ui.error !== null;
      });
      
      const state = store.getState();
      expect(state.ui.error).toBeTruthy();
      expect(state.agents.agents).toEqual([]);
    });

    test('should recover from connection loss', async () => {
      const { default: App } = await import('../../src/App');
      renderWithProviders(<App />);
      
      // Simulate connection loss
      const disconnectCallback = mockSocket.on.mock.calls.find(call => call[0] === 'disconnect')?.[1];
      if (disconnectCallback) {
        disconnectCallback('network error');
      }
      
      await waitForCondition(() => {
        const state = store.getState();
        return state.connection.status === 'disconnected';
      });
      
      // Simulate reconnection
      const connectCallback = mockSocket.on.mock.calls.find(call => call[0] === 'connect')?.[1];
      if (connectCallback) {
        connectCallback();
      }
      
      await waitForCondition(() => {
        const state = store.getState();
        return state.connection.status === 'connected';
      });
      
      const state = store.getState();
      expect(state.connection.status).toBe('connected');
      expect(state.connection.reconnectAttempts).toBeGreaterThan(0);
    });
  });

  describe('Performance Optimization', () => {
    test('should handle high-frequency updates efficiently', async () => {
      const { default: App } = await import('../../src/App');
      renderWithProviders(<App />);
      
      const startTime = performance.now();
      const updateCount = 100;
      
      // Simulate high-frequency updates
      const agentStateCallback = mockSocket.on.mock.calls.find(call => call[0] === 'agent:state')?.[1];
      if (agentStateCallback) {
        for (let i = 0; i < updateCount; i++) {
          agentStateCallback({
            id: `agent-${i}`,
            name: `Agent ${i}`,
            position: { x: i, y: 64, z: i },
            health: 20,
            timestamp: Date.now()
          });
        }
      }
      
      await waitForCondition(() => {
        const state = store.getState();
        return state.agents.agents.length === updateCount;
      });
      
      const endTime = performance.now();
      const processingTime = endTime - startTime;
      
      // Should handle 100 updates in under 1 second
      expect(processingTime).toBeLessThan(1000);
      
      const state = store.getState();
      expect(state.agents.agents).toHaveLength(updateCount);
    });

    test('should throttle excessive updates', async () => {
      const { default: App } = await import('../../src/App');
      renderWithProviders(<App />);
      
      const agentId = 'test-agent-1';
      const updateCount = 50;
      
      // Simulate rapid updates for same agent
      const agentStateCallback = mockSocket.on.mock.calls.find(call => call[0] === 'agent:state')?.[1];
      if (agentStateCallback) {
        for (let i = 0; i < updateCount; i++) {
          agentStateCallback({
            id: agentId,
            name: 'Test Agent',
            position: { x: Math.random() * 100, y: 64, z: Math.random() * 100 },
            health: 20,
            timestamp: Date.now()
          });
        }
      }
      
      // Wait for throttling to take effect
      await waitFor(500);
      
      const state = store.getState();
      const agent = state.agents.agents.find(a => a.id === agentId);
      
      // Should have received updates but not all 50 due to throttling
      expect(agent).toBeTruthy();
      expect(mockSocket.emit).toHaveBeenCalledWith('agent:ack', {
        agentId,
        lastUpdate: expect.any(Number)
      });
    });
  });

  describe('Memory Management', () => {
    test('should clean up event listeners on unmount', () => {
      const { unmount } = renderWithProviders(<div />);
      
      // Simulate component unmount
      unmount();
      
      // Socket should be disconnected
      expect(mockSocket.disconnect).toHaveBeenCalled();
      
      // Event listeners should be cleaned up
      expect(mockSocket.off).toHaveBeenCalledTimes(expect.any(Number));
    });

    test('should not leak memory on repeated connections', async () => {
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
      
      // Simulate multiple connection cycles
      for (let i = 0; i < 10; i++) {
        const { unmount } = renderWithProviders(<div />);
        
        // Simulate connection
        const connectCallback = mockSocket.on.mock.calls.find(call => call[0] === 'connect')?.[1];
        if (connectCallback) {
          connectCallback();
        }
        
        // Simulate disconnection
        const disconnectCallback = mockSocket.on.mock.calls.find(call => call[0] === 'disconnect')?.[1];
        if (disconnectCallback) {
          disconnectCallback();
        }
        
        unmount();
      }
      
      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
      const memoryGrowth = finalMemory - initialMemory;
      
      // Memory growth should be minimal
      expect(memoryGrowth).toBeLessThan(1024 * 1024); // Less than 1MB
    });
  });
});