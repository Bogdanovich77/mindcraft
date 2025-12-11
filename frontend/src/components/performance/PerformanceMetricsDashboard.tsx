/**
 * Performance Metrics Dashboard Component
 * 
 * This is the main dashboard component that provides comprehensive performance monitoring
 * with real-time metrics, trend analysis, predictive analytics, anomaly detection,
 * resource utilization monitoring, system health indicators, benchmarking,
 * performance reports, custom metrics, and optimization recommendations.
 */

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  Stack,
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel,
  Badge,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Divider,
  Paper,
  Avatar,
  LinearProgress
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  Timeline as TimelineIcon,
  Assessment as AssessmentIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Speed as SpeedIcon,
  Memory as MemoryIcon,
  Computer as ComputerIcon,
  NetworkCheck as NetworkIcon,
  Analytics as AnalyticsIcon,
  Report as ReportIcon,
  Add as AddIcon,
  Download as DownloadIcon,
  Fullscreen as FullscreenIcon,
  Notifications as NotificationsIcon,
  NotificationsActive as NotificationsActiveIcon
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';

// Import performance selectors and actions
import {
  selectPerformanceMetrics,
  selectMetricsHistory,
  selectPerformanceTrends,
  selectSystemHealth,
  selectResourceUtilization,
  selectBenchmarks,
  selectReports,
  selectCustomMetrics,
  selectOptimizations,
  selectSelectedAgent,
  selectSelectedTimeRange,
  selectSelectedMetrics,
  selectViewMode,
  selectRealTimeEnabled,
  selectUpdateInterval,
  selectAlertThresholds,
  selectPerformanceLoading,
  selectPerformanceError,
  selectActiveAlerts,
  selectCurrentAgentMetrics,
  selectCurrentAgentHistory,
  selectCurrentAgentHealth,
  selectCurrentAgentResources,
  fetchPerformanceMetrics,
  fetchPerformanceTrends,
  fetchSystemHealth,
  fetchResourceUtilization,
  fetchBenchmarks,
  generatePerformanceReport,
  fetchOptimizationRecommendations,
  setSelectedAgent,
  setSelectedTimeRange,
  setSelectedMetrics,
  setViewMode,
  toggleRealTime,
  setUpdateInterval,
  setAlertThresholds,
  clearError
} from '../../store';

// Import types
import type {
  PerformanceMetrics,
  SystemHealth as SystemHealthType,
  ResourceUtilization as ResourceUtilizationType,
  TimeRange,
  ViewMode,
  AlertEvent,
  PerformanceTrend,
  BenchmarkComparison,
  OptimizationRecommendations as OptimizationRecommendationsType
} from '../../types/performance';

// Import sub-components (these will be created in subsequent tasks)
// Comment out for now until components are created
// import RealTimeMonitoring from './RealTimeMonitoring';
// import TrendAnalysis from './TrendAnalysis';
// import PredictiveAnalytics from './PredictiveAnalytics';
// import AnomalyDetection from './AnomalyDetection';
// import ResourceUtilizationComponent from './ResourceUtilization';
// import SystemHealthComponent from './SystemHealth';
// import Benchmarking from './Benchmarking';
// import PerformanceReports from './PerformanceReports';
// import CustomMetrics from './CustomMetrics';
// import OptimizationRecommendationsComponent from './OptimizationRecommendations';

