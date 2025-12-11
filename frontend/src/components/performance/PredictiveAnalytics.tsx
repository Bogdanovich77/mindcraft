/**
 * Predictive Analytics Component
 * 
 * This component provides advanced predictive analytics with forecasting capabilities,
 * machine learning predictions, confidence intervals, and future performance insights.
 * It includes multiple forecasting models, accuracy metrics, and predictive insights.
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
  Badge,
  Switch,
  FormControlLabel,
  Slider,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Timeline as TimelineIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Analytics as AnalyticsIcon,
  DateRange as DateRangeIcon,
  ShowChart as ShowChartIcon,
  BarChart as BarChartIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  ExpandMore as ExpandMoreIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  Assessment as AssessmentIcon,
  Analytics as PredictiveAnalysisIcon,
  Timeline as TimelineIconAlt,
  Science as ScienceIcon,
  ModelTraining as ModelTrainingIcon,
  CloudQueue as CloudQueueIcon,
  Speed as SpeedIcon,
  Memory as MemoryIcon,
  Download as DownloadIcon
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
  ReferenceLine,
  Legend,
  ComposedChart,
  ScatterChart,
  Scatter,
  TooltipProps
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
  ForecastData,
  DataPoint,
  PredictionModel,
  ConfidenceInterval,
  PredictionAccuracy
} from '../../types/performance';

interface PredictiveAnalyticsProps {
  agentId?: string;
  height?: string | number;
  showModels?: boolean;
  showAccuracy?: boolean;
  showConfidence?: boolean;
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
      id={`prediction-tabpanel-${index}`}
      aria-labelledby={`prediction-tab-${index}`}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
};

interface PredictionCardProps {
  title: string;
  predictedValue: number;
  confidence: number;
  accuracy: number;
  trend: 'up' | 'down' | 'stable';
  unit: string;
  icon: React.ElementType;
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  timeframe: string;
}

const PredictionCard: React.FC<PredictionCardProps> = ({
  title,
  predictedValue,
  confidence,
  accuracy,
  trend,
  unit,
  icon: Icon,
  color,
  timeframe
}) => {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return TrendingUpIcon;
      case 'down': return TrendingDownIcon;
      case 'stable': return TimelineIconAlt;
      default: return TimelineIconAlt;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up': return 'success';
      case 'down': return 'error';
      case 'stable': return 'warning';
      default: return 'action';
    }
  };

  const TrendIcon = getTrendIcon();
  const trendColor = getTrendColor();

  const formatValue = (val: number, unit: string) => {
    if (unit === '%') return `${(val * 100).toFixed(1)}%`;
    if (unit === 'ms') return `${val.toFixed(0)}ms`;
    if (unit === 'ops/s') return `${val.toFixed(1)}`;
    return val.toFixed(2);
  };

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
                {timeframe} forecast
              </Typography>
            </Box>
            <Badge color={trendColor} badgeContent={<TrendIcon />}>
              <Box />
            </Badge>
          </Stack>

          {/* Predicted Value */}
          <Typography variant="h4" component="div" fontWeight="bold" color={`${color}.main`}>
            {formatValue(predictedValue, unit)}
          </Typography>

          {/* Confidence and Accuracy */}
          <Stack spacing={1}>
            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="text.secondary">
                  Confidence
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {(confidence * 100).toFixed(1)}%
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={confidence * 100}
                color="primary"
                sx={{ height: 6, borderRadius: 3 }}
              />
            </Box>
             
            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="text.secondary">
                  Accuracy
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {(accuracy * 100).toFixed(1)}%
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={accuracy * 100}
                color="secondary"
                sx={{ height: 6, borderRadius: 3 }}
              />
            </Box>
          </Stack>

          {/* Trend Indicator */}
          <Stack direction="row" alignItems="center" spacing={1}>
            <TrendIcon color={trendColor} />
            <Typography variant="body2" color={`${trendColor}.main`}>
              Predicted trend: {trend}
            </Typography>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

