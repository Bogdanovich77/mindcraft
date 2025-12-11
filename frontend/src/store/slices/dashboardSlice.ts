import { createSlice, createAsyncThunk, type PayloadAction, createSelector } from '@reduxjs/toolkit';
import type {
  AgentRealTimeMetrics,
  PerformanceData,
  AgentPositionData,
  DashboardUISettings,
  DashboardState,
  DashboardError,
  TimeRange,
  ChartType
} from '../../types/dashboard';

// Initial state for the dashboard
const initialDashboardState: DashboardState = {
  selectedAgentId: null,
  metrics: new Map(),
  performanceData: new Map(),
  positionData: new Map(),
  settings: {
    layout: 'grid',
    refreshRate: 1000,
    animations: true,
    soundEnabled: false,
    theme: 'light',
    notifications: {
      enabled: true,
      threshold: {
        cognitiveLoad: 80,
        responseTime: 2000,
        successRate: 0.8
      }
    },
    visualization: {
      gaugeStyle: 'radial',
      chartType: 'line',
      mapStyle: '2d'
    }
  },
  loading: false,
  error: null,
  lastUpdate: Date.now()
};

// Async thunks for dashboard operations
export const fetchAgentMetrics = createAsyncThunk(
  'dashboard/fetchAgentMetrics',
  async (agentId: string, { rejectWithValue }) => {
    try {
      // This would typically make an API call to fetch metrics
      // For now, we'll simulate with mock data
      const metrics: AgentRealTimeMetrics = {
        agentId,
        timestamp: Date.now(),
        cognitiveLoad: {
          current: Math.random(),
          trend: ['increasing', 'decreasing', 'stable'][Math.floor(Math.random() * 3)] as 'increasing' | 'decreasing' | 'stable',
          threshold: 0.8,
          history: Array.from({ length: 10 }, () => Math.random())
        },
        performance: {
          responseTime: Math.random() * 1000,
          successRate: Math.random(),
          memoryUsage: Math.random() * 2048,
          cpuUsage: Math.random() * 100
        },
        activity: {
          currentAction: ['mining', 'building', 'exploring', 'idle'][Math.floor(Math.random() * 4)],
          actionDuration: Math.random() * 5000,
          actionProgress: Math.random(),
          goalProgress: Math.random()
        },
        health: {
          healthStatus: ['critical', 'warning', 'normal', 'optimal'][Math.floor(Math.random() * 4)] as 'critical' | 'warning' | 'normal' | 'optimal',
          healthScore: Math.random() * 100,
          energyLevel: Math.random(),
          resourceLevel: Math.random()
        }
      };

      return metrics;
    } catch (error) {
      return rejectWithValue({
        code: 'FETCH_METRICS_ERROR',
        message: 'Failed to fetch agent metrics',
        timestamp: Date.now(),
        retryable: true
      } as DashboardError);
    }
  }
);

export const fetchPerformanceData = createAsyncThunk(
  'dashboard/fetchPerformanceData',
  async ({ agentId, timeRange }: { agentId: string; timeRange: TimeRange }, { rejectWithValue }) => {
    try {
      // This would typically make an API call to fetch performance data
      const performanceData: PerformanceData = {
        agentId,
        timeRange,
        metrics: {
          responseTime: {
            timestamps: Array.from({ length: 50 }, (_, i) => Date.now() - (49 - i) * 60000),
            values: Array.from({ length: 50 }, () => Math.random() * 1000),
            average: Math.random() * 1000,
            min: Math.random() * 500,
            max: Math.random() * 1500
          },
          cognitiveLoad: {
            timestamps: Array.from({ length: 50 }, (_, i) => Date.now() - (49 - i) * 60000),
            values: Array.from({ length: 50 }, () => Math.random()),
            average: Math.random() * 0.8,
            peaks: Array.from({ length: 5 }, () => Math.random())
          },
          successRate: {
            timestamps: Array.from({ length: 50 }, (_, i) => Date.now() - (49 - i) * 60000),
            values: Array.from({ length: 50 }, () => Math.random()),
            average: Math.random(),
            trend: ['improving', 'declining', 'stable'][Math.floor(Math.random() * 3)] as 'improving' | 'declining' | 'stable'
          },
          memoryUsage: {
            timestamps: Array.from({ length: 50 }, (_, i) => Date.now() - (49 - i) * 60000),
            values: Array.from({ length: 50 }, () => Math.random() * 2048),
            average: Math.random() * 1024,
            peak: Math.random() * 2048
          },
          cpuUsage: {
            timestamps: Array.from({ length: 50 }, (_, i) => Date.now() - (49 - i) * 60000),
            values: Array.from({ length: 50 }, () => Math.random() * 100),
            average: Math.random() * 80,
            peak: Math.random() * 100
          }
        }
      };

      return performanceData;
    } catch (error) {
      return rejectWithValue({
        code: 'FETCH_PERFORMANCE_ERROR',
        message: 'Failed to fetch performance data',
        timestamp: Date.now(),
        retryable: true
      } as DashboardError);
    }
  }
);

