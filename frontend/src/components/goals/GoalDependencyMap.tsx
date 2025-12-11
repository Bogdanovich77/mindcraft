import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Tooltip,
  Paper,
  Stack,
  Chip,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Slider,
  Alert,
  ButtonGroup
} from '@mui/material';
import {
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  Refresh as RefreshIcon,
  Fullscreen as FullscreenIcon,
  AccountTree as TreeIcon,
  Hub as HubIcon,
  Radar as RadarIcon,
  Timeline as TimelineIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import * as d3 from 'd3';
import type { Goal, GoalType, GoalStatus, GoalPriority, GoalRelationship, CriticalPath } from '../../types/goals';

interface GoalDependencyMapProps {
  goals: Goal[];
  relationships?: GoalRelationship[];
  criticalPaths?: CriticalPath[];
  onGoalSelect?: (goal: Goal) => void;
  width?: number;
  height?: number;
}

interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  goal: Goal;
  type: GoalType;
  status: GoalStatus;
  priority: GoalPriority;
  radius: number;
  color: string;
}

interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  source: string | GraphNode;
  target: string | GraphNode;
  relationship: GoalRelationship;
  strength: number;
  type: 'dependency' | 'blocks' | 'enables' | 'conflicts';
}

type LayoutMode = 'force' | 'tree' | 'radial' | 'hierarchical';

const TYPE_COLORS: Record<GoalType, string> = {
  strategic: '#1976d2',
  tactical: '#388e3c',
  operational: '#f57c00'
};

const STATUS_COLORS: Record<GoalStatus, string> = {
  completed: '#4caf50',
  active: '#2196f3',
  pending: '#ff9800',
  failed: '#f44336',
  paused: '#9c27b0',
  cancelled: '#757575',
  in_progress: '#2196f3'
};

const PRIORITY_COLORS: Record<GoalPriority, string> = {
  0: '#d32f2f', // CRITICAL
  1: '#f57c00', // HIGH
  2: '#1976d2', // MEDIUM
  3: '#757575'  // LOW
};

const RELATIONSHIP_COLORS: Record<string, string> = {
  dependency: '#666666',
  blocks: '#f44336',
  enables: '#4caf50',
  conflicts: '#ff9800'
};

