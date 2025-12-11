import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  IconButton,
  Tooltip,
  Slider,
  Switch,
  FormControlLabel,
  Chip,
  Button,
  Menu,
} from '@mui/material';
import {
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  CenterFocusStrong as CenterIcon,
} from '@mui/icons-material';
import * as d3 from 'd3';
import type { MemorySystem, Concept, Relationship } from '../../types/memory';

interface SemanticMemoryGraphProps {
  memorySystem?: MemorySystem;
  loading?: boolean;
  onRefresh?: () => void;
}

interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  type: string;
  strength: number;
  cluster?: string;
  color?: string;
  radius?: number;
}

interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  source: string | GraphNode;
  target: string | GraphNode;
  strength: number;
  type: string;
  color?: string;
}

const SemanticMemoryGraph: React.FC<SemanticMemoryGraphProps> = ({
  memorySystem,
  loading = false,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [zoom, setZoom] = useState(1);
  const [showLabels, setShowLabels] = useState(true);
  const [showClusters, setShowClusters] = useState(true);
  const [linkDistance, setLinkDistance] = useState(100);
  const [chargeStrength, setChargeStrength] = useState(-300);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [settingsAnchor, setSettingsAnchor] = useState<null | HTMLElement>(null);

  // Process memory data for visualization
  const { nodes, links } = useMemo(() => {
    if (!memorySystem?.semantic) {
      return { nodes: [] as GraphNode[], links: [] as GraphLink[] };
    }

    const concepts = memorySystem.semantic.concepts;
    const relationships = memorySystem.semantic.relationships;

    // Create nodes from concepts
    const graphNodes: GraphNode[] = concepts.map((concept: Concept) => ({
      id: concept.id,
      name: concept.name,
      type: concept.category, // Use category as type since Concept doesn't have type
      strength: concept.strength,
      cluster: concept.category,
      color: getNodeColor(concept.category),
      radius: Math.max(5, Math.min(20, concept.strength * 20)),
    }));

    // Create links from relationships
    const graphLinks: GraphLink[] = relationships.map((rel: Relationship) => ({
      source: rel.sourceId,
      target: rel.targetId,
      strength: rel.strength,
      type: rel.type,
      color: getLinkColor(rel.type),
    }));

    return { nodes: graphNodes, links: graphLinks };
  }, [memorySystem]);

  // Color functions
  const getNodeColor = useCallback((type: string): string => {
    const colorMap: Record<string, string> = {
      entity: '#2196f3',
      concept: '#4caf50',
      attribute: '#ff9800',
      relationship: '#9c27b0',
      event: '#f44336',
      location: '#00bcd4',
      person: '#e91e63',
      object: '#795548',
    };
    return colorMap[type] || '#757575';
  }, []);

  const getLinkColor = useCallback((type: string): string => {
    const colorMap: Record<string, string> = {
      'is-a': '#4caf50',
      'part-of': '#2196f3',
      'related-to': '#ff9800',
      'causes': '#f44336',
      'located-at': '#00bcd4',
      'similar-to': '#9c27b0',
      'opposite-of': '#e91e63',
    };
    return colorMap[type] || '#757575';
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

  // D3 visualization
  useEffect(() => {
    if (!svgRef.current || !nodes.length || loading) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Create zoom behavior
    const zoomBehavior = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
        setZoom(event.transform.k);
      });

    svg.call(zoomBehavior);

    // Create main group
    const g = svg.append('g');

    // Create simulation
    const simulation = d3
      .forceSimulation<GraphNode>(nodes)
      .force('link', d3.forceLink<GraphNode, GraphLink>(links).id(d => d.id).distance(linkDistance))
      .force('charge', d3.forceManyBody().strength(chargeStrength))
      .force('center', d3.forceCenter(dimensions.width / 2, dimensions.height / 2))
      .force('collision', d3.forceCollide().radius((d: any) => (d.radius || 10) + 2));

    // Create links
    const link = g
      .append('g')
      .selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('stroke', d => d.color || '#999')
      .attr('stroke-opacity', d => 0.3 + d.strength * 0.7)
      .attr('stroke-width', d => Math.max(1, d.strength * 3));

    // Create node groups
    const node = g
      .append('g')
      .selectAll('g')
      .data(nodes)
      .enter()
      .append('g')
      .style('cursor', 'pointer')
      .call(d3.drag<SVGGElement, GraphNode>()
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

    // Add circles to nodes
    node
      .append('circle')
      .attr('r', (d: any) => d.radius || 10)
      .attr('fill', (d: any) => d.color || '#999')
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .on('click', (_event) => {
        setSelectedNode((_event.currentTarget as any).__data__);
        _event.stopPropagation();
      })
      .on('mouseover', function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', ((d: any) => (d.radius || 10) * 1.2));
      })
      .on('mouseout', function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', (d: any) => d.radius || 10);
      });

    // Add labels to nodes
    if (showLabels) {
      node
        .append('text')
        .text((d: any) => d.name)
        .attr('font-size', '10px')
        .attr('font-family', 'Arial, sans-serif')
        .attr('text-anchor', 'middle')
        .attr('dy', '.35em')
        .attr('fill', '#fff')
        .attr('pointer-events', 'none')
        .style('user-select', 'none');
    }

    // Add tooltips
    node.append('title').text((d: any) => `${d.name} (${d.type})\nStrength: ${d.strength.toFixed(2)}`);

    // Update positions on tick
    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => (d.source as GraphNode).x || 0)
        .attr('y1', (d: any) => (d.source as GraphNode).y || 0)
        .attr('x2', (d: any) => (d.target as GraphNode).x || 0)
        .attr('y2', (d: any) => (d.target as GraphNode).y || 0);

      node.attr('transform', (d: any) => `translate(${d.x || 0}, ${d.y || 0})`);
    });

    // Cleanup
    return () => {
      simulation.stop();
    };
  }, [nodes, links, dimensions, linkDistance, chargeStrength, showLabels, loading]);

  // Control functions
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

  const handleCenterGraph = () => {
    if (svgRef.current) {
      const svg = d3.select(svgRef.current);
      const g = svg.select('g');
      g.transition().duration(300).attr('transform', `translate(${dimensions.width / 2}, ${dimensions.height / 2}) scale(1)`);
    }
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
          Loading Semantic Memory Graph...
        </Typography>
      </Box>
    );
  }

  if (!nodes.length) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="400px">
        <Typography variant="h6" color="text.secondary">
          No semantic memory data available
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* Controls */}
      <Box sx={{ position: 'absolute', top: 16, left: 16, zIndex: 1, display: 'flex', gap: 1 }}>
        <Tooltip title="Zoom In">
          <IconButton onClick={handleZoomIn} size="small">
            <ZoomInIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Zoom Out">
          <IconButton onClick={handleZoomOut} size="small">
            <ZoomOutIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Reset Zoom">
          <IconButton onClick={handleResetZoom} size="small">
            <RefreshIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Center Graph">
          <IconButton onClick={handleCenterGraph} size="small">
            <CenterIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Settings">
          <IconButton onClick={handleSettingsOpen} size="small">
            <SettingsIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Stats */}
      <Box sx={{ position: 'absolute', top: 16, right: 16, zIndex: 1 }}>
        <Paper sx={{ p: 2, minWidth: 200 }}>
          <Typography variant="subtitle2" gutterBottom>
            Graph Statistics
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Chip label={`Nodes: ${nodes.length}`} size="small" variant="outlined" />
            <Chip label={`Links: ${links.length}`} size="small" variant="outlined" />
            <Chip label={`Zoom: ${(zoom * 100).toFixed(0)}%`} size="small" variant="outlined" />
          </Box>
        </Paper>
      </Box>

      {/* Selected Node Info */}
      {selectedNode && (
        <Box sx={{ position: 'absolute', bottom: 16, left: 16, zIndex: 1 }}>
          <Paper sx={{ p: 2, minWidth: 250 }}>
            <Typography variant="subtitle2" gutterBottom>
              Selected Node
            </Typography>
            <Typography variant="body2">
              <strong>Name:</strong> {selectedNode.name}
            </Typography>
            <Typography variant="body2">
              <strong>Type:</strong> {selectedNode.type}
            </Typography>
            <Typography variant="body2">
              <strong>Strength:</strong> {selectedNode.strength.toFixed(2)}
            </Typography>
            {selectedNode.cluster && (
              <Typography variant="body2">
                <strong>Cluster:</strong> {selectedNode.cluster}
              </Typography>
            )}
            <Button size="small" onClick={() => setSelectedNode(null)} sx={{ mt: 1 }}>
              Clear Selection
            </Button>
          </Paper>
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
          Graph Settings
        </Typography>
        
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
              checked={showClusters}
              onChange={(e) => setShowClusters(e.target.checked)}
              size="small"
            />
          }
          label="Show Clusters"
        />
        
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" gutterBottom>
            Link Distance: {linkDistance}
          </Typography>
          <Slider
            value={linkDistance}
            onChange={(_, value) => setLinkDistance(value as number)}
            min={50}
            max={200}
            step={10}
            size="small"
          />
        </Box>
        
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" gutterBottom>
            Charge Strength: {chargeStrength}
          </Typography>
          <Slider
            value={chargeStrength}
            onChange={(_, value) => setChargeStrength(value as number)}
            min={-1000}
            max={-50}
            step={50}
            size="small"
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

export default SemanticMemoryGraph;