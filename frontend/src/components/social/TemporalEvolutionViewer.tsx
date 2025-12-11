import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Button,
  Switch,
  FormControlLabel,
  Card,
  CardContent,
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  SkipNext,
  SkipPrevious,
  ZoomIn,
  ZoomOut,
  Download,
  Settings,
} from '@mui/icons-material';
import * as d3 from 'd3';
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
} from 'recharts';
import type {
  TemporalEvolution,
  TimePoint,
  EvolutionMetrics,
  SignificantEvent,
  SocialVisualizationConfig,
} from '../../types/social';

interface TemporalEvolutionViewerProps {
  evolution: TemporalEvolution | null;
  config: SocialVisualizationConfig['temporalView'];
  onTimeSelect?: (timestamp: number) => void;
  onEventSelect?: (event: SignificantEvent) => void;
  width?: number;
  height?: number;
  className?: string;
}

interface TimelineData {
  timestamp: number;
  date: string;
  totalRelationships: number;
  averageTrustLevel: number;
  networkDensity: number;
  communityCount: number;
  conflictCount: number;
  collaborationCount: number;
}

const TemporalEvolutionViewer: React.FC<TemporalEvolutionViewerProps> = React.memo(({
  evolution,
  config,
  onTimeSelect,
  onEventSelect,
  width = 800,
  height = 600,
  className,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState<number>(config.timeRange.start);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showEvents, setShowEvents] = useState(true);
  const [showPredictions, setShowPredictions] = useState(config.showPredictions);
  const [selectedMetric, setSelectedMetric] = useState('totalRelationships');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const animationRef = useRef<number>(0);
  const lastUpdateRef = useRef<number>(Date.now());

  // Process timeline data for charts
  const timelineData = useMemo<TimelineData[]>(() => {
    if (!evolution || evolution.timeline.length === 0) return [];

    return evolution.timeline.map(point => ({
      timestamp: point.timestamp,
      date: new Date(point.timestamp).toLocaleDateString(),
      totalRelationships: point.keyMetrics.totalRelationships,
      averageTrustLevel: point.keyMetrics.averageTrustLevel * 100,
      networkDensity: point.keyMetrics.networkDensity * 100,
      communityCount: point.keyMetrics.communityCount,
      conflictCount: point.keyMetrics.conflictCount,
      collaborationCount: point.keyMetrics.collaborationCount,
    }));
  }, [evolution]);

  // Get events for current time range
  const visibleEvents = useMemo(() => {
    if (!evolution || !showEvents) return [];
    
    return evolution.significantEvents.filter(event => 
      event.timestamp >= config.timeRange.start && 
      event.timestamp <= config.timeRange.end
    );
  }, [evolution, showEvents, config.timeRange]);

  // Animation loop
  useEffect(() => {
    if (isPlaying) {
      const animate = () => {
        const now = Date.now();
        const deltaTime = now - lastUpdateRef.current;
        lastUpdateRef.current = now;

        setCurrentTime(prevTime => {
          const newTime = prevTime + (deltaTime * playbackSpeed * 1000); // Speed up time
          const maxTime = config.timeRange.end;
          
          if (newTime >= maxTime) {
            setIsPlaying(false);
            return maxTime;
          }
          
          return newTime;
        });

        animationRef.current = requestAnimationFrame(animate);
      };

      animationRef.current = requestAnimationFrame(animate);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, playbackSpeed, config.timeRange.end]);

  // Handle time selection
  const handleTimeChange = useCallback((value: number) => {
    setCurrentTime(value);
    onTimeSelect?.(value);
  }, [onTimeSelect]);

  // Handle event click
  const handleEventClick = useCallback((event: SignificantEvent) => {
    onEventSelect?.(event);
    setCurrentTime(event.timestamp);
  }, [onEventSelect]);

  // Playback controls
  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSkipPrevious = () => {
    setCurrentTime(config.timeRange.start);
  };

  const handleSkipNext = () => {
    setCurrentTime(config.timeRange.end);
  };

  // Export functionality
  const handleExport = () => {
    if (!timelineData.length) return;

    const csvContent = [
      ['Timestamp', 'Date', 'Total Relationships', 'Average Trust Level', 'Network Density', 'Community Count', 'Conflict Count', 'Collaboration Count'],
      ...timelineData.map(row => [
        row.timestamp,
        row.date,
        row.totalRelationships,
        row.averageTrustLevel,
        row.networkDensity,
        row.communityCount,
        row.conflictCount,
        row.collaborationCount,
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'temporal-evolution-data.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  // Calculate metrics for current time
  const currentMetrics = useMemo(() => {
    if (!evolution || !timelineData.length) return null;

    const closestPoint = timelineData.reduce((prev, curr) => {
      return Math.abs(curr.timestamp - currentTime) < Math.abs(prev.timestamp - currentTime) ? curr : prev;
    });

    return closestPoint;
  }, [evolution, timelineData, currentTime]);

  const metricConfig = [
    { key: 'totalRelationships', label: 'Total Relationships', color: '#8884d8' },
    { key: 'averageTrustLevel', label: 'Average Trust Level (%)', color: '#82ca9d' },
    { key: 'networkDensity', label: 'Network Density (%)', color: '#ffc658' },
    { key: 'communityCount', label: 'Community Count', color: '#ff7c7c' },
    { key: 'conflictCount', label: 'Conflict Count', color: '#8dd1e1' },
    { key: 'collaborationCount', label: 'Collaboration Count', color: '#d084d0' },
  ];

  const selectedMetricConfig = metricConfig.find(m => m.key === selectedMetric);

  if (!evolution) {
    return (
      <Paper className={className} sx={{ p: 2, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          No temporal evolution data available
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper className={className} sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Temporal Evolution Viewer</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Export Data">
            <IconButton onClick={handleExport} size="small">
              <Download />
            </IconButton>
          </Tooltip>
          <Tooltip title="Settings">
            <IconButton onClick={() => setShowSettings(!showSettings)} size="small">
              <Settings />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Current Time Display */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Current Time: {new Date(currentTime).toLocaleString()}
        </Typography>
        {currentMetrics && (
          <Typography variant="body2" color="primary">
            {selectedMetricConfig?.label}: {currentMetrics[selectedMetric as keyof TimelineData]}
          </Typography>
        )}
      </Box>

      {/* Playback Controls */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <IconButton onClick={handleSkipPrevious} size="small">
          <SkipPrevious />
        </IconButton>
        <IconButton onClick={handlePlayPause} size="small" color={isPlaying ? 'secondary' : 'default'}>
          {isPlaying ? <Pause /> : <PlayArrow />}
        </IconButton>
        <IconButton onClick={handleSkipNext} size="small">
          <SkipNext />
        </IconButton>

        <Box sx={{ flex: 1, mx: 2 }}>
          <Slider
            value={currentTime}
            min={config.timeRange.start}
            max={config.timeRange.end}
            step={(config.timeRange.end - config.timeRange.start) / 100}
            onChange={(_, value) => handleTimeChange(value as number)}
            valueLabelDisplay="auto"
            valueLabelFormat={(value) => new Date(value).toLocaleDateString()}
          />
        </Box>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Speed</InputLabel>
          <Select
            value={playbackSpeed}
            label="Speed"
            onChange={(e) => setPlaybackSpeed(e.target.value as number)}
          >
            <MenuItem value={0.5}>0.5x</MenuItem>
            <MenuItem value={1}>1x</MenuItem>
            <MenuItem value={2}>2x</MenuItem>
            <MenuItem value={5}>5x</MenuItem>
            <MenuItem value={10}>10x</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Settings Panel */}
      {showSettings && (
        <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Metric</InputLabel>
              <Select
                value={selectedMetric}
                label="Metric"
                onChange={(e) => setSelectedMetric(e.target.value)}
              >
                {metricConfig.map(metric => (
                  <MenuItem key={metric.key} value={metric.key}>
                    {metric.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

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
                  checked={showPredictions}
                  onChange={(e) => setShowPredictions(e.target.checked)}
                  size="small"
                />
              }
              label="Show Predictions"
            />
          </Box>
        </Box>
      )}

      {/* Main Visualization Area */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Evolution Chart */}
        <Box sx={{ flex: 1, minHeight: 300 }}>
          <Typography variant="subtitle2" gutterBottom>
            Network Evolution Over Time
          </Typography>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <RechartsTooltip 
                labelFormatter={(value) => `Date: ${value}`}
                formatter={(value: any, name: string) => [
                  typeof value === 'number' ? value.toFixed(2) : value,
                  metricConfig.find(m => m.key === name)?.label || name
                ]}
              />
              <Legend />
              {metricConfig.map(metric => (
                <Line
                  key={metric.key}
                  type="monotone"
                  dataKey={metric.key}
                  stroke={metric.color}
                  strokeWidth={2}
                  dot={false}
                  name={metric.label}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </Box>

        {/* Events Timeline */}
        {showEvents && visibleEvents.length > 0 && (
          <Box sx={{ minHeight: 150 }}>
            <Typography variant="subtitle2" gutterBottom>
              Significant Events
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {visibleEvents.map(event => (
                <Chip
                  key={event.id}
                  label={`${event.type} - ${new Date(event.timestamp).toLocaleDateString()}`}
                  onClick={() => handleEventClick(event)}
                  color={event.timestamp <= currentTime ? 'primary' : 'default'}
                  variant={event.timestamp <= currentTime ? 'filled' : 'outlined'}
                  size="small"
                  sx={{ cursor: 'pointer' }}
                />
              ))}
            </Box>
          </Box>
        )}

        {/* Evolution Metrics */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Card sx={{ minWidth: 200, flex: 1 }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Growth Rate
              </Typography>
              <Typography variant="h6">
                {(evolution.metrics.growthRate * 100).toFixed(2)}%
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ minWidth: 200, flex: 1 }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Stability Index
              </Typography>
              <Typography variant="h6">
                {(evolution.metrics.stabilityIndex * 100).toFixed(2)}%
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ minWidth: 200, flex: 1 }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Adaptability Score
              </Typography>
              <Typography variant="h6">
                {(evolution.metrics.adaptabilityScore * 100).toFixed(2)}%
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Paper>
  );
});

TemporalEvolutionViewer.displayName = 'TemporalEvolutionViewer';

export default TemporalEvolutionViewer;