export const GoalDependencyMap: React.FC<GoalDependencyMapProps> = ({
  goals,
  relationships = [],
  criticalPaths = [],
  onGoalSelect,
  width = 800,
  height = 600
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [zoom, setZoom] = useState(1);
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('force');
  const [showLabels, setShowLabels] = useState(true);
  const [showCriticalPaths, setShowCriticalPaths] = useState(true);
  const [linkStrength, setLinkStrength] = useState(0.5);
  const [nodeSpacing, setNodeSpacing] = useState(100);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Build graph data
  const buildGraphData = useCallback(() => {
    const nodes: GraphNode[] = goals.map(goal => ({
      id: goal.id,
      goal,
      type: goal.type,
      status: goal.status,
      priority: goal.priority,
      radius: 8 + (goal.priority === 0 ? 4 : goal.priority === 1 ? 2 : 0),
      color: TYPE_COLORS[goal.type]
    }));

    const links: GraphLink[] = [];
    
    // Add dependency links
    goals.forEach(goal => {
      goal.dependencies.forEach(depId => {
        const relationship = relationships.find(r =>
          (r.sourceGoalId === goal.id && r.targetGoalId === depId) ||
          (r.sourceGoalId === depId && r.targetGoalId === goal.id)
        );
        
        links.push({
          source: goal.id,
          target: depId,
          relationship: relationship || {
            sourceGoalId: goal.id,
            targetGoalId: depId,
            type: 'dependency',
            strength: 0.5,
            description: 'Dependency relationship',
            createdAt: Date.now()
          },
          strength: relationship?.strength || 0.5,
          type: (relationship?.type === 'conflict' ? 'conflicts' :
                 relationship?.type === 'dependency' ? 'dependency' :
                 relationship?.type === 'synergy' ? 'enables' : 'dependency') as 'dependency' | 'blocks' | 'enables' | 'conflicts'
        });
      });
    });

    return { nodes, links };
  }, [goals, relationships]);

  // Create force simulation
  const createSimulation = useCallback((width: number, height: number) => {
    const simulation = d3.forceSimulation<GraphNode>()
      .force('link', d3.forceLink<GraphNode, GraphLink>()
        .id(d => d.id)
        .strength(linkStrength)
        .distance(nodeSpacing))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide<GraphNode>().radius(d => d.radius + 10));

    return simulation;
  }, [linkStrength, nodeSpacing]);

  // Apply layout based on mode
  const applyLayout = useCallback((simulation: d3.Simulation<GraphNode, GraphLink>, nodes: GraphNode[], links: GraphLink[], mode: LayoutMode) => {
    switch (mode) {
      case 'tree':
        const root = d3.stratify<GraphNode>()
          .id(d => d.id)
          .parentId(d => {
            const link = links.find(l => l.target === d.id);
            return link ? link.source as string : null;
          })(nodes);
        
        const treeLayout = d3.tree<GraphNode>().size([width - 100, height - 100]);
        const treeNodes = treeLayout(root);
        
        treeNodes.descendants().forEach((d, i) => {
          const node = nodes.find(n => n.id === d.id);
          if (node) {
            node.x = (d.x || 0) + 50;
            node.y = (d.y || 0) + 50;
            node.fx = node.x;
            node.fy = node.y;
          }
        });
        break;

      case 'radial':
        const radialRoot = d3.stratify<GraphNode>()
          .id(d => d.id)
          .parentId(d => {
            const link = links.find(l => l.target === d.id);
            return link ? link.source as string : null;
          })(nodes);
        
        const radialLayout = d3.tree<GraphNode>()
          .size([2 * Math.PI, Math.min(width, height) / 2 - 100])
          .separation((a, b) => (a.parent === b.parent ? 1 : 2) / a.depth);
        
        const radialNodes = radialLayout(radialRoot);
        
        radialNodes.descendants().forEach((d, i) => {
          const node = nodes.find(n => n.id === d.id);
          if (node) {
            const angle = d.x || 0;
            const radius = d.y || 0;
            node.x = width / 2 + radius * Math.cos(angle - Math.PI / 2);
            node.y = height / 2 + radius * Math.sin(angle - Math.PI / 2);
            node.fx = node.x;
            node.fy = node.y;
          }
        });
        break;

      case 'hierarchical':
        const levels = {
          strategic: 0,
          tactical: 1,
          operational: 2
        };
        
        nodes.forEach(node => {
          const level = levels[node.type];
          const nodesInLevel = nodes.filter(n => levels[n.type] === level);
          const index = nodesInLevel.indexOf(node);
          const spacing = width / (nodesInLevel.length + 1);
          
          node.x = spacing * (index + 1);
          node.y = 100 + level * (height - 200) / 2;
          node.fx = node.x;
          node.fy = node.y;
        });
        break;

      default:
        // Force layout - let the simulation handle it
        nodes.forEach(node => {
          node.fx = undefined;
          node.fy = undefined;
        });
    }
  }, [width, height]);

  // Render visualization
  useEffect(() => {
    if (!svgRef.current || goals.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const { nodes, links } = buildGraphData();
    if (nodes.length === 0) return;

    const simulation = createSimulation(width, height);
    applyLayout(simulation, nodes, links, layoutMode);

    // Create container group
    const container = svg.append('g');

    // Add zoom behavior
    const zoomBehavior = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        container.attr('transform', event.transform);
        setZoom(event.transform.k);
      });

    svg.call(zoomBehavior);

    // Create link elements
    const linkElements = container.append('g')
      .selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('stroke', d => RELATIONSHIP_COLORS[d.type])
      .attr('stroke-width', d => Math.max(1, d.strength * 3))
      .attr('stroke-opacity', 0.6)
      .attr('marker-end', 'url(#arrowhead)');

    // Create arrowhead marker
    svg.append('defs')
      .append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 15)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#666');

    // Create node elements
    const nodeElements = container.append('g')
      .selectAll('g')
      .data(nodes)
      .enter()
      .append('g')
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        setSelectedNode(d.id);
        onGoalSelect?.(d.goal);
      });

    // Add node circles
    nodeElements.append('circle')
      .attr('r', d => d.radius)
      .attr('fill', d => d.color)
      .attr('stroke', d => STATUS_COLORS[d.status])
      .attr('stroke-width', 2)
      .attr('stroke-opacity', 0.8);

    // Add priority indicators
    nodeElements.append('circle')
      .attr('r', 3)
      .attr('cx', d => d.radius - 2)
      .attr('cy', d => -d.radius + 2)
      .attr('fill', d => PRIORITY_COLORS[d.priority]);

    // Add labels
    if (showLabels) {
      nodeElements.append('text')
        .text(d => d.goal.description.substring(0, 20) + (d.goal.description.length > 20 ? '...' : ''))
        .attr('x', 0)
        .attr('y', d => d.radius + 15)
        .attr('text-anchor', 'middle')
        .attr('font-size', '12px')
        .attr('font-family', 'Arial, sans-serif')
        .attr('fill', '#333');
    }

    // Add tooltips
    nodeElements.append('title')
      .text(d => `${d.goal.description}\nType: ${d.type}\nStatus: ${d.status}\nPriority: ${d.priority}`);

    // Update positions on simulation tick
    simulation.on('tick', () => {
      linkElements
        .attr('x1', d => (d.source as GraphNode).x || 0)
        .attr('y1', d => (d.source as GraphNode).y || 0)
        .attr('x2', d => (d.target as GraphNode).x || 0)
        .attr('y2', d => (d.target as GraphNode).y || 0);

      nodeElements
        .attr('transform', d => `translate(${d.x || 0}, ${d.y || 0})`);
    });

    return () => {
      simulation.stop();
    };
  }, [goals, relationships, width, height, layoutMode, showLabels, buildGraphData, createSimulation, applyLayout, onGoalSelect]);

  const handleZoomIn = () => {
    if (svgRef.current) {
      const svg = d3.select(svgRef.current);
      svg.transition().call(
        d3.zoom<SVGSVGElement, unknown>().scaleBy as any,
        1.3
      );
    }
  };

  const handleZoomOut = () => {
    if (svgRef.current) {
      const svg = d3.select(svgRef.current);
      svg.transition().call(
        d3.zoom<SVGSVGElement, unknown>().scaleBy as any,
        0.7
      );
    }
  };

  const handleReset = () => {
    if (svgRef.current) {
      const svg = d3.select(svgRef.current);
      svg.transition().call(
        d3.zoom<SVGSVGElement, unknown>().transform as any,
        d3.zoomIdentity
      );
    }
  };

  const handleFullscreen = () => {
    if (svgRef.current) {
      if (svgRef.current.requestFullscreen) {
        svgRef.current.requestFullscreen();
      }
    }
  };

  return (
    <Box>
      {/* Header */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h6" fontWeight="bold">
            Goal Dependency Map
          </Typography>
          
          <Stack direction="row" spacing={1}>
            <Chip 
              size="small" 
              label={`${goals.length} nodes`}
              color="primary"
              variant="outlined"
            />
            <Chip 
              size="small" 
              label={`${relationships.length} relationships`}
              color="secondary"
              variant="outlined"
            />
            <Chip 
              size="small" 
              label={`${criticalPaths.length} critical paths`}
              color="warning"
              variant="outlined"
            />
          </Stack>
        </Stack>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Controls */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack spacing={2}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="body2" sx={{ minWidth: 80 }}>
              Layout:
            </Typography>
            <ButtonGroup size="small">
              <Button
                variant={layoutMode === 'force' ? 'contained' : 'outlined'}
                onClick={() => setLayoutMode('force')}
                startIcon={<HubIcon />}
              >
                Force
              </Button>
              <Button
                variant={layoutMode === 'tree' ? 'contained' : 'outlined'}
                onClick={() => setLayoutMode('tree')}
                startIcon={<TreeIcon />}
              >
                Tree
              </Button>
              <Button
                variant={layoutMode === 'radial' ? 'contained' : 'outlined'}
                onClick={() => setLayoutMode('radial')}
                startIcon={<RadarIcon />}
              >
                Radial
              </Button>
              <Button
                variant={layoutMode === 'hierarchical' ? 'contained' : 'outlined'}
                onClick={() => setLayoutMode('hierarchical')}
                startIcon={<TimelineIcon />}
              >
                Hierarchical
              </Button>
            </ButtonGroup>
          </Stack>

          <Stack direction="row" spacing={4} alignItems="center">
            <FormControlLabel
              control={
                <Switch
                  checked={showLabels}
                  onChange={(e) => setShowLabels(e.target.checked)}
                  size="small"
                />
              }
              label="Show Labels"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={showCriticalPaths}
                  onChange={(e) => setShowCriticalPaths(e.target.checked)}
                  size="small"
                />
              }
              label="Critical Paths"
            />

            <Box sx={{ minWidth: 200 }}>
              <Typography variant="body2" gutterBottom>
                Link Strength: {linkStrength}
              </Typography>
              <Slider
                value={linkStrength}
                onChange={(_, value) => setLinkStrength(value as number)}
                min={0.1}
                max={1}
                step={0.1}
                size="small"
              />
            </Box>

            <Box sx={{ minWidth: 200 }}>
              <Typography variant="body2" gutterBottom>
                Node Spacing: {nodeSpacing}
              </Typography>
              <Slider
                value={nodeSpacing}
                onChange={(_, value) => setNodeSpacing(value as number)}
                min={50}
                max={200}
                step={10}
                size="small"
              />
            </Box>
          </Stack>
        </Stack>
      </Paper>

      {/* Visualization */}
      <Paper sx={{ position: 'relative', overflow: 'hidden' }}>
        {/* Zoom Controls */}
        <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}>
          <Stack direction="row" spacing={0.5}>
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
            <Tooltip title="Reset View">
              <IconButton size="small" onClick={handleReset}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Fullscreen">
              <IconButton size="small" onClick={handleFullscreen}>
                <FullscreenIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>

        {/* Legend */}
        <Box sx={{ position: 'absolute', bottom: 8, left: 8, zIndex: 1 }}>
          <Paper sx={{ p: 1, bgcolor: 'rgba(255, 255, 255, 0.9)' }}>
            <Stack spacing={1}>
              <Typography variant="caption" fontWeight="bold">
                Goal Types:
              </Typography>
              {Object.entries(TYPE_COLORS).map(([type, color]) => (
                <Stack key={type} direction="row" spacing={1} alignItems="center">
                  <Box sx={{ width: 12, height: 12, bgcolor: color, borderRadius: '50%' }} />
                  <Typography variant="caption">
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Paper>
        </Box>

        {/* SVG */}
        <svg
          ref={svgRef}
          width={width}
          height={height}
          style={{ border: '1px solid #ddd' }}
        />
      </Paper>

      {/* Status */}
      <Paper sx={{ p: 2, mt: 2 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="body2" color="text.secondary">
            Zoom: {(zoom * 100).toFixed(0)}% | Layout: {layoutMode} | Selected: {selectedNode || 'None'}
          </Typography>
          
          <Typography variant="body2" color="text.secondary">
            Click on nodes to select goals • Use controls to adjust visualization
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
};

export default GoalDependencyMap;