// Temporary placeholder components
const RealTimeMonitoring: React.FC<{ agentId?: string }> = ({ agentId }) => (
  <Box>Real-time monitoring component for {agentId}</Box>
);
const TrendAnalysis: React.FC<{ agentId?: string }> = ({ agentId }) => (
  <Box>Trend analysis component for {agentId}</Box>
);
const PredictiveAnalytics: React.FC<{ agentId?: string }> = ({ agentId }) => (
  <Box>Predictive analytics component for {agentId}</Box>
);
const AnomalyDetection: React.FC<{ agentId?: string }> = ({ agentId }) => (
  <Box>Anomaly detection component for {agentId}</Box>
);
const ResourceUtilizationComponent: React.FC<{ agentId?: string }> = ({ agentId }) => (
  <Box>Resource utilization component for {agentId}</Box>
);
const SystemHealthComponent: React.FC<{ agentId?: string }> = ({ agentId }) => (
  <Box>System health component for {agentId}</Box>
);
const Benchmarking: React.FC<{ agentId?: string }> = ({ agentId }) => (
  <Box>Benchmarking component for {agentId}</Box>
);
const PerformanceReports: React.FC<{ agentId?: string }> = ({ agentId }) => (
  <Box>Performance reports component for {agentId}</Box>
);
const CustomMetrics: React.FC<{ agentId?: string }> = ({ agentId }) => (
  <Box>Custom metrics component for {agentId}</Box>
);
const OptimizationRecommendationsComponent: React.FC<{ agentId?: string }> = ({ agentId }) => (
  <Box>Optimization recommendations component for {agentId}</Box>
);

interface PerformanceMetricsDashboardProps {
  agentId?: string;
  initialViewMode?: ViewMode;
  height?: string | number;
  showControls?: boolean;
  showTabs?: boolean;
}

