/**
 * System Health Component
 * 
 * This component provides comprehensive system health monitoring including component status,
 * health indicators, diagnostic tools, and system reliability metrics. It features real-time health
 * monitoring, component dependency tracking, health score calculations, and automated diagnostics.
 * The component includes health trend analysis, failure prediction, and recovery recommendations.
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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import {
  HealthAndSafety as HealthIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  Timeline as TimelineIcon,
  Assessment as AssessmentIcon,
  BugReport as BugReportIcon,
  Build as BuildIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  Memory as MemoryIcon,
  Storage as StorageIcon,
  NetworkCheck as NetworkIcon,
  CloudDone as CloudIcon,
  DeveloperBoard as CpuIcon,
  ExpandMore as ExpandMoreIcon,
  PlayArrow as PlayArrowIcon,
  Stop as StopIcon,
  RestartAlt as RestartIcon,
  Healing as HealingIcon,
  Verified as VerifiedIcon,
  GppGood as GppGoodIcon,
  GppMaybe as GppMaybeIcon,
  GppBad as GppBadIcon,
  Update as UpdateIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Analytics as AnalyticsIcon,
  MonitorHeart as MonitorHeartIcon,
  MedicalServices as MedicalServicesIcon,
  Troubleshoot as TroubleshootIcon,
  ReportProblem as ReportProblemIcon,
  SystemUpdate as SystemUpdateIcon,
  SecurityUpdateGood as SecurityUpdateIcon,
  Upgrade as UpgradeIcon,
  Troubleshoot as DiagnosticIcon
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
  TooltipProps
} from 'recharts';

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
  SystemHealth,
  ComponentHealth,
  HealthStatus,
  DiagnosticData,
  HealthTrend,
  HealthAlert,
  HealthRecommendation
} from '../../types/performance';

interface SystemHealthProps {
  agentId?: string;
  height?: string | number;
  showRealTime?: boolean;
  showDiagnostics?: boolean;
  showRecommendations?: boolean;
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
      id={`health-tabpanel-${index}`}
      aria-labelledby={`health-tab-${index}`}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
};

interface HealthScoreCardProps {
  title: string;
  score: number;
  status: HealthStatus;
  trend: 'up' | 'down' | 'stable';
  icon: React.ElementType;
  description: string;
  lastChecked: string;
}

const HealthScoreCard: React.FC<HealthScoreCardProps> = ({
  title,
  score,
  status,
  trend,
  icon: Icon,
  description,
  lastChecked
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'healthy': return 'success';
      case 'warning': return 'warning';
      case 'critical': return 'error';
      case 'degraded': return 'info';
      case 'unknown': return 'default';
      default: return 'default';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'healthy': return CheckCircleIcon;
      case 'warning': return WarningIcon;
      case 'critical': return ErrorIcon;
      case 'degraded': return InfoIcon;
      case 'unknown': return InfoIcon;
      default: return InfoIcon;
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return TrendingUpIcon;
      case 'down': return TrendingDownIcon;
      case 'stable': return TimelineIcon;
      default: return TimelineIcon;
    }
  };

  const statusColor = getStatusColor();
  const StatusIcon = getStatusIcon();
  const TrendIcon = getTrendIcon();

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Stack spacing={2}>
          {/* Header */}
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar sx={{ bgcolor: `${statusColor}.main` }}>
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
            <StatusIcon color={statusColor} />
          </Stack>

          {/* Health Score */}
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h3" component="div" fontWeight="bold" color={`${statusColor}.main`}>
              {score}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Health Score
            </Typography>
          </Box>

          {/* Progress Bar */}
          <Box>
            <LinearProgress
              variant="determinate"
              value={score}
              color={statusColor}
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>

          {/* Trend */}
          <Stack direction="row" alignItems="center" spacing={1}>
            <TrendIcon />
            <Typography variant="body2" color="text.secondary">
              Trend: {trend}
            </Typography>
          </Stack>

          {/* Last Checked */}
          <Stack direction="row" alignItems="center" spacing={1}>
            <ScheduleIcon fontSize="small" />
            <Typography variant="caption" color="text.secondary">
              Last checked: {lastChecked}
            </Typography>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

