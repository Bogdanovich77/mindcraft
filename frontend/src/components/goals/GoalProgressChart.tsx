/**
 * Goal Progress Chart
 * 
 * Advanced visualization for goal progress over time.
 * Complements existing GoalProgressTracker component with Recharts integration.
 */

import React, { useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ToggleButton,
  ToggleButtonGroup,
  Chip,
  Tooltip,
  IconButton,
  Card,
  CardContent,
  useTheme
} from '@mui/material';
import {
  Timeline as TimelineIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon,
  CalendarToday as CalendarIcon,
  Speed as SpeedIcon,
  Assessment as AssessmentIcon,
  Fullscreen as FullscreenIcon,
  Download as ExportIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import type { Goal, GoalStatus, GoalType, GoalPriority } from '../../types/goals';

interface GoalProgressChartProps {
  goals?: Goal[];
  selectedGoalIds?: string[];
  onGoalSelect?: (goalId: string) => void;
  onRefresh?: () => void;
  height?: number;
  showControls?: boolean;
}

interface ProgressDataPoint {
  date: string;
  timestamp: number;
  progress: number;
  goalId: string;
  goalName: string;
  goalType: GoalType;
  status: GoalStatus;
}

interface MilestoneData {
  name: string;
  completed: boolean;
  completionDate?: string;
  progress: number;
}

interface GoalTypeDistribution {
  type: GoalType;
  count: number;
  percentage: number;
}

interface StatusDistribution {
  status: GoalStatus;
  count: number;
  percentage: number;
}

const GoalProgressChart: React.FC<GoalProgressChartProps> = ({
  goals = [],
  selectedGoalIds = [],
  onGoalSelect,
  onRefresh,
  height = 400,
  showControls = true
}) => {
  const theme = useTheme();
  const { agents } = useSelector((state: RootState) => state.agents);

  // Chart view modes
  const [viewMode, setViewMode] = useState<'timeline' | 'comparison' | 'distribution' | 'milestones'>('timeline');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [chartType, setChartType] = useState<'line' | 'area' | 'bar'>('line');

  // Process progress data
  const progressData = useMemo(() => {
    if (!goals.length) return [];

    const now = Date.now();
    const timeRangeMs = timeRange === '7d' ? 7 * 24 * 60 * 60 * 1000 :
                        timeRange === '30d' ? 30 * 24 * 60 * 60 * 1000 :
                        timeRange === '90d' ? 90 * 24 * 60 * 60 * 1000 :
                        now; // all

    return goals
      .filter(goal => selectedGoalIds.length === 0 || selectedGoalIds.includes(goal.id))
      .map(goal => {
        // Generate historical data points (simulate progress over time)
        const dataPoints: ProgressDataPoint[] = [];
        const createdAt = goal.createdAt;
        const duration = goal.estimatedDuration || 60; // minutes
        
        // Generate progress points based on goal status and duration
        if (goal.status === 'completed') {
          const completedAt = goal.completedAt || now;
          const totalDuration = completedAt - createdAt;
          
          // Create progress points for completed goals
          for (let i = 0; i <= 10; i++) {
            const pointTime = createdAt + (totalDuration * i / 10);
            if (pointTime > now) break;
            
            dataPoints.push({
              date: new Date(pointTime).toLocaleDateString(),
              timestamp: pointTime,
              progress: Math.min(100, (i / 10) * 100),
              goalId: goal.id,
              goalName: goal.title,
              goalType: goal.type,
              status: goal.status
            });
          }
        } else if (goal.status === 'in_progress') {
          // For in-progress goals, show actual progress with some projection
          const elapsed = now - createdAt;
          const expectedProgress = Math.min(100, (elapsed / (duration * 60 * 1000)) * 100);
          
          // Create historical points leading to current progress
          for (let i = 0; i <= 10; i++) {
            const pointTime = createdAt + (elapsed * i / 10);
            if (pointTime > now) break;
            
            const pointProgress = i === 10 ? goal.progress.percentage : expectedProgress * (i / 10);
            
            dataPoints.push({
              date: new Date(pointTime).toLocaleDateString(),
              timestamp: pointTime,
              progress: Math.min(100, pointProgress),
              goalId: goal.id,
              goalName: goal.title,
              goalType: goal.type,
              status: goal.status
            });
          }
        } else {
          // For pending goals, show flat line
          for (let i = 0; i <= 5; i++) {
            const pointTime = createdAt + (i * 24 * 60 * 60 * 1000); // Daily points
            if (pointTime > now || pointTime > createdAt + timeRangeMs) break;
            
            dataPoints.push({
              date: new Date(pointTime).toLocaleDateString(),
              timestamp: pointTime,
              progress: 0,
              goalId: goal.id,
              goalName: goal.title,
              goalType: goal.type,
              status: goal.status
            });
          }
        }

        return dataPoints;
      })
      .flat()
      .filter(point => point.timestamp >= now - timeRangeMs)
      .sort((a, b) => a.timestamp - b.timestamp);
  }, [goals, selectedGoalIds, timeRange]);

  // Goal type distribution
  const typeDistribution = useMemo(() => {
    const distribution: Record<GoalType, number> = {
      strategic: 0,
      tactical: 0,
      operational: 0
    };

    goals.forEach(goal => {
      distribution[goal.type]++;
    });

    const total = goals.length;
    return Object.entries(distribution).map(([type, count]) => ({
      type: type as GoalType,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0
    }));
  }, [goals]);

  // Status distribution
  const statusDistribution = useMemo(() => {
    const distribution: Record<GoalStatus, number> = {
      pending: 0,
      active: 0,
      in_progress: 0,
      completed: 0,
      failed: 0,
      paused: 0,
      cancelled: 0
    };

    goals.forEach(goal => {
      distribution[goal.status]++;
    });

    const total = goals.length;
    return Object.entries(distribution).map(([status, count]) => ({
      status: status as GoalStatus,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0
    }));
  }, [goals]);

  // Milestone data
  const milestoneData = useMemo(() => {
    return goals
      .filter(goal => selectedGoalIds.length === 0 || selectedGoalIds.includes(goal.id))
      .map(goal => {
        const milestones = goal.progress.milestones || [];
        return {
          name: goal.title,
          completed: milestones.filter(m => m.completed).length,
          completionDate: milestones.find(m => m.completed)?.completedAt ? 
            new Date(milestones.find(m => m.completed)!.completedAt).toLocaleDateString() : 
            undefined,
          progress: goal.progress.percentage
        } as MilestoneData;
      });
  }, [goals, selectedGoalIds]);

  // Colors for chart
  const getGoalColor = (goalType: GoalType): string => {
    switch (goalType) {
      case 'strategic': return theme.palette.primary.main;
      case 'tactical': return theme.palette.secondary.main;
      case 'operational': return theme.palette.success.main;
      default: return theme.palette.grey[500];
    }
  };

  const getStatusColor = (status: GoalStatus): string => {
    switch (status) {
      case 'completed': return theme.palette.success.main;
      case 'in_progress': return theme.palette.primary.main;
      case 'active': return theme.palette.info.main;
      case 'pending': return theme.palette.warning.main;
      case 'failed': return theme.palette.error.main;
      case 'paused': return theme.palette.grey[500];
      case 'cancelled': return theme.palette.grey[400];
      default: return theme.palette.grey[300];
    }
  };

  const getPriorityColor = (priority: GoalPriority): string => {
    switch (priority) {
      case 0: return theme.palette.error.main; // critical
      case 1: return theme.palette.warning.main; // high
      case 2: return theme.palette.info.main; // medium
      case 3: return theme.palette.success.main; // low
      default: return theme.palette.grey[500];
    }
  };

  // Export data
  const handleExport = () => {
    const exportData = {
      goals,
      progressData,
      typeDistribution,
      statusDistribution,
      milestoneData,
      exportedAt: new Date().toISOString(),
      timeRange,
      viewMode
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `goal-progress-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Render timeline chart
  const renderTimelineChart = () => (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={progressData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="date" 
          tick={{ fontSize: 12 }}
        />
        <YAxis 
          tick={{ fontSize: 12 }}
          domain={[0, 100]}
        />
        <RechartsTooltip
          content={({ active, payload }: any) => {
            if (active && payload && payload.length > 0) {
              const data = payload[0];
              return (
                <Card>
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      {data.goalName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Type: {data.goalType}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Progress: {data.progress}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Status: {data.status}
                    </Typography>
                  </CardContent>
                </Card>
              );
            }
            return null;
          }}
        />
        <Legend />
        {progressData.map((data, index) => {
          const goal = goals.find(g => g.id === data.goalId);
          return (
            <Line
              key={`${data.goalId}-${index}`}
              type="monotone"
              data={[data]}
              stroke={goal ? getGoalColor(goal.type) : theme.palette.grey[500]}
              strokeWidth={selectedGoalIds.includes(data.goalId) ? 3 : 2}
              dot={{ fill: goal ? getGoalColor(goal.type) : theme.palette.grey[500] }}
              activeDot={{ r: 6 }}
            />
          );
        })}
      </LineChart>
    </ResponsiveContainer>
  );

  // Render area chart
  const renderAreaChart = () => (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={progressData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="date" 
          tick={{ fontSize: 12 }}
        />
        <YAxis 
          tick={{ fontSize: 12 }}
          domain={[0, 100]}
        />
        <RechartsTooltip
          content={({ active, payload }: any) => {
            if (active && payload && payload.length > 0) {
              const data = payload[0];
              return (
                <Card>
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      {data.goalName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Progress: {data.progress}%
                    </Typography>
                  </CardContent>
                </Card>
              );
            }
            return null;
          }}
        />
        <Legend />
        {progressData.map((data, index) => {
          const goal = goals.find(g => g.id === data.goalId);
          return (
            <Area
              key={`${data.goalId}-${index}`}
              type="monotone"
              data={[data]}
              stroke={goal ? getGoalColor(goal.type) : theme.palette.grey[500]}
              fill={goal ? getGoalColor(goal.type) : theme.palette.grey[500]}
              fillOpacity={0.3}
              strokeWidth={selectedGoalIds.includes(data.goalId) ? 3 : 2}
            />
          );
        })}
      </AreaChart>
    </ResponsiveContainer>
  );

  // Render bar chart
  const renderBarChart = () => (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={progressData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="date" 
          tick={{ fontSize: 12 }}
        />
        <YAxis 
          tick={{ fontSize: 12 }}
          domain={[0, 100]}
        />
        <RechartsTooltip
          content={({ active, payload }: any) => {
            if (active && payload && payload.length > 0) {
              const data = payload[0];
              return (
                <Card>
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      {data.goalName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Progress: {data.progress}%
                    </Typography>
                  </CardContent>
                </Card>
              );
            }
            return null;
          }}
        />
        <Legend />
        {progressData.map((data, index) => {
          const goal = goals.find(g => g.id === data.goalId);
          return (
            <Bar
              key={`${data.goalId}-${index}`}
              dataKey="progress"
              data={[data]}
              fill={goal ? getGoalColor(goal.type) : theme.palette.grey[500]}
              stroke={goal ? getGoalColor(goal.type) : theme.palette.grey[500]}
            />
          );
        })}
      </BarChart>
    </ResponsiveContainer>
  );

  // Render distribution pie chart
  const renderDistributionChart = () => (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={typeDistribution}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ type, percentage }) => `${type} (${percentage}%)`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="count"
        >
          {typeDistribution.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={getGoalColor(entry.type)}
            />
          ))}
        </Pie>
        <RechartsTooltip />
      </PieChart>
    </ResponsiveContainer>
  );

  // Render status distribution
  const renderStatusChart = () => (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={statusDistribution}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ status, percentage }) => `${status} (${percentage}%)`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="count"
        >
          {statusDistribution.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={getStatusColor(entry.status)}
            />
          ))}
        </Pie>
        <RechartsTooltip />
      </PieChart>
    </ResponsiveContainer>
  );

  // Render milestone chart
  const renderMilestoneChart = () => (
    <Box sx={{ height, overflow: 'auto' }}>
      {milestoneData.map((milestone, index) => (
        <Card key={index} sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="subtitle2" gutterBottom>
              {milestone.name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Milestones Completed:
              </Typography>
              <Chip 
                label={`${milestone.completed} completed`}
                color={milestone.completed > 0 ? 'success' : 'default'}
                size="small"
              />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Overall Progress:
              </Typography>
              <Chip 
                label={`${milestone.progress}%`}
                color={milestone.progress >= 75 ? 'success' : milestone.progress >= 50 ? 'warning' : 'error'}
                size="small"
              />
            </Box>
            {milestone.completionDate && (
              <Typography variant="body2" color="text.secondary">
                Last Completion: {milestone.completionDate}
              </Typography>
            )}
          </CardContent>
        </Card>
      ))}
    </Box>
  );

  const renderChart = () => {
    switch (viewMode) {
      case 'timeline':
        switch (chartType) {
          case 'line': return renderTimelineChart();
          case 'area': return renderAreaChart();
          case 'bar': return renderBarChart();
          default: return renderTimelineChart();
        }
      case 'distribution': return renderDistributionChart();
      case 'milestones': return renderMilestoneChart();
      default: return renderTimelineChart();
    }
  };

  return (
    <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Controls */}
      {showControls && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" color="text.secondary">
              View:
            </Typography>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(_, newMode) => setViewMode(newMode as any)}
              size="small"
            >
              <Tooltip title="Timeline view">
                <ToggleButton value="timeline">
                  <TimelineIcon />
                </ToggleButton>
              </Tooltip>
              <Tooltip title="Distribution view">
                <ToggleButton value="distribution">
                  <AssessmentIcon />
                </ToggleButton>
              </Tooltip>
              <Tooltip title="Milestones view">
                <ToggleButton value="milestones">
                  <CalendarIcon />
                </ToggleButton>
              </Tooltip>
            </ToggleButtonGroup>
          </Box>

          {viewMode === 'timeline' && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Chart:
              </Typography>
              <ToggleButtonGroup
                value={chartType}
                exclusive
                onChange={(_, newType) => setChartType(newType as any)}
                size="small"
              >
                <Tooltip title="Line chart">
                  <ToggleButton value="line">
                    <TrendingFlatIcon />
                  </ToggleButton>
                </Tooltip>
                <Tooltip title="Area chart">
                  <ToggleButton value="area">
                    <TrendingUpIcon />
                  </ToggleButton>
                </Tooltip>
                <Tooltip title="Bar chart">
                  <ToggleButton value="bar">
                    <SpeedIcon />
                  </ToggleButton>
                </Tooltip>
              </ToggleButtonGroup>
            </Box>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Range:
            </Typography>
            <FormControl size="small">
              <Select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
              >
                <MenuItem value="7d">Last 7 days</MenuItem>
                <MenuItem value="30d">Last 30 days</MenuItem>
                <MenuItem value="90d">Last 90 days</MenuItem>
                <MenuItem value="all">All time</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title="Refresh data">
            <IconButton onClick={onRefresh} size="small">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Export data">
            <IconButton onClick={handleExport} size="small">
              <ExportIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Fullscreen">
            <IconButton size="small">
              <FullscreenIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      )}

      {/* Chart */}
      <Box sx={{ flex: 1, minHeight: 0 }}>
        {goals.length > 0 ? renderChart() : (
          <Box
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            height={height}
            color="text.secondary"
          >
            <Typography variant="h6" gutterBottom>
              No Goal Data Available
            </Typography>
            <Typography variant="body2">
              Create goals to see progress visualization
            </Typography>
          </Box>
        )}
      </Box>

      {/* Statistics */}
      {goals.length > 0 && (
        <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            Statistics
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <Chip 
              label={`${goals.length} total goals`} 
              size="small" 
              variant="outlined" 
            />
            <Chip 
              label={`${goals.filter(g => g.status === 'completed').length} completed`} 
              color="success" 
              size="small" 
              variant="outlined" 
            />
            <Chip 
              label={`${goals.filter(g => g.status === 'in_progress').length} in progress`} 
              color="primary" 
              size="small" 
              variant="outlined" 
            />
            <Chip 
              label={`${goals.filter(g => g.status === 'pending').length} pending`} 
              color="warning" 
              size="small" 
              variant="outlined" 
            />
            <Chip 
              label={`Avg progress: ${Math.round(goals.reduce((sum, g) => sum + g.progress.percentage, 0) / goals.length)}%`} 
              color="info" 
              size="small" 
              variant="outlined" 
            />
          </Box>
        </Box>
      )}
    </Paper>
  );
};

export default GoalProgressChart;