export const fetchPositionData = createAsyncThunk(
  'dashboard/fetchPositionData',
  async (agentId: string, { rejectWithValue }) => {
    try {
      // This would typically make an API call to fetch position data
      const positionData: AgentPositionData = {
        agentId,
        currentPosition: {
          x: Math.random() * 1000,
          y: Math.random() * 100,
          z: Math.random() * 1000,
          dimension: 'overworld'
        },
        positionHistory: Array.from({ length: 20 }, (_, i) => ({
          timestamp: Date.now() - (19 - i) * 30000,
          x: Math.random() * 1000,
          y: Math.random() * 100,
          z: Math.random() * 1000,
          dimension: 'overworld'
        })),
        movement: {
          speed: Math.random() * 10,
          direction: Math.random() * 360,
          distance: Math.random() * 1000
        },
        nearbyEntities: Array.from({ length: Math.floor(Math.random() * 5) }, () => ({
          type: ['mob', 'player', 'item'][Math.floor(Math.random() * 3)],
          name: `Entity_${Math.floor(Math.random() * 100)}`,
          position: {
            x: Math.random() * 1000,
            y: Math.random() * 100,
            z: Math.random() * 1000
          },
          distance: Math.random() * 50,
          hostility: ['friendly', 'neutral', 'hostile'][Math.floor(Math.random() * 3)] as 'friendly' | 'neutral' | 'hostile'
        }))
      };

      return positionData;
    } catch (error) {
      return rejectWithValue({
        code: 'FETCH_POSITION_ERROR',
        message: 'Failed to fetch position data',
        timestamp: Date.now(),
        retryable: true
      } as DashboardError);
    }
  }
);

