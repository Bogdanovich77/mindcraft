/**
 * Custom Metrics Component
 * 
 * This component provides comprehensive custom metric creation and tracking capabilities including
 * metric formula builder, visualization options, threshold management, and alert configuration.
 * It features custom metric creation, editing, deletion, real-time monitoring, and historical
 * tracking. The component includes various metric types (calculated, aggregated, derived),
 * formula validation, and performance optimization.
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Menu,
  MenuList,
  MenuItem as MenuItemComponent,
  Slider,
  Rating,
  FormGroup,
  Checkbox,
  InputAdornment,
  OutlinedInput,
  FormHelperText
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Settings as SettingsIcon,
  PlayArrow as PlayArrowIcon,
  Stop as StopIcon,
  Refresh as RefreshIcon,
  Save as SaveIcon,
  Calculate as CalculateIcon,
  Functions as FunctionsIcon,
  Timeline as TimelineIcon,
  ShowChart as ShowChartIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  ScatterPlot as ScatterPlotIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Analytics as AnalyticsIcon,
  Assessment as AssessmentIcon,
  DataUsage as DataUsageIcon,
  Speed as SpeedIcon,
  Memory as MemoryIcon,
  Storage as StorageIcon,
  NetworkCheck as NetworkIcon,
  DeveloperBoard as CpuIcon,
  Timer as TimerIcon,
  Notifications as NotificationsIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  ExpandMore as ExpandMoreIcon,
  Code as CodeIcon,
  Science as ScienceIcon,
  Architecture as ArchitectureIcon,
  Dashboard as DashboardIcon,
  MonitorHeart as MonitorHeartIcon,
  QueryStats as QueryStatsIcon,
  TableChart as TableChartIcon,
  InsertChart as InsertChartIcon,
  AutoGraph as AutoGraphIcon,
  Leaderboard as LeaderboardIcon,
  Equalizer as EqualizerIcon,
  Tune as TuneIcon,
  Build as BuildIcon,
  Construction as ConstructionIcon,
  PrecisionManufacturing as PrecisionManufacturingIcon
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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ScatterChart,
  Scatter,
  ReferenceLine
} from 'recharts';

import type { TooltipProps } from 'recharts';

// Import performance selectors and actions
import {
  selectPerformanceMetrics,
  selectPerformanceLoading,
  selectPerformanceError,
  selectAllAgents,
  fetchPerformanceMetrics
} from '../../store';

// Import types
import type {
  CustomMetric,
  MetricFormula,
  MetricThreshold,
  MetricAlert,
  MetricVisualization,
  MetricType,
  MetricStatus,
  MetricAggregation
} from '../../types/performance';

interface CustomMetricsProps {
  agentId?: string;
  height?: string | number;
  showBuilder?: boolean;
  showVisualization?: boolean;
  showAlerts?: boolean;
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
      id={`metrics-tabpanel-${index}`}
      aria-labelledby={`metrics-tab-${index}`}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
};

interface MetricCardProps {
  metric: CustomMetric;
  onEdit?: (metric: CustomMetric) => void;
  onDelete?: (metric: CustomMetric) => void;
  onToggle?: (metric: CustomMetric) => void;
  onView?: (metric: CustomMetric) => void;
}

const MetricCard: React.FC<MetricCardProps> = ({
  metric,
  onEdit,
  onDelete,
  onToggle,
  onView
}) => {
  const getStatusColor = () => {
    switch (metric.status) {
      case 'active': return 'success';
      case 'inactive': return 'default';
      case 'error': return 'error';
      case 'warning': return 'warning';
      default: return 'default';
    }
  };

  const getStatusIcon = () => {
    switch (metric.status) {
      case 'active': return CheckCircleIcon;
      case 'inactive': return StopIcon;
      case 'error': return ErrorIcon;
      case 'warning': return WarningIcon;
      default: return InfoIcon;
    }
  };

  const getTypeIcon = () => {
    switch (metric.type) {
      case 'calculated': return CalculateIcon;
      case 'aggregated': return FunctionsIcon;
      case 'derived': showChartIcon;
      case 'composite': return ArchitectureIcon;
      default: showChartIcon;
    }
  };

  const statusColor = getStatusColor();
  const StatusIcon = getStatusIcon();
  const TypeIcon = getTypeIcon();

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Stack spacing={2}>
          {/* Header */}
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar sx={{ bgcolor: `${statusColor}.main` }}>
              <TypeIcon />
            </Avatar>
            <Box flex={1}>
              <Typography variant="h6" component="div" noWrap>
                {metric.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {metric.type} • {metric.unit}
              </Typography>
            </Box>
            <StatusIcon color={statusColor} />
          </Stack>

          {/* Current Value */}
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h3" component="div" fontWeight="bold" color={`${statusColor}.main`}>
              {metric.currentValue?.toFixed(2) || '0.00'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Current Value
            </Typography>
          </Box>

          {/* Formula */}
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Formula
            </Typography>
            <Paper variant="outlined" sx={{ p: 1, bgcolor: 'grey.50' }}>
              <Typography variant="caption" fontFamily="monospace">
                {metric.formula.expression}
              </Typography>
            </Paper>
          </Box>

          {/* Threshold */}
          {metric.threshold && (
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Threshold: {metric.threshold.value} {metric.unit}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={Math.min((metric.currentValue || 0) / metric.threshold.value * 100, 100)}
                color={statusColor}
                sx={{ height: 6, borderRadius: 3 }}
              />
            </Box>
          )}

          {/* Last Updated */}
          <Stack direction="row" alignItems="center" spacing={1}>
            <TimerIcon fontSize="small" />
            <Typography variant="caption" color="text.secondary">
              Updated: {new Date(metric.lastUpdated).toLocaleTimeString()}
            </Typography>
          </Stack>

          {/* Actions */}
          <Stack direction="row" spacing={1}>
            <Tooltip title="View">
              <IconButton size="small" onClick={() => onView?.(metric)}>
                <VisibilityIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Edit">
              <IconButton size="small" onClick={() => onEdit?.(metric)}>
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title={metric.status === 'active' ? 'Deactivate' : 'Activate'}>
              <IconButton size="small" onClick={() => onToggle?.(metric)}>
                {metric.status === 'active' ? <StopIcon /> : <PlayArrowIcon />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton size="small" onClick={() => onDelete?.(metric)}>
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

interface FormulaBuilderProps {
  formula: MetricFormula;
  onChange: (formula: MetricFormula) => void;
  availableMetrics: string[];
}

const FormulaBuilder: React.FC<FormulaBuilderProps> = ({
  formula,
  onChange,
  availableMetrics
}) => {
  const [expression, setExpression] = useState(formula.expression);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(formula.metrics);

  const operators = ['+', '-', '*', '/', '(', ')', '^', '%'];
  const functions = ['avg', 'sum', 'min', 'max', 'count', 'rate', 'delta', 'smooth'];

  const handleExpressionChange = (newExpression: string) => {
    setExpression(newExpression);
    onChange({
      ...formula,
      expression: newExpression,
      metrics: extractMetricsFromExpression(newExpression)
    });
  };

  const extractMetricsFromExpression = (expr: string): string[] => {
    // Simple extraction - in real implementation, this would be more sophisticated
    return availableMetrics.filter(metric => expr.includes(metric));
  };

  const addToExpression = (value: string) => {
    handleExpressionChange(expression + value);
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Formula Builder
      </Typography>
      
      {/* Expression Input */}
      <TextField
        fullWidth
        label="Expression"
        value={expression}
        onChange={(e) => handleExpressionChange(e.target.value)}
        placeholder="e.g., (cpu_usage + memory_usage) / 2"
        sx={{ mb: 2 }}
        InputProps={{
          startAdornment: <InputAdornment position="start">f(x) =</InputAdornment>,
          style: { fontFamily: 'monospace' }
        }}
      />

      {/* Available Metrics */}
      <Accordion sx={{ mb: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle2">Available Metrics</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={1}>
            {availableMetrics.map((metric) => (
              <Grid item key={metric}>
                <Chip
                  label={metric}
                  onClick={() => addToExpression(metric)}
                  clickable
                  size="small"
                />
              </Grid>
            ))}
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Operators */}
      <Accordion sx={{ mb: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle2">Operators</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={1}>
            {operators.map((operator) => (
              <Grid item key={operator}>
                <Chip
                  label={operator}
                  onClick={() => addToExpression(operator)}
                  clickable
                  size="small"
                  variant="outlined"
                />
              </Grid>
            ))}
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Functions */}
      <Accordion sx={{ mb: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle2">Functions</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={1}>
            {functions.map((func) => (
              <Grid item key={func}>
                <Chip
                  label={`${func}()`}
                  onClick={() => addToExpression(`${func}()`)}
                  clickable
                  size="small"
                  variant="outlined"
                />
              </Grid>
            ))}
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Formula Validation */}
      <Alert severity="info" sx={{ mb: 2 }}>
        <Typography variant="body2">
          Formula validation: {formula.valid ? 'Valid' : 'Invalid'}
        </Typography>
        {formula.error && (
          <Typography variant="caption" color="error">
            Error: {formula.error}
          </Typography>
        )}
      </Alert>
    </Box>
  );
};

const CustomMetrics: React.FC<CustomMetricsProps> = ({
  agentId,
  height = '100%',
  showBuilder = true,
  showVisualization = true,
  showAlerts = true
}) => {
  const dispatch = useDispatch();
  
  // Redux state
  const metrics = useSelector(selectPerformanceMetrics);
  const loading = useSelector(selectPerformanceLoading);
  const error = useSelector(selectPerformanceError);
  const availableAgents = useSelector(selectAllAgents);

  // Local state
  const [selectedAgent, setSelectedAgent] = useState<string>(agentId || '');
  const [tabValue, setTabValue] = useState<number>(0);
  const [customMetrics, setCustomMetrics] = useState<CustomMetric[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<CustomMetric | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState<boolean>(false);
  const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false);
  const [viewDialogOpen, setViewDialogOpen] = useState<boolean>(false);
  const [newMetric, setNewMetric] = useState<Partial<CustomMetric>>({});
  const [availableMetrics, setAvailableMetrics] = useState<string[]>([]);

  // Generate synthetic custom metrics data (in real implementation, this would come from metrics backend)
  const generateCustomMetricsData = useCallback((): CustomMetric[] => {
    const currentTime = Date.now();
    const types: MetricType[] = ['calculated', 'aggregated', 'derived', 'composite'];
    const statuses: MetricStatus[] = ['active', 'inactive', 'error', 'warning'];

    return [
      {
        id: 'metric_1',
        name: 'Performance Score',
        description: 'Composite performance score based on response time and throughput',
        type: 'composite',
        unit: 'score',
        status: 'active',
        currentValue: 85.5,
        previousValue: 82.3,
        lastUpdated: currentTime,
        formula: {
          expression: '(response_time_score + throughput_score) / 2',
          metrics: ['response_time_score', 'throughput_score'],
          valid: true,
          error: null
        },
        threshold: {
          value: 80,
          operator: '>',
          severity: 'warning',
          enabled: true
        },
        visualization: {
          type: 'line',
          color: '#8884d8',
          yAxis: 'left',
          showGrid: true
        },
        aggregation: 'average',
        refreshInterval: 30000,
        history: Array.from({ length: 50 }, (_, i) => ({
          timestamp: currentTime - (49 - i) * 60000,
          value: Math.random() * 20 + 75
        }))
      },
      {
        id: 'metric_2',
        name: 'Resource Efficiency',
        description: 'Efficiency ratio of resource utilization to performance output',
        type: 'calculated',
        unit: '%',
        status: 'active',
        currentValue: 72.8,
        previousValue: 75.2,
        lastUpdated: currentTime,
        formula: {
          expression: '(throughput / (cpu_usage + memory_usage)) * 100',
          metrics: ['throughput', 'cpu_usage', 'memory_usage'],
          valid: true,
          error: null
        },
        threshold: {
          value: 70,
          operator: '<',
          severity: 'critical',
          enabled: true
        },
        visualization: {
          type: 'area',
          color: '#82ca9d',
          yAxis: 'left',
          showGrid: true
        },
        aggregation: 'average',
        refreshInterval: 60000,
        history: Array.from({ length: 50 }, (_, i) => ({
          timestamp: currentTime - (49 - i) * 60000,
          value: Math.random() * 15 + 65
        }))
      },
      {
        id: 'metric_3',
        name: 'Error Rate Trend',
        description: 'Trend analysis of error rate over time',
        type: 'derived',
        unit: 'rate',
        status: 'warning',
        currentValue: 0.015,
        previousValue: 0.012,
        lastUpdated: currentTime,
        formula: {
          expression: 'rate(error_rate, 5m)',
          metrics: ['error_rate'],
          valid: true,
          error: null
        },
        threshold: {
          value: 0.02,
          operator: '>',
          severity: 'warning',
          enabled: true
        },
        visualization: {
          type: 'line',
          color: '#ff7300',
          yAxis: 'right',
          showGrid: false
        },
        aggregation: 'rate',
        refreshInterval: 30000,
        history: Array.from({ length: 50 }, (_, i) => ({
          timestamp: currentTime - (49 - i) * 60000,
          value: Math.random() * 0.01 + 0.005
        }))
      },
      {
        id: 'metric_4',
        name: 'Memory Pressure Index',
        description: 'Combined memory usage and availability indicator',
        type: 'aggregated',
        unit: 'index',
        status: 'active',
        currentValue: 0.65,
        previousValue: 0.58,
        lastUpdated: currentTime,
        formula: {
          expression: 'avg(memory_usage, memory_pressure)',
          metrics: ['memory_usage', 'memory_pressure'],
          valid: true,
          error: null
        },
        threshold: {
          value: 0.8,
          operator: '>',
          severity: 'critical',
          enabled: true
        },
        visualization: {
          type: 'bar',
          color: '#ff0000',
          yAxis: 'left',
          showGrid: true
        },
        aggregation: 'average',
        refreshInterval: 15000,
        history: Array.from({ length: 50 }, (_, i) => ({
          timestamp: currentTime - (49 - i) * 60000,
          value: Math.random() * 0.3 + 0.5
        }))
      }
    ];
  }, []);

  // Generate available metrics
  const generateAvailableMetrics = useCallback((): string[] => {
    return [
      'response_time',
      'throughput',
      'cpu_usage',
      'memory_usage',
      'disk_usage',
      'network_latency',
      'error_rate',
      'uptime',
      'cache_hit_rate',
      'queue_length',
      'active_connections',
      'request_rate',
      'response_time_score',
      'throughput_score',
      'memory_pressure'
    ];
  }, []);

  // Process chart data
  const metricsChartData = useMemo(() => {
    if (!customMetrics.length) return [];
    
    const activeMetrics = customMetrics.filter(m => m.status === 'active');
    if (activeMetrics.length === 0) return [];
    
    return activeMetrics[0].history.map((point, index) => {
      const dataPoint: any = {
        timestamp: new Date(point.timestamp).toLocaleTimeString(),
        [activeMetrics[0].name]: point.value
      };
      
      // Add other metrics
      activeMetrics.slice(1, 3).forEach((metric, i) => {
        if (metric.history[index]) {
          dataPoint[metric.name] = metric.history[index].value;
        }
      });
      
      return dataPoint;
    });
  }, [customMetrics]);

  // Fetch metrics data
  const fetchMetricsData = useCallback(() => {
    if (selectedAgent) {
      dispatch(fetchPerformanceMetrics({
        agentId: selectedAgent,
        timeRange: { 
          start: Date.now() - (24 * 60 * 60 * 1000), 
          end: Date.now(), 
          label: 'Last 24 Hours' 
        }
      }) as any);
    }
  }, [selectedAgent, dispatch]);

  // Initialize data
  useEffect(() => {
    if (selectedAgent) {
      setCustomMetrics(generateCustomMetricsData());
      setAvailableMetrics(generateAvailableMetrics());
    }
  }, [selectedAgent, generateCustomMetricsData, generateAvailableMetrics]);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Handle metric actions
  const handleCreateMetric = () => {
    const metric: CustomMetric = {
      id: `metric_${Date.now()}`,
      name: newMetric.name || 'New Metric',
      description: newMetric.description || '',
      type: newMetric.type || 'calculated',
      unit: newMetric.unit || 'value',
      status: 'inactive',
      currentValue: 0,
      previousValue: 0,
      lastUpdated: Date.now(),
      formula: newMetric.formula || {
        expression: '',
        metrics: [],
        valid: false,
        error: null
      },
      threshold: newMetric.threshold,
      visualization: newMetric.visualization || {
        type: 'line',
        color: '#8884d8',
        yAxis: 'left',
        showGrid: true
      },
      aggregation: newMetric.aggregation || 'average',
      refreshInterval: newMetric.refreshInterval || 30000,
      history: []
    };
    
    setCustomMetrics(prev => [...prev, metric]);
    setCreateDialogOpen(false);
    setNewMetric({});
  };

  const handleEditMetric = (metric: CustomMetric) => {
    setSelectedMetric(metric);
    setEditDialogOpen(true);
  };

  const handleUpdateMetric = () => {
    if (selectedMetric) {
      setCustomMetrics(prev => 
        prev.map(m => m.id === selectedMetric.id ? selectedMetric : m)
      );
      setEditDialogOpen(false);
      setSelectedMetric(null);
    }
  };

  const handleDeleteMetric = (metric: CustomMetric) => {
    setCustomMetrics(prev => prev.filter(m => m.id !== metric.id));
  };

  const handleToggleMetric = (metric: CustomMetric) => {
    setCustomMetrics(prev => 
      prev.map(m => m.id === metric.id ? 
        {...m, status: m.status === 'active' ? 'inactive' : 'active'} : m
      )
    );
  };

  const handleViewMetric = (metric: CustomMetric) => {
    setSelectedMetric(metric);
    setViewDialogOpen(true);
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchMetricsData();
    setCustomMetrics(generateCustomMetricsData());
  };

  // Custom tooltip for charts
  const CustomTooltip: React.FC<TooltipProps<number, string>> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Paper sx={{ p: 2 }}>
          <Typography variant="body2" gutterBottom>
            {label}
          </Typography>
          {payload.map((entry, index) => (
            <Typography key={index} variant="body2" color={entry.color}>
              {entry.name}: {entry.value?.toFixed(2)}
            </Typography>
          ))}
        </Paper>
      );
    }
    return null;
  };

  // Render loading state
  if (loading && !customMetrics.length) {
    return (
      <Box sx={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Stack spacing={2} alignItems="center">
          <CircularProgress size={60} />
          <Typography variant="h6" color="text.secondary">
            Loading custom metrics...
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
          Error loading custom metrics: {error}
        </Alert>
      </Box>
    );
  }

  // Render no data state
  if (!selectedAgent) {
    return (
      <Box sx={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
        <Alert severity="info">
          Please select an agent to manage custom metrics.
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
              <CalculateIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight="bold">
                Custom Metrics
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Create and track custom performance metrics with formulas and alerts
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
            
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setCreateDialogOpen(true)}
            >
              Create Metric
            </Button>
            
            <Tooltip title="Refresh">
              <IconButton onClick={handleRefresh} disabled={loading}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
      </Paper>

      {/* Main Content */}
      <Paper sx={{ borderRadius: 2, flex: 1, overflow: 'hidden' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Metrics" icon={<AnalyticsIcon />} />
          <Tab label="Builder" icon={<CalculateIcon />} />
          <Tab label="Visualization" icon={<BarChartIcon />} />
          <Tab label="Alerts" icon={<NotificationsIcon />} />
        </Tabs>

        {/* Metrics Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ p: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                Custom Metrics ({customMetrics.length})
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active: {customMetrics.filter(m => m.status === 'active').length}
              </Typography>
            </Stack>
            
            <Grid container spacing={2}>
              {customMetrics.map((metric) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={metric.id}>
                  <MetricCard
                    metric={metric}
                    onEdit={handleEditMetric}
                    onDelete={handleDeleteMetric}
                    onToggle={handleToggleMetric}
                    onView={handleViewMetric}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        </TabPanel>

        {/* Builder Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Formula Builder
            </Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
              Build custom metrics using mathematical formulas and available system metrics.
            </Alert>
            
            <FormulaBuilder
              formula={{
                expression: '',
                metrics: [],
                valid: false,
                error: null
              }}
              onChange={(formula) => console.log('Formula changed:', formula)}
              availableMetrics={availableMetrics}
            />
          </Box>
        </TabPanel>

        {/* Visualization Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Metrics Visualization
            </Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
              Real-time visualization of active custom metrics.
            </Alert>
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Live Metrics Chart
                </Typography>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={metricsChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" />
                    <YAxis />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Legend />
                    {customMetrics.filter(m => m.status === 'active').slice(0, 3).map((metric, index) => (
                      <Line
                        key={metric.id}
                        type="monotone"
                        dataKey={metric.name}
                        stroke={metric.visualization.color}
                        strokeWidth={2}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>

        {/* Alerts Tab */}
        <TabPanel value={tabValue} index={3}>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Metric Alerts
            </Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
              Configure threshold-based alerts for custom metrics.
            </Alert>
            
            <List>
              {customMetrics.filter(m => m.threshold?.enabled).map((metric) => (
                <ListItem key={metric.id} divider>
                  <ListItemIcon>
                    <NotificationsIcon color={metric.threshold?.severity === 'critical' ? 'error' : 'warning'} />
                  </ListItemIcon>
                  <ListItemText
                    primary={metric.name}
                    secondary={
                      <Stack spacing={1}>
                        <Typography variant="body2">
                          Threshold: {metric.threshold?.operator} {metric.threshold?.value} {metric.unit}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Current: {metric.currentValue?.toFixed(2)} {metric.unit}
                        </Typography>
                      </Stack>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={metric.threshold?.enabled || false}
                      onChange={(e) => {
                        setCustomMetrics(prev => 
                          prev.map(m => m.id === metric.id ? 
                            {...m, threshold: {...m.threshold!, enabled: e.target.checked}} : m
                          )
                        );
                      }}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Box>
        </TabPanel>
      </Paper>

      {/* Create Metric Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create Custom Metric</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Metric Name"
              value={newMetric.name || ''}
              onChange={(e) => setNewMetric(prev => ({...prev, name: e.target.value}))}
            />
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={2}
              value={newMetric.description || ''}
              onChange={(e) => setNewMetric(prev => ({...prev, description: e.target.value}))}
            />
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={newMetric.type || 'calculated'}
                label="Type"
                onChange={(e) => setNewMetric(prev => ({...prev, type: e.target.value as MetricType}))}
              >
                <MenuItem value="calculated">Calculated</MenuItem>
                <MenuItem value="aggregated">Aggregated</MenuItem>
                <MenuItem value="derived">Derived</MenuItem>
                <MenuItem value="composite">Composite</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Unit"
              value={newMetric.unit || ''}
              onChange={(e) => setNewMetric(prev => ({...prev, unit: e.target.value}))}
            />
            
            <FormulaBuilder
              formula={newMetric.formula || {
                expression: '',
                metrics: [],
                valid: false,
                error: null
              }}
              onChange={(formula) => setNewMetric(prev => ({...prev, formula}))}
              availableMetrics={availableMetrics}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateMetric} variant="contained">Create</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CustomMetrics;