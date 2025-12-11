import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Slider,
  Chip,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Refresh as RefreshIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  Fullscreen as FullscreenIcon,
} from '@mui/icons-material';
import * as d3 from 'd3';
import type { MemorySystem } from '../../types/memory';
import type { MemoryStrengthData } from '../../types/memory';

interface MemoryStrengthVisualizationProps {
  memorySystem: MemorySystem;
  width?: number;
  height?: number;
  onMemorySelect?: (memoryId: string, type: string) => void;
}

interface StrengthSettings {
  showDecay: boolean;
  showThresholds: boolean;
  animationSpeed: number;
  strengthRange: [number, number];
  colorScheme: 'viridis' | 'plasma' | 'warm' | 'cool';
  showLabels: boolean;
  showGrid: boolean;
}

const MemoryStrengthVisualization: React.FC<MemoryStrengthVisualizationProps> = ({
  memorySystem,
  width = 800,
  height = 600,
  onMemorySelect,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [selectedMemoryType, setSelectedMemoryType] = useState<string>('all');
  const [settings, setSettings] = useState<StrengthSettings>({
    showDecay: true,
    showThresholds: true,
    animationSpeed: 1,
    strengthRange: [0, 1],
    colorScheme: 'viridis',
    showLabels: true,
    showGrid: true,
  });

  // Color scales for different schemes
  const colorScales = {
    viridis: d3.scaleSequential(d3.interpolateViridis).domain([0, 1]),
    plasma: d3.scaleSequential(d3.interpolatePlasma).domain([0, 1]),
    warm: d3.scaleSequential(d3.interpolateWarm).domain([0, 1]),
    cool: d3.scaleSequential(d3.interpolateCool).domain([0, 1]),
  };

  // Calculate memory strength data
  const strengthData = useMemo(() => {
    const data: MemoryStrengthData[] = [];

    // Semantic memory strength
    if (memorySystem.semantic?.concepts) {
      memorySystem.semantic.concepts.forEach(concept => {
        const age = currentTime - (concept as any).createdAt;
        const decayRate = (concept as any).decayRate || 0.01;
        const decayedStrength = Math.max(
          0,
          concept.strength * Math.exp(-decayRate * age / (1000 * 60 * 60 * 24)) // days
        );

        data.push({
          memoryId: concept.id,
          memoryType: 'semantic',
          strength: decayedStrength,
          originalStrength: concept.strength,
          decayRate,
          age,
          lastAccessed: concept.lastAccessed,
          accessCount: concept.accessCount,
          threshold: 0.3,
        });
      });
    }

    // Episodic memory strength
    if (memorySystem.episodic?.events) {
      memorySystem.episodic.events.forEach(event => {
        const age = currentTime - event.startTime;
        const decayRate = event.decayRate || 0.02;
        const decayedStrength = Math.max(
          0,
          event.significance * Math.exp(-decayRate * age / (1000 * 60 * 60 * 24))
        );

        data.push({
          memoryId: event.id,
          memoryType: 'episodic',
          strength: decayedStrength,
          originalStrength: event.significance,
          decayRate,
          age,
          lastAccessed: event.lastAccessed || event.startTime,
          accessCount: event.accessCount || 0,
          threshold: 0.2,
        });
      });
    }

    // Procedural memory strength
    if (memorySystem.procedural?.skills) {
      memorySystem.procedural.skills.forEach(skill => {
        const age = currentTime - skill.createdAt;
        const decayRate = skill.decayRate || 0.005; // Skills decay slower
        const decayedStrength = Math.max(
          0,
          skill.proficiency.overall * Math.exp(-decayRate * age / (1000 * 60 * 60 * 24))
        );

        data.push({
          memoryId: skill.id,
          memoryType: 'procedural',
          strength: decayedStrength,
          originalStrength: skill.proficiency.overall,
          decayRate,
          age,
          lastAccessed: skill.lastAccessed || skill.createdAt,
          accessCount: skill.usageCount || 0,
          threshold: 0.4,
        });
      });
    }

    return data;
  }, [memorySystem, currentTime]);

  // Filter data by selected memory type
  const filteredData = useMemo(() => {
    if (selectedMemoryType === 'all') return strengthData;
    return strengthData.filter(item => item.memoryType === selectedMemoryType);
  }, [strengthData, selectedMemoryType]);

  // Animation loop
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentTime(prev => prev + (1000 * 60 * 60 * 24 * settings.animationSpeed)); // days
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, settings.animationSpeed]);

  // D3 visualization
  useEffect(() => {
    if (!svgRef.current || filteredData.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 20, right: 30, bottom: 40, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Scales
    const xScale = d3
      .scaleLinear()
      .domain(d3.extent(filteredData, d => d.age || 0) as [number, number])
      .range([0, innerWidth]);

    const yScale = d3
      .scaleLinear()
      .domain(settings.strengthRange)
      .range([innerHeight, 0]);

    const colorScale = colorScales[settings.colorScheme];

    // Grid
    if (settings.showGrid) {
      g.append('g')
        .attr('class', 'grid')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(d3.axisBottom(xScale).tickSize(-innerHeight).tickFormat(() => ''))
        .style('stroke-dasharray', '3,3')
        .style('opacity', 0.3);

      g.append('g')
        .attr('class', 'grid')
        .call(d3.axisLeft(yScale).tickSize(-innerWidth).tickFormat(() => ''))
        .style('stroke-dasharray', '3,3')
        .style('opacity', 0.3);
    }

    // Threshold lines
    if (settings.showThresholds) {
      const thresholds = [0.2, 0.4, 0.6, 0.8];
      thresholds.forEach(threshold => {
        g.append('line')
          .attr('x1', 0)
          .attr('x2', innerWidth)
          .attr('y1', yScale(threshold))
          .attr('y2', yScale(threshold))
          .attr('stroke', '#ff6b6b')
          .attr('stroke-dasharray', '5,5')
          .attr('opacity', 0.5)
          .attr('stroke-width', 1);

        g.append('text')
          .attr('x', innerWidth + 5)
          .attr('y', yScale(threshold))
          .attr('dy', '0.35em')
          .style('font-size', '10px')
          .style('fill', '#ff6b6b')
          .text(threshold.toFixed(1));
      });
    }

    // Decay curves
    if (settings.showDecay) {
      const decayGroups = d3.group(filteredData, d => d.memoryType);
      
      decayGroups.forEach((values) => {
        const line = d3.line<MemoryStrengthData>()
          .x(d => xScale(d.age || 0))
          .y(d => yScale(d.strength))
          .curve(d3.curveMonotoneX);

        // Sort by age for line drawing
        const sortedValues = values.sort((a, b) => (a.age || 0) - (b.age || 0));

        g.append('path')
          .datum(sortedValues)
          .attr('fill', 'none')
          .attr('stroke', colorScale(0.7))
          .attr('stroke-width', 2)
          .attr('opacity', 0.7)
          .attr('d', line);
      });
    }

    // Scatter plot points
    g.selectAll('circle')
      .data(filteredData)
      .enter()
      .append('circle')
      .attr('cx', d => xScale(d.age || 0))
      .attr('cy', d => yScale(d.strength))
      .attr('r', 6)
      .attr('fill', d => colorScale(d.strength))
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .on('click', (_event, d) => {
        onMemorySelect?.(d.memoryId, d.memoryType);
      })
      .on('mouseover', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', 8);

        // Tooltip
        const tooltip = d3.select('body').append('div')
          .attr('class', 'tooltip')
          .style('position', 'absolute')
          .style('background', 'rgba(0, 0, 0, 0.8)')
          .style('color', 'white')
          .style('padding', '8px')
          .style('border-radius', '4px')
          .style('font-size', '12px')
          .style('pointer-events', 'none')
          .style('opacity', 0);

        tooltip.html(`
          <div><strong>${d.memoryId}</strong></div>
          <div>Memory Type: ${d.memoryType}</div>
          <div>Strength: ${d.strength.toFixed(3)}</div>
          <div>Original: ${d.originalStrength.toFixed(3)}</div>
          <div>Age: ${(d.age / (1000 * 60 * 60 * 24)).toFixed(1)} days</div>
          <div>Access Count: ${d.accessCount}</div>
        `)
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 10) + 'px')
        .style('opacity', 1);
      })
      .on('mouseout', function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', 6);

        d3.selectAll('.tooltip').remove();
      });

    // Labels
    if (settings.showLabels && filteredData.length <= 50) {
      g.selectAll('text')
        .data(filteredData)
        .enter()
        .append('text')
        .attr('x', d => xScale(d.age || 0))
        .attr('y', d => yScale(d.strength) - 10)
        .attr('text-anchor', 'middle')
        .style('font-size', '10px')
        .style('fill', '#666')
        .text(d => d.memoryId.length > 15 ? d.memoryId.substring(0, 15) + '...' : d.memoryId);
    }

    // Axes
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).tickFormat((d: any) => `${(d / (1000 * 60 * 60 * 24)).toFixed(0)}d`));

    g.append('g')
      .call(d3.axisLeft(yScale));

    // Axis labels
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left)
      .attr('x', 0 - (innerHeight / 2))
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('fill', '#666')
      .text('Memory Strength');

    g.append('text')
      .attr('transform', `translate(${innerWidth / 2}, ${innerHeight + margin.bottom})`)
      .style('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('fill', '#666')
      .text('Age (days)');

  }, [filteredData, width, height, settings, colorScales]);

  const handleReset = () => {
    setCurrentTime(Date.now());
    setIsPlaying(false);
  };

  const handleZoomIn = () => {
    setSettings(prev => ({
      ...prev,
      strengthRange: [
        prev.strengthRange[0] + 0.1,
        Math.min(1, prev.strengthRange[1] + 0.1)
      ] as [number, number]
    }));
  };

  const handleZoomOut = () => {
    setSettings(prev => ({
      ...prev,
      strengthRange: [
        Math.max(0, prev.strengthRange[0] - 0.1),
        prev.strengthRange[1] - 0.1
      ] as [number, number]
    }));
  };

  return (
    <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Memory Strength & Decay</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Play/Pause Animation">
            <IconButton onClick={() => setIsPlaying(!isPlaying)}>
              {isPlaying ? <PauseIcon /> : <PlayIcon />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Reset">
            <IconButton onClick={handleReset}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Zoom In">
            <IconButton onClick={handleZoomIn}>
              <ZoomInIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Zoom Out">
            <IconButton onClick={handleZoomOut}>
              <ZoomOutIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Fullscreen">
            <IconButton>
              <FullscreenIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Controls */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
        gap: 2,
        mb: 2
      }}>
        <FormControl fullWidth size="small">
          <InputLabel>Memory Type</InputLabel>
          <Select
            value={selectedMemoryType}
            label="Memory Type"
            onChange={(e) => setSelectedMemoryType(e.target.value)}
          >
            <MenuItem value="all">All Types</MenuItem>
            <MenuItem value="semantic">Semantic</MenuItem>
            <MenuItem value="episodic">Episodic</MenuItem>
            <MenuItem value="procedural">Procedural</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth size="small">
          <InputLabel>Color Scheme</InputLabel>
          <Select
            value={settings.colorScheme}
            label="Color Scheme"
            onChange={(e) => setSettings(prev => ({
              ...prev,
              colorScheme: e.target.value as any
            }))}
          >
            <MenuItem value="viridis">Viridis</MenuItem>
            <MenuItem value="plasma">Plasma</MenuItem>
            <MenuItem value="warm">Warm</MenuItem>
            <MenuItem value="cool">Cool</MenuItem>
          </Select>
        </FormControl>

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControlLabel
            control={
              <Switch
                checked={settings.showDecay}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  showDecay: e.target.checked
                }))}
              />
            }
            label="Show Decay"
          />
          <FormControlLabel
            control={
              <Switch
                checked={settings.showThresholds}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  showThresholds: e.target.checked
                }))}
              />
            }
            label="Show Thresholds"
          />
          <FormControlLabel
            control={
              <Switch
                checked={settings.showLabels}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  showLabels: e.target.checked
                }))}
              />
            }
            label="Show Labels"
          />
        </Box>
      </Box>

      {/* Animation Speed */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" gutterBottom>
          Animation Speed: {settings.animationSpeed}x
        </Typography>
        <Slider
          value={settings.animationSpeed}
          onChange={(_, value) => setSettings(prev => ({ 
            ...prev, 
            animationSpeed: value as number 
          }))}
          min={0.1}
          max={10}
          step={0.1}
          marks={[
            { value: 0.1, label: '0.1x' },
            { value: 1, label: '1x' },
            { value: 5, label: '5x' },
            { value: 10, label: '10x' }
          ]}
        />
      </Box>

      {/* Status */}
      <Box sx={{ mb: 2, display: 'flex', gap: 1, alignItems: 'center' }}>
        <Chip 
          label={`Time: ${new Date(currentTime).toLocaleDateString()}`}
          size="small"
          color={isPlaying ? 'primary' : 'default'}
        />
        <Chip 
          label={`Memories: ${filteredData.length}`}
          size="small"
        />
        <Chip 
          label={`Memory Type: ${selectedMemoryType}`}
          size="small"
        />
      </Box>

      {/* Visualization */}
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <svg ref={svgRef} />
      </Box>
    </Paper>
  );
};

export default MemoryStrengthVisualization;