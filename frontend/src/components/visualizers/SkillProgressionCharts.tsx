/**
 * Skill Progression Charts Visualization
 * 
 * Interactive D3.js visualization of skill progression over time,
 * including experience tracking, proficiency changes, and milestone achievements.
 */

import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography, Paper, IconButton, Tooltip, FormControl, InputLabel, Select, MenuItem, Chip, Card, CardContent } from '@mui/material';
import {
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  Refresh as RefreshIcon,
  CenterFocusStrong as CenterIcon,
  Timeline as TimelineIcon,
  TrendingUp as TrendUpIcon,
  EmojiEvents as EmojiEventsIcon,
  School as SchoolIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../../store';
import type { Skill, SkillProgression, SkillMilestone } from '../../types/skills';
import * as d3 from 'd3';

interface SkillProgressionChartsProps {
  width?: number;
  height?: number;
  skillId?: string;
  className?: string;
}

interface ChartDataPoint {
  timestamp: number;
  proficiency: number;
  experience: number;
  level: number;
  milestone?: SkillMilestone;
}

interface SkillData {
  skill: Skill;
  progression: SkillProgression[];
  milestones: SkillMilestone[];
}

const SkillProgressionCharts: React.FC<SkillProgressionChartsProps> = ({
  width = 800,
  height = 600,
  skillId,
  className
}) => {
  const theme = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Redux state
  const { skills } = useSelector((state: RootState) => state.skills as any);
  
  // Component state
  const [selectedSkill, setSelectedSkill] = useState<string>(skillId || '');
  const [chartType, setChartType] = useState<'proficiency' | 'experience' | 'combined'>('combined');
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year' | 'all'>('month');
  const [zoom, setZoom] = useState(1);
  const [showMilestones, setShowMilestones] = useState<boolean>(true);

  // Get skill data
  const getSkillData = (id: string): SkillData | null => {
    const skill = skills.find(s => s.id === id);
    if (!skill) return null;

    return {
      skill,
      progression: skill.progressionHistory || [],
      milestones: skill.milestones || []
    };
  };

  // Get selected skill data
  const selectedSkillData = selectedSkill ? getSkillData(selectedSkill) : null;

  // Process chart data
  const getChartData = (): ChartDataPoint[] => {
    if (!selectedSkillData) return [];

    const data: ChartDataPoint[] = [];
    const now = Date.now();
    let cutoffTime = now;

    // Set time range cutoff
    switch (timeRange) {
      case 'week':
        cutoffTime = now - (7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        cutoffTime = now - (30 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        cutoffTime = now - (365 * 24 * 60 * 60 * 1000);
        break;
    }

    // Process progression data
    selectedSkillData.progression.forEach((point, index) => {
      if (point.timestamp >= cutoffTime) return;
      
      data.push({
        timestamp: point.timestamp,
        proficiency: point.proficiency || 0,
        experience: point.experienceGained || 0,
        level: point.level || 0
      });
    });

    // Add current point
    if (selectedSkillData.skill) {
      data.push({
        timestamp: now,
        proficiency: selectedSkillData.skill.proficiency.overall,
        experience: selectedSkillData.skill.experience?.totalPoints || 0,
        level: Math.floor(selectedSkillData.skill.experience?.totalPoints || 0 / 100)
      });
    }

    return data.sort((a, b) => a.timestamp - b.timestamp);
  };

  // Get milestone data
  const getMilestoneData = (): SkillMilestone[] => {
    if (!selectedSkillData) return [];
    
    return selectedSkillData.milestones
      .filter(m => m.completed)
      .sort((a, b) => a.completedAt - b.completedAt)
      .slice(0, 10); // Show last 10 milestones
  };

  // Initialize proficiency chart
  const createProficiencyChart = () => {
    if (!svgRef.current || !selectedSkillData) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const data = getChartData();
    const margin = { top: 20, right: 30, bottom: 40, left: 50 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Create scales
    const xScale = d3.scaleTime()
      .domain(d3.extent(data, d => d.timestamp) as [Date, Date])
      .range([0, chartWidth]);

    const yScale = d3.scaleLinear()
      .domain([0, 1])
      .range([chartHeight, 0]);

    // Create line generator
    const line = d3.line<ChartDataPoint>()
      .x(d => xScale(d.timestamp))
      .y(d => yScale(d.proficiency))
      .curve(d3.curveMonotoneX);

    // Create area generator
    const area = d3.area<ChartDataPoint>()
      .x(d => xScale(d.timestamp))
      .y0(chartHeight)
      .y1(d => yScale(d.proficiency))
      .curve(d3.curveMonotoneX);

    // Create main group
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Add gradient
    const gradient = g.append('defs')
      .append('linearGradient')
      .attr('id', 'proficiency-gradient')
      .attr('gradientUnits', 'userSpaceOnUse')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', theme.palette.primary.main);

    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', theme.palette.primary.light);

    // Add area
    g.append('path')
      .datum(data)
      .attr('fill', 'url(#proficiency-gradient)')
      .attr('fill-opacity', 0.3)
      .attr('d', area);

    // Add line
    g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', theme.palette.primary.main)
      .attr('stroke-width', 2)
      .attr('d', line);

    // Add axes
    const xAxis = d3.axisBottom(xScale)
      .tickFormat(d3.timeFormat('%Y-%m-%d'));

    const yAxis = d3.axisLeft(yScale)
      .tickFormat(d => `${(d * 100).toFixed(0)}%`);

    g.append('g')
      .attr('transform', `translate(0, ${chartHeight})`)
      .call(xAxis);

    g.append('g')
      .call(yAxis);

    // Add data points
    g.selectAll('circle')
      .data(data)
      .enter().append('circle')
      .attr('r', 4)
      .attr('cx', d => xScale(d.timestamp))
      .attr('cy', d => yScale(d.proficiency))
      .attr('fill', theme.palette.primary.main)
      .attr('stroke', theme.palette.background.paper)
      .attr('stroke-width', 2);

    // Add milestone markers
    const milestoneData = getMilestoneData();
    milestoneData.forEach((milestone, index) => {
      const xPos = xScale(milestone.completedAt);
      const yPos = yScale(0.5); // Middle of chart

      g.append('line')
        .attr('x1', xPos)
        .attr('y1', 0)
        .attr('x2', xPos)
        .attr('y2', chartHeight)
        .attr('stroke', theme.palette.success.main)
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '5,5');

      g.append('circle')
        .attr('cx', xPos)
        .attr('cy', yPos)
        .attr('r', 8)
        .attr('fill', theme.palette.success.main)
        .attr('stroke', theme.palette.background.paper)
        .attr('stroke-width', 2);

      g.append('text')
        .attr('x', xPos)
        .attr('y', yPos - 15)
        .attr('text-anchor', 'middle')
        .attr('font-size', '12px')
        .attr('fill', theme.palette.text.primary)
        .text(milestone.name);
    });
  };

  // Initialize experience chart
  const createExperienceChart = () => {
    if (!svgRef.current || !selectedSkillData) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const data = getChartData();
    const margin = { top: 20, right: 30, bottom: 40, left: 50 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Create scales
    const xScale = d3.scaleTime()
      .domain(d3.extent(data, d => d.timestamp) as [Date, Date])
      .range([0, chartWidth]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.experience) || 100])
      .range([chartHeight, 0]);

    // Create bars
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    g.selectAll('rect')
      .data(data)
      .enter().append('rect')
      .attr('x', d => xScale(d.timestamp))
      .attr('y', d => yScale(d.experience))
      .attr('width', chartWidth / data.length * 0.8)
      .attr('height', d => chartHeight - yScale(d.experience))
      .attr('fill', theme.palette.secondary.main)
      .attr('opacity', 0.7);

    // Add axes
    const xAxis = d3.axisBottom(xScale)
      .tickFormat(d3.timeFormat('%Y-%m-%d'));

    const yAxis = d3.axisLeft(yScale);

    g.append('g')
      .attr('transform', `translate(0, ${chartHeight})`)
      .call(xAxis);

    g.append('g')
      .call(yAxis);
  };

  // Initialize combined chart
  const createCombinedChart = () => {
    if (!svgRef.current || !selectedSkillData) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const data = getChartData();
    const margin = { top: 20, right: 30, bottom: 40, left: 50 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Create scales
    const xScale = d3.scaleTime()
      .domain(d3.extent(data, d => d.timestamp) as [Date, Date])
      .range([0, chartWidth]);

    const proficiencyScale = d3.scaleLinear()
      .domain([0, 1])
      .range([chartHeight, 0]);

    const experienceScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.experience) || 100])
      .range([chartHeight, 0]);

    // Create line generators
    const proficiencyLine = d3.line<ChartDataPoint>()
      .x(d => xScale(d.timestamp))
      .y(d => proficiencyScale(d.proficiency))
      .curve(d3.curveMonotoneX);

    const experienceLine = d3.line<ChartDataPoint>()
      .x(d => xScale(d.timestamp))
      .y(d => experienceScale(d.experience))
      .curve(d3.curveMonotoneX);

    // Create main group
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Add proficiency line
    g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', theme.palette.primary.main)
      .attr('stroke-width', 2)
      .attr('d', proficiencyLine);

    // Add experience bars
    g.selectAll('rect')
      .data(data)
      .enter().append('rect')
      .attr('x', d => xScale(d.timestamp))
      .attr('y', d => experienceScale(d.experience))
      .attr('width', chartWidth / data.length * 0.8)
      .attr('height', d => chartHeight - experienceScale(d.experience))
      .attr('fill', theme.palette.secondary.main)
      .attr('opacity', 0.3);

    // Add axes
    const xAxis = d3.axisBottom(xScale)
      .tickFormat(d3.timeFormat('%Y-%m-%d'));

    const proficiencyAxis = d3.axisLeft(proficiencyScale)
      .tickFormat(d => `${(d * 100).toFixed(0)}%`);

    const experienceAxis = d3.axisRight(experienceScale);

    g.append('g')
      .attr('transform', `translate(0, ${chartHeight})`)
      .call(xAxis);

    g.append('g')
      .call(proficiencyAxis);

    g.append('g')
      .attr('transform', `translate(${chartWidth}, 0)`)
      .call(experienceAxis);
  };

  // Handle zoom controls
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev * 1.2, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev / 1.2, 0.5));
  };

  const handleCenter = () => {
    setZoom(1);
  };

  const handleRefresh = () => {
    // Force re-render
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    // Re-render will be triggered by useEffect
  };

  // Update chart based on type
  useEffect(() => {
    if (!selectedSkillData) return;

    switch (chartType) {
      case 'proficiency':
        createProficiencyChart();
        break;
      case 'experience':
        createExperienceChart();
        break;
      case 'combined':
        createCombinedChart();
        break;
    }
  }, [selectedSkillData, chartType, timeRange, zoom, width, height]);

  return (
    <Paper className={className} sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Skill Progression Charts</Typography>
        
        <Box display="flex" gap={1}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Skill</InputLabel>
            <Select
              value={selectedSkill}
              label="Skill"
              onChange={(e) => setSelectedSkill(e.target.value)}
            >
              {skills.map(skill => (
                <MenuItem key={skill.id} value={skill.id}>
                  {skill.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Chart Type</InputLabel>
            <Select
              value={chartType}
              label="Chart Type"
              onChange={(e) => setChartType(e.target.value as any)}
            >
              <MenuItem value="proficiency">Proficiency</MenuItem>
              <MenuItem value="experience">Experience</MenuItem>
              <MenuItem value="combined">Combined</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              label="Time Range"
              onChange={(e) => setTimeRange(e.target.value as any)}
            >
              <MenuItem value="week">Last Week</MenuItem>
              <MenuItem value="month">Last Month</MenuItem>
              <MenuItem value="year">Last Year</MenuItem>
              <MenuItem value="all">All Time</MenuItem>
            </Select>
          </FormControl>

          <Tooltip title="Zoom In">
            <IconButton size="small" onClick={handleZoomIn}>
              <ZoomInIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Zoom Out">
            <IconButton size="small" onClick={handleZoomOut}>
              <ZoomOutIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Center View">
            <IconButton size="small" onClick={handleCenter}>
              <CenterIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Refresh">
            <IconButton size="small" onClick={handleRefresh}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Box display="flex" flex={1} position="relative" ref={containerRef}>
        <svg
          ref={svgRef}
          width={width * zoom}
          height={height * zoom}
          style={{ border: `1px solid ${theme.palette.divider}`, borderRadius: '4px' }}
        />
      </Box>

      {selectedSkillData && (
        <Box mt={2} p={2} bgcolor={theme.palette.grey[50]} borderRadius={1}>
          <Typography variant="subtitle2" gutterBottom>
            {selectedSkillData.skill.name}
          </Typography>
          
          <Box display="flex" gap={2} mb={2}>
            <Card sx={{ flex: 1 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Current Proficiency
                </Typography>
                <Typography variant="h4" color="primary">
                  {(selectedSkillData.skill.proficiency.overall * 100).toFixed(1)}%
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Knowledge: {(selectedSkillData.skill.proficiency.knowledge * 100).toFixed(1)}%
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Practical: {(selectedSkillData.skill.proficiency.practical * 100).toFixed(1)}%
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Creative: {(selectedSkillData.skill.proficiency.creative * 100).toFixed(1)}%
                </Typography>
              </CardContent>
            </Card>

            <Card sx={{ flex: 1 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Experience Progress
                </Typography>
                <Typography variant="h4" color="secondary">
                  {selectedSkillData.skill.experience?.totalPoints || 0} XP
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Level: {Math.floor((selectedSkillData.skill.experience?.totalPoints || 0) / 100)}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Learning Rate: {selectedSkillData.skill.learning?.learningRate?.toFixed(3) || '1.000'}
                </Typography>
              </CardContent>
            </Card>
          </Box>

          {showMilestones && selectedSkillData.milestones.length > 0 && (
            <Card sx={{ flex: 1 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
                  <EmojiEventsIcon />
                  Recent Milestones
                </Typography>
                
                <Box mt={2}>
                  {getMilestoneData().map((milestone, index) => (
                    <Box key={index} display="flex" alignItems="center" gap={1} py={1}>
                      <Chip
                        label={milestone.name}
                        size="small"
                        color="success"
                      />
                      <Typography variant="body2" flex={1}>
                        {milestone.description}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {new Date(milestone.completedAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          )}
        </Box>
      )}

      <Box mt={2} display="flex" gap={1} flexWrap="wrap">
        <Chip
          label={`Zoom: ${(zoom * 100).toFixed(0)}%`}
          size="small"
          color="primary"
        />
        <Chip
          label={`${getChartData().length} data points`}
          size="small"
          color="secondary"
        />
        {selectedSkillData && (
          <Chip
            label={`${getMilestoneData().length} milestones`}
            size="small"
            color="info"
          />
        )}
      </Box>
    </Paper>
  );
};

export default SkillProgressionCharts;