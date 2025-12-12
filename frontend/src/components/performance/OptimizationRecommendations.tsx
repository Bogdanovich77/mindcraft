/**
 * Optimization Recommendations Component
 * 
 * This component provides comprehensive performance optimization recommendations including
 * actionable suggestions with priority ranking, implementation tracking, impact measurement,
 * recommendation history, and effectiveness analysis. It features automated optimization
 * workflows, ML-based recommendations, and performance optimization insights.
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
  FormHelperText,
  Stepper,
  Step,
  StepLabel,
  StepContent,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
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
  Lightbulb as LightbulbIcon,
  Build as BuildIcon,
  Construction as ConstructionIcon,
  PrecisionManufacturing as PrecisionManufacturingIcon,
  AutoFixHigh as AutoFixHighIcon,
  SettingsSuggest as SettingsSuggestIcon,
  RocketLaunch as RocketLaunchIcon,
  Assessment as AssessmentIcon,
  Analytics as AnalyticsIcon,
  Insights as InsightIcon,
  Psychology as PsychologyIcon,
  SmartToy as SmartToyIcon,
  Biotech as BiotechIcon,
  DataThresholding as DataThresholdingIcon,
  Tune as TuneIcon,
  Upgrade as UpgradeIcon,
  Sync as SyncIcon,
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
  Stop as StopIcon,
  RestartAlt as RestartAltIcon,
  Refresh as RefreshIcon,
  Save as SaveIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  FilterList as FilterListIcon,
  Sort as SortIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Flag as FlagIcon,
  Star as StarIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  Schedule as ScheduleIcon,
  History as HistoryIcon,
  Timeline as TimelineIcon,
  CompareArrows as CompareArrowsIcon,
  SwapVert as SwapVertIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  OpenInNew as OpenInNewIcon,
  Link as LinkIcon,
  Code as CodeIcon,
  Terminal as TerminalIcon,
  BugReport as BugReportIcon,
  Security as SecurityIcon,
  Shield as ShieldIcon,
  GppGood as GppGoodIcon,
  Verified as VerifiedIcon
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

// Import type separately
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
  OptimizationRecommendation,
  RecommendationCategory,
  RecommendationPriority,
  RecommendationStatus,
  ImplementationStep,
  RecommendationImpact,
  RecommendationHistory,
  RecommendationEffectiveness
} from '../../types/performance';

interface OptimizationRecommendationsProps {
  agentId?: string;
  height?: string | number;
  showImplementation?: boolean;
  showHistory?: boolean;
  showAnalytics?: boolean;
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
      id={`recommendations-tabpanel-${index}`}
      aria-labelledby={`recommendations-tab-${index}`}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
};

interface RecommendationCardProps {
  recommendation: OptimizationRecommendation;
  onImplement?: (recommendation: OptimizationRecommendation) => void;
  onDismiss?: (recommendation: OptimizationRecommendation) => void;
  onView?: (recommendation: OptimizationRecommendation) => void;
  onTrack?: (recommendation: OptimizationRecommendation) => void;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendation,
  onImplement,
  onDismiss,
  onView,
  onTrack
}) => {
  const getPriorityColor = () => {
    switch (recommendation.priority) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getStatusColor = () => {
    switch (recommendation.status) {
      case 'pending': return 'warning';
      case 'in_progress': return 'info';
      case 'completed': return 'success';
      case 'failed': return 'error';
      case 'dismissed': return 'default';
      default: return 'default';
    }
  };

  const getCategoryIcon = () => {
    switch (recommendation.category) {
      case 'performance': return SpeedIcon;
      case 'memory': return MemoryIcon;
      case 'cpu': return CpuIcon;
      case 'network': return NetworkIcon;
      case 'storage': return StorageIcon;
      case 'security': return SecurityIcon;
      case 'cost': return AssessmentIcon;
      default: return LightbulbIcon;
    }
  };

  const priorityColor = getPriorityColor();
  const statusColor = getStatusColor();
  const CategoryIcon = getCategoryIcon();

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Stack spacing={2}>
          {/* Header */}
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar sx={{ bgcolor: `${priorityColor}.main` }}>
              <CategoryIcon />
            </Avatar>
            <Box flex={1}>
              <Typography variant="h6" component="div" noWrap>
                {recommendation.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {recommendation.category} • {recommendation.source}
              </Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              <Chip 
                label={recommendation.priority} 
                color={priorityColor}
                size="small"
              />
              <Chip 
                label={recommendation.status.replace('_', ' ')} 
                color={statusColor}
                size="small"
              />
            </Stack>
          </Stack>

          {/* Description */}
          <Typography variant="body2" color="text.secondary">
            {recommendation.description}
          </Typography>

          {/* Impact Score */}
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" component="div" fontWeight="bold" color={`${priorityColor}.main`}>
              {recommendation.impactScore}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Impact Score
            </Typography>
          </Box>

          {/* Expected Benefits */}
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Expected Benefits
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {recommendation.expectedBenefits.slice(0, 3).map((benefit, index) => (
                <Chip
                  key={index}
                  label={benefit}
                  size="small"
                  variant="outlined"
                />
              ))}
            </Stack>
          </Box>

          {/* Implementation Effort */}
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Implementation Effort
            </Typography>
            <Rating
              value={recommendation.implementationEffort}
              readOnly
              size="small"
              max={5}
            />
          </Box>

          {/* Confidence Score */}
          <Box>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Typography variant="body2" color="text.secondary">
                Confidence
              </Typography>
              <LinearProgress
                variant="determinate"
                value={recommendation.confidenceScore * 100}
                sx={{ flex: 1 }}
              />
              <Typography variant="body2">
                {Math.round(recommendation.confidenceScore * 100)}%
              </Typography>
            </Stack>
          </Box>

          {/* Actions */}
          <Stack direction="row" spacing={1}>
            <Tooltip title="View Details">
              <IconButton size="small" onClick={() => onView?.(recommendation)}>
                <VisibilityIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Track Implementation">
              <IconButton size="small" onClick={() => onTrack?.(recommendation)}>
                <TimelineIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Implement">
              <IconButton size="small" onClick={() => onImplement?.(recommendation)}>
                <PlayArrowIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Dismiss">
              <IconButton size="small" onClick={() => onDismiss?.(recommendation)}>
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

interface ImplementationTrackerProps {
  recommendation: OptimizationRecommendation;
  onClose: () => void;
}

const ImplementationTracker: React.FC<ImplementationTrackerProps> = ({
  recommendation,
  onClose
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [completed, setCompleted] = useState<Set<number>>(new Set());

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleStep = (step: number) => () => {
    setActiveStep(step);
  };

  const handleComplete = () => {
    const newCompleted = new Set(completed);
    newCompleted.add(activeStep);
    setCompleted(newCompleted);
    handleNext();
  };

  const handleReset = () => {
    setActiveStep(0);
    setCompleted(new Set());
  };

  return (
    <Box sx={{ maxWidth: 800 }}>
      <Typography variant="h6" gutterBottom>
        Implementation Tracker: {recommendation.title}
      </Typography>
      
      <Stepper activeStep={activeStep} orientation="vertical">
        {recommendation.implementationSteps.map((step, index) => (
          <Step key={step.id}>
            <StepLabel
              optional={
                <Typography variant="caption">
                  {step.estimatedTime} • {step.difficulty}
                </Typography>
              }
            >
              {step.title}
            </StepLabel>
            <StepContent>
              <Typography variant="body2" color="text.secondary" paragraph>
                {step.description}
              </Typography>
              
              {step.commands && step.commands.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Commands:
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 1, bgcolor: 'grey.900' }}>
                    <Typography variant="caption" component="pre" sx={{ color: 'success.light' }}>
                      {step.commands.join('\n')}
                    </Typography>
                  </Paper>
                </Box>
              )}
              
              <Box sx={{ mb: 2 }}>
                <div>
                  <Button
                    variant="contained"
                    onClick={handleComplete}
                    sx={{ mt: 1, mr: 1 }}
                  >
                    {index === recommendation.implementationSteps.length - 1 ? 'Finish' : 'Complete'}
                  </Button>
                  <Button
                    disabled={index === 0}
                    onClick={handleBack}
                    sx={{ mt: 1, mr: 1 }}
                  >
                    Back
                  </Button>
                </div>
              </Box>
            </StepContent>
          </Step>
        ))}
      </Stepper>
      
      {activeStep === recommendation.implementationSteps.length && (
        <Paper square elevation={0} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Implementation Complete!
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            All steps have been completed successfully. The optimization should now be active.
          </Typography>
          <Button onClick={handleReset} sx={{ mt: 1, mr: 1 }}>
            Reset
          </Button>
          <Button onClick={onClose} variant="contained" sx={{ mt: 1 }}>
            Close
          </Button>
        </Paper>
      )}
    </Box>
  );
};

