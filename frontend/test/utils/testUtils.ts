/**
 * Comprehensive Testing Utilities
 * Provides common utilities for all testing scenarios
 */

import { render, RenderOptions } from '@testing-library/react';
import { configure } from '@testing-library/dom';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { store } from '../../store';
import { AgentState, ConnectionState } from '../../store/types';

// Configure testing library
configure({ testIdAttribute: 'data-testid' });

// Test theme for consistent rendering
const testTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

// Mock agent data for testing
export const mockAgentState: AgentState = {
  id: 'test-agent-1',
  name: 'Test Agent',
  status: 'active',
  position: { x: 0, y: 64, z: 0 },
  health: 20,
  food: 20,
  experience: 0,
  level: 1,
  inventory: {
    items: [
      { id: 'oak_log', name: 'Oak Log', count: 64, slot: 0 },
      { id: 'cobblestone', name: 'Cobblestone', count: 32, slot: 1 },
    ],
    armor: [],
    mainHand: null,
    offHand: null,
  },
  cognitive: {
    purpose: {
      identity: {
        name: 'Test Agent',
        role: 'miner',
        background: 'Test background',
        corePurpose: 'Test purpose'
      },
      personality: {
        openness: 0.7,
        conscientiousness: 0.8,
        extraversion: 0.6,
        agreeableness: 0.9,
        neuroticism: 0.3,
        riskTolerance: 0.5,
        creativity: 0.7,
        patience: 0.8,
        competitiveness: 0.4,
        curiosity: 0.9
      },
      motivations: {
        primary: { type: 'exploration', strength: 0.8, satisfaction: 0.6 },
        secondary: [
          { type: 'resource_gathering', strength: 0.7, satisfaction: 0.5 },
          { type: 'building', strength: 0.6, satisfaction: 0.4 }
        ]
      },
      values: [
        { name: 'efficiency', priority: 0.9, weight: 0.3 },
        { name: 'safety', priority: 0.8, weight: 0.2 },
        { name: 'creativity', priority: 0.7, weight: 0.1 }
      ],
      ethics: {
        harmAvoidance: 0.9,
        fairness: 0.8,
        loyalty: 0.7,
        authority: 0.6,
        purity: 0.5
      }
    },
    goals: {
      strategic: [
        {
          id: 'strat-1',
          description: 'Build a base',
          priority: 'HIGH',
          status: 'ACTIVE',
          progress: { current: 30, target: 100, percentage: 0.3 },
          createdAt: Date.now() - 86400000,
          dependencies: [],
          resources: { required: [], allocated: [] }
        }
      ],
      tactical: [
        {
          id: 'tact-1',
          description: 'Gather resources',
          priority: 'MEDIUM',
          status: 'ACTIVE',
          progress: { current: 15, target: 50, percentage: 0.3 },
          createdAt: Date.now() - 3600000,
          dependencies: ['strat-1'],
          resources: { required: [], allocated: [] }
        }
      ],
      operational: [
        {
          id: 'op-1',
          description: 'Mine iron ore',
          priority: 'LOW',
          status: 'PENDING',
          progress: { current: 0, target: 10, percentage: 0 },
          createdAt: Date.now() - 1800000,
          dependencies: ['tact-1'],
          resources: { required: [], allocated: [] }
        }
      ]
    },
    skills: {
      mining: {
        type: 'mining',
        proficiency: {
          overall: 0.7,
          knowledge: 0.8,
          practical: 0.6,
          creative: 0.5
        },
        experience: 1500,
        level: 15,
        usage: { totalUses: 500, recentUses: 25, successRate: 0.85 },
        learning: {
          rate: 1.2,
          plateau: false,
          breakthrough: false
        }
      },
      building: {
        type: 'building',
        proficiency: {
          overall: 0.5,
          knowledge: 0.6,
          practical: 0.4,
          creative: 0.7
        },
        experience: 800,
        level: 8,
        usage: { totalUses: 200, recentUses: 10, successRate: 0.75 },
        learning: {
          rate: 1.0,
          plateau: false,
          breakthrough: false
        }
      }
    },
    memory: {
      semantic: {
        concepts: 150,
        facts: 300,
        relationships: 450
      },
      episodic: {
        events: 200,
        contexts: 180,
        emotionalTags: 120
      },
      procedural: {
        skills: 25,
        procedures: 50,
        habits: 15
      },
      working: {
        currentFocus: 'mining',
        activeTasks: ['mine_iron', 'explore_cave'],
        buffer: { size: 7, utilization: 0.6 }
      }
    },
    processing: {
      currentPhase: 'PLANNING',
      cognitiveLoad: 0.6,
      attentionLevel: 0.8,
      processingHistory: [
        {
          timestamp: Date.now() - 1000,
          phase: 'ANALYSIS',
          duration: 150,
          success: true
        }
      ]
    }
  },
  social: {
    relationships: [
      {
        agentId: 'agent-2',
        name: 'Agent 2',
        relationshipType: 'COLLEAGUE',
        trust: 0.7,
        friendship: 0.6,
        reputation: 0.8,
        interactions: 25,
        lastInteraction: Date.now() - 3600000
      }
    ],
    mentalModels: [
      {
        agentId: 'agent-2',
        beliefs: [
          {
            type: 'intention',
            content: 'gathering_resources',
            confidence: 0.8,
            lastUpdated: Date.now() - 1800000
          }
        ],
        emotions: [
          {
            type: 'happiness',
            intensity: 0.7,
            lastDetected: Date.now() - 900000
          }
        ]
      }
    ],
    socialContext: {
      groupSize: 2,
      socialCohesion: 0.7,
      communicationFrequency: 0.6,
      conflictLevel: 0.1
    }
  },
  performance: {
    responseTime: 150,
    successRate: 0.85,
    errorRate: 0.05,
    cognitiveProcessingTime: 200,
    reactiveResponseTime: 50,
    memoryUsage: 1024,
    cpuUsage: 0.3,
    lastUpdate: Date.now()
  },
  lastUpdate: Date.now()
};

