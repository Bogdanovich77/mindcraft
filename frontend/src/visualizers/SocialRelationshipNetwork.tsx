import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Box, Typography, Paper, Tooltip, IconButton, Switch, FormControlLabel, Slider } from '@mui/material';
import { 
  Refresh as RefreshIcon, 
  Settings as SettingsIcon, 
  ZoomIn as ZoomInIcon, 
  ZoomOut as ZoomOutIcon, 
  FilterList as FilterIcon,
  People as PeopleIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import * as d3 from 'd3';
import type { 
  BaseVisualizerProps, 
  SocialNode, 
  SocialLink, 
  ColorScheme,
  NetworkNode,
  NetworkLink,
  InteractionEvent,
  DataFilter
} from '../types/visualizers';
import type { SocialState } from '../types/social';

interface SocialRelationshipNetworkProps extends Omit<BaseVisualizerProps, 'data'> {
  data?: SocialState;
  showTrustLevels?: boolean;
  showInteractions?: boolean;
  nodeSize?: number;
  linkDistance?: number;
  chargeStrength?: number;
  onNodeClick?: (node: SocialNode) => void;
  onNodeHover?: (node: SocialNode | null) => void;
  onLinkClick?: (link: SocialLink) => void;
}

export const SocialRelationshipNetwork: React.FC<SocialRelationshipNetworkProps> = ({
  data,
  width = 800,
  height = 600,
  margin = { top: 20, right: 20, bottom: 20, left: 20 },
  theme = 'light',
  showTrustLevels = true,
  showInteractions = true,
  nodeSize = 12,
  linkDistance = 120,
  chargeStrength = -400,
  interactive = true,
  animated = true,
  onDataPointClick,
  onDataPointHover,
  className
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const simulationRef = useRef<d3.Simulation<any, any>>();
  const [selectedNode, setSelectedNode] = useState<SocialNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<SocialNode | null>(null);
  const [zoomState, setZoomState] = useState({ scale: 1, translateX: 0, translateY: 0 });
  const [filters, setFilters] = useState<DataFilter>({ enabled: false });

  // Color schemes
  const colorSchemes: Record<string, ColorScheme> = {
    light: {
      primary: '#1976d2',
      secondary: '#dc004e',
      accent: '#ff9800',
      background: '#ffffff',
      text: '#333333',
      grid: '#e0e0e0',
      highlight: '#ffeb3b',
      warning: '#ff9800',
      error: '#f44336',
      success: '#4caf50'
    },
    dark: {
      primary: '#90caf9',
      secondary: '#f48fb1',
      accent: '#ff9800',
      background: '#121212',
      text: '#ffffff',
      grid: '#2d2d2d',
      highlight: '#fff59d',
      warning: '#ff9800',
      error: '#f44336',
      success: '#4caf50'
    }
  };

  const colors = colorSchemes[theme] || colorSchemes.light;

  // Process social data for visualization
  const processSocialData = useCallback((socialState: SocialState) => {
    const nodes: SocialNode[] = [];
    const links: SocialLink[] = [];
    const nodeMap = new Map<string, SocialNode>();

    // Process agents as nodes
    Object.entries(socialState.currentNetwork?.agents || {}).forEach(([agentId, agent]: [string, any]) => {
      const node: SocialNode = {
        id: agentId,
        label: agent.agentName || agentId,
        type: 'agent',
        radius: nodeSize + ((agent.trust || 0.5) * 15),
        color: getTrustColor(agent.trust || 0.5),
        group: 'agents',
        data: agent,
        relationship: {
          trust: agent.trust || 0.5,
          friendship: agent.friendship || 0.5,
          reputation: agent.reputation || 0.5
        },
        interactions: agent.interactionCount || 0
      };
      nodes.push(node);
      nodeMap.set(agentId, node);
    });

    // Process relationships as links
    Object.entries(socialState.currentNetwork?.relationships || {}).forEach(([sourceId, relationship]: [string, any]) => {
      Object.entries(relationship.connections || {}).forEach(([targetId, connection]: [string, any]) => {
        const targetNode = nodeMap.get(targetId);
        
        if (targetNode) {
          const link: SocialLink = {
            source: sourceId,
            target: targetId,
            type: 'relationship',
            strength: connection.strength || (sourceRelationship.trust || 0.5),
            value: connection.strength || 0.5,
            width: Math.max(1, (connection.strength || 0.5) * 8),
            color: getRelationshipColor(connection.type || 'neutral'),
            direction: connection.direction || 'bidirectional',
            data: connection
          };
          links.push(link);
        }
      });
    });

    return { nodes, links };
  }, [nodeSize, colors]);

  // Get trust level color
  const getTrustColor = (trust: number): string => {
    if (trust >= 0.8) return colors.success;
    if (trust >= 0.6) return colors.primary;
    if (trust >= 0.4) return colors.accent;
    return colors.warning;
  };

  // Get relationship type color
  const getRelationshipColor = (type: string): string => {
    switch (type.toLowerCase()) {
      case 'friendship': return colors.success;
      case 'collaboration': return colors.primary;
      case 'conflict': return colors.error;
      case 'trade': return colors.accent;
      default: return colors.secondary;
    }
  };

  // Initialize and update visualization
  useEffect(() => {
    if (!data || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const svgWidth = width - (margin.left || 0) - (margin.right || 0);
    const svgHeight = height - (margin.top || 0) - (margin.bottom || 0);

    // Create container group for zoom/pan
    const container = svg.append('g')
      .attr('class', 'social-network-container');

    // Create zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        container.attr('transform', event.transform);
        setZoomState({
          scale: event.transform.k,
          translateX: event.transform.x,
          translateY: event.transform.y
        });
      });

    svg.call(zoom);

    // Process data
    const { nodes, links } = processSocialData(data);

    // Create force simulation
    const simulation = d3.forceSimulation(nodes as any)
      .force('link', d3.forceLink(links)
        .id((d: any) => d.id)
        .distance(linkDistance)
        .strength((d: any) => d.strength || 1)
      )
      .force('charge', d3.forceManyBody().strength(chargeStrength))
      .force('center', d3.forceCenter(svgWidth / 2, svgHeight / 2))
      .force('collision', d3.forceCollide().radius((d: any) => d.radius || nodeSize));

    simulationRef.current = simulation;

    // Create links
    const linkGroup = container.append('g')
      .attr('class', 'social-links');

    const link = linkGroup.selectAll('line')
      .data(links)
      .enter().append('line')
      .attr('class', 'social-link')
      .attr('stroke', (d: SocialLink) => d.color || colors.secondary)
      .attr('stroke-width', (d: SocialLink) => d.width || 2)
      .attr('stroke-opacity', 0.7)
      .attr('stroke-dasharray', (d: SocialLink) => {
        if (d.direction === 'source-to-target') return '5, 5';
        if (d.direction === 'target-to-source') return '10, 5';
        return '0';
      })
      .on('click', function(event: any, d: SocialLink) {
        // Handle link click if needed
      })
      .on('mouseover', function(event: any, d: SocialLink) {
        d3.select(this)
          .attr('stroke-width', (d: any) => ((d as SocialLink).width || 2) * 2)
          .attr('stroke-opacity', 1);
      })
      .on('mouseout', function(event: any, d: SocialLink) {
        d3.select(this)
          .attr('stroke-width', (d: SocialLink) => d.width || 2)
          .attr('stroke-opacity', 0.7);
      });

    // Add arrowheads for directed links
    const marker = svg.append('defs')
      .append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '-0 -5 10 10')
      .attr('refX', 8)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M 0,-5 L 10,0 L 0,5')
      .attr('fill', colors.secondary);

    link.attr('marker-end', 'url(#arrowhead)');

    // Create nodes
    const nodeGroup = container.append('g')
      .attr('class', 'social-nodes');

    const node = nodeGroup.selectAll('g')
      .data(nodes)
      .enter().append('g')
      .attr('class', 'social-node-group');

    // Add circles for nodes
    node.append('circle')
      .attr('class', 'social-node')
      .attr('r', (d: SocialNode) => d.radius || nodeSize)
      .attr('fill', (d: SocialNode) => d.color || colors.primary)
      .attr('stroke', colors.background)
      .attr('stroke-width', 3)
      .on('click', function(event: any, d: SocialNode) {
        setSelectedNode(d);
        if (onDataPointClick) {
          onDataPointClick(d);
        }
      })
      .on('mouseover', function(event: any, d: SocialNode) {
        setHoveredNode(d);
        if (onDataPointHover) {
          onDataPointHover(d);
        }
        d3.select(this).select('circle')
          .attr('r', ((d: SocialNode) => (d.radius || nodeSize) * 1.3))
          .attr('stroke', colors.highlight);
      })
      .on('mouseout', function(event: any, d: SocialNode) {
        setHoveredNode(null);
        if (onDataPointHover) {
          onDataPointHover(null);
        }
        d3.select(this).select('circle')
          .attr('r', (d: SocialNode) => d.radius || nodeSize)
          .attr('stroke', colors.background);
      });

    // Add labels for nodes
    node.append('text')
      .attr('class', 'social-label')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('fill', colors.text)
      .attr('font-size', '11px')
      .attr('font-weight', 'bold')
      .attr('pointer-events', 'none')
      .text((d: SocialNode) => d.label)
      .style('opacity', 0);

    // Add interaction count badges
    if (showInteractions) {
      node.append('circle')
        .attr('class', 'interaction-badge')
        .attr('r', 8)
        .attr('cx', (d: SocialNode) => (d.radius || nodeSize) + 8)
        .attr('cy', (d: SocialNode) => -(d.radius || nodeSize) + 8)
        .attr('fill', colors.accent)
        .attr('stroke', colors.background)
        .attr('stroke-width', 2);

      node.append('text')
        .attr('class', 'interaction-count')
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('fill', colors.background)
        .attr('font-size', '10px')
        .attr('font-weight', 'bold')
        .attr('pointer-events', 'none')
        .text((d: SocialNode) => (d.interactions || 0).toString())
        .style('opacity', 0);
    }

    // Update positions on simulation tick
    simulationRef.current?.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node
        .attr('transform', (d: any) => `translate(${d.x},${d.y})`);

      // Update label positions
      container.selectAll('.social-label')
        .attr('x', (d: any) => d.x)
        .attr('y', (d: any) => d.y + ((d: SocialNode) => (d.radius || nodeSize) + 15))
        .style('opacity', 1);

      // Update interaction badge positions
      if (showInteractions) {
        container.selectAll('.interaction-badge')
          .attr('cx', (d: any) => d.x + ((d: SocialNode) => (d.radius || nodeSize) + 8))
          .attr('cy', (d: any) => d.y - ((d: SocialNode) => (d.radius || nodeSize) + 8));

        container.selectAll('.interaction-count')
          .attr('x', (d: any) => d.x + ((d: SocialNode) => (d.radius || nodeSize) + 8))
          .attr('y', (d: any) => d.y - ((d: SocialNode) => (d.radius || nodeSize) + 8))
          .style('opacity', 1);
      }
    });

    // Add drag behavior
    if (interactive) {
      const drag = d3.drag<SVGGElement, SocialNode>()
        .on('start', (event: any, d: SocialNode) => {
          if (!event.active) simulationRef.current?.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event: any, d: SocialNode) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event: any, d: SocialNode) => {
          if (!event.active) simulationRef.current?.alphaTarget(0);
          d.fx = undefined;
          d.fy = undefined;
        });

      node.call(drag as any);
    }

    // Cleanup
    return () => {
      simulationRef.current?.stop();
    };

  }, [data, width, height, margin, theme, showTrustLevels, showInteractions, nodeSize, linkDistance, chargeStrength, interactive, animated, processSocialData, colors, onDataPointClick, onDataPointHover]);

  // Handle zoom controls
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

  const handleResetZoom = () => {
    if (svgRef.current) {
      const svg = d3.select(svgRef.current);
      const zoom = d3.zoom<SVGSVGElement, unknown>();
      svg.transition().duration(300).call(zoom.transform, d3.zoomIdentity);
    }
  };

  return (
    <Paper
      sx={{
        p: 2,
        bgcolor: colors.background,
        borderRadius: 2,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        position: 'relative'
      }}
      className={className}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Social Relationship Network
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <FormControlLabel
            control={
              <Switch
                size="small"
                checked={showTrustLevels}
                onChange={(e) => {/* Handle showTrustLevels change */}}
              />
            }
            label="Trust Levels"
          />
          
          <FormControlLabel
            control={
              <Switch
                size="small"
                checked={showInteractions}
                onChange={(e) => {/* Handle showInteractions change */}}
              />
            }
            label="Interactions"
          />

          <IconButton onClick={handleZoomIn} size="small">
            <ZoomInIcon />
          </IconButton>
          
          <IconButton onClick={handleZoomOut} size="small">
            <ZoomOutIcon />
          </IconButton>
          
          <IconButton onClick={handleResetZoom} size="small">
            <RefreshIcon />
          </IconButton>
          
          <IconButton size="small">
            <FilterIcon />
          </IconButton>
          
          <IconButton size="small">
            <SettingsIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Node Information Panel */}
      {(selectedNode || hoveredNode) && (
        <Box
          sx={{
            position: 'absolute',
            top: 60,
            right: 20,
            p: 2,
            bgcolor: colors.background,
            border: `1px solid ${colors.grid}`,
            borderRadius: 1,
            maxWidth: 280,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
            zIndex: 10
          }}
        >
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
            {selectedNode?.label || hoveredNode?.label}
          </Typography>
          
          <Typography variant="body2" sx={{ mb: 0.5 }}>
            Type: {selectedNode?.type || hoveredNode?.type}
          </Typography>
          
          {(selectedNode?.relationship || hoveredNode?.relationship) && (
            <>
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                Trust: {((selectedNode?.relationship || hoveredNode?.relationship)?.trust || 0) * 100).toFixed(1)}%
              </Typography>
              
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                Friendship: {((selectedNode?.relationship || hoveredNode?.relationship)?.friendship || 0) * 100).toFixed(1)}%
              </Typography>
              
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                Reputation: {((selectedNode?.relationship || hoveredNode?.relationship)?.reputation || 0) * 100).toFixed(1)}%
              </Typography>
            </>
          )}
          
          <Typography variant="body2" sx={{ mb: 0.5 }}>
            Interactions: {selectedNode?.interactions || hoveredNode?.interactions || 0}
          </Typography>
          
          {(selectedNode?.data as any)?.lastInteraction && (
            <Typography variant="body2" sx={{ fontStyle: 'italic', mt: 1 }}>
              Last Interaction: {new Date((selectedNode.data as any).lastInteraction).toLocaleString()}
            </Typography>
          )}
        </Box>
      )}

      {/* Zoom Status */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 20,
          left: 20,
          p: 1,
          bgcolor: colors.background,
          border: `1px solid ${colors.grid}`,
          borderRadius: 1,
          fontSize: '12px',
          opacity: 0.8
        }}
      >
        Zoom: {(zoomState.scale * 100).toFixed(0)}%
      </Box>

      {/* Network Statistics */}
      {data && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 20,
            right: 20,
            p: 1,
            bgcolor: colors.background,
            border: `1px solid ${colors.grid}`,
            borderRadius: 1,
            fontSize: '12px',
            opacity: 0.8
          }}
        >
          <Typography variant="body2">
            Agents: {Object.keys(data.relationships || {}).length}
          </Typography>
          <Typography variant="body2">
            Connections: {Object.values(data.relationships || {}).reduce((sum: number, rel: any) => sum + Object.keys(rel.connections || {}).length, 0)}
          </Typography>
          <Typography variant="body2">
            Avg Trust: {(Object.values(data.relationships || {}).reduce((sum: number, rel: any) => sum + (rel.trust || 0.5), 0) / Object.keys(data.relationships || {}).length * 100).toFixed(1)}%
          </Typography>
        </Box>
      )}

      <svg
        ref={svgRef}
        width={width}
        height={height}
        style={{ width: '100%', height: '100%' }}
      />
    </Paper>
  );
};

export default SocialRelationshipNetwork;