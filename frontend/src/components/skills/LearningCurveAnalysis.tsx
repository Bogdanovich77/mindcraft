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
  Alert,
  LinearProgress,
  useTheme,
  alpha,
  Tabs,
  Tab
} from '@mui/material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ComposedChart
} from 'recharts';
import { useSelector } from 'react-redux';
import {
  selectSkills,
  selectSkillProgression,
  selectSelectedAgent
} from '../../store';
import ErrorBoundary from '../common/ErrorBoundary';
import type {
  Skill,
  SkillProgression,
  LearningCurveData,
  ExperiencePoint
} from '../../types/skills';

interface LearningCurveAnalysisProps {
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
      id={`learning-tabpanel-${index}`}
      aria-labelledby={`learning-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 2 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export const LearningCurveAnalysis: React.FC<LearningCurveAnalysisProps> = ({
  agentId,
  compact = false
}) => {
  const theme = useTheme();
  const selectedAgentId = agentId || useSelector(selectSelectedAgent)?.id;
  const skills = useSelector(selectSkills);
  const progressions = useSelector((state: any) => selectSkillProgression(state, selectedAgentId || ''));
  
  const [selectedSkillId, setSelectedSkillId] = useState<string>('');
  const [activeTab, setActiveTab] = useState(0);
  const [analysisType, setAnalysisType] = useState<'actual' | 'predicted' | 'comparison'>('actual');

  // Get selected skill
  const selectedSkill = useMemo(() => {
    if (!selectedSkillId || !skills) return null;
    const skillsArray = Array.isArray(skills) ? skills : Object.values(skills || {});
    return skillsArray.find((skill: any) => skill.id === selectedSkillId) || null;
  }, [selectedSkillId, skills]);

  // Get selected skill progression
  const selectedProgression = useMemo(() => {
    return progressions;
  }, [progressions]);

  // Calculate learning curve data
  const learningCurveData = useMemo(() => {
    if (!selectedProgression?.experienceHistory) return [];

    const history = selectedProgression.experienceHistory;
    const data: any[] = [];
    
    // Calculate cumulative experience and proficiency over time
    let cumulativeExperience = 0;
    let timeSpent = 0;
    
    history.forEach((point: ExperiencePoint, index: number) => {
      cumulativeExperience += point.amount;
      timeSpent += 1; // Default duration if not provided
      
      data.push({
        session: index + 1,
        experience: point.amount,
        cumulative: cumulativeExperience,
        proficiency: 0,
        timeSpent: timeSpent,
        efficiency: point.amount / Math.max(1, 1),
        difficulty: 0.5,
        date: new Date(point.timestamp).toLocaleDateString()
      });
    });

    return data;
  }, [selectedProgression]);

  // Calculate predicted learning curve
  const predictedCurveData = useMemo(() => {
    if (learningCurveData.length < 3) return [];

    // Simple exponential learning model
    const initialRate = learningCurveData[0]?.efficiency || 1;
    const decayRate = 0.1; // Learning decay rate
    const asymptote = Math.max(...learningCurveData.map(d => d.efficiency)) * 1.2;

    return learningCurveData.map((point, index) => {
      const predicted = asymptote * (1 - Math.exp(-decayRate * point.timeSpent));
      return {
        ...point,
        predictedEfficiency: predicted,
        actualEfficiency: point.efficiency
      };
    });
  }, [learningCurveData]);

  // Calculate learning metrics
  const learningMetrics = useMemo(() => {
    if (learningCurveData.length === 0) return null;

    const totalExperience = learningCurveData.reduce((sum, point) => sum + point.experience, 0);
    const totalTime = learningCurveData.reduce((sum, point) => sum + point.timeSpent, 0);
    const avgEfficiency = totalExperience / Math.max(totalTime, 1);
    const maxEfficiency = Math.max(...learningCurveData.map(d => d.efficiency));
    const learningVelocity = learningCurveData.length > 1 ? 
      (learningCurveData[learningCurveData.length - 1].cumulative - learningCurveData[0].cumulative) / 
      (learningCurveData.length - 1) : 0;

    // Calculate learning plateau detection
    const recentData = learningCurveData.slice(-5);
    const isPlateau = recentData.length >= 3 && 
      recentData.every(point => 
        Math.abs(point.efficiency - recentData[0].efficiency) < 0.1 * recentData[0].efficiency
      );

    return {
      totalExperience,
      totalTime,
      avgEfficiency,
      maxEfficiency,
      learningVelocity,
      isPlateau,
      totalSessions: learningCurveData.length
    };
  }, [learningCurveData]);

  // Calculate skill comparison data
  const skillComparisonData = useMemo(() => {
    if (!skills) return [];

    const skillsArray = Array.isArray(skills) ? skills : Object.values(skills);
    return skillsArray
      .map((skill: any) => {
        // For now, use mock data since we're getting individual progression
        const learningRate = 0.5 + Math.random() * 0.5;
        const plateauPoint = 50 + Math.random() * 50;
        
        return {
          name: skill.type.replace('_', ' ').replace(/\b\w/g, (l: any) => l.toUpperCase()),
          proficiency: Math.round(skill.proficiency.overall * 100),
          learningRate: Math.round(learningRate * 100),
          plateauPoint: Math.round(plateauPoint),
          experience: skill.usage?.totalExperience || 0
        };
      })
      .sort((a, b) => b.learningRate - a.learningRate)
      .slice(0, compact ? 5 : 10);
  }, [skills]);

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
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Custom tooltip for learning curves
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <Card sx={{ p: 2, backgroundColor: theme.palette.background.paper }}>
          <Typography variant="body2" fontWeight="bold">
            Session {label}
          </Typography>
          {payload.map((entry: any, index: number) => (
            <Typography key={index} variant="body2" color={entry.color}>
              {entry.name}: {typeof entry.value === 'number' ? entry.value.toFixed(3) : entry.value}
            </Typography>
          ))}
        </Card>
      );
    }
    return null;
  };

  // Render learning efficiency chart
  const renderEfficiencyChart = () => {
    if (learningCurveData.length === 0) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
          <Typography variant="body2" color="text.secondary">
            No learning data available
          </Typography>
        </Box>
      );
    }

    const data = analysisType === 'predicted' ? predictedCurveData : learningCurveData;

    return (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="session" />
          <YAxis />
          <RechartsTooltip content={<CustomTooltip />} />
          <Legend />
          <Line
            type="monotone"
            dataKey={analysisType === 'predicted' ? 'actualEfficiency' : 'efficiency'}
            stroke={theme.palette.primary.main}
            strokeWidth={2}
            name="Learning Efficiency"
          />
          {analysisType === 'predicted' && (
            <Line
              type="monotone"
              dataKey="predictedEfficiency"
              stroke={theme.palette.secondary.main}
              strokeWidth={2}
              strokeDasharray="5 5"
              name="Predicted Efficiency"
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    );
  };

  // Render cumulative learning chart
  const renderCumulativeChart = () => {
    if (learningCurveData.length === 0) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
          <Typography variant="body2" color="text.secondary">
            No learning data available
          </Typography>
        </Box>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={learningCurveData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="session" />
          <YAxis />
          <RechartsTooltip content={<CustomTooltip />} />
          <Legend />
          <Area
            type="monotone"
            dataKey="cumulative"
            stroke={theme.palette.primary.main}
            fill={theme.palette.primary.main}
            fillOpacity={0.3}
            name="Cumulative Experience"
          />
          <Area
            type="monotone"
            dataKey="proficiency"
            stroke={theme.palette.secondary.main}
            fill={theme.palette.secondary.main}
            fillOpacity={0.3}
            name="Proficiency Level"
          />
        </AreaChart>
      </ResponsiveContainer>
    );
  };

  // Render skill comparison chart
  const renderComparisonChart = () => {
    if (skillComparisonData.length === 0) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
          <Typography variant="body2" color="text.secondary">
            No comparison data available
          </Typography>
        </Box>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={300}>
        <ScatterChart data={skillComparisonData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="proficiency" name="Proficiency" />
          <YAxis dataKey="learningRate" name="Learning Rate" />
          <RechartsTooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
          <Scatter name="Skills" data={skillComparisonData} fill={theme.palette.primary.main} />
        </ScatterChart>
      </ResponsiveContainer>
    );
  };

  return (
    <ErrorBoundary>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Controls */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Learning Curve Analysis
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, 1fr)'
                },
                gap: 2,
                alignItems: 'center'
              }}
            >
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
                <InputLabel>Analysis Type</InputLabel>
                <Select
                  value={analysisType}
                  onChange={(e) => setAnalysisType(e.target.value as any)}
                  label="Analysis Type"
                >
                  <MenuItem value="actual">Actual Learning</MenuItem>
                  <MenuItem value="predicted">Predicted Learning</MenuItem>
                  <MenuItem value="comparison">Skill Comparison</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </CardContent>
        </Card>

        {/* Learning Metrics */}
        {learningMetrics && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Learning Metrics
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: 'repeat(2, 1fr)',
                    sm: 'repeat(3, 1fr)',
                    md: 'repeat(6, 1fr)'
                  },
                  gap: 2
                }}
              >
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total Experience
                  </Typography>
                  <Typography variant="h6">
                    {learningMetrics.totalExperience}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Time Spent
                  </Typography>
                  <Typography variant="h6">
                    {learningMetrics.totalTime}h
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Avg Efficiency
                  </Typography>
                  <Typography variant="h6">
                    {learningMetrics.avgEfficiency.toFixed(2)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Learning Velocity
                  </Typography>
                  <Typography variant="h6">
                    {learningMetrics.learningVelocity.toFixed(2)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Sessions
                  </Typography>
                  <Typography variant="h6">
                    {learningMetrics.totalSessions}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Status
                  </Typography>
                  <Chip
                    label={learningMetrics.isPlateau ? 'Plateau Detected' : 'Improving'}
                    color={learningMetrics.isPlateau ? 'warning' : 'success'}
                    size="small"
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Learning Charts */}
        <Card>
          <CardContent>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
              <Tabs value={activeTab} onChange={handleTabChange}>
                <Tab label="Learning Efficiency" />
                <Tab label="Cumulative Progress" />
                <Tab label="Skill Comparison" />
              </Tabs>
            </Box>
            
            <TabPanel value={activeTab} index={0}>
              {renderEfficiencyChart()}
            </TabPanel>
            
            <TabPanel value={activeTab} index={1}>
              {renderCumulativeChart()}
            </TabPanel>
            
            <TabPanel value={activeTab} index={2}>
              {renderComparisonChart()}
            </TabPanel>
          </CardContent>
        </Card>

        {/* Learning Insights */}
        {learningMetrics?.isPlateau && (
          <Alert severity="warning">
            <Typography variant="body2">
              Learning plateau detected for this skill. Consider trying new approaches,
              increasing difficulty, or taking a break to refresh your learning.
            </Typography>
          </Alert>
        )}
      </Box>
    </ErrorBoundary>
  );
};

export default LearningCurveAnalysis;