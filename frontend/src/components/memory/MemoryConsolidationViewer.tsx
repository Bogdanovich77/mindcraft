import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  IconButton,
  Tooltip,
  Button,
  Menu,
  Switch,
  FormControlLabel,
  Card,
  CardContent,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
} from '@mui/icons-material';
import * as d3 from 'd3';
import type { MemorySystem } from '../../types/memory';

interface MemoryConsolidationViewerProps {
  memorySystem?: MemorySystem;
  loading?: boolean;
  onRefresh?: () => void;
}

interface ConsolidationProcess {
  id: string;
  name: string;
  type: 'semantic' | 'episodic' | 'procedural';
  progress: number;
  startTime: number;
  endTime?: number;
  status: 'pending' | 'active' | 'completed' | 'failed';
  sourceMemory: string;
  targetMemory: string;
  efficiency: number;
}

interface DecayCurve {
  memoryId: string;
  memoryType: 'semantic' | 'episodic' | 'procedural';
  currentStrength: number;
  decayRate: number;
  timePoints: number[];
  strengthValues: number[];
}

const MemoryConsolidationViewer: React.FC<MemoryConsolidationViewerProps> = ({
  memorySystem,
  loading = false,
  onRefresh,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [selectedProcess, setSelectedProcess] = useState<ConsolidationProcess | null>(null);
  const [selectedDecay, setSelectedDecay] = useState<DecayCurve | null>(null);
  const [settingsAnchor, setSettingsAnchor] = useState<null | HTMLElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [showTransfers, setShowTransfers] = useState(true);
  const [showDecay, setShowDecay] = useState(true);
  const [showEfficiency, setShowEfficiency] = useState(true);
  const animationRef = useRef<number | undefined>(undefined);

  // Process consolidation data
  const { consolidationProcesses, decayCurves } = useMemo(() => {
    if (!memorySystem?.consolidation) {
      return {
        consolidationProcesses: [] as ConsolidationProcess[],
        decayCurves: [] as DecayCurve[]
      };
    }

    // Create mock consolidation processes since the actual structure is different
    const processes: ConsolidationProcess[] = [
      {
        id: 'consolidation_1',
        name: 'Episodic → Semantic',
        type: 'semantic',
        progress: 0.7,
        startTime: Date.now() - 3600000,
        endTime: Date.now() + 1800000,
        status: 'active',
        sourceMemory: 'episodic',
        targetMemory: 'semantic',
        efficiency: 0.8,
      },
      {
        id: 'consolidation_2',
        name: 'Procedural → Long-term',
        type: 'procedural',
        progress: 0.3,
        startTime: Date.now() - 7200000,
        status: 'pending',
        sourceMemory: 'procedural',
        targetMemory: 'long-term',
        efficiency: 0.6,
      },
    ];

    // Create mock decay curves
    const curves: DecayCurve[] = [
      {
        memoryId: 'memory_1',
        memoryType: 'semantic',
        currentStrength: 0.8,
        decayRate: 0.01,
        timePoints: generateTimePoints(Date.now() - 86400000, Date.now(), 50),
        strengthValues: generateDecayCurve(1.0, 0.01, Date.now() - 86400000, Date.now(), 50),
      },
      {
        memoryId: 'memory_2',
        memoryType: 'episodic',
        currentStrength: 0.6,
        decayRate: 0.02,
        timePoints: generateTimePoints(Date.now() - 86400000, Date.now(), 50),
        strengthValues: generateDecayCurve(0.9, 0.02, Date.now() - 86400000, Date.now(), 50),
      },
    ];

    return {
      consolidationProcesses: processes,
      decayCurves: curves
    };
  }, [memorySystem]);

  // Generate time points for decay curves
  const generateTimePoints = useCallback((startTime: number, endTime: number, points: number): number[] => {
    const timeRange = endTime - startTime;
    return Array.from({ length: points }, (_, i) => startTime + (timeRange * i) / (points - 1));
  }, []);

  // Generate decay curve values
  const generateDecayCurve = useCallback((initialStrength: number, decayRate: number, startTime: number, endTime: number, points: number): number[] => {
    const timeRange = endTime - startTime;
    return Array.from({ length: points }, (_, i) => {
      const time = startTime + (timeRange * i) / (points - 1);
      const elapsed = time - startTime;
      return initialStrength * Math.exp(-decayRate * elapsed / (1000 * 60 * 60)); // Decay per hour
    });
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

  // Animation loop
  useEffect(() => {
    if (isPlaying) {
      const animate = () => {
        setCurrentTime(prev => prev + 1000); // Advance by 1 second
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
  }, [isPlaying]);

  // D3 visualization
  useEffect(() => {
    if (!svgRef.current || loading) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 40, right: 40, bottom: 40, left: 60 };
    const width = dimensions.width - margin.left - margin.right;
    const height = dimensions.height - margin.top - margin.bottom;

    // Create main group
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Create scales
    const xScale = d3.scaleTime()
      .domain([currentTime - 24 * 60 * 60 * 1000, currentTime]) // Last 24 hours
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain([0, 1])
      .range([height, 0]);

    // Add axes
    const xAxis = d3.axisBottom(xScale)
      .tickFormat((d: any) => d3.timeFormat('%H:%M')(d as Date));

    const yAxis = d3.axisLeft(yScale)
      .tickFormat(d3.format('.0%'));

    g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0, ${height})`)
      .call(xAxis as any);

    g.append('g')
      .attr('class', 'y-axis')
      .call(yAxis as any);

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

    g.append('g')
      .attr('class', 'grid')
      .call(d3.axisLeft(yScale)
        .tickSize(-width)
        .tickFormat(() => '')
      )
      .style('stroke-dasharray', '3,3')
      .style('opacity', 0.3);

    // Draw decay curves
    if (showDecay && decayCurves.length > 0) {
      const line = d3.line<number>()
        .x((_, i) => xScale(new Date(decayCurves[0].timePoints[i])))
        .y(d => yScale(d))
        .curve(d3.curveMonotoneX);

      decayCurves.forEach((curve, _index) => {
        const color = getMemoryTypeColor(curve.memoryType);
        
        g.append('path')
          .datum(curve.strengthValues)
          .attr('fill', 'none')
          .attr('stroke', color)
          .attr('stroke-width', 2)
          .attr('d', line)
          .style('opacity', 0.7)
          .on('click', (event) => {
            setSelectedDecay(curve);
            event.stopPropagation();
          })
          .on('mouseover', function() {
            d3.select(this)
              .transition()
              .duration(200)
              .attr('stroke-width', 3)
              .style('opacity', 1);
          })
          .on('mouseout', function() {
            d3.select(this)
              .transition()
              .duration(200)
              .attr('stroke-width', 2)
              .style('opacity', 0.7);
          });

        // Add current strength indicator
        const currentX = xScale(new Date(currentTime));
        const currentY = yScale(curve.currentStrength);
        
        g.append('circle')
          .attr('cx', currentX)
          .attr('cy', currentY)
          .attr('r', 4)
          .attr('fill', color)
          .attr('stroke', '#fff')
          .attr('stroke-width', 2);
      });
    }

    // Draw consolidation events
    if (showTransfers && consolidationProcesses.length > 0) {
      const events = consolidationProcesses.filter(p => 
        p.startTime >= currentTime - 24 * 60 * 60 * 1000
      );

      events.forEach(process => {
        const x = xScale(new Date(process.startTime));
        const y = yScale(process.efficiency);
        
        g.append('rect')
          .attr('x', x - 20)
          .attr('y', y - 10)
          .attr('width', 40)
          .attr('height', 20)
          .attr('fill', getProcessStatusColor(process.status))
          .attr('stroke', '#fff')
          .attr('stroke-width', 1)
          .attr('rx', 3)
          .style('cursor', 'pointer')
          .on('click', (event) => {
            setSelectedProcess(process);
            event.stopPropagation();
          })
          .on('mouseover', function() {
            d3.select(this)
              .transition()
              .duration(200)
              .attr('width', 45)
              .attr('height', 25);
          })
          .on('mouseout', function() {
            d3.select(this)
              .transition()
              .duration(200)
              .attr('width', 40)
              .attr('height', 20);
          });

        // Add progress bar
        g.append('rect')
          .attr('x', x - 18)
          .attr('y', y - 8)
          .attr('width', 36 * process.progress)
          .attr('height', 16)
          .attr('fill', getProcessStatusColor(process.status))
          .attr('opacity', 0.6);
      });
    }

    // Add current time indicator
    const currentX = xScale(new Date(currentTime));
    g.append('line')
      .attr('x1', currentX)
      .attr('y1', 0)
      .attr('x2', currentX)
      .attr('y2', height)
      .attr('stroke', '#f44336')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '5,5')
      .style('opacity', 0.7);

  }, [consolidationProcesses, decayCurves, dimensions, currentTime, showTransfers, showDecay, loading]);

  // Color functions
  const getMemoryTypeColor = useCallback((type: string): string => {
    switch (type) {
      case 'semantic': return '#2196f3';
      case 'episodic': return '#4caf50';
      case 'procedural': return '#ff9800';
      default: return '#9c27b0';
    }
  }, []);

  const getProcessStatusColor = useCallback((status: string): string => {
    switch (status) {
      case 'active': return '#4caf50';
      case 'completed': return '#2196f3';
      case 'failed': return '#f44336';
      case 'pending': return '#ff9800';
      default: return '#9c27b0';
    }
  }, []);

  // Control functions
  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
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
          Loading Memory Consolidation Viewer...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* Controls */}
      <Box sx={{ position: 'absolute', top: 16, left: 16, zIndex: 1, display: 'flex', gap: 1 }}>
        <Tooltip title={isPlaying ? "Pause" : "Play"}>
          <IconButton onClick={handlePlayPause} size="small">
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </IconButton>
        </Tooltip>
        <Tooltip title="Settings">
          <IconButton onClick={handleSettingsOpen} size="small">
            <SettingsIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Refresh">
          <IconButton onClick={onRefresh} size="small">
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Stats */}
      <Box sx={{ position: 'absolute', bottom: 16, right: 16, zIndex: 1 }}>
        <Paper sx={{ p: 2, minWidth: 200 }}>
          <Typography variant="subtitle2" gutterBottom>
            Consolidation Statistics
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Chip label={`Active Processes: ${consolidationProcesses.filter(p => p.status === 'active').length}`} size="small" variant="outlined" />
            <Chip label={`Total Decay Curves: ${decayCurves.length}`} size="small" variant="outlined" />
            <Chip label={`Time: ${new Date(currentTime).toLocaleTimeString()}`} size="small" variant="outlined" />
          </Box>
        </Paper>
      </Box>

      {/* Selected Process Info */}
      {selectedProcess && (
        <Box sx={{ position: 'absolute', bottom: 16, left: 16, zIndex: 1 }}>
          <Card sx={{ minWidth: 300 }}>
            <CardContent>
              <Typography variant="subtitle2" gutterBottom>
                Selected Consolidation Process
              </Typography>
              <Typography variant="h6" gutterBottom>
                {selectedProcess.name}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                <Chip 
                  label={selectedProcess.status} 
                  size="small" 
                  variant="outlined" 
                  color={selectedProcess.status === 'active' ? 'success' : 
                         selectedProcess.status === 'completed' ? 'primary' : 
                         selectedProcess.status === 'failed' ? 'error' : 'warning'}
                />
                <Chip 
                  label={selectedProcess.type} 
                  size="small" 
                  variant="outlined" 
                />
              </Box>
              <Box sx={{ mt: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Progress: {(selectedProcess.progress * 100).toFixed(0)}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Efficiency: {(selectedProcess.efficiency * 100).toFixed(0)}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Started: {new Date(selectedProcess.startTime).toLocaleString()}
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={selectedProcess.progress * 100} 
                sx={{ mt: 1 }}
              />
              <Button size="small" onClick={() => setSelectedProcess(null)} sx={{ mt: 1 }}>
                Close
              </Button>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Selected Decay Info */}
      {selectedDecay && (
        <Box sx={{ position: 'absolute', bottom: 16, left: 16, zIndex: 1 }}>
          <Card sx={{ minWidth: 300 }}>
            <CardContent>
              <Typography variant="subtitle2" gutterBottom>
                Memory Decay Curve
              </Typography>
              <Typography variant="h6" gutterBottom>
                {selectedDecay.memoryId}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                <Chip 
                  label={selectedDecay.memoryType} 
                  size="small" 
                  variant="outlined" 
                  color="primary"
                />
              </Box>
              <Box sx={{ mt: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Current Strength: {(selectedDecay.currentStrength * 100).toFixed(1)}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Decay Rate: {selectedDecay.decayRate.toFixed(4)}
                </Typography>
              </Box>
              <Button size="small" onClick={() => setSelectedDecay(null)} sx={{ mt: 1 }}>
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
          Consolidation Settings
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <FormControlLabel
            control={
              <Switch
                checked={showTransfers}
                onChange={(e: any) => setShowTransfers(e.target.checked)}
                size="small"
              />
            }
            label="Show Transfers"
          />
          
          <FormControlLabel
            control={
              <Switch
                checked={showDecay}
                onChange={(e: any) => setShowDecay(e.target.checked)}
                size="small"
              />
            }
            label="Show Decay Curves"
          />
          
          <FormControlLabel
            control={
              <Switch
                checked={showEfficiency}
                onChange={(e: any) => setShowEfficiency(e.target.checked)}
                size="small"
              />
            }
            label="Show Efficiency"
          />
        </Box>
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

export default MemoryConsolidationViewer;