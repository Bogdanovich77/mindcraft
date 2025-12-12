/**
 * Benchmarking Component
 * 
 * This component provides comprehensive performance benchmarking and comparison capabilities including
 * industry standard comparisons, peer group analysis, historical performance tracking, and performance
 * ranking. It features benchmark selection, comparative analysis, performance scoring, and improvement
 * tracking over time. The component includes visual comparisons, statistical analysis, and benchmark
 * recommendations.
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
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Rating,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material';
import {
  Speed as SpeedIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  Compare as CompareIcon,
  Timeline as TimelineIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  ScatterPlot as ScatterPlotIcon,
  Leaderboard as LeaderboardIcon,
  EmojiEvents as EmojiEventsIcon,
  MilitaryTech as MilitaryTechIcon,
  WorkspacePremium as WorkspacePremiumIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  Remove as RemoveIcon,
  Analytics as AnalyticsIcon,
  ShowChart as ShowChartIcon,
  Equalizer as EqualizerIcon,
  DataUsage as DataUsageIcon,
  NetworkCheck as NetworkIcon,
  Memory as MemoryIcon,
  Storage as StorageIcon,
  DeveloperBoard as CpuIcon,
  CloudQueue as CloudIcon,
  Public as PublicIcon,
  Business as BusinessIcon,
  School as SchoolIcon,
  Science as ScienceIcon
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
  BenchmarkData,
  BenchmarkComparison,
  BenchmarkCategory,
  BenchmarkResult,
  BenchmarkTrend,
  BenchmarkRanking
} from '../../types/performance';

interface BenchmarkingProps {
  agentId?: string;
  height?: string | number;
  showComparison?: boolean;
  showRanking?: boolean;
  showTrends?: boolean;
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
      id={`benchmark-tabpanel-${index}`}
      aria-labelledby={`benchmark-tab-${index}`}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
};

interface BenchmarkScoreCardProps {
  title: string;
  score: number;
  rank: number;
  total: number;
  category: BenchmarkCategory;
  trend: 'up' | 'down' | 'stable';
  icon: React.ElementType;
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  description: string;
}

const BenchmarkScoreCard: React.FC<BenchmarkScoreCardProps> = ({
  title,
  score,
  rank,
  total,
  category,
  trend,
  icon: Icon,
  color,
  description
}) => {
  const getPercentile = () => {
    return Math.round((1 - rank / total) * 100);
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return ArrowUpwardIcon;
      case 'down': return ArrowDownwardIcon;
      case 'stable': return RemoveIcon;
      default: return RemoveIcon;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up': return 'success';
      case 'down': return 'error';
      case 'stable': return 'info';
      default: return 'info';
    }
  };

  const percentile = getPercentile();
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
            <Badge badgeContent={rank} color="primary">
              <LeaderboardIcon />
            </Badge>
          </Stack>

          {/* Score */}
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h3" component="div" fontWeight="bold" color={`${color}.main`}>
              {score}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Benchmark Score
            </Typography>
          </Box>

          {/* Rank and Percentile */}
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="body2" color="text.secondary">
                Rank
              </Typography>
              <Typography variant="h6" fontWeight="bold">
                #{rank} / {total}
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="body2" color="text.secondary">
                Percentile
              </Typography>
              <Typography variant="h6" fontWeight="bold" color={`${color}.main`}>
                {percentile}%
              </Typography>
            </Box>
          </Stack>

          {/* Progress Bar */}
          <Box>
            <LinearProgress
              variant="determinate"
              value={percentile}
              color={color}
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>

          {/* Trend */}
          <Stack direction="row" alignItems="center" spacing={1}>
            <TrendIcon color={trendColor} />
            <Typography variant="body2" color="text.secondary">
              Trend: {trend}
            </Typography>
          </Stack>

          {/* Category */}
          <Chip
            label={category}
            size="small"
            color={color}
            variant="outlined"
          />
        </Stack>
      </CardContent>
    </Card>
  );
};

interface ComparisonTableProps {
  data: BenchmarkComparison[];
  onSort?: (column: string) => void;
  onFilter?: (filter: string) => void;
}

