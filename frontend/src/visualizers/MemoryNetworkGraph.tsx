import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Box, Typography, Paper, Tooltip, IconButton, Switch, FormControlLabel } from '@mui/material';
import { Refresh as RefreshIcon, Settings as SettingsIcon, ZoomIn as ZoomInIcon, ZoomOut as ZoomOutIcon, FilterList as FilterIcon } from '@mui/icons-material';
import * as d3 from 'd3';
import type { 
  BaseVisualizerProps, 
  MemoryNode, 
  MemoryLink, 
  ColorScheme,
  NetworkNode,
  NetworkLink,
  InteractionEvent,
  DataFilter
} from '../types/visualizers';
import type { MemorySystem, Concept, Relationship } from '../types/memory';

interface MemoryNetworkGraphProps extends Omit<BaseVisualizerProps, 'data'> {
  data?: MemorySystem;
  showClusters?: boolean;
  showStrength?: boolean;
  nodeSize?: number;
  linkDistance?: number;
  chargeStrength?: number;
  onNodeClick?: (node: MemoryNode) => void;
  onNodeHover?: (node: MemoryNode | null) => void;
  onLinkClick?: (link: MemoryLink) => void;
}

export const MemoryNetworkGraph: React.FC<MemoryNetworkGraphProps> = ({
  data,
  width = 800,
  height = 600,
  margin = { top: 20, right: 20, bottom: 20, left: 20 },
  theme = 'light',
  showClusters = true,
  showStrength = true,
  nodeSize = 8,
  linkDistance = 100,
  chargeStrength = -300,
  interactive = true,
  animated = true,
  onDataPointClick,
  onDataPointHover,
  className
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const simulationRef = useRef<d3.Simulation<any, any>>();
  const [selectedNode, setSelectedNode] = useState<MemoryNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<MemoryNode | null>(null);
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

  // Process memory data for visualization
  const processMemoryData = useCallback((memorySystem: MemorySystem) => {
    const nodes: MemoryNode[] = [];
    const links: MemoryLink[] = [];
    const nodeMap = new Map<string, MemoryNode>();

    // Process concepts as nodes
    memorySystem.semantic.concepts.forEach((concept: Concept) => {
      const node: MemoryNode = {
        id: concept.id,
        label: concept.name,
        type: 'semantic',
        strength: concept.importance,
        lastAccessed: concept.lastAccessed,
        accessCount: concept.accessCount,
        connections: concept.connections.length,
        radius: nodeSize + (concept.importance * 10),
        color: colors.primary,
        group: concept.category,
        data: concept
      };
      nodes.push(node);
      nodeMap.set(concept.id, node);
    });

    // Process relationships as links
    memorySystem.semantic.relationships.forEach((relationship: Relationship) => {
      const sourceNode = nodeMap.get(relationship.sourceId);
      const targetNode = nodeMap.get(relationship.targetId);
      
      if (sourceNode && targetNode) {
        const link: MemoryLink = {
          source: relationship.sourceId,
          target: relationship.targetId,
          type: 'association',
          strength: relationship.strength,
          value: relationship.strength * 10,
          width: Math.max(1, relationship.strength * 5),
          color: relationship.strength > 0.7 ? colors.secondary : colors.accent,
          data: relationship
        };
        links.push(link);
      }
    });

    return { nodes, links };
  }, [nodeSize, colors]);

  // Initialize and update visualization
  useEffect(() => {
    if (!data || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const svgWidth = width - (margin.left || 0) - (margin.right || 0);
    const svgHeight = height - (margin.top || 0) - (margin.bottom || 0);

    // Create container group for zoom/pan
    const container = svg.append('g')
      .attr('class', 'memory-network-container');

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
    const { nodes, links } = processMemoryData(data);

    // Create force simulation
    const simulation = d3.forceSimulation(nodes as any)
      .force('link', d3.forceLink(links)
        .id((d: any) => d.id)
        .distance(linkDistance)
        .strength((d: any) => d.strength || 1))
      )
      .force('charge', d3.forceManyBody().strength(chargeStrength))
      .force('center', d3.forceCenter(svgWidth / 2, svgHeight / 2))
      .force('collision', d3.forceCollide().radius((d: any) => d.radius || nodeSize));

    simulationRef.current = simulation;

    // Create links
    const linkGroup = container.append('g')
      .attr('class', 'links');

    const link = linkGroup.selectAll('line')
      .data(links)
      .enter().append('line')
      .attr('class', 'memory-link')
      .attr('stroke', (d: MemoryLink) => d.color || colors.accent)
      .attr('stroke-width', (d: MemoryLink) => d.width || 2)
      .attr('stroke-opacity', 0.6)
      .on('click', function(event: any, d: MemoryLink) {
        if (onLinkClick) {
          onLinkClick(d);
        }
      })
      .on('mouseover', function(event: any, d: MemoryLink) {
        d3.select(this)
          .attr('stroke-width', (d: any) => ((d as MemoryLink).width || 2) * 2)
          .attr('stroke-opacity', 1);
      })
      .on('mouseout', function(event: any, d: MemoryLink) {
        d3.select(this)
          .attr('stroke-width', (d: MemoryLink) => d.width || 2)
          .attr('stroke-opacity', 0.6);
      });

    // Create nodes
    const nodeGroup = container.append('g')
      .attr('class', 'nodes');

    const node = nodeGroup.selectAll('circle')
      .data(nodes)
      .enter().append('circle')
      .attr('class', 'memory-node')
      .attr('r', (d: MemoryNode) => d.radius || nodeSize)
      .attr('fill', (d: MemoryNode) => {
        if (d.type === 'semantic') {
          return (d.strength || 0) > 0.7 ? colors.primary : colors.accent;
        }
        return colors.secondary;
      })
      .attr('stroke', colors.background)
      .attr('stroke-width', 2)
      .on('click', function(event: any, d: MemoryNode) {
        setSelectedNode(d);
        if (onDataPointClick) {
          onDataPointClick(d);
        }
      })
      .on('mouseover', function(event: any, d: MemoryNode) {
        setHoveredNode(d);
        if (onDataPointHover) {
          onDataPointHover(d);
        }
        d3.select(this)
          .attr('r', (d: any) => ((d as MemoryNode).radius || nodeSize) * 1.5))
          .attr('stroke', colors.highlight);
      })
      .on('mouseout', function(event: any, d: MemoryNode) {
        setHoveredNode(null);
        if (onDataPointHover) {
          onDataPointHover(null);
        }
        d3.select(this)
          .attr('r', (d: MemoryNode) => d.radius || nodeSize)
          .attr('stroke', colors.background);
      });

    // Add labels for important nodes
    if (showStrength) {
      const labelGroup = container.append('g')
        .attr('class', 'labels');

      labelGroup.selectAll('text')
        .data(nodes.filter((d: MemoryNode) => (d.strength || 0) > 0.5))
        .enter().append('text')
        .attr('class', 'memory-label')
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('fill', colors.text)
        .attr('font-size', '10px')
        .attr('font-weight', 'bold')
        .attr('pointer-events', 'none')
        .text((d: MemoryNode) => d.label)
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
        .attr('cx', (d: any) => d.x)
        .attr('cy', (d: any) => d.y);

      // Update label positions
      if (showStrength) {
        container.selectAll('.memory-label')
          .attr('x', (d: any) => d.x)
          .attr('y', (d: any) => d.y + ((d as MemoryNode).radius || nodeSize) + 5))
          .style('opacity', 1);
      }
    });

    // Add drag behavior
    if (interactive) {
      const drag = d3.drag<SVGCircleElement, MemoryNode>()
        .on('start', (event: any, d: MemoryNode) => {
          if (!event.active) simulationRef.current?.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event: any, d: MemoryNode) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event: any, d: MemoryNode) => {
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

  }, [data, width, height, margin, theme, showClusters, showStrength, nodeSize, linkDistance, chargeStrength, interactive, animated, processMemoryData, colors, onLinkClick, onDataPointClick, onDataPointHover]);

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
          Memory Network Graph
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <FormControlLabel
            control={
              <Switch
                size="small"
                checked={showStrength}
                onChange={(e) => {/* Handle showStrength change */}}
              />
            }
            label="Strength"
          />
          
          <FormControlLabel
            control={
              <Switch
                size="small"
                checked={showClusters}
                onChange={(e) => {/* Handle showClusters change */}}
              />
            }
            label="Clusters"
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
            maxWidth: 250,
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
          
          <Typography variant="body2" sx={{ mb: 0.5 }}>
            Strength: {((selectedNode?.strength || hoveredNode?.strength || 0) * 100).toFixed(1)}%
          </Typography>
          
          <Typography variant="body2" sx={{ mb: 0.5 }}>
            Connections: {selectedNode?.connections || hoveredNode?.connections || 0}
          </Typography>
          
          <Typography variant="body2" sx={{ mb: 0.5 }}>
            Access Count: {selectedNode?.accessCount || hoveredNode?.accessCount || 0}
          </Typography>
          
          {(selectedNode?.data as Concept)?.category && (
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              Category: {(selectedNode.data as Concept)?.category}
            </Typography>
          )}
          
          {(selectedNode?.data as Concept)?.definition && (
            <Typography variant="body2" sx={{ fontStyle: 'italic', mt: 1 }}>
              {(selectedNode.data as Concept)?.definition}
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

      {/* Graph Statistics */}
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
            Nodes: {data.semantic.concepts.length}
          </Typography>
          <Typography variant="body2">
            Links: {data.semantic.relationships.length}
          </Typography>
          <Typography variant="body2">
            Density: {data.semantic.knowledgeGraph.metrics.graphDensity.toFixed(3)}
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

export default MemoryNetworkGraph;