/**
 * Real-Time Monitoring Component
 * 
 * This component provides real-time performance monitoring with live metrics,
 * interactive gauges, status indicators, and detailed metric breakdowns.
 * It displays current performance data with automatic updates and visual alerts.
 */

import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  CircularProgress,
  Chip,
  Stack,
  Avatar,
  IconButton,
  Tooltip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Switch,
  FormControlLabel,
  Alert,
  Fade,
  Grow,
  Divider
} from '@mui/material';
import {
  Speed as SpeedIcon,
  Memory as MemoryIcon,
  Computer as ComputerIcon,
  NetworkCheck as NetworkIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon,
  Refresh as RefreshIcon,
  Fullscreen as FullscreenIcon,
  Settings as SettingsIcon,
  Timeline as TimelineIcon,
  Assessment as AssessmentIcon,
  Bolt as BoltIcon,
  Timer as TimerIcon,
  DataUsage as DataUsageIcon,
  TaskAlt as TaskAltIcon
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

// Import performance selectors and actions
import {
  selectCurrentAgentMetrics,
  selectCurrentAgentHistory,
  selectRealTimeEnabled,
  selectUpdateInterval,
  selectAlertThresholds,
  selectPerformanceLoading,
  fetchPerformanceMetrics,
  toggleRealTime,
  setUpdateInterval
} from '../../store';

// Import types
import type {
  PerformanceMetrics,
  DataPoint
} from '../../types/performance';

interface RealTimeMonitoringProps {
  agentId?: string;
  height?: string | number;
  showHistory?: boolean;
  showGauges?: boolean;
  showTable?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface MetricCardProps {
  title: string;
  value: number;
  unit: string;
  icon: React.ElementType;
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  threshold?: number;
  trend?: 'up' | 'down' | 'stable';
  previousValue?: number;
  showSparkline?: boolean;
  sparklineData?: DataPoint[];
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  icon: Icon,
  color,
  threshold,
  trend,
  previousValue,
  showSparkline = false,
  sparklineData = []
}) => {
  const getStatusColor = (value: number, threshold?: number) => {
    if (!threshold) return 'success';
    if (value > threshold * 1.2) return 'error';
    if (value > threshold) return 'warning';
    return 'success';
  };

  const statusColor = getStatusColor(value, threshold);
  const isAboveThreshold = threshold && value > threshold;
  const trendIcon = trend === 'up' ? TrendingUpIcon : trend === 'down' ? TrendingDownIcon : TrendingFlatIcon;
  const TrendIcon = trendIcon;
  const trendColor = trend === 'up' ? 'success' : trend === 'down' ? 'error' : 'action';

  const formatValue = (val: number, unit: string) => {
    if (unit === '%') return `${(val * 100).toFixed(1)}%`;
    if (unit === 'ms') return `${val.toFixed(0)}ms`;
    if (unit === 'ops/s') return `${val.toFixed(1)}`;
    return val.toFixed(2);
  };

  return (
    <Card sx={{ height: '100%', position: 'relative' }}>
      <CardContent>
        <Stack spacing={2}>
          {/* Header */}
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar sx={{ bgcolor: `${color}.main` }}>
              <Icon />
            </Avatar>
            <Box flex={1}>
              <Typography variant="h6" component="div">
                {title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Real-time monitoring
              </Typography>
            </Box>
            {trend && previousValue !== undefined && (
              <Tooltip title={`Trend: ${trend}`}>
                <TrendIcon color={trendColor} />
              </Tooltip>
            )}
          </Stack>

          {/* Value Display */}
          <Box>
            <Typography variant="h3" component="div" color={`${statusColor}.main`} fontWeight="bold">
              {formatValue(value, unit)}
            </Typography>
            {isAboveThreshold && (
              <Chip
                size="small"
                label="Above Threshold"
                color="warning"
                icon={<WarningIcon />}
                sx={{ mt: 1 }}
              />
            )}
          </Box>

          {/* Progress Bar */}
          {threshold && unit === '%' && (
            <Box>
              <LinearProgress
                variant="determinate"
                value={Math.min(value * 100, 100)}
                color={statusColor}
                sx={{ height: 8, borderRadius: 4 }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                Threshold: {(threshold * 100).toFixed(1)}%
              </Typography>
            </Box>
          )}

          {/* Sparkline */}
          {showSparkline && sparklineData.length > 1 && (
            <Box sx={{ height: 60 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sparklineData}>
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={`${color}.main`}
                    fill={`${color}.main`}
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

const RealTimeMonitoring: React.FC<RealTimeMonitoringProps> = ({
  agentId,
  height = '100%',
  showHistory = true,
  showGauges = true,
  showTable = true,
  autoRefresh = true,
  refreshInterval = 5000
}) => {
  const dispatch = useDispatch();
  
  // Redux state
  const currentMetrics = useSelector(selectCurrentAgentMetrics);
  const metricsHistory = useSelector(selectCurrentAgentHistory);
  const realTimeEnabled = useSelector(selectRealTimeEnabled);
  const updateInterval = useSelector(selectUpdateInterval);
  const loading = useSelector(selectPerformanceLoading);
  const alertThresholds = useSelector(selectAlertThresholds);

  // Local state
  const [localRefreshInterval, setLocalRefreshInterval] = useState(refreshInterval);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Metric definitions
  const metrics = useMemo(() => [
    {
      id: 'responseTime',
      title: 'Response Time',
      unit: 'ms',
      icon: SpeedIcon,
      color: 'primary' as const,
      threshold: alertThresholds.responseTime,
      getValue: (metrics: PerformanceMetrics) => metrics.responseTime
    },
    {
      id: 'cognitiveLoad',
      title: 'Cognitive Load',
      unit: '%',
      icon: AssessmentIcon,
      color: 'secondary' as const,
      threshold: alertThresholds.cognitiveLoad,
      getValue: (metrics: PerformanceMetrics) => metrics.cognitiveLoad
    },
    {
      id: 'memoryUsage',
      title: 'Memory Usage',
      unit: '%',
      icon: MemoryIcon,
      color: 'info' as const,
      threshold: alertThresholds.memoryUsage,
      getValue: (metrics: PerformanceMetrics) => metrics.memoryUsage
    },
    {
      id: 'cpuUsage',
      title: 'CPU Usage',
      unit: '%',
      icon: ComputerIcon,
      color: 'warning' as const,
      threshold: alertThresholds.cpuUsage,
      getValue: (metrics: PerformanceMetrics) => metrics.cpuUsage
    },
    {
      id: 'networkLatency',
      title: 'Network Latency',
      unit: 'ms',
      icon: NetworkIcon,
      color: 'success' as const,
      getValue: (metrics: PerformanceMetrics) => metrics.networkLatency
    },
    {
      id: 'errorRate',
      title: 'Error Rate',
      unit: '%',
      icon: ErrorIcon,
      color: 'error' as const,
      threshold: alertThresholds.errorRate,
      getValue: (metrics: PerformanceMetrics) => metrics.errorRate
    },
    {
      id: 'throughput',
      title: 'Throughput',
      unit: 'ops/s',
      icon: DataUsageIcon,
      color: 'info' as const,
      getValue: (metrics: PerformanceMetrics) => metrics.throughput
    },
    {
      id: 'taskCompletionRate',
      title: 'Task Completion Rate',
      unit: '%',
      icon: TaskAltIcon,
      color: 'success' as const,
      getValue: (metrics: PerformanceMetrics) => metrics.taskCompletionRate
    }
  ], [alertThresholds]);

  // Calculate trend for each metric
  const calculateTrend = useCallback((metricId: string): 'up' | 'down' | 'stable' => {
    if (metricsHistory.length < 2) return 'stable';
    
    const recent = metricsHistory.slice(-10);
    const metric = metrics.find(m => m.id === metricId);
    if (!metric) return 'stable';
    
    const values = recent.map(m => metric.getValue(m));
    const average = values.reduce((sum, val) => sum + val, 0) / values.length;
    const latest = values[values.length - 1];
    
    if (latest > average * 1.05) return 'up';
    if (latest < average * 0.95) return 'down';
    return 'stable';
  }, [metricsHistory, metrics]);

  // Generate sparkline data
  const generateSparklineData = useCallback((metricId: string): DataPoint[] => {
    const metric = metrics.find(m => m.id === metricId);
    if (!metric || !currentMetrics) return [];
    
    return metricsHistory.slice(-20).map((m, index) => ({
      timestamp: m.timestamp,
      value: metric.getValue(m),
      label: new Date(m.timestamp).toLocaleTimeString()
    }));
  }, [metricsHistory, metrics, currentMetrics]);

  // Fetch metrics
  const fetchMetrics = useCallback(() => {
    if (agentId) {
      dispatch(fetchPerformanceMetrics({ agentId, timeRange: { start: Date.now() - 60000, end: Date.now(), label: 'Last Minute' } }) as any);
      setLastUpdate(Date.now());
    }
  }, [agentId, dispatch]);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  // Handle real-time toggle
  const handleRealTimeToggle = useCallback(() => {
    dispatch(toggleRealTime());
  }, [dispatch]);

  // Handle interval change
  const handleIntervalChange = useCallback((interval: number) => {
    setLocalRefreshInterval(interval);
    dispatch(setUpdateInterval(interval));
  }, [dispatch]);

  // Auto-refresh effect
  useEffect(() => {
    if (autoRefresh && realTimeEnabled && agentId) {
      intervalRef.current = setInterval(() => {
        fetchMetrics();
      }, updateInterval);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [autoRefresh, realTimeEnabled, agentId, updateInterval, fetchMetrics]);

  // Initial data fetch
  useEffect(() => {
    if (agentId) {
      fetchMetrics();
    }
  }, [agentId, fetchMetrics]);

  // Generate chart data for history view
  const chartData = useMemo(() => {
    if (!showHistory || metricsHistory.length === 0) return [];
    
    return metricsHistory.slice(-50).map((m) => ({
      timestamp: new Date(m.timestamp).toLocaleTimeString(),
      responseTime: m.responseTime,
      cognitiveLoad: m.cognitiveLoad * 100,
      memoryUsage: m.memoryUsage * 100,
      cpuUsage: m.cpuUsage * 100,
      networkLatency: m.networkLatency,
      errorRate: m.errorRate * 100,
      throughput: m.throughput,
      taskCompletionRate: m.taskCompletionRate * 100
    }));
  }, [metricsHistory, showHistory]);

  // Calculate overall status
  const overallStatus = useMemo(() => {
    if (!currentMetrics) return 'unknown';
    
    const criticalMetrics = metrics.filter(m => m.threshold && currentMetrics && m.getValue(currentMetrics) > m.threshold! * 1.2);
    const warningMetrics = metrics.filter(m => m.threshold && currentMetrics && m.getValue(currentMetrics) > m.threshold!);
    
    if (criticalMetrics.length > 0) return 'critical';
    if (warningMetrics.length > 2) return 'warning';
    if (warningMetrics.length > 0) return 'warning';
    return 'healthy';
  }, [currentMetrics, metrics]);

  // Render loading state
  if (loading && !currentMetrics) {
    return (
      <Box sx={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Stack spacing={2} alignItems="center">
          <CircularProgress size={60} />
          <Typography variant="h6" color="text.secondary">
            Loading real-time metrics...
          </Typography>
        </Stack>
      </Box>
    );
  }

  // Render no data state
  if (!currentMetrics) {
    return (
      <Box sx={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
        <Alert severity="info">
          No performance data available. Please select an agent to monitor.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ height, display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Paper sx={{ p: 2, mb: 2, borderRadius: 2 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar sx={{ bgcolor: overallStatus === 'healthy' ? 'success.main' : overallStatus === 'warning' ? 'warning.main' : 'error.main' }}>
              {overallStatus === 'healthy' ? <CheckCircleIcon /> : overallStatus === 'warning' ? <WarningIcon /> : <ErrorIcon />}
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight="bold">
                Real-Time Performance Monitor
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Agent: {agentId} | Last updated: {new Date(lastUpdate).toLocaleTimeString()}
              </Typography>
            </Box>
          </Stack>
          
          <Stack direction="row" spacing={1}>
            <FormControlLabel
              control={
                <Switch
                  checked={realTimeEnabled}
                  onChange={handleRealTimeToggle}
                  size="small"
                />
              }
              label="Real-time"
            />
            
            <Tooltip title="Refresh">
              <IconButton onClick={handleRefresh} disabled={loading}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Settings">
              <IconButton onClick={() => setShowSettings(!showSettings)}>
                <SettingsIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
        
        {/* Settings Panel */}
        {showSettings && (
          <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
            <Stack spacing={2}>
              <Typography variant="subtitle2">Update Interval: {localRefreshInterval}ms</Typography>
              <input
                type="range"
                min="1000"
                max="30000"
                step="1000"
                value={localRefreshInterval}
                onChange={(e) => handleIntervalChange(Number(e.target.value))}
                style={{ width: '100%' }}
              />
            </Stack>
          </Box>
        )}
      </Paper>

      {/* Main Content */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {/* Metric Cards */}
        {showGauges && (
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {metrics.map((metric) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={metric.id}>
                <Fade in timeout={300}>
                  <Box>
                    <MetricCard
                      title={metric.title}
                      value={metric.getValue(currentMetrics)}
                      unit={metric.unit}
                      icon={metric.icon}
                      color={metric.color}
                      threshold={metric.threshold}
                      trend={calculateTrend(metric.id)}
                      showSparkline={true}
                      sparklineData={generateSparklineData(metric.id)}
                    />
                  </Box>
                </Fade>
              </Grid>
            ))}
          </Grid>
        )}

        {/* History Chart */}
        {showHistory && chartData.length > 0 && (
          <Paper sx={{ p: 2, mb: 2, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              Performance History (Last 50 data points)
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis />
                <RechartsTooltip />
                <Line type="monotone" dataKey="responseTime" stroke="#8884d8" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="cognitiveLoad" stroke="#82ca9d" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="memoryUsage" stroke="#ffc658" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="cpuUsage" stroke="#ff7300" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        )}

        {/* Detailed Metrics Table */}
        {showTable && (
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              Detailed Metrics
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Metric</TableCell>
                    <TableCell align="right">Current Value</TableCell>
                    <TableCell align="right">Threshold</TableCell>
                    <TableCell align="right">Status</TableCell>
                    <TableCell align="right">Trend</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {metrics.map((metric) => {
                    const value = metric.getValue(currentMetrics);
                    const threshold = metric.threshold;
                    const isAboveThreshold = threshold && value > threshold;
                    const trend = calculateTrend(metric.id);
                    
                    return (
                      <TableRow key={metric.id} hover>
                        <TableCell>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <metric.icon color="action" />
                            <Typography variant="body2" fontWeight="medium">
                              {metric.title}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight="bold">
                            {metric.unit === '%' ? `${(value * 100).toFixed(1)}%` : 
                             metric.unit === 'ms' ? `${value.toFixed(0)}ms` :
                             metric.unit === 'ops/s' ? `${value.toFixed(1)}` :
                             value.toFixed(2)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          {threshold ? (
                            <Typography variant="body2" color="text.secondary">
                              {metric.unit === '%' ? `${(threshold * 100).toFixed(1)}%` :
                               metric.unit === 'ms' ? `${threshold}ms` :
                               threshold.toFixed(2)}
                            </Typography>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              N/A
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="right">
                          <Chip
                            size="small"
                            label={isAboveThreshold ? 'Warning' : 'Normal'}
                            color={isAboveThreshold ? 'warning' : 'success'}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Stack direction="row" alignItems="center" justifyContent="flex-end" spacing={1}>
                            {trend === 'up' && <TrendingUpIcon color="success" fontSize="small" />}
                            {trend === 'down' && <TrendingDownIcon color="error" fontSize="small" />}
                            {trend === 'stable' && <TrendingFlatIcon color="action" fontSize="small" />}
                            <Typography variant="body2" color="text.secondary">
                              {trend}
                            </Typography>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}
      </Box>
    </Box>
  );
};

export default RealTimeMonitoring;