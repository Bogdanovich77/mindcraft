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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  TextField,
  InputAdornment,
  Fade,
  Collapse
} from '@mui/material';
import {
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  NotificationsActive as AlertIcon,
  Timeline as TimelineIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  History as HistoryIcon,
  BugReport as BugReportIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  Memory as MemoryIcon,
  NetworkCheck as NetworkIcon,
  Storage as StorageIcon,
  ExpandMore as ExpandMoreIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  Archive as ArchiveIcon,
  MarkEmailRead as MarkReadIcon,
  PriorityHigh as PriorityHighIcon,
  LowPriority as LowPriorityIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Timeline as TimelineIconAlt,
  Assessment as AssessmentIcon,
  Analytics as AnalyticsIcon,
  AutoFixHigh as AutoFixIcon,
  ReportProblem as ReportProblemIcon,
  Add as AddIcon,
  Edit as EditIcon
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
  ScatterChart,
  Scatter,
  ComposedChart,
  BarChart,
  Bar
} from 'recharts';

// Import performance selectors and actions
import {
  selectPerformanceMetrics,
  selectPerformanceLoading,
  selectPerformanceError,
  fetchPerformanceMetrics
} from '../../store';

// Import agents selectors
import {
  selectAllAgents
} from '../../store';

// Import types
import type {
  PerformanceMetrics,
  AnomalyEvent,
  AnomalyType,
  AnomalySeverity,
  AlertRule,
  AnomalyPattern,
  AlertNotification
} from '../../types/performance';
// Import types separately to avoid Vite bundling issues
import type { TooltipProps } from 'recharts';

interface AnomalyDetectionProps {
  agentId?: string;
  height?: string | number;
  showAlerts?: boolean;
  showRules?: boolean;
  showPatterns?: boolean;
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
      id={`anomaly-tabpanel-${index}`}
      aria-labelledby={`anomaly-tab-${index}`}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
};

interface AnomalyCardProps {
  anomaly: AnomalyEvent;
  onAcknowledge: (id: string) => void;
  onResolve: (id: string) => void;
  onDismiss: (id: string) => void;
}

