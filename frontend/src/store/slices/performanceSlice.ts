/**
 * Performance Metrics Redux Slice
 * 
 * This slice manages the state for all performance-related data including
 * real-time metrics, trends, system health, resource utilization, benchmarks,
 * reports, custom metrics, and optimization recommendations.
 */

import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type {
  PerformanceState,
  PerformanceMetrics,
  PerformanceTrend,
  SystemHealth,
  ResourceUtilization,
  BenchmarkComparison,
  PerformanceReport,
  CustomMetric,
  MetricData,
  OptimizationRecommendations,
  TimeRange,
  ViewMode,
  AlertEvent,
  AnomalyEvent,
  PerformanceApiResponse,
  MetricsResponse,
  TrendsResponse,
  HealthResponse
} from '../../types/performance';

// Socket.IO integration
import socketService from '../../services/socketService';
import { streamingService } from '../../services/streamingService';
import { validateEvent } from '../../utils/eventValidation';
import { throttle } from '../../utils/throttling';

// Initial state
const initialState: PerformanceState = {
  // Real-time metrics
  currentMetrics: {},
  metricsHistory: {},
  
  // Trend analysis
  trends: {},
  
  // System health
  systemHealth: {},
  
  // Resource utilization
  resourceUtilization: {},
  
  // Benchmarking
  benchmarks: {},
  
  // Reports
  reports: [],
  
  // Custom metrics
  customMetrics: [],
  customMetricData: {},
  
  // Optimization recommendations
  optimizations: {},
  
  // UI state
  selectedAgent: null,
  selectedTimeRange: {
    start: Date.now() - 24 * 60 * 60 * 1000, // Last 24 hours
    end: Date.now(),
    label: 'Last 24 Hours'
  },
  selectedMetrics: ['responseTime', 'cognitiveLoad', 'memoryUsage', 'cpuUsage'],
  viewMode: 'overview',
  loading: false,
  error: null,
  
  // Real-time settings
  realTimeEnabled: true,
  updateInterval: 5000, // 5 seconds
  alertThresholds: {
    responseTime: 1000,
    cognitiveLoad: 0.8,
    memoryUsage: 0.9,
    cpuUsage: 0.8,
    errorRate: 0.05
  }
};

