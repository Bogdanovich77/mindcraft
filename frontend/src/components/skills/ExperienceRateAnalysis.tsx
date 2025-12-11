import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
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
  FormControlLabel,
  LinearProgress,
  Avatar
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
  ScatterChart,
  Scatter,
  ComposedChart
} from 'recharts';
import {
  Timeline,
  Speed,
  TrendingUp,
  TrendingDown,
  Assessment,
  Refresh,
  Download,
  Analytics,
  Insights
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import {
  selectSkills,
  selectSkillProgression,
  selectSelectedAgent
} from '../../store';
import type { SkillsState } from '../../store/slices/skillsSlice';
import ErrorBoundary from '../common/ErrorBoundary';
import type {
  Skill,
  SkillProgression,
  ExperiencePoint,
  LearningCurveData
} from '../../types/skills';

interface ExperienceRateAnalysisProps {
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
      id={`experience-tabpanel-${index}`}
      aria-labelledby={`experience-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export const ExperienceRateAnalysis: React.FC<ExperienceRateAnalysisProps> = ({
  agentId,
  compact = false
}) => {
  const theme = useTheme();
  const selectedAgent = useSelector(selectSelectedAgent);
  const selectedAgentId = agentId || selectedAgent?.id || '';
  const skills = useSelector(selectSkills);
  const progressions = useSelector((state: { skills: SkillsState }) =>
    selectedAgentId ? selectSkillProgression(state, selectedAgentId) : null
  );
  
  const [selectedSkillId, setSelectedSkillId] = useState<string>('');
  const [activeTab, setActiveTab] = useState(0);
  const [timeRange, setTimeRange] = useState('30d');
  const [showProjections, setShowProjections] = useState(false);
  const [analysisMode, setAnalysisMode] = useState<'rate' | 'cumulative' | 'efficiency'>('rate');

  // Get selected skill
  const selectedSkill = useMemo(() => {
    if (!selectedSkillId || !skills) return null;
    const skillsArray = Array.isArray(skills) ? skills : Object.values(skills || {});
    return skillsArray.find((skill: any) => skill.id === selectedSkillId) || null;
  }, [selectedSkillId, skills]);

  // Get selected skill progression
  const selectedProgression = useMemo(() => {
    if (!selectedSkillId || !progressions) return null;
    // For now, create a mock progression if none exists
    return {
      skillId: selectedSkillId,
      experienceHistory: [],
      learningCurve: {
        beginnerLevel: 0.2,
        initialLearningRate: 0.8,
        intermediateLevel: 0.4,
        intermediateLearningRate: 0.6,
        advancedLevel: 0.6,
        advancedLearningRate: 0.4,
        expertLevel: 0.8,
        expertLearningRate: 0.2,
        masterLevel: 0.95,
        masterLearningRate: 0.1
      },
      levelHistory: [],
      performanceTrends: [],
      milestoneProgress: [],
      predictions: {
        nextLevelTime: 0,
        projectedProficiency: 0,
        confidence: 0
      },
      analytics: {
        averageLearningRate: 0,
        totalExperience: 0,
        improvementRate: 0,
        efficiency: 0
      }
    } as unknown as SkillProgression;
  }, [selectedSkillId, progressions]);

  // Prepare experience rate data
  const experienceRateData = useMemo(() => {
    if (!selectedProgression?.experienceHistory) return [];
    
    const now = Date.now();
    const timeRanges: Record<string, number> = {
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
      '90d': 90 * 24 * 60 * 60 * 1000,
      '1y': 365 * 24 * 60 * 60 * 1000
    };
    
    const cutoffTime = now - timeRanges[timeRange];
    const filteredExperience = selectedProgression.experienceHistory.filter(
      (exp: ExperiencePoint) => exp.timestamp > cutoffTime
    );
    
    // Group by day and calculate rates
    const dailyData: Record<string, any> = {};
    
    filteredExperience.forEach((exp: ExperiencePoint) => {
      const date = new Date(exp.timestamp).toLocaleDateString();
      if (!dailyData[date]) {
        dailyData[date] = {
          date,
          totalExperience: 0,
          practiceExperience: 0,
          socialExperience: 0,
          teachingExperience: 0,
          eventCount: 0,
          averageQuality: 0,
          qualitySum: 0
        };
      }
      
      dailyData[date].totalExperience += exp.amount;
      dailyData[date].eventCount += 1;
      const context = exp.context as any;
      dailyData[date].qualitySum += context?.quality || 0;
      
      // Categorize by source
      switch ((exp.source as any)) {
        case 'practice':
          dailyData[date].practiceExperience += exp.amount;
          break;
        case 'social':
          dailyData[date].socialExperience += exp.amount;
          break;
        case 'teaching':
          dailyData[date].teachingExperience += exp.amount;
          break;
      }
    });
    
    // Calculate rates and averages
    return Object.values(dailyData)
      .map((day: any) => ({
        ...day,
        experienceRate: day.totalExperience,
        averageQuality: day.eventCount > 0 ? day.qualitySum / day.eventCount : 0,
        efficiency: day.eventCount > 0 ? day.totalExperience / day.eventCount : 0
      }))
      .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [selectedProgression, timeRange]);

  // Prepare cumulative experience data
  const cumulativeExperienceData = useMemo(() => {
    if (experienceRateData.length === 0) return [];
    
    let cumulativeTotal = 0;
    let cumulativePractice = 0;
    let cumulativeSocial = 0;
    let cumulativeTeaching = 0;
    
    return experienceRateData.map((day: any) => {
      cumulativeTotal += day.totalExperience;
      cumulativePractice += day.practiceExperience;
      cumulativeSocial += day.socialExperience;
      cumulativeTeaching += day.teachingExperience;
      
      return {
        date: day.date,
        cumulativeTotal,
        cumulativePractice,
        cumulativeSocial,
        cumulativeTeaching,
        dailyRate: day.experienceRate
      };
    });
  }, [experienceRateData]);

  // Prepare efficiency analysis data
  const efficiencyData = useMemo(() => {
    if (experienceRateData.length === 0) return [];
    
    return experienceRateData.map((day: any) => ({
      date: day.date,
      efficiency: Math.round(day.efficiency * 100) / 100,
      quality: Math.round(day.averageQuality * 100) / 100,
      experienceRate: day.experienceRate,
      eventCount: day.eventCount
    }));
  }, [experienceRateData]);

  // Prepare learning curve data
  const learningCurveData = useMemo(() => {
    if (!selectedProgression?.learningCurve) return [];
    
    const curve = selectedProgression.learningCurve as any;
    return [
      { phase: 'Beginner', proficiency: (curve.beginnerLevel || 0.2) * 100, experienceRate: (curve.initialLearningRate || 0.8) * 100 },
      { phase: 'Intermediate', proficiency: (curve.intermediateLevel || 0.4) * 100, experienceRate: (curve.intermediateLearningRate || 0.6) * 100 },
      { phase: 'Advanced', proficiency: (curve.advancedLevel || 0.6) * 100, experienceRate: (curve.advancedLearningRate || 0.4) * 100 },
      { phase: 'Expert', proficiency: (curve.expertLevel || 0.8) * 100, experienceRate: (curve.expertLearningRate || 0.2) * 100 },
      { phase: 'Master', proficiency: (curve.masterLevel || 0.95) * 100, experienceRate: (curve.masterLearningRate || 0.1) * 100 }
    ];
  }, [selectedProgression]);

  // Calculate experience statistics
  const experienceStatistics = useMemo(() => {
    if (experienceRateData.length === 0) {
      return {
        totalExperience: 0,
        averageDailyRate: 0,
        peakDailyRate: 0,
        averageEfficiency: 0,
        averageQuality: 0,
        totalEvents: 0,
        trendDirection: 'stable'
      };
    }

    const totalExperience = experienceRateData.reduce((sum: number, day: any) => sum + day.totalExperience, 0);
    const averageDailyRate = totalExperience / experienceRateData.length;
    const peakDailyRate = Math.max(...experienceRateData.map((day: any) => day.experienceRate));
    const averageEfficiency = experienceRateData.reduce((sum: number, day: any) => sum + day.efficiency, 0) / experienceRateData.length;
    const averageQuality = experienceRateData.reduce((sum: number, day: any) => sum + day.averageQuality, 0) / experienceRateData.length;
    const totalEvents = experienceRateData.reduce((sum: number, day: any) => sum + day.eventCount, 0);
    
    // Calculate trend
    const recentRates = experienceRateData.slice(-5).map((day: any) => day.experienceRate);
    const previousRates = experienceRateData.slice(-10, -5).map((day: any) => day.experienceRate);
    const recentAvg = recentRates.reduce((sum: number, rate: number) => sum + rate, 0) / recentRates.length;
    const previousAvg = previousRates.length > 0 ? previousRates.reduce((sum: number, rate: number) => sum + rate, 0) / previousRates.length : recentAvg;
    
    let trendDirection: 'improving' | 'declining' | 'stable' = 'stable';
    if (recentAvg > previousAvg * 1.1) trendDirection = 'improving';
    else if (recentAvg < previousAvg * 0.9) trendDirection = 'declining';
    
    return {
      totalExperience: Math.round(totalExperience),
      averageDailyRate: Math.round(averageDailyRate * 100) / 100,
      peakDailyRate: Math.round(peakDailyRate * 100) / 100,
      averageEfficiency: Math.round(averageEfficiency * 100) / 100,
      averageQuality: Math.round(averageQuality * 100) / 100,
      totalEvents,
      trendDirection
    };
  }, [experienceRateData]);

  // Initialize selected skill
  useEffect(() => {
    if (skills && Object.keys(skills).length > 0 && !selectedSkillId) {
      const firstSkill = Object.values(skills)[0] as Skill;
      setSelectedSkillId(firstSkill.id);
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

  // Handle mode change
  const handleModeChange = (mode: 'rate' | 'cumulative' | 'efficiency') => {
    setAnalysisMode(mode);
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

  // Render experience rate chart
  const renderExperienceRateChart = () => {
    if (experienceRateData.length === 0) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
          <Typography variant="body2" color="text.secondary">
            No experience rate data available
          </Typography>
        </Box>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={compact ? 300 : 400}>
        <AreaChart data={experienceRateData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <RechartsTooltip />
          <Legend />
          <Area
            type="monotone"
            dataKey="practiceExperience"
            stackId="1"
            stroke={theme.palette.primary.main}
            fill={theme.palette.primary.light}
            name="Practice Experience"
          />
          <Area
            type="monotone"
            dataKey="socialExperience"
            stackId="1"
            stroke={theme.palette.secondary.main}
            fill={theme.palette.secondary.light}
            name="Social Experience"
          />
          <Area
            type="monotone"
            dataKey="teachingExperience"
            stackId="1"
            stroke={theme.palette.success.main}
            fill={theme.palette.success.light}
            name="Teaching Experience"
          />
        </AreaChart>
      </ResponsiveContainer>
    );
  };

  // Render cumulative experience chart
  const renderCumulativeExperienceChart = () => {
    if (cumulativeExperienceData.length === 0) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
          <Typography variant="body2" color="text.secondary">
            No cumulative experience data available
          </Typography>
        </Box>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={compact ? 300 : 400}>
        <ComposedChart data={cumulativeExperienceData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis yAxisId="left" />
          <YAxis yAxisId="right" orientation="right" />
          <RechartsTooltip />
          <Legend />
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="cumulativeTotal"
            stroke={theme.palette.primary.main}
            fill={theme.palette.primary.light}
            name="Cumulative Experience"
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="dailyRate"
            stroke={theme.palette.secondary.main}
            strokeWidth={2}
            name="Daily Rate"
          />
        </ComposedChart>
      </ResponsiveContainer>
    );
  };

  // Render efficiency chart
  const renderEfficiencyChart = () => {
    if (efficiencyData.length === 0) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
          <Typography variant="body2" color="text.secondary">
            No efficiency data available
          </Typography>
        </Box>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={compact ? 300 : 400}>
        <LineChart data={efficiencyData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <RechartsTooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="efficiency"
            stroke={theme.palette.primary.main}
            strokeWidth={2}
            name="Efficiency (XP/Event)"
          />
          <Line
            type="monotone"
            dataKey="quality"
            stroke={theme.palette.secondary.main}
            strokeWidth={2}
            name="Quality"
          />
          <Bar
            dataKey="eventCount"
            fill={theme.palette.grey[300]}
            name="Event Count"
          />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  // Render learning curve chart
  const renderLearningCurveChart = () => {
    if (learningCurveData.length === 0) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
          <Typography variant="body2" color="text.secondary">
            No learning curve data available
          </Typography>
        </Box>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={compact ? 300 : 400}>
        <ScatterChart>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="proficiency" name="Proficiency" unit="%" />
          <YAxis dataKey="experienceRate" name="Experience Rate" unit="%" />
          <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} />
          <Scatter
            name="Learning Phases"
            data={learningCurveData}
            fill={theme.palette.primary.main}
          />
        </ScatterChart>
      </ResponsiveContainer>
    );
  };

  return (
    <ErrorBoundary>
      <Grid container spacing={3}>
        {/* Controls */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Experience Rate Analysis
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
              <Grid container spacing={2} alignItems="center">
                <Grid size={{ xs: 12, sm: 4 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Skill</InputLabel>
                    <Select
                      value={selectedSkillId}
                      onChange={handleSkillChange}
                      label="Skill"
                    >
                      {skills && Object.values(skills).map((skill: any) => (
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
                </Grid>
                <Grid size={{ xs: 12, sm: 3 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Time Range</InputLabel>
                    <Select
                      value={timeRange}
                      onChange={(e) => setTimeRange(e.target.value)}
                      label="Time Range"
                    >
                      <MenuItem value="7d">Last 7 Days</MenuItem>
                      <MenuItem value="30d">Last 30 Days</MenuItem>
                      <MenuItem value="90d">Last 90 Days</MenuItem>
                      <MenuItem value="1y">Last Year</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 3 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Analysis Mode</InputLabel>
                    <Select
                      value={analysisMode}
                      onChange={(e) => handleModeChange(e.target.value as any)}
                      label="Analysis Mode"
                    >
                      <MenuItem value="rate">Experience Rate</MenuItem>
                      <MenuItem value="cumulative">Cumulative</MenuItem>
                      <MenuItem value="efficiency">Efficiency</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={showProjections}
                        onChange={(e) => setShowProjections(e.target.checked)}
                        size="small"
                      />
                    }
                    label="Projections"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Statistics Cards */}
        <Grid size={{ xs: 12 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                      <Analytics />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" color="primary.main">
                        {experienceStatistics.totalExperience}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total XP
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: theme.palette.secondary.main }}>
                      <Speed />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" color="secondary.main">
                        {experienceStatistics.averageDailyRate}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Daily Rate
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: theme.palette.success.main }}>
                      <TrendingUp />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" color="success.main">
                        {experienceStatistics.peakDailyRate}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Peak Rate
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: theme.palette.warning.main }}>
                      <Assessment />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" color="warning.main">
                        {experienceStatistics.averageEfficiency}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Efficiency
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: theme.palette.info.main }}>
                      <Insights />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" color="info.main">
                        {experienceStatistics.averageQuality}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Quality
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: theme.palette.grey[600] }}>
                      <Timeline />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" color="text.secondary">
                        {experienceStatistics.totalEvents}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Events
                      </Typography>
                    </Box>
                    {getTrendIcon(experienceStatistics.trendDirection)}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Analysis Charts */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={activeTab} onChange={handleTabChange}>
                <Tab label="Experience Rate" />
                <Tab label="Cumulative" />
                <Tab label="Efficiency" />
                <Tab label="Learning Curve" />
              </Tabs>
            </Box>
            <TabPanel value={activeTab} index={0}>
              {renderExperienceRateChart()}
            </TabPanel>
            <TabPanel value={activeTab} index={1}>
              {renderCumulativeExperienceChart()}
            </TabPanel>
            <TabPanel value={activeTab} index={2}>
              {renderEfficiencyChart()}
            </TabPanel>
            <TabPanel value={activeTab} index={3}>
              {renderLearningCurveChart()}
            </TabPanel>
          </Card>
        </Grid>
      </Grid>
    </ErrorBoundary>
  );
};

export default ExperienceRateAnalysis;