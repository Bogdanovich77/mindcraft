/**
 * Performance Timeline Visualization
 * 
 * Interactive D3.js visualization of agent performance over time,
 * showing cognitive load, response times, and system health metrics.
 */

import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography, Paper, IconButton, Tooltip, FormControl, InputLabel, Select, MenuItem, Chip, Card, CardContent } from '@mui/material';
import {
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  Refresh as RefreshIcon,
  CenterFocusStrong as CenterIcon,
  Timeline as TimelineIcon,
  Speed as SpeedIcon,
  Memory as MemoryIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../../store';
import type { PerformanceMetrics, SystemHealth } from '../../types/performance';
import * as d3 from 'd3';

interface PerformanceTimelineProps {
  width?: number;
  height?: number;
  className?: string;
}

interface TimelineDataPoint {
  timestamp: number;
  cognitiveLoad: number;
  responseTime: number;
  systemHealth: number;
  memoryUsage: number;
  cpuUsage: number;
  errorCount: number;
  goalCompletion: number;
  skillProgress: number;
}

interface PerformanceEvent {
  timestamp: number;
  type: 'error' | 'warning' | 'info' | 'milestone' | 'goal_complete';
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  metrics?: Partial<TimelineDataPoint>;
}

const PerformanceTimeline: React.FC<PerformanceTimelineProps> = ({
  width = 800,
  height = 600,
  className
}) => {
  const theme = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Redux state
  const { performance } = useSelector((state: RootState) => state.performance as any);
  
  // Component state
  const [selectedTimeRange, setSelectedTimeRange] = useState<'hour' | 'day' | 'week' | 'month'>('day');
  const [showEvents, setShowEvents] = useState<boolean>(true);
  const [showMetrics, setShowMetrics] = useState<boolean>(true);
  const [zoom, setZoom] = useState(1);
  const [hoveredPoint, setHoveredPoint] = useState<TimelineDataPoint | null>(null);

  // Process performance data for visualization
  const processPerformanceData = (): TimelineDataPoint[] => {
    if (!performance.metrics || !performance.metrics.history) return [];

    return performance.metrics.history.map(metric => ({
      timestamp: metric.timestamp,
      cognitiveLoad: metric.cognitiveLoad || 0,
      responseTime: metric.responseTime || 0,
      systemHealth: metric.systemHealth || 100,
      memoryUsage: metric.memoryUsage || 0,
      cpuUsage: metric.cpuUsage || 0,
      errorCount: metric.errorCount || 0,
      goalCompletion: metric.goalCompletionRate || 0,
      skillProgress: metric.skillProgressRate || 0
    }));
  };

  // Get performance events
  const getPerformanceEvents = (): PerformanceEvent[] => {
    if (!performance.events) return [];

    return performance.events.map(event => ({
      timestamp: event.timestamp,
      type: event.type,
      description: event.description,
      severity: event.severity,
      metrics: event.metrics
    }));
  };

  // Filter data based on time range
  const getFilteredData = () => {
    const data = processPerformanceData();
    const events = getPerformanceEvents();
    const now = Date.now();
    let cutoffTime = now;

    switch (selectedTimeRange) {
      case 'hour':
        cutoffTime = now - (60 * 60 * 1000);
        break;
      case 'day':
        cutoffTime = now - (24 * 60 * 60 * 1000);
        break;
      case 'week':
        cutoffTime = now - (7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        cutoffTime = now - (30 * 24 * 60 * 60 * 1000);
        break;
    }

    const filteredData = data.filter(point => point.timestamp >= cutoffTime);
    const filteredEvents = events.filter(event => event.timestamp >= cutoffTime);

    return { data: filteredData, events: filteredEvents };
  };

  // Get color based on metric type
  const getMetricColor = (metricType: string, value: number) => {
    switch (metricType) {
      case 'cognitiveLoad':
        return value > 0.8 ? theme.palette.error.main : 
               value > 0.6 ? theme.palette.warning.main : 
               value > 0.4 ? theme.palette.info.main : 
               theme.palette.success.main;
      case 'responseTime':
        return value > 1000 ? theme.palette.error.main : 
               value > 500 ? theme.palette.warning.main : 
               theme.palette.success.main;
      case 'systemHealth':
        return value > 80 ? theme.palette.success.main : 
               value > 60 ? theme.palette.warning.main : 
               value > 40 ? theme.palette.error.main : 
               theme.palette.success.main;
      case 'memoryUsage':
      return value > 80 ? theme.palette.error.main : 
               value > 60 ? theme.palette.warning.main : 
               theme.palette.success.main;
      case 'cpuUsage':
        return value > 80 ? theme.palette.error.main : 
               value > 60 ? theme.palette.warning.main : 
               theme.palette.success.main;
      default:
        return theme.palette.primary.main;
    }
  };

  // Get event color based on severity
  const getEventColor = (severity: string) => {
    switch (severity) {
      case 'critical': return theme.palette.error.main;
      case 'high': return theme.palette.warning.main;
      case 'medium': return theme.palette.info.main;
      case 'low': return theme.palette.success.main;
      default: return theme.palette.grey[500];
    }
  };

  // Initialize timeline visualization
  useEffect(() => {
    if (!svgRef.current || !performance.metrics) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const { data, events } = getFilteredData();
    if (data.length === 0) return;

    const margin = { top: 40, right: 80, bottom: 60, left: 60 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Create scales
    const xScale = d3.scaleTime()
      .domain(d3.extent(data, d => d.timestamp) as [Date, Date])
      .range([0, chartWidth]);

    const yScale = d3.scaleLinear()
      .domain([0, 1])
      .range([chartHeight, 0]);

    // Create line generators
    const cognitiveLoadLine = d3.line<TimelineDataPoint>()
      .x(d => xScale(d.timestamp))
      .y(d => yScale(d.cognitiveLoad))
      .curve(d3.curveMonotoneX);

    const responseTimeLine = d3.line<TimelineDataPoint>()
      .x(d => xScale(d.timestamp))
      .y(d => yScale(d.responseTime / 2000)) // Normalize to 0-1 scale
      .curve(d3.curveMonotoneX);

    const systemHealthLine = d3.line<TimelineDataPoint>()
      .x(d => xScale(d.timestamp))
      .y(d => yScale(d.systemHealth / 100))
      .curve(d3.curveMonotoneX);

    const memoryUsageLine = d3.line<TimelineDataPoint>()
      .x(d => xScale(d.timestamp))
      .y(d => yScale(d.memoryUsage / 100))
      .curve(d3.curveMonotoneX);

    const cpuUsageLine = d3.line<TimelineDataPoint>()
      .x(d => xScale(d.timestamp))
      .y(d => yScale(d.cpuUsage / 100))
      .curve(d3.curveMonotoneX);

    // Create main group
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Add grid lines
    const gridLines = g.append('g')
      .attr('class', 'grid-lines');

    // Horizontal grid lines
    for (let i = 0; i <= 5; i++) {
      const y = yScale(i / 5);
      gridLines.append('line')
        .attr('x1', 0)
        .attr('x2', chartWidth)
        .attr('y1', y)
        .attr('y2', y)
        .attr('stroke', theme.palette.divider)
        .attr('stroke-opacity', 0.3)
        .attr('stroke-dasharray', '2,2');
    }

    // Add metric lines
    if (showMetrics) {
      g.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', getMetricColor('cognitiveLoad', data[data.length - 1]?.cognitiveLoad || 0))
        .attr('stroke-width', 2)
        .attr('d', cognitiveLoadLine);

      g.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', getMetricColor('responseTime', data[data.length - 1]?.responseTime || 0))
        .attr('stroke-width', 2)
        .attr('d', responseTimeLine);

      g.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', getMetricColor('systemHealth', data[data.length - 1]?.systemHealth || 100))
        .attr('stroke-width', 2)
        .attr('d', systemHealthLine);

      g.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', getMetricColor('memoryUsage', data[data.length - 1]?.memoryUsage || 0))
        .attr('stroke-width', 2)
        .attr('d', memoryUsageLine);

      g.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', getMetricColor('cpuUsage', data[data.length - 1]?.cpuUsage || 0))
        .attr('stroke-width', 2)
        .attr('d', cpuUsageLine);
    }

    // Add data points
    const dataPoints = g.selectAll('circle')
      .data(data)
      .enter().append('circle')
      .attr('r', 3)
      .attr('fill', theme.palette.primary.main)
      .attr('stroke', theme.palette.background.paper)
      .attr('stroke-width', 1)
      .style('cursor', 'pointer')
      .on('mouseover', (event, d) => {
        setHoveredPoint(d);
      })
      .on('mouseout', () => {
        setHoveredPoint(null);
      })
      .on('click', (event, d) => {
        // Handle point click
        console.log('Timeline point clicked:', d);
      });

    // Add event markers
    if (showEvents && events.length > 0) {
      const eventMarkers = g.selectAll('g')
        .data(events)
        .enter().append('g');

      eventMarkers.append('line')
        .attr('x1', d => xScale(d.timestamp))
        .attr('y1', chartHeight / 2)
        .attr('x2', d => xScale(d.timestamp))
        .attr('y2', chartHeight / 2)
        .attr('stroke', getEventColor(d.severity))
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '3,3');

      eventMarkers.append('circle')
        .attr('cx', d => xScale(d.timestamp))
        .attr('cy', chartHeight / 2)
        .attr('r', 6)
        .attr('fill', getEventColor(d.severity))
        .attr('stroke', theme.palette.background.paper)
        .attr('stroke-width', 2)
        .style('cursor', 'pointer');

      eventMarkers.append('text')
        .attr('x', d => xScale(d.timestamp))
        .attr('y', chartHeight / 2 - 10)
        .attr('text-anchor', 'middle')
        .attr('font-size', '10px')
        .attr('fill', theme.palette.text.primary)
        .text(d.type);
    }

    // Add axes
    const xAxis = d3.axisBottom(xScale)
      .tickFormat(d3.timeFormat('%H:%M'));

    const yAxis = d3.axisLeft(yScale)
      .tickFormat(d => `${(d * 100).toFixed(0)}%`);

    g.append('g')
      .attr('transform', `translate(0, ${chartHeight})`)
      .call(xAxis);

    g.append('g')
      .call(yAxis);

    // Add legend
    if (showMetrics) {
      const legend = g.append('g')
        .attr('transform', `translate(${chartWidth - 70}, 20)`);

      const metrics = [
        { name: 'Cognitive Load', color: getMetricColor('cognitiveLoad', data[data.length - 1]?.cognitiveLoad || 0) },
        { name: 'Response Time', color: getMetricColor('responseTime', data[data.length - 1]?.responseTime || 0) },
        { name: 'System Health', color: getMetricColor('systemHealth', data[data.length - 1]?.systemHealth || 100) },
        { name: 'Memory Usage', color: getMetricColor('memoryUsage', data[data.length - 1]?.memoryUsage || 0) },
        { name: 'CPU Usage', color: getMetricColor('cpuUsage', data[data.length - 1]?.cpuUsage || 0) }
      ];

      metrics.forEach((metric, index) => {
        const y = index * 20;
        
        legend.append('line')
          .attr('x1', 0)
          .attr('y1', y)
          .attr('x2', 15)
          .attr('y2', y)
          .attr('stroke', metric.color)
          .attr('stroke-width', 2);

        legend.append('text')
          .attr('x', 20)
          .attr('y', y + 4)
          .attr('font-size', '12px')
          .attr('fill', theme.palette.text.primary)
          .text(metric.name);
      });
    }

    // Add zoom behavior
    const zoomBehavior = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 5])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
        setZoom(event.transform.k);
      });

    svg.call(zoomBehavior);

  }, [performance, selectedTimeRange, showMetrics, showEvents, width, height]);

  // Handle zoom controls
  const handleZoomIn = () => {
    const svg = d3.select(svgRef.current);
    const zoomBehavior = d3.zoom<SVGSVGElement, unknown>();
    (svg as any).transition().call(zoomBehavior.scaleBy, 1.2);
  };

  const handleZoomOut = () => {
    const svg = d3.select(svgRef.current);
    const zoomBehavior = d3.zoom<SVGSVGElement, unknown>();
    (svg as any).transition().call(zoomBehavior.scaleBy, 0.8);
  };

  const handleCenter = () => {
    const svg = d3.select(svgRef.current);
    const zoomBehavior = d3.zoom<SVGSVGElement, unknown>();
    (svg as any).transition().call(zoomBehavior.transform, d3.zoomIdentity);
  };

  const handleRefresh = () => {
    // Force re-render
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    // Re-render will be triggered by useEffect
  };

  const { data, events } = getFilteredData();

  return (
    <Paper className={className} sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Performance Timeline</Typography>
        
        <Box display="flex" gap={1}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={selectedTimeRange}
              label="Time Range"
              onChange={(e) => setSelectedTimeRange(e.target.value as any)}
            >
              <MenuItem value="hour">Last Hour</MenuItem>
              <MenuItem value="day">Last Day</MenuItem>
              <MenuItem value="week">Last Week</MenuItem>
              <MenuItem value="month">Last Month</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Show</InputLabel>
            <Select
              value={showMetrics && showEvents ? 'both' : showMetrics ? 'metrics' : 'events'}
              label="Show"
              onChange={(e) => {
                const value = e.target.value as any;
                setShowMetrics(value === 'metrics' || value === 'both');
                setShowEvents(value === 'events' || value === 'both');
              }}
            >
              <MenuItem value="both">Both</MenuItem>
              <MenuItem value="metrics">Metrics Only</MenuItem>
              <MenuItem value="events">Events Only</MenuItem>
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
          width={width}
          height={height}
          style={{ border: `1px solid ${theme.palette.divider}`, borderRadius: '4px' }}
        />
      </Box>

      {hoveredPoint && (
        <Box mt={2} p={2} bgcolor={theme.palette.grey[50]} borderRadius={1}>
          <Typography variant="subtitle2" gutterBottom>
            Performance at {new Date(hoveredPoint.timestamp).toLocaleString()}
          </Typography>
          
          <Box display="flex" gap={2}>
            <Box flex={1}>
              <Typography variant="body2" color="textSecondary">Cognitive Load</Typography>
              <Typography variant="h6">{(hoveredPoint.cognitiveLoad * 100).toFixed(1)}%</Typography>
            </Box>
            
            <Box flex={1}>
              <Typography variant="body2" color="textSecondary">Response Time</Typography>
              <Typography variant="h6">{hoveredPoint.responseTime}ms</Typography>
            </Box>
            
            <Box flex={1}>
              <Typography variant="body2" color="textSecondary">System Health</Typography>
              <Typography variant="h6">{hoveredPoint.systemHealth}%</Typography>
            </Box>
            
            <Box flex={1}>
              <Typography variant="body2" color="textSecondary">Memory Usage</Typography>
              <Typography variant="h6">{hoveredPoint.memoryUsage}%</Typography>
            </Box>
            
            <Box flex={1}>
              <Typography variant="body2" color="textSecondary">CPU Usage</Typography>
              <Typography variant="h6">{hoveredPoint.cpuUsage}%</Typography>
            </Box>
          </Box>
        </Box>
      )}

      <Box mt={2} display="flex" gap={1} flexWrap="wrap">
        <Chip
          label={`Zoom: ${(zoom * 100).toFixed(0)}%`}
          size="small"
          color="primary"
        />
        <Chip
          label={`${data.length} data points`}
          size="small"
          color="secondary"
        />
        {showEvents && (
          <Chip
            label={`${events.length} events`}
            size="small"
            color="info"
          />
        )}
        {performance.metrics?.current && (
          <Chip
            label={`Current Load: ${(performance.metrics.current.cognitiveLoad * 100).toFixed(1)}%`}
            size="small"
            color={performance.metrics.current.cognitiveLoad > 0.8 ? 'error' : 
                     performance.metrics.current.cognitiveLoad > 0.6 ? 'warning' : 'success'}
          />
        )}
      </Box>
    </Paper>
  );
};

export default PerformanceTimeline;