/**
 * Trend Analysis Component
 * 
 * This component provides comprehensive trend analysis with historical data visualization,
 * statistical analysis, trend detection, and comparative analysis across different time periods.
 * It includes interactive charts, trend indicators, and detailed analytics.
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  IconButton,
  Tooltip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  Button,
  Divider,
  Alert,
  CircularProgress,
  LinearProgress,
  Avatar,
  Badge
} from '@mui/material';
import {
  Timeline as TimelineIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon,
  Analytics as AnalyticsIcon,
  DateRange as DateRangeIcon,
  Compare as CompareIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Assessment as AssessmentIcon,
  ShowChart as ShowChartIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  Timeline as TimelineIconAlt,
  Info as InfoIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
  ReferenceLine,
  ComposedChart,
  ScatterChart,
  Scatter
} from 'recharts';

// Import performance selectors and actions
import {
  selectPerformanceTrends,
  selectPerformanceLoading,
  selectPerformanceError,
  fetchPerformanceTrends
} from '../../store';

// Import agents selectors
import {
  selectAllAgents
} from '../../store';

// Import types
import type {
  PerformanceTrend,
  TrendDirection,
  DataPoint,
  TrendAnalysis,
  StatisticalSummary
} from '../../types/performance';

interface TrendAnalysisProps {
  agentId?: string;
  height?: string | number;
  showComparison?: boolean;
  showStatistics?: boolean;
  showPredictions?: boolean;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`trend-tabpanel-${index}`}
      aria-labelledby={`trend-tab-${index}`}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
};

interface TrendSummaryCardProps {
  title: string;
  value: string;
  trend: TrendDirection;
  change: number;
  changePercent: number;
  icon: React.ElementType;
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  description: string;
}

const TrendSummaryCard: React.FC<TrendSummaryCardProps> = ({
  title,
  value,
  trend,
  change,
  changePercent,
  icon: Icon,
  color,
  description
}) => {
  const getTrendIcon = () => {
    switch (trend) {
      case 'improving': return TrendingUpIcon;
      case 'degrading': return TrendingDownIcon;
      case 'stable': return TrendingFlatIcon;
      default: return TrendingFlatIcon;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'improving': return 'success';
      case 'degrading': return 'error';
      case 'stable': return 'warning';
      default: return 'action';
    }
  };

  const TrendIcon = getTrendIcon();
  const trendColor = getTrendColor();

  return (
    <Card sx={{ height: '100%' }}>
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
                {description}
              </Typography>
            </Box>
            <Badge color={trendColor} badgeContent={<TrendIcon />}>
              <Box />
            </Badge>
          </Stack>

          {/* Value */}
          <Typography variant="h4" component="div" fontWeight="bold" color={`${color}.main`}>
            {value}
          </Typography>

          {/* Change */}
          <Stack direction="row" alignItems="center" spacing={1}>
            <TrendIcon color={trendColor} />
            <Typography variant="body2" color={`${trendColor}.main`}>
              {change > 0 ? '+' : ''}{change} ({changePercent > 0 ? '+' : ''}{changePercent.toFixed(1)}%)
            </Typography>
            <Chip
              size="small"
              label={trend}
              color={trendColor as any}
              variant="outlined"
            />
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

