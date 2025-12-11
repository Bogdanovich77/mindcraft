import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Box, Typography, Paper, Tooltip, IconButton, Switch, FormControlLabel, Slider, Tabs, Tab } from '@mui/material';
import { 
  Refresh as RefreshIcon, 
  Settings as SettingsIcon, 
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Timeline as TimelineIcon,
  BarChart as BarChartIcon
} from '@mui/icons-material';
import * as d3 from 'd3';
import type { 
  BaseVisualizerProps, 
  SkillData, 
  ColorScheme,
  DataPoint,
  TimeSeriesData,
  AnimationConfig,
  DataFilter
} from '../types/visualizers';
import type { SkillsState } from '../types/skills';

interface SkillProgressionChartsProps extends Omit<BaseVisualizerProps, 'data'> {
  data?: SkillsState;
  chartType?: 'timeline' | 'radar' | 'heatmap' | 'comparison' | 'synergy';
  showTrends?: boolean;
  showMilestones?: boolean;
  timeRange?: number; // days to show
  onSkillClick?: (skill: SkillData) => void;
  onMilestoneClick?: (milestone: any) => void;
}

export const SkillProgressionCharts: React.FC<SkillProgressionChartsProps> = ({
  data,
  width = 800,
  height = 600,
  margin = { top: 20, right: 20, bottom: 40, left: 60 },
  theme = 'light',
  chartType = 'timeline',
  showTrends = true,
  showMilestones = true,
  timeRange = 30,
  interactive = true,
  animated = true,
  onDataPointClick,
  onMilestoneClick,
  className
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedSkill, setSelectedSkill] = useState<SkillData | null>(null);
  const [hoveredSkill, setHoveredSkill] = useState<SkillData | null>(null);
  const [currentTab, setCurrentTab] = useState(0);

  // Color schemes
  const colorSchemes: Record<string, ColorScheme> = {
    light: {
      primary: '#1976d2',
      secondary: '#dc004e',
      accent: '#ff9800',
      background: '#ffffff',
      text: '#333333',
      grid: '#e0e0e0',
      highlight: '#ffeb3b',
      warning: '#ff9800',
      error: '#f44336',
      success: '#4caf50'
    },
    dark: {
      primary: '#90caf9',
      secondary: '#f48fb1',
      accent: '#ff9800',
      background: '#121212',
      text: '#ffffff',
      grid: '#2d2d2d',
      highlight: '#fff59d',
      warning: '#ff9800',
      error: '#f44336',
      success: '#4caf50'
    }
  };

  const colors = colorSchemes[theme] || colorSchemes.light;

  // Process skill data for visualization
  const processSkillData = useCallback((skillsState: SkillsState) => {
    if (!skillsState.skills) return { timelineData: [], skillData: [], comparisonData: [] };

    const skills = Object.values(skillsState.skills);
    const timelineData: TimeSeriesData[] = [];
    const skillData: SkillData[] = [];
    
    // Generate timeline data for each skill
    skills.forEach(skill => {
      const experienceHistory = skill.experienceHistory || [];
      const recentExperience = experienceHistory.slice(-timeRange);
      
      recentExperience.forEach((experience, index) => {
        timelineData.push({
          timestamp: experience.timestamp || Date.now() - (index * 24 * 60 * 60 * 1000),
          value: skill.proficiency.overall,
          label: skill.name,
          category: skill.category,
          metadata: {
            experience: experience,
            skillLevel: skill.level,
            trend: skill.trend
          }
        });
      });
    });

    // Process skills for other visualizations
    skills.forEach(skill => {
      skillData.push({
        id: skill.id,
        name: skill.name,
        category: skill.category,
        proficiency: {
          overall: skill.proficiency.overall,
          knowledge: skill.proficiency.knowledge,
          practical: skill.proficiency.practical,
          creative: skill.proficiency.creative
        },
        experience: skill.experience,
        level: skill.level,
        milestones: skill.milestones || [],
        synergies: skill.synergies || [],
        trend: skill.trend || {
          direction: 'stable' as const,
          rate: 0
        }
      });
    });

    return { timelineData, skillData, comparisonData: skillData };
  }, [timeRange]);

  // Generate timeline chart
  const renderTimelineChart = useCallback(() => {
    if (!svgRef.current || !data) return null;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const svgWidth = width - (margin.left || 0) - (margin.right || 0);
    const svgHeight = height - (margin.top || 0) - (margin.bottom || 0);

    const { timelineData } = processSkillData(data);
    if (timelineData.length === 0) return null;

    // Create scales
    const xScale = d3.scaleTime()
      .domain(d3.extent(timelineData, (d: any) => d.timestamp) as [Date, Date])
      .range([0, svgWidth]);

    const yScale = d3.scaleLinear()
      .domain([0, 1])
      .range([svgHeight, 0]);

    // Create line generator
    const line = d3.line<TimeSeriesData>()
      .x((d: any) => xScale(d.timestamp))
      .y((d: any) => d.value)
      .curve(d3.curveMonotoneX);

    // Create area generator
    const area = d3.area<TimeSeriesData>()
      .x((d: any) => xScale(d.timestamp))
      .y0(svgHeight)
      .y1((d: any) => yScale(d.value))
      .curve(d3.curveMonotoneX);

    // Group data by skill
    const groupedData = d3.group(timelineData, (d: any) => d.label);

    // Create color scale
    const colorScale = d3.scaleOrdinal(colors.success)
      .domain(Object.keys(groupedData));

    // Render chart
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Add grid lines
    g.append('g')
      .attr('class', 'grid')
      .selectAll('line')
      .data(yScale.ticks(10))
      .enter().append('line')
      .attr('x1', 0)
      .attr('x2', svgWidth)
      .attr('y1', (d: any) => yScale(d))
      .attr('y2', (d: any) => yScale(d))
      .attr('stroke', colors.grid)
      .attr('stroke-opacity', 0.3);

    // Add axes
    g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${svgHeight})`)
      .call(d3.axisBottom(xScale));

    g.append('g')
      .attr('class', 'y-axis')
      .call(d3.axisLeft(yScale));

    // Add areas
    const areaGroup = g.append('g')
      .attr('class', 'areas');

    areaGroup.selectAll('path')
      .data(groupedData)
      .enter().append('path')
      .attr('class', 'skill-area')
      .attr('d', (d: any) => area(d[1]))
      .attr('fill', (d: any) => colorScale(d[0] as string))
      .attr('fill-opacity', 0.3)
      .on('click', function(event: any, skillData: any) {
        const skill = skillData.find((s: SkillData) => s.name === d[0]);
        if (skill && onSkillClick) {
          onSkillClick(skill);
        }
      })
      .on('mouseover', function(event: any, skillData: any) {
        d3.select(this)
          .attr('fill-opacity', 0.6)
          .attr('stroke-width', 2);
      })
      .on('mouseout', function() {
        d3.select(this)
          .attr('fill-opacity', 0.3)
          .attr('stroke-width', 1);
      });

    // Add lines
    const lineGroup = g.append('g')
      .attr('class', 'lines');

    lineGroup.selectAll('path')
      .data(groupedData)
      .enter().append('path')
      .attr('class', 'skill-line')
      .attr('d', (d: any) => line(d[1]))
      .attr('fill', 'none')
      .attr('stroke', (d: any) => colorScale(d[0] as string))
      .attr('stroke-width', 2)
      .on('click', function(event: any, skillData: any) {
        const skill = skillData.find((s: SkillData) => s.name === d[0]);
        if (skill && onSkillClick) {
          onSkillClick(skill);
        }
      })
      .on('mouseover', function(event: any, skillData: any) {
        d3.select(this)
          .attr('stroke-width', 3);
      })
      .on('mouseout', function() {
        d3.select(this)
          .attr('stroke-width', 2);
      });

    return svg.node();
  }, [data, width, height, margin, theme, processSkillData, colors, onSkillClick]);

  // Generate radar chart
  const renderRadarChart = useCallback(() => {
    if (!svgRef.current || !data) return null;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const svgWidth = width - (margin.left || 0) - (margin.right || 0);
    const svgHeight = height - (margin.top || 0) - (margin.bottom || 0);

    const { skillData } = processSkillData(data);
    if (skillData.length === 0) return null;

    // Select top skills for radar
    const topSkills = skillData
      .slice(0, 8)
      .map(skill => ({
        axis: skill.name,
        value: skill.proficiency.overall,
        fullMark: 1
      }));

    const centerX = svgWidth / 2;
    const centerY = svgHeight / 2;
    const radius = Math.min(svgWidth, svgHeight) / 2 - 40;

    const angleScale = d3.scaleLinear()
      .domain([0, topSkills.length])
      .range([0, 2 * Math.PI]);

    const radiusScale = d3.scaleLinear()
      .domain([0, 1])
      .range([0, radius]);

    const radarLine = d3.lineRadial()
      .angle((d: any, i: number) => angleScale(i))
      .radius((d: any) => radiusScale(d.value))
      .curve(d3.curveLinearClosed);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Add grid
    const gridGroup = g.append('g')
      .attr('class', 'radar-grid');

    for (let i = 0; i <= 10; i++) {
      const angle = angleScale(i);
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);

      gridGroup.append('line')
        .attr('x1', centerX)
        .attr('y1', centerY)
        .attr('x2', x)
        .attr('y2', y)
        .attr('stroke', colors.grid)
        .attr('stroke-width', 0.5)
        .attr('opacity', 0.3);
    }

    // Add axes and labels
    topSkills.forEach((skill, i) => {
      const angle = angleScale(i);
      const labelRadius = radius + 20;
      const x = centerX + labelRadius * Math.cos(angle);
      const y = centerY + labelRadius * Math.sin(angle);

      gridGroup.append('line')
        .attr('x1', centerX)
        .attr('y1', centerY)
        .attr('x2', x)
        .attr('y2', y)
        .attr('stroke', colors.text)
        .attr('stroke-width', 2);

      gridGroup.append('text')
        .attr('x', x)
        .attr('y', y)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('fill', colors.text)
        .attr('font-size', '12px')
        .attr('font-weight', 'bold')
        .text(skill.axis);
    });

    // Add data polygon
    g.append('g')
      .attr('class', 'radar-data')
      .append('polygon')
      .datum(topSkills.map((d: any) => d.value))
      .attr('fill', colors.primary)
      .attr('fill-opacity', 0.3)
      .attr('stroke', colors.primary)
      .attr('stroke-width', 2)
      .attr('points', (d: any) => {
        return topSkills.map((skill: any, i: number) => {
          const angle = angleScale(i);
          const r = radiusScale(skill.value);
          const x = centerX + r * Math.cos(angle);
          const y = centerY + r * Math.sin(angle);
          return `${x},${y}`;
        }).join(' ');
      });

    return svg.node();
  }, [data, width, height, margin, theme, processSkillData, colors]);

  // Generate heatmap
  const renderHeatmap = useCallback(() => {
    if (!svgRef.current || !data) return null;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const svgWidth = width - (margin.left || 0) - (margin.right || 0);
    const svgHeight = height - (margin.top || 0) - (margin.bottom || 0);

    const { skillData } = processSkillData(data);
    if (skillData.length === 0) return null;

    // Create skill categories
    const categories = [...new Set(skillData.map(s => s.category))];
    const skills = skillData.map(skill => ({
      skill: skill.name,
      category: skill.category,
      proficiency: skill.proficiency.overall,
      knowledge: skill.proficiency.knowledge,
      practical: skill.proficiency.practical,
      creative: skill.proficiency.creative
    }));

    // Create scales
    const xScale = d3.scaleBand()
      .domain(categories)
      .range([0, svgWidth]);

    const yScale = d3.scaleBand()
      .domain(categories)
      .range([0, svgHeight]);

    const colorScale = d3.scaleSequential(colors.success)
      .domain([0, 1]);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Add cells
    g.selectAll('rect')
      .data(skills)
      .enter().append('rect')
      .attr('class', 'heatmap-cell')
      .attr('x', (d: any) => xScale(d.category))
      .attr('y', (d: any) => yScale(d.skill))
      .attr('width', xScale.bandwidth())
      .attr('height', yScale.bandwidth())
      .attr('fill', (d: any) => colorScale(d.proficiency))
      .attr('stroke', colors.background)
      .attr('stroke-width', 1)
      .on('click', function(event: any, skillData: any) {
        if (onSkillClick) {
          onSkillClick(skillData.find((s: SkillData) => s.name === skillData.skill));
        }
      })
      .on('mouseover', function(event: any, skillData: any) {
        d3.select(this)
          .attr('stroke-width', 2)
          .attr('stroke', colors.highlight);
      })
      .on('mouseout', function() {
        d3.select(this)
          .attr('stroke-width', 1)
          .attr('stroke', colors.background);
      });

    // Add axes
    g.append('g')
      .attr('class', 'x-axis')
      .selectAll('text')
      .data(categories)
      .enter().append('text')
      .attr('x', (d: any) => xScale(d) + xScale.bandwidth() / 2)
      .attr('y', -5)
      .attr('text-anchor', 'middle')
      .attr('fill', colors.text)
      .text((d: any) => d));

    g.append('g')
      .attr('class', 'y-axis')
      .selectAll('text')
      .data(categories)
      .enter().append('text')
      .attr('x', -5)
      .attr('y', (d: any) => yScale(d) + yScale.bandwidth() / 2)
      .attr('text-anchor', 'middle')
      .attr('fill', colors.text)
      .text((d: any) => d);

    return svg.node();
  }, [data, width, height, margin, theme, processSkillData, colors, onSkillClick]);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  // Render current chart based on tab
  const renderChart = () => {
    switch (currentTab) {
      case 0:
        return renderTimelineChart();
      case 1:
        return renderRadarChart();
      case 2:
        return renderHeatmap();
      default:
        return null;
    }
  };

  return (
    <Paper
      sx={{
        p: 2,
        bgcolor: colors.background,
        borderRadius: 2,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        position: 'relative'
      }}
      className={className}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Skill Progression Charts
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Tabs value={currentTab} onChange={handleTabChange}>
            <Tab icon={<TimelineIcon />} label="Timeline" />
            <Tab icon={<BarChartIcon />} label="Radar" />
            <Tab icon={<BarChartIcon />} label="Heatmap" />
          </Tabs>

          <FormControlLabel
            control={
              <Switch
                size="small"
                checked={showTrends}
                onChange={(e) => {/* Handle showTrends change */}}
              />
            }
            label="Trends"
          />
          
          <FormControlLabel
            control={
              <Switch
                size="small"
                checked={showMilestones}
                onChange={(e) => {/* Handle showMilestones change */}}
              />
            }
            label="Milestones"
          />

          <IconButton onClick={() => window.location.reload()} size="small">
            <RefreshIcon />
          </IconButton>
          
          <IconButton size="small">
            <SettingsIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Skill Information Panel */}
      {(selectedSkill || hoveredSkill) && (
        <Box
          sx={{
            position: 'absolute',
            top: 60,
            right: 20,
            p: 2,
            bgcolor: colors.background,
            border: `1px solid ${colors.grid}`,
            borderRadius: 1,
            maxWidth: 280,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
            zIndex: 10
          }}
        >
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
            {selectedSkill?.name || hoveredSkill?.name}
          </Typography>
          
          <Typography variant="body2" sx={{ mb: 0.5 }}>
            Category: {selectedSkill?.category || hoveredSkill?.category}
          </Typography>
          
          <Typography variant="body2" sx={{ mb: 0.5 }}>
            Level: {selectedSkill?.level || hoveredSkill?.level}
          </Typography>
          
          <Typography variant="body2" sx={{ mb: 0.5 }}>
            Experience: {selectedSkill?.experience || hoveredSkill?.experience}
          </Typography>
          
          <Typography variant="body2" sx={{ mb: 0.5 }}>
            Overall: {((selectedSkill?.proficiency?.overall || hoveredSkill?.proficiency?.overall || 0) * 100).toFixed(1)}%
          </Typography>
          
          <Typography variant="body2" sx={{ mb: 0.5 }}>
            Knowledge: {((selectedSkill?.proficiency?.knowledge || hoveredSkill?.proficiency?.knowledge || 0) * 100).toFixed(1)}%
          </Typography>
          
          <Typography variant="body2" sx={{ mb: 0.5 }}>
            Practical: {((selectedSkill?.proficiency?.practical || hoveredSkill?.proficiency?.practical || 0) * 100).toFixed(1)}%
          </Typography>
          
          <Typography variant="body2" sx={{ mb: 0.5 }}>
            Creative: {((selectedSkill?.proficiency?.creative || hoveredSkill?.proficiency?.creative || 0) * 100).toFixed(1)}%
          </Typography>
          
          {(selectedSkill?.trend || hoveredSkill?.trend) && (
            <Typography variant="body2" sx={{ fontStyle: 'italic', mt: 1 }}>
              Trend: {selectedSkill?.trend?.direction || hoveredSkill?.trend?.direction} ({(selectedSkill?.trend || hoveredSkill?.trend)?.rate || 0}).toFixed(2)}/day)
            </Typography>
          )}
          
          {(showMilestones && (selectedSkill?.milestones || hoveredSkill?.milestones)?.length > 0) && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Milestones:
              </Typography>
              {(selectedSkill?.milestones || hoveredSkill?.milestones)?.slice(0, 3).map((milestone: any, index: number) => (
                <Typography key={index} variant="body2" sx={{ mb: 0.5 }}>
                  • {milestone.name}: {milestone.description}
                </Typography>
              ))}
            </Box>
          )}
        </Box>
      )}

      {/* Time Range Control */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 20,
          left: 20,
          p: 1,
          bgcolor: colors.background,
          border: `1px solid ${colors.grid}`,
          borderRadius: 1,
          fontSize: '12px',
          opacity: 0.8
        }}
      >
        <Typography variant="body2">
          Time Range: {timeRange} days
        </Typography>
        <Slider
          value={timeRange}
          min={7}
          max={90}
          step={1}
          onChange={(value) => {/* Handle time range change */}}
          sx={{ width: 150, mt: 1 }}
        />
      </Box>

      <svg
        ref={svgRef}
        width={width}
        height={height}
        style={{ width: '100%', height: '100%' }}
      />
    </Paper>
  );
};

export default SkillProgressionCharts;