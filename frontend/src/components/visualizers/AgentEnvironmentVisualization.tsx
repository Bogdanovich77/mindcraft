/**
 * Agent Environment Visualization
 * 
 * Interactive 2D/3D visualization of agent positions and environment,
 * showing spatial relationships, movement patterns, and environmental context.
 */

import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography, Paper, IconButton, Tooltip, FormControl, InputLabel, Select, MenuItem, Chip, Switch, Slider } from '@mui/material';
import {
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  Refresh as RefreshIcon,
  CenterFocusStrong as CenterIcon,
  FilterList as FilterIcon,
  Public as PublicIcon,
  Visibility as VisibilityIcon,
  Rotate3D as Rotation3DIcon,
  ViewInAr as ViewInArIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../../store';
import type { AgentState } from '../../types/agent';
import * as d3 from 'd3';

interface AgentEnvironmentVisualizationProps {
  width?: number;
  height?: number;
  className?: string;
}

interface EnvironmentNode extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  type: 'agent' | 'block' | 'entity' | 'item' | 'structure';
  position: { x: number; y: number; z?: number };
  connections: number;
  lastSeen: number;
  activity: 'active' | 'idle' | 'moving' | 'interacting';
  group?: string;
  x?: number;
  y?: number;
  z?: number;
  fx?: number;
  fy?: number;
}

interface EnvironmentLink extends d3.SimulationLinkDatum<EnvironmentNode> {
  source: string | EnvironmentNode;
  target: string | EnvironmentNode;
  strength: number;
  type: 'spatial' | 'interaction' | 'visibility' | 'path';
  frequency: number;
  lastInteraction: number;
}

