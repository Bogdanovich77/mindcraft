/**
 * Performance Timeline Visualization
 * 
 * Interactive D3.js timeline showing historical performance data with
 * multiple metrics, zoom/pan capabilities, and detailed drill-down functionality.
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import {
  Box,
  Card,
  CardContent,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  IconButton,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip
} from '@mui/material';
import {
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  Refresh as RefreshIcon,
  Timeline as TimelineIcon,
  Speed as SpeedIcon,
  Memory as MemoryIcon,
  Computer as CpuIcon,
  NetworkCheck as NetworkIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useSelector, useDispatch } from 'react-redux';

import type { RootState, AppDispatch } from '../store';
import { fetchAgentPerformanceHistory } from '../store/slices/performanceSlice';
import type { PerformanceMetrics } from '../types/performance';

interface PerformanceTimelineProps {
  agentId?: string;
  metrics?: ('response_time' | 'cpu_usage' | 'memory_usage' | 'network_latency' | 'error_rate' | 'throughput')[];
  timeRange?: { start: number; end: number };
  onTimeSelect?: (timestamp: number) => void;
  onMetricSelect?: (metric: string) => void;
  width?: number;
  height?: number;
  className?: string;
}

interface TimelineData {
  timestamp: number;
  response_time?: number;
  cpu_usage?: number;
  memory_usage?: number;
  network_latency?: number;
  error_rate?: number;
  throughput?: number;
}

interface ZoomState {
  scale: number;
  translate: [number, number];
}

const PerformanceTimeline: React.FC<PerformanceTimelineProps> = ({
  agentId,
  metrics = ['response_time', 'cpu_usage', 'memory_usage'],
  timeRange,
  onTimeSelect,
  onMetricSelect,
  width = 1200,
  height = 400,
  className
}) => {
  const theme = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Redux state
  const { performanceHistory, loading, error } = useSelector((state: RootState) => state.performance);
  const selectedAgent = useSelector((state: RootState) =>
    agentId ? Array.from(state.agents.agents.values()).find(a => a.id === agentId) : state.agents.selectedAgent
  );

  // Component state
  const [selectedMetrics, setSelectedMetrics] = useState(metrics);
  const [zoomState, setZoomState] = useState<ZoomState>({ scale: 1, translate: [0, 0] });
  const [hoveredPoint, setHoveredPoint] = useState<TimelineData | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange);
  const [detailLevel, setDetailLevel] = useState<'hour' | 'day' | 'week'>('day');
  const [showAnnotations, setShowAnnotations] = useState(true);
  const [smoothing, setSmoothing] = useState(0.1);

  // Process timeline data
  const processTimelineData = useCallback(() => {
    if (!performanceHistory || performanceHistory.length === 0) return [];

    const data: TimelineData[] = performanceHistory.map((record: any) => {
      const timestamp = record.timestamp;
      const processed: TimelineData = { timestamp };

      if (selectedMetrics.includes('response_time')) {
        processed.response_time = record.responseTime;
      }
      if (selectedMetrics.includes('cpu_usage')) {
        processed.cpu_usage = record.systemMetrics?.cpuUsage;
      }
      if (selectedMetrics.includes('memory_usage')) {
        processed.memory_usage = record.systemMetrics?.memoryUsage;
      }
      if (selectedMetrics.includes('network_latency')) {
        processed.network_latency = record.systemMetrics?.networkLatency;
      }
      if (selectedMetrics.includes('error_rate')) {
        processed.error_rate = record.errorRate;
      }
      if (selectedMetrics.includes('throughput')) {
        processed.throughput = record.throughput;
      }

      return processed;
    });

    // Filter by time range if specified
    if (selectedTimeRange) {
      return data.filter(d => 
        d.timestamp >= selectedTimeRange.start && d.timestamp <= selectedTimeRange.end
      );
    }

    return data;
  }, [performanceHistory, selectedMetrics, selectedTimeRange]);

  const timelineData = processTimelineData();

  // Color scales for different metrics
  const metricColors = {
    response_time: theme.palette.primary.main,
    cpu_usage: theme.palette.warning.main,
    memory_usage: theme.palette.info.main,
    network_latency: theme.palette.success.main,
    error_rate: theme.palette.error.main,
    throughput: theme.palette.secondary.main
  };

  // Metric icons
  const metricIcons = {
    response_time: <SpeedIcon />,
    cpu_usage: <CpuIcon />,
    memory_usage: <MemoryIcon />,
    network_latency: <NetworkIcon />,
    error_rate: <TimelineIcon />,
    throughput: <TimelineIcon />
  };

  // D3.js timeline rendering
  const renderTimeline = useCallback(() => {
    if (!svgRef.current || !timelineData || timelineData.length === 0) return null;

    const margin = { top: 20, right: 80, bottom: 40, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Create scales
    const xScale = d3.scaleTime()
      .domain(d3.extent(timelineData, d => d.timestamp) as [Date, Date] || [new Date(), new Date()])
      .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(timelineData, d => 
        Math.max(
          d.response_time || 0,
          d.cpu_usage || 0,
          d.memory_usage || 0,
          d.network_latency || 0,
          d.error_rate || 0,
          d.throughput || 0
        )
      ) || 100])
      .range([innerHeight, 0]);

    // Create line generators for each metric
    const lineGenerators = selectedMetrics.map(metric => {
      return d3.line<TimelineData>()
        .x(d => xScale(d.timestamp))
        .y(d => {
          switch (metric) {
            case 'response_time': return yScale(d.response_time || 0);
            case 'cpu_usage': return yScale(d.cpu_usage || 0);
            case 'memory_usage': return yScale(d.memory_usage || 0);
            case 'network_latency': return yScale(d.network_latency || 0);
            case 'error_rate': return yScale(d.error_rate || 0);
            case 'throughput': return yScale(d.throughput || 0);
            default: return yScale(0);
          }
        })
        .curve(d3.curveMonotoneX);
    });

    // Add grid lines
    g.append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(0, ${innerHeight})`)
      .call(d3.axisBottom(xScale)
        .tickSize(-innerHeight)
        .tickFormat(() => '')
      )
      .style('stroke-dasharray', '3,3')
      .style('opacity', 0.3);

    g.append('g')
      .attr('class', 'grid')
      .call(d3.axisLeft(yScale)
        .tickSize(-innerWidth)
        .tickFormat(() => '')
      )
      .style('stroke-dasharray', '3,3')
      .style('opacity', 0.3);

    // Add axes
    g.append('g')
      .attr('transform', `translate(0, ${innerHeight})`)
      .call(d3.axisBottom(xScale)
        .tickFormat((date: any) => d3.timeFormat('%H:%M')(date))
      )
      .style('font-size', '12px')
      .style('fill', theme.palette.text.secondary);

    g.append('g')
      .call(d3.axisLeft(yScale))
      .style('font-size', '12px')
      .style('fill', theme.palette.text.secondary);

    // Add lines for each metric
    selectedMetrics.forEach((metric, index) => {
      const line = lineGenerators[index];
      
      g.append('path')
        .datum(timelineData)
        .attr('fill', 'none')
        .attr('stroke', metricColors[metric as keyof typeof metricColors])
        .attr('stroke-width', 2)
        .attr('d', line)
        .style('opacity', 0.8)
        .on('mouseover', (event: any) => {
          d3.select(event.target).style('stroke-width', 3);
        })
        .on('mouseout', (event: any) => {
          d3.select(event.target).style('stroke-width', 2);
        });
    });

    // Add data points
    selectedMetrics.forEach(metric => {
      g.selectAll(`.dot-${metric}`)
        .data(timelineData)
        .enter()
        .append('circle')
        .attr('class', `dot-${metric}`)
        .attr('cx', d => xScale(d.timestamp))
        .attr('cy', d => {
          switch (metric) {
            case 'response_time': return yScale(d.response_time || 0);
            case 'cpu_usage': return yScale(d.cpu_usage || 0);
            case 'memory_usage': return yScale(d.memory_usage || 0);
            case 'network_latency': return yScale(d.network_latency || 0);
            case 'error_rate': return yScale(d.error_rate || 0);
            case 'throughput': return yScale(d.throughput || 0);
            default: return yScale(0);
          }
        })
        .attr('r', 3)
        .attr('fill', metricColors[metric as keyof typeof metricColors])
        .style('opacity', 0.7)
        .on('mouseover', (event: any, d: any) => {
          setHoveredPoint(d);
          d3.select(event.target).attr('r', 5);
        })
        .on('mouseout', (event: any) => {
          setHoveredPoint(null);
          d3.select(event.target).attr('r', 3);
        })
        .on('click', (event: any, d: any) => {
          if (onTimeSelect) {
            onTimeSelect(d.timestamp);
          }
        });
    });

    // Add annotations for significant events
    if (showAnnotations) {
      const annotations = timelineData.filter(d => 
        (d.error_rate && d.error_rate > 0.1) ||
        (d.response_time && d.response_time > 1000) ||
        (d.cpu_usage && d.cpu_usage > 80)
      );

      g.selectAll('.annotation')
        .data(annotations)
        .enter()
        .append('g')
        .attr('class', 'annotation')
        .attr('transform', d => `translate(${xScale(d.timestamp)}, ${yScale(0)})`)
        .append('circle')
        .attr('r', 8)
        .attr('fill', theme.palette.error.main)
        .attr('opacity', 0.6)
        .on('mouseover', (event: any, d: any) => {
          setHoveredPoint(d);
        })
        .on('mouseout', () => {
          setHoveredPoint(null);
        });
    }

    return svg.node();
  }, [timelineData, selectedMetrics, width, height, theme, onTimeSelect, showAnnotations]);

  // Handle zoom
  const handleZoomIn = () => {
    setZoomState(prev => ({
      scale: Math.min(prev.scale * 1.2, 5),
      translate: prev.translate
    }));
  };

  const handleZoomOut = () => {
    setZoomState(prev => ({
      scale: Math.max(prev.scale / 1.2, 0.5),
      translate: prev.translate
    }));
  };

  const handleResetZoom = () => {
    setZoomState({ scale: 1, translate: [0, 0] });
  };

  // Handle metric selection
  const handleMetricChange = (
    event: React.MouseEvent<HTMLElement>,
    newMetrics: string[]
  ) => {
    setSelectedMetrics(newMetrics as any);
    if (onMetricSelect && newMetrics.length > 0) {
      onMetricSelect(newMetrics[0]);
    }
  };

  // Refresh data
  const handleRefresh = () => {
    if (agentId) {
      dispatch(fetchAgentPerformanceHistory(agentId));
    }
  };

  // Load data on mount
  useEffect(() => {
    if (agentId) {
      dispatch(fetchAgentPerformanceHistory(agentId));
    }
  }, [agentId, dispatch]);

  // Re-render on data changes
  useEffect(() => {
    renderTimeline();
  }, [renderTimeline]);

  return (
    <Card className={className}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h6">
            Performance Timeline
            {selectedAgent && ` - ${selectedAgent.name}`}
          </Typography>
          
          <Box display="flex" alignItems="center" gap={1}>
            <IconButton onClick={handleRefresh} disabled={loading}>
              <RefreshIcon />
            </IconButton>
            
            <IconButton onClick={handleZoomIn}>
              <ZoomInIcon />
            </IconButton>
            
            <IconButton onClick={handleZoomOut}>
              <ZoomOutIcon />
            </IconButton>
            
            <IconButton onClick={handleResetZoom}>
              <RefreshIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Metric Selection */}
        <Box mb={2}>
          <ToggleButtonGroup
            value={selectedMetrics}
            onChange={handleMetricChange}
            aria-label="Performance metrics"
          >
            {Object.entries(metricIcons).map(([metric, icon]) => (
              <ToggleButton key={metric} value={metric} aria-label={metric}>
                <Box display="flex" alignItems="center" gap={0.5}>
                  {icon}
                  <Typography variant="caption">
                    {metric.replace('_', ' ').toUpperCase()}
                  </Typography>
                </Box>
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>

        {/* Time Range Controls */}
        <Box display="flex" gap={2} mb={2}>
          <FormControl size="small" style={{ minWidth: 120 }}>
            <InputLabel>Detail Level</InputLabel>
            <Select
              value={detailLevel}
              onChange={(e) => setDetailLevel(e.target.value as any)}
            >
              <MenuItem value="hour">Hour</MenuItem>
              <MenuItem value="day">Day</MenuItem>
              <MenuItem value="week">Week</MenuItem>
            </Select>
          </FormControl>

          <Box flex={1}>
            <Typography variant="caption" gutterBottom>
              Smoothing: {smoothing.toFixed(2)}
            </Typography>
            <Slider
              value={smoothing}
              onChange={(e, value) => setSmoothing(value as number)}
              min={0}
              max={1}
              step={0.1}
              size="small"
            />
          </Box>

          <Chip
            label={showAnnotations ? "Annotations On" : "Annotations Off"}
            onClick={() => setShowAnnotations(!showAnnotations)}
            size="small"
            color={showAnnotations ? "primary" : "default"}
          />
        </Box>

        {/* Timeline Visualization */}
        <Box
          ref={containerRef}
          style={{
            overflow: 'hidden',
            borderRadius: theme.shape.borderRadius,
            border: `1px solid ${theme.palette.divider}`
          }}
        >
          <svg
            ref={svgRef}
            style={{
              transform: `scale(${zoomState.scale}) translate(${zoomState.translate[0]}px, ${zoomState.translate[1]}px)`,
              transformOrigin: 'top left',
              cursor: 'grab'
            }}
          />
        </Box>

        {/* Hover Information */}
        {hoveredPoint && (
          <Box
            position="absolute"
            bgcolor={theme.palette.background.paper}
            border={1}
            borderColor={theme.palette.divider}
            borderRadius={1}
            p={1}
            style={{
              top: 100,
              right: 20,
              zIndex: 1000,
              minWidth: 200
            }}
          >
            <Typography variant="h6" gutterBottom>
              {new Date(hoveredPoint.timestamp).toLocaleString()}
            </Typography>
            
            {selectedMetrics.map(metric => {
              const value = hoveredPoint[metric as keyof TimelineData];
              if (value === undefined) return null;
              
              return (
                <Box key={metric} display="flex" justifyContent="space-between" mb={0.5}>
                  <Typography variant="body2">
                    {metric.replace('_', ' ').toUpperCase()}:
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {typeof value === 'number' ? value.toFixed(2) : value}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        )}

        {/* Error State */}
        {error && (
          <Box textAlign="center" py={4}>
            <Typography color="error">
              Error loading performance data: {error}
            </Typography>
          </Box>
        )}

        {/* Loading State */}
        {loading && (
          <Box textAlign="center" py={4}>
            <Typography>Loading performance data...</Typography>
          </Box>
        )}

        {/* Empty State */}
        {!loading && !error && timelineData.length === 0 && (
          <Box textAlign="center" py={4}>
            <Typography color="textSecondary">
              No performance data available
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default PerformanceTimeline;