// Dashboard slice
const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: initialDashboardState,
  reducers: {
    // Agent selection
    selectAgent: (state, action: PayloadAction<string>) => {
      state.selectedAgentId = action.payload;
    },
    deselectAgent: (state) => {
      state.selectedAgentId = null;
    },

    // Real-time metrics updates
    updateAgentMetrics: (state, action: PayloadAction<AgentRealTimeMetrics>) => {
      const metrics = action.payload;
      state.metrics.set(metrics.agentId, metrics);
      state.lastUpdate = Date.now();
    },

    // Performance data management
    updatePerformanceData: (state, action: PayloadAction<PerformanceData>) => {
      const data = action.payload;
      state.performanceData.set(data.agentId, data);
      state.lastUpdate = Date.now();
    },

    // Position data updates
    updatePositionData: (state, action: PayloadAction<AgentPositionData>) => {
      const data = action.payload;
      state.positionData.set(data.agentId, data);
      state.lastUpdate = Date.now();
    },

    // UI settings
    updateSettings: (state, action: PayloadAction<Partial<DashboardUISettings>>) => {
      state.settings = { ...state.settings, ...action.payload };
    },
    setLayout: (state, action: PayloadAction<'grid' | 'list' | 'compact'>) => {
      state.settings.layout = action.payload;
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark' | 'auto'>) => {
      state.settings.theme = action.payload;
    },
    setRefreshRate: (state, action: PayloadAction<number>) => {
      state.settings.refreshRate = action.payload;
    },
    setChartType: (state, action: PayloadAction<ChartType>) => {
      state.settings.visualization.chartType = action.payload;
    },
    setGaugeStyle: (state, action: PayloadAction<'radial' | 'linear' | 'arc'>) => {
      state.settings.visualization.gaugeStyle = action.payload;
    },
    setMapStyle: (state, action: PayloadAction<'2d' | '3d' | 'hybrid'>) => {
      state.settings.visualization.mapStyle = action.payload;
    },
    toggleAnimations: (state) => {
      state.settings.animations = !state.settings.animations;
    },
    toggleSoundEnabled: (state) => {
      state.settings.soundEnabled = !state.settings.soundEnabled;
    },
    toggleNotifications: (state) => {
      state.settings.notifications.enabled = !state.settings.notifications.enabled;
    },
    setNotificationThreshold: (state, action: PayloadAction<Partial<DashboardUISettings['notifications']['threshold']>>) => {
      state.settings.notifications.threshold = { 
        ...state.settings.notifications.threshold, 
        ...action.payload 
      };
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

    // Data cleanup
    clearAgentData: (state, action: PayloadAction<string>) => {
      const agentId = action.payload;
      state.metrics.delete(agentId);
      state.performanceData.delete(agentId);
      state.positionData.delete(agentId);
      if (state.selectedAgentId === agentId) {
        state.selectedAgentId = null;
      }
    },
    clearAllData: (state) => {
      state.metrics.clear();
      state.performanceData.clear();
      state.positionData.clear();
      state.selectedAgentId = null;
    },

    // Reset dashboard
    resetDashboard: () => {
      return initialDashboardState;
    }
  },
  extraReducers: (builder) => {
    // Fetch agent metrics
    builder
      .addCase(fetchAgentMetrics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAgentMetrics.fulfilled, (state, action) => {
        state.loading = false;
        const metrics = action.payload;
        state.metrics.set(metrics.agentId, metrics);
        state.lastUpdate = Date.now();
      })
      .addCase(fetchAgentMetrics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch performance data
    builder
      .addCase(fetchPerformanceData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPerformanceData.fulfilled, (state, action) => {
        state.loading = false;
        const data = action.payload;
        state.performanceData.set(data.agentId, data);
        state.lastUpdate = Date.now();
      })
      .addCase(fetchPerformanceData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch position data
    builder
      .addCase(fetchPositionData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPositionData.fulfilled, (state, action) => {
        state.loading = false;
        const data = action.payload;
        state.positionData.set(data.agentId, data);
        state.lastUpdate = Date.now();
      })
      .addCase(fetchPositionData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

// Selectors
export const selectDashboardState = (state: { dashboard: DashboardState }) => state.dashboard;
export const selectSelectedAgentId = (state: { dashboard: DashboardState }) => state.dashboard.selectedAgentId;
export const selectAllAgents = (state: { dashboard: DashboardState }) => Array.from(state.dashboard.metrics.values());
export const selectSelectedAgent = (state: { dashboard: DashboardState }) => {
  const selectedId = state.dashboard.selectedAgentId;
  return selectedId ? state.dashboard.metrics.get(selectedId) : null;
};
export const selectMetrics = (state: { dashboard: DashboardState }) => state.dashboard.metrics;
export const selectPerformanceData = (state: { dashboard: DashboardState }) => state.dashboard.performanceData;
export const selectPositionData = (state: { dashboard: DashboardState }) => state.dashboard.positionData;
export const selectSettings = (state: { dashboard: DashboardState }) => state.dashboard.settings;
export const selectLoading = (state: { dashboard: DashboardState }) => state.dashboard.loading;
export const selectError = (state: { dashboard: DashboardState }) => state.dashboard.error;
export const selectLastUpdate = (state: { dashboard: DashboardState }) => state.dashboard.lastUpdate;

// Memoized selectors for performance
export const selectSelectedAgentMetrics = (state: { dashboard: DashboardState }) => {
  const { selectedAgentId, metrics } = state.dashboard;
  return selectedAgentId ? metrics.get(selectedAgentId) : null;
};

export const selectSelectedAgentPerformanceData = (state: { dashboard: DashboardState }) => {
  const { selectedAgentId, performanceData } = state.dashboard;
  return selectedAgentId ? performanceData.get(selectedAgentId) : null;
};

export const selectSelectedAgentPositionData = (state: { dashboard: DashboardState }) => {
  const { selectedAgentId, positionData } = state.dashboard;
  return selectedAgentId ? positionData.get(selectedAgentId) : null;
};

export const selectAllAgentIds = (state: { dashboard: DashboardState }) => {
  return Array.from(state.dashboard.metrics.keys());
};

export const selectOnlineAgents = (state: { dashboard: DashboardState }) => {
  return Array.from(state.dashboard.metrics.values()).filter(
    metrics => metrics.health.healthStatus !== 'critical'
  );
};

export const selectAgentsByHealthStatus = (state: { dashboard: DashboardState }, status: 'critical' | 'warning' | 'normal' | 'optimal') => {
  return Array.from(state.dashboard.metrics.values()).filter(
    metrics => metrics.health.healthStatus === status
  );
};

export const selectHighCognitiveLoadAgents = (state: { dashboard: DashboardState }, threshold: number = 0.8) => {
  return Array.from(state.dashboard.metrics.entries())
    .filter(([, metrics]) => metrics.cognitiveLoad.current > threshold)
    .map(([agentId, metrics]) => ({ agentId, metrics }));
};

export const selectAverageResponseTime = (state: { dashboard: DashboardState }) => {
  const metrics = Array.from(state.dashboard.metrics.values());
  if (metrics.length === 0) return 0;
  
  const totalResponseTime = metrics.reduce((sum, metric) => sum + metric.performance.responseTime, 0);
  return totalResponseTime / metrics.length;
};

export const selectAverageCognitiveLoad = (state: { dashboard: DashboardState }) => {
  const metrics = Array.from(state.dashboard.metrics.values());
  if (metrics.length === 0) return 0;
  
  const totalLoad = metrics.reduce((sum, metric) => sum + metric.cognitiveLoad.current, 0);
  return totalLoad / metrics.length;
};

export const selectAverageSuccessRate = (state: { dashboard: DashboardState }) => {
  const metrics = Array.from(state.dashboard.metrics.values());
  if (metrics.length === 0) return 0;
  
  const totalSuccessRate = metrics.reduce((sum, metric) => sum + metric.performance.successRate, 0);
  return totalSuccessRate / metrics.length;
};

// Additional selectors for better state management
export const selectAgentMetrics = (agentId: string) => (state: { dashboard: DashboardState }) =>
  state.dashboard.metrics.get(agentId);

export const selectPerformanceDataForAgent = (agentId: string) => (state: { dashboard: DashboardState }) =>
  state.dashboard.performanceData.get(agentId);

export const selectPositionDataForAgent = (agentId: string) => (state: { dashboard: DashboardState }) =>
  state.dashboard.positionData.get(agentId);

export const selectDashboardSettings = (state: { dashboard: DashboardState }) =>
  state.dashboard.settings;

export const selectDashboardLoading = (state: { dashboard: DashboardState }) =>
  state.dashboard.loading;

export const selectDashboardError = (state: { dashboard: DashboardState }) =>
  state.dashboard.error;

export const selectDashboardLastUpdate = (state: { dashboard: DashboardState }) =>
  state.dashboard.lastUpdate;

// Memoized selectors for performance
export const selectSystemMetrics = createSelector(
  [selectAllAgentIds, selectOnlineAgents, selectAverageResponseTime, selectAverageCognitiveLoad, selectAverageSuccessRate],
  (allAgentIds: string[], onlineAgents: AgentRealTimeMetrics[], avgResponseTime: number, avgCognitiveLoad: number, avgSuccessRate: number) => ({
    totalAgents: allAgentIds.length,
    onlineAgents: onlineAgents.length,
    averageResponseTime: avgResponseTime,
    averageCognitiveLoad: avgCognitiveLoad,
    averageSuccessRate: avgSuccessRate,
  })
);

export const selectDashboardMetrics = createSelector(
  [selectDashboardState],
  (dashboard: DashboardState) => ({
    selectedAgentId: dashboard.selectedAgentId,
    totalAgents: dashboard.metrics.size,
    loading: dashboard.loading,
    error: dashboard.error,
    lastUpdate: dashboard.lastUpdate,
  })
);

// Actions
export const {
  selectAgent,
  deselectAgent,
  updateAgentMetrics,
  updatePerformanceData,
  updatePositionData,
  updateSettings,
  setLayout,
  setTheme,
  setRefreshRate,
  setChartType,
  setGaugeStyle,
  setMapStyle,
  toggleAnimations,
  toggleSoundEnabled,
  toggleNotifications,
  setNotificationThreshold,
  setLoading,
  setError,
  clearError,
  clearAgentData,
  clearAllData,
  resetDashboard
} = dashboardSlice.actions;

// Reducer
// Export the state type
export type { DashboardState };

export default dashboardSlice.reducer;