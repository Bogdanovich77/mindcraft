/**
 * Dashboard slice for agent overview dashboard
 * 
 * This slice manages the state for the agent overview dashboard, including
 * real-time metrics, performance data, position data, and UI settings.
 */

import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { 
  AgentRealTimeMetrics, 
  PerformanceData, 
  AgentPositionData, 
  DashboardState, 
  DashboardUISettings,
  AgentStatus
} from '../../types/dashboard';
import type { AgentState } from '../../types/agent';

// Initial state
const initialState: DashboardState = {
  selectedAgentId: null,
  metrics: {},
  performanceData: {},
  positionData: {},
  settings: {
    layout: 'grid',
    refreshRate: 5000,
    animations: true,
    soundEnabled: false,
    theme: 'auto',
    notifications: {
      enabled: true,
      threshold: {
        cognitiveLoad: 0.8,
        responseTime: 1000,
        successRate: 0.9,
      },
    },
    visualization: {
      gaugeStyle: 'radial',
      chartType: 'line',
      mapStyle: '2d',
    },
  },
  loading: false,
  error: null,
  lastUpdate: Date.now(),
};

// Async thunks
export const fetchDashboardData = createAsyncThunk(
  'dashboard/fetchDashboardData',
  async (agentId: string, { rejectWithValue }) => {
    try {
      // In a real implementation, this would fetch from the backend
      // For now, return mock data
      const mockMetrics: AgentRealTimeMetrics = {
        agentId,
        timestamp: Date.now(),
        cognitiveLoad: {
          current: 0.65,
          trend: 'stable',
          threshold: 0.8,
          history: [0.6, 0.65, 0.7, 0.65, 0.6, 0.65, 0.7, 0.65, 0.6, 0.65],
        },
        performance: {
          responseTime: 250,
          successRate: 0.95,
          memoryUsage: 512,
          cpuUsage: 45,
        },
        activity: {
          currentAction: 'mining',
          actionDuration: 3000,
          actionProgress: 0.75,
          goalProgress: 0.6,
        },
        health: {
          healthStatus: 'normal',
          healthScore: 85,
          energyLevel: 0.8,
          resourceLevel: 0.7,
        },
      };

      const mockPerformanceData: PerformanceData = {
        agentId,
        timeRange: '1h',
        metrics: {
          responseTime: {
            timestamps: Array.from({ length: 60 }, (_, i) => Date.now() - (59 - i) * 60000),
            values: Array.from({ length: 60 }, () => Math.random() * 500 + 200),
            average: 350,
            min: 180,
            max: 680,
          },
          cognitiveLoad: {
            timestamps: Array.from({ length: 60 }, (_, i) => Date.now() - (59 - i) * 60000),
            values: Array.from({ length: 60 }, () => Math.random() * 0.8 + 0.2),
            average: 0.65,
            peaks: [0.9, 0.85, 0.88],
          },
          successRate: {
            timestamps: Array.from({ length: 60 }, (_, i) => Date.now() - (59 - i) * 60000),
            values: Array.from({ length: 60 }, () => Math.random() * 0.2 + 0.8),
            average: 0.92,
            trend: 'stable',
          },
          memoryUsage: {
            timestamps: Array.from({ length: 60 }, (_, i) => Date.now() - (59 - i) * 60000),
            values: Array.from({ length: 60 }, () => Math.random() * 200 + 400),
            average: 512,
            peak: 720,
          },
          cpuUsage: {
            timestamps: Array.from({ length: 60 }, (_, i) => Date.now() - (59 - i) * 60000),
            values: Array.from({ length: 60 }, () => Math.random() * 60 + 20),
            average: 45,
            peak: 85,
          },
        },
      };

      const mockPositionData: AgentPositionData = {
        agentId,
        currentPosition: {
          x: 128,
          y: 64,
          z: 256,
          dimension: 'overworld',
        },
        positionHistory: Array.from({ length: 100 }, (_, i) => ({
          timestamp: Date.now() - (99 - i) * 10000,
          x: 128 + Math.sin(i * 0.1) * 50,
          y: 64,
          z: 256 + Math.cos(i * 0.1) * 50,
          dimension: 'overworld',
        })),
        movement: {
          speed: 2.5,
          direction: 45,
          distance: 1250,
        },
        nearbyEntities: [
          {
            type: 'mob',
            name: 'Zombie',
            position: { x: 135, y: 64, z: 260 },
            distance: 8.6,
            hostility: 'hostile',
          },
          {
            type: 'player',
            name: 'Steve',
            position: { x: 120, y: 64, z: 250 },
            distance: 11.2,
            hostility: 'friendly',
          },
        ],
      };

      return {
        metrics: mockMetrics,
        performanceData: mockPerformanceData,
        positionData: mockPositionData,
      };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch dashboard data');
    }
  }
);