// Async thunks for API calls
export const fetchPerformanceMetrics = createAsyncThunk(
  'performance/fetchMetrics',
  async (params: { agentId: string; timeRange?: TimeRange }): Promise<PerformanceMetrics[]> => {
    const response = await fetch(`/api/performance/metrics/${params.agentId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        timeRange: params.timeRange,
        limit: 1000
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch performance metrics');
    }
    
    const result: MetricsResponse = await response.json();
    return result.data?.metrics || [];
  }
);

export const fetchPerformanceTrends = createAsyncThunk(
  'performance/fetchTrends',
  async (params: { agentId: string; metrics: string[] }): Promise<PerformanceTrend[]> => {
    const response = await fetch(`/api/performance/trends/${params.agentId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        metrics: params.metrics,
        timeRange: {
          start: Date.now() - 7 * 24 * 60 * 60 * 1000, // Last 7 days
          end: Date.now()
        }
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch performance trends');
    }
    
    const result: TrendsResponse = await response.json();
    return result.data?.trends || [];
  }
);

export const fetchSystemHealth = createAsyncThunk(
  'performance/fetchHealth',
  async (agentId: string): Promise<SystemHealth> => {
    const response = await fetch(`/api/performance/health/${agentId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch system health');
    }
    
    const result: HealthResponse = await response.json();
    return result.data!.health;
  }
);

export const fetchResourceUtilization = createAsyncThunk(
  'performance/fetchResources',
  async (agentId: string): Promise<ResourceUtilization> => {
    const response = await fetch(`/api/performance/resources/${agentId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch resource utilization');
    }
    
    return await response.json();
  }
);

export const fetchBenchmarks = createAsyncThunk(
  'performance/fetchBenchmarks',
  async (agentId: string): Promise<BenchmarkComparison> => {
    const response = await fetch(`/api/performance/benchmarks/${agentId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch benchmarks');
    }
    
    return await response.json();
  }
);

export const generatePerformanceReport = createAsyncThunk(
  'performance/generateReport',
  async (params: { agentId: string; period: TimeRange }): Promise<PerformanceReport> => {
    const response = await fetch(`/api/performance/reports/${params.agentId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        period: params.period
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to generate performance report');
    }
    
    return await response.json();
  }
);

export const fetchOptimizationRecommendations = createAsyncThunk(
  'performance/fetchOptimizations',
  async (agentId: string): Promise<OptimizationRecommendations> => {
    const response = await fetch(`/api/performance/optimizations/${agentId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch optimization recommendations');
    }
    
    return await response.json();
  }
);

// Socket.IO integration for real-time performance updates
export const initializePerformanceSocket = createAsyncThunk(
  'performance/initializeSocket',
  async (agentId: string, { dispatch, getState }) => {
    try {
      // Create throttled update function for performance metrics
      const throttledMetricsUpdate = throttle((metrics: PerformanceMetrics) => {
        dispatch(updateMetrics(metrics));
      }, { interval: 1000, leading: true, trailing: false }); // Throttle to max 1 update per second

      // Register performance event handlers
      const eventHandlers = {
        // Performance metrics updates
        'performance:metrics:update': (data: any) => {
          if (validateEvent(data, 'performance:metrics:update')) {
            throttledMetricsUpdate(data.metrics);
          }
        },

        // Performance alerts
        'performance:alert:event': (data: any) => {
          if (validateEvent(data, 'performance:alert:event')) {
            dispatch(addAlert(data.alert));
          }
        },

        // Anomaly detection events
        'performance:anomaly:detect': (data: any) => {
          if (validateEvent(data, 'performance:anomaly:detect')) {
            dispatch(addAnomaly(data.anomaly));
          }
        },

        // System health updates
        'system:status:update': (data: any) => {
          if (validateEvent(data, 'system:status:update')) {
            dispatch(updateSystemHealth({
              agentId: data.agentId,
              health: data.health
            }));
          }
        },

        // Resource utilization updates
        'system:resource:update': (data: any) => {
          if (validateEvent(data, 'system:resource:update')) {
            dispatch(updateResourceUtilization({
              agentId: data.agentId,
              resources: data.resources
            }));
          }
        },

        // Agent connection events affect performance tracking
        'agent:connected': (data: any) => {
          // Initialize performance tracking for newly connected agent
          dispatch(updateSystemHealth({
            agentId: data.agentId,
            health: {
              overall: {
                status: 'healthy',
                score: 100,
                issues: 0,
                criticalIssues: 0,
                recommendations: []
              },
              components: [{
                id: 'connection',
                name: 'Connection Status',
                status: 'healthy',
                metrics: {
                  responseTime: 0,
                  throughput: 0,
                  errorRate: 0,
                  resourceUsage: 0,
                  availability: 100
                },
                lastCheck: Date.now(),
                uptime: 0,
                errorCount: 0
              }],
              alerts: [],
              diagnostics: [],
              lastUpdated: Date.now()
            }
          }));
        },

        'agent:disconnected': (data: any) => {
          // Mark agent as unhealthy in performance tracking
          dispatch(updateSystemHealth({
            agentId: data.agentId,
            health: {
              overall: {
                status: 'offline',
                score: 0,
                issues: 1,
                criticalIssues: 1,
                recommendations: ['Check agent connection']
              },
              components: [{
                id: 'connection',
                name: 'Connection Status',
                status: 'offline',
                metrics: {
                  responseTime: 0,
                  throughput: 0,
                  errorRate: 1.0,
                  resourceUsage: 0,
                  availability: 0
                },
                lastCheck: Date.now(),
                uptime: 0,
                errorCount: 1
              }],
              alerts: [{
                id: `disconnect_${Date.now()}`,
                type: 'system',
                severity: 'critical',
                title: 'Agent Disconnected',
                message: `Agent ${data.agentId} has disconnected`,
                timestamp: Date.now(),
                acknowledged: false,
                resolved: false,
                metadata: { agentId: data.agentId }
              }],
              diagnostics: [{
                id: 'disconnect_check',
                component: 'Connection',
                test: 'Connectivity Test',
                status: 'fail',
                message: `Agent ${data.agentId} disconnected unexpectedly`,
                timestamp: Date.now()
              }],
              lastUpdated: Date.now()
            }
          }));
        }
      };

      // Register event handlers with streaming service
      // Note: cognitive streams are already created in App.tsx, no need to recreate them
      
      // Subscribe to performance stream
    const performanceStream = streamingService.getStream('performance');
    if (!performanceStream) {
      console.warn('[PERFORMANCE_SLICE] Performance stream not found, skipping subscription');
      return { agentId, success: false, error: 'Performance stream not available' };
    }
    
    if (!performanceStream.isActive) {
      console.warn('[PERFORMANCE_SLICE] Performance stream is not active');
      return { agentId, success: false, error: 'Performance stream is inactive' };
    }
    
    streamingService.subscribe('performance', (data: any) => {
      if (data && data.length > 0) {
        const latestData = data[data.length - 1] as PerformanceMetrics;
        dispatch(updateMetrics(latestData));
      }
    });

      console.log(`[PERFORMANCE_SLICE] Socket.IO initialized for agent ${agentId}`);
      
      return { agentId, success: true };
    } catch (error) {
      console.error('[PERFORMANCE_SLICE] Failed to initialize Socket.IO:', error);
      dispatch(setError(`Failed to initialize real-time performance updates: ${error}`));
      throw error;
    }
  }
);

// Cleanup Socket.IO connections
export const cleanupPerformanceSocket = createAsyncThunk(
  'performance/cleanupSocket',
  async (agentId: string, { dispatch }) => {
    try {
      // Cleanup performance stream
      streamingService.deleteStream('performance');
      
      console.log(`[PERFORMANCE_SLICE] Socket.IO cleaned up for agent ${agentId}`);
      return { agentId, success: true };
    } catch (error) {
      console.error('[PERFORMANCE_SLICE] Failed to cleanup Socket.IO:', error);
      dispatch(setError(`Failed to cleanup real-time performance updates: ${error}`));
      throw error;
    }
  }
);

// Create the slice
const performanceSlice = createSlice({
  name: 'performance',
  initialState,
  reducers: {
    // Real-time metrics updates
    updateMetrics: (state, action: PayloadAction<PerformanceMetrics>) => {
      const metrics = action.payload;
      state.currentMetrics[metrics.agentId] = metrics;
      
      // Update history
      if (!state.metricsHistory[metrics.agentId]) {
        state.metricsHistory[metrics.agentId] = [];
      }
      
      // Add to history and keep only last 1000 entries
      state.metricsHistory[metrics.agentId].push(metrics);
      if (state.metricsHistory[metrics.agentId].length > 1000) {
        state.metricsHistory[metrics.agentId] = state.metricsHistory[metrics.agentId].slice(-1000);
      }
      
      // Check for alerts based on thresholds
      checkAlertThresholds(state, metrics);
    },
    
    // Trend updates
    updateTrend: (state, action: PayloadAction<PerformanceTrend>) => {
      const trend = action.payload;
      state.trends[`${trend.metric}_${trend.historicalData[0]?.timestamp || Date.now()}`] = trend;
    },
    
    // System health updates
    updateSystemHealth: (state, action: PayloadAction<{ agentId: string; health: SystemHealth }>) => {
      const { agentId, health } = action.payload;
      state.systemHealth[agentId] = health;
    },
    
    // Resource utilization updates
    updateResourceUtilization: (state, action: PayloadAction<{ agentId: string; resources: ResourceUtilization }>) => {
      const { agentId, resources } = action.payload;
      state.resourceUtilization[agentId] = resources;
    },
    
    // Alert handling
    addAlert: (state, action: PayloadAction<AlertEvent>) => {
      const alert = action.payload;
      
      // Update system health if needed
      if (alert.metadata?.agentId && state.systemHealth[alert.metadata.agentId]) {
        state.systemHealth[alert.metadata.agentId].alerts.push(alert);
      }
    },
    
    acknowledgeAlert: (state, action: PayloadAction<{ agentId: string; alertId: string }>) => {
      const { agentId, alertId } = action.payload;
      const health = state.systemHealth[agentId];
      if (health) {
        const alert = health.alerts.find(a => a.id === alertId);
        if (alert) {
          alert.acknowledged = true;
        }
      }
    },
    
    resolveAlert: (state, action: PayloadAction<{ agentId: string; alertId: string }>) => {
      const { agentId, alertId } = action.payload;
      const health = state.systemHealth[agentId];
      if (health) {
        const alert = health.alerts.find(a => a.id === alertId);
        if (alert) {
          alert.resolved = true;
        }
      }
    },
    
    // Anomaly handling
    addAnomaly: (state, action: PayloadAction<AnomalyEvent>) => {
      const anomaly = action.payload;
      
      // Update trend if exists
      const trendKey = `${anomaly.metric}_${anomaly.timestamp}`;
      if (state.trends[trendKey]) {
        state.trends[trendKey].anomalies.push(anomaly);
      }
    },
    
    resolveAnomaly: (state, action: PayloadAction<{ metric: string; anomalyId: string }>) => {
      const { metric, anomalyId } = action.payload;
      
      // Find and update anomaly in relevant trends
      Object.values(state.trends).forEach(trend => {
        if (trend.metric === metric) {
          const anomaly = trend.anomalies.find(a => a.id === anomalyId);
          if (anomaly) {
            anomaly.resolved = true;
            anomaly.resolvedAt = Date.now();
          }
        }
      });
    },
    
    // Custom metrics management
    addCustomMetric: (state, action: PayloadAction<CustomMetric>) => {
      state.customMetrics.push(action.payload);
    },
    
    updateCustomMetric: (state, action: PayloadAction<CustomMetric>) => {
      const index = state.customMetrics.findIndex(m => m.id === action.payload.id);
      if (index !== -1) {
        state.customMetrics[index] = action.payload;
      }
    },
    
    deleteCustomMetric: (state, action: PayloadAction<string>) => {
      state.customMetrics = state.customMetrics.filter(m => m.id !== action.payload);
      delete state.customMetricData[action.payload];
    },
    
    updateCustomMetricData: (state, action: PayloadAction<{ metricId: string; data: MetricData[] }>) => {
      const { metricId, data } = action.payload;
      
      if (!state.customMetricData[metricId]) {
        state.customMetricData[metricId] = [];
      }
      
      state.customMetricData[metricId].push(...data);
      
      // Keep only last 1000 entries
      if (state.customMetricData[metricId].length > 1000) {
        state.customMetricData[metricId] = state.customMetricData[metricId].slice(-1000);
      }
    },
    
    // UI state management
    setSelectedAgent: (state, action: PayloadAction<string | null>) => {
      state.selectedAgent = action.payload;
    },
    
    setSelectedTimeRange: (state, action: PayloadAction<TimeRange>) => {
      state.selectedTimeRange = action.payload;
    },
    
    setSelectedMetrics: (state, action: PayloadAction<string[]>) => {
      state.selectedMetrics = action.payload;
    },
    
    setViewMode: (state, action: PayloadAction<ViewMode>) => {
      state.viewMode = action.payload;
    },
    
    toggleRealTime: (state) => {
      state.realTimeEnabled = !state.realTimeEnabled;
    },
    
    setUpdateInterval: (state, action: PayloadAction<number>) => {
      state.updateInterval = action.payload;
    },
    
    setAlertThresholds: (state, action: PayloadAction<Partial<Record<string, number>>>) => {
      const payload = action.payload;
      Object.keys(payload).forEach(key => {
        const value = payload[key];
        if (value !== undefined) {
          state.alertThresholds[key] = value;
        }
      });
    },
    
    // Data management
    clearMetricsHistory: (state, action: PayloadAction<string>) => {
      const agentId = action.payload;
      delete state.metricsHistory[agentId];
    },
    
    clearAllData: (state) => {
      state.currentMetrics = {};
      state.metricsHistory = {};
      state.trends = {};
      state.systemHealth = {};
      state.resourceUtilization = {};
      state.benchmarks = {};
      state.optimizations = {};
      state.customMetricData = {};
    },
    
    // Error handling
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // Fetch metrics
    builder
      .addCase(fetchPerformanceMetrics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPerformanceMetrics.fulfilled, (state, action) => {
        state.loading = false;
        const agentId = action.meta.arg.agentId;
        
        // Update current metrics with latest
        if (action.payload.length > 0) {
          state.currentMetrics[agentId] = action.payload[action.payload.length - 1];
          state.metricsHistory[agentId] = action.payload;
        }
      })
      .addCase(fetchPerformanceMetrics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch metrics';
      });
    
    // Fetch trends
    builder
      .addCase(fetchPerformanceTrends.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPerformanceTrends.fulfilled, (state, action) => {
        state.loading = false;
        const agentId = action.meta.arg.agentId;
        
        // Update trends
        action.payload.forEach(trend => {
          state.trends[`${agentId}_${trend.metric}`] = trend;
        });
      })
      .addCase(fetchPerformanceTrends.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch trends';
      });
    
    // Fetch system health
    builder
      .addCase(fetchSystemHealth.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSystemHealth.fulfilled, (state, action) => {
        state.loading = false;
        state.systemHealth[action.meta.arg] = action.payload;
      })
      .addCase(fetchSystemHealth.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch system health';
      });
    
    // Fetch resource utilization
    builder
      .addCase(fetchResourceUtilization.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchResourceUtilization.fulfilled, (state, action) => {
        state.loading = false;
        state.resourceUtilization[action.meta.arg] = action.payload;
      })
      .addCase(fetchResourceUtilization.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch resource utilization';
      });
    
    // Fetch benchmarks
    builder
      .addCase(fetchBenchmarks.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchBenchmarks.fulfilled, (state, action) => {
        state.loading = false;
        state.benchmarks[action.meta.arg] = action.payload;
      })
      .addCase(fetchBenchmarks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch benchmarks';
      });
    
    // Generate report
    builder
      .addCase(generatePerformanceReport.pending, (state) => {
        state.loading = true;
      })
      .addCase(generatePerformanceReport.fulfilled, (state, action) => {
        state.loading = false;
        state.reports.push(action.payload);
      })
      .addCase(generatePerformanceReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to generate report';
      });
    
    // Fetch optimizations
    builder
      .addCase(fetchOptimizationRecommendations.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchOptimizationRecommendations.fulfilled, (state, action) => {
        state.loading = false;
        state.optimizations[action.meta.arg] = action.payload;
      })
      .addCase(fetchOptimizationRecommendations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch optimization recommendations';
      });
  }
});

// Helper function to check alert thresholds
const checkAlertThresholds = (state: PerformanceState, metrics: PerformanceMetrics) => {
  const alerts: AlertEvent[] = [];
  
  // Check response time
  if (metrics.responseTime > state.alertThresholds.responseTime) {
    alerts.push({
      id: `alert_${Date.now()}_responseTime`,
      type: 'performance',
      severity: metrics.responseTime > state.alertThresholds.responseTime * 2 ? 'critical' : 'warning',
      title: 'High Response Time',
      message: `Response time (${metrics.responseTime}ms) exceeds threshold (${state.alertThresholds.responseTime}ms)`,
      timestamp: Date.now(),
      acknowledged: false,
      resolved: false,
      metadata: { agentId: metrics.agentId, metric: 'responseTime', value: metrics.responseTime }
    });
  }
  
  // Check cognitive load
  if (metrics.cognitiveLoad > state.alertThresholds.cognitiveLoad) {
    alerts.push({
      id: `alert_${Date.now()}_cognitiveLoad`,
      type: 'performance',
      severity: metrics.cognitiveLoad > 0.95 ? 'critical' : 'warning',
      title: 'High Cognitive Load',
      message: `Cognitive load (${(metrics.cognitiveLoad * 100).toFixed(1)}%) exceeds threshold (${(state.alertThresholds.cognitiveLoad * 100).toFixed(1)}%)`,
      timestamp: Date.now(),
      acknowledged: false,
      resolved: false,
      metadata: { agentId: metrics.agentId, metric: 'cognitiveLoad', value: metrics.cognitiveLoad }
    });
  }
  
  // Check memory usage
  if (metrics.memoryUsage > state.alertThresholds.memoryUsage) {
    alerts.push({
      id: `alert_${Date.now()}_memoryUsage`,
      type: 'system',
      severity: metrics.memoryUsage > 0.95 ? 'critical' : 'warning',
      title: 'High Memory Usage',
      message: `Memory usage (${(metrics.memoryUsage * 100).toFixed(1)}%) exceeds threshold (${(state.alertThresholds.memoryUsage * 100).toFixed(1)}%)`,
      timestamp: Date.now(),
      acknowledged: false,
      resolved: false,
      metadata: { agentId: metrics.agentId, metric: 'memoryUsage', value: metrics.memoryUsage }
    });
  }
  
  // Check CPU usage
  if (metrics.cpuUsage > state.alertThresholds.cpuUsage) {
    alerts.push({
      id: `alert_${Date.now()}_cpuUsage`,
      type: 'system',
      severity: metrics.cpuUsage > 0.95 ? 'critical' : 'warning',
      title: 'High CPU Usage',
      message: `CPU usage (${(metrics.cpuUsage * 100).toFixed(1)}%) exceeds threshold (${(state.alertThresholds.cpuUsage * 100).toFixed(1)}%)`,
      timestamp: Date.now(),
      acknowledged: false,
      resolved: false,
      metadata: { agentId: metrics.agentId, metric: 'cpuUsage', value: metrics.cpuUsage }
    });
  }
  
  // Check error rate
  if (metrics.errorRate > state.alertThresholds.errorRate) {
    alerts.push({
      id: `alert_${Date.now()}_errorRate`,
      type: 'system',
      severity: metrics.errorRate > 0.1 ? 'critical' : 'warning',
      title: 'High Error Rate',
      message: `Error rate (${(metrics.errorRate * 100).toFixed(2)}%) exceeds threshold (${(state.alertThresholds.errorRate * 100).toFixed(2)}%)`,
      timestamp: Date.now(),
      acknowledged: false,
      resolved: false,
      metadata: { agentId: metrics.agentId, metric: 'errorRate', value: metrics.errorRate }
    });
  }
  
  // Add alerts to system health
  if (alerts.length > 0 && state.systemHealth[metrics.agentId]) {
    state.systemHealth[metrics.agentId].alerts.push(...alerts);
  }
};

// Export actions
export const {
  updateMetrics,
  updateTrend,
  updateSystemHealth,
  updateResourceUtilization,
  addAlert,
  acknowledgeAlert,
  resolveAlert,
  addAnomaly,
  resolveAnomaly,
  addCustomMetric,
  updateCustomMetric,
  deleteCustomMetric,
  updateCustomMetricData,
  setSelectedAgent,
  setSelectedTimeRange,
  setSelectedMetrics,
  setViewMode,
  toggleRealTime,
  setUpdateInterval,
  setAlertThresholds,
  clearMetricsHistory,
  clearAllData,
  setError,
  clearError
} = performanceSlice.actions;

// Selectors
export const selectPerformanceMetrics = (state: { performance: PerformanceState }) => state.performance.currentMetrics;
export const selectMetricsHistory = (state: { performance: PerformanceState }) => state.performance.metricsHistory;
export const selectPerformanceTrends = (state: { performance: PerformanceState }) => state.performance.trends;
export const selectSystemHealth = (state: { performance: PerformanceState }) => state.performance.systemHealth;
export const selectResourceUtilization = (state: { performance: PerformanceState }) => state.performance.resourceUtilization;
export const selectBenchmarks = (state: { performance: PerformanceState }) => state.performance.benchmarks;
export const selectReports = (state: { performance: PerformanceState }) => state.performance.reports;
export const selectCustomMetrics = (state: { performance: PerformanceState }) => state.performance.customMetrics;
export const selectCustomMetricData = (state: { performance: PerformanceState }) => state.performance.customMetricData;
export const selectOptimizations = (state: { performance: PerformanceState }) => state.performance.optimizations;
export const selectSelectedAgent = (state: { performance: PerformanceState }) => state.performance.selectedAgent;
export const selectSelectedTimeRange = (state: { performance: PerformanceState }) => state.performance.selectedTimeRange;
export const selectSelectedMetrics = (state: { performance: PerformanceState }) => state.performance.selectedMetrics;
export const selectViewMode = (state: { performance: PerformanceState }) => state.performance.viewMode;
export const selectRealTimeEnabled = (state: { performance: PerformanceState }) => state.performance.realTimeEnabled;
export const selectUpdateInterval = (state: { performance: PerformanceState }) => state.performance.updateInterval;
export const selectAlertThresholds = (state: { performance: PerformanceState }) => state.performance.alertThresholds;
export const selectPerformanceLoading = (state: { performance: PerformanceState }) => state.performance.loading;
export const selectPerformanceError = (state: { performance: PerformanceState }) => state.performance.error;

// Composite selectors
export const selectCurrentAgentMetrics = (state: { performance: PerformanceState }) => {
  const selectedAgent = state.performance.selectedAgent;
  return selectedAgent ? state.performance.currentMetrics[selectedAgent] : null;
};

export const selectCurrentAgentHistory = (state: { performance: PerformanceState }) => {
  const selectedAgent = state.performance.selectedAgent;
  return selectedAgent ? state.performance.metricsHistory[selectedAgent] : [];
};

export const selectCurrentAgentHealth = (state: { performance: PerformanceState }) => {
  const selectedAgent = state.performance.selectedAgent;
  return selectedAgent ? state.performance.systemHealth[selectedAgent] : null;
};

export const selectCurrentAgentResources = (state: { performance: PerformanceState }) => {
  const selectedAgent = state.performance.selectedAgent;
  return selectedAgent ? state.performance.resourceUtilization[selectedAgent] : null;
};

export const selectActiveAlerts = (state: { performance: PerformanceState }) => {
  const selectedAgent = state.performance.selectedAgent;
  if (!selectedAgent) return [];
  
  const health = state.performance.systemHealth[selectedAgent];
  return health ? health.alerts.filter(alert => !alert.resolved) : [];
};

// Export reducer
export default performanceSlice.reducer;