const AnomalyCard: React.FC<AnomalyCardProps> = ({
  anomaly,
  onAcknowledge,
  onResolve,
  onDismiss
}) => {
  const getSeverityIcon = () => {
    switch (anomaly.severity) {
      case 'critical': return ErrorIcon;
      case 'high': return WarningIcon;
      case 'medium': return InfoIcon;
      case 'low': return CheckCircleIcon;
      default: return InfoIcon;
    }
  };

  const getSeverityColor = () => {
    switch (anomaly.severity) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getTypeIcon = () => {
    switch (anomaly.type) {
      case 'performance': return SpeedIcon;
      case 'memory': return MemoryIcon;
      case 'network': return NetworkIcon;
      case 'system': return BugReportIcon;
      case 'security': return SecurityIcon;
      default: return ReportProblemIcon;
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const SeverityIcon = getSeverityIcon();
  const TypeIcon = getTypeIcon();
  const severityColor = getSeverityColor();

  return (
    <Card variant="outlined" sx={{ mb: 2, borderLeft: 4, borderLeftColor: `${severityColor}.main` }}>
      <CardContent>
        <Stack spacing={2}>
          {/* Header */}
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar sx={{ bgcolor: `${severityColor}.main` }}>
              <SeverityIcon />
            </Avatar>
            <Box flex={1}>
              <Typography variant="h6" component="div">
                {anomaly.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {anomaly.description}
              </Typography>
            </Box>
            <Chip
              icon={<TypeIcon />}
              label={anomaly.type}
              color={severityColor as any}
              size="small"
            />
          </Stack>

          {/* Details */}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Detected: {formatTimestamp(anomaly.timestamp)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Duration: {anomaly.duration}ms
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Confidence: {(anomaly.confidence * 100).toFixed(1)}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Impact Score: {anomaly.impactScore}
              </Typography>
            </Grid>
          </Grid>

          {/* Metrics */}
          {anomaly.affectedMetrics && anomaly.affectedMetrics.length > 0 && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Affected Metrics:
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {anomaly.affectedMetrics.map((metric, index) => (
                  <Chip
                    key={index}
                    label={metric}
                    size="small"
                    variant="outlined"
                  />
                ))}
              </Stack>
            </Box>
          )}

          {/* Actions */}
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button
              size="small"
              startIcon={<DeleteIcon />}
              onClick={() => onDismiss(anomaly.id)}
            >
              Dismiss
            </Button>
            <Button
              size="small"
              startIcon={<MarkReadIcon />}
              onClick={() => onAcknowledge(anomaly.id)}
            >
              Acknowledge
            </Button>
            <Button
              size="small"
              variant="contained"
              startIcon={<CheckCircleIcon />}
              onClick={() => onResolve(anomaly.id)}
            >
              Resolve
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

const AnomalyDetection: React.FC<AnomalyDetectionProps> = ({
  agentId,
  height = '100%',
  showAlerts = true,
  showRules = true,
  showPatterns = true
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
  const [anomalies, setAnomalies] = useState<AnomalyEvent[]>([]);
  const [alertRules, setAlertRules] = useState<AlertRule[]>([]);
  const [patterns, setPatterns] = useState<AnomalyPattern[]>([]);
  const [sensitivity, setSensitivity] = useState<number>(0.7);
  const [autoResolve, setAutoResolve] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<boolean>(true);
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [selectedAnomaly, setSelectedAnomaly] = useState<AnomalyEvent | null>(null);

  // Generate synthetic anomaly data (in real implementation, this would come from ML backend)
  const generateAnomalies = useCallback((agentMetrics: PerformanceMetrics[]): AnomalyEvent[] => {
    if (!agentMetrics || agentMetrics.length === 0) return [];
    
    const anomalies: AnomalyEvent[] = [];
    const currentTime = Date.now();
    
    // Generate some sample anomalies
    for (let i = 0; i < 5; i++) {
      const types: AnomalyType[] = ['performance', 'memory', 'network', 'system', 'security'];
      const severities: AnomalySeverity[] = ['critical', 'high', 'medium', 'low'];
      
      anomalies.push({
        id: `anomaly_${i}`,
        agentId: selectedAgent,
        type: types[i % types.length],
        severity: severities[i % severities.length],
        title: `${types[i % types.length]} anomaly detected`,
        description: `Unusual ${types[i % types.length]} behavior detected in agent ${selectedAgent}`,
        timestamp: currentTime - (i * 3600000), // 1 hour apart
        duration: Math.floor(Math.random() * 10000) + 1000,
        confidence: Math.random() * 0.3 + 0.7, // 70-100%
        impactScore: Math.floor(Math.random() * 10) + 1,
        affectedMetrics: ['responseTime', 'memoryUsage', 'cpuUsage'],
        status: i % 3 === 0 ? 'resolved' : i % 3 === 1 ? 'acknowledged' : 'active',
        resolution: i % 3 === 0 ? 'Automatic resolution applied' : undefined,
        acknowledgedBy: i % 3 === 1 ? 'admin' : undefined,
        acknowledgedAt: i % 3 === 1 ? currentTime - (i * 1800000) : undefined
      });
    }
    
    return anomalies;
  }, [selectedAgent]);

  // Generate alert rules
  const generateAlertRules = useCallback((): AlertRule[] => {
    return [
      {
        id: 'rule_1',
        name: 'High Response Time',
        description: 'Alert when response time exceeds 1000ms',
        metric: 'responseTime',
        condition: 'greater_than',
        threshold: 1000,
        severity: 'high',
        enabled: true,
        notifications: ['email', 'slack'],
        cooldown: 300000,
        created: Date.now() - 86400000,
        lastTriggered: Date.now() - 3600000
      },
      {
        id: 'rule_2',
        name: 'Memory Usage Alert',
        description: 'Alert when memory usage exceeds 80%',
        metric: 'memoryUsage',
        condition: 'greater_than',
        threshold: 80,
        severity: 'medium',
        enabled: true,
        notifications: ['email'],
        cooldown: 600000,
        created: Date.now() - 172800000,
        lastTriggered: Date.now() - 7200000
      },
      {
        id: 'rule_3',
        name: 'Error Rate Spike',
        description: 'Alert when error rate exceeds 5%',
        metric: 'errorRate',
        condition: 'greater_than',
        threshold: 5,
        severity: 'critical',
        enabled: false,
        notifications: ['slack', 'sms'],
        cooldown: 180000,
        created: Date.now() - 259200000,
        lastTriggered: undefined
      }
    ];
  }, []);

  // Generate anomaly patterns
  const generatePatterns = useCallback((): AnomalyPattern[] => {
    return [
      {
        id: 'pattern_1',
        name: 'Memory Leak Pattern',
        description: 'Gradual memory increase over time',
        frequency: 'daily',
        confidence: 0.85,
        occurrences: 12,
        lastDetected: Date.now() - 86400000,
        metrics: ['memoryUsage'],
        pattern: 'linear_increase',
        severity: 'high'
      },
      {
        id: 'pattern_2',
        name: 'Performance Degradation',
        description: 'Response time increases during peak hours',
        frequency: 'daily',
        confidence: 0.92,
        occurrences: 24,
        lastDetected: Date.now() - 3600000,
        metrics: ['responseTime', 'cpuUsage'],
        pattern: 'time_based',
        severity: 'medium'
      },
      {
        id: 'pattern_3',
        name: 'Network Latency Spikes',
        description: 'Periodic network latency increases',
        frequency: 'hourly',
        confidence: 0.78,
        occurrences: 156,
        lastDetected: Date.now() - 1800000,
        metrics: ['networkLatency'],
        pattern: 'periodic',
        severity: 'low'
      }
    ];
  }, []);

  // Filter anomalies based on criteria
  const filteredAnomalies = useMemo(() => {
    return anomalies.filter(anomaly => {
      const matchesSeverity = selectedSeverity === 'all' || anomaly.severity === selectedSeverity;
      const matchesType = selectedType === 'all' || anomaly.type === selectedType;
      const matchesSearch = searchQuery === '' || 
        anomaly.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        anomaly.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesSeverity && matchesType && matchesSearch;
    });
  }, [anomalies, selectedSeverity, selectedType, searchQuery]);

  // Anomaly statistics
  const anomalyStats = useMemo(() => {
    const total = anomalies.length;
    const active = anomalies.filter(a => a.status === 'active').length;
    const acknowledged = anomalies.filter(a => a.status === 'acknowledged').length;
    const resolved = anomalies.filter(a => a.status === 'resolved').length;
    const critical = anomalies.filter(a => a.severity === 'critical').length;
    const high = anomalies.filter(a => a.severity === 'high').length;
    
    return { total, active, acknowledged, resolved, critical, high };
  }, [anomalies]);

  // Fetch metrics data
  const fetchMetricsData = useCallback(() => {
    if (selectedAgent) {
      const endTime = Date.now();
      const startTime = endTime - (24 * 60 * 60 * 1000); // Last 24 hours
      
      dispatch(fetchPerformanceMetrics({
        agentId: selectedAgent,
        timeRange: { start: startTime, end: endTime, label: 'Last 24 Hours' }
      }) as any);
    }
  }, [selectedAgent, dispatch]);

  // Initialize data
  useEffect(() => {
    if (metrics && metrics.length > 0) {
      setAnomalies(generateAnomalies(metrics));
    }
    setAlertRules(generateAlertRules());
    setPatterns(generatePatterns());
  }, [metrics, generateAnomalies, generateAlertRules, generatePatterns]);

  // Effects
  useEffect(() => {
    if (selectedAgent) {
      fetchMetricsData();
    }
  }, [selectedAgent, fetchMetricsData]);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchMetricsData();
  };

  // Handle anomaly actions
  const handleAcknowledgeAnomaly = (id: string) => {
    setAnomalies(prev => prev.map(anomaly => 
      anomaly.id === id 
        ? { ...anomaly, status: 'acknowledged' as const, acknowledgedBy: 'admin', acknowledgedAt: Date.now() }
        : anomaly
    ));
  };

  const handleResolveAnomaly = (id: string) => {
    setAnomalies(prev => prev.map(anomaly => 
      anomaly.id === id 
        ? { ...anomaly, status: 'resolved' as const, resolution: 'Manual resolution applied' }
        : anomaly
    ));
  };

  const handleDismissAnomaly = (id: string) => {
    setAnomalies(prev => prev.filter(anomaly => anomaly.id !== id));
  };

  // Handle anomaly details
  const handleShowAnomalyDetails = (anomaly: AnomalyEvent) => {
    setSelectedAnomaly(anomaly);
    setShowDetails(true);
  };

  // Render loading state
  if (loading && !metrics) {
    return (
      <Box sx={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Stack spacing={2} alignItems="center">
          <CircularProgress size={60} />
          <Typography variant="h6" color="text.secondary">
            Loading anomaly detection...
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
          Error loading anomaly detection: {error}
        </Alert>
      </Box>
    );
  }

  // Render no data state
  if (!selectedAgent) {
    return (
      <Box sx={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
        <Alert severity="info">
          Please select an agent to monitor for anomalies.
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
            <Avatar sx={{ bgcolor: 'warning.main' }}>
              <AlertIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight="bold">
                Anomaly Detection
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Real-time anomaly monitoring and alerting system
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
            
            <Tooltip title="Refresh">
              <IconButton onClick={handleRefresh} disabled={loading}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
      </Paper>

      {/* Statistics Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Stack spacing={1} alignItems="center">
                <Avatar sx={{ bgcolor: 'info.main' }}>
                  <AnalyticsIcon />
                </Avatar>
                <Typography variant="h4" fontWeight="bold">
                  {anomalyStats.total}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Anomalies
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Stack spacing={1} alignItems="center">
                <Avatar sx={{ bgcolor: 'error.main' }}>
                  <ErrorIcon />
                </Avatar>
                <Typography variant="h4" fontWeight="bold" color="error.main">
                  {anomalyStats.active}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Stack spacing={1} alignItems="center">
                <Avatar sx={{ bgcolor: 'warning.main' }}>
                  <WarningIcon />
                </Avatar>
                <Typography variant="h4" fontWeight="bold" color="warning.main">
                  {anomalyStats.acknowledged}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Acknowledged
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Stack spacing={1} alignItems="center">
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <CheckCircleIcon />
                </Avatar>
                <Typography variant="h4" fontWeight="bold" color="success.main">
                  {anomalyStats.resolved}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Resolved
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Stack spacing={1} alignItems="center">
                <Avatar sx={{ bgcolor: 'error.main' }}>
                  <PriorityHighIcon />
                </Avatar>
                <Typography variant="h4" fontWeight="bold" color="error.main">
                  {anomalyStats.critical}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Critical
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Stack spacing={1} alignItems="center">
                <Avatar sx={{ bgcolor: 'warning.main' }}>
                  <WarningIcon />
                </Avatar>
                <Typography variant="h4" fontWeight="bold" color="warning.main">
                  {anomalyStats.high}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  High Priority
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
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
          <Tab label="Active Anomalies" icon={<WarningIcon />} />
          <Tab label="Alert Rules" icon={<SettingsIcon />} />
          <Tab label="Patterns" icon={<TimelineIcon />} />
          <Tab label="Settings" icon={<SettingsIcon />} />
        </Tabs>

        {/* Active Anomalies Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ p: 2 }}>
            {/* Filters */}
            <Stack direction="row" spacing={2} alignItems="center" mb={2}>
              <TextField
                size="small"
                placeholder="Search anomalies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  )
                }}
                sx={{ minWidth: 250 }}
              />
              
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Severity</InputLabel>
                <Select
                  value={selectedSeverity}
                  label="Severity"
                  onChange={(e) => setSelectedSeverity(e.target.value)}
                >
                  <MenuItem value="all">All Severities</MenuItem>
                  <MenuItem value="critical">Critical</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="low">Low</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Type</InputLabel>
                <Select
                  value={selectedType}
                  label="Type"
                  onChange={(e) => setSelectedType(e.target.value)}
                >
                  <MenuItem value="all">All Types</MenuItem>
                  <MenuItem value="performance">Performance</MenuItem>
                  <MenuItem value="memory">Memory</MenuItem>
                  <MenuItem value="network">Network</MenuItem>
                  <MenuItem value="system">System</MenuItem>
                  <MenuItem value="security">Security</MenuItem>
                </Select>
              </FormControl>
            </Stack>
            
            {/* Anomaly List */}
            {filteredAnomalies.length > 0 ? (
              <Box>
                {filteredAnomalies.map((anomaly) => (
                  <AnomalyCard
                    key={anomaly.id}
                    anomaly={anomaly}
                    onAcknowledge={handleAcknowledgeAnomaly}
                    onResolve={handleResolveAnomaly}
                    onDismiss={handleDismissAnomaly}
                  />
                ))}
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="text.secondary">
                  No anomalies found matching the current filters.
                </Typography>
              </Box>
            )}
          </Box>
        </TabPanel>

        {/* Alert Rules Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ p: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                Alert Rules Configuration
              </Typography>
              <Button variant="contained" startIcon={<AddIcon />}>
                Add Rule
              </Button>
            </Stack>
            
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Rule Name</TableCell>
                    <TableCell>Metric</TableCell>
                    <TableCell>Condition</TableCell>
                    <TableCell>Threshold</TableCell>
                    <TableCell>Severity</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {alertRules.map((rule) => (
                    <TableRow key={rule.id}>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {rule.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {rule.description}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{rule.metric}</TableCell>
                      <TableCell>{rule.condition}</TableCell>
                      <TableCell>{rule.threshold}</TableCell>
                      <TableCell>
                        <Chip 
                          label={rule.severity} 
                          color={rule.severity === 'critical' ? 'error' : 
                                 rule.severity === 'high' ? 'warning' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={rule.enabled ? 'Enabled' : 'Disabled'} 
                          color={rule.enabled ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <IconButton size="small">
                            <EditIcon />
                          </IconButton>
                          <IconButton size="small">
                            <DeleteIcon />
                          </IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </TabPanel>

        {/* Patterns Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Detected Anomaly Patterns
            </Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
              Patterns are identified through machine learning analysis of historical anomaly data.
              These patterns help predict future anomalies and improve detection accuracy.
            </Alert>
            
            <Grid container spacing={2}>
              {patterns.map((pattern) => (
                <Grid item xs={12} md={6} key={pattern.id}>
                  <Card variant="outlined" sx={{ p: 2 }}>
                    <Stack spacing={2}>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Avatar sx={{ bgcolor: 'info.main' }}>
                          <TimelineIcon />
                        </Avatar>
                        <Box flex={1}>
                          <Typography variant="h6">
                            {pattern.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {pattern.description}
                          </Typography>
                        </Box>
                        <Chip 
                          label={`${(pattern.confidence * 100).toFixed(0)}% confidence`}
                          color="info"
                          size="small"
                        />
                      </Stack>
                      
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Frequency: {pattern.frequency}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Occurrences: {pattern.occurrences}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Last Detected: {new Date(pattern.lastDetected).toLocaleString()}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Pattern: {pattern.pattern}
                          </Typography>
                        </Grid>
                      </Grid>
                      
                      <Stack direction="row" spacing={1}>
                        <Button size="small" variant="outlined">
                          View Details
                        </Button>
                        <Button size="small" variant="outlined">
                          Create Alert Rule
                        </Button>
                      </Stack>
                    </Stack>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </TabPanel>

        {/* Settings Tab */}
        <TabPanel value={tabValue} index={3}>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Anomaly Detection Settings
            </Typography>
            
            <Stack spacing={3}>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle1">Detection Parameters</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="body2" gutterBottom>
                        Sensitivity: {(sensitivity * 100).toFixed(0)}%
                      </Typography>
                      <Slider
                        value={sensitivity}
                        onChange={(e, value) => setSensitivity(value as number)}
                        min={0.1}
                        max={1.0}
                        step={0.1}
                        marks={[
                          { value: 0.1, label: 'Low' },
                          { value: 0.5, label: 'Medium' },
                          { value: 1.0, label: 'High' }
                        ]}
                      />
                    </Box>
                    
                    <FormControlLabel
                      control={
                        <Switch
                          checked={autoResolve}
                          onChange={(e) => setAutoResolve(e.target.checked)}
                        />
                      }
                      label="Auto-resolve low severity anomalies"
                    />
                    
                    <FormControlLabel
                      control={
                        <Switch
                          checked={notifications}
                          onChange={(e) => setNotifications(e.target.checked)}
                        />
                      }
                      label="Enable real-time notifications"
                    />
                  </Stack>
                </AccordionDetails>
              </Accordion>
              
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle1">Notification Channels</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Stack spacing={2}>
                    <FormControlLabel
                      control={<Switch defaultChecked />}
                      label="Email notifications"
                    />
                    <FormControlLabel
                      control={<Switch defaultChecked />}
                      label="Slack integration"
                    />
                    <FormControlLabel
                      control={<Switch />}
                      label="SMS alerts for critical anomalies"
                    />
                    <FormControlLabel
                      control={<Switch />}
                      label="Webhook notifications"
                    />
                  </Stack>
                </AccordionDetails>
              </Accordion>
              
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle1">Machine Learning Settings</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Stack spacing={2}>
                    <Typography variant="body2">
                      Model Type: Isolation Forest with LSTM enhancement
                    </Typography>
                    <Typography variant="body2">
                      Training Data: Last 90 days of performance metrics
                    </Typography>
                    <Typography variant="body2">
                      Retraining Schedule: Weekly automatic retraining
                    </Typography>
                    <Typography variant="body2">
                      Feature Engineering: Automated feature selection and scaling
                    </Typography>
                    <Button variant="outlined" startIcon={<RefreshIcon />}>
                      Retrain Models Now
                    </Button>
                  </Stack>
                </AccordionDetails>
              </Accordion>
            </Stack>
          </Box>
        </TabPanel>
      </Paper>

      {/* Anomaly Details Dialog */}
      <Dialog 
        open={showDetails} 
        onClose={() => setShowDetails(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Anomaly Details
          <IconButton
            onClick={() => setShowDetails(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedAnomaly && (
            <Stack spacing={2}>
              <Typography variant="h6">{selectedAnomaly.title}</Typography>
              <Typography variant="body2">{selectedAnomaly.description}</Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Type</Typography>
                  <Typography variant="body2">{selectedAnomaly.type}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Severity</Typography>
                  <Typography variant="body2">{selectedAnomaly.severity}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Confidence</Typography>
                  <Typography variant="body2">{(selectedAnomaly.confidence * 100).toFixed(1)}%</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Impact Score</Typography>
                  <Typography variant="body2">{selectedAnomaly.impactScore}</Typography>
                </Grid>
              </Grid>
              
              {selectedAnomaly.affectedMetrics && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Affected Metrics</Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {selectedAnomaly.affectedMetrics.map((metric, index) => (
                      <Chip key={index} label={metric} size="small" variant="outlined" />
                    ))}
                  </Stack>
                </Box>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDetails(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AnomalyDetection;