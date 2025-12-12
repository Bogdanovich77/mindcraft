/**
 * Resource Utilization Component
 * 
 * This component provides comprehensive resource utilization monitoring including
 * CPU, memory, network, disk, and GPU usage tracking. It features real-time monitoring,
 * historical trend analysis, resource optimization recommendations, and capacity planning.
 * The component includes interactive visualizations, alert thresholds, and detailed metrics.
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
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction
} from '@mui/material';
import {
  Memory as MemoryIcon,
  Speed as SpeedIcon,
  Storage as StorageIcon,
  NetworkCheck as NetworkIcon,
  DeveloperBoard as CpuIcon,
  SettingsEthernet as EthernetIcon,
  SdStorage as DiskIcon,
  ShowChart as ChartIcon,
  Timeline as TimelineIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  ExpandMore as ExpandMoreIcon,
  Assessment as AssessmentIcon,
  Analytics as AnalyticsIcon,
  CloudQueue as CloudIcon,
  Computer as ComputerIcon,
  Router as RouterIcon,
  Dns as DnsIcon,
  DataUsage as DataUsageIcon,
  Storage as StorageIconAlt,
  Memory as MemoryIconAlt,
  SettingsSystemDaydream as SystemIcon
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
  ReferenceLine
} from 'recharts';

// Import types separately to avoid Vite bundling issues
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
  PerformanceMetrics,
  ResourceUtilization,
  ResourceMetrics,
  ResourceAlert,
  ResourceRecommendation
} from '../../types/performance';

interface ResourceUtilizationProps {
  agentId?: string;
  height?: string | number;
  showRealTime?: boolean;
  showHistorical?: boolean;
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
      id={`resource-tabpanel-${index}`}
      aria-labelledby={`resource-tab-${index}`}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
};

interface ResourceCardProps {
  title: string;
  value: number;
  unit: string;
  icon: React.ElementType;
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  threshold: number;
  trend: 'up' | 'down' | 'stable';
  history: number[];
  showChart?: boolean;
}

const ResourceCard: React.FC<ResourceCardProps> = ({
  title,
  value,
  unit,
  icon: Icon,
  color,
  threshold,
  trend,
  history,
  showChart = true
}) => {
  const getStatusColor = () => {
    if (value >= threshold * 0.9) return 'error';
    if (value >= threshold * 0.7) return 'warning';
    return 'success';
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return TrendingUpIcon;
      case 'down': return TrendingDownIcon;
      case 'stable': return TimelineIcon;
      default: return TimelineIcon;
    }
  };

  const formatValue = (val: number, unit: string) => {
    if (unit === '%') return `${val.toFixed(1)}%`;
    if (unit === 'GB') return `${val.toFixed(2)}GB`;
    if (unit === 'MB') return `${val.toFixed(0)}MB`;
    if (unit === 'Mbps') return `${val.toFixed(1)}Mbps`;
    return val.toFixed(2);
  };

  const statusColor = getStatusColor();
  const TrendIcon = getTrendIcon();

  // Mini chart data
  const chartData = history.slice(-20).map((val, index) => ({
    time: index,
    value: val
  }));

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
                Current utilization
              </Typography>
            </Box>
            <Badge color={statusColor} badgeContent={<TrendIcon />}>
              <Box />
            </Badge>
          </Stack>

          {/* Current Value */}
          <Typography variant="h4" component="div" fontWeight="bold" color={`${statusColor}.main`}>
            {formatValue(value, unit)}
          </Typography>

          {/* Progress Bar */}
          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="body2" color="text.secondary">
                Usage
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Threshold: {formatValue(threshold, unit)}
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={Math.min(value, 100)}
              color={statusColor}
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>

          {/* Mini Chart */}
          {showChart && history.length > 0 && (
            <Box sx={{ height: 60 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={`${color}.main`}
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          )}

          {/* Status */}
          <Stack direction="row" alignItems="center" spacing={1}>
            <CheckCircleIcon color={statusColor} />
            <Typography variant="body2" color={`${statusColor}.main`}>
              {value >= threshold * 0.9 ? 'Critical' : 
               value >= threshold * 0.7 ? 'Warning' : 'Normal'}
            </Typography>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

const ResourceUtilization: React.FC<ResourceUtilizationProps> = ({
  agentId,
  height = '100%',
  showRealTime = true,
  showHistorical = true,
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
  const [resourceData, setResourceData] = useState<ResourceUtilization | null>(null);
  const [alerts, setAlerts] = useState<ResourceAlert[]>([]);
  const [recommendations, setRecommendations] = useState<ResourceRecommendation[]>([]);
  const [timeRange, setTimeRange] = useState<string>('1h');
  const [refreshInterval, setRefreshInterval] = useState<number>(5000);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);

  // Generate synthetic resource data (in real implementation, this would come from monitoring backend)
  const generateResourceData = useCallback((): ResourceUtilization => {
    const currentTime = Date.now();
    
    return {
      agentId: selectedAgent,
      timestamp: currentTime,
      cpu: {
        usage: Math.random() * 40 + 30, // 30-70%
        cores: 8,
        frequency: 2.4,
        temperature: Math.random() * 20 + 50, // 50-70°C
        processes: Math.floor(Math.random() * 50) + 100,
        loadAverage: [Math.random() * 2 + 1, Math.random() * 2 + 1, Math.random() * 2 + 1],
        history: Array.from({ length: 100 }, () => Math.random() * 40 + 30)
      },
      memory: {
        usage: Math.random() * 30 + 40, // 40-70%
        total: 16, // GB
        available: 8,
        used: 8,
        cached: 2,
        buffers: 1,
        swap: {
          total: 8,
          used: Math.random() * 2,
          free: 6
        },
        history: Array.from({ length: 100 }, () => Math.random() * 30 + 40)
      },
      network: {
        upload: Math.random() * 10 + 5, // Mbps
        download: Math.random() * 50 + 20, // Mbps
        latency: Math.random() * 50 + 10, // ms
        packetLoss: Math.random() * 2, // %
        bandwidth: {
          total: 1000,
          used: Math.random() * 200 + 100,
          available: 700
        },
        connections: {
          active: Math.floor(Math.random() * 50) + 20,
          total: Math.floor(Math.random() * 100) + 50,
          failed: Math.floor(Math.random() * 5)
        },
        history: Array.from({ length: 100 }, () => Math.random() * 50 + 20)
      },
      disk: {
        usage: Math.random() * 20 + 60, // 60-80%
        total: 500, // GB
        used: 350,
        free: 150,
        readSpeed: Math.random() * 100 + 200, // MB/s
        writeSpeed: Math.random() * 80 + 150, // MB/s
        iops: Math.floor(Math.random() * 1000) + 2000,
        partitions: [
          { name: '/', size: 200, used: 150, free: 50 },
          { name: '/home', size: 200, used: 120, free: 80 },
          { name: '/var', size: 100, used: 80, free: 20 }
        ],
        history: Array.from({ length: 100 }, () => Math.random() * 20 + 60)
      },
      gpu: {
        usage: Math.random() * 30 + 20, // 20-50%
        memory: {
          total: 8,
          used: Math.random() * 4 + 2,
          free: 4
        },
        temperature: Math.random() * 15 + 65, // 65-80°C
        powerUsage: Math.random() * 100 + 150, // Watts
        history: Array.from({ length: 100 }, () => Math.random() * 30 + 20)
      }
    };
  }, [selectedAgent]);

  // Generate resource alerts
  const generateAlerts = useCallback((): ResourceAlert[] => {
    const alerts: ResourceAlert[] = [];
    const currentTime = Date.now();
    
    if (resourceData) {
      if (resourceData.cpu.usage > 80) {
        alerts.push({
          id: 'cpu_high',
          type: 'cpu',
          severity: 'warning',
          title: 'High CPU Usage',
          message: `CPU usage is ${resourceData.cpu.usage.toFixed(1)}%`,
          timestamp: currentTime,
          acknowledged: false
        });
      }
      
      if (resourceData.memory.usage > 85) {
        alerts.push({
          id: 'memory_high',
          type: 'memory',
          severity: 'critical',
          title: 'High Memory Usage',
          message: `Memory usage is ${resourceData.memory.usage.toFixed(1)}%`,
          timestamp: currentTime,
          acknowledged: false
        });
      }
      
      if (resourceData.disk.usage > 90) {
        alerts.push({
          id: 'disk_full',
          type: 'disk',
          severity: 'critical',
          title: 'Disk Space Low',
          message: `Disk usage is ${resourceData.disk.usage.toFixed(1)}%`,
          timestamp: currentTime,
          acknowledged: false
        });
      }
    }
    
    return alerts;
  }, [resourceData]);

  // Generate optimization recommendations
  const generateRecommendations = useCallback((): ResourceRecommendation[] => {
    const recommendations: ResourceRecommendation[] = [];
    
    if (resourceData) {
      if (resourceData.cpu.usage > 70) {
        recommendations.push({
          id: 'cpu_optimize',
          type: 'cpu',
          priority: 'high',
          title: 'Optimize CPU Usage',
          description: 'Consider scaling horizontally or optimizing CPU-intensive processes',
          impact: 'high',
          effort: 'medium',
          savings: '30%'
        });
      }
      
      if (resourceData.memory.usage > 75) {
        recommendations.push({
          id: 'memory_optimize',
          type: 'memory',
          priority: 'medium',
          title: 'Optimize Memory Usage',
          description: 'Implement memory caching strategies or increase available memory',
          impact: 'medium',
          effort: 'low',
          savings: '20%'
        });
      }
      
      if (resourceData.disk.usage > 80) {
        recommendations.push({
          id: 'disk_cleanup',
          type: 'disk',
          priority: 'critical',
          title: 'Disk Cleanup Required',
          description: 'Remove unnecessary files or consider disk expansion',
          impact: 'high',
          effort: 'low',
          savings: '15%'
        });
      }
    }
    
    return recommendations;
  }, [resourceData]);

  // Process chart data
  const cpuChartData = useMemo(() => {
    if (!resourceData) return [];
    return resourceData.cpu.history.slice(-50).map((value, index) => ({
      time: new Date(Date.now() - (49 - index) * 60000).toLocaleTimeString(),
      cpu: value,
      threshold: 80
    }));
  }, [resourceData]);

  const memoryChartData = useMemo(() => {
    if (!resourceData) return [];
    return resourceData.memory.history.slice(-50).map((value, index) => ({
      time: new Date(Date.now() - (49 - index) * 60000).toLocaleTimeString(),
      memory: value,
      threshold: 85
    }));
  }, [resourceData]);

  const networkChartData = useMemo(() => {
    if (!resourceData) return [];
    return resourceData.network.history.slice(-50).map((value, index) => ({
      time: new Date(Date.now() - (49 - index) * 60000).toLocaleTimeString(),
      network: value,
      upload: resourceData.network.upload,
      download: resourceData.network.download
    }));
  }, [resourceData]);

  const diskUsageData = useMemo(() => {
    if (!resourceData) return [];
    return [
      { name: 'Used', value: resourceData.disk.used, color: '#ff7300' },
      { name: 'Free', value: resourceData.disk.free, color: '#00ff00' }
    ];
  }, [resourceData]);

  // Fetch metrics data
  const fetchResourceData = useCallback(() => {
    if (selectedAgent) {
      const endTime = Date.now();
      const startTime = endTime - (60 * 60 * 1000); // Last 1 hour
      
      dispatch(fetchPerformanceMetrics({
        agentId: selectedAgent,
        timeRange: { start: startTime, end: endTime, label: 'Last 1 Hour' }
      }) as any);
    }
  }, [selectedAgent, dispatch]);

  // Initialize data
  useEffect(() => {
    if (selectedAgent) {
      setResourceData(generateResourceData());
      setAlerts(generateAlerts());
      setRecommendations(generateRecommendations());
    }
  }, [selectedAgent, generateResourceData, generateAlerts, generateRecommendations]);

  // Auto-refresh effect
  useEffect(() => {
    if (autoRefresh && selectedAgent) {
      const interval = setInterval(() => {
        setResourceData(generateResourceData());
        setAlerts(generateAlerts());
      }, refreshInterval);
      
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, selectedAgent, generateResourceData, generateAlerts]);

  // Effects
  useEffect(() => {
    if (selectedAgent) {
      fetchResourceData();
    }
  }, [selectedAgent, fetchResourceData]);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchResourceData();
    setResourceData(generateResourceData());
    setAlerts(generateAlerts());
    setRecommendations(generateRecommendations());
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
              {entry.name}: {entry.value?.toFixed(2)}%
            </Typography>
          ))}
        </Paper>
      );
    }
    return null;
  };

  // Render loading state
  if (loading && !metrics) {
    return (
      <Box sx={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Stack spacing={2} alignItems="center">
          <CircularProgress size={60} />
          <Typography variant="h6" color="text.secondary">
            Loading resource utilization...
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
          Error loading resource data: {error}
        </Alert>
      </Box>
    );
  }

  // Render no data state
  if (!selectedAgent) {
    return (
      <Box sx={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
        <Alert severity="info">
          Please select an agent to monitor resource utilization.
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
            <Avatar sx={{ bgcolor: 'info.main' }}>
              <AnalyticsIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight="bold">
                Resource Utilization
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Real-time monitoring of system resources and performance
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
            
            <FormControl size="small" sx={{ minWidth: 100 }}>
              <InputLabel>Time Range</InputLabel>
              <Select
                value={timeRange}
                label="Time Range"
                onChange={(e) => setTimeRange(e.target.value)}
              >
                <MenuItem value="5m">5 min</MenuItem>
                <MenuItem value="1h">1 hour</MenuItem>
                <MenuItem value="24h">24 hours</MenuItem>
                <MenuItem value="7d">7 days</MenuItem>
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
            
            <Tooltip title="Refresh">
              <IconButton onClick={handleRefresh} disabled={loading}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
      </Paper>

      {/* Resource Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <ResourceCard
            title="CPU Usage"
            value={resourceData?.cpu.usage || 0}
            unit="%"
            icon={CpuIcon}
            color="primary"
            threshold={80}
            trend="up"
            history={resourceData?.cpu.history || []}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <ResourceCard
            title="Memory Usage"
            value={resourceData?.memory.usage || 0}
            unit="%"
            icon={MemoryIcon}
            color="secondary"
            threshold={85}
            trend="stable"
            history={resourceData?.memory.history || []}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <ResourceCard
            title="Network I/O"
            value={resourceData?.network.download || 0}
            unit="Mbps"
            icon={NetworkIcon}
            color="success"
            threshold={100}
            trend="down"
            history={resourceData?.network.history || []}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <ResourceCard
            title="Disk Usage"
            value={resourceData?.disk.usage || 0}
            unit="%"
            icon={DiskIcon}
            color="warning"
            threshold={90}
            trend="up"
            history={resourceData?.disk.history || []}
          />
        </Grid>
      </Grid>

      {/* Alerts */}
      {alerts.length > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Active Resource Alerts ({alerts.length})
          </Typography>
          <Stack spacing={1}>
            {alerts.map((alert) => (
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
          <Tab label="Real-time" icon={<TimelineIcon />} />
          <Tab label="Historical" icon={<ChartIcon />} />
          <Tab label="Details" icon={<InfoIcon />} />
          <Tab label="Recommendations" icon={<AssessmentIcon />} />
        </Tabs>

        {/* Real-time Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ p: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  CPU Utilization
                </Typography>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={cpuChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <ReferenceLine y={80} stroke="#ff7300" strokeDasharray="5 5" />
                    <Line type="monotone" dataKey="cpu" stroke="#8884d8" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Memory Utilization
                </Typography>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={memoryChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <ReferenceLine y={85} stroke="#ff7300" strokeDasharray="5 5" />
                    <Line type="monotone" dataKey="memory" stroke="#82ca9d" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Network Utilization
                </Typography>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={networkChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="network" stroke="#ffc658" fill="#ffc658" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Disk Usage Distribution
                </Typography>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={diskUsageData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {diskUsageData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>

        {/* Historical Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Historical Resource Trends
            </Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
              Historical data shows resource utilization patterns over time. Use this view to identify trends and plan capacity.
            </Alert>
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  24-Hour Resource Overview
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={cpuChartData.concat(memoryChartData)} >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line type="monotone" dataKey="cpu" stroke="#8884d8" strokeWidth={2} name="CPU %" />
                    <Line type="monotone" dataKey="memory" stroke="#82ca9d" strokeWidth={2} name="Memory %" />
                  </LineChart>
                </ResponsiveContainer>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>

        {/* Details Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Detailed Resource Information
            </Typography>
            
            <Grid container spacing={2}>
              {resourceData && (
                <>
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        CPU Details
                      </Typography>
                      <Stack spacing={1}>
                        <Typography variant="body2">
                          Cores: {resourceData.cpu.cores} @ {resourceData.cpu.frequency}GHz
                        </Typography>
                        <Typography variant="body2">
                          Temperature: {resourceData.cpu.temperature.toFixed(1)}°C
                        </Typography>
                        <Typography variant="body2">
                          Processes: {resourceData.cpu.processes}
                        </Typography>
                        <Typography variant="body2">
                          Load Average: {resourceData.cpu.loadAverage.map(l => l.toFixed(2)).join(', ')}
                        </Typography>
                      </Stack>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Memory Details
                      </Typography>
                      <Stack spacing={1}>
                        <Typography variant="body2">
                          Total: {resourceData.memory.total}GB
                        </Typography>
                        <Typography variant="body2">
                          Used: {resourceData.memory.used}GB
                        </Typography>
                        <Typography variant="body2">
                          Available: {resourceData.memory.available}GB
                        </Typography>
                        <Typography variant="body2">
                          Cached: {resourceData.memory.cached}GB
                        </Typography>
                        <Typography variant="body2">
                          Swap: {resourceData.memory.swap.used.toFixed(1)}GB / {resourceData.memory.swap.total}GB
                        </Typography>
                      </Stack>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Network Details
                      </Typography>
                      <Stack spacing={1}>
                        <Typography variant="body2">
                          Upload: {resourceData.network.upload.toFixed(1)} Mbps
                        </Typography>
                        <Typography variant="body2">
                          Download: {resourceData.network.download.toFixed(1)} Mbps
                        </Typography>
                        <Typography variant="body2">
                          Latency: {resourceData.network.latency.toFixed(0)}ms
                        </Typography>
                        <Typography variant="body2">
                          Packet Loss: {resourceData.network.packetLoss.toFixed(1)}%
                        </Typography>
                        <Typography variant="body2">
                          Connections: {resourceData.network.connections.active} active, {resourceData.network.connections.total} total
                        </Typography>
                      </Stack>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Disk Details
                      </Typography>
                      <Stack spacing={1}>
                        <Typography variant="body2">
                          Total: {resourceData.disk.total}GB
                        </Typography>
                        <Typography variant="body2">
                          Used: {resourceData.disk.used}GB
                        </Typography>
                        <Typography variant="body2">
                          Free: {resourceData.disk.free}GB
                        </Typography>
                        <Typography variant="body2">
                          Read Speed: {resourceData.disk.readSpeed.toFixed(0)} MB/s
                        </Typography>
                        <Typography variant="body2">
                          Write Speed: {resourceData.disk.writeSpeed.toFixed(0)} MB/s
                        </Typography>
                        <Typography variant="body2">
                          IOPS: {resourceData.disk.iops}
                        </Typography>
                      </Stack>
                    </Card>
                  </Grid>
                </>
              )}
            </Grid>
          </Box>
        </TabPanel>

        {/* Recommendations Tab */}
        <TabPanel value={tabValue} index={3}>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Resource Optimization Recommendations
            </Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
              Based on current resource usage patterns, here are optimization recommendations to improve performance and reduce costs.
            </Alert>
            
            {recommendations.length > 0 ? (
              <List>
                {recommendations.map((rec) => (
                  <ListItem key={rec.id} divider>
                    <ListItemIcon>
                      <AssessmentIcon color={rec.priority === 'critical' ? 'error' : 
                                       rec.priority === 'high' ? 'warning' : 'info'} />
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
                            <Chip size="small" label={`Savings: ${rec.savings}`} />
                          </Stack>
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
                No optimization recommendations at this time. Resource usage is within normal parameters.
              </Typography>
            )}
          </Box>
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default ResourceUtilization;