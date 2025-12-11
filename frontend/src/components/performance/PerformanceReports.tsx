/**
 * Performance Reports Component
 * 
 * This component provides comprehensive performance reporting capabilities including automated report
 * generation, customizable templates, scheduled reports, and insightful analytics. It features report
 * creation, editing, scheduling, distribution, and historical report management. The component includes
 * various report types (summary, detailed, comparative, trend analysis) with interactive visualizations
 * and actionable insights.
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
  ListItemButton,
  Checkbox,
  FormGroup,
  Rating,
  Stepper,
  Step,
  StepLabel,
  StepContent
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  Description as DescriptionIcon,
  Schedule as ScheduleIcon,
  Share as ShareIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Add as AddIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  Timeline as TimelineIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Analytics as AnalyticsIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  ShowChart as ShowChartIcon,
  Report as ReportIcon,
  Summarize as SummarizeIcon,
  Compare as CompareIcon,
  Insights as InsightsIcon,
  AutoGraph as AutoGraphIcon,
  QueryStats as QueryStatsIcon,
  DataUsage as DataUsageIcon,
  Email as EmailIcon,
  Notifications as NotificationsIcon,
  Print as PrintIcon,
  Save as SaveIcon,
  Launch as LaunchIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  ScheduleSend as ScheduleSendIcon,
  Repeat as RepeatIcon,
  DateRange as DateRangeIcon,
  AccessTime as AccessTimeIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  Business as BusinessIcon,
  CloudDownload as CloudDownloadIcon
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
  PerformanceReport,
  ReportTemplate,
  ReportSchedule,
  ReportInsight,
  ReportType,
  ReportFormat,
  ReportStatus
} from '../../types/performance';

interface PerformanceReportsProps {
  agentId?: string;
  height?: string | number;
  showTemplates?: boolean;
  showScheduling?: boolean;
  showHistory?: boolean;
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
      id={`reports-tabpanel-${index}`}
      aria-labelledby={`reports-tab-${index}`}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
};

interface ReportCardProps {
  report: PerformanceReport;
  onView?: (report: PerformanceReport) => void;
  onEdit?: (report: PerformanceReport) => void;
  onDelete?: (report: PerformanceReport) => void;
  onDownload?: (report: PerformanceReport) => void;
  onShare?: (report: PerformanceReport) => void;
}

const ReportCard: React.FC<ReportCardProps> = ({
  report,
  onView,
  onEdit,
  onDelete,
  onDownload,
  onShare
}) => {
  const getStatusColor = () => {
    switch (report.status) {
      case 'completed': return 'success';
      case 'generating': return 'warning';
      case 'scheduled': return 'info';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = () => {
    switch (report.status) {
      case 'completed': return CheckCircleIcon;
      case 'generating': return ScheduleIcon;
      case 'scheduled': return ScheduleSendIcon;
      case 'failed': return ErrorIcon;
      default: return InfoIcon;
    }
  };

  const getFormatIcon = () => {
    switch (report.format) {
      case 'pdf': return DescriptionIcon;
      case 'excel': return BarChartIcon;
      case 'json': return DataUsageIcon;
      case 'html': return LaunchIcon;
      default: return DescriptionIcon;
    }
  };

  const getTypeIcon = () => {
    switch (report.type) {
      case 'summary': return SummarizeIcon;
      case 'detailed': return DescriptionIcon;
      case 'comparative': return CompareIcon;
      case 'trend': return TimelineIcon;
      case 'insight': return InsightsIcon;
      default: return ReportIcon;
    }
  };

  const statusColor = getStatusColor();
  const StatusIcon = getStatusIcon();
  const FormatIcon = getFormatIcon();
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
                {report.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {report.type} • {report.format.toUpperCase()}
              </Typography>
            </Box>
            <StatusIcon color={statusColor} />
          </Stack>

          {/* Report Details */}
          <Stack spacing={1}>
            <Typography variant="body2" color="text.secondary">
              Period: {new Date(report.period.start).toLocaleDateString()} - {new Date(report.period.end).toLocaleDateString()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Generated: {new Date(report.generatedAt).toLocaleString()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Size: {(report.size / 1024).toFixed(1)} KB
            </Typography>
          </Stack>

          {/* Insights */}
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Key Insights ({report.insights.length})
            </Typography>
            <Stack spacing={1}>
              {report.insights.slice(0, 2).map((insight, index) => (
                <Typography key={index} variant="caption" noWrap>
                  • {insight.title}
                </Typography>
              ))}
              {report.insights.length > 2 && (
                <Typography variant="caption" color="primary">
                  +{report.insights.length - 2} more insights
                </Typography>
              )}
            </Stack>
          </Box>

          {/* Progress */}
          {report.status === 'generating' && (
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Generating report...
              </Typography>
              <LinearProgress
                variant="indeterminate"
                color={statusColor}
                sx={{ height: 6, borderRadius: 3 }}
              />
            </Box>
          )}

          {/* Actions */}
          <Stack direction="row" spacing={1}>
            <Tooltip title="View">
              <IconButton size="small" onClick={() => onView?.(report)}>
                <VisibilityIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Download">
              <IconButton size="small" onClick={() => onDownload?.(report)}>
                <DownloadIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Share">
              <IconButton size="small" onClick={() => onShare?.(report)}>
                <ShareIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Edit">
              <IconButton size="small" onClick={() => onEdit?.(report)}>
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton size="small" onClick={() => onDelete?.(report)}>
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

interface TemplateCardProps {
  template: ReportTemplate;
  onSelect?: (template: ReportTemplate) => void;
  onEdit?: (template: ReportTemplate) => void;
  onDelete?: (template: ReportTemplate) => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  onSelect,
  onEdit,
  onDelete
}) => {
  const getTypeIcon = () => {
    switch (template.type) {
      case 'summary': return SummarizeIcon;
      case 'detailed': return DescriptionIcon;
      case 'comparative': return CompareIcon;
      case 'trend': return TimelineIcon;
      case 'insight': return InsightsIcon;
      default: return ReportIcon;
    }
  };

  const TypeIcon = getTypeIcon();

  return (
    <Card variant="outlined" sx={{ height: '100%', cursor: 'pointer' }}>
      <CardContent>
        <Stack spacing={2}>
          {/* Header */}
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              <TypeIcon />
            </Avatar>
            <Box flex={1}>
              <Typography variant="h6" component="div">
                {template.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {template.type} template
              </Typography>
            </Box>
          </Stack>

          {/* Description */}
          <Typography variant="body2" color="text.secondary">
            {template.description}
          </Typography>

          {/* Sections */}
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Sections ({template.sections.length})
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {template.sections.slice(0, 3).map((section) => (
                <Chip
                  key={section}
                  label={section}
                  size="small"
                  variant="outlined"
                />
              ))}
              {template.sections.length > 3 && (
                <Chip
                  label={`+${template.sections.length - 3}`}
                  size="small"
                  variant="outlined"
                />
              )}
            </Stack>
          </Box>

          {/* Metrics */}
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Metrics ({template.metrics.length})
            </Typography>
            <Typography variant="caption">
              {template.metrics.slice(0, 3).join(', ')}
              {template.metrics.length > 3 && '...'}
            </Typography>
          </Box>

          {/* Actions */}
          <Stack direction="row" spacing={1}>
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon />}
              onClick={() => onSelect?.(template)}
            >
              Use Template
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<EditIcon />}
              onClick={() => onEdit?.(template)}
            >
              Edit
            </Button>
            <Button
              variant="outlined"
              size="small"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => onDelete?.(template)}
            >
              Delete
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

const PerformanceReports: React.FC<PerformanceReportsProps> = ({
  agentId,
  height = '100%',
  showTemplates = true,
  showScheduling = true,
  showHistory = true
}) => {
  const dispatch = useDispatch();
  
  // Redux state
  const metrics = useSelector(selectPerformanceMetrics);
  const loading = useSelector(selectPerformanceLoading);
  const error = useSelector(selectPerformanceError);
  const availableAgents = useSelector(selectAvailableAgents);

  // Local state
  const [selectedAgent, setSelectedAgent] = useState<string>(agentId || '');
  const [tabValue, setTabValue] = useState<number>(0);
  const [reports, setReports] = useState<PerformanceReport[]>([]);
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [schedules, setSchedules] = useState<ReportSchedule[]>([]);
  const [selectedReport, setSelectedReport] = useState<PerformanceReport | null>(null);
  const [reportDialogOpen, setReportDialogOpen] = useState<boolean>(false);
  const [templateDialogOpen, setTemplateDialogOpen] = useState<boolean>(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState<boolean>(false);
  const [generatingReport, setGeneratingReport] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // Generate synthetic reports data (in real implementation, this would come from reports backend)
  const generateReportsData = useCallback((): PerformanceReport[] => {
    const currentTime = Date.now();
    const types: ReportType[] = ['summary', 'detailed', 'comparative', 'trend', 'insight'];
    const formats: ReportFormat[] = ['pdf', 'excel', 'json', 'html'];
    const statuses: ReportStatus[] = ['completed', 'generating', 'scheduled', 'failed'];

    return Array.from({ length: 15 }, (_, index) => {
      const type = types[Math.floor(Math.random() * types.length)];
      const format = formats[Math.floor(Math.random() * formats.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      return {
        id: `report_${index}`,
        title: `${type.charAt(0).toUpperCase() + type.slice(1)} Performance Report ${index + 1}`,
        type,
        format,
        status,
        agentId: selectedAgent,
        generatedAt: currentTime - Math.random() * 7 * 24 * 60 * 60 * 1000,
        period: {
          start: currentTime - 30 * 24 * 60 * 60 * 1000,
          end: currentTime
        },
        size: Math.random() * 5000 + 1000,
        insights: Array.from({ length: Math.floor(Math.random() * 5) + 3 }, (_, i) => ({
          id: `insight_${index}_${i}`,
          title: `Key Insight ${i + 1}`,
          description: `Important finding about performance metrics and trends`,
          severity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as 'low' | 'medium' | 'high',
          confidence: Math.random() * 0.4 + 0.6,
          recommendation: `Recommended action based on this insight`,
          impact: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as 'low' | 'medium' | 'high'
        })),
        metrics: ['responseTime', 'throughput', 'errorRate', 'cpuUsage', 'memoryUsage'],
        charts: ['line', 'bar', 'pie', 'radar'],
        sections: ['overview', 'detailed_metrics', 'trends', 'insights', 'recommendations']
      };
    });
  }, [selectedAgent]);

  // Generate templates data
  const generateTemplatesData = useCallback((): ReportTemplate[] => {
    return [
      {
        id: 'template_summary',
        name: 'Executive Summary',
        type: 'summary',
        description: 'High-level overview of key performance metrics and insights',
        sections: ['overview', 'key_metrics', 'insights', 'recommendations'],
        metrics: ['responseTime', 'throughput', 'errorRate', 'uptime'],
        charts: ['line', 'pie'],
        frequency: 'weekly',
        recipients: ['executives', 'managers'],
        customFields: []
      },
      {
        id: 'template_detailed',
        name: 'Detailed Analysis',
        type: 'detailed',
        description: 'Comprehensive analysis of all performance metrics and trends',
        sections: ['overview', 'detailed_metrics', 'trends', 'comparisons', 'insights', 'recommendations'],
        metrics: ['responseTime', 'throughput', 'errorRate', 'cpuUsage', 'memoryUsage', 'networkLatency'],
        charts: ['line', 'bar', 'pie', 'radar'],
        frequency: 'monthly',
        recipients: ['engineers', 'analysts'],
        customFields: []
      },
      {
        id: 'template_comparative',
        name: 'Comparative Analysis',
        type: 'comparative',
        description: 'Side-by-side comparison with peers and industry benchmarks',
        sections: ['overview', 'comparisons', 'rankings', 'gaps', 'recommendations'],
        metrics: ['responseTime', 'throughput', 'reliability', 'efficiency'],
        charts: ['bar', 'radar'],
        frequency: 'monthly',
        recipients: ['managers', 'analysts'],
        customFields: []
      },
      {
        id: 'template_trend',
        name: 'Trend Analysis',
        type: 'trend',
        description: 'Historical trend analysis and forecasting',
        sections: ['overview', 'historical_trends', 'forecasts', 'insights', 'recommendations'],
        metrics: ['responseTime', 'throughput', 'errorRate', 'growth_rate'],
        charts: ['line', 'area'],
        frequency: 'monthly',
        recipients: ['analysts', 'planners'],
        customFields: []
      }
    ];
  }, []);

  // Generate schedules data
  const generateSchedulesData = useCallback((): ReportSchedule[] => {
    return [
      {
        id: 'schedule_weekly',
        name: 'Weekly Performance Summary',
        templateId: 'template_summary',
        frequency: 'weekly',
        nextRun: Date.now() + 7 * 24 * 60 * 60 * 1000,
        recipients: ['manager@company.com', 'team@company.com'],
        enabled: true,
        format: 'pdf',
        autoDistribute: true
      },
      {
        id: 'schedule_monthly',
        name: 'Monthly Detailed Report',
        templateId: 'template_detailed',
        frequency: 'monthly',
        nextRun: Date.now() + 30 * 24 * 60 * 60 * 1000,
        recipients: ['executives@company.com'],
        enabled: true,
        format: 'excel',
        autoDistribute: true
      },
      {
        id: 'schedule_quarterly',
        name: 'Quarterly Benchmark Report',
        templateId: 'template_comparative',
        frequency: 'quarterly',
        nextRun: Date.now() + 90 * 24 * 60 * 60 * 1000,
        recipients: ['stakeholders@company.com'],
        enabled: false,
        format: 'pdf',
        autoDistribute: false
      }
    ];
  }, []);

  // Process chart data
  const reportTypeDistribution = useMemo(() => {
    const distribution = reports.reduce((acc, report) => {
      acc[report.type] = (acc[report.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(distribution).map(([type, count]) => ({
      name: type,
      value: count,
      color: ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00'][Object.keys(distribution).indexOf(type)]
    }));
  }, [reports]);

  const reportStatusDistribution = useMemo(() => {
    const distribution = reports.reduce((acc, report) => {
      acc[report.status] = (acc[report.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(distribution).map(([status, count]) => ({
      name: status,
      value: count,
      color: status === 'completed' ? '#82ca9d' : 
             status === 'generating' ? '#ffc658' :
             status === 'scheduled' ? '#8884d8' : '#ff7300'
    }));
  }, [reports]);

  // Fetch reports data
  const fetchReportsData = useCallback(() => {
    if (selectedAgent) {
      dispatch(fetchPerformanceMetrics({
        agentId: selectedAgent,
        timeRange: { 
          start: Date.now() - (30 * 24 * 60 * 60 * 1000), 
          end: Date.now(), 
          label: 'Last 30 Days' 
        }
      }) as any);
    }
  }, [selectedAgent, dispatch]);

  // Initialize data
  useEffect(() => {
    if (selectedAgent) {
      setReports(generateReportsData());
      setTemplates(generateTemplatesData());
      setSchedules(generateSchedulesData());
    }
  }, [selectedAgent, generateReportsData, generateTemplatesData, generateSchedulesData]);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Handle report generation
  const handleGenerateReport = (template: ReportTemplate) => {
    setGeneratingReport(true);
    
    // Simulate report generation
    setTimeout(() => {
      const newReport: PerformanceReport = {
        id: `report_new_${Date.now()}`,
        title: `New ${template.type} Report`,
        type: template.type,
        format: 'pdf',
        status: 'completed',
        agentId: selectedAgent,
        generatedAt: Date.now(),
        period: {
          start: Date.now() - 30 * 24 * 60 * 60 * 1000,
          end: Date.now()
        },
        size: 2500,
        insights: [
          {
            id: 'insight_new_1',
            title: 'Performance Improved',
            description: 'Overall performance has improved by 15%',
            severity: 'medium',
            confidence: 0.85,
            recommendation: 'Continue current optimization strategies',
            impact: 'medium'
          }
        ],
        metrics: template.metrics,
        charts: template.charts,
        sections: template.sections
      };
      
      setReports(prev => [newReport, ...prev]);
      setGeneratingReport(false);
      setTemplateDialogOpen(false);
    }, 3000);
  };

  // Handle report actions
  const handleViewReport = (report: PerformanceReport) => {
    setSelectedReport(report);
    console.log('View report:', report.title);
  };

  const handleDownloadReport = (report: PerformanceReport) => {
    console.log('Download report:', report.title);
    // In real implementation, this would trigger download
  };

  const handleShareReport = (report: PerformanceReport) => {
    console.log('Share report:', report.title);
    // In real implementation, this would open share dialog
  };

  const handleEditReport = (report: PerformanceReport) => {
    console.log('Edit report:', report.title);
    // In real implementation, this would open edit dialog
  };

  const handleDeleteReport = (report: PerformanceReport) => {
    setReports(prev => prev.filter(r => r.id !== report.id));
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchReportsData();
    setReports(generateReportsData());
    setTemplates(generateTemplatesData());
    setSchedules(generateSchedulesData());
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
              {entry.name}: {entry.value}
            </Typography>
          ))}
        </Paper>
      );
    }
    return null;
  };

  // Render loading state
  if (loading && !reports.length) {
    return (
      <Box sx={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Stack spacing={2} alignItems="center">
          <CircularProgress size={60} />
          <Typography variant="h6" color="text.secondary">
            Loading performance reports...
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
          Error loading performance reports: {error}
        </Alert>
      </Box>
    );
  }

  // Render no data state
  if (!selectedAgent) {
    return (
      <Box sx={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
        <Alert severity="info">
          Please select an agent to view performance reports.
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
              <AssessmentIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight="bold">
                Performance Reports
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Automated insights and comprehensive performance reporting
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
              onClick={() => setTemplateDialogOpen(true)}
            >
              New Report
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<ScheduleIcon />}
              onClick={() => setScheduleDialogOpen(true)}
            >
              Schedule
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
          <Tab label="Reports" icon={<DescriptionIcon />} />
          <Tab label="Templates" icon={<SummarizeIcon />} />
          <Tab label="Schedule" icon={<ScheduleIcon />} />
          <Tab label="Analytics" icon={<AnalyticsIcon />} />
        </Tabs>

        {/* Reports Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ p: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                Generated Reports ({reports.length})
              </Typography>
              <Stack direction="row" spacing={1}>
                <Button size="small" startIcon={<FilterIcon />}>
                  Filter
                </Button>
                <Button size="small" startIcon={<SortIcon />}>
                  Sort
                </Button>
              </Stack>
            </Stack>
            
            <Grid container spacing={2}>
              {reports.map((report) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={report.id}>
                  <ReportCard
                    report={report}
                    onView={handleViewReport}
                    onEdit={handleEditReport}
                    onDelete={handleDeleteReport}
                    onDownload={handleDownloadReport}
                    onShare={handleShareReport}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        </TabPanel>

        {/* Templates Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Report Templates
            </Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
              Choose from pre-defined templates or create custom reports for your specific needs.
            </Alert>
            
            <Grid container spacing={2}>
              {templates.map((template) => (
                <Grid item xs={12} sm={6} md={4} key={template.id}>
                  <TemplateCard
                    template={template}
                    onSelect={handleGenerateReport}
                    onEdit={(t) => console.log('Edit template:', t.name)}
                    onDelete={(t) => console.log('Delete template:', t.name)}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        </TabPanel>

        {/* Schedule Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Scheduled Reports
            </Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
              Configure automated report generation and distribution schedules.
            </Alert>
            
            <List>
              {schedules.map((schedule) => (
                <ListItem key={schedule.id} divider>
                  <ListItemIcon>
                    <ScheduleSendIcon color={schedule.enabled ? 'primary' : 'disabled'} />
                  </ListItemIcon>
                  <ListItemText
                    primary={schedule.name}
                    secondary={
                      <Stack spacing={1}>
                        <Typography variant="body2">
                          Frequency: {schedule.frequency} • Format: {schedule.format.toUpperCase()}
                        </Typography>
                        <Typography variant="body2">
                          Next run: {new Date(schedule.nextRun).toLocaleString()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Recipients: {schedule.recipients.join(', ')}
                        </Typography>
                      </Stack>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Stack direction="row" spacing={1}>
                      <Switch
                        checked={schedule.enabled}
                        onChange={(e) => {
                          setSchedules(prev => 
                            prev.map(s => s.id === schedule.id ? {...s, enabled: e.target.checked} : s)
                          );
                        }}
                      />
                      <Button size="small" variant="outlined">
                        Edit
                      </Button>
                    </Stack>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Box>
        </TabPanel>

        {/* Analytics Tab */}
        <TabPanel value={tabValue} index={3}>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Report Analytics
            </Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
              Insights about report generation, usage patterns, and effectiveness.
            </Alert>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Report Type Distribution
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={reportTypeDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {reportTypeDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Report Status Distribution
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={reportStatusDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {reportStatusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Grid>
              
              <Grid item xs={12}>
                <Card variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Key Metrics
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6} md={3}>
                      <Box>
                        <Typography variant="h4" color="primary.main">
                          {reports.length}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Total Reports
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Box>
                        <Typography variant="h4" color="success.main">
                          {reports.filter(r => r.status === 'completed').length}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Completed
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Box>
                        <Typography variant="h4" color="warning.main">
                          {reports.filter(r => r.status === 'generating').length}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Generating
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Box>
                        <Typography variant="h4" color="info.main">
                          {schedules.filter(s => s.enabled).length}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Active Schedules
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>
      </Paper>

      {/* Template Selection Dialog */}
      <Dialog open={templateDialogOpen} onClose={() => setTemplateDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Select Report Template</DialogTitle>
        <DialogContent>
          {generatingReport ? (
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <CircularProgress size={60} />
              <Typography variant="h6" sx={{ mt: 2 }}>
                Generating Report...
              </Typography>
              <Typography variant="body2" color="text.secondary">
                This may take a few moments.
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={2}>
              {templates.map((template) => (
                <Grid item xs={12} sm={6} key={template.id}>
                  <Card 
                    variant="outlined" 
                    sx={{ cursor: 'pointer', '&:hover': { borderColor: 'primary.main' } }}
                    onClick={() => handleGenerateReport(template)}
                  >
                    <CardContent>
                      <Stack spacing={1}>
                        <Typography variant="h6">{template.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {template.description}
                        </Typography>
                        <Stack direction="row" spacing={1}>
                          <Chip label={template.type} size="small" />
                          <Chip label={template.frequency} size="small" variant="outlined" />
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTemplateDialogOpen(false)} disabled={generatingReport}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PerformanceReports;