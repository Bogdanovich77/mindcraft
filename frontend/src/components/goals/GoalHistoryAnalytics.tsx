import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  LinearProgress,
  Stack,
  Paper,
  Avatar,
  Tooltip,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material';
import {
  Timeline as TimelineIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon,
  Assessment as AssessmentIcon,
  Info as InfoIcon,
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
  DateRange as DateRangeIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  ShowChart as LineChartIcon
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import type { RootState } from '../../store/types';
import type { Goal, GoalStatus, GoalType, GoalPriority } from '../../types/goals';

interface GoalHistoryAnalyticsProps {
  agentId?: string;
  goals?: Goal[];
  timeRange?: 'week' | 'month' | 'quarter' | 'year';
  onExport?: (format: 'csv' | 'json' | 'pdf') => void;
}

interface HistoricalData {
  date: string;
  completed: number;
  failed: number;
  created: number;
  averageCompletionTime: number;
  successRate: number;
}

interface GoalStatistics {
  totalCreated: number;
  totalCompleted: number;
  totalFailed: number;
  averageCompletionTime: number;
  successRate: number;
  completionByType: Record<GoalType, number>;
  completionByPriority: Record<GoalPriority, number>;
  monthlyTrends: HistoricalData[];
  topPerformers: Goal[];
  bottlenecks: Goal[];
}

const STATUS_COLORS = {
  completed: '#4caf50',
  failed: '#f44336',
  active: '#2196f3',
  pending: '#ff9800',
  paused: '#9c27b0',
  cancelled: '#757575'
};

const TYPE_COLORS = {
  strategic: '#1976d2',
  tactical: '#388e3c',
  operational: '#f57c00'
};

const PRIORITY_COLORS = {
  0: '#d32f2f', // CRITICAL
  1: '#f57c00', // HIGH
  2: '#1976d2', // MEDIUM
  3: '#757575'  // LOW
};

export const GoalHistoryAnalytics: React.FC<GoalHistoryAnalyticsProps> = ({
  agentId,
  goals = [],
  timeRange = 'month',
  onExport
}) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>(timeRange);
  const [chartType, setChartType] = useState<'line' | 'area' | 'bar'>('line');
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [goalDetailDialogOpen, setGoalDetailDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  const goalStatistics = useMemo((): GoalStatistics => {
    // Calculate basic statistics
    const totalCreated = goals.length;
    const totalCompleted = goals.filter(g => g.status === 'completed').length;
    const totalFailed = goals.filter(g => g.status === 'failed').length;
    
    // Calculate average completion time (mock calculation)
    const completedGoals = goals.filter(g => g.status === 'completed');
    const averageCompletionTime = completedGoals.length > 0 
      ? completedGoals.reduce((sum, goal) => {
          const completionTime = (goal.updatedAt - goal.createdAt) / (1000 * 60 * 60); // hours
          return sum + completionTime;
        }, 0) / completedGoals.length
      : 0;

    const successRate = totalCreated > 0 ? (totalCompleted / totalCreated) * 100 : 0;

    // Completion by type
    const completionByType: Record<GoalType, number> = {
      strategic: 0,
      tactical: 0,
      operational: 0
    };
    
    goals.forEach(goal => {
      if (goal.status === 'completed') {
        completionByType[goal.type]++;
      }
    });

    // Completion by priority
    const completionByPriority: Record<GoalPriority, number> = {
      0: 0, 1: 0, 2: 0, 3: 0
    };
    
    goals.forEach(goal => {
      if (goal.status === 'completed') {
        completionByPriority[goal.priority]++;
      }
    });

    // Generate mock monthly trends (in real implementation, this would come from historical data)
    const monthlyTrends: HistoricalData[] = [];
    const now = new Date();
    const monthsToShow = selectedTimeRange === 'week' ? 1 : 
                        selectedTimeRange === 'month' ? 1 : 
                        selectedTimeRange === 'quarter' ? 3 : 12;

    for (let i = monthsToShow - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthGoals = goals.filter(goal => {
        const goalDate = new Date(goal.createdAt);
        return goalDate.getMonth() === date.getMonth() && 
               goalDate.getFullYear() === date.getFullYear();
      });

      const monthCompleted = monthGoals.filter(g => g.status === 'completed').length;
      const monthFailed = monthGoals.filter(g => g.status === 'failed').length;
      const monthAvgTime = monthCompleted > 0 
        ? monthGoals.reduce((sum, goal) => sum + (goal.updatedAt - goal.createdAt) / (1000 * 60 * 60), 0) / monthCompleted
        : 0;

      monthlyTrends.push({
        date: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        completed: monthCompleted,
        failed: monthFailed,
        created: monthGoals.length,
        averageCompletionTime: monthAvgTime,
        successRate: monthGoals.length > 0 ? (monthCompleted / monthGoals.length) * 100 : 0
      });
    }

    // Identify top performers (goals completed quickly with high priority)
    const topPerformers = completedGoals
      .filter(goal => goal.priority <= 1)
      .sort((a, b) => {
        const timeA = (a.updatedAt - a.createdAt) / (1000 * 60 * 60);
        const timeB = (b.updatedAt - b.createdAt) / (1000 * 60 * 60);
        return timeA - timeB;
      })
      .slice(0, 5);

    // Identify bottlenecks (goals taking too long or failing)
    const bottlenecks = goals
      .filter(goal => {
        const timeSinceCreation = (Date.now() - goal.createdAt) / (1000 * 60 * 60);
        return (goal.status === 'failed' || goal.status === 'paused') || 
               (goal.status !== 'completed' && timeSinceCreation > 168); // > 1 week
      })
      .sort((a, b) => {
        const timeA = (Date.now() - a.createdAt) / (1000 * 60 * 60);
        const timeB = (Date.now() - b.createdAt) / (1000 * 60 * 60);
        return timeB - timeA;
      })
      .slice(0, 5);

    return {
      totalCreated,
      totalCompleted,
      totalFailed,
      averageCompletionTime,
      successRate,
      completionByType,
      completionByPriority,
      monthlyTrends,
      topPerformers,
      bottlenecks
    };
  }, [goals, selectedTimeRange]);

  const pieChartData = useMemo(() => {
    return Object.entries(goalStatistics.completionByType).map(([type, count]) => ({
      name: type.charAt(0).toUpperCase() + type.slice(1),
      value: count,
      color: TYPE_COLORS[type as GoalType]
    }));
  }, [goalStatistics.completionByType]);

  const priorityPieData = useMemo(() => {
    return Object.entries(goalStatistics.completionByPriority)
      .filter(([_, count]) => count > 0)
      .map(([priority, count]) => ({
        name: `Priority ${priority}`,
        value: count,
        color: PRIORITY_COLORS[Number(priority) as GoalPriority]
      }));
  }, [goalStatistics.completionByPriority]);

  const handleExport = (format: 'csv' | 'json' | 'pdf') => {
    onExport?.(format);
    setExportDialogOpen(false);
  };

  const formatDuration = (hours: number): string => {
    if (hours < 1) return `${Math.round(hours * 60)}m`;
    if (hours < 24) return `${Math.round(hours)}h`;
    return `${Math.round(hours / 24)}d`;
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Goal History Analytics
        </Typography>
        <Stack direction="row" spacing={2}>
          <ToggleButtonGroup
            value={chartType}
            exclusive
            onChange={(_, value) => value && setChartType(value)}
            size="small"
          >
            <ToggleButton value="line">
              <LineChartIcon />
            </ToggleButton>
            <ToggleButton value="area">
              <BarChartIcon />
            </ToggleButton>
            <ToggleButton value="bar">
              <PieChartIcon />
            </ToggleButton>
          </ToggleButtonGroup>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={selectedTimeRange}
              label="Time Range"
              onChange={(e) => setSelectedTimeRange(e.target.value as any)}
            >
              <MenuItem value="week">Week</MenuItem>
              <MenuItem value="month">Month</MenuItem>
              <MenuItem value="quarter">Quarter</MenuItem>
              <MenuItem value="year">Year</MenuItem>
            </Select>
          </FormControl>
          <Tooltip title="Export Data">
            <IconButton onClick={() => setExportDialogOpen(true)}>
              <DownloadIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      {/* Statistics Overview */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <AssessmentIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {goalStatistics.totalCreated}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Goals Created
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <CheckCircleIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold" color="success.main">
                    {goalStatistics.totalCompleted}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Goals Completed
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: goalStatistics.successRate >= 80 ? 'success.main' : 'warning.main' }}>
                  <TrendingUpIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {Math.round(goalStatistics.successRate)}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Success Rate
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: 'info.main' }}>
                  <ScheduleIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {formatDuration(goalStatistics.averageCompletionTime)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Avg Completion Time
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        {/* Trend Chart */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Goal Completion Trends
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                {chartType === 'line' ? (
                  <LineChart data={goalStatistics.monthlyTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Line type="monotone" dataKey="completed" stroke="#4caf50" name="Completed" />
                    <Line type="monotone" dataKey="failed" stroke="#f44336" name="Failed" />
                    <Line type="monotone" dataKey="created" stroke="#2196f3" name="Created" />
                  </LineChart>
                ) : chartType === 'area' ? (
                  <AreaChart data={goalStatistics.monthlyTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Area type="monotone" dataKey="completed" stackId="1" stroke="#4caf50" fill="#4caf50" />
                    <Area type="monotone" dataKey="failed" stackId="1" stroke="#f44336" fill="#f44336" />
                  </AreaChart>
                ) : (
                  <BarChart data={goalStatistics.monthlyTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Bar dataKey="completed" fill="#4caf50" />
                    <Bar dataKey="failed" fill="#f44336" />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Type Distribution */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Completion by Type
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Priority Distribution */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Completion by Priority
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={priorityPieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {priorityPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Success Rate Trend */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Success Rate Trend
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={goalStatistics.monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 100]} />
                  <RechartsTooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="successRate" 
                    stroke="#4caf50" 
                    name="Success Rate %"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Performers */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Top Performers
              </Typography>
              <List>
                {goalStatistics.topPerformers.length === 0 ? (
                  <ListItem>
                    <ListItemText
                      primary="No completed goals yet"
                      secondary="Complete some goals to see top performers"
                    />
                  </ListItem>
                ) : (
                  goalStatistics.topPerformers.map((goal, index) => (
                    <ListItem key={goal.id} sx={{ py: 1 }}>
                      <ListItemIcon>
                        <Avatar sx={{ bgcolor: 'success.main', width: 32, height: 32 }}>
                          {index + 1}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={goal.description}
                        secondary={
                          <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                            <Chip size="small" label={goal.type} />
                            <Chip 
                              size="small" 
                              label={`Priority ${goal.priority}`}
                              color={goal.priority === 0 ? 'error' : goal.priority === 1 ? 'warning' : 'default'}
                            />
                            <Typography variant="caption">
                              Completed in {formatDuration((goal.updatedAt - goal.createdAt) / (1000 * 60 * 60))}
                            </Typography>
                          </Stack>
                        }
                      />
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedGoal(goal);
                            setGoalDetailDialogOpen(true);
                          }}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                    </ListItem>
                  ))
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Bottlenecks */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Potential Bottlenecks
              </Typography>
              <List>
                {goalStatistics.bottlenecks.length === 0 ? (
                  <ListItem>
                    <ListItemText
                      primary="No bottlenecks detected"
                      secondary="All goals are progressing well"
                    />
                  </ListItem>
                ) : (
                  goalStatistics.bottlenecks.map((goal) => (
                    <ListItem key={goal.id} sx={{ py: 1 }}>
                      <ListItemIcon>
                        <Avatar sx={{ bgcolor: 'warning.main', width: 32, height: 32 }}>
                          <ErrorIcon />
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={goal.description}
                        secondary={
                          <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                            <Chip 
                              size="small" 
                              label={goal.status}
                              color={goal.status === 'failed' ? 'error' : 'warning'}
                            />
                            <Typography variant="caption">
                              Active for {formatDuration((Date.now() - goal.createdAt) / (1000 * 60 * 60))}
                            </Typography>
                          </Stack>
                        }
                      />
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedGoal(goal);
                            setGoalDetailDialogOpen(true);
                          }}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                    </ListItem>
                  ))
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Export Dialog */}
      <Dialog open={exportDialogOpen} onClose={() => setExportDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Export Analytics Data</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Choose the format for exporting goal analytics data:
          </Typography>
          <Stack spacing={2}>
            <Button
              variant="outlined"
              onClick={() => handleExport('csv')}
              startIcon={<DownloadIcon />}
            >
              Export as CSV
            </Button>
            <Button
              variant="outlined"
              onClick={() => handleExport('json')}
              startIcon={<DownloadIcon />}
            >
              Export as JSON
            </Button>
            <Button
              variant="outlined"
              onClick={() => handleExport('pdf')}
              startIcon={<DownloadIcon />}
            >
              Export as PDF Report
            </Button>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExportDialogOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* Goal Detail Dialog */}
      <Dialog open={goalDetailDialogOpen} onClose={() => setGoalDetailDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Goal Details</DialogTitle>
        <DialogContent>
          {selectedGoal && (
            <Stack spacing={3} sx={{ mt: 1 }}>
              <Typography variant="body1">
                {selectedGoal.description}
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    Type: {selectedGoal.type}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    Priority: {selectedGoal.priority}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    Status: {selectedGoal.status}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    Progress: {Math.round(selectedGoal.progress.percentage)}%
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    Created: {new Date(selectedGoal.createdAt).toLocaleDateString()}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    Updated: {new Date(selectedGoal.updatedAt).toLocaleDateString()}
                  </Typography>
                </Grid>
              </Grid>
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Progress
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={selectedGoal.progress.percentage}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGoalDetailDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GoalHistoryAnalytics;