const OptimizationRecommendations: React.FC<OptimizationRecommendationsProps> = ({
  agentId,
  height = '100%',
  showImplementation = true,
  showHistory = true,
  showAnalytics = true
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
  const [recommendations, setRecommendations] = useState<OptimizationRecommendation[]>([]);
  const [selectedRecommendation, setSelectedRecommendation] = useState<OptimizationRecommendation | null>(null);
  const [implementationDialogOpen, setImplementationDialogOpen] = useState<boolean>(false);
  const [viewDialogOpen, setViewDialogOpen] = useState<boolean>(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Generate synthetic recommendations data (in real implementation, this would come from ML backend)
  const generateRecommendationsData = useCallback((): OptimizationRecommendation[] => {
    const currentTime = Date.now();
    const categories: RecommendationCategory[] = ['performance', 'memory', 'cpu', 'network', 'storage', 'security', 'cost'];
    const priorities: RecommendationPriority[] = ['critical', 'high', 'medium', 'low'];
    const statuses: RecommendationStatus[] = ['pending', 'in_progress', 'completed', 'failed', 'dismissed'];

    return [
      {
        id: 'rec_1',
        title: 'Optimize Memory Allocation',
        description: 'Reduce memory fragmentation by implementing object pooling and garbage collection optimization.',
        category: 'memory',
        priority: 'high',
        status: 'pending',
        impactScore: 85,
        confidenceScore: 0.92,
        implementationEffort: 3,
        source: 'ml_analysis',
        createdAt: currentTime,
        updatedAt: currentTime,
        expectedBenefits: ['Reduced memory usage by 25%', 'Improved performance by 15%', 'Lower GC overhead'],
        implementationSteps: [
          {
            id: 'step_1',
            title: 'Analyze current memory usage patterns',
            description: 'Profile memory allocation and identify bottlenecks.',
            estimatedTime: '30 minutes',
            difficulty: 'Easy',
            commands: ['npm run profile:memory', 'node --inspect src/agent/memory-profiler.js']
          },
          {
            id: 'step_2',
            title: 'Implement object pooling',
            description: 'Create reusable object pools for frequently allocated objects.',
            estimatedTime: '2 hours',
            difficulty: 'Medium',
            commands: ['npm install object-pool', 'src/utils/object-pool.js']
          },
          {
            id: 'step_3',
            title: 'Optimize garbage collection',
            description: 'Tune GC parameters and implement manual cleanup.',
            estimatedTime: '1 hour',
            difficulty: 'Medium',
            commands: ['node --max-old-space-size=4096', 'npm run gc:optimize']
          }
        ],
        prerequisites: ['Memory profiling tools', 'Admin access'],
        risks: ['Potential memory leaks if not implemented correctly', 'Temporary performance degradation'],
        rollbackPlan: 'Revert to previous memory allocation strategy and restart services.',
        successMetrics: ['Memory usage < 75%', 'GC pause time < 10ms', 'No memory leaks detected'],
        tags: ['memory', 'optimization', 'performance'],
        metadata: {
          analysisId: 'mem_opt_001',
          modelConfidence: 0.92,
          dataSource: 'memory_profiler',
          lastAnalyzed: currentTime
        }
      },
      {
        id: 'rec_2',
        title: 'Enable CPU Frequency Scaling',
        description: 'Implement dynamic CPU frequency scaling to optimize power consumption and performance.',
        category: 'cpu',
        priority: 'medium',
        status: 'in_progress',
        impactScore: 72,
        confidenceScore: 0.85,
        implementationEffort: 2,
        source: 'system_analysis',
        createdAt: currentTime - 86400000,
        updatedAt: currentTime - 3600000,
        expectedBenefits: ['Reduced power consumption by 20%', 'Optimal performance scaling', 'Better thermal management'],
        implementationSteps: [
          {
            id: 'step_1',
            title: 'Check CPU scaling support',
            description: 'Verify that CPU supports frequency scaling.',
            estimatedTime: '15 minutes',
            difficulty: 'Easy',
            commands: ['lscpu', 'cpupower frequency-info']
          },
          {
            id: 'step_2',
            title: 'Configure scaling governor',
            description: 'Set up appropriate CPU scaling governor.',
            estimatedTime: '30 minutes',
            difficulty: 'Easy',
            commands: ['cpupower frequency-set -g ondemand', 'systemctl enable cpupower']
          }
        ],
        prerequisites: ['Root access', 'CPU scaling support'],
        risks: ['Potential performance degradation under load', 'System instability if misconfigured'],
        rollbackPlan: 'Disable CPU scaling and revert to fixed frequency.',
        successMetrics: ['Power consumption reduced by 20%', 'Performance maintained under load', 'Temperature stable'],
        tags: ['cpu', 'power', 'scaling'],
        metadata: {
          analysisId: 'cpu_scale_001',
          modelConfidence: 0.85,
          dataSource: 'system_monitor',
          lastAnalyzed: currentTime - 3600000
        }
      },
      {
        id: 'rec_3',
        title: 'Implement Network Compression',
        description: 'Enable data compression for network communications to reduce bandwidth usage.',
        category: 'network',
        priority: 'low',
        status: 'pending',
        impactScore: 45,
        confidenceScore: 0.78,
        implementationEffort: 2,
        source: 'network_analysis',
        createdAt: currentTime - 172800000,
        updatedAt: currentTime - 172800000,
        expectedBenefits: ['Reduced bandwidth usage by 30%', 'Faster data transfer', 'Lower network costs'],
        implementationSteps: [
          {
            id: 'step_1',
            title: 'Analyze network traffic patterns',
            description: 'Identify compressible data streams.',
            estimatedTime: '1 hour',
            difficulty: 'Easy',
            commands: ['tcpdump -i eth0', 'nethogs']
          },
          {
            id: 'step_2',
            title: 'Implement compression middleware',
            description: 'Add gzip compression to network layer.',
            estimatedTime: '2 hours',
            difficulty: 'Medium',
            commands: ['npm install compression', 'src/middleware/compression.js']
          }
        ],
        prerequisites: ['Network access', 'Compression library'],
        risks: ['Increased CPU usage', 'Compatibility issues with legacy systems'],
        rollbackPlan: 'Disable compression middleware and revert to original network configuration.',
        successMetrics: ['Bandwidth usage reduced by 30%', 'No increase in latency', 'CPU usage < 10% increase'],
        tags: ['network', 'compression', 'bandwidth'],
        metadata: {
          analysisId: 'net_comp_001',
          modelConfidence: 0.78,
          dataSource: 'network_monitor',
          lastAnalyzed: currentTime - 172800000
        }
      },
      {
        id: 'rec_4',
        title: 'Upgrade Security Protocols',
        description: 'Update security protocols to latest standards to improve system security.',
        category: 'security',
        priority: 'critical',
        status: 'completed',
        impactScore: 95,
        confidenceScore: 0.98,
        implementationEffort: 4,
        source: 'security_audit',
        createdAt: currentTime - 259200000,
        updatedAt: currentTime - 86400000,
        expectedBenefits: ['Enhanced security posture', 'Compliance with latest standards', 'Reduced vulnerability surface'],
        implementationSteps: [
          {
            id: 'step_1',
            title: 'Audit current security configuration',
            description: 'Review existing security protocols and identify vulnerabilities.',
            estimatedTime: '2 hours',
            difficulty: 'Medium',
            commands: ['npm audit', 'sslscan localhost:443']
          },
          {
            id: 'step_2',
            title: 'Update SSL/TLS configurations',
            description: 'Upgrade to latest TLS versions and cipher suites.',
            estimatedTime: '3 hours',
            difficulty: 'Hard',
            commands: ['openssl update', 'nginx -s reload']
          },
          {
            id: 'step_3',
            title: 'Test security improvements',
            description: 'Verify that security upgrades do not break functionality.',
            estimatedTime: '1 hour',
            difficulty: 'Easy',
            commands: ['curl -I https://localhost', 'npm test']
          }
        ],
        prerequisites: ['Security audit tools', 'Admin access', 'SSL certificates'],
        risks: ['Service disruption during upgrade', 'Compatibility issues with clients'],
        rollbackPlan: 'Revert to previous security configuration and restore services.',
        successMetrics: ['All security tests pass', 'No service disruption', 'Compliance achieved'],
        tags: ['security', 'ssl', 'tls', 'compliance'],
        metadata: {
          analysisId: 'sec_upgrade_001',
          modelConfidence: 0.98,
          dataSource: 'security_audit',
          lastAnalyzed: currentTime - 86400000
        }
      }
    ];
  }, []);

  // Filter recommendations
  const filteredRecommendations = useMemo(() => {
    return recommendations.filter(rec => {
      if (filterCategory !== 'all' && rec.category !== filterCategory) return false;
      if (filterPriority !== 'all' && rec.priority !== filterPriority) return false;
      if (filterStatus !== 'all' && rec.status !== filterStatus) return false;
      return true;
    });
  }, [recommendations, filterCategory, filterPriority, filterStatus]);

  // Process analytics data
  const analyticsData = useMemo(() => {
    const categoryData = categories.map(category => ({
      category: category.charAt(0).toUpperCase() + category.slice(1),
      count: recommendations.filter(r => r.category === category).length,
      avgImpact: recommendations.filter(r => r.category === category).reduce((sum, r) => sum + r.impactScore, 0) / 
                recommendations.filter(r => r.category === category).length || 0
    }));

    const priorityData = priorities.map(priority => ({
      priority: priority.charAt(0).toUpperCase() + priority.slice(1),
      count: recommendations.filter(r => r.priority === priority).length,
      avgConfidence: recommendations.filter(r => r.priority === priority).reduce((sum, r) => sum + r.confidenceScore, 0) / 
                     recommendations.filter(r => r.priority === priority).length || 0
    }));

    const statusData = statuses.map(status => ({
      status: status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1),
      count: recommendations.filter(r => r.status === status).length
    }));

    return {
      categoryData,
      priorityData,
      statusData
    };
  }, [recommendations]);

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
      setRecommendations(generateRecommendationsData());
    }
  }, [selectedAgent, generateRecommendationsData]);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Handle recommendation actions
  const handleImplementRecommendation = (recommendation: OptimizationRecommendation) => {
    setSelectedRecommendation(recommendation);
    setImplementationDialogOpen(true);
  };

  const handleDismissRecommendation = (recommendation: OptimizationRecommendation) => {
    setRecommendations(prev => 
      prev.map(r => r.id === recommendation.id ? {...r, status: 'dismissed'} : r)
    );
  };

  const handleViewRecommendation = (recommendation: OptimizationRecommendation) => {
    setSelectedRecommendation(recommendation);
    setViewDialogOpen(true);
  };

  const handleTrackRecommendation = (recommendation: OptimizationRecommendation) => {
    setSelectedRecommendation(recommendation);
    setImplementationDialogOpen(true);
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchMetricsData();
    setRecommendations(generateRecommendationsData());
  };

  // Categories, priorities, and statuses for filters
  const categories: RecommendationCategory[] = ['performance', 'memory', 'cpu', 'network', 'storage', 'security', 'cost'];
  const priorities: RecommendationPriority[] = ['critical', 'high', 'medium', 'low'];
  const statuses: RecommendationStatus[] = ['pending', 'in_progress', 'completed', 'failed', 'dismissed'];

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
  if (loading && !recommendations.length) {
    return (
      <Box sx={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Stack spacing={2} alignItems="center">
          <CircularProgress size={60} />
          <Typography variant="h6" color="text.secondary">
            Loading optimization recommendations...
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
          Error loading optimization recommendations: {error}
        </Alert>
      </Box>
    );
  }

  // Render no data state
  if (!selectedAgent) {
    return (
      <Box sx={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
        <Alert severity="info">
          Please select an agent to view optimization recommendations.
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
              <LightbulbIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight="bold">
                Optimization Recommendations
              </Typography>
              <Typography variant="body2" color="text.secondary">
                AI-powered performance optimization suggestions with implementation tracking
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

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 2, borderRadius: 2 }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <FilterListIcon color="action" />
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={filterCategory}
              label="Category"
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <MenuItem value="all">All Categories</MenuItem>
              {categories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Priority</InputLabel>
            <Select
              value={filterPriority}
              label="Priority"
              onChange={(e) => setFilterPriority(e.target.value)}
            >
              <MenuItem value="all">All Priorities</MenuItem>
              {priorities.map((priority) => (
                <MenuItem key={priority} value={priority}>
                  {priority.charAt(0).toUpperCase() + priority.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={filterStatus}
              label="Status"
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <MenuItem value="all">All Statuses</MenuItem>
              {statuses.map((status) => (
                <MenuItem key={status} value={status}>
                  {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <Typography variant="body2" color="text.secondary">
            {filteredRecommendations.length} recommendations found
          </Typography>
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
          <Tab label="Recommendations" icon={<LightbulbIcon />} />
          {showImplementation && <Tab label="Implementation" icon={<BuildIcon />} />}
          {showHistory && <Tab label="History" icon={<HistoryIcon />} />}
          {showAnalytics && <Tab label="Analytics" icon={<AnalyticsIcon />} />}
        </Tabs>

        {/* Recommendations Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ p: 2 }}>
            <Grid container spacing={2}>
              {filteredRecommendations.map((recommendation) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={recommendation.id}>
                  <RecommendationCard
                    recommendation={recommendation}
                    onImplement={handleImplementRecommendation}
                    onDismiss={handleDismissRecommendation}
                    onView={handleViewRecommendation}
                    onTrack={handleTrackRecommendation}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        </TabPanel>

        {/* Implementation Tab */}
        {showImplementation && (
          <TabPanel value={tabValue} index={1}>
            <Box sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Implementation Tracking
              </Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                Track the progress of optimization recommendations implementation.
              </Alert>
              
              <List>
                {recommendations.filter(r => r.status === 'in_progress').map((recommendation) => (
                  <ListItem key={recommendation.id} divider>
                    <ListItemIcon>
                      <BuildIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={recommendation.title}
                      secondary={
                        <Stack spacing={1}>
                          <Typography variant="body2">
                            {recommendation.description}
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={50} // This would be calculated based on completed steps
                            sx={{ mt: 1 }}
                          />
                        </Stack>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Button
                        size="small"
                        onClick={() => handleTrackRecommendation(recommendation)}
                      >
                        Track
                      </Button>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </Box>
          </TabPanel>
        )}

        {/* History Tab */}
        {showHistory && (
          <TabPanel value={tabValue} index={2}>
            <Box sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Recommendation History
              </Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                View historical recommendations and their outcomes.
              </Alert>
              
              <List>
                {recommendations.filter(r => r.status === 'completed').map((recommendation) => (
                  <ListItem key={recommendation.id} divider>
                    <ListItemIcon>
                      <CheckCircleIcon color="success" />
                    </ListItemIcon>
                    <ListItemText
                      primary={recommendation.title}
                      secondary={
                        <Stack spacing={1}>
                          <Typography variant="body2">
                            {recommendation.description}
                          </Typography>
                          <Typography variant="caption" color="success.main">
                            Impact Score: {recommendation.impactScore}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Completed: {new Date(recommendation.updatedAt).toLocaleDateString()}
                          </Typography>
                        </Stack>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          </TabPanel>
        )}

        {/* Analytics Tab */}
        {showAnalytics && (
          <TabPanel value={tabValue} index={3}>
            <Box sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Recommendations Analytics
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Recommendations by Category
                      </Typography>
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie
                            data={analyticsData.categoryData}
                            dataKey="count"
                            nameKey="category"
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            label
                          >
                            {analyticsData.categoryData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={`hsl(${index * 45}, 70%, 50%)`} />
                            ))}
                          </Pie>
                          <RechartsTooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Recommendations by Priority
                      </Typography>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={analyticsData.priorityData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="priority" />
                          <YAxis />
                          <RechartsTooltip />
                          <Bar dataKey="count" fill="#8884d8" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Recommendations by Status
                      </Typography>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={analyticsData.statusData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="status" />
                          <YAxis />
                          <RechartsTooltip />
                          <Bar dataKey="count" fill="#82ca9d" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          </TabPanel>
        )}
      </Paper>

      {/* Implementation Dialog */}
      <Dialog 
        open={implementationDialogOpen} 
        onClose={() => setImplementationDialogOpen(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{ sx: { minHeight: 600 } }}
      >
        <DialogTitle>Implementation Tracker</DialogTitle>
        <DialogContent>
          {selectedRecommendation && (
            <ImplementationTracker
              recommendation={selectedRecommendation}
              onClose={() => setImplementationDialogOpen(false)}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImplementationDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OptimizationRecommendations;