const TrendAnalysis: React.FC<TrendAnalysisProps> = ({
  agentId,
  height = '100%',
  showComparison = true,
  showStatistics = true,
  showPredictions = true
}) => {
  const dispatch = useDispatch();
  
  // Redux state
  const trends = useSelector(selectPerformanceTrends);
  const loading = useSelector(selectPerformanceLoading);
  const error = useSelector(selectPerformanceError);
  const availableAgents = useSelector(selectAllAgents);

  // Local state
  const [selectedAgent, setSelectedAgent] = useState<string>(agentId || '');
  const [selectedMetric, setSelectedMetric] = useState<string>('responseTime');
  const [timeRange, setTimeRange] = useState<string>('24h');
  const [tabValue, setTabValue] = useState<number>(0);
  const [comparisonMode, setComparisonMode] = useState<boolean>(false);
  const [comparisonAgent, setComparisonAgent] = useState<string>('');

  // Metric options
  const metricOptions = [
    { value: 'responseTime', label: 'Response Time', unit: 'ms' },
    { value: 'cognitiveLoad', label: 'Cognitive Load', unit: '%' },
    { value: 'memoryUsage', label: 'Memory Usage', unit: '%' },
    { value: 'cpuUsage', label: 'CPU Usage', unit: '%' },
    { value: 'networkLatency', label: 'Network Latency', unit: 'ms' },
    { value: 'errorRate', label: 'Error Rate', unit: '%' },
    { value: 'throughput', label: 'Throughput', unit: 'ops/s' },
    { value: 'taskCompletionRate', label: 'Task Completion Rate', unit: '%' }
  ];

  // Time range options
  const timeRangeOptions = [
    { value: '1h', label: 'Last Hour', hours: 1 },
    { value: '6h', label: 'Last 6 Hours', hours: 6 },
    { value: '24h', label: 'Last 24 Hours', hours: 24 },
    { value: '7d', label: 'Last 7 Days', hours: 168 },
    { value: '30d', label: 'Last 30 Days', hours: 720 }
  ];

  // Fetch trends data
  const fetchTrendsData = useCallback(() => {
    if (selectedAgent && selectedMetric) {
      const timeRangeObj = timeRangeOptions.find(tr => tr.value === timeRange);
      if (timeRangeObj) {
        const endTime = Date.now();
        const startTime = endTime - (timeRangeObj.hours * 60 * 60 * 1000);
        
        dispatch(fetchPerformanceTrends({
          agentId: selectedAgent,
          metric: selectedMetric,
          timeRange: { start: startTime, end: endTime, label: timeRangeObj.label }
        }) as any);
      }
    }
  }, [selectedAgent, selectedMetric, timeRange, dispatch]);

  // Fetch comparison data
  const fetchComparisonData = useCallback(() => {
    if (comparisonMode && comparisonAgent && selectedMetric) {
      const timeRangeObj = timeRangeOptions.find(tr => tr.value === timeRange);
      if (timeRangeObj) {
        const endTime = Date.now();
        const startTime = endTime - (timeRangeObj.hours * 60 * 60 * 1000);
        
        dispatch(fetchPerformanceTrends({
          agentId: comparisonAgent,
          metric: selectedMetric,
          timeRange: { start: startTime, end: endTime, label: timeRangeObj.label }
        }) as any);
      }
    }
  }, [comparisonMode, comparisonAgent, selectedMetric, timeRange, dispatch]);

  // Effects
  useEffect(() => {
    if (selectedAgent) {
      fetchTrendsData();
    }
  }, [selectedAgent, selectedMetric, timeRange, fetchTrendsData]);

  useEffect(() => {
    if (comparisonMode && comparisonAgent) {
      fetchComparisonData();
    }
  }, [comparisonMode, comparisonAgent, fetchComparisonData]);

  // Process chart data
  const chartData = useMemo(() => {
    if (!trends || trends.length === 0) return [];
    
    const trend = trends.find(t => t.agentId === selectedAgent);
    if (!trend || !trend.historicalData) return [];
    
    return trend.historicalData.map(point => ({
      timestamp: new Date(point.timestamp).toLocaleTimeString(),
      value: point.value,
      label: point.label
    }));
  }, [trends, selectedAgent]);

  // Process comparison chart data
  const comparisonChartData = useMemo(() => {
    if (!comparisonMode || !trends || trends.length === 0) return [];
    
    const primaryTrend = trends.find(t => t.agentId === selectedAgent);
    const comparisonTrend = trends.find(t => t.agentId === comparisonAgent);
    
    if (!primaryTrend || !comparisonTrend) return [];
    
    // Merge data points by timestamp
    const mergedData: any[] = [];
    const primaryData = primaryTrend.historicalData || [];
    const comparisonData = comparisonTrend.historicalData || [];
    
    const timestampMap = new Map();
    
    primaryData.forEach(point => {
      timestampMap.set(point.timestamp, {
        timestamp: new Date(point.timestamp).toLocaleTimeString(),
        primary: point.value,
        comparison: null
      });
    });
    
    comparisonData.forEach(point => {
      if (timestampMap.has(point.timestamp)) {
        timestampMap.get(point.timestamp).comparison = point.value;
      } else {
        timestampMap.set(point.timestamp, {
          timestamp: new Date(point.timestamp).toLocaleTimeString(),
          primary: null,
          comparison: point.value
        });
      }
    });
    
    return Array.from(timestampMap.values()).sort((a, b) => 
      a.timestamp.localeCompare(b.timestamp)
    );
  }, [trends, selectedAgent, comparisonAgent, comparisonMode]);

  // Calculate trend statistics
  const trendStatistics = useMemo((): StatisticalSummary | null => {
    if (!trends || trends.length === 0) return null;
    
    const trend = trends.find(t => t.agentId === selectedAgent);
    if (!trend || !trend.historicalData) return null;
    
    const values = trend.historicalData.map(point => point.value);
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const median = values.sort((a, b) => a - b)[Math.floor(values.length / 2)];
    
    // Calculate trend
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
    
    let trendDirection: TrendDirection = 'stable';
    if (secondAvg > firstAvg * 1.05) trendDirection = 'improving';
    else if (secondAvg < firstAvg * 0.95) trendDirection = 'degrading';
    
    return {
      mean,
      median,
      stdDev,
      min,
      max,
      trend: trendDirection,
      sampleSize: values.length,
      confidenceInterval: {
        lower: mean - 1.96 * (stdDev / Math.sqrt(values.length)),
        upper: mean + 1.96 * (stdDev / Math.sqrt(values.length))
      }
    };
  }, [trends, selectedAgent]);

  // Generate trend summary cards
  const trendSummaryCards = useMemo(() => {
    if (!trendStatistics) return [];
    
    const metric = metricOptions.find(m => m.value === selectedMetric);
    if (!metric) return [];
    
    return [
      {
        title: 'Current Value',
        value: chartData.length > 0 ? 
          (metric.unit === '%' ? `${(chartData[chartData.length - 1].value * 100).toFixed(1)}%` :
           metric.unit === 'ms' ? `${chartData[chartData.length - 1].value.toFixed(0)}ms` :
           chartData[chartData.length - 1].value.toFixed(2)) : 'N/A',
        trend: trendStatistics.trend,
        change: chartData.length > 1 ? chartData[chartData.length - 1].value - chartData[0].value : 0,
        changePercent: chartData.length > 1 ? 
          ((chartData[chartData.length - 1].value - chartData[0].value) / chartData[0].value) * 100 : 0,
        icon: AssessmentIcon,
        color: 'primary' as const,
        description: metric.label
      },
      {
        title: 'Average',
        value: metric.unit === '%' ? `${(trendStatistics.mean * 100).toFixed(1)}%` :
               metric.unit === 'ms' ? `${trendStatistics.mean.toFixed(0)}ms` :
               trendStatistics.mean.toFixed(2),
        trend: trendStatistics.trend,
        change: 0,
        changePercent: 0,
        icon: BarChartIcon,
        color: 'secondary' as const,
        description: 'Historical average'
      },
      {
        title: 'Peak Value',
        value: metric.unit === '%' ? `${(trendStatistics.max * 100).toFixed(1)}%` :
               metric.unit === 'ms' ? `${trendStatistics.max.toFixed(0)}ms` :
               trendStatistics.max.toFixed(2),
        trend: 'stable' as TrendDirection,
        change: 0,
        changePercent: 0,
        icon: ShowChartIcon,
        color: 'warning' as const,
        description: 'Maximum observed value'
      },
      {
        title: 'Volatility',
        value: `${(trendStatistics.stdDev / trendStatistics.mean * 100).toFixed(1)}%`,
        trend: 'stable' as TrendDirection,
        change: 0,
        changePercent: 0,
        icon: AnalyticsIcon,
        color: 'info' as const,
        description: 'Standard deviation relative to mean'
      }
    ];
  }, [trendStatistics, selectedMetric, chartData, metricOptions]);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchTrendsData();
    if (comparisonMode) {
      fetchComparisonData();
    }
  };

  // Render loading state
  if (loading && !trends) {
    return (
      <Box sx={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Stack spacing={2} alignItems="center">
          <CircularProgress size={60} />
          <Typography variant="h6" color="text.secondary">
            Loading trend analysis...
          </Typography>
        </Stack>
      </Box>
    );
  }

  // Render error state
  if (error) {
    return (
      <Box sx={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
        <Alert severity="error">
          Error loading trend data: {error}
        </Alert>
      </Box>
    );
  }

  // Render no data state
  if (!selectedAgent) {
    return (
      <Box sx={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
        <Alert severity="info">
          Please select an agent to analyze trends.
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
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              <TimelineIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight="bold">
                Trend Analysis
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Historical performance trends and patterns
              </Typography>
            </Box>
          </Stack>
          
          <Stack direction="row" spacing={2}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Agent</InputLabel>
              <Select
                value={selectedAgent}
                label="Agent"
                onChange={(e) => setSelectedAgent(e.target.value)}
              >
                {availableAgents.map((agent) => (
                  <MenuItem key={agent.id} value={agent.id}>
                    {agent.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Metric</InputLabel>
              <Select
                value={selectedMetric}
                label="Metric"
                onChange={(e) => setSelectedMetric(e.target.value)}
              >
                {metricOptions.map((metric) => (
                  <MenuItem key={metric.value} value={metric.value}>
                    {metric.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Time Range</InputLabel>
              <Select
                value={timeRange}
                label="Time Range"
                onChange={(e) => setTimeRange(e.target.value)}
              >
                {timeRangeOptions.map((range) => (
                  <MenuItem key={range.value} value={range.value}>
                    {range.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Tooltip title="Refresh">
              <IconButton onClick={handleRefresh} disabled={loading}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
      </Paper>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {trendSummaryCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <TrendSummaryCard {...card} />
          </Grid>
        ))}
      </Grid>

      {/* Tabs */}
      <Paper sx={{ borderRadius: 2, flex: 1, overflow: 'hidden' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Trend Chart" icon={<ShowChartIcon />} />
          <Tab label="Statistics" icon={<AnalyticsIcon />} />
          {showComparison && <Tab label="Comparison" icon={<CompareIcon />} />}
          {showPredictions && <Tab label="Predictions" icon={<TimelineIconAlt />} />}
        </Tabs>

        {/* Trend Chart Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Performance Trend
            </Typography>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" />
                  <YAxis />
                  <RechartsTooltip />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#8884d8"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 6 }}
                  />
                  {trendStatistics && (
                    <ReferenceLine
                      y={trendStatistics.mean}
                      stroke="#ff7300"
                      strokeDasharray="5 5"
                      label="Average"
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography color="text.secondary">No trend data available</Typography>
              </Box>
            )}
          </Box>
        </TabPanel>

        {/* Statistics Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Statistical Summary
            </Typography>
            {trendStatistics ? (
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Metric</TableCell>
                          <TableCell align="right">Value</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell>Mean</TableCell>
                          <TableCell align="right">{trendStatistics.mean.toFixed(2)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Median</TableCell>
                          <TableCell align="right">{trendStatistics.median.toFixed(2)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Std Dev</TableCell>
                          <TableCell align="right">{trendStatistics.stdDev.toFixed(2)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Minimum</TableCell>
                          <TableCell align="right">{trendStatistics.min.toFixed(2)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Maximum</TableCell>
                          <TableCell align="right">{trendStatistics.max.toFixed(2)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Sample Size</TableCell>
                          <TableCell align="right">{trendStatistics.sampleSize}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Trend Analysis
                    </Typography>
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Overall Trend
                        </Typography>
                        <Chip
                          label={trendStatistics.trend}
                          color={trendStatistics.trend === 'improving' ? 'success' : 
                                 trendStatistics.trend === 'degrading' ? 'error' : 'warning'}
                          sx={{ mt: 1 }}
                        />
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          95% Confidence Interval
                        </Typography>
                        <Typography variant="body1">
                          [{trendStatistics.confidenceInterval.lower.toFixed(2)}, {trendStatistics.confidenceInterval.upper.toFixed(2)}]
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Volatility
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min((trendStatistics.stdDev / trendStatistics.mean) * 100, 100)}
                          sx={{ mt: 1 }}
                        />
                        <Typography variant="caption">
                          {((trendStatistics.stdDev / trendStatistics.mean) * 100).toFixed(1)}%
                        </Typography>
                      </Box>
                    </Stack>
                  </Paper>
                </Grid>
              </Grid>
            ) : (
              <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography color="text.secondary">No statistics available</Typography>
              </Box>
            )}
          </Box>
        </TabPanel>

        {/* Comparison Tab */}
        {showComparison && (
          <TabPanel value={tabValue} index={2}>
            <Box sx={{ p: 2 }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
                <Typography variant="h6">
                  Agent Comparison
                </Typography>
                <Stack direction="row" spacing={2} alignItems="center">
                  <FormControlLabel
                    control={
                      <Switch
                        checked={comparisonMode}
                        onChange={(e) => setComparisonMode(e.target.checked)}
                      />
                    }
                    label="Enable Comparison"
                  />
                  {comparisonMode && (
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <InputLabel>Compare With</InputLabel>
                      <Select
                        value={comparisonAgent}
                        label="Compare With"
                        onChange={(e) => setComparisonAgent(e.target.value)}
                      >
                        {availableAgents
                          .filter(agent => agent.id !== selectedAgent)
                          .map((agent) => (
                            <MenuItem key={agent.id} value={agent.id}>
                              {agent.name}
                            </MenuItem>
                          ))}
                      </Select>
                    </FormControl>
                  )}
                </Stack>
              </Stack>
              
              {comparisonMode && comparisonAgent && comparisonChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={comparisonChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="primary"
                      stroke="#8884d8"
                      strokeWidth={2}
                      name={selectedAgent}
                      connectNulls={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="comparison"
                      stroke="#82ca9d"
                      strokeWidth={2}
                      name={comparisonAgent}
                      connectNulls={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography color="text.secondary">
                    {comparisonMode ? 'Select an agent to compare' : 'Enable comparison mode to see comparative analysis'}
                  </Typography>
                </Box>
              )}
            </Box>
          </TabPanel>
        )}

        {/* Predictions Tab */}
        {showPredictions && (
          <TabPanel value={tabValue} index={showComparison ? 3 : 2}>
            <Box sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Predictive Analytics
              </Typography>
              <Alert severity="info">
                Predictive analytics will be available in the next phase of implementation.
                This feature will use machine learning to forecast future performance trends.
              </Alert>
            </Box>
          </TabPanel>
        )}
      </Paper>
    </Box>
  );
};

export default TrendAnalysis;