const AgentEnvironmentVisualization: React.FC<AgentEnvironmentVisualizationProps> = ({
  width = 800,
  height = 600,
  className
}) => {
  const theme = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Redux state
  const { agents } = useSelector((state: RootState) => state.agents as any);
  
  // Component state
  const [selectedAgent, setSelectedAgent] = useState<string>('');
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');
  const [showConnections, setShowConnections] = useState<boolean>(true);
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [showEntities, setShowEntities] = useState<boolean>(true);
  const [showStructures, setShowStructures] = useState<boolean>(true);
  const [showPaths, setShowPaths] = useState<boolean>(false);
  const [zoom, setZoom] = useState(1);
  const [hoveredNode, setHoveredNode] = useState<EnvironmentNode | null>(null);

  // Process environment data for visualization
  const processEnvironmentData = (): { nodes: EnvironmentNode[], links: EnvironmentLink[] } => {
    if (!agents || agents.length === 0) return { nodes: [], links: [] };

    const nodes: EnvironmentNode[] = [];
    const links: EnvironmentLink[] = [];
    const nodeMap = new Map<string, EnvironmentNode>();

    // Process agents
    agents.forEach((agent: any, index: number) => {
      const node: EnvironmentNode = {
        id: `agent_${agent.id}`,
        name: agent.name || `Agent ${index}`,
        type: 'agent',
        position: agent.position || { x: 0, y: 0, z: 0 },
        connections: 0,
        lastSeen: agent.lastUpdate || Date.now(),
        activity: agent.isActive ? 'active' : 'idle',
        group: 'agents'
      };
      nodes.push(node);
      nodeMap.set(node.id, node);
    });

    // Process entities
    agents.forEach((agent: any) => {
      if (agent.context?.nearbyEntities) {
        agent.context.nearbyEntities.forEach((entity: any, index: number) => {
          const node: EnvironmentNode = {
            id: `entity_${entity.id}`,
            name: entity.name || `Entity ${index}`,
            type: 'entity',
            position: entity.position || { x: 0, y: 0, z: 0 },
            connections: 1,
            lastSeen: Date.now(),
            activity: 'idle',
            group: 'entities'
          };
          nodes.push(node);
          nodeMap.set(node.id, node);
        });
      }
    });

    // Process blocks/structures
    agents.forEach((agent: any) => {
      if (agent.context?.nearbyBlocks) {
        agent.context.nearbyBlocks.forEach((block: any, index: number) => {
          const node: EnvironmentNode = {
            id: `block_${block.position.x}_${block.position.y}_${block.position.z}`,
            name: `${block.type} at (${block.position.x}, ${block.position.y}, ${block.position.z})`,
            type: 'structure',
            position: block.position,
            connections: 0,
            lastSeen: Date.now(),
            activity: 'idle',
            group: 'structures'
          };
          nodes.push(node);
          nodeMap.set(node.id, node);
        });
      }
    });

    // Process items
    agents.forEach((agent: any) => {
      if (agent.inventory?.items) {
        agent.inventory.items.forEach((item: any, index: number) => {
          const node: EnvironmentNode = {
            id: `item_${item.id}`,
            name: item.name || `Item ${index}`,
            type: 'item',
            position: agent.position || { x: 0, y: 0, z: 0 },
            connections: 0,
            lastSeen: Date.now(),
            activity: 'idle',
            group: 'items'
          };
          nodes.push(node);
          nodeMap.set(node.id, node);
        });
      }
    });

    // Create spatial connections between nearby agents
    agents.forEach((agent: any, agentIndex: number) => {
      agents.forEach((otherAgent: any, otherIndex: number) => {
        if (agent.id !== otherAgent.id && agent.position && otherAgent.position) {
          const distance = Math.sqrt(
            Math.pow(agent.position.x - otherAgent.position.x, 2) +
            Math.pow(agent.position.y - otherAgent.position.y, 2) +
            Math.pow((agent.position.z || 0) - (otherAgent.position.z || 0), 2)
          );

          if (distance < 50) { // Within interaction range
            const sourceId = `agent_${agent.id}`;
            const targetId = `agent_${otherAgent.id}`;
            
            if (nodeMap.has(sourceId) && nodeMap.has(targetId)) {
              links.push({
                source: sourceId,
                target: targetId,
                strength: Math.max(0, 1 - distance / 50),
                type: 'spatial',
                frequency: 1,
                lastInteraction: Date.now()
              });
            }
          }
        }
      });
    });

    // Create agent-entity connections
    agents.forEach((agent: any) => {
      if (agent.context?.nearbyEntities) {
        agent.context.nearbyEntities.forEach((entity: any, index: number) => {
          const distance = Math.sqrt(
            Math.pow(agent.position.x - entity.position.x, 2) +
            Math.pow(agent.position.y - entity.position.y, 2) +
            Math.pow((agent.position.z || 0) - (entity.position.z || 0), 2)
          );

          if (distance < 20) { // Within interaction range
            const sourceId = `agent_${agent.id}`;
            const targetId = `entity_${entity.id}`;
            
            if (nodeMap.has(sourceId) && nodeMap.has(targetId)) {
              links.push({
                source: sourceId,
                target: targetId,
                strength: Math.max(0, 1 - distance / 20),
                type: 'interaction',
                frequency: 1,
                lastInteraction: Date.now()
              });
            }
          }
        });
      }
    });

    return { nodes, links };
  };

  // Get filtered data
  const getFilteredData = () => {
    const { nodes, links } = processEnvironmentData();
    
    let filteredNodes = nodes;
    let filteredLinks = links;

    if (!showEntities) {
      filteredNodes = nodes.filter(node => node.type !== 'entity');
    }
    
    if (!showStructures) {
      filteredNodes = filteredNodes.filter(node => node.type !== 'structure');
    }
    
    if (!showConnections) {
      filteredLinks = [];
    }

    return { nodes: filteredNodes, links: filteredLinks };
  };

  // Get node color based on type
  const getNodeColor = (nodeType: string, activity: string) => {
    switch (nodeType) {
      case 'agent':
        return activity === 'active' ? theme.palette.success.main : 
               activity === 'moving' ? theme.palette.warning.main : 
               theme.palette.primary.main;
      case 'entity':
        return theme.palette.secondary.main;
      case 'block':
      case 'structure':
        return theme.palette.info.main;
      case 'item':
        return theme.palette.error.main;
      default:
        return theme.palette.grey[500];
    }
  };

  // Get node size based on type
  const getNodeSize = (nodeType: string): number => {
    switch (nodeType) {
      case 'agent':
        return 12;
      case 'entity':
        return 6;
      case 'block':
      case 'structure':
        return 8;
      case 'item':
        return 4;
      default:
        return 6;
    }
  };

  // Initialize and update D3 visualization
  useEffect(() => {
    if (!svgRef.current || !agents) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const { nodes, links } = getFilteredData();

    // Create force simulation
    const simulation = d3.forceSimulation<EnvironmentNode>(nodes)
      .force('link', d3.forceLink<EnvironmentNode, EnvironmentLink>(links)
        .id(d => d.id)
        .strength(d => d.strength)
      )
      .force('charge', d3.forceManyBody().strength(-200))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(d => getNodeSize(d.type)));

    // Create zoom behavior
    const zoomBehavior = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 10])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
        setZoom(event.transform.k);
      });

    svg.call(zoomBehavior);

    // Create main group
    const g = svg.append('g');

    // Create links
    const link = g.append('g')
      .selectAll('line')
      .data(links)
      .enter().append('line')
      .attr('stroke', d => {
        switch (d.type) {
          case 'spatial': return theme.palette.grey[400];
          case 'interaction': return theme.palette.primary.main;
          case 'visibility': return theme.palette.warning.main;
          case 'path': return theme.palette.info.main;
          default: return theme.palette.grey[500];
        }
      })
      .attr('stroke-opacity', d => d.strength)
      .attr('stroke-width', d => Math.sqrt(d.frequency) * 2)
      .attr('stroke-dasharray', d => d.type === 'path' ? '5,5' : 'none');

    // Create node groups
    const nodeGroup = g.append('g')
      .selectAll('g')
      .data(nodes)
      .enter().append('g')
      .call(d3.drag<SVGGElement, EnvironmentNode>()
        .on('start', (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = undefined;
          d.fy = undefined;
        })
      );

    // Create node shapes
    const node = nodeGroup.append('g')
      .selectAll('g')
      .data(nodes)
      .enter().append('g');

    // Add different shapes for different node types
    const agentNodes = node.filter(d => d.type === 'agent');
    agentNodes.append('circle')
      .attr('r', d => getNodeSize(d.type))
      .attr('fill', d => getNodeColor(d.type, d.activity))
      .attr('stroke', theme.palette.background.paper)
      .attr('stroke-width', 2)
      .style('cursor', 'pointer');

    const entityNodes = node.filter(d => d.type === 'entity');
    entityNodes.append('rect')
      .attr('width', d => getNodeSize(d.type))
      .attr('height', d => getNodeSize(d.type))
      .attr('x', d => -getNodeSize(d.type) / 2)
      .attr('y', d => -getNodeSize(d.type) / 2)
      .attr('fill', d => getNodeColor(d.type, d.activity))
      .attr('stroke', theme.palette.background.paper)
      .attr('stroke-width', 2)
      .style('cursor', 'pointer');

    const structureNodes = node.filter(d => d.type === 'structure' || d.type === 'block');
    structureNodes.append('rect')
      .attr('width', d => getNodeSize(d.type))
      .attr('height', d => getNodeSize(d.type))
      .attr('x', d => -getNodeSize(d.type) / 2)
      .attr('y', d => -getNodeSize(d.type) / 2)
      .attr('fill', d => getNodeColor(d.type, d.activity))
      .attr('stroke', theme.palette.background.paper)
      .attr('stroke-width', 2)
      .style('cursor', 'pointer');

    const itemNodes = node.filter(d => d.type === 'item');
    itemNodes.append('polygon')
      .attr('points', d => {
        const size = getNodeSize(d.type) / 2;
        return `${-size},${size},${size},0`;
      })
      .attr('fill', d => getNodeColor(d.type, d.activity))
      .attr('stroke', theme.palette.background.paper)
      .attr('stroke-width', 2)
      .style('cursor', 'pointer');

    // Add labels
    if (showLabels) {
      const label = nodeGroup.append('text')
        .text(d => d.name)
        .attr('font-size', 10)
        .attr('dx', d => getNodeSize(d.type) / 2 + 5)
        .attr('dy', 4)
        .style('pointer-events', 'none')
        .style('fill', theme.palette.text.primary);
    }

    // Add tooltips
    const tooltip = d3.select('body').append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0)
      .style('position', 'absolute')
      .style('background', theme.palette.background.paper)
      .style('border', `1px solid ${theme.palette.divider}`)
      .style('border-radius', '4px')
      .style('padding', '8px')
      .style('font-size', '12px')
      .style('pointer-events', 'none');

    // Add interaction events
    node
      .on('mouseover', (event, d) => {
        setHoveredNode(d);
        tooltip.transition()
          .duration(200)
          .style('opacity', .9);
        
        let tooltipContent = `
          <div>
            <strong>${d.name}</strong><br/>
            Type: ${d.type}<br/>
            Position: (${d.position.x}, ${d.position.y}${d.position.z !== undefined ? `, ${d.position.z}` : ''})<br/>
            Activity: ${d.activity}<br/>
            Last Seen: ${new Date(d.lastSeen).toLocaleString()}
        `;
        
        if (d.type === 'agent') {
          const agent = agents.find((a: any) => a.id === d.id.replace('agent_', ''));
          if (agent) {
            tooltipContent += `
              Health: ${agent.health}/${agent.maxHealth}<br/>
              Level: ${agent.experience?.level || 0}<br/>
              Status: ${agent.isActive ? 'Active' : 'Idle'}
            `;
          }
        }
        
        tooltip.html(tooltipContent)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', () => {
        setHoveredNode(null);
        tooltip.transition()
          .duration(500)
          .style('opacity', 0);
      })
      .on('click', (event, d) => {
        if (d.type === 'agent') {
          setSelectedAgent(d.id.replace('agent_', ''));
        }
      });

    // Update positions on simulation tick
    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as EnvironmentNode).x || 0)
        .attr('y1', d => (d.source as EnvironmentNode).y || 0)
        .attr('x2', d => (d.target as EnvironmentNode).x || 0)
        .attr('y2', d => (d.target as EnvironmentNode).y || 0);

      nodeGroup
        .attr('transform', d => `translate(${d.x || 0}, ${d.y || 0})`);
    });

    // Cleanup
    return () => {
      tooltip.remove();
    };
  }, [agents, showConnections, showLabels, showEntities, showStructures, width, height]);

  // Handle zoom controls
  const handleZoomIn = () => {
    const svg = d3.select(svgRef.current);
    const zoomBehavior = d3.zoom<SVGSVGElement, unknown>();
    (svg as any).transition().call(zoomBehavior.scaleBy, 1.3);
  };

  const handleZoomOut = () => {
    const svg = d3.select(svgRef.current);
    const zoomBehavior = d3.zoom<SVGSVGElement, unknown>();
    (svg as any).transition().call(zoomBehavior.scaleBy, 0.7);
  };

  const handleCenter = () => {
    const svg = d3.select(svgRef.current);
    const zoomBehavior = d3.zoom<SVGSVGElement, unknown>();
    (svg as any).transition().call(zoomBehavior.transform, d3.zoomIdentity.translate(width / 2, height / 2));
  };

  const handleRefresh = () => {
    // Force re-render
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    // Re-render will be triggered by useEffect
  };

  const selectedAgentData = selectedAgent ? agents.find(a => a.id === selectedAgent) : null;

  return (
    <Paper className={className} sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Agent Environment Visualization</Typography>
        
        <Box display="flex" gap={1}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>View</InputLabel>
            <Select
              value={viewMode}
              label="View Mode"
              onChange={(e) => setViewMode(e.target.value as any)}
            >
              <MenuItem value="2d">2D View</MenuItem>
              <MenuItem value="3d">3D View</MenuItem>
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

      <Box display="flex" gap={1} mb={2}>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Filters</InputLabel>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Connections</InputLabel>
          <Switch
            checked={showConnections}
            onChange={(e) => setShowConnections(e.target.checked)}
            size="small"
          />
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Labels</InputLabel>
          <Switch
            checked={showLabels}
            onChange={(e) => setShowLabels(e.target.checked)}
            size="small"
          />
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Entities</InputLabel>
          <Switch
            checked={showEntities}
            onChange={(e) => setShowEntities(e.target.checked)}
            size="small"
          />
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Structures</InputLabel>
          <Switch
            checked={showStructures}
            onChange={(e) => setShowStructures(e.target.checked)}
            size="small"
          />
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Paths</InputLabel>
          <Switch
            checked={showPaths}
            onChange={(e) => setShowPaths(e.target.checked)}
            size="small"
          />
        </FormControl>
      </Box>

      <Box display="flex" flex={1} position="relative" ref={containerRef}>
        <svg
          ref={svgRef}
          width={width}
          height={height}
          style={{ border: `1px solid ${theme.palette.divider}`, borderRadius: '4px' }}
        />
      </Box>

      {selectedAgentData && (
        <Box mt={2} p={2} bgcolor={theme.palette.grey[50]} borderRadius={1}>
          <Typography variant="subtitle2" gutterBottom>
            Selected Agent: {selectedAgentData.name}
          </Typography>
          
          <Box display="flex" gap={2}>
            <Box flex={1}>
              <Typography variant="body2" color="textSecondary">Position</Typography>
              <Typography variant="body1">
                ({selectedAgentData.position?.x || 0}, {selectedAgentData.position?.y || 0}, {selectedAgentData.position?.z || 0})
              </Typography>
            </Box>
            
            <Box flex={1}>
              <Typography variant="body2" color="textSecondary">Health</Typography>
              <Typography variant="body1">
                {selectedAgentData.health}/{selectedAgentData.maxHealth}
              </Typography>
            </Box>
            
            <Box flex={1}>
              <Typography variant="body2" color="textSecondary">Level</Typography>
              <Typography variant="body1">
                {selectedAgentData.experience?.level || 0}
              </Typography>
            </Box>
            
            <Box flex={1}>
              <Typography variant="body2" color="textSecondary">Status</Typography>
              <Typography variant="body1">
                {selectedAgentData.isActive ? 'Active' : 'Idle'}
              </Typography>
            </Box>
          </Box>
        </Box>
      )}

      {hoveredNode && (
        <Box mt={2} p={2} bgcolor={theme.palette.grey[50]} borderRadius={1}>
          <Typography variant="subtitle2" gutterBottom>
            {hoveredNode.name}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Type: {hoveredNode.type}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Position: ({hoveredNode.position.x}, {hoveredNode.position.y}, {hoveredNode.position.z || 0})
          </Typography>
        </Box>
      )}

      <Box mt={2} display="flex" gap={1} flexWrap="wrap">
        <Chip
          label={`Zoom: ${(zoom * 100).toFixed(0)}%`}
          size="small"
          color="primary"
        />
        <Chip
          label={`${getFilteredData().nodes.length} nodes`}
          size="small"
          color="secondary"
        />
        <Chip
          label={`${getFilteredData().links.length} connections`}
          size="small"
          color="info"
        />
        <Chip
          label={`${agents.length} agents`}
          size="small"
          color="warning"
        />
      </Box>
    </Paper>
  );
};

export default AgentEnvironmentVisualization;