interface ComponentHealthCardProps {
  component: ComponentHealth;
  onAction?: (componentId: string, action: string) => void;
}

const ComponentHealthCard: React.FC<ComponentHealthCardProps> = ({ component, onAction }) => {
  const getStatusColor = () => {
    switch (component.status) {
      case 'healthy': return 'success';
      case 'warning': return 'warning';
      case 'critical': return 'error';
      case 'degraded': return 'info';
      case 'unknown': return 'default';
      default: return 'default';
    }
  };

  const getStatusIcon = () => {
    switch (component.status) {
      case 'healthy': return CheckCircleIcon;
      case 'warning': return WarningIcon;
      case 'critical': return ErrorIcon;
      case 'degraded': return InfoIcon;
      case 'unknown': return InfoIcon;
      default: return InfoIcon;
    }
  };

  const statusColor = getStatusColor();
  const StatusIcon = getStatusIcon();

  return (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent>
        <Stack spacing={2}>
          {/* Component Header */}
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar sx={{ bgcolor: `${statusColor}.main` }}>
              <StatusIcon />
            </Avatar>
            <Box flex={1}>
              <Typography variant="h6" component="div">
                {component.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {component.type} • Version {component.version}
              </Typography>
            </Box>
            <Chip 
              label={component.status} 
              color={statusColor}
              size="small"
            />
          </Stack>

          {/* Health Metrics */}
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Response Time
              </Typography>
              <Typography variant="h6">
                {component.responseTime}ms
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Uptime
              </Typography>
              <Typography variant="h6">
                {component.uptime}%
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Error Rate
              </Typography>
              <Typography variant="h6">
                {component.errorRate}%
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Last Check
              </Typography>
              <Typography variant="h6">
                {new Date(component.lastCheck).toLocaleTimeString()}
              </Typography>
            </Grid>
          </Grid>

          {/* Dependencies */}
          {component.dependencies && component.dependencies.length > 0 && (
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Dependencies
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {component.dependencies.map((dep) => (
                  <Chip
                    key={dep}
                    label={dep}
                    size="small"
                    variant="outlined"
                  />
                ))}
              </Stack>
            </Box>
          )}

          {/* Actions */}
          <Stack direction="row" spacing={1}>
            {component.status !== 'healthy' && (
              <Button
                size="small"
                variant="outlined"
                startIcon={<HealingIcon />}
                onClick={() => onAction?.(component.id, 'heal')}
              >
                Heal
              </Button>
            )}
            <Button
              size="small"
              variant="outlined"
              startIcon={<RestartIcon />}
              onClick={() => onAction?.(component.id, 'restart')}
            >
              Restart
            </Button>
            <Button
              size="small"
              variant="outlined"
              startIcon={<DiagnosticIcon />}
              onClick={() => onAction?.(component.id, 'diagnose')}
            >
              Diagnose
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

const SystemHealth: React.FC<SystemHealthProps> = ({
  agentId,
  height = '100%',
  showRealTime = true,
  showDiagnostics = true,
  showRecommendations = true
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
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [healthTrend, setHealthTrend] = useState<HealthTrend | null>(null);
  const [diagnosticResults, setDiagnosticResults] = useState<DiagnosticData[]>([]);
  const [healthAlerts, setHealthAlerts] = useState<HealthAlert[]>([]);
  const [recommendations, setRecommendations] = useState<HealthRecommendation[]>([]);
  const [refreshInterval, setRefreshInterval] = useState<number>(10000);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [diagnosticDialogOpen, setDiagnosticDialogOpen] = useState<boolean>(false);
  const [diagnosticStep, setDiagnosticStep] = useState<number>(0);
  const [diagnosticRunning, setDiagnosticRunning] = useState<boolean>(false);

  // Generate synthetic system health data (in real implementation, this would come from monitoring backend)
  const generateSystemHealthData = useCallback((): SystemHealth => {
    const currentTime = Date.now();
    
    // Generate component health data
    const components: ComponentHealth[] = [
      {
        id: 'langgraph_core',
        name: 'LangGraph Core',
        type: 'core',
        status: 'healthy',
        healthScore: 95,
        responseTime: 45,
        uptime: 99.9,
        errorRate: 0.1,
        lastCheck: currentTime,
        version: '2.1.0',
        dependencies: ['memory_system', 'goal_system'],
        metrics: {
          throughput: 1250,
          latency: 45,
          availability: 99.9
        }
      },
      {
        id: 'memory_system',
        name: 'Memory System',
        type: 'memory',
        status: 'warning',
        healthScore: 78,
        responseTime: 120,
        uptime: 98.5,
        errorRate: 1.5,
        lastCheck: currentTime,
        version: '2.0.1',
        dependencies: ['langgraph_core'],
        metrics: {
          throughput: 850,
          latency: 120,
          availability: 98.5
        }
      },
      {
        id: 'goal_system',
        name: 'Goal System',
        type: 'planning',
        status: 'healthy',
        healthScore: 88,
        responseTime: 65,
        uptime: 99.2,
        errorRate: 0.8,
        lastCheck: currentTime,
        version: '2.0.0',
        dependencies: ['langgraph_core', 'memory_system'],
        metrics: {
          throughput: 920,
          latency: 65,
          availability: 99.2
        }
      },
      {
        id: 'reactive_layer',
        name: 'Reactive Layer',
        type: 'reactive',
        status: 'healthy',
        healthScore: 92,
        responseTime: 25,
        uptime: 99.8,
        errorRate: 0.2,
        lastCheck: currentTime,
        version: '1.9.0',
        dependencies: ['langgraph_core'],
        metrics: {
          throughput: 2000,
          latency: 25,
          availability: 99.8
        }
      },
      {
        id: 'skills_system',
        name: 'Skills System',
        type: 'learning',
        status: 'degraded',
        healthScore: 65,
        responseTime: 180,
        uptime: 96.5,
        errorRate: 3.5,
        lastCheck: currentTime,
        version: '2.0.0',
        dependencies: ['memory_system', 'learning_engine'],
        metrics: {
          throughput: 450,
          latency: 180,
          availability: 96.5
        }
      }
    ];

    // Calculate overall health score
    const overallScore = Math.round(
      components.reduce((sum, comp) => sum + comp.healthScore, 0) / components.length
    );

    // Determine overall status
    let overallStatus: HealthStatus = 'healthy';
    if (overallScore < 50) overallStatus = 'critical';
    else if (overallScore < 70) overallStatus = 'degraded';
    else if (overallScore < 85) overallStatus = 'warning';

    return {
      agentId: selectedAgent,
      timestamp: currentTime,
      overall: {
        status: overallStatus,
        score: overallScore,
        uptime: 98.7,
        lastCheck: currentTime,
        issues: components.filter(c => c.status !== 'healthy').length,
        warnings: components.filter(c => c.status === 'warning').length,
        critical: components.filter(c => c.status === 'critical').length
      },
      components,
      alerts: [],
      diagnostics: [],
      recommendations: []
    };
  }, [selectedAgent]);

  // Generate health trend data
  const generateHealthTrendData = useCallback((): HealthTrend => {
    const currentTime = Date.now();
    const trendData = Array.from({ length: 24 }, (_, index) => ({
      timestamp: currentTime - (23 - index) * 60 * 60 * 1000,
      score: Math.random() * 20 + 75,
      status: 'healthy' as HealthStatus,
      issues: Math.floor(Math.random() * 3)
    }));

    return {
      metric: 'overall_health',
      timeRange: '24h',
      data: trendData,
      forecast: Array.from({ length: 6 }, (_, index) => ({
        timestamp: currentTime + (index + 1) * 60 * 60 * 1000,
        score: Math.random() * 15 + 80,
        confidence: 0.85 - index * 0.05
      })),
      trend: 'stable'
    };
  }, []);

  // Generate diagnostic results
  const generateDiagnosticResults = useCallback((): DiagnosticData[] => {
    return [
      {
        id: 'memory_leak_check',
        name: 'Memory Leak Detection',
        status: 'passed',
        severity: 'low',
        description: 'No memory leaks detected in the current session',
        details: {
          totalMemoryUsage: '2.3GB',
          peakMemoryUsage: '2.8GB',
          memoryGrowthRate: '0.1MB/hour',
          gcFrequency: '12/hour'
        },
        recommendations: [
          'Continue monitoring memory usage patterns',
          'Consider increasing memory allocation for peak loads'
        ],
        timestamp: Date.now(),
        duration: 2500
      },
      {
        id: 'performance_bottleneck',
        name: 'Performance Bottleneck Analysis',
        status: 'warning',
        severity: 'medium',
        description: 'Performance bottlenecks detected in skills system',
        details: {
          bottlenecks: ['skills_system.processExperience', 'memory_system.consolidation'],
          averageResponseTime: '180ms',
          peakResponseTime: '450ms',
          impact: 'degraded user experience'
        },
        recommendations: [
          'Optimize skill processing algorithms',
          'Implement caching for frequently accessed skills',
          'Consider async processing for skill updates'
        ],
        timestamp: Date.now() - 5000,
        duration: 3200
      },
      {
        id: 'network_connectivity',
        name: 'Network Connectivity Check',
        status: 'passed',
        severity: 'low',
        description: 'All network connections are functioning properly',
        details: {
          connections: 12,
          failedConnections: 0,
          averageLatency: '45ms',
          packetLoss: '0.1%'
        },
        recommendations: [
          'Maintain current network configuration',
          'Monitor for connection spikes during peak usage'
        ],
        timestamp: Date.now() - 10000,
        duration: 1500
      }
    ];
  }, []);

  // Generate health alerts
  const generateHealthAlerts = useCallback((): HealthAlert[] => {
    const alerts: HealthAlert[] = [];
    const currentTime = Date.now();
    
    alerts.push({
      id: 'skills_system_degraded',
      type: 'component',
      severity: 'warning',
      title: 'Skills System Performance Degraded',
      message: 'Skills system showing increased response times and error rates',
      component: 'skills_system',
      timestamp: currentTime - 300000,
      acknowledged: false,
      resolved: false
    });

    alerts.push({
      id: 'memory_usage_warning',
      type: 'resource',
      severity: 'warning',
      title: 'Memory Usage Approaching Limit',
      message: 'Memory usage is at 78% of allocated capacity',
      component: 'memory_system',
      timestamp: currentTime - 600000,
      acknowledged: true,
      resolved: false
    });

    return alerts;
  }, []);

  // Generate health recommendations
  const generateHealthRecommendations = useCallback((): HealthRecommendation[] => {
    return [
      {
        id: 'optimize_skills_system',
        type: 'performance',
        priority: 'high',
        title: 'Optimize Skills System Performance',
        description: 'Skills system is showing performance degradation. Consider optimizing algorithms and implementing caching.',
        impact: 'high',
        effort: 'medium',
        estimatedImprovement: '35%',
        steps: [
          'Review skill processing algorithms',
          'Implement caching for frequently accessed skills',
          'Consider async processing for skill updates',
          'Monitor performance after optimizations'
        ]
      },
      {
        id: 'increase_memory_allocation',
        type: 'resource',
        priority: 'medium',
        title: 'Increase Memory Allocation',
        description: 'Memory usage is approaching 80% capacity. Consider increasing allocation or optimizing memory usage.',
        impact: 'medium',
        effort: 'low',
        estimatedImprovement: '20%',
        steps: [
          'Analyze memory usage patterns',
          'Increase memory allocation if needed',
          'Implement memory optimization strategies',
          'Set up memory usage alerts'
        ]
      },
      {
        id: 'implement_health_monitoring',
        type: 'monitoring',
        priority: 'low',
        title: 'Enhanced Health Monitoring',
        description: 'Implement more comprehensive health monitoring with predictive analytics.',
        impact: 'medium',
        effort: 'high',
        estimatedImprovement: '25%',
        steps: [
          'Set up comprehensive health monitoring',
          'Implement predictive analytics',
          'Create automated health reports',
          'Set up proactive alerting system'
        ]
      }
    ];
  }, []);

  // Process chart data
  const healthTrendChartData = useMemo(() => {
    if (!healthTrend) return [];
    return healthTrend.data.map((point) => ({
      time: new Date(point.timestamp).toLocaleTimeString(),
      score: point.score,
      issues: point.issues
    }));
  }, [healthTrend]);

  const componentHealthRadarData = useMemo(() => {
    if (!systemHealth) return [];
    return systemHealth.components.map((component) => ({
      component: component.name,
      health: component.healthScore,
      performance: 100 - component.responseTime,
      reliability: component.uptime
    }));
  }, [systemHealth]);

  // Fetch health data
  const fetchHealthData = useCallback(() => {
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
      setSystemHealth(generateSystemHealthData());
      setHealthTrend(generateHealthTrendData());
      setDiagnosticResults(generateDiagnosticResults());
      setHealthAlerts(generateHealthAlerts());
      setRecommendations(generateHealthRecommendations());
    }
  }, [selectedAgent, generateSystemHealthData, generateHealthTrendData, generateDiagnosticResults, generateHealthAlerts, generateHealthRecommendations]);

  // Auto-refresh effect
  useEffect(() => {
    if (autoRefresh && selectedAgent) {
      const interval = setInterval(() => {
        setSystemHealth(generateSystemHealthData());
        setHealthTrend(generateHealthTrendData());
        setHealthAlerts(generateHealthAlerts());
      }, refreshInterval);
      
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, selectedAgent, generateSystemHealthData, generateHealthTrendData, generateHealthAlerts]);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Handle component action
  const handleComponentAction = (componentId: string, action: string) => {
    console.log(`Component action: ${componentId} - ${action}`);
    // In real implementation, this would trigger the action via API
  };

  // Handle diagnostic run
  const handleRunDiagnostic = () => {
    setDiagnosticRunning(true);
    setDiagnosticStep(0);
    setDiagnosticDialogOpen(true);
    
    // Simulate diagnostic steps
    const steps = [
      'Initializing diagnostic system...',
      'Checking component connectivity...',
      'Analyzing performance metrics...',
      'Scanning for errors and warnings...',
      'Generating recommendations...',
      'Diagnostic complete!'
    ];
    
    steps.forEach((step, index) => {
      setTimeout(() => {
        setDiagnosticStep(index);
        if (index === steps.length - 1) {
          setDiagnosticRunning(false);
          setDiagnosticResults(generateDiagnosticResults());
        }
      }, (index + 1) * 1000);
    });
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchHealthData();
    setSystemHealth(generateSystemHealthData());
    setHealthTrend(generateHealthTrendData());
    setDiagnosticResults(generateDiagnosticResults());
    setHealthAlerts(generateHealthAlerts());
    setRecommendations(generateHealthRecommendations());
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
  if (loading && !systemHealth) {
    return (
      <Box sx={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Stack spacing={2} alignItems="center">
          <CircularProgress size={60} />
          <Typography variant="h6" color="text.secondary">
            Loading system health...
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
          Error loading system health data: {error}
        </Alert>
      </Box>
    );
  }

  // Render no data state
  if (!selectedAgent) {
    return (
      <Box sx={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
        <Alert severity="info">
          Please select an agent to monitor system health.
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
            <Avatar sx={{ bgcolor: 'success.main' }}>
              <HealthIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight="bold">
                System Health
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Comprehensive monitoring of system components and health metrics
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
            
            <FormControlLabel
              control={
                <Switch
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  size="small"
                />
              }
              label="Auto Refresh"
            />
            
            <Button
              variant="contained"
              startIcon={<DiagnosticIcon />}
              onClick={handleRunDiagnostic}
              disabled={diagnosticRunning}
            >
              Run Diagnostic
            </Button>
            
            <Tooltip title="Refresh">
              <IconButton onClick={handleRefresh} disabled={loading}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
      </Paper>

      {/* Health Score Overview */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <HealthScoreCard
            title="Overall Health"
            score={systemHealth?.overall.score || 0}
            status={systemHealth?.overall.status || 'unknown'}
            trend="stable"
            icon={HealthIcon}
            description="System-wide health status"
            lastChecked={new Date(systemHealth?.overall.lastCheck || Date.now()).toLocaleTimeString()}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <HealthScoreCard
            title="Performance"
            score={85}
            status="healthy"
            trend="up"
            icon={SpeedIcon}
            description="Response time and throughput"
            lastChecked="2 min ago"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <HealthScoreCard
            title="Reliability"
            score={92}
            status="healthy"
            trend="stable"
            icon={VerifiedIcon}
            description="Uptime and error rates"
            lastChecked="1 min ago"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <HealthScoreCard
            title="Security"
            score={88}
            status="healthy"
            trend="up"
            icon={SecurityIcon}
            description="Security status and vulnerabilities"
            lastChecked="5 min ago"
          />
        </Grid>
      </Grid>

      {/* Active Alerts */}
      {healthAlerts.length > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Active Health Alerts ({healthAlerts.length})
          </Typography>
          <Stack spacing={1}>
            {healthAlerts.map((alert) => (
              <Typography key={alert.id} variant="body2">
                • {alert.title}: {alert.message}
              </Typography>
            ))}
          </Stack>
        </Alert>
      )}

      {/* Main Content */}
      <Paper sx={{ borderRadius: 2, flex: 1, overflow: 'hidden' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Components" icon={<AssessmentIcon />} />
          <Tab label="Trends" icon={<TimelineIcon />} />
          <Tab label="Diagnostics" icon={<BugReportIcon />} />
          <Tab label="Recommendations" icon={<HealingIcon />} />
        </Tabs>

        {/* Components Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Component Health Status
            </Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
              Detailed health status of all system components. Click on actions to perform healing operations.
            </Alert>
            
            <Grid container spacing={2}>
              {systemHealth?.components.map((component) => (
                <Grid item xs={12} md={6} lg={4} key={component.id}>
                  <ComponentHealthCard
                    component={component}
                    onAction={handleComponentAction}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        </TabPanel>

        {/* Trends Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Health Trend Analysis
            </Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
              Historical health trends and predictive analytics for system performance.
            </Alert>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={8}>
                <Typography variant="subtitle1" gutterBottom>
                  24-Hour Health Trend
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={healthTrendChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line type="monotone" dataKey="score" stroke="#8884d8" strokeWidth={2} name="Health Score" />
                  </LineChart>
                </ResponsiveContainer>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle1" gutterBottom>
                  Component Health Radar
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={componentHealthRadarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="component" />
                    <PolarRadiusAxis />
                    <Radar name="Health" dataKey="health" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                    <Radar name="Performance" dataKey="performance" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>

        {/* Diagnostics Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Diagnostic Results
            </Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
              Recent diagnostic tests and their results. Run comprehensive diagnostics to identify issues.
            </Alert>
            
            <List>
              {diagnosticResults.map((result) => (
                <ListItem key={result.id} divider>
                  <ListItemIcon>
                    {result.status === 'passed' ? (
                      <CheckCircleIcon color="success" />
                    ) : result.status === 'warning' ? (
                      <WarningIcon color="warning" />
                    ) : (
                      <ErrorIcon color="error" />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={result.name}
                    secondary={
                      <Stack spacing={1}>
                        <Typography variant="body2">
                          {result.description}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Duration: {result.duration}ms • Severity: {result.severity}
                        </Typography>
                        {result.recommendations.length > 0 && (
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Recommendations:
                            </Typography>
                            {result.recommendations.map((rec, index) => (
                              <Typography key={index} variant="caption" display="block">
                                • {rec}
                              </Typography>
                            ))}
                          </Box>
                        )}
                      </Stack>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Button variant="outlined" size="small">
                      View Details
                    </Button>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Box>
        </TabPanel>

        {/* Recommendations Tab */}
        <TabPanel value={tabValue} index={3}>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Health Improvement Recommendations
            </Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
              Personalized recommendations to improve system health and performance based on current analysis.
            </Alert>
            
            {recommendations.length > 0 ? (
              <List>
                {recommendations.map((rec) => (
                  <ListItem key={rec.id} divider>
                    <ListItemIcon>
                      <HealingIcon color={rec.priority === 'high' ? 'error' : 
                                       rec.priority === 'medium' ? 'warning' : 'info'} />
                    </ListItemIcon>
                    <ListItemText
                      primary={rec.title}
                      secondary={
                        <Stack spacing={1}>
                          <Typography variant="body2">
                            {rec.description}
                          </Typography>
                          <Stack direction="row" spacing={2}>
                            <Chip size="small" label={`Priority: ${rec.priority}`} />
                            <Chip size="small" label={`Impact: ${rec.impact}`} />
                            <Chip size="small" label={`Effort: ${rec.effort}`} />
                            <Chip size="small" label={`Improvement: ${rec.estimatedImprovement}`} />
                          </Stack>
                          <Accordion>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                              <Typography variant="caption">Implementation Steps</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                              <List dense>
                                {rec.steps.map((step, index) => (
                                  <ListItem key={index}>
                                    <ListItemText primary={`${index + 1}. ${step}`} />
                                  </ListItem>
                                ))}
                              </List>
                            </AccordionDetails>
                          </Accordion>
                        </Stack>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Button variant="outlined" size="small">
                        Apply
                      </Button>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                No health recommendations at this time. System is operating optimally.
              </Typography>
            )}
          </Box>
        </TabPanel>
      </Paper>

      {/* Diagnostic Dialog */}
      <Dialog open={diagnosticDialogOpen} onClose={() => setDiagnosticDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Running System Diagnostics</DialogTitle>
        <DialogContent>
          <Stepper activeStep={diagnosticStep} alternativeLabel>
            {[
              'Initializing',
              'Connectivity Check',
              'Performance Analysis',
              'Error Scan',
              'Generating Results',
              'Complete'
            ].map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            {diagnosticRunning ? (
              <Stack spacing={2} alignItems="center">
                <CircularProgress size={60} />
                <Typography variant="body1">
                  Running diagnostic tests...
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  This may take a few moments to complete.
                </Typography>
              </Stack>
            ) : (
              <Stack spacing={2}>
                <CheckCircleIcon color="success" sx={{ fontSize: 60 }} />
                <Typography variant="body1">
                  Diagnostic completed successfully!
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {diagnosticResults.length} tests completed
                </Typography>
              </Stack>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDiagnosticDialogOpen(false)} disabled={diagnosticRunning}>
            Close
          </Button>
          {!diagnosticRunning && (
            <Button onClick={handleRunDiagnostic} variant="contained">
              Run Again
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SystemHealth;