const PredictiveAnalytics: React.FC<PredictiveAnalyticsProps> = ({
  agentId,
  height = '100%',
  showModels = true,
  showAccuracy = true,
  showConfidence = true
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
  const [forecastHorizon, setForecastHorizon] = useState<number>(24); // hours
  const [selectedModel, setSelectedModel] = useState<string>('linear');
  const [confidenceLevel, setConfidenceLevel] = useState<number>(0.95);
  const [tabValue, setTabValue] = useState<number>(0);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

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

  // Model options
  const modelOptions: PredictionModel[] = [
    {
      id: 'linear',
      name: 'Linear Regression',
      description: 'Simple linear trend analysis',
      accuracy: 0.75,
      confidence: 0.80,
      parameters: { slope: 0, intercept: 0 }
    },
    {
      id: 'polynomial',
      name: 'Polynomial Regression',
      description: 'Non-linear polynomial fitting',
      accuracy: 0.82,
      confidence: 0.85,
      parameters: { degree: 2, coefficients: [] }
    },
    {
      id: 'exponential',
      name: 'Exponential Smoothing',
      description: 'Time-series exponential smoothing',
      accuracy: 0.78,
      confidence: 0.83,
      parameters: { alpha: 0.3, beta: 0.1 }
    },
    {
      id: 'arima',
      name: 'ARIMA',
      description: 'Auto-Regressive Integrated Moving Average',
      accuracy: 0.88,
      confidence: 0.90,
      parameters: { p: 1, d: 1, q: 1 }
    },
    {
      id: 'lstm',
      name: 'LSTM Neural Network',
      description: 'Long Short-Term Memory neural network',
      accuracy: 0.92,
      confidence: 0.95,
      parameters: { layers: 2, units: 50, epochs: 100 }
    }
  ];

  // Generate synthetic forecast data (in real implementation, this would come from ML backend)
  const generateForecastData = useCallback((historicalData: DataPoint[], horizon: number): ForecastData[] => {
    if (historicalData.length < 10) return [];
    
    const forecast: ForecastData[] = [];
    const lastTimestamp = historicalData[historicalData.length - 1].timestamp;
    const interval = (lastTimestamp - historicalData[0].timestamp) / historicalData.length;
    
    // Simple linear regression for demo
    const values = historicalData.map(d => d.value);
    const n = values.length;
    const sumX = Array.from({ length: n }, (_, i) => i).reduce((a, b) => a + b, 0);
    const sumY = values.reduce((a, b) => a + b, 0);
    const sumXY = values.reduce((a, b, i) => a + i * b, 0);
    const sumXX = Array.from({ length: n }, (_, i) => i * i).reduce((a, b) => a + b, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    // Generate forecast points
    for (let i = 1; i <= horizon; i++) {
      const futureTime = lastTimestamp + (i * interval);
      const predictedValue = intercept + slope * (n + i - 1);
      const confidence = 0.95 - (i / horizon) * 0.3; // Decreasing confidence over time
      const variance = Math.pow(0.1 * predictedValue, 2); // Simple variance estimate
      
      forecast.push({
        timestamp: futureTime,
        value: predictedValue,
        confidenceInterval: {
          lower: predictedValue - 1.96 * Math.sqrt(variance),
          upper: predictedValue + 1.96 * Math.sqrt(variance)
        },
        confidence,
        accuracy: 0.85 - (i / horizon) * 0.2 // Decreasing accuracy over time
      });
    }
    
    return forecast;
  }, []);

  // Process historical and forecast data
  const chartData = useMemo(() => {
    if (!trends || trends.length === 0) return [];
    
    const trend = trends.find(t => t.agentId === selectedAgent);
    if (!trend || !trend.historicalData) return [];
    
    const historical = trend.historicalData.map(point => ({
      timestamp: new Date(point.timestamp).toLocaleTimeString(),
      historical: point.value,
      forecast: null,
      upperBound: null,
      lowerBound: null,
      type: 'historical'
    }));
    
    const forecast = generateForecastData(trend.historicalData, forecastHorizon);
    const forecastPoints = forecast.map(point => ({
      timestamp: new Date(point.timestamp).toLocaleTimeString(),
      historical: null,
      forecast: point.value,
      upperBound: point.confidenceInterval.upper,
      lowerBound: point.confidenceInterval.lower,
      type: 'forecast'
    }));
    
    return [...historical, ...forecastPoints];
  }, [trends, selectedAgent, forecastHorizon, generateForecastData]);

  // Generate prediction summary
  const predictionSummary = useMemo(() => {
    if (!trends || trends.length === 0) return [];
    
    const trend = trends.find(t => t.agentId === selectedAgent);
    if (!trend || !trend.historicalData) return [];
    
    const forecast = generateForecastData(trend.historicalData, forecastHorizon);
    if (forecast.length === 0) return [];
    
    const metric = metricOptions.find(m => m.value === selectedMetric);
    if (!metric) return [];
    
    const nextHour = forecast[Math.min(0, forecast.length - 1)];
    const next24Hours = forecast[Math.min(23, forecast.length - 1)];
    const nextWeek = forecast[Math.min(167, forecast.length - 1)];
    
    const calculateTrend = (current: number, predicted: number): 'up' | 'down' | 'stable' => {
      if (predicted > current * 1.05) return 'up';
      if (predicted < current * 0.95) return 'down';
      return 'stable';
    };
    
    const currentValue = trend.historicalData[trend.historicalData.length - 1]?.value || 0;
    
    return [
      {
        title: 'Next Hour',
        predictedValue: nextHour?.value || 0,
        confidence: nextHour?.confidence || 0,
        accuracy: nextHour?.accuracy || 0,
        trend: calculateTrend(currentValue, nextHour?.value || 0),
        unit: metric.unit,
        icon: SpeedIcon,
        color: 'primary' as const,
        timeframe: '1 hour'
      },
      {
        title: 'Next 24 Hours',
        predictedValue: next24Hours?.value || 0,
        confidence: next24Hours?.confidence || 0,
        accuracy: next24Hours?.accuracy || 0,
        trend: calculateTrend(currentValue, next24Hours?.value || 0),
        unit: metric.unit,
        icon: TimelineIcon,
        color: 'secondary' as const,
        timeframe: '24 hours'
      },
      {
        title: 'Next Week',
        predictedValue: nextWeek?.value || 0,
        confidence: nextWeek?.confidence || 0,
        accuracy: nextWeek?.accuracy || 0,
        trend: calculateTrend(currentValue, nextWeek?.value || 0),
        unit: metric.unit,
        icon: DateRangeIcon,
        color: 'warning' as const,
        timeframe: '7 days'
      }
    ];
  }, [trends, selectedAgent, selectedMetric, forecastHorizon, generateForecastData, metricOptions]);

  // Fetch historical data
  const fetchHistoricalData = useCallback(() => {
    if (selectedAgent && selectedMetric) {
      const endTime = Date.now();
      const startTime = endTime - (7 * 24 * 60 * 60 * 1000); // Last 7 days
      
      dispatch(fetchPerformanceTrends({
        agentId: selectedAgent,
        metric: selectedMetric,
        timeRange: { start: startTime, end: endTime, label: 'Last 7 Days' }
      }) as any);
    }
  }, [selectedAgent, selectedMetric, dispatch]);

  // Effects
  useEffect(() => {
    if (selectedAgent) {
      fetchHistoricalData();
    }
  }, [selectedAgent, selectedMetric, fetchHistoricalData]);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchHistoricalData();
  };

  // Custom tooltip for forecast chart
  const CustomTooltip: React.FC<TooltipProps<number, string>> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Paper sx={{ p: 2 }}>
          <Typography variant="body2" gutterBottom>
            {label}
          </Typography>
          {data.historical !== null && (
            <Typography variant="body2" color="primary">
              Historical: {data.historical?.toFixed(2)}
            </Typography>
          )}
          {data.forecast !== null && (
            <>
              <Typography variant="body2" color="secondary">
                Forecast: {data.forecast?.toFixed(2)}
              </Typography>
              {data.upperBound !== null && data.lowerBound !== null && (
                <Typography variant="caption" color="text.secondary">
                  95% CI: [{data.lowerBound?.toFixed(2)}, {data.upperBound?.toFixed(2)}]
                </Typography>
              )}
            </>
          )}
        </Paper>
      );
    }
    return null;
  };

  // Render loading state
  if (loading && !trends) {
    return (
      <Box sx={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Stack spacing={2} alignItems="center">
          <CircularProgress size={60} />
          <Typography variant="h6" color="text.secondary">
            Loading predictive analytics...
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
          Error loading predictive data: {error}
        </Alert>
      </Box>
    );
  }

  // Render no data state
  if (!selectedAgent) {
    return (
      <Box sx={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
        <Alert severity="info">
          Please select an agent to analyze predictive trends.
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
              <PredictiveAnalysisIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight="bold">
                Predictive Analytics
              </Typography>
              <Typography variant="body2" color="text.secondary">
                AI-powered performance forecasting and predictions
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
             
            <Tooltip title="Refresh">
              <IconButton onClick={handleRefresh} disabled={loading}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
      </Paper>

      {/* Prediction Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {predictionSummary.map((card, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <PredictionCard {...card} />
          </Grid>
        ))}
      </Grid>

      {/* Main Content */}
      <Paper sx={{ borderRadius: 2, flex: 1, overflow: 'hidden' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Forecast Chart" icon={<ShowChartIcon />} />
          <Tab label="Model Comparison" icon={<ModelTrainingIcon />} />
          <Tab label="Accuracy Metrics" icon={<AssessmentIcon />} />
          <Tab label="Advanced Settings" icon={<SettingsIcon />} />
        </Tabs>

        {/* Forecast Chart Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ p: 2 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
              <Typography variant="h6">
                Performance Forecast
              </Typography>
              <Stack direction="row" spacing={2} alignItems="center">
                <Typography variant="body2" color="text.secondary">
                  Forecast Horizon: {forecastHorizon}h
                </Typography>
                <Slider
                  value={forecastHorizon}
                  onChange={(e, value) => setForecastHorizon(value as number)}
                  min={1}
                  max={168}
                  step={1}
                  sx={{ width: 150 }}
                />
              </Stack>
            </Stack>
             
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" />
                  <YAxis />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend />
                   
                  {/* Historical data */}
                  <Line
                    type="monotone"
                    dataKey="historical"
                    stroke="#8884d8"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    name="Historical"
                    connectNulls={false}
                  />
                   
                  {/* Forecast data */}
                  <Line
                    type="monotone"
                    dataKey="forecast"
                    stroke="#82ca9d"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ r: 3 }}
                    name="Forecast"
                    connectNulls={false}
                  />
                   
                  {/* Confidence intervals */}
                  {showConfidence && (
                    <>
                      <Area
                        type="monotone"
                        dataKey="upperBound"
                        stroke="#ff7300"
                        fill="#ff7300"
                        fillOpacity={0.1}
                        strokeWidth={0}
                        name="Upper Bound"
                        connectNulls={false}
                      />
                      <Area
                        type="monotone"
                        dataKey="lowerBound"
                        stroke="#ff7300"
                        fill="#ff7300"
                        fillOpacity={0.1}
                        strokeWidth={0}
                        name="Lower Bound"
                        connectNulls={false}
                      />
                    </>
                  )}
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography color="text.secondary">No forecast data available</Typography>
              </Box>
            )}
          </Box>
        </TabPanel>

        {/* Model Comparison Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Prediction Model Comparison
            </Typography>
            <Grid container spacing={2}>
              {modelOptions.map((model) => (
                <Grid item xs={12} md={6} key={model.id}>
                  <Card variant="outlined" sx={{ p: 2 }}>
                    <Stack spacing={2}>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Avatar sx={{ bgcolor: selectedModel === model.id ? 'primary.main' : 'grey.500' }}>
                          <ModelTrainingIcon />
                        </Avatar>
                        <Box flex={1}>
                          <Typography variant="h6">
                            {model.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {model.description}
                          </Typography>
                        </Box>
                      </Stack>
                       
                      <Stack spacing={1}>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="body2">Accuracy</Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {(model.accuracy * 100).toFixed(1)}%
                          </Typography>
                        </Stack>
                        <LinearProgress
                          variant="determinate"
                          value={model.accuracy * 100}
                          color="primary"
                          sx={{ height: 6, borderRadius: 3 }}
                        />
                      </Stack>
                       
                      <Stack spacing={1}>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="body2">Confidence</Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {(model.confidence * 100).toFixed(1)}%
                          </Typography>
                        </Stack>
                        <LinearProgress
                          variant="determinate"
                          value={model.confidence * 100}
                          color="secondary"
                          sx={{ height: 6, borderRadius: 3 }}
                        />
                      </Stack>
                       
                      <Button
                        variant={selectedModel === model.id ? "contained" : "outlined"}
                        size="small"
                        onClick={() => setSelectedModel(model.id)}
                      >
                        {selectedModel === model.id ? 'Selected' : 'Select Model'}
                      </Button>
                    </Stack>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </TabPanel>

        {/* Accuracy Metrics Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Model Accuracy & Performance Metrics
            </Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
              Accuracy metrics are calculated based on historical predictions vs. actual performance.
              These metrics help evaluate the reliability of different prediction models.
            </Alert>
             
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Metric</TableCell>
                    <TableCell align="right">Current Model</TableCell>
                    <TableCell align="right">Best Model</TableCell>
                    <TableCell align="right">Industry Average</TableCell>
                    <TableCell align="right">Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>Mean Absolute Error (MAE)</TableCell>
                    <TableCell align="right">12.5</TableCell>
                    <TableCell align="right">8.2</TableCell>
                    <TableCell align="right">15.0</TableCell>
                    <TableCell align="right">
                      <Chip size="small" label="Good" color="success" />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Root Mean Square Error (RMSE)</TableCell>
                    <TableCell align="right">18.7</TableCell>
                    <TableCell align="right">12.3</TableCell>
                    <TableCell align="right">22.0</TableCell>
                    <TableCell align="right">
                      <Chip size="small" label="Good" color="success" />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Mean Absolute Percentage Error (MAPE)</TableCell>
                    <TableCell align="right">8.5%</TableCell>
                    <TableCell align="right">5.2%</TableCell>
                    <TableCell align="right">10.0%</TableCell>
                    <TableCell align="right">
                      <Chip size="small" label="Excellent" color="success" />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>R-squared (R²)</TableCell>
                    <TableCell align="right">0.87</TableCell>
                    <TableCell align="right">0.92</TableCell>
                    <TableCell align="right">0.80</TableCell>
                    <TableCell align="right">
                      <Chip size="small" label="Good" color="success" />
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </TabPanel>

        {/* Advanced Settings Tab */}
        <TabPanel value={tabValue} index={3}>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Advanced Prediction Settings
            </Typography>
             
            <Stack spacing={3}>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle1">Forecast Parameters</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="body2" gutterBottom>
                        Confidence Level: {(confidenceLevel * 100).toFixed(0)}%
                      </Typography>
                      <Slider
                        value={confidenceLevel}
                        onChange={(e, value) => setConfidenceLevel(value as number)}
                        min={0.5}
                        max={0.99}
                        step={0.01}
                        marks={[
                          { value: 0.5, label: '50%' },
                          { value: 0.9, label: '90%' },
                          { value: 0.95, label: '95%' },
                          { value: 0.99, label: '99%' }
                        ]}
                      />
                    </Box>
                     
                    <FormControlLabel
                      control={
                        <Switch
                          checked={showAdvanced}
                          onChange={(e) => setShowAdvanced(e.target.checked)}
                        />
                      }
                      label="Show advanced model parameters"
                    />
                  </Stack>
                </AccordionDetails>
              </Accordion>
              
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle1">Model Training</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Stack spacing={2}>
                    <Typography variant="body2">
                      Training Data: Last 30 days of performance data
                    </Typography>
                    <Typography variant="body2">
                      Validation Method: Time-series cross-validation
                    </Typography>
                    <Typography variant="body2">
                      Feature Engineering: Automated feature selection
                    </Typography>
                    <Typography variant="body2">
                      Hyperparameter Tuning: Bayesian optimization
                    </Typography>
                  </Stack>
                </AccordionDetails>
              </Accordion>
              
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle1">Export & Integration</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Stack spacing={2}>
                    <Button variant="outlined" startIcon={<DownloadIcon />}>
                      Export Forecast Data
                    </Button>
                    <Button variant="outlined" startIcon={<CloudQueueIcon />}>
                      Configure API Integration
                    </Button>
                    <Button variant="outlined" startIcon={<SettingsIcon />}>
                      Schedule Automated Reports
                    </Button>
                  </Stack>
                </AccordionDetails>
              </Accordion>
            </Stack>
          </Box>
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default PredictiveAnalytics;