const PerformanceMetricsDashboard: React.FC<PerformanceMetricsDashboardProps> = ({
  agentId,
  initialViewMode = 'overview',
  height = '100%',
  showControls = true,
  showTabs = true
}) => {
  const dispatch = useDispatch();
  
  // Redux state
  const currentMetrics = useSelector(selectCurrentAgentMetrics);
  const metricsHistory = useSelector(selectCurrentAgentHistory);
  const trends = useSelector(selectPerformanceTrends);
  const systemHealth = useSelector(selectCurrentAgentHealth);
  const resourceUtilization = useSelector(selectCurrentAgentResources);
  const benchmarks = useSelector(selectBenchmarks);
  const reports = useSelector(selectReports);
  const customMetrics = useSelector(selectCustomMetrics);
  const optimizations = useSelector(selectOptimizations);
  const selectedAgent = useSelector(selectSelectedAgent);
  const selectedTimeRange = useSelector(selectSelectedTimeRange);
  const selectedMetrics = useSelector(selectSelectedMetrics);
  const viewMode = useSelector(selectViewMode);
  const realTimeEnabled = useSelector(selectRealTimeEnabled);
  const updateInterval = useSelector(selectUpdateInterval);
  const alertThresholds = useSelector(selectAlertThresholds);
  const loading = useSelector(selectPerformanceLoading);
  const error = useSelector(selectPerformanceError);
  const activeAlerts = useSelector(selectActiveAlerts);

  // Local state
  const [activeTab, setActiveTab] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(updateInterval);
  const [localTimeRange, setLocalTimeRange] = useState<TimeRange>(selectedTimeRange);
  const [localSelectedMetrics, setLocalSelectedMetrics] = useState<string[]>(selectedMetrics);

  // Time range options
  const timeRangeOptions: TimeRange[] = [
    { start: Date.now() - 60 * 60 * 1000, end: Date.now(), label: 'Last Hour' },
    { start: Date.now() - 6 * 60 * 60 * 1000, end: Date.now(), label: 'Last 6 Hours' },
    { start: Date.now() - 24 * 60 * 60 * 1000, end: Date.now(), label: 'Last 24 Hours' },
    { start: Date.now() - 7 * 24 * 60 * 60 * 1000, end: Date.now(), label: 'Last 7 Days' },
    { start: Date.now() - 30 * 24 * 60 * 60 * 1000, end: Date.now(), label: 'Last 30 Days' }
  ];

  // Available metrics
  const availableMetrics = [
    { id: 'responseTime', label: 'Response Time', unit: 'ms', icon: SpeedIcon },
    { id: 'cognitiveLoad', label: 'Cognitive Load', unit: '%', icon: AnalyticsIcon },
    { id: 'memoryUsage', label: 'Memory Usage', unit: '%', icon: MemoryIcon },
    { id: 'cpuUsage', label: 'CPU Usage', unit: '%', icon: ComputerIcon },
    { id: 'networkLatency', label: 'Network Latency', unit: 'ms', icon: NetworkIcon },
    { id: 'errorRate', label: 'Error Rate', unit: '%', icon: ErrorIcon },
    { id: 'throughput', label: 'Throughput', unit: 'ops/s', icon: TrendingUpIcon },
    { id: 'taskCompletionRate', label: 'Task Completion Rate', unit: '%', icon: CheckCircleIcon }
  ];

  // Initialize agent selection
  useEffect(() => {
    if (agentId && agentId !== selectedAgent) {
      dispatch(setSelectedAgent(agentId));
    }
  }, [agentId, selectedAgent, dispatch]);

  // Initialize view mode
  useEffect(() => {
    if (initialViewMode !== viewMode) {
      dispatch(setViewMode(initialViewMode));
    }
  }, [initialViewMode, viewMode, dispatch]);

  // Fetch initial data
  useEffect(() => {
    if (selectedAgent) {
      dispatch(fetchPerformanceMetrics({ agentId: selectedAgent, timeRange: selectedTimeRange }) as any);
      dispatch(fetchPerformanceTrends({ agentId: selectedAgent, metrics: selectedMetrics }) as any);
      dispatch(fetchSystemHealth(selectedAgent) as any);
      dispatch(fetchResourceUtilization(selectedAgent) as any);
      dispatch(fetchBenchmarks(selectedAgent) as any);
      dispatch(fetchOptimizationRecommendations(selectedAgent) as any);
    }
  }, [selectedAgent, selectedTimeRange, selectedMetrics, dispatch]);

  // Real-time updates
  useEffect(() => {
    if (!realTimeEnabled || !selectedAgent) return;

    const interval = setInterval(() => {
      dispatch(fetchPerformanceMetrics({ agentId: selectedAgent, timeRange: selectedTimeRange }) as any);
      dispatch(fetchSystemHealth(selectedAgent) as any);
      dispatch(fetchResourceUtilization(selectedAgent) as any);
    }, updateInterval);

    return () => clearInterval(interval);
  }, [realTimeEnabled, selectedAgent, updateInterval, selectedTimeRange, dispatch]);

  // Handle tab change
  const handleTabChange = useCallback((event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  }, []);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    if (selectedAgent) {
      dispatch(fetchPerformanceMetrics({ agentId: selectedAgent, timeRange: selectedTimeRange }) as any);
      dispatch(fetchPerformanceTrends({ agentId: selectedAgent, metrics: selectedMetrics }) as any);
      dispatch(fetchSystemHealth(selectedAgent) as any);
      dispatch(fetchResourceUtilization(selectedAgent) as any);
      dispatch(fetchBenchmarks(selectedAgent) as any);
      dispatch(fetchOptimizationRecommendations(selectedAgent) as any);
    }
  }, [selectedAgent, selectedTimeRange, selectedMetrics, dispatch]);

  // Handle time range change
  const handleTimeRangeChange = useCallback((timeRange: TimeRange) => {
    setLocalTimeRange(timeRange);
    dispatch(setSelectedTimeRange(timeRange));
  }, [dispatch]);

  // Handle metrics selection change
  const handleMetricsChange = useCallback((metrics: string[]) => {
    setLocalSelectedMetrics(metrics);
    dispatch(setSelectedMetrics(metrics));
  }, [dispatch]);

  // Handle real-time toggle
  const handleRealTimeToggle = useCallback(() => {
    dispatch(toggleRealTime());
  }, [dispatch]);

  // Handle update interval change
  const handleUpdateIntervalChange = useCallback((interval: number) => {
    setRefreshInterval(interval);
    dispatch(setUpdateInterval(interval));
  }, [dispatch]);

  // Handle alert threshold change
  const handleAlertThresholdChange = useCallback((thresholds: Partial<Record<string, number>>) => {
    dispatch(setAlertThresholds(thresholds));
  }, [dispatch]);

  // Handle generate report
  const handleGenerateReport = useCallback(() => {
    if (selectedAgent) {
      dispatch(generatePerformanceReport({ agentId: selectedAgent, period: selectedTimeRange }) as any);
    }
  }, [selectedAgent, selectedTimeRange, dispatch]);

  // Calculate overall health status
  const overallHealth = useMemo(() => {
    if (!systemHealth) return 'unknown';
    
    const criticalAlerts = activeAlerts.filter(alert => alert.severity === 'critical').length;
    const warningAlerts = activeAlerts.filter(alert => alert.severity === 'warning').length;
    
    if (criticalAlerts > 0) return 'critical';
    if (warningAlerts > 2) return 'warning';
    if (warningAlerts > 0) return 'warning';
    return 'healthy';
  }, [systemHealth, activeAlerts]);

  // Get health status color and icon
  const getHealthStatusProps = (status: string) => {
    switch (status) {
      case 'healthy':
        return { color: 'success' as const, icon: CheckCircleIcon };
      case 'warning':
        return { color: 'warning' as const, icon: WarningIcon };
      case 'critical':
        return { color: 'error' as const, icon: ErrorIcon };
      default:
        return { color: 'info' as const, icon: InfoIcon };
    }
  };

  const healthStatusProps = getHealthStatusProps(overallHealth);
  const HealthIcon = healthStatusProps.icon;

  // Tab panels
  const tabPanels = [
    { label: 'Overview', component: RealTimeMonitoring },
    { label: 'Trends', component: TrendAnalysis },
    { label: 'Predictive Analytics', component: PredictiveAnalytics },
    { label: 'Anomaly Detection', component: AnomalyDetection },
    { label: 'Resources', component: ResourceUtilizationComponent },
    { label: 'System Health', component: SystemHealth },
    { label: 'Benchmarking', component: Benchmarking },
    { label: 'Reports', component: PerformanceReports },
    { label: 'Custom Metrics', component: CustomMetrics },
    { label: 'Optimizations', component: OptimizationRecommendations }
  ];

  // Render loading state
  if (loading && !currentMetrics) {
    return (
      <Box sx={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Stack spacing={2} alignItems="center">
          <LinearProgress sx={{ width: 300 }} />
          <Typography variant="body2" color="text.secondary">
            Loading performance metrics...
          </Typography>
        </Stack>
      </Box>
    );
  }

  // Render error state
  if (error) {
    return (
      <Box sx={{ height, p: 3 }}>
        <Alert 
          severity="error" 
          action={
            <Button color="inherit" size="small" onClick={() => dispatch(clearError())}>
              Dismiss
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  // Render main dashboard
  return (
    <Box sx={{ height, display: 'flex', flexDirection: 'column' }}>
      {/* Header Controls */}
      {showControls && (
        <Paper sx={{ p: 2, mb: 2, borderRadius: 2 }}>
          <Grid container spacing={2} alignItems="center">
            {/* Agent Selection and Status */}
            <Grid item xs={12} md={3}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ bgcolor: healthStatusProps.color }}>
                  <HealthIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    {selectedAgent || 'No Agent Selected'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Status: {overallHealth}
                  </Typography>
                </Box>
                {activeAlerts.length > 0 && (
                  <Badge badgeContent={activeAlerts.length} color="error">
                    <NotificationsIcon color="action" />
                  </Badge>
                )}
              </Stack>
            </Grid>

            {/* Time Range Selection */}
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Time Range</InputLabel>
                <Select
                  value={localTimeRange.label}
                  label="Time Range"
                  onChange={(e) => {
                    const range = timeRangeOptions.find(r => r.label === e.target.value);
                    if (range) handleTimeRangeChange(range);
                  }}
                >
                  {timeRangeOptions.map((range) => (
                    <MenuItem key={range.label} value={range.label}>
                      {range.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Metrics Selection */}
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Metrics</InputLabel>
                <Select
                  multiple
                  value={localSelectedMetrics}
                  label="Metrics"
                  onChange={(e) => handleMetricsChange(e.target.value as string[])}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} size="small" label={value} />
                      ))}
                    </Box>
                  )}
                >
                  {availableMetrics.map((metric) => (
                    <MenuItem key={metric.id} value={metric.id}>
                      {metric.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Action Buttons */}
            <Grid item xs={12} md={3}>
              <Stack direction="row" spacing={1}>
                <Tooltip title="Refresh Data">
                  <IconButton onClick={handleRefresh} disabled={loading}>
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Real-time Updates">
                  <IconButton onClick={handleRealTimeToggle} color={realTimeEnabled ? 'primary' : 'default'}>
                    {realTimeEnabled ? <NotificationsActiveIcon /> : <NotificationsIcon />}
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Settings">
                  <IconButton onClick={() => setSettingsOpen(true)}>
                    <SettingsIcon />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Fullscreen">
                  <IconButton onClick={() => setFullscreen(!fullscreen)}>
                    <FullscreenIcon />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Generate Report">
                  <IconButton onClick={handleGenerateReport} disabled={loading}>
                    <ReportIcon />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Main Content */}
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        {showTabs ? (
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              {tabPanels.map((panel, index) => (
                <Tab key={index} label={panel.label} icon={<TimelineIcon />} iconPosition="start" />
              ))}
            </Tabs>
            
            <Box sx={{ flex: 1, overflow: 'auto' }}>
              {tabPanels.map((panel, index) => {
                const Component = panel.component;
                return (
                  <Box
                    key={index}
                    role="tabpanel"
                    hidden={activeTab !== index}
                    sx={{ height: '100%', p: 2 }}
                  >
                    {activeTab === index && (
                      <Component agentId={selectedAgent} />
                    )}
                  </Box>
                );
              })}
            </Box>
          </Box>
        ) : (
          // Default to overview view without tabs
          <Box sx={{ height: '100%', p: 2 }}>
            <RealTimeMonitoring agentId={selectedAgent} />
          </Box>
        )}
      </Box>

      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Performance Dashboard Settings</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            {/* Real-time Settings */}
            <Box>
              <Typography variant="subtitle1" gutterBottom>Real-time Updates</Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={realTimeEnabled}
                    onChange={handleRealTimeToggle}
                  />
                }
                label="Enable real-time updates"
              />
              
              <TextField
                fullWidth
                label="Update Interval (ms)"
                type="number"
                value={refreshInterval}
                onChange={(e) => handleUpdateIntervalChange(Number(e.target.value))}
                disabled={!realTimeEnabled}
                sx={{ mt: 2 }}
              />
            </Box>

            {/* Alert Thresholds */}
            <Box>
              <Typography variant="subtitle1" gutterBottom>Alert Thresholds</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Response Time (ms)"
                    type="number"
                    value={alertThresholds.responseTime}
                    onChange={(e) => handleAlertThresholdChange({ responseTime: Number(e.target.value) })}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Cognitive Load (%)"
                    type="number"
                    inputProps={{ min: 0, max: 100 }}
                    value={alertThresholds.cognitiveLoad * 100}
                    onChange={(e) => handleAlertThresholdChange({ cognitiveLoad: Number(e.target.value) / 100 })}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Memory Usage (%)"
                    type="number"
                    inputProps={{ min: 0, max: 100 }}
                    value={alertThresholds.memoryUsage * 100}
                    onChange={(e) => handleAlertThresholdChange({ memoryUsage: Number(e.target.value) / 100 })}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="CPU Usage (%)"
                    type="number"
                    inputProps={{ min: 0, max: 100 }}
                    value={alertThresholds.cpuUsage * 100}
                    onChange={(e) => handleAlertThresholdChange({ cpuUsage: Number(e.target.value) / 100 })}
                  />
                </Grid>
              </Grid>
            </Box>

            {/* Display Settings */}
            <Box>
              <Typography variant="subtitle1" gutterBottom>Display Settings</Typography>
              <FormControl fullWidth>
                <InputLabel>View Mode</InputLabel>
                <Select
                  value={viewMode}
                  label="View Mode"
                  onChange={(e) => dispatch(setViewMode(e.target.value as ViewMode))}
                >
                  <MenuItem value="overview">Overview</MenuItem>
                  <MenuItem value="detailed">Detailed</MenuItem>
                  <MenuItem value="comparison">Comparison</MenuItem>
                  <MenuItem value="trends">Trends</MenuItem>
                  <MenuItem value="reports">Reports</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PerformanceMetricsDashboard;