import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Tooltip,
  ToggleButton,
  ToggleButtonGroup,
  Slider,
  useTheme,
  alpha,
} from '@mui/material';
import {
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  CenterFocusStrong as CenterIcon,
  ThreeDRotation as ThreeDIcon,
  ViewInAr as ViewInArIcon,
  MyLocation as MyLocationIcon,
} from '@mui/icons-material';
import * as d3 from 'd3';
import type { AgentPositionMapProps } from '../../types/dashboard';

// Extended interface for multi-agent support
interface ExtendedAgentPositionMapProps extends AgentPositionMapProps {
  selectedAgentId?: string;
  onAgentSelect?: (agentId: string) => void;
  showTrails?: boolean;
  viewMode?: '2d' | '3d';
  onViewModeChange?: (mode: '2d' | '3d') => void;
  onZoomChange?: (zoom: number) => void;
  agents?: Array<{
    id: string;
    currentPosition: { x: number; y: number; z: number };
    positionHistory: Array<{ timestamp: number; x: number; y: number; z: number }>;
    status: 'active' | 'idle' | 'error';
  }>;
}

/**
 * AgentPositionMap Component
 *
 * Displays 2D/3D position mapping for agents with interactive features.
 * Supports zoom, pan, agent trails, and center-on-selection functionality.
 * Uses D3.js for efficient rendering and real-time updates.
 */
