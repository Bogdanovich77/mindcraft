import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
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
} from '@mui/material';
import { useAppSelector } from '../../store';
import {
  ZoomIn,
  ZoomOut,
  CenterFocusStrong,
  Refresh,
  Download,
  Settings,
} from '@mui/icons-material';
import * as d3 from 'd3';
import type {
  SocialNetwork,
  SocialAgent,
  SocialRelationship,
  NetworkGraphConfig,
  NetworkNode,
  NetworkLink,
} from '../../types/social';

interface SocialNetworkGraphProps {
  network: SocialNetwork;
  config: NetworkGraphConfig;
  onNodeClick?: (agent: SocialAgent) => void;
  onNodeHover?: (agent: SocialAgent | null) => void;
  onLinkClick?: (relationship: SocialRelationship) => void;
  onLinkHover?: (relationship: SocialRelationship | null) => void;
  height?: number;
  className?: string;
}

interface GraphMetrics {
  nodeCount: number;
  linkCount: number;
  density: number;
  averageDegree: number;
  clusteringCoefficient: number;
  connectedComponents: number;
}

const SocialNetworkGraph: React.FC<SocialNetworkGraphProps> = ({
  network,
  config,
  onNodeClick,
  onNodeHover,
  onLinkClick,
  onLinkHover,
  height = 600,
  className,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const simulationRef = useRef<d3.Simulation<NetworkNode, NetworkLink> | undefined>(undefined);
  const [zoom, setZoom] = useState<number>(1);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);
  const [selectedLink, setSelectedLink] = useState<NetworkLink | null>(null);
  const [hoveredNode, setHoveredNode] = useState<NetworkNode | null>(null);
  const [hoveredLink, setHoveredLink] = useState<NetworkLink | null>(null);
  const [layoutType, setLayoutType] = useState<'force' | 'circular' | 'hierarchical'>('force');
  const [nodeSize, setNodeSize] = useState(config.nodeSize);
  const [linkWidth, setLinkWidth] = useState(config.linkWidth);
  const [showLabels, setShowLabels] = useState(config.showLabels);
  const [showCommunities, setShowCommunities] = useState(config.showCommunities);

  // Convert social data to D3 format
  const { nodes, links } = useMemo(() => {
    const nodeMap = new Map<string, NetworkNode>();
    
    // Create nodes
    const graphNodes: NetworkNode[] = network.agents.map(agent => {
      const node: NetworkNode = {
        id: agent.id,
        name: agent.name,
        agent,
        radius: nodeSize,
        color: 'defaultNodeColor',
        communityId: undefined,
        influenceScore: agent.socialStats.influenceScore,
        reputationScore: agent.socialStats.reputationScore,
      };
      nodeMap.set(agent.id, node);
      return node;
    });

    // Create links
    const graphLinks: NetworkLink[] = network.relationships.map(rel => {
      const sourceNode = nodeMap.get(rel.agentId);
      const targetNode = nodeMap.get(rel.targetAgentId);
      
      if (!sourceNode || !targetNode) return null;

      return {
        source: sourceNode,
        target: targetNode,
        relationship: rel,
        strength: rel.trustLevel,
        color: config.getRelationshipColor(rel.relationshipType),
        width: linkWidth * rel.trustLevel,
        distance: config.linkDistance * (1 - rel.trustLevel * 0.5),
      };
    }).filter(link => link !== null) as NetworkLink[];

    return { nodes: graphNodes, links: graphLinks };
  }, [network, config, nodeSize, linkWidth]);

  // Calculate network metrics
  const metrics = useMemo<GraphMetrics>(() => {
    const nodeCount = nodes.length;
    const linkCount = links.length;
    const maxPossibleLinks = (nodeCount * (nodeCount - 1)) / 2;
    const density = maxPossibleLinks > 0 ? linkCount / maxPossibleLinks : 0;
    
    // Calculate average degree
    const degreeSum = nodes.reduce((sum, node) => {
      const degree = links.filter(link => {
        const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
        const targetId = typeof link.target === 'string' ? link.target : link.target.id;
        return sourceId === node.id || targetId === node.id;
      }).length;
      return sum + degree;
    }, 0);
    const averageDegree = nodeCount > 0 ? degreeSum / nodeCount : 0;

    // Calculate clustering coefficient (simplified)
    let clusteringSum = 0;
    nodes.forEach(node => {
      const neighbors = links
        .filter(link => {
          const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
          const targetId = typeof link.target === 'string' ? link.target : link.target.id;
          return sourceId === node.id || targetId === node.id;
        })
        .map(link => {
          const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
          const targetId = typeof link.target === 'string' ? link.target : link.target.id;
          return sourceId === node.id ? targetId : sourceId;
        });
      
      if (neighbors.length < 2) {
        clusteringSum += 0;
        return;
      }

      let neighborLinks = 0;
      for (let i = 0; i < neighbors.length; i++) {
        for (let j = i + 1; j < neighbors.length; j++) {
          if (links.some(link => {
            const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
            const targetId = typeof link.target === 'string' ? link.target : link.target.id;
            return (sourceId === neighbors[i] && targetId === neighbors[j]) ||
                   (sourceId === neighbors[j] && targetId === neighbors[i]);
          })) {
            neighborLinks++;
          }
        }
      }

      const maxNeighborLinks = (neighbors.length * (neighbors.length - 1)) / 2;
      clusteringSum += maxNeighborLinks > 0 ? neighborLinks / maxNeighborLinks : 0;
    });
    const clusteringCoefficient = nodeCount > 0 ? clusteringSum / nodeCount : 0;

    // Count connected components (simplified)
    const visited = new Set<string>();
    let connectedComponents = 0;
    
    const dfs = (nodeId: string) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);
      
      links.forEach(link => {
        const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
        const targetId = typeof link.target === 'string' ? link.target : link.target.id;
        
        if (sourceId === nodeId && !visited.has(targetId)) {
          dfs(targetId);
        } else if (targetId === nodeId && !visited.has(sourceId)) {
          dfs(sourceId);
        }
      });
    };

    nodes.forEach(node => {
      if (!visited.has(node.id)) {
        connectedComponents++;
        dfs(node.id);
      }
    });

    return {
      nodeCount,
      linkCount,
      density,
      averageDegree,
      clusteringCoefficient,
      connectedComponents,
    };
  }, [nodes, links]);

  // Initialize and update D3 visualization
  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = svgRef.current.clientWidth;
    const svgHeight = svgRef.current.clientHeight;

    // Create container group for zoom
    const container = svg.append('g');

    // Add zoom behavior
    const zoomBehavior = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        container.attr('transform', event.transform);
        setZoom(event.transform.k);
      });

    svg.call(zoomBehavior);

    // Create simulation
    const simulation = d3.forceSimulation<NetworkNode>(nodes)
      .force('link', d3.forceLink<NetworkNode, NetworkLink>(links)
        .id(d => d.id)
        .distance(d => d.distance)
        .strength(d => d.strength))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, svgHeight / 2))
      .force('collision', d3.forceCollide().radius(d => (d as any).radius + 5));

    simulationRef.current = simulation;

    // Create arrow markers for directed links
    svg.append('defs')
      .selectAll('marker')
      .data(['arrow'])
      .enter().append('marker')
      .attr('id', 'arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 15)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#999');

    // Create links
    const linkElements = container.append('g')
      .selectAll('line')
      .data(links)
      .enter().append('line')
      .attr('stroke', d => d.color)
      .attr('stroke-width', d => d.width)
      .attr('stroke-opacity', 0.6)
      .attr('marker-end', 'url(#arrow)')
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        setSelectedLink(d);
        onLinkClick?.(d.relationship);
      })
      .on('mouseenter', (event, d) => {
        setHoveredLink(d);
        onLinkHover?.(d.relationship);
        d3.select(event.target).attr('stroke-width', d.width * 2).attr('stroke-opacity', 1);
      })
      .on('mouseleave', (event, d) => {
        setHoveredLink(null);
        onLinkHover?.(null);
        d3.select(event.target).attr('stroke-width', d.width).attr('stroke-opacity', 0.6);
      });

    // Create nodes
    const nodeElements = container.append('g')
      .selectAll('circle')
      .data(nodes)
      .enter().append('circle')
      .attr('r', d => (d as any).radius)
      .attr('fill', d => d.color)
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        setSelectedNode(d);
        onNodeClick?.(d.agent);
      })
      .on('mouseenter', (event, d) => {
        setHoveredNode(d);
        onNodeHover?.(d.agent);
        d3.select(event.target).attr('r', (d as any).radius * 1.2).attr('stroke-width', 3);
      })
      .on('mouseleave', (event, d) => {
        setHoveredNode(null);
        onNodeHover?.(null);
        d3.select(event.target).attr('r', (d as any).radius).attr('stroke-width', 2);
      })
      .call(d3.drag<SVGCircleElement, NetworkNode>()
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
          d.fx = null;
          d.fy = null;
        }) as any);

    // Create labels
    const labelElements = container.append('g')
      .selectAll('text')
      .data(nodes)
      .enter().append('text')
      .text(d => d.name)
      .attr('font-size', '12px')
      .attr('font-family', 'Arial, sans-serif')
      .attr('text-anchor', 'middle')
      .attr('dy', '.35em')
      .attr('fill', '#333')
      .style('pointer-events', 'none')
      .style('display', showLabels ? 'block' : 'none');

    // Update positions on simulation tick
    simulation.on('tick', () => {
      linkElements
        .attr('x1', d => {
          const source = d.source as NetworkNode;
          return source.x!;
        })
        .attr('y1', d => {
          const source = d.source as NetworkNode;
          return source.y!;
        })
        .attr('x2', d => {
          const target = d.target as NetworkNode;
          return target.x!;
        })
        .attr('y2', d => {
          const target = d.target as NetworkNode;
          return target.y!;
        });

      nodeElements
        .attr('cx', d => d.x!)
        .attr('cy', d => d.y!);

      labelElements
        .attr('x', d => d.x!)
        .attr('y', d => d.y! + (d as any).radius + 15);
    });

    return () => {
      simulation.stop();
    };
  }, [nodes, links, showLabels, onNodeClick, onNodeHover, onLinkClick, onLinkHover]);

  // Handle layout changes
  useEffect(() => {
    if (!simulationRef.current) return;

    const simulation = simulationRef.current;
    simulation.stop();

    if (layoutType === 'circular') {
      const radius = Math.min(height, svgRef.current?.clientWidth || 800) / 2 - 100;
      nodes.forEach((node, i) => {
        const angle = (i / nodes.length) * 2 * Math.PI;
        node.fx = radius * Math.cos(angle) + (svgRef.current?.clientWidth || 800) / 2;
        node.fy = radius * Math.sin(angle) + height / 2;
      });
    } else if (layoutType === 'hierarchical') {
      // Simple hierarchical layout by community
      const communities = new Map<string, NetworkNode[]>();
      nodes.forEach(node => {
        const communityId = node.communityId || 'default';
        if (!communities.has(communityId)) {
          communities.set(communityId, []);
        }
        communities.get(communityId)!.push(node);
      });

      let yOffset = 50;
      communities.forEach((communityNodes) => {
        const xSpacing = (svgRef.current?.clientWidth || 800) / (communityNodes.length + 1);
        communityNodes.forEach((node, i) => {
          node.fx = xSpacing * (i + 1);
          node.fy = yOffset;
        });
        yOffset += 100;
      });
    } else {
      // Force-directed layout
      nodes.forEach(node => {
        node.fx = null;
        node.fy = null;
      });
    }

    simulation.alpha(1).restart();
  }, [layoutType, nodes, height]);

  const handleZoomIn = () => {
    if (svgRef.current) {
      const svg = d3.select(svgRef.current);
      const zoomBehavior = d3.zoom<SVGSVGElement, unknown>().on('zoom', () => {});
      svg.transition().call(zoomBehavior.scaleBy, 1.2);
    }
  };

  const handleZoomOut = () => {
    if (svgRef.current) {
      const svg = d3.select(svgRef.current);
      const zoomBehavior = d3.zoom<SVGSVGElement, unknown>().on('zoom', () => {});
      svg.transition().call(zoomBehavior.scaleBy, 0.8);
    }
  };

  const handleCenter = () => {
    if (svgRef.current) {
      const svg = d3.select(svgRef.current);
      const zoomBehavior = d3.zoom<SVGSVGElement, unknown>();
      svg.transition().call(zoomBehavior.transform, d3.zoomIdentity);
    }
  };

  const handleReset = () => {
    setSelectedNode(null);
    setSelectedLink(null);
    setLayoutType('force');
    setZoom(1);
    handleCenter();
  };

  const handleExport = () => {
    if (svgRef.current) {
      const svgData = new XMLSerializer().serializeToString(svgRef.current);
      const blob = new Blob([svgData], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'social-network-graph.svg';
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <Paper className={className} sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Social Network Graph</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Zoom In">
            <IconButton onClick={handleZoomIn} size="small">
              <ZoomIn />
            </IconButton>
          </Tooltip>
          <Tooltip title="Zoom Out">
            <IconButton onClick={handleZoomOut} size="small">
              <ZoomOut />
            </IconButton>
          </Tooltip>
          <Tooltip title="Center">
            <IconButton onClick={handleCenter} size="small">
              <CenterFocusStrong />
            </IconButton>
          </Tooltip>
          <Tooltip title="Reset">
            <IconButton onClick={handleReset} size="small">
              <Refresh />
            </IconButton>
          </Tooltip>
          <Tooltip title="Export">
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

      {/* Metrics */}
      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
        <Chip label={`Nodes: ${metrics.nodeCount}`} size="small" />
        <Chip label={`Links: ${metrics.linkCount}`} size="small" />
        <Chip label={`Density: ${(metrics.density * 100).toFixed(1)}%`} size="small" />
        <Chip label={`Avg Degree: ${metrics.averageDegree.toFixed(1)}`} size="small" />
        <Chip label={`Clustering: ${(metrics.clusteringCoefficient * 100).toFixed(1)}%`} size="small" />
        <Chip label={`Components: ${metrics.connectedComponents}`} size="small" />
        <Chip label={`Zoom: ${(zoom * 100).toFixed(0)}%`} size="small" />
      </Box>

      {/* Settings Panel */}
      {showSettings && (
        <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Layout</InputLabel>
              <Select
                value={layoutType}
                label="Layout"
                onChange={(e) => setLayoutType(e.target.value as any)}
              >
                <MenuItem value="force">Force-Directed</MenuItem>
                <MenuItem value="circular">Circular</MenuItem>
                <MenuItem value="hierarchical">Hierarchical</MenuItem>
              </Select>
            </FormControl>

            <Box sx={{ minWidth: 150 }}>
              <Typography variant="caption" display="block" gutterBottom>
                Node Size: {nodeSize}
              </Typography>
              <Slider
                value={nodeSize}
                onChange={(_, value) => setNodeSize(value as number)}
                min={5}
                max={30}
                step={1}
                size="small"
              />
            </Box>

            <Box sx={{ minWidth: 150 }}>
              <Typography variant="caption" display="block" gutterBottom>
                Link Width: {linkWidth}
              </Typography>
              <Slider
                value={linkWidth}
                onChange={(_, value) => setLinkWidth(value as number)}
                min={1}
                max={10}
                step={0.5}
                size="small"
              />
            </Box>

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
                  checked={showCommunities}
                  onChange={(e) => setShowCommunities(e.target.checked)}
                  size="small"
                />
              }
              label="Show Communities"
            />
          </Box>
        </Box>
      )}

      {/* Graph Visualization */}
      <Box sx={{ flex: 1, position: 'relative', border: '1px solid #ddd', borderRadius: 1 }}>
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          style={{ minHeight: height }}
        />
      </Box>

      {/* Selection Info */}
      {(selectedNode || selectedLink || hoveredNode || hoveredLink) && (
        <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
          {selectedNode && (
            <Box>
              <Typography variant="subtitle2">Selected Node: {selectedNode.name}</Typography>
              <Typography variant="body2">
                Influence: {selectedNode.influenceScore.toFixed(3)} | 
                Reputation: {selectedNode.reputationScore.toFixed(3)}
              </Typography>
            </Box>
          )}
          {selectedLink && (
            <Box>
              <Typography variant="subtitle2">
                Selected Relationship: {selectedLink.relationship.relationshipType}
              </Typography>
              <Typography variant="body2">
                Trust: {selectedLink.relationship.trustLevel.toFixed(3)} | 
                Friendship: {selectedLink.relationship.friendshipScore.toFixed(3)}
              </Typography>
            </Box>
          )}
          {hoveredNode && !selectedNode && (
            <Typography variant="body2">Hovering: {hoveredNode.name}</Typography>
          )}
          {hoveredLink && !selectedLink && (
            <Typography variant="body2">
              Hovering: {hoveredLink.relationship.relationshipType} relationship
            </Typography>
          )}
        </Box>
      )}
    </Paper>
  );
};

SocialNetworkGraph.displayName = 'SocialNetworkGraph';

export default SocialNetworkGraph;