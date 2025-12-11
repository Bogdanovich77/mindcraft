import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Tooltip,
  useTheme,
  alpha,
  Tabs,
  Tab,
  Button,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import {
  Timeline,
  TrendingUp,
  TrendingDown,
  Assessment,
  Refresh,
  Download
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import {
  selectSkills,
  selectSkillProgression,
  selectSelectedAgent
} from '../../store/index';
import ErrorBoundary from '../common/ErrorBoundary';
import type {
  Skill,
  SkillProgression,
  PerformanceTrend
} from '../../types/skills';

interface PerformanceTrendsProps {
  agentId?: string;
  compact?: boolean;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`performance-tabpanel-${index}`}
      aria-labelledby={`performance-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export const PerformanceTrends: React.FC<PerformanceTrendsProps> = ({
  agentId,
  compact = false
}) => {
  const theme = useTheme();
  const selectedAgent = useSelector(selectSelectedAgent);
  const selectedAgentId = agentId || selectedAgent?.id || '';
  const skills = useSelector(selectSkills);
  
  const [selectedSkillId, setSelectedSkillId] = useState<string>('');
  const [activeTab, setActiveTab] = useState(0);
  const [showComparison, setShowComparison] = useState(false);
  const [timeRange, setTimeRange] = useState('7d');

  // Get selected skill
  const selectedSkill = useMemo(() => {
    if (!selectedSkillId || !skills) return null;
    const skillsArray = Array.isArray(skills) ? skills : Object.values(skills || {});
    return skillsArray.find((skill: any) => skill.id === selectedSkillId) || null;
  }, [selectedSkillId, skills]);

  // Get selected skill progression
  const selectedProgression = useSelector((state: any) =>
    selectedSkillId ? selectSkillProgression(state, selectedSkillId) : null
  );

  // Prepare performance trend data
  const performanceTrendData = useMemo(() => {
    if (!selectedProgression?.performanceTrends) return [];
    
    return selectedProgression.performanceTrends.map((trend: PerformanceTrend) => ({
      date: new Date(trend.timestamp).toLocaleDateString(),
      timestamp: trend.timestamp,
      metric: trend.metric,
      value: Math.round(trend.value * 100),
      context: trend.context,
      trend: trend.trend,
      confidence: Math.round(trend.confidence * 100)
    }));
  }, [selectedProgression]);

  // Prepare performance metrics data
  const performanceMetricsData = useMemo(() => {
    if (!selectedProgression?.performanceTrends) return [];
    
    const latestTrends = selectedProgression.performanceTrends.slice(-10);
    return latestTrends.map((trend: PerformanceTrend) => {
      return {
        date: new Date(trend.timestamp).toLocaleDateString(),
        accuracy: trend.metric === 'accuracy' ? trend.value : 0,
        speed: trend.metric === 'speed' ? trend.value : 0,
        consistency: trend.metric === 'consistency' ? trend.value : 0,
        efficiency: trend.metric === 'efficiency' ? trend.value : 0,
        quality: trend.metric === 'quality' ? trend.value : 0,
        overall: trend.value
      };
    });
  }, [selectedProgression]);

  // Prepare radar chart data
  const radarChartData = useMemo(() => {
    if (!selectedProgression?.performanceTrends) return [];
    
    // Get the latest trend for each metric type
    const latestTrends = selectedProgression.performanceTrends;
    if (latestTrends.length === 0) return [];
    
    const metrics = ['accuracy', 'efficiency', 'consistency', 'quality', 'speed'];
    const radarData = metrics.map(metric => {
      const latestMetric = latestTrends
        .filter(trend => trend.metric === metric)
        .pop();
      
      return {
        metric: metric.charAt(0).toUpperCase() + metric.slice(1),
        value: Math.round((latestMetric?.value || 0) * 100),
        fullMark: 100
      };
    });
    
    return radarData;
  }, [selectedProgression]);

  // Calculate trend statistics
  const trendStatistics = useMemo(() => {
    if (performanceTrendData.length === 0) {
      return {
        averageEfficiency: 0,
        averageLearningVelocity: 0,
        averageSkillApplication: 0,
        averageOverallPerformance: 0,
        efficiencyTrend: 'stable',
        learningTrend: 'stable',
        applicationTrend: 'stable'
      };
    }

    const recent = performanceTrendData.slice(-5);
    const previous = performanceTrendData.slice(-10, -5);

    const calculateAverage = (data: any[], metric: string) => {
      const metricData = data.filter(item => item.metric === metric);
      if (metricData.length === 0) return 0;
      return metricData.reduce((sum, item) => sum + item.value, 0) / metricData.length;
    };

    const calculateTrend = (recentAvg: number, previousAvg: number) => {
      const difference = recentAvg - previousAvg;
      if (difference > 5) return 'improving';
      if (difference < -5) return 'declining';
      return 'stable';
    };

    return {
      averageEfficiency: Math.round(calculateAverage(recent, 'efficiency')),
      averageLearningVelocity: Math.round(calculateAverage(recent, 'value')),
      averageSkillApplication: Math.round(calculateAverage(recent, 'value')),
      averageOverallPerformance: Math.round(calculateAverage(recent, 'value')),
      efficiencyTrend: calculateTrend(
        calculateAverage(recent, 'efficiency'),
        previous.length > 0 ? calculateAverage(previous, 'efficiency') : calculateAverage(recent, 'efficiency')
      ),
      learningTrend: calculateTrend(
        calculateAverage(recent, 'value'),
        previous.length > 0 ? calculateAverage(previous, 'value') : calculateAverage(recent, 'value')
      ),
      applicationTrend: calculateTrend(
        calculateAverage(recent, 'value'),
        previous.length > 0 ? calculateAverage(previous, 'value') : calculateAverage(recent, 'value')
      )
    };
  }, [performanceTrendData]);

  // Initialize selected skill
  useEffect(() => {
    if (skills && !selectedSkillId) {
      const skillsArray = Array.isArray(skills) ? skills : Object.values(skills);
      if (skillsArray.length > 0) {
        const firstSkill = skillsArray[0] as Skill;
        setSelectedSkillId(firstSkill.id);
      }
    }
  }, [skills, selectedSkillId]);

  // Handle skill selection
  const handleSkillChange = (event: any) => {
    setSelectedSkillId(event.target.value);
  };

  // Handle tab change
  const handleTabChange = (event: any, newValue: number) => {
    setActiveTab(newValue);
  };

  // Get trend icon
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp color="success" />;
      case 'declining':
        return <TrendingDown color="error" />;
      default:
        return <Timeline color="action" />;
    }
  };

  // Get trend color
  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving':
        return 'success';
      case 'declining':
        return 'error';
      default:
        return 'default';
    }
  };

  // Render performance trends chart
  const renderPerformanceTrendsChart = () => {
    if (performanceTrendData.length === 0) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
          <Typography variant="body2" color="text.secondary">
            No performance trend data available
          </Typography>
        </Box>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={compact ? 300 : 400}>
        <LineChart data={performanceTrendData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis domain={[0, 100]} />
          <RechartsTooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="value"
            stroke={theme.palette.primary.main}
            strokeWidth={2}
            name="Performance Value"
          />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  // Render performance metrics chart
  const renderPerformanceMetricsChart = () => {
    if (performanceMetricsData.length === 0) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
          <Typography variant="body2" color="text.secondary">
            No performance metrics data available
          </Typography>
        </Box>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={compact ? 300 : 400}>
        <AreaChart data={performanceMetricsData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis domain={[0, 100]} />
          <RechartsTooltip />
          <Legend />
          <Area
            type="monotone"
            dataKey="accuracy"
            stroke={theme.palette.info.main}
            fill={alpha(theme.palette.info.main, 0.3)}
            name="Accuracy"
          />
          <Area
            type="monotone"
            dataKey="speed"
            stroke={theme.palette.success.main}
            fill={alpha(theme.palette.success.main, 0.3)}
            name="Speed"
          />
          <Area
            type="monotone"
            dataKey="consistency"
            stroke={theme.palette.warning.main}
            fill={alpha(theme.palette.warning.main, 0.3)}
            name="Consistency"
          />
          <Area
            type="monotone"
            dataKey="efficiency"
            stroke={theme.palette.secondary.main}
            fill={alpha(theme.palette.secondary.main, 0.3)}
            name="Efficiency"
          />
          <Area
            type="monotone"
            dataKey="quality"
            stroke={theme.palette.primary.main}
            fill={alpha(theme.palette.primary.main, 0.3)}
            name="Quality"
          />
        </AreaChart>
      </ResponsiveContainer>
    );
  };

  // Render radar chart
  const renderRadarChart = () => {
    if (radarChartData.length === 0) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
          <Typography variant="body2" color="text.secondary">
            No radar chart data available
          </Typography>
        </Box>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={compact ? 300 : 400}>
        <RadarChart data={radarChartData}>
          <PolarGrid />
          <PolarAngleAxis dataKey="metric" />
          <PolarRadiusAxis angle={90} domain={[0, 100]} />
          <Radar
            name="Performance"
            dataKey="value"
            stroke={theme.palette.primary.main}
            fill={theme.palette.primary.main}
            fillOpacity={0.6}
          />
        </RadarChart>
      </ResponsiveContainer>
    );
  };

  return (
    <ErrorBoundary>
      <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: '1fr' }}>
        {/* Controls */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Performance Trends
              </Typography>
              <Box>
                <Tooltip title="Refresh Data">
                  <IconButton size="small">
                    <Refresh />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Export Data">
                  <IconButton size="small">
                    <Download />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
            <Box sx={{
              display: 'grid',
              gap: 2,
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(3, 1fr)'
              }
            }}>
              <FormControl fullWidth size="small">
                <InputLabel>Skill</InputLabel>
                <Select
                  value={selectedSkillId}
                  onChange={handleSkillChange}
                  label="Skill"
                >
                  {skills && (Array.isArray(skills) ? skills : Object.values(skills)).map((skill: any) => (
                    <MenuItem key={skill.id} value={skill.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2">
                          {skill.type.replace('_', ' ').replace(/\b\w/g, (l: any) => l.toUpperCase())}
                        </Typography>
                        <Chip
                          label={`${Math.round(skill.proficiency.overall * 100)}%`}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth size="small">
                <InputLabel>Time Range</InputLabel>
                <Select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  label="Time Range"
                >
                  <MenuItem value="24h">Last 24 Hours</MenuItem>
                  <MenuItem value="7d">Last 7 Days</MenuItem>
                  <MenuItem value="30d">Last 30 Days</MenuItem>
                  <MenuItem value="90d">Last 90 Days</MenuItem>
                </Select>
              </FormControl>
              <FormControlLabel
                control={
                  <Switch
                    checked={showComparison}
                    onChange={(e) => setShowComparison(e.target.checked)}
                    size="small"
                  />
                }
                label="Show Comparison"
                sx={{ justifyContent: 'center' }}
              />
            </Box>
          </CardContent>
        </Card>

        {/* Statistics Cards */}
        <Box sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(4, 1fr)'
          }
        }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box>
                  <Typography variant="h4" color="primary.main">
                    {trendStatistics.averageEfficiency}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Avg Efficiency
                  </Typography>
                </Box>
                {getTrendIcon(trendStatistics.efficiencyTrend)}
              </Box>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box>
                  <Typography variant="h4" color="secondary.main">
                    {trendStatistics.averageLearningVelocity}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Learning Velocity
                  </Typography>
                </Box>
                {getTrendIcon(trendStatistics.learningTrend)}
              </Box>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box>
                  <Typography variant="h4" color="success.main">
                    {trendStatistics.averageSkillApplication}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Skill Application
                  </Typography>
                </Box>
                {getTrendIcon(trendStatistics.applicationTrend)}
              </Box>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box>
                  <Typography variant="h4" color="warning.main">
                    {trendStatistics.averageOverallPerformance}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Overall Performance
                  </Typography>
                </Box>
                <Assessment color="action" />
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Tabs */}
        <Card>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={activeTab} onChange={handleTabChange}>
              <Tab label="Performance Trends" />
              <Tab label="Detailed Metrics" />
              <Tab label="Skill Radar" />
            </Tabs>
          </Box>
          <TabPanel value={activeTab} index={0}>
            {renderPerformanceTrendsChart()}
          </TabPanel>
          <TabPanel value={activeTab} index={1}>
            {renderPerformanceMetricsChart()}
          </TabPanel>
          <TabPanel value={activeTab} index={2}>
            {renderRadarChart()}
          </TabPanel>
        </Card>
      </Box>
    </ErrorBoundary>
  );
};

export default PerformanceTrends;