// Mock connection state
export const mockConnectionState: ConnectionState = {
  status: 'connected',
  serverUrl: 'ws://localhost:3000',
  reconnectAttempts: 0,
  lastConnected: Date.now(),
  lastError: null,
  connectionHistory: [
    {
      timestamp: Date.now() - 60000,
      status: 'connected',
      duration: 60000
    }
  ]
};

// Custom render function with providers
export const renderWithProviders = (
  ui: React.ReactElement,
  options: RenderOptions = {}
) => {
  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <Provider store={store}>
      <BrowserRouter>
        <ThemeProvider theme={testTheme}>
          {children}
        </ThemeProvider>
      </BrowserRouter>
    </Provider>
  );

  return render(ui, { wrapper: Wrapper, ...options });
};

// Mock Socket.IO client
export const createMockSocket = () => {
  const listeners: Record<string, Function[]> = {};
  
  return {
    on: jest.fn((event: string, callback: Function) => {
      if (!listeners[event]) {
        listeners[event] = [];
      }
      listeners[event].push(callback);
    }),
    off: jest.fn((event: string, callback: Function) => {
      if (listeners[event]) {
        listeners[event] = listeners[event].filter(cb => cb !== callback);
      }
    }),
    emit: jest.fn((event: string, data: any) => {
      // Mock emit behavior
    }),
    disconnect: jest.fn(),
    connect: jest.fn(),
    connected: true,
    listeners
  };
};

// Performance testing utilities
export const measureRenderTime = (component: React.ReactElement, iterations = 10) => {
  const times: number[] = [];
  
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    renderWithProviders(component);
    const end = performance.now();
    times.push(end - start);
  }
  
  return {
    average: times.reduce((sum, time) => sum + time, 0) / times.length,
    min: Math.min(...times),
    max: Math.max(...times),
    median: times.sort((a, b) => a - b)[Math.floor(times.length / 2)]
  };
};

// Memory usage testing
export const measureMemoryUsage = () => {
  if (typeof window !== 'undefined' && 'memory' in performance) {
    return (performance as any).memory;
  }
  return null;
};

// Accessibility testing helpers
export const checkAccessibility = async (container: HTMLElement) => {
  const { default: axe } = await import('axe-core');
  const results = await axe.run(container);
  return results;
};

