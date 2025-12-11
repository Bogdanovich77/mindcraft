/**
 * Agent Environment Visualization
 * 
 * Interactive 2D/3D visualization showing agent positions in the environment,
 * with real-time updates, spatial analysis, and environmental context.
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Chip,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  Refresh as RefreshIcon,
  ViewInAr as ViewInArIcon,
  ViewInAr as ViewInArIcon,
  GridOn as GridIcon,
  GridOff as GridOffIcon,
  Person as PersonIcon,
  LocationOn as LocationIcon,
  Terrain as TerrainIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useSelector, useDispatch } from 'react-redux';

import type { RootState, AppDispatch } from '../store';
import { fetchAgentPositions, fetchEnvironmentData } from '../store/slices/environmentSlice';
import type { AgentPosition, EnvironmentData, SpatialRegion } from '../types/environment';

interface AgentEnvironmentVisualizationProps {
  agentId?: string;
  viewMode?: '2d' | '3d' | 'heatmap' | 'regions';
  showGrid?: boolean;
  showLabels?: boolean;
  showTrails?: boolean;
  zoomLevel?: number;
  onAgentSelect?: (agentId: string) => void;
  onRegionSelect?: (region: SpatialRegion) => void;
  width?: number;
  height?: number;
  className?: string;
}

interface ZoomState {
  scale: number;
  translate: [number, number];
}

const AgentEnvironmentVisualization: React.FC<AgentEnvironmentVisualizationProps> = ({
  agentId,
  viewMode = '2d',
  showGrid = true,
  showLabels = true,
  showTrails = false,
  zoomLevel = 1,
  onAgentSelect,
  onRegionSelect,
  width = 1200,
  height = 600,
  className
}) => {
  const theme = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Redux state
  const { 
    agentPositions, 
    environmentData, 
    spatialRegions, 
    loading, 
    error,
    selectedAgents,
    environmentBounds
  } = useSelector((state: RootState) => state.environment);

  // Component state
  const [currentViewMode, setCurrentViewMode] = useState(viewMode);
  const [currentZoom, setCurrentZoom] = useState<ZoomState>({ scale: zoomLevel, translate: [0, 0] });
  const [hoveredAgent, setHoveredAgent] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<SpatialRegion | null>(null);
  const [trailLength, setTrailLength] = useState(50);
  const [heatmapIntensity, setHeatmapIntensity] = useState(0.5);
  const [showSpatialAnalysis, setShowSpatialAnalysis] = useState(true);

  // Process agent positions for visualization
  const processAgentData = useCallback(() => {
    if (!agentPositions || agentPositions.size === 0) return [];

    return Array.from(agentPositions.values()).map(agent => ({
      ...agent,
      // Calculate trail positions if trails are enabled
      trail: showTrails ? generateTrail(agent, trailLength) : []
    }));
  }, [agentPositions, showTrails, trailLength]);

  // Generate trail positions for an agent
  const generateTrail = useCallback((agent: any, length: number) => {
    const trail = [];
    const now = Date.now();
    
    for (let i = 0; i < length; i++) {
      const age = i * 1000; // 1 second intervals
      const timestamp = now - age;
      const decay = Math.max(0, 1 - age / (length * 1000));
      
      trail.push({
        x: agent.position.x + (Math.random() - 0.5) * 2,
        y: agent.position.y + (Math.random() - 0.5) * 2,
        z: agent.position.z || 0,
        timestamp,
        opacity: decay * 0.5
      });
    }
    
    return trail;
  }, [trailLength]);

  // D3.js 2D environment rendering
  const render2DEnvironment = useCallback(() => {
    if (!svgRef.current || !environmentData) return null;

    const margin = { top: 20, right: 20, bottom: 40, left: 60 };
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
    const xScale = d3.scaleLinear()
      .domain([
        environmentBounds?.minX || -100,
        environmentBounds?.maxX || 100
      ])
      .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
      .domain([
        environmentBounds?.minY || -100,
        environmentBounds?.maxY || 100
      ])
      .range([innerHeight, 0]); // Inverted Y axis

    // Apply zoom transformation
    const transformedG = g.append('g')
      .attr('transform', `translate(${currentZoom.translate}) scale(${currentZoom.scale})`);

    // Add grid if enabled
    if (showGrid) {
      const gridGroup = transformedG.append('g')
        .attr('class', 'grid')
        .style('opacity', 0.3);

      // Vertical grid lines
      for (let x = Math.floor(environmentBounds?.minX || -100); x <= (environmentBounds?.maxX || 100); x += 20) {
        gridGroup.append('line')
          .attr('x1', xScale(x))
          .attr('y1', 0)
          .attr('x2', xScale(x))
          .attr('y2', innerHeight)
          .attr('stroke', theme.palette.divider)
          .attr('stroke-width', 0.5);
      }

      // Horizontal grid lines
      for (let y = Math.floor(environmentBounds?.minY || -100); y <= (environmentBounds?.maxY || 100); y += 20) {
        gridGroup.append('line')
          .attr('x1', 0)
          .attr('y1', yScale(y))
          .attr('x2', innerWidth)
          .attr('y2', yScale(y))
          .attr('stroke', theme.palette.divider)
          .attr('stroke-width', 0.5);
      }
    }

    // Add terrain features
    if (environmentData?.terrain) {
      const terrainGroup = transformedG.append('g')
        .attr('class', 'terrain');

      environmentData.terrain.forEach(feature => {
        const terrainFeature = terrainGroup.append('g')
          .attr('class', `terrain-${feature.type}`);

        if (feature.type === 'mountain') {
          terrainFeature.append('polygon')
            .datum(feature.coordinates)
            .attr('points', (d: any) => d.map((coord: any) => `${xScale(coord.x)},${yScale(coord.y)}`).join(' '))
            .attr('fill', theme.palette.grey[300])
            .attr('stroke', theme.palette.grey[500])
            .attr('stroke-width', 1)
            .attr('opacity', 0.7);
        } else if (feature.type === 'water') {
          terrainFeature.append('polygon')
            .datum(feature.coordinates)
            .attr('points', (d: any) => d.map((coord: any) => `${xScale(coord.x)},${yScale(coord.y)}`).join(' '))
            .attr('fill', theme.palette.primary.light)
            .attr('stroke', theme.palette.primary.main)
            .attr('stroke-width', 1)
            .attr('opacity', 0.6);
        } else if (feature.type === 'forest') {
          terrainFeature.append('circle')
            .attr('cx', xScale(feature.coordinates[0].x))
            .attr('cy', yScale(feature.coordinates[0].y))
            .attr('r', 15)
            .attr('fill', theme.palette.success.light)
            .attr('stroke', theme.palette.success.main)
            .attr('stroke-width', 1)
            .attr('opacity', 0.5);
        }
      });
    }

    // Add spatial regions
    if (spatialRegions && spatialRegions.length > 0) {
      const regionGroup = transformedG.append('g')
        .attr('class', 'regions');

      spatialRegions.forEach(region => {
        regionGroup.append('rect')
          .attr('x', xScale(region.bounds.minX))
          .attr('y', yScale(region.bounds.maxY))
          .attr('width', xScale(region.bounds.maxX) - xScale(region.bounds.minX))
          .attr('height', yScale(region.bounds.minY) - yScale(region.bounds.maxY))
          .attr('fill', region.color || theme.palette.info.light)
          .attr('stroke', region.color || theme.palette.info.main)
          .attr('stroke-width', 2)
          .attr('fill-opacity', 0.2)
          .attr('stroke-dasharray', '5,5')
          .on('click', (event: any) => {
            if (onRegionSelect) {
              onRegionSelect(region);
            }
          })
          .on('mouseover', (event: any) => {
            d3.select(event.target).attr('fill-opacity', 0.4);
          })
          .on('mouseout', (event: any) => {
            d3.select(event.target).attr('fill-opacity', 0.2);
          });

        // Add region label
        if (showLabels) {
          regionGroup.append('text')
            .attr('x', xScale((region.bounds.minX + region.bounds.maxX) / 2))
            .attr('y', yScale((region.bounds.minY + region.bounds.maxY) / 2))
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .style('font-size', '12px')
            .style('font-weight', 'bold')
            .style('fill', theme.palette.text.primary)
            .text(region.name);
        }
      });
    }

    // Add agents and their trails
    const agents = processAgentData();
    agents.forEach(agent => {
      const agentGroup = transformedG.append('g')
        .attr('class', `agent-${agent.id}`)
        .style('cursor', 'pointer');

      // Draw trail
      if (agent.trail && agent.trail.length > 0) {
        const trailLine = d3.line<any>()
          .x((d: any) => xScale(d.x))
          .y((d: any) => yScale(d.y))
          .curve(d3.curveLinear);

        agentGroup.append('path')
          .datum(agent.trail)
          .attr('class', 'agent-trail')
          .attr('d', trailLine)
          .attr('fill', 'none')
          .attr('stroke', theme.palette.primary.main)
          .attr('stroke-width', 2)
          .attr('opacity', 0.3);

        // Trail points
        agentGroup.selectAll('.trail-point')
          .data(agent.trail)
          .enter()
          .append('circle')
          .attr('class', 'trail-point')
          .attr('cx', (d: any) => xScale(d.x))
          .attr('cy', (d: any) => yScale(d.y))
          .attr('r', 2)
          .attr('fill', theme.palette.primary.main)
          .attr('opacity', (d: any) => d.opacity);
      }

      // Draw agent
      const agentElement = agentGroup.append('g')
        .attr('class', 'agent-element');

      // Agent body
      agentElement.append('circle')
        .attr('cx', xScale(agent.position.x))
        .attr('cy', yScale(agent.position.y))
        .attr('r', 8)
        .attr('fill', agent.status === 'active' ? theme.palette.success.main : theme.palette.warning.main)
        .attr('stroke', theme.palette.background.paper)
        .attr('stroke-width', 2)
        .on('click', (event: any) => {
          if (onAgentSelect) {
            onAgentSelect(agent.id);
          }
        })
        .on('mouseover', (event: any) => {
          setHoveredAgent(agent.id);
          d3.select(event.target).attr('r', 10);
        })
        .on('mouseout', (event: any) => {
          setHoveredAgent(null);
          d3.select(event.target).attr('r', 8);
        });

      // Agent direction indicator
      if (agent.direction) {
        const dirX = xScale(agent.position.x) + Math.cos(agent.direction) * 12;
        const dirY = yScale(agent.position.y) + Math.sin(agent.direction) * 12;

        agentElement.append('line')
          .attr('x1', xScale(agent.position.x))
          .attr('y1', yScale(agent.position.y))
          .attr('x2', dirX)
          .attr('y2', dirY)
          .attr('stroke', theme.palette.text.primary)
          .attr('stroke-width', 2)
          .attr('marker-end', 'url(#arrowhead)');
      }

      // Agent label
      if (showLabels) {
        agentElement.append('text')
          .attr('x', xScale(agent.position.x))
          .attr('y', yScale(agent.position.y) - 15)
          .attr('text-anchor', 'middle')
          .attr('font-size', '12px')
          .attr('font-weight', 'bold')
          .attr('fill', theme.palette.text.primary)
          .text(agent.name);
      }
    });

    // Add arrow marker definition
    svg.append('defs')
      .append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 8)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', theme.palette.text.primary);

    return svg.node();
  }, [environmentData, agentPositions, spatialRegions, width, height, theme, currentZoom, showGrid, showLabels, processAgentData, onAgentSelect, onRegionSelect]);

  // D3.js heatmap rendering
  const renderHeatmap = useCallback(() => {
    if (!svgRef.current || !environmentData) return null;

    const margin = { top: 20, right: 20, bottom: 40, left: 60 };
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
    const xScale = d3.scaleLinear()
      .domain([
        environmentBounds?.minX || -100,
        environmentBounds?.maxX || 100
      ])
      .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
      .domain([
        environmentBounds?.minY || -100,
        environmentBounds?.maxY || 100
      ])
      .range([innerHeight, 0]);

    // Generate heatmap data
    const heatmapData = [];
    const gridSize = 10;
    
    for (let x = Math.floor(environmentBounds?.minX || -100); x <= (environmentBounds?.maxX || 100); x += gridSize) {
      for (let y = Math.floor(environmentBounds?.minY || -100); y <= (environmentBounds?.maxY || 100); y += gridSize) {
        let intensity = 0;
        let agentCount = 0;
        
        // Calculate intensity based on agent positions
        Array.from(agentPositions.values()).forEach(agent => {
          const distance = Math.sqrt(
            Math.pow(agent.position.x - (x + gridSize/2), 2) +
            Math.pow((agent as any).position.y - (y + gridSize/2), 2)
          );
          
          if (distance < 20) {
            intensity += Math.exp(-distance / 10) * heatmapIntensity;
            agentCount++;
          }
        });

        heatmapData.push({
          x, y,
          intensity,
          agentCount,
          color: d3.scaleSequential(d3.interpolateYlOrRd)
            .domain([0, 1])
            (intensity)
        });
      }
    }

    // Apply zoom transformation
    const transformedG = g.append('g')
      .attr('transform', `translate(${currentZoom.translate}) scale(${currentZoom.scale})`);

    // Render heatmap cells
    transformedG.selectAll('.heatmap-cell')
      .data(heatmapData)
      .enter()
      .append('rect')
      .attr('class', 'heatmap-cell')
      .attr('x', (d: any) => xScale(d.x))
      .attr('y', (d: any) => yScale(d.y))
      .attr('width', xScale(gridSize) - xScale(0))
      .attr('height', yScale(gridSize) - yScale(0))
      .attr('fill', (d: any) => d.color)
      .attr('stroke', theme.palette.divider)
      .attr('stroke-width', 0.5)
      .attr('opacity', 0.8);

    return svg.node();
  }, [environmentData, agentPositions, environmentBounds, width, height, theme, currentZoom, heatmapIntensity]);

  // Handle zoom controls
  const handleZoomIn = () => {
    setCurrentZoom(prev => ({
      scale: Math.min(prev.scale * 1.2, 5),
      translate: prev.translate
    }));
  };

  const handleZoomOut = () => {
    setCurrentZoom(prev => ({
      scale: Math.max(prev.scale / 1.2, 0.5),
      translate: prev.translate
    }));
  };

  const handleResetZoom = () => {
    setCurrentZoom({ scale: 1, translate: [0, 0] });
  };

  // Handle view mode change
  const handleViewModeChange = (
    event: React.MouseEvent<HTMLElement>,
    newMode: string
  ) => {
    setCurrentViewMode(newMode as any);
  };

  // Refresh data
  const handleRefresh = () => {
    dispatch(fetchAgentPositions());
    dispatch(fetchEnvironmentData());
  };

  // Load data on mount
  useEffect(() => {
    dispatch(fetchAgentPositions());
    dispatch(fetchEnvironmentData());
  }, [dispatch]);

  // Render based on view mode
  const renderCurrentView = useCallback(() => {
    switch (currentViewMode) {
      case '2d':
        return render2DEnvironment();
      case 'heatmap':
        return renderHeatmap();
      case '3d':
        // TODO: Implement 3D visualization
        return null;
      case 'regions':
        return render2DEnvironment(); // Reuse 2D for regions view
      default:
        return render2DEnvironment();
    }
  }, [currentViewMode, render2DEnvironment, renderHeatmap]);

  // Re-render on data changes
  useEffect(() => {
    renderCurrentView();
  }, [renderCurrentView]);

  return (
    <Card className={className}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h6">
            Agent Environment
            {agentId && ` - Agent ${agentId}`}
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
              <ViewInArIcon />
            </IconButton>
          </Box>
        </Box>

        {/* View Mode Selection */}
        <Box display="flex" gap={2} mb={2}>
          <ToggleButtonGroup
            value={currentViewMode}
            onChange={handleViewModeChange}
            aria-label="View mode"
          >
            <ToggleButton value="2d" aria-label="2D View">
              <Box display="flex" alignItems="center" gap={0.5}>
                <ViewInArIcon />
                <Typography variant="caption">2D</Typography>
              </Box>
            </ToggleButton>
            
            <ToggleButton value="3d" aria-label="3D View">
              <Box display="flex" alignItems="center" gap={0.5}>
                <ViewInArIcon />
                <Typography variant="caption">3D</Typography>
              </Box>
            </ToggleButton>
            
            <ToggleButton value="heatmap" aria-label="Heatmap View">
              <Box display="flex" alignItems="center" gap={0.5}>
                <TerrainIcon />
                <Typography variant="caption">Heatmap</Typography>
              </Box>
            </ToggleButton>
            
            <ToggleButton value="regions" aria-label="Regions View">
              <Box display="flex" alignItems="center" gap={0.5}>
                <GridIcon />
                <Typography variant="caption">Regions</Typography>
              </Box>
            </ToggleButton>
          </ToggleButtonGroup>

          <FormControlLabel
            control={
              <Switch
                size="small"
                checked={showGrid}
                onChange={(e) => {/* Handle showGrid change */}}
              />
            }
            label="Grid"
          />

          <FormControlLabel
            control={
              <Switch
                size="small"
                checked={showLabels}
                onChange={(e) => {/* Handle showLabels change */}}
              />
            }
            label="Labels"
          />

          <FormControlLabel
            control={
              <Switch
                size="small"
                checked={showTrails}
                onChange={(e) => {/* Handle showTrails change */}}
              />
            }
            label="Trails"
          />
        </Box>

        {/* View-Specific Controls */}
        {currentViewMode === 'heatmap' && (
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <Typography variant="body2" gutterBottom>
              Heatmap Intensity: {heatmapIntensity.toFixed(2)}
            </Typography>
            <Slider
              value={heatmapIntensity}
              onChange={(e, value) => setHeatmapIntensity(value as number)}
              min={0}
              max={1}
              step={0.1}
              size="small"
              style={{ width: 150 }}
            />
          </Box>
        )}

        {showTrails && (
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <Typography variant="body2" gutterBottom>
              Trail Length: {trailLength}
            </Typography>
            <Slider
              value={trailLength}
              onChange={(e, value) => setTrailLength(value as number)}
              min={10}
              max={200}
              step={10}
              size="small"
              style={{ width: 150 }}
            />
          </Box>
        )}

        {/* Environment Visualization */}
        <Box
          ref={containerRef}
          style={{
            overflow: 'hidden',
            borderRadius: theme.shape.borderRadius,
            border: `1px solid ${theme.palette.divider}`,
            position: 'relative'
          }}
        >
          <svg
            ref={svgRef}
            style={{
              transform: `scale(${currentZoom.scale}) translate(${currentZoom.translate[0]}px, ${currentZoom.translate[1]}px)`,
              transformOrigin: 'top left',
              cursor: 'grab'
            }}
          />
        </Box>

        {/* Hover Information */}
        {hoveredAgent && (
          <Box
            position="absolute"
            bgcolor={theme.palette.background.paper}
            border={1}
            borderColor={theme.palette.divider}
            borderRadius={1}
            p={1}
            style={{
              position: 'absolute',
              top: 100,
              right: 20,
              zIndex: 1000,
              minWidth: 200
            }}
          >
            <Typography variant="h6" gutterBottom>
              Agent: {hoveredAgent}
            </Typography>
            
            {(() => {
              const agent = Array.from(agentPositions.values()).find(a => a.id === hoveredAgent);
              if (!agentData) return null;
              
              return (
                <>
                  <Typography variant="body2" gutterBottom>
                    Position: ({agentData?.position?.x || 0}, {agentData?.position?.y || 0}, {agentData?.position?.z?.toFixed(1) || '0'})
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    Status: {agentData?.status || 'Unknown'}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    Health: {agentData?.health?.toFixed(1) || 'N/A'}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    Activity: {agentData?.currentActivity || 'Unknown'}
                  </Typography>
                </>
              );
            })()}
          </Box>
        )}

        {/* Region Information */}
        {selectedRegion && (
          <Box
            position="absolute"
            bgcolor={theme.palette.background.paper}
            border={1}
            borderColor={theme.palette.divider}
            borderRadius={1}
            p={1}
            style={{
              top: 150,
              right: 20,
              zIndex: 1000,
              minWidth: 200
            }}
          >
            <Typography variant="h6" gutterBottom>
              {selectedRegion.name}
            </Typography>
            
            <Typography variant="body2" gutterBottom>
              Type: {selectedRegion.type}
            </Typography>
            
            <Typography variant="body2" gutterBottom>
              Area: {((selectedRegion.bounds.maxX - selectedRegion.bounds.minX) * (selectedRegion.bounds.maxY - selectedRegion.bounds.minY)).toFixed(0)}
            </Typography>
            
            <Typography variant="body2" gutterBottom>
              Agents: {selectedRegion.agentCount || 0}
            </Typography>
            
            {selectedRegion.description && (
              <Typography variant="body2">
                {selectedRegion.description}
              </Typography>
            )}
          </Box>
        )}

        {/* Error State */}
        {error && (
          <Box textAlign="center" py={4}>
            <Typography color="error">
              Error loading environment data: {error}
            </Typography>
          </Box>
        )}

        {/* Loading State */}
        {loading && (
          <Box textAlign="center" py={4}>
            <Typography>Loading environment data...</Typography>
          </Box>
        )}

        {/* Empty State */}
        {!loading && !error && agentPositions.size === 0 && (
          <Box textAlign="center" py={4}>
            <Typography color="textSecondary">
              No agent position data available
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default AgentEnvironmentVisualization;