const ComparisonTable: React.FC<ComparisonTableProps> = ({ data, onSort, onFilter }) => {
  const [sortColumn, setSortColumn] = useState<string>('score');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const handleSort = (column: string) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
    onSort?.(column);
  };

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      const aValue = a[sortColumn as keyof BenchmarkComparison];
      const bValue = b[sortColumn as keyof BenchmarkComparison];
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
      
      return 0;
    });
  }, [data, sortColumn, sortDirection]);

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>
              <Button
                size="small"
                onClick={() => handleSort('agentName')}
                endIcon={sortColumn === 'agentName' ? (
                  sortDirection === 'asc' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />
                ) : <SortIcon />}
              >
                Agent
              </Button>
            </TableCell>
            <TableCell>
              <Button
                size="small"
                onClick={() => handleSort('category')}
                endIcon={sortColumn === 'category' ? (
                  sortDirection === 'asc' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />
                ) : <SortIcon />}
              >
                Category
              </Button>
            </TableCell>
            <TableCell>
              <Button
                size="small"
                onClick={() => handleSort('score')}
                endIcon={sortColumn === 'score' ? (
                  sortDirection === 'asc' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />
                ) : <SortIcon />}
              >
                Score
              </Button>
            </TableCell>
            <TableCell>
              <Button
                size="small"
                onClick={() => handleSort('rank')}
                endIcon={sortColumn === 'rank' ? (
                  sortDirection === 'asc' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />
                ) : <SortIcon />}
              >
                Rank
              </Button>
            </TableCell>
            <TableCell>
              <Button
                size="small"
                onClick={() => handleSort('percentile')}
                endIcon={sortColumn === 'percentile' ? (
                  sortDirection === 'asc' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />
                ) : <SortIcon />}
              >
                Percentile
              </Button>
            </TableCell>
            <TableCell>
              <Button
                size="small"
                onClick={() => handleSort('trend')}
                endIcon={sortColumn === 'trend' ? (
                  sortDirection === 'asc' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />
                ) : <SortIcon />}
              >
                Trend
              </Button>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedData.map((item) => (
            <TableRow key={item.agentId}>
              <TableCell>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Avatar sx={{ width: 24, height: 24, fontSize: 12 }}>
                    {item.agentName.charAt(0)}
                  </Avatar>
                  <Typography variant="body2" fontWeight="bold">
                    {item.agentName}
                  </Typography>
                </Stack>
              </TableCell>
              <TableCell>
                <Chip label={item.category} size="small" variant="outlined" />
              </TableCell>
              <TableCell>
                <Typography variant="body2" fontWeight="bold">
                  {item.score}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  #{item.rank}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2" color="primary">
                  {item.percentile}%
                </Typography>
              </TableCell>
              <TableCell>
                <Stack direction="row" alignItems="center" spacing={1}>
                  {item.trend === 'up' && <ArrowUpwardIcon color="success" />}
                  {item.trend === 'down' && <ArrowDownwardIcon color="error" />}
                  {item.trend === 'stable' && <RemoveIcon color="info" />}
                  <Typography variant="body2">
                    {item.trend}
                  </Typography>
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

const Benchmarking: React.FC<BenchmarkingProps> = ({
  agentId,
  height = '100%',
  showComparison = true,
  showRanking = true,
  showTrends = true
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
  const [benchmarkData, setBenchmarkData] = useState<BenchmarkData | null>(null);
  const [comparisonData, setComparisonData] = useState<BenchmarkComparison[]>([]);
  const [rankingData, setRankingData] = useState<BenchmarkRanking[]>([]);
  const [trendData, setTrendData] = useState<BenchmarkTrend[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('1m');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [autoRefresh, setAutoRefresh] = useState<boolean>(false);

  // Generate synthetic benchmark data (in real implementation, this would come from benchmarking backend)
  const generateBenchmarkData = useCallback((): BenchmarkData => {
    const currentTime = Date.now();
    
    const categories: BenchmarkCategory[] = [
      'performance',
      'reliability',
      'efficiency',
      'scalability',
      'security'
    ];

    const results: BenchmarkResult[] = categories.map(category => ({
      category,
      score: Math.random() * 30 + 70, // 70-100
      rank: Math.floor(Math.random() * 50) + 1,
      total: 100,
      percentile: Math.random() * 40 + 60, // 60-100%
      trend: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)] as 'up' | 'down' | 'stable',
      improvement: Math.random() * 20 - 10, // -10 to +10
      lastUpdated: currentTime,
      metrics: {
        responseTime: Math.random() * 100 + 50,
        throughput: Math.random() * 1000 + 500,
        errorRate: Math.random() * 2,
        uptime: Math.random() * 5 + 95,
        efficiency: Math.random() * 30 + 70
      }
    }));

    return {
      agentId: selectedAgent,
      timestamp: currentTime,
      overallScore: Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length),
      overallRank: Math.floor(Math.random() * 50) + 1,
      totalParticipants: 100,
      overallPercentile: Math.random() * 40 + 60,
      results,
      industryStandards: {
        averageScore: 85,
        topQuartileScore: 92,
        medianScore: 88,
        bottomQuartileScore: 78
      },
      peerGroup: {
        name: 'AI Agent Systems',
        size: 100,
        averageScore: 87,
        topPerformerScore: 95
      }
    };
  }, [selectedAgent]);

  // Generate comparison data
  const generateComparisonData = useCallback((): BenchmarkComparison[] => {
    const categories: BenchmarkCategory[] = [
      'performance',
      'reliability',
      'efficiency',
      'scalability',
      'security'
    ];

    return Array.from({ length: 20 }, (_, index) => ({
      agentId: `agent_${index}`,
      agentName: `Agent ${index + 1}`,
      category: categories[Math.floor(Math.random() * categories.length)],
      score: Math.random() * 30 + 70,
      rank: Math.floor(Math.random() * 100) + 1,
      percentile: Math.random() * 40 + 60,
      trend: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)] as 'up' | 'down' | 'stable',
      improvement: Math.random() * 20 - 10
    }));
  }, []);

  // Generate ranking data
  const generateRankingData = useCallback((): BenchmarkRanking[] => {
    return Array.from({ length: 50 }, (_, index) => ({
      rank: index + 1,
      agentId: `agent_${index}`,
      agentName: `Agent ${index + 1}`,
      score: 100 - index * 1.5 + Math.random() * 10,
      category: ['overall', 'performance', 'reliability'][Math.floor(Math.random() * 3)] as 'overall' | 'performance' | 'reliability',
      change: Math.random() * 10 - 5,
      badge: index < 3 ? ['gold', 'silver', 'bronze'][index] as 'gold' | 'silver' | 'bronze' : undefined
    }));
  }, []);

  // Generate trend data
  const generateTrendData = useCallback((): BenchmarkTrend[] => {
    const currentTime = Date.now();
    return Array.from({ length: 30 }, (_, index) => ({
      timestamp: currentTime - (29 - index) * 24 * 60 * 60 * 1000,
      score: Math.random() * 20 + 75 + index * 0.5,
      rank: Math.max(1, 50 - index),
      percentile: Math.min(100, 60 + index * 1.5),
      improvement: Math.random() * 10 - 5
    }));
  }, []);

  // Process chart data
  const benchmarkRadarData = useMemo(() => {
    if (!benchmarkData) return [];
    return benchmarkData.results.map(result => ({
      category: result.category,
      score: result.score,
      percentile: result.percentile,
      industry: benchmarkData.industryStandards.averageScore
    }));
  }, [benchmarkData]);

  const trendChartData = useMemo(() => {
    if (!trendData) return [];
    return trendData.map(point => ({
      date: new Date(point.timestamp).toLocaleDateString(),
      score: point.score,
      rank: point.rank,
      percentile: point.percentile
    }));
  }, [trendData]);

  const comparisonScatterData = useMemo(() => {
    if (!comparisonData) return [];
    return comparisonData.map(item => ({
      score: item.score,
      percentile: item.percentile,
      rank: item.rank,
      agent: item.agentName
    }));
  }, [comparisonData]);

  // Fetch benchmark data
  const fetchBenchmarkData = useCallback(() => {
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
      setBenchmarkData(generateBenchmarkData());
      setComparisonData(generateComparisonData());
      setRankingData(generateRankingData());
      setTrendData(generateTrendData());
    }
  }, [selectedAgent, generateBenchmarkData, generateComparisonData, generateRankingData, generateTrendData]);

  // Auto-refresh effect
  useEffect(() => {
    if (autoRefresh && selectedAgent) {
      const interval = setInterval(() => {
        setBenchmarkData(generateBenchmarkData());
        setComparisonData(generateComparisonData());
        setRankingData(generateRankingData());
      }, 60000); // Refresh every minute
      
      return () => clearInterval(interval);
    }
  }, [autoRefresh, selectedAgent, generateBenchmarkData, generateComparisonData, generateRankingData]);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchBenchmarkData();
    setBenchmarkData(generateBenchmarkData());
    setComparisonData(generateComparisonData());
    setRankingData(generateRankingData());
    setTrendData(generateTrendData());
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
  if (loading && !benchmarkData) {
    return (
      <Box sx={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Stack spacing={2} alignItems="center">
          <CircularProgress size={60} />
          <Typography variant="h6" color="text.secondary">
            Loading benchmark data...
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
          Error loading benchmark data: {error}
        </Alert>
      </Box>
    );
  }

  // Render no data state
  if (!selectedAgent) {
    return (
      <Box sx={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
        <Alert severity="info">
          Please select an agent to view benchmark comparisons.
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
              <AssessmentIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight="bold">
                Performance Benchmarking
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Compare performance against industry standards and peer groups
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
              <InputLabel>Category</InputLabel>
              <Select
                value={selectedCategory}
                label="Category"
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <MenuItem value="all">All Categories</MenuItem>
                <MenuItem value="performance">Performance</MenuItem>
                <MenuItem value="reliability">Reliability</MenuItem>
                <MenuItem value="efficiency">Efficiency</MenuItem>
                <MenuItem value="scalability">Scalability</MenuItem>
                <MenuItem value="security">Security</MenuItem>
              </Select>
            </FormControl>
            
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(_, newMode) => newMode && setViewMode(newMode)}
              size="small"
            >
              <ToggleButton value="grid">
                <ViewModuleIcon />
              </ToggleButton>
              <ToggleButton value="list">
                <ViewListIcon />
              </ToggleButton>
            </ToggleButtonGroup>
            
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

      {/* Benchmark Score Overview */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {benchmarkData?.results.map((result) => (
          <Grid item xs={12} sm={6} md={3} key={result.category}>
            <BenchmarkScoreCard
              title={result.category.charAt(0).toUpperCase() + result.category.slice(1)}
              score={Math.round(result.score)}
              rank={result.rank}
              total={result.total}
              category={result.category}
              trend={result.trend}
              icon={
                result.category === 'performance' ? SpeedIcon :
                result.category === 'reliability' ? CheckCircleIcon :
                result.category === 'efficiency' ? AnalyticsIcon :
                result.category === 'scalability' ? CloudIcon :
                result.category === 'security' ? SecurityIcon :
                AssessmentIcon
              }
              color={
                result.category === 'performance' ? 'primary' :
                result.category === 'reliability' ? 'success' :
                result.category === 'efficiency' ? 'info' :
                result.category === 'scalability' ? 'warning' :
                result.category === 'security' ? 'error' :
                'default'
              }
              description={`${result.category} performance metrics`}
            />
          </Grid>
        ))}
      </Grid>

      {/* Overall Performance Summary */}
      <Alert severity="success" sx={{ mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Overall Performance Summary
        </Typography>
        <Typography variant="body2">
          Your agent is ranked #{benchmarkData?.overallRank} out of {benchmarkData?.totalParticipants} participants 
          ({Math.round(benchmarkData?.overallPercentile || 0)}th percentile) with an overall score of {benchmarkData?.overallScore}.
        </Typography>
      </Alert>

      {/* Main Content */}
      <Paper sx={{ borderRadius: 2, flex: 1, overflow: 'hidden' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Comparison" icon={<CompareIcon />} />
          <Tab label="Ranking" icon={<LeaderboardIcon />} />
          <Tab label="Trends" icon={<TimelineIcon />} />
          <Tab label="Analysis" icon={<BarChartIcon />} />
        </Tabs>

        {/* Comparison Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Performance Comparison
            </Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
              Compare your agent's performance against industry standards and peer groups.
            </Alert>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Performance Radar
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={benchmarkRadarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="category" />
                    <PolarRadiusAxis />
                    <Radar name="Your Score" dataKey="score" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                    <Radar name="Industry Avg" dataKey="industry" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Peer Group Analysis
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart data={comparisonScatterData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="score" name="Score" />
                    <YAxis dataKey="percentile" name="Percentile" />
                    <RechartsTooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
                    <Scatter name="Agents" data={comparisonScatterData} fill="#8884d8" />
                  </ScatterChart>
                </ResponsiveContainer>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Detailed Comparison Table
                </Typography>
                <ComparisonTable data={comparisonData} />
              </Grid>
            </Grid>
          </Box>
        </TabPanel>

        {/* Ranking Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Performance Rankings
            </Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
              View detailed rankings across different categories and time periods.
            </Alert>
            
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Rank</TableCell>
                    <TableCell>Agent</TableCell>
                    <TableCell>Score</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Change</TableCell>
                    <TableCell>Benchmark</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rankingData.slice(0, 20).map((ranking) => (
                    <TableRow key={ranking.agentId}>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          {ranking.badge === 'gold' && <EmojiEventsIcon color="warning" />}
                          {ranking.badge === 'silver' && <MilitaryTechIcon color="secondary" />}
                          {ranking.badge === 'bronze' && <WorkspacePremiumIcon color="error" />}
                          <Typography variant="h6" fontWeight="bold">
                            #{ranking.rank}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Avatar sx={{ width: 24, height: 24, fontSize: 12 }}>
                            {ranking.agentName.charAt(0)}
                          </Avatar>
                          <Typography variant="body2" fontWeight="bold">
                            {ranking.agentName}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          {Math.round(ranking.score)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={ranking.category} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          {ranking.change > 0 && <ArrowUpwardIcon color="success" />}
                          {ranking.change < 0 && <ArrowDownwardIcon color="error" />}
                          {ranking.change === 0 && <RemoveIcon color="info" />}
                          <Typography variant="body2">
                            {Math.abs(ranking.change).toFixed(1)}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Rating value={Math.round(ranking.score / 20)} readOnly size="small" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </TabPanel>

        {/* Trends Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Performance Trends
            </Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
              Track performance trends over time and identify improvement patterns.
            </Alert>
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  30-Day Performance Trend
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trendChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line type="monotone" dataKey="score" stroke="#8884d8" strokeWidth={2} name="Score" />
                    <Line type="monotone" dataKey="percentile" stroke="#82ca9d" strokeWidth={2} name="Percentile" />
                  </LineChart>
                </ResponsiveContainer>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Trend Analysis
                  </Typography>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        30-Day Change
                      </Typography>
                      <Typography variant="h6" color="success.main">
                        +12.5%
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Average Improvement Rate
                      </Typography>
                      <Typography variant="h6">
                        0.42% per day
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Projected 30-Day Score
                      </Typography>
                      <Typography variant="h6" color="primary.main">
                        94.2
                      </Typography>
                    </Box>
                  </Stack>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Ranking Progress
                  </Typography>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Current Rank
                      </Typography>
                      <Typography variant="h6">
                        #{benchmarkData?.overallRank}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Rank Change (30 days)
                      </Typography>
                      <Typography variant="h6" color="success.main">
                        +15 positions
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Top 10 Target
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={75}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        75% of the way there
                      </Typography>
                    </Box>
                  </Stack>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>

        {/* Analysis Tab */}
        <TabPanel value={tabValue} index={3}>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Performance Analysis
            </Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
              In-depth analysis of performance metrics and improvement opportunities.
            </Alert>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Strengths
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleIcon color="success" />
                      </ListItemIcon>
                      <ListItemText primary="High Response Time" secondary="95th percentile performance" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleIcon color="success" />
                      </ListItemIcon>
                      <ListItemText primary="Excellent Reliability" secondary="99.9% uptime maintained" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleIcon color="success" />
                      </ListItemIcon>
                      <ListItemText primary="Strong Security Score" secondary="Above industry average" />
                    </ListItem>
                  </List>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Improvement Areas
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <WarningIcon color="warning" />
                      </ListItemIcon>
                      <ListItemText primary="Scalability" secondary="Room for improvement in load handling" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <WarningIcon color="warning" />
                      </ListItemIcon>
                      <ListItemText primary="Resource Efficiency" secondary="Optimization opportunities identified" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <InfoIcon color="info" />
                      </ListItemIcon>
                      <ListItemText primary="Peer Comparison" secondary="Below average in some metrics" />
                    </ListItem>
                  </List>
                </Card>
              </Grid>
              
              <Grid item xs={12}>
                <Card variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Recommendations
                  </Typography>
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography>Performance Optimization</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography>
                        Focus on improving scalability metrics through better resource management and 
                        load balancing strategies. Consider implementing caching mechanisms and 
                        optimizing database queries.
                      </Typography>
                    </AccordionDetails>
                  </Accordion>
                  
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography>Competitive Analysis</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography>
                        Study top-performing agents in your category to identify best practices and 
                        implementation strategies that could benefit your system.
                      </Typography>
                    </AccordionDetails>
                  </Accordion>
                  
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography>Continuous Improvement</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography>
                        Implement regular performance monitoring and establish a continuous improvement 
                        process to maintain and enhance your competitive position.
                      </Typography>
                    </AccordionDetails>
                  </Accordion>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default Benchmarking;