import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel,
  Chip,
  Button,
  Menu,
  Card,
  CardContent,
} from '@mui/material';
import {
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  Settings as SettingsIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  SkipNext as NextIcon,
  SkipPrevious as PrevIcon,
} from '@mui/icons-material';
import * as d3 from 'd3';
import type { MemorySystem, EpisodicEvent, Experience } from '../../types/memory';

interface EpisodicMemoryTimelineProps {
  memorySystem?: MemorySystem;
  loading?: boolean;
  onRefresh?: () => void;
}

interface TimelineEvent {
  id: string;
  title: string;
  timestamp: number;
  type: 'event' | 'experience';
  significance: number;
  emotions: string[];
  participants: string[];
  location?: string;
  description: string;
  color?: string;
  y?: number;
}

const EpisodicMemoryTimeline: React.FC<EpisodicMemoryTimelineProps> = ({
  memorySystem,
  loading = false,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [zoom, setZoom] = useState(1);
  // const [timeRange, setTimeRange] = useState<[number, number]>([0, 100]);
  const [showEmotions, setShowEmotions] = useState(true);
  const [showParticipants, setShowParticipants] = useState(true);
  const [showSignificance, setShowSignificance] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [settingsAnchor, setSettingsAnchor] = useState<null | HTMLElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const animationRef = useRef<number | undefined>(undefined);

  // Process memory data for visualization
  const { events } = useMemo(() => {
    if (!memorySystem?.episodic) {
      return { events: [] as TimelineEvent[], timelineData: null };
    }

    const episodicEvents = memorySystem.episodic.events;
    const experiences = memorySystem.episodic.experiences;
    const timeline = memorySystem.episodic.timeline;

    // Create timeline events from episodic events
    const timelineEvents: TimelineEvent[] = [
      ...episodicEvents.map((event: EpisodicEvent) => ({
        id: event.id,
        title: event.title,
        timestamp: event.startTime,
        type: 'event' as const,
        significance: event.significance,
        emotions: event.emotions.map(e => e.type),
        participants: event.participants,
        location: `${event.location.x}, ${event.location.y}`,
        description: event.description,
        color: getEventColor(event.significance),
      })),
      ...experiences.map((exp: Experience) => ({
        id: exp.id,
        title: `Experience: ${exp.eventId}`,
        timestamp: exp.timestamp,
        type: 'experience' as const,
        significance: 0.5, // Default significance for experiences
        emotions: [],
        participants: [],
        description: exp.lessons.join(', '),
        color: '#9c27b0', // Purple for experiences
      })),
    ];

    // Sort by timestamp
    timelineEvents.sort((a, b) => a.timestamp - b.timestamp);

    return { 
      events: timelineEvents, 
      timelineData: timeline 
    };
  }, [memorySystem]);

  // Get time range from data
  const dataTimeRange = useMemo(() => {
    if (events.length === 0) return [Date.now() - 86400000, Date.now()];
    const timestamps = events.map(e => e.timestamp);
    return [Math.min(...timestamps), Math.max(...timestamps)];
  }, [events]);

  // Color functions
  const getEventColor = useCallback((significance: number): string => {
    if (significance >= 0.8) return '#f44336'; // Red for high significance
    if (significance >= 0.6) return '#ff9800'; // Orange for medium-high
    if (significance >= 0.4) return '#ffeb3b'; // Yellow for medium
    if (significance >= 0.2) return '#4caf50'; // Green for low-medium
    return '#2196f3'; // Blue for low significance
  }, []);

  // Update dimensions on container resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width: width - 32, height: height - 32 });
      }
    };

    updateDimensions();
    const resizeObserver = new ResizeObserver(updateDimensions);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  // D3 visualization
  useEffect(() => {
    if (!svgRef.current || !events.length || loading) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 40, right: 200, bottom: 40, left: 60 };
    const width = dimensions.width - margin.left - margin.right;
    const height = dimensions.height - margin.top - margin.bottom;

    // Create scales
    const xScale = d3.scaleTime()
      .domain([new Date(dataTimeRange[0]), new Date(dataTimeRange[1])] as [Date, Date])
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain([0, events.length])
      .range([height, 0]);

    // Create main group
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Create zoom behavior
    const zoomBehavior = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 10])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
        setZoom(event.transform.k);
      });

    svg.call(zoomBehavior);

    // Add axes
    const xAxis = d3.axisBottom(xScale)
      .tickFormat((d: any) => d3.timeFormat('%H:%M')(d as Date));

    const yAxis = d3.axisLeft(yScale)
      .tickFormat(() => '');

    g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0, ${height})`)
      .call(xAxis as any);

    g.append('g')
      .attr('class', 'y-axis')
      .call(yAxis);

    // Add grid lines
    g.append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(0, ${height})`)
      .call(d3.axisBottom(xScale)
        .tickSize(-height)
        .tickFormat(() => '')
      )
      .style('stroke-dasharray', '3,3')
      .style('opacity', 0.3);

    // Create event groups
    const eventGroups = g.selectAll('.event-group')
      .data(events)
      .enter()
      .append('g')
      .attr('class', 'event-group')
      .attr('transform', (d, i) => `translate(${xScale(new Date(d.timestamp))}, ${yScale(i)})`);

    // Add event circles
    eventGroups
      .append('circle')
      .attr('r', d => 5 + d.significance * 10)
      .attr('fill', d => d.color || '#2196f3')
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .on('click', (_event, d) => {
        setSelectedEvent(d);
        _event.stopPropagation();
      })
      .on('mouseover', function(_event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', (5 + d.significance * 10) * 1.5);
      })
      .on('mouseout', function(_event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', 5 + d.significance * 10);
      });

    // Add event labels
    eventGroups
      .append('text')
      .text(d => d.title)
      .attr('x', 15)
      .attr('y', 0)
      .attr('font-size', '12px')
      .attr('font-family', 'Arial, sans-serif')
      .style('user-select', 'none')
      .style('pointer-events', 'none');

    // Add emotion indicators
    if (showEmotions) {
      eventGroups
        .filter(d => d.emotions.length > 0)
        .append('text')
        .text(d => d.emotions.slice(0, 2).join(', '))
        .attr('x', 15)
        .attr('y', 15)
        .attr('font-size', '10px')
        .attr('fill', '#666')
        .style('user-select', 'none')
        .style('pointer-events', 'none');
    }

    // Add participant indicators
    if (showParticipants) {
      eventGroups
        .filter(d => d.participants.length > 0)
        .append('text')
        .text(d => `👥 ${d.participants.length}`)
        .attr('x', 15)
        .attr('y', 30)
        .attr('font-size', '10px')
        .attr('fill', '#666')
        .style('user-select', 'none')
        .style('pointer-events', 'none');
    }

    // Add significance indicators
    if (showSignificance) {
      eventGroups
        .append('circle')
        .attr('r', 3)
        .attr('cx', -10)
        .attr('cy', 0)
        .attr('fill', d => d.color || '#2196f3')
        .attr('opacity', d => d.significance);
    }

    // Add tooltips
    eventGroups.append('title')
      .text(d => `${d.title}\n${new Date(d.timestamp).toLocaleString()}\nSignificance: ${d.significance.toFixed(2)}`);

    // Add time cursor
    const timeCursor = g.append('line')
      .attr('class', 'time-cursor')
      .attr('x1', xScale(new Date(currentTime)))
      .attr('y1', 0)
      .attr('x2', xScale(new Date(currentTime)))
      .attr('y2', height)
      .attr('stroke', '#f44336')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '5,5')
      .style('opacity', 0.7);

    // Update time cursor position
    const updateTimeCursor = (time: number) => {
      timeCursor
        .attr('x1', xScale(new Date(time)))
        .attr('x2', xScale(new Date(time)));
    };

    // Animation loop
    const animate = () => {
      if (isPlaying && currentTime < dataTimeRange[1]) {
        const newTime = Math.min(currentTime + 60000, dataTimeRange[1]); // Advance by 1 minute
        setCurrentTime(newTime);
        updateTimeCursor(newTime);
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setIsPlaying(false);
      }
    };

    if (isPlaying) {
      animationRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [events, dimensions, dataTimeRange, showEmotions, showParticipants, showSignificance, loading, currentTime, isPlaying]);

  // Control functions
  const handleZoomIn = () => {
    if (svgRef.current) {
      const svg = d3.select(svgRef.current);
      const zoom = d3.zoom<SVGSVGElement, unknown>();
      svg.transition().duration(300).call(zoom.scaleBy, 1.3);
    }
  };

  const handleZoomOut = () => {
    if (svgRef.current) {
      const svg = d3.select(svgRef.current);
      const zoom = d3.zoom<SVGSVGElement, unknown>();
      svg.transition().duration(300).call(zoom.scaleBy, 0.7);
    }
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    const nextTime = Math.min(currentTime + 3600000, dataTimeRange[1]); // Advance by 1 hour
    setCurrentTime(nextTime);
  };

  const handlePrevious = () => {
    const prevTime = Math.max(currentTime - 3600000, dataTimeRange[0]); // Go back by 1 hour
    setCurrentTime(prevTime);
  };

  const handleSettingsOpen = (event: React.MouseEvent<HTMLElement>) => {
    setSettingsAnchor(event.currentTarget);
  };

  const handleSettingsClose = () => {
    setSettingsAnchor(null);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="400px">
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading Episodic Memory Timeline...
        </Typography>
      </Box>
    );
  }

  if (!events.length) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="400px">
        <Typography variant="h6" color="text.secondary">
          No episodic memory data available
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* Controls */}
      <Box sx={{ position: 'absolute', top: 16, left: 16, zIndex: 1, display: 'flex', gap: 1 }}>
        <Tooltip title="Zoom In">
          <IconButton onClick={handleZoomIn} size="small">
            <ZoomInIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Zoom Out">
          <IconButton onClick={handleZoomOut} size="small">
            <ZoomOutIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Settings">
          <IconButton onClick={handleSettingsOpen} size="small">
            <SettingsIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Playback Controls */}
      <Box sx={{ position: 'absolute', top: 16, right: 16, zIndex: 1, display: 'flex', gap: 1 }}>
        <Tooltip title="Previous">
          <IconButton onClick={handlePrevious} size="small">
            <PrevIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title={isPlaying ? "Pause" : "Play"}>
          <IconButton onClick={handlePlayPause} size="small">
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </IconButton>
        </Tooltip>
        <Tooltip title="Next">
          <IconButton onClick={handleNext} size="small">
            <NextIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Stats */}
      <Box sx={{ position: 'absolute', bottom: 16, right: 16, zIndex: 1 }}>
        <Paper sx={{ p: 2, minWidth: 200 }}>
          <Typography variant="subtitle2" gutterBottom>
            Timeline Statistics
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Chip label={`Events: ${events.length}`} size="small" variant="outlined" />
            <Chip label={`Zoom: ${(zoom * 100).toFixed(0)}%`} size="small" variant="outlined" />
            <Chip label={`Time: ${new Date(currentTime).toLocaleTimeString()}`} size="small" variant="outlined" />
          </Box>
        </Paper>
      </Box>

      {/* Selected Event Info */}
      {selectedEvent && (
        <Box sx={{ position: 'absolute', bottom: 16, left: 16, zIndex: 1 }}>
          <Card sx={{ minWidth: 300 }}>
            <CardContent>
              <Typography variant="subtitle2" gutterBottom>
                Selected Event
              </Typography>
              <Typography variant="h6" gutterBottom>
                {selectedEvent.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {new Date(selectedEvent.timestamp).toLocaleString()}
              </Typography>
              <Typography variant="body2" gutterBottom>
                {selectedEvent.description}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                <Chip 
                  label={`Significance: ${(selectedEvent.significance * 100).toFixed(0)}%`} 
                  size="small" 
                  variant="outlined" 
                />
                <Chip 
                  label={selectedEvent.type} 
                  size="small" 
                  variant="outlined" 
                />
              </Box>
              {selectedEvent.emotions.length > 0 && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Emotions: {selectedEvent.emotions.join(', ')}
                  </Typography>
                </Box>
              )}
              {selectedEvent.participants.length > 0 && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Participants: {selectedEvent.participants.join(', ')}
                  </Typography>
                </Box>
              )}
              <Button size="small" onClick={() => setSelectedEvent(null)} sx={{ mt: 1 }}>
                Close
              </Button>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Settings Menu */}
      <Menu
        anchorEl={settingsAnchor}
        open={Boolean(settingsAnchor)}
        onClose={handleSettingsClose}
        PaperProps={{ sx: { p: 2, minWidth: 250 } }}
      >
        <Typography variant="subtitle2" gutterBottom>
          Timeline Settings
        </Typography>
        
        <FormControlLabel
          control={
            <Switch
              checked={showEmotions}
              onChange={(e) => setShowEmotions(e.target.checked)}
              size="small"
            />
          }
          label="Show Emotions"
        />
        
        <FormControlLabel
          control={
            <Switch
              checked={showParticipants}
              onChange={(e) => setShowParticipants(e.target.checked)}
              size="small"
            />
          }
          label="Show Participants"
        />
        
        <FormControlLabel
          control={
            <Switch
              checked={showSignificance}
              onChange={(e) => setShowSignificance(e.target.checked)}
              size="small"
            />
          }
          label="Show Significance"
        />
      </Menu>

      {/* SVG Visualization */}
      <Box ref={containerRef} sx={{ width: '100%', height: '600px', overflow: 'hidden' }}>
        <svg
          ref={svgRef}
          width={dimensions.width}
          height={dimensions.height}
          style={{ border: '1px solid #e0e0e0', borderRadius: '4px' }}
        />
      </Box>
    </Box>
  );
};

export default EpisodicMemoryTimeline;