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
  alpha
} from '@mui/material';
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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
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
  SkillType,
  ProficiencyMetrics,
  SkillCategory
} from '../../types/skills';

interface ProgressionChartsProps {
  agentId?: string;
  compact?: boolean;
}

export const ProgressionCharts: React.FC<ProgressionChartsProps> = ({
  agentId,
  compact = false
}) => {
  const theme = useTheme();
  const selectedAgentId = agentId || useSelector(selectSelectedAgent)?.id;
  const skills = useSelector(selectSkills);
  const progressions = useSelector((state: any) => selectSkillProgression(state, selectedAgentId || ''));
  
  const [selectedSkillId, setSelectedSkillId] = useState<string>('');
  const [chartType, setChartType] = useState<'line' | 'area' | 'bar'>('line');
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'all'>('week');

  // Get selected skill
  const selectedSkill = useMemo(() => {
    if (!selectedSkillId || !skills) return null;
    const skillsArray = Array.isArray(skills) ? skills : Object.values(skills || {});
    return skillsArray.find((skill: any) => skill.id === selectedSkillId) || null;
  }, [selectedSkillId, skills]);

  // Get selected skill progression
  const selectedProgression = useMemo(() => {
    if (!selectedSkillId || !progressions) return null;
    if (Array.isArray(progressions)) {
      return progressions.find(p => p.skillId === selectedSkillId) || null;
    }
    // Handle Map or Record format
    if (progressions instanceof Map) {
      return progressions.get(selectedSkillId) || null;
    }
    // Convert to unknown first, then check if it's an object
    const progressionObj = progressions as unknown;
    if (progressionObj && typeof progressionObj === 'object') {
      return (progressionObj as Record<string, SkillProgression>)[selectedSkillId] || null;
    }
    return null;
  }, [selectedSkillId, progressions]);

  // Prepare chart data for skill progression
  const progressionData = useMemo(() => {
    if (!selectedProgression?.experienceHistory) return [];
    
    const now = Date.now();
    const startTime = timeRange === 'day' ? now - (24 * 60 * 60 * 1000) :
                     timeRange === 'week' ? now - (7 * 24 * 60 * 60 * 1000) :
                     timeRange === 'month' ? now - (30 * 24 * 60 * 60 * 1000) :
                     selectedProgression.experienceHistory[0]?.timestamp || now;

    const filteredHistory = selectedProgression.experienceHistory.filter(
      (point: any) => point.timestamp >= startTime
    );

    return filteredHistory.map((point: any) => ({
      timestamp: new Date(point.timestamp).toLocaleDateString(),
      experience: point.amount,
      cumulative: point.cumulativeAmount || 0,
      proficiency: point.proficiencyLevel || 0,
      date: new Date(point.timestamp)
    }));
  }, [selectedProgression, timeRange]);

  // Prepare radar data for skill categories
  const categoryRadarData = useMemo(() => {
    if (!skills) return [];
    
    const categoryData: Record<string, { total: number; count: number }> = {};
    
    const skillsArray = Array.isArray(skills) ? skills : Object.values(skills || {});
    skillsArray.forEach((skill: any) => {
      const category = skill.type;
      if (!categoryData[category]) {
        categoryData[category] = { total: 0, count: 0 };
      }
      categoryData[category].total += skill.proficiency.overall;
      categoryData[category].count += 1;
    });

    return Object.entries(categoryData).map(([category, data]) => ({
      category: category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      proficiency: Math.round((data.total / data.count) * 100),
      fullMark: 100
    }));
  }, [skills]);

  // Prepare top skills data
  const topSkillsData = useMemo(() => {
    if (!skills) return [];
    
    const skillsArray = Array.isArray(skills) ? skills : Object.values(skills || {});
    return skillsArray
      .sort((a: any, b: any) => b.proficiency.overall - a.proficiency.overall)
      .slice(0, compact ? 5 : 10)
      .map((skill: any) => ({
        name: skill.type.replace('_', ' ').replace(/\b\w/g, (l: any) => l.toUpperCase()),
        proficiency: Math.round(skill.proficiency.overall * 100),
        knowledge: Math.round(skill.proficiency.knowledge * 100),
        practical: Math.round(skill.proficiency.practical * 100),
        creative: Math.round(skill.proficiency.creative * 100)
      }));
  }, [skills]);

  // Initialize selected skill
  useEffect(() => {
    if (skills && !selectedSkillId) {
      const skillsArray = Array.isArray(skills) ? skills : Object.values(skills);
      if (skillsArray.length > 0) {
        const firstSkill = skillsArray[0] as any;
        setSelectedSkillId(firstSkill.id);
      }
    }
  }, [skills, selectedSkillId]);

  // Handle skill selection
  const handleSkillChange = (event: any) => {
    setSelectedSkillId(event.target.value);
  };

  // Custom tooltip for progression charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <Card sx={{ p: 2, backgroundColor: theme.palette.background.paper }}>
          <Typography variant="body2" fontWeight="bold">
            {label}
          </Typography>
          {payload.map((entry: any, index: number) => (
            <Typography key={index} variant="body2" color={entry.color}>
              {entry.name}: {entry.value.toFixed(2)}
            </Typography>
          ))}
        </Card>
      );
    }
    return null;
  };

  // Render skill progression chart
  const renderProgressionChart = () => {
    if (progressionData.length === 0) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
          <Typography variant="body2" color="text.secondary">
            No progression data available for the selected time range
          </Typography>
        </Box>
      );
    }

    const ChartComponent = chartType === 'line' ? LineChart : 
                           chartType === 'area' ? AreaChart : BarChart;
    const DataComponent = chartType === 'line' ? Line : 
                          chartType === 'area' ? Area : Bar;

    return (
      <ResponsiveContainer width="100%" height={300}>
        <ChartComponent data={progressionData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="timestamp" />
          <YAxis />
          <RechartsTooltip content={<CustomTooltip />} />
          <Legend />
          <DataComponent
            type="monotone"
            dataKey="experience"
            stroke={theme.palette.primary.main}
            fill={theme.palette.primary.main}
            fillOpacity={chartType === 'area' ? 0.3 : 1}
            strokeWidth={2}
            name="Experience Gained"
          />
          <DataComponent
            type="monotone"
            dataKey="proficiency"
            stroke={theme.palette.secondary.main}
            fill={theme.palette.secondary.main}
            fillOpacity={chartType === 'area' ? 0.3 : 1}
            strokeWidth={2}
            name="Proficiency Level"
          />
        </ChartComponent>
      </ResponsiveContainer>
    );
  };

  // Render category radar chart
  const renderCategoryRadar = () => {
    if (categoryRadarData.length === 0) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
          <Typography variant="body2" color="text.secondary">
            No category data available
          </Typography>
        </Box>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={categoryRadarData}>
          <PolarGrid />
          <PolarAngleAxis dataKey="category" />
          <PolarRadiusAxis angle={90} domain={[0, 100]} />
          <Radar
            name="Proficiency"
            dataKey="proficiency"
            stroke={theme.palette.primary.main}
            fill={theme.palette.primary.main}
            fillOpacity={0.3}
            strokeWidth={2}
          />
          <RechartsTooltip />
        </RadarChart>
      </ResponsiveContainer>
    );
  };

  // Render top skills bar chart
  const renderTopSkillsChart = () => {
    if (topSkillsData.length === 0) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
          <Typography variant="body2" color="text.secondary">
            No skills data available
          </Typography>
        </Box>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={topSkillsData} layout="horizontal">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" domain={[0, 100]} />
          <YAxis dataKey="name" type="category" width={150} />
          <RechartsTooltip content={<CustomTooltip />} />
          <Legend />
          <Bar dataKey="knowledge" fill={theme.palette.info.main} name="Knowledge" />
          <Bar dataKey="practical" fill={theme.palette.success.main} name="Practical" />
          <Bar dataKey="creative" fill={theme.palette.warning.main} name="Creative" />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  return (
    <ErrorBoundary>
      <Box sx={{ width: '100%' }}>
        {/* Controls */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Skill Progression Charts
            </Typography>
            <Grid container spacing={2} alignItems="center">
              <Grid size={{ xs: 12, sm: 4 }}>
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
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Chart Type</InputLabel>
                  <Select
                    value={chartType}
                    onChange={(e) => setChartType(e.target.value as any)}
                    label="Chart Type"
                  >
                    <MenuItem value="line">Line Chart</MenuItem>
                    <MenuItem value="area">Area Chart</MenuItem>
                    <MenuItem value="bar">Bar Chart</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Time Range</InputLabel>
                  <Select
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value as any)}
                    label="Time Range"
                  >
                    <MenuItem value="day">Last 24 Hours</MenuItem>
                    <MenuItem value="week">Last Week</MenuItem>
                    <MenuItem value="month">Last Month</MenuItem>
                    <MenuItem value="all">All Time</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Selected Skill Progression */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {selectedSkill ? (selectedSkill as any).type.replace('_', ' ').replace(/\b\w/g, (l: any) => l.toUpperCase()) : 'Unknown'} Progression
            </Typography>
            {selectedSkill && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Overall Proficiency: {Math.round((selectedSkill as any).proficiency.overall * 100)}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Experience: {(selectedSkill as any).usage?.totalExperience || 0}
                </Typography>
              </Box>
            )}
            {renderProgressionChart()}
          </CardContent>
        </Card>

        {/* Category Radar Chart */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Skill Categories Overview
            </Typography>
            {renderCategoryRadar()}
          </CardContent>
        </Card>

        {/* Top Skills Chart */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Top Skills by Proficiency
            </Typography>
            {renderTopSkillsChart()}
          </CardContent>
        </Card>
      </Box>
    </ErrorBoundary>
  );
};

export default ProgressionCharts;