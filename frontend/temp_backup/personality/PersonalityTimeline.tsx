import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tooltip,
  IconButton,
  Slider,
  FormControlLabel,
  Switch,
  useTheme,
  alpha
} from '@mui/material';
import {
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  Fullscreen as FullscreenIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';
import * as d3 from 'd3';
import type { PersonalityEvolution, TimelineConfig, PersonalityEvent } from '../../types/personality';
import type { PersonalityTraits } from '../../types/agent';

interface PersonalityTimelineProps {
  data: PersonalityEvolution[];
  config?: Partial<TimelineConfig>;
  onTimeRangeChange?: (start: number, end: number) => void;
  onEventClick?: (event: PersonalityEvent) => void;
  onTraitClick?: (trait: string, value: number, timestamp: number) => void;
  className?: string;
}

const PersonalityTimeline: React.FC<PersonalityTimelineProps> = ({
  data,
  config,
  onTimeRangeChange,
  onEventClick,
  onTraitClick,
  className
}) => {
  const theme = useTheme();
  const svgRef = useRef<SVGSVGElement>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [timeRange, setTimeRange] = useState<[number, number]>([0, 100]);
  const [showEvents, setShowEvents] = useState(true);
  const [showInfluences, setShowInfluences] = useState(true);
  const [selectedTrait, setSelectedTrait] = useState<string | null>(null);
  const [hoveredEvent, setHoveredEvent] = useState<PersonalityEvent | null>(null);

  // Default configuration
  const defaultConfig: TimelineConfig = {
    width: 800,
    height: 400,
    margin: { top: 40, right: 40, bottom: 60, left: 60 },
    showGrid: true,
    showEvents: true,
    showInfluences: true,
    timeFormat: '%Y-%m-%d %H:%M',
    colors: {
      traits: ['#9C27B0', '#2196F3', '#FF9800', '#4CAF50', '#F44336', '#FF5722', '#E91E63', '#673AB7', '#3F51B5', '#009688'],
      events: '#FF9800',
      influences: '#2196F3'
    }
  };

  const chartConfig = { ...defaultConfig, ...config };

  // Calculate dimensions
  const width = (chartConfig.width * zoomLevel) - chartConfig.margin.left - chartConfig.margin.right;
  const height = (chartConfig.height * zoomLevel) - chartConfig.margin.top - chartConfig.margin.bottom;

  // Get trait names from data
  const traitNames = data.length > 0 ? Object.keys(data[0].traits) : [];

  useEffect(() => {
    if (!svgRef.current || !data || data.length === 0) return;

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('width', chartConfig.width * zoomLevel)
      .attr('height', chartConfig.height * zoomLevel);

    const g = svg.append('g')
      .attr('transform', `translate(${chartConfig.margin.left}, ${chartConfig.margin.top})`);

    // Process data for timeline
    const processedData = data.map(d => ({
      ...d,
      date: new Date(d.timestamp)
    }));

    // Create scales
    const xScale = d3.scaleTime()
      .domain(d3.extent(processedData, d => d.date) as [Date, Date])
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain([0, 1])
      .range([height, 0]);

    // Create line generators for each trait
    const lineGenerators = traitNames.map(trait => 
      d3.line<any>()
        .x(d => xScale(d.date))
        .y(d => yScale(d.traits[trait as keyof PersonalityTraits]))
        .curve(d3.curveMonotoneX)
    );

    // Draw grid
    if (chartConfig.showGrid) {
      // Vertical grid lines
      g.append('g')
        .attr('class', 'grid')
        .attr('transform', `translate(0, ${height})`)
        .call(d3.axisBottom(xScale)
          .tickSize(-height)
          .tickFormat(() => '')
        )
        .style('stroke-dasharray', '3,3')
        .style('opacity', 0.3);

      // Horizontal grid lines
      g.append('g')
        .attr('class', 'grid')
        .call(d3.axisLeft(yScale)
          .tickSize(-width)
          .tickFormat(() => '')
        )
        .style('stroke-dasharray', '3,3')
        .style('opacity', 0.3);
    }

    // Draw axes
    g.append('g')
      .attr('transform', `translate(0, ${height})`)
      .call(d3.axisBottom(xScale)
        .tickFormat((d: any) => d3.timeFormat(chartConfig.timeFormat)(d))
      );

    g.append('g')
      .call(d3.axisLeft(yScale));

    // Draw trait lines
    traitNames.forEach((trait, i) => {
      const line = g.append('path')
        .datum(processedData)
        .attr('fill', 'none')
        .attr('stroke', chartConfig.colors.traits[i % chartConfig.colors.traits.length])
        .attr('stroke-width', 2)
        .attr('d', lineGenerators[i])
        .style('opacity', selectedTrait && selectedTrait !== trait ? 0.3 : 1)
        .style('cursor', 'pointer')
        .on('click', (event, d) => {
          if (onTraitClick) {
            const mousePos = d3.pointer(event, g.node());
            const xDate = xScale.invert(mousePos[0]);
            const closestData = d.reduce((prev, curr) => 
              Math.abs(curr.date.getTime() - xDate.getTime()) < Math.abs(prev.date.getTime() - xDate.getTime()) ? curr : prev
            );
            onTraitClick(trait, closestData.traits[trait as keyof PersonalityTraits], closestData.timestamp);
          }
        })
        .on('mouseenter', (event, d) => {
          setSelectedTrait(trait);
          d3.select(event.target)
            .transition()
            .duration(200)
            .attr('stroke-width', 3);
        })
        .on('mouseleave', (event, d) => {
          setSelectedTrait(null);
          d3.select(event.target)
            .transition()
            .duration(200)
            .attr('stroke-width', 2);
        });

      // Animation
      if (chartConfig.animated) {
        const totalLength = line.node()?.getTotalLength() || 0;
        line
          .attr('stroke-dasharray', totalLength)
          .attr('stroke-dashoffset', totalLength)
          .transition()
          .duration(chartConfig.animationDuration || 750)
          .delay(i * 100)
          .ease(d3.easeLinear)
          .attr('stroke-dashoffset', 0);
      }
    });

    // Draw events
    if (showEvents && chartConfig.showEvents) {
      const events = processedData.flatMap(d => 
        (d.significantEvents || []).map(event => ({
          ...event,
          timestamp: d.timestamp,
          date: d.date
        }))
      );

      const eventGroups = g.selectAll('.event')
        .data(events)
        .enter().append('g')
        .attr('class', 'event');

      eventGroups.append('circle')
        .attr('cx', d => xScale(d.date))
        .attr('cy', height - 20)
        .attr('r', 4)
        .attr('fill', chartConfig.colors.events)
        .attr('stroke', theme.palette.background.paper)
        .attr('stroke-width', 2)
        .style('cursor', 'pointer')
        .on('click', (event, d) => {
          if (onEventClick) {
            onEventClick(d);
          }
        })
        .on('mouseenter', (event, d) => {
          setHoveredEvent(d);
          d3.select(event.target)
            .transition()
            .duration(200)
            .attr('r', 6);
        })
        .on('mouseleave', (event, d) => {
          setHoveredEvent(null);
          d3.select(event.target)
            .transition()
            .duration(200)
            .attr('r', 4);
        });

      eventGroups.append('text')
        .attr('x', d => xScale(d.date))
        .attr('y', height - 5)
        .attr('text-anchor', 'middle')
        .attr('font-size', '8px')
        .attr('fill', theme.palette.text.secondary)
        .text(d => d.type.charAt(0).toUpperCase());
    }

    // Draw influences
    if (showInfluences && chartConfig.showInfluences) {
      const influences = processedData.flatMap(d => 
        (d.influences || []).map(influence => ({
          ...influence,
          timestamp: d.timestamp,
          date: d.date
        }))
      );

      const influenceGroups = g.selectAll('.influence')
        .data(influences)
        .enter().append('g')
        .attr('class', 'influence');

      influenceGroups.append('rect')
        .attr('x', d => xScale(d.date) - 2)
        .attr('y', d => yScale(0.5 + d.impact * 0.5) - 2)
        .attr('width', 4)
        .attr('height', 4)
        .attr('fill', chartConfig.colors.influences)
        .attr('opacity', 0.6)
        .style('cursor', 'pointer')
        .on('mouseenter', (event, d) => {
          d3.select(event.target)
            .transition()
            .duration(200)
            .attr('opacity', 1);
        })
        .on('mouseleave', (event, d) => {
          d3.select(event.target)
            .transition()
            .duration(200)
            .attr('opacity', 0.6);
        });
    }

    // Add legend
    const legend = g.append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${width - 150}, 20)`);

    traitNames.forEach((trait, i) => {
      const legendRow = legend.append('g')
        .attr('transform', `translate(0, ${i * 20})`);

      legendRow.append('line')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', 20)
        .attr('y2', 0)
        .attr('stroke', chartConfig.colors.traits[i % chartConfig.colors.traits.length])
        .attr('stroke-width', 2);

      legendRow.append('text')
        .attr('x', 25)
        .attr('y', 0)
        .attr('dy', '0.35em')
        .attr('font-size', '12px')
        .attr('fill', theme.palette.text.primary)
        .text(trait);
    });

  }, [data, chartConfig, zoomLevel, showEvents, showInfluences, selectedTrait, theme, onTraitClick, onEventClick]);

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.1, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.1, 0.5));
  };

  const handleTimeRangeChange = (event: Event, newValue: number | number[]) => {
    const range = newValue as [number, number];
    setTimeRange(range);
    if (onTimeRangeChange && data.length > 0) {
      const minTime = Math.min(...data.map(d => d.timestamp));
      const maxTime = Math.max(...data.map(d => d.timestamp));
      const startTime = minTime + (range[0] / 100) * (maxTime - minTime);
      const endTime = minTime + (range[1] / 100) * (maxTime - minTime);
      onTimeRangeChange(startTime, endTime);
    }
  };

  return (
    <Card className={className} sx={{ height: 'fit-content' }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">
            Personality Evolution Timeline
          </Typography>
          <Box display="flex" gap={1}>
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
            <Tooltip title="Fullscreen">
              <IconButton size="small">
                <FullscreenIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Track personality changes over time. Click on trait lines to see detailed values.
        </Typography>

        <Box display="flex" gap={2} mb={2}>
          <FormControlLabel
            control={
              <Switch
                checked={showEvents}
                onChange={(e) => setShowEvents(e.target.checked)}
                size="small"
              />
            }
            label="Show Events"
          />
          <FormControlLabel
            control={
              <Switch
                checked={showInfluences}
                onChange={(e) => setShowInfluences(e.target.checked)}
                size="small"
              />
            }
            label="Show Influences"
          />
        </Box>
        
        <Box display="flex" justifyContent="center" alignItems="center" sx={{ overflow: 'auto' }}>
          <svg ref={svgRef}></svg>
        </Box>

        <Box mt={2}>
          <Typography variant="subtitle2" gutterBottom>
            Time Range
          </Typography>
          <Slider
            value={timeRange}
            onChange={handleTimeRangeChange}
            valueLabelDisplay="auto"
            valueLabelFormat={(value) => `${value}%`}
            min={0}
            max={100}
            marks={[
              { value: 0, label: 'Start' },
              { value: 50, label: 'Middle' },
              { value: 100, label: 'End' }
            ]}
          />
        </Box>

        {hoveredEvent && (
          <Box mt={2}>
            <Typography variant="body2" color="text.secondary">
              <strong>Event:</strong> {hoveredEvent.description}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Type:</strong> {hoveredEvent.type}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Impact:</strong> {hoveredEvent.impact.significance.toFixed(2)}
            </Typography>
          </Box>
        )}

        {selectedTrait && (
          <Box mt={2}>
            <Typography variant="body2" color="text.secondary">
              <strong>Selected Trait:</strong> {selectedTrait}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default PersonalityTimeline;