// Slice
const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    // Agent selection
    selectAgent: (state, action: PayloadAction<string>) => {
      state.selectedAgentId = action.payload;
    },

    clearAgentSelection: (state) => {
      state.selectedAgentId = null;
    },

    // Real-time metrics updates
    updateAgentMetrics: (state, action: PayloadAction<AgentRealTimeMetrics>) => {
      const metrics = action.payload;
      state.metrics[metrics.agentId] = metrics;
      state.lastUpdate = Date.now();
    },

    // Performance data management
    updatePerformanceData: (state, action: PayloadAction<PerformanceData>) => {
      const data = action.payload;
      state.performanceData[data.agentId] = data;
      state.lastUpdate = Date.now();
    },

    // Position data updates
    updatePositionData: (state, action: PayloadAction<AgentPositionData>) => {
      const data = action.payload;
      state.positionData[data.agentId] = data;
      state.lastUpdate = Date.now();
    },

    // Settings management
    updateSettings: (state, action: PayloadAction<Partial<DashboardUISettings>>) => {
      state.settings = { ...state.settings, ...action.payload };
    },

    // Loading and error states
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    clearError: (state) => {
      state.error = null;
    },

    // Data management
    clearData: (state) => {
      state.metrics = {};
      state.performanceData = {};
      state.positionData = {};
      state.selectedAgentId = null;
    },

    clearAgentData: (state, action: PayloadAction<string>) => {
      const agentId = action.payload;
      delete state.metrics[agentId];
      delete state.performanceData[agentId];
      delete state.positionData[agentId];
      if (state.selectedAgentId === agentId) {
        state.selectedAgentId = null;
      }
    },

    // Batch updates
    batchUpdateMetrics: (state, action: PayloadAction<AgentRealTimeMetrics[]>) => {
      action.payload.forEach((metrics) => {
        state.metrics[metrics.agentId] = metrics;
      });
      state.lastUpdate = Date.now();
    },

    batchUpdatePerformanceData: (state, action: PayloadAction<PerformanceData[]>) => {
      action.payload.forEach((data) => {
        state.performanceData[data.agentId] = data;
      });
      state.lastUpdate = Date.now();
    },

    batchUpdatePositionData: (state, action: PayloadAction<AgentPositionData[]>) => {
      action.payload.forEach((data) => {
        state.positionData[data.agentId] = data;
      });
      state.lastUpdate = Date.now();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.loading = false;
        state.metrics[action.meta.arg] = action.payload.metrics;
        state.performanceData[action.meta.arg] = action.payload.performanceData;
        state.positionData[action.meta.arg] = action.payload.positionData;
        state.lastUpdate = Date.now();
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// Actions
export const {
  selectAgent,
  clearAgentSelection,
  updateAgentMetrics,
  updatePerformanceData,
  updatePositionData,
  updateSettings,
  setLoading,
  setError,
  clearError,
  clearData,
  clearAgentData,
  batchUpdateMetrics,
  batchUpdatePerformanceData,
  batchUpdatePositionData,
} = dashboardSlice.actions;

// Selectors
export const selectDashboardState = (state: { dashboard: DashboardState }) => state.dashboard;

export const selectSelectedAgentId = (state: { dashboard: DashboardState }) => state.dashboard.selectedAgentId;

export const selectAgentMetrics = (agentId: string) => (state: { dashboard: DashboardState }) => 
  state.dashboard.metrics[agentId];

export const selectAllMetrics = (state: { dashboard: DashboardState }) => state.dashboard.metrics;

export const selectPerformanceData = (agentId: string) => (state: { dashboard: DashboardState }) => 
  state.dashboard.performanceData[agentId];

export const selectAllPerformanceData = (state: { dashboard: DashboardState }) => state.dashboard.performanceData;

export const selectPositionData = (agentId: string) => (state: { dashboard: DashboardState }) => 
  state.dashboard.positionData[agentId];

export const selectAllPositionData = (state: { dashboard: DashboardState }) => state.dashboard.positionData;

export const selectDashboardLoading = (state: { dashboard: DashboardState }) => state.dashboard.loading;

export const selectDashboardError = (state: { dashboard: DashboardState }) => state.dashboard.error;

export const selectLastUpdate = (state: { dashboard: DashboardState }) => state.dashboard.lastUpdate;

export const selectAgentIds = (state: { dashboard: DashboardState }) => Object.keys(state.dashboard.metrics);

export const selectAgentCount = (state: { dashboard: DashboardState }) => Object.keys(state.dashboard.metrics).length;

// Memoized selectors for derived data
export const selectConnectedAgents = (state: { dashboard: DashboardState }) => 
  Object.values(state.dashboard.metrics).filter(metrics => metrics.health.healthStatus !== 'critical');

export const selectDisconnectedAgents = (state: { dashboard: DashboardState }) => 
  Object.values(state.dashboard.metrics).filter(metrics => metrics.health.healthStatus === 'critical');

export const selectAgentsByHealthStatus = (status: string) => (state: { dashboard: DashboardState }) => 
  Object.values(state.dashboard.metrics).filter(metrics => metrics.health.healthStatus === status);

export const selectDashboardSummary = (state: { dashboard: DashboardState }) => ({
  totalAgents: Object.keys(state.dashboard.metrics).length,
  connectedAgents: Object.values(state.dashboard.metrics).filter(metrics => metrics.health.healthStatus !== 'critical').length,
  disconnectedAgents: Object.values(state.dashboard.metrics).filter(metrics => metrics.health.healthStatus === 'critical').length,
  lastUpdate: state.dashboard.lastUpdate,
});

// Performance selectors
export const selectAverageResponseTime = (state: { dashboard: DashboardState }) => {
  const metrics = Object.values(state.dashboard.performanceData);
  if (metrics.length === 0) return 0;
  const total = metrics.reduce((sum, data) => sum + data.metrics.responseTime.average, 0);
  return total / metrics.length;
};

export const selectAverageCognitiveLoad = (state: { dashboard: DashboardState }) => {
  const metrics = Object.values(state.dashboard.metrics);
  if (metrics.length === 0) return 0;
  const total = metrics.reduce((sum, data) => sum + data.cognitiveLoad.current, 0);
  return total / metrics.length;
};

export const selectAverageSuccessRate = (state: { dashboard: DashboardState }) => {
  const metrics = Object.values(state.dashboard.performanceData);
  if (metrics.length === 0) return 0;
  const total = metrics.reduce((sum, data) => sum + data.metrics.successRate.average, 0);
  return total / metrics.length;
};

export const selectAgentsWithHighCognitiveLoad = (threshold: number = 0.8) => (state: { dashboard: DashboardState }) =>
  Object.entries(state.dashboard.metrics)
    .filter(([, metrics]) => metrics.cognitiveLoad.current > threshold)
    .map(([agentId]) => agentId);

export const selectAgentsWithLowSuccessRate = (threshold: number = 0.7) => (state: { dashboard: DashboardState }) =>
  Object.entries(state.dashboard.performanceData)
    .filter(([, data]) => data.metrics.successRate.average < threshold)
    .map(([agentId]) => agentId);

// Complex selectors for dashboard optimization
export const selectDashboardDataForAgent = (agentId: string) => (state: { dashboard: DashboardState }) => ({
  metrics: state.dashboard.metrics[agentId],
  performanceData: state.dashboard.performanceData[agentId],
  positionData: state.dashboard.positionData[agentId],
  settings: state.dashboard.settings,
  loading: state.dashboard.loading,
  error: state.dashboard.error,
});

export const selectDashboardAnalytics = (state: { dashboard: DashboardState }) => {
  const agentIds = Object.keys(state.dashboard.metrics);
  const metrics = Object.values(state.dashboard.metrics);
  const performanceData = Object.values(state.dashboard.performanceData);

  return {
    totalAgents: agentIds.length,
    averageCognitiveLoad: metrics.reduce((sum, m) => sum + m.cognitiveLoad.current, 0) / (metrics.length || 1),
    averageResponseTime: performanceData.reduce((sum, p) => sum + p.metrics.responseTime.average, 0) / (performanceData.length || 1),
    averageSuccessRate: performanceData.reduce((sum, p) => sum + p.metrics.successRate.average, 0) / (performanceData.length || 1),
    agentsWithHighLoad: metrics.filter(m => m.cognitiveLoad.current > 0.8).length,
    agentsWithLowSuccessRate: performanceData.filter(p => p.metrics.successRate.average < 0.7).length,
    lastUpdate: state.dashboard.lastUpdate,
  };
};

export default dashboardSlice.reducer;