const AgentPositionMap: React.FC<ExtendedAgentPositionMapProps> = ({
  agentId,
  positionData,
  onCenterOnAgent,
  selectedAgentId,
  onAgentSelect,
  showTrails = true,
  viewMode = '2d',
  onViewModeChange,
  onZoomChange,
  agents,
  className,
}) => {
  const theme = useTheme();
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dimensions, setDimensions] = useState({ width: 800, height: 400 });

  // Update dimensions on container resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        setDimensions({ width: clientWidth, height: clientHeight });
      }
    };

    updateDimensions();
    const resizeObserver = new ResizeObserver(updateDimensions);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  // Calculate world bounds
  const worldBounds = useMemo(() => {
    const agentData = agents || (positionData ? [{
      id: agentId,
      currentPosition: positionData.currentPosition,
      positionHistory: positionData.positionHistory,
      status: 'active' as const
    }] : []);
    
    if (agentData.length === 0) {
      return { minX: -50, maxX: 50, minZ: -50, maxZ: 50 };
    }

    const positions = agentData.flatMap((agent: any) =>
      agent.positionHistory.map((p: any) => ({ x: p.x, z: p.z }))
    );

    const padding = 10;
    return {
      minX: Math.min(...positions.map((p: any) => p.x)) - padding,
      maxX: Math.max(...positions.map((p: any) => p.x)) + padding,
      minZ: Math.min(...positions.map((p: any) => p.z)) - padding,
      maxZ: Math.max(...positions.map((p: any) => p.z)) + padding,
    };
  }, [agents, positionData, agentId]);

  // Scale functions for mapping world coordinates to screen coordinates
  const scales = useMemo(() => {
    const xScale = d3.scaleLinear()
      .domain([worldBounds.minX, worldBounds.maxX])
      .range([0, dimensions.width]);

    const zScale = d3.scaleLinear()
      .domain([worldBounds.minZ, worldBounds.maxZ])
      .range([dimensions.height, 0]); // Inverted for typical coordinate system

    return { xScale, zScale };
  }, [worldBounds, dimensions]);

  // Transform world coordinates to screen coordinates
  const transformCoordinates = useCallback((x: number, z: number) => {
    return {
      x: scales.xScale(x) * zoom + pan.x,
      y: scales.zScale(z) * zoom + pan.y,
    };
  }, [scales, zoom, pan]);

  // Handle zoom controls
  const handleZoomIn = () => {
    const newZoom = Math.min(zoom * 1.2, 5);
    setZoom(newZoom);
    onZoomChange?.(newZoom);
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(zoom / 1.2, 0.5);
    setZoom(newZoom);
    onZoomChange?.(newZoom);
  };

  const handleCenterOnSelection = () => {
    const agentData = agents || (positionData ? [{
      id: agentId,
      currentPosition: positionData.currentPosition,
      positionHistory: positionData.positionHistory,
      status: 'active' as const
    }] : []);
    
    if (selectedAgentId) {
      const selectedAgent = agentData.find((a: any) => a.id === selectedAgentId);
      if (selectedAgent) {
        const center = transformCoordinates(selectedAgent.currentPosition.x, selectedAgent.currentPosition.z);
        setPan({
          x: dimensions.width / 2 - center.x,
          y: dimensions.height / 2 - center.y,
        });
      }
    } else {
      // Use the original onCenterOnAgent callback or center on all agents
      if (onCenterOnAgent) {
        onCenterOnAgent();
      } else {
        setPan({ x: 0, y: 0 });
        setZoom(1);
      }
    }
  };

  // Handle agent click
  const handleAgentClick = (agentId: string) => {
    onAgentSelect?.(agentId);
  };

  // Generate trail path
  const generateTrailPath = (positionHistory: any[]) => {
    if (positionHistory.length < 2) return '';

    const points = positionHistory.map((pos: any) =>
      transformCoordinates(pos.x, pos.z)
    );

    const line = d3.line<{ x: number; y: number }>()
      .x(d => d.x)
      .y(d => d.y)
      .curve(d3.curveCatmullRom.alpha(0.5));

    return line(points) || '';
  };

  // Get agent color based on status
  const getAgentColor = (agent: any) => {
    if (agent.id === selectedAgentId) {
      return theme.palette.primary.main;
    }
    switch (agent.status) {
      case 'active':
        return theme.palette.success.main;
      case 'idle':
        return theme.palette.warning.main;
      case 'error':
        return theme.palette.error.main;
      default:
        return theme.palette.grey[500];
    }
  };

  // Render SVG content
  const renderMap = () => {
    const agentData = agents || (positionData ? [{
      id: agentId,
      currentPosition: positionData.currentPosition,
      positionHistory: positionData.positionHistory,
      status: 'active' as const
    }] : []);
    
    if (agentData.length === 0) {
      return (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          height={dimensions.height}
          color="text.secondary"
        >
          <MyLocationIcon sx={{ fontSize: 48, mb: 2 }} />
          <Typography variant="body1">
            No agent positions available
          </Typography>
        </Box>
      );
    }

    return (
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        style={{ cursor: 'grab' }}
      >
        {/* Grid */}
        <defs>
          <pattern
            id="grid"
            width={50 * zoom}
            height={50 * zoom}
            patternUnits="userSpaceOnUse"
          >
            <path
              d={`M ${50 * zoom} 0 L 0 0 0 ${50 * zoom}`}
              fill="none"
              stroke={theme.palette.divider}
              strokeWidth={1}
            />
          </pattern>
        </defs>
        <rect
          width={dimensions.width}
          height={dimensions.height}
          fill="url(#grid)"
        />

        {/* Agent trails */}
        {showTrails && agentData.map((agent: any) => (
          <g key={`trail-${agent.id}`}>
            <path
              d={generateTrailPath(agent.positionHistory)}
              fill="none"
              stroke={alpha(getAgentColor(agent), 0.3)}
              strokeWidth={2}
              strokeDasharray="5,5"
            />
          </g>
        ))}

        {/* Agent positions */}
        {agentData.map((agent: any) => {
          const position = transformCoordinates(agent.currentPosition.x, agent.currentPosition.z);
          const isSelected = agent.id === selectedAgentId;
          const color = getAgentColor(agent);

          return (
            <g key={`agent-${agent.id}`}>
              {/* Agent circle */}
              <circle
                cx={position.x}
                cy={position.y}
                r={isSelected ? 8 : 6}
                fill={color}
                stroke={theme.palette.background.paper}
                strokeWidth={2}
                style={{ cursor: 'pointer' }}
                onClick={() => handleAgentClick(agent.id)}
              />
              
              {/* Selection indicator */}
              {isSelected && (
                <circle
                  cx={position.x}
                  cy={position.y}
                  r={12}
                  fill="none"
                  stroke={color}
                  strokeWidth={2}
                  strokeDasharray="4,2"
                  opacity={0.6}
                />
              )}

              {/* Agent label */}
              <text
                x={position.x}
                y={position.y - 10}
                textAnchor="middle"
                fontSize={12}
                fill={theme.palette.text.primary}
                style={{ pointerEvents: 'none' }}
              >
                {agent.id}
              </text>

              {/* Position coordinates */}
              <text
                x={position.x}
                y={position.y + 20}
                textAnchor="middle"
                fontSize={10}
                fill={theme.palette.text.secondary}
                style={{ pointerEvents: 'none' }}
              >
                ({Math.round(agent.currentPosition.x)}, {Math.round(agent.currentPosition.z)})
              </text>
            </g>
          );
        })}

        {/* World bounds indicator */}
        <rect
          x={transformCoordinates(worldBounds.minX, worldBounds.minZ).x}
          y={transformCoordinates(worldBounds.minX, worldBounds.minZ).y}
          width={scales.xScale(worldBounds.maxX - worldBounds.minX) * zoom}
          height={scales.zScale(worldBounds.minZ - worldBounds.maxZ) * zoom}
          fill="none"
          stroke={alpha(theme.palette.text.secondary, 0.3)}
              strokeWidth={1}
              strokeDasharray="10,5"
        />
      </svg>
    );
  };

  return (
    <Card className={className}>
      <CardContent sx={{ p: 0 }}>
        {/* Header */}
        <Box display="flex" alignItems="center" justifyContent="space-between" p={2} pb={1}>
          <Typography variant="h6" component="div">
            Agent Position Map
          </Typography>
          
          {/* View Mode Toggle */}
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(_, value) => value && onViewModeChange?.(value)}
            size="small"
          >
            <ToggleButton value="2d">
              <Tooltip title="2D View">
                <ViewInArIcon />
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="3d">
              <Tooltip title="3D View">
                <ThreeDIcon />
              </Tooltip>
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* Controls */}
        <Box display="flex" alignItems="center" justifyContent="space-between" px={2} pb={1}>
          <Box display="flex" alignItems="center" gap={1}>
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
            <Tooltip title="Center on Selection">
              <IconButton size="small" onClick={handleCenterOnSelection}>
                <CenterIcon />
              </IconButton>
            </Tooltip>
          </Box>

          <Typography variant="caption" color="text.secondary">
            Zoom: {Math.round(zoom * 100)}% •
            Agents: {agents?.length || 0} •
            {selectedAgentId && ` Selected: ${selectedAgentId}`}
          </Typography>
        </Box>

        {/* Zoom Slider */}
        <Box px={2} pb={1}>
          <Slider
            value={zoom}
            min={0.5}
            max={5}
            step={0.1}
            onChange={(_, value) => {
              const newZoom = value as number;
              setZoom(newZoom);
              onZoomChange?.(newZoom);
            }}
            sx={{ mt: 1 }}
          />
        </Box>

        {/* Map Container */}
        <Box
          ref={containerRef}
          sx={{
            height: 400,
            position: 'relative',
            overflow: 'hidden',
            backgroundColor: alpha(theme.palette.background.default, 0.5),
            borderTop: `1px solid ${theme.palette.divider}`,
          }}
        >
          {renderMap()}
        </Box>

        {/* Footer */}
        <Box px={2} py={1} borderTop={`1px solid ${theme.palette.divider}`}>
          <Typography variant="caption" color="text.secondary">
            World Bounds: X({worldBounds.minX} to {worldBounds.maxX}) • 
            Z({worldBounds.minZ} to {worldBounds.maxZ}) • 
            {showTrails ? ' Trails: ON' : ' Trails: OFF'}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default React.memo(AgentPositionMap);