// Error boundary testing
export const createErrorBoundary = () => {
  class TestErrorBoundary extends React.Component<
    { children: React.ReactNode; onError?: (error: Error) => void },
    { hasError: boolean; error?: Error }
  > {
    constructor(props: any) {
      super(props);
      this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error) {
      return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
      if (this.props.onError) {
        this.props.onError(error);
      }
    }

    render() {
      if (this.state.hasError) {
        return <div data-testid="error-boundary-fallback">Error occurred</div>;
      }

      return this.props.children;
    }
  }

  return TestErrorBoundary;
};

// Mock data generators
export const generateMockAgents = (count: number): AgentState[] => {
  return Array.from({ length: count }, (_, index) => ({
    ...mockAgentState,
    id: `test-agent-${index + 1}`,
    name: `Test Agent ${index + 1}`,
    position: {
      x: Math.random() * 1000,
      y: 64,
      z: Math.random() * 1000
    }
  }));
};

// Test timing utilities
export const waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const waitForCondition = async (
  condition: () => boolean,
  timeout = 5000,
  interval = 100
): Promise<boolean> => {
  const start = Date.now();
  
  while (Date.now() - start < timeout) {
    if (condition()) {
      return true;
    }
    await waitFor(interval);
  }
  
  return false;
};

// Redux store testing utilities
export const createMockStore = (initialState = {}) => {
  return {
    getState: () => ({
      agents: { agents: [], selectedAgent: null, loading: false },
      connection: mockConnectionState,
      ui: { activeTab: 'overview', loading: false, error: null },
      ...initialState
    }),
    dispatch: jest.fn(),
    subscribe: jest.fn(),
    replaceReducer: jest.fn()
  };
};

// Socket.IO event testing utilities
export const createSocketEventTester = () => {
  const events: Array<{ event: string; data: any; timestamp: number }> = [];
  
  return {
    recordEvent: (event: string, data: any) => {
      events.push({
        event,
        data,
        timestamp: Date.now()
      });
    },
    getEvents: (event?: string) => {
      return event ? events.filter(e => e.event === event) : events;
    },
    clearEvents: () => {
      events.length = 0;
    },
    waitForEvent: async (event: string, timeout = 5000) => {
      return waitForCondition(
        () => events.some(e => e.event === event),
        timeout
      );
    }
  };
};

// Performance metrics collection
export const collectPerformanceMetrics = () => {
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  const paint = performance.getEntriesByType('paint');
  
  return {
    domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
    loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
    firstPaint: paint.find(entry => entry.name === 'first-paint')?.startTime || 0,
    firstContentfulPaint: paint.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
    resources: performance.getEntriesByType('resource').length
  };
};

// Cross-browser testing utilities
export const getBrowserInfo = () => {
  const userAgent = navigator.userAgent;
  const isChrome = /Chrome/.test(userAgent);
  const isFirefox = /Firefox/.test(userAgent);
  const isSafari = /Safari/.test(userAgent) && !isChrome;
  const isEdge = /Edge/.test(userAgent);
  
  return {
    userAgent,
    isChrome,
    isFirefox,
    isSafari,
    isEdge,
    isMobile: /Mobile|Android|iPhone|iPad/.test(userAgent)
  };
};

// Bundle size testing utilities
export const analyzeBundleSize = async () => {
  try {
    const response = await fetch('/dist/assets/index.js');
    const text = await response.text();
    const size = new Blob([text]).size;
    
    return {
      rawSize: size,
      gzippedSize: size * 0.3, // Approximate gzip compression
      formatted: {
        raw: `${(size / 1024).toFixed(2)} KB`,
        gzipped: `${(size * 0.3 / 1024).toFixed(2)} KB`
      }
    };
  } catch (error) {
    return null;
  }
};

export default {
  renderWithProviders,
  createMockSocket,
  measureRenderTime,
  measureMemoryUsage,
  checkAccessibility,
  createErrorBoundary,
  generateMockAgents,
  waitFor,
  waitForCondition,
  createMockStore,
  createSocketEventTester,
  collectPerformanceMetrics,
  getBrowserInfo,
  analyzeBundleSize,
  mockAgentState,
  mockConnectionState
};